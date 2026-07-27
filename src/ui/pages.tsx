import { PRODUCT } from "../config/product";
import { Footer, Header, Layout } from "./layout";

const categorySkeleton = [
  ["outfit", "衣装"],
  ["hair", "髪型"],
  ["accessory", "小物"],
  ["shoes", "靴"],
  ["texture", "質感"],
  ["gimmick", "仕掛け"],
] as const;

export function HomePage() {
  return (
    <Layout appScript>
      <Header />
      <main class="shell">
        <form class="avatar-dock" id="avatar-form">
          <label class="avatar-input">
            <span class="input-hanger" aria-hidden="true"></span>
            <span hidden>所持アバター名</span>
            <input
              id="avatar-input"
              name="avatar"
              type="text"
              maxlength={40}
              placeholder="アバター名　例: しなの"
              autocomplete="off"
              spellcheck={false}
            />
          </label>
          <button class="add-avatar" type="submit">
            ラックへ掛ける
          </button>
          <p class="form-notice" id="form-notice" role="alert" hidden></p>
        </form>

        <div class="workspace">
          <section class="panel rack-panel" aria-labelledby="rack-title">
            <header class="panel-head">
              <h2 id="rack-title">アバターラック</h2>
              <span id="rack-count">0/5</span>
            </header>
            <div class="rack-rail" aria-hidden="true"></div>
            <div class="avatar-rack" id="avatar-rack"></div>
            <p class="rack-empty" id="rack-empty">
              所持アバターを掛けると
              <br />
              検索チケットが並びます
            </p>
          </section>

          <section class="panel wardrobe-panel" aria-labelledby="wardrobe-title">
            <header class="panel-head">
              <h2 id="wardrobe-title">着せ替え棚</h2>
              <span>最大6種類</span>
            </header>
            <div class="mannequin-stage" aria-hidden="true">
              <span class="stage-pin"></span>
              <div class="mannequin">
                <span class="mannequin-head"></span>
                <span class="mannequin-body"></span>
                <span class="mannequin-stand"></span>
              </div>
              <span class="stage-pin"></span>
            </div>
            <div class="category-grid" id="category-grid">
              {categorySkeleton.map(([id, label], index) => (
                <button
                  type="button"
                  class="category-button"
                  data-id={id}
                  aria-pressed={index < 3 ? "true" : "false"}
                >
                  <span class="category-icon" aria-hidden="true"></span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div class="modifier-zone">
              <span class="control-label">追加条件</span>
              <div class="modifier-row" id="modifier-row">
                <button type="button" class="modifier-button" aria-pressed="false">
                  無料
                </button>
                <button type="button" class="modifier-button" aria-pressed="false">
                  Quest
                </button>
                <button type="button" class="modifier-button" aria-pressed="false">
                  セール
                </button>
              </div>
              <span class="control-label">並び順</span>
              <fieldset class="sort-control" id="sort-control">
                <legend hidden>BOOTH検索の並び順</legend>
                <label>
                  <input type="radio" name="sort" value="new" checked />
                  新着から
                </label>
                <label>
                  <input type="radio" name="sort" value="popular" />
                  人気順
                </label>
              </fieldset>
            </div>
          </section>

          <section class="panel routes-panel" aria-labelledby="routes-title">
            <header class="panel-head">
              <h2 id="routes-title">検索チケット</h2>
              <span id="route-count">0本</span>
            </header>
            <p class="route-note">対応可否と価格はBOOTH商品ページで確認</p>
            <div class="route-list" id="route-list"></div>
            <p class="route-empty" id="route-empty">
              アバター名をラックへ掛けると
              <br />
              BOOTHへの検索経路を組み立てます
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}

export function PrivacyPage() {
  return (
    <Layout title="プライバシー" path="/privacy">
      <Header />
      <main class="legal-page">
        <h2>プライバシー</h2>
        <h3>端末に残るもの</h3>
        <p>
          アバター名、選択カテゴリ、追加条件はこの端末の
          <code>localStorage</code>に保存します。検索URLはブラウザ内で生成し、Ava
          Rackのサーバーへ送信しません。サイトデータを消すと削除されます。
        </p>
        <h3>集計するもの</h3>
        <p>
          訪問、検索経路の生成、BOOTH遷移、アバター保存、別日再訪の回数だけを集計します。ランダムな端末IDは受信時にSHA-256でハッシュ化します。アバター名、カテゴリ、生成URL、IPアドレス、氏名、メールアドレスはAva
          RackのD1へ保存しません。
        </p>
        <h3>保存期間</h3>
        <p>集計イベントは35日後に自動削除します。広告SDKと外部解析SDKは使用しません。</p>
        <h3>連絡先</h3>
        <p>
          <a href={`${PRODUCT.repository}/issues`}>GitHub Issues</a>
        </p>
      </main>
      <Footer />
    </Layout>
  );
}

export function AboutPage() {
  return (
    <Layout title="使い方" path="/about">
      <Header />
      <main class="legal-page">
        <h2>使い方</h2>
        <ol>
          <li>所持アバター名をラックへ掛けます。</li>
          <li>衣装、髪型、小物など探したい棚と追加条件を選びます。</li>
          <li>検索チケットからBOOTHを開き、商品ページで対応可否と価格を確認します。</li>
        </ol>
        <h3>検索の境界</h3>
        <p>
          Ava
          RackはBOOTHの商品名、画像、価格、説明、在庫を取得・保存・転載しません。検索語を組み合わせてBOOTH公式検索ページを開くだけで、対応可否を保証しません。
        </p>
        <h3>名称について</h3>
        <p>
          BOOTH、pixiv、VRChatの公式サービスではありません。各名称・商標は各権利者に帰属します。
        </p>
      </main>
      <Footer />
    </Layout>
  );
}

export function NotFoundPage() {
  return (
    <Layout title="ページが見つかりません" noIndex>
      <Header />
      <main class="not-found shell">
        <div>
          <h2>404</h2>
          <p>このラックにページはありません。</p>
          <a href="/">ラックへ戻る</a>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
