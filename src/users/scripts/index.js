const zombie = document.querySelector('.avatar');
const playBtn = document.querySelector('.play-btn');
const userMoney = document.querySelector('#score-money');

import {authenticateWithTelegram, fetchUserData} from "../scripts/getData.js"

const waitTime = 0; // TEST

const loadMoney = async() =>{
    const userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
}


function updatePlayBtnState() {
    if (waitTime === 0) {
        playBtn.classList.add("active");
    } else {
        playBtn.classList.remove("active");
    }
}

function handlePlayBtnClick() {
    if (waitTime === 0) {
        playBtn.classList.add("active");
        window.location.href = "/game";
    } else {
        playBtn.classList.remove("active");
    }
}
/* 
function startZombieAnimation() {
    let i = 1;
    setInterval(() => {
        zombie.src = `../../assets/sprites/1/Idle 1 (${i}).png`;
        i = i % 10 + 1; 
    }, 125);
} */

window.addEventListener("load", () => {
    authenticateWithTelegram();
    loadMoney()
    updatePlayBtnState();
/*     startZombieAnimation();
 */});

playBtn.addEventListener("click", handlePlayBtnClick);
