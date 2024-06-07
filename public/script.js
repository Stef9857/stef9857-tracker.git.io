// declare global lists
var existingCategories = null;
var ingredientsList = null;
var recipesList = null;
var mealsList = null;

/*
 * navigation tabs in configuration section
 */

// nav tabs https://www.w3schools.com/howto/howto_js_tabs.asp
function clickTab(event) {
    // Declare all variables
    let i, tabcontent, tablinks;
    // pattern for tabnam is "tab-" + formName, so take away first 4 characters to get formName
    let formName = event.currentTarget.id.substring(4);

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(formName).style.display = "block";
    event.currentTarget.className += " active";
}

/*
 * manage localStorage
 */

// return list from localStorage, optionally adding new item
function loadLocalStorageAndSync(keyName, newItem = null) {
    // load existing list from localStorage
    let list = JSON.parse(localStorage.getItem(keyName)) || [];

    // optionally add newItem
    if (newItem) {
        list.push(newItem);
        localStorage.setItem(keyName, JSON.stringify(list));
    }

    return list;
}

/*
 * manage existing categories
 */

function updateExistingCategories(category = null) {
    // initialise empty existingCategories or add new category
    if (!existingCategories || category) {
        existingCategories = loadLocalStorageAndSync('existingCategories', category);

        // clear dropdown
        let existingCategoriesSelect = document.getElementById("existing-ingredient-categories");
        existingCategoriesSelect.innerHTML = "";

        // populate dropdown
        existingCategories.forEach(category => {
            let option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            existingCategoriesSelect.appendChild(option)
        });
    }
}

//
// manage ingredients
//

document.getElementById("ingredient-form").addEventListener("submit", (event) => {
    event.preventDefault(); // used to stop the page from reloading

    // getting the values from the user's input into the relevant form field
    let name = document.getElementById("ingredient-name").value;
    let kcalCountInput = document.getElementById("ingredient-kcal-count").value;

    // https://www.w3schools.com/jsref/jsref_parsefloat.asp 
    // parseFloat used to ensure that the number is not treated as a string - necessary for kcal calculations later
    let kcalCount = parseFloat(kcalCountInput);
    // check if user added new category
    let category = document.getElementById("ingredient-category").value;
    if (category) {
        updateExistingCategories(category);
    } else {
        // use dropdown value
        category = document.getElementById("existing-ingredient-categories").value;
    }

    // creating an object with ingredient name and kcal count to store the values together
    let ingredient = {
        ingredientName: name,
        ingredientKcalCount: kcalCount,
        ingredientCategory: category
    };

    // clear the form after an ingredient has been created for an easier user experience
    document.getElementById("ingredient-category").value = "";
    document.getElementById("ingredient-name").value = "";
    document.getElementById("ingredient-kcal-count").value = "";

    updateIngredientsList(ingredient);
});


// set up the functionality for clearing the ingredients and categories lists from localStorage 
document.getElementById("clear-ingredients-list").addEventListener("click", () => {
    localStorage.removeItem('ingredientsList');
    ingredientsList = null;
    updateIngredientsList();
    localStorage.removeItem('existingCategories');
    existingCategories = null;
    updateExistingCategories();
    // clear recipes since ingredients are cleared
    document.getElementById("clear-recipes-list").click();
});

// function for updating the DOM with ingredients list (i.e. fill in the empty ul element)
// code below adapted from the Countries of the World API exercise in Week 5
function updateIngredientsList(ingredient = null) {
    // initialise empty ingredientsList or add the new ingredient
    if (!ingredientsList || ingredient) {
        ingredientsList = loadLocalStorageAndSync('ingredientsList', ingredient);
    }

    // select the list element and clear it's content
    let list = document.querySelector(".ingredients-list ul");
    list.innerHTML = "";

    // Loop through the ingredients list and add their names as list items to the page
    ingredientsList.forEach((ingredient) => {
        let listItem = document.createElement("li");
        listItem.textContent = ingredient.ingredientName + " - " + ingredient.ingredientKcalCount + " kcal [" + ingredient.ingredientCategory + "]";
        listItem.value = ingredient.ingredientName;
        list.appendChild(listItem);
    })

    // update ingredients list in recipe tab
    populateIngredientsList();
};

