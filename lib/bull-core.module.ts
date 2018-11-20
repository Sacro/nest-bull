import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { CustomValue } from '@nestjs/core/injector/module'

import { BullModuleAsyncOptions, BullModuleOptions, BullOptionsFactory } from './bull.interfaces'
import { BullProvider } from './bull.providers'
import { ConfigRead } from './bull.utils'

@Global()
@Module({})
export class BullCoreModule {
  static forRoot(options: BullModuleOptions): DynamicModule {
    options = ConfigRead(options)

    const BullOptions: CustomValue = {
      name: 'BULL_MODULE_OPTIONS',
      provide: 'BULL_MODULE_OPTIONS',
      useValue: {
        name: options.name,
        options: options.options,
        processors: options.processors,
      } as BullModuleOptions,
    }

    return {
      module: BullCoreModule,
      components: [BullProvider, BullOptions],
      exports: [BullProvider],
    }
  }

  static forRootAsync(options: BullModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options)

    return {
      module: BullCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, BullProvider],
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
        useClass: options.useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: BullModuleAsyncOptions): Provider {
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
