#!/bin/bash
cd db
curl -o listing.json https://toolbox-data.anchore.io/grype/databases/listing.json
jq --arg v1 "$v1" '  { "available": { "1" : [.available."1"[0]] , "2" : [.available."2"[0]], "3" : [.available."3"[0]] , "4" : [.available."4"[0]] , "5" : [.available."5"[0]] } }' listing.json > listing.json.tmp
mv listing.json.tmp listing.json
for i in {1..5}; do
  URL="$(cat listing.json | jq -r '.available."'$i'"[0].url')"
  curl $URL -o $(basename $URL)
done
rm listing.json
cd -;