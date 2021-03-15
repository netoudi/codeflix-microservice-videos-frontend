import React, { useCallback } from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { Route } from 'react-router';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const { keycloak } = useKeycloak();

  const render = useCallback(
    (props) => {
      if (keycloak.authenticated) {
        return <Component {...props} />;
      }

      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      );
    },
    [keycloak.authenticated],
  );

  return <Route {...rest} render={render} />;
};

export default PrivateRoute;
