import React from 'react';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import AppRouter from './routes/AppRouter';
import Breadcrumbs from './components/Breadcrumbs';
import { SnackbarProvider } from './components/SnackbarProvider';
import Spinner from './components/Spinner';
import theme from './theme';

const App: React.FC = () => (
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
);

export default App;
