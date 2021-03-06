# Let's Play!

**Let's Play!** is a web application which allows groups of users to play a variety games together.

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

![Let's Play](https://user-images.githubusercontent.com/29832401/88479035-1a1fdc00-cf6a-11ea-849f-8ade8cdc8c46.png)

## Prerequisites

You'll need the following to get a development instance of **Let's Play!** up and running locally.

- Python 3
- pip3
- NodeJS 10
- Yarn
- Virtualenv
- This repo: `git clone https://github.com/naveen-u/lets-play.git`

## Installation

Follow these steps to get a development instance up and running.

### Setting up the front-end

1. Install dependencies:

```bash
yarn
```

This helps `yarn` configure dependencies. This must be run before starting the developement server.

2. Start the development server:

```bash
yarn start
```

This will serve the front-end of the webapp from localhost:3000.

### Setting up the back-end

The backend resides in the `api` directory. Move to that directory: `cd api`

1. Create a virtual environment:

```bash
virtualenv venv
```

> _Note:_ The name of the virtual environment does not necessarily have to be `venv`. However, the `start-api` command inside `package.json` would have to be changed accordingly for that command to work.

2. Install the required python packages:

```bash
pip3 install -r requirements.txt
```

3. Set flask environment variables. Instead of setting them manually each time, a `.flaskenv` file can be created with the required variables. The following environment variables are required by flask:

```
FLASK_APP=run.py
FLASK_ENV=development
```

> _Note:_ Flask automatically looks for this file (if the python-dotenv package is present) and loads the environment variables specified here. The `FLASK_APP` variable tells flask which file the flask app is initialised in, and setting `FLASK_ENV` to development enables debug mode. `flask run` will use the interactive debugger and reloader by default in debug mode.

4. Set instance-specific flask configurations. Create an `instance` folder, and within it, a `config.py` file:

```bash
mkdir instance
cd instance
touch config.py
```

Set a `SECRET_KEY` variable inside `config.py`. For example: `SECRET_KEY = 'some random character string'`.

> _Note:_ The configurations in this file override the configurations in `api/config.py`, but is not intended to be pushed to version control or production. Use this to store API keys and configurations specific to the development environment.

5. Create the database inside the `api` directory. **Let's Play!** uses an SQLite database, with `flask-sqlalchemy` as an ORM, and `flask-migrate` to perform database migrations. Hence, the database can easily be set up locally by running the following:

```
source venv/bin/activate    # Activate the virtual environment
flask db upgrade
```

In case there are any errors with the above, ensure that you are in the `api` directory, and that your virtual environment is active.

> _Note:_ Some games might require some data in the database to function correctly. However, the platform itself stores data only when users and rooms are active, and this data gets deleted when users leave their room. Therefore, to develop a new game for the application, this setup would suffice. If you wish to run the games, follow the optional step below.

_Optional_: Populate the data required for the games to function by running `flask tables populate`.

6. Start the development server:

```
yarn start-api
```

This will start the flask development server, and it will listen to requests on port 5000. All requests sent to the front-end that cannot be resolved are forwarded to the back-end.

> _Note:_ The `yarn start-api` command internally calls `flask run` from within the virtual environment. As mentioned in step 1, this command will have to be edited in `package.json` if the virtual environment is named something other than `venv`.

## Features

The platform offers the following features:

- Room setup
  - Users can either create a new room or join existing rooms.
  - Rooms provide options to copy the code for that room, using which users can invite other users to join the room.
- Chat
  - A reusable chat component which can be included in games if and when required.

## Games

- Codenames (See wiki for more details on the rules. To be uploaded soon)

## Contributing

Pull requests are welcome. For major changes or for adding new games, please open an issue first to discuss what you would like to change or what game you would like to implement.

## License

[MIT](https://choosealicense.com/licenses/mit/)
