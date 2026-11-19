import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { DataPurgeService } from '@gitroom/nestjs-libraries/database/prisma/purge/data.purge.service';

@Injectable()
@Activity()
export class PurgeActivity {
  constructor(private _dataPurgeService: DataPurgeService) {}

  // Erases only when PURGE_DELETED_DATA=true, otherwise a dry run that counts
  // what would be erased. Only counters go through the workflow.
  @ActivityMethod()
  async purgeDeletedData() {
    const result = await this._dataPurgeService.purge(
      process.env.PURGE_DELETED_DATA !== 'true'
    );
    console.log(`Data purge: ${JSON.stringify(result)}`);
    return result;
  }
}
