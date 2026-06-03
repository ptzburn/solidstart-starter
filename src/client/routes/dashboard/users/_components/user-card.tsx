import { A } from "@solidjs/router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/client/components/ui/card.tsx";
import { authClient } from "~/client/lib/auth-client.ts";

import { getFileUrl, getInitials } from "~/client/lib/utils.ts";

import type { SelectUser } from "~/shared/types/auth.ts";
import Drama from "~icons/lucide/drama";
import LoaderCircle from "~icons/lucide/loader-circle";
import { format } from "date-fns";
import { createSignal, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";

const getRoleLabel = (role: SelectUser["role"]): string => {
  switch (role) {
    case "user":
      return "User";
    case "admin":
      return "Admin";
  }
};

type UserCardProps = {
  user: SelectUser;
};

export function UserCard(props: UserCardProps): JSX.Element {
  const [isImpersonating, setIsImpersonating] = createSignal(false);

  const handleImpersonate = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsImpersonating(true);

    await authClient.admin.impersonateUser({
      userId: props.user.id,
    }, {
      onError: (error) => {
        toast.error(error.error.message);
      },
      onSuccess: () => {
        globalThis.location.href = "/dashboard";
      },
    });

    setIsImpersonating(false);
  };

  return (
    <A href={`/dashboard/users/${props.user.id}`} class="relative">
      <div class="absolute -top-3 right-4 z-10">
        <Badge class="border border-border bg-card text-foreground">
          {getRoleLabel(props.user.role)}
        </Badge>
      </div>
      <Card class="flex h-full flex-col cursor-pointer transition-colors hover:bg-accent/50">
        <CardHeader class="flex flex-row items-center gap-4">
          <Avatar class="size-12 rounded-full">
            <AvatarImage
              src={getFileUrl(props.user.image) ?? ""}
              alt={props.user.name}
            />
            <AvatarFallback>{getInitials(props.user.name)}</AvatarFallback>
          </Avatar>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <h3 class="truncate font-semibold">{props.user.name}</h3>
            <p class="truncate text-muted-foreground text-sm">
              {props.user.email}
            </p>
          </div>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <div class="text-muted-foreground text-xs">
            <p>
              Joined {format(props.user.createdAt, "dd.MM.yyyy")}
            </p>
          </div>
        </CardContent>
        <CardFooter class="mt-auto">
          <Button
            onClick={handleImpersonate}
            disabled={isImpersonating() || (props.user.banned ?? false)}
            class="w-full"
            variant="outline"
          >
            <Drama class="mr-2 size-4" />
            <Switch>
              <Match when={isImpersonating()}>
                <LoaderCircle class="size-4 animate-spin" />
              </Match>
              <Match when={!isImpersonating()}>
                Impersonate user
              </Match>
            </Switch>
          </Button>
        </CardFooter>
      </Card>
    </A>
  );
}
