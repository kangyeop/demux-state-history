import gql from "graphql-tag";

export const BUY_PRODUCT = gql`
    mutation buyProduct(
        $buyer_blockchain_account: String!
        $product_uuid: String!
        $pay: String!
        $blockchain_trx_id: String!
    ) {
        BuyProduct(
            buyer_blockchain_account: $buyer_blockchain_account
            product_uuid: $product_uuid
            pay: $pay
            blockchain_trx_id: $blockchain_trx_id
        ) {
            ok
            error
        }
    }
`;

// export const resolvers = {
//     Mutation: {
//         InsertTrxHistory: async (
//             buyer_blockchain_account: string,
//             product_uuid: string,
//             pay: string,
//             blockchain_trx_id: string
//         ): Promise<void> => {
//             const hasura: Hasura = Container.get(Hasura);
//             try {
//                 const response = await hasura.mutate({
//                     mutation: mutationInsertTrxHistory,
//                     variables: {
//                         buyer_blockchain_account,
//                         product_uuid,
//                         pay: pay,
//                         blockchain_trx_id
//                     }
//                 });
//                 return response.data;
//             } catch (error) {
//                 return error;
//             }
//         }
//     }
// };
