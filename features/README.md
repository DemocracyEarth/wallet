This is an experimental feature suite in Gherkin.
It's a heavy work-in-progress.

Ideally running the feature suite should not ruin the dev database,
and it should be done using a meteor command such as test-features.


## Run

Launch the development server :

    $ meteor npm run start:dev

Then, in another terminal, run :

    $ chimp --chai --ddp=http://localhost:3000


## Assert

Assertions are done using [Chai](http://chaijs.com/).


## Pitfalls

### Cannot find module 'chai-string'

    $ npm install --save-dev chai-string