#!/bin/bash
CI=true npm test -- --testPathIgnorePatterns=browser  --transformIgnorePatterns 'node_modules/(?!dateformat)/' --coverage
