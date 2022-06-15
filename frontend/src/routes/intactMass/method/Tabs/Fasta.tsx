import * as React from 'react';
import {
  useTranslate, useInput,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography, Button, MenuItem, TextField,
} from '@material-ui/core';
import {
  DataGrid, GridColDef,
} from '@material-ui/data-grid';
// own libs
import { massColoums, GridToolbar } from 'components';
import * as Types from 'types';
import { MassCalculation } from 'routes/massCalculation/calculator';
import { useSelector, useDispatch } from 'react-redux';
import { changeRowsPreview, applyPreview as dispatchPreview } from 'reducer/actions';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tables: {
    width: '48%',
    height: 550,
    margin: '1em',
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
  },
  textfields: {
    '& .MuiTextField-root': {
      margin: '1em',
      width: '20%',
    },
  },
  select: {
    margin: '1em',
    widht: '30%',
  },
  apply: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  button: {
    float: 'right',
  },
});

const columns: GridColDef[] = massColoums;

const FastaTab : React.FC<any> = (props) => {
  const [rows, setRows] = React.useState<Types.RowI[]>([]);
  const [kind, setKind] = React.useState<string>('N');
  const previewData = useSelector((s : Types.AppState) => s.data.massDeconPreview);
  const applyPreviewPing = useSelector((s : Types.AppState) => s.data.applyPreview);
  const preview = previewData ? previewData[kind] : [];

  // hooks
  const translate = useTranslate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    input: { onChange },
    isRequired,
  } = useInput(props);
  const { editable } = props;

  // mount
  React.useEffect(() => {
    const { edit } = props;
    if (!edit) {
      onChange({ components: rows, calculations: kind });
    } else {
      const { components, calculations } = props.record;
      setRows(JSON.parse(components));
      setKind(JSON.parse(calculations));
      onChange({ components: JSON.parse(components), calculations: JSON.parse(calculations) });
    }
  }, []);

  const handleChangeKind = (event) => {
    const { value } = event.target;
    onChange({ components: [], calculations: value });
    setKind(value);
    setRows([]);
    dispatch(changeRowsPreview(undefined));
    dispatch(dispatchPreview(!applyPreviewPing));
  };

  const applyPreview = () => {
    const updMass = rows.concat(preview);
    setRows(updMass);
    onChange({ components: updMass, calculations: kind });
    dispatch(changeRowsPreview(undefined));
    dispatch(dispatchPreview(!applyPreviewPing));
  };

  const VerticalSpacer = () => <span style={{ height: '1em' }} />;
  return (
    <div style={{ }}>

      <div style={{ display: 'flex' }}>
        {editable && (
        <TextField
          select
          value={kind}
          style={{
            marginBottom: '2em', width: 300, marginRight: 'auto', marginLeft: '2em',
          }}
          disabled={!editable}
          required={isRequired}
          id="standard-select-currency"
          onChange={handleChangeKind}
          label={translate('resources.routes.method.kind')}
        >
          <MenuItem key="N" value="N">N </MenuItem>
          <MenuItem key="D" value="D">D </MenuItem>
          <MenuItem key="R" value="R">R </MenuItem>
          <MenuItem key="DR" value="DR">DR </MenuItem>
        </TextField>
        )}

      </div>

      <VerticalSpacer />
      { editable && <MassCalculation light />}

      <div className={classes.apply}>
        <div className={classes.tables} style={editable ? { width: '48%' } : { width: '100%' }}>
          <Typography style={{ marginLeft: '1em' }}>

            {translate('resources.routes.method.mass')}
          </Typography>
          {editable && (
          <Button
            variant="contained"
            color={rows.length > 0 ? 'secondary' : 'primary'}
            disabled={rows.length === 0}
            style={{
              position: 'absolute', right: 0, top: -20, margin: '1em',
            }}
            onClick={() => { setRows([]); }}
          >
            {translate('util.clear')}
          </Button>
          ) }
          <DataGrid
            disableSelectionOnClick
            rows={rows}
            pageSize={10}
            style={{ margin: '1em' }}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
        {editable && (
        <div className={classes.tables}>
          <Typography style={{ marginLeft: '1em' }}>
            {translate('resources.routes.method.masspreview')}
          </Typography>
          <Button
            variant="contained"
            color={preview.length > 0 ? 'secondary' : 'primary'}
            disabled={preview.length === 0}
            style={{
              position: 'absolute', right: 0, top: -20, margin: '1em',
            }}
            onClick={applyPreview}
          >
            {translate('util.apply')}
          </Button>
          <div className={classes.apply} />

          <DataGrid
            rows={preview}
            pageSize={10}
            columns={columns}
            style={{ margin: '1em' }}
            components={{
              Toolbar: GridToolbar,
            }}

          />
        </div>

        ) }
      </div>

    </div>
  );
};

export default FastaTab;
