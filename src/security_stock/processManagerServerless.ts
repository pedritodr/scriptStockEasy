import momentTimeZone from "moment-timezone";
//import { DBConnection } from "@stockoverflow/orm-wrapper";\
import { DataBase } from "./dbServerless";
import { stockReducerFile } from "../interfaces";

export const processItemsManagerServerless = async (
  items: any,
  request: any
) => {
  console.log(
    `The file contained ${items.length} register, is Valid to process`
  );

  if (!request.context.hasOwnProperty("rdsEasy")) {
    throw {
      status: 500,
      message: "No se encontraron credenciales en el contexto",
    };
  }
  const dbConfig = request.context.rdsEasy;
  const dbConnection = new DataBase(dbConfig);

  const queryCreateTemporaryTable = ` CREATE TEMPORARY TABLE ${dbConnection.nameDB}.security_stock_temp (
    reference_id varchar(50) NOT NULL,
    id_provider varchar(50) NOT NULL,
    security_stock_f int(11) NOT NULL,
    createdAt datetime NULL
  )`;
  const queryUpdateCorrectStock = `
    update ${dbConnection.nameDB}.easy_stock s
    JOIN ${dbConnection.nameDB}.security_stock_temp t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
    set  s.security_stock_f = t.security_stock_f
  `;

  const stockFileReducer = ({
    id_provider,
    reference_id,
    security_stock_f,
  }: stockReducerFile) => {
    const createdAt = momentTimeZone
      .tz("America/Santiago")
      .format("YYYY-MM-DD HH:mm:ss");
    return `('${id_provider}', '${reference_id}', '${security_stock_f}','${createdAt}')`;
  };
  let arrayPrepare: string[] = [];

  items.forEach((item: stockReducerFile) => {
    arrayPrepare.push(stockFileReducer(item));
  });

  let itemsUpdate = 0;
  let itemsMatched = 0;

  const iterations = Math.ceil(arrayPrepare.length / 10000);
  for (let index = 0; index < iterations; index++) {
    const values = arrayPrepare.splice(0, 10000).join(",");
    console.log(values);
    const queryInsertStockIds = `INSERT INTO
    ${dbConnection.nameDB}.security_stock_temp (id_provider,reference_id, security_stock_f, createdAt)
  values ${values};`;
    try {
      const responseQuery = await dbConnection.execListOfQuerys([
        { query: queryCreateTemporaryTable },
        { query: queryInsertStockIds },
        { query: "START TRANSACTION;" },
        { query: queryUpdateCorrectStock },
        { query: "COMMIT;" },
      ]);
      console.log(responseQuery);
      itemsUpdate += responseQuery[3].changedRows;
      itemsMatched += responseQuery[3].affectedRows;
    } catch (error) {
      console.error(error);
    }
  }
  const noMatched = items.length - itemsUpdate;
  return {
    itemsNotMatched: noMatched,
    itemsMatched,
    itemsUpdate,
    itemsCount: items.length,
  };
};
