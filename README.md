If the user doesn't have `bun` installed locally, they can follow these steps to install it and then proceed with the project setup. Here’s an updated README that includes instructions for installing `bun`.

---

# Diagnostic for Greg

This repository contains a diagnostic tool designed to assess coding and system design skills. The tool provides coding challenges and system design questions, evaluates user submissions, and generates diagnostic reports.

## Table of Contents

- [Installation](#installation)
  - [Installing Bun](#installing-bun)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
- [Database](#database)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Installing Bun

`bun` is a fast all-in-one JavaScript runtime. If you don't have `bun` installed, follow these steps:

1. **Install Bun**

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

   This command will download and install `bun` on your system.

### Backend

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/diagnostic_for_greg.git
   cd diagnostic_for_greg
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the Database**

   The project uses an SQLite database. The database schema is initialized when the server starts. No additional setup is required.

### Frontend

1. **Install Dependencies**

   ```bash
   bun install
   ```

## Running the Project

### Backend

1. **Start the Server**

   ```bash
   python app.py
   ```

   The server will run on `http://localhost:5000`.

### Frontend

1. **Start the Development Server**

   ```bash
   bun run start
   ```

   The frontend will be available at `http://localhost:3000`.

## API Endpoints

The backend provides several API endpoints for interacting with the diagnostic tool.

### Coding Challenges

- **Get a Coding Challenge**

  ```http
  GET /api/coding_challenge?topic=<topic>
  ```

- **Get Coding Challenges by Skill Level**

  ```http
  GET /api/coding_challenges?level=<level>
  ```

- **Submit a Coding Solution**

  ```http
  POST /api/submit_code
  {
    "problem_id": "be_1",
    "code": "your_code_here"
  }
  ```

### System Design Questions

- **Get System Design Scenarios**

  ```http
  GET /api/design_scenarios
  ```

- **Get a Specific System Design Question by ID**

  ```http
  GET /api/design_question/<question_id>
  ```

- **Submit System Design Answers**

  ```http
  POST /api/submit_design
  {
    "responses": [
      {
        "question_id": "sd_1",
        "selected_option": "option_a"
      }
    ]
  }
  ```

### Diagnostic Report

- **Generate a Diagnostic Report**

  ```http
  GET /api/diagnostic_report
  ```

## Frontend

The frontend is built using React and Chakra UI. It provides a user interface for interacting with the diagnostic tool.

### Available Scripts

- **Start the Development Server**

  ```bash
  bun run start
  ```

- **Build the Project for Production**

  ```bash
  bun run build
  ```

## Database

The project uses an SQLite database to store diagnostic results. The database schema includes tables for coding results and design results.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This updated README includes instructions for installing `bun` if it is not already available on the user's system.