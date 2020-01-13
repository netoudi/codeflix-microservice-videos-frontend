import * as React from 'react';
import { IconButton, Menu as MUIMenu, MenuItem } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';

export const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        aria-controls="menu-appbar"
        aira-haspopup="true"
        onClick={handleOpen}
      >
        <MenuIcon />
      </IconButton>

      <MUIMenu
        id="menu-appbar"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={handleClose}>Categories</MenuItem>
      </MUIMenu>
    </>
  );
};
