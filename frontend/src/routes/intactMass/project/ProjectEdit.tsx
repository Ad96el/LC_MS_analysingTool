import * as React from 'react';
import {
  Edit, SimpleForm, TextInput, EditProps, required, useTranslate,

} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const ProjectEdit : React.FC<EditProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();

  return (
    <Edit {...props}>
      <SimpleForm toolbar={<ToolBarLight />} redirect="list" variant="outlined">
        <TextInput source="name" label={translate('resources.routes.project.project')} className={classes.TextInput} validate={required()} />
        <TextInput source="sop" label={translate('resources.routes.project.sop')} className={classes.TextInput} validate={required()} />
        <TextInput source="desc" label={translate('resources.routes.project.desc')} fullWidth multiline />

      </SimpleForm>
    </Edit>
  );
};

export default ProjectEdit;
