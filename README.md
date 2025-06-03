# GraphQL Books API

A modern GraphQL API built with NestJS for managing books and users. This API provides comprehensive functionality for book management with features like pagination, sorting, filtering, and user authentication.

## Features

- **GraphQL API**: Modern API built with NestJS and Apollo Server
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Authorization**: Role-based access control using CASL
- **Database**: MongoDB integration with Mongoose ODM
- **Pagination**: Advanced pagination with sorting, filtering, and searching
- **Logging**: Comprehensive logging system for debugging and monitoring
- **Testing**: Full test coverage with Jest

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── schema.gql                 # Generated GraphQL schema
├── auth/                      # Authentication module
│   ├── auth.guard.ts         # JWT authentication guard
│   ├── auth.module.ts        # Auth module configuration
│   ├── auth.resolver.ts      # Auth GraphQL resolvers
│   ├── auth.service.ts       # Auth business logic
│   ├── constants.ts          # Auth constants (JWT config)
│   ├── decorator.ts          # Custom decorators
│   └── dto/                  # Auth data transfer objects
├── books/                     # Books module
│   ├── books.module.ts       # Books module configuration
│   ├── books.resolver.ts     # Books GraphQL resolvers
│   ├── books.service.ts      # Books business logic
│   ├── dto/                  # Books DTOs (inputs/outputs)
│   │   ├── create-book.input.ts
│   │   ├── update-book.input.ts
│   │   ├── pagination.args.ts
│   │   └── paginated-books.output.ts
│   └── schemas/              # Mongoose schemas
│       └── book.schema.ts
├── users/                     # Users module
│   ├── users.module.ts       # Users module configuration
│   ├── users.resolver.ts     # Users GraphQL resolvers
│   ├── users.service.ts      # Users business logic
│   ├── dto/                  # Users DTOs
│   └── schemas/              # User Mongoose schema
├── casl/                      # Authorization module
│   ├── casl-ability.factory/ # CASL ability definitions
│   ├── action.ts             # Action types
│   └── casl.module.ts        # CASL module configuration
└── test/                      # Testing utilities
```

### Key Components

- **App Module**: Root module that ties everything together
- **Auth Module**: Handles user authentication and JWT operations
- **Books Module**: Core functionality for book management
  - Resolver: GraphQL query/mutation handlers
  - Service: Business logic and database operations
  - DTOs: Data transfer objects for input/output
  - Schema: MongoDB data model
- **Users Module**: User management functionality
- **CASL Module**: Role-based access control implementation

### Module Dependencies

```
App Module
├── Auth Module
│   └── Users Module
├── Books Module
│   └── CASL Module
└── Users Module
    └── CASL Module
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Yarn package manager

## Installation

```bash
# Install dependencies
$ yarn install

# Set up environment variables
$ cp .env.example .env
```

Update the `.env` file with your MongoDB connection string and JWT secret.

## Running the Application

```bash
# Development mode
$ yarn run start:dev

# Production mode
$ yarn run start:prod
```

The GraphQL playground will be available at `http://localhost:3000/graphql`

## API Documentation

### Authentication

The API uses JWT tokens for authentication. To get started:

1. Create a user account using the `createUser` mutation
2. Sign in using the `signIn` mutation to get an access token
3. Include the token in your requests using the Authorization header:
   ```
   Authorization: Bearer your-token-here
   ```

### Books API

#### Queries

- `books(pagination: PaginationArgs)`: Get a paginated list of books
  - Supports sorting, filtering, and searching
  - Returns metadata about the current page and total items

- `book(id: ID!)`: Get a single book by ID

#### Mutations

- `createBook(input: CreateBookInput!)`: Create a new book
- `updateBook(input: UpdateBookInput!)`: Update an existing book
- `removeBook(id: ID!)`: Delete a book

#### Pagination Features

The books query supports advanced pagination with:
- Page-based navigation
- Configurable items per page
- Sorting by any field (ASC/DESC)
- Case-insensitive search across title and author
- JSON-based filtering
- Comprehensive metadata about the current page

Example query:
```graphql
query {
  books(
    page: 1
    limit: 10
    sortBy: "title"
    sortOrder: ASC
    search: "fantasy"
    filter: "{\"author\":\"Tolkien\"}"
  ) {
    data {
      id
      title
      author
      createdAt
    }
    meta {
      currentPage
      totalPages
      itemsPerPage
      totalItems
    }
  }
}
```

### Users API

#### Queries

- `users`: Get all users (admin only)
- `user(id: ID!)`: Get a single user by ID

#### Mutations

- `createUser(input: CreateUserInput!)`: Register a new user
- `updateUser(input: UpdateUserInput!)`: Update user details
- `removeUser(id: ID!)`: Delete a user account

## Testing

```bash
# Unit tests
$ yarn run test

# E2E tests
$ yarn run test:e2e

# Test coverage
$ yarn run test:cov
```

## Logging

The application includes comprehensive logging with different log levels:
- `error`: For error conditions
- `warn`: For warning conditions
- `log`: For general information
- `debug`: For debugging information

Logs include:
- User authentication attempts
- CRUD operations on books and users
- Pagination and filtering details
- Authorization checks

## Error Handling

The API implements proper error handling with:
- Validation errors for invalid inputs
- Authentication/Authorization errors
- Not Found errors for missing resources
- Proper error messages and codes

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- MongoDB injection protection
- Rate limiting (optional)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
