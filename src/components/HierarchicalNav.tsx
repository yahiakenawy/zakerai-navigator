import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, BookOpen, Layers, FileText, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Level, Subject, Chapter, levelsApi, subjectsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface HierarchicalNavProps {
  onFilterChange: (filters: {
    levelId?: number;
    subjectId?: number;
    chapterId?: number;
    lessonNumber?: number;
  }) => void;
}

const HierarchicalNav: React.FC<HierarchicalNavProps> = ({ onFilterChange }) => {
  const { t } = useLanguage();
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Record<number, Chapter[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Fetch levels and subjects on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [levelsRes, subjectsRes] = await Promise.all([
          levelsApi.getAll(),
          subjectsApi.getAll(),
        ]);
        setLevels(levelsRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        console.error('Failed to fetch navigation data:', error);
        // Use mock data for development
        setLevels([
          { id: 1, stage: 'Primary', grade: 'Grade 5' },
          { id: 2, stage: 'Primary', grade: 'Grade 6' },
          { id: 3, stage: 'Middle', grade: 'Grade 7' },
        ]);
        setSubjects([
          { id: 1, name: 'Mathematics', semester: 'First', level: { id: 1, stage: 'Primary', grade: 'Grade 5' }, is_active: true },
          { id: 2, name: 'Science', semester: 'First', level: { id: 1, stage: 'Primary', grade: 'Grade 5' }, is_active: true },
          { id: 3, name: 'English', semester: 'First', level: { id: 2, stage: 'Primary', grade: 'Grade 6' }, is_active: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch chapters when a subject is expanded
  const fetchChapters = async (subjectId: number) => {
    if (chapters[subjectId]) return;
    try {
      const response = await subjectsApi.getChapters(subjectId);
      setChapters((prev) => ({ ...prev, [subjectId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
      // Mock data
      setChapters((prev) => ({
        ...prev,
        [subjectId]: [
          { id: 1, name: 'Algebra Basics', number: 1, is_active: true, lesson_numbers: [1, 2, 3, 4, 5] },
          { id: 2, name: 'Geometry', number: 2, is_active: true, lesson_numbers: [1, 2, 3] },
        ],
      }));
    }
  };

  const toggleLevel = (levelId: number) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const toggleSubject = async (subjectId: number) => {
    await fetchChapters(subjectId);
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevel(levelId);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedLesson(null);
    onFilterChange({ levelId });
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedLevel(subject.level.id);
    setSelectedSubject(subject.id);
    setSelectedChapter(null);
    setSelectedLesson(null);
    onFilterChange({ levelId: subject.level.id, subjectId: subject.id });
  };

  const handleChapterSelect = (chapter: Chapter, subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    setSelectedLevel(subject.level.id);
    setSelectedSubject(subjectId);
    setSelectedChapter(chapter.id);
    setSelectedLesson(null);
    onFilterChange({ levelId: subject.level.id, subjectId, chapterId: chapter.id });
  };

  const handleLessonSelect = (lessonNumber: number, chapterId: number, subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    setSelectedLevel(subject.level.id);
    setSelectedSubject(subjectId);
    setSelectedChapter(chapterId);
    setSelectedLesson(lessonNumber);
    onFilterChange({
      levelId: subject.level.id,
      subjectId,
      chapterId,
      lessonNumber,
    });
  };

  const getSubjectsForLevel = (levelId: number) => {
    return subjects.filter((s) => s.level.id === levelId);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          {t('levels.title')}
        </h3>

        {levels.map((level) => (
          <div key={level.id} className="space-y-1">
            {/* Level Item */}
            <motion.button
              onClick={() => {
                toggleLevel(level.id);
                handleLevelSelect(level.id);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start transition-all duration-200',
                'hover:bg-secondary/80',
                selectedLevel === level.id && 'bg-gradient-primary text-primary-foreground shadow-md'
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                animate={{ rotate: expandedLevels.has(level.id) ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
              <Layers className="h-4 w-4" />
              <div className="flex-1">
                <span className="font-medium">{level.stage}</span>
                <span className="text-sm opacity-80 block">{level.grade}</span>
              </div>
            </motion.button>

            {/* Subjects */}
            <AnimatePresence>
              {expandedLevels.has(level.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden ms-6"
                >
                  {getSubjectsForLevel(level.id).map((subject) => (
                    <div key={subject.id} className="space-y-1">
                      <motion.button
                        onClick={() => {
                          toggleSubject(subject.id);
                          handleSubjectSelect(subject);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-start transition-all duration-200',
                          'hover:bg-secondary/60',
                          selectedSubject === subject.id && 'bg-secondary text-secondary-foreground'
                        )}
                        whileHover={{ x: 4 }}
                      >
                        <motion.div
                          animate={{ rotate: expandedSubjects.has(subject.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </motion.div>
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="flex-1 font-medium">{subject.name}</span>
                        <span className="text-xs text-muted-foreground">{subject.semester}</span>
                      </motion.button>

                      {/* Chapters */}
                      <AnimatePresence>
                        {expandedSubjects.has(subject.id) && chapters[subject.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden ms-6"
                          >
                            {chapters[subject.id].map((chapter) => (
                              <div key={chapter.id} className="space-y-1">
                                <motion.button
                                  onClick={() => {
                                    toggleChapter(chapter.id);
                                    handleChapterSelect(chapter, subject.id);
                                  }}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-start transition-all duration-200',
                                    'hover:bg-secondary/40',
                                    selectedChapter === chapter.id && 'bg-accent/20 text-accent-foreground'
                                  )}
                                  whileHover={{ x: 4 }}
                                >
                                  <motion.div
                                    animate={{ rotate: expandedChapters.has(chapter.id) ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </motion.div>
                                  <FileText className="h-4 w-4 text-accent" />
                                  <span className="flex-1 text-sm">{chapter.name}</span>
                                </motion.button>

                                {/* Lessons */}
                                <AnimatePresence>
                                  {expandedChapters.has(chapter.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden ms-6 flex flex-wrap gap-2 py-2"
                                    >
                                      {chapter.lesson_numbers.map((lessonNum) => (
                                        <motion.button
                                          key={lessonNum}
                                          onClick={() =>
                                            handleLessonSelect(lessonNum, chapter.id, subject.id)
                                          }
                                          className={cn(
                                            'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                                            'border border-border hover:border-primary hover:bg-primary/10',
                                            selectedLesson === lessonNum &&
                                              selectedChapter === chapter.id &&
                                              'bg-primary text-primary-foreground border-primary'
                                          )}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          {t('lesson')} {lessonNum}
                                        </motion.button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default HierarchicalNav;
