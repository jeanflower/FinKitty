This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Storing the data - unless you have a DB running, this app will fail to work
In principle this could work with an AWS DB, once we want to start paying for that and have properly secure credentials set up.

For now, the app uses a local DB (so you have control over your data).

As a one-off, install dynamodb locally from here https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html
This uses java (Java Runtime Environment (JRE) version 6.x or newer) so you may need to install that too.

Every time you want to use the page, have the dynamo DB running. Run this in the local dynamo folder.
`java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb --cors "*"`

There's a startDB.sh script in this repo, but the path to the dynamo install is hardcoded in that script so may need adjustment for your environment.

## Getting started for developers

Install git and npm

git clone this repo, go into the finance folder, and do npm install.

Use Chrome and set Access-Control-Allow-Origin (just while developing) using the ModHeader chrome extension. i.e. install this
https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj?hl=en
and once the Chrome extension is installed, in the ModHeader Chrome extension, import the modHeader.json profile.

## Everyday scripts for developers

### Allow CORS
During development, allow cors in Chrome.  In the ModHeader extension, check the box next to "Access-Control-Allow-Origin" modification.

### Start the web server for the app
`npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Run the tests
`npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

The browser tests (automated with selenium) will fail unless the web server is running (do 'npm start' before 'npm test').

The selenium tests fire up and drive Chrome processes.  If the tests properly complete, the Chrome window for the tests should close down properly.  But the chromedriver process does not get cleaned up.  If the tests are interrupted (e.g. restart partway through) then the cleanup does not occur.  After a lengthy testing session, you may prefer to clean up manually; open Activity Monitor, search by the text "chrome", and in a terminal window, `killall chromedriver` and `killall "Google Chrome"`.

### Publishing to github pages
Type
npm run deploy
and go to
https://jeanflower.github.io/FinKitty/

Setup was based on the guide here
https://reactgo.com/deploy-react-app-github-pages/

### `npm run build`
(has never been exercised on this repo)

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This repo has been ejected from the default create-react-app
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

