import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class QuickReplies extends BaseSchema {
  protected tableName = 'quick_replies'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('shop_id', 255).notNullable()
      table.string('shortcut', 255).notNullable()
      table.string('message', 255).notNullable()
      table.string('keyword', 255).nullable()
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
