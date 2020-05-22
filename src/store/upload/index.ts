import { createActions, createReducer } from 'reduxsauce';
import * as Typings from './types';

export const { Types, Creators } = createActions<Typings.ActionTypes, Typings.ActionCreators>({
  addUpload: ['payload'],
});

export const INITIAL_STATE: Typings.State = {
  uploads: [],
};

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
  [Types.ADD_UPLOAD]: addUpload as any,
});

function addUpload(state = INITIAL_STATE, action: Typings.AddUploadAction): Typings.State {
  return state;
}

export default reducer;
