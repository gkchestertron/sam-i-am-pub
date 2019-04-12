'use strict'

const app = require('../../app.js')
const chai = require('chai')
const expect = chai.expect
var event, context

describe('Tests customers endpoint', function () {
  it('verifies successful create/delete workflow', async () => {
    const result = await app.lambdaHandler(event, context)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(200)
    expect(result.body).to.be.an('string')

    let response = JSON.parse(result.body)

    expect(response).to.be.an('array')

    for (let i in response) {
      let test = response[i]
      if (test.status) {
        expect(test.status).to.be.equal("Success")
      } else {
        expect(test.overallStatus).to.be.equal("Success")
      }
    }
  })
})
