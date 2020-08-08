import { Crafting } from '../classes/crafting';
import { intToString } from '../utility/utility';

var crafting = null;
var recipes = null;
var floorRecipes = null;

export function initialize(rec, floorRec){
    recipes = rec;
    floorRecipes = floorRec;
    crafting = new Crafting(recipes);

    document.getElementById("calculate").onclick = calculate;
    document.getElementById("quickCalculate").onclick = calculate;
    document.getElementById("addFloor").onclick = addFloor;

    populateCraftingItems(recipes);
    populateFloors(floorRecipes);
}

function addFloor(){
    var floorElement = document.getElementById("floors");
    var floorValue = floorElement.value;
    var floor = floorRecipes.get(floorValue);

    if(floor === undefined){
        return; // TODO: Write error to the user that the floor selected is undefined.
    }

    for(var i = 0; i < floor.requirements.length; i++){
        var itemName = floor.requirements[i][0];
        var quantity = floor.requirements[i][1];
        increaseCraftingAmount(itemName, quantity);
    }
}

function calculate(){
    var userHours = parseInt(document.getElementById("userTimeHours").value);
    var userMinutes = parseInt(document.getElementById("userTimeMinutes").value);
    
    var userTime = 0;
    if(!isNaN(userHours)) {
        userTime += userHours * 60;
    }
    if(!isNaN(userMinutes)){
        userTime += userMinutes;
    }
    if(userTime <= 0){
        return; // TODO: Give error message to the user
    }

    crafting.setCraftingTime(userTime);

    clearOutputTable(); // Clears the table from any input

    
    var oneMinCrafting = document.getElementById("crafting"); // oneMinCrafting.checked = 1min crafting

    var reqs = crafting.getCraftingRequirements();
    // TODO: The output should be sorted by item.sortingOrder
    var table = document.getElementById('outputTable').getElementsByTagName('tbody')[0];
    for (const [name, quantity] of reqs.entries()) {
        if(quantity <= 0){
            // TODO: Instead of ignoring items with 0 quantity. They should be removed from crafting.craftingList when user sets them to 0 quantity.
            continue;
        }
        var item = recipes.get(name);
        item.quantity = quantity;
        createOutputTableRow(table, item, crafting.craftingTime);
    }
    var cost = crafting.getTotalCost();
}

function clearOutputTable(){
    document.getElementById('outputTable').getElementsByTagName('tbody')[0].innerHTML = "";
}

function createOutputTableRow(table, item, craftingTime){
    var tableRow = table.insertRow();

    // Add item name cell
    var cellItem = tableRow.insertCell(0);
    var cellNodeItem = document.createTextNode(item.name);
    cellItem.appendChild(cellNodeItem);

    // Add quantity cell
    var cellQuantity = tableRow.insertCell(1);
    var cellNodeQuantity = document.createTextNode(item.quantity);
    cellQuantity.appendChild(cellNodeQuantity);

    // Add cost cell
    var cost = item.getCost(item.getCraftingMethod(craftingTime));
    var cellCost = tableRow.insertCell(2);
    var cellNodeCost = document.createTextNode(intToString(cost));
    cellCost.appendChild(cellNodeCost);

    var craftingText = item.getCraftingMethod();

    // Add crafting method cell
    var cellCrafting = tableRow.insertCell(3);
    var cellNodeCrafting = document.createTextNode(craftingText);
    cellCrafting.appendChild(cellNodeCrafting);
}

function populateFloors(floorRecipes){
    var select = document.getElementById("floors");
    
    for (const [name, item] of floorRecipes.entries()) {
        var option = document.createElement("option");
        option.value = name;
        option.innerHTML = name;
        select.appendChild(option);
    }
}

function populateCraftingItems(recipes){
    var craftingDiv = document.getElementById("craftingContainer");

    var lastCategory = null;
    var currentTier = null;
    for (const [name, item] of recipes.entries()) {
        if(item.rarity == 'raw' || item.rarity == 'hidden'){
            continue;
        }

        if(item.category !== lastCategory){
            lastCategory = item.category;
            
            // Create and append header to #craftingContainer
            let header = createCraftingTierHeader(item.category);
            craftingDiv.appendChild(header);
            
            var tier = createCraftingTier();
            craftingDiv.appendChild(tier);
            currentTier = tier;

            createCraftingItem(currentTier, item);
        }
        else{
            createCraftingItem(currentTier, item);
        }
    }
}

