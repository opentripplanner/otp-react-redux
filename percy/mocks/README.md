# About mocks in this folder

GraphQL fields cannot be renamed in mock JSON files in this folder.
They must match the original schema, otherwise their values will be set to null.

In Javascript, we sometimes write:
```
stop {
  code
  id: gtfsId
  lat
  lon
  name
  stopId: gtfsId
  wheelchairBoarding
}
```

In the snippet above, `id` and `stopId` come from the original `gtfsId` field in the GraphQL schema.

The corresponding mock JSON file must include the `gtfsId` field for the mock to succeed:
```json
"stop": {
  "code": "901",
  "gtfsId": "Agency:40",
  "lat": 33.754517,
  "locationType": "STOP",
  "lon": -84.469824,
  "name": "Hamilton Station",
  "wheelchairBoarding": "POSSIBLE"
}
```

Note that `id` and `stopId` are not needed in the JSON files. Instead, the mock GraphQL server will
take care of mapping fields per the GraphQL query received.
