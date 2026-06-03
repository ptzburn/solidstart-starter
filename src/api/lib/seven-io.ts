import { Client, SmsResource, type SmsResponse } from "@seven.io/client";
import env from "~/env.ts";

export const client = new Client({
  apiKey: env.SEVEN_IO_API_KEY,
});

const sms = new SmsResource(client);

export function sendSms(to: string, text: string): Promise<SmsResponse> {
  return sms.dispatch({ to: [to], text, from: "Solid Starter Template" });
}
