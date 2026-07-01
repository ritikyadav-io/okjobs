# OkJobs → single-user Mistral-style rebuild

You picked (a) remove auth entirely, (b) redesign every page in Mistral style, (c) fix Google connect + more skills + dashboard gap. Before I start, I need to be honest about the size and risk of this — please read the "Read this first" section and confirm.

## Read this first — the tension in your request

1. **"Remove auth entirely" and "fix the security findings" contradict each other.** The findings (orphaned jobs, cron secured by anon key, realtime open, jobs visible across users) only matter in a multi-user app. If we go single-user, all four findings become non-issues by definition: there is no "other user" to leak to. I will **drop RLS + auth** and mark those findings as "N/A — single-user app" in security memory. If you later re-enable auth, they come back.

2. **"Connect Google" only makes sense per-user.** Right now the Google connection is stored in `user_google_connections` scoped by `auth.uid()`. In a single-user app there is no `auth.uid()`. I will store the single Google connection in a new `app_settings` row keyed to a hardcoded `SINGLE_USER_ID` sentinel, so Gmail sync / Calendar / Docs still work — but the "one shared Google account" IS the account. Anyone who opens the app uses it. That's the tradeoff of single-user mode.

3. **"Full-site Mistral redesign" is genuinely large.** 15+ routes, new fonts (PP Editorial Old is not on Google Fonts — I'll use `Fraunces` or `Instrument Serif` as the closest free near-serif; PP Editorial Old is a paid Pangram Pangram font), new token system, sunset stripe on every page. I will ship it in one pass but expect some pages (queue, integrations, resume-lab internals) to be functional-but-rougher on first cut. Landing, dashboard, jobs, applications, career-inbox, settings, onboarding will get full polish.

If any of this isn't what you want, say so now — otherwise I ship it.

## What I'll do

### 1. Auth removal (foundation)

- Delete routes: `login.tsx`, `signup.tsx`, `_authenticated/route.tsx` (managed layout — replaced with a stub that just renders `<Outlet />`).
- Delete `AuthLayout.tsx`, `use-auth.tsx`.
- Move every route currently under `_authenticated/` to top-level (they'll just render — no gate).
- Server functions: strip `.middleware([requireSupabaseAuth])` from every `*.functions.ts`. Replace `context.userId` with a constant `SINGLE_USER_ID` (a fixed UUID stored in code + used everywhere). Replace `context.supabase` with `supabaseAdmin`.
- Skip the onboarding gate. Onboarding becomes optional and lives at `/onboarding` if the user wants to edit their profile.
- Profile: seed one row in `profiles` with `SINGLE_USER_ID` on first load, keep it in localStorage-backed cache too so the "don't ask again" behavior is instant.

### 2. Database changes (one migration)

- Disable RLS on every table (`jobs`, `applications`, `recruiter_emails`, `calendar_events`, `resume_versions`, `cover_letter_versions`, `daily_briefings`, `connector_runs`, `job_queue`, `sheet_settings`, `user_google_connections`, `profiles`).
- Add a new `app_settings` table (single row) to hold the shared Google connection + shared preferences.
- Seed one profile row + one app_settings row with `SINGLE_USER_ID = '00000000-0000-0000-0000-000000000001'`.
- Keep FKs to `auth.users` off — drop the `on delete cascade` refs since there are no auth users.

### 3. Security memory update

- Note the app is single-user, no auth, all data global. Any "cross-user leak" finding is N/A.
- Cron endpoints: still add a shared secret (`CRON_SECRET` env var) since they're publicly reachable — this is genuinely fixable without auth. Cron routes will 401 unless `Authorization: Bearer $CRON_SECRET` is present.

### 4. Mistral-style design system

Global tokens in `src/styles.css`:
- Fonts: `Fraunces` (near-serif, free on Google Fonts — closest to PP Editorial Old), `Inter`, `JetBrains Mono`. Loaded via `<link>` in `__root.tsx`.
- Colors: cream `#F7F3E9`, cream-soft `#FCF9F1`, cream-deeper `#EFE7D2`, beige-deep `#E5DBC0`, primary orange `#FA5F1C`, primary-deep `#D94A0F`, sunshine-500 `#F59E0B`, sunshine-700 `#EA580C`, yellow-saturated `#FCD34D`, ink `#0F0F0F`, canvas `#FFFDF8`, hairline-soft `#E8E4DA`.
- Radii: buttons `rounded-md` (8px), cards `rounded-lg` (12px). No pills except badges.
- New components: `SunsetStripe`, `HeroBandSunset`, `CtaBannerCream`, `FooterCream`, `CardCream`, `ButtonDark`, `ButtonCream`, `PromoBanner`.

Every page gets: promo banner (optional) → nav → content → cream CTA banner → sunset stripe → footer.

### 5. Pages redesigned

Full-polish: `index.tsx` (landing), `dashboard.tsx`, `jobs.tsx`, `applications.tsx`, `recruiter-inbox.tsx`, `settings.tsx`, `onboarding.tsx`, `about.tsx`, `blog.tsx`, `privacy.tsx`, `terms.tsx`.

Token-inherit only (structure kept, restyled): `calendar.tsx`, `briefing.tsx`, `resume-lab.tsx`, `integrations.tsx`, `queue.tsx`.

### 6. Small fixes

- **Dashboard gap**: header row uses `justify-between` with the notification bell — I'll close the empty space by making the greeting flex-grow properly and the bell align tight-right.
- **Skill suggestions** (onboarding step 2): add Data Analytics, Machine Learning, AI, Frontend, Backend, Data Engineering, DevOps, Cloud (AWS/GCP/Azure), SQL, Python, Java, Product Management, UX Design, Mobile (iOS/Android), Cybersecurity, QA/Testing, System Design.
- **Google connect error**: after auth removal, the OAuth flow currently 401s because the `requireSupabaseAuth` middleware rejects the unauthenticated call. Replacing the middleware fixes it; connection is saved to the single `app_settings` row.

## Technical section

- New constant `SINGLE_USER_ID` in `src/lib/single-user.ts` used by every server fn.
- `src/start.ts`: remove `attachSupabaseAuth` from `functionMiddleware`.
- Cron routes gain `Authorization` check: read `process.env.CRON_SECRET` inside handler, timing-safe compare, 401 otherwise. I'll add `CRON_SECRET` via `generate_secret`.
- Migration order: (1) `alter table … disable row level security` on all tables, (2) create `app_settings`, (3) seed profile + app_settings.
- Delete `_authenticated/route.tsx` — since it's integration-managed, I'll replace its body with `<Outlet />` and no gate.
- Fonts loaded via Google Fonts `<link>` tag in `__root.tsx` head (Fraunces + Inter + JetBrains Mono). No `@import` in styles.css.
- Landing page rebuilt from scratch to Mistral spec: promo banner → hero with warm gradient bg + Fraunces headline → logo wall → 3-up feature cards on cream → stat row → coding/AI mockup section → testimonials → pricing tiers (one featured with orange border) → FAQ → cream CTA → sunset stripe → cream footer.

## What I will NOT do this pass (out of scope)

- Buy/install PP Editorial Old (paid). Using Fraunces as free substitute. If you want the real font, upload the file and I'll swap it in a follow-up.
- Multi-user support (you explicitly opted out).
- Real Mistral atmospheric mountain photography — I'll use CSS gradients and one AI-generated hero image.
- Rewriting the resume-lab AI logic — only restyled.

## Approval

Confirm and I'll execute in this order: migration → auth removal → cron secret → design tokens → landing → dashboard → other pages → small fixes → verify build. Expect ~30-50 file changes.
