import { useState, useEffect } from 'react';

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
      <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-8 md:p-12 w-full max-w-lg relative rounded-none">
        
        {/* Status indicator tag */}
        <div className="absolute -top-3.5 left-6 bg-accent border-2 border-black dark:border-white text-white px-3 py-0.5 font-mono text-[9px] tracking-widest font-black uppercase">
          PROCESSING // ANALYTICS_PIPELINE
        </div>

        <h2 className="font-heading text-xl md:text-2xl font-black mb-8 text-black dark:text-white uppercase tracking-wider">
          SYNTHESIZING MARKET DATA
        </h2>

        {/* Steps checklist */}
        <ul className="space-y-6">
          {STEPS.map((step, i) => {
            const done    = i < activeStep;
            const current = i === activeStep;
            return (
              <li
                key={i}
                className={`flex items-start gap-4 transition-all duration-150
                            ${done ? 'opacity-50' : current ? 'opacity-100' : 'opacity-20'}`}
              >
                {/* Checkbox indicator */}
                <div
                  className={`shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-none snappy
                              ${done ? 'bg-accent border-black dark:border-white' : 'bg-white dark:bg-black border-black dark:border-white'}`}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="animate-fade-in">
                      <path d="M3 8.5 L6.5 12 L13 4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {current && (
                    <div className="w-2 h-2 bg-accent rounded-none animate-pulse" />
                  )}
                </div>

                {/* Label & progress line */}
                <div className="flex-1">
                  <span className={`font-heading font-black text-sm uppercase tracking-wide ${done ? 'line-through text-slate-400 dark:text-slate-600' : 'text-black dark:text-white'}`}>
                    {step.emoji} {step.label}
                  </span>
                  {current && (
                    <div className="mt-3 h-2 bg-tertiary dark:bg-slate-900 border border-black dark:border-white overflow-hidden rounded-none">
                      <div
                        className="h-full bg-accent rounded-none"
                        style={{
                          animation: 'draw-in linear forwards',
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

        {/* CSS keyframe inject for stark drawing loading indicator */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes draw-in {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}} />

        {/* Bottom message */}
        <p className="font-mono text-[10px] text-slate-500 text-center mt-8 uppercase tracking-widest">
          ESTIMATED COMPLETION: 30S - 90S [STABLE_RUN]
        </p>
      </div>
    </div>
  );
}
