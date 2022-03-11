import * as React from 'react';
import {
  Show, TextField, DateField, ShowProps, useTranslate,
  FunctionField, FormTab, TabbedForm,
} from 'react-admin';
// own libs
import { PeakSelection, Deconvolution, FastaTab } from './Tabs';

const WithProps = ({ children, ...props }) => children(props);

const MethodShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();
  const naming = { decon: 'Deconvolution', peak: 'Peak Selection', fasta: 'Sequence' };
  return (
    <>
      <Show {...props} actions={false}>
        <WithProps>
          {({ record }) => (

            <TabbedForm
              toolbar={<div />}
              record={record}
              syncWithLocation={false}
            >
              <FormTab label={translate('resources.routes.method.meta')}>
                <FunctionField
                  label={translate('resources.routes.method.user')}
                  render={(r) => `${r.user ? r.user.email : ''} `}
                />
                <DateField source="created" label={translate('resources.routes.method.created')} />
                <FunctionField
                  label={translate('resources.routes.method.type')}
                  render={(r) => `${r.type ? naming[r.type] : ''} `}
                />
                <TextField source="version" label={translate('resources.routes.method.version')} />
                <TextField source="name" label={translate('resources.routes.method.method')} />

              </FormTab>
              {record.type === 'peak' && (
              <FormTab label={translate('resources.routes.method.peak')}>
                <PeakSelection source="method" edit editable={false} />
              </FormTab>
              )}
              {record.type === 'decon' && (
              <FormTab label={translate('resources.routes.method.decon')}>
                <Deconvolution source="method" edit editable={false} />
              </FormTab>
              )}
              {record.type === 'fasta' && (
              <FormTab label={translate('resources.routes.method.fasta')}>
                <FastaTab source="method" edit editable={false} />
              </FormTab>
              )}

            </TabbedForm>
          )}
        </WithProps>
      </Show>

    </>
  );
};

export default MethodShow;
