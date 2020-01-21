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

  return (
    <form action="">
      <TextField name="name" label="Nome" fullWidth variant="outlined" />
      <TextField
        name="description"
        label="Descrição"
        fullWidth
        variant="outlined"
        multiline
        rows={4}
        margin="normal"
      />
      <Checkbox name="is_active" /> Ativo?
      <Box dir="rtl">
        <Button {...buttonProps}>Salvar</Button>
        <Button {...buttonProps} type="submit">
          Salvar e continuar editando
        </Button>
      </Box>
    </form>
  );
};

export default Form;
