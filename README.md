[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# idea-pool

Little work sample for codementorX. It fulfills the requirements laid out here:

https://github.com/codementordev/cm-quiz

It's the backend for a fancy to-list, with JWT authentication.

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
 The easiest way to orient yourself is in the lib/Api.js file.  There is a function pipeline that composes both promise based and regular functions for each end point. I try to walk a fine line between writing idiomatic javascript and leaning on FP techniques. You decide whether it's true or not!

This is pretty representative of the way I would code a production app, these days, including the level of test coverage.

I tend to use the notion of an application factory that works like a lightweight DI container.  Modules are wrapped in a top level function that accepts dependencies.  It's a pattern I've taken from the way I used organize my Flask applications. It makes it easy to test api end points and also make it easy to spin up worked processes with access to application resources.

I should have bcrypted the pw and would certainly have if I was using an external data store.  In memory it's probably not a big security risk, plus I figure you will have seen enough to evaluate my coding technique.


