import { fetchUserData } from "../scripts/getData.js";

const userMoney = document.querySelector('#score-money');
const MAX_MULTITAP_LEVEL = 100;
const MAX_REGENERATION_LEVEL = 10;
const MAX_HURTLIMIT_LEVEL = 100;

let userData = null;

const loadMoney = async () => {
  try {
    userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
    updateUI();
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

const calculatePriceIndex = (level, startPrice) => {
  const initialIndex = 2.5;
  const maxLevel = 100;
  
  if (level < 1 || level > maxLevel) {
    throw new Error(`Level must be between 1 and ${maxLevel}.`);
  }
  return Math.round(startPrice * initialIndex * (1 + level / maxLevel));
}

const upgradeBoxConfigs = {
  'multitap-box': {
    typeLVL: "multitap_lvl",
    maxLevel: MAX_MULTITAP_LEVEL,
    startPrice: 60,
    amountCalc: level => `${level * 1} $ZB`
  },
  'regeneration-box': {
    typeLVL: "regeneration_lvl",
    maxLevel: MAX_REGENERATION_LEVEL,
    startPrice: 600,
    amountCalc: level => `${((level - 1) * 12) + 168} s`
  },
  'hurtlimit-box': {
    typeLVL: "heart_limit_lvl",
    maxLevel: MAX_HURTLIMIT_LEVEL,
    startPrice: 60,
    amountCalc: level => `${level * 1} ${level === 1 ? 'hurt' : 'hurts'}`
  }
};

document.querySelectorAll('.upgrade-box').forEach(box => {
  box.addEventListener('click', () => upgrade(box));
});

const upgrade = async (box) => {
  if (!userData) {
    console.error('User data not loaded');
    return;
  }

  const boxID = box.id;
  const config = upgradeBoxConfigs[boxID];
  
  if (!config) {
    console.error('Invalid box ID:', boxID);
    return;
  }

  const { typeLVL, maxLevel, startPrice, amountCalc } = config;
  const currentLevel = userData[typeLVL];
  const nextLevel = currentLevel + 1;
  const priceIndex = calculatePriceIndex(nextLevel, startPrice);

  if (currentLevel < maxLevel && userData.money >= priceIndex) {
    try {
      await subtractMoney(priceIndex);
      await upgradeLevel(typeLVL, nextLevel);

      const priceElement = box.querySelector('.price-amount');
      const levelElement = box.querySelector('.upgrade-level');
      const amountElement = box.querySelector('.upgrade-amount');
      
      priceElement.innerHTML = priceIndex;
      levelElement.innerHTML = `${nextLevel} lvl`;
      amountElement.innerHTML = amountCalc(nextLevel);
      
      userData.money -= priceIndex;
      userMoney.innerHTML = userData.money;
      userData[typeLVL] = nextLevel;
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  } else {
    console.log('Upgrade not possible');
  }
}

const updateUI = () => {
  document.querySelectorAll('.upgrade-box').forEach(box => {
    const boxID = box.id;
    const config = upgradeBoxConfigs[boxID];
    
    if (config) {
      const { typeLVL, startPrice, amountCalc } = config;
      const currentLevel = userData[typeLVL];
      const nextLevel = currentLevel + 1;
      const priceIndex = calculatePriceIndex(nextLevel, startPrice);

      const priceElement = box.querySelector('.price-amount');
      const levelElement = box.querySelector('.upgrade-level');
      const amountElement = box.querySelector('.upgrade-amount');
      
      priceElement.innerHTML = priceIndex;
      levelElement.innerHTML = `${currentLevel} lvl`;
      amountElement.innerHTML = amountCalc(currentLevel);
    }
  });
}

const upgradeLevel = async (levelType, level) => {
  try {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const response = await fetch(`api/users/${user.id}/updatelevel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ levelType, level }),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error('Error updating level:', error);
    throw error;
  }
}

const subtractMoney = async (priceIndex) => {
  try {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const response = await fetch(`api/users/${user.id}/subtractmoney`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ money: priceIndex }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    console.error("Error subtracting money:", err);
    throw err;
  }
}

// Initialize the application
(async () => {
  try {
    await loadMoney();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
})();
