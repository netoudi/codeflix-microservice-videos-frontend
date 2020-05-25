import React, { useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { Page } from '../../components/Page';
import UploadItem from './UploadItem';
import { Upload, UploadModule } from '../../store/upload/types';
import { VideoFileFieldsMap } from '../../util/models';
import { Creators as UploadCreators } from '../../store/upload';

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

  const dispatch = useDispatch();

  useEffect(() => {
    const upload: any = {
      video: {
        id: 'b9622f80-9dad-4594-9049-e0c3c2ca00c0',
        title: 'Lorem ipsum dolor sit amet.',
      },
      files: [
        { file: new File([''], 'video.mp4'), fileField: 'trailer_file' },
        { file: new File([''], 'video.mp4'), fileField: 'video_file' },
      ],
    };

    dispatch(UploadCreators.addUpload(upload));
  }, [dispatch]);

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
