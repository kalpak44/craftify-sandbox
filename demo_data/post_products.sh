#!/bin/bash

# Define the URL for the POST requests
URL="http://localhost:8080/products"

# Define the JSON data for each product
declare -a products=(
'{
  "name": "Olive Oil",
  "attributes": {
    "brand": "Extra Virgin",
    "origin": "Italy",
    "type": "Cold Pressed"
  },
  "measurements": {
    "volume": {
      "1000": "ml"
    }
  },
  "tags": {
    "category": "Oil",
    "usage": "Cooking",
    "diet": "Vegan"
  },
  "availability": {},
  "categories": ["Oils","Vegan"]
}'
'{
  "name": "Parmesan Cheese",
  "attributes": {
    "brand": "Parmigiano Reggiano",
    "origin": "Italy",
    "type": "Aged"
  },
  "measurements": {
    "weight": {
      "200": "g"
    }
  },
  "tags": {
    "category": "Dairy",
    "usage": "Cooking",
    "diet": "Vegetarian"
  },
  "availability": {
    "weight": {
      "20": "g"
    }
  },
  "categories": ["Vegetarian"]
}'
'{
  "name": "Basil",
  "attributes": {
    "variety": "Genovese",
    "origin": "Italy",
    "type": "Fresh"
  },
  "measurements": {
    "weight": {
      "30": "g"
    },
    "package": {
      "4": "count"
    }
  },
  "tags": {
    "category": "Herb",
    "usage": "Cooking",
    "diet": "Vegan"
  },
  "availability": {
    "weight": {
      "30": "g"
    },
    "package": {
      "1": "count"
    }
  },
  "categories": ["Vegan", "Herb"]
}'
'{
  "name": "Eggs",
  "attributes": {
    "variety": "Free-range",
    "origin": "Bulgaria",
    "type": "Organic",
    "size": "XL"
  },
  "measurements": {
    "quantity": {
      "10": "count"
    },
    "price": {
      "5": "usd"
    }
  },
  "tags": {
    "category": "Dairy",
    "usage": "Cooking",
    "diet": "Vegetarian",
    "product": "Eggs"
  },
  "availability": {},
  "categories": ["Vegetarian"]
}'
'{
  "name": "Eggs",
  "attributes": {
    "variety": "Free-range",
    "type": "Organic",
    "size": "M"
  },
  "measurements": {
    "quantity": {
      "6": "count"
    }
  },
  "tags": {
    "category": "Dairy",
    "usage": "Cooking",
    "diet": "Vegetarian",
    "product": "Eggs"
  },
  "availability": {},
  "categories": ["Vegetarian"]
}'
)

# Loop through the products array and send a POST request for each
for product in "${products[@]}"
do
  curl -X 'POST' -H 'Content-Type: application/json' -d "$product" "$URL"
done
