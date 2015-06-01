emails Numbers API
==========================================

This is a simple API to look up emails by tags, or return tags by emails.

This application utilizes the following technologies and frameworks:
    Express.js: App Framework
    Sequelize: ODM,
    Redis: Caching
    MySQL: Database,
    Mocha/Chai/Sinon: Unit Testing

 ### Install

     npm install
     bundle install

     Install MySQL and Redis

 ### Start

     npm start  (if MySQL and Redis are already running)

      OR

     foreman start (This will start Redis, MySQL, and Node.js in the right order)

 ### Test

     npm test

 ### API

 ## GET: /tags/by/:email
     This route will find the email matching :email and return all associated tags with the email;

 ## GET: /emails/by/tags?tags[]=<:tag>&tags[]=<:tag2>...
     This route will take the array of tags from the query string and return all associated emails.

 ## POST: /emails/new body:<email:String, tags:[String]>
     This route will create a new email entry with :email as the name with an array of :tags associated with it.

 ## GET: /emails/lookup/:email
     This route will find the email matching :email and return json with an id.

 ## PUT: /emails/:id body:<email:String, tags:[String]>
     This route will find the email matching with the id of :id and update they entry with the new :email and/or :tags provided
