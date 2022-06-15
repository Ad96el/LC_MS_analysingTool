import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton, useNotify,
  useTranslate, FunctionField, TextInput, Filter, ReferenceField, CreateParams, ShowButton,
  HttpError, DateInput, ReferenceInput, AutocompleteInput,
} from 'react-admin';
import Play from '@material-ui/icons/PlayArrow';
import { Button, CircularProgress, Tooltip } from '@material-ui/core';
// own libs
import dataProvider from 'dataProvider';

const CreateButton : React.FC<any> = ({ record }) => {
  const { id, blocked } = record;
  const [pressed, setPressed] = React.useState(false);
  const [block, setBlock] = React.useState(false);
  const notify = useNotify();
  const translate = useTranslate();
  React.useEffect(() => {
    if (blocked) {
      setBlock(true);
      setTimeout(() => {
        setBlock(false);
      }, 12000);
    }
  }, []);

  const handleClick = async () => {
    try {
      setPressed(true);
      const param : CreateParams = { data: { sid: id, kind: 'all' } };
      await dataProvider.create('resultset', param);
      notify('Resultsets with all results are created', 'info');
    } catch (e) {
      notify(`Error:${(e as HttpError).message}`, 'warning');
    }
    setPressed(false);
  };

  if (block || pressed) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Tooltip title={translate('resources.routes.sampleset.createresultset')}>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        <Play />
      </Button>
    </Tooltip>
  );
};

const SampleSetList : React.FC<ListProps> = ({ permissions, ...props }) => {
  const translate = useTranslate();
  const ListFilter :React.FC<ListProps> = (p) => (
    <Filter variant="outlined" {...p}>
      <TextInput source="name" alwaysOn label={translate('resources.routes.sampleset.name')} />
      <TextInput source="system_name" label={translate('resources.routes.sampleset.system_name')} />
      <DateInput source="created" label={translate('resources.routes.sampleset.created')} />
      <TextInput source="descr" label={translate('resources.routes.sampleset.descr')} />
      <ReferenceInput
        label={translate('resources.routes.sampleset.project')}
        reference="project"
        source="pid"
        link="show"
      >
        <AutocompleteInput style={{ width: 300 }} optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        label={translate('resources.routes.sampleset.resultset')}
        reference="resultset"
        source="rsid"
        link="show"
      >
        <AutocompleteInput style={{ width: 300 }} optionText="name" />
      </ReferenceInput>
    </Filter>
  );
  return (
    <>
      <List
        filters={<ListFilter />}
        bulkActionButtons={permissions > 1 ? undefined : false}
        {...props}
        exporter={false}
      >
        <Datagrid>
          <TextField source="name" label={translate('resources.routes.sampleset.name')} />
          <TextField source="descr" label={translate('resources.routes.sampleset.descr')} />
          <TextField source="system_name" label={translate('resources.routes.sampleset.system_name')} />
          <DateField source="created" label={translate('resources.routes.sampleset.created')} />
          <ReferenceField
            label={translate('resources.routes.sampleset.project')}
            reference="project"
            source="pid"
            link="show"
          >
            <TextField source="name" />
          </ReferenceField>
          <ReferenceField
            label={translate('resources.routes.sampleset.resultset')}
            reference="resultset"
            source="rsid"
            link="show"
          >
            <TextField source="name" />
          </ReferenceField>
          <FunctionField
            label={translate('resources.routes.sampleset.user')}
            render={(record) => `${record.user ? record.user.email : ''}`}
          />

          <ShowButton />
          {permissions > 0 && <EditButton />}
          {permissions > 1 && <DeleteButton undoable={false} />}
          {permissions > 0 && <CreateButton />}

        </Datagrid>
      </List>
    </>
  );
};

export default SampleSetList;
