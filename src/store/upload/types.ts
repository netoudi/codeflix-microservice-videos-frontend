import { AxiosError } from 'axios';
import { AnyAction } from 'redux';
import { Video } from '../../util/models';

export interface FileUpload {
  fileField: string;
  filename: string;
  progress: number;
  error?: AxiosError;
}

export interface Upload {
  video: Video;
  progress: number;
  files: FileUpload[];
}

export interface FileInfo {
  file: File;
  fileField: string;
}

export interface UploadModule {
  upload: UploadState;
}

export interface UploadState {
  uploads: Upload[];
}

export interface AddUploadAction extends AnyAction {
  payload: {
    video: Video;
    files: Array<FileInfo>;
  };
}

export interface RemoveUploadAction extends AnyAction {
  payload: {
    id: string;
  };
}

export interface UpdateProgressAction extends AnyAction {
  payload: {
    video: Video;
    fileField: string;
    progress: number;
  };
}

export interface SetUploadErrorAction extends AnyAction {
  payload: {
    video: Video;
    fileField: string;
    error: AxiosError;
  };
}

export type ActionTypes = {
  ADD_UPLOAD: string;
  REMOVE_UPLOAD: string;
  UPDATE_PROGRESS: string;
  SET_UPLOAD_ERROR: string;
};

export type ActionCreators = {
  addUpload(payload: AddUploadAction['payload']): AddUploadAction;
  removeUpload(payload: RemoveUploadAction['payload']): RemoveUploadAction;
  updateProgress(payload: UpdateProgressAction['payload']): UpdateProgressAction;
  setUploadError(payload: SetUploadErrorAction['payload']): SetUploadErrorAction;
};

export type Actions =
  | AddUploadAction
  | RemoveUploadAction
  | UpdateProgressAction
  | SetUploadErrorAction;
