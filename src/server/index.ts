import ApolloClient, { PresetConfig } from "apollo-boost";
import { Service, Inject } from "typedi";
import "reflect-metadata";

@Service()
export default class Server extends ApolloClient<any> {
    constructor(
        @Inject("GRAPHQL_CONFIG") private readonly presetConfig: PresetConfig
    ) {
        super(presetConfig);
    }
}
