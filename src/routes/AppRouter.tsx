import * as React from 'react';
import { Switch, Route as ReactRoute } from 'react-router-dom';
import PrivateRoute from './PriveteRoute';
import routes from './index';

const AppRouter: React.FC = () => (
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

export default AppRouter;
