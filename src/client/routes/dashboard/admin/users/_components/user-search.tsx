import { A, useSearchParams } from "@solidjs/router";
import { Button, buttonVariants } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { FieldGroup, FieldSet } from "~/client/components/ui/field.tsx";
import { SelectField } from "~/client/components/ui/form/select-field.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import Plus from "~icons/lucide/plus";
import Search from "~icons/lucide/search";
import { createMemo, type JSX, Show } from "solid-js";

const DIALOG_ID = "user-search-filters-dialog";

const getRoleOptions = (): { value: string; label: string }[] => [
  { value: "", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "Client" },
];

function singleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function UserSearch(): JSX.Element {
  const [params] = useSearchParams();
  const activeCount = createMemo(() => (singleParam(params.role) ? 1 : 0));

  return (
    <form method="get" action="/dashboard/admin/users" class="space-y-4">
      <FieldSet class="grid grid-cols-2">
        <FieldGroup>
          <TextField
            name="name"
            label="Name"
            placeholder="Name"
            value={singleParam(params.name)}
          />
        </FieldGroup>

        <FieldGroup>
          <TextField
            name="email"
            label="Email"
            placeholder="Email"
            value={singleParam(params.email)}
          />
        </FieldGroup>
      </FieldSet>

      <Separator />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          class="w-full justify-center sm:w-auto"
          type="button"
          command="show-modal"
          commandfor={DIALOG_ID}
        >
          <Plus class="h-4 w-4" />
          Filters all criteria
          <Show when={activeCount() > 0}>
            <span class="ml-2 bg-primary px-2 py-0.5 text-primary-foreground text-xs">
              {activeCount()}
            </span>
          </Show>
        </Button>
        <div class="flex items-center gap-2">
          <A
            href="/dashboard/admin/users"
            class={buttonVariants({ variant: "outline" }) +
              " flex-1 sm:w-24 sm:flex-none"}
          >
            Clear
          </A>
          <Button
            type="submit"
            variant="default"
            class="flex-1 sm:w-32 sm:flex-none"
          >
            <Search />
            Search
          </Button>
        </div>
      </div>

      <ResponsiveDialog
        id={DIALOG_ID}
        title="Filters all criteria"
        description="Select a role to filter users by."
      >
        <div class="space-y-6 pb-4">
          <FieldSet>
            <FieldGroup>
              <SelectField
                name="role"
                label="Role"
                options={getRoleOptions()}
                value={singleParam(params.role)}
              />
            </FieldGroup>
          </FieldSet>

          <Separator />

          <div class="flex items-center justify-end gap-2">
            <Button type="submit">
              <Search class="h-4 w-4" />
              Apply filters
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </form>
  );
}
