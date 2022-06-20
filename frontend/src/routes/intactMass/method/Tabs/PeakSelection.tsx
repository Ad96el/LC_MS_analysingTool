import * as React from 'react';
import {
  useTranslate, useInput,
} from 'react-admin';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {
  DataGrid, GridColDef, GridCellParams,
} from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography, Accordion, AccordionSummary, AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RemoveIcon from '@material-ui/icons/Remove';
// own libs
import { MethodSet } from 'types';
import { CalculationForm, TypeSelect } from 'components';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  graph: {
    width: '94%',
    height: 450,
    margin: '1em',
    display: 'flex',
    position: 'relative',
  },
  fab: {
    right: 40,
    bottom: 10,
    position: 'absolute',
  },
  textfields: {
    '& .MuiTextField-root': {
      margin: '1em',
      width: '30%',
    },
  },
  select: {
    margin: '1em',
    widht: '30%',
  },
});

let count = 0;

// editable table
const SampleTable : React.FC<any> = (props) => {
  // states
  const [rows, setRows] = React.useState<MethodSet.ComponentI[]>([]);
  const [state, setState] = React.useState({
    pickingHeight: 0.75,
    absThreshold: 2,
    relThreshold: 0,
    snThreshold: 0,
    baselineWindow: 0.1,
    baselineOffset: 0,
    smoothMethod: 'GA',
    smoothWindow: 2,
    smoothCycles: 1,
  });

  // hooks
  const translate = useTranslate();
  const classes = useStyles();
  const {
    input: { onChange },
  } = useInput(props);
  const { editable } = props;

  // mount
  React.useEffect(() => {
    const { edit } = props;
    if (!edit) {
      onChange({ components: rows, calculations: state });
    } else {
      const { calculations, components } = props.record;
      setState(JSON.parse(calculations));
      setRows(JSON.parse(components));
      count = JSON.parse(components).length;
      onChange({ components: JSON.parse(components), calculations: JSON.parse(calculations) });
    }
  }, []);

  const addRow = () => {
    const upd = [...rows];
    upd.push({
      id: count, name: 'component', rt: 0, window: 1, type: 'closest',
    });
    setRows(upd);
    onChange({ components: upd, calculations: state });
    count += 1;
  };

  const remove = (id: number) => {
    const upd = [...rows];
    const index = upd.findIndex((value) => value.id === id);
    upd.splice(index, 1);
    setRows(upd);
  };

  const handleChangeType = (event, row) => {
    event.stopPropagation();
    const upd = [...rows];
    const { value } = event.target;
    const index = rows.findIndex((obj) => obj.id === row.id);
    upd[index].type = value;
    onChange({ components: upd, calculations: state });
    setRows(upd);
  };

  const handleChangeCalculation = (event, type : string) => {
    event.stopPropagation();
    if (event.target.value < 0) {
      return;
    }
    const upd = { ...state };
    const value = type === 'smoothMethod' ? event.target.value : +event.target.value;
    upd[type] = value;
    setState(upd);
    onChange({ components: rows, calculations: upd });
  };

  const applyChanges = (row) => {
    const { field, value, id } = row;
    const upd = [...rows];

    const index = upd.findIndex((obj) => obj.id === id);
    upd[index][field] = field === 'rt' || field === 'window' ? +value : value;
    setRows(upd);
    onChange({ components: upd, calculations: state });
  };

  // ui

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: translate('resources.routes.method.componentname'),
      flex: 400,
      editable,
    },
    {
      field: 'rt',
      headerName: translate('resources.routes.method.RT'),
      flex: 400,
      type: 'number',
      editable,
    },
    {
      field: 'window',
      headerName: translate('resources.routes.method.window'),
      flex: 500,
      type: 'number',
      editable,
    },
    {
      field: 'type',
      headerName: translate('resources.routes.method.type'),
      flex: 500,
      renderCell: (params: GridCellParams) => {
        const { value, row } = params;
        return (
          <TypeSelect
            handleSelect={handleChangeType}
            value={value as string}
            row={row}
            editable={editable}
          />
        );
      },
    },
    {
      field: 'action',
      headerName: ' ',
      flex: 500,
      renderCell: (params: GridCellParams) => {
        const { row } = params;
        return (
          <Fab
            size="small"
            color="secondary"
            aria-label="remove"
            onClick={() => remove(row.id)}
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          >
            <RemoveIcon />
          </Fab>
        );
      },
    },

  ];

  return (
    <div className={classes.root}>
      <Typography variant="h5">
        {translate('resources.routes.method.calcprops')}
      </Typography>

      <CalculationForm
        state={state}
        handleChange={handleChangeCalculation}
        editable={editable}
        classes={classes}
      />
      <Accordion style={{ marginBottom: '1em' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>
            {translate('resources.routes.method.comp')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>

          <div className={classes.graph}>
            <DataGrid
              disableSelectionOnClick
              style={{ margin: '1em' }}
              onCellEditCommit={applyChanges}
              rows={rows}
              columns={columns}
              hideFooter
            />
            <div className={classes.fab}>
              {editable && (
              <Fab size="small" color="primary" aria-label="add" onClick={addRow}>
                <AddIcon />
              </Fab>
              ) }
            </div>
          </div>
        </AccordionDetails>

      </Accordion>

    </div>
  );
};

export default SampleTable;
