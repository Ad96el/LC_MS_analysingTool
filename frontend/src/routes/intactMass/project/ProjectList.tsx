import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, ShowButton, useNotify, DeleteButton,
  useTranslate, FunctionField, TextInput, Filter, PaginationPayload, SortPayload, GetListParams,
  useDataProvider, Record, GetListResult, TopToolbar, CreateButton, DateInput,
} from 'react-admin';
import {
  DataGrid, GridColDef, GridRowParams,
} from '@material-ui/data-grid';
import { GridToolbar } from 'components';
import { makeStyles } from '@material-ui/core';
// own libs
import { useHistory } from 'react-router-dom';

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

const SampleSetExpand = (props) => {
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const history = useHistory();
  const [data, setData] = React.useState<Record[]>([]);
  const [loading, setLoading] = React.useState(false);

  const translate = useTranslate();
  // get the data
  React.useEffect(() => {
    setLoading(true);

    const pagination : PaginationPayload = { page: 1, perPage: 250 };

    const sort : SortPayload = { field: 'id', order: 'ASC' };

    const filter = { pid: props.id };

    const params : GetListParams = {
      pagination, sort, filter,
    };

    dataProvider.getList('sampleset', params).then((rows : GetListResult<Record>) => {
      setData(rows.data);
      setLoading(false);
    }).catch(() => {
      notify('this is an error', 'warning');
      setData([]);
      setLoading(false);
    });
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: translate('resources.routes.sampleset.name'), flex: 400 },
    { field: 'descr', headerName: translate('resources.routes.sampleset.descr'), flex: 700 },
    { field: 'system_name', headerName: translate('resources.routes.sampleset.system_name'), flex: 400 },
    {
      field: 'creatd',
      headerName: translate('resources.routes.sampleset.created'),
      flex: 400,
      valueFormatter: (param) => new Date(param.row?.created).toLocaleDateString(),
    },

    {
      field: 'user',
      headerName: 'User',
      flex: 500,
      valueFormatter: (param) => (param.row ? param.row?.user?.email : ''),
    },
  ];

  const handleClick = (param: GridRowParams) => {
    history.replace(`sampleset/${param.id}/show`);
  };

  const classes = useStyles();

  return (
    <DataGrid
      disableSelectionOnClick
      rows={data}
      loading={loading}
      columns={columns}
      pageSize={8}
      style={{ margin: '1em' }}
      className={classes.root}
      onRowClick={handleClick}
      components={{
        Toolbar: GridToolbar,
      }}
    />
  );
};

const ListActions = ({ permissions, ...props }) => {
  const { filters } = props;
  return (
    <TopToolbar>
      { React.cloneElement(filters, { context: 'button' })}
      { permissions > 1 ? <CreateButton /> : <div /> }

    </TopToolbar>
  );
};

// list component

const ProjectList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label="name" source="name" alwaysOn />
      <TextInput source="sop" />
      <DateInput source="created" label={translate('resources.routes.project.created')} />
    </Filter>
  );
  return (
    <List
      filters={<ListFilter />}
      exporter={false}
      bulkActionButtons={permissions > 1 ? undefined : false}
      actions={<ListActions permissions={permissions} />}
      {...props}
    >
      <Datagrid rowClick="expand" expand={<SampleSetExpand />}>
        <TextField source="name" label={translate('resources.routes.project.project')} />
        <TextField source="sop" label={translate('resources.routes.project.sop')} />
        <DateField source="created" label={translate('resources.routes.project.created')} />
        <TextField source="desc" label={translate('resources.routes.project.desc')} />
        <FunctionField
          label={translate('resources.routes.project.user')}
          render={(record) => `${record.user ? record.user.email : ''} `}
        />
        <ShowButton />
        { permissions > 1
        && <EditButton />}
        { permissions > 1
        && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default ProjectList;
