import * as React from 'react';
import {
  Show, TextField, DateField, ShowProps, useTranslate,
  FunctionField, ReferenceField, TabbedForm, FormTab,
} from 'react-admin';

// own libs
import Table from './table';

const Title = (record) => {
  const translate = useTranslate();
  const { name } = record;

  return (
    <span>
      {record ? `${translate('resources.routes.sampleset.project')}: ${name}` : ''}
    </span>
  );
};

const SampleSetShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();

  return (
    <>
      <Show title={<Title />} {...props}>
        <>
          <TabbedForm
            syncWithLocation={false}
            toolbar={<div />}
          >

            <FormTab label={translate('resources.routes.sampleset.meta')}>
              <FunctionField
                label={translate('resources.routes.sampleset.user')}
                render={(record) => `${record.user ? record.user.email : ''} `}
              />
              <DateField source="created" label={translate('resources.routes.sampleset.created')} fullWidth />
              <TextField source="name" label={translate('resources.routes.sampleset.name')} />
              <TextField source="system_name" label={translate('resources.routes.sampleset.system_name')} />
              <TextField source="descr" label={translate('resources.routes.sampleset.descr')} fullWidth />

              <ReferenceField label={translate('resources.routes.sampleset.project')} reference="project" source="pid" link="show">
                <TextField source="name" />
              </ReferenceField>

            </FormTab>
            <FormTab label={translate('resources.routes.sampleset.sample')}>
              <Table props={props} editable={false} loading={false} />
            </FormTab>

          </TabbedForm>

        </>
      </Show>

    </>
  );
};

export default SampleSetShow;
