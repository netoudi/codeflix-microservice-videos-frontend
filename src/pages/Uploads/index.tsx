import React from 'react';
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
import { useSelector } from 'react-redux';
import { Page } from '../../components/Page';
import UploadItem from './UploadItem';
import { Upload, UploadModule } from '../../store/upload/types';
import { VideoFileFieldsMap } from '../../util/models';

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

  const uploads = useSelector<UploadModule, Upload[]>((state) => state.upload.uploads);

  return (
    <Page title="Listagem de uploads">
      <Card elevation={1}>
        {uploads.map((upload) => (
          <CardContent key={upload.video.id}>
            <UploadItem uploadOrFile={upload}>{upload.video.title}</UploadItem>
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
                    {upload.files.map((file, key) => (
                      <React.Fragment key={String(key)}>
                        <Divider />
                        <UploadItem uploadOrFile={file}>
                          {`${VideoFileFieldsMap[file.fileField]} - ${file.filename}`}
                        </UploadItem>
                      </React.Fragment>
                    ))}
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
