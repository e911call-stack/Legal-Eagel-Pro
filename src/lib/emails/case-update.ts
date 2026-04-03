import { sendEmail, type SendEmailResult } from '../email-client';
import {
  BRAND, emailBase, emailH1, emailP, emailButton,
  emailDivider, emailKV, toPlainText,
} from './base';

export interface CaseUpdateData {
  to:          string;
  clientName:  string;
  caseTitle:   string;
  caseId:      string;
  updateType:  'message' | 'document' | 'status_change' | 'task_done' | 'deadline_added';
  summary:     string;          // 1-2 sentence human-readable description
  lawyerName?: string;
  newStatus?:  string;
}

const TYPE_LABELS: Record<CaseUpdateData['updateType'], string> = {
  message:        'New message from your attorney',
  document:       'New document shared with you',
  status_change:  'Your case status has changed',
  task_done:      'A task in your case was completed',
  deadline_added: 'A new deadline was added to your case',
};

const TYPE_ICONS: Record<CaseUpdateData['updateType'], string> = {
  message:        '💬',
  document:       '📄',
  status_change:  '⚡',
  task_done:      '✅',
  deadline_added: '📅',
};

export async function sendCaseUpdateEmail(data: CaseUpdateData): Promise<SendEmailResult> {
  const name    = data.clientName?.split(' ')[0] ?? 'there';
  const label   = TYPE_LABELS[data.updateType];
  const icon    = TYPE_ICONS[data.updateType];
  const portalUrl = `${BRAND.url}/portal/cases/${data.caseId}`;

  const body = `
    <div style="background:${BRAND.color}14;border-radius:14px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:10px;">${icon}</div>
      <div style="font-size:13px;font-weight:700;color:${BRAND.color};text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    </div>

    ${emailH1(data.caseTitle)}
    ${emailP(`Hi ${name},`)}
    ${emailP(data.summary)}

    ${emailKV([
      { label: 'Case',    value: data.caseTitle },
      ...(data.lawyerName ? [{ label: 'Attorney', value: data.lawyerName }] : []),
      ...(data.newStatus  ? [{ label: 'New status', value: data.newStatus }] : []),
      { label: 'Updated', value: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    ])}

    ${emailButton('View my case portal', portalUrl)}

    ${emailDivider()}
    ${emailP(
      'Legal Eagle gives you full real-time visibility into your case. ' +
      'If you haven\'t heard from your attorney in 14 days or your messages go unanswered for 72 hours, ' +
      'the AI engine will flag it automatically.',
      { muted: true, small: true }
    )}
  `;

  const html = emailBase({
    previewText: `${label}: ${data.caseTitle}`,
    body,
    footerExtra: 'You received this because you are a client on Legal Eagle.',
  });

  return sendEmail({
    to:      data.to,
    subject: `${icon} ${label} — ${data.caseTitle}`,
    html,
    text:    toPlainText(body),
    tags:    [
      { name: 'type',        value: 'case-update'      },
      { name: 'update_type', value: data.updateType    },
    ],
  });
}
