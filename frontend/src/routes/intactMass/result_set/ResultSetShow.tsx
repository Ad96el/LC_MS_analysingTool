import { VersionBar } from 'components';
import * as React from 'react';
import {
  Show, SimpleShowLayout, TextField, ShowProps, useTranslate,
  FunctionField, ReferenceField, DateField,
} from 'react-admin';

const ResultSetShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();

  return (
    <>
      <Show {...props} aside={<VersionBar kind="show" {...props} />}>
        <SimpleShowLayout>
          <FunctionField
            label={translate('resources.routes.resultset.user')}
            render={(record) => `${record.user ? record.user.email : ''}`}
          />
          <TextField source="name" label={translate('resources.routes.resultset.name')} />
          <DateField source="created" label={translate('resources.routes.resultset.created')} />
          <TextField source="version" label={translate('resources.routes.resultset.version')} />
          <ReferenceField label={translate('resources.routes.resultset.sampleset')} reference="sampleset" source="sid" link="show">
            <TextField source="name" />
          </ReferenceField>
        </SimpleShowLayout>
      </Show>

    </>
  );
};

export default ResultSetShow;
