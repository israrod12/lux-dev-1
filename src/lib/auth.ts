import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        // Fetch user from the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Compare hashed passwords
        const isValidPassword = await compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        // Fetch the latest user data from the database
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
          },
        });

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
          };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export const auth = () => getServerSession(authOptions);
