// internals
import { inspect } from 'util'

// packages
import core from '@actions/core'
import github from '@actions/github'

// modules
import main from './lib/index.js'

  // exit early
if (github.context.eventName !== 'pull_request') {
  core.error('action triggered outside of a pull_request')
  process.exit(1)
}

// extract the title
const { payload: { sender, otherpayload } } = github.context // eslint-disable-line camelcase

console.log(github.context)
console.log(otherpayload)

console.log('sender', sender)
// exit early if PR is not by dependabot
if (!sender || !['dependabot[bot]', 'dependabot-preview[bot]'].includes(sender.login)) {
  core.warning(`expected PR by "dependabot[bot]", found "${sender ? sender.login : 'no-sender'}" instead`)
  process.exit(0)
}

// parse inputs
const inputs = {
  token: core.getInput('github-token', { required: true }),
  target: core.getInput('target', { required: false }),
  command: core.getInput('command', { required: false }),
  approve: core.getInput('approve', { required: false })
}

// error handler
function errorHandler ({ message, stack, request }) {
  core.error(`${message}\n${stack}`)

  // debugging for API calls
  if (request) {
    const { method, url, body, headers } = request
    core.debug(`${method} ${url}\n\n${inspect(headers)}\n\n${inspect(body)}`)
  }

  process.exit(1)
}

// catch errors and exit
process.on('unhandledRejection', errorHandler)
process.on('uncaughtException', errorHandler)

await main(inputs)
