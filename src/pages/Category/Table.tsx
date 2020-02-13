import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import { BadgeNo, BadgeYes } from '../../components/Badge';

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
            <Link to={`/categories/${value}/edit`}>editar</Link>
            {' | '}
            <Link to={`/categories/${value}/delete`}>deletar</Link>
          </>
        );
      },
    },
  },
];

interface Category {
  id: string;
  name: string;
}

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // componentDidMount
    let isSubscribed = true;

    (async () => {
      const response = await categoryHttp.list<{ data: Category[] }>();
      if (isSubscribed) setCategories(response.data.data);
    })();

    // componentWillUnmount
    return () => {
      isSubscribed = false;
    };
  }, []);

  return <MUIDataTable title="" columns={columnsDefinition} data={categories} />;
};

export default Table;
