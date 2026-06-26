import type { JSX } from "solid-js";
import { AuthHeader } from "../_components/auth-header.tsx";
import SignUpForm from "../_components/sign-up-form.tsx";

export default function SignUpEmailPage(): JSX.Element {
  return (
    <div class="space-y-8">
      <AuthHeader title="Sign up with email" />
      <SignUpForm />
    </div>
  );
}
