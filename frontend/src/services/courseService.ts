import { Course, CourseApiResponse, UserCourse } from "@/types/course";
import { MOCK_COURSE } from "./mockData";

const STORAGE_KEY_API_URL = "curso_drive_api_url";
const STORAGE_KEY_FOLDER_ID = "curso_drive_folder_id";
const STORAGE_KEY_USER_COURSES = "curso_drive_local_courses";

export interface CourseConfig {
  apiUrl: string;
  folderId: string;
}

export function getStoredConfig(): CourseConfig {
  const envUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string) || "https://script.google.com/macros/s/AKfycbxXHkV2XfCpaxZfucpYnS4S7i78p1dOiPF_-Smwd2N5pybrTFpZ5pU517jhWDE3VS0a/exec";
  const envFolder = (import.meta.env.VITE_DRIVE_FOLDER_ID as string) || "1TzxdXZwV3Ful0ad05zWEZpJMc3TLE4oi";

  const storedUrl = localStorage.getItem(STORAGE_KEY_API_URL);
  const storedFolder = localStorage.getItem(STORAGE_KEY_FOLDER_ID);

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

/**
 * Curso modelo compartilhado para demonstração pública
 */
export const SHARED_COURSES: UserCourse[] = [
  {
    id: "course-java-shared",
    folderId: "1TzxdXZwV3Ful0ad05zWEZpJMc3TLE4oi",
    title: "Curso JAVA (Rocketseat)",
    totalLessons: 37,
    completedLessons: 0,
    progressPercentage: 0,
    isShared: true,
    sharedBy: "Iury Colombo",
    createdAt: "2026-10-22T00:00:00.000Z",
  },
];

export function getSharedCourses(): UserCourse[] {
  return SHARED_COURSES;
}

/**
 * Busca a lista de cursos cadastrados para o usuário
 */
export async function fetchUserCourses(email: string): Promise<UserCourse[]> {
  const config = getStoredConfig();

  // Para o Iury Colombo, mantemos o Curso JAVA como padrão se ainda não houver nenhum
  const isOwner = email.toLowerCase().includes("iury");
  const defaultCourses: UserCourse[] = isOwner
    ? [
        {
          id: "course-java-default",
          folderId: config.folderId || "1TzxdXZwV3Ful0ad05zWEZpJMc3TLE4oi",
          title: "Curso JAVA",
          totalLessons: 37,
          completedLessons: 0,
          progressPercentage: 0,
          createdAt: new Date().toISOString(),
        },
      ]
    : [];

  if (!config.apiUrl || !email) {
    const local = localStorage.getItem(`${STORAGE_KEY_USER_COURSES}_${email}`);
    return local ? JSON.parse(local) : defaultCourses;
  }

  try {
    const url = new URL(config.apiUrl);
    url.searchParams.set("action", "getCourses");
    url.searchParams.set("email", email);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) throw new Error("Erro na requisição ao backend");
    const data = await response.json();

    if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
      localStorage.setItem(`${STORAGE_KEY_USER_COURSES}_${email}`, JSON.stringify(data.courses));
      return data.courses;
    }

    // Se o usuário ainda não tiver nenhum curso cadastrado na nuvem:
    // Retorna vazio para novos usuários (para que vejam apenas o que têm acesso),
    // ou o curso do Iury caso seja o próprio Iury.
    const local = localStorage.getItem(`${STORAGE_KEY_USER_COURSES}_${email}`);
    return local ? JSON.parse(local) : defaultCourses;
  } catch (err) {
    console.warn("Aviso: Falha ao buscar cursos na nuvem. Usando cursos locais salvos.", err);
    const local = localStorage.getItem(`${STORAGE_KEY_USER_COURSES}_${email}`);
    return local ? JSON.parse(local) : defaultCourses;
  }
}

/**
 * Adiciona um novo curso para o usuário
 */
export async function addUserCourse(
  email: string,
  folderId: string,
  customTitle?: string
): Promise<{ success: boolean; course?: UserCourse; error?: string }> {
  const config = getStoredConfig();

  // Limpa possíveis URLs do Drive para extrair o ID limpo
  let cleanFolderId = folderId.trim();
  if (cleanFolderId.includes("folders/")) {
    cleanFolderId = cleanFolderId.split("folders/")[1].split("?")[0].split("/")[0];
  } else if (cleanFolderId.includes("id=")) {
    cleanFolderId = cleanFolderId.split("id=")[1].split("&")[0];
  }

  if (!config.apiUrl) {
    const localCourse: UserCourse = {
      id: "c_" + Date.now(),
      folderId: cleanFolderId,
      title: customTitle || "Novo Curso Google Drive",
      totalLessons: 10,
      completedLessons: 0,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
    };
    return { success: true, course: localCourse };
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "addCourse",
        email,
        folderId: cleanFolderId,
        customTitle,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Não foi possível cadastrar o curso no backend.");
    }

    return {
      success: true,
      course: data.course,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao adicionar curso.";
    return { success: false, error: message };
  }
}

/**
 * Remove um curso do usuário
 */
export async function deleteUserCourse(email: string, courseId: string): Promise<boolean> {
  const config = getStoredConfig();
  if (!config.apiUrl) return true;

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "deleteCourse",
        email,
        courseId,
      }),
    });
    const data = await response.json();
    return !!data.success;
  } catch (err) {
    console.error("Erro ao deletar curso", err);
    return false;
  }
}

/**
 * Carrega o conteúdo completo de aulas de uma pasta específica
 */
export async function fetchCourseData(
  folderId?: string,
  forceRefresh = false
): Promise<{ course: Course; isMock: boolean; error?: string }> {
  const config = getStoredConfig();
  const targetFolderId = folderId || config.folderId;

  if (!config.apiUrl || !targetFolderId) {
    return {
      course: MOCK_COURSE,
      isMock: true,
    };
  }

  try {
    const url = new URL(config.apiUrl);
    url.searchParams.set("folderId", targetFolderId);
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
      throw new Error(`Falha HTTP: ${response.status} ${response.statusText}`);
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
    console.warn("Aviso ao consultar endpoint do Google Apps Script:", message);
    return {
      course: MOCK_COURSE,
      isMock: true,
      error: message,
    };
  }
}
