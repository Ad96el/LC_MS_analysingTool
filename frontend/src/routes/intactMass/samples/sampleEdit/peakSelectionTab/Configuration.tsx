import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import {
  Box, Button, TextField, Typography,
} from '@material-ui/core';
import {
  useDataProvider, useNotify, useTranslate, UpdateParams,
} from 'ra-core';
import {
  DataGrid, GridColDef, GridCellParams,
} from '@material-ui/data-grid';
// import Fab from '@material-ui/core/Fab';
// import AddIcon from '@material-ui/icons/Add';
// own libs
import { CalculationForm, TypeSelect } from 'components';
import * as Types from 'types';
import { useDispatch, useSelector } from 'react-redux';
import { reloadPeak } from 'reducer/actions';

interface ConfigurationI {
    open: boolean
    setOpen: (bol: boolean) => void
    methodRaw: Types.MethodSet.method
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  margin: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  textfields: {
    '& .MuiTextField-root': {
      margin: '0.5em',
      width: '29%',
    },
  },
  select: {
    margin: '1em',
    widht: '30%',
  },

  grid: {
    width: window.innerWidth * 0.35,
    height: 400,
    margin: '1em',
    display: 'flex',
    position: 'relative',
  },
  fab: {
    right: 10,
    bottom: 10,
    position: 'absolute',
  },
  root: {
    height: 460,
  },
}));

const SideView : React.FC<ConfigurationI> = ({ open, setOpen, methodRaw }) => {
  // hooks
  const classes = useStyles();
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const notify = useNotify();
  const dispatch = useDispatch();
  const reload = useSelector((state : Types.AppState) => state.data.reloadPeaks);

  // states
  const [method, setMethod] = React.useState <Types.MethodSet.method | undefined>(undefined);
  const [changed, setChanged] = React.useState(false);

  React.useEffect(() => {
    const upd = { ...methodRaw };
    upd.calculations = JSON.parse(upd.calculations);
    const components = JSON.parse(upd.components as string);
    // count = components.length;
    upd.components = components;
    setMethod(upd);
  }, [methodRaw]);

  const applyChanges = (row) => {
    const { field, value, id } = row;
    const updList = [...method?.components];
    const upd = { ...method };
    const index = updList.findIndex((obj) => obj.id === id);
    updList[index][field] = field === 'rt' || field === 'window' ? +value : value;
    upd.components = updList;
    setMethod(upd as any);
    setChanged(true);
  };

  const handleChange = (event, type : string) => {
    event.stopPropagation();
    if (event.target.value < 0) {
      return;
    }
    const upd = { ...method as Types.MethodSet.method };
    const value = type === 'smoothMethod' ? event.target.value : +event.target.value;
    upd.calculations[type] = value;
    setMethod(upd);
    setChanged(true);
  };

  const handleChangeType = (event, row) => {
    event.stopPropagation();
    const component = method?.components as Types.MethodSet.ComponentI[];
    const updMethod = { ...method as Types.MethodSet.method };
    const upd = [...component];
    const { value } = event.target;
    const index = component.findIndex((obj) => obj.id === row.id);
    upd[index].type = value;
    updMethod.components = upd;
    setMethod(updMethod);
    setChanged(true);
  };

  const handleSubmit = async () => {
    const upd : Types.LooseObject = { ...method };
    upd.method = { components: upd.components, calculations: upd.calculations };
    delete upd.components;
    delete upd.calculaations;
    const param : UpdateParams = {
      id: upd?.id as string, data: upd, previousData: method as Types.MethodSet.method,
    };
    try {
      const response = await dataProvider.update<Types.MethodSet.method>('method', param);
      const { data } = response;
      const { calculations, components } = data;
      data.calculations = JSON.parse(calculations);
      data.components = JSON.parse(components as string);
      notify('The Method is updated');
      setOpen(false);
      setChanged(false);
      setMethod(data);
      dispatch(reloadPeak(!reload));
    } catch (error) {
      notify('Error: Could not update method');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: translate('resources.routes.method.componentname'),
      flex: 400,
      editable: false,
    },
    {
      field: 'rt',
      headerName: translate('resources.routes.method.RT'),
      flex: 200,
      type: 'number',
      editable: false,
    },
    {
      field: 'window',
      headerName: translate('resources.routes.method.window'),
      flex: 200,
      type: 'number',
      editable: false,
    },
    {
      field: 'type',
      headerName: translate('resources.routes.method.typePeak'),
      flex: 500,
      renderCell: (params: GridCellParams) => {
        const { value, row } = params;
        return (
          <TypeSelect
            handleSelect={handleChangeType}
            value={value as string}
            row={row}
            editable={false}
          />
        );
      },
    },
  ];

  return (

    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>

      <div style={{ width: window.innerWidth * 0.4, margin: '1em' }}>
        <Box display="flex">
          <Box flexGrow={1}>
            <Typography variant="h5">
              {translate('resources.routes.method.calcprops')}
            </Typography>
          </Box>
          <Button
            color={changed ? 'secondary' : 'primary'}
            variant={changed ? 'contained' : 'text'}
            disabled={!changed}
            onClick={handleSubmit}
          >
            {translate('resources.routes.method.update')}
          </Button>
        </Box>

        {method
                && (
                <>
                  <TextField
                    disabled
                    className={classes.margin}
                    value={method?.name}
                    fullWidth
                    label={translate('resources.routes.method.name')}
                  />
                  <TextField
                    disabled
                    className={classes.margin}
                    value={method?.created}
                    fullWidth
                    label={translate('resources.routes.method.created')}
                  />
                  <TextField
                    disabled
                    className={classes.margin}
                    value={method?.version}
                    fullWidth
                    label={translate('resources.routes.method.version')}
                  />
                  <TextField
                    disabled
                    className={classes.margin}
                    value={method?.user.email}
                    fullWidth
                    label={translate('resources.routes.method.user')}
                  />
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>
                        {translate('resources.routes.method.peakprops')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <CalculationForm
                        state={method?.calculations}
                        editable
                        handleChange={handleChange}
                        classes={classes}
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>
                        {translate('resources.routes.method.comp')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className={classes.root}>
                        <div className={classes.grid}>
                          <DataGrid
                            onCellEditCommit={applyChanges}
                            style={{ margin: '1em', width: '100%' }}
                            disableSelectionOnClick
                            rows={method?.components as Types.MethodSet.ComponentI[]}
                            columns={columns}
                            hideFooter
                          />

                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </>
                )}
      </div>
    </Drawer>
  );
};

export default SideView;
