import React, { useEffect, useState } from 'react';
import { Chip } from '@material-ui/core';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import genreHttp from '../../util/http/genre-http';
import { formatDate } from '../../util/format';

interface Category {
  name: string;
}

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
  },
  {
    name: 'categories',
    label: 'Categorias',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value.map((category: Category) => category.name).join(', ');
      },
    },
  },
  {
    name: 'is_active',
    label: 'Ativo?',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? (
          <Chip label="Sim" color="primary" />
        ) : (
          <Chip label="Não" color="secondary" />
        );
      },
    },
  },
  {
    name: 'created_at',
    label: 'Criado em',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return formatDate(value, "dd/MM/yyyy 'às' H:mm");
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    genreHttp.list().then((response) => setGenres(response.data.data));
  }, []);

  return <MUIDataTable title="" columns={columnsDefinition} data={genres} />;
};

export default Table;
