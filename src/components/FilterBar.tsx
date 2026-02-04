import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Tag, Gauge, FileQuestion } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  questionType: string;
  onTypeChange: (type: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  questionType,
  onTypeChange,
  tags,
  selectedTags,
  onTagToggle,
  onClearFilters,
}) => {
  const { t } = useLanguage();

  const difficulties = [
    { value: '', label: t('questions.difficulty') },
    { value: 'easy', label: t('difficulty.easy') },
    { value: 'medium', label: t('difficulty.medium') },
    { value: 'hard', label: t('difficulty.hard') },
  ];

  const questionTypes = [
    { value: '', label: t('questions.type') },
    { value: 'mcq', label: t('type.mcq') },
    { value: 'essay', label: t('type.essay') },
    { value: 'passage', label: t('type.passage') },
    { value: 'short_answer', label: t('type.short_answer') },
    { value: 'true_false', label: t('type.true_false') },
  ];

  const hasActiveFilters = searchQuery || difficulty || questionType || selectedTags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-4"
    >
      {/* Search and Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('questions.search')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-10 bg-background/50 border-border/50 focus:border-primary"
          />
        </div>

        {/* Difficulty Filter */}
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-full sm:w-40 bg-background/50 border-border/50">
            <Gauge className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder={t('questions.difficulty')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {difficulties.map((d) => (
              <SelectItem key={d.value} value={d.value || 'all'}>
                <span
                  className={cn(
                    d.value === 'easy' && 'text-green-600',
                    d.value === 'medium' && 'text-amber-600',
                    d.value === 'hard' && 'text-red-600'
                  )}
                >
                  {d.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={questionType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full sm:w-44 bg-background/50 border-border/50">
            <FileQuestion className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder={t('questions.type')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {questionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value || 'all'}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={onClearFilters} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>{t('questions.tags')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => onTagToggle(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:border-primary hover:text-primary'
                  )}
                >
                  {tag}
                </Badge>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FilterBar;
