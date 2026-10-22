import React, { useState, useEffect } from "react";
import { Lesson, Attachment } from "@/types/course";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  StickyNote,
  Info,
  Archive,
  FileSpreadsheet,
  FileCode,
  Save,
  Check,
} from "lucide-react";

interface LessonMaterialsProps {
  lesson: Lesson;
  moduleTitle: string;
  userNote: string;
  onSaveNote: (note: string) => void;
}

export const LessonMaterials: React.FC<LessonMaterialsProps> = ({
  lesson,
  moduleTitle,
  userNote,
  onSaveNote,
}) => {
  const [noteContent, setNoteContent] = useState(userNote || "");
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setNoteContent(userNote || "");
  }, [lesson.id, userNote]);

  const handleSave = () => {
    onSaveNote(noteContent);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  const getFileIcon = (mimeType: string, title: string) => {
    const lower = title.toLowerCase();
    if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z")) {
      return <Archive className="h-5 w-5 text-amber-400" />;
    }
    if (lower.endsWith(".xlsx") || lower.endsWith(".csv") || lower.endsWith(".sheets")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
    }
    if (lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".json") || lower.endsWith(".py")) {
      return <FileCode className="h-5 w-5 text-cyan-400" />;
    }
    return <FileText className="h-5 w-5 text-blue-400" />;
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="materials" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Materiais ({lesson.attachments.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5 text-xs">
            <StickyNote className="h-3.5 w-3.5" />
            Anotações
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1.5 text-xs">
            <Info className="h-3.5 w-3.5" />
            Detalhes
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Materiais de Apoio (PDFs, Docs, etc.) */}
        <TabsContent value="materials" className="mt-4 space-y-3">
          {lesson.attachments.length === 0 ? (
            <Card className="bg-card/40 border-dashed border-border/80">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum material de apoio anexado a esta aula.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Arquivos PDF ou Docs colocados na pasta com o mesmo número da aula aparecerão aqui automaticamente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.attachments.map((att) => (
                <Card
                  key={att.id}
                  className="group bg-card/60 hover:bg-card border-border/60 hover:border-border transition-all shadow-xs"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/80 border border-border/60">
                        {getFileIcon(att.mimeType, att.title)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {att.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Google Drive Attachment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        asChild
                        title="Visualizar documento"
                      >
                        <a href={att.viewUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 text-foreground hover:text-primary"
                        asChild
                        title="Baixar arquivo"
                      >
                        <a href={att.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Bloco de Anotações do Aluno */}
        <TabsContent value="notes" className="mt-4">
          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Suas anotações são salvas automaticamente no seu navegador.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="h-7 text-xs gap-1"
                >
                  {hasSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Salvo!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Escreva seus resumos, dúvidas ou pontos importantes desta aula..."
                rows={5}
                className="w-full rounded-xl bg-secondary/40 border border-input/60 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Informações Técnicas da Aula */}
        <TabsContent value="details" className="mt-4">
          <Card className="bg-card/60 border-border/60">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Módulo:</span>
                <span className="font-medium text-foreground">{moduleTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Título Original:</span>
                <span className="font-medium text-foreground">{lesson.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">ID do Arquivo (Drive):</span>
                <code className="font-mono text-[11px] text-primary">{lesson.id}</code>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Link Direto no Drive:</span>
                <a
                  href={`https://drive.google.com/file/d/${lesson.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  Abrir no Google Drive <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
