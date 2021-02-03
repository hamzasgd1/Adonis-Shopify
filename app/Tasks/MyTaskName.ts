import { BaseTask } from 'adonis5-scheduler/build'
import User from 'App/Models/User'

export default class MyTaskName extends BaseTask {
  public static get schedule() {
    return '* * * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async run() {
    // 	this.logger.info('Handled')
    const user = await User.findOrFail(1)
    await user.delete()
  }
}
