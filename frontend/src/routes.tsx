import * as React from 'react';
import { Route } from 'react-router-dom';
import Configuration from './routes/Configuration';
import { MassCalculation } from './routes/massCalculation/calculator';
import Ambr from './routes/ambr';

const AmbrPage = Ambr.page;
export default [
  <Route exact path="/configuration" render={() => <Configuration />} />,
  <Route exact path="/masscalculation/" render={() => <MassCalculation light={false} />} />,
  <Route exact path="/ambr" render={() => <AmbrPage />} />,
];
