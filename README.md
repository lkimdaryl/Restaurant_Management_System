# Restaurant Management System
The Restaurant Management System is a web application built with FastAPI and MySQL that provides functionalities for managing menu items and processing orders in a restaurant. It allows users to view the menu, place orders, and perform administrative tasks such as adding, editing, and removing menu items.

##Features
View the menu items: Customers can browse the menu items available in the restaurant.
Place orders: Customers can select items from the menu, provide their name and quantity, and submit orders.
Process orders: Admin users can view and update the status of the orders (e.g., mark an order as complete).
Manage menu items: Admin users can add new menu items, edit existing items (name and cost), and remove items from the menu.
Technologies Used
FastAPI: A modern, fast (high-performance) web framework for building APIs with Python.
MySQL: A popular open-source relational database management system.
HTML and CSS: Used for creating the user interface of the web application.
JavaScript: Used for handling dynamic interactions on the client-side.
Installation
Clone the repository:

bash
Copy code
git clone <repository-url>
Install the dependencies:

bash
Copy code
pip install -r requirements.txt
Set up the MySQL database:

Make sure you have MySQL installed and running on your system.
Create a new database called ProductItems.
Update the database connection variables in the code (host, user, password) with your own MySQL credentials.
Run the application:

bash
Copy code
uvicorn main:app --reload
Access the application in your browser:

Open http://localhost:8000 to access the restaurant management system.

Usage
Visit the homepage to view the menu items and place orders.
To access the admin panel, go to /admin and perform administrative tasks such as managing menu items and processing orders.
API Endpoints
GET /items: Retrieves all menu items.
GET /orders: Retrieves all orders.
POST /ordering: Submits an order.
POST /update_status: Updates the status of an order.
POST /add_item: Adds a new menu item.
POST /edit_item: Edits an existing menu item.
POST /remove_item: Removes a menu item.
License
This project is licensed under the MIT License.

Contributing
Contributions are welcome! If you find any issues or would like to add new features, feel free to open a pull request.

Acknowledgements
This project was developed as a part of a restaurant management system tutorial.

Contact
For any questions or inquiries, please contact [email protected]