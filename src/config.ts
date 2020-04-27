import * as dotenv from "dotenv";
import { IOptions } from "./types/types";
dotenv.config({ path: __dirname + "/../.env" });

export const config: IOptions = {
    GRAPHQL_ROUTE: process.env.GRAPHQL_ROUTE || "graphql",
    LEDGIS_ENDPOINT: process.env.LEDGIS_ENDPOINT || "localhost",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 5432,
    DB_DATABASE: process.env.DB_DATABASE || "postgres",
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWD: process.env.DB_PASSWD || "1234",
    DB_SCHEMA: process.env.DB_SCHEMA || "chain"
};
