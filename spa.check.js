const assert = require('assert')
const { remote } = require('webdriverio')

const JOB_NAME = 'Performance User Flow in SPA Test'

let browser
;(async () => {
  browser = await remote({
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,

    capabilities: {
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'macOS 10.13',
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
        name: JOB_NAME,
        screenResolution: '1280x960'
      }
    }
  })

  await browser.url('https://postmates.com')

  /**
   * Test performance of last page load and assert only specific metrics.
   *
   * You can also use the JSExecutor to call the same command in a different
   * way: `browser.execute('sauce:performance', { name: '...', metrics: [] })`.
   * This allows us to provide the custom command also for other frameworks
   * written in a different programming language.
   */
  let result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for opening main page did not pass')

  /**
   * You can also make strict assertion in the metrics. For example given your
   * requirements are that your page load is not longer than 7 seconds total.
   * For that you can use the log command to receive the captured metrics and
   * assert them directly:
   */
  const metrics = await browser.getPageLogs('sauce:performance')
  assert.ok(metrics.load < 7000)

  /**
   * login
   */
  const username = await browser.$('#e2e-geosuggest-input')
  await username.setValue('San Francisco')
  const submitBtn = await browser.$('#e2e-go-button')
  await submitBtn.click()

  /**
   * test performance of feed page (https://postmates.com/feed)
   */
  result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for the feed did not pass')

  /**
   * open item
   */
  const items = await browser.$$('#e2e-carousel-0')
  await items[1].click()

  /**
   * test performance of a shop page (e.g. https://postmates.com/merchant/salt-straw-san-francisco)
   */
  result = await browser.assertPerformance(JOB_NAME, ['score'])
  assert.equal(result.result, 'pass', 'Performance test for product details page did not pass')

  /**
   * Add item to cart. Since this doesn't modifies the URL (only id parameter is added)
   * it doesn't capture performance for it as we don't consider it a page transition.
   */
  const addItemBtn = await browser.$('#e2e-category-product-0')
  await addItemBtn.click()
  const addToCart = await browser.$('#e2e-add-to-cart')
  await addToCart.click()

  /**
   * go to shopping cart
   */
  const cart = await browser.$('#e2e-view-cart-button')
  await cart.click()

  /**
   * end session
   */
  await browser.deleteSession()
})().catch((err) => {
  console.error(err)
  return browser.deleteSession()
})
