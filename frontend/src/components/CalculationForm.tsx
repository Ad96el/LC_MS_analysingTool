import React from 'react';

import { TextField, MenuItem } from '@material-ui/core';
import { useTranslate } from 'react-admin';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface CalculationForm{
    state: any,
    editable: boolean,
    handleChange: (event, value : string) => void,
    classes: ClassNameMap
}

const CalculationForm : React.FC<CalculationForm> = ({
  state, editable, handleChange, classes,
}) => {
  const translate = useTranslate();

  return (
    <div>
      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          value={state.pickingHeight}
          fullWidth
          label={translate('resources.routes.method.pickingHeight')}
          type="number"
          onChange={(event) => handleChange(event, 'pickingHeight')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.absThreshold}
          label={translate('resources.routes.method.absThreshold')}
          type="number"
          onChange={(event) => handleChange(event, 'absThreshold')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.relThreshold}
          label={translate('resources.routes.method.relThreshold')}
          type="number"
          onChange={(event) => handleChange(event, 'relThreshold')}
        />
      </div>

      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          fullWidth
          value={state.baselineWindow}
          label={translate('resources.routes.method.baselineWindow')}
          type="number"
          onChange={(event) => handleChange(event, 'baselineWindow')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.baselineOffset}
          label={translate('resources.routes.method.baselineOffset')}
          type="number"
          onChange={(event) => handleChange(event, 'baselineOffset')}
        />

        <TextField
          select
          disabled={!editable}
          id="standard-select-currency"
          label={translate('resources.routes.method.smoothMethod')}
          value={state.smoothMethod}
          onChange={(event) => handleChange(event, 'smoothMethod')}
        >
          <MenuItem key="GA" value="GA">Gauss </MenuItem>
          <MenuItem key="MA" value="MA">Moving Average </MenuItem>
          <MenuItem key="SG" value="SG">Savitzky-Golay </MenuItem>
        </TextField>

      </div>
      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          fullWidth
          value={state.smoothWindow}
          label={translate('resources.routes.method.smoothWindow')}
          type="number"
          onChange={(event) => handleChange(event, 'smoothWindow')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.smoothCycles}
          label={translate('resources.routes.method.smoothCycles')}
          type="number"
          onChange={(event) => handleChange(event, 'smoothCycles')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.snThreshold}
          label={translate('resources.routes.method.snThreshold')}
          type="number"
          onChange={(event) => handleChange(event, 'snThreshold')}
        />
      </div>
    </div>
  );
};

export default CalculationForm;
