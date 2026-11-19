import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { PurgeActivity } from '@gitroom/orchestrator/activities/purge.activity';

const { purgeDeletedData } = proxyActivities<PurgeActivity>({
  startToCloseTimeout: '30 minute',
  taskQueue: 'main',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: '5 minutes',
  },
});

// Started with RUN_CRON (infinite.workflow.register.ts). Once a day, erases
// what was deleted more than 90 days ago (see DataPurgeService).
export async function purgeDeletedWorkflow() {
  for (let day = 0; day < 30; day++) {
    await purgeDeletedData();
    await sleep('1 day');
  }
  // keeps the history small
  return await continueAsNew<typeof purgeDeletedWorkflow>();
}
