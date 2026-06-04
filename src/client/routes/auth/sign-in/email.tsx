import type { JSX } from "solid-js";
import SignInForm from "../_components/sign-in-form.tsx";

export default function SignInEmailPage(): JSX.Element {
  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Sign in with email</h1>
      </div>
      <SignInForm />
    </div>
  );
}
