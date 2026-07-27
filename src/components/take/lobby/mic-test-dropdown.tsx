'use client'

import { useState } from 'react'
import { ChevronUp, CircleDot, Pause, Square, Volume2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Inline, Stack } from '@/components/ui/layout'
import { MicLevelMeter } from '@/components/ui/take'
import { useMicTest } from './use-mic-test'

interface MicTestDropdownProps {
  stream: MediaStream | null
  micOn: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export function MicTestDropdown({
  stream,
  micOn,
  disabled = false,
  children,
}: MicTestDropdownProps) {
  const tTake = useTranslations('takeFlow')
  const [isOpen, setIsOpen] = useState(false)
  const { isRecording, audioUrl, isPlaying, startRecording, stopRecording, togglePlayback } =
    useMicTest(stream, micOn, isOpen)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative inline-flex items-center">
        {children}
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-xxs"
            disabled={disabled || !micOn}
            className="absolute -bottom-0.5 -right-0.5 z-10 size-5 border-border bg-background p-0.5 shadow-sm hover:bg-muted"
            aria-label={tTake('lobbyToolbarMicTest')}
          >
            <ChevronUp className="size-3 text-foreground" />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        align="center"
        side="top"
        sideOffset={12}
        className="w-48 rounded-2xl border border-hairline-strong bg-popover p-3 shadow-float"
      >
        <Inline align="stretch" gap={3} width="full">
          <MicLevelMeter stream={micOn ? stream : null} />
          <Stack gap={2} grow="fill" width="full">
            {isRecording ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                shape="pill"
                width="full"
                onClick={stopRecording}
              >
                <Square className="size-3.5 fill-current" />
                {tTake('lobbyMicStopRecord')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                shape="pill"
                width="full"
                disabled={!micOn || !stream}
                onClick={startRecording}
              >
                <CircleDot className="size-3.5 text-red-600 dark:text-red-400" />
                {tTake('lobbyMicStartRecord')}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              shape="pill"
              width="full"
              disabled={!audioUrl || isRecording}
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
              {isPlaying
                ? tTake('lobbyMicPause')
                : tTake('lobbyMicPlay')}
            </Button>
          </Stack>
        </Inline>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
