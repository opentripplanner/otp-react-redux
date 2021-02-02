# otp-react-redux

<img src="https://github.com/opentripplanner/otp-react-redux/raw/master/otprr.png" width="500" />

A library for writing modern [OpenTripPlanner](http://www.opentripplanner.org/)-compatible multimodal journey planning applications using [React](https://reactjs.org/) and [Redux](https://redux.js.org/).

## Running the Example

An example of an OTP-RR application is included in the repository. The example project is a single page application with a root entry point of the `example.js` file. This example.js file can be modified to suit the needs of a particular implementation.

To run, first clone the repo and install [yarn](https://yarnpkg.com/) if needed.

Copy `example-config.yml` to `config.yml`. Update `config.yml` with the needed API keys, and optionally, the OTP endpoint and initial map origin. (The default values are for a test server for Portland, OR.).

Install the dependencies and start a local instance using the following script:

```bash
yarn start
```

## Deploying the UI

1. Build the js/css bundle by running `yarn build`. The build will appear in the `dist/` directory).
2. Modify the `index.html` to point to `dist/index.js` (instead of `example.js`).
3. Upload the following files to wherever you're deploying the UI:
  - `index.html` (modified to point to `dist/index.js`)
  - `example.css`
  - `dist/`
    - `index.js`
    - `index.js.map`
    - `index.css`
    - `index.css.map`

Note: only contents produced during build in the `dist/` directory are likely to change over time (the `index.html` and `example.css` files contain minimal code), so subsequent deployments will typically only need to replace the `dist/` contents.

### Building/deploying with webpack

A companion project known as [trimet-mod-otp](https://github.com/ibi-group/trimet-mod-otp/) uses an alternative build approach that shows how otp-react-redux can be imported, re-skinned, and built/served with Webpack. This project serves as the TriMet-specific implementation of the OTP user interface and provides a convenient means of configuring/overriding various application assets with command-line options interpreted by Webpack (e.g., to change the base CSS or swap out certain React components). Together, these options make it easy to manage one or many different implementations of OTP.

Check out [trimet-mod-otp's README](https://github.com/ibi-group/trimet-mod-otp/#using-custom-indexhtml-css-and-js) for more info!

## Library Documentation

More coming soon...

As of version 2.0, otp-react-redux utilizes React's context API in a number of components. This changed the way that some components receive props such that they will not work properly unless wrapped with the context provider used in the `ResponsiveWebapp` component.
