import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import * as Types from '../types';

import Table from './Tables';

const useStyles = makeStyles((theme: Theme) => createStyles({

  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    display: 'relative',
    height: 450,
  },
  img: {
    widht: 300,
    height: 350,
    margin: theme.spacing(1),
  },
  table: {
    float: 'right',
    minWidth: '60%',
    maxHeight: 350,
  },
}));

interface TableContainerI {
  fig?: string | undefined,
  row?: Types.RowI[] | undefined
  reduced?: boolean | undefined

}

const TableContainer : React.FC<TableContainerI> = ({ fig = '', row = [], reduced = false }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <img src={fig} className={classes.img} alt="" />
      <div className={classes.table}>
        <Table rows={row as Types.RowI[]} reduced={reduced as boolean} />
      </div>

    </div>
  );
};

export default TableContainer;
