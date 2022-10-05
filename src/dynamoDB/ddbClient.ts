import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Sqs } from "../Sqs";
import momentTimeZone from "moment-timezone";
import { EcommerceToVtexOutputInterface } from "../interfaces";

const dynamodb = new DynamoDBClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

export const PutRequest = async (
  toVtex: EcommerceToVtexOutputInterface
): Promise<any> => {
  const { endpoint, headers, method, params, data, data_easy } = toVtex.toVtex;
  const now = momentTimeZone
    .tz("America/Santiago")
    .format("YYYY-MM-DD HH:mm:ss");
  const clave = `${data_easy.stockId}-${data_easy.accountName}${
    data_easy.stock > 0 ? "" : `-zero`
  }`;
  const paramsDB: any = {
    TableName: "object-curl-vtex",
    Key: {
      id: { S: clave },
    },
    UpdateExpression: "set curl = :c, updated = :t, sent = :p",
    ExpressionAttributeValues: {
      ":c": {
        M: {
          endpoint: { S: endpoint },
          method: { S: method },
          headers: {
            M: {
              dynamic: {
                L: [
                  {
                    M: {
                      "x-vtex-api-appkey": {
                        S: `${headers.dynamic[0]["x-vtex-api-appkey"]}`,
                      },
                    },
                  },
                  {
                    M: {
                      "x-vtex-api-apptoken": {
                        S: `${headers.dynamic[1]["x-vtex-api-apptoken"]}`,
                      },
                    },
                  },
                ],
              },
              static: {
                L: [
                  {
                    M: {
                      "Content-Type": {
                        S: `${headers.static[0]["Content-Type"]}`,
                      },
                    },
                  },
                ],
              },
            },
          },
          params: {
            M: {
              flag: { S: params.flag },
              ecommerce_clients: {
                M: {
                  id: { S: params.ecommerce_clients.id },
                  level: { S: params.ecommerce_clients.level },
                },
              },
            },
          },
          data: {
            M: {
              unlimitedQuantity: { BOOL: data.unlimitedQuantity },
              quantity: { N: `${data.quantity}` },
            },
          },
          data_easy: {
            M: {
              accountName: { S: data_easy.accountName },
              warehouseId: { S: data_easy.warehouseId },
              stock: { N: `${data_easy.stock}` },
              sku: { S: data_easy.sku },
              stockId: { S: data_easy.stockId },
              updateResult: { N: `${data_easy.updateResult}` },
              primaryAccount: { N: `${data_easy.primaryAccount}` },
            },
          },
        },
      },
      ":t": { S: now },
      ":p": { BOOL: false },
    },
  };
  const sqs = new Sqs(
    "https://sqs.us-east-1.amazonaws.com/419590920608/Queue-vtex"
  );
  try {
    const responseDynamoDb = await dynamodb.send(
      new UpdateItemCommand(paramsDB)
    );
    const responseSqs = await sqs.addNotification(clave, now);
    console.log(
      `Success - item added or updated ${JSON.stringify(responseDynamoDb)}`
    );
    console.log(`Success - message add correct ${JSON.stringify(responseSqs)}`);
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};
