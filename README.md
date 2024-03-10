# Axion School Management API

The Axion School Management API is a backend service designed to manage various aspects of a school system. It leverages a Node.js service and utilizes MongoDB for data storage.

## Getting Started

### Prerequisites

Before you begin, ensure you have Docker and Docker Compose installed on your machine. These tools are essential for spinning up the service components.

### Starting the Service

The service architecture comprises three main components:

-   **Node.js Service**: The core API logic.
-   **MongoDB**: For persistent data storage.
-   **Redis**: Used for caching.

To spin up these components, execute the following command in your terminal:

`docker-compose up`

This command initiates the Node.js service along with MongoDB and Redis, setting up a local development environment for the API.


## Adding New APIs

If you're new to the service and wish to extend it by adding new APIs and entities, follow these guidelines:

### Entity Models and Schemas

1.  **Entities**: Place your new entities within the `managers/entities` directory. Ensure the entity files are named appropriately, following the pattern `<entityName>.mongoModel.js` and `<entityName>.schema.js`.

    Examples:

    -   `managers/entities/classroom/classroom.mongoModel.js`: Defines the MongoDB model for a classroom entity.
    -   `managers/entities/classroom/classroom.schema.js`: Contains schema validation for the classroom entity.

### Business Logic

2.  **Entity Managers**: Business logic for your entities should reside in manager files within the same directory as your entities. These files should be named following the pattern `<EntityName>.manager.js`.

    Example:

    -   `managers/entities/user/Classroom.manager.js`: Contains business logic for classroom management.

### API Endpoints

3.  **Server Entry Point**: The server entry point file, `managers/http/UserServer.manager.js`, is where you define your API endpoints and instantiate your entity classes.

### Common Schemas

4.  **Schema Validations**: Common schema validations for entities are located in `managers/_common/schema.models.js`. This file centralizes schema definitions for ease of maintenance.

