import React from 'react';
import { Button, Paper } from '@material-ui/core';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useTranslate } from 'react-admin';
import { proteinTypes as Types } from 'types';
import SequenceCard from './SequenceCard';

const SequenceContainer : React.FC<Types.SequenceContainerI> = (props) => {
  const {
    chains, addMod, handleRemove, handleCheck, handleQuantity, disabled, handleCheckGlyco, light,
    handleModification, uploadConfigiruation, handleQuantityChain, exportFile, clear,
    setModificationSet,
  } = props;

  const useStyles = makeStyles((theme: Theme) => createStyles({

    root: {
      height: light ? 450 : 650,
      maxWidth: window.innerWidth * 0.8,
      margin: theme.spacing(1),
      padding: theme.spacing(1),
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      overflowX: 'scroll',
    },
    button: {
      margin: theme.spacing(1),
      width: 200,
    },
  }));
  const classes = useStyles();
  const translate = useTranslate();
  return (
    <Paper variant="outlined" elevation={3}>
      <Button color="primary" variant="outlined" className={classes.button} onClick={uploadConfigiruation}>
        {translate('resources.routes.masscalculation.calculate')}
      </Button>

      <Button color="primary" variant="outlined" className={classes.button} onClick={() => clear()}>
        {translate('resources.routes.masscalculation.clear')}
      </Button>
      {!light && (
        <Button color="primary" disabled={disabled} variant="outlined" className={classes.button} onClick={exportFile}>
          {translate('resources.routes.masscalculation.export')}
        </Button>
      ) }

      <div className={classes.root}>
        {chains.map((chain, index) => (
          <SequenceCard
            chain={chain}
            index={index}
            addMod={addMod}
            handleRemove={handleRemove}
            handleCheck={handleCheck}
            handleQuantity={handleQuantity}
            handleModification={handleModification}
            handleQuantityChain={handleQuantityChain}
            handleCheckGlyco={handleCheckGlyco}
            setModificationSet={setModificationSet}
            light={light}
          />

        ))}
      </div>
    </Paper>
  );
};

export default SequenceContainer;
