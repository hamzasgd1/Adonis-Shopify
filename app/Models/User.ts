import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public name: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public token?: string

  @column()
  public rememberMeToken?: string

  @column()
  public chatbot_status?: number

  @column()
  public chatbot_color?: string

  @column()
  public chatbot_position?: string

  @column()
  public chatbot_btn_text?: string

  @column()
  public help_widget_status?: boolean

  @column()
  public whatsapp_widget_status?: boolean

  @column()
  public contact_widget_status?: boolean

  @column()
  public order_widget_status?: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
