import csv from "csv-parser";
import fs from "fs";
import path from "path";

export const csvLoad = (
  nameFile: string,
  separator: string
): Promise<any[]> => {
  const uploadPath = path.join(__dirname, "../data/", `${nameFile}.csv`);
  const csvLines: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(uploadPath)
      .on("error", (err: any) => {
        console.error(`Error while read CSV File`, err);
        reject(err);
      })
      .pipe(csv())
      .on("data", (row: any) => {
        if (Object.values(row).length <= 0) {
          console.error(`Line empty`, row);
        } else {
          const data = Object.values(row)[0] as any;
          const cleanQuotes = data.replace(/"/g, "");
          const convertInArray = cleanQuotes.split(separator);
          csvLines.push({
            id_provider: convertInArray[0],
            reference_id: convertInArray[1],
            security_stock_f: convertInArray[2],
            warehouse: convertInArray[3],
          });
        }
      })
      .on("end", () => {
        console.log(`End CSV file successfully processed`);
        resolve(csvLines);
      });
  });
};
