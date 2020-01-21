import { RouteProps } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/Category/PageList';
import CategoryForm from '../pages/Category/PageForm';
import CastMemberList from '../pages/CastMember/List';
import GenreList from '../pages/Genre/List';

export interface MyRouteProps extends RouteProps {
  name: string;
  label: string;
}

const routes: MyRouteProps[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    path: '/',
    component: Dashboard,
    exact: true,
  },
  {
    name: 'categories.list',
    label: 'Listar categorias',
    path: '/categories',
    component: CategoryList,
    exact: true,
  },
  {
    name: 'categories.create',
    label: 'Criar categorias',
    path: '/categories/create',
    component: CategoryForm,
    exact: true,
  },
  {
    name: 'categories.edit',
    label: 'Editar categorias',
    path: '/categories/:id/edit',
    component: CategoryList,
    exact: true,
  },
  {
    name: 'cast_members.list',
    label: 'Listar membros',
    path: '/cast-members',
    component: CastMemberList,
    exact: true,
  },
  {
    name: 'cast_members.create',
    label: 'Criar membro',
    path: '/cast-members/create',
    component: CastMemberList,
    exact: true,
  },
  {
    name: 'cast_members.edit',
    label: 'Editar membro',
    path: '/cast-members/:id/edit',
    component: CastMemberList,
    exact: true,
  },
  {
    name: 'genres.list',
    label: 'Listar gêneros',
    path: '/genres',
    component: GenreList,
    exact: true,
  },
  {
    name: 'genres.create',
    label: 'Criar gênero',
    path: '/genres/create',
    component: GenreList,
    exact: true,
  },
  {
    name: 'genres.edit',
    label: 'Editar gênero',
    path: '/genres/:id/edit',
    component: GenreList,
    exact: true,
  },
];

export default routes;