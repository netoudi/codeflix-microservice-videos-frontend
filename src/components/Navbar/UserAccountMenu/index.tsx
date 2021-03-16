import * as React from 'react';
import { Divider, IconButton, Menu as MUIMenu, MenuItem } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/AccountBox';
import { useKeycloak } from '@react-keycloak/web';

export const UserAccountMenu: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  if (!initialized || !keycloak.authenticated) {
    return null;
  }

  return (
    <>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="open drawer"
        aria-controls="menu-user-account"
        aira-haspopup="true"
        onClick={handleOpen}
      >
        <MenuIcon />
      </IconButton>

      <MUIMenu
        id="menu-user-account"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        getContentAnchorEl={null}
      >
        <MenuItem disabled>Full Cycle</MenuItem>
        <Divider />
        <MenuItem>Minha conta</MenuItem>
        <MenuItem>Logout</MenuItem>
      </MUIMenu>
    </>
  );
};
