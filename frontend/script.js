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

    // 🏠 HOME PAGE - SERVICES DISPLAY
    if (location.pathname === "/") {
        const servicesContainer = document.getElementById("servicesContainer");
        if (servicesContainer) {
            fetchServices();
        }

        async function fetchServices() {
            try {
                const res = await fetch("/api/cart/services");
                const data = await res.json();
                renderServices(data.services || []);
            } catch (err) {
                console.error(err);
            }
        }

        function renderServices(services) {
            servicesContainer.innerHTML = "";

            if (!services.length) {
                servicesContainer.innerHTML =
                    `<div style="text-align:center; padding: 20px;">No services available</div>`;
                return;
            }

            services.forEach(service => {
                const serviceDiv = document.createElement("div");
                serviceDiv.className = "service-card";
                serviceDiv.innerHTML = `
                    <div class="service-content">
                        <h3>${service.service_name}</h3>
                        <div class="service-details">
                            <div><strong>Price:</strong> $${service.service_price.toFixed(2)}</div>
                            <div><strong>Duration:</strong> ${service.service_length} mins</div>
                        </div>
                        ${token ? `<button class="add-to-cart-btn" onclick="addToCart(${service.service_id})">Add to Cart</button>` : ''}
                    </div>
                `;
                servicesContainer.appendChild(serviceDiv);
            });
        }
    }

    window.addToCart = async (serviceId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in first");
            location.href = "/login";
            return;
        }
        
        try {
            const res = await fetch(`/api/cart/items/${serviceId}?quantity=1`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Service added to cart!");
            } else {
                alert("Failed to add service to cart");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding to cart");
        }
    };

    // 3️⃣ CART PAGE LOGIC
    if (location.pathname.includes("cart")) {
        const cartContainer = document.getElementById("cartContainer");
        const checkoutBtn = document.getElementById("checkoutBtn");

        if (token && cartContainer) {
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
            cartContainer.innerHTML = "";
            let total = 0;

            if (!items.length) {
                cartContainer.innerHTML =
                    `<div style="text-align:center; padding: 20px;">Your cart is empty</div>`;
                return;
            }

            items.forEach(item => {
                total += item.total_price;
                const itemDiv = document.createElement("div");
                itemDiv.className = "cart-item";
                itemDiv.innerHTML = `
                    <button class="delete-btn" onclick="removeItem(${item.cart_id})">✕</button>
                    <div class="item-details">
                        <div><strong>Service:</strong> ${item.service_name}</div>
                        <div><strong>Quantity:</strong> ${item.quantity}</div>
                        <div><strong>Unit Price:</strong> $${item.service_price.toFixed(2)}</div>
                        <div><strong>Total Price:</strong> $${item.total_price.toFixed(2)}</div>
                    </div>
                `;
                cartContainer.appendChild(itemDiv);
            });

            // Add total price section
            const totalDiv = document.createElement("div");
            totalDiv.className = "cart-total";
            totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
            cartContainer.appendChild(totalDiv);
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
