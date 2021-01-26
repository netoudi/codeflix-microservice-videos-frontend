import React, { RefAttributes, useEffect, useImperativeHandle, useState } from 'react';
import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete, AutocompleteProps, UseAutocompleteSingleProps } from '@material-ui/lab';
import { useDebounce } from 'use-debounce';
import { useSnackbar } from 'notistack';

interface AsyncAutocompleteProps extends RefAttributes<AsyncAutocompleteComponent> {
  fetchOptions: (searchText) => Promise<any>;
  debounceTime?: number;
  TextFieldProps?: TextFieldProps;
  AutocompleteProps?: Omit<
    Omit<AutocompleteProps<any> & UseAutocompleteSingleProps<any>, 'renderInput'>,
    'options'
  >;
}

export interface AsyncAutocompleteComponent {
  clear: () => void;
}

const AsyncAutocomplete: React.RefForwardingComponent<
  AsyncAutocompleteComponent,
  AsyncAutocompleteProps
> = (props, ref) => {
  const { fetchOptions } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { freeSolo = false, onOpen, onClose, onInputChange } = props.AutocompleteProps as any;
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, props.debounceTime || 300);
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
    inputValue: searchText,
    onOpen() {
      setOpen(true);
      onOpen && onOpen();
    },
    onClose() {
      setOpen(false);
      onClose && onClose();
    },
    onInputChange(event, value) {
      setSearchText(value);
      onInputChange && onInputChange();
    },
    renderInput: (params) => (
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
    ),
  };

  useEffect(() => {
    if (!open && !freeSolo) {
      setOptions([]);
    }
  }, [freeSolo, open]);

  useEffect(() => {
    if (!open || (debouncedSearchText === '' && freeSolo)) return;

    let isSubscribed = true;

    (async () => {
      setLoading(true);

      try {
        const data = await fetchOptions(debouncedSearchText);

        if (isSubscribed) {
          setOptions(data);
        }
      } catch (e) {
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();

    // eslint-disable-next-line consistent-return
    return () => {
      isSubscribed = false;
    };
  }, [debouncedSearchText, enqueueSnackbar, fetchOptions, freeSolo, open]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setSearchText('');
      setOptions([]);
    },
  }));

  return <Autocomplete {...autoCompleteProps} />;
};

export default React.forwardRef(AsyncAutocomplete);
