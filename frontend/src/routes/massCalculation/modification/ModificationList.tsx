import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton,
  useTranslate, TextInput, Filter, DateInput, FunctionField, SelectInput,
} from 'react-admin';

// list component

const ModificationList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput source="name" label={translate('resources.routes.modification.name')} />
      <DateInput source="created" label={translate('resources.routes.modification.created')} />
      <TextInput source="formula_add" label={translate('resources.routes.modification.formula_add')} />
      <TextInput source="formula_sub" label={translate('resources.routes.modification.formula_sub')} />
      <SelectInput
        source="kind"
        choices={[
          { id: 'modification', name: 'Chemical' },
          { id: 'glyco', name: 'Glycosylation' },
        ]}
      />
    </Filter>
  );

  const naming = { modification: 'Chemical', glyco: 'Glycosylation' };
  return (
    <List
      filters={<ListFilter />}
      bulkActionButtons={permissions > 1 ? undefined : false}
      {...props}
      exporter={false}
    >
      <Datagrid>
        <TextField source="name" label={translate('resources.routes.modification.name')} />
        <DateField source="created" label={translate('resources.routes.modification.created')} />
        <TextField source="formula_add" label={translate('resources.routes.modification.formula_add')} />
        <TextField source="formula_sub" label={translate('resources.routes.modification.formula_sub')} />
        <FunctionField
          label={translate('resources.routes.modification.kind')}
          sortBy="kind"
          source="kind"
          render={(record) => `${naming[record.kind]}`}
        />
        <TextField source="mass" label={translate('resources.routes.modification.mass')} />
        { permissions > 1
        && <EditButton />}
        { permissions > 1
        && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  );
};

export default ModificationList;
