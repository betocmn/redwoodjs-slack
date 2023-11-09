import serverlessHttp from 'serverless-http'

import { expressReceiver } from 'src/lib/slack'

module.exports.handler = serverlessHttp(expressReceiver.app)
