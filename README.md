<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xyZse1YOoHMSC_KcZBALNWEg19S8jHVn

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a server env file: copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `ALLOWED_ORIGIN`.
3. Start the AI proxy server (separate process):

```bash
npm run start:server
```

4. Start the frontend (Vite):

```bash
npm run dev
```

Security notes:

- The Gemini API key must never be committed or embedded in the client bundle. Use the server proxy provided in `server/index.js`.
- Review `PRIVACY.md` and `DISCLAIMER.md` and obtain legal review before deploying to users.
 - TLS: to run the AI proxy over HTTPS, set `TLS_CERT_PATH` and `TLS_KEY_PATH` in `.env.local` to PEM files. The server will start HTTPS when both are present.
 - Secrets: the server can fetch `GEMINI_API_KEY` from HashiCorp Vault if `VAULT_ADDR` and `VAULT_TOKEN` are configured. Otherwise it falls back to environment variables.
 - Server API key: you can set `SERVER_API_KEY` to require `X-API-KEY` header on `/api/*` requests.
