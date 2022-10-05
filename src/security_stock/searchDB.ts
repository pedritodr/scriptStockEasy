import { FileReportTxt } from "./writeFile";
import { PrepareDataProcess } from "./searchRepeat";
import { DBConnection } from "@stockoverflow/orm-wrapper";

export const searchDB = async (data: any, request: any) => {
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
  console.log(data.length);
  const prepareDataProcess = new PrepareDataProcess(data);
  const fileReportTxt = new FileReportTxt(
    `report-seachDB-not-exist${new Date().getTime()}`
  );
  let dataValid = "Search database report for items that do not exist ";
  const validItems = await prepareDataProcess.validItems();

  for (const item of validItems) {
    try {
      const requestDB = await dbConnection.entity("easy_stock").get({
        id_provider: item.id_provider,
        reference_id: item.reference_id,
      });
      if (requestDB.length > 0) {
        dataValid += "\r\n";
        dataValid += `item:${JSON.stringify(item)}`;
      }
    } catch (error) {
      console.log(error);
    }
  }
  fileReportTxt.addLine(dataValid);
  return {
    count: validItems.length,
  };
};
