import { LoggerService } from "./logger/logger.service";
export interface DataBaseProps {
  host: string;
  database: string;
  username: string;
  password: string;
  logger: LoggerService;
}
