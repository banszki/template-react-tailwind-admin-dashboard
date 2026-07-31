import { useEffect, useRef } from "react";
import {
  ChatConversation,
  ChatSidebar,
  ChatMessage,
  ChatInput,
  type ChatMessageRole,
} from "./";

export interface ChatPanelMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  /** True while the message is being streamed in (shows the caret). */
  streaming?: boolean;
  created_at: string;
}

export interface ChatPanelProps {
  conversations: ChatConversation[];
  activeId: string | null;
  messages: ChatPanelMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSend: () => void;
  /** Disable the composer (e.g., while a request is in flight). */
  sending?: boolean;
  /** Optional header content for the right pane (e.g., a model selector). */
  headerExtra?: React.ReactNode;
  "data-testid"?: string;
  className?: string;
}

/**
 * ChatPanel — the orchestrator for a complete AI chat surface.
 *
 * The panel owns nothing: conversations, messages, input, and selection are
 * all driven by the parent (a SPA page that talks to the backend). This keeps
 * the kit component reusable across backends (FastAPI streaming, OpenAI, etc.)
 * and across styling choices (the page chooses the brand colors).
 *
 * The visual layout follows the harness pattern:
 *  - Left: conversation list (sidebar)
 *  - Right: header (with optional extras) + message list (auto-scroll) +
 *    composer at the bottom
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({
  conversations,
  activeId,
  messages,
  input,
  onInputChange,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSend,
  sending = false,
  headerExtra,
  className = "",
  ...rest
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom as messages arrive (the standard chat UX).
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId);
  const headerTitle = active?.title ?? "New chat";

  return (
    <div
      data-testid={rest["data-testid"]}
      className={`flex h-full min-h-0 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={onSelectConversation}
        onNew={onNewConversation}
        onDelete={onDeleteConversation}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
          <h2 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {headerTitle}
          </h2>
          {headerExtra}
        </header>
        <div
          data-testid="chat-messages"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-400">
              {activeId
                ? "No messages yet. Send the first one below."
                : "Start a new conversation to begin."}
            </div>
          ) : (
            messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                text={m.text}
                streaming={m.streaming}
                data-testid={`chat-message-${m.role}`}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-800">
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSend={onSend}
            disabled={sending || !activeId}
            placeholder={
              activeId ? "Send a message..." : "Start a new chat to begin"
            }
            data-testid="chat-input"
          />
        </div>
      </section>
    </div>
  );
};

export default ChatPanel;
