import { Link, Meta, Title } from "@solidjs/meta";
import { type JSX, Show } from "solid-js";

// Per-page SEO tags. Site-wide constants (og:type, og:site_name, twitter:card)
// live once in app.tsx; this component only emits what varies per route.
//
// Note on @solidjs/meta cascading: a <Title> always overrides earlier ones, but
// <Meta> tags are de-duplicated by name *and content*, so only emit a given
// `name`/`property` from one place — set descriptions/OG here, never a global
// default that pages override (you'd get duplicate tags in the document head).

export const SITE_NAME = "SolidStart Starter";
const SITE_URL = import.meta.env.VITE_HOST_URL;

type SeoProps = {
  /** Page title. Unless `bareTitle`, " | SolidStart Starter" is appended. */
  title: string;
  description: string;
  /** Route path used to build the canonical / og:url, e.g. "/". Defaults to "/". */
  path?: string;
  /** Absolute-from-root image path for social previews, e.g. "/og.png". */
  image?: string;
  /** Use `title` verbatim instead of appending the site name. */
  bareTitle?: boolean;
};

export function Seo(props: SeoProps): JSX.Element {
  const title = (): string =>
    props.bareTitle ? props.title : `${props.title} | ${SITE_NAME}`;
  const url = (): string => new URL(props.path ?? "/", SITE_URL).href;
  const image = (): string | undefined =>
    props.image ? new URL(props.image, SITE_URL).href : undefined;

  return (
    <>
      <Title>{title()}</Title>
      <Meta name="description" content={props.description} />
      <Link rel="canonical" href={url()} />

      <Meta property="og:title" content={title()} />
      <Meta property="og:description" content={props.description} />
      <Meta property="og:url" content={url()} />

      <Meta name="twitter:title" content={title()} />
      <Meta name="twitter:description" content={props.description} />

      <Show when={image()}>
        {(src) => (
          <>
            <Meta property="og:image" content={src()} />
            <Meta name="twitter:image" content={src()} />
          </>
        )}
      </Show>
    </>
  );
}
