import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Play,
  FolderLock,
  Sparkles,
  Sun,
  Moon,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface LoginScreenProps {
  onLoginWithEmail: (email: string, name?: string) => void;
  onAccessSharedCourse: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginWithEmail,
  onAccessSharedCourse,
  isDark,
  onToggleTheme,
}) => {
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    onLoginWithEmail(emailInput.trim());
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors selection:bg-primary/20">
      {/* Topbar simples com Theme Toggle */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/40 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground">
            Drive LMS
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="h-9 px-3 gap-2 text-xs font-medium border-border/60 hover:bg-secondary/60"
          title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="hidden sm:inline">Tema Escuro</span>
            </>
          )}
        </Button>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Header da Página */}
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs bg-primary/10 py-0.5 px-3">
              Plataforma LMS Google Drive
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Como você deseja entrar?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Acesse sua biblioteca privativa com suas pastas do Drive ou explore o curso modelo compartilhado para demonstração.
            </p>
          </div>

          {/* Cards das Duas Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opção 1: Curso Compartilhado */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-200 shadow-lg hover:shadow-xl space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/30">
                    Acesso Aberto
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    Curso Compartilhado
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Assista ao <strong>Curso JAVA (Rocketseat)</strong> completo com 6 módulos e 37 aulas disponibilizado pelo autor.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Nenhum cadastro ou pasta necessária</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>37 aulas organizadas com player 16:9</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="default"
                size="lg"
                onClick={onAccessSharedCourse}
                className="w-full text-xs sm:text-sm font-semibold h-11 gap-2 shadow-md hover:shadow-lg"
              >
                <Play className="h-4 w-4 fill-current" />
                Assistir Curso de Demonstração
              </Button>
            </div>

            {/* Opção 2: Meu Espaço Pessoal */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-200 shadow-lg hover:shadow-xl space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-secondary border border-border text-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FolderLock className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-secondary text-foreground border-border">
                    Privado & Individual
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    Meu Espaço Pessoal
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Entre com seu e-mail para ver <strong>apenas seus próprios cursos</strong> e vincular pastas do seu Google Drive.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Progresso e anotações isolados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Vincule quantas pastas quiser</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu-email@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="pl-10 h-11 text-xs bg-background"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full text-xs font-semibold h-10 gap-1.5 border border-border/80 hover:bg-secondary/80"
                  >
                    <span>Entrar no Meu Espaço</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>

                {/* Atalho para o criador */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">É o Iury?</span>
                  <button
                    type="button"
                    onClick={() => onLoginWithEmail("iury.colombo@gmail.com", "Iury Colombo")}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Entrar como Iury Colombo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[11px] text-muted-foreground border-t border-border/40">
        Plataforma LMS Google Drive • Stream serverless de vídeos e materiais
      </footer>
    </div>
  );
};
