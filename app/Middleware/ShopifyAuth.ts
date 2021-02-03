import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { hasMany } from '@ioc:Adonis/Lucid/Orm'
import { Auth } from 'shopify-admin-api'
import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
// import Hash from '@ioc:Adonis/Core/Hash'
// import Route from '@ioc:Adonis/Core/Route'

export default class ShopifyAuth {
  public async handle(
    { auth, request, response, session }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // console.log('user token = ' + session.get('shopify_user_session'))
    // console.log('Session token = ' + session.get('user_session_token'))
    var { hmac, shop, timestamp } = request.get()
    var SESSION_TOKEN = request.input('session')
    // console.log(SESSION_TOKEN)
    var domain = shop

    // return 'handled'
    // hmac = this.verifyHmac(request)
    if (hmac === null) {
      // No HMAC, move on...
      hmac = null
    }
    const isAuthentic = await Auth.isAuthenticRequest(
      request.get(),
      'dce00414ebd429c775411f71d8a49464'
    )
    if (isAuthentic) {
      //Request is authentic.
      hmac = true
    } else {
      //Request is not authentic and should not be acted on.
      hmac = null
      //   console.log('hmac not')
    }
    var checks: string[] = []
    // console.log(await auth.check())
    await auth.check()
    if ((await auth.check()) === false) {
      // session.forget('shopify_user_session')
    }
    // console.log(auth.isGuest)
    // var s = session.get('shopify_user_session')
    // console.log(s);;
    if (auth.isGuest) {
      console.log('Guest')
      if (hmac === null) {
        // Auth flow required if not yet logged in
        // return this.handleBadVerification($request, $domain);
        throw new UnAuthorizedException('Not allowed')
      }
      var c = await session.get('shopify_user_session')
      if (c === undefined) {
        // return response.redirect('auth',{shop:domain})
      }
      //   console.log('step2')
      checks.push('loginShop')
      try {
        const shop = await User.findBy('name', domain)
        await auth.login(shop)
        var result = true
        session.put('user_session_token', SESSION_TOKEN)

        //   return redirect('home')
      } catch (error) {
        var result = false
        console.log(error)
      }
      if (result === false) {
        // return $this -> handleBadVerification($request, $domain);
        console.log('Bad Verification')
      }
    }

    if (hmac === true) {
      await session.put('user_session_token', SESSION_TOKEN)
      const user = await auth.authenticate()

      if (user.name !== domain) {
        session.forget('shopify_user_session')
        return response.redirect('auth', { shop: domain })
      }
      var c = await session.get('user_session_token')
      if (c !== SESSION_TOKEN) {
        session.forget('user_session_token')
        return response.redirect('auth', { shop: domain })
      }
    }
    // checks.push('verifyShopifySessionToken', 'verifyShop')
    // console.log(checks)
    // checks.forEach(function (check) {
    //   console.log(check)
    //   let result = this.loginShop(domain)
    //   if (result === false) {
    //     // return $this -> handleBadVerification($request, $domain);
    //     console.log('Bad Verification');
    //   }
    // })
    // response.cookie('wlaExt', domain, {
    //   httpOnly: false,
    //   domain: '',
    //   secure: false,
    // })
    await next()
  }

  //   private async loginShop(auth: HttpContextContract, domain) {
  //     const user = await User.findBy('name', domain)
  //     await auth.login(user)
  //     return true
  //   }

  // private async verifyHmac({ request }) {
  //   const { hmac } = request.get()
  //   if (hmac === null) {
  //     // No HMAC, move on...
  //     return null
  //   }
  //   const isAuthentic = await Auth.isAuthenticRequest(
  //     request.all(),
  //     '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'
  //   )
  //   if (isAuthentic) {
  //     //Request is authentic.
  //     return true
  //   } else {
  //     //Request is not authentic and should not be acted on.
  //     return null
  //   }
  // }
}
