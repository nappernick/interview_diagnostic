# diagnostic_for_greg Code Files

## /diagnostic_for_greg/README.md

```markdown
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

This updated README includes instructions for installing `bun` if it is not already available on the user's system.```


## /diagnostic_for_greg/app.py

```python
import json
import subprocess
import os
import tempfile
import time
from flask import Flask, request, jsonify, abort
from sqlite3 import connect, Error

app = Flask(__name__)

# ---------------------------------------------
# Configuration
# ---------------------------------------------
DATA_FILE = 'diagnostic_data.json'
DATABASE = 'diagnostics.db'

# ---------------------------------------------
# CORS
# ---------------------------------------------
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ---------------------------------------------
# Initialize SQLite database if not exists
# ---------------------------------------------
def init_db():
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        # Existing tables
        c.execute('''CREATE TABLE IF NOT EXISTS coding_results (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        problem_id TEXT,
                        passed INTEGER,
                        total INTEGER,
                        execution_time REAL
                     )''')
        c.execute('''CREATE TABLE IF NOT EXISTS design_results (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        question_id TEXT,
                        score INTEGER
                     )''')

        # NEW: system design wizard tables
        # 1) scenario table
        c.execute('''CREATE TABLE IF NOT EXISTS wizard_scenario (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        scenario_title TEXT,
                        description TEXT
                     )''')

        # 2) scenario steps
        c.execute('''CREATE TABLE IF NOT EXISTS wizard_step (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        scenario_id INTEGER,
                        step_number INTEGER,
                        step_title TEXT,
                        prompt_text TEXT
                     )''')

        # 3) user responses
        c.execute('''CREATE TABLE IF NOT EXISTS wizard_response (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        scenario_id INTEGER,
                        step_id INTEGER,
                        user_response TEXT
                     )''')

        conn.commit()
    except Error as e:
        print(e)
    finally:
        conn.close()

init_db()

# ---------------------------------------------
# Utility: Load diagnostic_data.json
# ---------------------------------------------
def load_diagnostic_data():
    if not os.path.exists(DATA_FILE):
        return {}
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
        return data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading diagnostic data: {e}")
        return {}

def load_problem_bank():
    data = load_diagnostic_data()
    return data.get('coding_problems', [])

def load_design_questions():
    data = load_diagnostic_data()
    return data.get('system_design_questions', [])

# ---------------------------------------------
# Existing Routes (Coding, System Design MCQ, etc.)
# ---------------------------------------------

@app.route('/api/coding_challenge', methods=['GET'])
def get_coding_challenge():
    topic = request.args.get('topic')
    problems = load_problem_bank()
    if topic:
        filtered = [p for p in problems if any(topic.lower() in t.lower() for t in p.get('topics', []))]
    else:
        filtered = problems
    if not filtered:
        abort(404, description="No problem found for the given topic.")
    return jsonify(filtered[0])

@app.route('/api/coding_challenges', methods=['GET'])
def get_coding_challenges_by_level():
    level = request.args.get('level')
    data = load_diagnostic_data()
    if level not in data.get('skill_assessment', {}).get('levels', {}):
        abort(404, description="Invalid skill level.")
    problem_ids = data['skill_assessment']['levels'][level]
    all_problems = data.get('coding_problems', [])
    filtered_problems = [p for p in all_problems if p['id'] in problem_ids]
    return jsonify(filtered_problems)

def execute_user_code(user_code, test_cases, timeout=5):
    results = []
    for test in test_cases:
        input_data = test.get('input', '')
        expected = test.get('expected')
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_file.write(user_code)
            temp_file.write("\n")
            temp_file.write("import json\n")
            temp_file.write("if __name__ == '__main__':\n")
            temp_file.write("    data = json.loads('''{}''')\n".format(json.dumps(input_data)))
            temp_file.write("    output = solution(data)\n")
            temp_file.write("    print(json.dumps(output))\n")
            temp_filename = temp_file.name
        try:
            start_time = time.time()
            proc = subprocess.run(['python', temp_filename], capture_output=True, text=True, timeout=timeout)
            exec_time = time.time() - start_time
            stdout = proc.stdout.strip()
            stderr = proc.stderr.strip()
            try:
                output = json.loads(stdout)
            except Exception:
                output = stdout
            passed = (output == expected) and (proc.returncode == 0)
            results.append({
                'input': input_data,
                'expected': expected,
                'output': output,
                'passed': passed,
                'execution_time': exec_time,
                'error': stderr
            })
        except subprocess.TimeoutExpired:
            results.append({
                'input': input_data,
                'expected': expected,
                'output': None,
                'passed': False,
                'execution_time': timeout,
                'error': 'Timeout'
            })
        finally:
            os.remove(temp_filename)
    return results

@app.route('/api/submit_code', methods=['POST'])
def submit_code():
    data = request.get_json()
    if not data:
        abort(400, description="Invalid JSON")
    problem_id = data.get('problem_id')
    user_code = data.get('code')
    if not problem_id or not user_code:
        abort(400, description="Missing problem_id or code")
    problems = load_problem_bank()
    problem = next((p for p in problems if p.get('id') == problem_id), None)
    if not problem:
        abort(404, description="Problem not found")
    test_cases = problem.get('test_cases', [])
    results = execute_user_code(user_code, test_cases)
    passed_cases = sum(1 for r in results if r['passed'])
    total_cases = len(test_cases)
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute('INSERT INTO coding_results (problem_id, passed, total, execution_time) VALUES (?, ?, ?, ?)',
                  (problem_id, passed_cases, total_cases, sum(r['execution_time'] for r in results)))
        conn.commit()
    except Error as e:
        print(e)
    finally:
        conn.close()
    return jsonify({
        'problem_id': problem_id,
        'results': results,
        'passed_cases': passed_cases,
        'total_cases': total_cases
    })

@app.route('/api/design_questions', methods=['GET'])
def get_design_questions():
    questions = load_design_questions()
    if not questions:
        abort(404, description="No system design questions found")
    return jsonify(questions)

@app.route('/api/submit_design', methods=['POST'])
def submit_design():
    data = request.get_json()
    if not data:
        abort(400, description="Invalid JSON")
    responses = data.get('responses')
    if not responses:
        abort(400, description="No responses provided")
    total_score = 0
    max_score = 0
    for response in responses:
        question_id = response.get('question_id')
        selected = response.get('selected_option')
        questions = load_design_questions()
        question = next((q for q in questions if q.get('id') == question_id), None)
        if question:
            score = 1 if selected == question.get('correct_option') else 0
            total_score += score
            max_score += 1
            try:
                conn = connect(DATABASE)
                c = conn.cursor()
                c.execute('INSERT INTO design_results (question_id, score) VALUES (?, ?)',
                          (question_id, score))
                conn.commit()
            except Error as e:
                print(e)
            finally:
                conn.close()
    return jsonify({
        'total_score': total_score,
        'max_score': max_score
    })

@app.route('/api/diagnostic_report', methods=['GET'])
def diagnostic_report():
    coding_total = 0
    coding_possible = 0
    design_total = 0
    design_possible = 0
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute('SELECT SUM(passed), SUM(total) FROM coding_results')
        coding_result = c.fetchone()
        if coding_result and coding_result[0] is not None:
            coding_total, coding_possible = coding_result
        c.execute('SELECT SUM(score), COUNT(*) FROM design_results')
        design_result = c.fetchone()
        if design_result and design_result[0] is not None:
            design_total, design_possible = design_result
    except Error as e:
        print(e)
    finally:
        conn.close()
    report = {
        'coding': {
            'passed': coding_total,
            'total': coding_possible,
            'percentage': (coding_total / coding_possible * 100) if coding_possible else 0
        },
        'design': {
            'score': design_total,
            'total': design_possible,
            'percentage': (design_total / design_possible * 100) if design_possible else 0
        },
        'overall_recommendation': generate_recommendation(coding_total, coding_possible, design_total, design_possible)
    }
    return jsonify(report)

def generate_recommendation(coding_passed, coding_total, design_score, design_total):
    recommendations = []
    if coding_total == 0:
        recommendations.append("No coding challenges attempted.")
    else:
        coding_pct = coding_passed / coding_total * 100 if coding_total else 0
        if coding_pct < 60:
            recommendations.append("Improve data structures and algorithms with more practice.")
        elif coding_pct < 80:
            recommendations.append("Solid coding skills; consider fine-tuning optimizations.")
        else:
            recommendations.append("Excellent coding performance; focus on advanced or system-level topics.")
    if design_total == 0:
        recommendations.append("No system design questions attempted.")
    else:
        design_pct = design_score / design_total * 100 if design_total else 0
        if design_pct < 60:
            recommendations.append("Study system design fundamentals: caching, load balancing, trade-offs.")
        elif design_pct < 80:
            recommendations.append("Good system design foundation; practice more real-world scenarios.")
        else:
            recommendations.append("Strong system design knowledge; keep refining with complex architectures.")
    return " ".join(recommendations)

# ---------------------------------------------
# New: System Design Wizard
# ---------------------------------------------
# A set of routes that store a multi-step scenario in DB, walk user step by step.

@app.route('/api/wizard/scenarios', methods=['GET'])
def list_wizard_scenarios():
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute("SELECT id, scenario_title, description FROM wizard_scenario")
        rows = c.fetchall()
        scenarios = []
        for r in rows:
            scenarios.append({
                "id": r[0],
                "title": r[1],
                "description": r[2]
            })
    finally:
        conn.close()
    return jsonify(scenarios)

@app.route('/api/wizard/scenario/<int:scenario_id>/steps', methods=['GET'])
def get_wizard_steps(scenario_id):
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute("SELECT id, step_number, step_title, prompt_text FROM wizard_step WHERE scenario_id=? ORDER BY step_number ASC",
                  (scenario_id,))
        rows = c.fetchall()
        steps = []
        for r in rows:
            steps.append({
                "id": r[0],
                "step_number": r[1],
                "title": r[2],
                "prompt_text": r[3]
            })
    finally:
        conn.close()
    return jsonify(steps)

@app.route('/api/wizard/submit_response', methods=['POST'])
def submit_wizard_response():
    data = request.get_json()
    scenario_id = data.get('scenario_id')
    step_id = data.get('step_id')
    user_answer = data.get('user_response', "")

    if not scenario_id or not step_id:
        abort(400, "Missing scenario_id or step_id")
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute("INSERT INTO wizard_response (scenario_id, step_id, user_response) VALUES (?, ?, ?)",
                  (scenario_id, step_id, user_answer))
        conn.commit()
    except Error as e:
        print(e)
        abort(500, "Error storing response")
    finally:
        conn.close()

    return jsonify({"message": "Response saved"})

@app.route('/api/wizard/<int:scenario_id>/summary', methods=['GET'])
def wizard_summary(scenario_id):
    # Return all steps and the user’s responses
    try:
        conn = connect(DATABASE)
        c = conn.cursor()
        c.execute("SELECT id, step_number, step_title FROM wizard_step WHERE scenario_id=? ORDER BY step_number ASC", (scenario_id,))
        step_rows = c.fetchall()
        steps_info = []
        for srow in step_rows:
            sid, step_num, title = srow
            # fetch responses for that step
            c.execute("SELECT user_response FROM wizard_response WHERE scenario_id=? AND step_id=?", (scenario_id, sid))
            user_resp_rows = c.fetchall()
            # could handle multiple responses if desired
            response_list = [r[0] for r in user_resp_rows]
            steps_info.append({
                "step_id": sid,
                "step_number": step_num,
                "title": title,
                "responses": response_list
            })
    finally:
        conn.close()

    return jsonify(steps_info)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)```


