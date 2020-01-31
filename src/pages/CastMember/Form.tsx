import React, { useEffect } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import castMemberHttp from '../../util/http/cast-member-http';

interface CastMember {
  id: string;
  name: string;
  type: bigint;
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
    color: 'secondary',
    variant: 'contained',
  };

  const { register, handleSubmit, getValues, setValue } = useForm();

  useEffect(() => {
    register({ name: 'type' });
  }, [register]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setValue('type', parseInt(value, 10));
  };

  function onSubmit(formData, event) {
    castMemberHttp
      .create<{ data: CastMember }>(formData)
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField name="name" label="Nome" fullWidth variant="outlined" inputRef={register} />
      <FormControl margin="normal">
        <FormLabel component="legend">Tipo</FormLabel>
        <RadioGroup aria-label="type" name="type" onChange={handleChange} row>
          <FormControlLabel value="1" control={<Radio color="primary" />} label="Diretor" />
          <FormControlLabel value="2" control={<Radio color="primary" />} label="Ator" />
        </RadioGroup>
      </FormControl>
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
