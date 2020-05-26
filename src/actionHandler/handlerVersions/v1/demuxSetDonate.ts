import gql from "graphql-tag";

export const DEMUX_SET_DONATE = gql`
    mutation demuxSetDonate($donateUid: String!) {
        SetDonateHistory(BUID: $donateUid) {
            ok
            error
        }
    }
`;
