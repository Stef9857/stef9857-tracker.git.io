// create ingredients list
let ingredientsList = []; // initialised here because it is used in multiple scopes

function updateExistingCategories() {
    let existingCategoriesSelect = document.getElementById("existing-ingredient-categories");
    existingCategoriesSelect.innerHTML = ""; // clear previous options 

    // the || [] is used to assign an empty array as a default value if the variable is empty 
    let existingCategories = JSON.parse(localStorage.getItem('existingCategories')) || [];

    localStorage.setItem('existingCategories', JSON.stringify(existingCategories));

    if (existingCategories) {
        existingCategories.forEach(category => {
            let option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            existingCategoriesSelect.appendChild(option)
        });
    }
    console.log('test');
}

updateExistingCategories();

//
// Create ingredient
//

document.getElementById("ingredient-form").addEventListener("submit", function (event) {
    event.preventDefault(); // used to stop the page from reloading

    // getting the values from the user's input into the relevant form field
    let name = document.getElementById("ingredient-name").value;
    let kcalCountInput = document.getElementById("ingredient-kcal-count").value;
    // check if kcalCountInput is a valid number
    if (isNaN(kcalCountInput)) {
        // display error message if the number is not valid
        console.error("invalid input for kcal count");
        return;
    }
    
    // https://www.w3schools.com/jsref/jsref_parsefloat.asp 
    // parseFloat used to ensure that the number is not treated as a string - necessary for kcal calculations later
    let kcalCount = parseFloat(kcalCountInput);
    let category = document.getElementById("ingredient-category").value;

    // creating an object with ingredient name and kcal count to store the values together
    let ingredient = {
        ingredientName: name,
        ingredientKcalCount: kcalCount,
        ingredientCategory: category
    };

    addIngredient(ingredient); // add ingredient to the selected ingredients list in the recipe form

    // get the stored ingredients list from local storage
    ingredientsList = JSON.parse(localStorage.getItem('ingredientsList'));

    // the following if statement has been adapted from the Countries of the World API exercise in Week 5
    // Check if the item doesn't exist in localStorage by seeing if it is null
    if (ingredientsList == null) {
        // In which case, use the ingredient object created by user input to create an array
        ingredientsList = [ingredient]
    } else {
        // log that a duplicate ingredient has been created
        if (ingredientsList.find(element => element.ingredientName === ingredient.ingredientName)) {
            console.log('Ingredient already exists');
        } else {
            // else (i.e. if the ingredient has not been created before) add ingredient to array
            ingredientsList.push(ingredient);
        }
    }
    console.log(ingredientsList);

    if (!category) {
        return;
    }

    let existingCategories = JSON.parse(localStorage.getItem('existingCategories'));
    if (existingCategories && Array.isArray(existingCategories) && !existingCategories.includes(category)) {
        existingCategories.push(category);
        localStorage.setItem('existingCategories', JSON.stringify(existingCategories));
        updateExistingCategories();
    }
    // save the current ingredients list to localStorage and convert it to JSON format for storage
    localStorage.setItem('ingredientsList', JSON.stringify(ingredientsList));
    updateIngredientsList();
});


// set up the functionality for clearing the ingredients list from localStorage 
let clearButtonIngredients = document.getElementById("clear-ingredients-list");
clearButtonIngredients.addEventListener("click", function () {
    localStorage.removeItem('ingredientsList');
    ingredientsList = [];
    console.log(ingredientsList);
    updateIngredientsList();
});

// function for updating the DOM with ingredients list (i.e. fill in the empty ul element)
// code below adapted from the Countries of the World API exercise in Week 5
function updateIngredientsList() {

    // select the list element and clear it's content
    let list = document.querySelector(".ingredients-list ul");
    list.innerHTML = "";

    // retrieve the ingredients list from localStorage
    ingredientsList = JSON.parse(localStorage.getItem('ingredientsList'));

    // make sure the localStorage item exists by checking it's not equal to 'null'
    if (ingredientsList !== null) {

        // Loop through the ingredients list and add their names as list items to the page
        ingredientsList.forEach((ingredient) => {
            let listItem = document.createElement("li");
            listItem.textContent = `${ingredient.ingredientName} - ${ingredient.ingredientKcalCount} kcal [${ingredient.ingredientCategory}]`;
            list.appendChild(listItem);
        })
    }
};

updateIngredientsList();

// toggleVisibility function - used to show and hide the Create Meal, Recipe and Ingredient divs
// https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
function toggleVisibility(divId) {
    let div = document.getElementById(divId);
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}

//
// Create Recipe
//

populateIngredientsList();

document.getElementById("recipe-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // get values from user input
    let recipeName = document.getElementById("recipe-name").value;
    let selectedIngredients = [];
    let totalKcalCount = 0; // initialise total kcal counter

    selectedIngredients.forEach(function (ingredient) {
        totalKcalCount += parseFloat(ingredient.dataset.kcal);
    })

    // object to store the recipe details
    let recipe = {
        recipeName: recipeName,
        ingredients: Array.from(selectedIngredients).map(function (ingredient) {
            return {
                name: ingredient.dataset.name,
                kcal: parseFloat(ingredient.dataset.kcal)
            };
        }),
        totalKcalCount: totalKcalCount
    };

// store the recipe object in localStorage for users to be able to access in the future 
let recipesList = JSON.parse(localStorage.getItem('recipesList')) || [];
recipesList.push(recipe);
localStorage.setItem('recipesList', JSON.stringify(recipesList));

// clear the form after a recipe has been created for an easier user experience
document.getElementById("recipe-name").value = "";
document.getElementById("selected-ingredients").selectedIndex = -1;

updateRecipesList();
});

