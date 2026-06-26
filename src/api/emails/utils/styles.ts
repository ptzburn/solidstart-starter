// Shared, byte-exact style strings and static markup fragments reused across
// every email template. Extracting these keeps the templates free of the
// duplicated, email-client-compatible boilerplate.

export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif";

export const HEADING_STYLE =
  "margin:0;padding:0;font-size:2.25em;line-height:1.44em;padding-top:0.389em;font-weight:600";

export const PARAGRAPH_STYLE =
  "margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em";

export const HEAD =
  `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link
      rel="preload"
      as="image"
      href="https://resend-attachments.s3.amazonaws.com/ddad37ce-08d4-4a86-af5f-a6b1ca4dc2de" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      content="telephone=no,address=no,email=no,date=no,url=no"
      name="format-detection" />
  </head>`;

export const DIVIDER = `                                    <hr
                                      class="divider"
                                      style="width:100%;border:none;border-top:1px solid #eaeaea;padding-bottom:1em;border-width:2px" />`;
