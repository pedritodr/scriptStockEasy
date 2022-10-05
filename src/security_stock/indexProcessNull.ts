import { csvLoad } from "./csvLoad";
import { processItems } from "./processNull";

(async () => {
  const request = {
    context: {
      rdsEasy: {
        database: process.env.DATABASE,
        host: process.env.HOST_STAGING,
        password: process.env.PASSWORD_STAGING,
        username: process.env.USERNAME,
      },
    },
  };

  const data = await csvLoad("Modificaciones_SS-30.09.22", ";");
  console.time("process-null");
  const response = await processItems(data, request);
  console.log(JSON.stringify(response));
  console.timeEnd("process-null");
})();
