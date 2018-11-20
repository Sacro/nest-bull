import { DynamicModule, Module } from '@nestjs/common'

import { BullCoreModule } from './bull-core.module'
import { BullModuleAsyncOptions, BullModuleOptions } from './bull.interfaces'

@Module({})
export class BullModule {
  static forRoot(options?: BullModuleOptions): DynamicModule {
    return {
      module: BullModule,
      modules: [BullCoreModule.forRoot(options)],
    }
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    return {
      module: BullModule,
      modules: [BullCoreModule.forRootAsync(options)],
    }
  }
}
