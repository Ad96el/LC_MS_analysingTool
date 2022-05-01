import React from 'react';

import { TextField, MenuItem } from '@material-ui/core';
import { useTranslate } from 'react-admin';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface DeconvolutionFormI{
    state: any,
    editable: boolean,
    handleChange: (event : React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
                   value : string) => void,
    classes: ClassNameMap
}

const DeconvolutionForm : React.FC<DeconvolutionFormI> = ({
  state, editable, handleChange, classes,
}) => {
  const translate = useTranslate();

  const validate = (e : React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    key : string) => {
    const numberValue = +e.target.value;
    if (numberValue < 0) {
      return;
    }
    if ((key === 'peakthresh' || key === 'peakplotthresh' || key === 'intthresh') && numberValue > 1) {
      return;
    }
    handleChange(e, key);
  };

  return (
    <div style={{ width: '100%' }}>
      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          value={state.numit}
          fullWidth
          label={translate('resources.routes.method.numit')}
          type="number"
          onChange={(event) => validate(event, 'numit')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.startz}
          label={translate('resources.routes.method.startz')}
          type="number"
          onChange={(event) => validate(event, 'startz')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.endz}
          label={translate('resources.routes.method.endz')}
          type="number"
          onChange={(event) => validate(event, 'endz')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.mzsig}
          label={translate('resources.routes.method.mzsig')}
          type="number"
          onChange={(event) => validate(event, 'mzsig')}
        />
      </div>

      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          fullWidth
          value={state.masslb}
          label={translate('resources.routes.method.masslb')}
          type="number"
          onChange={(event) => validate(event, 'masslb')}
        />

        <TextField
          disabled={!editable}
          fullWidth
          value={state.massub}
          label={translate('resources.routes.method.massub')}
          type="number"
          onChange={(event) => validate(event, 'massub')}
        />

        <TextField
          disabled={!editable}
          fullWidth
          value={state.peakwindow}
          label={translate('resources.routes.method.peakwindow')}
          type="number"
          onChange={(event) => validate(event, 'peakwindow')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.zzsig}
          label={translate('resources.routes.method.zzsigs')}
          type="number"
          onChange={(event) => validate(event, 'zzsig')}
        />

      </div>
      <div className={classes.textfields}>
        <TextField
          disabled={!editable}
          value={state.massbins}
          fullWidth
          label={translate('resources.routes.method.massbins')}
          type="number"
          onChange={(event) => validate(event, 'massbins')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.minmz}
          label={translate('resources.routes.method.minmz')}
          type="number"
          onChange={(event) => validate(event, 'minmz')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.maxmz}
          label={translate('resources.routes.method.maxmz')}
          type="number"
          onChange={(event) => validate(event, 'maxmz')}
        />
        <TextField
          disabled={!editable}
          fullWidth
          value={state.peakthresh}
          label={translate('resources.routes.method.peakthresh')}
          type="number"
          onChange={(event) => validate(event, 'peakthresh')}
        />

      </div>
      <div className={classes.textfields}>

        <TextField
          disabled={!editable}
          fullWidth
          value={state.intthresh}
          label={translate('resources.routes.method.intthresh')}
          type="number"
          onChange={(event) => validate(event, 'intthresh')}
        />

        <TextField
          disabled={!editable}
          fullWidth
          value={state.peakplotthresh}
          label={translate('resources.routes.method.peakplotthresh')}
          type="number"
          onChange={(event) => validate(event, 'peakplotthresh')}
        />

        <TextField
          select
          disabled={!editable}
          id="standard-select-currency"
          label={translate('resources.routes.method.beta')}
          value={state.beta}
          onChange={(event) => validate(event, 'beta')}
        >
          <MenuItem key={0} value={0}>None </MenuItem>
          <MenuItem key={50} value={50}>Some </MenuItem>
          <MenuItem key={500} value={500}>Lots </MenuItem>
          <MenuItem key={1000} value={1000}>Other </MenuItem>
        </TextField>
        <TextField
          select
          disabled={!editable}
          id="standard-select-currency"
          label={translate('resources.routes.method.psig')}
          value={state.psig}
          onChange={(event) => validate(event, 'psig')}
        >
          <MenuItem key={0} value={0}>None </MenuItem>
          <MenuItem key={1} value={1}>Some </MenuItem>
          <MenuItem key={10} value={10}>Lots </MenuItem>
          <MenuItem key={100} value={100}>Other </MenuItem>
        </TextField>
      </div>

    </div>
  );
};

export default DeconvolutionForm;
