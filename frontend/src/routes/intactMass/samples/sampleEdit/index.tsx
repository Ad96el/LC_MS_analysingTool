import * as React from 'react';
import {
  Edit, TextInput, EditProps, required, useTranslate, FunctionField,
  useNotify, FormDataConsumer, TabbedForm, FormTab, Record, UpdateParams,
  Identifier, CreateParams, Loading, DateField,
} from 'react-admin';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ColorInput } from 'react-admin-color-input';
import Link from '@material-ui/core/Link';
// own libs
import { useHistory } from 'react-router';
import {
  Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, Button,
} from '@material-ui/core';
import { ToolBarLight, NavigationHeader } from 'components';
import dataProvider from 'dataProvider';
import { useSelector, useDispatch } from 'react-redux';
import * as Types from 'types';
import { prepareResultsCreation } from 'reducer/actions';
import PeakSelectionTab from './peakSelectionTab';
import DeconvolutionTab from './deconvolutionTab';
import EditActions from './ActionBar';

const useStyles = makeStyles((theme: Theme) => createStyles({
  TextInput: {
    width: '100%',
    marginTop: theme.spacing(1) - 3,
  },

}));

const SampleEdit : React.FC<EditProps> = (props) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const notify = useNotify();
  const history = useHistory();
  const peaks = useSelector((state : Types.AppState) => state.data.peaks);
  const tics = useSelector((state : Types.AppState) => state.data.tics);
  const prepareResults = useSelector((state: Types.AppState) => state.data.prepareResults);
  const createResult = prepareResults.filter((obj) => obj.updated && obj.id.length > 0);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [updateData, setUpdateData] = React.useState<Partial<Record> | undefined>(undefined);
  const option = useSelector((state : Types.AppState) => state.data.samples);

  // tracks changes. if peaks are.
  React.useEffect(() => {
    const updValue : any = { ...peaks };
    updValue.tics = tics;
    updValue.updated = false;
    const updList = [...prepareResults];
    const index = updList.findIndex((obj) => obj.id === updValue.id);
    if (index < 0) {
      updList.push(updValue);
    } else {
      updValue.updated = true;
      updList[index] = updValue;
    }
    dispatch(prepareResultsCreation(updList));
    return () => {
      dispatch(prepareResultsCreation([]));
    };
  }, [peaks, tics]);

  const handleSave = async (data : Partial<Record>, type: string) => {
    const upd = { ...data };
    upd.msid = data.methodset.id ? data.methodset.id : '';

    delete upd.methodset;
    delete upd.result;
    const params : UpdateParams = {
      data: upd,
      previousData: data as Record,
      id: data.id as Identifier,
    };

    setLoading(true);
    try {
      if (type === 'save') {
        await dataProvider.update('sample', params);
        history.goBack();
        notify('Sample is updated');
      } else if (type === 'createsave') {
        const apiCalls : Promise<any> [] = [];
        apiCalls.push(dataProvider.update('sample', params));
        createResult.forEach((obj) => {
          const createParam : CreateParams = { data: obj };
          apiCalls.push(dataProvider.create('result', createParam));
        });
        await Promise.all(apiCalls);
        setOpen(false);
        history.goBack();
      } else if (type === 'open') {
        setOpen(true);
        setUpdateData(data);
      }
    } catch (e) {
      notify((e as any).message, 'warning');
    }
    setLoading(false);
  };

  const classes = useStyles();
  const { id } = props;
  const options = option.map((obj) => obj.id);

  return (
    <>
      <NavigationHeader currentId={id} options={options} />
      <Dialog
        open={open || loading}
        onClose={() => setOpen(false)}
        fullWidth
        style={{ height: 700 }}
      >

        <>
          {loading

            ? (
              <DialogContent>
                <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.sampleEdit" />
              </DialogContent>
            )

            : (
              <>
                <DialogTitle id="alert-dialog-title">
                  {translate('resources.routes.sample.confirmSave')}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {translate('resources.routes.sample.confirmsaveExp')}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpen(false)}
                    color="primary"
                  >
                    {translate('util.cancel')}
                  </Button>
                  <Button
                    onClick={() => handleSave(updateData as Partial<Record>, 'save')}
                    color="primary"
                    disabled={false}
                  >
                    {translate('util.save')}
                  </Button>
                  <Button
                    onClick={() => handleSave(updateData as Partial<Record>, 'createsave')}
                    color="primary"
                    autoFocus
                    disabled={createResult.length === 0}
                  >
                    {translate('util.create')}
                  </Button>
                </DialogActions>
              </>
            )}
        </>
      </Dialog>
      <Edit actions={<EditActions {...props} />} {...props}>

        <TabbedForm
          handleSubmitWithRedirect
          submitOnEnter={false}
          syncWithLocation={false}
          save={(data) => handleSave(data, 'open')}
          toolbar={<ToolBarLight disabled={loading} />}
        >
          <FormTab label={translate('resources.routes.sample.meta')} variant="standard">
            <FunctionField
              label={translate('resources.routes.sample.user')}
              render={(record) => `${record.user ? record.user.email : ''} `}
            />

            <DateField
              source="created"
              label={translate('resources.routes.sample.created')}
            />
            <FunctionField
              label={translate('resources.routes.sample.result')}
              render={(record) => (
                record.result.name ? (
                  <Link underline="none" href={`/#/result/${record.result.id}/show`}>
                    {record.result.name}
                  </Link>
                ) : 'None'
              )}
            />
            <FunctionField
              label={translate('resources.routes.sample.methodset')}
              render={(record) => (record.methodset.name ? record.methodset.name : 'None')}
            />
            <TextInput
              source="type"
              label={translate('resources.routes.sample.type')}
              validate={required()}
            />
            <TextInput
              source="name"
              label={translate('resources.routes.sample.sample')}
              validate={required()}
            />

            <ColorInput
              source="color"
              className={classes.TextInput}
              label={translate('resources.routes.sample.color')}
              validate={required()}
            />
          </FormTab>
          <FormTab label={translate('resources.routes.sample.peakselect')}>
            <FormDataConsumer>
              {({ formData }) => {
                const { methods } = formData.methodset as Types.MethodSet.medotSet;

                const peakMethod = methods ? methods.filter((obj) => obj.type === 'peak')[0] : null;
                return (
                  <div>
                    {peakMethod && (
                    <div style={{ marginBottom: '6em' }}>
                      <PeakSelectionTab sid={id} method={peakMethod} />
                    </div>
                    ) }
                  </div>
                );
              }}

            </FormDataConsumer>
          </FormTab>
          <FormTab label={translate('resources.routes.sample.decon')}>
            <FormDataConsumer>
              {({ formData }) => {
                const { methods } = formData.methodset as Types.MethodSet.medotSet;
                const method = methods ? methods.filter((obj) => obj.type === 'decon')[0] : null;
                return (
                  <div>
                    {method && (
                      <div>
                        <DeconvolutionTab sid={id} method={method} />
                      </div>
                    )}
                  </div>
                );
              }}

            </FormDataConsumer>
          </FormTab>

        </TabbedForm>
      </Edit>

    </>
  );
};

export default SampleEdit;
