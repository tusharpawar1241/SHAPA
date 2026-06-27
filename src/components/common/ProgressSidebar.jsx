import { Award, User, Stethoscope, Droplet, Coffee } from 'lucide-react';

export default function ProgressSidebar({ completion }) {
  // SVG properties for circular progress
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  return (
    <div className="flex flex-col gap-4">
      {/* Circle Progress Widget */}
      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle
              className="text-outline-variant/20 fill-transparent"
              strokeWidth="6"
              stroke="currentColor"
              cx="40"
              cy="40"
              r={radius}
            />
            <circle
              className="text-primary fill-transparent transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              cx="40"
              cy="40"
              r={radius}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
            {completion}%
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-on-surface">Redesigned Profile</span>
          <span className="text-2xl font-black text-primary">{completion}%</span>
          <span className="text-[10px] text-on-surface-variant font-medium">Progress saved locally</span>
        </div>
      </div>

      {/* Horizontal Progress Bar fallback */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-on-surface">Completeness</span>
          <span className="text-xs font-bold text-primary">{completion}%</span>
        </div>
        <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-outline-variant/30 flex flex-col gap-2.5 shadow-sm">
        <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/30 pb-2">
          <Award size={14} className="text-primary" /> Profile Checklist
        </h4>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-on-surface-variant flex items-center gap-1"><User size={12} /> Personal Info:</span>
            <span className="font-bold text-primary">Completed</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-on-surface-variant flex items-center gap-1"><Stethoscope size={12} /> Medical profile:</span>
            <span className="font-bold text-primary">Ready</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-on-surface-variant flex items-center gap-1"><Droplet size={12} /> Skin &amp; Hair:</span>
            <span className="font-bold text-primary">Ready</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-on-surface-variant flex items-center gap-1"><Coffee size={12} /> Lifestyle &amp; Goals:</span>
            <span className="font-bold text-primary">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
