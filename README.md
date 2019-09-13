Performance Samples
===================

This repository contains samples for demonstrating Sauce Performance features. The examples are written in [Node.js](https://nodejs.org/en/) and [WebdriverIO](https://webdriver.io) but can be transformed into any language or any framework.

1. [Speedo](#1-speedo)
2. [Performance Flows](#2-performance-flows)
3. [Jankiness Test](#3-jankiness-test)

To be able to run the examples, you need to install some dependencies via:

```sh
$ npm install
```

All of this can be integrated into a CI pipeline to run performance test as part of your CI/CD cycle. Please have a look at our [performance-CI-demo](https://github.com/saucelabs/performance-CI-demo) that is using Circle CI as continous integration platform.

# 1. Speedo

Speedo is our Performance side kick that allows to use Sauce Performance without having to setup anything. You can install it on your machine using NPM:

```sh
$ npm i -g speedo
```

or use our Docker image if used in a Docker based pipeline. More information can be found [here](https://www.npmjs.com/package/speedo#docker-integration).

Speedo can be used to test the performance of a specific URL with just one command line execution. It takes a care of everything necessary from creating the baseline up to asserting against it and downloading log artifacts at the end. You can Speedo by typing the following into the command line of your terminal:

```sh
$ speedo run https://www.saucedemo.com -u <USERNAME> -k <ACCESS_KEY>
```

If you don't want to set username and access key everytime you call the command you can also just export these into your environment as follows:

```sh
export SAUCE_USERNAME=<USERNAME>
export SAUCE_ACCESS_KEY=<ACCESS_KEY>
$ speedo run https://www.saucedemo.com
```

Speedo provides a variety of parameters that tweak the environment you run your tests in. Have a look into our [documentation](https://www.npmjs.com/package/speedo#parameters) for more details. The following example runs a Speedo test with the name "my Speedo test" in our EU datacenter and only checks for `speedIndex` and `timeToInteractive` metrics.

```sh
$ speedo run https://www.saucedemo.com --region eu --metric speedIndex --metric timeToInteractive --name "my Speedo test"
```

__Note:__ By default Speedo runs its test in an emulated mobile environment that throttles the network to a "Good 3G" connection and the CPU by 4. This by design as it better helps us to detect performance problems between test runs. It can be disabled by setting `throttleNetwork` and `throttleCpu` parameters.

# 2. Performance Flows

While Speedo is a great and simple tool to test the performance for a specific URL there are often scenarios that require more than just opening a web application. If you want to bring your application into a certain state (e.g. log-in or anykind of prior interaction) you can build your own custom automation script to test the performance of specific page transtion (hard and soft page transition). In `flow.check.js` you can find a simple flow where we log into our demo application, open a specific product, put that into our shopping card and open that shopping card at the end. For every page transtion performance metrics are being captured and tested. You can run the example by calling:

```sh
$ node ./flow.check.js
```

Make sure you have your Sauce credentials stored in the environment via:

```sh
export SAUCE_USERNAME=<USERNAME>
export SAUCE_ACCESS_KEY=<ACCESS_KEY>
```

After every page load we use a custom Sauce command to assert the performance of the last page load to ensure that the captured metrics are withing the upper and lower boundary of our baseline:

```js
let result = await browser.assertPerformance(JOB_NAME, ['load', 'speedIndex'])
assert.equal(result.result, 'pass', 'Performance test for opening main page did not pass')
```

Since WebdriverIO supports Sauce Labs custom performance commands you can call the command like this directly. If you use other frameworks you have to the JSExecutor function. For more information on that, check out our [wiki page](https://wiki.saucelabs.com/display/DOCS/Incorporating+Front+End+Performance+Testing+into+WebDriver+Test+Scripts#IncorporatingFrontEndPerformanceTestingintoWebDriverTestScripts-PerformanceAssertionCommands).

You can also make strict assertion in the metrics. For example given your requirements are that your page load is not longer than 5 seconds total. For that you can use the [log command](https://wiki.saucelabs.com/display/DOCS/Incorporating+Front+End+Performance+Testing+into+WebDriver+Test+Scripts#IncorporatingFrontEndPerformanceTestingintoWebDriverTestScripts-PerformanceLogs) to receive the captured metrics and assert them directly:

```js
const metrics = await browser.execute('sauce:log', { type: 'sauce:performance' })
assert.ok(metrics.load < 5000)
```

The log command returns an object with the following metrics:

```js
{
  estimatedInputLatency: 16,
  timeToFirstByte: 7,
  domContentLoaded: 5190,
  firstVisualChange: 5277,
  firstPaint: 5399,
  firstContentfulPaint: 5399,
  firstMeaningfulPaint: 5399,
  lastVisualChange: 5605,
  firstCPUIdle: 5399,
  firstInteractive: 5399,
  load: 5416,
  speedIndex: 5404
}
```

__Note:__ our demo application has an obvious performance flaw in its [inventory page](https://www.saucedemo.com/inventory.html). If you compare all captured Lighthouse Performance Scores you will see that the score dropped to 67% and the metrics have drastically decreased. In order to get an idea where the problem comes you can inspect the tracelog by clicking on the _"View Trace"_ button on the performance details page. You can then drill into every function that has been executed on the page:

![View Trace Logs](./images/viewTraceLog.gif "View Trace Logs")

# 3. Jankiness Test

Next to being able to test soft and hard page transitions Sauce Labs provides the ability to check the smoothness feel of a page. Whenever the user feels a stuttering or a juddering on a page it results in a bad performance experience as it seems that the browser is really busy computing the website. Sauce Labs has created a new custom command that allows to test against this. When being called, it scrolls for 5 seconds from the top to the bottom of the page and captures enough information to make an assumption on the jankiness. In `jankiness.check.js` you see an example of such an application. You can call the sample script by calling:

```sh
$ node ./jankiness.check.js
```

The test opens a Google [sample website](https://googlechrome.github.io/devtools-samples/jank/) where you can create a janky experience by adding Chromium images on the screen. As more images move on the screen as janky it will get. The command returns and object with the result of the test that you can use to assert:

```js
const result = await browser.execute('sauce:jankinessCheck')
assert.ok(result.score > 0.9)
```

As jankiness check captures the following metrics:

```js
{
  url: 'https://googlechrome.github.io/devtools-samples/jank/',
  timestamp: 1568300525146,
  loaderId: '4885adf0-d56e-11e9-aa53-e52a30c71d6a',
  score: 0.36234456403004955,
  value: {
    metrics: {
      averageFPS: 17.137733159928153,
      scriptingTime: 2141,
      renderingTime: 419,
      otherTime: 1164,
      idleTime: 1196,
      forcedReflowWarningCounts: 21416,
      scrollTime: 5148,
      paintingTime: 228,
      memoryUsageDiff: 9062620
    },
    diagnostics: {
      layoutUpdateScore: 0.41371003066141043,
      fpsScore: 0.28562888599880254,
      idleDurationScore: 0.23232323232323232,
      memoryUsageScore: 0.9818905494126537
    }
  }
}
```

When observing the "jankiness" of a page we are looking into the following captured information:

- __The average frames per seconds (FPS):__ like in a computer game or in videos the frames per second is a measurement of how many images (called frames) appear on a display in one second. As a general rule of thumb a good value of it are 60 FPS
- __Idle duration of the browser:__ if the browser has a lot of things to do while scrolling it is a good indicator that this will influence the performance in a negative way, so as more the browser is _not_ doing any rendering, scripting or painting work the better
- __Forced reflows:__ if you request certain information of a DOM element in a specific way it forces the browser to render it on the screen even though the element has not changed at all. If this happens often, it also results in a bad performance experience
- __Memory Usage:__ storing variables and data in memory is a common practice and in JavaScript usually cleaned by the garbage collector. However if you assign variables in a wrong way it can lead to the sitation that it will never be cleaned up and causes the browser to consume to much memory

For every area Sauce Labs creates a score. For example a average FPS rate of 60 results in a full score of 100%. All score (see in diagnostics) we generate a weighted mean to create one single jankiness performance score. This can used as a general measure for how well the smoothness of the page feels.
