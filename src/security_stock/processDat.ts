import momentTimeZone from "moment-timezone";
import { DBConnection } from "@stockoverflow/orm-wrapper";
import { stockReducerFileDat } from "../interfaces";

const securityStockArray: any[] = [];
export const processItemsDat = async (items: any, request: any) => {
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

  /*   const queryCreateTemporaryTable = ` CREATE  TABLE security_stock_historical_temp (
    id_provider varchar(50) NOT NULL,
    referenceId varchar(50) NOT NULL,
    venta float NULL,
   update_date datetime NULL
  );`; */
  /*   const queryUpdateCorrectStock = `update easy_stock s JOIN security_stock_calculate t on t.reference_id = s.reference_id and t.id_provider = s.id_provider
  and t.date > '${momentTimeZone
    .tz("America/Santiago")
    .format(
      "YYYY-MM-DD HH:mm:ss"
    )}' set  s.security_stock = t.security_stock ;`; */
  const updateQuery = `UPDATE easy_stock stock JOIN
(
  select id_provider, reference_id, COUNT( DISTINCT update_date) as days, sum(venta) as sale ,  ((3+sum(venta))/10)+2 as security_stock
  from easy.security_stock_historical_data
  where
    (update_date > (now() - interval 15 day))
  group by id_provider ,reference_id
) temp
   on stock.id_provider = temp.id_provider
  set stock.security_stock = temp.security_stock ;`;

  await addStock(items);
  let arrayPrepare: string[] = [];

  securityStockArray.forEach((item: stockReducerFileDat) => {
    item.date = momentTimeZone.tz("America/Santiago").format("YYYY-MM-DD");
    arrayPrepare.push(stockFileReducer(item));
  });
  //console.log(arrayPrepare);
  let itemsUpdate = 0;
  let itemsMatched = 0;

  const iterations = Math.ceil(arrayPrepare.length / 1000);
  for (let index = 0; index < iterations; index++) {
    const values = arrayPrepare.splice(0, 1000).join(",");
    const queryInsertStockIds = `INSERT INTO security_stock_historical_temp (id_provider,reference_id, venta,update_date)
    values ${values};`;
    console.log(queryInsertStockIds);
    try {
      //     await dbConnection.sql(queryCreateTemporaryTable);
      //   await dbConnection.sql(queryInsertStockIds);
      //   await dbConnection.sql("START TRANSACTION;");
      // const responseQuery = await dbConnection.sql(queryUpdateCorrectStock);
      // await dbConnection.sql("DROP TABLE security_stock_temp;");
      // await dbConnection.sql("COMMIT;");
      /*  itemsUpdate += responseQuery.changedRows;
      itemsMatched += responseQuery.affectedRows; */
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

const stockFileReducer = ({
  id_provider,
  referenceId,
  ventas,
  date,
}: stockReducerFileDat) => {
  return `('${id_provider}', '${referenceId}', '${ventas}','${date}')`;
};

const addStock = async (stockArray: string[] = []) => {
  console.log(stockArray.length);
  stockArray.length = 1;
  console.log(stockArray);
  try {
    for (let line of stockArray) {
      const lineArray = line.split("|");
      console.log("entro", lineArray);

      if (lineArray[4] && lineArray[2] && lineArray[14]) {
        const id_provider = lineArray[4]?.trim();
        const referenceId = lineArray[14]?.trim().replace(/^(0+)/g, "");

        let venta = parseInt(lineArray[2]?.trim());
        venta = Number.isNaN(venta) ? 0 : venta;
        console.log("referenceId", referenceId);
        console.log("provider", id_provider);
        console.log("venta", venta);
        const index = securityStockArray.findIndex(
          (item) =>
            item.id_provider === id_provider && item.referenceID === referenceId
        );
        console.log(index);
        securityStockArray[index === -1 ? securityStockArray.length : index] = {
          id_provider,
          referenceId,
          ventas: securityStockArray[index]?.venta
            ? securityStockArray[index]?.venta + venta
            : venta,
        };
      }
    }
  } catch (error) {
    console.error(`Error adding data to array ${JSON.stringify(error)}`);
  }
};
