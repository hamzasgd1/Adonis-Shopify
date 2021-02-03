// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Whatsapp from 'App/Models/Whatsapp'
import Faq from 'App/Models/Help'
import Contact from 'App/Models/Contact'
import { Orders } from 'shopify-admin-api'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class ProxyController {
  public async index({ view, request, response }: HttpContextContract) {
    console.log(request.all())
    const type = request.input('route')
    let shop = request.input('shop')
    var user = await User.query().where('name', shop).first()
    const shopId = user!.id
    const shopDomain = user!.name
    const token = user!.token

    if (type === 'widget') {
      // eslint-disable-next-line
      if (user?.chatbot_status == 1) {
        const faq = await Faq.query().where('shop_id', shopId)
        const support = await Whatsapp.query().where('shop_id', shopId)
        const contact = await Contact.query().where('shop_id', shopId).first()
        let d = view.render('widget/widget', {
          btn_text: user?.chatbot_btn_text,
          position: user?.chatbot_position,
          color: user?.chatbot_color,
          status: user?.chatbot_status,
          help_status: user?.help_widget_status,
          whatsapp_status: user?.whatsapp_widget_status,
          contact_status: user?.contact_widget_status,
          order_status: user?.order_widget_status,
          faq: faq,
          support: support,
          contact: contact,
        })
        let data = {
          html: d,
          help_status: user?.help_widget_status,
          whatsapp_status: user?.whatsapp_widget_status,
          contact_status: user?.contact_widget_status,
          order_status: user?.order_widget_status,
        }
        response.status(200).json(data)
      } else {
        response.status(200).json(400)
      }
    }
    if (type === 'track') {
      let id = request.input('id')
      let email = request.input('email')
      let data = await this.order_status(id, shopDomain, token)
      let oid = data.id.replace(/[^0-9]/g, '')
      let oidEmail = data.email
      if (email === oidEmail) {
        const service = new Orders(shopDomain, token!)
        const order = await service.get(oid)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return order
      } else {
        return 400
      }
    }
    if (type === 'email') {
      // return 200
      const name = request.input('wal-name')
      const email = request.input('wal-email')
      const number = request.input('wal-number')
      const question = request.input('wal-question')

      const contact = await Contact.query().where('shop_id', shopId).first()
      await Mail.use('smtp').send(
        (message) => {
          message.subject('Contact Form'),
            message.to(contact?.contact_email),
            message.from('support@smsgo.live'),
            message.htmlView('emails/contact', {
              name: name,
              email: email,
              question: question,
              number: number,
            })
        },
        {
          oTag: ['contact'],
        }
      )
      return 200
    }
  }

  public async order_status(id, shopDomain, token) {
    const API_VERSION = Env.get('SHOPIFY-API-VERSION')
    const axios = require('axios')
    const accessToken = token
    const shop = shopDomain
    let data = `{
                  shop {
                    name
                  }
                  orders(query: "name:${id}" , first:1) {
                    edges {
                      node {
                        name
                        id
                        email 
                      }
                    }
                  }
                }`
    const url = 'https://' + shop + '/admin/api/' + API_VERSION + '/graphql.json'
    var res = await axios({
      headers: {
        'Content-Type': 'application/graphql',
        'X-Shopify-Access-Token': accessToken,
      },
      method: 'post',
      url: url,
      data: data,
    })
    return res.data.data.orders.edges[0].node
  }
}
