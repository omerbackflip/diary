const crypto = require('crypto');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

async function normalizeCapturedMedia({
  fileContent,
  frames,
  frameRate,
  encoding,
  audioContent,
  audioMimeType,
  mimeType,
  mediaType,
  imageMimeType = 'image/jpeg',
} = {}) {
  const isFrameVideo = mediaType === 'video' && encoding === 'jpeg-frames';

  if (isFrameVideo) {
    const buffer = await convertJpegFramesToMp4({
      frames,
      frameRate,
      audioContent,
      audioMimeType,
    });

    return {
      buffer,
      mimeType: 'video/mp4',
      mediaType: 'video',
      extension: '.mp4',
    };
  }

  if (!fileContent) {
    throw new Error('Missing media content');
  }

  const detectedMimeType = getMediaMimeType(fileContent, mimeType, mediaType);
  const inputBuffer = decodeBase64Media(fileContent);
  const isVideo = detectedMimeType.startsWith('video/') || mediaType === 'video';

  if (!isVideo) {
    return {
      buffer: inputBuffer,
      mimeType: imageMimeType,
      mediaType: 'image',
      extension: '.jpeg',
    };
  }

  const buffer = await convertVideoBufferToMp4(inputBuffer, detectedMimeType);

  return {
    buffer,
    mimeType: 'video/mp4',
    mediaType: 'video',
    extension: '.mp4',
  };
}

async function convertJpegFramesToMp4(options = {}) {
  const {
    frames,
    frameRate = 8,
    audioContent,
    audioMimeType,
  } = options;

  if (!ffmpegPath) {
    throw new Error('ffmpeg binary was not found. Install ffmpeg-static before saving camera videos.');
  }

  if (!Array.isArray(frames) || frames.length < 2) {
    throw new Error('At least two video frames are required to create MP4 video.');
  }

  const normalizedFrameRate = Math.max(1, Math.min(Number(frameRate) || 8, 24));
  const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'camera-frames-'));
  const outputPath = path.join(workDir, `output-${crypto.randomUUID()}.mp4`);
  const hasAudio = Boolean(audioContent);
  const audioBuffer = hasAudio ? decodeBase64Media(audioContent) : null;
  const audioPath = hasAudio
    ? path.join(workDir, `audio${getAudioInputExtension(audioMimeType, audioBuffer)}`)
    : '';

  try {
    await Promise.all(frames.map((frame, index) => {
      const framePath = path.join(workDir, `frame-${String(index + 1).padStart(5, '0')}.jpg`);
      return fsp.writeFile(framePath, decodeBase64Media(frame));
    }));

    if (hasAudio) {
      await fsp.writeFile(audioPath, audioBuffer);
    }

    const args = [
      '-y',
      '-framerate', String(normalizedFrameRate),
      '-i', path.join(workDir, 'frame-%05d.jpg'),
    ];

    if (hasAudio) {
      args.push('-i', audioPath);
    }

    args.push(
      '-map', '0:v:0',
    );

    if (hasAudio) {
      args.push('-map', '1:a:0');
    }

    args.push(
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '30',
      '-pix_fmt', 'yuv420p',
    );

    if (hasAudio) {
      args.push(
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '48000',
        '-ac', '1',
        '-af', 'aresample=async=1:first_pts=0',
        '-shortest',
      );
    }

    args.push(
      '-movflags', '+faststart',
      outputPath,
    );

    await runFfmpeg(args);

    return await fsp.readFile(outputPath);
  } catch (error) {
    error.message = `Unable to convert ${frames.length} camera frames to MP4: ${error.message}`;
    throw error;
  } finally {
    await fsp.rm(workDir, { recursive: true, force: true });
  }
}

function decodeBase64Media(fileContent) {
  const base64 = String(fileContent).replace(/^data:[^,]+,/, '');
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.slice(0, 5).toString('utf8') === 'data:') {
    return decodeBase64Media(buffer.toString('utf8'));
  }

  return buffer;
}

