import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton,
  useTranslate, FunctionField, TextInput, Filter, ShowButton, DateInput,
  SelectInput,
} from 'react-admin';

const MethodList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label={translate('resources.routes.method.method')} source="name" alwaysOn />
      <SelectInput
        source="type"
        choices={[
          { id: 'decon', name: 'Deconvoltuion' },
          { id: 'peak', name: 'Peak Selection' },
          { id: 'fasta', name: 'Sequence' },
        ]}
      />
      <DateInput source="created" label={translate('resources.routes.method.created')} />
    </Filter>
  );
  const naming = { decon: 'Deconvolution', peak: 'Peak Selection', fasta: 'Sequence' };
  return (
    <List
      exporter={false}
      filters={<ListFilter />}
      bulkActionButtons={permissions > 1 ? undefined : false}
      {...props}
    >
      <Datagrid>
        <TextField source="name" label={translate('resources.routes.method.method')} />
        <FunctionField
          label={translate('resources.routes.method.type')}
          sortBy="type"
          source="type"
          render={(record) => `${naming[record.type]}`}
        />

        <DateField source="created" label={translate('resources.routes.method.created')} />
        <TextField source="version" label={translate('resources.routes.method.version')} />
        <FunctionField
          label={translate('resources.routes.method.user')}
          render={(r) => `${r.user ? r.user.email : ''} `}
        />

        <ShowButton />
        {permissions > 0 && <EditButton />}
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default MethodList;
