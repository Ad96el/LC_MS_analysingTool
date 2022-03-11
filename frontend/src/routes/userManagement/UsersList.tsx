import * as React from 'react';
import {
  List, Datagrid, DateField, ListProps, DeleteButton, useNotify, useRefresh, useDataProvider,
  useTranslate, FunctionField, TextInput, Filter, EmailField, UpdateParams,
} from 'react-admin';
import Fab from '@material-ui/core/Fab';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// own libs

const AdminButton : React.FC<any> = ({ record }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handleClick = async (id: string) => {
    const upd = { ...record };
    upd.role = 2;
    try {
      const params : UpdateParams = {
        data: upd, previousData: record, id,
      };
      const response = await dataProvider.update('user', params);
      const user = response.data;
      if (user.approved) {
        notify('User is Admin');
        refresh();
      }
    } catch (e) {
      notify('User can not be admin', 'warning');
    }
  };
  return (
    <Fab
      size="small"
      color="default"
      aria-label="add"
      disabled={!record.approved || record.role === 2}
      onClick={() => { handleClick(record.id); }}
    >
      <AccountCircleIcon />
    </Fab>
  );
};

const ApprovButton : React.FC<any> = ({ record }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handleClick = async (id: string) => {
    const upd = { ...record };
    upd.approved = true;
    try {
      const params : UpdateParams = {
        data: upd, previousData: record, id,
      };
      const response = await dataProvider.update('user', params);
      const user = response.data;
      if (user.approved) {
        notify('User is approved');
        refresh();
      }
    } catch (e) {
      notify('User could not be approved', 'warning');
    }
  };
  return (
    <Fab
      size="small"
      color="primary"
      aria-label="add"
      disabled={record.approved}
      onClick={() => { handleClick(record.id); }}
    >
      <ThumbUpIcon />
    </Fab>
  );
};

const UsersList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();

  const roles = ['Guest', 'User', 'Admin'];

  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label={translate('resources.routes.users.email')} source="name" alwaysOn />
    </Filter>
  );
  return (
    <List filters={<ListFilter />} bulkActionButtons={false} {...props} exporter={false}>
      <Datagrid>
        <EmailField source="email" label={translate('resources.routes.users.email')} />
        <DateField source="created" label={translate('resources.routes.users.created')} />
        <FunctionField
          label={translate('resources.routes.users.role')}
          sortBy="role"
          source="role"
          render={(record) => `${roles[record.role]}`}
        />
        <ApprovButton />
        <AdminButton />
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default UsersList;
