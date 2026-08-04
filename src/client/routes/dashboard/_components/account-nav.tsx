import { A, useLocation } from "@solidjs/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/client/components/ui/sidebar.tsx";
import Database from "~icons/ri/database-2-line";
import Globe from "~icons/ri/global-line";
import Shield from "~icons/ri/shield-line";
import User from "~icons/ri/user-line";
import { For, type JSX } from "solid-js";

const NAV_ITEMS = [
  {
    label: "Account",
    icon: User,
    href: "/dashboard/account",
  },
  {
    label: "Data",
    icon: Database,
    href: "/dashboard/account/data",
  },
  {
    label: "Security",
    icon: Shield,
    href: "/dashboard/account/security",
  },
  {
    label: "Sessions",
    icon: Globe,
    href: "/dashboard/account/sessions",
  },
];

export function AccountNav(): JSX.Element {
  const location = useLocation();

  const isActive = (href: string) => {
    const normalizedPath = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;
    return normalizedPath === href;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Account Settings</SidebarGroupLabel>
      <SidebarMenu>
        <For
          each={NAV_ITEMS}
        >
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton
                as={A}
                href={item.href}
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </For>
      </SidebarMenu>
    </SidebarGroup>
  );
}
