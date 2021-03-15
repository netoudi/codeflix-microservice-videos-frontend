import React from 'react';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { BrowserRouter } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { Navbar } from './components/Navbar';
import AppRouter from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import { SnackbarProvider } from './components/SnackbarProvider';
import Spinner from './components/Spinner';
import theme from './theme';
import LoadingProvider from './components/Loading/LoadingProvider';
import { keycloak } from './util/auth';

const App: React.FC = () => (
  <ReactKeycloakProvider authClient={keycloak}>
    <LoadingProvider>
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <BrowserRouter>
            <Spinner />
            <Navbar />
            <Box paddingTop="70px">
              <Breadcrumbs />
              <AppRouter />
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </MuiThemeProvider>
    </LoadingProvider>
  </ReactKeycloakProvider>
);

export default App;
