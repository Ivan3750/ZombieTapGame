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
      if (taskArray.length > 0) {
        taskArray.forEach(task => {
          const title = task.title || 'Untitled Task';
          const reward = task.reward || 0;
          const imgBuffer = task.image;
          let imgUrl = '';

          if (imgBuffer && imgBuffer.data && imgBuffer.data.length > 0) {
            const arrayBuffer = new Uint8Array(imgBuffer.data).buffer;
            const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
            imgUrl = URL.createObjectURL(blob);
          }

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
      } else {
        taskBlock.innerHTML += `
          <div class="task-box">
            <p class="task-nothing-text">There are no tasks</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
      taskBlock.innerHTML += `
        <div class="task-box">
          <p class="task-nothing-text">There are no tasks</p>
        </div>
      `;
    });
