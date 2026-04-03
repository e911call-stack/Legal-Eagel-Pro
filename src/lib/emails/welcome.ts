import { sendEmail, FROM_ADDRESS, type SendEmailResult } from '../email-client';
import {
  BRAND, emailBase, emailH1, emailP, emailButton,
  emailDivider, emailCallout, emailKV, toPlainText,
} from './base';

export interface WelcomeEmailData {
  to:          string;
  name:        string;
  accountType: 'individual' | 'lawfirm';
  firmName?:   string;
  loginUrl?:   string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<SendEmailResult> {
  const loginUrl   = data.loginUrl ?? `${BRAND.url}/login`;
  const isIndividual = data.accountType === 'individual';
  const greeting   = data.name ? `Welcome, ${data.name.split(' ')[0]}` : 'Welcome';

  // ─── Branch: Individual (client) ─────────────────────────────────────────
  const individualBody = `
    ${emailH1(`${greeting} — your case monitor is ready.`)}
    ${emailP('Legal Eagle is now watching over your legal matter so you never have to wonder what's happening with your case again.')}

    ${emailCallout(
      'You have full visibility into every document, message, deadline, and task in your case — in real time.',
      { icon: '🛡️', color: 'blue' }
    )}

    ${emailH2('What you can do from day one')}
    <ul style="margin:0 0 20px;padding-left:20px;color:${BRAND.text};font-size:14px;line-height:2;">
      <li>Track your case status and timeline</li>
      <li>View documents your attorney shares with you</li>
      <li>Message your attorney directly — with read receipts</li>
      <li>Ask <strong>"Is my case stuck?"</strong> — our AI will answer honestly</li>
      <li>Get alerts if your attorney hasn't been active in 14 days</li>
    </ul>

    ${emailButton('Open my client portal', `${BRAND.url}/portal/dashboard`)}

    ${emailDivider()}
    ${emailP('If you have a pending case and your attorney is not yet on Legal Eagle, you can share this link with them to get started:', { muted: true, small: true })}
    ${emailP(`<a href="${BRAND.url}/onboarding" style="color:${BRAND.color};">${BRAND.url}/onboarding</a>`, { small: true })}
  `;

  // ─── Branch: Law Firm ─────────────────────────────────────────────────────
  const firmBody = `
    ${emailH1(`${greeting} — your firm is set up.`)}
    ${emailP(`${data.firmName ? `<strong>${data.firmName}</strong> is` : 'Your firm is'} now on Legal Eagle. Your AI-powered negligence detection engine is active and will begin monitoring all cases you create.`)}

    ${emailCallout(
      'The AI Negligence Engine runs every night at midnight UTC — scanning every active case for inactivity, unanswered messages, and missed deadlines.',
      { icon: '🧠', color: 'amber' }
    )}

    ${emailH2('Your setup checklist')}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
      ${[
        ['Create your first case', `${BRAND.url}/cases`],
        ['Invite a client to their portal', `${BRAND.url}/cases`],
        ['Set up billing model (hourly or flat-fee)', `${BRAND.url}/billing`],
        ['Review AI alert preferences', `${BRAND.url}/settings`],
      ].map(([label, href]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
            <span style="margin-right:10px;color:${BRAND.color};font-weight:700;">→</span>
            <a href="${href}" style="color:${BRAND.text};font-size:14px;font-weight:500;">${label}</a>
          </td>
        </tr>`).join('')}
    </table>

    ${emailButton('Go to my dashboard', `${BRAND.url}/dashboard`)}

    ${emailDivider()}
    ${emailP('Questions? Reply to this email — we read every one.', { muted: true, small: true })}
  `;

  const body = isIndividual ? individualBody : firmBody;
  const html = emailBase({
    previewText: isIndividual
      ? `${greeting} — your legal case monitor is active and watching.`
      : `${greeting} — ${data.firmName ?? 'Your firm'} is live on Legal Eagle.`,
    body,
    footerExtra: 'You received this because you created a Legal Eagle account.',
  });

  return sendEmail({
    to:      data.to,
    subject: isIndividual
      ? `Welcome to Legal Eagle — your case monitor is active`
      : `${data.firmName ?? 'Your firm'} is live on Legal Eagle`,
    html,
    text:    toPlainText(body),
    tags:    [
      { name: 'type',         value: 'welcome'             },
      { name: 'account_type', value: data.accountType      },
    ],
  });
}
