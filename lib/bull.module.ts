import { DynamicModule, Module } from '@nestjs/common'

import { BullCoreModule } from './bull-core.module'
import { BullModuleAsyncOptions, BullModuleOptions } from './bull.interfaces'
import { createQueues } from './bull.utils'

@Module({})
export class BullModule {
  static forRoot(options: BullModuleOptions = {}): DynamicModule {
    return {
      module: BullModule,
      imports: [BullCoreModule.forRoot(options)],
    }
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    return {
      module: BullModule,
      imports: [BullCoreModule.forRootAsync(options)],
    }
  }

  static forFeature(options: BullModuleOptions[]) {
    const providers = createQueues(options)
    return {
      module: BullModule,
      providers,
      exports: providers,
    }
  }
}
