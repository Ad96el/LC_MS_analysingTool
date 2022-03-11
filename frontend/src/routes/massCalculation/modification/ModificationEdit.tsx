import * as React from 'react';
import {
  Edit, SimpleForm, TextInput, EditProps, required, useTranslate, SelectInput,

} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const ModificationEdit : React.FC<EditProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();

  return (
    <Edit {...props}>
      <SimpleForm toolbar={<ToolBarLight />} redirect="list" variant="outlined">
        <TextInput source="name" label={translate('resources.routes.modification.name')} className={classes.TextInput} validate={required()} />
        <TextInput source="formula_add" label={translate('resources.routes.modification.formula_add')} defaultValue="" className={classes.TextInput} />
        <TextInput source="formula_sub" label={translate('resources.routes.modification.formula_sub')} defaultValue="" className={classes.TextInput} />
        <SelectInput
          validate={required()}
          source="kind"
          className={classes.TextInput}
          choices={[
            { id: 'modification', name: 'Chemical' },
            { id: 'glyco', name: 'Glycosylation' },
          ]}
        />
      </SimpleForm>
    </Edit>
  );
};

export default ModificationEdit;
