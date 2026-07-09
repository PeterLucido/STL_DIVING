# STL Diving Auth Email Hook Setup

This project uses a Supabase Auth Send Email Hook to send auth emails through
Microsoft Graph as `info@stldiving.com`.

## Azure App Registration

- Application/client ID: `fff0eaf8-2927-4f86-94e1-67f1a053e3bf`
- Directory/tenant ID: `52af1038-b64d-4da9-8c11-e4aa08a308f7`
- Sender mailbox: `info@stldiving.com`

Required Microsoft Graph application permission:

- `Mail.Send`

After adding `Mail.Send`, click **Grant admin consent**.

Create a client secret in Azure:

1. App registration
2. Certificates & secrets
3. New client secret
4. Copy the **Value** immediately

## Supabase Edge Function Secrets

Set these secrets on the Supabase project:

```text
MICROSOFT_TENANT_ID=52af1038-b64d-4da9-8c11-e4aa08a308f7
MICROSOFT_CLIENT_ID=fff0eaf8-2927-4f86-94e1-67f1a053e3bf
MICROSOFT_CLIENT_SECRET=<Azure client secret value>
MICROSOFT_SENDER=info@stldiving.com
PROJECT_REF=zolysphyrrhgeecbdghs
SEND_EMAIL_HOOK_SECRET=<Supabase Send Email Hook secret>
AUTH_REDIRECT_TO=https://www.stldiving.com/practice-planner
```

Do not commit real secret values.

## Supabase Auth Hook

Auth hook URL:

```text
https://zolysphyrrhgeecbdghs.supabase.co/functions/v1/send-auth-email
```

Hook type:

```text
HTTPS
```

Use the generated hook secret as `SEND_EMAIL_HOOK_SECRET`.

## Auth URL Configuration

In Supabase, set:

```text
Site URL=https://www.stldiving.com
Redirect URLs=https://www.stldiving.com/practice-planner
```

## Deploy

Deploy function:

```bash
supabase functions deploy send-auth-email --no-verify-jwt
```
