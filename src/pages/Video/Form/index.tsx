import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import * as Yup from '../../../util/vendor/yup';
import videoHttp from '../../../util/http/video-http';
import { GetResponse, Video } from '../../../util/models';
import SubmitActions from '../../../components/SubmitActions';
import DefaultForm from '../../../components/DefaultForm';
import RatingField from './RatingField';
import InputFile from '../../../components/InputFile';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .label('Título')
    .max(255)
    .required(),
  description: Yup.string()
    .label('Sinopse')
    .required(),
  year_launched: Yup.number()
    .label('Ano de lançamento')
    .min(1)
    .required(),
  // opened: Yup.boolean()
  //   .label('opened'),
  rating: Yup.string()
    .label('Classificação')
    .required(),
  duration: Yup.number()
    .label('Duração')
    .min(1)
    .required(),
});

const Form: React.FC = () => {
  const { id } = useParams();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    errors,
    reset,
    watch,
    triggerValidation,
  } = useForm<Video>({
    validationSchema,
    defaultValues: {
      opened: false,
    },
  });

  useEffect(() => {
    ['rating', 'opened'].forEach((name) => register({ name }));
  }, [register]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    (async () => {
      try {
        const response = await videoHttp.get<GetResponse<Video>>(id);
        setVideo(response.data.data);
        reset(response.data.data);
      } catch (error) {
        snackbar.enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  function onSubmit(formData, event) {
    setLoading(true);

    (async () => {
      try {
        const response = !video
          ? await videoHttp.create(formData)
          : await videoHttp.update(video.id, formData);
        snackbar.enqueueSnackbar('Vídeo salvo com sucesso.', { variant: 'success' });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/videos/${response.data.data.id}/edit`)
              : history.push(`/videos/${response.data.data.id}/edit`)
            : history.push('/videos');
        });
      } catch (error) {
        snackbar.enqueueSnackbar('Não foi possível salvar o vídeo.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <DefaultForm GridItemProps={{ xs: 12 }} onSubmit={handleSubmit(onSubmit)}>
      <pre style={{ padding: 20, backgroundColor: '#3333', fontSize: 16 }}>
        {JSON.stringify(getValues(), null, 2)}
      </pre>

      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <TextField
            name="title"
            label="Título"
            fullWidth
            variant="outlined"
            inputRef={register}
            disabled={loading}
            error={errors.title !== undefined}
            helperText={errors.title && errors.title.message}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="description"
            label="Sinopse"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            margin="normal"
            inputRef={register}
            disabled={loading}
            error={errors.description !== undefined}
            helperText={errors.description && errors.description.message}
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                name="year_launched"
                label="Ano de lançamento"
                type="number"
                fullWidth
                variant="outlined"
                margin="normal"
                inputRef={register}
                disabled={loading}
                error={errors.year_launched !== undefined}
                helperText={errors.year_launched && errors.year_launched.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="duration"
                label="Duração"
                type="number"
                fullWidth
                variant="outlined"
                margin="normal"
                inputRef={register}
                disabled={loading}
                error={errors.duration !== undefined}
                helperText={errors.duration && errors.duration.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          Elenco
          <br />
          Gêneros e categorias
        </Grid>
        <Grid item xs={12} md={6}>
          <RatingField
            value={watch('rating')}
            setValue={(value) => setValue('rating', value, true)}
            error={errors.rating}
            disabled={loading}
            FormControlProps={{
              margin: isGreaterMd ? 'none' : 'normal',
            }}
          />
          <br />
          Uploads
          <br />
          <InputFile />
          <br />
          <FormControlLabel
            disabled={loading}
            control={
              <Checkbox
                name="opened"
                color="primary"
                onChange={() => setValue('opened', !getValues().opened)}
                checked={watch('opened')}
              />
            }
            label={
              <Typography color="primary" variant="subtitle2">
                Quero que este conteúdo aparece na seção lançamentos.
              </Typography>
            }
            labelPlacement="end"
          />
        </Grid>
      </Grid>
      <SubmitActions
        disabledButtons={loading}
        handleSave={() => {
          triggerValidation().then((isValid) => isValid && onSubmit(getValues(), null));
        }}
      />
    </DefaultForm>
  );
};

export default Form;
