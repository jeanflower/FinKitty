Local Jest output (gitignored except this file and rebaseline-targets.example.txt).

  failedTests/              failure dumps (tests--*.txt), LAST_RUN.txt
  rebaseline-targets.txt    scoped Jest / rebaseline:algo queue (start4 syncs from dumps)
  rebaseline-edited.txt     rebaseline:algo --write — tests that were updated
  rebaseline-not-edited.txt rebaseline:algo --write — tests that were not updated
  .rebaseline-capture.txt   rebaseline:algo --write codegen capture

Workflow with start4 + start8:

  ./start4TestLocalWebServer.sh          # failures → rebaseline-targets.txt
  ./start8Rebaseline.sh                # patch algo expectations (--write by default)
  # back in start4: press Enter to re-run scoped tests

Copy the example to seed targets manually:

  cp testResults/rebaseline-targets.example.txt testResults/rebaseline-targets.txt