## /diagnostic_for_greg/diagnostic_data.json

```json
{
  "coding_problems": [
    {
      "id": "be_1",
      "title": "Review Text Processing Pipeline",
      "difficulty": "intermediate",
      "category": "data_processing",
      "topics": ["string_manipulation", "data_structures"],
      "company_context": "Similar to Yelp's review processing system",
      "problem_statement": "Design a class that processes review text with these requirements:\n      - Split reviews into sentences (split on '.', '!', '?')\n      - Remove duplicate sentences within the same review\n      - Maintain the original order of unique sentences\n- Handle edge cases (empty reviews, multiple punctuation marks)",
      "input_format": "review_text (string)",
      "output_format": "List of unique sentences in order",
      "test_cases": [
        {
          "input": "Great food! The service was amazing. The food was great. Amazing service!",
          "expected": ["Great food!", "The service was amazing", "The food was great", "Amazing service!"],
          "description": "Basic case with duplicates"
        }
      ],
      "follow_up": [
        "How would you handle very large reviews?",
        "How would you detect similar but not identical sentences?",
        "How would you parallelize this for multiple reviews?"
      ]
    },
    {
      "id": "be_2",
      "title": "Request Rate Limiter",
      "difficulty": "intermediate",
      "category": "backend_systems",
      "topics": ["hash_maps", "queues"],
      "problem_statement": "Implement a rate limiter that restricts API requests:\n- Each user is limited to N requests per M seconds\n- Must handle concurrent requests\n- Should be memory efficient for many users",
      "follow_up": [
        "How would you handle distributed rate limiting?",
        "How would you expire old data?",
        "How would you handle different limits for different endpoints?"
      ]
    },
    {
      "id": "graph_1",
      "title": "Business Category Relationships",
      "difficulty": "intermediate",
      "category": "graph_traversal",
      "topics": ["DFS", "adjacency_list"],
      "problem_statement": "Given a dictionary of business categories where each category points to its parent categories, write a function to detect cycles and return all ancestor categories for a given category.",
      "example_input": {"Italian": ["Restaurant"], "Pizza": ["Italian", "Fast Food"], "Fast Food": ["Restaurant"], "Restaurant": []},
      "follow_up": ["How would you handle invalid category names?", "How would you optimize for repeated queries?", "How would you handle a very deep hierarchy?"]
    },
    {
      "id": "graph_2",
      "title": "Review Connection Components",
      "difficulty": "intermediate",
      "category": "graph_analysis",
      "topics": ["BFS", "connected_components"],
      "problem_statement": "Group reviews into connected components based on similarity scores above a threshold. Return the size of each component.",
      "example_input": {"reviews": ["Great pizza", "Best pizza", "Bad service"], "threshold": 0.7, "similarities": {"0,1": 0.8, "1,2": 0.3, "0,2": 0.2}},
      "test_cases": [{"input": {"reviews": ["A", "B", "C"], "scores": {"A,B": 0.8}, "threshold": 0.7}, "expected": [2, 1]}]
    },
    {
      "id": "graph_3",
      "title": "Business Recommendation Path",
      "difficulty": "advanced",
      "category": "graph_shortest_path",
      "topics": ["Dijkstra", "priority_queue"],
      "problem_statement": "Find the strongest recommendation path between two businesses where edge weights represent customer correlation. Return path with highest minimum correlation.",
      "example_input": {"edges": [["BusinessA", "BusinessB", 0.9], ["BusinessB", "BusinessC", 0.7]], "start": "BusinessA", "end": "BusinessC"}
    },
    {
      "id": "ds_1",
      "title": "Review Cache System",
      "difficulty": "intermediate",
      "category": "data_structures",
      "topics": ["LRU_cache", "hash_map"],
      "problem_statement": "Implement a fixed-size LRU cache for business reviews that supports efficient updates and evicts least recently accessed reviews when full.",
      "operations": ["put(review_id, review)", "get(review_id)", "update(review_id, new_review)", "evict_lru()"]
    },
    {
      "id": "ds_2",
      "title": "Review Text Trie",
      "difficulty": "intermediate",
      "category": "data_structures",
      "topics": ["trie", "string_search"],
      "problem_statement": "Implement a trie-based system to store and search common review phrases, track frequencies, and return top N most frequent phrases with a given prefix.",
      "operations": ["insert(phrase)", "search(prefix)", "get_top_n(prefix, n)"]
    },
    {
      "id": "graph_4",
      "title": "Business Dependency Resolution",
      "difficulty": "advanced",
      "category": "graph_topological_sort",
      "topics": ["topological_sort", "cycle_detection"],
      "problem_statement": "Given business updates and their dependencies, determine if all updates can be applied and in what order. Return null if cycles exist.",
      "example_input": {"update_hours": ["verify_owner"], "update_menu": ["verify_owner"], "verify_owner": []}
    },
    {
      "id": "ds_3",
      "title": "Review Score Aggregator",
      "difficulty": "intermediate",
      "category": "data_structures",
      "topics": ["heap", "sliding_window"],
      "problem_statement": "Design a data structure that maintains rolling averages of reviews, returns top K businesses by recent score, and handles updates/deletions.",
      "operations": ["add_review(business_id, score, timestamp)", "get_top_k(k)", "update_review(review_id, new_score)", "get_average(business_id, time_window)"]
    }
  ],
  "skill_assessment": {
    "levels": {
      "entry": ["graph_1", "ds_1"],
      "intermediate": ["graph_2", "ds_2", "graph_4"],
      "advanced": ["graph_3", "ds_3"]
    },
    "core_competencies": {
      "graph_traversal": ["DFS", "BFS", "cycle_detection"],
      "data_structures": ["hash_map", "heap", "trie"],
      "problem_solving": ["edge_cases", "optimization", "scalability"]
    }
  },
  "system_design_questions": [
    {
      "id": "sd_1",
      "title": "Design a Review Analytics Service",
      "difficulty": "intermediate",
      "context": "Backend service to process and analyze business reviews",
      "requirements": {
        "functional": [
          "Process incoming reviews in real-time",
          "Calculate running averages for business ratings",
          "Support filtering reviews by date range",
          "Generate daily/weekly summary reports"
        ],
        "non_functional": [
          "Handle 1000 new reviews per second",
          "Retrieve analytics within 100ms",
          "Data must be consistent within 1 minute",
          "Support horizontal scaling"
        ]
      },
      "evaluation_points": [
        "Data model design",
        "Processing pipeline architecture",
        "Caching strategy",
        "Scaling approach"
      ]
    },
    {
      "id": "sd_2",
      "title": "Design Yelp's Photo Storage Service",
      "difficulty": "intermediate",
      "context": "Backend service to handle restaurant/business photo uploads and serving",
      "requirements": {
        "functional": [
          "Support photo upload from mobile and web clients",
          "Generate multiple resolutions of each photo",
          "Support bulk uploads from businesses",
          "Allow photo deletion and moderation"
        ],
        "non_functional": [
          "Handle 500 uploads per second",
          "Serve photos with < 200ms latency",
          "99.99% availability for photo serving",
          "Support photos up to 20MB each"
        ]
      },
      "evaluation_points": [
        "Storage system choice",
        "CDN strategy",
        "Processing pipeline",
        "Cost optimization"
      ]
    },
    {
      "id": "sd_3",
      "title": "Design Business Search Service",
      "difficulty": "advanced",
      "context": "Core search functionality for finding businesses based on various criteria",
      "requirements": {
        "functional": [
          "Search by location and radius",
          "Filter by business attributes (price, rating, etc)",
          "Support full-text search of reviews",
          "Return results ordered by relevance"
        ],
        "non_functional": [
          "Handle 10k searches per second",
          "Return results in < 300ms",
          "Support 100M+ business records",
          "Handle complex multi-criteria queries"
        ]
      },
      "evaluation_points": [
        "Search index design",
        "Ranking algorithm",
        "Caching strategy",
        "Query optimization"
      ]
    },
    {
      "id": "sd_4",
      "title": "Design Rate Limiting Service",
      "difficulty": "intermediate",
      "context": "System to prevent API abuse and ensure fair usage",
      "requirements": {
        "functional": [
          "Limit requests per API key",
          "Support different limits for different endpoints",
          "Allow burst patterns",
          "Track usage metrics"
        ],
        "non_functional": [
          "Add < 10ms latency to requests",
          "Handle 50k concurrent clients",
          "Scale across multiple datacenters",
          "99.999% availability"
        ]
      },
      "evaluation_points": [
        "Algorithm choice (token bucket vs leaky bucket)",
        "Distributed coordination",
        "Storage strategy",
        "Failure handling"
      ]
    },
    {
      "id": "sd_5",
      "title": "Design Review Moderation System",
      "difficulty": "advanced",
      "context": "System to automatically and manually moderate user reviews",
      "requirements": {
        "functional": [
          "Detect spam and fake reviews",
          "Support manual moderation queue",
          "Handle appeals process",
          "Apply content filtering rules"
        ],
        "non_functional": [
          "Process reviews within 30 seconds",
          "False positive rate < 1%",
          "Support 100k moderator actions per day",
          "Audit trail for all decisions"
        ]
      },
      "evaluation_points": [
        "ML pipeline design",
        "Queuing system",
        "State machine design",
        "Consistency management"
      ]
    },
    {
      "id": "sd_6",
      "title": "Design Business Hours Service",
      "difficulty": "intermediate",
      "context": "System to manage and serve business operating hours",
      "requirements": {
        "functional": [
          "Support regular and holiday hours",
          "Handle timezone conversions",
          "Support temporary closures",
          "Bulk updates for chains"
        ],
        "non_functional": [
          "Serve 5k requests per second",
          "< 50ms response time",
          "Support 10M+ businesses",
          "Handle daylight savings changes"
        ]
      },
      "evaluation_points": [
        "Data modeling",
        "Caching strategy",
        "Consistency management",
        "API design"
      ]
    }
  ],
    "system_design_assessment": {
      "core_competencies": {
        "requirements_analysis": {
          "skills": [
            "Functional requirement extraction",
            "Non-functional requirement identification",
            "Scale estimation",
            "Constraint identification"
          ],
          "evaluation_criteria": {
            "1": "Only identifies basic features",
            "3": "Extracts both functional and non-functional requirements",
            "5": "Comprehensive analysis including scale, constraints, and edge cases"
          }
        },
        "data_modeling": {
          "skills": [
            "Schema design",
            "Storage choice (SQL vs NoSQL)",
            "Data access patterns",
            "Indexing strategy"
          ],
          "evaluation_criteria": {
            "1": "Basic table design only",
            "3": "Appropriate storage choices with indexing",
            "5": "Optimized schema with clear understanding of access patterns and trade-offs"
          }
        },
        "system_architecture": {
          "skills": [
            "Service decomposition",
            "API design",
            "Communication patterns",
            "Load balancing"
          ],
          "evaluation_criteria": {
            "1": "Monolithic design",
            "3": "Basic service separation with clear interfaces",
            "5": "Well-thought-out microservices with appropriate communication patterns"
          }
        },
        "scalability": {
          "skills": [
            "Horizontal vs Vertical scaling",
            "Caching strategies",
            "Database sharding",
            "Load distribution"
          ],
          "evaluation_criteria": {
            "1": "Basic scaling mentions",
            "3": "Concrete scaling strategies",
            "5": "Comprehensive scaling approach with trade-offs"
          }
        },
        "reliability": {
          "skills": [
            "Fault tolerance",
            "Data consistency",
            "Backup strategies",
            "Monitoring"
          ],
          "evaluation_criteria": {
            "1": "Basic error handling",
            "3": "Redundancy and backup plans",
            "5": "Comprehensive reliability strategy with monitoring"
          }
        }
      },
      "assessment_scenarios": [
        {
          "id": "sd_1",
          "title": "Design a Review Processing Pipeline",
          "scenario": "Design a system that ingests, processes, and serves business reviews at Yelp scale",
          "key_requirements": [
            "Handle 1000 reviews/second",
            "Support text and image content",
            "Provide real-time analytics",
            "Maintain review history"
          ],
          "evaluation_focus": [
            "data_modeling",
            "scalability",
            "reliability"
          ],
          "follow_up_questions": [
            "How would you handle spam detection?",
            "How would you implement content moderation?",
            "How would you handle sudden traffic spikes?"
          ]
        }
      ],
      "interview_structure": {
        "duration_minutes": 45,
        "phases": [
          {
            "name": "Requirements Gathering",
            "duration_minutes": 5,
            "key_objectives": [
              "Clarify scope",
              "Establish scale",
              "Identify constraints"
            ]
          },
          {
            "name": "High-Level Design",
            "duration_minutes": 15,
            "key_objectives": [
              "System components",
              "Data flow",
              "API design"
            ]
          },
          {
            "name": "Deep Dive",
            "duration_minutes": 15,
            "key_objectives": [
              "Critical component details",
              "Scaling approach",
              "Edge cases"
            ]
          },
          {
            "name": "Follow-up Discussion",
            "duration_minutes": 10,
            "key_objectives": [
              "Trade-off analysis",
              "Alternative approaches",
              "Future improvements"
            ]
          }
        ]
      }
    }
}```


