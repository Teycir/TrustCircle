export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  if (maxRetries < 1) throw new Error('maxRetries must be at least 1')
  if (delayMs < 0) throw new Error('delayMs must be non-negative')

  let lastError: Error = new Error('Unknown error')

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }

  throw lastError
}
