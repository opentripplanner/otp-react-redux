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
env YAML_CONFIG=/absolute/path/to/config.yml yarn start
```

## Deploying the UI

Build the js/css bundle by running `yarn build`. The build will appear in the `dist/` directory).

The same environment variables which affect the behavior of `yarn start` also affect `yarn build`. Running the following command builds OTP-RR with customized js and css:

```bash
env JS_CONFIG=my-custom-js.js CUSTOM_CSS=my-custom-css.css yarn build
```

## Internationalization

OTP-react-redux uses `react-intl` from the [`formatjs`](https://github.com/formatjs/formatjs) library for internationalization.
Both `react-intl` and `formatjs` take advantage of native internationalization features provided by web browsers.

### `i18n` Folder

Language-specific content is located in YML files under the `i18n` folder
(e.g. `en-US.yml` for American English, `fr.yml` for generic French, etc.).

In each of these files:
  - Messages are organized in various categories and sub-categories.
  - A component or JS module can use messages from one or more categories.
  - In the code, messages are retrieved using an ID that is simply the path to the message.
    Use the dot '.' to separate categories and sub-categories in the path.
    For instance, for the message defined in YML below:
    ```yaml
    common
      modes
        subway: Metro
    ```
    then use the snippet below with the corresponding message id:
    ```jsx
    <FormattedMessage id="common.modes.subway" /> // renders "Metro".
    ```

In these YML files, it is important that message ids in the code be consistent with
the categories in this file. Below are some general guidelines:
  - For starters, there are an `actions`, `common`, `components`, and `config`
    categories. Additional categories may be added as needed.
  - Each sub-category under `components` denotes a React component and
    should contain messages that are used only by that component (e.g. button captions).
  - In contrast, some strings are common to multiple components,
    so it makes sense to group them by theme (e.g. accessModes) under the `common` category.

Note: Do not put comments in the YML files. They will be removed by `yaml-sort`!

### Internationalizable content in the configuration file

Most textual content from the `i18n` folder can also be customized on a per-configuration basis
using the `language` section of `config.yml`, whether for all languages at once,
or for each supported individual language.

### Using internationalizable content in the code

Use message id **literals** (no variables or other dynamic content) with either
```jsx
<FormattedMessage id="..." />
```
or
```js
intl.formatMessage({ id: ... })
```

The reason for passing **literals** to `FormattedMessage` and `intl.formatMessage` is that we have a checker script `yarn check:i18n` that is based on the `formatJS` CLI and that detects unused messages in the code and exports translation tables.
Passing variables or dynamic content will cause the `formatJS` CLI and the checker to ignore the corresponding messages and
incorrectly claim that a string is unused or missing from a translation file.

One exception to this rule concerns configuration settings where message ids can be constructed dynamically.

### Contributing translations

OTP-react-redux now uses [Hosted Weblate](https://www.weblate.org) to manage translations!

<figure>
  <a href="https://hosted.weblate.org/engage/otp-react-redux/">
    <img src="https://hosted.weblate.org/widgets/otp-react-redux/-/horizontal-auto.svg" alt="Translation status" />
  </a>
  <figcaption>Translation status for
    <a href="https://hosted.weblate.org/engage/otp-react-redux/">OTP-react-redux and OTP-UI on Hosted Weblate</a>
  </figcaption>
</figure>


Translations from the community are welcome and very much appreciated,
please see instructions at https://hosted.weblate.org/projects/otp-react-redux/.
Community input from Weblate will appear as pull requests with changes to files in the `i18n` folder for our review.
(We reserve the right to edit or reject contributions as we see fit.)

If changes to a specific language file is needed but not enabled in Weblate, please open an issue or a pull request with the changes needed.

## Library Documentation

More coming soon...

As of version 2.0, otp-react-redux utilizes React's context API in a number of components. This changed the way that some components receive props such that they will not work properly unless wrapped with the context provider used in the `ResponsiveWebapp` component.
