import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import {
  useTranslate, useLocale, useSetLocale, Title,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import * as Types from 'types';
import { changeTheme } from '../reducer/actions';

const useStyles = makeStyles({
  label: { width: '10em', display: 'inline-block' },
  button: { margin: '1em' },
});

const Configuration : React.FC = () => {
  const translate = useTranslate();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const classes = useStyles();
  const theme = useSelector((state : Types.AppState) => state.data.theme);
  const dispatch = useDispatch();
  return (
    <Card>
      <Title title={translate('pos.configuration')} />
      <CardContent>
        <div className={classes.label}>
          {translate('pos.theme.name')}
        </div>
        <Button
          variant="contained"
          className={classes.button}
          color={theme === 'light' ? 'primary' : 'default'}
          onClick={() => dispatch(changeTheme('light'))}
        >
          {translate('pos.theme.light')}
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          color={theme === 'dark' ? 'primary' : 'default'}
          onClick={() => dispatch(changeTheme('dark'))}
        >
          {translate('pos.theme.dark')}
        </Button>
      </CardContent>
      <CardContent>
        <div className={classes.label}>{translate('pos.language')}</div>
        <Button
          variant="contained"
          className={classes.button}
          color={locale === 'en' ? 'primary' : 'default'}
          onClick={() => setLocale('en')}
        >
          en
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          color={locale === 'fr' ? 'primary' : 'default'}
          onClick={() => setLocale('fr')}
        >
          fr
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          color={locale === 'de' ? 'primary' : 'default'}
          onClick={() => setLocale('de')}
        >
          de
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          color={locale === 'it' ? 'primary' : 'default'}
          onClick={() => setLocale('it')}
        >
          it
        </Button>
      </CardContent>
    </Card>
  );
};

export default Configuration;
