import * as React from 'react';
import {
  Card,
  CardContent,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  List,
  Theme,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Page } from '../../components/Page';
import UploadItem from './UploadItem';

const useStyles = makeStyles((theme: Theme) => ({
  panelSummary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  expandedIcon: {
    color: theme.palette.primary.contrastText,
  },
}));

const Uploads = () => {
  const classes = useStyles();

  return (
    <Page title="Listagem de uploads">
      <Card elevation={1}>
        {[1, 2, 3].map((el) => (
          <CardContent key={el}>
            <UploadItem>
              Vídeo - Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </UploadItem>
            <ExpansionPanel style={{ margin: 0 }}>
              <ExpansionPanelSummary
                className={classes.panelSummary}
                expandIcon={<ExpandMoreIcon className={classes.expandedIcon} />}
              >
                <Typography>Ver detalhes</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ padding: 0 }}>
                <Grid item xs={12}>
                  <List dense style={{ padding: 0 }}>
                    <Divider />
                    <UploadItem>Principal - filename.mp4</UploadItem>
                    <Divider />
                    <UploadItem>Principal - filename.mp4</UploadItem>
                    <Divider />
                    <UploadItem>Principal - filename.mp4</UploadItem>
                    <Divider />
                    <UploadItem>Principal - filename.mp4</UploadItem>
                  </List>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </CardContent>
        ))}
      </Card>
    </Page>
  );
};

export default Uploads;
