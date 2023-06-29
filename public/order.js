document.addEventListener("DOMContentLoaded", function() {
    fetch('/items')
        .then(response => response.json())
        .then(data => {
    //        console.log(data); // log the data to the console to verify it was received correctly
            const container = document.querySelector('#grid-menu');
            data.forEach((element) => {
                const item = document.createElement('div');
                item.classList.add('grid-item');

                const nameAtt = document.createElement('div');
                const priceAtt = document.createElement('div');

                const item_name = element[1];
                const price = element[2];

                nameAtt.innerHTML = item_name;
                priceAtt.innerHTML = "$" + price;

                item_id = 0;
                item.addEventListener('click', (event)=> {
                    add_order_item(item_name, price, item_id);
                    add_order_to_list(item_name, price, item_id);
                    updatePrice();
                    item_id++;
                });

                item.appendChild(nameAtt);
                item.appendChild(priceAtt);
                container.appendChild(item);
            })
        }).catch(error => console.error());

    let order_number = 0
    order_form = document.querySelector('#order-form');
    order_form.addEventListener('submit', (event) => {
        event.preventDefault(); // prevent default form submission behavior

        const customer_name = document.querySelector('#name').value;
        const items = document.querySelectorAll('.item_container');
        order_number++;
        const list_formData = [];
        items.forEach((item) => {
            const order = item.querySelector('#order').textContent;
            const quantity = item.querySelector('#quantity').value;
            const formData = {
                name: customer_name,
                order_number: order_number,
                item: order,
                quantity: quantity
            }
           list_formData.push(formData);
        });

        // Reset the form
        order_form.reset();

        // Clear the item containers
        items.forEach((item) => {
            item.remove();
        });

        //clear the order list
        clear_order_list();
        updatePrice();

        console.log(list_formData);

        // send a POST request with the form data to the server
        fetch('/ordering', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(list_formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // log the data to the console to verify it was received correctly
            // display a success message to the user
//                const message = document.createElement('p');
//                message.textContent = 'Order submitted successfully!';
//                message.style.color = 'green';
//                document.querySelector('#order-form').appendChild(message);
        })//end of .then()
        .catch(error => console.error(error));
    });//end of order form event listener
});

function add_order_item(item, price, item_id){
    const item_info = document.querySelector('#item-info');
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item_container');

    // Create the label for item
    const itemLabel = document.createElement('label');
    itemLabel.setAttribute('for', 'order');
    itemLabel.textContent = 'Item: ';

    // Create the span for item name
    const itemNameSpan = document.createElement('span');
    itemNameSpan.id = 'order';
    itemNameSpan.textContent = item;
    const lineBreak1 = document.createElement('br');

    // Create the label for quantity
    const quantityLabel = document.createElement('label');
    quantityLabel.setAttribute('for', 'quantity');
    quantityLabel.textContent = 'Quantity';

    // Create the input for quantity
    const quantityInputSpan = document.createElement('span');
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.id = 'quantity';
    quantityInput.name = 'quantity';
    quantityInput.classList.add('quantity-input')
    quantityInput.required = true;
    quantityInput.min = '1';
    quantityInput.value = '1';

    //Adding a change event listener for the newly created input element
    quantityInput.addEventListener('change', (event) => {
        let quantity = parseInt(event.target.value);
        if (quantity < 1) {
            event.target.value = '1';
            quantity = 1;
        }
        updateQuantity(item, quantity);
        updatePrice();
    });

    //validation check
    quantityInput.addEventListener('input', () => {
    quantity = parseInt(quantityInput.value);
        if (quantity < 1) {
            quantityInput.setCustomValidity('Please enter a number greater than 0.');
        } else {
            quantityInput.setCustomValidity('');
        }
    });

    quantityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    // Append the quantity input to the quantity input span
    quantityInputSpan.appendChild(quantityInput);
    const lineBreak2 = document.createElement('br');

    //Create a remove button
    const remove_button = document.createElement('button');
    remove_button.textContent = 'remove';
    remove_button.id = item_id;

    const lineBreak3 = document.createElement('br');
    const lineBreak4 = document.createElement('br');

    remove_button.addEventListener('click', (event) => {
        remove_item(event.target.parentNode, item_id);
    });

    // Append all the elements to the item container
    itemContainer.appendChild(itemLabel);
    itemContainer.appendChild(itemNameSpan);
    itemContainer.appendChild(lineBreak1);
    itemContainer.appendChild(quantityLabel);
    itemContainer.appendChild(quantityInputSpan);
    itemContainer.appendChild(lineBreak2);
    itemContainer.appendChild(remove_button)
    itemContainer.appendChild(lineBreak3);
    itemContainer.appendChild(lineBreak4);

    //Append item container to item-info
    item_info.appendChild(itemContainer);

}

order_list = []
function add_order_to_list(item, price, item_id){
    const quantity = parseInt(document.querySelector('#quantity').value);

    const order_item = {
        id: item_id,
        item: item,
        price: price,
        quantity: 1
    };

    order_list.push(order_item);
}

function updatePrice() {
    let totalPrice = 0;

    order_list.forEach((item) => {
        const itemPrice = item.price * item.quantity;
        totalPrice += itemPrice;
    });

    const priceSpan = document.querySelector('#price');
    priceSpan.textContent = '$' + totalPrice.toFixed(2);
}

function updateQuantity(item, new_quantity){
    const existingItem = order_list.find((orderItem) => orderItem.item === item);

    if (existingItem) {
        existingItem.quantity = new_quantity;
    }
}

function remove_item(container, item_id){
    container.remove();

    const foundIndex = order_list.findIndex(item => item.id === item_id);
    if (foundIndex !== -1){
        order_list.splice(foundIndex, 1);
        updatePrice();
    }
}

function clear_order_list(){
    order_list.length = 0;
}
