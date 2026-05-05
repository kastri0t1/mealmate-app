// ============================================================
// MEALMATE - app.js
// All JavaScript for the MealMate Recipe Discovery App
// ============================================================

// ========== API BASE URL ==========
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// ========== FETCH FUNCTIONS ==========

// Search meals by name (e.g. "chicken")
async function fetchMealsBySearch(query) {
  const res = await fetch(`${API_BASE}/search.php?s=${query}`);
  const data = await res.json();
  return data.meals || [];
}

// Get meals filtered by a category (e.g. "Beef")
async function fetchMealsByCategory(category) {
  const res = await fetch(`${API_BASE}/filter.php?c=${category}`);
  const data = await res.json();
  return data.meals || [];
}

// Get full details of one meal by its ID
async function fetchMealById(id) {
  const res = await fetch(`${API_BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals ? data.meals[0] : null;
}

// Get all meal categories
async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories.php`);
  const data = await res.json();
  return data.categories || [];
}

// ========== SHOW LOADING SKELETONS ==========
function showLoading() {
  const grid = $('#mealsGrid');
  grid.empty();
  let skeletons = '';
  for (let i = 0; i < 8; i++) {
    skeletons += '<div class="skeleton skeleton-card"></div>';
  }
  grid.html(skeletons);
}
// ========== RENDER MEAL CARDS ==========
function renderCards(meals) {
  const grid = $('#mealsGrid');
  const empty = $('#emptyState');
  grid.empty();

  if (!meals || meals.length === 0) {
    empty.show();
    return;
  }

  empty.hide();
  const favorites = getFavorites();

  meals.forEach(meal => {
    const isFav = favorites.some(f => f.idMeal === meal.idMeal);
    const card = `
      <div class="meal-card" data-id="${meal.idMeal}">
        <img class="meal-card__img" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
        <div class="meal-card__body">
          <div class="meal-card__title">${meal.strMeal}</div>
          <div class="meal-card__category">${meal.strCategory || ''}</div>
        </div>
        <button class="meal-card__fav ${isFav ? 'active' : ''}"
          data-id="${meal.idMeal}"
          data-thumb="${meal.strMealThumb}"
          data-name="${meal.strMeal}">
          <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
    `;
    grid.append(card);
  });
}

// ========== INITIAL PAGE LOAD ==========
async function init() {
  showLoading();
  const meals = await fetchMealsBySearch('chicken');
  $('#sectionTitle').text('🔥 Popular Meals');
  renderCards(meals);
}

$(document).ready(function () {
  init();
});
// ========== SEARCH ==========
$(document).ready(function () {

  // When user clicks the search button
  $('#searchBtn').on('click', async function () {
    const query = $('#searchInput').val().trim();
    if (!query) return;
    showLoading();
    $('#sectionTitle').text(`🔍 Results for "${query}"`);
    $('.cat-btn').removeClass('active');
    const meals = await fetchMealsBySearch(query);
    renderCards(meals);
  });

  // When user presses Enter in the search input
  $('#searchInput').on('keypress', async function (e) {
    if (e.key === 'Enter') {
      const query = $(this).val().trim();
      if (!query) return;
      showLoading();
      $('#sectionTitle').text(`🔍 Results for "${query}"`);
      $('.cat-btn').removeClass('active');
      const meals = await fetchMealsBySearch(query);
      renderCards(meals);
    }
  });

});
// ========== CATEGORIES ==========
async function loadCategories() {
  const categories = await fetchCategories();
  const container = $('#categoriesContainer');
  container.empty();

  // "All" button first
  container.append('<button class="cat-btn active" data-category="all">🍽️ All</button>');

  // First 12 categories only (enough choices, not too many)
  categories.slice(0, 12).forEach(cat => {
    container.append(
      `<button class="cat-btn" data-category="${cat.strCategory}">${cat.strCategory}</button>`
    );
  });
}

$(document).ready(function () {

  loadCategories();

  // When a category button is clicked
  $(document).on('click', '.cat-btn', async function () {
    $('.cat-btn').removeClass('active');
    $(this).addClass('active');

    const category = $(this).data('category');
    $('#searchInput').val(''); // clear search bar

    if (category === 'all') {
      showLoading();
      $('#sectionTitle').text('🔥 Popular Meals');
      const meals = await fetchMealsBySearch('chicken');
      renderCards(meals);
    } else {
      showLoading();
      $('#sectionTitle').text(`🍽️ ${category} Meals`);
      const meals = await fetchMealsByCategory(category);
      renderCards(meals);
    }
  });

});