import { ActionReaderOptions } from 'demux'

export interface StateHistoryPostgresActionReaderOptions extends ActionReaderOptions {
  massiveConfig: any
  ledEndpoint:string
  dbSchema?: string
  enablePgMonitor?: boolean
}
