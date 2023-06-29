# Necessary Imports
import mysql.connector as mysql                   # Used for interacting with the MySQL database
import os                                         # Used for interacting with the system environment
from dotenv import load_dotenv                    # Used to read the credentials


''' Environment Variables '''
load_dotenv("credentials.env")

# Read Database connection variables
db_host = os.environ['MYSQL_HOST']
db_user = os.environ['MYSQL_USER']
db_pass = os.environ['MYSQL_PASSWORD']
db_name = os.environ['MYSQL_DATABASE']


# Connect to the db and create a cursor object
db =mysql.connect(user=db_user, password=db_pass, host=db_host)
cursor = db.cursor()

cursor.execute("CREATE DATABASE if not exists ProductItems")
cursor.execute("USE ProductItems")

try:
   cursor.execute("""
   CREATE TABLE if not exists Menu_Items (
        item_id      INT  AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(50) NOT NULL,
        price        DECIMAL(10,3) NULL
   );
 """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))

query = "insert into Menu_Items (name, price) values (%s, %s)"
values = [
    ('Hamburger',5.00),
    ('Fries',3.00),
    ('Soda',1.00)
]

cursor.executemany(query, values)
db.commit()

try:
   cursor.execute("""
   CREATE TABLE if not exists Orders (
       order_id     INT AUTO_INCREMENT PRIMARY KEY,
       order_number INT NOT NULL,
       item_id      INT NOT NULL,
       name         VARCHAR(50) NULL,
       quantity     INT NULL,
       status       VARCHAR(30) NULL,
       order_item   VARCHAR(30) NULL,
       FOREIGN KEY  (item_id) REFERENCES Menu_Items(item_id)
   );
 """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))

cursor.close()
db.close()