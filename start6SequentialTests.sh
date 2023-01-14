if [ -z "$2" ]
then
      echo "Run test(s) matching: $1"
      CI=true npm test -- --transformIgnorePatterns 'node_modules/(?!dateformat)/' -t "$1" -runInBand
else
      echo "Expected one argument, got more."
      echo "Put multi-word test identfiers in double-quotes."
      echo "Quitting without running any tests."
fi