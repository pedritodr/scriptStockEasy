import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class Sqs {
  private sqs: any;
  private queueUrl: string;
  constructor(url: string) {
    this.sqs = new SQSClient({ apiVersion: "2010-03-31", region: "us-east-1" });
    this.queueUrl = url;
  }

  async addNotification(clave: any, timestamp: Date | string) {
    const params: any = {
      MessageBody: JSON.stringify({ clave, timestamp }),
      QueueUrl: this.queueUrl,
    };
    try {
      console.log("SQS: addNotification", {
        Message: JSON.stringify({ clave, timestamp }),
      });
      const data = await this.sqs.send(new SendMessageCommand(params));
      console.log(data);
      return data;
    } catch (error) {
      console.error("SQS.addNotification: ", error);
      throw error;
    }
  }
}
