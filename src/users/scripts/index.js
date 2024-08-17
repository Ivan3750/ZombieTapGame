import { authenticateWithTelegram, fetchUserData } from "../scripts/getData.js";

const zombie = document.querySelector('.avatar');
const playBtn = document.querySelector('#play-btn');
const userMoney = document.querySelector('#score-money');
const userHeart = document.querySelector('#heart-amount');
let heartCount;

const loadUserData = async () => {
    try {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userData = await fetchUserData();
        userMoney.innerHTML = userData.money;
        heartCount = await fetchHeartCount(user.user.id);
        userHeart.innerHTML = heartCount;
        updatePlayBtnState(); // Оновлення стану кнопки після завантаження даних
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}



const fetchHeartCount = async (userId) => {
    try {
        const response = await fetch(`/api/heart/${userId}`);
        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error fetching heart count:', error);
        return 0;
    }
}

const updatePlayBtnState = async () => {
    if (heartCount != 0) {
        playBtn.classList.add("active");
    } else {
        playBtn.classList.remove("active");
    }
}

const handlePlayBtnClick = () => {
    if (playBtn.classList.contains("active")) {
        window.location.href = "/game";
    }
}


window.addEventListener("load", () => {
    authenticateWithTelegram().then(() => {
        loadUserData();
        setInterval(() => {
            loadUserData();
        }, 60000); // Перевіряти кожну хвилину
    });
});


playBtn.addEventListener("click", handlePlayBtnClick);
