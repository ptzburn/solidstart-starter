import { cn } from "~/client/lib/utils.ts";
import {
  type ComponentProps,
  createContext,
  createUniqueId,
  type JSX,
  type ParentProps,
  splitProps,
  useContext,
  type ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";

type DropdownMenuContextValue = { id: string };
const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(
  undefined,
);

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error("DropdownMenu part must be used inside <DropdownMenu>");
  }
  return ctx;
}

type DropdownMenuProps = { id?: string; children: JSX.Element };

function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  const id = props.id ?? createUniqueId();
  return (
    <DropdownMenuContext.Provider value={{ id }}>
      {props.children}
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps =
  & { as?: ValidComponent; for?: string }
  & Record<string, unknown>;

function DropdownMenuTrigger(props: DropdownMenuTriggerProps): JSX.Element {
  const ctx = useDropdownMenuContext();
  const [local, rest] = splitProps(props, ["as", "for"]);
  return (
    <Dynamic
      component={local.as ?? "button"}
      type={local.as === undefined ? "button" : undefined}
      popovertarget={local.for ?? ctx.id}
      {...(rest as ComponentProps<"button">)}
    />
  );
}

function DropdownMenuContent(props: ComponentProps<"div">): JSX.Element {
  const ctx = useDropdownMenuContext();
  const [local, rest] = splitProps(props, ["class"]);
  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    if ((event.target as HTMLElement).closest("a, button")) {
      event.currentTarget.hidePopover();
    }
  };
  return (
    <div
      id={ctx.id}
      popover="auto"
      onClick={handleClick}
      class={cn(
        "dropdown-menu-popover z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        local.class,
      )}
      {...rest}
    />
  );
}

type DropdownMenuItemProps<T extends ValidComponent = "button"> =
  & { as?: T; class?: string }
  & ComponentProps<T>;

function DropdownMenuItem<T extends ValidComponent = "button">(
  props: DropdownMenuItemProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as DropdownMenuItemProps, [
    "as",
    "class",
  ]);
  return (
    <Dynamic
      component={local.as ?? "button"}
      type={local.as === undefined ? "button" : undefined}
      class={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}

function DropdownMenuShortcut(props: ComponentProps<"span">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      class={cn("ml-auto text-xs tracking-widest opacity-60", local.class)}
      {...rest}
    />
  );
}

function DropdownMenuLabel(
  props: ComponentProps<"div"> & { inset?: boolean },
): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "inset"]);
  return (
    <div
      class={cn(
        "px-2 py-1.5 font-semibold text-sm",
        local.inset && "pl-8",
        local.class,
      )}
      {...rest}
    />
  );
}

function DropdownMenuGroupLabel(props: ComponentProps<"div">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("px-2 py-1.5 font-semibold text-sm", local.class)}
      {...rest}
    />
  );
}

function DropdownMenuSeparator(props: ComponentProps<"hr">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <hr
      class={cn("-mx-1 my-1 h-px border-0 bg-muted", local.class)}
      {...rest}
    />
  );
}

function DropdownMenuGroup(props: ComponentProps<"div">): JSX.Element {
  return <div role="group" {...props} />;
}

function DropdownMenuPortal(props: ParentProps): JSX.Element {
  return <>{props.children}</>;
}

const checkmark = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4"
  >
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

const radioDot = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-2 fill-current"
  >
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
  </svg>
);

const choiceItemClass =
  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50";

type DropdownMenuCheckboxItemProps =
  & Omit<ComponentProps<"input">, "type">
  & { class?: string; children?: JSX.Element };

function DropdownMenuCheckboxItem(
  props: DropdownMenuCheckboxItemProps,
): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <label class={cn(choiceItemClass, local.class)}>
      <input type="checkbox" class="peer sr-only" {...rest} />
      <span class="absolute left-2 flex size-3.5 items-center justify-center opacity-0 peer-checked:opacity-100">
        {checkmark}
      </span>
      {local.children}
    </label>
  );
}

type DropdownMenuRadioGroupContextValue = { name: string };
const DropdownMenuRadioGroupContext = createContext<
  DropdownMenuRadioGroupContextValue | undefined
>(undefined);

function DropdownMenuRadioGroup(
  props: ComponentProps<"div"> & { name?: string },
): JSX.Element {
  const name = props.name ?? createUniqueId();
  const [local, rest] = splitProps(props, ["name", "class"]);
  return (
    <DropdownMenuRadioGroupContext.Provider value={{ name }}>
      <div role="group" class={local.class} {...rest} />
    </DropdownMenuRadioGroupContext.Provider>
  );
}

type DropdownMenuRadioItemProps =
  & Omit<ComponentProps<"input">, "type">
  & { class?: string; children?: JSX.Element };

function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps): JSX.Element {
  const group = useContext(DropdownMenuRadioGroupContext);
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <label class={cn(choiceItemClass, local.class)}>
      <input type="radio" name={group?.name} class="peer sr-only" {...rest} />
      <span class="absolute left-2 flex size-3.5 items-center justify-center opacity-0 peer-checked:opacity-100">
        {radioDot}
      </span>
      {local.children}
    </label>
  );
}

type DropdownMenuSubContextValue = { id: string };
const DropdownMenuSubContext = createContext<
  DropdownMenuSubContextValue | undefined
>(undefined);

function useDropdownMenuSubContext(): DropdownMenuSubContextValue {
  const ctx = useContext(DropdownMenuSubContext);
  if (!ctx) {
    throw new Error(
      "DropdownMenuSub part must be used inside <DropdownMenuSub>",
    );
  }
  return ctx;
}

function DropdownMenuSub(
  props: { id?: string; children: JSX.Element },
): JSX.Element {
  const id = props.id ?? createUniqueId();
  return (
    <DropdownMenuSubContext.Provider value={{ id }}>
      {props.children}
    </DropdownMenuSubContext.Provider>
  );
}

function DropdownMenuSubTrigger(
  props: ComponentProps<"button"> & { class?: string; children?: JSX.Element },
): JSX.Element {
  const ctx = useDropdownMenuSubContext();
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <button
      type="button"
      popovertarget={ctx.id}
      class={cn(
        "flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-auto size-4"
      >
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </button>
  );
}

function DropdownMenuSubContent(props: ComponentProps<"div">): JSX.Element {
  const ctx = useDropdownMenuSubContext();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      id={ctx.id}
      popover="auto"
      class={cn(
        "dropdown-menu-popover dropdown-menu-subcontent z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        local.class,
      )}
      {...rest}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
