#!/bin/bash
REACT_APP_SERVER_URL_NOT_SECRET=http://localhost:3001/finkitty/  npm test -- --transformIgnorePatterns 'node_modules/(?!dateformat)/'
