import { createActions, createReducer } from 'reduxsauce';
import update from 'immutability-helper';
import * as Typings from './types';

export const { Types, Creators } = createActions<Typings.ActionTypes, Typings.ActionCreators>({
  addUpload: ['payload'],
  removeUpload: ['payload'],
  updateProgress: ['payload'],
});

export const INITIAL_STATE: Typings.State = {
  uploads: [],
};

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
  [Types.ADD_UPLOAD]: addUpload as any,
  [Types.REMOVE_UPLOAD]: removeUpload as any,
  [Types.UPDATE_PROGRESS]: updateProgress as any,
});

function addUpload(state = INITIAL_STATE, action: Typings.AddUploadAction): Typings.State {
  if (!action.payload.files.length) {
    return state;
  }

  const index = findIndexUpload(state, action.payload.video.id);

  if (index !== -1 && state.uploads[index].progress < 1) {
    return state;
  }

  const uploads = index === -1 ? state.uploads : update(state.uploads, { $splice: [[index, 1]] });

  return {
    uploads: [
      ...uploads,
      {
        video: action.payload.video,
        progress: 0,
        files: action.payload.files.map((file) => ({
          fileField: file.fileField,
          filename: file.file.name,
          progress: 0,
        })),
      },
    ],
  };
}

function removeUpload(state = INITIAL_STATE, action: Typings.RemoveUploadAction): Typings.State {
  const uploads = state.uploads.filter((upload) => upload.video.id !== action.payload.id);

  if (uploads.length === state.uploads.length) {
    return state;
  }

  return {
    uploads,
  };
}

function updateProgress(
  state = INITIAL_STATE,
  action: Typings.UpdateProgressAction,
): Typings.State {
  const videoId = action.payload.video.id;
  const { fileField } = action.payload;
  const { indexUpload, indexFile } = findIndexUploadAndFile(state, videoId, fileField);

  if (typeof indexUpload === 'undefined') {
    return state;
  }

  const upload = state.uploads[indexUpload];
  const file = upload.files[indexFile];

  const uploads = update(state.uploads, {
    [indexUpload]: {
      $apply(upload) {
        const files = update(upload.files, {
          [indexFile]: {
            $set: { ...file, progress: action.payload.progress },
          },
        });

        const progress = calculateGlobalProgress(files);

        return { ...upload, progress, files };
      },
    },
  });

  return { uploads };
}

function findIndexUploadAndFile(
  state: Typings.State,
  videoId,
  fileField,
): { indexUpload?; indexFile? } {
  const indexUpload = findIndexUpload(state, videoId);

  if (indexUpload === -1) {
    return {};
  }

  const upload = state.uploads[indexUpload];
  const indexFile = findIndexFile(upload.files, fileField);

  return indexFile === -1 ? {} : { indexUpload, indexFile };
}

function findIndexUpload(state: Typings.State, id: string) {
  return state.uploads.findIndex((upload) => upload.video.id === id);
}

function calculateGlobalProgress(files: Array<{ progress }>) {
  const countFiles = files.length;

  if (!countFiles) {
    return 0;
  }

  const sumProgress = files.reduce((sum, file) => sum + file.progress, 0);

  return sumProgress / countFiles;
}

function findIndexFile(files: Array<{ fileField }>, fileField: string) {
  return files.findIndex((file) => file.fileField === fileField);
}

export default reducer;
