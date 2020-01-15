import React, { useEffect, useState } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { httpVideo } from '../../util/http';
import { formatDate } from '../../util/format';

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
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const [castMembers, setCastMembers] = useState([]);

  useEffect(() => {
    httpVideo
      .get('/api/cast-members')
      .then((response) => setCastMembers(response.data.data));
  }, []);

  return (
    <MUIDataTable title="" columns={columnsDefinition} data={castMembers} />
  );
};

export default Table;
