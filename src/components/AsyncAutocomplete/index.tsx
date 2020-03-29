import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';

interface AsyncAutocompleteProps {
  TextFieldProps?: TextFieldProps;
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const textFieldProps: TextFieldProps = {
    margin: 'normal',
    variant: 'outlined',
    fullWidth: true,
    InputLabelProps: { shrink: true },
    ...(props.TextFieldProps && { ...props.TextFieldProps }),
  };

  const autoCompleteProps: AutocompleteProps<any> = {
    open,
    options: [],
    onOpen() {
      setOpen(true);
    },
    onClose() {
      setOpen(false);
    },
    onInputChange(event, value) {
      console.log(value);
      setSearchText(value);
    },
    renderInput: (params) => <TextField {...params} {...textFieldProps} />,
  };

  return <Autocomplete {...autoCompleteProps} />;
};

export default AsyncAutocomplete;
