import { ReactNode } from "react";
import { BoltIcon, UserIcon } from "../../icons";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessageProps {
  role: ChatMessageRole;
  text: string;
  /** True while the message is being streamed in (shows a blinking caret at the end). */
  streaming?: boolean;
  /** Optional data-testid for BDD / Playwright locators. */
  "data-testid"?: string;
  className?: string;
}

/**
 * ChatMessage — a single message bubble in a chat conversation.
 *
 * The bubble layout is the standard pattern (left-aligned assistant + AI avatar,
 * right-aligned user + user avatar). Text is rendered with simple line breaks +
 * fenced code-block detection (``` ... ```) for the v1 "basic" surface; a v2
 * can swap in react-markdown or marked without reshaping this component.
 *
 * Following the kit's "forward the full prop set" pattern, data-testid reaches
 * the real DOM node so the bdd-kit's UI steps + Playwright locators work.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  text,
  streaming = false,
  className = "",
  ...rest
}) => {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  // Split the text by fenced code blocks (``` ... ```) so we can style them.
  // The simple regex handles single-fence triple-backtick blocks; a real
  // markdown renderer (v2) replaces this.
  const parts: Array<{ kind: "text" | "code"; value: string; lang?: string }> =
    [];
  const codeBlockRe = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ kind: "code", value: match[2], lang: match[1] || undefined });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ kind: "text", value: text.slice(lastIndex) });
  }
  if (parts.length === 0) {
    parts.push({ kind: "text", value: text });
  }

  const Avatar = isUser ? UserIcon : BoltIcon;
  const avatarBg = isUser
    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
    : "bg-brand-500 text-white";
  const bubbleBg = isUser
    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
    : "bg-white text-gray-800 border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 dark:text-white/90";

  return (
    <div
      data-testid={rest["data-testid"]}
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} ${className}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${avatarBg}`}
        aria-hidden="true"
      >
        <Avatar className="h-5 w-5" />
      </div>
      <div
        className={`flex max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isUser ? "You" : isAssistant ? "Assistant" : "System"}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${bubbleBg}`}
        >
          {parts.map((p, i) =>
            p.kind === "code" ? (
              <pre
                key={i}
                className="my-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100"
              >
                <code>{p.value}</code>
              </pre>
            ) : (
              <span key={i} className="whitespace-pre-wrap">
                {p.value}
              </span>
            )
          )}
          {streaming && (
            <span
              className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-gray-500 dark:bg-gray-300"
              aria-label="streaming"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
