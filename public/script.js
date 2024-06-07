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

document.getElementById("ingredient-form").addEventListener("submit", function (event) {
    event.preventDefault(); // used to stop the page from reloading

    // getting the values from the user's input into the relevant form field
    var name = document.getElementById("ingredient-name").value;
    // https://www.w3schools.com/jsref/jsref_parsefloat.asp 
    // parseFloat used to ensure that the number is not treated as a string - necessary for kcal calculations later
    var kcalCount = parseFloat(document.getElementById("ingredient-kcal-count").value);
    var category = document.getElementById("ingredient-category").value;

    // creating an object with ingredient name and kcal count to store the values together
    var ingredient = {
        ingredientName: name,
        ingredientKcalCount: kcalCount,
        ingredientCategory: category
    };

    // console.log(ingredient.ingredientName, ingredient.ingredientKcalCount);

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
    var div = document.getElementById(divId);
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}

// create recipe

populateIngredientsList();

document.getElementById("recipe-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // get values from user input
    let recipeName = document.getElementById("recipe-name").value;
    let selectedIngredients = [];
    let totalKcalCount = 0; // initialise total kcal counter

    let selectedOptions = document.querySelectorAll("#selected-ingredients option:checked");
    console.log(selectedOptions);
    selectedOptions.forEach(function(option) {
        let kcal = parseFloat(option.dataset.kcal); // Retrieve kcal value from dataset 
        selectedIngredients.push({
            name: option.value,
            kcal: kcal // Store kcal value for each selected ingredient
        });
        totalKcalCount += kcal; // Add kcal value to total calories counter
        console.log("Total Kcal Count:", totalKcalCount);
    });

    // object to store the recipe details
    let recipe = {
        recipeName: recipeName,
        ingredients: selectedIngredients,
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
        recipesList.forEach(function(recipe) {
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