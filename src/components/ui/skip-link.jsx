/**
 * Skip-to-main-content link for keyboard/screen-reader accessibility.
 * Visually hidden until focused — appears at top of viewport on Tab.
 */
export function SkipLink({ targetId = "main-content", children = "Chuyển đến nội dung chính" }) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed top-0 left-0 z-[100] -translate-y-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus-visible:translate-y-0"
    >
      {children}
    </a>
  );
}
