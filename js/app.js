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
// ========== MODAL ==========
$(document).ready(function () {

  // Open modal when a meal card is clicked (but NOT the heart button)
  $(document).on('click', '.meal-card', async function (e) {
    if ($(e.target).closest('.meal-card__fav').length) return; // ignore heart clicks

    const id = $(this).data('id');

    // Show spinner while loading
    $('#modalContent').html('<div class="spinner-wrap"><i class="fa-solid fa-spinner spinner"></i></div>');
    $('#modalOverlay').addClass('open');
    $('body').css('overflow', 'hidden'); // prevent background scroll

    const meal = await fetchMealById(id);
    if (!meal) return;

    // Build ingredient tags (API has up to 20 ingredient fields)
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
      }
    }

    const ingredientTags = ingredients
      .map(ing => `<span class="ingredient-tag">${ing}</span>`)
      .join('');

    const youtubeBtn = meal.strYoutube
      ? `<a href="${meal.strYoutube}" target="_blank" class="modal__youtube">
           <i class="fa-brands fa-youtube"></i> Watch on YouTube
         </a>`
      : '';
    // Render full modal content
    $('#modalContent').html(`
      <img class="modal__img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <div class="modal__body">
        <h2 class="modal__title">${meal.strMeal}</h2>
        <div class="modal__meta">
          <span><i class="fa-solid fa-tag"></i> ${meal.strCategory}</span>
          <span><i class="fa-solid fa-globe"></i> ${meal.strArea}</span>
        </div>
        <div class="modal__section-title">Ingredients</div>
        <div class="modal__ingredients">${ingredientTags}</div>
        <div class="modal__section-title">Instructions</div>
        <div class="modal__instructions">${meal.strInstructions}</div>
        ${youtubeBtn}
      </div>
    `);
  });

  // Close modal via X button or clicking the dark overlay
  $('#modalClose, #modalOverlay').on('click', function (e) {
    if (e.target === this) {
      $('#modalOverlay').removeClass('open');
      $('body').css('overflow', '');
    }
  });

  // Close modal with Escape key
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('#modalOverlay').removeClass('open');
      $('body').css('overflow', '');
    }
  });

});
// ========== LOCALSTORAGE FAVORITES ==========
const FAVORITES_KEY = 'mealmate_favorites';

// Get saved favorites from localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

// Save favorites array to localStorage
function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Update the badge count on the Favorites tab
function updateFavCount() {
  $('#favCount').text(getFavorites().length);
}

// Add or remove a meal from favorites
function toggleFavorite(id, name, thumb) {
  let favorites = getFavorites();
  const exists = favorites.some(f => f.idMeal === id);

  if (exists) {
    favorites = favorites.filter(f => f.idMeal !== id); // remove
  } else {
    favorites.push({ idMeal: id, strMeal: name, strMealThumb: thumb }); // add
  }

  saveFavorites(favorites);
  updateFavCount();
  return !exists; // true = was added
}

$(document).ready(function () {

  updateFavCount(); // show count on load

  // Heart button click
  $(document).on('click', '.meal-card__fav', function (e) {
    e.stopPropagation(); // don't open the modal
    const btn = $(this);
    const id = btn.data('id');
    const name = btn.data('name');
    const thumb = btn.data('thumb');

    const isNowFav = toggleFavorite(id, name, thumb);
    btn.toggleClass('active', isNowFav);
    btn.find('i').attr('class', isNowFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart');
  });

  // Tab switching (Explore / My Favorites)
  $('.tab-btn').on('click', function () {
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');

    const tab = $(this).data('tab');

    if (tab === 'favorites') {
      $('#sectionTitle').text('❤️ My Favorites');
      $('#categoriesContainer').hide();
      renderCards(getFavorites());
    } else {
      $('#categoriesContainer').show();
      init(); // reload the default explore view
    }
  });

});