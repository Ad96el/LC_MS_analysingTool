import * as React from 'react';
import {
  Create, SimpleForm, TextInput, CreateProps, required, SelectInput, ReferenceInput, useTranslate,

} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const SampleSetCreate : React.FC<CreateProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();

  return (
    <Create {...props}>
      <SimpleForm toolbar={<ToolBarLight />} redirect="list" variant="outlined">
        <TextInput source="name" label={translate('name')} className={classes.TextInput} validate={required()} />
        <TextInput source="system_name" label={translate('system_name')} className={classes.TextInput} validate={required()} />
        <ReferenceInput label="Project" source="pid" reference="project" validate={[required()]} className={classes.TextInput} variant="standard">
          <SelectInput optionText="name" label={translate('name')} />
        </ReferenceInput>
        <TextInput source="descr" fullWidth multiline label={translate('descr')} validate={required()} />

      </SimpleForm>
    </Create>
  );
};

export default SampleSetCreate;
