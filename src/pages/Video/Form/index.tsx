import React, { createRef, MutableRefObject, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import * as Yup from '../../../util/vendor/yup';
import videoHttp from '../../../util/http/video-http';
import { GetResponse, Video, VideoFileFieldsMap } from '../../../util/models';
import SubmitActions from '../../../components/SubmitActions';
import DefaultForm from '../../../components/DefaultForm';
import { InputFileComponent } from '../../../components/InputFile';
import RatingField from './RatingField';
import UploadField from './UploadField';
import CategoryField, { CategoryFieldComponent } from './CategoryField';
import GenreField, { GenreFieldComponent } from './GenreField';
import CastMemberField, { CastMemberFieldComponent } from './CastMemberField';
import { zipObject } from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
  cardRating: {
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    marginTop: 0,
  },
  cardUpload: {
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    margin: theme.spacing(2, 0),
  },
  cardOpened: {
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
  },
  cardContentOpened: {
    paddingBottom: theme.spacing(2) + 'px !important',
  },
}));

const fileFields = Object.keys(VideoFileFieldsMap);

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
  cast_members: Yup.array()
    .label('Elenco')
    .required(),
  genres: Yup.array()
    .label('Gêneros')
    .test({
      message: 'Cada gênero escolhido precisa ter pelo menos uma categoria selecionada.',
      test(value) {
        return value.every(
          (v) =>
            v.categories.filter((cat) => this.parent.categories.map((c) => c.id).includes(cat.id))
              .length !== 0,
        );
      },
    })
    .required(),
  categories: Yup.array()
    .label('Categorias')
    .required(),
  duration: Yup.number()
    .label('Duração')
    .min(1)
    .required(),
});

const Form: React.FC = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

  const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
  const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
  const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
  const uploadsRef = useRef(
    zipObject(
      fileFields,
      fileFields.map(() => createRef()),
    ),
  ) as MutableRefObject<{ [key: string]: MutableRefObject<InputFileComponent> }>;

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
      rating: null,
      opened: false,
      cast_members: [],
      genres: [],
      categories: [],
    },
  });

  useEffect(() => {
    ['rating', 'opened', 'cast_members', 'genres', 'categories', ...fileFields].forEach((name) =>
      register({ name }),
    );
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
        id && resetForm();
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

  function resetForm() {
    Object.keys(uploadsRef.current).forEach((field) => uploadsRef.current[field].current.clear());
    castMemberRef.current.clear();
    genreRef.current.clear();
    categoryRef.current.clear();
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
          <CastMemberField
            ref={castMemberRef}
            castMembers={watch('cast_members')}
            setCastMembers={(value) => setValue('cast_members', value, true)}
            error={errors.cast_members}
            disabled={loading}
          />
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <GenreField
                ref={genreRef}
                genres={watch('genres')}
                setGenres={(value) => setValue('genres', value, true)}
                categories={watch('categories')}
                setCategories={(value) => setValue('categories', value, true)}
                error={errors.genres}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CategoryField
                ref={categoryRef}
                categories={watch('categories')}
                setCategories={(value) => setValue('categories', value, true)}
                genres={watch('genres')}
                error={errors.categories}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormHelperText>Escolha os gêneros do vídeo.</FormHelperText>
              <FormHelperText>Escolha pelo menos uma categoria de cada gênero.</FormHelperText>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" className={classes.cardRating}>
            <CardContent>
              <RatingField
                value={watch('rating')}
                setValue={(value) => setValue('rating', value, true)}
                error={errors.rating}
                disabled={loading}
                FormControlProps={{
                  margin: isGreaterMd ? 'none' : 'normal',
                }}
              />
            </CardContent>
          </Card>
          <Card variant="outlined" className={classes.cardUpload}>
            <CardContent>
              <Typography color="primary" variant="h6">
                Imagens
              </Typography>
              <UploadField
                ref={uploadsRef.current['thumb_file']}
                label="Thumb"
                accept="image/*"
                setValue={(value) => setValue('thumb_file', value)}
              />
              <UploadField
                ref={uploadsRef.current['banner_file']}
                label="Banner"
                accept="image/*"
                setValue={(value) => setValue('banner_file', value)}
              />
            </CardContent>
          </Card>
          <Card variant="outlined" className={classes.cardUpload}>
            <CardContent>
              <Typography color="primary" variant="h6">
                Vídeos
              </Typography>
              <UploadField
                ref={uploadsRef.current['trailer_file']}
                label="Trailer"
                accept="video/mp4"
                setValue={(value) => setValue('trailer_file', value)}
              />
              <UploadField
                ref={uploadsRef.current['video_file']}
                label="Principal"
                accept="video/mp4"
                setValue={(value) => setValue('video_file', value)}
              />
            </CardContent>
          </Card>
          <Card variant="outlined" className={classes.cardOpened}>
            <CardContent className={classes.cardContentOpened}>
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
                    Quero que este conteúdo apareça na seção lançamentos.
                  </Typography>
                }
                labelPlacement="end"
              />
            </CardContent>
          </Card>
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
