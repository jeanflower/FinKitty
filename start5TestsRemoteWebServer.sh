#!/bin/bash
REACT_APP_SERVER_URL_NOT_SECRET=https://desolate-refuge-81883.herokuapp.com/finkitty/  npm test -- --transformIgnorePatterns 'node_modules/(?!dateformat)/'
