import { BaseActionWatcher, ActionWatcherOptions } from "demux"
import ObjectActionHandler from "./actionHandler"
import { StateHistoryPostgresActionReader } from './StateHistoryPostgresActionReader'
import { StateHistoryPostgresActionReaderOptions, IOptions } from "./types/types";
import { handlerVersion } from "./actionHandler/handlerVersions/v1"
import { Container } from "typedi"
import * as dotenv from "dotenv";
import "reflect-metadata";
dotenv.config({ path: __dirname + "/../.env" });

const config: IOptions = {
    HASURA_GRAPHQL_HOST: process.env.HASURA_GRAPHQL_HOST || "localhost",
    HASURA_GRAPHQL_PORT: process.env.HASURA_GRAPHQL_PORT || 26060,
    HASURA_GRAPHQL_VERSION: process.env.HASURA_GRAPHQL_VERSION || "v1",
    HASURA_GRAPHQL_ADMIN_SECRET:
        process.env.HASURA_GRAPHQL_ADMIN_SECRET || "1234",
    HASURA_GRAPHQL_ENDPOINT: "",
    GRAPHQL_ROUTE:"",
    LEDGIS_ENDPOINT: process.env.LEDGIS_ENDPOINT || "localhost",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 5432,
    DB_DATABASE: process.env.DB_DATABASE || "postgres",
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWD: process.env.DB_PASSWD || "1234",
    DB_SCHEMA: process.env.DB_SCHEMA || "chain"
};

config.HASURA_GRAPHQL_ENDPOINT = `http://${config.HASURA_GRAPHQL_HOST}:${config.HASURA_GRAPHQL_PORT}/${config.HASURA_GRAPHQL_VERSION}${config.GRAPHQL_ROUTE}`;
config.HASURA_CONFIG = {
    uri: config.HASURA_GRAPHQL_ENDPOINT,
    headers: {
        "x-hasura-admin-secret": config.HASURA_GRAPHQL_ADMIN_SECRET
    }
};

const massiveConfig = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_DATABASE,
    user: config.DB_USER,
    password: config.DB_PASSWD
}

Container.set([
    {
        id: "HASURA_CONFIG",
        value: config.HASURA_CONFIG
    }
]);

const actionHandler = new ObjectActionHandler([handlerVersion]);

const actionReaderOpts: StateHistoryPostgresActionReaderOptions = {
    startAtBlock: 15062447,
    onlyIrreversible: false,
    ledEndpoint: config.LEDGIS_ENDPOINT,
    dbSchema: config.DB_SCHEMA,
    massiveConfig,
};

const actionReader = new StateHistoryPostgresActionReader(actionReaderOpts);

const actionWatcherOption: ActionWatcherOptions = {
  pollInterval: 500,
  velocitySampleSize: 500
};

const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, actionWatcherOption);

actionReader.initialize().then(() =>
    actionWatcher.watch()
)
