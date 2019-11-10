#!/bin/bash
# following path is machine-specific
# should use something like an env variable?
cd ../../dynamodb_local_latest
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb --cors "*"
