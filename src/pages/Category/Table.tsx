import React, { useState, useEffect } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { httpVideo } from '../../util/http';

const columnsDefinition: MUIDataTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
  },
  {
    name: 'is_active',
    label: 'Ativo?',
  },
  {
    name: 'created_at',
    label: 'Criado em',
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
