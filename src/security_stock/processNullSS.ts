import momentTimeZone from "moment-timezone";
import { DBConnection } from "@stockoverflow/orm-wrapper";
import { stockReducerFileSS } from "../interfaces";
export const processItems = async (items: any, request: any) => {
  //items.length = 2000;
  if (!request.context.hasOwnProperty("rdsEasy")) {
    throw {
      status: 500,
      message: "No se encontraron credenciales en el contexto",
    };
  }
  const dbConfig = request.context.rdsEasy;
  const dbConnection = new DBConnection();
  const status = dbConnection.status;

  if (status !== "Database connected") {
    await dbConnection.createConnection(dbConfig);
  } else {
    await dbConnection.close();
    await dbConnection.createConnection(dbConfig);
  }
  const queryCreateTemporaryTable = ` CREATE  TABLE security_stock_temp (
    reference_id varchar(50) NOT NULL,
    id_provider varchar(50) NOT NULL,
    security_stock_f int(11) NULL,
    security_stock int(11) NULL,
    warehouse varchar(50) NULL,
    createdAt datetime NULL
  );`;
  const queryUpdateCorrectStock = `update easy_stock s JOIN security_stock_temp t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
  and IFNULL(s.warehouse, '') = IFNULL(t.warehouse, '') set update_date = '${momentTimeZone
    .tz("America/Santiago")
    .format(
      "YYYY-MM-DD HH:mm:ss"
    )}',  s.security_stock_f = t.security_stock_f,  s.security_stock = t.security_stock;`;

  /*  const queryUpdateCorrectStock = `update easy_stock s JOIN security_stock_temp t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
   set update_date = (case when s.security_stock_f <> t.security_stock_f then '${momentTimeZone
     .tz("America/Santiago")
     .format(
       "YYYY-MM-DD HH:mm:ss"
     )}' else update_date end ),  s.security_stock_f = t.security_stock_f ;`; */

  const stockFileReducer = ({
    id_provider,
    reference_id,
    warehouse,
  }: stockReducerFileSS) => {
    const createdAt = momentTimeZone
      .tz("America/Santiago")
      .format("YYYY-MM-DD HH:mm:ss");
    return `('${id_provider}', '${reference_id}', ${null} ,${0},'${
      !warehouse ? "" : warehouse
    }','${createdAt}')`;
  };
  let arrayPrepare: string[] = [];

  items.forEach((item: stockReducerFileSS) => {
    arrayPrepare.push(stockFileReducer(item));
  });

  console.log(JSON.stringify(arrayPrepare));
  let itemsUpdate = 0;
  let itemsMatched = 0;

  const iterations = Math.ceil(arrayPrepare.length / 1000);
  for (let index = 0; index < iterations; index++) {
    const values = arrayPrepare.splice(0, 1000).join(",");
    const queryInsertStockIds = `INSERT INTO security_stock_temp (id_provider,reference_id, security_stock_f,security_stock,warehouse, createdAt)
    values ${values};`;

    try {
      await dbConnection.sql(queryCreateTemporaryTable);
      await dbConnection.sql(queryInsertStockIds);
      await dbConnection.sql("START TRANSACTION;");
      const responseQuery = await dbConnection.sql(queryUpdateCorrectStock);
      await dbConnection.sql("DROP TABLE security_stock_temp;");
      await dbConnection.sql("COMMIT;");
      console.log(responseQuery);
      itemsUpdate += responseQuery.changedRows;
      itemsMatched += responseQuery.affectedRows;
    } catch (error) {
      console.error(error);
    }
  }
  const noMatched = items.length - itemsMatched;
  return {
    itemsNotMatched: noMatched,
    itemsMatched,
    itemsUpdate,
    itemsCount: items.length,
  };
};
