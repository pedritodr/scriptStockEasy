import momentTimeZone from "moment-timezone";
import { DBConnection } from "@stockoverflow/orm-wrapper";
import { stockReducerFile } from "../interfaces";
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
    security_stock_f int(11) NOT NULL,
    warehouse varchar(50) NULL,
    createdAt datetime NULL
  );`;
  /*   const queryUpdateCorrectStock = `update easy_stock s JOIN security_stock_temp t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
  and IFNULL(s.warehouse, '') = IFNULL(t.warehouse, '') set update_date = (case when s.security_stock_f <> t.security_stock_f then '${momentTimeZone
    .tz("America/Santiago")
    .format(
      "YYYY-MM-DD HH:mm:ss"
    )}' else update_date end ),  s.security_stock_f = t.security_stock_f ;`; */

  const searchNotExist =
    "select a.id_provider ,a.reference_id  from security_stock_temp a left join easy_stock b on a.id_provider = b.id_provider and a.reference_id = b.reference_id where b.id is null";
  const queryUpdateCorrectStock = `update easy_stock s JOIN security_stock_temp t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
   set update_date ='${momentTimeZone
     .tz("America/Santiago")
     .format(
       "YYYY-MM-DD HH:mm:ss"
     )}',  s.security_stock_f = t.security_stock_f ;`;

  const stockFileReducer = ({
    id_provider,
    reference_id,
    security_stock_f,
    warehouse,
  }: stockReducerFile) => {
    const createdAt = momentTimeZone
      .tz("America/Santiago")
      .format("YYYY-MM-DD HH:mm:ss");
    return `('${id_provider}', '${reference_id}', '${security_stock_f}','${
      !warehouse ? "" : warehouse
    }','${createdAt}')`;
  };
  let arrayPrepare: string[] = [];

  items.forEach((item: stockReducerFile) => {
    arrayPrepare.push(stockFileReducer(item));
  });
  //console.log(arrayPrepare);
  let itemsUpdate = 0;
  let itemsMatched = 0;
  let itemsNotExist: any[] = [];
  const iterations = Math.ceil(arrayPrepare.length / 1000);
  for (let index = 0; index < iterations; index++) {
    const values = arrayPrepare.splice(0, 1000).join(",");
    const queryInsertStockIds = `INSERT INTO security_stock_temp (id_provider,reference_id, security_stock_f,warehouse, createdAt)
    values ${values};`;

    try {
      await dbConnection.sql(queryCreateTemporaryTable);
      await dbConnection.sql(queryInsertStockIds);
      await dbConnection.sql("START TRANSACTION;");
      const responseQuery = await dbConnection.sql(queryUpdateCorrectStock);
      const responseNotExist = await dbConnection.sql(searchNotExist);
      await dbConnection.sql("DROP TABLE security_stock_temp;");
      await dbConnection.sql("COMMIT;");
      responseNotExist.forEach((element: any) => {
        itemsNotExist.push(element);
      });
      itemsUpdate += responseQuery.changedRows;
      itemsMatched += responseQuery.affectedRows;
    } catch (error) {
      console.error(error);
    }
  }
  const noMatched = items.length - itemsMatched;
  return {
    itemsNotExist: JSON.stringify(itemsNotExist),
    countNotExist: itemsNotExist.length,
    itemsNotMatched: noMatched,
    itemsMatched,
    itemsUpdate,
    itemsCount: items.length,
  };
};
