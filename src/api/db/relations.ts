import { defineRelations } from "drizzle-orm";
import {
  accounts,
  passkeys,
  sessions,
  twoFactors,
  users,
} from "../db/schema/auth.ts";
import { tasks } from "./schema/task.ts";

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    twoFactors,
    passkeys,
    tasks,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      twoFactors: r.many.twoFactors({
        from: r.users.id,
        to: r.twoFactors.userId,
      }),
      passkeys: r.many.passkeys({
        from: r.users.id,
        to: r.passkeys.userId,
      }),
      tasks: r.many.tasks({
        from: r.users.id,
        to: r.tasks.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    twoFactors: {
      user: r.one.users({
        from: r.twoFactors.userId,
        to: r.users.id,
      }),
    },
    passkeys: {
      user: r.one.users({
        from: r.passkeys.userId,
        to: r.users.id,
      }),
    },
    tasks: {
      user: r.one.users({
        from: r.tasks.userId,
        to: r.users.id,
      }),
    },
  }),
);
