# API convention for client-server comminication

## Overview

This is a draft for api. Need to add auth api chapter, and review bet api. All comminucations goes in CRUD style, encoded in json.

There are two Entities here: topics and predictions. Topic is a some future event or state. Users can bet on topic — make prediction.

## Basic

### Requests

Reading is going with GET method and optional query parameters. It's never have body.

Creating is going with POST method, all parameters is provided in json encoded body. Response must always contains ids of new created entities.

### Responses

Response is always going with json encoded body with required `status` field. Status may have `"ok"` or `"error"` value. In good case it usually contains some other fields:
```
{
  "status": "ok",
  "id":"1d1234rfde41-12dsf34re34"
}
```

In case of error response must contains `message` field describes error.
```
{
  "status": "error",
  "message":"Initial credence is missed"
}
```
//fixme do we need here error code?

## Authorization

//TODO

## Topic

### Creating topic

Topic is creating with your initial prediction. So, this method creates two entities.

url: POST `/api/topic`
body:
```
{
  "text" : "Human will get on Mars at 2020",
  "credence" : 80,
}
```
Where:
* `text` — is topic description.
* `credence` - is your credence to start topic.

In good response we get `status` like `"ok"` and `id`, which is created topic's id:
```
{
  "status": "ok",
  "id":"1d1234rfde41-12dsf34re34"
}
```

### Reading topics

url: GET `/api/topic/all`

Response looks like:
```
{
  "status": "ok",
  "topics": [
    {
      "id" : "1d45tf356-ytr4523we",
      "text" : "description",
      "creator" : {
        "id" : "1d423oej56-1tr4qwf6e",
        "name" : "Name or nickname"
      }
      "predictions": [
        {
          "id" : "1d84725h-82734h",
          "user" : "1d3457htf-345ufh"
          "credence" : 80,
        },
      ]
    },
    { ... }
  ]
}
```

### Reading one topic

url: GET `/api/topic/:id`

Response is:
```
{
  "status": "ok",
  "topic" : {
    "id":"1d1234rfde41-12dsf34re34",
    "text": "desctiption",
    "creator" : {
      "id" : "1d423oej56-1tr4qwf6e",
      "name" : "Name or nickname"
    }
    
}
```

## Predictions

### Create prediction

url: POST `/api/prediction/`
In a body we pass `topic` id and user's `credence`:
```
{
  "topic": "1d24598t2459-29u45fh298"
  "credence" : 80
}
```

Response is:
```
{
  "status": "ok",
  "id":"1d1234rfde41-12dsf34re34"
}
```
