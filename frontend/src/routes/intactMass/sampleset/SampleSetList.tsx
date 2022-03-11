import * as React from 'react';
import {
  List, Datagrid, TextField, DateField, ListProps, EditButton, DeleteButton, useNotify,
  useTranslate, FunctionField, TextInput, Filter, ReferenceField, CreateParams, ShowButton,
  HttpError, DateInput, ReferenceInput, AutocompleteInput, Loading,
} from 'react-admin';
import Play from '@material-ui/icons/PlayArrow';
import { Button, Tooltip } from '@material-ui/core';
import { Prompt } from 'react-router';
// own libs
import dataProvider from 'dataProvider';

const CreateButton : React.FC<any> = ({ record, setLoading }) => {
  const { id } = record;
  const notify = useNotify();
  const translate = useTranslate();

  const handleClick = async () => {
    setLoading(true);
    try {
      const param : CreateParams = { data: { sid: id, kind: 'all' } };
      await dataProvider.create('resultset', param);
      notify('Resultsets with all results are created', 'info');
    } catch (e) {
      notify(`Error:${(e as HttpError).message}`, 'warning');
    }
    setLoading(false);
  };

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
  const [open, setOpen] = React.useState(false);
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
      {open ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.sampleset" /> : (
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
            {permissions > 0 && <CreateButton setLoading={setOpen} />}

          </Datagrid>
        </List>
      ) }

      <Prompt
        when={open}
        message="Please wait! Your operation is not finished yet."
      />

    </>
  );
};

export default SampleSetList;
