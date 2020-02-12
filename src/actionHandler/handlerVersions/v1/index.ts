import { HandlerVersion, Effect, Updater, BlockInfo } from "demux";
import * as dotenv from "dotenv";
import { BUY_PRODUCT } from "./buyProduct.queries";
import { Container } from "typedi";
import Hasura from "../../../Hasura";
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
        const hasura = Container.get(Hasura);
        if (payload.receiver === contractAccount) {
            if (data.memo.includes(":")) {
                const params = data.memo.split(":");
                if (params[0] === "buycad") {
                    const blockchain_trx_id = payload.transactionId;
                    let pay = data.quantity.split(" ")[0].split(".")[0];
                    pay += data.quantity.split(" ")[0].split(".")[1];
                    const product_uuid = params[1];
                    const buyer_blockchain_account = data.from;
                    const response = await hasura.mutate({
                        mutation: BUY_PRODUCT,
                        variables: {
                            buyer_blockchain_account,
                            product_uuid,
                            pay,
                            blockchain_trx_id
                        }
                    });
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
