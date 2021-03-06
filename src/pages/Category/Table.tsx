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
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import categoryHttp from '../../util/http/category-http';
import { formatDate } from '../../util/format';
import DefaultTable, {
  makeActionsStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import * as Yup from '../../util/vendor/yup';
import LoadingContext from '../../components/Loading/LoadingContext';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import DeleteDialog from '../../components/DeleteDialog';

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
    name: 'is_active',
    label: 'Ativo?',
    width: '15%',
    options: {
      filter: true,
      filterType: 'dropdown',
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
          <IconButton color="secondary" component={Link} to={`/categories/${value}/edit`}>
            <EditIcon />
          </IconButton>
        );
      },
    },
  },
];

type TableProps = {};

const Table: React.FC = (props: TableProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const subscribed = useRef(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const loading = useContext(LoadingContext);
  const tableRef = useRef() as MutableRefObject<MuiDataTableRefComponent>;
  const {
    openDeleteDialog,
    setOpenDeleteDialog,
    rowsToDelete,
    setRowsToDelete,
  } = useDeleteCollection();

  const extraFilter = useMemo(
    () => ({
      createValidationSchema: () => {
        return Yup.object().shape({
          is_active: Yup.string()
            .nullable()
            .transform((value) => (!value || !['Sim', 'Não'].includes(value) ? undefined : value))
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.is_active !== null && {
                is_active: debouncedState.extraFilter.is_active,
              }),
            }
          : undefined;
      },
      getStateFromUrl: (queryParams) => ({ is_active: queryParams.get('is_active') }),
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

  const searchText = cleanSearchText(filterState.search);

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir, is_active }) => {
      try {
        const response = await categoryHttp.list<ListResponse<Category>>({
          queryParams: { search, page, per_page, sort, dir, is_active },
        });
        if (subscribed.current) {
          setCategories(response.data.data);
          setTotalRecords(response.data.meta.total);
        }
      } catch (error) {
        if (categoryHttp.isCancelledRequest(error)) return;
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    },
    [enqueueSnackbar, setTotalRecords],
  );

  const deleteRows = useCallback(
    (confirmed: boolean) => {
      setOpenDeleteDialog(false);

      if (!confirmed) {
        return;
      }

      const ids = rowsToDelete.data.map((value) => categories[value.index].id).join(',');

      categoryHttp
        .deleteCollection({ ids })
        .then((response) => {
          enqueueSnackbar('Registros excluídos com sucesso.', { variant: 'success' });

          if (
            rowsToDelete.data.length === filterState.pagination.per_page &&
            filterState.pagination.page > 1
          ) {
            const page = filterState.pagination.page - 2;
            filterManager.changePage(page);
          } else {
            getData({
              search: searchText,
              page: filterState.pagination.page,
              per_page: filterState.pagination.per_page,
              sort: filterState.order.sort,
              dir: filterState.order.dir,
              ...(debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.is_active !== null && {
                  is_active: debounceFilterState.extraFilter.is_active === 'Sim',
                }),
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar('Não foi possível excluir os registros.', { variant: 'error' });
        });
    },
    [
      categories,
      debounceFilterState.extraFilter,
      enqueueSnackbar,
      filterManager,
      filterState.order.dir,
      filterState.order.sort,
      filterState.pagination.page,
      filterState.pagination.per_page,
      getData,
      rowsToDelete.data,
      searchText,
      setOpenDeleteDialog,
    ],
  );

  useEffect(() => {
    subscribed.current = true;
    getData({
      search: searchText,
      page: filterState.pagination.page,
      per_page: filterState.pagination.per_page,
      sort: filterState.order.sort,
      dir: filterState.order.dir,
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

  // column is_active
  const indexColumnIsActive = columns.findIndex((column) => column.name === 'is_active');
  const columnIsActive = columns[indexColumnIsActive];
  const isActiveFilterValue =
    filterState.extraFilter && (filterState.extraFilter.is_active as never);
  (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];

  const serverSideFilterList = columns.map((column) => []);
  if (isActiveFilterValue !== undefined && isActiveFilterValue !== null) {
    serverSideFilterList[indexColumnIsActive] = [isActiveFilterValue];
  }

  return (
    <>
      <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
      <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
        <DefaultTable
          title=""
          columns={columns}
          data={categories}
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
            customToolbar: () => (
              <FilterResetButton handleClick={() => filterManager.resetFilter()} />
            ),
            onFilterChange: (changedColumn, filterList) => {
              if (changedColumn === 'is_active') {
                filterManager.changeExtraFilter({
                  [changedColumn]:
                    filterList[indexColumnIsActive][0] !== undefined
                      ? filterList[indexColumnIsActive][0]
                      : null,
                });
              }
            },
            onSearchChange: (value) => filterManager.changeSearch(value),
            onChangePage: (page) => filterManager.changePage(page),
            onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
            onColumnSortChange: (changedColumn, direction) =>
              filterManager.changeColumnSort(changedColumn, direction),
            onRowsDelete: (rowsDeleted: any[]) => {
              setRowsToDelete(rowsDeleted as any);
              return false;
            },
          }}
        />
      </MuiThemeProvider>
    </>
  );
};

export default Table;
