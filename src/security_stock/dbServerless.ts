import ServerlessManagerMysql from "serverless-manager-mysql";
import { DataBaseProps } from "./DbServerless.interface";
export class DataBase {
  private pool: ServerlessManagerMysql;
  private database: string;
  constructor({ host, database, username, password }: DataBaseProps) {
    this.database = database;
    this.pool = new ServerlessManagerMysql(
      {
        host,
        database,
        user: username,
        password,
        connectionLimit: 1000,
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        timeout: 60 * 60 * 1000,
        waitForConnections: true,
        queueLimit: 10,
      },
      {
        maxKeepAliveConnPerPool: 2,
        maxRetries: 30,
        retryDelay: 10000,
        killZombies: true,
        debug: false,
      }
    );
  }
  get nameDB() {
    return this.database;
  }
  async execQuery(query: string, params?: any): Promise<any> {
    const conn = await this.pool.getConnection();
    try {
      let results = await conn.query(query, params);
      //   console.log(`result DB query: ${JSON.stringify(results)}`);
      conn.destroy();
      results = JSON.parse(JSON.stringify(results[0]));
      return results;
    } catch (error) {
      conn.destroy();
      console.error("execQuery error: ", error);
      throw error;
    }
  }

  async execListOfQuerys(queryList: any): Promise<any[]> {
    const conn = await this.pool.getConnection();
    try {
      const results: any[] = [];
      for (const { query, params } of queryList) {
        //  console.log(`Se ejecuta: ${query}`);
        const result = await conn.query(query, params);
        results.push(JSON.parse(JSON.stringify(result[0])));
      }
      conn.destroy();
      return results;
    } catch (error: any) {
      conn.destroy();
      //  console.error("[execListOfQuerys] Error: ", error);
      throw error;
    }
  }
}
