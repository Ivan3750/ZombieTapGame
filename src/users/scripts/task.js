import { fetchUserData } from "../scripts/getData.js";

const userMoney = document.querySelector('#score-money');
const taskBlock = document.querySelector('.task-block');

// Function to fetch tasks from the external API
const fetchExternalTasks = async () => {
    try {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const response = await fetch(`/api/tasks/${user.user.id}`);
        if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching external tasks:', error);
        return null;
    }
};

const loadMoney = async () => {
    try {
        const userData = await fetchUserData();
        if (userData) {
            // Update user money
            userMoney.textContent = userData.money;

            // Clear existing tasks
            taskBlock.innerHTML = "";

            let taskArray = []
            // Fetch external tasks and combine them with user tasks
            const externalTasks = await fetchExternalTasks();
            if (externalTasks && externalTasks.tasks) {
                taskArray.push(...externalTasks.tasks); // Combine external tasks with user's tasks
            }

            if (taskArray.length === 0) {
                taskBlock.innerHTML = `<p class="task-nothing-text">There are no tasks</p>`;
                return;
            }

            // Generate the HTML for each task
            const taskHTML = taskArray.map(task => {
                const title = task.title || 'Important Task';
                const reward = task.reward || 0;
                return `
                <a href="${task.link} target="_blank">
                    <div class="task-box">
                        <div class="task-icon-box">
                            <!-- Add an icon here if needed -->
                        </div>
                        <div class="task-info">
                            <p class="task-name">${title}</p>
                            <div class="task-reward-box">
                                <p class="reward-amount">${reward}</p>
                                <img src="../../assets/icons/coin.png" class="coin-icon" alt="Coin Icon">
                            </div>        
                        </div>
                    </div>
                </a>
                `;
            }).join('');

            // Insert the tasks into the task block
            taskBlock.innerHTML = taskHTML;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        taskBlock.innerHTML = `<p class="task-nothing-text">Failed to load tasks</p>`;
    }
};

window.addEventListener("load", loadMoney);
