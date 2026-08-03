'use client'

import { useEffect } from 'react'

interface HtmlLangSyncProps {
  lang: string
}

export function HtmlLangSync({ lang }: HtmlLangSyncProps) {
  useEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang
    }
  }, [lang])

  return null
}
