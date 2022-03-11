import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
  Box,
  CardContent, Checkbox, IconButton, TextField,
} from '@material-ui/core';
import { useTranslate } from 'react-admin';
import MenuItem from '@material-ui/core/MenuItem';
import RemoveIcon from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';

// own libs
import { proteinTypes as Types } from 'types';
import * as TYPES from 'types';
import { useSelector } from 'react-redux';
import Autocomplete from '@material-ui/lab/Autocomplete';

const SequenceCard : React.FC<Types.SequenceCardI> = (props) => {
  const translate = useTranslate();
  const {
    chain, addMod, handleRemove, handleCheck, handleQuantity, handleCheckGlyco,
    handleModification, handleQuantityChain, light, setModificationSet,
  } = props;

  const useStyles = makeStyles((theme: Theme) => createStyles({
    card: {
      width: 450,
      overflowY: 'scroll',
      height: light ? 400 : 600,
      margin: theme.spacing(1),
      padding: theme.spacing(1),
      position: 'relative',
    },

    textareas: {
      margin: '10',
      padding: '',
      width: '10',
    },
    row: {
      display: 'flex',
      alignContent: 'flex-start',
    },

    form: {
      '& > *': {
        margin: theme.spacing(1),
        width: 250,
      },
    },
    quantity: {
      width: 35,
      textAlign: 'right',

    },
    smallE: {
      margin: theme.spacing(1),
      width: 15,
      height: 15,
    },
    bottom: {
      position: 'relative',
      right: 0,
      bottom: 0,

    },
  }));

  const modificationSet = useSelector((state : TYPES.AppState) => state.data.modificationSet);
  const [modification, setModification] = React.useState<TYPES.modification[]>([]);

  const handleChange = (value : TYPES.modificationSet | null) => {
    if (value) {
      const mod = value?.modifications.filter((obj) => obj.kind === 'modification');
      setModification(mod);
      setModificationSet(value.id, chain);
    } else {
      setModification([]);
      setModificationSet('-1', chain);
    }
  };

  const classes = useStyles();

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>

          <Box display="flex" flexDirection="row">

            <Box flexGrow={1}>
              <Typography variant="h5">
                {chain.name }
              </Typography>
            </Box>
            <Box>
              <Tooltip title={translate('resources.routes.masscalculation.glyco')}>
                <Checkbox
                  checked={chain.glyco}
                  onChange={() => { handleCheckGlyco(chain); }}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              </Tooltip>
            </Box>
          </Box>
          <Autocomplete
            onChange={(_, values) => handleChange(values)}
            options={modificationSet}
            getOptionLabel={(option : TYPES.modificationSet) => option.name}
            renderInput={(params) => <TextField {...params} label="Modification Set" />}
          />

          <TextField
            fullWidth
            margin="dense"
            label={translate('resources.routes.masscalculation.quant')}
            value={chain.quant}
            type="number"
            onChange={(e) => { handleQuantityChain(e, chain); }}
          />

          {chain.mod.map((modi : Types.ModificationI) => (

            <div className={classes.form}>
              <TextField
                fullWidth
                select
                margin="dense"
                label={translate('resources.routes.masscalculation.mod')}
                value={modi.mod}
                onChange={(e) => { handleModification(e, modi, chain); }}
                defaultValue="None"

              >
                {modification.map((option : TYPES.modification) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>

                ))}
              </TextField>
              <TextField
                className={classes.quantity}
                margin="dense"
                label={translate('resources.routes.masscalculation.modQ')}
                value={modi.quant}
                onChange={(e) => (handleQuantity(e, modi, chain))}
                defaultValue="None"
                type="number"

              />
              <Tooltip title={translate('resources.routes.masscalculation.var')}>
                <Checkbox
                  className={classes.smallE}
                  checked={modi.var}
                  onChange={() => { handleCheck(chain, modi); }}
                />
              </Tooltip>

              <Tooltip title={translate('resources.routes.masscalculation.remove')}>
                <IconButton onClick={() => { handleRemove(chain, modi); }} className={classes.smallE} size="small">
                  <RemoveIcon />
                </IconButton>
              </Tooltip>

            </div>

          ))}

        </CardContent>

        <CardActions className={classes.bottom}>
          <Button onClick={() => { addMod(chain); }} fullWidth variant="contained" color="primary" disabled={modification.length === 0}>
            {' '}
            {translate('resources.routes.masscalculation.add')}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default SequenceCard;
