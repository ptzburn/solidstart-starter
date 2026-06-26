import { HEADING_STYLE, PARAGRAPH_STYLE } from "~/api/emails/utils/styles.ts";

// React Email pads the hidden preview text with invisible characters up to a
// fixed length so inbox previews don't leak following content. The count is
// `PREVIEW_MAX_LENGTH - previewText.length` repetitions of a single unit.
const PREVIEW_MAX_LENGTH = 150;
const PREVIEW_SPACER_UNIT = "\u00a0\u200c\u200b\u200d\u200e\u200f\ufeff";

export function emailPreviewText(text: string): string {
  const spacer = PREVIEW_SPACER_UNIT.repeat(PREVIEW_MAX_LENGTH - text.length);
  return `    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
      data-skip-in-text="true">
      ${text}
      <div>
        ${spacer}
      </div>
    </div>`;
}

export function emailHeading(content: string, style?: string): string {
  return `                                    <h1
                                      style="${style ?? HEADING_STYLE}">
                                      ${content}
                                    </h1>`;
}

export function emailParagraph(content: string, style?: string): string {
  return `                                    <p
                                      style="${style ?? PARAGRAPH_STYLE}">
                                      ${content}
                                    </p>`;
}

export function emailButton(
  { url, text, color }: { url: string; text: string; color?: string },
): string {
  const backgroundColor = color ?? "#000000";
  const style =
    `line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;margin:0;padding:14px;background-color:${backgroundColor};color:#ffffff;border-radius:4px;padding-top:7px;padding-right:12px;padding-bottom:7px;padding-left:12px;font-size:20px`;
  const label = text.length <= 12 ? `><span>${text}</span></span` : `><span
                                                  >${text}</span
                                                ></span`;
  return `                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td
                                            align="center"
                                            data-id="__react-email-column">
                                            <a
                                              class="button"
                                              href="${url}"
                                              style="${style}"
                                              target="_blank"
                                              ><span
                                                ><!--[if mso]><i style="mso-font-width:300%;mso-text-raise:10.5" hidden>&#8202;&#8202;</i><![endif]--></span
                                              ><span
                                                style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:5.25px"
                                                ${label}
                                              ><span
                                                ><!--[if mso]><i style="mso-font-width:300%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span
                                              ></a
                                            >
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>`;
}

export function emailFooter(warning: string): string {
  return `                                    <p
                                      style="margin:0;padding:0;font-size:11px;padding-top:0.5em;padding-bottom:0.5em">
                                      <span
                                        >${warning}</span
                                      ><span
                                        ><a
                                          href="https://tasks.hokkanen.io"
                                          rel="noopener noreferrer nofollow"
                                          style="color:#0670DB;text-decoration-line:none;text-decoration:underline"
                                          target="_blank"
                                          >https://tasks.hokkanen.io</a
                                        ></span
                                      ><span>) before taking action.</span>
                                    </p>`;
}
