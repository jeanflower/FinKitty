#!/bin/bash
# Browser tests: optional FINKITTY_BROWSER_HEADLESS, PAGE_ZOOM, WINDOW_WIDTH/_HEIGHT.
if [ -z "$2" ]
then
      if [ -n "${FINKITTY_BROWSER_HEADLESS:-}" ]; then
        echo "FINKITTY_BROWSER_HEADLESS=$FINKITTY_BROWSER_HEADLESS"
      fi
      if [ -n "${FINKITTY_BROWSER_PAGE_ZOOM:-}" ]; then
        echo "FINKITTY_BROWSER_PAGE_ZOOM=$FINKITTY_BROWSER_PAGE_ZOOM"
      fi
      if [ -n "${FINKITTY_BROWSER_WINDOW_WIDTH:-}" ]; then
        echo "FINKITTY_BROWSER_WINDOW_WIDTH=$FINKITTY_BROWSER_WINDOW_WIDTH"
      fi
      if [ -n "${FINKITTY_BROWSER_WINDOW_HEIGHT:-}" ]; then
        echo "FINKITTY_BROWSER_WINDOW_HEIGHT=$FINKITTY_BROWSER_WINDOW_HEIGHT"
      fi
      echo "Run test(s) matching: $1"
      CI=true npm test -- -t "$1" -runInBand
else
      echo "Expected one argument, got more."
      echo "Put multi-word test identfiers in double-quotes."
      echo "Quitting without running any tests."
fi
