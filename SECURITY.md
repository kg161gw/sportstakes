# Security Policy

## Supported Versions
This package follows the active `main` branch. Only the latest release receives security fixes.

## Reporting a Vulnerability
If you discover a security vulnerability in `sportstakes`, please report it privately:
- Email: security@kavepos.com
- Do not open a public GitHub issue for security vulnerabilities.
- You should receive an acknowledgement within 5 business days.

## Security Best Practices
- Keep dependencies up to date (`npm outdated` / `npm update`).
- Never commit `.env.local` or other real credential files — `.env.example` is the only env file that should be tracked.
- Run `npm audit` periodically to check for known vulnerabilities in dependencies.

## Third-Party Dependencies
Dependencies are managed via `package.json` / `package-lock.json`.
