import * as React from 'react';
import {
  Show, SimpleShowLayout, TextField, DateField, ShowProps, useTranslate,
  FunctionField,
} from 'react-admin';
// own libs

const ProjectShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();
  return (
    <>
      <Show {...props}>
        <SimpleShowLayout>
          <FunctionField
            label={translate('resources.routes.project.user')}
            render={(record) => `${record.user ? record.user.email : ''} `}
          />
          <TextField source="sop" label={translate('resources.routes.project.sop')} />
          <DateField source="created" label={translate('resources.routes.project.created')} />
          <TextField source="desc" label={translate('resources.routes.project.desc')} />
        </SimpleShowLayout>
      </Show>

    </>
  );
};

export default ProjectShow;
