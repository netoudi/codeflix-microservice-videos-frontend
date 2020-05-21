import React from 'react';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import AppRouter from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import { SnackbarProvider } from './components/SnackbarProvider';
import Spinner from './components/Spinner';
import theme from './theme';
import LoadingContext from './components/Loading/LoadingContext';

const App: React.FC = () => (
  <LoadingContext.Provider value={true}>
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
  </LoadingContext.Provider>
);

export default App;
