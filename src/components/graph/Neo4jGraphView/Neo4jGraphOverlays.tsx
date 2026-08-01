import type { ReactNode } from "react";

type Neo4jGraphOverlaysProps = {
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | string | null;
  emptyMessage: ReactNode;
  emptyHint?: ReactNode;
};

/**
 * The loading / empty / error overlays. They render absolutely-positioned
 * on top of the canvas with a subtle backdrop. Only one is visible at
 * a time (priority: error > loading > empty). The empty state has a
 * configurable message + optional hint.
 */
export function Neo4jGraphOverlays({
  isLoading,
  isEmpty,
  error,
  emptyMessage,
  emptyHint,
}: Neo4jGraphOverlaysProps) {
  if (error) {
    return (
      <div
        data-testid="nvl-overlay-error"
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
        role="alert"
      >
        <div className="pointer-events-auto max-w-md rounded-2xl border border-error-200 bg-white p-6 shadow-theme-lg dark:border-error-800 dark:bg-gray-900">
          <div className="mb-2 flex items-center gap-2 text-error-600 dark:text-error-400">
            <ErrorIcon />
            <h3 className="text-sm font-semibold">Graph failed to render</h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {typeof error === "string" ? error : error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="nvl-overlay-loading"
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] dark:bg-gray-900/30"
        role="status"
        aria-label="Loading graph"
      >
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-gray-600 shadow-theme-sm dark:bg-gray-800 dark:text-gray-300">
          <SpinnerIcon />
          <span>Computing layout…</span>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        data-testid="nvl-overlay-empty"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="pointer-events-auto max-w-sm rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/70">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <EmptyIcon />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{emptyMessage}</p>
          {emptyHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{emptyHint}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function ErrorIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" opacity="0.5" />
    </svg>
  );
}
