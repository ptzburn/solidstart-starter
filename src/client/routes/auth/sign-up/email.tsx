import type { JSX } from "solid-js";
import SignUpForm from "../_components/sign-up-form.tsx";

export default function SignUpEmailPage(): JSX.Element {
  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Sign up with email</h1>
      </div>
      <SignUpForm />
    </div>
  );
}
