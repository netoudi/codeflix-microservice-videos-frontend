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

export interface AddUploadAction extends AnyAction {
  payload: {
    video: Video;
    files: Array<{ file: File; fileField: string }>;
  };
}

export interface RemoveUploadAction extends AnyAction {
  payload: {
    id: string;
  };
}

export interface State {
  uploads: Upload[];
}

export type ActionTypes = {
  ADD_UPLOAD: string;
  REMOVE_UPLOAD: string;
};

export type ActionCreators = {
  addUpload(payload: AddUploadAction['payload']): AddUploadAction;
  removeUpload(payload: RemoveUploadAction['payload']): RemoveUploadAction;
};

export type Actions = AddUploadAction | RemoveUploadAction;
