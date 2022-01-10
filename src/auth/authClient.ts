import { AuthenticationClient } from "auth0";

const authClient = new AuthenticationClient({
  domain: process.env.AUTH_DOMAIN,
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
});

export async function getUserInfo(accessToken: string) {
  return await authClient.getProfile(accessToken);
}
