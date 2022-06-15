import * as React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { SaveButton } from 'react-admin';
import AddIcon from '@material-ui/icons/Add';

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
  disabled?: boolean,
  create?: boolean,
}

const ToolBarLight: React.FC<ToolBarLightI> = ({ disabled = false, create = false, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.light}>
      {!create && <SaveButton disabled={disabled} {...props} />}
      {create && (
      <>
        <SaveButton disabled={disabled} {...props} label="create" icon={<AddIcon />} />
      </ >
      ) }
    </div>
  );
};

export default ToolBarLight;
