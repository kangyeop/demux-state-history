import ApolloClient, { PresetConfig } from "apollo-boost"
import { Service, Inject } from "typedi"
import "reflect-metadata";

@Service()
export default class Hasura extends ApolloClient<any> {
    constructor(
        @Inject("HASURA_CONFIG") private readonly presetConfig: PresetConfig
    ) {
        super(presetConfig);
    }
}