export interface StorageConfigResponse {
  configured: boolean;
  bucket: string | null;
  message: string;
}

export async function checkStorageConfig(): Promise<StorageConfigResponse> {
  try {
    const res = await fetch('/api/storage/config');
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      bucket: null,
      message: 'Failed to connect to storage service.',
    };
  }
}

export interface UploadOptions {
  folder?: 'videos' | 'thumbnails';
  onProgress?: (percentage: number) => void;
}

export async function uploadToR2WithProgress(
  file: File,
  courseId: string,
  options?: UploadOptions
): Promise<{ objectKey: string; publicUrl: string | null }> {
  const folder = options?.folder || 'videos';
  const onProgress = options?.onProgress;

  // Client-side validations
  if (folder === 'thumbnails') {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type.toLowerCase())) {
      throw new Error('Only JPG, PNG, and WebP images are supported for course thumbnails.');
    }
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Thumbnail image exceeds the maximum 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
    }
  } else if (folder === 'videos') {
    const validVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'video/ogg',
    ];
    if (!validVideoTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      throw new Error('Supported video formats are MP4, WebM, and MOV/QuickTime.');
    }
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video file exceeds the maximum 500 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
    }
  }

  // Step 1: Request presigned upload URL from backend
  const presignedRes = await fetch('/api/storage/presigned-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      courseId,
      folder,
    }),
  });

  const presignedData = await presignedRes.json();
  if (!presignedRes.ok) {
    throw new Error(presignedData.error || presignedData.details || 'Storage upload URL creation failed.');
  }

  const { uploadUrl, objectKey, publicUrl } = presignedData;

  // Step 2: Upload directly to S3/R2 presigned URL with progress monitoring
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`R2 upload rejected with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error occurred during R2 upload. Please check your connection.'));
    xhr.send(file);
  });

  return { objectKey, publicUrl };
}

export async function getSignedPlaybackUrl(objectKey: string): Promise<string> {
  const res = await fetch('/api/storage/playback-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectKey }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate secure playback token');
  }

  return data.playbackUrl;
}

export async function deleteR2Object(objectKey: string): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/delete-object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectKey }),
    });
    const data = await res.json();
    return Boolean(data.deleted);
  } catch (err) {
    console.warn('Failed to delete R2 object:', err);
    return false;
  }
}
