import { Box, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  GetListParams, PaginationPayload, SortPayload, useDataProvider, useTranslate,
  Record,
} from 'ra-core';
import React from 'react';
import { ShowButton } from 'react-admin';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { changeSample } from 'reducer/actions';
import * as Types from 'types';

interface AutoCompleteOptionsI {
    sid: string,
    id: string
  }

const AutoCompleteOptions : React.FC<AutoCompleteOptionsI> = ({ sid, id }) => {
  const translate = useTranslate();
  const history = useHistory();
  const dispatch = useDispatch();
  const option = useSelector((state : Types.AppState) => state.data.samples);
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    const pagination : PaginationPayload = { page: 1, perPage: 250 };
    const sort : SortPayload = { field: 'id', order: 'ASC' };
    const filter = { sid };
    const params : GetListParams = {
      pagination, sort, filter,
    };
    dataProvider.getList('sample', params).then((opt) => {
      const { data } = opt;
      const filteredData = data.filter((obj) => obj.methodset.id);
      dispatch(changeSample(filteredData));
    });

    return () => {
      dispatch(changeSample([]));
    };
  }, []);

  const handleChange = (value : Record | null, reason : string) => {
    if (reason === 'select-option') {
      history.replace(value?.id as string);
    }
  };

  return (
    <Autocomplete
      options={option}
      getOptionLabel={(obj) => obj.name}
      style={{ width: '400px' }}
      getOptionDisabled={(obj) => obj.id === id}
      autoComplete
      onChange={(_, object, reason) => { handleChange(object, reason); }}
      renderInput={(params) => <TextField {...params} label={translate('resources.routes.sample.switch')} />}
    />
  );
};

const EditActions : React.FC<any> = ({ basePath, data }) => {
  if (!data) {
    return <div />;
  }

  const { sid, id } = data;
  return (
    <div style={{ width: '100%' }}>
      <Box display="flex">
        <Box p={1} style={{ paddingLeft: 0 }} flexGrow={1}>
          <AutoCompleteOptions id={id} sid={sid} />
        </Box>
        <Box m={0} p={3} style={{ paddingRight: 0, paddingBottom: 0 }}>
          <ShowButton basePath={basePath} record={data} />

        </Box>
      </Box>

    </div>
  );
};

export default EditActions;
