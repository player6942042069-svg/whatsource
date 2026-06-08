// Client-side media processing utilities

/**
 * Compress an image file to under maxMB before sending to API.
 * Returns { base64, mimeType }
 */
export async function prepareImage(file, maxMB = 3) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');

      // Resize so longest side <= 1280px
      let { width, height } = img;
      const maxDim = 1280;
      if (width > maxDim || height > maxDim) {
        if (width >= height) { height = Math.round((height / width) * maxDim); width = maxDim; }
        else                 { width  = Math.round((width / height) * maxDim); height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      const maxBytes = maxMB * 1024 * 1024;
      let quality = 0.88;

      const tryCompress = () => {
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          if (blob.size <= maxBytes || quality <= 0.25) {
            const reader = new FileReader();
            reader.onload = e => {
              const dataUrl = e.target.result;
              const base64  = dataUrl.split(',')[1];
              const mime    = blob.type;
              resolve({ base64, mimeType: mime });
            };
            reader.readAsDataURL(blob);
          } else {
            quality = Math.max(0.25, quality - 0.1);
            tryCompress();
          }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/**
 * Extract the best representative frame from a video file.
 * Seeks to 20% in (avoids intros), returns { base64, mimeType }
 */
export async function extractVideoFrame(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      // Seek to 20% through the video for a representative frame
      video.currentTime = Math.max(2, video.duration * 0.2);
    };

    video.onseeked = async () => {
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(async blob => {
        if (!blob) return reject(new Error('Frame extraction failed'));
        const frameFile = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        try {
          const result = await prepareImage(frameFile);
          resolve(result);
        } catch (e) { reject(e); }
      }, 'image/jpeg', 0.9);
    };

    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Video load failed')); };
    video.src = url;
    video.load();
  });
}

/**
 * Main entry: accepts any file, returns { base64, mimeType, previewUrl }
 */
export async function processUpload(file) {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  if (!isImage && !isVideo) throw new Error('Unsupported file type');

  const previewUrl = URL.createObjectURL(file);

  if (isVideo) {
    const { base64, mimeType } = await extractVideoFrame(file);
    return { base64, mimeType, previewUrl, isVideo: true };
  } else {
    const { base64, mimeType } = await prepareImage(file);
    return { base64, mimeType, previewUrl, isVideo: false };
  }
}

/** Get user's public IP - fast 2s timeout, silent fail */
export async function getClientIp() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const r = await fetch('https://api64.ipify.org?format=json', { signal: ctrl.signal });
    clearTimeout(t);
    const d = await r.json();
    return d.ip || '';
  } catch { return ''; }
}
