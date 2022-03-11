import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useTranslate } from 'react-admin';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
// own libs
import dataProvider from 'dataProvider';
import { useHistory } from 'react-router-dom';
import { EditProps } from 'ra-core/esm/controller/details/useEditController';

interface dataI {
  version : string,
  id: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '15%',
    marginLeft: '1em',
    maxHeight: window.innerHeight * 0.7,
  },
  paper: {
    width: '93%',
    height: '95%',
    maxHeight: '100%',
    padding: '1em',

    overflowY: 'scroll',
  },
  button: {
    margin: '3px',
  },
  progress: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },

}));

const Bar : React.FC<EditProps> = ({
  basePath, id, kind,
}) => {
  const classes = useStyles();
  const translate = useTranslate();
  const history = useHistory();
  const [data, setData] = React.useState<dataI[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (basePath && id) {
      setLoading(true);
      dataProvider.getVersions(basePath as string, id as string).then((rows) => {
        setData(rows);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
        setData([]);
      });
    }
  }, [id]);

  const sortedData = data.sort((a, b) => (+a.version) - (+b.version));

  return (
    <div className={classes.root}>
      <Paper
        variant="outlined"
        className={classes.paper}
      >
        <Typography variant="h6">{translate('resources.util.button.version')}</Typography>

        {loading
          ? (
            <div style={{ marginLeft: '50%' }}>
              <CircularProgress />
            </div>
          )

          : sortedData.map((point : dataI) => (
            <Button
              key={point.id}
              fullWidth
              variant="outlined"
              className={classes.button}
              color="primary"
              onClick={() => {
                if (kind === 'edit') {
                  history.replace(`${point.id}/show`);
                } else {
                  window.location.href = `/#${basePath}/${point.id}/show`;
                }
              }}
            >
              {point.version}
            </Button>
          ))}

      </Paper>
    </div>
  );
};

export default Bar;
