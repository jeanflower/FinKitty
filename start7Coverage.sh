#!/bin/bash
CI=true npm test -- --testPathIgnorePatterns=browser  --coverage
