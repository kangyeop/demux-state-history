import { AbstractActionHandler, HandlerVersion, IndexState, NextBlock } from "demux";

// Initial state
let state = {
  trxNum: 0,
  indexState: {
      blockNumber: 0,
      lastIrreversibleBlockNumber:0,
      blockHash: "",
      isReplay: false,
      handlerVersionName: "v1"
  }
};

export default class ObjectActionHandler extends AbstractActionHandler {
  constructor(handlerVersions: HandlerVersion[]) {
    super(handlerVersions);
  }

  public async handleWithState(handle: (state: any, context?: any) => void) {
      const ACTION_LOG: boolean =
          (process.env.ACTION_LOG || "true") === "true" ? true : false;

      await handle(state, ACTION_LOG);

      console.log(` blockNum:   ${state.indexState.blockNumber}
                    trxNum:     ${state.trxNum}`);
  }

  protected async updateIndexState(state: any, nextBlock: NextBlock, isReplay: boolean, handlerVersionName: string, context?: any): Promise<void> {
      state.indexState.blockNumber = nextBlock.block.blockInfo.blockNumber;
      state.indexState.blockHash = nextBlock.block.blockInfo.blockHash;
      state.indexState.isReplay = isReplay;
      state.indexState.handlerVersionName = handlerVersionName;

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
      // const latestBlockNumber = state.blockNumber;
      // const toDelete = [...Array(latestBlockNumber - blockNumber).keys()].map(
      //     n => n + blockNumber + 1
      // );
      // for (const n of toDelete) {
      //     delete stateHistory[n];
      // }
      // state = stateHistory[blockNumber];
  }

  public async setup() {}
}