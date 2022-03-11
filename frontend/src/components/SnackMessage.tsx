import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

interface SnackMessageI {
    message: string,
    open: boolean,
    handleClose: () => void
}

const SnackMessage : React.FC<SnackMessageI> = ({ message, open, handleClose }) => (
  <div>
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      onClose={handleClose}
      message={message}
    />
  </div>
);

export default SnackMessage;
