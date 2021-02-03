import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'

export default class Scheduler extends BaseTask {
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

	public async handle() {
    // 	this.logger.info('Handled')
    // 	Logger.info('A info message')
        logger.info('An info message')
        return 'handled'
  	}
}
