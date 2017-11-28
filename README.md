Cohousing Backend
=================

Backend for Cohousing tenants, handling persistence of data, authorization and
exposing the API through a [GraphQL][graphql] interface.

Installation
------------

It is still early days and under development. It is therefore not possible to
install it for public use. The plan is that it will be hosted on
[cohousing.nu][cohousing.nu] when it gets nearer completion.

Development
-----------

For local development it requires a [MariaDB][mariadb] server or [Mysql][mysql]
server. Those can be installed on your local operating system using whatever 
method you like. 

I personally use [Docker][docker] to install a development database using the
following command:

```
docker run --name mariadb -d -e MYSQL_ALLOW_EMPTY_PASSWORD=true -p 3306:3306 mariadb:10.3
```

You then need to create 3 databases, for 3 test tenants. I normally do it like this:

```
CREATE DATABASE tenant1;
CREATE DATABASE tenant2;
CREATE DATABASE tenant3;
```

[graphql]: http://graphql.org
[cohousing.nu]: http://cohousing.nu
[mariadb]: https://mariadb.org
[mysql]: https://www.mysql.com
[docker]: https://www.docker.com
