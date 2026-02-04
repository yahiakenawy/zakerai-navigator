import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileText, Clock, Award, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExam } from '@/contexts/ExamContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SelectedQuestionsListProps {
  onCreateExam: () => void;
}

const SelectedQuestionsList: React.FC<SelectedQuestionsListProps> = ({ onCreateExam }) => {
  const { t } = useLanguage();
  const { selectedQuestions, removeQuestion, clearQuestions, totalPoints, totalTime } = useExam();

  if (selectedQuestions.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">{t('exams.selected')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click the + button on questions to add them to your exam
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {t('exams.selected')}
            <Badge variant="secondary" className="ms-2">
              {selectedQuestions.length}
            </Badge>
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {totalPoints} pts
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTime} min
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearQuestions}
          className="text-destructive hover:text-destructive"
        >
          {t('exams.clear')}
        </Button>
      </div>

      {/* Questions List */}
      <ScrollArea className="max-h-64">
        <div className="p-2 space-y-2">
          {selectedQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 group"
            >
              <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{question.question_head}</p>
                <p className="text-xs text-muted-foreground">
                  {question.points} pts • {question.estimated_time_minutes} min
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(question.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Create Exam Button */}
      <div className="p-4 border-t border-border/50">
        <Button onClick={onCreateExam} className="w-full gradient-bg text-white">
          <Plus className="h-4 w-4 me-2" />
          {t('exams.create')}
        </Button>
      </div>
    </div>
  );
};

export default SelectedQuestionsList;
