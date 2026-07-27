const RACK_KEY = "ava-rack:avatars:v1";
const SETTINGS_KEY = "ava-rack:settings:v1";
const CLIENT_KEY = "ava-rack:client:v1";
const VISIT_KEY = "ava-rack:last-visit:v1";
const MAX_AVATARS = 5;

const categories = [
  { id: "outfit", label: "衣装", term: "対応 衣装" },
  { id: "hair", label: "髪型", term: "髪型" },
  { id: "accessory", label: "小物", term: "アクセサリー" },
  { id: "shoes", label: "靴", term: "靴" },
  { id: "texture", label: "質感", term: "メイク テクスチャ" },
  { id: "gimmick", label: "仕掛け", term: "ギミック" },
];

const modifiers = [
  { id: "free", label: "無料", term: "無料" },
  { id: "quest", label: "Quest", term: "Quest対応" },
  { id: "sale", label: "セール", term: "セール" },
];

/** @type {{ avatars: string[], active: string, selectedCategories: Set<string>, selectedModifiers: Set<string>, sort: "new" | "popular" }} */
const state = {
  avatars: [],
  active: "",
  selectedCategories: new Set(["outfit", "hair", "accessory"]),
  selectedModifiers: new Set(),
  sort: "new",
};

const elements = {
  form: document.querySelector("#avatar-form"),
  input: document.querySelector("#avatar-input"),
  rack: document.querySelector("#avatar-rack"),
  rackCount: document.querySelector("#rack-count"),
  rackEmpty: document.querySelector("#rack-empty"),
  categories: document.querySelector("#category-grid"),
  modifiers: document.querySelector("#modifier-row"),
  sort: document.querySelector("#sort-control"),
  routes: document.querySelector("#route-list"),
  routeCount: document.querySelector("#route-count"),
  routeEmpty: document.querySelector("#route-empty"),
  notice: document.querySelector("#form-notice"),
};

function safeAvatarName(value) {
  return value
    .normalize("NFKC")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

function record(event) {
  void fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ava-Client": getClientId(),
    },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {});
}

function readState() {
  try {
    const avatars = JSON.parse(localStorage.getItem(RACK_KEY) ?? "[]");
    state.avatars = Array.isArray(avatars)
      ? avatars
          .map((value) => (typeof value === "string" ? safeAvatarName(value) : ""))
          .filter(Boolean)
          .slice(0, MAX_AVATARS)
      : [];
  } catch {
    state.avatars = [];
  }

  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    if (Array.isArray(settings.categories)) {
      const allowed = new Set(categories.map((category) => category.id));
      const selected = settings.categories.filter((id) => allowed.has(id));
      if (selected.length) state.selectedCategories = new Set(selected);
    }
    if (Array.isArray(settings.modifiers)) {
      const allowed = new Set(modifiers.map((modifier) => modifier.id));
      state.selectedModifiers = new Set(settings.modifiers.filter((id) => allowed.has(id)));
    }
    if (settings.sort === "popular" || settings.sort === "new") {
      state.sort = settings.sort;
    }
  } catch {
    // Keep defaults when local state is malformed.
  }

  state.active = state.avatars[0] ?? "";
}

function persist() {
  localStorage.setItem(RACK_KEY, JSON.stringify(state.avatars));
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      categories: [...state.selectedCategories],
      modifiers: [...state.selectedModifiers],
      sort: state.sort,
    }),
  );
}

function showNotice(message) {
  elements.notice.textContent = message;
  elements.notice.hidden = !message;
}

function queryFor(category) {
  const modifierTerms = modifiers
    .filter((modifier) => state.selectedModifiers.has(modifier.id))
    .map((modifier) => modifier.term);
  return [state.active, category.term, ...modifierTerms].filter(Boolean).join(" ");
}

function boothUrl(query) {
  const parameters = new URLSearchParams({ type: "digital" });
  if (state.sort === "new") parameters.set("sort", "new");
  return `https://booth.pm/ja/search/${encodeURIComponent(query)}?${parameters.toString()}`;
}

