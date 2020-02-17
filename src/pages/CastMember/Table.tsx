import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MUIDataTableColumn } from 'mui-datatables';
import castMemberHttp from '../../util/http/cast-member-http';
import { formatDate } from '../../util/format';
import { CastMember, ListResponse } from '../../util/models';
import DefaultTable from '../../components/DefaultTable';

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
  },
  {
    name: 'type',
    label: 'Tipo',
    options: {
      customBodyRender(value, tableMeta, updateValue) {
        return ['-', 'Diretor', 'Ator'][value] || '-';
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
  const [castMembers, setCastMembers] = useState<CastMember[]>([]);

  useEffect(() => {
    castMemberHttp
      .list<ListResponse<CastMember>>()
      .then((response) => setCastMembers(response.data.data));
  }, []);

  return <DefaultTable title="" columns={columnsDefinition} data={castMembers} />;
};

export default Table;
