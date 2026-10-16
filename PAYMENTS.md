# Relworx setup

The browser talks to `/api/relworx`; Relworx credentials are read only by `api/server.mjs` and must never use a `VITE_` prefix. Copy `.env.example` to `.env` and set the API key, business account number, and webhook authentication key there. Use the rotated API key because the previously shared key has been exposed.

## Local development

Run the payment API and Vite in separate terminals:

```powershell
npm run api
npm run dev
```

The Vite development server proxies `/api` to the local payment API. Relworx cannot send webhooks to localhost. Checkout status is still checked through the Relworx status API while developing locally.

## After deployment

Deploy both the frontend and `api/server.mjs` behind the same HTTPS origin (or configure an equivalent `/api` reverse proxy). Set these server environment variables in the hosting dashboard: `RELWORX_API_KEY`, `RELWORX_ACCOUNT_NO`, `RELWORX_WEBHOOK_KEY`, and `RELWORX_WEBHOOK_URL`.

Set `RELWORX_WEBHOOK_URL` to the exact public URL `https://YOUR-DOMAIN/api/relworx/webhook`, with no trailing slash. Register that same exact URL in the Relworx business account webhook settings. Retrieve the webhook authentication key from the account settings; it is separate from the API key. Signature checks use that exact URL and reject timestamps older than five minutes.

The webhook handler validates and acknowledges Relworx signatures. Checkout also polls the Relworx status endpoint. This project currently stores orders in browser local storage, so it does not yet provide durable server-side order records or server-side order fulfillment. Move order/payment persistence to a database before relying on it for production operations.
