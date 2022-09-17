import * as React from 'react';
import {
  Create, SimpleForm, TextInput, CreateProps, required, useTranslate, useDataProvider,
  PaginationPayload, SortPayload, GetListParams, useInput,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { ToolBarLight, TransferList, selectedI } from 'components';
import * as Types from 'types';

const useStyles = makeStyles({
  TextInput: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
});

const TransferListWrapper = (props) => {
  const {
    input: { onChange },
  } = useInput(props);
  const translate = useTranslate();

  const [selectedGlyco, setSelectedGlyco] = React.useState<selectedI[]>([]);
  const [selectedModification, setSelectedModification] = React.useState<selectedI[]>([]);
  const { data } = props;

  // updates the changes.
  const handleChangeGlyco = (values : selectedI[]) => {
    const updGlycoId : string [] = values.map((obj) => obj.id);
    const modId = selectedModification.map((obj) => obj.id);
    onChange(updGlycoId.concat(modId));
    setSelectedGlyco(values);
  };

  const handleChangeMod = (values : selectedI[]) => {
    const updModId : string [] = values.map((obj) => obj.id);
    const glycoId = selectedGlyco.map((obj) => obj.id);
    onChange(updModId.concat(glycoId));
    setSelectedModification(values);
  };

  const availableOptionsGlyco = data.filter(
    (item) => !selectedGlyco.map((obj) => obj.id).includes(item.id) && item.kind === 'glyco',
  );

  const availableOptionsMod = data.filter(
    (item) => (!selectedModification.map((obj) => obj.id).includes(item.id)) && item.kind === 'modification',
  );

  return (
    <>
      <div style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: '1em',
      }}
      >
        <div style={{ marginRight: '1em' }}>
          <TransferList
            options={availableOptionsMod}
            selected={selectedModification}
            handleChanage={handleChangeMod}
            leftTitle={translate('resources.routes.modificationset.selectedMod')}
            rightTitle={translate('resources.routes.modificationset.avalMod')}
          />
        </div>
        <div>
          <TransferList
            options={availableOptionsGlyco}
            selected={selectedGlyco}
            handleChanage={handleChangeGlyco}
            leftTitle={translate('resources.routes.modificationset.selectedGlyco')}
            rightTitle={translate('resources.routes.modificationset.avalGlyco')}
          />
        </div>
      </div>

    </>

  );
};

const ModificationSetCreate : React.FC<CreateProps> = (props) => {
  const classes = useStyles();
  const translate = useTranslate();
  const [options, setOptions] = React.useState<Types.modification[]>([]);
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    const pagination : PaginationPayload = { page: 1, perPage: 250 };

    const sort : SortPayload = { field: 'name', order: 'ASC' };

    const filter = { };

    const params : GetListParams = {
      pagination, sort, filter,
    };

    dataProvider.getList<Types.modification>('modification', params).then((response) => setOptions(response.data));
  }, []);

  return (
    <Create {...props}>
      <SimpleForm toolbar={<ToolBarLight />} redirect="list" variant="outlined">
        <TextInput source="name" label={translate('resources.routes.modificationset.name')} fullWidth className={classes.TextInput} validate={required()} />
        <TransferListWrapper source="modifications" data={options} {...props} />
      </SimpleForm>
    </Create>
  );
};

export default ModificationSetCreate;
