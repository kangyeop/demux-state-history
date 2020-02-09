import { HandlerVersion, Effect, Updater, BlockInfo, StatelessActionCallback } from "demux"
import { DocumentNode, gql } from "apollo-boost"
import { Container } from "typedi"
import Hasura from "../../../Hasura"

const queryGetUserId: DocumentNode = gql`
    query($blockchainAcount: String!) {
        users(where: { blockchain_account: { _eq: $blockchainAcount } }) {
            id
        }
    }
`

const mutationInsertTrxHistory: DocumentNode = gql`
    mutation($blockchain_trx_id:String, $buyer_id:Int, $product_id:Int, $seller_id:Int, $pay:bigint) {
        insert_transaction_histories(objects: {blockchain_trx_id: $blockchain_trx_id, buyer_id: $buyer_id, product_id: $product_id, seller_id: $seller_id, pay: $pay}) {
            returning {
                id
            }
        }
    }
`

const resolvers = {
    Query:{
        GetUserId: async (blockchain_account: string): Promise<number> => {
            const hasura: Hasura = Container.get(Hasura);
            try {
                const {
                    data: { users }
                } = await hasura.query({
                    query: queryGetUserId,
                    variables: { blockchainAcount: blockchain_account }
                });
                return users[0].id
            } catch(error) {
                return error
            }
        }
    },
    Mutation:{
        InsertTrxHistory: async (blockchain_trx_id:String, buyer_id:number, product_id:number, seller_id:number, pay:bigint): Promise<void> => {
            const hasura: Hasura = Container.get(Hasura);
            console.log( typeof(product_id))
            try {
                const { data } = await hasura.mutate({
                    mutation: mutationInsertTrxHistory,
                    variables: { blockchain_trx_id:blockchain_trx_id, buyer_id:buyer_id, product_id:product_id, seller_id:seller_id, pay:pay }
                })
                console.log(data)
            } catch( error ) {
                console.log( error )
            }

        }
    }
}

const logUpdate = async ( state:any, payload: any, block: BlockInfo, context: any): Promise<void> => {
    try{
        const data = payload.data
        if( payload.receiver === "idndtestest1" ){
            if( data.memo.includes(":") ){
                const params = data.memo.split(":")
                if( params[0] === "buycad" ){
                    const trxId = payload.transactionId
                    const payment = data.quantity.split(" ")[0].split(".")[0]
                    const productId = Number(params[2])
                    const creatorId = Number(await resolvers.Query.GetUserId(params[1]))
                    const buyerId = Number(await resolvers.Query.GetUserId(data.from))
                    const historyId = await resolvers.Mutation.InsertTrxHistory(trxId, buyerId, productId, creatorId, payment)
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