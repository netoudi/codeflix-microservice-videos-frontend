import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';

const columnsDefinition: TableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
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
            <Link to={`/categories/${value}/edit`}>editar</Link>
            {' | '}
            <Link to={`/categories/${value}/delete`}>deletar</Link>
          </>
        );
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // componentDidMount
    let isSubscribed = true;

    (async () => {
      const response = await categoryHttp.list<ListResponse<Category>>();
      if (isSubscribed) setCategories(response.data.data);
    })();

    // componentWillUnmount
    return () => {
      isSubscribed = false;
    };
  }, []);

  return <DefaultTable title="" columns={columnsDefinition} data={categories} />;
};

export default Table;
