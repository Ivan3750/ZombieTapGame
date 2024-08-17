document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const taskImageIcon = document.querySelector('.task-image-icon');
  const form = document.getElementById('form');
  const taskBlock = document.getElementById('task-block');
  let base64Image = '';

  // Click event for the image icon
  taskImageIcon.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change event
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        taskImageIcon.src = e.target.result;
        taskImageIcon.alt = 'Selected image';
        base64Image = e.target.result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  });

  // Form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const reward = document.getElementById('reward').value.trim();
    const link = document.getElementById('link').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!name || !reward || !description) {
      alert('Please fill in all required fields.');
      return;
    }

    const data = {
      name,
      reward,
      description,
      link,
      file: base64Image,
    };

    try {
      const response = await fetch('/api/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      alert('Task created successfully!');
      form.reset();
      taskImageIcon.src = '../assets/icons/upload.png';
      base64Image = ''; // Reset the base64 image

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      alert('An error occurred while creating the task.');
    }
  });
});
