import * as React from 'react';
import {
  Show, SimpleShowLayout, TextField, ShowProps, useTranslate,
  FunctionField, ReferenceField, DateField,
} from 'react-admin';
import Link from '@material-ui/core/Link';
import { ColorField } from 'react-admin-color-input';

const SampleShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();

  return (
    <>
      <Show {...props}>
        <SimpleShowLayout>
          <FunctionField
            label={translate('resources.routes.sample.user')}
            render={(record) => `${record.user ? record.user.email : ''}`}
          />
          <TextField source="name" label={translate('resources.routes.sample.sample')} />
          <TextField source="type" label={translate('resources.routes.sample.type')} />
          <DateField source="created" label={translate('resources.routes.sample.created')} />
          <FunctionField
            label={translate('resources.routes.sample.result')}
            render={(record) => (
              record.result ? (
                <Link underline="none" href={`/#/result/${record.result.id}/show`}>
                  {record.result.name}
                </Link>
              ) : 'None'
            )}
          />
          <ReferenceField label={translate('resources.routes.sample.sampleset')} reference="sampleset" source="sid" link="show">
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
          <ColorField source="color" label={translate('resources.routes.sample.color')} />
        </SimpleShowLayout>
      </Show>

    </>
  );
};

export default SampleShow;
