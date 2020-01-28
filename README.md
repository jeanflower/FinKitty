This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Storing the data
### Cloud data
The default database is accessed through the REST calls made in REST_db.ts.
The data is stored as triples (userID, modelName, JSON model data) with
(userID, modelName) as a key.

### Offline, local data
A setting in .env switches the location of the data.
To use local data you can provide a REST interface 
on localhost 
(e.g. run https://github.com/jeanflower/FinServer 
locally and make it use a local mongo database).

## Getting started for developers

### On-off setup steps
Install git and npm

git clone this repo, go into the finance folder, and do npm install.

The non-default offline mode which uses a local database needs the browser
to accept non-origin info from the database calls.  Use Chrome and set Access-Control-Allow-Origin (just while developing) using the ModHeader chrome extension. i.e. install this
https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj?hl=en
and once the Chrome extension is installed, in the ModHeader Chrome extension, import the modHeader.json profile.

## Everyday scripts for developers

### Allow CORS if using (non-default) local DB
During development, allow cors in Chrome.  In the ModHeader extension, check the box next to "Access-Control-Allow-Origin" modification.

### Start the web server for the app
Switch the setting in the .env file to not use a /FinKitty appendage.
(the github pages deployment _does_ need that appendage).

Start the web server locally:
`npm start` or `./startWebServer.sh`
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Watch out for lint errors in the console.

### Run the tests
`npm test` or `./startTests.sh`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

The browser tests (automated with selenium) will fail unless the web server is running (do 'npm start' before 'npm test').

The selenium tests fire up and drive Chrome processes.  If the tests properly complete, the Chrome process for the tests should close down properly.  But the chromedriver process does not get cleaned up.  If the tests are interrupted (e.g. restart partway through) then the cleanup does not occur.  After a lengthy testing session, you may prefer to clean up manually; open Activity Monitor, search by the text "chrome", and in a terminal window, `killall chromedriver` and `killall "Google Chrome"`.

See coverage by typing `npm test -- --coverage`.
(this seems to be dependent on changed files, not all tests)

### Linting
Run `./lintFixes.sh` keeps things clean.
Running the web server also reports linting issues in the console.

### Publishing to github pages
Type
`npm run deploy`
and go to
https://jeanflower.github.io/FinKitty/

Setup was based on the guide here
https://reactgo.com/deploy-react-app-github-pages/

### `npm run build`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This repo has been ejected from the default create-react-app
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

