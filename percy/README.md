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
The mock server is powered by [har-express](https://github.com/toutpt/har-express).

The mock server uses a [HAR (HTTP Archive) file](https://en.wikipedia.org/wiki/HAR_(file_format)),
`mock.har`, as input.

The HAR file is checked in this repo and contains a predefined lists of web queries and their corresponding responses.
We use these predefined responses, which are snapshots of responses from a live OTP server,
to ensure that the content remains the same from one test to the next.
This avoids failed screenshot comparisons caused by external factors such as transit schedule changes.

At this time, only the OTP server is mocked. The same `mock.har` file is (re)used for all the UI tests.

## Duplication of responses in `mock.har`

You will notice that `mock.har` contains a number of repeated or duplicate query/response sets.
The position of these queries are also noted in the test script.
This is because har-express only compares the URL of the request (including query parameters),
but ignores the request body and headers completely. For GraphQL queries especially, the URL is always `http://localhost:9999/otp2/routers/default/graphql`, but the GraphQL content sent by the UI is ignored.

When a given URL is sent to har-express again, har-express will work in a **cycle**
and return the response for that URL that follows the response previously given for that URL.
When all the responses to a URL in the HAR file have been exhausted, the first one is sent again.

This feature or bug is advantageous because it forces us to keep track of **all** expected web requests
made by the OTP-RR UI in `mock.har`, in the order they are made:
- If a web request is introduced/removed,
  it will disrupt the order of the responses sent by the mock server.
- If the UI makes unnecessary web requests, those requests still have to be included in `mock.har`.

In all cases, `mock.har` needs to contain the mock responses for all queries the UI is expected to make,
or the screenshot comparison will fail.
