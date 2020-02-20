import { Dispatch, Reducer, useReducer, useState } from 'react';
import { MUIDataTableColumn } from 'mui-datatables';
import { useDebounce } from 'use-debounce';
import { useHistory } from 'react-router';
import { History } from 'history';
import reducer, { Creators, INITIAL_STATE } from '../store/filter';
import { Actions as FilterActions, State as FilterState } from '../store/filter/types';

interface FilterManagerOptions {
  columns: MUIDataTableColumn[];
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  debounceTime: number;
  history: History;
}

type UseFilterOptions = Omit<FilterManagerOptions, 'history'>;

export default function useFilter(options: UseFilterOptions) {
  const history = useHistory();
  const filterManager = new FilterManager({ ...options, history });
  const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(
    reducer,
    INITIAL_STATE,
  );
  const [debounceFilterState] = useDebounce(filterState, options.debounceTime);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  filterManager.state = filterState;
  filterManager.dispatch = dispatch;

  filterManager.applyOderInColumns();

  return {
    columns: filterManager.columns,
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

  dispatch: Dispatch<FilterActions> = null as any;

  columns: MUIDataTableColumn[];

  rowsPerPage: number;

  rowsPerPageOptions: number[];

  debounceTime: number;

  history: History;

  constructor(options: FilterManagerOptions) {
    const { columns, rowsPerPage, rowsPerPageOptions, debounceTime, history } = options;
    this.columns = columns;
    this.rowsPerPage = rowsPerPage;
    this.rowsPerPageOptions = rowsPerPageOptions;
    this.debounceTime = debounceTime;
    this.history = history;
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

  cleanSearchText(text) {
    let newText = text;
    if (text && text.value !== undefined) {
      newText = text.value;
    }
    return newText;
  }

  pushHistory() {
    const newLocation = {
      pathname: this.history.location.pathname,
      search: `?${new URLSearchParams(this.formatSearchParams() as any)}`,
      state: { ...this.state, search: this.cleanSearchText(this.state.search) },
    };
    this.history.push(newLocation);
  }

  private formatSearchParams() {
    const search = this.cleanSearchText(this.state.search);

    return {
      ...(search && search !== '' && { search }),
      ...(this.state.pagination.page !== 1 && { page: this.state.pagination.page }),
      ...(this.state.pagination.per_page !== 10 && { per_page: this.state.pagination.per_page }),
      // ...(this.state.order.sort && { sort: this.state.order.sort, dir: this.state.order.dir }),
      ...(this.state.order.sort && { ...this.state.order }),
    };
  }
}
