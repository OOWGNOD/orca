import { GitAdmissionScheduler } from './git-admission-scheduler'
import type { GitAdmissionGrant, GitAdmissionRequest } from './git-admission-state'
import { resolveGitAdmissionTier } from './git-operation-executor'

export { GitAdmissionScheduler } from './git-admission-scheduler'
export type {
  GitAdmissionEvent,
  GitAdmissionGrant,
  GitAdmissionRequest
} from './git-admission-state'
export {
  GENERAL_CAP,
  GENERAL_HEADROOM,
  GIT_ADMISSION_AGING_MS,
  MAX_GIT_CHILDREN,
  NETWORK_CAP,
  NETWORK_HEADROOM,
  ROUTE_CAP,
  ROUTE_HEADROOM
} from './git-admission-state'

let scheduler = new GitAdmissionScheduler()

export async function acquireGitAdmission(
  request: GitAdmissionRequest
): Promise<GitAdmissionGrant> {
  if (process.env.ORCA_GIT_ADMISSION_DISABLED === '1') {
    return { queueWaitMs: 0, release: () => {} }
  }
  return scheduler.acquire({ ...request, tier: resolveGitAdmissionTier(request.tier) })
}

export function _resetGitAdmissionForTests(replacement = new GitAdmissionScheduler()): void {
  scheduler = replacement
}

export function _gitAdmissionSnapshotForTests(): ReturnType<GitAdmissionScheduler['snapshot']> {
  return scheduler.snapshot()
}
