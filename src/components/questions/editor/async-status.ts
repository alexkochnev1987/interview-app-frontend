export type InlineAsyncStatus = 'idle' | 'loading' | 'error'

type MutationStatusInput = {
    isPending: boolean
    isError: boolean
}

export function deriveInlineAsyncStatus({
    isPending,
    isError
                                        }: MutationStatusInput) :InlineAsyncStatus{
    if (isPending) return 'loading'
    if (isError) return 'error'
    return 'idle'
}