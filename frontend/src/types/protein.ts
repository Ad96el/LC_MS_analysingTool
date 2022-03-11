/* eslint-disable linebreak-style */
export interface ModificationI {
    var: boolean,
    id: number,
    quant: number,
    mod: string
  }

export interface ChainI {
    correct: boolean,
    glyco: boolean,
    quant: number,
    name: string,
    id: string,
    mod: ModificationI[]
    modSetId: string
  }

export interface SequenceCardI{
    light?: boolean
    chain : ChainI
    handleCheckGlyco : (chain: ChainI) => void
    addMod: (chain: ChainI) => void
    handleRemove: (chain: ChainI, mod: ModificationI) => void
    handleCheck: (chain: ChainI, mod: ModificationI) => void
    handleQuantity: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
       mod: ModificationI, chain: ChainI) => void
    handleModification: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
      mod: ModificationI, chain: ChainI) => void,
    handleQuantityChain: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
      chain: ChainI) => void,
    index: number
    setModificationSet: (id: string, chain: ChainI) => void
}

export interface SequenceContainerI {
  light?: boolean
  handleCheckGlyco : (chain: ChainI) => void
  chains: ChainI[],
  uploadConfigiruation: () => void,
  addMod: (chain: ChainI) => void,
  handleRemove: (chain: ChainI, mod: ModificationI) => void,
  handleCheck: (chain: ChainI, mod: ModificationI) => void,
  handleQuantity: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
     mod: ModificationI, chain: ChainI) => void
  handleModification: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
    mod: ModificationI, chain: ChainI) => void,
  handleQuantityChain: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
    chain: ChainI) => void,
  exportFile : () => void,
  disabled: boolean,
  clear: () => void,
  setModificationSet: (id: string, chain: ChainI) => void
}

export interface RowI {
  name: string,
  mass: number,
  glyco: string,
  modifications: string,
  modificationQuantity: string
}

export interface DataTableI {
  rows: RowI[]
}

export interface Rows{
  N : RowI[],
  R : RowI[],
  D : RowI[],
  DR : RowI[]
}

export interface TableI {
  N : {
    fig: string | undefined,
    row :RowI[],
  }
  R : {
    fig: string,
    row :RowI[],
  }
  D : {
    fig: string,
    row :RowI[],
  }
  DR: {
    fig: string,
    row :RowI[],
  }
}
