#!/bin/bash
cd ./../FinServer
MONGODB_URI_JAF=mongodb://127.0.0.1:27017/FinKittyData NODE_ENV=development node index.js
