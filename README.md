The deployed page for FinKitty is here
https://jeanflower.github.io/FinKitty/
 
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

## Authentication
Is handled by Auth0, code in 
/src/contexts/auth0-context.js
Logo handling was understood by reading
https://community.auth0.com/t/company-logo-upload-not-url/38910/8
and then adding link to (raw)
https://github.com/jeanflower/FinKitty/raw/master/src/views/cat.png 
in Auth0 Tenant Settings page.

## Getting started for developers

### One-off setup steps
Install git and npm

git clone this repo, go into the FinKitty folder and do npm install.

If you see warnings, and an invitation to npm audit, then try
``npm audit --production``
to hide warnings which are issued only from the build tooling, and so not important to resolve (see https://github.com/facebook/create-react-app/issues/11174).

This repo works stand-alone if there's a REST server
for it to query and update.  E.g. there's a cloud server 
running on Heroku and this app can work with that.

Optionally, for local testing or development free of a network,
install the sister repo; FinServer, which provides the required
REST interface for finkitty to interact with. 
https://github.com/jeanflower/FinServer

The FinServer app works with a mongo database.
There's one running in the cloud or
install a local DB, e.g. following instructions here
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

The `start*.sh` scripts expect a folder structure
with FinKitty, FinServer inside a FinKitty folder, and mongo as sibling to the top FinKitty folder.

## Everyday scripts for developers

### Run a local web server for the app
For local database and fast, network-free development
and testing, ensure you have FinServer and mongo
set up, then run the four scripts in sequence
```
./start1LocalDB.sh
./start2LocalRESTServer.sh
./start3LocalDBAndWebServer.sh
./start4Tests.sh
```
To start the web server locally but still use cloud db:
`./startLocalWebServer.sh`

Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

Watch out for lint errors in the console from either
`startLocalWebServer.sh` or `start3LocalDBAndWebServer.sh`.

### Run the tests
`npm test` or `./startTests.sh`

Or `CI=true npm test -- --t='match this string to test name'`.

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

The browser tests (automated with selenium) will fail unless the web server is running (do 'npm start' before 'npm test').

The selenium tests fire up and drive Chrome processes.  If the tests properly complete, the Chrome process for the tests should close down properly.  But the chromedriver process does not get cleaned up.  If the tests are interrupted (e.g. restart partway through) then the cleanup does not occur.  After a lengthy testing session, you may prefer to clean up manually; open Activity Monitor, search by the text "chrome", and in a terminal window, `killall chromedriver` and `killall "Google Chrome"`.

Updating the Chrome browser on the test machine can leave Chrome and the chromdriver out of sync.  To recover, use
```
npm install chromedriver --detect_chromedriver_version
```

If the latest chromedriver on npm falls behind the version needed for the installed Chrome, here are some steps to tide things over:
 - download the appropriate zip file from https://chromedriver.storage.googleapis.com/index.html
 - delete the chromedriver entry from package.json
 - install chromedriver using something equivalent to 
 ``npm install chromedriver --chromedriver_filepath=/Users/jeanflower/Downloads/chromedriver_mac64_m1.zip``
 - revert changes to package.json, package-lock.json

 Here's how to update or add a new dependency in the context of the locally-installed chromedriver.
 - install the new dependency using something like
 ``npm install newpackage@3.4.5`` or ``npm update existingPackage``
 - stage the changes to package.json
 - delete the chromedriver entry from package.json
 - install chromedriver using something equivalent to 
 ``npm install chromedriver --chromedriver_filepath=/Users/jeanflower/Downloads/chromedriver_mac64_m1.zip``
 - revert changes to package.json, package-lock.json
 - run tests to see if the newpackage is working as expected

See coverage by typing `CI=true npm test -- --coverage`, then look for /coverage/index.html for the results.  To exclude selenium browser tests (which don't seem to generate coverage data anyway), use `CI=true npm test -- --testPathIgnorePatterns=browser  --coverage`, or to use the local server, `REACT_APP_ORIGIN_APPENDAGE= REACT_APP_SERVER_URL_NOT_SECRET=http://localhost:3001/finkitty/ CI=true npm test -- --testPathIgnorePatterns=browser  --coverage`


### Linting
Run `./lintFixes.sh` keeps things clean.
Running the web server also reports linting issues in the console.
The husky pre-push hook does linting and blocks a push which fails the linter.

### Commits and versioning hooks
The husky pre-commit hook edits files to bump the patch version.
This not-yet-commited version bump serves as a reminder - 
either commit it as a followup (if the change should have been versioned) 
or change to a minor or major version change, or discard.

### Publishing to github pages
Type
`npm run deploy`
and go to
https://jeanflower.github.io/FinKitty/


### `npm run build`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This repo has been ejected from the default create-react-app
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

