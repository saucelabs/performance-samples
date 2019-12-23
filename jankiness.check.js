const assert = require('assert')
const { remote } = require('webdriverio')

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
        extendedDebugging: true,
        capturePerformance: true,
        crmuxdriverVersion: 'beta'
      }
    }
  })

  /**
   * open sample website
   */
  await browser.url('https://googlechrome.github.io/devtools-samples/jank/')

  /**
   * if `OPTIMIZE` environment variable is set we animate the icons in an
   * optimized fashion
   */
  if (process.env.OPTIMIZE) {
    const optimizeBtn = await browser.$('.optimize')
    await optimizeBtn.click()
  }

  /**
   * add 20 icons on the screen to create the jankiness effect
   */
  const addBtn = await browser.$('.add')
  for (let i = 0; i < 20; ++i) {
    await addBtn.click()
  }

  /**
   * run jankiness check
   */
  const result = await browser.execute('sauce:jankinessCheck')

  /**
   * assert the jankiness score to be above 90%
   */
  assert.ok(result.score > 0.9)

  await browser.deleteSession()
})().catch((err) => {
  console.error(err)
  return browser.deleteSession()
})
