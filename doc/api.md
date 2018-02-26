# API convention for client-server comminication

## Overview

This is a draft for api. Need to add auth api chapter, and review bet api. All comminucations goes in CRUD style, encoded in json.

There are two Entities here: topics and predictions. Topic is a some future event or state. Users can bet on topic — make prediction.

## Authorization

//TODO

## Topic

Bet is a entity user can only commit.

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

In bad case we get `status` like `"error"` and `message` describes what was error about:
```
{
  "status": "error",
  "message":"Initial credence is missed"
}
```

### Reading topics

url: GET `/api/topic/all`

Response looks like:
```
{
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
