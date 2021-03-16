import React from 'react';
import { useLocation } from 'react-router';
import { Redirect } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Waiting from '../../components/Waiting';

const Login: React.FC = () => {
  const { keycloak } = useKeycloak();
  const location = useLocation<{ from: { pathname: string } }>();

  const { from } = location.state || { from: { pathname: '/' } };

  if (keycloak.authenticated === true) {
    return <Redirect to={from} />;
  }

  keycloak.login({
    redirectUri: `${window.location.origin}${process.env.REACT_APP_BASENAME}${from.pathname}`,
  });

  return <Waiting />;
};

export default Login;
