import { QuestionInUseError } from '@/lib/api'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path?: string,
    public readonly body?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isUnauthorizedError(err: unknown): boolean {
  return getApiErrorStatus(err) === 401
}

export function isForbiddenError(err: unknown): boolean {
  return getApiErrorStatus(err) === 403
}

export function getErrorMessage(err: unknown,fallback?:string): string|undefined{
  if(err==null)return undefined
  if(err instanceof Error && err.message.trim().length>0){
    return err.message
  }
  return fallback ?? 'Something went wrong'
}

export function getDeleteQuestionErrorTitle(
  err: unknown,
  defaultTitle: string,
  inUseTitle: string,
): string {
  return err instanceof QuestionInUseError ? inUseTitle : defaultTitle
}

export function isApiError(err:unknown): err is ApiError{
  return err instanceof ApiError
}

export function getApiErrorStatus(err:unknown):number|undefined{
 return isApiError(err) ? err.status :undefined
}

export function isConflictError(err:unknown):boolean{
  return getApiErrorStatus(err)===409
}