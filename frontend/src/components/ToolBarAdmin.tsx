import * as React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { SaveButton } from 'react-admin';

const useStyles = makeStyles(() => createStyles({

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',

  },
  light: {
    margin: '1em',
    display: 'flex',
    alignContent: 'end',
    justifyContent: 'end',
  },

}));

interface ToolBarLightI {
  [key: string]: any,
  disabled?: boolean
}

const ToolBarLight: React.FC<ToolBarLightI> = ({ disabled = false, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.light}>

      <SaveButton disabled={disabled} {...props} />
    </div>
  );
};

export default ToolBarLight;
