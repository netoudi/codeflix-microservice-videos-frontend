import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import * as Yup from '../../util/vendor/yup';
import categoryHttp from '../../util/http/category-http';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  submit: {
    marginLeft: theme.spacing(1),
  },
}));

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label('Nome')
    .max(255)
    .required(),
});

const Form: React.FC = () => {
  const { id } = useParams();
  const history = useHistory();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const classes = useStyles();

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: 'secondary',
    variant: 'contained',
    disabled: loading,
  };

  const { register, handleSubmit, getValues, setValue, errors, reset, watch } = useForm<Category>({
    validationSchema,
    defaultValues: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_active: true,
    },
  });

  useEffect(() => {
    register({ name: 'is_active' });
  }, [register]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    categoryHttp
      .get<{ data: Category }>(id)
      .then((response) => {
        setCategory(response.data.data);
        reset(response.data.data);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function onSubmit(formData, event) {
    setLoading(true);

    const http = !category
      ? categoryHttp.create(formData)
      : categoryHttp.update(category.id, formData);

    http
      .then((response) => {
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/categories/${response.data.data.id}/edit`)
              : history.push(`/categories/${response.data.data.id}/edit`)
            : history.push('/categories');
        });
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      <Box dir="rtl">
        <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>
          Salvar
        </Button>
        <Button {...buttonProps} type="submit">
          Salvar e continuar editando
        </Button>
      </Box>
    </form>
  );
};

export default Form;
