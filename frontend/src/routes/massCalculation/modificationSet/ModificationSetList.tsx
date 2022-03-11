import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton,
  useTranslate, TextInput, Filter, DateInput,
} from 'react-admin';
import {
  DataGrid, GridColDef, GridRowParams,
} from '@material-ui/data-grid';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';

import { GridToolbar } from 'components';

const useStyles = makeStyles({

  root: {
    minHeight: 500,
    width: '100%',
    '& .MuiDataGrid-renderingZone': {
      '& .MuiDataGrid-row': {
        cursor: 'pointer',
      },
    },
  },

});

const MethodExpand = (props) => {
  const history = useHistory();
  const translate = useTranslate();
  const classes = useStyles();

  const columns: GridColDef[] = [
    { field: 'name', headerName: translate('resources.routes.modification.name'), flex: 400 },
    { field: 'formula_add', headerName: translate('resources.routes.modification.formula_add'), flex: 400 },
    { field: 'formula_sub', headerName: translate('resources.routes.modification.formula_sub'), flex: 400 },
    { field: 'kind', headerName: translate('resources.routes.modification.kind'), flex: 400 },
    { field: 'mass', headerName: translate('resources.routes.modification.mass'), flex: 400 },
    {
      field: 'creatd',
      headerName: translate('resources.routes.modification.created'),
      flex: 400,
      valueFormatter: (param) => new Date(param.row?.created).toLocaleDateString(),
    },

  ];

  const handleClick = (param: GridRowParams) => {
    history.replace(`modification/${param.id}`);
  };
  const { record } = props;
  const { modifications } = record;

  return (
    <div className={classes.root}>
      <DataGrid
        disableSelectionOnClick
        autoHeight
        rows={modifications}
        columns={columns}
        className={classes.root}
        rowsPerPageOptions={[7, 15, 20]}
        pageSize={7}
        onRowClick={handleClick}
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  );
};

const ModificationSetList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter :React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput source="name" label={translate('resources.routes.modificationset.modificationset')} />
      <DateInput source="created" label={translate('resources.routes.modificationset.created')} />
    </Filter>
  );
  return (
    <List
      filters={<ListFilter />}
      bulkActionButtons={permissions > 1 ? undefined : false}
      exporter={false}
      {...props}
    >
      <Datagrid expand={<MethodExpand />}>
        <TextField source="name" label={translate('resources.routes.modificationset.modificationset')} />
        <DateField source="created" label={translate('resources.routes.modificationset.created')} />
        {permissions > 0 && <EditButton />}
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default ModificationSetList;
