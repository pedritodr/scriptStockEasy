import dotenv from "dotenv";
import { csvLoad } from "./csvLoad";
import { processItems } from "./process";
(async () => {
  dotenv.config();
  const request = {
    context: {
      rdsEasy: {
        database: process.env.DATABASE,
        host: process.env.HOST_STAGING,
        password: process.env.PASSWORD_STAGING,
        username: process.env.USER_DB,
      },
    },
  };
  const data = await csvLoad("Publicarsinimportaratributo", ";");
  console.time("process");
  const response = await processItems(data, request);
  console.log(JSON.stringify(response));
  console.timeEnd("process");
})();
