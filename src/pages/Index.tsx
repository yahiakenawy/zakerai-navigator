import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExam } from '@/contexts/ExamContext';
import { Question, PaginatedResponse, questionsApi, examsApi } from '@/lib/api';
import Header from '@/components/Header';
import HierarchicalNav from '@/components/HierarchicalNav';
import FilterBar from '@/components/FilterBar';
import QuestionCard from '@/components/QuestionCard';
import QuestionDetailsModal from '@/components/QuestionDetailsModal';
import SelectedQuestionsList from '@/components/SelectedQuestionsList';
import CreateExamModal from '@/components/CreateExamModal';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { t } = useLanguage();
  const { selectedQuestions } = useExam();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Navigation filters
  const [navFilters, setNavFilters] = useState<{
    levelId?: number;
    subjectId?: number;
    chapterId?: number;
    lessonNumber?: number;
  }>({});

  // Filter bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags] = useState(['algebra', 'geometry', 'calculus', 'physics', 'chemistry']);

  // Questions data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
  });

  // Modals
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        page: pagination.currentPage,
        page_size: pagination.itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (difficulty && difficulty !== 'all') params.difficulty = difficulty;
      if (questionType && questionType !== 'all') params.type_ans = questionType;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      if (navFilters.subjectId) params.subj = navFilters.subjectId;
      if (navFilters.chapterId) params.chapter_id = navFilters.chapterId;
      if (navFilters.lessonNumber) params.lesson_number = navFilters.lessonNumber;

      const response = await questionsApi.getAll(params);
      const data: PaginatedResponse<Question> = response.data;

      setQuestions(data.results);
      setPagination((prev) => ({
        ...prev,
        count: data.count,
        totalPages: Math.ceil(data.count / prev.itemsPerPage),
      }));
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      // Use mock data for development
      setQuestions([
        {
          id: 1,
          type_ans: 'mcq',
          difficulty: 'easy',
          estimated_time_minutes: 5,
          question_head: 'What is the square root of 144?',
          points: 10,
          subject_name: 'Mathematics',
          chapter_name: 'Algebra Basics',
          tags: ['algebra', 'basics'],
          lesson_number: 1,
          level: { id: 1, stage: 'Primary', grade: 'Grade 5' },
          subject_semester: 'First',
          mcq_options: [{ id: 1, options: ['10', '11', '12', '13'] }],
          correct_answer: '12',
          answer_explain: 'The square root of 144 is 12 because 12 × 12 = 144',
        },
        {
          id: 2,
          type_ans: 'mcq',
          difficulty: 'medium',
          estimated_time_minutes: 8,
          question_head: 'Solve for x: 2x + 5 = 15',
          points: 15,
          subject_name: 'Mathematics',
          chapter_name: 'Algebra Basics',
          tags: ['algebra', 'equations'],
          lesson_number: 2,
          level: { id: 1, stage: 'Primary', grade: 'Grade 5' },
          subject_semester: 'First',
          mcq_options: [{ id: 2, options: ['3', '4', '5', '6'] }],
          correct_answer: '5',
          answer_explain: '2x + 5 = 15, 2x = 10, x = 5',
        },
        {
          id: 3,
          type_ans: 'essay',
          difficulty: 'hard',
          estimated_time_minutes: 20,
          question_head: 'Explain the relationship between differentiation and integration in calculus.',
          points: 25,
          subject_name: 'Mathematics',
          chapter_name: 'Calculus',
          tags: ['calculus', 'integration', 'differentiation'],
          lesson_number: 1,
          level: { id: 3, stage: 'Middle', grade: 'Grade 7' },
          subject_semester: 'Second',
          correct_answer: 'Differentiation and integration are inverse operations...',
          answer_explain: 'The Fundamental Theorem of Calculus establishes the relationship.',
        },
        {
          id: 4,
          type_ans: 'passage',
          difficulty: 'medium',
          estimated_time_minutes: 15,
          question_head: 'Read the following passage about the water cycle and answer the questions below...',
          points: 30,
          subject_name: 'Science',
          chapter_name: 'Earth Science',
          tags: ['water cycle', 'earth science'],
          lesson_number: 3,
          level: { id: 1, stage: 'Primary', grade: 'Grade 5' },
          subject_semester: 'First',
          mini_questions: [
            { id: 5, type_ans: 'mcq', question_head: 'What is evaporation?', mcq_options: [{ id: 3, options: ['Water turning to gas', 'Water turning to ice', 'Rain falling', 'Snow forming'] }], correct_answer: 'Water turning to gas', points: 10 },
            { id: 6, type_ans: 'mcq', question_head: 'Where does most evaporation occur?', mcq_options: [{ id: 4, options: ['Lakes', 'Rivers', 'Oceans', 'Ponds'] }], correct_answer: 'Oceans', points: 10 },
          ],
        },
        {
          id: 5,
          type_ans: 'true_false',
          difficulty: 'easy',
          estimated_time_minutes: 2,
          question_head: 'The Earth revolves around the Sun.',
          points: 5,
          subject_name: 'Science',
          chapter_name: 'Astronomy',
          tags: ['astronomy', 'solar system'],
          lesson_number: 1,
          level: { id: 1, stage: 'Primary', grade: 'Grade 5' },
          subject_semester: 'First',
          correct_answer: 'True',
        },
        {
          id: 6,
          type_ans: 'short_answer',
          difficulty: 'medium',
          estimated_time_minutes: 10,
          question_head: 'What is the chemical formula for water?',
          points: 10,
          subject_name: 'Chemistry',
          chapter_name: 'Chemical Formulas',
          tags: ['chemistry', 'formulas'],
          lesson_number: 2,
          level: { id: 2, stage: 'Primary', grade: 'Grade 6' },
          subject_semester: 'First',
          correct_answer: 'H2O',
          answer_explain: 'Water consists of two hydrogen atoms and one oxygen atom.',
        },
      ]);
      setPagination((prev) => ({
        ...prev,
        count: 6,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchQuery, difficulty, questionType, selectedTags, navFilters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handlers
  const handleViewDetails = async (question: Question) => {
    try {
      // Fetch full question details
      const response = await questionsApi.getById(question.id);
      setSelectedQuestion(response.data);
    } catch {
      // Use the question we already have
      setSelectedQuestion(question);
    }
    setIsDetailsModalOpen(true);
  };

  const handleTakeQuestion = async (questionId: number) => {
    try {
      await examsApi.takeQuestion(questionId);
      toast({
        title: 'Success',
        description: 'Exam started! Redirecting...',
      });
      navigate('/exams');
    } catch (error) {
      console.error('Failed to take question:', error);
      toast({
        title: 'Info',
        description: 'Demo mode - would start exam for question #' + questionId,
      });
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDifficulty('');
    setQuestionType('');
    setSelectedTags([]);
  };

  const handleNavFilterChange = (filters: typeof navFilters) => {
    setNavFilters(filters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
        {/* Create Exam Button (Top) */}
        {selectedQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => setIsCreateExamModalOpen(true)}
              size="lg"
              className="gradient-bg text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-5 w-5 me-2" />
              {t('exams.create')} ({selectedQuestions.length} {t('exams.selected').toLowerCase()})
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-3">
            <div className="glass-card sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
              <HierarchicalNav onFilterChange={handleNavFilterChange} />
            </div>
          </aside>

          {/* Main Content - Questions */}
          <main className="lg:col-span-6 space-y-6">
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              questionType={questionType}
              onTypeChange={setQuestionType}
              tags={availableTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearFilters={handleClearFilters}
            />

            {/* Questions Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="glass-card p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold mb-2">{t('common.error')}</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchQuestions}>{t('common.retry')}</Button>
              </div>
            ) : questions.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{t('questions.noResults')}</h3>
                <p className="text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${pagination.currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-4"
                >
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onViewDetails={handleViewDetails}
                      onTakeQuestion={handleTakeQuestion}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {!loading && questions.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.count}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </main>

          {/* Right Sidebar - Selected Questions */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <SelectedQuestionsList onCreateExam={() => setIsCreateExamModalOpen(true)} />
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <QuestionDetailsModal
        question={selectedQuestion}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onTakeQuestion={handleTakeQuestion}
      />

      <CreateExamModal
        isOpen={isCreateExamModalOpen}
        onClose={() => setIsCreateExamModalOpen(false)}
        onSuccess={() => navigate('/exams')}
        levelId={navFilters.levelId}
      />
    </div>
  );
};

export default Index;
