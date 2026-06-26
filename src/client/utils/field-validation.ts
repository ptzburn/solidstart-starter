// For "new value must differ from the current one" checks (changing email or
// phone): returns an action-style fieldErrors result when the submitted value
// already matches what the user has, or undefined to continue.
export function validateNotCurrentValue(
  field: string,
  newValue: string,
  currentValue: string | null | undefined,
  message: string,
): { fieldErrors: Record<string, string> } | undefined {
  if (newValue === currentValue) {
    return { fieldErrors: { [field]: message } };
  }
  return undefined;
}
