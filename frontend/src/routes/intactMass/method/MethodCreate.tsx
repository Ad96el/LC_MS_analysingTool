import * as React from 'react';
import {
  Create, TextInput, CreateProps, required, useTranslate, TabbedForm, FormTab,
  useInput, useDataProvider, useNotify, useRefresh, CreateParams, Record, Loading,
} from 'react-admin';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
// own libs

import { ToolBarLight } from 'components';
import { useHistory } from 'react-router';
import { PeakSelection, Deconvolution, FastaTab } from './Tabs';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },

});

const MethodCreate : React.FC<CreateProps> = (props) => {
  const classes = useStyles();
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const [loading, setLoading] = React.useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const history = useHistory();
  const [type, setType] = React.useState<string>('');

  const handleSave = (record : Partial<Record>) => {
    const data : CreateParams = { data: record };
    setLoading(true);
    dataProvider.create('method', data).then(() => {
      history.goBack();
      refresh();
      notify('Method is created');
      setLoading(false);
    }).catch(() => {
      history.goBack();
      refresh();
      notify('Failed to create', 'warning');
      setLoading(false);
    });
  };

  const SelectType = (p) => {
    const {
      input: { onChange, ...rest },
      meta: { touched, error },
      isRequired,
    } = useInput(p);

    const handleChange = (event) => {
      setType(event.target.value as string);
      onChange(event);
    };

    return (
      <FormControl className={classes.TextInput}>
        <InputLabel id="demo-controlled-open-select-label">
          Type
        </InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          error={!!(touched && error)}
          required={isRequired}
          {...rest}
          onChange={handleChange}
        >
          <MenuItem value="peak">Peak Selection</MenuItem>
          <MenuItem value="decon">Deconvolution</MenuItem>
          <MenuItem value="fasta">Sequence</MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <>
      {loading ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.methodcreate" />
        : (
          <Create {...props}>
            <TabbedForm
              syncWithLocation={false}
              redirect="list"
              save={handleSave}
              variant="outlined"
              toolbar={<ToolBarLight disabled={loading} />}
            >
              <FormTab label={translate('resources.routes.method.meta')}>
                <TextInput source="name" label={translate('resources.routes.method.method')} className={classes.TextInput} validate={required()} />
                <SelectType source="type" validate={required()} label={translate('resources.routes.method.type')} />
              </FormTab>
              { type === 'peak' && (
              <FormTab label={translate('resources.routes.method.peaktab')}>
                <PeakSelection source="method" editable />
              </FormTab>
              )}
              { type === 'decon' && (
              <FormTab label={translate('resources.routes.method.decontab')}>
                <Deconvolution source="method" editable />
              </FormTab>
              )}
              { type === 'fasta' && (
              <FormTab label={translate('resources.routes.method.fasta')}>
                <FastaTab source="method" editable />
              </FormTab>
              )}
            </TabbedForm>
          </Create>
        )}
    </>
  );
};

export default MethodCreate;
