import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  Video,
  FileText,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Folder,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface DriveFolderTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToAddCourse?: () => void;
}

export const DriveFolderTutorialModal: React.FC<DriveFolderTutorialModalProps> = ({
  isOpen,
  onClose,
  onProceedToAddCourse,
}) => {
  const [copied, setCopied] = useState(false);

  const sampleTree = `📁 [Nome do Curso] (Pasta Raiz Compartilhada)
├── 📁 01 - Fundamentos e Introdução
│   ├── 🎥 01 - Apresentação do Curso.mp4
│   ├── 📄 01 - Guia de Início Rápido.pdf
│   └── 🎥 02 - Como Configurar o Ambiente.mp4
└── 📁 02 - Prática Avançada
    ├── 🎥 01 - Criando o Primeiro Projeto.mp4
    └── 📄 01 - Código Fonte e Exercícios.zip`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleTree);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <FolderTree className="h-5 w-5" />
            <DialogTitle className="text-lg sm:text-xl">
              Como Organizar suas Pastas no Google Drive
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Siga este padrão simples para que a plataforma identifique automaticamente seus módulos, vídeos e materiais de apoio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Card Visual da Árvore de Pastas */}
          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40 font-sans text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Folder className="h-4 w-4 text-amber-400" />
                Estrutura de Pastas Recomendada
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar Modelo
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-1.5 text-foreground/90 pl-1">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Folder className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span>Curso Exemplo (Pasta Principal)</span>
              </div>

              <div className="pl-6 space-y-1.5 border-l-2 border-border/50 ml-2">
                {/* Módulo 1 */}
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Folder className="h-3.5 w-3.5 text-blue-400" />
                  <span>01 - Fundamentos</span>
                </div>
                <div className="pl-6 space-y-1 text-muted-foreground border-l border-border/40 ml-1.5">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Video className="h-3.5 w-3.5 text-emerald-400" />
                    <span>01 - Apresentação do Curso.mp4</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-500/30 text-emerald-400">
                      Vídeo da Aula 1
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    <span>01 - Guia de Início.pdf</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-500/30 text-blue-400">
                      Anexo da Aula 1
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Video className="h-3.5 w-3.5 text-emerald-400" />
                    <span>02 - Instalando Ferramentas.mp4</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-500/30 text-emerald-400">
                      Vídeo da Aula 2
                    </Badge>
                  </div>
                </div>

                {/* Módulo 2 */}
                <div className="flex items-center gap-2 font-semibold text-foreground pt-1">
                  <Folder className="h-3.5 w-3.5 text-blue-400" />
                  <span>02 - Prática Avançada</span>
                </div>
                <div className="pl-6 space-y-1 text-muted-foreground border-l border-border/40 ml-1.5">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Video className="h-3.5 w-3.5 text-emerald-400" />
                    <span>01 - Primeiro Projeto.mp4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* As 3 Regras de Ouro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px]">
                  1
                </span>
                Numeração
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Use prefixos como <code>01 - </code> ou <code>02. </code> no início de pastas e arquivos para definir a ordem exata.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px]">
                  2
                </span>
                Anexos & PDFs
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Arquivos PDF, Word ou ZIP com o mesmo número da aula viram automaticamente material de apoio dela.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  3
                </span>
                Permissão Pública
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Em <strong>Compartilhar</strong> na pasta, marque: <strong>"Qualquer pessoa com o link pode ver"</strong>.
              </p>
            </div>
          </div>

          {/* Dica de como pegar o Link/ID */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-2.5 text-xs text-foreground/90">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-400">Como pegar o ID da pasta:</span>
              <p className="text-[11px] text-muted-foreground">
                Abra a pasta no Google Drive e copie o link do navegador. A plataforma aceita o link completo (ex: <code>drive.google.com/drive/folders/1aBcD...</code>) ou apenas o código final!
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fechar
          </Button>
          {onProceedToAddCourse && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onClose();
                onProceedToAddCourse();
              }}
              className="text-xs gap-1.5 font-semibold"
            >
              <span>Adicionar Meu Curso</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
