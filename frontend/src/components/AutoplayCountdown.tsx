import React, { useEffect, useState } from "react";
import { Lesson } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Play, X, FastForward } from "lucide-react";

interface AutoplayCountdownProps {
  nextLesson: Lesson;
  onAdvance: () => void;
  onCancel: () => void;
  durationSeconds?: number;
}

export const AutoplayCountdown: React.FC<AutoplayCountdownProps> = ({
  nextLesson,
  onAdvance,
  onCancel,
  durationSeconds = 5,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onAdvance();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onAdvance]);

  const progressPercentage = ((durationSeconds - secondsLeft) / durationSeconds) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-card border border-primary/40 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      {/* Barra de Progresso Superior */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-2xl bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Play className="h-3 w-3 fill-current" />
            Próxima aula em {secondsLeft}s
          </span>
          <h4 className="text-xs font-bold text-foreground line-clamp-1">
            {nextLesson.order}. {nextLesson.title}
          </h4>
        </div>

        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          title="Cancelar reprodução automática"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-7">
          Cancelar
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onAdvance}
          className="text-xs h-7 gap-1 font-semibold"
        >
          <FastForward className="h-3.5 w-3.5" />
          Assistir Agora
        </Button>
      </div>
    </div>
  );
};
