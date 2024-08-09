const amountUsers = document.querySelector('.amount-users');
const taskBlock = document.querySelector('.task-block');
fetch("/api/users")
.then(res=> res.json())
.then(amount=>{
  amountUsers.innerHTML = JSON.stringify(amount)

})
fetch("/api/tasks")
  .then(res => res.json())
  .then(taskArray => {
    taskArray.forEach(task => {
      // Встановлюємо значення за замовчуванням для відсутніх властивостей
      const title = task.title || 'Untitled Task';
      const reward = task.reward || 0;
      const imgBuffer = task.image; // Припускаємо, що image є в об'єкті task
      let imgUrl = ''; // Задаємо URL за замовчуванням для картинки

      if (imgBuffer && imgBuffer.data && imgBuffer.data.length > 0) {
        // Конвертуємо Buffer в Blob та потім в URL, якщо дані зображення присутні
        const arrayBuffer = new Uint8Array(imgBuffer.data).buffer;
        const blob = new Blob([arrayBuffer]);
        imgUrl = URL.createObjectURL(blob);
      }

      // Конструюємо HTML для кожної задачі
      taskBlock.innerHTML += `
        <div class="task-box">
          <div class="task-icon-box">
            <img src="${imgUrl}" alt="Task image" class="task-image">
          </div>
          <div class="task-info">
            <p class="task-name">${title}</p>
            <div class="task-reward-box">
              <p class="reward-amount">${reward}</p>
              <img src="../../assets/icons/coin.png" class="coin-icon" alt="Coin icon">
            </div>        
          </div>
        </div>
      `;
    });
  
  })
  .catch(error => {
    console.error('Error fetching tasks:', error);
  });
