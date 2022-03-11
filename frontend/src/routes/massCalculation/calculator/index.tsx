import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FunctionsIcon from '@material-ui/icons/Functions';
import {
  useNotify, PaginationPayload, SortPayload, GetListParams, Loading,
} from 'react-admin';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { proteinTypes as Types } from 'types';
import * as Type from 'types';
import { useDispatch, useSelector } from 'react-redux';
// local
import {
  N, D, R, DR,
} from 'media';
import dataprovider from 'dataProvider';

import { changeModificationSets, changeRowsPreview } from 'reducer/actions';
import { Upload as UploadField } from 'components';
import SequenceHeader from './sequenceHeader';
import TableFooter from './tableFooter';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    display: 'relative',
  },
  margin: {
    margin: theme.spacing(2),
  },

}));

interface MassCalculationI{
  light?: boolean,
}

const MassCalculation : React.FC<MassCalculationI> = ({ light = false }) => {
  const [file, setFile] = useState<File>();
  const [submit, setSubmit] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState <boolean>(false);
  const [loading, setLoading] = useState <boolean>(false);
  const [chains, setChains] = useState<Types.ChainI[]>([]);
  const [count, setCount] = useState<number>(0);
  const [tables, setTables] = useState<Types.TableI>();

  // hooks
  const applyPreviewPing = useSelector((s : Type.AppState) => s.data.applyPreview);
  const notify = useNotify();
  const dispatch = useDispatch();
  useEffect(() => {
    setLoading(true);

    const pagination : PaginationPayload = { page: 1, perPage: 250 };

    const sort : SortPayload = { field: 'name', order: 'ASC' };

    const filter = { };

    const params : GetListParams = {
      pagination, sort, filter,
    };

    dataprovider.getList<Type.modificationSet>('modificationset', params).then((response) => {
      const { data } = response;
      dispatch(changeModificationSets(data));
      setLoading(false);
    });
  }, []);

  // a lot of functions.... All the logic for this feature is here

  const clean = () => {
    setChains([]);
    setSubmit(false);
    setCount(0);
    setUploaded(false);
    setTables(undefined);
  };

  React.useEffect(() => {
    clean();
  }, [applyPreviewPing]);

  // adds modification to a chain
  const addMod = (chain: Types.ChainI) => {
    const updateChains : Types.ChainI[] = [...chains];
    const update = { ...chain };
    const tmp = {
      mod: '-1',
      quant: 1,
      var: false,
      id: count,
    };
    setCount(count + 1);
    update.mod.push(tmp);
    const index = chains.findIndex((x) => x.id === chain.id);
    updateChains[index] = update;
    setChains(updateChains);
  };

  // removes a modification of a chain
  const handleRemove = (chain: Types.ChainI, mod : Types.ModificationI) => {
    const updateChains = [...chains];
    const update = { ...chain };
    const index = chains.findIndex((x) => x.id === chain.id);
    const outIndex = update.mod.findIndex((x) => x.id === mod.id);
    update.mod.splice(outIndex, 1);
    updateChains[index] = update;
    setChains(updateChains);
  };

  // updates the quantity of the modification
  const handleQuantity = (event : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    mod : Types.ModificationI, chain: Types.ChainI) => {
    const updateChains = [...chains];
    const update = { ...chain };
    const indexC = chains.findIndex((x) => x.id === chain.id);

    const indexM = chain.mod.findIndex((x) => x.id === mod.id);
    if (+event.target.value > 0) {
      update.mod[indexM].quant = +event.target.value;
      updateChains[indexC] = update;
      setChains(updateChains);
    }
  };

  // checks if the modification is variable or not
  const handleCheck = (chain: Types.ChainI, mod : Types.ModificationI) => {
    const updateChains = [...chains];
    const update = { ...chain };
    const indexC = chains.findIndex((x) => x.id === chain.id);
    const indexM = chain.mod.findIndex((x) => x.id === mod.id);
    update.mod[indexM].var = !chain.mod[indexM].var;
    updateChains[indexC] = update;
    setChains(updateChains);
  };

  // add quantity to the chains
  const handleQuantityChain = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    chain: Types.ChainI) => {
    const updateChains = [...chains];
    const update = { ...chain };
    const indexC = chains.findIndex((x) => x.id === chain.id);
    if (+event.target.value > 0) {
      update.quant = +event.target.value;
      updateChains[indexC] = update;
      setChains(updateChains);
    }
  };

  // export the data to excel
  const exportToCSV = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    const wsR = XLSX.utils.json_to_sheet(tables?.R ? tables?.R.row : []);

    const wsD = XLSX.utils.json_to_sheet(tables?.D ? tables?.D.row : []);
    const wsN = XLSX.utils.json_to_sheet(tables?.N ? tables?.N.row : []);
    const wsDR = XLSX.utils.json_to_sheet(tables?.DR ? tables?.DR.row : []);

    const wb = {
      Sheets: {
        R: wsR, N: wsN, D: wsD, DR: wsDR,
      },
      SheetNames: ['R', 'N', 'D', 'DR'],
    };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, 'out_R_N_DR_R.xlsx');
  };

  // update a modification
  const handleModification = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    mod : Types.ModificationI, chain: Types.ChainI) => {
    const updateChains = [...chains];
    const update = { ...chain };
    const indexC = chains.findIndex((x) => x.id === chain.id);
    const indexM = chain.mod.findIndex((x) => x.id === mod.id);
    update.mod[indexM].mod = event.target.value;
    updateChains[indexC] = update;
    setChains(updateChains);
  };

  // sending the set configuration to the server to get the weights
  const uploadConfigiruation = async () => {
    setLoading(true);
    try {
      const rows = await dataprovider.calculate(chains, file as File);
      if (light) {
        dispatch(changeRowsPreview(rows));
        setLoading(false);
      } else {
        const tab = {
          N: { row: rows.N, fig: N },
          R: { row: rows.R, fig: R, reduced: true },
          D: { row: rows.D, fig: D },
          DR: { row: rows.DR, fig: DR, reduced: true },
        };
        setSubmit(true);
        setTables(tab);
        setLoading(false);
      }
    } catch {
      setSubmit(false);
      setLoading(false);
      setTables(undefined);
      notify('Error in loading', 'error');
    }
  };

  const onFileInputChange = async (files : File[]) => {
    setLoading(true);
    const length = files?.length;
    if (length !== 1) {
      notify('resource.routes.masscalculation.errorFile', 'warning');
      return;
    }
    const f = files?.[0] as File;
    try {
      const data = await dataprovider.validateFile(f);

      if (data.length === 0) {
        notify('could not detect any chains');
        setLoading(false);
      } else {
        setChains(data);
        setUploaded(true);
        setLoading(false);
        setFile(f);
      }
    } catch (error) {
      setChains([]);
      setUploaded(false);
      setLoading(false);
      setFile(undefined);
      notify('ERROR: Wrong File Format.', 'warning');
    }
  };

  const handleCheckGlyco = (chain: Types.ChainI) => {
    const updateChains = [...chains];
    const indexC = chains.findIndex((x) => x.id === chain.id);
    updateChains[indexC].glyco = !chain.glyco;
    setChains(updateChains);
  };

  const setModificationSet = (id: string, chain: Types.ChainI) => {
    const updateChains = [...chains];
    const indexC = chains.findIndex((x) => x.id === chain.id);

    updateChains[indexC].modSetId = id;
    updateChains[indexC].mod = [];
    setChains(updateChains);
  };

  const classes = useStyles();

  return (
    <>
      { !uploaded ? (
        <UploadField
          onFileInputChange={onFileInputChange}
          preview={false}
        />
      ) : (

        <div className={classes.margin}>
          <SequenceHeader
            chains={chains}
            addMod={addMod}
            handleRemove={handleRemove}
            handleCheck={handleCheck}
            handleQuantity={handleQuantity}
            handleModification={handleModification}
            uploadConfigiruation={uploadConfigiruation}
            handleQuantityChain={handleQuantityChain}
            handleCheckGlyco={handleCheckGlyco}
            setModificationSet={setModificationSet}
            exportFile={exportToCSV}
            disabled={!submit}
            light={light}
            clear={clean}
          />
          {loading ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.table" />
            : (
              <div className={classes.root}>

                {submit && !light && tables
                  ? (
                    <>
                      <TableFooter {...tables?.N} />
                      <TableFooter {...tables?.D} />
                      <TableFooter {...tables?.R} />
                      <TableFooter {...tables?.DR} />

                    </>
                  ) : null }
              </div>
            )}

        </div>
      )}
    </>

  );
};

export { MassCalculation, FunctionsIcon };
