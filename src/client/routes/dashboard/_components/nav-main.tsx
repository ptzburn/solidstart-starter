import { A, useLocation } from "@solidjs/router";
import { Collapsible } from "~/client/components/ui/collapsible.tsx";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";

import { useSession } from "~/client/contexts/session-context.tsx";

import House from "~icons/lucide/house";
import UsersIcon from "~icons/lucide/users";
import { For, type JSX, Show } from "solid-js";

const items = (
  pathname: string,
) => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
    isActive: pathname === "/dashboard",
  },
];

export function NavMain(): JSX.Element {
  const location = useLocation();
  const session = useSession();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <For each={items(location.pathname)}>
          {(item) => (
            <Collapsible>
              <A href={item.url}>
                <SidebarMenuItem
                  class={item.url === location.pathname
                    ? "bg-accent rounded"
                    : ""}
                >
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </A>
            </Collapsible>
          )}
        </For>
        <Show when={session.user.role === "admin"}>
          <Collapsible>
            <A href="/dashboard/users">
              <SidebarMenuItem
                class={"/dashboard/users" === location.pathname
                  ? "bg-accent rounded"
                  : ""}
              >
                <SidebarMenuButton tooltip="Users">
                  <UsersIcon />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </A>
          </Collapsible>
        </Show>
      </SidebarMenu>
    </SidebarGroup>
  );
}
