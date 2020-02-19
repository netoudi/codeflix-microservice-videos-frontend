import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
// import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import reducer, { Creators, INITIAL_STATE } from '../../store/search';

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
  const snackbar = useSnackbar();
  const subscribed = useRef(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE);

  const columns = columnsDefinition.map((column) => {
    if (column.name !== searchState.order.sort) return column;

    return {
      ...column,
      options: {
        ...column.options,
        sortDirection: searchState.order.dir as any,
      },
    };
  });

  useEffect(() => {
    subscribed.current = true;
    getData();
    return () => {
      subscribed.current = false;
    };
    // eslint-disable-next-line
  }, [
    searchState.search,
    searchState.pagination.page,
    searchState.pagination.per_page,
    searchState.order,
  ]);

  async function getData() {
    setLoading(true);

    try {
      const response = await categoryHttp.list<ListResponse<Category>>({
        queryParams: {
          search: cleanSearchText(searchState.search),
          page: searchState.pagination.page,
          per_page: searchState.pagination.per_page,
          sort: searchState.order.sort,
          dir: searchState.order.dir,
        },
      });
      if (subscribed.current) {
        setCategories(response.data.data);
        // dispatch({
        //   type: 'pagination',
        //   page: response.data.meta.current_page,
        //   total: response.data.meta.total,
        //   per_page: response.data.meta.per_page,
        // });
      }
    } catch (error) {
      if (categoryHttp.isCancelledRequest(error)) return;
      snackbar.enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function cleanSearchText(text) {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }
    return newText;
  }

  return (
    <DefaultTable
      title=""
      columns={columns}
      data={categories}
      loading={loading}
      debouncedSearchTime={500}
      options={{
        serverSide: true,
        responsive: 'scrollMaxHeight',
        searchText: searchState.search as any,
        page: searchState.pagination.page - 1,
        rowsPerPage: searchState.pagination.per_page,
        count: searchState.pagination.total,
        // customToolbar: () => <FilterResetButton handleClick={() => dispatch({ type: 'reset' })} />,
        onSearchChange: (value) => dispatch(Creators.setSearch({ search: value })),
        onChangePage: (page) => dispatch(Creators.setPage({ page: page + 1 })),
        onChangeRowsPerPage: (perPage) => dispatch(Creators.setPerPage({ per_page: perPage })),
        onColumnSortChange: (changedColumn, direction) =>
          dispatch(
            Creators.setOrder({
              sort: changedColumn,
              dir: direction.includes('desc') ? 'desc' : 'asc',
            }),
          ),
      }}
    />
  );
};

export default Table;
