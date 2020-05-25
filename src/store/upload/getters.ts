import { Upload } from './types';

export function isFinished(upload: Upload) {
  return upload.progress === 1;
}

export function countInProgress(uploads: Upload[]) {
  return uploads.filter((upload) => !isFinished(upload)).length;
}
