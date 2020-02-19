import { createActions } from 'reduxsauce';

export const { Types, Creators } = createActions({
  setSearch: ['payload'],
  setPage: ['payload'],
  setPerPage: ['payload'],
  setOrder: ['payload'],
});
