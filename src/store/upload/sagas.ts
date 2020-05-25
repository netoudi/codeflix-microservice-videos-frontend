import { actionChannel, call, take } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { Types } from './index';
import { AddUploadAction, FileInfo } from './types';
import { Video } from '../../util/models';
import videoHttp from '../../util/http/video-http';

export function* uploadWatcherSaga() {
  const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);

  while (true) {
    const { payload }: AddUploadAction = yield take(newFilesChannel);

    for (const fileInfo of payload.files) {
      yield call(uploadFile, { video: payload.video, fileInfo });
    }

    console.log(payload);
  }
}

function* uploadFile({ video, fileInfo }: { video: Video; fileInfo: FileInfo }) {
  const channel = yield call(sendUpload, { id: video.id, fileInfo });

  while (true) {
    try {
      const event = yield take(channel);
      console.log(event);
    } catch (e) {
      console.log(e);
    }
  }
}

function sendUpload({ id, fileInfo }: { id: string; fileInfo: FileInfo }) {
  return eventChannel((emitter) => {
    videoHttp
      .partialUpdate(
        id,
        {
          [fileInfo.fileField]: fileInfo.file,
        },
        {
          config: {
            onUploadProgress(progressEvent) {
              emitter(progressEvent);
            },
          },
        },
      )
      .then((response) => emitter(response))
      .catch((error) => emitter(error));

    const unsubscribe = () => {};

    return unsubscribe;
  });
}
