import { createGitOperationExecutor } from './command-runner/git-operation-executor'

export const worktreeCreateGit = createGitOperationExecutor({
  admissionTier: 'interactive'
})

export const worktreePreparationGit = createGitOperationExecutor({
  admissionTier: 'background'
})
