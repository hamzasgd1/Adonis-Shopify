/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'
import User from 'App/Models/User'
import { Discounts } from 'shopify-admin-api'

export default class Api {
  static API_VERSION: any = Env.get('SHOPIFY-API-VERSION')
  static accessToken: any
  static shop: any

  public static async getShop(domain: any) {
    const user = await User.findBy('name', domain)
    this.accessToken = user!.token
    this.shop = user!.name
  }

  public static async rest(domain) {
    await this.getShop(domain)
    const Shopify = require('shopify-api-node')
    const shopify = new Shopify({
      shopName: this.shop,
      accessToken: this.accessToken,
      apiVersion: this.API_VERSION,
    })
    return shopify
  }

  public static async graph(shop: any, query: string) {
    await this.getShop(shop)
    const url = 'https://' + this.shop + '/admin/api/' + this.API_VERSION + '/graphql.json'
    var res = await axios({
      headers: {
        'Content-Type': 'application/graphql',
        'X-Shopify-Access-Token': this.accessToken,
      },
      method: 'post',
      url: url,
      data: query,
    })
    return res.data
  }

  public static async updateCustomer(domain: any, id: any, number: any) {
    const shopify = await this.rest(domain)
    await shopify.customer.update(id, { tags: number })
  }

  public static async draftOrder(
    domain: any,
    items: any,
    shipping: object,
    discount: any,
    email: any
  ) {
    const shopify = await this.rest(domain)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var params = {
      line_items: items,
      applied_discount: {},
      shipping_address: {},
      email: email,
    }
    if (discount.status !== false) {
      params.applied_discount = {
        value_type: 'percentage',
        value: discount.value,
        amount: discount.amount,
      }
    }
    if (Object.keys(shipping).length > 0) {
      params.shipping_address = shipping
    }
    console.log(params)
    return await shopify.draftOrder.create(params)
  }

  public static async searchOrder(domain: string, orderName: string) {
    let query = `{
                  orders(first: 10, query: "name:${orderName}") {
                    edges {
                      node {
                        customer {
                          email
                          totalSpent
                          id
                          ordersCount
                          displayName
                          createdAt
                        }
                        displayFulfillmentStatus
                        displayFinancialStatus
                        createdAt
                        name
                        shippingAddress {
                          address1
                          city
                          country
                          countryCodeV2
                          phone
                          province
                          zip
                        }
                      }
                    }
                  }
                }`
    return await this.graph(domain, query)
  }

  public static async searchProduct(domain: string, title: string) {
    await this.getShop(domain)
    let query = `{
      shop {
          name
          currencyCode
      }
      products(first: 10, query: "title:${title}*") {
        edges {
          node {
            id
            title
            description(truncateAt: 400)
            options(first: 3) {
              name
              values
              position
            }
            priceRangeV2 {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
            src
            }
            totalVariants
          }
        }
      }
    }`
    return await this.graph(domain, query)
  }

  public static async getVariants(domain: any, id: any) {
    await this.getShop(domain)
    let query = `{
                    product(id: "${id}") 
                    {
                        variants(first: 100) {
                            edges {
                                node {
                                    image(maxWidth: 300, maxHeight: 300) {
                                        src
                                    }
                                    id
                                    price
                                    title
                                    selectedOptions {
                                      name
                                      value
                                    }
                                }
                            }
                        }
                    }
                }`
    return await this.graph(domain, query)
  }
}
