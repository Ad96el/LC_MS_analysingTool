import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton, ShowButton,
  useTranslate, FunctionField, TextInput, Filter, ArrayField, ChipField, SingleFieldList, DateInput,
} from 'react-admin';

const MethodSetList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter :React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label={translate('resources.routes.methodset.methodset')} source="name" alwaysOn />
      <DateInput source="created" label={translate('resources.routes.methodset.created')} />
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
        <TextField source="name" label={translate('resources.routes.methodset.methodset')} />
        <DateField source="created" label={translate('resources.routes.methodset.created')} />
        <TextField source="version" label={translate('resources.routes.methodset.version')} />
        <ArrayField source="methods" sortable={false} label={translate('resources.routes.methodset.methodincluded')}>
          <SingleFieldList linkType={false}>
            <ChipField source="name" size="small" clickable={false} />
          </SingleFieldList>
        </ArrayField>
        <FunctionField
          label={translate('resources.routes.methodset.user')}
          render={(record) => `${record.user ? record.user.email : ''}`}
        />

        <ShowButton />
        {permissions > 0 && <EditButton />}
        {permissions > 1 && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default MethodSetList;
