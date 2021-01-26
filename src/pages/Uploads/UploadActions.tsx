import React, { useEffect, useState } from 'react';
import { Divider, Fade, IconButton, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { FileUpload, Upload } from '../../store/upload/types';
import { Creators } from '../../store/upload';
import { hasError, isFinished, isUploadType } from '../../store/upload/getters';

const useStyles = makeStyles((theme: Theme) => ({
  successIcon: {
    color: theme.palette.success.main,
    marginLeft: theme.spacing(1),
  },
  errorIcon: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(1),
  },
  divider: {
    height: '20px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

interface UploadActionsProps {
  uploadOrFile: Upload | FileUpload;
}

const UploadActions: React.FC<UploadActionsProps> = (props) => {
  const { uploadOrFile } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [debounceShow] = useDebounce(show, 2500);
  const error = hasError(uploadOrFile);
  const videoId = (uploadOrFile as any).video ? (uploadOrFile as any).video.id : '';
  const activeActions = isUploadType(uploadOrFile);

  useEffect(() => {
    setShow(isFinished(uploadOrFile));
  }, [uploadOrFile]);

  if (!debounceShow) {
    return null;
  }

  return (
    <Fade in={show} timeout={{ enter: 1000 }}>
      <>
        {uploadOrFile.progress === 1 && !error && (
          <CheckCircleIcon className={classes.successIcon} />
        )}

        {error && <ErrorIcon className={classes.errorIcon} />}

        {activeActions && (
          <>
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton
              onClick={() =>
                dispatch(Creators.removeUpload({ id: (uploadOrFile as any).video.id }))
              }
            >
              <DeleteIcon color="primary" />
            </IconButton>
            <IconButton component={Link} to={`/videos/${videoId}/edit`}>
              <EditIcon color="primary" />
            </IconButton>
          </>
        )}
      </>
    </Fade>
  );
};

export default UploadActions;
