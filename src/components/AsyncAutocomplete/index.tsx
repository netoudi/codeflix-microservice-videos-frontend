import React, { useEffect, useState } from 'react';
import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { useSnackbar } from 'notistack';

interface AsyncAutocompleteProps {
  fetchOptions: (searchText) => Promise<any>;
  TextFieldProps?: TextFieldProps;
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  const snackbar = useSnackbar();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const textFieldProps: TextFieldProps = {
    margin: 'normal',
    variant: 'outlined',
    fullWidth: true,
    InputLabelProps: { shrink: true },
    ...(props.TextFieldProps && { ...props.TextFieldProps }),
  };

  const autoCompleteProps: AutocompleteProps<any> = {
    open,
    options,
    loading,
    loadingText: 'Carregando...',
    noOptionsText: 'Nenhum item encontrado',
    onOpen() {
      console.log('onOpen');
      setOpen(true);
    },
    onClose() {
      console.log('onClose');
      setOpen(false);
    },
    onInputChange(event, value) {
      console.log(value);
      setSearchText(value);
    },
    renderInput: (params) => {
      console.log(params);
      return (
        <TextField
          {...params}
          {...textFieldProps}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      );
    },
  };

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      setLoading(true);

      try {
        const response = await props.fetchOptions(searchText);

        if (isSubscribed) {
          setOptions(response.data.data);
        }
      } catch (error) {
        snackbar.enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [searchText]); // eslint-disable-line

  return <Autocomplete {...autoCompleteProps} />;
};

export default AsyncAutocomplete;
