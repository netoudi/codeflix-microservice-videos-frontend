import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import genreHttp from '../../util/http/genre-http';
import { formatDate } from '../../util/format';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, Genre, ListResponse } from '../../util/models';

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
        return value ? <BadgeYes /> : <BadgeNo />;
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
  {
    name: 'id',
    label: 'Ações',
    options: {
      sort: false,
      print: false,
      filter: false,
      searchable: false,
      setCellProps: (value) => ({
        style: {
          width: '10%',
          whiteSpace: 'nowrap',
        },
      }),
      customBodyRender(value, tableMeta, updateValue) {
        return (
          <>
            <Link to={`/genres/${value}/edit`}>editar</Link>
            {' | '}
            <Link to={`/genres/${value}/delete`}>deletar</Link>
          </>
        );
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    genreHttp.list<ListResponse<Genre>>().then((response) => setGenres(response.data.data));
  }, []);

  return <MUIDataTable title="" columns={columnsDefinition} data={genres} />;
};

export default Table;
