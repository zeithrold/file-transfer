import { BaseClient, Issuer } from 'openid-client';

import { logWithDate } from './logging';

export const oidcIssuer = await Issuer.discover(
  process.env.ZEITHROLD_OIDC_ISSUER!,
);

export let oidcClient = new oidcIssuer.Client({
  client_id: process.env.ZEITHROLD_OIDC_CLIENT_ID!,
  client_secret: process.env.ZEITHROLD_OIDC_CLIENT_SECERT!,
  redirect_uris: [process.env.ZEITHROLD_ENDPOINT! + '/api/v1/auth/callback'],
  response_types: ['code'],
});
