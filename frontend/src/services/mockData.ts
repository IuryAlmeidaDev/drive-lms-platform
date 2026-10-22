import { Course } from "@/types/course";

export const MOCK_COURSE: Course = {
  courseTitle: "Dominando Desenvolvimento Web & Inteligência Artificial",
  totalLessons: 6,
  updatedAt: new Date().toISOString(),
  modules: [
    {
      id: "mod-01",
      title: "01 - Introdução e Configuração do Ambiente",
      order: 1,
      lessons: [
        {
          id: "lesson-1-1",
          title: "Boas-vindas e Visão Geral da Formação",
          order: 1,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: [
            {
              id: "att-1-1",
              title: "Apostila de Boas-Vindas e Ementa.pdf",
              mimeType: "application/pdf",
              viewUrl: "https://drive.google.com/file/d/sample-view/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample"
            },
            {
              id: "att-1-2",
              title: "Guia de Links Úteis e Comunidade.docx",
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              viewUrl: "https://drive.google.com/file/d/sample-links/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample-links"
            }
          ]
        },
        {
          id: "lesson-1-2",
          title: "Instalando Node.js, Git e Extensões Essenciais",
          order: 2,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: [
            {
              id: "att-1-3",
              title: "Cheatsheet de Comandos Git & Terminal.pdf",
              mimeType: "application/pdf",
              viewUrl: "https://drive.google.com/file/d/sample-git/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample-git"
            }
          ]
        }
      ]
    },
    {
      id: "mod-02",
      title: "02 - Fundamentos de Frontend com React & Tailwind",
      order: 2,
      lessons: [
        {
          id: "lesson-2-1",
          title: "Criando Componentes Reutilizáveis com shadcn/ui",
          order: 1,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: [
            {
              id: "att-2-1",
              title: "Código Fonte Inicial do Projeto.zip",
              mimeType: "application/zip",
              viewUrl: "https://drive.google.com/file/d/sample-zip/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample-zip"
            }
          ]
        },
        {
          id: "lesson-2-2",
          title: "Gerenciamento de Estado com Hooks Modernos",
          order: 2,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: []
        }
      ]
    },
    {
      id: "mod-03",
      title: "03 - Automações & Google Apps Script",
      order: 3,
      lessons: [
        {
          id: "lesson-3-1",
          title: "Construindo APIs Serverless com Google Drive e Planilhas",
          order: 1,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: [
            {
              id: "att-3-1",
              title: "Script Base do Google Apps Script.js",
              mimeType: "text/javascript",
              viewUrl: "https://drive.google.com/file/d/sample-gas/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample-gas"
            }
          ]
        },
        {
          id: "lesson-3-2",
          title: "Publicação, CORS e Cache de Alta Velocidade",
          order: 2,
          videoUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
          attachments: [
            {
              id: "att-3-2",
              title: "Resumo de Arquitetura de Cache.pdf",
              mimeType: "application/pdf",
              viewUrl: "https://drive.google.com/file/d/sample-cache/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=sample-cache"
            }
          ]
        }
      ]
    }
  ]
};
