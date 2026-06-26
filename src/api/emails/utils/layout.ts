import { emailPreviewText } from "~/api/emails/utils/components.ts";
import {
  FONT_FAMILY,
  HEAD,
  PARAGRAPH_STYLE,
} from "~/api/emails/utils/styles.ts";

// Owns the email-client-compatible skeleton shared by every template: the
// `<head>`, hidden preview text, the nested outer/inner table wrappers and the
// closing markup. Each template only supplies its `body` (the inner cell
// content) and the `previewText`.
export function emailLayout(
  { previewText, body }: { previewText: string; body: string },
): string {
  return `${HEAD}
  <body>
    <!--$--><!--html--><!--head-->
${emailPreviewText(previewText)}
    <!--body-->
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="font-family:${FONT_FAMILY};font-size:1.0769230769230769em;min-height:100%;line-height:155%">
              <tbody>
                <tr>
                  <td>
                    <table
                      align="left"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="align:left;width:100%;padding-left:0px;padding-right:0px;line-height:155%;max-width:600px;font-family:${FONT_FAMILY}">
                      <tbody>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="padding:32px;box-sizing:border-box;border-radius:8px;border-width:1px">
                              <tbody>
                                <tr>
                                  <td>

${body}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p
                              style="${PARAGRAPH_STYLE}">
                              <br />
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>
`;
}