async function convertVideoBufferToMp4(inputBuffer, inputMimeType) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg binary was not found. Install ffmpeg-static before saving camera videos.');
  }

  const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'camera-video-'));
  const inputExtension = getInputExtension(inputMimeType, inputBuffer);
  validateVideoInputBuffer(inputBuffer, inputExtension);
  const inputPath = path.join(workDir, `input${inputExtension}`);
  const outputPath = path.join(workDir, `output-${crypto.randomUUID()}.mp4`);

  try {
    await fsp.writeFile(inputPath, inputBuffer);

    await runFfmpeg([
      '-y',
      '-i', inputPath,
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-movflags', '+faststart',
      outputPath,
    ]);

    return await fsp.readFile(outputPath);
  } catch (error) {
    error.message = `Unable to convert camera video (${inputMimeType || 'unknown mime'}, ${inputBuffer.length} bytes, ${inputExtension}) to MP4: ${error.message}`;
    throw error;
  } finally {
    await fsp.rm(workDir, { recursive: true, force: true });
  }
}

function validateVideoInputBuffer(inputBuffer, inputExtension) {
  if (inputExtension !== '.webm') {
    return;
  }

  if (inputBuffer.length >= 4 && inputBuffer[0] === 0x1a && inputBuffer[1] === 0x45 && inputBuffer[2] === 0xdf && inputBuffer[3] === 0xa3) {
    return;
  }

  throw new Error(
    `Camera video payload is not a valid WebM file. First bytes: ${describeBufferStart(inputBuffer)}`
  );
}

function describeBufferStart(buffer) {
  const start = buffer.slice(0, 32);
  const hex = start.toString('hex').replace(/(..)/g, '$1 ').trim();
  const text = start.toString('utf8').replace(/[^\x20-\x7e]/g, '.');

  return `${hex} (${text})`;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${trimFfmpegError(stderr)}`));
      }
    });
  });
}

function trimFfmpegError(stderr) {
  const lines = String(stderr || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  return lines.slice(-12).join(' | ');
}

function getMediaMimeType(fileContent, mimeType, mediaType) {
  if (mediaType === 'video') {
    return getMimeTypeFromDataUrl(fileContent) || mimeType || 'video/webm';
  }

  return mimeType || getMimeTypeFromDataUrl(fileContent) || 'image/jpeg';
}

function getMimeTypeFromDataUrl(fileContent) {
  const match = /^data:([^;,]+)/.exec(fileContent || '');
  return match ? match[1] : '';
}

function getInputExtension(mimeType, inputBuffer) {
  const detectedExtension = getInputExtensionFromBuffer(inputBuffer);
  if (detectedExtension) return detectedExtension;

  const normalizedMimeType = String(mimeType || '').split(';')[0].trim().toLowerCase();

  if (normalizedMimeType === 'video/mp4') return '.mp4';
  if (normalizedMimeType === 'video/quicktime') return '.mov';
  return '.webm';
}

function getAudioInputExtension(mimeType, inputBuffer) {
  const detectedExtension = getInputExtensionFromBuffer(inputBuffer);
  if (detectedExtension) return detectedExtension;

  const normalizedMimeType = String(mimeType || '').split(';')[0].trim().toLowerCase();

  if (normalizedMimeType === 'audio/mp4' || normalizedMimeType === 'audio/aac') return '.m4a';
  if (normalizedMimeType === 'audio/ogg') return '.ogg';
  if (normalizedMimeType === 'audio/wav') return '.wav';
  return '.webm';
}

function getInputExtensionFromBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return '';
  }

  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return '.webm';
  }

  if (buffer.slice(4, 8).toString('ascii') === 'ftyp') {
    return '.mp4';
  }

  return '';
}

module.exports = {
  convertJpegFramesToMp4,
  convertVideoBufferToMp4,
  decodeBase64Media,
  getMediaMimeType,
  normalizeCapturedMedia,
};
