


export async function authenticateWithTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;

        if (user) {
            const data = {
                id: user.user.id,
                first_name: user.user.first_name,
                last_name: user.user.last_name,
                username: user.user.username,
                auth_date: user.auth_date,
                hash: user.hash
            };

            try {
                const response = await fetch('api/auth/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", result.token);
                    // Call the function to fetch user data after successful authentication
                    fetchUserData(result.token, user.user.id);
                } else {
                    console.error(`Authentication failed: ${result.error}`);
                }
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }
        } else {
            console.error('Failed to get user data from Telegram');
        }
    } else {
        console.error('Telegram WebApp object is not available');
    }
}

export async function fetchUserData() {
    const user = window.Telegram.WebApp.initDataUnsafe;
    console.log(user)
    try {
        const userResponse = await fetch(`api/users/${user.user.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.token}` }
        });

        const userData = await userResponse.json();

        if (userResponse.ok) {
            return userData
        } else {
            return null
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}
