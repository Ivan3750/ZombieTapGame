document.addEventListener('DOMContentLoaded', () => {
  const amountUsers = document.querySelector('.amount-users');
  const taskBlock = document.querySelector('.task-block');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const users = await res.json();
      amountUsers.textContent = users
    } catch (error) {
      handleError('users');
    }
  };

  const fetchTasks = async () => {
    
    try {
      const res = await fetch('/api/tasks/');
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.statusText}`);
      }
      const taskArray = await res.json();
      renderTasks(taskArray);
    } catch (error) {
      handleError('tasks');
    }
  };

  const renderTasks = (tasks) => {
    if (tasks.length === 0) {
      taskBlock.innerHTML = `<div class="task-box"><p class="task-nothing-text">There are no tasks</p></div>`;
      return;
    }

    const taskHTML = tasks.map(task => {
      const title = task.title || 'Untitled Task';
      const reward = task.reward || 0;
      const imgUrl = getTaskImageUrl(task.image);

      return `
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
          <button class="btn-task-delete" onclick="deleteTask(${task.task_id})">Delete</button>
        </div>
      `;
    }).join('');

    taskBlock.innerHTML = taskHTML;
  };

  const getTaskImageUrl = (imgBuffer) => {
    if (imgBuffer && imgBuffer.data && imgBuffer.data.length > 0) {
      const arrayBuffer = new Uint8Array(imgBuffer.data).buffer;
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    return '';
  };

  const handleError = (type) => {
    if (type === 'users') {
      amountUsers.textContent = 'Error loading users';
    } else if (type === 'tasks') {
      taskBlock.innerHTML = `<div class="task-box"><p class="task-nothing-text">Error loading tasks</p></div>`;
    }
    console.error(`Error fetching ${type}`);
  };

  fetchUsers();
  fetchTasks();
});

const deleteTask = async (taskID) => {
  try {
    const response = await fetch(`/api/tasks/${taskID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task with ID ${taskID}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Task deleted:', data);

    // Optionally update UI here
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};
