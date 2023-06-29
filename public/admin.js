document.addEventListener("DOMContentLoaded", function() {
    fetch('/items')
    .then(response => response.json())
    .then(data => {
        data.forEach((element) => {
            add_item_to_site(element);
        });
    })
    .catch(error => console.error(error));

    const formattedDataMap = new Map();
    fetch('/orders')
    .then(response => response.json())
    .then(data => {
        data.forEach((element) => {
            const [order_id, order_number, item_id, name, quantity, status, item] = element;

            if (!formattedDataMap.has(order_number)) {
                formattedDataMap.set(order_number, {
                    order_id,
                    order_number,
                    name,
                    status,
                    items: []
                });
            }
            const orderData = formattedDataMap.get(order_number);
            orderData.items.push({ item_id, quantity, item });
        })
        // Convert the map values to an array
        const formattedData = Array.from(formattedDataMap.values());
        const container = document.querySelector('#grid-orders');
        formattedData.forEach((element) => {
            //displays the orders in a grid (name, [item, quantity], status)
            const order = document.createElement('div');
            order.classList.add('grid-item');

            order.addEventListener('click', (event) => {
                fetch('/update_status', {
                    credentials: 'same-origin',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({'order_number': element.order_number })
                })
                .then(response => response.json())
                .then(status => {
                    statusAtt.innerHTML = "Status: " + status;
                })
            })

            const nameAtt = document.createElement('div');
            const statusAtt = document.createElement('div');
            const itemAtt = document.createElement('div')
            const linebreak1 = document.createElement('br');
            const linebreak2 = document.createElement('br');

            nameAtt.innerHTML = "Name: " + element.name;
            statusAtt.innerHTML = "Status: " + element.status;
            itemAtt.innerHTML = "Items: ";

            order.appendChild(nameAtt);
            order.appendChild(linebreak1);
            order.appendChild(itemAtt);
            element.items.forEach((item) => {
                itemName = document.createElement('div');
                itemName.innerHTML = item.item + ' x' + item.quantity;
                order.appendChild(itemName);
            })
            order.appendChild(linebreak2);
            order.appendChild(statusAtt);
            container.appendChild(order);
        })
    })
    .catch(error => console.error(error));

    add_menu_form = document.querySelector('#add_item_form');
    add_menu_form.addEventListener('submit', (event) => {
        event.preventDefault();
        const item_name = document.querySelector('#item-name').value;
        const cost = document.querySelector('#cost').value;
        form_data = {'item_name': item_name, 'cost': cost}
        fetch('/add_item', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(form_data)
        })
        .then(response => response.json())
        .then(element =>{
            add_item_to_site(element);
        })
        add_menu_form.reset();
    });

    edit_menu_form = document.querySelector('#edit_item_form');
    edit_menu_form.addEventListener('submit', (event) => {
        event.preventDefault();

        item_id = document.querySelector('#item-id').value;
        new_item_name = document.querySelector('#new-item-name').value;
        new_cost = document.querySelector('#new-cost').value;
        form_data = {'item_id': item_id, 'new_item_name': new_item_name, 'new_cost': new_cost};

        fetch('/edit_item', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(form_data)
        })
        .then(response => response.json())
        .then(new_element => {
            grid_items = document.querySelectorAll('.grid-item');
            grid_items.forEach(item => {
                if (item.innerHTML.includes('ID: ' + item_id)) {
                    item.remove();
                    add_item_to_site(new_element);
                }
            });
        })
        edit_menu_form.reset();
    });

    remove_menu_form = document.querySelector('#remove_item_form');
    remove_menu_form.addEventListener('submit', (event) => {
        event.preventDefault();

        const item_id = document.querySelector('#remove-item-id').value;
        fetch('/remove_item', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({'item_id': item_id})
        })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            if (response === "success"){
                grid_items = document.querySelectorAll('.grid-item');
                grid_items.forEach(item => {
                    if (item.innerHTML.includes('ID: ' + item_id)) {
                        item.remove();
                    }
                })
            }else{
                alert(response);
            }
        })
        remove_menu_form.reset();
    });
}); //end of DOMContentLoaded

function add_item_to_site(element){
    container = document.querySelector('#grid-menu');
    item = document.createElement('div');
    item.classList.add('grid-item');

    idAtt = document.createElement('div');
    nameAtt = document.createElement('div');
    priceAtt = document.createElement('div');

    idAtt.innerHTML = "ID: " + element[0];
    nameAtt.innerHTML = element[1];
    priceAtt.innerHTML = "$" + element[2];

    item.appendChild(idAtt);
    item.appendChild(nameAtt);
    item.appendChild(priceAtt);
    container.appendChild(item);
}