'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

interface CandidateFeedbackGenerateButtonProps {
  label: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}

export function CandidateFeedbackGenerateButton({
  label,
  loading,
  disabled,
  onClick,
}: CandidateFeedbackGenerateButtonProps) {
  return (
    <Button
      type="button"
      variant="outline-pill"
      shape="pill"
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size="sm">
        <Sparkles />
      </Icon>
      {label}
    </Button>
  )
}
