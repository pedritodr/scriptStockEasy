import { DataBase } from "./dbServerless";

export const processItems = async (items: any, request: any) => {
  console.log(
    `The file contained ${items.length} register, is Valid to process one`
  );

  if (!request.context.hasOwnProperty("rdsEasy")) {
    throw {
      status: 500,
      message: "No se encontraron credenciales en el contexto",
    };
  }
  const dbConfig = request.context.rdsEasy;
  const dbConnection = new DataBase(dbConfig);

  let itemsUpdate = 0;
  let itemsMatched = 0;
  for (const item of items) {
    const query = `update easy_stock set security_stock_f='${item.security_stock_f}'  where id_provider = '${item.id_provider}' and reference_id='${item.reference_id}'`;
    const responseQuery = await dbConnection.execQuery(query);
    itemsUpdate += responseQuery.changedRows;
    itemsMatched += responseQuery.affectedRows;
    console.log(responseQuery);
  }

  return {
    itemsNotMatched: items.length - itemsUpdate,
    itemsMatched,
    itemsUpdate,
    itemsCount: items.length,
  };
};