function renderRack() {
  elements.rack.replaceChildren();
  elements.rackCount.textContent = `${state.avatars.length}/${MAX_AVATARS}`;
  elements.rackEmpty.hidden = state.avatars.length > 0;

  for (const name of state.avatars) {
    const item = document.createElement("div");
    item.className = "rack-item";
    item.dataset.active = String(name === state.active);

    const select = document.createElement("button");
    select.type = "button";
    select.className = "rack-select";
    select.setAttribute("aria-pressed", String(name === state.active));
    select.setAttribute("aria-label", `${name}の検索経路を表示`);
    const hanger = document.createElement("span");
    hanger.className = "mini-hanger";
    hanger.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = name;
    select.append(hanger, label);
    select.addEventListener("click", () => {
      state.active = name;
      showNotice("");
      renderAll();
      record("routes_built");
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "rack-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${name}をラックから外す`);
    remove.addEventListener("click", () => {
      state.avatars = state.avatars.filter((avatar) => avatar !== name);
      if (state.active === name) state.active = state.avatars[0] ?? "";
      persist();
      renderAll();
    });

    item.append(select, remove);
    elements.rack.append(item);
  }
}

function makeToggle(item, selected, callback, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.id = item.id;
  button.setAttribute("aria-pressed", String(selected));
  const icon = document.createElement("span");
  icon.className = "category-icon";
  icon.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = item.label;
  button.append(icon, label);
  button.addEventListener("click", callback);
  return button;
}

function renderControls() {
  elements.categories.replaceChildren();
  for (const category of categories) {
    const selected = state.selectedCategories.has(category.id);
    elements.categories.append(
      makeToggle(
        category,
        selected,
        () => {
          if (selected && state.selectedCategories.size === 1) {
            showNotice("カテゴリを1つ以上残してください");
            return;
          }
          if (selected) state.selectedCategories.delete(category.id);
          else state.selectedCategories.add(category.id);
          showNotice("");
          persist();
          renderControls();
          renderRoutes();
          if (state.active) record("routes_built");
        },
        "category-button",
      ),
    );
  }

  elements.modifiers.replaceChildren();
  for (const modifier of modifiers) {
    const selected = state.selectedModifiers.has(modifier.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modifier-button";
    button.setAttribute("aria-pressed", String(selected));
    button.textContent = modifier.label;
    button.addEventListener("click", () => {
      if (selected) state.selectedModifiers.delete(modifier.id);
      else state.selectedModifiers.add(modifier.id);
      persist();
      renderControls();
      renderRoutes();
      if (state.active) record("routes_built");
    });
    elements.modifiers.append(button);
  }

  for (const input of elements.sort.querySelectorAll("input")) {
    input.checked = input.value === state.sort;
  }
}

function createRouteCard(category, index) {
  const query = queryFor(category);
  const url = boothUrl(query);
  const card = document.createElement("article");
  card.className = "route-card";
  card.dataset.category = category.id;
  card.dataset.ticket = String(index + 1).padStart(2, "0");

  const icon = document.createElement("span");
  icon.className = "route-icon";
  icon.setAttribute("aria-hidden", "true");
  const body = document.createElement("div");
  body.className = "route-body";
  const heading = document.createElement("h3");
  heading.textContent = category.label;
  const terms = document.createElement("p");
  terms.textContent = query;
  body.append(heading, terms);

  const actions = document.createElement("div");
  actions.className = "route-actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "copy-route";
  copy.textContent = "URL";
  copy.setAttribute("aria-label", `${category.label}検索のURLをコピー`);
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      copy.textContent = "済";
      window.setTimeout(() => {
        copy.textContent = "URL";
      }, 1200);
    } catch {
      showNotice("URLをコピーできませんでした");
    }
  });
  const open = document.createElement("a");
  open.className = "open-route";
  open.href = url;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "BOOTHで開く";
  open.addEventListener("click", () => record("booth_opened"));
  actions.append(copy, open);

  card.append(icon, body, actions);
  return card;
}

function renderRoutes() {
  elements.routes.replaceChildren();
  const selected = categories.filter((category) => state.selectedCategories.has(category.id));
  elements.routeCount.textContent = state.active ? `${selected.length}本` : "0本";
  elements.routeEmpty.hidden = Boolean(state.active);

  if (!state.active) return;
  selected.forEach((category, index) => {
    elements.routes.append(createRouteCard(category, index));
  });
}

function renderAll() {
  persist();
  renderRack();
  renderControls();
  renderRoutes();
}

function addAvatar(value) {
  const name = safeAvatarName(value);
  if (!name) {
    showNotice("アバター名を入力してください");
    elements.input.focus();
    return;
  }
  if (/^https?:\/\//i.test(name)) {
    showNotice("URLではなくアバター名を入力してください");
    return;
  }
  const existing = state.avatars.find(
    (avatar) => avatar.toLocaleLowerCase("ja") === name.toLocaleLowerCase("ja"),
  );
  if (existing) {
    state.active = existing;
    showNotice("");
    renderAll();
    record("routes_built");
    return;
  }
  if (state.avatars.length >= MAX_AVATARS) {
    showNotice("ラックは5体までです。1体外してから追加してください");
    return;
  }
  state.avatars = [name, ...state.avatars];
  state.active = name;
  elements.input.value = "";
  showNotice("");
  renderAll();
  record("avatar_saved");
  record("routes_built");
}

function noteVisit() {
  const lastVisit = localStorage.getItem(VISIT_KEY);
  if (lastVisit && Date.now() - Number(lastVisit) > 20 * 60 * 60 * 1000) {
    record("returned");
  }
  localStorage.setItem(VISIT_KEY, String(Date.now()));
  record("visited");
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  addAvatar(elements.input.value);
});

elements.sort.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.value !== "new" && input.value !== "popular") return;
  state.sort = input.value;
  persist();
  renderRoutes();
  if (state.active) record("routes_built");
});

readState();
renderAll();
noteVisit();

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("/sw.js");
}
