/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import View from '@ioc:Adonis/Core/View'
import Env from '@ioc:Adonis/Core/Env'

View.global('timestamp', () => {
  return new Date().getTime()
})

View.global('base_url', () => {
  return Env.get('HOST')
})

View.global('app_bridge', () => {
  return Env.get('APP_BRIDGE')
})

View.global('app_key', () => {
  return Env.get('SHOPIFY_API_KEY')
})
