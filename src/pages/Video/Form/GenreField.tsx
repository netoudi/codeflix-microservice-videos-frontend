import * as React from 'react';
import { MutableRefObject, RefAttributes, useImperativeHandle, useRef } from 'react';
import {
  FormControl,
  FormControlProps,
  FormHelperText,
  Typography,
  useTheme,
} from '@material-ui/core';
import AsyncAutocomplete, {
  AsyncAutocompleteComponent,
} from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import genreHttp from '../../../util/http/genre-http';
import useCollectionManager from '../../../hooks/useCollectionManager';
import { getGenresFromCategory } from '../../../util/model-filters';

interface GenreFieldProps extends RefAttributes<GenreFieldComponent> {
  genres: any[];
  setGenres: (genres) => void;
  categories: any[];
  setCategories: (categories) => void;
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

export interface GenreFieldComponent {
  clear: () => void;
}

const GenreField: React.RefForwardingComponent<GenreFieldComponent, GenreFieldProps> = (
  props,
  ref,
) => {
  const { genres, setGenres, categories, setCategories, error, disabled } = props;
  const autoCompleteHttp = useHttpHandled();
  const { addItem, removeItem } = useCollectionManager(genres, setGenres);
  const { removeItem: removeCategory } = useCollectionManager(categories, setCategories);
  const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;
  const theme = useTheme();

  function fetchOptions(searchText) {
    return autoCompleteHttp(genreHttp.list({ queryParams: { search: searchText, all: '' } })).then(
      (response) => response.data.data,
    );
  }

  useImperativeHandle(ref, () => ({
    clear: () => autocompleteRef.current.clear(),
  }));

  return (
    <>
      <AsyncAutocomplete
        ref={autocompleteRef}
        fetchOptions={fetchOptions}
        AutocompleteProps={{
          clearOnEscape: true,
          freeSolo: true,
          getOptionLabel: (option) => option.name,
          getOptionSelected: (option, value) => option.id === value.id,
          onChange: (event, value) => addItem(value),
          disabled: disabled === true,
        }}
        TextFieldProps={{ label: 'Gêneros', error: error !== undefined }}
      />
      <FormHelperText style={{ height: theme.spacing(3) }}>
        Escolha os gêneros do vídeo.
      </FormHelperText>

      <FormControl
        fullWidth
        margin="none"
        error={error !== undefined}
        disabled={disabled === true}
        {...props.FormControlProps}
      >
        {!!genres.length && (
          <GridSelected>
            {genres.map((genre) => (
              <GridSelectedItem
                key={String(genre.id)}
                onDelete={() => {
                  const categoriesWithOneGenre = categories.filter((category) => {
                    const genresFromCategory = getGenresFromCategory(genres, category);
                    return genresFromCategory.length === 1 && genres[0].id === genre.id;
                  });
                  categoriesWithOneGenre.forEach((item) => removeCategory(item));
                  removeItem(genre);
                }}
                xs={12}
              >
                <Typography noWrap>{genre.name}</Typography>
              </GridSelectedItem>
            ))}
          </GridSelected>
        )}
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default React.forwardRef(GenreField);
