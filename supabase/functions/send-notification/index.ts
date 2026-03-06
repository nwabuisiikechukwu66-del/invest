// ─────────────────────────────────────────────────────────────────────────────
// Edge Function: send-notification
// Sends email notifications to investors
// Deploy: supabase functions deploy send-notification
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface NotificationPayload {
  type: 'earnings' | 'kyc_approved' | 'investment_confirmed' | 'withdrawal_processed';
  user_id: string;
  data?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(payload.user_id);
    if (userErr || !user?.email) throw new Error('User not found');

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', payload.user_id)
      .single();

    const firstName = profile?.first_name ?? 'Investor';
    const template  = getEmailTemplate(payload.type, firstName, payload.data);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RealtyInvestors <noreply@realtyinvestors.com>',
        to: [user.email],
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#EDE9E0;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#F8F6F1;">
      <!-- Header -->
      <tr>
        <td style="background:#0F0F0F;padding:32px 40px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:#C9A227;letter-spacing:0.02em;">
            Realty<span style="color:#F8F6F1;">Investors</span>
          </span>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:48px 40px;font-family:Arial,sans-serif;">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#1A1A1A;padding:28px 40px;text-align:center;">
          <p style="color:rgba(248,246,241,0.35);font-size:11px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
            © 2026 RealtyInvestors Ltd. All rights reserved.<br/>
            Investing involves risk. Past performance is not indicative of future results.<br/>
            30 St Mary Axe, London EC3A 8EP, United Kingdom
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function btnStyle(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#C9A227;color:#0F0F0F;padding:14px 36px;font-weight:700;font-size:12px;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;margin-top:28px;">${label}</a>`;
}

function getEmailTemplate(type: string, name: string, data?: Record<string, unknown>) {
  switch (type) {

    case 'earnings':
      return {
        subject: 'Your Monthly Earnings Have Been Distributed',
        html: emailWrapper(`
          <p style="font-size:17px;color:#2B2B2B;margin:0 0 12px;">Hello ${name},</p>
          <p style="color:#6B6B6B;line-height:1.7;margin:0 0 32px;">
            Great news — your monthly earnings from your real estate portfolio have been
            distributed to your account and are ready to withdraw.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;margin-bottom:32px;">
            <tr>
              <td style="padding:32px;text-align:center;">
                <p style="color:rgba(248,246,241,0.45);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;font-family:Arial,sans-serif;">Total Distributed This Month</p>
                <p style="color:#C9A227;font-size:44px;font-weight:300;margin:0;font-family:Georgia,serif;">${data?.amount ?? '$0.00'}</p>
              </td>
            </tr>
          </table>
          <p style="color:#6B6B6B;font-size:13px;line-height:1.7;margin:0;">
            Log in to your dashboard to view the breakdown by property, track your cumulative earnings, or request a withdrawal.
          </p>
          ${btnStyle('View Dashboard', 'https://realtyinvestors.com/dashboard')}
        `),
      };

    case 'kyc_approved':
      return {
        subject: 'Identity Verified — You Can Now Invest',
        html: emailWrapper(`
          <p style="font-size:17px;color:#2B2B2B;margin:0 0 12px;">Hello ${name},</p>
          <p style="color:#6B6B6B;line-height:1.7;margin:0 0 24px;">
            Your identity verification has been approved. You now have full access to all
            investment opportunities on RealtyInvestors — including properties across London,
            Dubai, Miami, and beyond.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE9E0;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">
              <p style="font-size:13px;color:#2B2B2B;margin:0 0 12px;font-weight:600;">What you can do now:</p>
              ${['Browse all available properties', 'Invest from as little as $100', 'Track earnings in real time', 'Withdraw profits to your bank account'].map(item =>
                `<p style="font-size:13px;color:#6B6B6B;margin:0 0 8px;padding-left:16px;">✓ ${item}</p>`
              ).join('')}
            </td></tr>
          </table>
          ${btnStyle('Browse Properties', 'https://realtyinvestors.com/investments')}
        `),
      };

    case 'investment_confirmed':
      return {
        subject: `Investment Confirmed — ${data?.property_name ?? 'Property'}`,
        html: emailWrapper(`
          <p style="font-size:17px;color:#2B2B2B;margin:0 0 12px;">Hello ${name},</p>
          <p style="color:#6B6B6B;line-height:1.7;margin:0 0 32px;">
            Your investment has been confirmed and your fractional ownership has been registered.
            Here is a summary of your investment.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;margin-bottom:32px;">
            <tr><td style="padding:32px;">
              <p style="color:rgba(248,246,241,0.4);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;font-family:Arial,sans-serif;">Property</p>
              <p style="color:#F8F6F1;font-size:20px;margin:0 0 24px;font-family:Georgia,serif;">${data?.property_name ?? 'N/A'}</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);">
                    <span style="color:rgba(248,246,241,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Amount Invested</span>
                    <span style="float:right;color:#C9A227;font-weight:700;font-size:16px;">${data?.amount ?? '$0'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);">
                    <span style="color:rgba(248,246,241,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Expected Annual ROI</span>
                    <span style="float:right;color:#F8F6F1;font-weight:600;font-size:16px;">${data?.roi ?? '0'}%</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);">
                    <span style="color:rgba(248,246,241,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Investment Duration</span>
                    <span style="float:right;color:#F8F6F1;font-weight:600;font-size:16px;">${data?.duration ?? 'N/A'}</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
          <p style="color:#6B6B6B;font-size:13px;line-height:1.7;margin:0;">
            Rental income distributions will begin once the property reaches its funding target.
            You can track your investment in real time from your dashboard.
          </p>
          ${btnStyle('Track Investment', 'https://realtyinvestors.com/dashboard')}
        `),
      };

    case 'withdrawal_processed':
      return {
        subject: 'Withdrawal Request Received',
        html: emailWrapper(`
          <p style="font-size:17px;color:#2B2B2B;margin:0 0 12px;">Hello ${name},</p>
          <p style="color:#6B6B6B;line-height:1.7;margin:0 0 32px;">
            We have received your withdrawal request. Funds will be transferred to your
            linked bank account within 3–5 business days.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE9E0;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">
              <p style="color:rgba(43,43,43,0.5);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Withdrawal Amount</p>
              <p style="font-size:32px;font-weight:300;color:#2B2B2B;margin:0;font-family:Georgia,serif;">${data?.amount ?? '$0.00'}</p>
            </td></tr>
          </table>
          <p style="color:#6B6B6B;font-size:13px;line-height:1.7;margin:0 0 16px;">
            You will receive a confirmation once the transfer is complete. If you did not
            request this withdrawal, please contact us immediately at
            <a href="mailto:support@realtyinvestors.com" style="color:#A8841F;">support@realtyinvestors.com</a>.
          </p>
          ${btnStyle('View Transactions', 'https://realtyinvestors.com/dashboard')}
        `),
      };

    default:
      return {
        subject: 'RealtyInvestors Notification',
        html: emailWrapper(`
          <p style="font-size:17px;color:#2B2B2B;margin:0 0 12px;">Hello ${name},</p>
          <p style="color:#6B6B6B;line-height:1.7;">You have a new notification from RealtyInvestors.</p>
          ${btnStyle('Go to Dashboard', 'https://realtyinvestors.com/dashboard')}
        `),
      };
  }
}
