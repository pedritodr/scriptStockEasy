import momentTimeZone from "moment-timezone";
import { csvLoad } from "./csvLoad";
import { FileReportTxt } from "./writeFile";
import { PrepareDataProcess } from "./searchRepeatCompound";

(async () => {
  console.time("process");
  const data = await csvLoad("Stockdeseguridad003-03-10-22", ";");
  console.log(data.length);
  const prepareDataProcess = new PrepareDataProcess(data);
  const fileReportTxt = new FileReportTxt(
    `report-duplicates-${momentTimeZone
      .tz("America/Santiago")
      .format("YYYY-MM-DD-HH-mm-ss")}`
  );
  let dataRepeated = "Report of item Repeated";
  dataRepeated += "\r\n";
  dataRepeated += "sellers;sku_sap;stock_seguridad";

  const duplicates = await prepareDataProcess.searhDuplicate();
  duplicates.forEach((item) => {
    const { id_provider, reference_id, security_stock_f } = Object.values(
      item
    )[0] as {
      id_provider: string;
      reference_id: string;
      security_stock_f: any;
    };
    dataRepeated += "\r\n";
    dataRepeated += `${id_provider};${reference_id};${security_stock_f}`;
  });

  fileReportTxt.addLine(dataRepeated);

  /* const fileReportValidTxt = new FileReportTxt(
    `report-valid-${new Date().getTime()}`
  );
  let dataValid = "Report of valid items";
  dataValid += "\r\n";
  dataValid += "sellers;sku_sap;stock_seguridad";

  const validItems = await prepareDataProcess.validItems();
  validItems.forEach((item) => {
    dataValid += "\r\n";
    dataValid += `${item.id_provider};${item.reference_id};${item.security_stock_f}`;
  });

  fileReportValidTxt.addLine(dataValid);
  const prepareDataProcess2 = new PrepareDataProcess(duplicates);
  const validItems2 = await prepareDataProcess2.validItems();
  console.log(validItems2.length); */
  console.timeEnd("process");
})();
