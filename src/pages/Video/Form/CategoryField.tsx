import * as React from 'react';
import { Typography } from '@material-ui/core';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import categoryHttp from '../../../util/http/category-http';
import useCollectionManager from '../../../hooks/useCollectionManager';

interface CategoryFieldProps {
  categories: any[];
  setCategories: (categories) => void;
  genres: any[];
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
  const { categories, setCategories, genres } = props;
  const autoCompleteHttp = useHttpHandled();
  const { addItem, removeItem } = useCollectionManager(categories, setCategories);

  function fetchOptions(searchText) {
    return autoCompleteHttp(
      categoryHttp.list({
        queryParams: {
          search: searchText,
          genres: genres.map((genre) => genre.id).join(','),
          all: '',
        },
      }),
    ).then((response) => response.data.data);
  }

  return (
    <>
      <AsyncAutocomplete
        fetchOptions={fetchOptions}
        AutocompleteProps={{
          getOptionLabel: (option) => option.name,
          onChange: (event, value) => addItem(value),
          disabled: !genres.length,
        }}
        TextFieldProps={{ label: 'Categorias' }}
      />
      <GridSelected>
        {categories.map((category) => (
          <GridSelectedItem key={String(category.id)} onClick={() => removeItem(category)} xs={12}>
            <Typography noWrap>{category.name}</Typography>
          </GridSelectedItem>
        ))}
      </GridSelected>
    </>
  );
};

export default CategoryField;