## /diagnostic_for_greg/index.ts

```typescript
console.log("Hello via Bun!");```


## /diagnostic_for_greg/package.json

```json
{
  "name": "diagnostic-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@chakra-ui/react": "2",
    "@chakra-ui/react-types": "^2.0.6",
    "@chakra-ui/theme": "^3.4.6",
    "@chakra-ui/theme-tools": "^2.2.6",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "ace-builds": "^1.4.14",
    "axios": "^1.4.0",
    "framer-motion": "^12.4.7",
    "react": "^18.2.0",
    "react-ace": "^10.1.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "bun run react-scripts start",
    "build": "bun run react-scripts build"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.5"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```


## /diagnostic_for_greg/public/index.html

### HTML Converted to Markdown:
```markdown
::: {#root}
:::
```

<details><summary>Original HTML</summary>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interview Diagnostic Test</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```
</details>

## /diagnostic_for_greg/requirements.txt

```plaintext
```


## /diagnostic_for_greg/src/api.ts

```typescript
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  topics: string[];
  company_context?: string;
  problem_statement: string;
  input_format: string;
  output_format: string;
  test_cases?: Array<{
    input: string;
    expected: any;
    description: string;
  }>;
  follow_up?: string[];
}

export interface DesignQuestion {
  id: string;
  title: string;
  difficulty: string;
  context: string;
  requirements: {
    functional: string[];
    non_functional: string[];
  };
  evaluation_points: string[];
  correct_option?: string;
  options: string[];
}