function updateRecipesList() {
    let recipesList = JSON.parse(localStorage.getItem('recipesList')) || [];
    let listElement = document.querySelector(".recipes-list ul");
    listElement.innerHTML = ""; // clear existing list for re-population to ensure the most up-to-date list is being displayed

    if (recipesList) {
        recipesList.forEach(function (recipe) {
            let listItem = document.createElement("li");
            listItem.textContent = `${recipe.recipeName}: ${recipe.ingredients.map(ingredient => ingredient.name).join(", ")} - Total Calories: ${recipe.totalKcalCount} kcal`;
            listElement.appendChild(listItem);
        });
    }
}

updateRecipesList();

function populateIngredientsList() {
    let selectedIngredientsSelect = document.getElementById("selected-ingredients");
    selectedIngredientsSelect.innerHTML = ""; // clear previous options

    let ingredientsList = JSON.parse(localStorage.getItem('ingredientsList')) || [];

    ingredientsList.forEach(function (ingredient) {
        let option = document.createElement("option");
        option.value = ingredient.ingredientName;
        option.textContent = `${ingredient.ingredientName} - ${ingredient.ingredientKcalCount} kcal [${ingredient.ingredientCategory}]`;
        option.dataset.kcal = ingredient.ingredientKcalCount; // Set data-kcal attribute
        selectedIngredientsSelect.appendChild(option);
    })
}

// set up the functionality for clearing the recipes list from localStorage 
let clearButtonRecipes = document.getElementById("clear-recipes-list");
clearButtonRecipes.addEventListener("click", function () {
    localStorage.removeItem('recipesList');
    updateRecipesList(); // Re-fetch and update the list from localStorage
});

//
// Create Meal
//

document.getElementById("meal-form").addEventListener("submit", function(event){
    event.preventDefault();

    // get values from user input
    let mealName = document.getElementById("meal-name").value;
    let mealDate = document.getElementById("meal-date").value;
    let mealTime = document.getElementById("meal-time").value;
    let selectedRecipes = Array.from(document.getElementById("selected-recipes").selectedOptions).map(option => option.value);
    
    // calculate kcal count for the meal
    let totalMealKcount = calculateMealKcal(selectedRecipes, JSON.parse(localStorage.getItem('recipesList')) || []);

    // object to store meal details
    let meal = {
        mealName: mealName,
        mealDate: mealDate,
        mealTime: mealTime,
        recipes: selectedRecipes,
        totalMealKcount: totalMealKcount
    };

    // store the meal object in local storage
    let mealsList = JSON.parse(localStorage.getItem('mealsList')) || [];
    mealsList.push(meal);
    localStorage.setItem('mealsList', JSON.stringify(mealsList));

    // clear the form after a meal has been created
    document.getElementById("meal-name").value = "";
    document.getElementById("meal-date").value = "";
    document.getElementById("meal-time").value = "";
    document.getElementById("selected-recipes").selectedIndex = -1;

    updateMealsList();
    updateTotalKcalToday();
});

updateMealsList();

function populateRecipesList(){
    let selectedRecipesSelect = document.getElementById("selected-recipes");
    selectedRecipesSelect.innerHTML = ""; 

    let recipesList = JSON.parse(localStorage.getItem('recipesList')) || [];

    recipesList.forEach(function(recipe){
        let option = document.createElement("option");
        option.value = recipe.recipeName;
        option.textContent = recipe.recipeName;
        selectedRecipesSelect.appendChild(option);
    });
}

populateRecipesList();

function updateMealsList() {
    let mealsList = JSON.parse(localStorage.getItem('mealsList')) || [];
    let listElement = document.querySelector(".meals-list ul");
    listElement.innerHTML = "";

    mealsList.forEach(function (meal) {
        let listItem = document.createElement("li");
        let totalKcalText = meal.recipes.length > 0 ? ` -Total Calories: ${meal.totalMealKcount} kcal` : ''; // if there are no meals do not display kcal count
        listItem.textContent = `${meal.mealName}: ${meal.mealDate} ${meal.mealTime}${totalKcalText}`;
        listElement.appendChild(listItem);
    });
}

function calculateMealKcal(selectedRecipes, recipesList) { // Pass recipesList as parameter
    let totalMealKcount = 0;
    selectedRecipes.forEach(recipeName => {
        let recipe = recipesList.find(recipe => recipe.recipeName === recipeName);
        if (recipe) {
            totalMealKcount += recipe.totalKcalCount;
        }
    });
    console.log(totalMealKcount);
    return totalMealKcount;
}

// set up the functionality for clearing the recipes list from localStorage 
let clearButtonMeals = document.getElementById("clear-meals-list");
clearButtonMeals.addEventListener("click", function () {
    localStorage.removeItem('mealsList');
    updateMealsList(); // Re-fetch and update the list from localStorage
});

// 
// Total calories today 
//

function calculateTotalKcalToday() {
    let mealsList = JSON.parse(localStorage.getItem('mealsList')) || [];
    // https://stackoverflow.com/questions/47066555/remove-time-after-converting-date-toisostring 
    let currentDate = new Date().toISOString().split('T', 1)[0];
    let totalKcalToday = 0;

    mealsList.forEach(function(meal){
        if (meal.mealDate === currentDate) {
            totalKcalToday += meal.totalMealKcount;
        }
    })

    return totalKcalToday; 
}

function updateTotalKcalToday() {
    let totalKcalTodayElement = document.getElementById('total-kcal-today');
    let totalKcalToday = calculateTotalKcalToday();
    totalKcalTodayElement.textContent = `${totalKcalToday}`; 
}

updateTotalKcalToday();
