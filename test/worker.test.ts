import { describe, expect, it } from "vitest";
import { app, type Bindings } from "../src/worker";

type DatabaseCall = {
  sql: string;
  values: unknown[];
};

function makeEnvironment(rateSuccess = true) {
  const calls: DatabaseCall[] = [];
  const database = {
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              calls.push({ sql, values });
              return { success: true };
            },
          };
        },
        async run() {
          calls.push({ sql, values: [] });
          return { success: true };
        },
      };
    },
  };
  const environment = {
    ASSETS: {},
    DB: database,
    WRITE_LIMITER: {
      async limit() {
        return { success: rateSuccess };
      },
    },
  } as unknown as Bindings;
  return { environment, calls };
}

describe("product pages", () => {
  it("renders the rack, wardrobe, and route work surface", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request("https://ava-rack.yusuke8h.workers.dev/", {}, environment);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain("script-src 'self'");
    expect(html).toContain("Ava Rack");
    expect(html).toContain("アバターラック");
    expect(html).toContain("着せ替え棚");
    expect(html).toContain("検索チケット");
    expect(html).toContain('src="/app.js"');
    expect(html).not.toContain("style=");
    expect(html).not.toContain("21日");
    expect(html).not.toContain("MVP");
  });

  it("states the BOOTH data and purchase boundary", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/about",
      {},
      environment,
    );
    const html = await response.text();

    expect(html).toContain("商品名、画像、価格、説明、在庫を取得・保存・転載しません");
    expect(html).toContain("対応可否を保証しません");
    expect(html).toContain("公式サービスではありません");
  });

  it("explains that avatar names stay local", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/privacy",
      {},
      environment,
    );
    const html = await response.text();

    expect(html).toContain("アバター名");
    expect(html).toContain("localStorage");
    expect(html).toContain("35日");
  });

  it("exposes a machine-readable health check", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/healthz",
      {},
      environment,
    );
    expect(await response.json()).toEqual({
      ok: true,
      service: "ava-rack",
      boothSearchOrigin: "https://booth.pm",
    });
  });

  it("marks unknown pages noindex", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/missing",
      {},
      environment,
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toContain('<meta name="robots" content="noindex"/>');
  });

  it("publishes all indexable pages in the sitemap", async () => {
    const { environment } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/sitemap.xml",
      {},
      environment,
    );
    const xml = await response.text();
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("https://ava-rack.yusuke8h.workers.dev/about");
    expect(xml).toContain("https://ava-rack.yusuke8h.workers.dev/privacy");
  });
});

describe("content-free telemetry", () => {
  const clientId = "f14a42ba-8f62-4548-bfd4-c53c5fa7cc2f";

  it("stores an allowlisted event with a hashed client id", async () => {
    const { environment, calls } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://ava-rack.yusuke8h.workers.dev",
          "X-Ava-Client": clientId,
        },
        body: JSON.stringify({ event: "booth_opened" }),
      },
      environment,
    );

    expect(response.status).toBe(202);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.values[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(calls[0]?.values[0]).not.toBe(clientId);
    expect(calls[0]?.values[1]).toBe("booth_opened");
    expect(calls[0]?.values[2]).toBe(0);
  });

  it("marks automated verification separately from product use", async () => {
    const { environment, calls } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://ava-rack.yusuke8h.workers.dev",
          "X-Ava-Client": clientId,
          "X-Ava-QA": "1",
        },
        body: JSON.stringify({ event: "booth_opened" }),
      },
      environment,
    );

    expect(response.status).toBe(202);
    expect(calls[0]?.values[2]).toBe(1);
  });

  it("rejects avatar names and generated URLs as extra fields", async () => {
    const { environment, calls } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ava-Client": clientId,
        },
        body: JSON.stringify({
          event: "routes_built",
          avatar: "private",
          url: "https://booth.pm/private",
        }),
      },
      environment,
    );

    expect(response.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("rejects cross-site writes", async () => {
    const { environment, calls } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://example.com",
          "X-Ava-Client": clientId,
        },
        body: JSON.stringify({ event: "visited" }),
      },
      environment,
    );

    expect(response.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it("rejects malformed client identifiers", async () => {
    const { environment, calls } = makeEnvironment();
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ava-Client": "------------------------------------",
        },
        body: JSON.stringify({ event: "visited" }),
      },
      environment,
    );

    expect(response.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it("enforces the write rate limit", async () => {
    const { environment, calls } = makeEnvironment(false);
    const response = await app.request(
      "https://ava-rack.yusuke8h.workers.dev/api/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ava-Client": clientId,
        },
        body: JSON.stringify({ event: "visited" }),
      },
      environment,
    );

    expect(response.status).toBe(429);
    expect(calls).toHaveLength(0);
  });
});
