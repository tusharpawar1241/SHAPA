
export default function LoadingOverlay({ active, title, status }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center gap-6 animate-[fadeIn_0.3s_ease]">
      <div className="relative w-20 h-20">
        <div className="w-full h-full border-4 border-surface-container-high border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_watch
          </span>
        </div>
      </div>
      <div className="text-center flex flex-col gap-1.5 px-6">
        <div className="text-lg font-bold text-on-surface">{title || "Analyzing Product Label"}</div>
        <div className="text-xs text-on-surface-variant">{status || "Running molecular analysis..."}</div>
      </div>
    </div>
  );
}
