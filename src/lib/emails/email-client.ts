// Internal re-export — used by email templates to avoid importing from lib/email.ts
// which itself imports from this directory (would create a circular dependency).
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend       = resendApiKey ? new Resend(resendApiKey) : null;

export const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? 'Legal Eagle <noreply@legaleagle.app>';

export const REPLY_TO =
  process.env.EMAIL_REPLY_TO ?? 'support@legaleagle.app';

export interface SendEmailOptions {
  to:       string | string[];
  subject:  string;
  html:     string;
  text?:    string;
  replyTo?: string;
  tags?:    { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  id?:     string;
  error?:  string;
  demo?:   boolean;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  if (!resend) {
    const to = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
    console.log(`[Email — DEMO] Would send "${opts.subject}" → ${to}`);
    return { success: true, id: `demo-${Date.now()}`, demo: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from:     FROM_ADDRESS,
      to:       opts.to,
      subject:  opts.subject,
      html:     opts.html,
      text:     opts.text,
      reply_to: opts.replyTo ?? REPLY_TO,
      tags:     opts.tags,
    });
    if (error) { console.error('[Email]', error); return { success: false, error: error.message }; }
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Email]', msg);
    return { success: false, error: msg };
  }
}
