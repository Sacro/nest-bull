/** Dependencies **/
import { DynamicModule } from '@nestjs/common'

declare class BullModule {
  static forRoot(config?: any): DynamicModule
}

declare class MailerProvider {
  public createQueues(options: BullModuleOptions[])
}

declare interface BullModuleOptions {
  name?: string
  options?: Bull.QueueOptions
  processors?: BullQueueProcessor[]
}
