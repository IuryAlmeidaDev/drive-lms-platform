export interface Attachment {
  id: string;
  title: string;
  mimeType: string;
  viewUrl: string;
  downloadUrl: string;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string;
  attachments: Attachment[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  generalAttachments?: Attachment[];
}

export interface Course {
  courseTitle: string;
  totalLessons: number;
  modules: Module[];
  updatedAt?: string;
}

export interface CourseApiResponse {
  success: boolean;
  courseTitle?: string;
  totalLessons?: number;
  modules?: Module[];
  error?: string;
  hint?: string;
  updatedAt?: string;
}

export interface CourseProgress {
  completedLessonIds: string[];
  lastActiveLessonId: string | null;
  autoplay: boolean;
  notes: Record<string, string>; // lessonId -> anotações do aluno
}
