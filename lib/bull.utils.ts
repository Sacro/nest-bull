import { Queue } from 'bull'
import * as Bull from 'bull'
import { isArray } from 'util'

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
