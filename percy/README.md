# Percy Tests

Percy tests are end-to-end tests of the OTP-RR desktop, mobile, and call-taker UIs
with screenshots taken at key steps of the user interaction.

To run locally, uncomment the line in `percy.test.js` that says `headless: false`,
then enter (Linux syntax):
```sh
PERCY_OTP_CONFIG_OVERRIDE=<path-to-yml> npx percy exec -- npx jest percy/percy.test.js --force-exit
```

## Mock OTP Server and HAR file

Percy tests rely on a real OTP server that is downloaded via `yarn percy-otp-download`. A real geocoder must be provided in the percy yaml config, which must be copied to the `percy` directory.

A `graph.obj` for the Atlanta region, with valid service in October 2026 must also be specified.

See the `percy.yml` GitHub Action for more details.

## Running and debugging the Percy tests
You can run the Percy tests locally with this command: 
```OTP_RR_UI_MODE=normal npx percy exec -- npx jest percy/percy.test.js```
or this for calltaker:
```OTP_RR_UI_MODE=calltaker npx percy exec -- npx jest percy/percy.test.js```

This will run the mock servers and then start the tests in headless mode by default. 

You can disable headless mode by setting `headless: false` in the Puppeteer launch settings in `percy.test.js`. We left a line commented out which you can uncomment to achieve this. 

You can also debug the tests by creating a JavaScript Debug Terminal, then running the above commands with breakpoints set in the editor. 

