import React from 'react';
import { Fade, IconButton, ListItemSecondaryAction, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDispatch } from 'react-redux';
import { Upload } from '../../store/upload/types';
import { Creators } from '../../store/upload';
import { hasError } from '../../store/upload/getters';

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
}

const UploadActions: React.FC<UploadActionsProps> = (props) => {
  const { upload } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const error = hasError(upload);

  return (
    <Fade in timeout={{ enter: 1000 }}>
      <ListItemSecondaryAction>
        <span>
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
        <span>
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
