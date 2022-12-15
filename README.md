This is a Rest API

## Getting Started
After Pulling the repo please run the following commands run the the api:

```bash
npm install
npm run start
```

# Authentication Credentials:

```bash
   email: newtest@test.com
   password: test
```

## DB 
- I am using mysql and have included the db dump on this repo
- Create mysql DB called king-james and import the mysql dump

# Routes 
- For now the only route working from client is `get users` for all others please use postman
- auth will be `Bearer Token` 
- `Token : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTY3MDg0ODUxMn0._iAsFmLmxekvOYnA_xKbXjlm0I0M74au0W5JoITlyVg"`

## Authoorization
The app has two users
- Administrator : can view all users and add or update user
- Customer: Can only view their information
