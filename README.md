# Source Name Generator

[![CircleCI](https://circleci.com/gh/bespoken/source-api.svg?style=svg)](https://circleci.com/gh/bespoken/source-api)
[![codecov](https://codecov.io/gh/bespoken/source-api/branch/master/graph/badge.svg)](https://codecov.io/gh/bespoken/source-api)

A small microservice which will automatically generate a new unique source slug that is currently unique. 
The source slugs are based off the sources created for the Bespoken Logless utility.

# API
* /v1/sourceId
  * Type: GET
  * Header:
    * content-type: application/x-www-form-urlencoded
  * Parameters
    * id
      * required?: no
      * description: A name to check against.  This will be returned if it is unique.  Otherwise, a unique name based off this
                    name will be provided.  If not provided, a randomly generated name will be given.
  * Return
    * StatusCode: 200 for success or 40x for failure.
    * StatusMessage: "Success" for success or an error message for failure.
    * Body: A JSON payload that contains a name and secret key that can be used for source creation.
      ```
        {
           id: string,
           secretKey: string
        }
      ```
                    
* /v1/createSource
   * Type: POST
   * Header:
     * content-type: application/json
   * Body:
      * A body containing the source that was created.
        ```
        {
          source: {
             id: string, (Required) - A unique identifier for the source. If it already exists, the callback will return with an error.
             secretkey: string, (Required) - A key with which logs will be sent to by the logless database.
             name: string, (Optional) - A human readable name. If not present, the ID provided will be used.
             created: string, (Optional) - ISO Formatted time stamp of the creation date. If not present, the time of creation will be the local server time.
          }
        }
        ```
   * Return:
      * StatusCode: 200 for success; 40x for failure
      * StatsMessage: "Success" for success; an Error message for failure
      * body: If successful, the newly created source
        ```
        {
           source: {
              id: string,
              secretkey: string,
              name: string,
              created: string,
              members: {
                 <memberIdString>: <memberType>
                 <memberIdString>: <memberType>
                 ...
                 <memberIdString>: <memberType>
              }
        }
        ```
      
* /v1/linkSource
   * Type: POST
   * Header:
     * content-type: application/json
   * Body:
     * A JSON comprising of the user to link and the source to link it to.
       ```
       {
         user: {
            userId: string (Required) - A user ID that corresponds with one of the users in Firebase.
         },
         source: {
            id: string, (Required) - A unique identifier for the source. If it already exists, the callback will return with an error.
            secretkey: string, (Required) - A key with which logs will be sent to by the logless database.
            name: string, (Optional) - A human readable name. If not present, the ID provided will be used.
            created: string, (Optional) - ISO Formatted time stamp of the creation date. If not present, the time of creation will be the local server time.
         }
       }
       ```
   * Return:
      * StatusCode: 200 for success; 40x for failure.
      * StatsMessage: "Success" for success; an Error message for failure
      * body: If successful, the source with the new owner and the user that was passed in.
        ```
        {
           user: {
              userId: string
           },
           source: {
              id: string,
              secretkey: string,
              name: string,
              created: string,
              members: {
                 <userID>: "owner"
                 <memberIdString>: <memberType>
                 ...
                 <memberIdString>: <memberType>
              }
        }
        ```
               
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
         
