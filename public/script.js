let ingredientsList = []; // initialised here because it is used in multiple scopes

document.getElementById("ing-form").addEventListener("submit", function (event) {
    event.preventDefault(); // used to stop the page from reloading

    // getting the values from the user's input into the relevant form field
    var name = document.getElementById("ing-name").value;
    var kcalCount = document.getElementById("ing-kcal-count").value;

    // creating an object with ingredient name and kcal count to store the values together
    var ingredient = {
        ingredientName: name,
        ingredientKcalCount: kcalCount
    };

    console.log(ingredient.ingredientName, ingredient.ingredientKcalCount);

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
    
    // save the current ingredients list to localStorage and convert it to JSON format for storage
    localStorage.setItem('ingredientsList', JSON.stringify(ingredientsList));
    updateIngredientsList();
});


// set up the functionality for clearing the localStorage favourites
let clearButton = document.getElementById("clear");
clearButton.addEventListener("click", function() {
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
    let ingredientsList = JSON.parse(localStorage.getItem('ingredientsList'));
  
    // make sure the localStorage item exists by checking it's not equal to 'null'
    if (ingredientsList !== null){
  
      // Loop through the ingredients list and add their names as list items to the page
      ingredientsList.forEach((ingredient) => {
        let listItem = document.createElement("li");
        listItem.textContent = `${ingredient.ingredientName} - ${ingredient.ingredientKcalCount} kcal`;
        list.appendChild(listItem);
      })
    } 
  };

