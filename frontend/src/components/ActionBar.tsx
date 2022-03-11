/* eslint-disable no-nested-ternary */
import { EditProps } from 'ra-core/esm/controller/details/useEditController';
import { ShowProps } from 'ra-core/esm/controller/details/useShowController';
import React from 'react';
import { EditButton, ListButton, ShowButton } from 'react-admin';

const EditBar : React.FC<EditProps> = (props) => {
  const { record, basePath, data } = props;
  const { permissions } = record;

  return (
    <>
      <ListButton />
      {permissions > 0
       && (
       <EditButton
         basePath={basePath}
         disabled={data ? data.head ? !data.head : true : false}
         record={record}
       />
       )}

    </>
  );
};

const ShowBar : React.FC<ShowProps> = (props) => {
  const { record, basePath, data } = props;

  return (
    <>
      <ListButton />
      <ShowButton basePath={basePath} disabled={data ? !data.head : false} record={record} />
    </>
  );
};

export { ShowBar, EditBar };
