import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Get tenant from subdomain
export const getTenant = (): string => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return parts[0] !== 'localhost' && parts[0] !== '127' ? parts[0] : 'demo';
  }
  
  // Handle production (e.g., tenant.zakerai.org)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return 'demo';
};

// Get base URL with tenant
export const getBaseUrl = (): string => {
  const tenant = getTenant();
  // For development, use a mock or local API
  if (window.location.hostname.includes('localhost')) {
    return `http://${tenant}.localhost:8000/api`;
  }
  return `https://${tenant}.zakerai.org/api`;
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${getBaseUrl()}/users/token/refresh/`,
            { refresh: refreshToken },
            { withCredentials: true }
          );
          
          const { access } = response.data;
          sessionStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login on refresh failure
        sessionStorage.removeItem('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/users/token/login/', { username, password }),
  refresh: () => apiClient.post('/users/token/refresh/', {}),
  logout: () => {
    sessionStorage.removeItem('access_token');
    Cookies.remove('refresh_token');
  },
};

export const levelsApi = {
  getAll: () => apiClient.get('/levels/'),
};

export const subjectsApi = {
  getAll: () => apiClient.get('/subjects/'),
  getChapters: (subjectId: number) => apiClient.get(`/subject/${subjectId}/`),
  getChapterLessons: (chapterId: number) => apiClient.get(`/subject/chapters/${chapterId}/`),
  getQuestions: (subjectId: number, params?: Record<string, string | number>) =>
    apiClient.get(`/subject/${subjectId}/questions/`, { params }),
  getChapterQuestions: (chapterId: number, params?: Record<string, string | number>) =>
    apiClient.get(`/subject/chapters/${chapterId}/questions/`, { params }),
};

export const questionsApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiClient.get('/subjects/questions/', { params }),
  getById: (questionId: number) => apiClient.get(`/questions/${questionId}/`),
  create: (data: CreateQuestionPayload) => apiClient.post('/questions/create/', data),
};

export const examsApi = {
  create: (data: CreateExamPayload) => apiClient.post('/exams/', data),
  takeQuestion: (questionId: number) => apiClient.post(`/exams/question/${questionId}/`),
};

// Types
export type UserRole = 'admin' | 'head' | 'teacher' | 'student';

export interface User {
  user_id: number;
  username: string;
  role: UserRole;
}

export interface Level {
  id: number;
  stage: string;
  grade: string;
}

export interface Subject {
  id: number;
  name: string;
  semester: string;
  level: Level;
  is_active: boolean;
}

export interface Chapter {
  id: number;
  name: string;
  number: number;
  is_active: boolean;
  lesson_numbers: number[];
}

export interface ChapterLessons {
  chapter_id: number;
  chapter_name: string;
  lesson_numbers: number[];
  total_lessons: number;
}

export interface MCQOption {
  id: number;
  options: string[];
  image_options?: string[];
}

export interface MiniQuestion {
  id: number;
  type_ans: string;
  question_head: string;
  mcq_options?: MCQOption[];
  correct_answer: string;
  points: number;
  difficulty?: string;
  estimated_time_minutes?: number;
}

export interface Question {
  id: number;
  type_ans: 'mcq' | 'essay' | 'passage' | 'short_answer' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time_minutes: number;
  question_head: string;
  points: number;
  subject_name: string;
  chapter_name: string;
  tags: string[];
  lesson_number: number;
  level: Level;
  subject_semester: string;
  image?: string;
  subj?: number;
  chapter?: number;
  correct_answer?: string;
  answer_explain?: string;
  mcq_options?: MCQOption[];
  mini_questions?: MiniQuestion[];
  parent_passage?: number | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateQuestionPayload {
  subj: number;
  chapter: number;
  lesson_number: number;
  tags?: string[];
  type_ans: string;
  difficulty: string;
  estimated_time_minutes: number;
  question_head: string;
  image?: string;
  points: number;
  correct_answer?: string;
  answer_explain?: string;
  parent_passage?: number | null;
  mcq_options?: {
    options: string[];
    image_options?: string[];
  };
  mini_questions?: Omit<CreateQuestionPayload, 'subj' | 'chapter' | 'lesson_number'>[];
}

export interface ExamQuestion {
  question: number;
  points?: number;
  display_order?: number;
  time_limit_minutes?: number;
}

export interface CreateExamPayload {
  title: string;
  instructions?: string;
  klass?: number;
  duration_minutes: number;
  start_time: string;
  deadline?: string;
  level: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  prevent_cheating?: boolean;
  allowed_attempts?: number;
  randomize_questions?: boolean;
  randomize_order_for_stud?: boolean;
  auto_grade_release?: boolean;
  tags?: string[];
  questions?: ExamQuestion[];
  number_of_questions?: number;
  question_types?: string;
}
