import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import * as Yup from '../../util/vendor/yup';
import categoryHttp from '../../util/http/category-http';
import { Category, GetResponse } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import DefaultForm from '../../components/DefaultForm';
import LoadingContext from '../../components/Loading/LoadingContext';
import useSnackbarFormError from '../../hooks/useSnackbarFormError';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label('Nome')
    .max(255)
    .required(),
});

const Form: React.FC = () => {
  const { id } = useParams();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [category, setCategory] = useState<Category | null>(null);
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
  } = useForm<Category>({
    validationSchema,
    defaultValues: {
      is_active: true,
    },
  });

  useSnackbarFormError(formState.submitCount, errors);

  useEffect(() => {
    register({ name: 'is_active' });
  }, [register]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const response = await categoryHttp.get<GetResponse<Category>>(id);
        setCategory(response.data.data);
        reset(response.data.data);
      } catch (error) {
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    })();
  }, [id, reset, enqueueSnackbar]);

  function onSubmit(formData, event) {
    (async () => {
      try {
        const response = !category
          ? await categoryHttp.create(formData)
          : await categoryHttp.update(category.id, formData);
        enqueueSnackbar('Categoria salva com sucesso.', { variant: 'success' });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/categories/${response.data.data.id}/edit`)
              : history.push(`/categories/${response.data.data.id}/edit`)
            : history.push('/categories');
        });
      } catch (error) {
        enqueueSnackbar('Não foi possível salvar a categoria.', { variant: 'error' });
      }
    })();
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
        name="description"
        label="Descrição"
        fullWidth
        variant="outlined"
        multiline
        rows={4}
        margin="normal"
        inputRef={register}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
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
