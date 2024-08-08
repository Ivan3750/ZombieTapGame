import {fetchUserData} from "../scripts/getData.js"
const userMoney = document.querySelector('#score-money');
const waitTime = 0; // TEST

const loadMoney = async() =>{
    const userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
}

window.addEventListener("load", () => {
    loadMoney()
});