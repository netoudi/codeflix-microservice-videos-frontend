import React from 'react';
import { Grid, ListItem, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MovieIcon from '@material-ui/icons/Movie';
import ImageIcon from '@material-ui/icons/Image';
import UploadProgress from '../../components/UploadProgress';
import UploadActions from './UploadActions';

const useStyles = makeStyles((theme: Theme) => ({
  gridTitle: {
    display: 'flex',
    color: '#999',
  },
  icon: {
    color: theme.palette.error.main,
    minWidth: '40px',
  },
}));

interface UploadItemProps {
  children: string;
}

const UploadItem: React.FC<UploadItemProps> = (props) => {
  const classes = useStyles();

  function makeIcon() {
    if (true) {
      return <MovieIcon className={classes.icon} />;
    }

    return <ImageIcon className={classes.icon} />;
  }

  return (
    <ListItem>
      <Grid container alignItems="center">
        <Grid className={classes.gridTitle} item xs={12} md={9}>
          {makeIcon()}
          <Typography color="inherit">{props.children}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Grid container direction="row" alignItems="center" justify="flex-end">
            <UploadProgress size={48} />
            <UploadActions />
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default UploadItem;
