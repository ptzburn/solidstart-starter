import { capitalize } from "~/client/lib/utils.ts";

// Join a first/last name into the single capitalized display name the auth layer
// stores. Used by the sign-up and name-edit actions.
export function composeName(firstName: string, lastName: string): string {
  return `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
}

// Inverse of composeName: split a stored display name back into first/last for
// pre-filling the name-edit dialogs. Everything after the first whitespace run
// is treated as the last name.
export function splitName(
  fullName: string,
): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
}
