import * as React from 'react';
import {
  Edit, SimpleForm, TextInput, EditProps, required, DateInput, useTranslate, useInput,
  FunctionField, useDataProvider, PaginationPayload, SortPayload, GetListParams,
} from 'react-admin';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
// own libs
import { VersionBar, ToolBarLight } from 'components';
import * as Types from 'types';

const useStyles = makeStyles((theme: Theme) => createStyles({
  select: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  root: {
    marginTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  buttons: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignContent: 'scretch',

  },
  TextInput: {
    width: '400px',
  },
  fullWidth: {
    widht: '100%',
  },
  size: {
    width: '50px',
    height: '20px',
  },
}));

const SelectOption = (props) => {
  const {
    input: { onChange },
  } = useInput(props);
  const [selected, setSelected] = React.useState<Types.MethodSet.method[]>([]);
  const [selectionDisabled, setSeletionDisabled] = React.useState({
    peak: false,
    decon: false,
    fasta: false,
  });
  const translate = useTranslate();

  const { data } = props;

  // updates the changes.
  const handleChange = (values: Types.MethodSet.method[]) => {
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
    onChange(upd);
    setSelected(values);
    setSeletionDisabled(updOption);
  };

  // init the selected methods
  React.useEffect(() => {
    const { record } = props;
    const { methods } = record;
    handleChange(methods);
  }, [data]);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      value={selected}
      getOptionDisabled={(a) => selectionDisabled[a.type]}
      onChange={(_, values) => handleChange(values)}
      options={data.sort((a, b) => b.type.localeCompare(a.type))}
      groupBy={(option) => option.type}
      getOptionSelected={(a, b) => a.id === b.id}
      getOptionLabel={(option : Types.MethodSet.method) => option.name}
      renderInput={(params) => <TextField {...params} label={translate('resources.routes.methodset.possibleMethod')} />}
    />
  );
};

const MethodSetEdit : React.FC<EditProps> = ({ ...props }) => {
  const translate = useTranslate();
  const classes = useStyles();
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
    <>
      <Edit {...props} aside={<VersionBar kind="edit" {...props} />}>
        <SimpleForm redirect="list" toolbar={<ToolBarLight />} variant="outlined">
          <FunctionField
            label={translate('resources.routes.methodset.user')}
            render={(record) => `${record?.user ? record.user.email : ''} `}
          />
          <DateInput className={classes.TextInput} source="created" label={translate('resources.routes.methodset.created')} disabled />
          <TextInput className={classes.TextInput} source="name" label={translate('resources.routes.methodset.methodset')} validate={required()} />
          <TextInput className={classes.TextInput} source="version" label={translate('resources.routes.methodset.version')} disabled />

          <SelectOption source="methods" data={options} />
        </SimpleForm>
      </Edit>

    </>
  );
};

export default MethodSetEdit;
