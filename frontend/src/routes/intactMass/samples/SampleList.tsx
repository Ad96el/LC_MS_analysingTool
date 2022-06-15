import * as React from 'react';
import {
  List, Datagrid, TextField, ListProps, EditButton, DeleteButton, DateField, ReferenceInput,
  useTranslate, FunctionField, TextInput, Filter, ReferenceField, DateInput,

  AutocompleteInput,
} from 'react-admin';
import Link from '@material-ui/core/Link';
import { ColorField } from 'react-admin-color-input';

const SampleList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label={translate('resources.routes.sample.name')} source="name" alwaysOn />
      <TextInput source="type" label={translate('resources.routes.sample.type')} />
      <TextInput source="color" label={translate('resources.routes.sample.color')} />
      <DateInput source="created" label={translate('resources.routes.sample.created')} />
      <ReferenceInput label={translate('resources.routes.sample.sampleset')} reference="sampleset" source="sid">
        <AutocompleteInput style={{ width: 300 }} optionText="name" />
      </ReferenceInput>
    </Filter>
  );
  return (

    <List
      exporter={false}
      filters={<ListFilter />}
      bulkActionButtons={permissions > 1 ? undefined : false}
      {...props}
    >
      <Datagrid>
        <TextField source="name" label={translate('resources.routes.sample.name')} />
        <TextField source="type" label={translate('resources.routes.sample.type')} />
        <DateField source="created" label={translate('resources.routes.sample.created')} />
        <FunctionField
          label={translate('resources.routes.sample.user')}
          render={(record) => `${record.user ? record.user.email : ''}`}
        />
        <ReferenceField label={translate('resources.routes.sample.sampleset')} reference="sampleset" source="sid" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ColorField source="color" label={translate('resources.routes.sample.color')} />
        <ReferenceField sortable={false} label={translate('resources.routes.sample.result')} reference="result" source="result.id" link="show">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label={translate('resources.routes.sample.methodset')}
          render={(record) => (
            record.methodset ? (
              <Link underline="none" href={`/#/methodset/${record.methodset.id}/show`}>
                {record.methodset.name}
              </Link>
            ) : 'None'
          )}
        />
        {permissions > 0 && <EditButton />}
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default SampleList;
