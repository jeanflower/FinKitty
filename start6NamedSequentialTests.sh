#!/bin/bash
# Browser tests: optional zoom (e.g. export FINKITTY_BROWSER_PAGE_ZOOM=0.85 before running).
# The variable is passed through to Jest/Node automatically when exported.
if [ -z "$2" ]
then
      if [ -n "${FINKITTY_BROWSER_PAGE_ZOOM:-}" ]; then
        echo "FINKITTY_BROWSER_PAGE_ZOOM=$FINKITTY_BROWSER_PAGE_ZOOM"
      fi
      echo "Run test(s) matching: $1"
      CI=true npm test -- -t "$1" -runInBand
else
      echo "Expected one argument, got more."
      echo "Put multi-word test identfiers in double-quotes."
      echo "Quitting without running any tests."
fi
