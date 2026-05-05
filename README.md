# 🍽️ MealMate – Recipe Discovery App

A responsive web app to search recipes, browse by category, view cooking details and save favorites.

## 👥 Team

| Name | Role |
|------|------|
| Kastriot Sejdiji | HTML structure & CSS styling |
| Jetmir Alilov | JavaScript, API integration & interactivity |

## 🛠️ Technologies

- HTML5, CSS3 (Flexbox, Grid, Animations)
- JavaScript ES6+, jQuery 3.7.1
- Fetch API (async requests)
- LocalStorage (favorites)
- Font Awesome 6.5, Google Fonts (Poppins)

## 🌐 External API

**TheMealDB** – https://www.themealdb.com/api.php
- `GET /search.php?s={query}` – search meals
- `GET /filter.php?c={category}` – filter by category
- `GET /lookup.php?i={id}` – full meal details
- `GET /categories.php` – all categories

## ✨ Features

- 🔍 Search recipes by name (live)
- 🗂️ Browse by category
- 📋 Full recipe modal with ingredients, instructions & YouTube link
- ❤️ Save favorites with LocalStorage
- 📱 Fully responsive (desktop, tablet, mobile)

## 🚀 Run Locally

1. `git clone https://github.com/kastri0t1/mealmate-app.git`
2. Open `index.html` in browser — no server needed!