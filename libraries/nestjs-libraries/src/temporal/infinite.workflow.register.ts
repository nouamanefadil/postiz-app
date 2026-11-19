import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';

@Injectable()
export class InfiniteWorkflowRegister implements OnModuleInit {
  constructor(private _temporalService: TemporalService) {}

  async onModuleInit(): Promise<void> {
    if (!!process.env.RUN_CRON) {
      // a workflow that is already running makes start() throw, which is fine
      for (const [name, workflowId] of [
        ['missingPostWorkflow', 'missing-post-workflow'],
        ['purgeDeletedWorkflow', 'purge-deleted-workflow'],
      ]) {
        try {
          await this._temporalService.client
            ?.getRawClient()
            ?.workflow?.start(name, { workflowId, taskQueue: 'main' });
        } catch (err) {}
      }
    }
  }
}

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [InfiniteWorkflowRegister],
  get exports() {
    return this.providers;
  },
})
export class InfiniteWorkflowRegisterModule {}
