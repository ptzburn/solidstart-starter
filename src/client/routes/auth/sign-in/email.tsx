import type { JSX } from "solid-js";
import { AuthHeader } from "../_components/auth-header.tsx";
import SignInForm from "../_components/sign-in-form.tsx";

export default function SignInEmailPage(): JSX.Element {
  return (
    <div class="space-y-8">
      <AuthHeader title="Sign in with email" />
      <SignInForm />
    </div>
  );
}
