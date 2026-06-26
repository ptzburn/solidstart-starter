// Better Auth stores `user.id` as a string, while the Drizzle `tasks.userId`
// column is an integer. Name that string→int seam once here instead of
// re-coercing `Number(context.user.id)` in every authed handler.
export function getUserId(context: { user: { id: string } }): number {
  return Number(context.user.id);
}
