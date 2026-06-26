import { A, useSubmission } from "@solidjs/router";
import type { SelectUser } from "~/api/types/auth.ts";
import { impersonateUser } from "~/client/actions/auth.ts";
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
import { Typography } from "~/client/components/ui/typography.tsx";
import { useSubmissionError } from "~/client/hooks/use-submission.ts";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import Drama from "~icons/lucide/drama";
import LoaderCircle from "~icons/lucide/loader-circle";
import { format } from "date-fns";
import { type JSX, Match, Switch } from "solid-js";

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
  const submission = useSubmission(
    impersonateUser,
    ([formData]) => formData.get("userId") === props.user.id,
  );

  useSubmissionError(submission, "Failed to impersonate user");

  return (
    <Card class="gap-0 pt-0">
      <A
        href={`/dashboard/admin/users/${props.user.id}`}
        class="flex flex-col gap-6 py-4 transition-colors hover:bg-accent/50"
      >
        <CardHeader class="flex flex-row items-center gap-4">
          <Avatar class="size-12 rounded-full">
            <AvatarImage
              src={getFileUrl(props.user.image) ?? ""}
              alt={props.user.name}
            />
            <AvatarFallback>{getInitials(props.user.name)}</AvatarFallback>
          </Avatar>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <Typography variant="h3" class="truncate">
              {props.user.name}
            </Typography>
            <Typography variant="muted" class="truncate">
              {props.user.email}
            </Typography>
          </div>
          <Badge class="border border-border bg-card text-foreground">
            {getRoleLabel(props.user.role)}
          </Badge>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <div class="text-muted-foreground text-xs">
            <p>
              Joined {format(props.user.createdAt, "dd.MM.yyyy")}
            </p>
          </div>
        </CardContent>
      </A>
      <CardFooter class="mt-auto">
        <form method="post" action={impersonateUser} class="w-full">
          <input type="hidden" name="userId" value={props.user.id} />
          <Button
            type="submit"
            disabled={submission.pending || (props.user.banned ?? false)}
            class="w-full"
            variant="outline"
          >
            <Drama class="mr-2 size-4" />
            <Switch>
              <Match when={submission.pending}>
                <LoaderCircle class="size-4 animate-spin" />
              </Match>
              <Match when={!submission.pending}>
                Impersonate user
              </Match>
            </Switch>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
