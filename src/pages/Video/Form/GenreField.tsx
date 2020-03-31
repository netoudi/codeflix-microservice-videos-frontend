import * as React from 'react';
import { Typography } from '@material-ui/core';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import genreHttp from '../../../util/http/genre-http';
import useCollectionManager from '../../../hooks/useCollectionManager';

interface GenreFieldProps {
  genres: any[];
  setGenres: (genres) => void;
}

const GenreField: React.FC<GenreFieldProps> = (props) => {
  const { genres, setGenres } = props;
  const autoCompleteHttp = useHttpHandled();
  const { addItem, removeItem } = useCollectionManager(genres, setGenres);

  function fetchOptions(searchText) {
    return autoCompleteHttp(genreHttp.list({ queryParams: { search: searchText, all: '' } })).then(
      (response) => response.data.data,
    );
  }

  return (
    <>
      <AsyncAutocomplete
        fetchOptions={fetchOptions}
        AutocompleteProps={{
          freeSolo: false,
          getOptionLabel: (option) => option.name,
          onChange: (event, value) => addItem(value),
        }}
        TextFieldProps={{ label: 'Gêneros' }}
      />
      <GridSelected>
        {genres.map((genre) => (
          <GridSelectedItem key={String(genre.id)} onClick={() => removeItem(genre)} xs={12}>
            <Typography noWrap>{genre.name}</Typography>
          </GridSelectedItem>
        ))}
      </GridSelected>
    </>
  );
};

export default GenreField;
