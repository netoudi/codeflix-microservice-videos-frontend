import React, { useEffect, useState } from 'react';
import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { useSnackbar } from 'notistack';

interface AsyncAutocompleteProps {
  fetchOptions: (searchText) => Promise<any>;
  TextFieldProps?: TextFieldProps;
  AutocompleteProps?: Omit<Omit<AutocompleteProps<any>, 'renderInput'>, 'options'>;
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  const snackbar = useSnackbar();
  const { freeSolo, onOpen, onClose, onInputChange } = props.AutocompleteProps as any;
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
    loadingText: 'Carregando...',
    noOptionsText: 'Nenhum item encontrado',
    ...(props.AutocompleteProps && { ...props.AutocompleteProps }),
    open,
    options,
    loading,
    onOpen() {
      console.log('onOpen');
      setOpen(true);
      onOpen && onOpen();
    },
    onClose() {
      console.log('onClose');
      setOpen(false);
      onClose && onClose();
    },
    onInputChange(event, value) {
      console.log(value);
      setSearchText(value);
      onInputChange && onInputChange();
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
    if (!open || (searchText === '' && freeSolo)) return;

    let isSubscribed = true;

    (async () => {
      setLoading(true);

      try {
        const data = await props.fetchOptions(searchText);

        if (isSubscribed) {
          setOptions(data);
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
  }, [freeSolo ? searchText : open]); // eslint-disable-line

  return <Autocomplete {...autoCompleteProps} />;
};

export default AsyncAutocomplete;
