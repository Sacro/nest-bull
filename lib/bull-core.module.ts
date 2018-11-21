import { DynamicModule, Global, Module, Provider, Logger, Inject } from '@nestjs/common'
import { CustomValue } from '@nestjs/core/injector/module'

import { BullModuleAsyncOptions, BullModuleOptions, BullOptionsFactory } from './bull.interfaces'
import { createQueues, getQueueToken } from './bull.utils'
import { BULL_MODULE_OPTIONS } from './bull.constants'
import { Queue } from 'bull'

@Global()
@Module({})
export class BullCoreModule {
  // constructor(
  //   @Inject(BULL_MODULE_OPTIONS)
  //   private readonly options: BullModuleOptions
  // ) {}

  static forRoot(options: BullModuleOptions = {}): DynamicModule {
    return {
      module: BullCoreModule,
    }
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    // const bullProvider = {
    //   provide: getQueueToken(options.name),
    //   useFactory: async (options: BullModuleOptions) => {
    //     return createQueues([options])
    //   },
    //   inject: [BULL_MODULE_OPTIONS],
    // }
    const asyncProviders = this.createAsyncProviders(options)

    return {
      module: BullCoreModule,
      imports: options.imports,
      providers: [...asyncProviders],
      exports: [],
    }
  }

  private static createAsyncProviders(options: BullModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useValue: options.useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: BullModuleAsyncOptions): Provider {
    console.log(options)
    if (options.useFactory) {
      return {
        provide: 'BULL_MODULE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }
    return {
      provide: 'BULL_MODULE_OPTIONS',
      useFactory: async (optionsFactory: BullOptionsFactory) => optionsFactory.createBullOptions(),
      inject: [options.useExisting || options.useClass],
    }
  }
}
