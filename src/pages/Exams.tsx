import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, CheckCircle2, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Exams = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock exam data - in real app this would come from API
  const exams = [
    {
      id: 1,
      title: 'Mathematics Midterm',
      status: 'upcoming',
      start_time: '2025-02-15T10:00:00Z',
      duration_minutes: 60,
      questions_count: 25,
      total_points: 100,
    },
    {
      id: 2,
      title: 'Science Quiz',
      status: 'active',
      start_time: '2025-02-04T08:00:00Z',
      duration_minutes: 30,
      questions_count: 15,
      total_points: 50,
    },
    {
      id: 3,
      title: 'History Test',
      status: 'completed',
      start_time: '2025-02-01T09:00:00Z',
      duration_minutes: 45,
      questions_count: 20,
      total_points: 75,
      score: 68,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('common.previous')}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text">{t('exams.title')}</h1>
          </div>

          {/* Exams Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  {getStatusBadge(exam.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{exam.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    <span>{exam.total_points} pts</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {exam.questions_count} questions
                </div>

                {exam.status === 'completed' && exam.score !== undefined && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      Score: {exam.score}/{exam.total_points}
                    </span>
                  </div>
                )}

                {exam.status === 'active' && (
                  <Button className="w-full gradient-bg text-white">
                    <Play className="h-4 w-4 me-2" />
                    Start Exam
                  </Button>
                )}

                {exam.status === 'upcoming' && (
                  <Button variant="outline" className="w-full" disabled>
                    Starts {new Date(exam.start_time).toLocaleDateString()}
                  </Button>
                )}

                {exam.status === 'completed' && (
                  <Button variant="secondary" className="w-full">
                    View Results
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {exams.length === 0 && (
            <div className="glass-card p-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No exams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first exam from the questions page
              </p>
              <Button onClick={() => navigate('/')} className="gradient-bg text-white">
                Browse Questions
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Exams;
