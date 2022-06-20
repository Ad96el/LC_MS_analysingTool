import * as React from 'react';
import {
  Create, SimpleForm, CreateProps, required, SelectInput, ReferenceInput, useTranslate,
  useDataProvider, useRefresh, useNotify, CreateParams, Loading,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router';
// own libs
import { ToolBarLight, Upload } from 'components';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const SampleCreate : React.FC<CreateProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = React.useState(false);
  const [defaultValue, setDefaultValue] = React.useState<string>('');
  const history = useHistory();
  const refresh = useRefresh();
  const notify = useNotify();

  const [files, setFiles] = React.useState<File[]>([]);

  React.useEffect(() => {
    const urlItems = window.location.href.split('/');
    const id = urlItems[urlItems.length - 1];
    if (id !== 'create') {
      setDefaultValue(id);
    }
  }, []);

  const handleSave = (record) => {
    if (files.length === 0) {
      notify(`Error:${' No sample files are provided'}`, 'warning');
      return;
    }
    const createRecord = { ...record };
    createRecord.files = files;
    const data : CreateParams = { data: createRecord };
    setLoading(true);
    dataProvider.create('sample', data).then(() => {
      window.location.href = `${window.location.origin}/#/sampleset/${record.sid}`;
      notify('sample is created');
      setLoading(false);
    }).catch(() => {
      history.goBack();
      refresh();
      setLoading(false);
      notify(`Error:${' The provided files have the wrong format. Could not extract any information'}`, 'warning');
    });
  };

  const onFileInputChange = (f : File[]) => {
    setFiles(f);
  };

  return (
    <>
      {loading ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.samplecreate" />
        : (
          <Create {...props}>
            <SimpleForm toolbar={<ToolBarLight disabled={loading} />} save={handleSave}>
              <ReferenceInput
                label="SampleSet"
                source="sid"
                reference="sampleset"
                validate={[required()]}
                className={classes.TextInput}
                variant="outlined"
                defaultValue={defaultValue}
              >
                <SelectInput optionText="name" label={translate('resources.routes.sample.name')} />
              </ReferenceInput>
              <Upload onFileInputChange={onFileInputChange} />
            </SimpleForm>
          </Create>
        ) }
    </>
  );
};

export default SampleCreate;
