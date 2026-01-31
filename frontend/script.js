// =======================
// REGISTER FORM HANDLER
// =======================
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok && data.message) {
                alert('Registration successful! Please login.');
                window.location.href = '/login';
            } else {
                alert('Registration failed: ' + (data.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}


// =======================
// LOGIN FORM HANDLER
// =======================
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok && data.message) {
                // 🔐 SAVE JWT TOKEN
                localStorage.setItem("token", data.access_token);

                alert('Login successful! Welcome ' + data.email);
                window.location.href = '/';
            } else {
                alert('Login failed: ' + (data.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}


// =======================
// CART BUTTON NAVIGATION
// =======================
const cartBtn = document.getElementById("btn3");

if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        window.location.href = "/cart.html";
    });
}
