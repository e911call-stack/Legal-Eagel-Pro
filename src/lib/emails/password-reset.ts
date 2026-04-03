import { sendEmail, type SendEmailResult } from './email-client';
import {
  BRAND, emailBase, emailH1, emailP, emailButton,
  emailDivider, emailCallout, toPlainText,
} from './base';

export interface PasswordResetData {
  to:         string;
  name:       string;
  resetUrl:   string;          // Supabase provides this — contains one-time token
  expiresIn?: string;          // default "1 hour"
  ipAddress?: string;          // optional — shows who triggered the reset
  userAgent?: string;
}

export async function sendPasswordReset(data: PasswordResetData): Promise<SendEmailResult> {
  const expires = data.expiresIn ?? '1 hour';
  const name    = data.name?.split(' ')[0] ?? 'there';

  const body = `
    ${emailH1('Reset your password')}
    ${emailP(`Hi ${name}, we received a request to reset the password for your Legal Eagle account.`)}
    ${emailP('Click the button below to choose a new password. This link is single-use and expires in <strong>' + expires + '</strong>.')}

    ${emailButton('Reset my password', data.resetUrl)}

    ${emailCallout(
      'If you did not request a password reset, you can safely ignore this email. Your password will not change.',
      { icon: '🔒', color: 'blue' }
    )}

    ${emailDivider()}

    ${emailP('Security details:', { muted: true, small: true })}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${data.ipAddress ? `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:${BRAND.muted};width:120px;">Requested from</td>
          <td style="padding:4px 0;font-size:12px;color:${BRAND.text};">${data.ipAddress}</td>
        </tr>` : ''}
      <tr>
        <td style="padding:4px 0;font-size:12px;color:${BRAND.muted};width:120px;">Link expires</td>
        <td style="padding:4px 0;font-size:12px;color:${BRAND.text};">${expires} from when this email was sent</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:12px;color:${BRAND.muted};width:120px;">One-time use</td>
        <td style="padding:4px 0;font-size:12px;color:${BRAND.text};">Yes — the link cannot be used twice</td>
      </tr>
    </table>

    ${emailDivider()}

    ${emailP(
      `If the button above doesn't work, copy and paste this URL into your browser:<br/>` +
      `<span style="font-size:11px;color:${BRAND.muted};word-break:break-all;">${data.resetUrl}</span>`,
      { small: true, muted: true }
    )}
  `;

  const html = emailBase({
    previewText: `Reset your Legal Eagle password — link expires in ${expires}`,
    body,
    footerExtra: 'You received this because a password reset was requested for your account.',
  });

  return sendEmail({
    to:      data.to,
    subject: 'Reset your Legal Eagle password',
    html,
    text:    toPlainText(body),
    tags:    [{ name: 'type', value: 'password-reset' }],
  });
}
