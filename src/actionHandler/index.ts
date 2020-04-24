import { IndexState } from "demux";
import { AbstractActionHandler, HandlerVersion, NextBlock } from "demux";

// Initial state
let state = {
    trxNum: 0,
    indexState: {
        blockNumber: 0,
        lastIrreversibleBlockNumber: 0,
        blockHash: "",
        isReplay: false,
        handlerVersionName: "v1"
    }
};

export default class ObjectActionHandler extends AbstractActionHandler {
    constructor(handlerVersions: HandlerVersion[]) {
        super(handlerVersions);
    }

    public isInitialized: boolean = false;

    private hashHistory: { [key: number]: string } = { 0: "" };

    public async handleBlock(
        nextBlock: NextBlock,
        isReplay: boolean
    ): Promise<number | null> {
        const { blockNumber, blockHash } = nextBlock.block.blockInfo;
        this.hashHistory[blockNumber] = blockHash;
        return super.handleBlock(nextBlock, isReplay);
    }

    public async handleWithState(handle: (state: any, context?: any) => void) {
        const ACTION_LOG: boolean =
            (process.env.ACTION_LOG || "true") === "true" ? true : false;

        await handle(state, ACTION_LOG);
        // console.log(state);

        if (state.indexState.blockNumber % 2) {
            console.log(`
        blockNum:   ${state.indexState.blockNumber}
        trxNum:     ${state.trxNum}`);
        }
    }

    protected async updateIndexState(
        state: any,
        nextBlock: NextBlock,
        isReplay: boolean,
        handlerVersionName: string,
        context?: any
    ): Promise<void> {
        state.indexState.blockNumber = nextBlock.block.blockInfo.blockNumber;
        state.indexState.blockHash = nextBlock.block.blockInfo.blockHash;
        state.indexState.isReplay = isReplay;
        state.indexState.handlerVersionName = handlerVersionName;
        state.indexState.lastIrreversibleBlockNumber =
            nextBlock.lastIrreversibleBlockNumber;

        const { actions } = nextBlock.block;
        const trx: Set<string> = new Set<string>();
        for (let i = 0; i < actions.length; i++) {
            const { payload } = actions[i];
            trx.add(payload.transactionId);
        }
        state.trxNum = trx.size;
    }

    async loadIndexState(): Promise<IndexState> {
        return state.indexState;
    }

    async rollbackTo(blockNumber: number) {
        console.log(blockNumber);
        this.setLastProcessedBlockNumber(blockNumber);
        this.setLastProcessedBlockHash(this.hashHistory[blockNumber]);
        state.indexState.blockHash = this.hashHistory[blockNumber];
    }

    public setLastProcessedBlockHash(hash: string) {
        this.lastProcessedBlockHash = hash;
        state.indexState.blockHash = hash;
    }

    public setLastProcessedBlockNumber(num: number) {
        this.lastProcessedBlockNumber = num;
        state.indexState.blockNumber = num;
    }

    public async setup() {}
}
