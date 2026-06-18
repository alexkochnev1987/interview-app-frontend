import { cva, type VariantProps } from 'class-variance-authority'

const spacerVariants = cva('', {
  variants: {
    visibility: {
      always: '',
      'sm-only': 'hidden sm:block',
      'lg-only': 'hidden lg:block',
      'xl-only': 'hidden xl:block',
    },
  },
  defaultVariants: {
    visibility: 'always',
  },
})

type SpacerProps = VariantProps<typeof spacerVariants>

export function Spacer({ visibility }: SpacerProps) {
  return <div aria-hidden className={spacerVariants({ visibility })} />
}
