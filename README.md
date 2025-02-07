# Authentik AdonisJS Ally Driver

## Getting started

```typescript
node ace add @jvvan/adonis-ally-authentik
```

Add the following to your `config/ally.ts` file:

```typescript
import env from "#start/env";
import { defineConfig } from "@adonisjs/ally";
import { authentik } from "@jvvan/adonis-ally-authentik";

const allyConfig = defineConfig({
  authentik: authentik({
    clientId: env.get("AUTHENTIK_CLIENT_ID"),
    clientSecret: env.get("AUTHENTIK_CLIENT_SECRET"),
    callbackUrl: env.get("AUTHENTIK_CALLBACK_URL"),
    authorizeUrl: env.get("AUTHENTIK_AUTHORIZE_URL"),
    accessTokenUrl: env.get("AUTHENTIK_ACCESSTOKEN_URL"),
    userInfoUrl: env.get("AUTHENTIK_USERINFO_URL"),
    scopes: ["email", "openid", "profile"],
  }),
});

export default allyConfig;

declare module "@adonisjs/ally/types" {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
```

## Refresh tokens

In newer versions of authentik, you need to include `offline_access` in the scopes to get a refresh token.

## Avatars

By default, authentik doesn't provide avatars. You'll need to make a property mapping for `avatar` if you want to use avatars from authentik.
