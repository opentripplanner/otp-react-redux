echo 'rebuilding..'
yarn prepublish
echo 'copying built js..'
cp -r ./build ~/git/trimet-mod-otp/node_modules/otp-react-redux
echo 'done'
