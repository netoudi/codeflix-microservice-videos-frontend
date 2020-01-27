import * as React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
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

const Form: React.FC = () => {
  const classes = useStyles();

  const buttonProps: ButtonProps = {
    className: classes.submit,
    variant: 'outlined',
  };

  const { register, handleSubmit, getValues } = useForm({
    defaultValues: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_active: true,
    },
  });

  function onSubmit(formData, event) {
    categoryHttp
      .create<{ data: Category }>(formData)
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField name="name" label="Nome" fullWidth variant="outlined" inputRef={register} />
      <TextField
        name="description"
        label="Descrição"
        fullWidth
        variant="outlined"
        multiline
        rows={4}
        margin="normal"
        inputRef={register}
      />
      <Checkbox name="is_active" inputRef={register} defaultChecked /> Ativo?
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
