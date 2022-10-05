import csv from "csv-parser";
import fs from "fs";
import path from "path";

export const loadData = (nameFile: string): Promise<any[]> => {
  const uploadPath = path.join(__dirname, "../data/", `${nameFile}.dat`);
  const csvLines: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(uploadPath)
      .on("error", (err: any) => {
        console.error(`Error while read DAT File`, err);
        reject(err);
      })
      .pipe(csv())
      .on("data", (row: any) => {
        if (Object.values(row).length <= 0) {
          console.error(`Line empty`, row);
        } else {
          const data = Object.values(row)[0] as any;
          const cleanQuotes = data.replace(/"/g, "");
          csvLines.push(cleanQuotes);
        }
      })
      .on("end", () => {
        console.log(`End CSV file successfully processed`);
        resolve(csvLines);
      });
  });
};
