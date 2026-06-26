import { query, redirect } from "@solidjs/router";
import { parseCookies } from "@solidjs/start/http";
import { auth, COOKIE_PREFIX } from "~/api/lib/auth.ts";
import { getServerHeaders } from "~/api/lib/server-headers.ts";
import type { SelectUser } from "~/api/types/auth.ts";
import { usePendingForgotPasswordSession } from "~/client/lib/pending-forgot-password-session.ts";
import { usePendingResetPasswordSession } from "~/client/lib/pending-reset-password-session.ts";
import { usePendingSigninSession } from "~/client/lib/pending-signin-session.ts";

export const getSessionQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    throw redirect("/auth/sign-in");
  }

  return session;
}, "session");

export const requireAdminQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    throw redirect("/dashboard");
  }

  return true;
}, "require-admin");

export const getPendingSigninEmailQuery = query(async () => {
  "use server";
  const session = await usePendingSigninSession();
  if (!session.data.email) throw redirect("/auth/sign-in");
  return session.data.email;
}, "pending-signin-email");

export const getPasswordResetSentEmailQuery = query(async () => {
  "use server";
  const session = await usePendingForgotPasswordSession();
  const email = session.data.email;
  if (!email) throw redirect("/auth/sign-in");
  await session.clear();
  return email;
}, "password-reset-sent-email");

export const requirePasswordResetCompletedQuery = query(async () => {
  "use server";
  const session = await usePendingResetPasswordSession();
  if (!session.data.completed) throw redirect("/auth/sign-in");
  await session.clear();
  return true;
}, "password-reset-completed");

// deno-lint-ignore require-await
export const getLastLoginMethodQuery = query(async () => {
  "use server";
  const cookies = parseCookies();
  const entry = Object.entries(cookies).find(([name]) =>
    name.endsWith(`${COOKIE_PREFIX}.last_login_method`)
  );
  return entry?.[1] ?? null;
}, "last-login-method");

// deno-lint-ignore require-await
export const requireTwoFactorPendingQuery = query(async () => {
  "use server";
  // Better Auth sets a `${cookiePrefix}.two_factor` cookie during `signInEmail`
  // when 2FA is required. Prefixed with `__Secure-` over HTTPS. Suffix match
  // handles both dev and prod without re-deriving the prefix logic. Function
  // must stay `async` so the synchronous throw becomes a rejected promise that
  // `query()` can intercept and turn into a router redirect.
  const cookies = parseCookies();
  const hasTwoFactorCookie = Object.keys(cookies).some((name) =>
    name.endsWith(`${COOKIE_PREFIX}.two_factor`)
  );
  if (!hasTwoFactorCookie) throw redirect("/auth/sign-in");
  return true;
}, "two-factor-pending");

export const listSessionsQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  return await auth.api.listSessions({ headers });
}, "sessions");

export const listAccountsQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const accounts = await auth.api.listUserAccounts({ headers });
  return accounts;
}, "accounts");

export const listPasskeysQuery = query(async () => {
  "use server";
  const headers = getServerHeaders();
  const passkeys = await auth.api.listPasskeys({ headers });
  return passkeys;
}, "passkeys");

export const viewNumberOfBackupCodesQuery = query(async (userId: number) => {
  "use server";
  const headers = getServerHeaders();
  const { status, backupCodes } = await auth.api.viewBackupCodes({
    body: { userId },
    headers,
  });
  if (status && backupCodes) {
    return backupCodes.length;
  }
  return 0;
}, "number-of-backup-codes");

export const USERS_PAGE_SIZE = 12;

export const listUsersQuery = query(
  async (page: number, name?: string, email?: string, role?: string) => {
    "use server";
    const headers = getServerHeaders();
    const offset = (page - 1) * USERS_PAGE_SIZE;

    const useRoleFilter = !!role;
    const useEmailFilter = !!email && !useRoleFilter;

    const result = await auth.api.listUsers({
      query: {
        searchValue: name || undefined,
        searchField: name ? "name" : undefined,
        searchOperator: name ? "contains" : undefined,
        filterField: useRoleFilter
          ? "role"
          : useEmailFilter
          ? "email"
          : undefined,
        filterValue: useRoleFilter ? role : useEmailFilter ? email : undefined,
        filterOperator: useRoleFilter
          ? "eq"
          : useEmailFilter
          ? "contains"
          : undefined,
        limit: USERS_PAGE_SIZE,
        offset,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers,
    });
    return {
      users: result.users as SelectUser[],
      total: result.total as number,
    };
  },
  "users",
);
