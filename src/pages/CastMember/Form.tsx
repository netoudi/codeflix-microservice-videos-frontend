import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import * as Yup from '../../util/vendor/yup';
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, GetResponse } from '../../util/models';

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
  type: Yup.number()
    .label('Tipo')
    .required(),
});

const Form: React.FC = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [castMember, setCastMember] = useState<CastMember | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const buttonProps: ButtonProps = {
    className: classes.submit,
    color: 'secondary',
    variant: 'contained',
    disabled: loading,
  };

  const { register, handleSubmit, getValues, setValue, errors, reset, watch } = useForm<CastMember>(
    { validationSchema },
  );

  useEffect(() => {
    register({ name: 'type' });
  }, [register]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    castMemberHttp
      .get<GetResponse<CastMember>>(id)
      .then((response) => {
        setCastMember(response.data.data);
        reset(response.data.data);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setValue('type', parseInt(value, 10));
  };

  function onSubmit(formData, event) {
    setLoading(true);

    const http = !castMember
      ? castMemberHttp.create(formData)
      : castMemberHttp.update(castMember.id, formData);

    http
      .then((response) => {
        snackbar.enqueueSnackbar('Membro de elenco salvo com sucesso.', { variant: 'success' });
        setTimeout(() => {
          event
            ? id
              ? history.replace(`/cast-members/${response.data.data.id}/edit`)
              : history.push(`/cast-members/${response.data.data.id}/edit`)
            : history.push('/cast-members');
        });
      })
      .catch((error) => {
        snackbar.enqueueSnackbar('Não foi possível salvar o membro de elenco.', {
          variant: 'error',
        });
        console.log(error);
      })
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
      <FormControl margin="normal" error={errors.type !== undefined}>
        <FormLabel component="legend">Tipo</FormLabel>
        <RadioGroup aria-label="type" name="type" onChange={handleChange} row>
          <FormControlLabel
            value="1"
            control={<Radio color="primary" />}
            label="Diretor"
            checked={watch('type') === 1}
            disabled={loading}
          />
          <FormControlLabel
            value="2"
            control={<Radio color="primary" />}
            label="Ator"
            checked={watch('type') === 2}
            disabled={loading}
          />
        </RadioGroup>
        {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
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
