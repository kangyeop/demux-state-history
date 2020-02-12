import * as dotenv from "dotenv";
import { IOptions } from "./types/types";
dotenv.config({ path: __dirname + "/../.env" });

export const config: IOptions = {
    HASURA_GRAPHQL_HOST: process.env.HASURA_GRAPHQL_HOST || "localhost",
    HASURA_GRAPHQL_PORT: process.env.HASURA_GRAPHQL_PORT || 26060,
    HASURA_GRAPHQL_VERSION: process.env.HASURA_GRAPHQL_VERSION || "v1",
    HASURA_GRAPHQL_ADMIN_SECRET:
        process.env.HASURA_GRAPHQL_ADMIN_SECRET || "1234",
    HASURA_GRAPHQL_ENDPOINT: "",
    GRAPHQL_ROUTE: process.env.GRAPHQL_ROUTE || "graphql",
    LEDGIS_ENDPOINT: process.env.LEDGIS_ENDPOINT || "localhost",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 5432,
    DB_DATABASE: process.env.DB_DATABASE || "postgres",
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWD: process.env.DB_PASSWD || "1234",
    DB_SCHEMA: process.env.DB_SCHEMA || "chain"
};

// config.HASURA_GRAPHQL_ENDPOINT = `http://${config.HASURA_GRAPHQL_HOST}:${config.HASURA_GRAPHQL_PORT}/${config.HASURA_GRAPHQL_VERSION}/${config.GRAPHQL_ROUTE}`;
config.HASURA_GRAPHQL_ENDPOINT = "http://localhost:9000/graphql";
// config.HASURA_CONFIG = {
//     uri: config.HASURA_GRAPHQL_ENDPOINT,
//     headers: {
//         "x-hasura-admin-secret": config.HASURA_GRAPHQL_ADMIN_SECRET
//     }
// };
config.HASURA_CONFIG = {
    uri: config.HASURA_GRAPHQL_ENDPOINT
};
