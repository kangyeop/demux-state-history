import { HandlerVersion, Effect, Updater, BlockInfo, StatelessActionCallback } from "demux"
import { DocumentNode, gql } from "apollo-boost"
import { Container } from "typedi"
import Hasura from "../../../Hasura"
import { UserIdReturn } from "../../../types/types"
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../../../.env" });
const contractAccount = process.env.CONTRACT || "hi";

const queryGetUserId: DocumentNode = gql`
    query($creatorId: String!, $buyerId: String!) {
        users(where: { blockchain_account: { _in: [$creatorId, $buyerId] } }) {
            id
        }
    }
`

const mutationInsertTrxHistory: DocumentNode = gql`
    mutation($blockchain_trx_id:String, $buyer_id:Int, $product_id:Int, $seller_id:Int, $pay:bigint) {
        insert_transaction_histories(objects: {blockchain_trx_id: $blockchain_trx_id, buyer_id: $buyer_id, product_id: $product_id, seller_id: $seller_id, pay: $pay})
    }
`

const resolvers = {
    Query:{
        GetUserId: async (creatorId: string, buyerId: string): Promise<UserIdReturn> => {
            const hasura: Hasura = Container.get(Hasura);
            try {
                const {
                    data: { users }
                } = await hasura.query({
                    query: queryGetUserId,
                    variables: { creatorId: creatorId, buyerId: buyerId }
                });
                return {
                    creatorId:users[0],
                    buyerId:users[1]
                }
            } catch(error) {
                return error
            }
        }
    },
    Mutation:{
        InsertTrxHistory: async (blockchain_trx_id:String, buyer_id:string, product_id:number, creator_id:string, pay:bigint): Promise<void> => {
            const hasura: Hasura = Container.get(Hasura);
            console.log( typeof(product_id))
            try {
                const {
                    data: { users }
                } = await hasura.query({
                    query: queryGetUserId,
                    variables: { creatorId: buyer_id, buyerId: creator_id }
                });
                await hasura.mutate({
                    mutation: mutationInsertTrxHistory,
                    variables: { blockchain_trx_id:blockchain_trx_id, buyer_id:buyer_id, product_id:product_id, seller_id:creator_id, pay:pay }
                })
            } catch( error ) {
                console.log( error )
            }

        }
    }
}

const logUpdate = async ( state:any, payload: any, block: BlockInfo, context: any): Promise<void> => {
    try{
        const data = payload.data
        if( payload.receiver === contractAccount ){
            if( data.memo.includes(":") ){
                const params = data.memo.split(":")
                if( params[0] === "buycad" ){
                    const trxId = payload.transactionId
                    const payment = data.quantity.split(" ")[0].split(".")[0]
                    const productId = Number(params[2])
                    const historyId = await resolvers.Mutation.InsertTrxHistory(trxId, params[1], productId, data.from, payment)
                }
            }
        }
    } catch (error){
        console.log(error)
    }

};

const updaters: Updater[] = [
    {
        actionType:"led.token::transfer",
        apply:logUpdate
    }
]

const effects:Effect[] = [];
  
  
const handlerVersion: HandlerVersion = {
    versionName: "v1",
    updaters,
    effects
}

export {handlerVersion}