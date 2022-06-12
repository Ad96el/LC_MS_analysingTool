import React from 'react';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import ErrorIcon from '@material-ui/icons/Error';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GridToolbar, sugarColumns, speciesColumns } from 'components';
import { useTranslate } from 'ra-core';
import { DataGrid } from '@material-ui/data-grid';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(25),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

interface propsI {
  sugar: any,
  species: any,
  errors: string[],
  mod: any
}

interface dataI {
  data: propsI
}

const ResultView = ({ data } : dataI) : React.ReactElement => {
  const classes = useStyles();
  const [sugar, setSugar] = React.useState([]);
  const [speciesLight, setSpeciesLight] = React.useState([]);
  const [speciesHeavy, setSpeciesHeavy] = React.useState([]);
  React.useEffect(() => {
    const sugarId = data.sugar.map((sugarObject, index) => {
      const upd = { ...sugarObject };
      upd.id = index;
      return upd;
    });
    const speciesLightId = data.species.lightChainSpecies.map((species, index) => {
      const upd = { ...species };
      upd.id = index;
      return upd;
    });
    const speciesHeavyId = data.species.heavyChainSpecies.map((species, index) => {
      const upd = { ...species };
      upd.id = index;
      return upd;
    });
    setSpeciesLight(speciesLightId);
    setSpeciesHeavy(speciesHeavyId);
    setSugar(sugarId);
  }, []);

  const translate = useTranslate();
  const { errors, mod } = data;

  const errorCalc = Math.abs((mod.diffHeavy * 2 + mod.diffLight * 2) - mod.diffD) >= 10;

  return (
    <>
      {errors.length > 0
      && (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <ErrorIcon color="secondary" fontSize="large" style={{ marginRight: '1em' }} />
          <Typography className={classes.heading}>{translate('resources.routes.resultset.errors') }</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {errors.map((errorMsg) => <Typography>{errorMsg}</Typography>)}
          </div>
        </AccordionDetails>
      </Accordion>

      )}

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      >

        <div>

          <Typography style={{ margin: '1em' }} variant="h5">{translate('resources.routes.resultset.sugar') }</Typography>

          <DataGrid
            disableSelectionOnClick
            style={{ width: window.innerWidth * 0.4, height: 600, margin: '1em' }}
            rows={sugar}
            pageSize={10}
            columns={sugarColumns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
        <div>
          <Typography style={{ marginTop: '1em' }} variant="h5">{translate('resources.routes.resultset.validation') }</Typography>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: window.innerWidth * 0.4,
          }}
          >
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {translate('resources.routes.resultset.diffHeavy')}
            </Typography>
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {mod.diffHeavy}
            </Typography>

          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: window.innerWidth * 0.4,
          }}
          >
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {translate('resources.routes.resultset.diffLight')}
            </Typography>
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {mod.diffLight}
            </Typography>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: window.innerWidth * 0.4,
          }}
          >
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {translate('resources.routes.resultset.diffD')}
            </Typography>
            <Typography style={{ marginTop: '1em' }} variant="h6">
              {mod.diffD}
            </Typography>
          </div>
          <hr />
          <Typography style={{ marginTop: '1em', textAlign: 'center' }} variant="h6">
            {translate('resources.routes.resultset.expect')}
          </Typography>
          <Typography style={{ marginTop: '1em', textAlign: 'center' }} variant="h6">
            { errorCalc && (
            <>
              {' '}
              {`But: 2 * ${mod.diffLight} + 2 * ${mod.diffHeavy} ≠ ${mod.diffD}` }
              <br />
              <div style={{ color: 'red' }}>
                Unexpected result. Check the samples.
              </div>
            </>
            )}
            { !errorCalc && (
            <>

              { `2 * ${mod.diffLight} + 2 * ${mod.diffHeavy} ≈ ${mod.diffD}`}
              <br />
              <div style={{ color: '#4f3cc9' }}>
                Expected Error founds. Modification are valid. Analyzis are valid.
              </div>

            </>
            )}

          </Typography>

        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      >

        <div>

          <Typography style={{ margin: '1em' }} variant="h5">{translate('resources.routes.resultset.speciesLight') }</Typography>

          <DataGrid
            disableSelectionOnClick
            style={{ width: window.innerWidth * 0.4, height: 600, margin: '1em' }}
            rows={speciesLight}
            pageSize={10}
            columns={speciesColumns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
        <div>
          <Typography style={{ margin: '1em' }} variant="h5">{translate('resources.routes.resultset.speciesHeavy') }</Typography>
          <DataGrid
            disableSelectionOnClick
            style={{ width: window.innerWidth * 0.4, height: 600, margin: '1em' }}
            rows={speciesHeavy}
            pageSize={10}
            columns={speciesColumns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ResultView;
