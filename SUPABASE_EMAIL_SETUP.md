# Email Setup Guide — Legal Eagle

Complete instructions to go from zero to production email delivery.

---

## Step 1 — Create a Resend Account

1. Go to **https://resend.com** and sign up (free tier: 3,000 emails/month, 100/day)
2. Verify your email address

---

## Step 2 — Get Your API Key

1. In the Resend dashboard, click **API Keys** in the left sidebar
2. Click **Create API Key**
3. Name it `legal-eagle-production` (or `legal-eagle-dev` for local)
4. Set permission to **Full Access**
5. Copy the key — it starts with `re_`
6. Add it to Vercel: **Settings → Environment Variables → `RESEND_API_KEY`**

> **Local dev:** Add to `.env.local` (never commit this file)
> ```
> RESEND_API_KEY=re_your_key_here
> ```

---

## Step 3 — Verify Your Domain (Required for Custom From Address)

Without domain verification, you can only send from `onboarding@resend.dev` and only to **your own email address**. For production, verify your domain.

### 3a. Add Your Domain in Resend

1. In Resend dashboard → **Domains** → **Add Domain**
2. Enter your domain (e.g., `legaleagle.app` or `yourdomain.com`)
3. Resend will show you **4 DNS records** to add

### 3b. Add DNS Records at Your Registrar

You need to add these records at Cloudflare / Namecheap / GoDaddy (wherever your DNS is managed):

| Type  | Name                          | Value                             |
|-------|-------------------------------|-----------------------------------|
| TXT   | `_resend.yourdomain.com`      | `v=spf1 include:_spf.resend.com ~all` *(shown in dashboard)* |
| DKIM  | `resend._domainkey.yourdomain.com` | *(long key shown in dashboard)* |
| MX    | `send.yourdomain.com`         | `feedback-smtp.us-east-1.amazonses.com` |
| CNAME | `em.yourdomain.com`           | `feedback-smtp.us-east-1.amazonses.com` |

> DNS propagation takes **5 minutes to 48 hours**. Resend shows a green ✓ when verified.

### 3c. Update Environment Variables

Once verified, update your Vercel env vars:

```
EMAIL_FROM="Legal Eagle <noreply@yourdomain.com>"
EMAIL_REPLY_TO=support@yourdomain.com
```

---

## Step 4 — Configure Supabase to Use Resend for Auth Emails

By default, Supabase sends its own confirmation and magic-link emails using its built-in mailer. To use your branded Resend emails instead:

### Option A — Use Resend's Supabase Integration (Recommended)

Resend has a native Supabase integration:

1. In Resend dashboard → **Integrations** → **Supabase**
2. Follow the one-click setup — it configures SMTP automatically
3. Done. Supabase will now route auth emails through Resend.

### Option B — Manual SMTP Configuration

1. In your **Supabase dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
2. Toggle **Enable Custom SMTP** to ON
3. Fill in these values:

| Setting       | Value                              |
|---------------|------------------------------------|
| Host          | `smtp.resend.com`                  |
| Port          | `465` (SSL) or `587` (TLS)         |
| Username      | `resend`                           |
| Password      | Your `re_xxxx` API key             |
| Sender name   | `Legal Eagle`                      |
| Sender email  | `noreply@yourdomain.com`           |

> Supabase will now send its own auth emails (magic links, confirmations) through Resend.

### Why This Matters

- **Without this:** Supabase sends a plain "You have received a magic link" email. Your branded `/api/auth/reset-password` route sends a second branded email. Users get 2 emails.
- **With this:** Only your branded email is sent. Clean and professional.

### Disable Supabase's Default Auth Emails (Advanced)

Once your custom emails are working, you can disable Supabase's built-in confirmations entirely:

1. **Supabase dashboard** → **Auth** → **Email Templates**
2. For each template (Confirm signup, Reset password, Magic Link):
   - Set the subject to `no-op`
   - Set the body to a single space ` `
3. This ensures Supabase sends a "ghost" email through SMTP but your route handles the real one.

> **Alternatively:** Use `supabase.auth.admin.generateLink()` (already implemented in `/api/auth/reset-password`) which generates the token without sending any email at all — then you send yours. Requires `SUPABASE_SERVICE_ROLE_KEY`.

---

## Step 5 — Test the Email System

### Test Welcome Email (Signup Flow)

```bash
# Complete the onboarding form at /onboarding
# After submitting, check your inbox
# Or test the API directly:
curl -X POST https://your-app.vercel.app/api/auth/send-welcome \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","accountType":"individual"}'
```

### Test Password Reset

```bash
curl -X POST https://your-app.vercel.app/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"yourtest@email.com"}'
```

### Test AI Alert Digest (run manually)

```bash
curl -X GET https://your-app.vercel.app/api/cron/engine \
  -H "Authorization: Bearer your-cron-secret"
```

---

## Step 6 — Verify Deliverability

After setting up, check these in order:

1. **Inbox delivery** — Send a test to your own email. Does it land in inbox (not spam)?
2. **Resend dashboard** → **Emails** — Do you see your sent emails? Are they "Delivered"?
3. **SPF/DKIM check** — Use https://mxtoolbox.com/spf.aspx to verify your domain's SPF record
4. **Preview emails** — Use https://resend.com/emails to see HTML rendering

---

## Resend Free Tier Limits

| Limit          | Value                          |
|----------------|--------------------------------|
| Emails/month   | 3,000                          |
| Emails/day     | 100                            |
| Custom domains | 1 on free tier                 |
| Webhooks       | Not on free tier               |
| Upgrade needed | ~100+ users or alert digests   |

**Pro plan** ($20/month): 50,000 emails/month, webhooks, team access, analytics.

---

## Email Types Implemented

| Trigger                         | Template File              | Route                              |
|---------------------------------|----------------------------|------------------------------------|
| New user signup                 | `emails/welcome.ts`        | `POST /api/auth/send-welcome`      |
| Forgot password click           | `emails/password-reset.ts` | `POST /api/auth/reset-password`    |
| Daily AI negligence engine      | `emails/ai-alert-digest.ts`| Called from `GET /api/cron/engine` |
| Case update (message/doc/status)| `emails/case-update.ts`    | Call `sendCaseUpdateEmail()` directly |

---

## Troubleshooting

| Problem                        | Cause                         | Fix                                            |
|--------------------------------|-------------------------------|------------------------------------------------|
| Emails go to spam              | No DKIM/SPF records           | Complete Step 3 — verify domain                |
| "Domain not verified" error    | Sending from unverified domain| Use `onboarding@resend.dev` to test, then verify |
| User gets 2 reset emails       | Supabase SMTP not configured  | Complete Step 4                                |
| `re_` key not working          | Wrong env var name            | Check `RESEND_API_KEY` (not `RESEND_KEY`)      |
| Emails logged but not sent     | `RESEND_API_KEY` not set      | Check Vercel env vars — re-deploy after adding |
| Rate limit hit                 | 100/day free tier             | Upgrade or batch digests                       |
