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

// own libs
import { DeconvolutionForm } from 'components';
import * as Types from 'types';
import { useDispatch, useSelector } from 'react-redux';
import { reloadDecon } from 'reducer/actions';

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
      width: '21%',
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
    bottom: -50,
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
  const reload = useSelector((state : Types.AppState) => state.data.reloadDecon);
  // states
  const [method, setMethod] = React.useState <Types.MethodSet.method | undefined>(undefined);
  const [changed, setChanged] = React.useState(false);

  React.useEffect(() => {
    const upd = { ...methodRaw };
    upd.calculations = JSON.parse(upd.calculations);
    setMethod(upd);
  }, [methodRaw]);

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

  const handleSubmit = async () => {
    const upd : any = { ...method };
    upd.method = { calculations: upd.calculations };
    delete upd.calculaations;
    const param : UpdateParams = {
      id: upd?.id as string, data: upd, previousData: upd,
    };
    try {
      const response = await dataProvider.update<Types.MethodSet.method>('method', param);
      const { data } = response;
      const { calculations } = data;
      data.calculations = JSON.parse(calculations);
      notify('The Method is updated');
      setOpen(false);
      setChanged(false);
      setMethod(data);
      dispatch(reloadDecon(!reload));
    } catch (error) {
      notify('Error: Could not update method');
    }
  };

  return (

    <Drawer style={{ width: 400 }} anchor="right" open={open} onClose={() => setOpen(false)}>

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
        {translate('resources.routes.sample.expmass')}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <DeconvolutionForm
        state={method?.calculations}
        editable
        handleChange={handleChange}
        classes={classes}
      />
    </AccordionDetails>
  </Accordion>

</>
)}
      </div>
    </Drawer>
  );
};

export default SideView;
