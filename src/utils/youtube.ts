/**
 * Validates and normalizes YouTube URLs into secure embed format.
 * Supports standard watch URLs, youtu.be links, shorts, and live stream embeds.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: Standard youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  // Pattern 2: YouTube Live /live/VIDEO_ID
  const liveMatch = trimmed.match(/youtube\.com\/live\/([^"&?\/\s]+)/i);
  if (liveMatch && liveMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${liveMatch[1]}?rel=0&modestbranding=1`;
  }

  // Pattern 3: Already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  return null;
}
