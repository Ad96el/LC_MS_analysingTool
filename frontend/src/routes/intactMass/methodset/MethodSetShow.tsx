import * as React from 'react';
import {
  Show, SimpleShowLayout, TextField, DateField, ShowProps, useTranslate,
  FunctionField, useNotify,
} from 'react-admin';
import { DataGrid, GridColDef, GridRowParams } from '@material-ui/data-grid';
import {
  makeStyles,
  Typography,
} from '@material-ui/core';

import { GridToolbar } from 'components';
// own libs
import dataProvider from 'dataProvider';

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

const MethodTable : React.FC<ShowProps> = (props) => {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const translate = useTranslate();
  const notify = useNotify();
  const classes = useStyles();

  React.useEffect(() => {
    const { id } = props;
    setLoading(true);

    dataProvider.getMethodByMethodSet(id as string).then((data) => {
      setRows(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setRows([]);
      notify('ERROR: could not get data from server', 'warning');
    });
  }, []);
  const naming = { decon: 'Deconvolution', peak: 'Peak Selection', fasta: 'Sequence' };
  const columns: GridColDef[] = [
    { field: 'name', headerName: translate('resources.routes.method.name'), flex: 400 },
    {
      field: 'type',
      headerName: translate('resources.routes.method.type'),
      flex: 400,
      valueFormatter: (param) => (param.row && param.row?.type ? naming[param.row?.type] : ''),
    },
    {
      field: 'version', headerName: translate('resources.routes.method.version'), type: 'number', flex: 300,
    },
    {
      field: 'user',
      headerName: 'User',
      flex: 500,
      valueFormatter: (param) => (param.row ? param.row?.user?.email : ''),
    },

  ];

  const VerticalSpacer = () => <span style={{ height: '1em' }} />;
  const handleClick = (param: GridRowParams) => {
    window.location.href = `/#/method/${param.id}/show`;
  };

  return (
    <>
      <VerticalSpacer />
      <Typography variant="h5">
        {translate('resources.routes.methodset.methodincluded')}
      </Typography>
      <VerticalSpacer />
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          disableSelectionOnClick
          rows={rows}
          pageSize={8}
          rowsPerPageOptions={[8, 15, 20]}
          onRowClick={handleClick}
          loading={loading}
          className={classes.root}
          columns={columns}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>

    </>
  );
};

const MethodSetShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();

  return (
    <>
      <Show {...props} actions={false}>
        <SimpleShowLayout>
          <FunctionField
            label={translate('resources.routes.methodset.user')}
            render={(record) => `${record.user ? record.user.email : ''} `}
          />
          <DateField source="created" label={translate('resources.routes.methodset.created')} fullWidth />
          <TextField source="name" label={translate('resources.routes.methodset.methodset')} />
          <TextField source="version" label={translate('resources.routes.methodset.version')} />

          <MethodTable {...props} />

        </SimpleShowLayout>
      </Show>

    </>
  );
};

export default MethodSetShow;
