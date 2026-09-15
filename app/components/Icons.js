// Small inline SVGs, styled to match the editorial/letterpress look --
// plain line icons, no filled shapes, so they read as ink rather than a
// generic icon-font. Each takes the same className prop as any element,
// so callers size and colour them with CSS (`currentColor`) rather than
// hardcoding either here.

export function PencilIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 4.5l5 5L8 21H3v-5z" />
      <path d="M12.5 6.5l5 5" />
    </svg>
  );
}

export function NotebookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 3v18" />
      <path d="M12.5 8h4" />
      <path d="M12.5 12h4" />
      <path d="M12.5 16h2.5" />
    </svg>
  );
}

export function QuoteIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 9c-2.2 0-3.5 1.6-3.5 3.8 0 2 1.3 3.2 3 3.2.2 1.6-.9 3-2.5 3.5" />
      <path d="M17 9c-2.2 0-3.5 1.6-3.5 3.8 0 2 1.3 3.2 3 3.2.2 1.6-.9 3-2.5 3.5" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ArrowIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
