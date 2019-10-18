// DECLARATION OF VARIABLES

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-content');
const cartItem = document.querySelector('.cart-item');
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

                // ADD / DISPLAY CART ITEM
                // SHOW THE CART
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
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products()

    // GETTING ALL PRODUCTS
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
    });
});

