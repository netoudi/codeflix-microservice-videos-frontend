import React, { MutableRefObject, useRef } from 'react';
import { Button, InputAdornment, TextField } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';

interface InputFileProps {}

const InputFile: React.FC<InputFileProps> = (props) => {
  const fileRef = useRef() as MutableRefObject<HTMLInputElement>;

  return (
    <>
      <input type="file" hidden ref={fileRef} />
      <TextField
        fullWidth
        variant="outlined"
        InputProps={{
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
        }}
      />
    </>
  );
};

export default InputFile;
