document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // 1️⃣ Load navbar FIRST
    const navContainer = document.getElementById("nav");
    if (navContainer) {
        const res = await fetch("/static/nav.html");
        navContainer.innerHTML = await res.text();
    }

    // 2️⃣ Navbar buttons (AFTER nav loads)
    const loginBtn = document.getElementById("btn1");
    const registerBtn = document.getElementById("btn2");
    const cartBtn = document.getElementById("btn3");
    const logoutBtn = document.getElementById("btn4");

    // Show / hide based on auth
    if (token) {
        loginBtn && (loginBtn.style.display = "none");
        registerBtn && (registerBtn.style.display = "none");
        logoutBtn && (logoutBtn.style.display = "inline-block");
    } else {
        loginBtn && (loginBtn.style.display = "inline-block");
        registerBtn && (registerBtn.style.display = "inline-block");
        logoutBtn && (logoutBtn.style.display = "none");
    }

    // Navigation
    loginBtn?.addEventListener("click", () => location.href = "/login");
    registerBtn?.addEventListener("click", () => location.href = "/register");
    cartBtn?.addEventListener("click", () => location.href = "/cart");
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        location.href = "/";
    });

    // 3️⃣ CART PAGE LOGIC
    if (location.pathname.includes("cart")) {
        const cartTableBody = document.getElementById("cartTableBody");
        const cartTotalPrice = document.getElementById("cartTotalPrice");
        const checkoutBtn = document.getElementById("checkoutBtn");

        if (token && cartTableBody) {
            fetchCart();
        }

        async function fetchCart() {
            try {
                const res = await fetch("/api/cart/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                renderCart(data.cart || []);
            } catch (err) {
                console.error(err);
            }
        }

        function renderCart(items) {
            cartTableBody.innerHTML = "";
            let total = 0;

            if (!items.length) {
                cartTableBody.innerHTML =
                    `<tr><td colspan="5" style="text-align:center;">Your cart is empty</td></tr>`;
                cartTotalPrice.textContent = "0.00";
                return;
            }

            items.forEach(item => {
                total += item.total_price;
                cartTableBody.innerHTML += `
                    <tr>
                        <td>${item.service_name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.service_price.toFixed(2)}</td>
                        <td>$${item.total_price.toFixed(2)}</td>
                        <td>
                            <button class="delete-btn" onclick="removeItem(${item.cart_id})">Remove</button>
                        </td>
                    </tr>
                `;
            });

            cartTotalPrice.textContent = total.toFixed(2);
        }

        window.removeItem = async (id) => {
            if (!confirm("Remove item?")) return;
            await fetch(`/api/cart/items/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        };

         checkoutBtn?.addEventListener("click", () => location.href = "/checkout");
    }

    // 4️⃣ LOGIN
    document.getElementById("loginForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.access_token);
            location.href = "/";
        } else {
            alert(data.detail);
        }
    });

    // 5️⃣ REGISTER
    document.getElementById("registerForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        });
        const data = await res.json();
        if (res.ok) {
            location.href = "/login";
        } else {
            alert(data.detail);
        }
    });
});
