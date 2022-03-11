import React from 'react';
import { useHistory } from 'react-router';
import {
  Box, Fab,
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Identifier } from 'ra-core';

interface MovingHeaderI {
    currentId: string | undefined
    options: string[] | Identifier[]
    show?: boolean
  }

const MovingHeader : React.FC<MovingHeaderI> = ({ currentId, options, show = false }) => {
  const history = useHistory();
  const [index, setIndex] = React.useState<number>(-1);

  React.useEffect(() => {
    const currentIndex = options.findIndex((obj) => obj === currentId);
    setIndex(currentIndex);
  }, [currentId, options]);

  const handleChange = (value: number) => {
    setIndex(index + value);
    const id = options[index + value];
    if (!show) {
      history.replace(id as string);
    } else {
      const urlComponents = window.location.href.split('/');
      const lastComponent = urlComponents[urlComponents.length - 1];
      if (+lastComponent) {
        urlComponents.pop();
        urlComponents[urlComponents.length - 2] = id as string;
        window.location.href = urlComponents.join('/');
      }
      urlComponents[urlComponents.length - 2] = id as string;
      window.location.href = urlComponents.join('/');
    }
  };

  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <Fab
          disabled={index === 0 || options.length === 0}
          size="small"
          color="primary"
          onClick={() => handleChange(-1)}
        >
          <ArrowBackIcon />
        </Fab>
      </Box>
      <Box m={0}>
        <Fab
          disabled={index === options.length - 1 || options.length === 0}
          size="small"
          color="primary"
          onClick={() => handleChange(1)}
        >
          <ArrowForwardIcon />
        </Fab>
      </Box>

    </Box>
  );
};

export default MovingHeader;
