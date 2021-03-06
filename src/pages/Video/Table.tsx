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
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';
import videoHttp from '../../util/http/video-http';
import { formatDate } from '../../util/format';
import DefaultTable, {
  makeActionsStyles,
  MuiDataTableRefComponent,
  TableColumn,
} from '../../components/DefaultTable';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, Genre, ListResponse, Video } from '../../util/models';
import FilterResetButton from '../../components/DefaultTable/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import * as Yup from '../../util/vendor/yup';
import DeleteDialog from '../../components/DeleteDialog';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import LoadingContext from '../../components/Loading/LoadingContext';

const DEBOUNCE_TIME = 300;
const DEBOUNCE_SEARCH_TIME = 300;
const ROWS_PER_PAGE = 10;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const columnsDefinition: TableColumn[] = [
  {
    name: 'title',
    label: 'Título',
    options: {
      filter: false,
    },
  },
  {
    name: 'genres',
    label: 'Gêneros',
    options: {
      filter: true,
      filterType: 'multiselect',
      filterOptions: {
        names: [],
      },
      customBodyRender(value, tableMeta, updateValue) {
        return value.map((genre: Genre) => genre.name).join(', ');
      },
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
    name: 'opened',
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
          <IconButton color="secondary" component={Link} to={`/videos/${value}/edit`}>
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
  const [videos, setVideos] = useState<Video[]>([]);
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
          genres: Yup.mixed()
            .nullable()
            .transform((value) => (!value || value === '' ? undefined : value.split(',')))
            .default(null),
          categories: Yup.mixed()
            .nullable()
            .transform((value) => (!value || value === '' ? undefined : value.split(',')))
            .default(null),
          opened: Yup.string()
            .nullable()
            .transform((value) => (!value || !['Sim', 'Não'].includes(value) ? undefined : value))
            .default(null),
        });
      },
      formatSearchParams: (debouncedState) => {
        return debouncedState.extraFilter
          ? {
              ...(debouncedState.extraFilter.genres && {
                genres: debouncedState.extraFilter.genres.join(','),
              }),
              ...(debouncedState.extraFilter.categories && {
                categories: debouncedState.extraFilter.categories.join(','),
              }),
              ...(debouncedState.extraFilter.opened !== null && {
                opened: debouncedState.extraFilter.opened,
              }),
            }
          : undefined;
      },
      getStateFromUrl: (queryParams) => ({
        genres: queryParams.get('genres'),
        categories: queryParams.get('categories'),
        opened: queryParams.get('opened'),
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

  // column genres
  const indexColumnGenres = columns.findIndex((column) => column.name === 'genres');
  const columnGenres = columns[indexColumnGenres];
  const genresFilterValue = filterState.extraFilter && filterState.extraFilter.genres;
  (columnGenres.options as any).filterList = genresFilterValue || [];

  const serverSideFilterList = columns.map((column) => []);
  if (genresFilterValue) {
    serverSideFilterList[indexColumnGenres] = genresFilterValue;
  }

  // column categories
  const indexColumnCategories = columns.findIndex((column) => column.name === 'categories');
  const columnCategories = columns[indexColumnCategories];
  const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
  (columnCategories.options as any).filterList = categoriesFilterValue || [];

  if (categoriesFilterValue) {
    serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
  }

  // column opened
  const indexColumnOpened = columns.findIndex((column) => column.name === 'opened');
  const columnOpened = columns[indexColumnOpened];
  const openedFilterValue = filterState.extraFilter && (filterState.extraFilter.opened as never);
  (columnOpened.options as any).filterList = openedFilterValue ? [openedFilterValue] : [];

  if (openedFilterValue !== undefined && openedFilterValue !== null) {
    serverSideFilterList[indexColumnOpened] = [openedFilterValue];
  }

  const searchText = cleanSearchText(debounceFilterState.search);

  const getData = useCallback(
    async ({ search, page, per_page, sort, dir, genres, categories, opened }) => {
      try {
        const response = await videoHttp.list<ListResponse<Video>>({
          queryParams: { search, page, per_page, sort, dir, genres, categories, opened },
        });
        if (subscribed.current) {
          setVideos(response.data.data);
          setTotalRecords(response.data.meta.total);

          if (openDeleteDialog) {
            setOpenDeleteDialog(false);
          }
        }
      } catch (error) {
        if (videoHttp.isCancelledRequest(error)) return;
        enqueueSnackbar('Não foi possível carregar as informações.', { variant: 'error' });
      }
    },
    [enqueueSnackbar, openDeleteDialog, setOpenDeleteDialog, setTotalRecords],
  );

  const deleteRows = useCallback(
    (confirmed: boolean) => {
      setOpenDeleteDialog(false);

      if (!confirmed) {
        return;
      }

      const ids = rowsToDelete.data.map((value) => videos[value.index].id).join(',');

      videoHttp
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
              page: debounceFilterState.pagination.page,
              per_page: debounceFilterState.pagination.per_page,
              sort: debounceFilterState.order.sort,
              dir: debounceFilterState.order.dir,
              ...(debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.genres && {
                  genres: debounceFilterState.extraFilter.genres.join(','),
                }),
              ...(debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.categories && {
                  categories: debounceFilterState.extraFilter.categories.join(','),
                }),
              ...(debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.opened !== null && {
                  opened: debounceFilterState.extraFilter.opened === 'Sim',
                }),
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar('Não foi possível excluir os registros.', { variant: 'error' });
        });
    },
    [
      debounceFilterState.extraFilter,
      debounceFilterState.order.dir,
      debounceFilterState.order.sort,
      debounceFilterState.pagination.page,
      debounceFilterState.pagination.per_page,
      enqueueSnackbar,
      filterManager,
      filterState.pagination.page,
      filterState.pagination.per_page,
      getData,
      rowsToDelete.data,
      searchText,
      setOpenDeleteDialog,
      videos,
    ],
  );

  useEffect(() => {
    let isSubscribed = true;

    (async () => {
      try {
        const [genreResponse, categoryResponse] = await Promise.all([
          genreHttp.list({ queryParams: { all: '' } }),
          categoryHttp.list({ queryParams: { all: '' } }),
        ]);

        if (isSubscribed) {
          (columnGenres.options as any).filterOptions.names = genreResponse.data.data.map(
            (genre) => genre.name,
          );
          (columnCategories.options as any).filterOptions.names = categoryResponse.data.data.map(
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
  }, [columnCategories.options, columnGenres.options, enqueueSnackbar]);

  useEffect(() => {
    subscribed.current = true;
    getData({
      search: searchText,
      page: debounceFilterState.pagination.page,
      per_page: debounceFilterState.pagination.per_page,
      sort: debounceFilterState.order.sort,
      dir: debounceFilterState.order.dir,
      ...(debounceFilterState.extraFilter &&
        debounceFilterState.extraFilter.genres && {
          genres: debounceFilterState.extraFilter.genres.join(','),
        }),
      ...(debounceFilterState.extraFilter &&
        debounceFilterState.extraFilter.categories && {
          categories: debounceFilterState.extraFilter.categories.join(','),
        }),
      ...(debounceFilterState.extraFilter &&
        debounceFilterState.extraFilter.opened !== null && {
          opened: debounceFilterState.extraFilter.opened === 'Sim',
        }),
    });
    return () => {
      subscribed.current = false;
    };
  }, [
    debounceFilterState.extraFilter,
    debounceFilterState.order.dir,
    debounceFilterState.order.sort,
    debounceFilterState.pagination.page,
    debounceFilterState.pagination.per_page,
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
          data={videos}
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
              if (changedColumn === 'opened') {
                filterManager.changeExtraFilter({
                  [changedColumn]:
                    filterList[indexColumnOpened][0] !== undefined
                      ? filterList[indexColumnOpened][0]
                      : null,
                });
              }

              if (changedColumn === 'genres' || changedColumn === 'categories') {
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
