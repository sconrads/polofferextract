polcrawl
========

Node.js application that finds these month offers at vinmonopolet.no by reading a mongoDB.

To install:
npm install

To run:
node app.js

You also need to add a Mongo database called pol on localhost. The collection is also called pol:
use pol
db.pol.find().pretty()

Stian Conradsen, 27.10.13
