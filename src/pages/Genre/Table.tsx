import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import genreHttp from '../../util/http/genre-http';
import { formatDate } from '../../util/format';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, Genre, ListResponse } from '../../util/models';

const columnsDefinition: TableColumn[] = [
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
    width: '15%',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return value ? <BadgeYes /> : <BadgeNo />;
      },
    },
  },
  {
    name: 'created_at',
    label: 'Criado em',
    width: '15%',
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
  const snackbar = useSnackbar();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      setLoading(true);

      try {
        const response = await genreHttp.list<ListResponse<Genre>>();
        if (isSubscribed) setGenres(response.data.data);
      } catch (error) {
        snackbar.enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []); // eslint-disable-line

  return <DefaultTable title="" columns={columnsDefinition} data={genres} loading={loading} />;
};

export default Table;
