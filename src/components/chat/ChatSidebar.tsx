import { ReactNode } from "react";
import { PlusIcon, TrashBinIcon } from "../../icons";

export interface ChatConversation {
  id: string;
  title: string;
  /** ISO timestamp of the most recent message (used to sort the list). */
  updated_at: string;
  /** Optional: 1-line preview of the most recent message. The sidebar
   *  shows this below the title so the user can see "what was this chat
   *  about?" without clicking in. Empty string = don't render the row. */
  last_message_preview?: string;
}

export interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  /** Optional extra header content (e.g., a model selector). */
  headerExtra?: ReactNode;
  "data-testid"?: string;
  className?: string;
}

/**
 * ChatSidebar — the conversation-list panel that sits to the left of the chat
 * surface. Standard "every other AI chat app" UX:
 *  - "New chat" button at the top
 *  - Sorted conversations (most recent first)
 *  - Active conversation highlighted
 *  - Per-conversation delete (trash icon, revealed on hover)
 *
 * State is owned by the parent (ChatPanel) so the sidebar stays a pure
 * presentational component, easy to swap or re-theme.
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  headerExtra,
  className = "",
  ...rest
}) => {
  return (
    <aside
      data-testid={rest["data-testid"]}
      className={`flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 ${className}`}
    >
      <div className="flex flex-col gap-2 p-3">
        <button
          type="button"
          onClick={onNew}
          aria-label="New chat"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
        >
          <PlusIcon className="h-4 w-4" />
          New chat
        </button>
        {headerExtra}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-gray-400">
            No conversations yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="truncate font-medium">{c.title}</span>
                    {c.last_message_preview ? (
                      <span
                        data-testid="chat-sidebar-preview"
                        className="truncate text-xs font-normal text-gray-500 dark:text-gray-400"
                      >
                        {c.last_message_preview}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    aria-label={`Delete conversation ${c.title}`}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-200 hover:text-error-500 group-hover:flex dark:hover:bg-gray-800"
                  >
                    <TrashBinIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default ChatSidebar;
