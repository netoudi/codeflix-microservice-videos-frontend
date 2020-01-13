import React from 'react';
import { Box } from '@material-ui/core';
import { Navbar } from './components/Navbar';
import { Page } from './components/Page';

const App: React.FC = () => (
  <>
    <Navbar />
    <Box paddingTop="70px">
      <Page title="Categories">CONTENT</Page>
    </Box>
  </>
);

export default App;
