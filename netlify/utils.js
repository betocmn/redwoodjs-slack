const querystring = require('querystring')
function parseRequestBody(stringBody, contentType) {
  if (contentType === 'application/x-www-form-urlencoded') {
    // TODO: querystring is deprecated since Node.js v17
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }

    return parsedBody;
  }

  return JSON.parse(stringBody);
}

module.exports = {
  parseRequestBody
}
// function generateReceiverEvent(payload) {
//     return {
//         body: payload,
//         ack: async (response) => {
//             return {
//               statusCode: 200,
//               body: response ?? ""
//             };
//         }
//     };
// }

// function isUrlVerificationRequest(payload) {
//     if (payload && payload.type && payload.type === "url_verification") {
//         return true;
//     }
//     return false;
// }
