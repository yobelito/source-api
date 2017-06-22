# Source API

[![CircleCI](https://circleci.com/gh/bespoken/source-api.svg?style=svg)](https://circleci.com/gh/bespoken/source-api)
[![codecov](https://codecov.io/gh/bespoken/source-api/branch/master/graph/badge.svg)](https://codecov.io/gh/bespoken/source-api)

A small microservice which provides an API for our Firebase data.

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
    * Prerequisites:
      * For running locally, the following environment variables must be set:
        * API_TOKEN - The token to be used for access
        * CODECOV_TOKEN - The token for code coverage [Optional for local, required for CI builds]
        * FIREBASE_EMAIL - The email of the Firebase service account user
        * FIREBASE_KEY - The key for the Firebase service account user
        * env - The environment - either dev or prod for which firebase environment to use
  * For deployments to Hyper:
    * These environment variables must be set, in addition the ones above:
      * SSL_CERT - The SSL cert contents to use - be sure to escape newlines
      * SSL_KEY - The SSL key contents to use - be sure to escape newlines
    * To run a deployment, create a new release that is prefixed with prod-[sequence]
      * The sequence number should be incremented by 1 every time
      * The tagged version will be automatically deployed to Hyper

         
