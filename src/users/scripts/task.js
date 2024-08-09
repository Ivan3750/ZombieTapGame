import {fetchUserData} from "../scripts/getData.js"
const userMoney = document.querySelector('#score-money');
const waitTime = 0; // TEST
const taskBlock = document.querySelector('.task-block');


const loadMoney = async() =>{
    const userData = await fetchUserData();
    userMoney.innerHTML = userData.money;
    taskBlock.innerHTML = "";
    console.log(userData.task_summary)
    const {task_summary:taskArray } = userData
    console.log(taskArray)
    taskArray.forEach(task => {
        // Set default values for missing properties
        const title = task.title || 'Untitled Task';
        const reward = task.reward || 0;
    
        // Construct the HTML for each task
        taskBlock.innerHTML += `
            <div class="task-box">
                <div class="task-icon-box">
                    <!-- Add an icon here if needed -->
                </div>
                <div class="task-info">
                    <p class="task-name">${title}</p>
                    <div class="task-reward-box">
                        <p class="reward-amount">${reward}</p>
                        <img src="../../assets/icons/coin.png" class="coin-icon" alt="">
                    </div>        
                </div>
            </div>
        `;
    });
    
}

window.addEventListener("load", () => {
    loadMoney()
});