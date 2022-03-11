import * as React from 'react';
import {
  Create, SimpleForm, TextInput, CreateProps, required, useTranslate, useDataProvider,
  PaginationPayload, SortPayload, GetListParams, useInput,
} from 'react-admin';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight } from 'components';
import * as Types from 'types';

const useStyles = makeStyles({
  TextInput: {
    width: '400px',
  },
  fullWidth: {
    width: '100%',
  },
});

const SelectOption = (props) => {
  const {
    input: { onChange },
  } = useInput(props);
  const translate = useTranslate();

  const [selectionDisabled, setSeletionDisabled] = React.useState({ peak: false, decon: false });

  const handleSelected = (values: Types.MethodSet.method[]) => {
    const upd : string [] = values.map((obj) => obj.id);
    const updOption = { peak: false, decon: false, fasta: false };

    values.forEach((value) => {
      if (value.type === 'peak') {
        updOption.peak = true;
      }
      if (value.type === 'decon') {
        updOption.decon = true;
      }
      if (value.type === 'fasta') {
        updOption.fasta = true;
      }
    });
    setSeletionDisabled(updOption);
    onChange(upd);
  };

  const { data } = props;

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      onChange={(_, values) => handleSelected(values)}
      options={data}
      getOptionDisabled={(a) => selectionDisabled[a.type]}
      getOptionLabel={(option : Types.MethodSet.method) => option.name}
      renderInput={(params) => <TextField {...params} label={translate('resources.routes.methodset.possibleMethod')} />}
    />
  );
};

const MethodSetCreate : React.FC<CreateProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();
  const [options, setOptions] = React.useState<Types.MethodSet.method[]>([]);
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    const pagination : PaginationPayload = { page: 1, perPage: 250 };

    const sort : SortPayload = { field: 'name', order: 'ASC' };

    const filter = { };

    const params : GetListParams = {
      pagination, sort, filter,
    };

    dataProvider.getList<Types.MethodSet.method>('method', params).then((response) => setOptions(response.data));
  }, []);

  return (
    <Create {...props}>
      <SimpleForm toolbar={<ToolBarLight />} redirect="list" variant="outlined">
        <TextInput source="name" label={translate('resources.routes.methodset.methodset')} className={classes.TextInput} validate={required()} />
        <SelectOption source="methods" validate={required()} data={options} {...props} />
      </SimpleForm>
    </Create>
  );
};

export default MethodSetCreate;
