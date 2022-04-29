import { Button, makeStyles } from '@material-ui/core';
import {
  DataGrid, GridColDef, GridRowParams,
} from '@material-ui/data-grid';
import * as React from 'react';
import {
  List, Datagrid, TextField, ListProps, DeleteButton, DateField, useDataProvider,
  useTranslate, FunctionField, TextInput, Filter, ReferenceField, DateInput, ShowButton,
  Record, GetManyParams,
} from 'react-admin';
import MergeTypeIcon from '@material-ui/icons/MergeType';
import { useHistory } from 'react-router';
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

const CombineButton = (props) => {
  const history = useHistory();
  const translate = useTranslate();
  const onPress = () => {
    const { id } = props.record;
    history.push(`resultset/combine/${id}`);
  };

  return (
    <Button color="primary" onClick={onPress}>
      <MergeTypeIcon />
      {translate('resources.routes.resultset.merge')}
    </Button>
  );
};

const ResultsExpand = (props) => {
  const dataProvider = useDataProvider();
  const history = useHistory();
  const [data, setData] = React.useState<Record[]>([]);
  const [loading, setLoading] = React.useState(false);
  const classes = useStyles();

  const translate = useTranslate();
  // get the data
  React.useEffect(() => {
    setLoading(true);

    const { record } = props;
    if (record) {
      const { results } = record;
      const params : GetManyParams = { ids: results };
      dataProvider.getMany('result', params).then((response) => {
        setData(response.data);
        setLoading(false);
      });
    }
  }, [props]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: translate('resources.routes.result.name'), flex: 400 },
    {
      field: 'creatd',
      headerName: translate('resources.routes.result.created'),
      flex: 400,
      valueFormatter: (param) => new Date(param.row?.created).toLocaleDateString(),
    },
    {
      field: 'user',
      headerName: translate('resources.routes.result.user'),
      flex: 500,
      valueFormatter: (param) => param.row?.user?.email,
    },
    { field: 'version', headerName: translate('resources.routes.result.version'), flex: 700 },

  ];

  const handleClick = (param: GridRowParams) => {
    history.replace(`result/${param.id}/show`);
  };

  return (
    <DataGrid
      disableSelectionOnClick
      rows={data}
      loading={loading}
      columns={columns}
      disableExtendRowFullWidth
      pageSize={8}
      className={classes.root}
      onRowClick={handleClick}
      rowsPerPageOptions={[8, 15, 20]}
      components={{
        Toolbar: GridToolbar,
      }}
    />
  );
};

const ResultList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label={translate('resources.routes.resultset.name')} source="name" alwaysOn />
      <DateInput source="created" label={translate('resources.routes.result.created')} />

    </Filter>
  );
  return (
    <List
      exporter={false}
      filters={<ListFilter />}
      bulkActionButtons={permissions > 1 ? undefined : false}
      {...props}
    >
      <Datagrid expand={<ResultsExpand />}>
        <TextField source="name" label={translate('resources.routes.resultset.name')} />
        <DateField source="created" label={translate('resources.routes.resultset.created')} />
        <TextField source="version" label={translate('resources.routes.resultset.version')} />
        <FunctionField
          label={translate('resources.routes.result.user')}
          render={(record) => `${record.user ? record.user.email : ''}`}
        />
        <ReferenceField label={translate('resources.routes.resultset.sampleset')} reference="sampleset" source="sid" link="show">
          <TextField source="name" />
        </ReferenceField>
        <CombineButton />
        <ShowButton />
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default ResultList;
