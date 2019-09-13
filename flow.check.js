const assert = require('assert')
const { remote } = require('webdriverio')

const JOB_NAME = 'Performance User Flow Test'

let browser
;(async () => {
  browser = await remote({
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,

    capabilities: {
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      'sauce:options': {
        /**
         * enable extended debugging by setting `extendedDebugging` and
         * `capturePerformance` to true
         */
        extendedDebugging: true,
        capturePerformance: true,
        /**
         * run test using beta version of Sauce Labs internal driver to
         * enable SPA support and Jankiness check
         */
        crmuxdriverVersion: 'beta',
        /**
         * provide test name so we can capture metrics data over time
         */
        name: JOB_NAME
      }
    }
  })

  await browser.url('https://www.saucedemo.com/')

  /**
   * Test performance of last page load and assert only specific metrics.
   *
   * You can also use the JSExecutor to call the same command in a different
   * way: `browser.execute('sauce:performance', { name: '...', metrics: [] })`.
   * This allows us to provide the custom command also for other frameworks
   * written in a different programming language.
   */
  let result = await browser.assertPerformance(JOB_NAME, ['load', 'speedIndex'])
  assert.equal(result.result, 'pass', 'Performance test for opening main page did not pass')

  /**
   * You can also make strict assertion in the metrics. For example given your
   * requirements are that your page load is not longer than 5 seconds total.
   * For that you can use the log command to receive the captured metrics and
   * assert them directly:
   */
  const metrics = await browser.execute('sauce:log', { type: 'sauce:performance' })
  assert.ok(metrics.load < 5000)

  /**
   * login
   */
  const username = await browser.$('#user-name')
  await username.setValue('performance_glitch_user')
  const password = await browser.$('#password')
  await password.setValue('secret_sauce')
  const submitBtn = await browser.$('.btn_action')
  await submitBtn.click()

  /**
   * test performance of form submit / login
   */
  result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for login did not pass')

  /**
   * open item
   */
  const item = await browser.$('#item_5_title_link')
  await item.click()

  /**
   * test performance of product details page
   */
  result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for product details page did not pass')

  /**
   * add item
   */
  const addItemBtn = await browser.$('.inventory_details_desc_container button')
  await addItemBtn.click()

  /**
   * go to shopping cart
   */
  const cart = await browser.$('.shopping_cart_link')
  await cart.click()

  /**
   * test performance of shopping cart page
   */
  result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for shopping card page did not pass')

  /**
   * end session
   */
  await browser.deleteSession()
})().catch((err) => {
  console.error(err)
  return browser.deleteSession()
})
