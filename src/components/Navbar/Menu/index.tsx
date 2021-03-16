import * as React from 'react';
import { Link } from 'react-router-dom';
import { Divider, IconButton, Menu as MUIMenu, Link as MUILink, MenuItem } from '@material-ui/core';
import { useKeycloak } from '@react-keycloak/web';

import MenuIcon from '@material-ui/icons/Menu';

import routes, { MyRouteProps } from '../../../routes';

const listRoutes = {
  dashboard: 'Dashboard',
  'categories.list': 'Categorias',
  'genres.list': 'Gêneros',
  'cast_members.list': 'Membros de elenco',
  'videos.list': 'Vídeos',
  uploads: 'Uploads',
};

const menuRoutes = routes.filter((route) => Object.keys(listRoutes).includes(route.name));

export const Menu: React.FC = () => {
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
        {Object.keys(listRoutes).map((routeName, key) => {
          const menu = menuRoutes.find((route) => route.name === routeName) as MyRouteProps;
          return (
            <MenuItem
              key={String(key)}
              component={Link}
              to={menu.path as string}
              onClick={handleClose}
            >
              {listRoutes[routeName]}
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem
          component={MUILink}
          rel="noopener noreferrer"
          href="http://localhost:8080"
          target="_blank"
          color="textPrimary"
          onClick={handleClose}
        >
          Usuários
        </MenuItem>
      </MUIMenu>
    </>
  );
};
