// CONTENTFUL CLIENT API CONSUMPTION
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "y27o1id6khno",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "mASA32O2Zk6nB_mZslKcc-Ma8YTaa8fTXBmszk8HRdE"
  });

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

            let contentful = await client.getEntries({
                content_type: 'agapeInterior'
              })
            // .then((response) => console.log(response.items))
            // .catch(console.error)
            // let result = await fetch("products.json");
            // let data = await result.json();

            let products = contentful.items;
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

    // CLEAR CART LOGIC
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        // CART FUNCTIONALITY METHOD
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id)
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    // CLEAR CART METHOD
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }

    // REMOVING ITEMS IN THE CART FUNCTIONALITY / METHOD
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
        `
    }

    // GETTING A SINGLE BUTTON FUNC / METHOD
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
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
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
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