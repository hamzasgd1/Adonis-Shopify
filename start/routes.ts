/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import { Auth } from 'shopify-admin-api'
import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.on('/login').render('install').as('login')
Route.get('/', async ({ response }) => {
  response.redirect('home')
}).middleware('shopify')

Route.get('/home', async ({ view }) => {
  return view.render('welcome')
}).middleware('shopify')

Route.get('/auth/home', async ({ view }) => {
  return view.render('welcome')
}).middleware('shopify')

Route.get('/auth/auth', async ({ view }) => {
  return view.render('welcome')
}).middleware('shopify')
Route.get('auth', async ({ view, request }) => {
  const { shop } = request.get()
  const usersShopifyUrl = shop
  const redirectUrl = 'https://abandonedguru.com/auth/callback'
  const scopes = [
    'read_orders',
    'write_orders',
    'read_draft_orders',
    'write_draft_orders',
    'write_order_edits',
    'read_products',
    'read_merchant_managed_fulfillment_orders',
    'write_merchant_managed_fulfillment_orders',
    'read_customers',
    'write_customers',
    'read_script_tags',
    'write_script_tags',
    'read_fulfillments',
  ]

  const yourShopifyApiKey = '9eabdf1f409a18e13cf96a323314f451'
  const authUrl = await Auth.buildAuthorizationUrl(
    scopes,
    usersShopifyUrl,
    yourShopifyApiKey,
    redirectUrl
  )
  return view.render('partials.redirect', { url: authUrl })
}).as('auth')
Route.get('/auth/callback', async ({ auth, request, response, session }: HttpContextContract) => {
  const querystring = require('querystring')
  const crypto = require('crypto')
  const { shop, hmac, code } = request.get()
  if (shop && hmac && code) {
    const map = Object.assign({}, request.get())
    delete map['signature']
    delete map['hmac']
    const message = querystring.stringify(map)
    const providedHmac = Buffer.from(hmac, 'utf-8')
    const generatedHash = Buffer.from(
      crypto.createHmac('sha256', 'dce00414ebd429c775411f71d8a49464').update(message).digest('hex'),
      'utf-8'
    )
    let hashEquals = false

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
      hashEquals = false
    }

    if (!hashEquals) {
      return response.status(400).send('HMAC validation failed')
    }
    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token'
    const accessTokenPayload = {
      client_id: '9eabdf1f409a18e13cf96a323314f451',
      client_secret: 'dce00414ebd429c775411f71d8a49464',
      code,
    }
    const axios = require('axios')
    var res = await axios.post(accessTokenRequestUrl, accessTokenPayload)
    // return res.data
    console.log(res.data)
    var token = res.data.access_token
    var hash = await Hash.make(token)
    console.log(hash)
    const accessToken = res.data.access_token
    const shopRequestHeaders = {
      'X-Shopify-Access-Token': accessToken,
    }
    const shopRequestUrl = 'https://' + shop + '/admin/api/2020-10/shop.json'
    var res = await axios.get(shopRequestUrl, { headers: shopRequestHeaders })
    session.put('shopify_user_session', accessToken)
    const searchPayload = { email: res.data.shop.email, name: shop }
    const savePayload = { password: token, name: shop, token: token }
    await User.updateOrCreate(searchPayload, savePayload)
    const shops = await User.findBy('name', shop)
    if (shops?.token === accessToken) {
      await auth.login(shops!)
      console.log(shops)
      console.log(accessToken)
      response.redirect('home')
    } else {
      const shop = await User.findOrFail(shops!.id)
      shop.token = accessToken
      shop.save()
      await auth.login(shops!)
      response.cookie('wlaExt', shop.name, {
        httpOnly: false,
        secure: false,
      })
      console.log('Token Updated')
      response.redirect('home')
    }
  } else {
    response.status(400).send('Required parameters missing')
  }
})