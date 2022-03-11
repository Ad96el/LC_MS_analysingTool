import * as React from 'react';
import {
  Edit, TextInput, EditProps, required, DateInput, ReferenceInput, useTranslate,
  SelectInput, FunctionField, TabbedForm, FormTab, useDataProvider, UpdateParams,
  useRefresh, useNotify, Record, Identifier,
} from 'react-admin';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';
import { useHistory } from 'react-router';
import Table from './table';

const useStyles = makeStyles((theme: Theme) => createStyles({
  buttons: {
    margin: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  TextInput: {
    width: '400px',
  },

}));

const SampleSetEdit : React.FC<EditProps> = ({ ...props }) => {
  const translate = useTranslate();
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [submit, setSubmit] = React.useState(false);
  const dataProvider = useDataProvider();
  const history = useHistory();
  const refresh = useRefresh();
  const notify = useNotify();

  const handleSave = (data: Partial<Record>) => {
    if (data) {
      setLoading(true);
      setSubmit(true);
      const param : UpdateParams = {
        id: data.id as Identifier,
        data,
        previousData: data as Record,
      };
      dataProvider.update('sampleset', param).then(() => {
        history.push('/sampleset');
        refresh();
        notify('SampleSet is updated is updated');
        setLoading(false);
      }).catch(() => {
        history.push('/sample');
        refresh();
        notify('Fail to update', 'warning');
        setLoading(false);
      });
    }
  };

  return (
    <>
      <Edit
        {...props}
      >
        <TabbedForm
          save={handleSave}
          redirect="list"
          variant="outlined"
          syncWithLocation={false}
          toolbar={<ToolBarLight disabled={loading} />}
        >
          <FormTab label={translate('resources.routes.sampleset.meta')}>
            <FunctionField
              label={translate('resources.routes.sampleset.user')}
              render={(record) => `${record.user ? record.user.email : ''} `}
            />
            <DateInput className={classes.TextInput} source="created" label={translate('resources.routes.sampleset.created')} disabled />
            <ReferenceInput className={classes.TextInput} label={translate('resources.routes.sampleset.project')} reference="project" source="pid" link="show" variant="standard">
              <SelectInput source="name" validate={required()} disabled={loading} />
            </ReferenceInput>

            <TextInput className={classes.TextInput} source="name" label={translate('resources.routes.sampleset.name')} disabled={loading} validate={required()} />
            <TextInput className={classes.TextInput} source="system_name" label={translate('resources.routes.sampleset.system_name')} disabled={loading} validate={required()} />
            <TextInput source="descr" label={translate('resources.routes.sampleset.descr')} fullWidth validate={required()} disabled={loading} />
          </FormTab>
          <FormTab label="Samples">
            <Table props={props} editable submit={submit} loading={loading} />
          </FormTab>

        </TabbedForm>

      </Edit>

    </>
  );
};

export default SampleSetEdit;
