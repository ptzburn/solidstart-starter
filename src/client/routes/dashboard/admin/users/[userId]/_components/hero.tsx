import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";

import { Card } from "~/client/components/ui/card.tsx";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import type { SelectUser } from "~/shared/types/auth.ts";
import type { Accessor, JSX } from "solid-js";

type HeroProps = {
  user: Accessor<SelectUser>;
};

export function Hero(props: HeroProps): JSX.Element {
  return (
    <div class="space-y-4">
      <Card class="p-4 md:p-6">
        <div class="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <Avatar class="size-16 sm:size-24">
            <AvatarImage
              src={getFileUrl(props.user().image)}
              alt={props.user().name}
            />
            <AvatarFallback class="text-xl sm:text-2xl">
              {getInitials(props.user().name)}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1 space-y-1">
            <h1 class="truncate font-bold text-xl sm:text-3xl">
              {props.user().name}
            </h1>
            <p class="truncate text-muted-foreground text-sm sm:text-lg">
              {props.user().email}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
