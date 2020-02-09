import { AbstractActionReader, Block, NotInitializedError } from 'demux'
import massive from 'massive'
import pgMonitor from 'pg-monitor'
import { StateHistoryPostgresActionReaderOptions } from './interfaces'
import { StateHistoryPostgresBlock } from './StateHistoryPostgresBlock'

export class StateHistoryPostgresActionReader extends AbstractActionReader {
  private db: any
  private massiveInstance: massive.Database | null = null
  private massiveConfig: any
  private dbSchema: string
  private enablePgMonitor: boolean
  private ledEndpoint: string

  constructor(options: StateHistoryPostgresActionReaderOptions) {
    super(options)
    this.massiveConfig = options.massiveConfig
    this.dbSchema = options.dbSchema ? options.dbSchema : 'chain'
    this.enablePgMonitor = !!options.enablePgMonitor
    this.ledEndpoint = options.ledEndpoint
  }

  public async getHeadBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.head)
  }

  public async getLastIrreversibleBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.irreversible)
  }

  public async getBlock(blockNumber: number): Promise<Block> {
    const pgBlockInfo = await this.db.block_info.findOne({
      block_num: blockNumber,
    })

    // Uses ${<var-name>} for JS substitutions and $<number> for massivejs substitutions.
    const actionTracesQuery = `
      SELECT at.act_account,
             at.act_name,
             at.act_data,
             at.transaction_id,
             at.action_ordinal,
             at.creator_action_ordinal,
             at.receipt_global_sequence,
             at.context_free,
             at.receipt_receiver,
             at.block_num,
             array_agg( '[' || at_authorization.actor || ',' || at_authorization.permission || ']') as authorizations,
             bi.producer
      FROM ${this.dbSchema}.action_trace AS at,
           ${this.dbSchema}.action_trace_authorization AS at_authorization,
           ${this.dbSchema}.block_info as bi
      WHERE at.receipt_present = true AND
            at.block_num = $1 AND
            at.transaction_id = at_authorization.transaction_id AND
            bi.block_num = at.block_num
      GROUP BY at.act_account,
               at.act_name,
               at.act_data,
               at.transaction_id,
               at.action_ordinal,
               at.creator_action_ordinal,
               at.receipt_global_sequence,
               at.context_free,
               at.receipt_receiver,
               at.block_num,
               bi.producer
      ORDER BY at.receipt_global_sequence
    `
    const contextFreeDataQuery = `
      SELECT tt.partial_context_free_data, tt.id
      FROM ${this.dbSchema}.transaction_trace as tt
      WHERE tt.block_num = $1
    `
    if (!this.massiveInstance) {
      throw new NotInitializedError('Massive was not initialized.')
    }

    const pgActionTraceAuthorizationsPromise = this.massiveInstance.query(actionTracesQuery, [blockNumber])
    const pgContextFreeDataPromise = this.massiveInstance.query(contextFreeDataQuery, [blockNumber])
    const [pgActionTraceAuthorizations, pgContextFreeData] = await Promise.all(
      [pgActionTraceAuthorizationsPromise, pgContextFreeDataPromise]
    )

    const block = new StateHistoryPostgresBlock(
      pgBlockInfo,
      this.ledEndpoint,
      pgActionTraceAuthorizations,
      pgContextFreeData,
      this.massiveInstance,
      this.dbSchema,
      this.log
    )
    await block.parseActions()
    return {
      blockInfo: block.blockInfo,
      actions: block.actions,
    }
  }

  protected async setup(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      this.massiveInstance = await massive(this.massiveConfig)
      if (this.enablePgMonitor) {
        await pgMonitor.attach(this.massiveInstance.driverConfig)
      }
      this.db = this.massiveInstance[this.dbSchema]
      await this.addDbIndex('action_trace', 'transaction_id', 'transaction_id_idx1')
      await this.addDbIndex('action_trace_authorization', 'transaction_id', 'transaction_id_idx2')
    } catch (err) {
      throw new NotInitializedError('', err)
    }
  }

  protected async addDbIndex(tableName: string, columnName: string, indexName: string = `${columnName}_idx`) {
    if (this.massiveInstance) {
      await this.massiveInstance.query(`
        CREATE INDEX IF NOT EXISTS ${indexName} ON ${this.dbSchema}.${tableName} (${columnName})
      `)
    } else {
      throw Error('this.massiveInstance should already be set.')
    }
  }
}
