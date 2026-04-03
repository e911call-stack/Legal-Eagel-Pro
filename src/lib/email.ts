// ─── Public email API ─────────────────────────────────────────────────────────
// Import from here in API routes and server actions.
// All senders are async, return { success, id?, error?, demo? }
// and never throw — errors are caught internally and returned.

export { sendEmail, type SendEmailOptions, type SendEmailResult } from './emails/email-client';
export { sendWelcomeEmail,   type WelcomeEmailData }      from './emails/welcome';
export { sendPasswordReset,  type PasswordResetData }     from './emails/password-reset';
export { sendAIAlertDigest,  type AIAlertDigestData }     from './emails/ai-alert-digest';
export { sendCaseUpdateEmail, type CaseUpdateData }       from './emails/case-update';
