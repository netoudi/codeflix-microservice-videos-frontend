import React from 'react';
import { Card, CardActions, Collapse, IconButton, List, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSnackbar } from 'notistack';

interface SnackbarUploadProps {
  id: string | number;
}

const SnackbarUpload: React.RefForwardingComponent<any, SnackbarUploadProps> = (props, ref) => {
  const { id } = props;
  const { closeSnackbar } = useSnackbar();

  return (
    <Card ref={ref}>
      <CardActions>
        <Typography>Fazendo upload de 10 vídeo(s)</Typography>
        <div>
          <IconButton color="inherit">
            <ExpandMoreIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => closeSnackbar(id)}>
            <CloseIcon />
          </IconButton>
        </div>
      </CardActions>
      <Collapse>
        <List>Items</List>
      </Collapse>
    </Card>
  );
};

export default React.forwardRef(SnackbarUpload);