function createCraftingTier(){
    var tier = document.createElement("div");
    tier.classList.add("crafting-tier");
    return tier;
}

function createCraftingTierHeader(category){
    var header = document.createElement("h2");
    var textHeader = document.createTextNode(category);
    header.appendChild(textHeader);
    return header;
}

function createCraftingItem(tier, item){
    var itemDiv = document.createElement("div");
    itemDiv.classList.add("crafting-item");
    itemDiv.classList.add(item.rarity);
    
    // Creates button which act as a header and as a dropdown button for more info about the item
    var craftingItemButton = createCraftingItemButton(item.name);
    itemDiv.appendChild(craftingItemButton);

    // Creates the p tag that holds item information
    var craftingItemInfo = createCraftingItemDescription(item);
    itemDiv.appendChild(craftingItemInfo);

    // Displays/hides crafting item description
    craftingItemButton.onclick = () => {
        const displayCraftingItemInfoClass = "display-crafting-item-info";
        // crafting item description is visible
        if(craftingItemInfo.classList.contains(displayCraftingItemInfoClass)){
            craftingItemInfo.classList.remove(displayCraftingItemInfoClass)
        }
        else{
            craftingItemInfo.classList.add(displayCraftingItemInfoClass);
        }
    };

    // Input field for how many to craft
    const craftingAmount = createCraftingItemInputField(item.name);
    itemDiv.appendChild(craftingAmount);

    // Creates arrows for increasing/decreasing quantity of items to craft
    const incrementContainer = createCraftingItemArrows(item.name);
    itemDiv.appendChild(incrementContainer);

    tier.appendChild(itemDiv);
}

function createCraftingItemButton(name){
    const craftingItemButton = document.createElement("button"); // Button elements for the crafting items
    craftingItemButton.classList.add("crafting-item-button");
    craftingItemButton.innerHTML = name + ' <i class="fa fa-angle-double-down"></i>';
    return craftingItemButton;
}

function createCraftingItemDescription(item){
    const craftingItemInfo = document.createElement("p");
    craftingItemInfo.classList.add("crafting-item-info");
    craftingItemInfo.id = item.name + "Info";

    var descriptionText = '';
    for(let i = 0; i < item.craftingRequirements.length; i++){
        var text = document.createTextNode(item.craftingRequirements[i]);
        craftingItemInfo.appendChild(text);
        craftingItemInfo.appendChild(document.createElement("br"));
    }
    craftingItemInfo.appendChild(document.createTextNode('Crafting time: ' + item.craftingTime + 'min'));
    
    var craftingItemDescription = document.createTextNode(descriptionText);
    craftingItemInfo.appendChild(craftingItemDescription);
    return craftingItemInfo;
}

function createCraftingItemInputField(name){
    const craftingAmount = document.createElement("input");
    craftingAmount.id = name;
    craftingAmount.classList.add("crafting-item-amount");
    craftingAmount.type = "number";
    craftingAmount.value = 0;
    craftingAmount.min = 0;
    craftingAmount.addEventListener("click", function() { this.select(); });
    craftingAmount.addEventListener('input', craftingAmountUpdate);
    return craftingAmount;
}

function createCraftingItemArrows(name){
    const incrementContainer = document.createElement("span");

    var upArrow = document.createElement("img");
    upArrow.src = "images/arrow-up.png";
    upArrow.addEventListener("click", function() { upClick(name); } );
    incrementContainer.appendChild(upArrow);
    
    var downArrow = document.createElement("img");
    downArrow.src = "images/arrow-down.png";
    downArrow.addEventListener("click", function() { downClick(name); } );
    incrementContainer.appendChild(downArrow);
    
    return incrementContainer;
}

function craftingAmountUpdate(e){
    var value = parseInt(e.target.value);
    crafting.setCraftingItem(e.target.id, value);
    updateCraftingAmount(e.target.id);
}

function upClick(name){
    increaseCraftingAmount(name, 1);
}

function downClick(name){
    increaseCraftingAmount(name, -1);
}

function increaseCraftingAmount(name, quantity){
    crafting.addCraftingItem(name, quantity);
    updateCraftingAmount(name)
}

function updateCraftingAmount(name){
    document.getElementById(name).value = crafting.craftingList.get(name);
}