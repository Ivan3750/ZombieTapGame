import { fetchUserData } from "../scripts/getData.js";

const userMoney = document.querySelector('#score-money');
const MAX_MULTITAP_LEVEL = 100;
const MAX_REGENERATION_LEVEL = 10;
const MAX_HURTLIMIT_LEVEL = 100;

let userData = null;

// Load user money and update the UI
const loadMoney = async () => {
  try {
    userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
    updateUI();
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Calculate the price for the given level
const calculatePriceIndex = (level) => {
  if (level < 1 || level > 100) {
    throw new Error('Level must be between 1 and 100.');
  }
  return Math.round(60 * Math.pow(2.5, level - 1));
};

// Upgrade box configurations
const upgradeBoxConfigs = {
  'multitap-box': {
    typeLVL: "multitap_lvl",
    maxLevel: MAX_MULTITAP_LEVEL,
    startPrice: 60,
    amountCalc: level => `${level} $ZB`
  },
  'regeneration-box': {
    typeLVL: "regeneration_lvl",
    maxLevel: MAX_REGENERATION_LEVEL,
    startPrice: 600,
    amountCalc: level => `${(level - 1) * 12 + 168} s`
  },
  'hurtlimit-box': {
    typeLVL: "heart_limit_lvl",
    maxLevel: MAX_HURTLIMIT_LEVEL,
    startPrice: 60,
    amountCalc: level => `${level} ${level === 1 ? 'hurt' : 'hurts'}`
  }
};

// Attach event listeners to all upgrade boxes
document.querySelectorAll('.upgrade-box').forEach(box => {
  box.addEventListener('click', () => upgrade(box));
});

// Handle the upgrade logic
const upgrade = async (box) => {
  if (!userData) {
    console.error('User data not loaded');
    return;
  }

  const config = upgradeBoxConfigs[box.id];
  if (!config) {
    console.error('Invalid box ID:', box.id);
    return;
  }

  const { typeLVL, maxLevel, amountCalc } = config;
  const currentLevel = userData[typeLVL];
  const nextLevel = currentLevel + 1;

  if (currentLevel >= maxLevel) {
    console.log('Max level reached');
    return;
  }

  const priceIndex = calculatePriceIndex(nextLevel);
  if (userData.money < priceIndex) {
    console.log('Not enough money');
    return;
  }

  try {
    await subtractMoney(priceIndex);
    await upgradeLevel(typeLVL, nextLevel);

    // Update UI after successful upgrade
    userData.money -= priceIndex;
    userMoney.innerHTML = userData.money;
    userData[typeLVL] = nextLevel;

    const newPriceIndex = calculatePriceIndex(nextLevel + 1);
    updateBoxUI(box, nextLevel, amountCalc(nextLevel), newPriceIndex);

  } catch (error) {
    console.error('Upgrade error:', error);
  }
}

// Update the UI for a specific upgrade box
const updateBoxUI = (box, level, amount, price) => {
  box.querySelector('.price-amount').innerHTML = price;
  box.querySelector('.upgrade-level').innerHTML = `${level} lvl`;
  box.querySelector('.upgrade-amount').innerHTML = amount;
}

// Update the UI for all upgrade boxes
const updateUI = () => {
  document.querySelectorAll('.upgrade-box').forEach(box => {
    const config = upgradeBoxConfigs[box.id];
    if (config) {
      const { typeLVL, amountCalc } = config;
      const currentLevel = userData[typeLVL];
      const nextLevel = currentLevel + 1;
      const priceIndex = calculatePriceIndex(nextLevel);

      updateBoxUI(box, currentLevel, amountCalc(currentLevel), priceIndex);
    }
  });
}

// Upgrade user level on the server
const upgradeLevel = async (levelType, level) => {
  console.log(levelType)
  return apiRequest('updatelevel', { levelType, level });
}

// Subtract money from the user on the server
const subtractMoney = async (priceIndex) => {
  return apiRequest('subtractmoney', { money: priceIndex });
}

// Centralized API request handler
const apiRequest = async (endpoint, body) => {
  try {
    console.log("BODY", body)
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const response = await fetch(`api/users/${user.id}/${endpoint}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

// Initialize the application
(async () => {
  await loadMoney();
})();
