FROM mongo

COPY seed.json /seed.json
CMD mongoimport --host mongodb --db websocket-example --collection users --type json --file /seed.json --jsonArray
