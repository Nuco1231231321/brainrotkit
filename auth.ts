import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { upsertGoogleUser } from "@/lib/accounts";

type AuthEnvironment = CloudflareEnv & {
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

function requireAuthEnvironmentVariable(
  environment: AuthEnvironment,
  name: "AUTH_SECRET" | "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET",
) {
  const value = environment[name];
  if (!value) throw new Error(`Missing required authentication environment variable: ${name}`);
  return value;
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const authEnvironment = env as AuthEnvironment;

  return {
    trustHost: true,
    secret: requireAuthEnvironmentVariable(authEnvironment, "AUTH_SECRET"),
    pages: {
      signIn: "/login",
      error: "/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
      Google({
        clientId: requireAuthEnvironmentVariable(authEnvironment, "GOOGLE_CLIENT_ID"),
        clientSecret: requireAuthEnvironmentVariable(authEnvironment, "GOOGLE_CLIENT_SECRET"),
        authorization: {
          params: {
            prompt: "select_account",
            access_type: "online",
            response_type: "code",
          },
        },
      }),
    ],
    callbacks: {
      async signIn({ account, profile, user }) {
        if (account?.provider !== "google" || !account.providerAccountId || !user.email) {
          return false;
        }

        if (profile && "email_verified" in profile && profile.email_verified === false) {
          return false;
        }

        user.id = account.providerAccountId;
        await upsertGoogleUser({
          id: account.providerAccountId,
          email: user.email,
          name: user.name,
          image: user.image,
        });
        return true;
      },
      async jwt({ account, token, user }) {
        if (account?.provider === "google" && account.providerAccountId) {
          token.userId = account.providerAccountId;
        } else if (user?.id) {
          token.userId = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        return session;
      },
    },
  };
});
