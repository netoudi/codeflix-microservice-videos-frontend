import { actionChannel, take } from 'redux-saga/effects';
import { Types } from './index';

export function* uploadWatcherSaga() {
  const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);

  while (true) {
    const { payload } = yield take(newFilesChannel);

    console.log(payload);
  }
}
