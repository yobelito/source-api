# Source Name Generator

A small microservice which will automatically generate a new unique source slug that is currently unique. 
The source slugs are based off the sources created for the Bespoken Logless utility.

# API
* /v1/sourceName
  * Header:
    * content-type: application/x-www-form-urlencoded
  * parameters
    * name
      * required?: no
      * description: A name to check against.  This will be returned if it is unique.  Otherwise, a unique name based off this
                    name will be provided.  If not provided, a randomly generated name will be given.
                    
# Installation:
  * Locally
    * Docker
      * Prerequisites:
        * Docker installed on machine.
        * Read access to [Bespoken Docker Cloud](https://cloud.docker.com/app/bespoken/repository/list) repository.
        * Read access to Bespoken Amazon AWS S3 bucket.
      * Steps:
        1. In console, navigate to the root project and run 
          ```
            docker build -t source-name-generator .
          ```
          This will create an image with the name `source-name-generator`.
        
        2. Once build completes, run it with:
          ```
            docker run -i -t -e SECRETS_BUCKET_NAME=<bucket_name> -e AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY> -e AWS_SECRET_ACCESS_KEY=<AWS_SECRET_KEY> -p 3000:3000 source-name-generator
          ```
    * Without Docker
      * The project uses the [Firebase Admin API](https://firebase.google.com/docs/database/admin/start) to log in to the Firebase console to check sources.
      * To start the server locally, you must provide firebase admin credentials which can be downloaded from firebase. 
        * The credentials for this are not provided by the project. 
        * If you do not have access to the Firebase project, then you must create your own and modify the code to check against that.
      * Set the `"private_key` and `client_email` environment variables which correspond directly with the values provided in the `credentials.json`. 
      * Run 
        ```
          npm start
         ```
         
