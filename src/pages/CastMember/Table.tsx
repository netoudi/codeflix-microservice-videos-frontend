import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import castMemberHttp from '../../util/http/cast-member-http';
import { formatDate } from '../../util/format';
import { CastMember, ListResponse } from '../../util/models';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';

const columnsDefinition: TableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
  },
  {
    name: 'type',
    label: 'Tipo',
    width: '15%',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return ['-', 'Diretor', 'Ator'][value] || '-';
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
            <Link to={`/cast-members/${value}/edit`}>editar</Link>
            {' | '}
            <Link to={`/cast-members/${value}/delete`}>deletar</Link>
          </>
        );
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const snackbar = useSnackbar();
  const [castMembers, setCastMembers] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      setLoading(true);

      try {
        const response = await castMemberHttp.list<ListResponse<CastMember>>();
        if (isSubscribed) setCastMembers(response.data.data);
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

  return <DefaultTable title="" columns={columnsDefinition} data={castMembers} loading={loading} />;
};

export default Table;