function populateIngredientsList() {
    let selectedIngredientsSelect = document.getElementById("selected-ingredients");
    selectedIngredientsSelect.innerHTML = ""; // clear previous options

    if (ingredientsList.length == 0) {
        selectedIngredientsSelect.hidden = true;
        document.getElementById("recipe-form-submit").disabled = true;
        document.getElementById("meal-form-submit").disabled = true;
    } else {
        selectedIngredientsSelect.hidden = false;
        document.getElementById("recipe-form-submit").disabled = false;
        document.getElementById("meal-form-submit").disabled = false;
        ingredientsList.forEach((ingredient) => {
            let option = document.createElement("option");
            option.value = ingredient.ingredientName;
            option.textContent = ingredient.ingredientName + " - " + ingredient.ingredientKcalCount + " kcal [" + ingredient.ingredientCategory + "]";
            option.value = ingredient.ingredientName;
            selectedIngredientsSelect.appendChild(option);
        });
    }
}

/*
 * manage recipe
*/

document.getElementById("recipe-form").addEventListener("submit", (event) => {
    event.preventDefault();

    // get values from user input
    let recipeName = document.getElementById("recipe-name").value;
    let selectedIngredients = Array.from(document.getElementById("selected-ingredients").selectedOptions).map(option => option.value);

    // object to store the recipe details
    let recipe = {
        recipeName: recipeName,
        ingredients: selectedIngredients
    };

    // clear the form after a recipe has been created for an easier user experience
    document.getElementById("recipe-name").value = "";
    document.getElementById("selected-ingredients").selectedIndex = -1;

    updateRecipesList(recipe);
});

function calcRecipeKcal(recipeName) {
    let recipe = recipesList.find((recipe => recipeName === recipe.recipeName));
    if (!recipe) {
        return 0;
    } else {
        return recipe.ingredients.reduce((val, item) => {
            let ingredient = ingredientsList.find((i) => i.ingredientName === item);
            return val + ingredient.ingredientKcalCount;
        }, 0);
    }
}

function updateRecipesList(recipe = null) {
    // initialise empty recipesList or add the new recipe
    if (!recipesList || recipe) {
        recipesList = loadLocalStorageAndSync('recipesList', recipe);
    }

    let listElement = document.querySelector(".recipes-list ul");
    listElement.innerHTML = ""; // clear existing list for re-population to ensure the most up-to-date list is being displayed

    recipesList.forEach((recipe) => {
        let listItem = document.createElement("li");
        listItem.textContent = recipe.recipeName + ": " + recipe.ingredients.join(", ") + " - Total Calories: " + calcRecipeKcal(recipe.recipeName) + " kcal";
        listItem.value = recipe.recipeName;
        listElement.appendChild(listItem);
    });

    populateRecipesList();
}

// set up the functionality for clearing the recipes list from localStorage 
document.getElementById("clear-recipes-list").addEventListener("click", () => {
    localStorage.removeItem('recipesList');
    recipesList = null;
    updateRecipesList(); // Re-fetch and update the list from localStorage
    // clear meals since recipes are cleared
    document.getElementById("clear-meals-list").click();
});

function populateRecipesList() {
    let selectedRecipesSelect = document.getElementById("selected-recipes");
    selectedRecipesSelect.innerHTML = "";

    if (recipesList.length == 0) {
        selectedRecipesSelect.hidden = true;
    } else {
        selectedRecipesSelect.hidden = false;
        recipesList.forEach((recipe) => {
            let option = document.createElement("option");
            option.textContent = recipe.recipeName;
            option.value = recipe.recipeName;
            selectedRecipesSelect.appendChild(option);
        });
    }
}

/*
 * manage meals
 */

document.getElementById("meal-form").addEventListener("submit", (event) => {
    event.preventDefault();

    // get values from user input
    let mealName = document.getElementById("meal-name").value;
    let mealDate = document.getElementById("meal-date").value;
    let mealTime = document.getElementById("meal-time").value;
    let selectedRecipes = Array.from(document.getElementById("selected-recipes").selectedOptions).map(option => option.value);

    // object to store meal details
    let meal = {
        mealName: mealName,
        mealDate: mealDate,
        mealTime: mealTime,
        recipes: selectedRecipes,
    };

    // clear the form after a meal has been created
    document.getElementById("meal-name").value = "";
    document.getElementById("meal-date").value = "";
    document.getElementById("meal-time").value = "";
    document.getElementById("selected-recipes").selectedIndex = -1;

    updateMealsList(meal);
    updateTotalKcalToday();
});

