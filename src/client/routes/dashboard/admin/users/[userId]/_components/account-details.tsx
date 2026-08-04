import type { SelectUser } from "~/api/types/auth.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import AdminIcon from "~icons/ri/admin-line";
import Calendar from "~icons/ri/calendar-line";
import FontSize from "~icons/ri/font-size";
import Mail from "~icons/ri/mail-line";
import User from "~icons/ri/user-line";

import { format } from "date-fns";

import { type JSX, Match, Switch } from "solid-js";
import type { Accessor } from "solid-js";
import { NameDialog } from "./name-dialog.tsx";
import { RoleDialog } from "./role-dialog.tsx";

type AccountDetailsProps = {
  user: Accessor<SelectUser>;
};

export function AccountDetails(props: AccountDetailsProps): JSX.Element {
  return (
    <div class="flex flex-col gap-2">
      <ItemGroup class="rounded-lg border bg-card py-4">
        <Item>
          <ItemMedia variant="icon">
            <FontSize />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="font-medium text-muted-foreground">
              Name
            </ItemTitle>
            <p class="wrap-break-word font-semibold text-base">
              {props.user().name}
            </p>
          </ItemContent>
          <ItemActions>
            <NameDialog user={props.user} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <Mail />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="font-medium text-muted-foreground">
              Email
            </ItemTitle>
            <p class="wrap-break-word font-semibold text-base">
              {props.user().email}
            </p>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <Switch>
              <Match when={props.user().role === "user"}>
                <User />
              </Match>
              <Match when={props.user().role === "admin"}>
                <AdminIcon />
              </Match>
            </Switch>
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="font-medium text-muted-foreground">
              Role
            </ItemTitle>
            <p class="font-semibold text-base capitalize">
              {props.user().role || "user"}
            </p>
          </ItemContent>
          <ItemActions>
            <RoleDialog user={props.user} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <Calendar />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="font-medium text-muted-foreground">
              Created
            </ItemTitle>
            <p class="wrap-break-word font-semibold text-base">
              {format(props.user().createdAt, "dd.MM.yyyy")}
            </p>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
