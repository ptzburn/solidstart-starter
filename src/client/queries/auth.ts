import { query, redirect } from "@solidjs/router";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";
import type { SelectUser } from "~/shared/types/auth.ts";

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
