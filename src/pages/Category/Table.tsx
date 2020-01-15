import React, { useState, useEffect } from 'react';
import { Chip } from '@material-ui/core';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { httpVideo } from '../../util/http';
import { formatDate } from '../../util/format';

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    httpVideo
      .get('/api/categories')
      .then((response) => setCategories(response.data.data));
  }, []);

  return (
    <MUIDataTable title="" columns={columnsDefinition} data={categories} />
  );
};

export default Table;
