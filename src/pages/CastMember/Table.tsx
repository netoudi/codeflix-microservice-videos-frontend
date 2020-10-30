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
import { invert } from 'lodash';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import castMemberHttp from '../../util/http/cast-member-http';
import { formatDate } from '../../util/format';
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import DefaultTable, {
  makeActionsStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from '../../components/DefaultTable';
import useFilter from '../../hooks/useFilter';
import * as Yup from '../../util/vendor/yup';
import categoryHttp from '../../util/http/category-http';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import LoadingContext from '../../components/Loading/LoadingContext';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import DeleteDialog from '../../components/DeleteDialog';

const DEBOUNCE_TIME = 300;
const DEBOUNCE_SEARCH_TIME = 300;
const ROWS_PER_PAGE = 10;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinition: TableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
    options: {
      filter: false,
    },
  },
  {
    name: 'type',
    label: 'Tipo',
    width: '15%',
    options: {
      filter: true,
      filterType: 'dropdown',
      filterList: [],
      filterOptions: {
        names: castMemberNames,
      },
      customBodyRender(value, tableMeta, updateValue) {
        return CastMemberTypeMap[value];
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
          <IconButton color="secondary" component={Link} to={`/cast-members/${value}/edit`}>
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
  const [castMembers, setCastMembers] = useState<CastMember[]>([]);
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
          type: Yup.number()
            .nullable()
            .transform((value) => (!value || !castMemberNames.includes(value) ? undefined : value))
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        if (!debouncedState.extraFilter || debouncedState.extraFilter.type === null) {
          return undefined;
        }

        return {
          type: debouncedState.extraFilter.type,
        };
      },
      getStateFromUrl: (queryParams) => ({ type: queryParams.get('type') }),
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

  const indexColumnType = columns.findIndex((column) => column.name === 'type');
  const columnType = columns[indexColumnType];
  const typeFilterValue = filterState.extraFilter && (filterState.extraFilter.type as never);
  (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

  const serverSideFilterList = columns.map((column) => []);
  if (typeFilterValue) {
    serverSideFilterList[indexColumnType] = [typeFilterValue];
  }

  const searchText = cleanSearchText(filterState.search);

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir, type }) => {
      try {
        const response = await castMemberHttp.list<ListResponse<CastMember>>({
          queryParams: { search, page, per_page, sort, dir, type },
        });
        if (subscribed.current) {
          setCastMembers(response.data.data);
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

      const ids = rowsToDelete.data.map((value) => castMembers[value.index].id).join(',');

      castMemberHttp
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
                debounceFilterState.extraFilter.type && {
                  type: invert(CastMemberTypeMap)[debounceFilterState.extraFilter.type],
                }),
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar('Não foi possível excluir os registros.', { variant: 'error' });
        });
    },
    [
      castMembers,
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
        debounceFilterState.extraFilter.type && {
          type: invert(CastMemberTypeMap)[debounceFilterState.extraFilter.type],
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
    <>
      <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
      <MuiThemeProvider theme={makeActionsStyles(columnsDefinition.length - 1)}>
        <DefaultTable
          title=""
          columns={columns}
          data={castMembers}
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
              const columnIndex = columns.findIndex((column) => column.name === changedColumn);
              filterManager.changeExtraFilter({
                [changedColumn]: filterList[columnIndex].length ? filterList[columnIndex][0] : null,
              });
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
