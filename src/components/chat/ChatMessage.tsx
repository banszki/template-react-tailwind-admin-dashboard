import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BoltIcon, UserIcon } from "../../icons";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessageProps {
  role: ChatMessageRole;
  text: string;
  /** True while the message is being streamed in (shows a blinking caret at the end). */
  streaming?: boolean;
  /**
   * When true, the assistant's `text` is rendered as GitHub-flavored Markdown
   * (headings, lists, links, fenced code blocks, tables). Defaults to true for
   * assistant messages; user messages are always plain text (no markdown
   * expansion) so user input renders verbatim. Pass `false` to opt out.
   */
  renderMarkdown?: boolean;
  /** Optional data-testid for BDD / Playwright locators. */
  "data-testid"?: string;
  className?: string;
}

/**
 * ChatMessage — a single message bubble in a chat conversation.
 *
 * Bubble layout is the standard pattern (left-aligned assistant + AI avatar,
 * right-aligned user + user avatar). Assistant messages render as
 * GitHub-flavored Markdown (via react-markdown + remark-gfm); user messages
 * always render verbatim (no markdown expansion). A v2 will add syntax
 * highlighting (rehype-highlight) and a copy-to-clipboard on code blocks.
 *
 * Following the kit's "forward the full prop set" pattern, data-testid reaches
 * the real DOM node so the bdd-kit's UI steps + Playwright locators work.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  text,
  streaming = false,
  renderMarkdown,
  className = "",
  ...rest
}) => {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  // Default: render markdown for assistant messages, plain text for user/system.
  const useMarkdown =
    renderMarkdown ?? (isAssistant && !streaming);

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
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${bubbleBg} ${
            useMarkdown ? "chat-markdown" : ""
          }`}
        >
          {useMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Tighten the prose for a chat bubble (the default Tailwind
                // prose size is too large for a chat).
                p: ({ children }: { children?: ReactNode }) => (
                  <p className="my-1.5 leading-relaxed">{children}</p>
                ),
                h1: ({ children }: { children?: ReactNode }) => (
                  <h1 className="mt-3 mb-1.5 text-base font-semibold">{children}</h1>
                ),
                h2: ({ children }: { children?: ReactNode }) => (
                  <h2 className="mt-3 mb-1.5 text-sm font-semibold">{children}</h2>
                ),
                h3: ({ children }: { children?: ReactNode }) => (
                  <h3 className="mt-2 mb-1 text-sm font-semibold">{children}</h3>
                ),
                ul: ({ children }: { children?: ReactNode }) => (
                  <ul className="my-1.5 list-disc pl-5">{children}</ul>
                ),
                ol: ({ children }: { children?: ReactNode }) => (
                  <ol className="my-1.5 list-decimal pl-5">{children}</ol>
                ),
                li: ({ children }: { children?: ReactNode }) => (
                  <li className="my-0.5">{children}</li>
                ),
                a: ({ children, href }: { children?: ReactNode; href?: string }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className }: { children?: ReactNode; className?: string }) => {
                  // Inline code (no className with a language) -> inline style.
                  // Fenced code block (has className like "language-python") ->
                  // block style. The Markdown lib already wraps fenced blocks
                  // in <pre><code>, so this is the inner <code>.
                  const isBlock = (className ?? "").includes("language-");
                  return isBlock ? (
                    <code className={className}>{children}</code>
                  ) : (
                    <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }: { children?: ReactNode }) => (
                  <pre className="my-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }: { children?: ReactNode }) => (
                  <blockquote className="my-1.5 border-l-2 border-gray-300 pl-3 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    {children}
                  </blockquote>
                ),
                table: ({ children }: { children?: ReactNode }) => (
                  <table className="my-2 w-full border-collapse text-xs">{children}</table>
                ),
                th: ({ children }: { children?: ReactNode }) => (
                  <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold dark:border-gray-600 dark:bg-gray-800">
                    {children}
                  </th>
                ),
                td: ({ children }: { children?: ReactNode }) => (
                  <td className="border border-gray-300 px-2 py-1 dark:border-gray-600">
                    {children}
                  </td>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          ) : (
            <span className="whitespace-pre-wrap">{text}</span>
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
