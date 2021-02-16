* Simple project to create a local authentication with Node JS JWT
    * Contains a callable endpoint to registry, update and delete user account, in addition to the possibility to consult existing records 
* The database is a simple PostgreSQL instance with only a table
    * Account table creation script:
    <pre>
    CREATE TABLE public.account (
        id serial NOT NULL,
        login varchar(100) NOT NULL,
        "password" varchar(1000) NOT NULL,
        salt varchar(100) NOT NULL,
        email varchar(100) NOT NULL,
        created_on timestamp NOT NULL DEFAULT now(),
        last_login timestamp NULL,
        CONSTRAINT account_email_key UNIQUE (email),
        CONSTRAINT account_login_key UNIQUE (login)
    );
    </pre>