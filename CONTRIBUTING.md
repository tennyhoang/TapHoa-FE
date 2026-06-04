# Contributing to TapHoa Frontend

## Prerequisites

- Node.js 22+
- npm 10+
- A running instance of TapHoa Backend (see BE repo)

## Local setup

```bash
# 1. Install dependencies
cd taphoa2-fe
npm install

# 2. Copy env
cp .env.example .env.local
# → fill NEXT_PUBLIC_API_URL, Google/Facebook client IDs, etc.

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

## Branch & commit conventions

| Branch prefix | Purpose                |
| ------------- | ---------------------- |
| `feat/`       | New feature            |
| `fix/`        | Bug fix                |
| `chore/`      | Tooling / dependencies |
| `docs/`       | Documentation only     |

Commits are validated by **commitlint** (Conventional Commits):

```
feat(cart): add optimistic quantity update
fix(checkout): remove hardcoded bank fallback
```

Husky runs **lint-staged** on pre-commit (ESLint + Prettier).

## Pull Request checklist

- [ ] `npm run lint` passes (no errors)
- [ ] `npm run test` passes
- [ ] `npm run type-check` passes (if available)
- [ ] New components have tests in `__tests__/`
- [ ] New user-facing text uses `useTranslations` (both `vi.json` + `en.json` updated)
- [ ] CHANGELOG.md updated under `[Unreleased]`

## Code style

- **No `'use client'` unless necessary** — prefer Server Components
- All user-visible text goes through `next-intl` — no hardcoded Vietnamese strings
- Use `useQuery`/`useMutation` from `@tanstack/react-query` for data fetching
- Keep page files thin — extract logic into hooks, UI into components
- Prettier handles formatting automatically on commit

## Running tests

```bash
npm run test           # vitest (unit)
npm run test:watch     # watch mode
npm run test:e2e       # Playwright (requires running dev server)
```

## i18n

When adding new text:

1. Add the key to `messages/vi.json` (Vietnamese)
2. Add the corresponding key to `messages/en.json` (English)
3. Use `useTranslations('Namespace')` in the component
