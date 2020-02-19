import { createActions, createReducer } from 'reduxsauce';
import * as Typings from './types';

export const { Types, Creators } = createActions<Typings.ActionTypes, Typings.ActionCreators>({
  setSearch: ['payload'],
  setPage: ['payload'],
  setPerPage: ['payload'],
  setOrder: ['payload'],
});

export const INITIAL_STATE: Typings.State = {
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

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
  [Types.SET_SEARCH]: setSearch as any,
  [Types.SET_PAGE]: setPage as any,
  [Types.SET_PER_PAGE]: setPerPage as any,
  [Types.SET_ORDER]: setOrder as any,
});

function setSearch(state = INITIAL_STATE, action: Typings.SetSearchAction): Typings.State {
  return {
    ...state,
    search: action.payload.search,
    pagination: {
      ...state.pagination,
      page: 1,
    },
  };
}

function setPage(state = INITIAL_STATE, action: Typings.SetPageAction): Typings.State {
  return {
    ...state,
    pagination: {
      ...state.pagination,
      page: action.payload.page,
    },
  };
}

function setPerPage(state = INITIAL_STATE, action: Typings.SetPerPageAction): Typings.State {
  return {
    ...state,
    pagination: {
      ...state.pagination,
      page: 1,
      per_page: action.payload.per_page,
    },
  };
}

function setOrder(state = INITIAL_STATE, action: Typings.SetOrderAction): Typings.State {
  return {
    ...state,
    order: {
      sort: action.payload.sort,
      dir: action.payload.dir,
    },
  };
}

export default reducer;
