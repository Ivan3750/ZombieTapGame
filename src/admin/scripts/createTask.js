document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const taskImageIcon = document.querySelector('.task-image-icon');
    const form = document.getElementById('form');
    let base64Image;
    // Обробник натискання на іконку завантаження зображення
    taskImageIcon.addEventListener('click', () => {
      fileInput.click();
    });
  
    // Обробник завантаження файлу
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          taskImageIcon.src = e.target.result; // Показати зображення
          taskImageIcon.alt = 'Selected image';
  
          // Зберегти Base64-рядок у прихованому полі або змінній
           base64Image = e.target.result.split(',')[1]; // Отримати Base64-дані без префікса
  
  
          // Додати base64Image у FormData або відправити на сервер іншим способом
          // formData.append('imageBase64', base64Image); // якщо використовуєте FormData
        };
        reader.readAsDataURL(file); // Читати файл як URL
      }
    });
  
    // Обробник відправки форми
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Перевірка заповнення всіх полів
      const name = document.getElementById('name').value.trim();
      const reward = document.getElementById('reward').value.trim();
      const link = document.getElementById('link').value.trim();
      const description = document.getElementById('description').value.trim();
  
      if (!name || !reward || !description) {
        alert('Please fill in all required fields.');
        return;
      }
  
      // Створення об'єкта FormData і додавання даних форми
      let data = {
        name: name,
        reward: reward,
        description: description,
        link: link,
        file: base64Image,
      }
      try {
        // Assuming `data` is an object you want to send
        const response = await fetch('/api/createTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),  // Convert data to JSON string
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
      
        // Handle successful response
        alert('Task created successfully!');
        form.reset();  // Reset the form
        taskImageIcon.src = '../assets/icons/upload.png';  // Reset the image icon
      
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert('An error occurred while creating the task.');
      }
      
    });
  });
  
  