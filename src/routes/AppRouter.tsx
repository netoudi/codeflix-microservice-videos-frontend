import * as React from 'react';
import { Route as ReactRoute, Switch } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Waiting from '../components/Waiting';
import PrivateRoute from './PriveteRoute';
import routes from './index';

const AppRouter: React.FC = () => {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <Waiting />;
  }

  return (
    <Switch>
      {routes.map((route, key) => {
        const Route = route.auth === true ? PrivateRoute : ReactRoute;

        const routeParams = {
          key,
          component: route.component!,
          ...(route.path && { path: route.path }),
          ...(route.exact && { exact: route.exact }),
        };

        return <Route {...routeParams} />;
      })}
    </Switch>
  );
};

export default AppRouter;
