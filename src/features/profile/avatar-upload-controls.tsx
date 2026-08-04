'use client'

import { Pencil, RotateCcw, Trash2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HiddenFileInput } from '@/components/ui/hidden-file-input'
import { Inline } from '@/components/ui/layout/inline'
import {
  completeAvatarUpload,
  deleteAvatar as apiDeleteAvatar,
  getAvatarPresignedUrl,
  restoreGoogleAvatar as apiRestoreGoogleAvatar,
  uploadAvatarFile,
  type AvatarContentType,
} from '@/lib/api'
import { useAuth, useIsDemo } from '@/lib/auth-context'
import { runMutation } from '@/lib/run-mutation'
import { notifyError } from '@/lib/toast'
import { useAvatarToastMessages } from '@/lib/toast-messages/use-avatar-toast-messages'

import { canRestoreGoogleAvatar } from './avatar-restore-rules'

const SUPPORTED_AVATAR_CONTENT_TYPES: readonly AvatarContentType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
]
const MAX_AVATAR_UPLOAD_BYTES = 5 * 1024 * 1024

function isSupportedAvatarContentType(value: string): value is AvatarContentType {
  return (SUPPORTED_AVATAR_CONTENT_TYPES as readonly string[]).includes(value)
}

interface AvatarUploadControlsProps {
  name: string
  pictureUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  textSize?: 'default' | 'sm' | 'md' | 'lg'
}

export function AvatarUploadControls({
  name,
  pictureUrl,
  size = 'xl',
  textSize = 'lg',
}: AvatarUploadControlsProps) {
  const t = useTranslations('profile')
  const toastMessages = useAvatarToastMessages()
  const { user, updateAvatar } = useAuth()
  const isDemo = useIsDemo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const isBusy = isUploading || isDeleting || isRestoring
  const showRestoreGoogle = canRestoreGoogleAvatar({
    avatarSource: user?.avatarSource,
    hasGoogleAvatar: user?.hasGoogleAvatar,
  })

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!isSupportedAvatarContentType(file.type)) {
      notifyError(t('avatar.unsupportedType'))
      return
    }
    if (file.size === 0) {
      notifyError(t('avatar.empty'))
      return
    }
    if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
      notifyError(t('avatar.tooLarge'))
      return
    }
    const contentType = file.type

    setIsUploading(true)
    try {
      const result = await runMutation(
        async () => {
          const { uploadUrl, avatarKey } = await getAvatarPresignedUrl(contentType, file.size)
          await uploadAvatarFile(uploadUrl, file)
          return completeAvatarUpload(avatarKey)
        },
        {
          successMessage: toastMessages.uploadSuccess,
          errorMessage: toastMessages.uploadError,
        },
      )
      updateAvatar(result)
    } catch {
      return
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await runMutation(() => apiDeleteAvatar(), {
        successMessage: toastMessages.removeSuccess,
        errorMessage: toastMessages.removeError,
      })
      updateAvatar(result)
    } catch {
      return
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleRestoreGoogle() {
    setIsRestoring(true)
    try {
      const result = await runMutation(() => apiRestoreGoogleAvatar(), {
        successMessage: toastMessages.restoreSuccess,
        errorMessage: toastMessages.restoreError,
      })
      updateAvatar(result)
    } catch {
      return
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <>
      <Avatar
        name={name}
        pictureUrl={pictureUrl}
        size={size}
        textSize={textSize}
        tone="surface"
        action={
          <DropdownMenu modal={false}>
            <DemoWriteGuard disabled={isBusy}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  shape="pill"
                  aria-label={t('avatar.edit')}
                  loading={isBusy}
                >
                  {isBusy ? null : <Pencil />}
                </Button>
              </DropdownMenuTrigger>
            </DemoWriteGuard>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                <Inline gap={3} align="center">
                  <Upload aria-hidden />
                  {t('avatar.change')}
                </Inline>
              </DropdownMenuItem>
              {showRestoreGoogle ? (
                <DropdownMenuItem onSelect={() => void handleRestoreGoogle()}>
                  <Inline gap={3} align="center">
                    <RotateCcw aria-hidden />
                    {t('avatar.restoreGoogle')}
                  </Inline>
                </DropdownMenuItem>
              ) : null}
              {pictureUrl ? (
                <DropdownMenuItem tone="danger" onSelect={() => void handleDelete()}>
                  <Inline gap={3} align="center">
                    <Trash2 aria-hidden />
                    {t('avatar.remove')}
                  </Inline>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <HiddenFileInput
        ref={fileInputRef}
        accept={SUPPORTED_AVATAR_CONTENT_TYPES.join(',')}
        disabled={isDemo || isBusy}
        onChange={(event) => void handleFileSelected(event)}
      />
    </>
  )
}
