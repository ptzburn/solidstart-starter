import { useColorMode } from "@kobalte/core";
import { A, useSubmission } from "@solidjs/router";
import { signOut, stopImpersonating } from "~/client/actions/auth.ts";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu.tsx";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import { useSubmissionError } from "~/client/hooks/use-submission.ts";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import ChevronsUpDown from "~icons/lucide/chevrons-up-down";
import LogOut from "~icons/lucide/log-out";
import Moon from "~icons/lucide/moon";

import Sun from "~icons/lucide/sun";
import User from "~icons/lucide/user";
import { type JSX, Show } from "solid-js";

export function NavUser(): JSX.Element {
  const session = useSession();

  const { colorMode, setColorMode } = useColorMode();

  const stopSubmission = useSubmission(stopImpersonating);
  const signOutSubmission = useSubmission(signOut);

  useSubmissionError(stopSubmission, "Failed to stop impersonating");
  useSubmissionError(signOutSubmission, "Failed to sign out");

  const toggleTheme = () => {
    const next = colorMode() === "light" ? "dark" : "light";
    if (!document.startViewTransition) {
      setColorMode(next);
      return;
    }
    document.startViewTransition(() => setColorMode(next));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            as={SidebarMenuButton}
            size="lg"
            class="data-expanded:bg-sidebar-accent data-expanded:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-full">
              <AvatarImage
                src={getFileUrl(session.user.image)}
                alt={session.user.name}
              />
              <AvatarFallback class="rounded-lg">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{session.user.name}</span>
              <span class="truncate text-xs">{session.user.email}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent class="min-w-56 rounded-lg">
            <DropdownMenuItem
              as={A}
              href="/dashboard/account"
              class="hover:cursor-pointer"
            >
              <User class="size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              class="hover:cursor-pointer"
              onClick={toggleTheme}
            >
              <Show
                when={colorMode() === "dark"}
                fallback={<Moon class="size-4" />}
              >
                <Sun class="size-4" />
              </Show>
              Toggle Theme
            </DropdownMenuItem>
            <Show
              when={!session.session.impersonatedBy}
              fallback={
                <form method="post" action={stopImpersonating}>
                  <DropdownMenuItem
                    as="button"
                    type="submit"
                    class="w-full hover:cursor-pointer"
                  >
                    <LogOut class="size-4" />
                    Stop Impersonating
                  </DropdownMenuItem>
                </form>
              }
            >
              <form method="post" action={signOut}>
                <DropdownMenuItem
                  as="button"
                  type="submit"
                  class="w-full hover:cursor-pointer"
                >
                  <LogOut class="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </form>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
