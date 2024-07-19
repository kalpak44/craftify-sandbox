#!/bin/bash

# Define the URL for the POST request
URL="http://localhost:8080/recipes"

# Define the JSON data for the recipe
recipe='{
  "recipe": [
    {
      "productSearch": {
        "productName": "Eggs",
        "attributes": {},
        "tags": {}
      },
      "actions": [
        {
          "type": "subtraction",
          "parameters": {
            "type": "quantity",
            "amount": 2,
            "unit": "count"
          }
        }
      ]
    },
    {
      "productSearch": {
        "productName": "Olive Oil",
        "attributes": {
          "brand": "Extra Virgin",
          "origin": "Italy",
          "type": "Cold Pressed"
        },
        "tags": {}
      },
      "actions": [
        {
          "type": "subtraction",
          "parameters": {
            "type": "volume",
            "amount": 50,
            "unit": "ml"
          }
        }
      ]
    }
  ],
  "resultingProduct": {
    "name": "Omelette",
    "tags": {
      "category": "Dish",
      "diet": "Vegetarian"
    },
    "attributes": {
      "type": "Cooked"
    }
  }
}'

# Send the POST request with the recipe data
curl -X 'POST' -H 'Content-Type: application/json' -d "$recipe" "$URL"
