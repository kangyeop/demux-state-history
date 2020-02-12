import { DocumentNode, gql } from "apollo-boost";
import { Container } from "typedi";
import Hasura from "../../../Hasura";

const mutationInsertTrxHistory: DocumentNode = gql`
    mutation(
        $blockchain_trx_id: String!
        $pay: String!
        $product_uuid: String!
        $buyer_blockchain_account: String!
    ) {
        BuyProduct(
            blockchain_trx_id: $blockchain_trx_id
            pay: $pay
            product_uuid: $product_uuid
            buyer_blockchain_account: $buyer_blockchain_account
        ) {
            ok
            error
        }
    }
`;

export const resolvers = {
    Mutation: {
        InsertTrxHistory: async (
            blockchain_trx_id: String,
            pay: string,
            product_uuid: string,
            buyer_blockchain_account: string
        ): Promise<void> => {
            const hasura: Hasura = Container.get(Hasura);
            try {
                const response = await hasura.mutate({
                    mutation: mutationInsertTrxHistory,
                    variables: {
                        blockchain_trx_id: blockchain_trx_id,
                        pay: pay,
                        product_uuid: product_uuid,
                        buyer_blockchain_account: buyer_blockchain_account
                    }
                });
                return response.data;
            } catch (error) {
                return error;
            }
        }
    }
};
