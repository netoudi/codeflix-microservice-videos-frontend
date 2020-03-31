import * as React from 'react';
import { Typography } from '@material-ui/core';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import categoryHttp from '../../../util/http/category-http';

interface CategoryFieldProps {}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
  const autoCompleteHttp = useHttpHandled();
  const fetchOptions = (searchText) =>
    autoCompleteHttp(categoryHttp.list({ queryParams: { search: searchText, all: '' } })).then(
      (response) => response.data.data,
    );

  return (
    <>
      <AsyncAutocomplete
        fetchOptions={fetchOptions}
        AutocompleteProps={{ freeSolo: true, getOptionLabel: (option) => option.name }}
        TextFieldProps={{ label: 'Categorias' }}
      />
      <GridSelected>
        <GridSelectedItem
          onClick={() => {
            console.log('clicou....');
          }}
          xs={12}
        >
          <Typography noWrap>Categorias Categorias Categorias Categorias </Typography>
        </GridSelectedItem>
      </GridSelected>
    </>
  );
};

export default CategoryField;
