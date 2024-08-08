import { fetchUserData } from "../scripts/getData.js";

const loadData = async () => {
  // Fetch user data
  const userData = await fetchUserData();
  let zombieIndex = 1;
  let maxLevel = userData.max_skins;
  let activeSprite = userData.active_skin;
  console.log(maxLevel, activeSprite);

  // Get DOM elements
  const sprite = document.querySelector('.sprite');
  const btnLeft = document.querySelector('.slider-left');
  const btnRight = document.querySelector('.slider-right');
  const lock = document.querySelector('.img-lock');
  const skinPrice = document.querySelector('.skin-price');
  const coin = document.querySelector('.coin');

  // Define skin prices
  const skinsPrice = [0, 600, 1000, 1500, 2000, 2500, 3000, 3500, 4000];

  // Load sprite and update UI based on state
  const loadSprite = (() => {
    let isSkinPriceClickable = false;

    const updateSkinPrice = () => {
      if (maxLevel < activeSprite) {
        // Skin is locked
        sprite.classList.add("lock");
        lock.style.display = "flex";
        coin.style.display = "block";
        skinPrice.innerHTML = skinsPrice[activeSprite - 1];
      } else {
        // Skin is unlocked
        sprite.classList.remove("lock");
        lock.style.display = "none";
        coin.style.display = "none";
        if (zombieIndex === activeSprite) {
          skinPrice.innerHTML = "Selected";
        } else {
          skinPrice.innerHTML = "Select";
          if (!isSkinPriceClickable) {
            isSkinPriceClickable = true;
            skinPrice.addEventListener("click", async () => {
              await handleSelectSkin(activeSprite, skinsPrice[activeSprite - 1]);
            });
          }
        }
      }
    };

    const updateSpriteImage = () => {
      sprite.src = `../../assets/sprites/${activeSprite}/Idle 1 (${activeSprite}).png`;
    };

    return () => {
      updateSkinPrice();
      updateSpriteImage();
    };
  })();

  // Handle left arrow click
  const handleLeftClick = () => {
    if (activeSprite > 1) {
      activeSprite--;
      loadSprite();
    }
  };

  // Handle right arrow click
  const handleRightClick = () => {
    if (activeSprite < skinsPrice.length) { // Use length for boundary check
      activeSprite++;
      loadSprite();
    }
  };

  // Add event listeners for navigation buttons
  if (btnLeft && btnRight) {
    btnLeft.addEventListener("click", handleLeftClick);
    btnRight.addEventListener("click", handleRightClick);
    
    window.addEventListener("load", loadSprite);
  }
};

// Handle skin selection
const handleSelectSkin = async (activeSprite, price) => {
  try {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const response = await subtractMoney(price);
    if (response.success) {
      // Successfully purchased
      zombieIndex = activeSprite;
      document.querySelector('.skin-price').innerHTML = "Selected";
      console.log("Skin purchased successfully");
    } else {
      console.log("Failed to purchase skin");
    }
  } catch (err) {
    console.error("Error selecting skin:", err);
  }
};

// Subtract money from user's account
const subtractMoney = async (amount) => {
  try {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const response = await fetch(`api/users/${user.id}/subtractmoney`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ money: amount }),
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

loadData();
