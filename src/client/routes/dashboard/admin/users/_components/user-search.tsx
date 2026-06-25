import { A, useSearchParams } from "@solidjs/router";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button, buttonVariants } from "~/client/components/ui/button.tsx";
import { FieldGroup, FieldSet } from "~/client/components/ui/field.tsx";
import { SelectField } from "~/client/components/ui/form/select-field.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import Plus from "~icons/lucide/plus";
import Search from "~icons/lucide/search";
import { createMemo, createSignal, type JSX, Show } from "solid-js";

const FORM_ID = "user-search-form";

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
  const [open, setOpen] = createSignal(false);
  const [role, setRole] = createSignal(singleParam(params.role));
  const activeCount = createMemo(() => (singleParam(params.role) ? 1 : 0));

  return (
    <>
      <form
        id={FORM_ID}
        method="get"
        action="/dashboard/admin/users"
        class="space-y-4"
      >
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

        {/* Role lives in a separate dialog, so carry it via a hidden input. */}
        <input type="hidden" name="role" value={role()} />

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            class="w-full justify-center sm:w-auto"
            onClick={() => setOpen(true)}
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
      </form>

      <ResponsiveDialog
        open={open()}
        onOpenChange={setOpen}
        title="Filters all criteria"
        description="Select a role to filter users by."
        footer={
          <Button
            type="submit"
            form={FORM_ID}
            onClick={() => setOpen(false)}
          >
            <Search class="h-4 w-4" />
            Apply filters
          </Button>
        }
      >
        <FieldSet>
          <FieldGroup>
            <SelectField
              name="role"
              label="Role"
              options={getRoleOptions()}
              value={role()}
              onChange={setRole}
            />
          </FieldGroup>
        </FieldSet>
      </ResponsiveDialog>
    </>
  );
}
