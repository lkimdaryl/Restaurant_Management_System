# Necessary Imports
from fastapi import FastAPI, Request              # The main FastAPI import and Request object
from fastapi.responses import HTMLResponse        # Used for returning HTML responses (JSON is default)
from fastapi.staticfiles import StaticFiles       # Used for making static resources available to server
import uvicorn                                    # Used for running the app directly through Python
import mysql.connector as mysql                   # Used for interacting with the MySQL database
import os                                         # Used for interacting with the system environment
from dotenv import load_dotenv                    # Used to read the credentials


app = FastAPI()                                     # Specify the "app" that will run the routing
static_files = StaticFiles(directory='public')      # Specify where the static files are located
app.mount("/public", static_files, name="public")   # Mount the static directory

# route to order page
@app.get("/order")
def get_order() -> HTMLResponse:
    with open("order.html") as order_html:
        return HTMLResponse(content=order_html.read())

#route to admin page
@app.get("/admin")
def get_admin() -> HTMLResponse:
    with open("admin.html") as admin_html:
        return HTMLResponse(content=admin_html.read())

# _________________________________________________________________________________
# Database Configurations
''' Environment Variables '''
load_dotenv("credentials.env")

# Read Database connection variables
db_host = os.environ['MYSQL_HOST']
db_user = os.environ['MYSQL_USER']
db_pass = os.environ['MYSQL_PASSWORD']
db_name = os.environ['MYSQL_DATABASE']

# _________________________________________________________________________________
# Helper Methods
def check_item_id(item_id) -> bool:
    record = db_select_items()
    for items in record:
        id = items[0]
        if item_id == id:
            return True

    return False

#Select SQL queries
def db_select_items(item_name: str = None):
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()

    if item_name is None:
        query = "SELECT * FROM Menu_Items;"
        cursor.execute(query)
    else:
        query = f"SELECT * FROM Menu_Items WHERE name = '{item_name}';"
        cursor.execute(query)
        record = cursor.fetchone()
        cursor.close()
        db.close()
        return record

    records = cursor.fetchall()
    cursor.close()
    db.close()
    return records

def db_select_orders(item_id: int = None):
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()

    if item_id is None:
        query = f"SELECT * FROM Orders;"
        cursor.execute(query)
    else:
        query = f"SELECT FROM Orders WHERE item_id = {item_id}, ;"
        cursor.execute(query)
        record = cursor.fetchone()
        cursor.close()
        db.close()
        return record

    records = cursor.fetchall()
    cursor.close()
    db.close()
    return records

def db_select_order(order_number: int = None):
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()
    query = f"SELECT * FROM Orders WHERE order_number=%s"
    cursor.execute(query,(order_number,))
    record = cursor.fetchall()
    db.commit()
    db.close()

    return record

#Update SQL queries
def db_add_item(item_name: str, price: int) -> int:

    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()
    menu_items = db_select_items()

    if item_name not in menu_items:
        query = f"INSERT INTO Menu_Items (name, price) values ({item_name}, {price})"
        cursor.execute(query)
        id = cursor.lastrowid

    db.commit()
    db.close()

    return id

def db_update_item(item_id:int, new_item_name:str, new_cost:int) -> bool:
    try:
        db = mysql.connect(user=db_user, password=db_pass, host=db_host, database=db_name)
        cursor = db.cursor()

        query = f"UPDATE Menu_Items SET name=%s, price=%s WHERE item_id=%s"
        values = (new_item_name, new_cost, item_id)
        cursor.execute(query,values)
        db.commit()

        cursor.close()
        db.close()

        # Return True if a row was affected, False otherwise
        return cursor.rowcount > 0

    except Exception as e:
        print(f"Error updating item {item_id}: {e}")
        return False

def db_update_status(order_num: int):
    record = db_select_order(order_num)
    status = record[0][5]

    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()

    if (status == "Pending"):
        query = f"UPDATE Orders SET status='Complete' WHERE order_number=%s"
        cursor.execute(query, (order_num,))
        status = 'Complete'
    else:
        query = f"UPDATE Orders SET status='Pending' WHERE order_number=%s"
        cursor.execute(query, (order_num,))
        status = 'Pending'

    db.commit()
    cursor.close()
    db.close()

    return status

# DELETE SQL query
def db_remove_item(item_id: int) -> bool:
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()

    query = f"DELETE FROM Menu_Items WHERE item_id = %s;"
    val = item_id
    cursor.execute(query,(val,))

    db.commit()
    cursor.close()
    db.close()

    return True
# ______________________________________________________________________________________________
# CRUD operations
@app.get("/items")
async def get_items():
    records = db_select_items()
    return records

@app.get("/orders")
async def ordering():
    records = db_select_orders()
    return records

@app.post("/ordering")
async def ordering(request:Request):
    data_list = await request.json()

    for data in data_list:
        name = data['name']
        order_num = data['order_number']
        item = data['item']
        quantity = data['quantity']

        item_data = db_select_items(item)
        item_id = item_data[0]

        db = mysql.connect(user=db_user, password=db_pass, host=db_host, database=db_name)
        cursor = db.cursor()

        query = "INSERT INTO Orders (order_number, item_id, name, quantity, status, order_item) VALUES (%s, %s, %s, %s, %s, %s)"
        val = (order_num, item_id, name, quantity, "Pending", item )
        cursor.execute(query, val)
        db.commit()

    cursor.close()
    db.close()

    return {"message": "Order submitted successfully!"}

@app.post("/update_status")
async def update_status(request:Request):
    data = await request.json()
    order_num = data['order_number']
    status = db_update_status(order_num)

    return status

@app.post("/add_item")
async def add_item(request: Request):
    data = await request.json()
    item_name = data['item_name']
    cost = data['cost']

    db = mysql.connect(user=db_user, password=db_pass, host=db_host, database=db_name)
    cursor = db.cursor()

    query = "insert into Menu_Items (name, price) values (%s, %s)"
    values = (item_name, cost)
    cursor.execute(query, values)
    db.commit()
    db.close()

    record = db_select_items(item_name)

    return record

@app.post("/edit_item")
async def edit_item(request: Request):
    data = await request.json();

    item_id = int(data['item_id'])
    new_item_name = data['new_item_name']
    new_cost = int(data['new_cost'])
    #perform validation check if item_id is in the database
    valid = check_item_id(item_id)
    if valid:
        db_update_item(item_id, new_item_name, new_cost);
        record = db_select_items(new_item_name);
        return record
    else:
        return "Item ID not found"

@app.post("/remove_item")
async def remove_item(request: Request):
    data = await request.json()
    item_id = int(data['item_id'])
    valid = check_item_id(item_id)
    if valid:
        db_remove_item(item_id)
        return "success"
    else:
        return "Item ID not found"

# ________________________________________________________________________
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6542)