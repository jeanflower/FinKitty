#!/bin/bash
npm test -- --transformIgnorePatterns 'node_modules/(?!dateformat)/'
