# Privacy Policy (Template)

This repository contains a template privacy policy for the Chrono_Vault application. This is a starting point — you MUST obtain legal review before publishing.

Key points:

- Data processing: All AI requests that require external provider access are proxied through a server you control. The server must not log or persist raw user files or API keys.
- API keys: The Gemini API key and other provider credentials are stored only on the server and must never be embedded in the client bundle.
- User data: Sensitive user files and metadata should be processed in-memory and discarded immediately after processing unless explicit user consent is obtained and stored securely.
- Retention: Define retention periods for any persisted metadata/backups and provide an opt-out mechanism.

This file is a template. Consult qualified legal counsel to ensure compliance with applicable laws (GDPR, CCPA, HIPAA, etc.) for your target users and jurisdictions.
