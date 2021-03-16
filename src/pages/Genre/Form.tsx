import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Checkbox, FormControlLabel, MenuItem, TextField } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import * as Yup from '../../util/vendor/yup';
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';
import { Category, Genre } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import DefaultForm from '../../components/DefaultForm';
import LoadingContext from '../../components/Loading/LoadingContext';
import useSnackbarFormError from '../../hooks/useSnackbarFormError';

interface GenreForm {
  name: string;
  categories_id: string[];
  is_active: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label('Nome')
    .max(255)
    .required(),
  categories_id: Yup.array()
    .label('Categorias')
    .required(),
});

const Form: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const loading = useContext(LoadingContext);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    errors,
    reset,
    watch,
    triggerValidation,
    formState,
  } = useForm<GenreForm>({
    validationSchema,
    defaultValues: {
      categories_id: [],
      is_active: false,
    },
  });

  useSnackbarFormError(formState.submitCount, errors);

  useEffect(() => {
    register({ name: 'categories_id' });
    register({ name: 'is_active' });
  }, [register]);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      try {
        const promises = [categoryHttp.list({ queryParams: { all: true } })];

        if (id) promises.push(genreHttp.get(id));

        const [categoryResponse, genreResponse] = await Promise.all(promises);

        if (isSubscribed) {
          setCategories(categoryResponse.data.data);

          if (id) {
            setGenre(genreResponse.data.data);
            reset({
              ...genreResponse.data.data,
              categories_id: genreResponse.data.data.categories.map((category) => category.id),
            });
          }
        }
      } catch (error) {
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [enqueueSnackbar, id, reset]);

  const handleChange = (event) => {
    setValue('categories_id', event.target.value);
  };

  function onSubmit(formData, event) {
    const http = !genre ? genreHttp.create(formData) : genreHttp.update(genre.id, formData);

    http
      .then((response) => {
        enqueueSnackbar('Gênero salvo com sucesso.', { variant: 'success' });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/genres/${response.data.data.id}/edit`)
              : history.push(`/genres/${response.data.data.id}/edit`)
            : history.push('/genres');
        });
      })
      .catch((error) => {
        enqueueSnackbar('Não foi possível salvar o gênero.', { variant: 'error' });
        console.log(error);
      });
  }

  return (
    <DefaultForm
      GridContainerProps={{ spacing: 5 }}
      GridItemProps={{ xs: 12, md: 6 }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        name="name"
        label="Nome"
        fullWidth
        variant="outlined"
        inputRef={register}
        disabled={loading}
        error={errors.name !== undefined}
        helperText={errors.name && errors.name.message}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        select
        name="categories_id"
        label="Categorias"
        value={watch('categories_id')}
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        SelectProps={{ multiple: true }}
        disabled={loading}
        error={errors.categories_id !== undefined}
        helperText={errors.categories_id && errors.categories_id['message']} // eslint-disable-line
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="" disabled>
          <em>Selecione categorias</em>
        </MenuItem>
        {categories.map((category, key) => (
          <MenuItem key={String(key)} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        disabled={loading}
        control={
          <Checkbox
            name="is_active"
            color="primary"
            onChange={() => setValue('is_active', !getValues().is_active)}
            checked={watch('is_active')}
          />
        }
        label="Ativo?"
        labelPlacement="end"
      />
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
