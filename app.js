// DECLARATION OF VARIABLES

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-content');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const productsDOM = document.querySelector('.products-center');

// CART
let cart = [];

// BUTTONS
let buttonsDOM = [];

// GETTING THE PRODUCTS
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch (err) {
            console.log(err);
        }
    }
}

// DISPLAYING(UI) OF THE PRODUCTS
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>

            <h3>${product.title}</h3>
            <h4>#${product.price}</h4>
        </article>
        `;
        });
        productsDOM.innerHTML = result;

    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                // GET PRODUCT FROM PRODUCTS
                let cartItem = { ...Storage.getProduct(id), amount: 1 };

                // ADD PRODUCT TO THE CART
                cart = [...cart, cartItem];

                // SAVE CART IN LOCAL STORAGE
                Storage.saveCart(cart);

                // SET CART VALUES
                this.setCartValues(cart);

                // ADD CART ITEM TO THE DOM / DISPLAY CART ITEM
                this.addCartItem(cartItem);

                // SHOW THE CART
                this.showCart();
            });
        });
    }

    // SETTING THE CART VALUES
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal
        console.log(cartTotal, cartItems);
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>#${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up"  data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down"  data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    }

    // SHOWING ALL IN THE CART
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    // SETTING UP THE APP SO IF ITS REFRESHES WE WON'T LOSE OUR DATA / CART EXCEPT WE REMOVE & CLOSE CART
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    // POPULATING ALL THAT'S IN THE CART
    populateCart() {
        cart.forEach(item => this.addCartItem(item));
    }

    // HIDDING ALL THATS IN THE CART
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
}

// LOCAL STORAGE
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products()

    // SETUP APP
    ui.setupApp();

    // GETTING ALL PRODUCTS
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});

