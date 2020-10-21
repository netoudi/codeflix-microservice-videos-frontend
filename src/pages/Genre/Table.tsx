import React, {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import genreHttp from '../../util/http/genre-http';
import { formatDate } from '../../util/format';
import DefaultTable, { MuiDataTableRefComponent, TableColumn } from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, Genre, ListResponse } from '../../util/models';
import useFilter from '../../hooks/useFilter';
import * as Yup from '../../util/vendor/yup';
import categoryHttp from '../../util/http/category-http';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import LoadingContext from '../../components/Loading/LoadingContext';

const DEBOUNCE_TIME = 300;
const DEBOUNCE_SEARCH_TIME = 300;
const ROWS_PER_PAGE = 10;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const columnsDefinition: TableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
    options: {
      filter: false,
    },
  },
  {
    name: 'categories',
    label: 'Categorias',
    options: {
      filter: true,
      filterType: 'multiselect',
      filterOptions: {
        names: [],
      },
      customBodyRender(value, tableMeta, updateValue) {
        return value.map((category: Category) => category.name).join(', ');
      },
    },
  },
  {
    name: 'is_active',
    label: 'Ativo?',
    width: '15%',
    options: {
      filter: true,
      filterType: 'dropdown',
      filterList: [],
      filterOptions: {
        names: ['Sim', 'Não'],
      },
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
      filter: false,
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
            <Link to={`/genres/${value}/edit`}>editar</Link>
            {' | '}
            <Link to={`/genres/${value}/delete`}>deletar</Link>
          </>
        );
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const subscribed = useRef(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const loading = useContext(LoadingContext);
  const tableRef = useRef() as MutableRefObject<MuiDataTableRefComponent>;

  const extraFilter = useMemo(
    () => ({
      createValidationSchema: () => {
        return Yup.object().shape({
          categories: Yup.mixed()
            .nullable()
            .transform((value) => (!value || value === '' ? undefined : value.split(',')))
            .default(null),
          is_active: Yup.string()
            .nullable()
            .transform((value) => (!value || !['Sim', 'Não'].includes(value) ? undefined : value))
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.categories && {
                categories: debouncedState.extraFilter.categories.join(','),
              }),
              ...(debouncedState.extraFilter.is_active !== null && {
                is_active: debouncedState.extraFilter.is_active,
              }),
            }
          : undefined;
      },
      getStateFromUrl: (queryParams) => ({
        categories: queryParams.get('categories'),
        is_active: queryParams.get('is_active'),
      }),
    }),
    [],
  );

  const {
    columns,
    cleanSearchText,
    filterManager,
    filterState,
    debounceFilterState,
    totalRecords,
    setTotalRecords,
  } = useFilter({
    columns: columnsDefinition,
    rowsPerPage: ROWS_PER_PAGE,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
    debounceTime: DEBOUNCE_TIME,
    tableRef,
    extraFilter,
  });

  // column categories
  const indexColumnCategories = columns.findIndex((column) => column.name === 'categories');
  const columnCategories = columns[indexColumnCategories];
  const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
  (columnCategories.options as any).filterList = categoriesFilterValue || [];

  const serverSideFilterList = columns.map((column) => []);
  if (categoriesFilterValue) {
    serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
  }

  // column is_active
  const indexColumnIsActive = columns.findIndex((column) => column.name === 'is_active');
  const columnIsActive = columns[indexColumnIsActive];
  const isActiveFilterValue =
    filterState.extraFilter && (filterState.extraFilter.is_active as never);
  (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];

  if (isActiveFilterValue !== undefined && isActiveFilterValue !== null) {
    serverSideFilterList[indexColumnIsActive] = [isActiveFilterValue];
  }

  const searchText = cleanSearchText(filterState.search);

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir, categories, is_active }) => {
      try {
        const response = await genreHttp.list<ListResponse<Genre>>({
          queryParams: { search, page, per_page, sort, dir, categories, is_active },
        });

        if (subscribed.current) {
          setGenres(response.data.data);
          setTotalRecords(response.data.meta.total);
        }
      } catch (error) {
        if (categoryHttp.isCancelledRequest(error)) return;
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    },
    [enqueueSnackbar, setTotalRecords],
  );

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      try {
        const response = await categoryHttp.list({ queryParams: { all: '' } });
        if (isSubscribed) {
          (columnCategories.options as any).filterOptions.names = response.data.data.map(
            (category) => category.name,
          );
        }
      } catch (error) {
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [columnCategories.options, enqueueSnackbar]);

  useEffect(() => {
    subscribed.current = true;
    getData({
      search: searchText,
      page: filterState.pagination.page,
      per_page: filterState.pagination.per_page,
      sort: filterState.order.sort,
      dir: filterState.order.dir,
      ...(debounceFilterState.extraFilter &&
        debounceFilterState.extraFilter.categories && {
          categories: debounceFilterState.extraFilter.categories.join(','),
        }),
      ...(debounceFilterState.extraFilter &&
        debounceFilterState.extraFilter.is_active !== null && {
          is_active: debounceFilterState.extraFilter.is_active === 'Sim',
        }),
    });
    return () => {
      subscribed.current = false;
    };
  }, [
    debounceFilterState.extraFilter,
    filterState.order.dir,
    filterState.order.sort,
    filterState.pagination.page,
    filterState.pagination.per_page,
    getData,
    searchText,
  ]);

  return (
    <DefaultTable
      title=""
      columns={columns}
      data={genres}
      loading={loading}
      debouncedSearchTime={DEBOUNCE_SEARCH_TIME}
      ref={tableRef}
      options={{
        serverSide: true,
        serverSideFilterList,
        responsive: 'scrollMaxHeight',
        searchText: filterState.search as any,
        page: filterState.pagination.page - 1,
        rowsPerPage: filterState.pagination.per_page,
        rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
        count: totalRecords,
        customToolbar: () => <FilterResetButton handleClick={() => filterManager.resetFilter()} />,
        onFilterChange: (changedColumn, filterList) => {
          if (changedColumn === 'is_active') {
            filterManager.changeExtraFilter({
              [changedColumn]:
                filterList[indexColumnIsActive][0] !== undefined
                  ? filterList[indexColumnIsActive][0]
                  : null,
            });
          }

          if (changedColumn === 'categories') {
            const columnIndex = columns.findIndex((column) => column.name === changedColumn);
            filterManager.changeExtraFilter({
              [changedColumn]: filterList[columnIndex].length ? filterList[columnIndex] : null,
            });
          }
        },
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
