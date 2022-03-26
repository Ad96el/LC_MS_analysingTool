import * as React from 'react';
import {
  List, Datagrid, TextField, ListProps, DeleteButton, DateInput, DateField, AutocompleteInput,
  useTranslate, FunctionField, TextInput, Filter, ReferenceField, ShowButton, ReferenceInput,
  HttpError, useNotify,
} from 'react-admin';
import { Button } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';

import dataProvider from 'dataProvider';

const CreateButton : React.FC<any> = ({ record }) => {
  const { id } = record;
  const notify = useNotify();

  const handleClick = async () => {
    try {
      await dataProvider.createPdf(id);
    } catch (e) {
      notify(`Error:${(e as HttpError).message}`, 'warning');
    }
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        <PictureAsPdfIcon />
      </Button>
    </div>
  );
};

const ResultList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter : React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput label="name" source="name" alwaysOn />
      <DateInput source="created" label={translate('resources.routes.result.created')} />
      <ReferenceInput label={translate('resources.routes.result.sample')} reference="sample" source="sid">
        <AutocompleteInput style={{ width: 300 }} optionText="name" />
      </ReferenceInput>
      <ReferenceInput label={translate('resources.routes.result.methodset')} reference="methodset" source="msid">
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
        <TextField source="name" label={translate('resources.routes.result.name')} />
        <DateField source="created" label={translate('resources.routes.result.created')} />
        <FunctionField
          label={translate('resources.routes.result.user')}
          render={(record) => `${record.user ? record.user.email : ''}`}
        />
        <TextField source="version" label={translate('resources.routes.result.version')} />
        <ReferenceField label={translate('resources.routes.result.sample')} reference="sample" source="sid" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField sortable={false} label={translate('resources.routes.result.resultset')} reference="resultset" source="rsid" link="show">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label={translate('resources.routes.sample.methodset')}
          render={(record) => (record.methodset ? (
            <Link underline="none" href={`/#/methodset/${record.methodset.id}/show`}>
              {record.methodset.name}
            </Link>
          ) : 'None')}
        />

        <ShowButton />
        {permissions > 1 && <DeleteButton undoable={false} />}
        {permissions > 1 && <CreateButton />}
      </Datagrid>
    </List>
  );
};

export default ResultList;
