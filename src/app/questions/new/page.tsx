'use client';

import { useRouter } from 'next/navigation';
import { createQuestion, type QuestionInput } from '@/lib/api';
import { runMutation } from '@/lib/run-mutation';
import { TOAST_MESSAGES } from '@/lib/toast-messages';
import { QuestionEditor } from '../question-editor';

export default function NewQuestionPage() {
  const router = useRouter();

  async function handleSubmit(value: QuestionInput) {
    const question = await runMutation(() => createQuestion(value), {
      successMessage: TOAST_MESSAGES.question.createSuccess,
      errorMessage: TOAST_MESSAGES.question.createError,
    });
    router.push(`/questions/${question.id}`);
    return question;
  }

  return (
    <QuestionEditor
      title="New Question"
      submitLabel="Create Question"
      onSubmit={handleSubmit}
      saveToastOptions={{ enabled: false }}
    />
  );
}
