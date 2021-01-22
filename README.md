# otp-react-redux

<img src="https://github.com/opentripplanner/otp-react-redux/raw/master/otprr.png" width="500" />

A library for writing modern [OpenTripPlanner](http://www.opentripplanner.org/)-compatible multimodal journey planning applications using [React]() and [Redux]().

## Running the Example

An example of an OTP-RR application is included in the repository. The example project is a single page application with a root entry point of the `example.js` file. This example.js file can be modified to suit the needs of a particular implementation.

To run, first clone the repo and install [yarn](https://yarnpkg.com/) if needed.

Copy `example-config.yml` to `config.yml`. Update `config.yml` with the needed API keys, and optionally, the OTP endpoint and initial map origin. (The default values are for a test server for Portland, OR.).

Install the dependencies and start a local instance using the following script:

```bash
yarn start
```

## Deploying the UI

1. Change `index.html` to point to `dist/index.js` (instead of `example.js`) and upload to s3 bucket (or other file hosting service).
2. Upload `example.css`.
3. Build the js/css bundle (which will appear in the `dist/` directory) and upload.

Here's an example set of commands using the AWS CLI:
```bash
# The first two steps only need to be performed the first time.
aws s3 cp index.html s3://my-bucket --acl public-read
aws s3 cp example.css s3://my-bucket --acl public-read
# Anytime the otp-react-redux code changes, you'll need to run the following steps:
yarn build
aws s3 cp --recursive dist/ s3://my-bucket/dist --acl public-read
```

You can then view your site at: https://my-bucket.s3.amazonaws.com/index.html


## Library Documentation

More coming soon...

As of version 2.0, otp-react-redux utilizes React's context API in a number of components. This changed the way that some components receive props such that they will not work properly unless wrapped with the context provider used in the `ResponsiveWebapp` component.
