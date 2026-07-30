'use client'

import { useRef, useState } from 'react'
import { Pencil, Trash2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { HiddenFileInput } from '@/components/ui/hidden-file-input'
import { Inline } from '@/components/ui/layout/inline'
import { useAuth, useIsDemo } from '@/lib/auth-context'
import {
  completeAvatarUpload,
  deleteAvatar as apiDeleteAvatar,
  getAvatarPresignedUrl,
  uploadAvatarFile,
  type AvatarContentType,
} from '@/lib/api'
import { notifyError } from '@/lib/toast'
import { runMutation } from '@/lib/run-mutation'
import { useAvatarToastMessages } from '@/lib/toast-messages/use-avatar-toast-messages'

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
  const tCommon = useTranslations('common')
  const toastMessages = useAvatarToastMessages()
  const { updatePictureUrl } = useAuth()
  const isDemo = useIsDemo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!isSupportedAvatarContentType(file.type)) {
      notifyError(t('avatar.unsupportedType'))
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
      updatePictureUrl(result.pictureUrl ?? null)
    } catch {
      setIsUploading(false)
      return
    }
    setIsUploading(false)
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await runMutation(() => apiDeleteAvatar(), {
        successMessage: toastMessages.removeSuccess,
        errorMessage: toastMessages.removeError,
      })
      updatePictureUrl(result.pictureUrl ?? null)
    } catch {
      setIsDeleting(false)
      return
    }
    setIsDeleting(false)
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
          <DisabledHintTooltip active={isDemo} hint={tCommon('demoMode.readOnlyHint')}>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  shape="pill"
                  aria-label={t('avatar.edit')}
                  disabled={isDemo || isUploading || isDeleting}
                >
                  <Pencil />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                  <Inline gap={3} align="center">
                    <Upload aria-hidden />
                    {isUploading ? t('avatar.uploading') : t('avatar.change')}
                  </Inline>
                </DropdownMenuItem>
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
          </DisabledHintTooltip>
        }
      />
      <HiddenFileInput
        ref={fileInputRef}
        accept={SUPPORTED_AVATAR_CONTENT_TYPES.join(',')}
        onChange={(event) => void handleFileSelected(event)}
      />
    </>
  )
}
