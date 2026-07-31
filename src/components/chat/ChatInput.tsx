import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { PaperPlaneIcon } from "../../icons";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** Disable while a request is in flight. */
  disabled?: boolean;
  placeholder?: string;
  /** Optional data-testid for BDD / Playwright locators. */
  "data-testid"?: string;
  className?: string;
}

/**
 * ChatInput — the message-composer at the bottom of a chat conversation.
 *
 * Standard chat UX: auto-resizing textarea, Enter sends, Shift+Enter inserts a
 * newline. The send button mirrors the harness pattern (paper-plane icon,
 * disabled while a request is in flight, pressed-state feedback on submit).
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Send a message...",
  className = "",
  ...rest
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = useState(false);

  // Auto-resize: keep the textarea height in 1..6 lines as the user types.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 24; // ~text-sm leading-6
    const maxHeight = lineHeight * 6;
    el.style.height = `${Math.min(maxHeight, el.scrollHeight)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div
      data-testid={rest["data-testid"]}
      className={`flex items-end gap-2 rounded-2xl border bg-white p-2 transition dark:bg-gray-900 ${className} ${
        focused
          ? "border-brand-500 ring-1 ring-brand-500/30"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white/90"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
      >
        <PaperPlaneIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ChatInput;
