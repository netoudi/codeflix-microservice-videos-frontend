import { RouteProps } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/Category/List';
import CastMemberList from '../pages/CastMember/List';

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
    component: CategoryList,
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
];

export default routes;
