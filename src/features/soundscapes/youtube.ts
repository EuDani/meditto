/** Extracts a YouTube video ID from a full URL or returns the input if it already looks like an ID. */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  const idPattern = /^[a-zA-Z0-9_-]{11}$/
  if (idPattern.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1)
      return idPattern.test(id) ? id : null
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v && idPattern.test(v)) return v
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (shortsMatch) return shortsMatch[1]
    }
  } catch {
    return null
  }
  return null
}
