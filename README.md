Authentication Using JSON Web Token (JWT)
=========================================
In this part, we will continue to improve the application and add authentication to it.

ex. 

POST /login

{
  "success": true,
  "message": "You have successfully logged in!",
  "token": "<HEADER>.<PAYLOAD>.<SIGNATURE>",
  "user": {}
}

Once you recieve a success:true, extract the token value and save it in the userStore. From then on, on every request from the client add the following header:

authorization: "Bearer <HEADER>.<PAYLOAD>.<SIGNATURE>"