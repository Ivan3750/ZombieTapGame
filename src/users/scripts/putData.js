
// Function to update hearts for a user
export async function minusHearts(game_hearts) {
    const user = window.Telegram.WebApp.initDataUnsafe;

    const url = `/minus-hearts/${user.user.id}`;
    
    let last_time_heart = new Date()
    // Construct the request payload
    const body = {
      game_hearts,
      last_time_heart
    };
  
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.token}` // Include the JWT token in the headers
        },
        body: JSON.stringify(body)
      });
  
      // Check if the request was successful
      if (response.ok) {
        const data = await response.json();
        console.log('Updated user:', data);
        // Handle the success case (e.g., update the UI)
      } else {
        const errorData = await response.json();
        console.error('Error updating user:', errorData.error);
        // Handle the error case (e.g., display an error message)
      }
    } catch (error) {
      console.error('Request failed:', error);
      // Handle any other errors (e.g., network issues)
    }
  }
  
  