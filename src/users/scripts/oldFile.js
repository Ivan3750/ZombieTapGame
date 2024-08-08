import { authenticateWithTelegram, fetchUserData } from "../scripts/getData.js";

const userMoney = document.querySelector('#score-money');
const MAX_MULTITAP_LEVEL = 100;
const MAX_REGENERATION_LEVEL = 10;
const MAX_HURTLIMIT_LEVEL = 100;

// Add event listeners to each upgrade box
document.querySelectorAll('.upgrade-box').forEach(box => {
    box.addEventListener('click', () => {
        upgrade(box);
    });
});


let userData = null

// Function to load user data and update money display
const loadMoney = async() =>{
    userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
}

function calculatePriceIndex(level, price) {
    const startPrice = price;
    const initialIndex = 2.5; // 250% у вигляді коефіцієнта
    const maxLevel = 100;

    if (level < 1 || level > maxLevel) {
        throw new Error(`Level must be between 1 and ${maxLevel}.`);
    }

    // Збільшуємо індекс ціни в залежності від рівня
    const priceIndex = startPrice * initialIndex * (1 + level / maxLevel);

    return priceIndex;
}




// Function to handle upgrading of boxes
function upgrade(box) {
    if (!userData) {
        console.error('User data not loaded');
        return;
    }

    const id = box.id;
    const priceElement = box.querySelector('.price-amount');
    const levelElement = box.querySelector('.upgrade-level');
    const amountElement = box.querySelector('.upgrade-amount');

    let level;
    let amount;
    let price = parseInt(priceElement.innerText, 10);

    // Determine upgrade based on box ID
    if (id === 'multitap-box') {
        level = userData.multitap_lvl;
        if (level < MAX_MULTITAP_LEVEL && userData.money >= calculatePriceIndex(level, 60)) {
            level++;
            price = Math.round(price * 1.25);
            amount = `${level} $ZB`;
        } else {
            price = "MAX";
            amount = `${level} $ZB`;
        }
    } else if (id === 'regeneration-box') {
        level = userData.regeneration_lvl;
        if (level < MAX_REGENERATION_LEVEL) {
            level++;
            price = Math.round(price * 1.25);
            amount = `${168 + 12 * (level - 1)}s`;
        } else {
            price = "MAX";
            amount = `${168 + 12 * (level - 1)}s`;
        }
    } else if (id === 'hurtlimit-box') {
        level = userData.hurt_limit_lvl;
        if (level < MAX_HURTLIMIT_LEVEL) {
            level++;
            price = Math.round(price * 1.25);
            amount = `${level} hurt`;
        } else {
            price = "MAX";
            amount = `${level} hurt`;
        }
    }

    // Update DOM elements with new price, level, and amount
    priceElement.innerText = price;
    levelElement.innerText = `${level} lvl`;
    amountElement.innerText = amount;
}

// Load money and initialize the application
(async () => {
    try {
        await loadMoney();
        // Additional initialization can be done here
    } catch (error) {
        console.error('Error initializing application:', error);
    }
})();
