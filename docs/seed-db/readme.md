# Seed Database

This tutorial will create a local copy from [Colombia Peace Referendum](http://vota.plebiscitodigital.co)

0. **Install MongoDB**

    Follow the instructions [Install MongoDB Community Edition](https://docs.mongodb.com/v3.2/administration/install-community/)

0. **Run App**

    In the repository directory type:

    ```sh
    $ meteor npm run start:dev
    ```

0. **Clear Local Database**

    Open a new terminal in the repository directory and type:

    ```sh
    $ meteor mongo          # Will connect to meteor mongo
    $ use meteor            # Will load the meteor database
    $ db.dropDatabase()     # Will clear the database
    ```

0. **Load Database**

    Open a new terminal in the `docs/seed-db` directory and type:

    ```sh
    mongorestore -h localhost:3001 -d meteor bson
    ```
    >This will load the Colombia Peace Referendum database

    Go to **meteor mongo** terminal and type the following to validate the new dabatase
    ```sh
    $ show tables          # Will show all the collections: collectives, contracts, tags, transactions, users, files
    $ db.collectives.find().pretty()    #Will show the content from collectives
    ```

0. **Change Config file data**

    Go to `config/development/settings` and change:
      * `Collective.name` field from "Democracy Earth" to "República de Colombia".
      * `Collective.domain` field from "https://localhost:3000" to "https://vota.plebiscitodigital.co"

0. **Reset App**

    You will have to restart the app again in order to get the correct collection _id. This will load the database again and the main program

    Now you can test Sovereign app locally.

    If you want to contribute, don't forget to follow our [recomendations](../readme.md#development)
