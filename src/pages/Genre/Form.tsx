import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

interface Genre {
  id: string;
  name: string;
  categories_id: Category[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  submit: {
    marginLeft: theme.spacing(1),
  },
}));

const Form: React.FC = () => {
  const classes = useStyles();

  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: 'contained',
  };

  const [categories, setCategories] = useState<Category[]>([]);

  const { register, handleSubmit, getValues, setValue, watch } = useForm({
    defaultValues: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      categories_id: [],
    },
  });

  useEffect(() => {
    register({ name: 'categories_id' });
  }, [register]);

  useEffect(() => {
    categoryHttp.list().then((response) => setCategories(response.data.data));
  }, []);

  const handleChange = (event) => {
    setValue('categories_id', event.target.value);
  };

  function onSubmit(formData, event) {
    genreHttp
      .create<{ data: Genre }>(formData)
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField name="name" label="Nome" fullWidth variant="outlined" inputRef={register} />
      <TextField
        select
        name="categories_id"
        label="Categories"
        value={watch('categories_id')}
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        SelectProps={{ multiple: true }}
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
      <Checkbox name="is_active" color="primary" inputRef={register} defaultChecked /> Ativo?
      <Box dir="rtl">
        <Button {...buttonProps} color="primary" onClick={() => onSubmit(getValues(), null)}>
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
