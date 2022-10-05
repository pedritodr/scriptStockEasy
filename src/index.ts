import { dataMock } from "./data";
import { PutRequest } from "./dynamoDB/ddbClient";

(async () => {
  const response = await PutRequest(dataMock);
  console.log(response);
})();