export interface DiagnosticReport {
  coding: {
    passed: number;
    total: number;
    percentage: number;
  };
  design: {
    score: number;
    total: number;
    percentage: number;
  };
  overall_recommendation: string;
}

export const fetchCodingChallenge = async (topic?: string): Promise<CodingProblem> => {
  const params = topic ? { topic } : {};
  const response = await axios.get(`${API_BASE}/coding_challenge`, { params }); // <-- Using axios.get
  return response.data;
};

export const fetchCodingChallengesByLevel = async (level: string): Promise<CodingProblem[]> => {
  const response = await axios.get(`${API_BASE}/coding_challenges?level=${level}`); // <-- Correct URL
  return response.data;
};

export const submitCodingSolution = async (
  problem_id: string,
  code: string
): Promise<any> => {
  const response = await axios.post(`${API_BASE}/submit_code`, { problem_id, code });
  return response.data;
};

export const fetchDesignQuestions = async (): Promise<DesignQuestion[]> => {
  const response = await axios.get(`${API_BASE}/design_questions`);
  return response.data;
};

export const submitDesignAnswers = async (responses: any): Promise<any> => {
  const response = await axios.post(`${API_BASE}/submit_design`, { responses });
  return response.data;
};

export const fetchDiagnosticReport = async (): Promise<DiagnosticReport> => {
  const response = await axios.get(`${API_BASE}/diagnostic_report`);
  return response.data;
};
```


## /diagnostic_for_greg/src/theme/index.ts

```typescript
// src/theme/index.ts
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  colors: {
    yelp: {
      red: '#FF1A1A',
      darkRed: '#AF0606',
      gray: '#666666',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'red',
      },
      variants: {
        solid: {
          bg: 'yelp.red',
          _hover: { bg: 'yelp.darkRed' }
        }
      }
    }
  }
})```


## /diagnostic_for_greg/src/theme/theme.ts

```typescript
// theme.ts
import { extendTheme, HStack } from "@chakra-ui/react"

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#ffb8b8',
      200: '#ff8a8a',
      300: '#ff5c5c',
      400: '#ff2e2e',
      500: '#ff0000', // Yelp-inspired red
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    }
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
          borderRadius: 'xl',
        }
      }
    },
    Card: {
      baseStyle: {
        p: 6,
        borderRadius: 'xl',
        boxShadow: 'lg',
        bg: 'white',
      }
    }
  }
})
```


## /diagnostic_for_greg/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

