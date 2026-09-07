# Discovery call booking: setup

The booking page is `src/pages/book.html`, built to `book.html` (served at `/book`) and `nl/afspraak.html` (served at `/nl/afspraak`) by `npm run build`. It is fully static. All data goes through two n8n webhooks, and n8n talks to Supabase and Gmail. The site never holds a Supabase or Gmail key.

```
/book  ──GET  /webhook/alpaca-booking-slots ──▶ n8n ──▶ Supabase (read future bookings)
/book  ──POST /webhook/alpaca-booking       ──▶ n8n ──▶ Supabase (insert, unique per slot)
                                                    ├──▶ Gmail: notify wout@alpacaai.nl
                                                    └──▶ Gmail: confirmation to the client
```

Rules baked into both the page and the workflow: Monday to Friday, 09:00 to 17:00 Amsterdam time, 30-minute slots, bookable from tomorrow up to 28 days ahead. Change them in `src/pages/book.html` (the constants at the top of the script), then run `npm run build`, and in the "Code · Validate" node.

## 1. Supabase

Done on 2026-09-04. Project **Alpaca-AI-General** (ref `rdthgakwzdcccqtoevar`, URL `https://rdthgakwzdcccqtoevar.supabase.co`). `supabase/bookings.sql` is applied as migrations and mirrors the live schema: `public.bookings` with a partial unique index on `start_at` (status = confirmed), RLS on, client roles denied. The unique index is what stops double bookings.

For a fresh project: run `supabase/bookings.sql` in the SQL editor. Then, Project settings, API: copy the **project URL** and the **service_role** key. n8n needs both. Never put the service_role key in the website.

## 2. Gmail as noreply@alpacaai.nl

n8n's Gmail node sends from the Google account the credential belongs to. Two working setups:

- **Separate mailbox (cleanest):** create the Google Workspace user `noreply@alpacaai.nl` and connect n8n's Gmail credential with that account.
- **Alias on Wout's account:** in Gmail settings, "Send mail as", add `noreply@alpacaai.nl` and tick "Treat as an alias". Then set it as the default send-as address, because the n8n node has no per-message from-address option.

Both emails already set `Reply-To` and say in the body that the address is unmonitored and questions go to wout@alpacaai.nl.

## 3. n8n

1. n8n Cloud, Workflows, Import from file: `n8n/alpaca-booking.workflow.json`.
2. Credentials:
   - Add a **Supabase** credential (host = project URL, key = service_role). Select it in both Supabase nodes.
   - Add a **Gmail OAuth2** credential for the noreply account. Select it in both Gmail nodes.
3. In both Webhook nodes, "Allowed Origins (CORS)" must be `https://alpacaai.nl,https://www.alpacaai.nl,https://alpacaai.dev,https://www.alpacaai.dev` (the repo file already has this; the .nl origins were added on 2026-09-07 so the booking page keeps working once alpacaai.nl is the primary domain). No trailing slash, no path. While it is set, the page only books from the live site; local testing on localhost gets a CORS error unless you add `http://localhost:8080` temporarily.
4. Activate the workflow. Note the production webhook base URL. On n8n Cloud it looks like `https://<workspace>.app.n8n.cloud`.
5. Test with curl before touching the site:

Done on 2026-09-04. Base URL: `https://wjaltepost.app.n8n.cloud`. Both credentials set, curl tests passed (200 ok, then 409 slot_taken). CORS is restricted to the live site origin (item 3 above).

```bash
curl https://wjaltepost.app.n8n.cloud/webhook/alpaca-booking-slots

curl -X POST https://wjaltepost.app.n8n.cloud/webhook/alpaca-booking \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Person","email":"you@example.com","company":"Test","notes":"hello","lang":"en","start_at":"2026-09-15T08:00:00.000Z"}'
```

The second call should return `{"ok":true,...}`, insert a row, and send two emails. Repeat it and you should get HTTP 409 `slot_taken`.

## 4. Website

Done on 2026-09-04. `N8N_BASE_URL` in `src/pages/book.html` is `https://wjaltepost.app.n8n.cloud`. `vercel.json` enables clean URLs so the page lives at `/book`.

If the n8n workspace ever moves, change that one constant and push. While it points at a dead URL the page still renders, but submitting shows a message pointing people to wout@alpacaai.nl instead of booking.

## Responses the page expects

| Call | Success | Failure |
|---|---|---|
| GET slots | `{ "taken": ["2026-09-15T08:00:00.000Z", ...] }` | anything else: page assumes no taken slots |
| POST book | 200 `{ "ok": true }` | 409 `{ "ok": false, "error": "slot_taken" }`, 400 `{ "ok": false, "error": "..." }` |

## Updating the live n8n workflow after editing the JSON

The workflow in n8n Cloud is a copy. When `n8n/alpaca-booking.workflow.json` changes (last: 2026-09-07, `.nl` origins added to CORS on both Webhook nodes; before that 2026-09-04, logo in the client email and the busy pattern in "Code · Validate"), bring the live one in line:

1. n8n, Workflows, open the existing "Alpaca booking" workflow and deactivate it.
2. Workflows, Import from file, pick the JSON. Select the Supabase credential in both Supabase nodes and the Gmail credential in both Gmail nodes. CORS is already set in the file.
3. Activate the imported workflow, then delete the old one. The webhook URLs stay the same because the paths are fixed in the file.
4. Re-run the curl tests above.

## "Semi busy" availability pattern

`book.html` marks some slots and a few whole days as taken, deterministically per date, so every visitor sees the same availability and nothing depends on the database. Roughly a quarter of the slots and about one to two weekdays per month are blocked. The same function lives in the n8n "Code · Validate" node and rejects those slots with `slot_taken`, so they cannot be booked by calling the webhook directly. Switch it off by setting `BUSY_PATTERN = false` in both places; tune the density via `seed % 10` (whole days) and `1 + (seed >>> 8) % 4` (blocks per day), again in both places.

## Client email logo

The confirmation email loads `https://alpacaai.dev/brand_assets/logo-email.png` (dark logo, transparent background, generated from `brand_assets/logo-v1.3.png`). It must stay at that path on the live site.

## Possible follow-ups

- Attach an `.ics` invite to the confirmation email (Code node builds it, Gmail node attaches it).
- Create a Google Calendar event with a Meet link via the Google Calendar node and put the link in the confirmation.
- Cancel or reschedule links.
