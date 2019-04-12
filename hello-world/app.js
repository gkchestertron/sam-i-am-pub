const { testEndpoint, testWorkflow } = require('./helper')
const baseUrl = 'https://'+process.env.SQ_HOST
const customers = `${baseUrl}/v2/customers`

const lukeInput = {
  given_name: "luke",
  family_name: "skywalker",
  company_name: "The Rebellion™",
  email_address: "power.converter27@toshi.station.com"
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
// TODO: should I refactor to be able to indicate which tests were skipped?
exports.lambdaHandler = async (event, context) => {
  let luke
  return testWorkflow(
    // create luke
    async response => await testEndpoint(customers, "post", lukeInput, data => {
      luke = data.customer
      return luke
    }),

    // check that he's there
    async response => await testEndpoint(customers, "get", null, async data => {
      let lukeCheck = data.customers.filter(customer => customer.id === luke.id)[0]
      if (!lukeCheck) {
        throw 'failed to find customer luke skywalker'
      }
      return luke
    }),

    // delete him
    async response => await testEndpoint(`${customers}/${response.data.id}`, "delete"),

    // check that he's gone
    async response => await testEndpoint(customers, "get", null, async data => {
      let lukeCheck = data.customers && data.customers.filter(customer => customer.id === luke.id)[0]
      if (lukeCheck) {
        throw 'found customer luke skywalker that should have been deleted'
      }
    })
  )
}

