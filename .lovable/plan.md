
This is a large, multi-area request. To ship it well without breaking working code, I'll split it into 4 focused phases. After you approve, I'll execute them in order and check in between each.

## Phase 1 — Jobs search & scraping fixes (backend + Jobs page)

Problems today:
- Typing "data analyst" doesn't filter — scrape runs but UI shows mixed/old jobs.
- After scraping, results sometimes don't appear until refresh.
- Only a few sources, low volume, no internships.
- Old searches stay in the list.

Changes:
- `automation.server.ts` → expand Firecrawl search to cover LinkedIn, Indeed, Glassdoor, Naukri, Internshala, Wellfound, RemoteOK, WeWorkRemotely, Monster, Hirist, Cutshort, Instahyre, plus targeted company career pages (TCS, Wipro, Infosys, Amazon, Microsoft, Walmart, Rippling, Databricks, CRED, Shunya). Run queries in parallel, dedupe by URL, target 50+ results per scrape.
- Honor the user's query verbatim (append "internship" variant automatically when the query contains "intern").
- `scrapeJobs` server fn → before insert, **delete this user's previous jobs that don't match the new query** so the list reflects the latest search only.
- `jobs.tsx` → after scrape mutation success, force `refetchQueries` (not just invalidate) and add client-side filter on `query` so results visibly match the search term.
- Empty state after scrape: show "Found N — loading…" while query refetches.

## Phase 2 — Connector Health page + manual "Run now" + verification logging

- New table `connector_runs` (id, user_id, connector, status, message, duration_ms, ran_at). Used as the activity log.
- New server fns: `runGmailSyncNow`, `runScrapeJobsNow`, `runDailyBriefingNow`, `runCalendarSyncNow`, `runResendTestNow`, `verifyConnector(name)` — each writes a row to `connector_runs`.
- `verifyConnector` calls `https://connector-gateway.lovable.dev/api/v1/verify_credentials` for Gmail / Calendar / Docs / Sheets / Resend / Firecrawl and pings Supabase with a 1-row select.
- New route `/integrations` (connector health screen): one row per connector showing status dot (green/amber/red), last successful run, last error, **Verify** button, **Run now** button. Live-updates via `useRealtimeRefresh(["connector_runs"])`.

## Phase 3 — Performance: faster navigation & sync

- Add TanStack Query `staleTime: 30_000` + `placeholderData: keepPreviousData` to the list queries (jobs, applications, calendar, inbox) so route changes render instantly from cache instead of showing a spinner.
- Prefetch on hover for sidebar links (`router.preloadRoute`).
- Move heavy work in `syncRecruiterEmails` / `scrapeJobs` to fire-and-return: the server fn returns immediately after kicking off, writes progress to `connector_runs`, UI shows toast + live updates via realtime. No more 30-second "Syncing…" blocks.

## Phase 4 — Mobile-only redesign (Zenith)

Strictly behind `md:` breakpoint — desktop untouched.
- New `MobileTopBar` (hamburger / ZENITH / bell), sticky, dark glassmorphism.
- New `MobileSidebarDrawer` (slide-in sheet using existing `Sheet` component) with full nav + user card + plan badge.
- New `MobileBottomNav` (Home / Jobs / Applications / Inbox / Profile), floating glassmorphism.
- `AppShell` renders desktop layout for `md+` and the new mobile shell for `<md`. Page contents reused as-is.
- Mobile dashboard: greeting, metric cards (2-col grid), AI briefing gradient card, matched-today list, pipeline list — all using existing data hooks.
- Mobile job cards: stacked layout, larger tap targets, no horizontal overflow.
- Add Google Sheets connector + a Resume upload button on the Resume Lab page (small ask piggybacking on this phase).

## Technical notes

- All new server fns use `requireSupabaseAuth` and write to `connector_runs` for auditability.
- Firecrawl search uses `search` with `limit: 10` per source, parallelized with `Promise.allSettled`, then `upsert(..., { onConflict: "created_by,url", ignoreDuplicates: true })` — keeps idempotency, avoids the previous unique-constraint error.
- Old-search cleanup: `delete from jobs where created_by = userId and scraped_at < now() - interval '24 hours'` runs at the top of each scrape.
- Mobile components live under `src/components/zenith/mobile/` and are only mounted via `useIsMobile()` to avoid SSR mismatch.

## Order of execution

1. Phase 1 (highest user pain) — ~6 file edits, 1 migration if needed.
2. Phase 2 — 1 migration (`connector_runs`), 1 new route, 1 new lib file.
3. Phase 3 — small edits across query hooks.
4. Phase 4 — new mobile components + `AppShell` branch.

I'll pause after each phase so you can verify before I move on.
