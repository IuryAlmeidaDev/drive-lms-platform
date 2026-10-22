import { Course, CourseApiResponse } from "@/types/course";
import { MOCK_COURSE } from "./mockData";

const STORAGE_KEY_API_URL = "curso_drive_api_url";
const STORAGE_KEY_FOLDER_ID = "curso_drive_folder_id";

export interface CourseConfig {
  apiUrl: string;
  folderId: string;
}

export function getStoredConfig(): CourseConfig {
  const envUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string) || "https://script.google.com/macros/s/AKfycbxXHkV2XfCpaxZfucpYnS4S7i78p1dOiPF_-Smwd2N5pybrTFpZ5pU517jhWDE3VS0a/exec";
  const envFolder = (import.meta.env.VITE_DRIVE_FOLDER_ID as string) || "1TzxdXZwV3Ful0ad05zWEZpJMc3TLE4oi";

  const storedUrl = localStorage.getItem(STORAGE_KEY_API_URL);
  const storedFolder = localStorage.getItem(STORAGE_KEY_FOLDER_ID);

  // Ignora URL antiga da conta institucional caso tenha ficado salva em cache
  const isOldCorporateUrl = storedUrl && storedUrl.includes("AKfycbySbA1hncl0");

  const apiUrl = (!storedUrl || isOldCorporateUrl) ? envUrl : storedUrl;
  const folderId = !storedFolder ? envFolder : storedFolder;

  return {
    apiUrl,
    folderId,
  };
}

export function saveStoredConfig(config: CourseConfig): void {
  if (config.apiUrl) {
    localStorage.setItem(STORAGE_KEY_API_URL, config.apiUrl.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  }

  if (config.folderId) {
    localStorage.setItem(STORAGE_KEY_FOLDER_ID, config.folderId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_FOLDER_ID);
  }
}

export async function fetchCourseData(forceRefresh = false): Promise<{ course: Course; isMock: boolean; error?: string }> {
  const config = getStoredConfig();

  // Se não houver URL configurada, utiliza dados de demonstração (mock)
  if (!config.apiUrl) {
    return {
      course: MOCK_COURSE,
      isMock: true,
    };
  }

  try {
    const url = new URL(config.apiUrl);
    if (config.folderId) {
      url.searchParams.set("folderId", config.folderId);
    }
    if (forceRefresh) {
      url.searchParams.set("refresh", "true");
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Falha na requisição HTTP: ${response.status} ${response.statusText}`);
    }

    const data: CourseApiResponse = await response.json();

    if (!data.success || !data.modules) {
      throw new Error(data.error || "A API do Google Apps Script retornou uma resposta inválida.");
    }

    const course: Course = {
      courseTitle: data.courseTitle || "Curso Online",
      totalLessons: data.totalLessons || data.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      modules: data.modules,
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    return {
      course,
      isMock: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao carregar os dados do curso.";
    console.warn("Aviso: Falha ao consultar endpoint do Google Apps Script. Carregando dados locais.", message);
    return {
      course: MOCK_COURSE,
      isMock: true,
      error: message,
    };
  }
}
