'use client'

import { UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'

import {
  ComboboxPopover,
  ComboboxPopoverAnchor,
  ComboboxPopoverContent,
  ComboboxPopoverItem,
} from '@/components/ui/combobox-popover'
import { Icon } from '@/components/ui/icon'
import { IconAffix } from '@/components/ui/icon-affix'
import { Input } from '@/components/ui/input'
import { BodyText } from '@/components/ui/text'
import type { CandidateSummary } from '@/lib/api'

import { useCandidateSearch } from './hooks/use-candidate-search'

interface CandidateNameComboboxProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onSelectCandidate: (candidate: CandidateSummary) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * The candidate-name input, augmented with a live typeahead: matching
 * registered candidates (existing portal accounts) show up as you type, and
 * picking one fills the email field too. Free typing still works as before
 * for candidates who haven't registered yet — this never restricts the
 * value to an existing option.
 */
export function CandidateNameCombobox({
  id,
  value,
  onChange,
  onSelectCandidate,
  placeholder,
  disabled,
}: CandidateNameComboboxProps) {
  const t = useTranslations('questions.common')
  const listboxId = useId()
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const { candidates, loading } = useCandidateSearch(value, { enabled: focused && !dismissed })
  const open =
    focused && !dismissed && value.trim().length >= 2 && (loading || candidates.length > 0)

  useEffect(() => {
    setHighlightedIndex(0)
  }, [candidates])

  function handleSelect(candidate: CandidateSummary) {
    onSelectCandidate(candidate)
    setDismissed(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setDismissed(true)
      return
    }
    if (!open || candidates.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => (index + 1) % candidates.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => (index - 1 + candidates.length) % candidates.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      handleSelect(candidates[highlightedIndex])
    }
  }

  return (
    <ComboboxPopover open={open}>
      <ComboboxPopoverAnchor asChild>
        <IconAffix
          icon={
            <Icon size="md">
              <UserRound />
            </Icon>
          }
        >
          <Input
            id={id}
            iconAffix="leading"
            value={value}
            onChange={(event) => {
              onChange(event.target.value)
              setDismissed(false)
            }}
            onFocus={() => {
              setFocused(true)
              setDismissed(false)
            }}
            onBlur={() => {
              // Delay so a suggestion's onClick fires before the list unmounts.
              window.setTimeout(() => setFocused(false), 150)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- no native element covers the ARIA 1.2 combobox pattern; aria-controls below satisfies role-has-required-aria-props
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listboxId}
            disabled={disabled}
          />
        </IconAffix>
      </ComboboxPopoverAnchor>
      <ComboboxPopoverContent
        id={listboxId}
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- async, richly-rendered suggestion list; no native <datalist> equivalent
        role="listbox"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {loading ? (
          <BodyText size="sm" tone="muted">
            {t('candidateSelectLoading')}
          </BodyText>
        ) : (
          candidates.map((candidate, index) => (
            <ComboboxPopoverItem
              key={candidate.id}
              // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- paired with the listbox above; not a native <option>
              role="option"
              aria-selected={index === highlightedIndex}
              active={index === highlightedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(candidate)}
            >
              <BodyText size="sm" tone="foreground" weight="medium">
                {candidate.name}
              </BodyText>
              <BodyText size="xs" tone="muted">
                {candidate.email}
              </BodyText>
            </ComboboxPopoverItem>
          ))
        )}
      </ComboboxPopoverContent>
    </ComboboxPopover>
  )
}
