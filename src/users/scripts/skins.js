let zombieIndex = 1
let maxLevel = 2;


const sprite = document.querySelector('.sprite');
const btnLeft = document.querySelector('.slider-left');
const btnRight = document.querySelector('.slider-right');
const lock = document.querySelector('.img-lock');
const skinPrice = document.querySelector('.skin-price');
const coin = document.querySelector('.coin');

const skinsPrice = [
    0, 600, 1000, 1500, 2000, 2500, 3000, 3500, 4000,
];

let activeSprite = 1


const loadSprite = (() => {
    let isSkinPriceClickable = false;

    const updateSkinPrice = () => {
        if (maxLevel < activeSprite) {
            sprite.classList.add("lock");
            lock.style.display = "flex";
            coin.style.display = "block";
            skinPrice.innerHTML = skinsPrice[activeSprite - 1];
        } else {
            sprite.classList.remove("lock");
            lock.style.display = "none";
            coin.style.display = "none";
            if (zombieIndex === activeSprite) {
                skinPrice.innerHTML = "Selected";
            } else {
                skinPrice.innerHTML = "Select";
                if (!isSkinPriceClickable) {
                    isSkinPriceClickable = true;
                    skinPrice.addEventListener("click", () => {
                        zombieIndex = activeSprite;
                        skinPrice.innerHTML = "Selected";
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

const handleLeftClick = () => {
    if (activeSprite > 1) {
        activeSprite--;
        loadSprite();
    }
};

const handleRightClick = () => {
    if (activeSprite < 9) {
        activeSprite++;
        loadSprite();
    }
};

if(btnLeft && btnRight){
    btnLeft.addEventListener("click", handleLeftClick);
    btnRight.addEventListener("click", handleRightClick);
    
    window.addEventListener("load", loadSprite);

}
