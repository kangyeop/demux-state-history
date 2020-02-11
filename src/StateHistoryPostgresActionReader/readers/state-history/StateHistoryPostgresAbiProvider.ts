import * as Logger from "bunyan";
import { ApiInterfaces, JsonRpc } from "eosjs";
import { Database } from "massive";
import "cross-fetch/polyfill";

export class StateHistoryPostgresAbiProvider
    implements ApiInterfaces.AbiProvider {
    private blockNumber: number = 0;
    private massiveInstance: any = {};
    private dbSchema: string = "chain";
    private log: Logger = Logger.createLogger({
        name: "state-history-abi-provider"
    });
    private rpc: JsonRpc;

    constructor(ledEndpoint: string) {
        this.rpc = new JsonRpc(ledEndpoint);
    }
    public setState(
        blockNumber: number,
        massiveInstance?: Database,
        dbSchema?: string,
        log?: Logger
    ) {
        this.blockNumber = blockNumber;
        if (massiveInstance) {
            this.massiveInstance = massiveInstance;
        }
        if (dbSchema) {
            this.dbSchema = dbSchema;
        }
        if (log) {
            this.log = log;
        }
    }

    public async getRawAbi(
        accountName: string
    ): Promise<ApiInterfaces.BinaryAbi> {
        const getStart = Date.now();
        this.log.debug(`Getting ABI for account '${accountName}'...`);
        const db = this.massiveInstance[this.dbSchema];
        let accountRow = await db.account.findOne(
            {
                name: accountName,
                "block_num <=": this.blockNumber
            },
            {
                order: [
                    {
                        field: "block_num",
                        direction: "desc"
                    }
                ]
            }
        );
        if (accountRow == null) {
            accountRow = await this.rpc.getRawAbi(accountName);
        }
        const getTime = Date.now() - getStart;
        this.log.debug(`Got ABI for account '${accountName}' (${getTime}ms)`);
        return {
            accountName: accountRow.name,
            abi: accountRow.abi
        };
    }
}
