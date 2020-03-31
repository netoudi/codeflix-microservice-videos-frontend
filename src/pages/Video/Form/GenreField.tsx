import * as React from 'react';
import { Typography } from '@material-ui/core';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import genreHttp from '../../../util/http/genre-http';

interface GenreFieldProps {}

const GenreField: React.FC<GenreFieldProps> = (props) => {
  const autoCompleteHttp = useHttpHandled();
  const fetchOptions = (searchText) =>
    autoCompleteHttp(genreHttp.list({ queryParams: { search: searchText, all: '' } })).then(
      (response) => response.data.data,
    );

  return (
    <>
      <AsyncAutocomplete
        fetchOptions={fetchOptions}
        AutocompleteProps={{ freeSolo: false, getOptionLabel: (option) => option.name }}
        TextFieldProps={{ label: 'Gêneros' }}
      />
      <GridSelected>
        <GridSelectedItem
          onClick={() => {
            console.log('clicou....');
          }}
          xs={12}
        >
          <Typography noWrap>Gênero Gênero Gênero Gênero Gênero Gênero Gênero</Typography>
        </GridSelectedItem>
      </GridSelected>
    </>
  );
};

export default GenreField;
