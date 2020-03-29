import React, { MutableRefObject, useRef, useState } from 'react';
import { Button, InputAdornment, TextField, TextFieldProps } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';

interface InputFileProps {
  InputFileProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  TextFieldProps?: TextFieldProps;
}

const InputFile: React.FC<InputFileProps> = (props) => {
  const fileRef = useRef() as MutableRefObject<HTMLInputElement>;
  const [filename, setFilename] = useState('');

  const textFieldProps: TextFieldProps = {
    fullWidth: true,
    variant: 'outlined',
    InputProps: {
      readOnly: true,
      endAdornment: (
        <InputAdornment position="end">
          <Button
            endIcon={<CloudUpload />}
            variant="contained"
            color="primary"
            onClick={() => fileRef.current.click()}
          >
            Adicionar
          </Button>
        </InputAdornment>
      ),
    },
    ...props.TextFieldProps,
    value: filename,
  };

  const inputFileProps = {
    hidden: true,
    ref: fileRef,
    onChange(event) {
      const { files } = event.target;

      if (files && files.length) {
        setFilename(
          Array.from(files)
            .map((file: any) => file.name)
            .join(', '),
        );
      }

      if (props.InputFileProps && props.InputFileProps.onChange) {
        props.InputFileProps.onChange(event);
      }
    },
  };

  return (
    <>
      <input type="file" {...inputFileProps} />
      <TextField {...textFieldProps} />
    </>
  );
};

export default InputFile;
