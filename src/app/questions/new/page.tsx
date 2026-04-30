'use client';

import { useRouter } from 'next/navigation';
import { createQuestion, type QuestionInput } from '@/lib/api';
import { QuestionEditor } from '../question-editor';

export default function NewQuestionPage() {
  const router = useRouter();

  async function handleSubmit(value: QuestionInput) {
    const question = await createQuestion(value);
    router.push(`/questions/${question.id}`);
    return question;
  }

  return (
    <QuestionEditor
      title="New Question"
      submitLabel="Create Question"
      onSubmit={handleSubmit}
    />
  );
}
