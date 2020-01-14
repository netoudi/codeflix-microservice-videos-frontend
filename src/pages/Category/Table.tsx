import * as React from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';

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
    name: 'created_ad',
    label: 'Criado em',
  },
];

const data = [
  { name: 'test1', is_active: true, created_ad: '2020-01-14' },
  { name: 'test2', is_active: true, created_ad: '2020-01-15' },
  { name: 'test3', is_active: false, created_ad: '2020-01-16' },
  { name: 'test4', is_active: true, created_ad: '2020-01-17' },
  { name: 'test5', is_active: false, created_ad: '2020-01-18' },
  { name: 'test6', is_active: true, created_ad: '2020-01-14' },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  return <MUIDataTable title="" columns={columnsDefinition} data={data} />;
};

export default Table;
