# Contributing to sportstakes

## Development Setup
`npm install` to install dependencies.

## Workflow
1. Branch from `main`.
2. Use the npm scripts defined in `package.json`:
   - `npm run dev` — start the Vite dev server
   - `npm run build` — type-check (`tsc -b`) and build for production
   - `npm run type-check` — run TypeScript in `--noEmit` mode
   - `npm run lint` — run ESLint (`eslint . --max-warnings 0`)
   - `npm run test` — run the test suite (`vitest run`)
   - `npm run preview` — preview the production build locally
3. Open a PR. CI must pass before merge.

## Commit Messages
Use conventional, imperative-mood commit messages.
