import { Button } from "~/client/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import type { SelectUser } from "~/shared/types/auth.ts";
import ALargeSmall from "~icons/lucide/a-large-small";
import Calendar from "~icons/lucide/calendar";
import Mail from "~icons/lucide/mail";
import User from "~icons/lucide/user";
import UserKey from "~icons/lucide/user-key";

import { format } from "date-fns";

import { createSignal, type JSX, Match, Switch } from "solid-js";
import type { Accessor } from "solid-js";
import { NameDialog } from "./name-dialog.tsx";
import { RoleDialog } from "./role-dialog.tsx";

type AccountDetailsProps = {
  user: Accessor<SelectUser>;
};

export function AccountDetails(props: AccountDetailsProps): JSX.Element {
  const [roleDialogOpen, setRoleDialogOpen] = createSignal(false);
  const [nameDialogOpen, setNameDialogOpen] = createSignal(false);

  return (
    <div class="flex flex-col gap-2">
      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemMedia variant="icon">
            <ALargeSmall />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNameDialogOpen(true)}
            >
              Change
            </Button>
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
                <UserKey />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleDialogOpen(true)}
            >
              Change
            </Button>
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

      <RoleDialog
        user={props.user}
        isOpen={roleDialogOpen}
        setIsOpen={setRoleDialogOpen}
      />
      <NameDialog
        user={props.user}
        isOpen={nameDialogOpen}
        setIsOpen={setNameDialogOpen}
      />
    </div>
  );
}
