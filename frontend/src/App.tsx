import React from 'react';
import {
  Admin, Resource,
} from 'react-admin';
import Methodset from 'routes/intactMass/methodset';
import {
  ProjectList, ProjectIcon, ProjectCreate, ProjectShow, ProjectEdit,
} from './routes/intactMass/project';
import User from './routes/userManagement';
import SampleSet from './routes/intactMass/sampleset';
import Method from './routes/intactMass/method';
import Sample from './routes/intactMass/samples';
import Result from './routes/intactMass/result';
import ResultSet from './routes/intactMass/result_set';
import authProvider from './authProvider';
import Dashboard from './routes/dasboard/Dashboard';
import Modification from './routes/massCalculation/modification';
import ModificationSet from './routes/massCalculation/modificationSet';
import LoginPage from './routes/Login';
import { Layout } from './layout';
import i18Provider from './i8n';
import customRoutes from './routes';
import customReducers from './reducer/reducer';
import dataProvider from './dataProvider';

const App : React.FC = () => {
  const [permissions, setPermissions] = React.useState(0);
  const [init, setInit] = React.useState(true);

  const getPermissions = () => {
    authProvider.getPermissions()
      .then((result) => setPermissions(result));
  };
  // init permissions
  window.addEventListener('hashchange', () => {
    if ((!window.location.href.includes('login') && init)) {
      getPermissions();
      setInit(false);
    }
  });

  const entry: any = performance.getEntriesByType('navigation')[0];
  if (entry.type === 'reload') {
    getPermissions();
  }

  return (
    <>
      <Admin
        dashboard={Dashboard}
        authProvider={authProvider}
        dataProvider={dataProvider}
        loginPage={LoginPage}
        layout={Layout}
        customReducers={customReducers}
        customRoutes={customRoutes}
        i18nProvider={i18Provider}
      >
        <Resource
          name="user"
          icon={User.icon}
          list={permissions > 1 ? User.list : undefined}
        />
        <Resource
          name="project"
          list={ProjectList}
          create={permissions > 0 ? ProjectCreate : undefined}
          show={ProjectShow}
          icon={ProjectIcon}
          edit={permissions > 0 ? ProjectEdit : undefined}
        />
        <Resource
          name="result"
          list={Result.list}
          show={Result.show}
          icon={SampleSet.icon}
        />
        <Resource
          name="modification"
          list={Modification.list}
          edit={Modification.edit}
          create={Modification.create}
          icon={Modification.icon}
        />
        <Resource
          name="modificationset"
          list={ModificationSet.list}
          edit={ModificationSet.edit}
          create={ModificationSet.create}
          icon={ModificationSet.icon}
        />
        <Resource
          name="resultset"
          list={ResultSet.list}
          show={ResultSet.show}
          icon={ResultSet.icon}
        />
        <Resource
          name="sampleset"
          list={SampleSet.list}
          create={permissions > 0 ? SampleSet.create : undefined}
          show={SampleSet.show}
          icon={SampleSet.icon}
          edit={permissions > 0 ? SampleSet.edit : undefined}
        />
        <Resource
          name="method"
          list={Method.list}
          create={permissions > 0 ? Method.create : undefined}
          show={Method.show}
          icon={Method.icon}
          edit={permissions > 0 ? Method.edit : undefined}
        />
        <Resource
          name="methodset"
          list={Methodset.list}
          create={permissions > 0 ? Methodset.create : undefined}
          show={Methodset.show}
          icon={Methodset.icon}
          edit={permissions > 0 ? Methodset.edit : undefined}
        />
        <Resource
          name="sample"
          list={Sample.list}
          create={permissions > 0 ? Sample.create : undefined}
          show={Sample.show}
          icon={Sample.icon}
          edit={permissions > 0 ? Sample.edit : undefined}
        />

      </Admin>

    </>
  );
};

export default App;
