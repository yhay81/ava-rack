# Ava Rack

所持アバター名と着せ替えカテゴリから、BOOTH公式検索への経路を組み立てるローカルファーストWebアプリです。

## Stack

- Cloudflare Workers / D1 / Rate Limiting
- Hono / Hono JSX
- Vite+
- TypeScript

Better Authは、アカウント所有のサーバー状態がないため導入していません。アバター名と条件はブラウザの`localStorage`にだけ保存します。

## Local development

```powershell
npm install
npm run dev
```

品質確認:

```powershell
npm run release:check
npm run check
npm test
npm run build
npm audit
```

## Data boundary

Ava Rack does not scrape, store, or redistribute BOOTH product names, images, prices, descriptions, or stock status. It generates encoded links to the public BOOTH search page in the browser.

BOOTH, pixiv, and VRChat are not affiliated with this project. Their names and trademarks belong to their respective owners.
