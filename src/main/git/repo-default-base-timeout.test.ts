import { beforeEach, describe, expect, it, vi } from 'vitest'

const { gitExecFileAsyncMock } = vi.hoisted(() => ({
  gitExecFileAsyncMock: vi.fn()
}))

vi.mock('./runner', () => ({
  gitExecFileAsync: gitExecFileAsyncMock,
  gitExecFileSync: vi.fn()
}))

import { GitCommandTimeoutError } from './command-runner/git-command-timeout'
import { getBaseRefDefault } from './repo'

describe('getBaseRefDefault async subprocess bounds', () => {
  beforeEach(() => {
    gitExecFileAsyncMock.mockReset()
  })

  it('bounds every local probe and degrades a timeout to no default', async () => {
    gitExecFileAsyncMock.mockRejectedValue(new Error('git timed out.'))

    await expect(getBaseRefDefault('/repo')).resolves.toBeNull()

    expect(gitExecFileAsyncMock).toHaveBeenCalled()
    for (const [, options] of gitExecFileAsyncMock.mock.calls) {
      expect(options).toEqual({ cwd: '/repo', timeout: 15_000 })
    }
  })

  // A timed-out probe is not evidence that a ref is missing.
  it('fails rather than reporting no default when a probe times out', async () => {
    gitExecFileAsyncMock.mockRejectedValue(new GitCommandTimeoutError(15_000))

    await expect(getBaseRefDefault('/repo')).rejects.toMatchObject({
      name: 'GitCommandTimeoutError',
      timeoutMs: 15_000
    })
  })

  it('preserves the same timeout when routing probes through WSL', async () => {
    gitExecFileAsyncMock.mockRejectedValue(new Error('git timed out.'))

    await expect(
      getBaseRefDefault('\\\\wsl.localhost\\Ubuntu\\repo', { wslDistro: 'Ubuntu' })
    ).resolves.toBeNull()

    expect(gitExecFileAsyncMock).toHaveBeenCalled()
    for (const [, options] of gitExecFileAsyncMock.mock.calls) {
      expect(options).toEqual({
        cwd: '\\\\wsl.localhost\\Ubuntu\\repo',
        timeout: 15_000,
        wslDistro: 'Ubuntu'
      })
    }
  })
})
