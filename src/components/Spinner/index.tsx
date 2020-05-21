import React from 'react';
import { MuiThemeProvider, Theme, LinearProgress } from '@material-ui/core';

function makeLocalTheme(theme: Theme): Theme {
  return {
    ...theme,
    palette: {
      ...theme.palette,
      primary: theme.palette.error,
      type: 'dark'
    },
  };
}

const Spinner: React.FC = () => {
  return (
    <MuiThemeProvider theme={makeLocalTheme}>
      <LinearProgress
        color="primary"
        style={{
          position: 'fixed',
          width: '100%',
          zIndex: 9999,
        }}
      />
    </MuiThemeProvider>
  );
};

export default Spinner;
