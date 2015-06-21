# EcoLearnia Account (EL-A) Development

## Technology Stack

The EcoLearnia Interactive (EL-A) uses the following technologies:

- Platform: 
    - Language: Nodejs (JavaScript)
    - Database: MonogoDB (may change in the future to PostgreSQL + ElasticSearch)
- Frameworks
    - Web framework: [Hapi](http://hapijs.com/) - Similar to SpringFramework.
      Provides HTTP request routing. Facilitates REST API development.
    - ORM: [Mongoose](http://mongoosejs.com/) - Mongo access abstraction. 
- Libraries
    - [bell](https://github.com/hapijs/bell) - Hapi plugin for Oauth 
      integration with social networks (e.g. Google+).
    - * see more authentication for jwt integration at (http://hapijs.com/plugins)
    - [bluebird](https://github.com/petkaantonov/bluebird) - as Promise
    - [Bunyan](https://github.com/trentm/node-bunyan) - for logging
- Unit Test
    - [Mocha](http://mochajs.org/) - JavaScript Test runner
    - [Chai](http://chaijs.com/) - Assertion library
    - [sinon](http://sinonjs.org/) - Mocking framework

## Expected skills/knowledge for developing EL-A

The server is implemented in Nodejs, this implies that developing the server 
will require knowledge of JavaScript (aka ECMAScript).
We assume that you either have previous knowledge of JavaScript or is willing
to learn JS.

If you are not familiar with JS yet, the [Secrets of the JavaScript Ninja](http://www.manning.com/resig/)
is a good reference to start.

For those starting JS, it is useful to know that JS is a dynamic, interpreted,
Object Oriented (prototype-based), imperative, functional language.
For those coming from Java world, two things you may want to keep in mind when
learning JS:

- Object Oriented is prototype-based. The class definition is not exactly
  as how you would do in Java. Even the `class` constructuct in ECMAScript 6
  is syntactical sugar coating.
- Asynchronicity. Most of the IO operations in JS are asynchronous. For example
  when you make a DB request, a http request, a file open/read, they are all
  asynchronous. The execution flow is controlled through call-backs.
  In order to alleviate the the "callback hell" you can use the Promises.
- Single threaded. There is no thread construct in JS that allows programming
  in multithread. The multi-thread of asycn operations are abstracted by
  the language runtime. For more details read [this article](http://www.future-processing.pl/blog/on-problems-with-threads-in-node-js/).

According to [this](http://githut.info/), JS is the most active programming
language in GitHub. So have fun learning JS, it is definitely worth the effort.

Besides JS, knowledge of JWT standard as well as DB (currently MongoDB) is 
expected.


## Unit Tests
Of course, Unit test!
As you contribute with code, that implements new functionality, it is
highly desired (imperative) to have unit tests.
In EcoLearnia projects, we use Mocha as the test runner together with chai for
the assertion.
To make the unit tests "unit-ty" - i.e. keep the scope of the unit test to that
object under test - we use sinon for mocking other objects.


## Developing an EL-A component
At this moment, the EL-A component is not implemented yet.
The plan is to implement using Hapi framework and one or more Hapi's 
[Authentication plugins](http://hapijs.com/plugins#Authentication)

The EL-Account will have the following functionalities.

Initially:

- User registration: A user enters his/her profile information into the system.
  Data will be kept in database (initially MongoDB).
- User may alternatively sign-up using Google+: Clicks the Google+ button to 
  sign-up, which uses Oauth to connect to Google and reuqest authorization to
  retrieve the users information. The user information is then saved to local
  DB.
- Sign-in and Token Management:  Then user sign-in, the component will create
  a signed token based on JWT. The JWT can be shared across pages using cookie
  and localStorage mechanism.

Later:

- Nested accounts: Parents can have sub-accounts for their children.  Likewise
  Teachers and educators can have sub-accounts for their students.
- Role based authorization: An account can be given multiple roles, each roles
  defines the different permission rules.
- Integration with [Clever](https://clever.com/)



## References (Pointers to learning materials)

### Hapi Framwork
- The official Hapi website's [Getting Started](http://hapijs.com/tutorials/getting-started)
- From RisginStack [Getting Started with Hapi 8](http://blog.risingstack.com/getting-started-with-hapi-8/)
- [The Pursuit of Hapi-ness](https://medium.com/@_expr/the-pursuit-of-hapi-ness-d82777afaa4b)

