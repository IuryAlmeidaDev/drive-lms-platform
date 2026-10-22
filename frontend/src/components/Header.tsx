import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Settings2,
  Menu,
  RefreshCw,
  FolderGit2,
  ChevronLeft,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { User } from "@/types/course";

interface HeaderProps {
  courseTitle: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  isMock: boolean;
  isRefreshing: boolean;
  user: User | null;
  isInPlayer: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onBackToDashboard: () => void;
  onToggleSidebarMobile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  courseTitle,
  progressPercentage,
  completedLessons,
  totalLessons,
  isMock,
  isRefreshing,
  user,
  isInPlayer,
  onRefresh,
  onOpenSettings,
  onOpenTutorial,
  onBackToDashboard,
  onToggleSidebarMobile,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Voltar ou Mobile Menu + Título */}
        <div className="flex items-center gap-3">
          {isInPlayer ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={onToggleSidebarMobile}
                aria-label="Alternar menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onBackToDashboard}
                className="text-xs gap-1.5 h-8 font-medium"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Meus Cursos</span>
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-foreground tracking-tight line-clamp-1">
                  {courseTitle}
                </h1>
                {isMock && (
                  <Badge variant="warning" className="hidden sm:inline-flex text-[10px] py-0 px-2">
                    Modo Demonstração
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Plataforma LMS Google Drive
              </p>
            </div>
          </div>
        </div>

        {/* Right: Progresso (quando no player) + Perfil do Usuário */}
        <div className="flex items-center gap-3 sm:gap-5">
          {isInPlayer && (
            <div className="flex flex-col items-end gap-1.5 min-w-[120px] sm:min-w-[170px]">
              <div className="flex items-center justify-between w-full text-[11px] sm:text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">Progresso:</span>
                <span className="font-semibold text-foreground">
                  {completedLessons}/{totalLessons} <span className="text-muted-foreground font-normal">({progressPercentage}%)</span>
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5 sm:h-2 w-full" />
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isInPlayer && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Recarregar aulas do Drive"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onOpenTutorial}
              title="Como organizar pastas no Drive"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onOpenSettings}
              title="Configurações da API"
            >
              <Settings2 className="h-4 w-4" />
            </Button>

            {/* Avatar / Usuário */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-border/60">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-border/80 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {user.name.charAt(0)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
