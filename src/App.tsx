import React from 'react';
import { Box } from '@material-ui/core';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import AppRouter from './routes/AppRouter';

const App: React.FC = () => (
  <>
    <BrowserRouter>
      <Navbar />
      <Box paddingTop="70px">
        <AppRouter />
      </Box>
    </BrowserRouter>
  </>
);

export default App;
