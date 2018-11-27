import { Logger } from '@nestjs/common'
import { Queue } from 'bull'
import * as Bull from 'bull'
import * as Redis from 'ioredis'
import { Observable } from 'rxjs'
import { delay, retryWhen, scan } from 'rxjs/operators'
import { isArray } from 'util'
import * as uuid from 'uuid/v4'

import { BullModuleOptions } from './bull.interfaces'
import { BullQueueProcessor, isAdvancedProcessor } from './bull.types'

export function getQueueToken(name?: string): string {
  return name ? `BullQueue_${name}` : 'BullQueue_default'
}

export function createQueues(options: BullModuleOptions[]): any[] {
  return options.map((option: BullModuleOptions) => ({
    provide: getQueueToken(option.name),
    useFactory: (): Queue => {
      const queue: Queue = new Bull(option.name, option.options)
      if (isArray(option.processors)) {
        option.processors.forEach((processor: BullQueueProcessor) => {
          if (isAdvancedProcessor(processor)) {
            const hasName = !!processor.name
            const hasConcurrency = !!processor.concurrency
            hasName && hasConcurrency
              ? queue.process(processor.name, processor.concurrency, processor.callback)
              : hasName
              ? queue.process(processor.name, processor.callback)
              : queue.process(processor.concurrency, processor.callback)
          } else {
            queue.process(processor)
          }
        })
      }
      return queue
    },
  }))
}

/**
 * This function returns a Connection injection token for the given Connection, ConnectionOptions or connection name.
 * @param {Connection | ConnectionOptions | string} [connection='default'] This optional parameter is either
 * a Connection, or a ConnectionOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: Bull.Queue | Bull.QueueOptions | string = 'default'
): string | Function {
  /*return 'default' === connection
    ? Bull
    : 'string' === typeof connection
    ? `${connection}Connection`
    : 'default' === connection.name || !connection.name
    ? Bull
    : `${connection.name}Connection`*/
  return 'default'
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error: Error) => {
            Logger.error(
              `Unable to connect to the database. Retrying (${errorCount + 1})...`,
              error.stack,
              'TypeOrmModule'
            )
            if (errorCount + 1 >= retryAttempts) {
              throw error
            }
            return errorCount + 1
          }, 0),
          delay(retryDelay)
        )
      )
    )
}

export const generateString = () => uuid()
