import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Award, Eye, EyeOff, Play, CheckCircle2 } from 'lucide-react';
import { Question } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QuestionDetailsModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onTakeQuestion: (questionId: number) => void;
}

const QuestionDetailsModal: React.FC<QuestionDetailsModalProps> = ({
  question,
  isOpen,
  onClose,
  onTakeQuestion,
}) => {
  const { t } = useLanguage();
  const [showAnswer, setShowAnswer] = useState(false);

  if (!question) return null;

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return '';
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'type-mcq';
      case 'essay':
        return 'type-essay';
      case 'passage':
        return 'type-passage';
      default:
        return 'type-short_answer';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('font-medium', getDifficultyClass(question.difficulty))}>
                  {t(`difficulty.${question.difficulty}`)}
                </Badge>
                <Badge className={cn('font-medium', getTypeClass(question.type_ans))}>
                  {t(`type.${question.type_ans}`)}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-semibold text-start">
                {question.question_head}
              </DialogTitle>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              <span>{question.points} {t('questions.points')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              <span>{question.estimated_time_minutes} {t('questions.minutes')}</span>
            </div>
            <span>{question.subject_name} • {question.chapter_name}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-6 space-y-6">
            {/* Question Image */}
            {question.image && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={question.image}
                  alt="Question"
                  className="w-full h-auto max-h-64 object-contain bg-muted"
                />
              </div>
            )}

            {/* MCQ Options */}
            {question.type_ans === 'mcq' && question.mcq_options && question.mcq_options.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('questions.options')}
                </h4>
                <div className="grid gap-2">
                  {question.mcq_options[0].options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                        showAnswer && option === question.correct_answer
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-border bg-muted/30'
                      )}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                        showAnswer && option === question.correct_answer
                          ? 'bg-emerald-500 text-white'
                          : 'bg-secondary text-secondary-foreground'
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showAnswer && option === question.correct_answer && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Questions (for Passage type) */}
            {question.type_ans === 'passage' && question.mini_questions && question.mini_questions.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('questions.miniQuestions')} ({question.mini_questions.length})
                </h4>
                <div className="space-y-3">
                  {question.mini_questions.map((mini, index) => (
                    <div
                      key={mini.id}
                      className="p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{mini.question_head}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {t(`type.${mini.type_ans}`)}
                            </Badge>
                            <span>{mini.points} pts</span>
                          </div>
                          {showAnswer && mini.correct_answer && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                            >
                              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                <strong>{t('questions.correct')}:</strong> {mini.correct_answer}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Section */}
            <AnimatePresence>
              {showAnswer && question.type_ans !== 'passage' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {question.correct_answer && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                        {t('questions.correct')}
                      </h4>
                      <p className="text-emerald-600 dark:text-emerald-300">{question.correct_answer}</p>
                    </div>
                  )}
                  {question.answer_explain && (
                    <div className="p-4 rounded-xl bg-secondary border border-border">
                      <h4 className="font-semibold text-foreground mb-2">
                        {t('questions.explanation')}
                      </h4>
                      <p className="text-muted-foreground">{question.answer_explain}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-border/50 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex-1"
          >
            {showAnswer ? (
              <>
                <EyeOff className="h-4 w-4 me-2" />
                {t('questions.hideAnswer')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 me-2" />
                {t('questions.seeAnswer')}
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              onTakeQuestion(question.id);
              onClose();
            }}
            className="flex-1 gradient-bg text-white"
          >
            <Play className="h-4 w-4 me-2" />
            {t('questions.takeQuestion')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDetailsModal;
