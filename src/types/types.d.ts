import { IndexState, ActionReaderOptions } from "demux";
import { PresetConfig } from "apollo-boost";

export interface transferState {
    from: string;
    to: string;
    amount: number;
    symbol: string;
    memo: string;
    trxId: string;
    indexState: IndexState;
}
export interface StateHistoryPostgresActionReaderOptions
    extends ActionReaderOptions {
    massiveConfig: any;
    ledEndpoint: string;
    dbSchema?: string;
    enablePgMonitor?: boolean;
}
export interface StateHistoryWsActionReaderOptions extends ActionReaderOptions {
    nodeosRPCEndpoint: string;
    nodeosWSEndpoint: string;
}

export interface IOptions {
    HASURA_GRAPHQL_HOST: string;
    HASURA_GRAPHQL_PORT: string | number;
    HASURA_GRAPHQL_VERSION: string;
    HASURA_GRAPHQL_ADMIN_SECRET: string;
    HASURA_GRAPHQL_ENDPOINT: string;
    HASURA_CONFIG?: PresetConfig;
    GRAPHQL_ROUTE: string;
    LEDGIS_ENDPOINT: string;
    DB_HOST: string;
    DB_PORT: string | number;
    DB_DATABASE: string;
    DB_USER: string;
    DB_PASSWD: string;
    DB_SCHEMA: string;
}

export interface UserIdReturn {
    creatorId: number;
    buyerId: number;
}
