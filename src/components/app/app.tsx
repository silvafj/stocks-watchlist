import React, { useEffect, useState } from 'react';
import { HashRouter, Link, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import ReactGA, { FieldsObject } from 'react-ga';
import { Layout, Menu } from 'antd';

import Dashboard from '../../routes/dashboard';
import Settings from '../../routes/settings';
import Crawler from '../crawler';

import logo from '../../assets/logo.svg';

import './app.css';

const { Header, Sider, Content } = Layout;

// ReactGA.initialize('UA-50201175-2', { testMode: process.env.NODE_ENV !== 'production' });

const withTracker = <P extends RouteComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  options: FieldsObject = {},
) => {
  const trackPage = (page: string) => {
    // ReactGA.set({ page, ...options });
    // ReactGA.pageview(page);
  };

  const trackPageWithEffect = (props: P) => {
    useEffect(() => {
      trackPage(props.location.pathname);
    }, [props.location.pathname]);

    return <WrappedComponent {...props} />;
  };

  return trackPageWithEffect;
};

function getKeyFromLocation(pathname: string): string {
  if (pathname === '/') {
    return 'dashboard';
  }

  return pathname.substr(1);
}

const SiderWithRouter = withRouter(({ location }) => (
  <Sider width='300px'>
    <Menu theme='dark' selectedKeys={[getKeyFromLocation(location.pathname)]}>
      <Menu.Item key='dashboard'>
        <Link to='/dashboard'>Dashboard</Link>
      </Menu.Item>
      <Menu.Item key='settings'>
        <Link to='/settings'>Settings</Link>
      </Menu.Item>
    </Menu>
  </Sider>
));

export const App: React.FC = () => (
  <HashRouter>
    <Layout>
      <Header>
        <div className='logo'>
          <img src={logo} className='icon' alt='logo' />
          <a href='.'>Stocks Watchlist</a>
        </div>
        <Crawler />
      </Header>
      <SiderWithRouter />
      <Content>
        <Route exact path={['/', '/dashboard']} component={withTracker(Dashboard)} />
        <Route exact path={['/settings']} component={withTracker(Settings)} />
      </Content>
    </Layout>
  </HashRouter>
);
