# Let's Play!

**Let's Play!** is a web application which allows groups of users to play a variety games together.

![Let's Play](https://user-images.githubusercontent.com/29832401/88479035-1a1fdc00-cf6a-11ea-849f-8ade8cdc8c46.png)


## Prerequisites

You'll need the following to get a development instance of **Let's Play!** up and running locally.

- Python 3
- pip3
- NodeJS 10
- Yarn
- This repo: `git clone https://github.com/naveen-u/lets-play.git`

## Installation

Follow these steps to get a development instance up and running.

### Setting up the front-end

1) Install dependencies:
```bash
yarn
```
2) Start the development server:
```bash
yarn start
```
This will serve the front-end of the webapp from localhost:3000.

### Setting up the back-end

The backend resides in the `api` directory. Move to that directory: `cd api`

1) Create a virtual environment:
```bash
python3 -m venv venv
```
>*Note:* The name of the virtual environment does not necessarily have to be `venv`. However, the `start-api` command inside `package.json` would have to be changed accordingly for that command to work.

2) Install the required python packages:
```bash
pip3 install -r requirements.txt
```

3) Set flask environment variables. Instead of setting them manually each time, a `.flaskenv` file can be created with the required variables. The following environment variables are required by flask:
```
FLASK_APP=run.py
FLASK_ENV=development
```
>*Note:* Flask automatically looks for this file (if the python-dotenv package is present) and loads the environment variables specified here. The `FLASK_APP` variable tells flask which file the flask app is initialised in, and setting `FLASK_ENV` to development enables debug mode. `flask run` will use the interactive debugger and reloader by default in debug mode.

4) Set instance-specific flask configurations. Create an `instance` folder, and within it, a `config.py` file:
```bash
mkdir instance
cd instance
touch config.py
```
Set a `SECRET_KEY` variable inside `config.py`. For example: `SECRET_KEY = 'some random character string'`. 
>*Note:* The configurations in this file override the configurations in `api/config.py`, but is not intended to be pushed to version control or production. Use this to store API keys and configurations specific to the development environment.

5) Create the database inside the `api` directoy. **Let's Play!** uses an SQLite database, with `flask-sqlalchemy` as an ORM, and `flask-migrate` to perform database migrations. Hence, the database can easily be set up locally by running the following:
```
source venv/bin/activate    # Activate the virtual environment
flask db upgrade
```
>*Note:* Some games might require some data in the database to function correctly. However, the platform itself stores data only when users and rooms are active, and this data gets deleted when users leave their room. Therefore, to develop a new game for the application, this setup would suffice.

6) Start the development server:
```
yarn start-api
```
This will start the flask development server, and it will listen to requests on port 5000. All requests sent to the front-end that cannot be resolved are forwarded to the back-end.
>*Note:* The `yarn start-api` command internally calls `flask run` from within the virtual environment. As mentioned in step 1, this command will have to be edited in `package.json` if the virtual environment is named something other than `venv`.

## Features
The platform offers the following features:
- Room setup
  - Users can either create a new room or join existing rooms.
  - Rooms provide options to copy the code for that room, using which users can invite other users to join the room.
- Chat
  - A reusable chat component which can be included in games if and when required.

## Games
- Codenames


## Contributing
Pull requests are welcome. For major changes or  for adding new games, please open an issue first to discuss what you would like to change or what game you would like to implement.

## License
[MIT](https://choosealicense.com/licenses/mit/)