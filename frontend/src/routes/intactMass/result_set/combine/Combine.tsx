import React from 'react';
import dataProvider from 'dataProvider';
import {
  N, D, DR, R,
} from 'media';
import { Record, useNotify, useTranslate } from 'ra-core';
import {
  Button, Fab,
  createStyles, makeStyles, Paper, TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router';

const useStyles = makeStyles(() => createStyles({

  root: {
    maxWidth: '100%',
    minHeight: 500,
    padding: '2em',
  },
  img: {
    flexDirection: 'column',
    maxHeight: 400,
  },

}));

const CombinePage = () : React.ReactElement => {
  const classes = useStyles();
  const translate = useTranslate();
  const notify = useNotify();
  const history = useHistory();

  const [results, setResults] = React.useState<Record[]>([]);
  const [analyzisData, setAnalyzisData] = React.useState<any>();
  const [selectedResulsts, setSelectedResulsts] = React.useState(
    {
      N: { id: '', fig: N },
      D: { id: '', fig: D },
      R: { id: '', fig: R },
      DR: { id: '', fig: DR },
    },
  );

  const handleSelected = (kind : string, value : Record | null) => {
    const updSelected = { ...selectedResulsts };
    if (value) {
      updSelected[kind].id = value.id;
      setSelectedResulsts(updSelected);
    }
  };

  const handleFabClick = () => {
    if (analyzisData) {
      setAnalyzisData(null);
    } else {
      history.goBack();
    }
  };

  const submit = async () => {
    const sendObject = {
      N: '', R: '', D: '', DR: '',
    };
    const ids = Object.keys(sendObject).map((key) => {
      if (selectedResulsts[key].id === '') {
        return '-1';
      }
      sendObject[key] = selectedResulsts[key].id;
      return selectedResulsts[key].id;
    });
    if (ids.includes('-1')) {
      notify('Please select for all kinds a result');
      return;
    }

    // const data = await dataProvider.combine(sendObject);
    setAnalyzisData({ bla: 'blaa' });
  };

  React.useEffect(() => {
    const id : string = window.location.href.split('/').slice(-1)[0];

    dataProvider.getOne('resultset', { id }).then((response) => {
      const { data } = response;
      dataProvider.getMany('result', { ids: data.results }).then((res) => {
        setResults(res.data);
      });
    });
  }, []);

  return (
    <>
      <Fab
        color="primary"
        size="small"
        style={{ marginBottom: '1em' }}
        onClick={handleFabClick}
      >
        <ArrowBackIcon />
      </Fab>

      <Paper className={classes.root}>
        {analyzisData && <div>asdf</div>}
        {!analyzisData
        && (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {Object.keys(selectedResulsts).map((i) => (
              <div className={classes.img}>
                <img src={selectedResulsts[i].fig} alt="" />
                <Autocomplete
                  onChange={(_, values) => handleSelected(i, values)}
                  options={results}
                  getOptionLabel={(option : Record) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      style={{ marginTop: '1em', width: 400 }}
                      variant="outlined"
                      label={translate('resources.routes.resultset.possibleResults')}
                    />
                  )}
                />
              </div>
            )) }
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row-reverse',

          }}
          >
            <Button
              variant="outlined"
              color="primary"
              style={{ marginTop: 80 }}
              onClick={submit}
            >
              {translate('resources.routes.resultset.submit')}
            </Button>
          </div>

        </>
        ) }

      </Paper>
    </>
  );
};

export default CombinePage;
