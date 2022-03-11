import * as React from 'react';
import {
  useTranslate, useInput,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
} from '@material-ui/core';

// own libs
import { DeconvolutionForm } from 'components';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tables: {
    width: '50%',
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

const DeconvolutionTab : React.FC<any> = (props) => {
  const [state, setState] = React.useState({
    numit: 100,
    endz: 100,
    startz: 10,
    mzsig: 0.7,
    massub: 200000,
    masslb: 40000,
    massbins: 1,
    minmz: 400,
    maxmz: 6000,
    intthresh: 0,
    peakwindow: 5,
    peakthresh: 0.01,
    peakplotthresh: 0.1,
    beta: 0,
    psig: 1,
    zzsig: 1,
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
      onChange({ calculations: state });
    } else {
      const { calculations } = props.record;
      setState(JSON.parse(calculations));
      onChange({ calculations: JSON.parse(calculations) });
    }
  }, []);

  // Callback functions
  const handleChangeCalculation = (event, type : string) => {
    event.stopPropagation();
    const value = +event.target.value;

    const upd = { ...state };
    upd[type] = value;
    setState(upd);
    onChange({ calculations: upd });
  };

  const VerticalSpacer = () => <span style={{ height: '1em' }} />;
  return (
    <div style={{ margin: '1em' }}>
      <VerticalSpacer />
      <Typography>
        {translate('resources.routes.method.calcprops')}
      </Typography>

      <VerticalSpacer />
      <div style={{ width: '100%' }}>
        <DeconvolutionForm
          state={state}
          handleChange={handleChangeCalculation}
          editable={editable}
          classes={classes}
        />
      </div>
    </div>
  );
};

export default DeconvolutionTab;
