import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Shield, Shuffle, CheckSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExam } from '@/contexts/ExamContext';
import { useAuth } from '@/contexts/AuthContext';
import { examsApi, CreateExamPayload } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  levelId?: number;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  levelId,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { selectedQuestions, totalPoints, totalTime, clearQuestions } = useExam();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    duration_minutes: totalTime || 60,
    start_time: '',
    deadline: '',
    klass: '',
    difficulty: '',
    prevent_cheating: true,
    allowed_attempts: 1,
    randomize_questions: false,
    randomize_order_for_stud: false,
    auto_grade_release: true,
  });

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'head';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: CreateExamPayload = {
        title: formData.title,
        instructions: formData.instructions || undefined,
        duration_minutes: formData.duration_minutes,
        start_time: new Date(formData.start_time).toISOString(),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        level: levelId || 1,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        prevent_cheating: formData.prevent_cheating,
        allowed_attempts: formData.allowed_attempts,
        randomize_questions: formData.randomize_questions,
        randomize_order_for_stud: formData.randomize_order_for_stud,
        auto_grade_release: formData.auto_grade_release,
        questions: selectedQuestions.map((q, index) => ({
          question: q.id,
          points: q.points,
          display_order: index + 1,
        })),
      };

      if (isTeacher && formData.klass) {
        payload.klass = parseInt(formData.klass);
      }

      await examsApi.create(payload);

      toast({
        title: 'Success',
        description: 'Exam created successfully!',
      });

      clearQuestions();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to create exam. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Set minimum start time to now + 5 minutes
  const minStartTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            {t('exams.create')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {selectedQuestions.length} questions • {totalPoints} points • ~{totalTime} min
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('exams.examTitle')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter exam title"
              required
              className="bg-background/50"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">{t('exams.instructions')}</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Enter instructions for students"
              rows={3}
              className="bg-background/50"
            />
          </div>

          {/* Duration & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('exams.duration')} *
              </Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={300}
                value={formData.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attempts" className="flex items-center gap-2">
                {t('exams.allowedAttempts')}
              </Label>
              <Input
                id="attempts"
                type="number"
                min={1}
                max={10}
                value={formData.allowed_attempts}
                onChange={(e) => handleChange('allowed_attempts', parseInt(e.target.value))}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Start Time & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('exams.startTime')} *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                min={minStartTime}
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center gap-2">
                {t('exams.deadline')}
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                min={formData.start_time || minStartTime}
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Class (Teachers only) */}
          {isTeacher && (
            <div className="space-y-2">
              <Label htmlFor="klass" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('exams.class')}
              </Label>
              <Select value={formData.klass} onValueChange={(v) => handleChange('klass', v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a class (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="1">Class 1A</SelectItem>
                  <SelectItem value="2">Class 1B</SelectItem>
                  <SelectItem value="3">Class 2A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>{t('questions.difficulty')}</Label>
            <Select value={formData.difficulty} onValueChange={(v) => handleChange('difficulty', v)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Auto-calculated from questions" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="easy">{t('difficulty.easy')}</SelectItem>
                <SelectItem value="medium">{t('difficulty.medium')}</SelectItem>
                <SelectItem value="hard">{t('difficulty.hard')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="prevent_cheating" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4 text-primary" />
                {t('exams.preventCheating')}
              </Label>
              <Switch
                id="prevent_cheating"
                checked={formData.prevent_cheating}
                onCheckedChange={(v) => handleChange('prevent_cheating', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="randomize" className="flex items-center gap-2 cursor-pointer">
                <Shuffle className="h-4 w-4 text-accent" />
                {t('exams.randomizeQuestions')}
              </Label>
              <Switch
                id="randomize"
                checked={formData.randomize_order_for_stud}
                onCheckedChange={(v) => handleChange('randomize_order_for_stud', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto_grade" className="flex items-center gap-2 cursor-pointer">
                <CheckSquare className="h-4 w-4" />
                {t('exams.autoGradeRelease')}
              </Label>
              <Switch
                id="auto_grade"
                checked={formData.auto_grade_release}
                onCheckedChange={(v) => handleChange('auto_grade_release', v)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('exams.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="gradient-bg text-white">
              {loading ? t('common.loading') : t('exams.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamModal;
