import type { Question, QuestionDifficulty } from '@/lib/api';

export type DifficultyFilter = 'all' | QuestionDifficulty;

interface FilterQuestionsParams {
  questions: Question[];
  query: string;
  difficulty: DifficultyFilter;
}

export function filterQuestions({
  questions,
  query,
  difficulty,
}: FilterQuestionsParams): Question[] {
  const normalizedQuery = query.trim().toLowerCase();

  return questions.filter((question) => {
    const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
    if (!matchesDifficulty) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      question.questionText,
      question.role ?? '',
      question.category ?? '',
      question.subcategory ?? '',
      question.tags.join(' '),
      question.expectedConcepts.map((item) => item.label).join(' '),
      question.redFlags.map((item) => item.label).join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
