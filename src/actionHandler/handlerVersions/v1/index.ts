import { HandlerVersion, Effect, Updater, BlockInfo } from "demux";
import * as dotenv from "dotenv";
import { logger } from "../../../utils";
import { DEMUX_SET_DONATE } from "./demuxSetDonate";
import Server from "../../../server";
import { Container } from "typedi";
dotenv.config({ path: __dirname + "/../../../../.env" });
const contractAccount = process.env.CONTRACT;
const actionContract = process.env.ACTION_CONTRACT;

interface donatePharm {
    owner: string;
    donateTitle: string;
    donateUid: string;
}

const numHex = (s: number) => {
    let a = s.toString(16);
    if (a.length % 2 > 0) {
        a = "0" + a;
    }
    return a;
};

const strHex = (s: string) => {
    let a = "";
    for (let i = 0; i < s.length; i++) {
        a = a + numHex(s.charCodeAt(i));
    }
    return a;
};

const setDonate = async (
    state: any,
    payload: any,
    block: BlockInfo,
    context: any
): Promise<void> => {
    try {
        if (payload.receiver === contractAccount) {
            const data: donatePharm = payload.data;
            const server = Container.get(Server);
            const uid = BigInt(data.donateUid).toString(16);
            await server.mutate({
                mutation: DEMUX_SET_DONATE,
                variables: { donateUid: uid }
            });
        }
    } catch (error) {
        throw Error(error);
    }
};

// const donate = async (
//     state: any,
//     payload: any,
//     block: BlockInfo,
//     context: any
// ): Promise<void> => {
//     try {
//         if (payload.receiver === contractAccount) {
//             const data: donatePharm = payload.data;
//             console.log("owner: ", data.owner);
//             console.log("donateId: ", data.donateId);
//             console.log("point: ", data.point);
//             console.log("memo: ", data.memo);
//         }
//     } catch (error) {
//         throw Error(error);
//     }
// };

// const chargePoint = async (
//     state: any,
//     payload: any,
//     block: BlockInfo,
//     context: any
// ): Promise<void> => {
//     try {
//         if (payload.receiver === contractAccount) {
//             const data = payload.data;
//         }
//     } catch (error) {
//         throw Error(error);
//     }
// };

const updaters: Updater[] = [
    {
        actionType: `${actionContract}::setdonate`,
        apply: setDonate
    }
    // {
    //     actionType: `${actionContract}::donate`,
    //     apply: donate
    // },
    // {
    //     actionType: `${actionContract}::chargepoint`,
    //     apply: chargePoint
    // }
];

const donateLog = async (
    payload: any,
    blockInfo: BlockInfo,
    context: any
): Promise<void> => {
    try {
        if (payload.receiver === contractAccount) {
            logger.info("donate :", blockInfo);
        }
    } catch (error) {
        throw Error(error);
    }
};

const effects: Effect[] = [
    {
        actionType: `${actionContract}::donate`,
        run: donateLog
    }
];

const handlerVersion: HandlerVersion = {
    versionName: "v1",
    updaters,
    effects
};

export { handlerVersion };
