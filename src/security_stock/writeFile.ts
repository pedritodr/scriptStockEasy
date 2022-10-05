import fs from "fs";

export class FileReportTxt {
  constructor(readonly nameFile: string) {
    this.createFile();
  }
  createFile() {
    fs.writeFile(`${this.nameFile}.csv`, "CREATE REPORT", (error: any) => {
      if (error) throw error;
      console.log("file created correct");
    });
  }

  addLine(line: string) {
    fs.writeFile(`${this.nameFile}.csv`, line, function (err) {
      if (err) throw err;
      console.log("Data is written to file successfully.");
    });
  }
}
