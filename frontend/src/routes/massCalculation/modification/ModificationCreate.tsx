import * as React from 'react';
import {
  Create, SimpleForm, TextInput, CreateProps, required, useTranslate, SelectInput,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const ModificationCreate : React.FC<CreateProps > = ({ ...props }) => {
  const classes = useStyles();
  const translate = useTranslate();

  return (
    <Create {...props}>
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
    </Create>
  );
};

export default ModificationCreate;
