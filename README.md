PROJECT TITLE: BUS TRACKER APP

PROJECT DESCRIPTION:
This is a web app developed to generates project ideas for students. The app is built using NodeJS with Express, PostgreSQL for the database and GPT-3.5 for the ideas generation

INSTALLATION:
1. Clone the repository:
    ```
    git clone https://github.com/davidkambala/Project-Ideas-Generator
    ```
2. Navigate into the project directory:
    ```
    cd Project-Ideas-Generator
    ```
3. Install the dependencies:
    ```
    npm install
    ```
4. Set up environment variables (if any):
    - Create a `.env` file in the root directory.
    - Add the following environment variables:
      ```
      API_KEY="your key from OpenAI"
      DB_USER="your postgres username"
      DB_HOST="localhost"
      DB_NAME="PIG"
      DB_PW="your postgre password"
      DB_PORT=5432
      ```


USAGE:
Before launching the app make sure you have created a database using postgreSQL, you will need only one table
the project table that can be created using the DDL:
```
CREATE TABLE Projects(
    Project_ID SERIAL PRIMARY KEY,
    Title TEXT,
	Field TEXT,
	Difficulty TEXT,
    Description TEXT,
    Task TEXT
);
```
To launch the app, run the command: 
``` bash
node index.js
```

THE APP WILL BE RUNNING ON http://localhost:3000 BY DEFAULT
