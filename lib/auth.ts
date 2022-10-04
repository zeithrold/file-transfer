import { BaseClient, Issuer,  } from "openid-client";

export let oidcIssuer: Issuer<BaseClient>
export let oidcClient: BaseClient
export let isInitialized = false

export async function init() {
  oidcIssuer = await Issuer.discover(process.env.ZEITHROLD_OIDC_ISSUER!)
  oidcClient = new oidcIssuer.Client({
    client_id: process.env.ZEITHROLD_OIDC_CLIENT_ID!,
    client_secret: process.env.ZEITHROLD_OIDC_CLIENT_SECRET!,
    redirect_uris: [process.env.ZEITHROLD_ENDPOINT! + '/api/v1/auth/callback'],
    response_types: ['code'],
  })
  isInitialized = true
}
