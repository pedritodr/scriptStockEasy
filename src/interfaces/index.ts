interface Headers {
  dynamic: Array<Record<string, unknown>>;
  static: Array<Record<string, unknown>>;
}

export interface DataEasy {
  accountName: string;
  warehouseId: string;
  stock: number;
  sku: string;
  stockId: string;
  updateResult?: number;
  primaryAccount?: number;
}

export interface EcommerceClientsOutputInterface {
  endpoint: string;
  method: string;
  data: Record<string, any>;
  data_easy: DataEasy;
  headers: Headers;
  params: {
    flag: string;
    ecommerce_clients: {
      id: string;
      level: string;
    };
  };
}

export interface EcommerceToVtexOutputInterface {
  toVtex: EcommerceClientsOutputInterface;
}

export interface QueryProps {
  query: string;
}

export interface stockReducerFile {
  id_provider: string;
  reference_id: string;
  security_stock_f: string;
  warehouse: string;
}

export interface stockReducerFileDat {
  id_provider: string;
  referenceId: string;
  ventas: number;
  date: any;
}

export interface stockReducerFileSS {
  id_provider: string;
  reference_id: string;
  security_stock: string;
  warehouse: string;
}
