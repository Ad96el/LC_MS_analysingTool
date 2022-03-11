/* eslint-disable linebreak-style */
export interface ModificationI {
    var: boolean,
    id: number,
    quant: number,
    mod: string
  }

export interface ChainI {
    correct: boolean,
    quant: number,
    name: string,
    id: string,
    mod: ModificationI[]
  }

export interface SequenceCardI{
    chain : ChainI,
    addMod: (chain: ChainI) => void,
    handleRemove: (chain: ChainI, mod: ModificationI) => void,
    handleCheck: (chain: ChainI, mod: ModificationI) => void,
    handleQuantity: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
       mod: ModificationI, chain: ChainI) => void
    handleModification: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
      mod: ModificationI, chain: ChainI) => void,
    handleQuantityChain: (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >,
      chain: ChainI) => void,
      light?: boolean
}

export interface SequenceContainerI {
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
  light?: boolean,
  add : () => void
}

export interface RowI {
  name: string,
  mass: number,
  glyco: string,
  modifications: string,
  modificationQuantity: string
}

export interface DataTableI {
  rows: RowI[],
  reduced: boolean
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
