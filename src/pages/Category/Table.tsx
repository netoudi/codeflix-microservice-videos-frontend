import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import DefaultTable, { TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import { Creators } from '../../store/filter';
import useFilter from '../../hooks/useFilter';

const DEBOUNCE_TIME = 300;
const DEBOUNCE_SEARCH_TIME = 300;

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
  const {
    columns,
    filterManager,
    filterState,
    debounceFilterState,
    dispatch,
    totalRecords,
    setTotalRecords,
  } = useFilter({
    columns: columnsDefinition,
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 25, 50],
    debounceTime: DEBOUNCE_TIME,
  });

  useEffect(() => {
    subscribed.current = true;
    getData();
    return () => {
      subscribed.current = false;
    };
    // eslint-disable-next-line
  }, [
    filterManager.cleanSearchText(debounceFilterState.search), // eslint-disable-line
    debounceFilterState.pagination.page,
    debounceFilterState.pagination.per_page,
    debounceFilterState.order,
  ]);

  async function getData() {
    setLoading(true);

    try {
      const response = await categoryHttp.list<ListResponse<Category>>({
        queryParams: {
          search: filterManager.cleanSearchText(filterState.search),
          page: filterState.pagination.page,
          per_page: filterState.pagination.per_page,
          sort: filterState.order.sort,
          dir: filterState.order.dir,
        },
      });
      if (subscribed.current) {
        setCategories(response.data.data);
        setTotalRecords(response.data.meta.total);
      }
    } catch (error) {
      if (categoryHttp.isCancelledRequest(error)) return;
      snackbar.enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DefaultTable
      title=""
      columns={columns}
      data={categories}
      loading={loading}
      debouncedSearchTime={DEBOUNCE_SEARCH_TIME}
      options={{
        serverSide: true,
        responsive: 'scrollMaxHeight',
        searchText: filterState.search as any,
        page: filterState.pagination.page - 1,
        rowsPerPage: filterState.pagination.per_page,
        count: totalRecords,
        customToolbar: () => (
          <FilterResetButton handleClick={() => dispatch(Creators.setReset())} />
        ),
        onSearchChange: (value) => filterManager.changeSearch(value),
        onChangePage: (page) => filterManager.changePage(page),
        onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
        onColumnSortChange: (changedColumn, direction) =>
          filterManager.changeColumnSort(changedColumn, direction),
      }}
    />
  );
};

export default Table;
