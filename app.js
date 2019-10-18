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

}

// LOCAL STORAGE
class Storage {

}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products()

    products.getProducts().then(products => console.log(products));
})
