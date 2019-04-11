const axios = require('axios')

// sq env
const ACCESS_TOKEN = process.env.SQ_ACCESS_TOKEN

const headers = {
  "Authorization": `Bearer ${ACCESS_TOKEN}`,
  "Accept": "application/json"
}

module.exports.testEndpoint = async function (url, method, body, callback) {
  let data 

  try {
    const response = await axios({
      url,
      method,
      data: body,
      headers
    })
    
    if (typeof callback === 'function') {
      data = await callback(response.data)
    }
  } catch(err) {
    console.log("Error:", err)
    if (err.response) {
      return { url, method, status: "Fail", error: err.response.statusText }
    } else {
      return { url, method, status: "Fail", error: err }
    }
  }

  return { url, method, status: "Success", data: data }
}

module.exports.testWorkflow = async function (...tests) {
  const responses = []
  let response = {}
  let test
  let failed = false

  for (var i in tests) {
    test = tests[i]
    response = await test(response)
    responses.push(response)
    if (response.status === "Fail") {
      failed = true
      break
    }
  }

  for (var i in responses) {
    response = responses[i]
    delete response.data // don't expose anything we don't wanna
  }

  const skipped = tests.length - responses.length
  if (failed) {
    responses.push({ overallStatus: "Fail", message: `Skipped ${skipped} tests` })
  } else {
    responses.push({ overallStatus: "Success", message: "all tests passed" })
  }

  return {
    statusCode: 200,
    body: JSON.stringify(responses,null,2)
  }
}
