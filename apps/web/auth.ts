import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

type ExtendedToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
};

const refreshAccessToken = async (token: ExtendedToken): Promise<ExtendedToken> => {
  try {
    const issuer = process.env.KEYCLOAK_ISSUER ?? "";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "";
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? "";
    if (!issuer || !token.refreshToken) {
      throw new Error("Missing issuer or refresh token");
    }

    const tokenUrl = `${issuer.replace(/\/$/, "")}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const refreshed = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };

    if (!response.ok || !refreshed.access_token) {
      throw new Error("Failed to refresh access token");
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in ?? 0) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer: process.env.KEYCLOAK_ISSUER ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + (account.expires_in ?? 0) * 1000;
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires,
        } as ExtendedToken;
      }

      const extendedToken = token as ExtendedToken;
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires - 5000) {
        return extendedToken;
      }

      return refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;
      session.accessToken = extendedToken.accessToken;
      session.error = extendedToken.error;
      return session;
    },
  },
};
