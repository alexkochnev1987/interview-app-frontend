import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DifficultyFilter } from '@/features/questions/filter-questions';

interface QuestionsToolbarProps {
  query: string;
  difficulty: DifficultyFilter;
  onQueryChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyFilter) => void;
}

export function QuestionsToolbar({
  query,
  difficulty,
  onQueryChange,
  onDifficultyChange,
}: QuestionsToolbarProps) {
  return (
    <Card className="border-white/60 bg-white/86 shadow-soft">
      <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by prompt, role, category, concept, or red flag"
            className="h-12 rounded-full border-white/70 bg-[hsl(var(--surface-low)/0.8)] pl-11 shadow-none"
          />
        </div>
        <Select value={difficulty} onValueChange={(value) => onDifficultyChange(value as DifficultyFilter)}>
          <SelectTrigger className="h-12 w-full rounded-full border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 shadow-none">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
