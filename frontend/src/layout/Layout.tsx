import * as React from 'react';
import { useSelector } from 'react-redux';
import { Layout, LayoutProps, Sidebar } from 'react-admin';
import * as Types from 'types';
import AppBar from './AppBar';
import Menu from './Menu';
import { darkTheme, lightTheme } from './themes';

const CustomSidebar = (props: any) => <Sidebar {...props} size={200} />;

const LayoutFC :React.FC<LayoutProps> = (props: LayoutProps) => {
  const theme = useSelector((state: Types.AppState) => (state.data.theme === 'dark' ? darkTheme : lightTheme));
  return (
    <Layout
      {...props}
      appBar={AppBar}
      sidebar={CustomSidebar}
      menu={Menu}
      theme={theme}
    />
  );
};

export default LayoutFC;
