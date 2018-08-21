# syncsample

This is just the fh-sync samples configured to run in a docker-compose.  This is just to make it easier for me to use the samples and is not intended for production use.
It starts containers with redis and mongdb which will be used by the sync server to store data.  The mongo data is persisted in the `data` folder.
There are also `client` and `server` folders, which are mounted inside 2 containers to run the server app, and serve the client app on port 8000..

## client

This contains a slightly modified sample app from the [`fh-sync-js`](https://github.com/feedhenry/fh-sync-js) module.  This app is served on port 8000 and it will sync with the server app.

## server

This contains a slightly modified sample app from the [`fh-sync`](https://github.com/feedhenry/fh-sync) module, it syncs wiht clients which connect, and uses the redis and mongodb containers to persist the data.

## Installation

```
git clone https://github.com/mmurphy/syncsample.git
cd syncsample
docker-compose up
# you can now point a browser at http://localhost:8000
```


