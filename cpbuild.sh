echo 'rebuilding..'
yarn prepublish
echo 'copying built js..'
cp -r ./build ~/dev/otp/trimet-mod-otp/node_modules/otp-react-redux
echo 'done'
