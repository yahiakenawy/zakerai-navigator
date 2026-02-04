import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Award, Eye, Plus, Trash2, Play } from 'lucide-react';
import { Question } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExam } from '@/contexts/ExamContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onViewDetails: (question: Question) => void;
  onTakeQuestion: (questionId: number) => void;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onViewDetails,
  onTakeQuestion,
  index,
}) => {
  const { t } = useLanguage();
  const { addQuestion, removeQuestion, isSelected } = useExam();
  const selected = isSelected(question.id);

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
      case 'short_answer':
      case 'true_false':
        return 'type-short_answer';
      default:
        return '';
    }
  };

  const handleToggleSelection = () => {
    if (selected) {
      removeQuestion(question.id);
    } else {
      addQuestion(question);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'glass-card p-5 transition-all duration-300 group',
        'hover:shadow-lg hover:scale-[1.01]',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={cn('font-medium', getDifficultyClass(question.difficulty))}>
              {t(`difficulty.${question.difficulty}`)}
            </Badge>
            <Badge className={cn('font-medium', getTypeClass(question.type_ans))}>
              {t(`type.${question.type_ans}`)}
            </Badge>
            {question.parent_passage && (
              <Badge variant="outline" className="text-xs">
                Sub-question
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold leading-relaxed line-clamp-2">
            {question.question_head}
          </h3>
        </div>

        {/* Selection Button */}
        <Button
          variant={selected ? 'default' : 'outline'}
          size="icon"
          onClick={handleToggleSelection}
          className={cn(
            'shrink-0 transition-all duration-200',
            selected && 'gradient-bg text-white'
          )}
        >
          {selected ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" />
          <span>
            {question.points} {t('questions.points')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-accent" />
          <span>
            {question.estimated_time_minutes} {t('questions.minutes')}
          </span>
        </div>
        <span className="text-xs">
          {question.subject_name} • {question.chapter_name}
        </span>
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {question.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-secondary/50"
            >
              {tag}
            </Badge>
          ))}
          {question.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs bg-secondary/50">
              +{question.tags.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(question)}
          className="flex-1 hover:bg-secondary"
        >
          <Eye className="h-4 w-4 me-2" />
          {t('questions.details')}
        </Button>
        <Button
          size="sm"
          onClick={() => onTakeQuestion(question.id)}
          className="flex-1 gradient-bg text-white hover:opacity-90"
        >
          <Play className="h-4 w-4 me-2" />
          {t('questions.takeQuestion')}
        </Button>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
