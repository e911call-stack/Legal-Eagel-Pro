import { sendEmail, type SendEmailResult } from '../email-client';
import {
  BRAND, emailBase, emailH1, emailP, emailButton,
  emailDivider, emailCallout, toPlainText,
} from './base';

export interface AlertDigestCase {
  id:          string;
  title:       string;
  risk_score:  number;
  risk_level:  'low' | 'medium' | 'high';
  alert_type:  'inactivity' | 'unanswered_message' | 'missed_deadline';
  description: string;
  client_name: string;
}

export interface AIAlertDigestData {
  to:          string;
  name:        string;
  firmName?:   string;
  alerts:      AlertDigestCase[];
  date?:       string;
}

const ALERT_LABELS: Record<AlertDigestCase['alert_type'], string> = {
  inactivity:        '⏸ No activity (14+ days)',
  unanswered_message:'💬 Unanswered client message (72h+)',
  missed_deadline:   '📅 Internal deadline missed',
};

const RISK_COLORS: Record<AlertDigestCase['risk_level'], string> = {
  high:   '#dc2626',
  medium: '#d97706',
  low:    '#16a34a',
};

export async function sendAIAlertDigest(data: AIAlertDigestData): Promise<SendEmailResult> {
  if (data.alerts.length === 0) {
    // Don't send a digest with zero alerts
    return { success: true, id: 'skipped-empty', demo: true };
  }

  const name      = data.name?.split(' ')[0] ?? 'Counsellor';
  const dateStr   = data.date ?? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const highCount = data.alerts.filter(a => a.risk_level === 'high').length;
  const plural    = data.alerts.length === 1 ? 'case requires' : 'cases require';

  const alertRows = data.alerts.map(alert => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid ${BRAND.border};">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align:top;padding-right:12px;">
              <div style="display:inline-block;padding:3px 10px;background-color:${RISK_COLORS[alert.risk_level]}18;border:1px solid ${RISK_COLORS[alert.risk_level]}44;border-radius:20px;font-size:11px;font-weight:700;color:${RISK_COLORS[alert.risk_level]};margin-bottom:6px;">
                ${alert.risk_level.toUpperCase()} RISK — ${alert.risk_score}/100
              </div>
              <div style="font-size:15px;font-weight:700;color:${BRAND.text};margin-bottom:4px;">${alert.title}</div>
              <div style="font-size:12px;color:${BRAND.muted};margin-bottom:8px;">Client: ${alert.client_name}</div>
              <div style="font-size:12px;color:${BRAND.muted};margin-bottom:8px;">${ALERT_LABELS[alert.alert_type]}</div>
              <div style="font-size:13px;color:${BRAND.text};line-height:1.5;">${alert.description}</div>
            </td>
            <td style="vertical-align:top;width:100px;text-align:right;">
              <a href="${BRAND.url}/cases/${alert.id}"
                style="display:inline-block;padding:8px 16px;background-color:${BRAND.navy};color:white;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap;">
                View Case →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const body = `
    ${emailH1(`AI Alert Digest — ${dateStr}`)}
    ${emailP(`Hi ${name}, the Legal Eagle Negligence Detection Engine ran overnight and found <strong>${data.alerts.length} ${plural} your attention</strong>${highCount > 0 ? ` — including <strong style="color:${RISK_COLORS.high}">${highCount} high-risk</strong>` : ''}.`)}

    ${highCount > 0 ? emailCallout(
      `${highCount} case${highCount > 1 ? 's are' : ' is'} at HIGH risk. Immediate review recommended to avoid negligence escalation.`,
      { icon: '⚠️', color: 'red' }
    ) : ''}

    <!-- Alert cards -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
      style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin:16px 0;">
      ${alertRows}
    </table>

    ${emailButton('Review all alerts', `${BRAND.url}/alerts`)}

    ${emailDivider()}
    ${emailP(
      'This digest is sent automatically each morning when the AI engine detects at-risk cases. ' +
      'You can adjust alert preferences in your <a href="' + BRAND.url + '/settings">notification settings</a>.',
      { muted: true, small: true }
    )}
  `;

  const html = emailBase({
    previewText: `${data.alerts.length} case${data.alerts.length > 1 ? 's require' : ' requires'} your attention — Legal Eagle AI Digest`,
    body,
    footerExtra: `Sent on behalf of ${data.firmName ?? 'your firm'}`,
  });

  return sendEmail({
    to:      data.to,
    subject: `⚠ ${data.alerts.length} case${data.alerts.length > 1 ? 's' : ''} flagged by AI — ${dateStr}`,
    html,
    text:    toPlainText(body),
    tags:    [
      { name: 'type',        value: 'ai-alert-digest'         },
      { name: 'alert_count', value: String(data.alerts.length) },
    ],
  });
}
