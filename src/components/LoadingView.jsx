import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { W, S } from '../constants';

const STEPS = [
  { label: 'Scraping website content…',      emoji: '🌐', duration: 5000 },
  { label: 'Extracting business signals…',    emoji: '🔍', duration: 8000 },
  { label: 'Running competitive analysis…',   emoji: '🧠', duration: 12000 },
  { label: 'Generating executive report…',    emoji: '📝', duration: 0 },      // stays until API returns
];

export default function LoadingView() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = [];
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      if (i === 0) return; // first step is immediately active
      elapsed += STEPS[i - 1].duration;
      if (step.duration > 0 || i === STEPS.length - 1) {
        timers.push(setTimeout(() => setActiveStep(i), elapsed));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      {/* Main card */}
      <div
        className="bg-white border-[3px] border-pencil p-8 md:p-12 w-full max-w-lg relative"
        style={{ borderRadius: W.md, boxShadow: S.hardLg }}
      >
        {/* Tack decoration */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent rounded-full
                        border-2 border-pencil z-10 shadow-hard-sm" />

        <h2 className="font-kalam text-2xl md:text-3xl font-bold text-center mb-8 text-pencil">
          Analyzing…
          <Pencil size={24} className="inline ml-2 animate-wiggle text-secondary" strokeWidth={2.5} />
        </h2>

        {/* Steps checklist */}
        <ul className="space-y-5">
          {STEPS.map((step, i) => {
            const done    = i < activeStep;
            const current = i === activeStep;
            return (
              <li
                key={i}
                className={`flex items-start gap-4 transition-all duration-300
                            ${done ? 'opacity-60' : current ? 'opacity-100' : 'opacity-30'}`}
              >
                {/* Checkbox */}
                <div
                  className={`shrink-0 w-7 h-7 border-[3px] flex items-center justify-center
                              transition-colors duration-300
                              ${done ? 'bg-secondary border-secondary' : 'bg-white border-pencil'}`}
                  style={{ borderRadius: '6px 12px 6px 10px / 10px 6px 12px 6px' }}
                >
                  {done && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-fade-in">
                      <path d="M3 8.5 L6.5 12 L13 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {current && (
                    <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse-dot" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <span className={`font-patrick text-lg md:text-xl ${done ? 'line-through text-pencil/50' : 'text-pencil'}`}>
                    {step.emoji} {step.label}
                  </span>
                  {current && (
                    <div className="mt-2 h-1.5 bg-muted overflow-hidden" style={{ borderRadius: W.pill }}>
                      <div
                        className="h-full bg-secondary animate-draw-in"
                        style={{
                          borderRadius: W.pill,
                          animationDuration: step.duration > 0 ? `${step.duration}ms` : '20000ms',
                        }}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Bottom message */}
        <p className="font-patrick text-base text-pencil/40 text-center mt-8 italic">
          This usually takes 30–90 seconds ☕
        </p>
      </div>

      {/* Decorative bouncing element */}
      <div className="hidden md:block mt-8 animate-bounce-gentle">
        <div
          className="w-14 h-14 border-2 border-dashed border-pencil/30 flex items-center justify-center"
          style={{ borderRadius: '50% 40% 50% 40% / 40% 50% 40% 50%' }}
        >
          <span className="text-2xl">✏️</span>
        </div>
      </div>
    </div>
  );
}
