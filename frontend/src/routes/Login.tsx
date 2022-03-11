/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import {
  useLogin, useNotify, Notification,
} from 'react-admin';
import Container from '@material-ui/core/Container';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
} from '@material-ui/core';
import { validate } from 'react-email-validator';
// own libs
import dataProvider from 'dataProvider';
import { Background, building } from '../media';

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {'Copyright © '}
    <Link color="inherit" href="https://www.lonza.com/">
      Lonza Ibex
    </Link>
    {' '}
    {new Date().getFullYear()}
    .
  </Typography>
);

const AboutUs = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {'About us '}
    <Link color="inherit" href="https://www.lonza.com/">
      Lonza Ibex
    </Link>
  </Typography>
);

const useStyles = makeStyles((theme) => ({
  root: {
    height: window.innerHeight,
  },
  image: {
    backgroundImage: `url(${Background})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
  },
  dialog: {
    backgroundImage: `url(${building})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: 500,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  paperDialog: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 300,
    height: '100%',
  },

}));

export default function SignInSide() : React.ReactElement {
  const classes = useStyles();
  // forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailSignup, setemailSignup] = useState('');
  const [passwordSingUp, setPasswordSingUp] = useState('');
  const [passwordSingUpConformation, setPasswordSingUpConformation] = useState('');

  // dialogs
  const [openSignup, setOpenSignup] = useState(false);
  const [openForget, setOpenForget] = useState(false);
  const Login = useLogin();
  const notify = useNotify();

  // a bit logic
  const handleClose = () => {
    setOpenSignup(false);
    setOpenForget(false);
    setemailSignup('');
    setPasswordSingUp('');
    setPasswordSingUpConformation('');
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email || !password) {
      notify('no email or password provided', 'warning');
    } else if (!validate(email) && email !== 'admin') {
      notify('The provided Email has a wrong form', 'warning');
    } else {
      Login({ email, password, signUp: false }).catch(() => {
        notify('Wrong credentials', 'warning');
      });
    }
  };

  const handleForgot = () => {
    if (!emailSignup) {
      return;
    } if (!validate(emailSignup)) {
      notify('The provided Email has a wrong form', 'warning');
    } else {
      const data = { email: emailSignup };
      dataProvider.resetPassword(data).then(() => {
        notify('A temporary password is send to the provided email');
        handleClose();
      }).catch(() => {
        notify('Email does not exit', 'warning');
      });
    }
  };

  const handleGuest = () => {
    Login({ email: null, password: null });
  };

  const handleSignUp = () => {
    if (!emailSignup || !passwordSingUp || !passwordSingUpConformation) {
      notify('no email or password provided', 'warning');
    } else if (passwordSingUp !== passwordSingUpConformation) {
      notify('Password do not match', 'warning');
    } else if (!validate(emailSignup)) {
      notify('The provided Email has a wrong form', 'warning');
    } else {
      dataProvider.signup({ email: emailSignup, password: passwordSingUp, signUp: true })
        .then(() => {
          handleClose();
          notify('An Admin has to approv your request. We will send an Email, if the conformation is done.');
        }).catch(() => notify('Email already provided', 'warning'));
    }
  };

  const signUpDialog = () => {
    setOpenSignup(!openSignup);
  };

  // a lot html

  return (
    <>
      <Dialog
        open={openForget}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <div className={classes.dialog}>
          <Paper className={classes.paperDialog}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <DialogTitle>

              Sign Up
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Would you please provide your email to restore your password?
                We will send you a temporäry password. You can change it later in the
                configuration section.
              </DialogContentText>

              <TextField
                value={emailSignup}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => (setemailSignup(e.target.value))}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleForgot}
              >
                Reset password
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </DialogContent>

          </Paper>

        </div>
      </Dialog>
      <Dialog
        open={openSignup}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <div className={classes.dialog}>
          <Paper className={classes.paperDialog}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <DialogTitle>

              Sign Up
            </DialogTitle>
            <DialogContent>
              <TextField
                value={emailSignup}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => (setemailSignup(e.target.value))}
              />
              <TextField
                value={passwordSingUp}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => (setPasswordSingUp(e.target.value))}
              />
              <TextField
                value={passwordSingUpConformation}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password Conformation"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => (setPasswordSingUpConformation(e.target.value))}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </DialogContent>

          </Paper>

        </div>
      </Dialog>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <div className={classes.form}>
              <form onSubmit={handleLogin}>
                <TextField
                  value={email}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => (setEmail(e.target.value))}
                />
                <TextField
                  value={password}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={(e) => (setPassword(e.target.value))}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleGuest}
                >
                  Continue as Guest
                </Button>
              </form>
              <Box display="flex">
                <Box flexGrow={1}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => { setOpenForget(true); }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Box>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={signUpDialog}
                  >
                    Sign Up
                  </Link>
                </Box>

              </Box>

              <Box mt={5}>
                <Copyright />
              </Box>
            </div>
          </div>
        </Grid>
        <Notification />
      </Grid>
      <footer className={classes.footer}>
        <Container maxWidth="sm">
          <AboutUs />
        </Container>
      </footer>
    </>
  );
}
