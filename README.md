<p align="center">
  <img src="./client/public/images/sendit landscape blue.jpeg" alt="SendIT Logo" width="1250"/>
</p>
<h1 align="center">SENDIT</h1>
<p align="center">
  SendIT is a courier service that helps users deliver parcels to various destinations. The platform provides courier quotes based on weight categories, ensuring efficient and cost-effective delivery solutions.
</p>
<p align="center">
  <a href="#features"><strong>Explore the Features »</strong></a>
  ·
  <a href="#installation">Installation</a>
  ·
  <a href="#technologies-used">Technologies Used</a>
  ·
  <a href="#prerequisites">Prerequisites</a>
  ·
  <a href="#contact">Contact</a>
</p>
<p align="center">
  <a href="https://github.com/adammwaniki/SendIT/issues">Report Bug</a>
  ·
  <a href="https://github.com/adammwaniki/SendIT/issues">Request Feature</a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" />
  <img src="https://img.shields.io/badge/contributions-welcome-blue" alt="Contributions Welcome" />
</p>

## features 
1. Users can create an account and log in 
2. Users can create a parcel delivery order 
3. Users can change the destination of a parcel delivery order
4. Users can cancel a parcel delivery order 
5. Users can see the details of a delivery order
6. Admin can change the status and present location of a parcel delivery order 

## Technologies used

1. REACT JS
2. CSS
3. PYTHON  
4. FLASK
5. POSTGRESQL

### Prerequisites
- Python 3.8 or higher installed on your computer

- You can install Python from the official Python website: ([https](https://www.python.org/downloads/))

- Vitual Studio Code installed or any other text editor

- Internet Connection



#### Installation 
-Fork and Clone the repository to your local machine
```sh
git https://github.com/adammwaniki/SendIT
```

-Navigate into the cloned repository

```sh
cd SENDIT
```
   -Creating backend virtual enviroment 
To do this run the following 
`pipenv install` This installs the dependacies for the virtual enviroment

`pipenv shell` This activates the virtual enviroment

`cd server ` This moves into the backend server directory

`export FLASK_APP=app.py`

`export FLASK_RUN_PORT=5555`

`flask db init`

`flask db migrate -m "migration message"`

`flask db upgrade`

This creates the database and tables

`python seed.py`
This will seed the database with some dummy data

`python app.py`

Front end enviroment
`cd client`

`npm install`

`npm start `
This will start the front end server


## Contact
For any contribution or inquiries, contact us at: 


✉️sendIT@gmail.com