import * as React from 'react';
import { Button, FormControl, FormControlProps } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import InputFile from '../../../components/InputFile';

interface UploadFieldProps {
  accept: string;
  label: string;
  setValue: (value) => void;
  error?: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

const UploadField: React.FC<UploadFieldProps> = (props) => {
  const { accept, label, setValue, error, disabled } = props;

  return (
    <FormControl
      error={error !== undefined}
      disabled={disabled === true}
      {...props.FormControlProps}
    >
      <InputFile
        TextFieldProps={{
          label,
          InputLabelProps: { shrink: true },
        }}
        InputFileProps={{
          accept,
          onChange(event) {
            const files = event.target.files as any;
            files.length && setValue(files[0]);
          },
        }}
        ButtonFile={
          <Button
            endIcon={<CloudUpload />}
            variant="contained"
            color="primary"
            onClick={() => null}
          >
            Adicionar
          </Button>
        }
      />
    </FormControl>
  );
};

export default UploadField;
