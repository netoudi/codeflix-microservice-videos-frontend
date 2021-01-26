import React, { useContext } from 'react';
import { MuiThemeProvider, Theme, LinearProgress, Fade } from '@material-ui/core';
import LoadingContext from '../Loading/LoadingContext';

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
  const loading = useContext(LoadingContext);

  return (
    <MuiThemeProvider theme={makeLocalTheme}>
      <Fade in={loading}>
        <LinearProgress
          color="primary"
          style={{
            position: 'fixed',
            width: '100%',
            zIndex: 9999,
          }}
        />
      </Fade>
    </MuiThemeProvider>
  );
};

export default Spinner;
