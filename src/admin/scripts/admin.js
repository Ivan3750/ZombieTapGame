document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const rewardInput = document.getElementById('reward');
  const descriptionInput = document.getElementById('description');
  const submitButton = document.getElementById('submit');

  const form = document.getElementById('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value;
    const reward = rewardInput.value;
    const description = descriptionInput.value;

    if (!name || !reward || !description) {
      alert('Please fill out all fields.');
      return;
    }

    // Clear input fields
    nameInput.value = '';
    rewardInput.value = '';
    descriptionInput.value = '';
  });

  const imageBox = document.querySelector('.task-image-box');
  const fileInput = document.getElementById('file-input');
  const taskImage = document.querySelector('.task-image-icon');

  imageBox.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        taskImage.src = e.target.result;
        taskImage.style.width = "100%"
        taskImage.style.height = "100%"
        taskImage.style.borderRadius = "50%"
      };
      reader.readAsDataURL(file);
    }
  });
});
