document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

//navbar buttons
    const loginBtn = document.getElementById("btn1");
    const registerBtn = document.getElementById("btn2");
    const logoutBtn = document.getElementById("btn4");
    const cartBtn = document.getElementById("btn3");

    // Show / hide based on auth
    if (token) {
        loginBtn?.style.setProperty("display", "none");
        registerBtn?.style.setProperty("display", "none");
        logoutBtn?.style.setProperty("display", "block");
    } else {
        loginBtn?.style.setProperty("display", "block");
        registerBtn?.style.setProperty("display", "block");
        logoutBtn?.style.setProperty("display", "none");
    }

    // Navigation
    loginBtn?.addEventListener("click", () => window.location.href = "/login");
    registerBtn?.addEventListener("click", () => window.location.href = "/register");
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    });
    cartBtn?.addEventListener("click", () => window.location.href = "/cart");

//login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const loginData = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };
            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });
                const data = await res.json();
                if (res.ok && data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    alert("Login successful! Welcome " + data.email);
                    window.location.href = "/";
                } else {
                    alert("Login failed: " + (data.detail || "Unknown error"));
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }

//register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const userData = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
                const data = await res.json();
                if (res.ok && data.message) {
                    alert("Registration successful! Please login.");
                    window.location.href = "/login";
                } else {
                    alert("Registration failed: " + (data.detail || "Unknown error"));
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }
});

