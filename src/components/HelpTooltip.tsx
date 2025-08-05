import { useState } from "react";

export const HelpTooltip = ({ content }: { content: string }) => {
  const [visible, setVisible] = useState(false);

  // Toggle tooltip visibility on click/tap or keyboard interaction
  const toggleVisible = () => setVisible((v) => !v);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleVisible();
      e.preventDefault();
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className="w-4 h-4 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center cursor-pointer select-none"
        onClick={toggleVisible}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Help tooltip toggle"
      >
        ?
      </div>
      {visible && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg z-10 w-64 shadow-lg"
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
