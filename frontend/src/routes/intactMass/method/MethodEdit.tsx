import * as React from 'react';
import {
  Edit, TextInput, EditProps, required, useTranslate, FunctionField, useNotify, Loading,
  TabbedForm, FormTab, DateField, useDataProvider, Record, UpdateParams, useRefresh,
} from 'react-admin';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
// own libs
import {
  VersionBar, ToolBarLight,
} from 'components';
import { useHistory } from 'react-router';
import { PeakSelection, Deconvolution, FastaTab } from './Tabs';

const useStyles = makeStyles((theme: Theme) => createStyles({
  TextInput: {
    width: '400px',
  },
  buttons: {
    margin: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },

}));

const WithProps = ({ children, ...props }) => children(props);

const MethodEdit : React.FC<EditProps> = (props) => {
  const translate = useTranslate();
  const [loading, setLoading] = React.useState(false);
  const dataProvider = useDataProvider();
  const history = useHistory();
  const refresh = useRefresh();
  const notify = useNotify();

  const handleSave = (record : Partial<Record>) => {
    const data = record as Record;
    setLoading(true);
    const update : UpdateParams<Record> = { id: data.id, data, previousData: data };
    dataProvider.update('method', update).then(() => {
      history.goBack();
      refresh();
      notify('Method is updated');
      setLoading(false);
    }).catch(() => {
      history.goBack();
      refresh();
      setLoading(false);
      notify('Fail to update', 'warning');
    });
  };
  const classes = useStyles();
  const naming = { decon: 'Deconvolution', peak: 'Peak Selection', fasta: 'Sequence' };
  return (
    <>
      {loading ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.methodedit" />
        : (
          <Edit {...props} aside={<VersionBar kind="edit" {...props} />}>
            <WithProps>
              {({ record }) => (

                <TabbedForm
                  variant="outlined"
                  record={record}
                  syncWithLocation={false}
                  redirect="list"
                  save={handleSave}
                  toolbar={<ToolBarLight disabled={loading} />}
                >
                  <FormTab label={translate('resources.routes.method.meta')}>
                    <FunctionField
                      label={translate('resources.routes.method.user')}
                      render={(r) => `${r.user ? r.user.email : ''} `}
                    />
                    <FunctionField
                      label={translate('resources.routes.method.type')}
                      render={(r) => `${r.type ? naming[r.type] : ''} `}
                    />
                    <DateField source="created" label={translate('resources.routes.method.created')} className={classes.TextInput} />
                    <TextInput source="version" label={translate('resources.routes.method.version')} className={classes.TextInput} disabled />
                    <TextInput source="name" label={translate('resources.routes.method.method')} className={classes.TextInput} validate={required()} />

                  </FormTab>
                  {record.type === 'peak' && (
                  <FormTab label={translate('resources.routes.method.peaktab')}>
                    <PeakSelection source="method" edit editable />
                  </FormTab>
                  )}
                  {record.type === 'decon' && (
                  <FormTab label={translate('resources.routes.method.decon')}>
                    <Deconvolution source="method" edit editable />
                  </FormTab>
                  )}
                  {record.type === 'fasta' && (
                  <FormTab label={translate('resources.routes.method.fasta')}>
                    <FastaTab source="method" edit editable />
                  </FormTab>
                  )}

                </TabbedForm>
              )}
            </WithProps>
          </Edit>
        ) }
    </>
  );
};

export default MethodEdit;
