import nodemailer from 'nodemailer'

interface MailConfig {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPass: string
}

function createTransport(config: MailConfig) {
    return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
        },
    })
}

function getMailConfig(): MailConfig & { smtpFrom: string } {
    const config = useRuntimeConfig()
    return {
        smtpHost: config.smtpHost,
        smtpPort: Number(config.smtpPort) || 587,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass,
        smtpFrom: config.smtpFrom || config.smtpUser,
    }
}

// ── Neovim-themed base layout ───────────────────────────────────
function wrapTemplate(content: string, siteUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#001419;font-family:'JetBrains Mono',monospace;color:#839395;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#001419;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#001419;border:1px solid #063540;border-radius:4px;overflow:hidden;max-width:100%;">

  <!-- BufferLine -->
  <tr>
    <td style="background:#002C38;padding:6px 12px;border-bottom:1px solid #063540;">
      <span style="color:#268BD3;border-bottom:2px solid #268BD3;padding:2px 8px;font-size:12px;">mail.md</span>
      <span style="color:#576D74;padding:2px 8px;font-size:12px;">inbox</span>
    </td>
  </tr>

  <!-- Content -->
  <tr>
    <td style="padding:20px 24px;">
      ${content}
    </td>
  </tr>

  <!-- StatusLine -->
  <tr>
    <td style="background:#002C38;padding:6px 12px;border-top:1px solid #063540;font-size:11px;">
      <span style="background:#268BD3;color:#001419;padding:1px 6px;border-radius:2px;font-weight:bold;">NORMAL</span>
      <span style="color:#576D74;margin-left:8px;">main</span>
      <span style="color:#576D74;margin-left:8px;">utf-8</span>
      <span style="color:#576D74;float:right;">
        <a href="${siteUrl}" style="color:#29A298;text-decoration:none;">${siteUrl.replace('https://', '')}</a>
      </span>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

// ── Notification: new message received ──────────────────────────
export function buildNotificationEmail(msg: {
    name: string
    email: string
    subject: string | null
    message: string
    created_at: string
}, siteUrl: string): { subject: string; html: string } {
    const subjectLine = msg.subject || '(no subject)'
    const date = new Date(msg.created_at).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })

    const content = `
      <div style="color:#576D74;font-size:12px;font-style:italic;margin-bottom:12px;">-- New message received</div>

      <table cellpadding="4" cellspacing="0" style="font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="color:#6D71C4;white-space:nowrap;vertical-align:top;">From:</td>
          <td style="color:#29A298;font-weight:bold;">${escapeHtml(msg.name)} <span style="color:#576D74;font-weight:normal;">&lt;${escapeHtml(msg.email)}&gt;</span></td>
        </tr>
        <tr>
          <td style="color:#6D71C4;white-space:nowrap;vertical-align:top;">Subject:</td>
          <td style="color:#B28500;">${escapeHtml(subjectLine)}</td>
        </tr>
        <tr>
          <td style="color:#6D71C4;white-space:nowrap;vertical-align:top;">Date:</td>
          <td style="color:#576D74;">${date}</td>
        </tr>
      </table>

      <div style="border-left:3px solid #29A298;padding:8px 12px;background:#002C38;margin-bottom:16px;">
        <div style="color:#839395;white-space:pre-wrap;font-size:13px;line-height:1.6;">${escapeHtml(msg.message)}</div>
      </div>

      <div style="text-align:center;margin-top:20px;">
        <a href="${siteUrl}/admin/messages" style="display:inline-block;background:#268BD3;color:#001419;padding:8px 20px;text-decoration:none;border-radius:2px;font-size:12px;font-weight:bold;font-family:'JetBrains Mono',monospace;">:admin messages</a>
      </div>
    `

    return {
        subject: `💬 New message from ${msg.name}: ${subjectLine}`,
        html: wrapTemplate(content, siteUrl),
    }
}

// ── Reply email to visitor ──────────────────────────────────────
export function buildReplyEmail(opts: {
    originalMessage: string
    originalSubject: string | null
    senderName: string
    replyBody: string
    profileName: string
}, siteUrl: string): { subject: string; html: string } {
    const subjectLine = opts.originalSubject
        ? `Re: ${opts.originalSubject}`
        : `Reply from ${opts.profileName}`

    const content = `
      <div style="color:#576D74;font-size:12px;font-style:italic;margin-bottom:12px;">-- Reply from ${escapeHtml(opts.profileName)}</div>

      <div style="color:#839395;white-space:pre-wrap;font-size:13px;line-height:1.6;margin-bottom:20px;">${escapeHtml(opts.replyBody)}</div>

      <div style="border-top:1px solid #063540;padding-top:12px;margin-top:16px;">
        <div style="color:#576D74;font-size:11px;margin-bottom:8px;">── Original message from ${escapeHtml(opts.senderName)} ──</div>
        <div style="border-left:3px solid #063540;padding:8px 12px;background:#002C38;">
          <div style="color:#576D74;white-space:pre-wrap;font-size:12px;line-height:1.5;">${escapeHtml(opts.originalMessage)}</div>
        </div>
      </div>
    `

    return {
        subject: subjectLine,
        html: wrapTemplate(content, siteUrl),
    }
}

// ── Send email ──────────────────────────────────────────────────
export async function sendMail(opts: {
    to: string
    subject: string
    html: string
    replyTo?: string
}): Promise<void> {
    const config = getMailConfig()
    const transport = createTransport(config)

    await transport.sendMail({
        from: config.smtpFrom,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
    })
}
