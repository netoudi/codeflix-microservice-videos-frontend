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

export interface UploadCollectionState {
  uploads: Upload[];
}

export interface AddUploadAction extends AnyAction {
  payload: {
    video: Video;
    files: Array<{ file: File; fileField: string }>;
  };
}

export interface State {
  uploads: [];
}

export type ActionTypes = {
  ADD_UPLOAD: string;
};

export type ActionCreators = {
  addUpload(payload: AddUploadAction['payload']): AddUploadAction;
};

export type Actions = AddUploadAction;
