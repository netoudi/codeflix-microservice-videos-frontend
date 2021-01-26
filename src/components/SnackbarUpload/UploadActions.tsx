import React, { useEffect, useState } from 'react';
import { Fade, IconButton, ListItemSecondaryAction, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { Upload } from '../../store/upload/types';
import { Creators } from '../../store/upload';
import { hasError, isFinished } from '../../store/upload/getters';

const useStyles = makeStyles((theme: Theme) => ({
  successIcon: {
    color: theme.palette.success.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  deleteIcon: {
    color: theme.palette.primary.main,
  },
}));

interface UploadActionsProps {
  upload: Upload;
  hover: boolean;
}

const UploadActions: React.FC<UploadActionsProps> = (props) => {
  const { upload, hover } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const error = hasError(upload);
  const [show, setShow] = useState(false);
  const [debounceShow] = useDebounce(show, 2500);

  useEffect(() => {
    setShow(isFinished(upload));
  }, [upload]);

  if (!debounceShow) {
    return null;
  }

  return (
    <Fade in={show} timeout={{ enter: 1000 }}>
      <ListItemSecondaryAction>
        <span hidden={hover}>
          {upload.progress === 1 && !error && (
            <IconButton className={classes.successIcon} edge="end">
              <CheckCircleIcon />
            </IconButton>
          )}
          {error && (
            <IconButton className={classes.errorIcon} edge="end">
              <ErrorIcon />
            </IconButton>
          )}
        </span>
        <span hidden={!hover}>
          <IconButton
            className={classes.deleteIcon}
            edge="end"
            onClick={() => dispatch(Creators.removeUpload({ id: upload.video.id }))}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </ListItemSecondaryAction>
    </Fade>
  );
};

export default UploadActions;
