import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { Polymorphic } from "@kobalte/core/polymorphic";

import { cn } from "~/client/lib/utils.ts";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";

import { splitProps } from "solid-js";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1:
        "scroll-m-20 font-heading text-4xl font-extrabold tracking-tight text-balance",
      h2:
        "scroll-m-20 font-heading text-xl tracking-wide font-medium md:text-2xl",
      h3:
        "scroll-m-20 font-heading text-lg tracking-wide font-medium md:text-xl",
      h4: "scroll-m-20 font-heading text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

const variantElement: Record<TypographyVariant, ValidComponent> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  list: "ul",
  inlineCode: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
};

type TypographyProps<T extends ValidComponent = "p"> =
  & VariantProps<typeof typographyVariants>
  & { class?: string | undefined };

const Typography = <T extends ValidComponent = "p">(
  props: PolymorphicProps<T, TypographyProps<T>>,
) => {
  const [local, others] = splitProps(props as TypographyProps, [
    "class",
    "variant",
  ]);
  const variant = local.variant ?? "p";
  return (
    <Polymorphic
      as={variantElement[variant]}
      data-slot="typography"
      data-variant={variant}
      class={cn(typographyVariants({ variant: local.variant }), local.class)}
      {...others}
    />
  );
};

export type { TypographyProps };
export { Typography, typographyVariants };
