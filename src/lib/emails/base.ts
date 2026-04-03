// ─── Brand constants ──────────────────────────────────────────────────────────
export const BRAND = {
  name:    'Legal Eagle',
  tagline: 'Legal accountability, redefined.',
  color:   '#d4a017',           // amber gold
  navy:    '#0f172a',
  bg:      '#f5f4f0',
  white:   '#ffffff',
  text:    '#1a1714',
  muted:   '#6b7280',
  border:  '#e5e7eb',
  url:     process.env.NEXT_PUBLIC_APP_URL ?? 'https://legal-eagle.app',
};

// ─── Base layout wrapper ──────────────────────────────────────────────────────
// All emails use this wrapper for consistent branding.
// Using table-based layout + inline styles for maximum email client compatibility.
export function emailBase({
  previewText,
  body,
  footerExtra = '',
}: {
  previewText: string;
  body: string;
  footerExtra?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
  <title>${previewText}</title>
  <style>
    /* Base resets */
    * { box-sizing: border-box; }
    body, #root, #__next { margin: 0; padding: 0; width: 100% !important; }
    img { border: 0; display: block; max-width: 100%; }
    a { color: ${BRAND.color}; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Mobile */
    @media (max-width: 600px) {
      .container  { width: 100% !important; padding: 0 16px !important; }
      .card       { border-radius: 16px !important; padding: 28px 20px !important; }
      .btn        { display: block !important; text-align: center !important; }
      .hide-sm    { display: none !important; }
      .stack-sm   { display: block !important; width: 100% !important; }
    }

    /* Dark mode — respected by Apple Mail, some Android clients */
    @media (prefers-color-scheme: dark) {
      .dark-bg   { background-color: #111827 !important; }
      .dark-card { background-color: #1f2937 !important; border-color: #374151 !important; }
      .dark-text { color: #f9fafb !important; }
      .dark-sub  { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="background-color:${BRAND.bg};margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" class="dark-bg">

  <!-- Preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${previewText}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </span>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="580" class="container" style="max-width:580px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND.navy};border-radius:14px;padding:10px 14px;vertical-align:middle;">
                    <span style="color:${BRAND.color};font-size:18px;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-0.5px;">
                      ⚖ Legal Eagle
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;padding:40px 40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.06);" class="card dark-card">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;" class="dark-sub">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};line-height:1.6;">
                ${BRAND.tagline}
              </p>
              ${footerExtra ? `<p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};">${footerExtra}</p>` : ''}
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                <a href="${BRAND.url}/settings" style="color:#9ca3af;">Notification settings</a>
                &nbsp;·&nbsp;
                <a href="${BRAND.url}" style="color:#9ca3af;">${BRAND.url.replace('https://', '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Heading helper ───────────────────────────────────────────────────────────
export function emailH1(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:${BRAND.text};line-height:1.2;font-family:Georgia,'Times New Roman',serif;" class="dark-text">${text}</h1>`;
}

export function emailH2(text: string): string {
  return `<h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:${BRAND.text};line-height:1.3;" class="dark-text">${text}</h2>`;
}

// ─── Paragraph helper ─────────────────────────────────────────────────────────
export function emailP(text: string, opts: { small?: boolean; muted?: boolean; mb?: number } = {}): string {
  const size  = opts.small ? '13px' : '15px';
  const color = opts.muted ? BRAND.muted : BRAND.text;
  const mb    = opts.mb ?? 16;
  return `<p style="margin:0 0 ${mb}px;font-size:${size};line-height:1.65;color:${color};" class="${opts.muted ? 'dark-sub' : 'dark-text'}">${text}</p>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
export function emailButton(text: string, href: string, opts: { secondary?: boolean } = {}): string {
  const bg      = opts.secondary ? '#f9fafb' : BRAND.color;
  const color   = opts.secondary ? BRAND.text : '#ffffff';
  const border  = opts.secondary ? `1px solid ${BRAND.border}` : 'none';
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${bg};border-radius:12px;border:${border};">
      <a href="${href}" class="btn" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:${color};text-decoration:none;border-radius:12px;letter-spacing:0.1px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function emailDivider(): string {
  return `<hr style="border:0;border-top:1px solid ${BRAND.border};margin:24px 0;" />`;
}

// ─── Callout box ─────────────────────────────────────────────────────────────
export function emailCallout(
  text: string,
  opts: { icon?: string; color?: 'amber' | 'red' | 'green' | 'blue' } = {}
): string {
  const colors = {
    amber: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    red:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    green: { bg: '#f0fdf4', border: '#86efac', text: '#14532d' },
    blue:  { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
  };
  const c = colors[opts.color ?? 'amber'];
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
  <tr>
    <td style="background-color:${c.bg};border:1px solid ${c.border};border-left:4px solid ${c.border};border-radius:10px;padding:14px 16px;">
      <p style="margin:0;font-size:13px;color:${c.text};line-height:1.6;">
        ${opts.icon ? `<span style="margin-right:6px;">${opts.icon}</span>` : ''}${text}
      </p>
    </td>
  </tr>
</table>`;
}

// ─── Key-value row ────────────────────────────────────────────────────────────
export function emailKV(pairs: { label: string; value: string }[]): string {
  const rows = pairs.map(({ label, value }) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};width:40%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0 8px 16px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.text};font-weight:600;">${value}</td>
    </tr>`).join('');
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
  ${rows}
</table>`;
}

// ─── Plain text generator ─────────────────────────────────────────────────────
// Strips HTML tags and produces a clean plain-text fallback
export function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#847;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
