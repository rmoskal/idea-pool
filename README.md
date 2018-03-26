[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# idea-pool

Little work sample for codementorX.

It has no dependencies aside from node 8 and can be run locally or deployed without any special tooling or external dependencies: 

    npm run dev

That starts the app with nodemon, and pulls the config from the .env file.  This holds only  dev environment info only so no secrets are being leaked by having it in the repo. This makes it so much easier to onboard new developers on a project.

Tests are run via 

    npm test

In production run the app like

    npm start

Configs, including secrets, are taken from the environment. In a real production app I would take greater care with them. 

Oh and I use standard as the linter and when running tests it autofixes things.  

## Reviewer Notes 
The code follows a functional style of coding.  The easiest way to orient yourself is in the lib/Api.js file.  There is a function pipeline that composes both promise based and regular functions for each end point.

This is representative of the way I would code a production app like this, these days, including the level of test coverage.

I should have bcrypted the pw and would certainly have if I was using an external data store.  In memory it's probably not a big security risk, plus I figure you will have seen enough to evaluate my coding technique.


I was confused by the [refresh token method](https://small-project-api.herokuapp.com/api-docs#accesstokens-refresh-jwt).  It seems to me that unless it returns another refresh token along with the jwt token, the client can only refresh once.  So I added it.

Also I'm not sure what the point of the logout method since the jwt token can't really be marked as invalid without my saving the users current JWT token on the server.  This seemed wrong to me, so I didn't do it. All I do is to invalidate the refresh token so it can longer be used to refresh a token until the next login.
