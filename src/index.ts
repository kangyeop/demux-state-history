import { BaseActionWatcher, ActionWatcherOptions } from "demux";
import ObjectActionHandler from "./actionHandler";
import { StateHistoryPostgresActionReader } from "./StateHistoryPostgresActionReader";
import { StateHistoryPostgresActionReaderOptions } from "./types/types";
import { handlerVersion } from "./actionHandler/handlerVersions/v1";
import { Container } from "typedi";
import { config } from "./config";
import "reflect-metadata";

const massiveConfig = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_DATABASE,
    user: config.DB_USER,
    password: config.DB_PASSWD
};

Container.set([
    {
        id: "HASURA_CONFIG",
        value: config.HASURA_CONFIG
    }
]);

const actionHandler = new ObjectActionHandler([handlerVersion]);

const actionReaderOpts: StateHistoryPostgresActionReaderOptions = {
    startAtBlock: 0,
    onlyIrreversible: false,
    ledEndpoint: config.LEDGIS_ENDPOINT,
    dbSchema: config.DB_SCHEMA,
    massiveConfig
};

const actionReader = new StateHistoryPostgresActionReader(actionReaderOpts);

const actionWatcherOption: ActionWatcherOptions = {
    pollInterval: 500,
    velocitySampleSize: 500
};

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    actionWatcherOption
);

actionReader.initialize().then(() => actionWatcher.watch());
