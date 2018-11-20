import * as Bull from 'bull'
import { Queue } from 'bull'
import { BullModuleOptions } from './bull.interfaces'
import { BullQueueProcessor, isAdvancedProcessor } from './bull.types'
import { getQueueToken } from './bull.utils'
import { Injectable, Inject } from '@nestjs/common'
import { isArray } from 'util'

@Injectable()
export class BullProvider {
  queues: { provide: string; useFactory: () => Queue }[]

  constructor(
    @Inject('BULL_MODULE_OPTIONS')
    private readonly options: BullModuleOptions | BullModuleOptions
  ) {
    if (isArray(options)) {
      this.createQueues(options)
    } else {
      this.createQueues([options])
    }
  }

  private createQueues(options: BullModuleOptions[]) {
    this.queues = options.map((option: BullModuleOptions) => ({
      provide: getQueueToken(option.name),
      useFactory: (): Queue => {
        const queue: Queue = new Bull(option.name ? option.name : 'default', option.options)
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
        return queue
      },
    }))
  }
}
