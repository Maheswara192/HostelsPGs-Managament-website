# 🐳 Docker Setup Guide

You can run the entire application (Frontend + Backend) without manually installing `npm` modules using Docker.

## Prerequisites
-   [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)

## How to Run

1.  **Open Terminal** in the project root folder.
2.  **Start the App**:
    ```bash
    docker-compose up --build
    ```
    *(The `--build` flag ensures it rebuilds if you change code).*

3.  **Access the App**:
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend**: [http://localhost:5000](http://localhost:5000)

## How to Share
To send this to another person:
1.  Zip the entire folder (excluding `node_modules` folders if they exist locally).
2.  Send them the Zip file.
3.  Tell them to install Docker and run `docker-compose up`.

**Note:** Ensure the `.env` file is included in your Zip (or send it securely separately), as it contains your database secrets!
