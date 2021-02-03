import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Lables extends BaseSchema {
  protected tableName = 'lables'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('shop_id', 255).notNullable()
      table.string('name', 255).notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
