import React, { createContext, useContext, useState, useCallback } from 'react';
import { Question } from '@/lib/api';

interface ExamContextType {
  selectedQuestions: Question[];
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: number) => void;
  clearQuestions: () => void;
  isSelected: (questionId: number) => boolean;
  totalPoints: number;
  totalTime: number;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  const addQuestion = useCallback((question: Question) => {
    setSelectedQuestions((prev) => {
      if (prev.some((q) => q.id === question.id)) return prev;
      return [...prev, question];
    });
  }, []);

  const removeQuestion = useCallback((questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const clearQuestions = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  const isSelected = useCallback(
    (questionId: number) => selectedQuestions.some((q) => q.id === questionId),
    [selectedQuestions]
  );

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);
  const totalTime = selectedQuestions.reduce((sum, q) => sum + q.estimated_time_minutes, 0);

  return (
    <ExamContext.Provider
      value={{
        selectedQuestions,
        addQuestion,
        removeQuestion,
        clearQuestions,
        isSelected,
        totalPoints,
        totalTime,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = (): ExamContextType => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
