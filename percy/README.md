# Percy Tests

Percy tests are end-to-end tests of the OTP-RR desktop, mobile, and call-taker UIs
with screenshots taken at key steps of the user interaction.

To run locally, uncomment the line in `percy.test.js` that says `headless: false`,
then enter (Linux syntax):
```sh
PERCY_OTP_CONFIG_OVERRIDE=<path-to-yml> npx percy exec -- npx jest percy/percy.test.js --force-exit
```

## Mock OTP Server and HAR file

Percy tests are rely on a mock OTP server that returns preset responses to given URLs.
The mock server is powered by an express.js server, which forwards REST requests to a HAR server and handles GraphQL requests with a GraphQL server.

The HAR server uses a [HAR (HTTP Archive) file](https://en.wikipedia.org/wiki/HAR_(file_format)),
`mock.har`, as input. The GraphQL server uses high level resolvers for each request type, processes some important arguments, and then returns 
objects from static JSON files sourced from real OTP queries. 

The HAR file is checked in this repo and contains a predefined lists of web queries and their corresponding responses.
We use these predefined responses, which are snapshots of responses from a live OTP server,
to ensure that the content remains the same from one test to the next.
This avoids failed screenshot comparisons caused by external factors such as transit schedule changes.

At this time, only the OTP server is mocked. The same `mock.har` file is (re)used for all the UI tests.

In all cases, `mock.har` needs to contain the mock responses for all REST queries the UI is expected to make,
or the screenshot comparison will fail

The GraphQL requests are handled by the GraphQL.js library, which uses a schema from OTP in `otpSchema.json`. 
This file comes from the introspection query against an OTP GraphQL server. 
GraphQL queries are handled by resolvers in `graphql-mocks.js`, which contains a standard GraphQL handler provided by the GraphQL library. 
Objects for the various queries are provided in the `mocks` folder. 

Some gotchas experienced while setting up these mocks:
- The frontend expects the server to return the correct stop ID when it sends a request for stop information. That means that if you send a request for stop ID X, and the server returns data for stop ID Y, the frontend will not work correctly. For the purposes of a screenshot test it may not matter, but for OTP-RR, the ID needs to match. I solved this by adding a handler that checks the `id` argument passed with the request, and returns one of two mocks depending on the ID.
- When getting data from the mocks, the easiest way is to look at the request OTP-RR makes against a real server and copy the response into the mock JSON file. However, when items in the query are renamed, e.g. `id: gtfsId`, you need to rename those back to the original name for the mock, otherwise the shape of the data won't match the schema. You will be warned about this in the logs when the query is made, though, so pay special attention to those to figure out what needs to be corrected. 

There is also another HAR file and mock server used for the geocoder, this one without an express server sitting in front.

## Running and debugging the Percy tests
You can run the Percy tests locally with this command: 
```OTP_RR_UI_MODE=normal npx percy exec -- npx jest percy/percy.test.js```
or this for calltaker:
```OTP_RR_UI_MODE=calltaker npx percy exec -- npx jest percy/percy.test.js```

This will run the mock servers and then start the tests in headless mode by default. 

You can disable headless mode by setting `headless: false` in the Puppeteer launch settings in `percy.test.js`. We left a line commented out which you can uncomment to achieve this. 

You can also debug the tests by creating a JavaScript Debug Terminal, then running the above commands with breakpoints set in the editor. 