function calcMealKcal(meal) {
    return meal.recipes.reduce((val, recipeName) => {
        return val + calcRecipeKcal(recipeName);
    }, 0);

}

function updateMealsList(meal = null) {
    // initialise empty mealsList or add the new meal
    if (!mealsList || meal) {
        mealsList = loadLocalStorageAndSync('mealsList', meal);
        mealsList.sort((a, b) => {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            // A negative value indicates that a should come before b.
            // A positive value indicates that a should come after b.
            // Zero or NaN indicates that a and b are considered equal.
            //
            // we want to sort in reverse order, most recent datetime first
            if (a.mealDate != b.mealDate) {
                return (a.mealDate > b.mealDate) ? -1 : 1;
            } else if (a.mealTime != b.mealTime) {
                return (a.mealTime > b.mealTime) ? -1 : 1;
            } else {
                return 0;
            }
        });
    }

    let listElement = document.querySelector(".meals-list ul");
    listElement.innerHTML = "";

    let stillToday = true;
    let currentDate = getCurrentDate();
    mealsList.forEach((meal) => {
        let listItem = document.createElement("li");
        let totalKcalText = (meal.recipes.length == 0) ? totalKcalText : "-Total Calories: " + calcMealKcal(meal) + " kcal"; // if there are no meals do not display kcal count
        listItem.innerHTML = meal.mealName + ": " + meal.mealDate + " " + meal.mealTime + " " + totalKcalText;
        // add a separator once today's meals are all added
        if (stillToday && meal.mealDate != currentDate) {
            stillToday = false;
            listItem.innerHTML = "<hr>" + listItem.innerHTML;
        }
        listItem.value = meal.mealName;
        listElement.appendChild(listItem);
    });
}

// set up the functionality for clearing the recipes list from localStorage 
document.getElementById("clear-meals-list").addEventListener("click", () => {
    localStorage.removeItem('mealsList');
    mealsList = null;
    updateMealsList(); // Re-fetch and update the list from localStorage
    updateTotalKcalToday();
});

function getCurrentDate() {
    // https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
    let currentDate = new Date();
    let offset = currentDate.getTimezoneOffset();
    return new Date(currentDate.getTime() - (offset*1000*60)).toISOString().split('T')[0];
}

// Total calories today 
function updateTotalKcalToday() {
    let currentDate = getCurrentDate();
    let totalKcalToday = mealsList.reduce((val, meal) => {
        let extraKcal = (meal.mealDate === currentDate) ? calcMealKcal(meal) : 0;
        return val + extraKcal;
    }, 0);

    document.getElementById('total-kcal-today').textContent = totalKcalToday;
}

// event listener checking name format
function checkNameFormat(event) {
    let message = "";
    if (event.currentTarget.validity.patternMismatch) {
        message = "Name should ony have letters, possibly separated by spaces";
    }
    event.currentTarget.setCustomValidity(message);
    return message;
}

function checkNameFormatAndUniqueness(event, currentList) {
    let message = checkNameFormat(event);
    if (!message && currentList.includes(event.currentTarget.value)) {
        message = event.currentTarget.value + " is already used, choose another name";
    }
    event.currentTarget.setCustomValidity(message);
}

/*
 * setup application
 */

// update global lists
updateExistingCategories();
updateIngredientsList();
updateRecipesList();
updateMealsList();

// call functions to initialise application
updateTotalKcalToday();
populateIngredientsList();
populateRecipesList();

// setup tabs
document.getElementById("tab-meal-form").addEventListener("click", clickTab);
document.getElementById("tab-recipe-form").addEventListener("click", clickTab);
document.getElementById("tab-ingredients-form").addEventListener("click", clickTab);
// select default tab
document.getElementById("tab-meal-form").click();

// add event listener for text inputs
document.getElementById("meal-name").addEventListener("input", checkNameFormat);
document.getElementById("recipe-name").addEventListener("input", (event) => {
    checkNameFormatAndUniqueness(event, recipesList.map((recipe) => recipe.recipeName));
});
document.getElementById("ingredient-name").addEventListener("input", (event) => {
    checkNameFormatAndUniqueness(event, ingredientsList.map((ingredient) => ingredient.ingredientName));
});
document.getElementById("ingredient-category").addEventListener("input", (event) => {
    checkNameFormatAndUniqueness(event, existingCategories);
});