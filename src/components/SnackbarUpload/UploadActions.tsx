import React from 'react';
import { Fade, IconButton, ListItemSecondaryAction, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';

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

interface UploadActionsProps {}

const UploadActions: React.FC<UploadActionsProps> = (props) => {
  const classes = useStyles();

  return (
    <Fade in timeout={{ enter: 1000 }}>
      <ListItemSecondaryAction>
        <span>
          <IconButton className={classes.successIcon} edge="end">
            <CheckCircleIcon />
          </IconButton>
          <IconButton className={classes.errorIcon} edge="end">
            <ErrorIcon />
          </IconButton>
        </span>
        <span>
          <IconButton className={classes.deleteIcon} edge="end">
            <DeleteIcon />
          </IconButton>
        </span>
      </ListItemSecondaryAction>
    </Fade>
  );
};

export default UploadActions;
