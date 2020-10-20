import React, {
  Dispatch,
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { MUIDataTableColumn } from 'mui-datatables';
import { useDebounce } from 'use-debounce';
import { useHistory, useLocation } from 'react-router';
import { History } from 'history';
import { isEqual } from 'lodash';
import reducer, { Creators } from '../store/filter';
import { Actions as FilterActions, State as FilterState } from '../store/filter/types';
import * as Yup from '../util/vendor/yup';
import { MuiDataTableRefComponent } from '../components/DefaultTable';

interface FilterManagerOptions {
  schema: Yup.ObjectSchema;
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  debounceTime: number;
  history: History;
  tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
  extraFilter?: ExtraFilter;
}

interface ExtraFilter {
  getStateFromUrl: (queryParams: URLSearchParams) => any;
  formatSearchParams: (debouncedState: FilterState) => any;
  createValidationSchema: () => any;
}

type UseFilterOptions = Omit<FilterManagerOptions, 'history' | 'schema'>;

export default function useFilter(options: UseFilterOptions) {
  const history = useHistory();

  const {
    search: locationSearch,
    pathname: locationPathname,
    state: locationState,
  } = useLocation();

  const { rowsPerPage, rowsPerPageOptions, extraFilter, columns } = options;

  const schema = useMemo(
    () =>
      Yup.object().shape<FilterState>({
        search: Yup.string()
          .transform((value) => (!value ? undefined : value))
          .default(''),
        pagination: Yup.object().shape({
          page: Yup.number()
            .transform((value) => (isNaN(value) || parseInt(value, 10) < 1 ? undefined : value))
            .default(1),
          total: Yup.number()
            .transform((value) => (isNaN(value) || parseInt(value, 10) < 1 ? undefined : value))
            .default(0),
          per_page: Yup.number()
            .transform((value) =>
              isNaN(value) || !rowsPerPageOptions.includes(parseInt(value, 10)) ? undefined : value,
            )
            .default(rowsPerPage),
        }),
        order: Yup.object().shape({
          sort: Yup.string()
            .nullable()
            .transform((value) => {
              const columnsName = columns
                .filter((column) => !column.options || column.options.sort !== false)
                .map((column) => column.name);
              return columnsName.includes(value) ? value : undefined;
            })
            .default(null),
          dir: Yup.string()
            .nullable()
            .transform((value) =>
              !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value,
            )
            .default(null),
        }),
        ...(extraFilter && { extraFilter: extraFilter.createValidationSchema() }),
      }),
    [columns, extraFilter, rowsPerPage, rowsPerPageOptions],
  );

  // react-router history mutable | location immutable
  const stateFromUrl = useMemo<FilterState>(() => {
    const queryParams = new URLSearchParams(locationSearch.substr(1));

    return schema.cast({
      search: queryParams.get('search'),
      pagination: {
        page: queryParams.get('page'),
        per_page: queryParams.get('per_page'),
      },
      order: {
        sort: queryParams.get('sort'),
        dir: queryParams.get('dir'),
      },
      ...(extraFilter && { extraFilter: extraFilter.getStateFromUrl(queryParams) }),
    });
  }, [extraFilter, locationSearch, schema]);

  const cleanSearchText = useCallback((text) => {
    let newText = text;

    if (text && text.value !== undefined) {
      newText = text.value;
    }

    return newText;
  }, []);

  const formatSearchParams = useCallback(
    (state) => {
      const search = cleanSearchText(state.search);

      return {
        ...(search && search !== '' && { search }),
        ...(state.pagination.page !== 1 && {
          page: state.pagination.page,
        }),
        ...(state.pagination.per_page !== 10 && {
          per_page: state.pagination.per_page,
        }),
        ...(state.order.sort && { ...state.order }),
        ...(extraFilter && extraFilter.formatSearchParams(state)),
      };
    },
    [cleanSearchText, extraFilter],
  );

  const filterManager = new FilterManager({ ...options, history, schema });
  const initialState = stateFromUrl as FilterState;
  const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(
    reducer,
    initialState,
  );
  const [debounceFilterState] = useDebounce(filterState, options.debounceTime);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // useEffect(() => {
  //   history.replace({
  //     pathname: locationPathname,
  //     search: `?${new URLSearchParams(formatSearchParams(stateFromUrl) as any)}`,
  //     state: stateFromUrl,
  //   });
  // }, [formatSearchParams, history, locationPathname, stateFromUrl]);

  useEffect(() => {
    const newLocation = {
      pathname: locationPathname,
      search: `?${new URLSearchParams(formatSearchParams(debounceFilterState) as any)}`,
      state: { ...debounceFilterState, search: cleanSearchText(debounceFilterState.search) },
    };

    const oldState = locationState;
    const nextState = debounceFilterState;

    if (isEqual(oldState, nextState)) return;

    history.push(newLocation);
  }, [
    cleanSearchText,
    debounceFilterState,
    formatSearchParams,
    history,
    locationPathname,
    locationState,
  ]);

  filterManager.state = filterState;
  filterManager.debouncedState = debounceFilterState;
  filterManager.dispatch = dispatch;

  filterManager.applyOderInColumns();

  return {
    columns: filterManager.columns,
    cleanSearchText,
    filterManager,
    filterState,
    debounceFilterState,
    dispatch,
    totalRecords,
    setTotalRecords,
  };
}

class FilterManager {
  state: FilterState = null as any;

  debouncedState: FilterState = null as any;

  dispatch: Dispatch<FilterActions> = null as any;

  columns: MUIDataTableColumn[];

  rowsPerPage: number;

  rowsPerPageOptions: number[];

  debounceTime: number;

  history: History;

  tableRef: React.MutableRefObject<MuiDataTableRefComponent>;

  extraFilter?: ExtraFilter;

  schema: Yup.ObjectSchema;

  constructor(options: FilterManagerOptions) {
    const {
      schema,
      columns,
      rowsPerPage,
      rowsPerPageOptions,
      debounceTime,
      history,
      tableRef,
      extraFilter,
    } = options;

    this.schema = schema;
    this.columns = columns;
    this.rowsPerPage = rowsPerPage;
    this.rowsPerPageOptions = rowsPerPageOptions;
    this.debounceTime = debounceTime;
    this.history = history;
    this.tableRef = tableRef;
    this.extraFilter = extraFilter;
  }

  changeSearch(value) {
    this.dispatch(Creators.setSearch({ search: value }));
  }

  changePage(page) {
    this.dispatch(Creators.setPage({ page: page + 1 }));
  }

  changeRowsPerPage(perPage) {
    this.dispatch(Creators.setPerPage({ per_page: perPage }));
  }

  changeColumnSort(changedColumn: string, direction: string) {
    this.dispatch(
      Creators.setOrder({ sort: changedColumn, dir: direction.includes('desc') ? 'desc' : 'asc' }),
    );
    this.resetTablePagination();
  }

  changeExtraFilter(data) {
    this.dispatch(Creators.updateExtraFilter(data));
  }

  resetFilter() {
    const initialState: FilterState = {
      ...(this.schema.cast({}) as FilterState),
      search: { value: null, update: true },
    };

    this.dispatch(Creators.setReset({ state: initialState }));
    this.resetTablePagination();
  }

  applyOderInColumns() {
    this.columns = this.columns.map((column) => {
      if (column.name !== this.state.order.sort) return column;

      return {
        ...column,
        options: {
          ...column.options,
          sortDirection: this.state.order.dir as any,
        },
      };
    });
  }

  private resetTablePagination() {
    this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
    this.tableRef.current.changePage(0);
  }
}
