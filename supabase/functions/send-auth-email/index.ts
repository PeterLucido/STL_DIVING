import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type EmailActionType =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change"
  | "email_change_new"
  | "reauthentication";

type SendEmailPayload = {
  user: {
    email?: string;
    new_email?: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    email_action_type: EmailActionType;
    redirect_to: string;
    site_url?: string;
    token?: string;
    token_hash: string;
    new_token?: string;
    old_email?: string;
  };
};

const projectRef = Deno.env.get("PROJECT_REF") ?? "zolysphyrrhgeecbdghs";
const sender = Deno.env.get("MICROSOFT_SENDER") ?? "info@stldiving.com";
const authRedirectTo = Deno.env.get("AUTH_REDIRECT_TO") ?? "https://www.stldiving.com/practice-planner";

const subjects: Record<EmailActionType, string> = {
  signup: "Confirm your STL Diving account",
  recovery: "Reset your STL Diving password",
  invite: "You're invited to STL Diving",
  magiclink: "Your STL Diving sign-in link",
  email_change: "Confirm your new STL Diving email",
  email_change_new: "Confirm your new STL Diving email",
  reauthentication: "Your STL Diving verification code",
};

function generateConfirmationUrl(emailData: SendEmailPayload["email_data"]) {
  const params = new URLSearchParams({
    token: emailData.token_hash,
    type: emailData.email_action_type,
    redirect_to: authRedirectTo,
  });

  return `https://${projectRef}.supabase.co/auth/v1/verify?${params.toString()}`;
}

function buildEmailHtml(payload: SendEmailPayload) {
  const confirmationUrl = generateConfirmationUrl(payload.email_data);
  const actionType = payload.email_data.email_action_type;
  const token = payload.email_data.token ?? "";
  const newEmail = payload.user.new_email ?? "";

  const copy: Record<EmailActionType, { heading: string; body: string; button: string }> = {
    signup: {
      heading: "Confirm your account.",
      body: "Confirm your email address to finish creating your STL Diving practice scheduling account.",
      button: "Confirm account",
    },
    recovery: {
      heading: "Reset your password.",
      body: "Use the button below to choose a new password for your STL Diving account.",
      button: "Reset password",
    },
    invite: {
      heading: "You're invited.",
      body: "You've been invited to create an STL Diving account for practice scheduling.",
      button: "Accept invitation",
    },
    magiclink: {
      heading: "Sign in to STL Diving.",
      body: "Use the button below to sign in. This link expires shortly and can only be used once.",
      button: "Sign in",
    },
    email_change: {
      heading: "Confirm your new email.",
      body: `Confirm ${newEmail || "your new email address"} for your STL Diving account.`,
      button: "Confirm email",
    },
    email_change_new: {
      heading: "Confirm your new email.",
      body: `Confirm ${newEmail || "your new email address"} for your STL Diving account.`,
      button: "Confirm email",
    },
    reauthentication: {
      heading: "Verification code.",
      body: "Use this code to verify your identity. It expires shortly.",
      button: token,
    },
  };

  const message = copy[actionType] ?? copy.signup;
  const isCodeOnly = actionType === "reauthentication";
  const action = isCodeOnly
    ? `<div style="display:inline-block;margin-top:16px;padding:18px 24px;border-radius:18px;background:#eef6ff;color:#152760;font-size:30px;font-weight:900;letter-spacing:4px;">${message.button}</div>`
    : `<a href="${confirmationUrl}" style="display:inline-block;margin-top:18px;padding:18px 28px;border-radius:999px;background:#ed1c2a;color:#ffffff;text-decoration:none;font-weight:900;font-size:18px;">${message.button}</a>`;

  return `
    <div style="margin:0;padding:0;background:#f8fbff;background-image:radial-gradient(circle at 86% 8%,rgba(237,28,42,0.11),rgba(237,28,42,0) 30%),linear-gradient(135deg,#ffffff 0%,#f6fbff 52%,#eaf7ff 100%);font-family:Arial,Helvetica,sans-serif;color:#152760;">
      <div style="max-width:620px;margin:0 auto;padding:44px 20px;">
        <div style="background:#ffffff;border:1px solid #dfe7f5;border-radius:28px;padding:38px;box-shadow:0 18px 45px rgba(21,39,96,0.08);">
          <div style="display:inline-block;padding:10px 18px;border:1px solid #d9e2f2;border-radius:999px;color:#223f99;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">STL Diving</div>
          <h1 style="margin:28px 0 14px;font-size:44px;line-height:1;color:#152760;letter-spacing:-1px;">${message.heading}</h1>
          <p style="margin:0;color:#52617c;font-size:18px;line-height:1.55;font-weight:700;">${message.body}</p>
          ${action}
          <p style="margin:34px 0 0;color:#6b7891;font-size:14px;line-height:1.5;">If you were not expecting this email, you can ignore it.</p>
        </div>
      </div>
    </div>
  `;
}

async function getMicrosoftAccessToken() {
  const tenantId = Deno.env.get("MICROSOFT_TENANT_ID");
  const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
  const clientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing Microsoft Graph environment variables.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Microsoft token request failed: ${await response.text()}`);
  }

  const token = await response.json();
  return token.access_token as string;
}

async function sendWithMicrosoftGraph(payload: SendEmailPayload) {
  const recipient = payload.user.email;
  if (!recipient) throw new Error("Missing recipient email.");

  const accessToken = await getMicrosoftAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${sender}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: subjects[payload.email_data.email_action_type] ?? "STL Diving",
        body: {
          contentType: "HTML",
          content: buildEmailHtml(payload),
        },
        toRecipients: [{ emailAddress: { address: recipient } }],
      },
      saveToSentItems: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Microsoft sendMail failed: ${response.status} ${await response.text()}`);
  }
}

Deno.serve(async (request) => {
  try {
    const payloadText = await request.text();
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

    if (!hookSecret) throw new Error("Missing SEND_EMAIL_HOOK_SECRET.");

    const verifier = new Webhook(hookSecret.replace("v1,whsec_", ""));
    const payload = verifier.verify(
      payloadText,
      Object.fromEntries(request.headers)
    ) as SendEmailPayload;

    await sendWithMicrosoftGraph(payload);

    return new Response(JSON.stringify({ message: "Email sent." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-auth-email]", error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Email hook failed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
