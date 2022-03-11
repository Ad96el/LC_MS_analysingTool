import * as React from 'react';
import { forwardRef } from 'react';
import {
  AppBar, UserMenu, MenuItemLink, useTranslate,
} from 'react-admin';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';

import { logo } from '../media';

const useStyles = makeStyles({
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  spacer: {
    flex: 1,
  },
  img: {
    width: '100px',
    height: '25px',
  },
});

const ConfigurationMenu = forwardRef<any, any>((props, ref) : any => {
  const translate = useTranslate();

  const click = props.onClick;
  return (
    <MenuItemLink
      ref={ref}
      to="/configuration"
      primaryText={translate('pos.configuration')}
      leftIcon={<SettingsIcon />}
      onClick={click}
      sidebarIsOpen
    />
  );
});

const CustomUserMenu = (props: any) => (
  <UserMenu {...props}>
    <ConfigurationMenu />
  </UserMenu>
);

const CustomAppBar : React.FC<any> = (props) => {
  const classes = useStyles();
  return (
    <AppBar {...props} elevation={1} userMenu={<CustomUserMenu />}>
      <Typography
        variant="h6"
        className={classes.title}
      />
      <img src={logo} alt="" className={classes.img} />
      <span className={classes.spacer} />
    </AppBar>
  );
};

export default CustomAppBar;
