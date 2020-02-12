import { HandlerVersion, Effect, Updater, BlockInfo } from "demux";
import * as dotenv from "dotenv";
import { resolvers } from "./InsertTrxHistory.resolvers";
dotenv.config({ path: __dirname + "/../../../../.env" });
const contractAccount = process.env.CONTRACT;

const logUpdate = async (
    state: any,
    payload: any,
    block: BlockInfo,
    context: any
): Promise<void> => {
    try {
        const data = payload.data;
        if (payload.receiver === contractAccount) {
            if (data.memo.includes(":")) {
                const params = data.memo.split(":");
                if (params[0] === "buycad") {
                    const blockchain_trx_id = payload.transactionId;
                    let pay = data.quantity.split(" ")[0].split(".")[0];
                    pay += data.quantity.split(" ")[0].split(".")[1];
                    const product_uuid = params[1];
                    const buyer_blockchain_account = data.from;
                    const response = await resolvers.Mutation.InsertTrxHistory(
                        blockchain_trx_id,
                        pay,
                        product_uuid,
                        buyer_blockchain_account
                    );
                    console.log(response);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const updaters: Updater[] = [
    {
        actionType: "led.token::transfer",
        apply: logUpdate
    }
];

const effects: Effect[] = [];

const handlerVersion: HandlerVersion = {
    versionName: "v1",
    updaters,
    effects
};

export { handlerVersion };
