#!/bin/bash
git push heroku main

# The above takes all commits (they don't have to be pushed)
# onto heroku.
# It means we might make a commit to, for example, set a publishable key for our Heroku instance
# We can commit that key change, push to heroku, and use the following to uncommit that last commmit
# git reset HEAD~1 
# Then we won't push that commit up to our github repo for others to pick up

# to push through despite merge conflicts
# git push -f heroku main

# to push dev branch
# git push heroku dev:main
