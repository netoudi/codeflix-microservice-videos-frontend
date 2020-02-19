import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';

interface Pagination {
  page: number;
  total: number;
  per_page: number;
}

interface Order {
  sort: string | null;
  dir: string | null;
}

interface SearchState {
  search: string;
  pagination: Pagination;
  order: Order;
}

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
  const INITIAL_STATE = {
    search: '',
    pagination: {
      page: 1,
      total: 0,
      per_page: 10,
    },
    order: {
      sort: null,
      dir: null,
    },
  };

  const snackbar = useSnackbar();
  const subscribed = useRef(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_STATE);

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
        setSearchState((prevState) => ({
          ...searchState,
          pagination: {
            ...prevState.pagination,
            page: response.data.meta.current_page,
            total: response.data.meta.total,
            per_page: response.data.meta.per_page,
          },
        }));
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
        searchText: searchState.search,
        page: searchState.pagination.page - 1,
        rowsPerPage: searchState.pagination.per_page,
        count: searchState.pagination.total,
        customToolbar: () => (
          <FilterResetButton
            handleClick={() =>
              setSearchState({
                ...INITIAL_STATE,
                search: {
                  value: INITIAL_STATE.search,
                  updated: true,
                } as any,
              })
            }
          />
        ),
        onSearchChange: (value) =>
          setSearchState((prevState) => ({
            ...prevState,
            search: value,
          })),
        onChangePage: (page) =>
          setSearchState((prevState) => ({
            ...prevState,
            pagination: {
              ...prevState.pagination,
              page: page + 1,
            },
          })),
        onChangeRowsPerPage: (perPage) =>
          setSearchState((prevState) => ({
            ...prevState,
            pagination: {
              ...prevState.pagination,
              page: 1,
              per_page: perPage,
            },
          })),
        onColumnSortChange: (changedColumn, direction) =>
          setSearchState((prevState) => ({
            ...prevState,
            order: {
              sort: changedColumn,
              dir: direction.includes('desc') ? 'desc' : 'asc',
            },
          })),
      }}
    />
  );
};

export default Table;
