# otp-react-redux

<img src="https://github.com/opentripplanner/otp-react-redux/raw/master/otprr.png" width="500" />

A library for writing modern [OpenTripPlanner](http://www.opentripplanner.org/)-compatible multimodal journey planning applications using [React]() and [Redux]().

## Running the Example

An example of an OTP-RR application is included in the repository. The example project is a single page application with a root entry point of the `example.js` file. This example.js file can be modified to suit the needs of a particular implementation.

To run, first clone the repo and install [yarn](https://yarnpkg.com/) if needed.

Update `example-config.yml` with the needed API keys, and optionally, the OTP endpoint and initial map origin. (The default values are for a test server for Portland, OR.).

Install the dependencies and start a local instance using the following script:

```bash
yarn start
```

Should you want to maintain multiple configuration files, OTP-RR can be made to use a custom config file by using environment variables. Other environment variables also exist. `CUSTOM_CSS` can be used to point to a css file to inject, and `JS_CONFIG` can be used to point to a `config.js` file to override the one shipped with OTP-RR.

```bash
env YAML_CONFIG=example-config.yaml yarn start
```

## Deploying the UI

Build the js/css bundle by running `yarn build`. The build will appear in the `dist/` directory).

The same environment variables which affect the behavior of `yarn start` also affect `yarn build`. Running the following command builds OTP-RR with customized js and css:

```bash
env JS_CONFIG=my-custom-js.js CUSTOM_CSS=my-custom-css.css yarn start
```

## Library Documentation

More coming soon...

As of version 2.0, otp-react-redux utilizes React's context API in a number of components. This changed the way that some components receive props such that they will not work properly unless wrapped with the context provider used in the `ResponsiveWebapp` component.
