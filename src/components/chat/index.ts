// Chat component family — the standardized AI chat surface for the kit.
// Public surface (consuming apps import these via @platform/web-kit).
//
// Components:
//  - ChatSidebar: the conversation list panel (left)
//  - ChatMessage: a single message bubble (right=user, left=assistant)
//  - ChatInput: the message composer (auto-resize, Enter to send)
//  - ChatPanel: the orchestrator that composes the three above
//
// All four are pure presentational — state is owned by the consuming page.
// Data shapes (ChatConversation, ChatPanelMessage) are LLM-compatible: a
// streaming response can drop into ChatPanelMessage without reshape.

export { default as ChatSidebar, type ChatSidebarProps, type ChatConversation } from "./ChatSidebar";
export { default as ChatMessage, type ChatMessageProps, type ChatMessageRole } from "./ChatMessage";
export { default as ChatInput, type ChatInputProps } from "./ChatInput";
export { default as ChatPanel, type ChatPanelProps, type ChatPanelMessage } from "./ChatPanel";
