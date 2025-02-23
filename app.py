import json
import subprocess
import os
import tempfile
import time
from flask import Flask, request, redirect, url_for, render_template_string, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlite3 import connect, Error
from flasgger import Swagger # type: ignore
from uuid import uuid4


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///diagnostics.db"
db = SQLAlchemy(app)
Model = db.Model

########################################################
# 0. Minimal Templates (Inline for Demo)
########################################################
# Configuration
DATA_FILE = 'diagnostic_data.json'
DATABASE = 'diagnostics.db'

TEMPLATES = {
    "index": """
<!DOCTYPE html>
<html>
<head>
  <title>System Design Wizard</title>
</head>
<body>
  <h1>Welcome to the System Design Wizard</h1>
  <p>Pick a scenario to begin:</p>
  <ul>
    {% for sc in scenarios %}
      <li>
        <a href="{{ url_for('show_step', scenario_id=sc.id, # type: ignore step_num=1) }}">
          {{ sc.title }}
        </a> - {{ sc.description }}
      </li>
    {% endfor %}
  </ul>
</body>
</html>
""",
    "step": """
<!DOCTYPE html>
<html>
<head>
  <title>{{ scenario.title }} - Step {{ step_num }}</title>
</head>
<body>
  <h2>{{ scenario.title }}</h2>
  <h3>Step {{ step_num }}: {{ step.title }}</h3>
  <p>{{ step.prompt_text }}</p>
  <form method="POST">
    <textarea name="user_response" rows="10" cols="80">{{ prefill }}</textarea><br><br>
    <button type="submit">Next</button>
  </form>
  <p><a href="{{ url_for('index') }}">Back to scenarios</a></p>
</body>
</html>
""",
    "summary": """
<!DOCTYPE html>
<html>
<head>
  <title>{{ scenario.title }} - Summary</title>
</head>
<body>
  <h1>{{ scenario.title }} - Summary</h1>
  {% for step, response in user_responses %}
    <hr>
    <h3>Step {{ step.step_number }}: {{ step.title }}</h3>
    <p><strong>Prompt:</strong> {{ step.prompt_text }}</p>
    {% if response %}
      <p><strong>Your Response:</strong></p>
      <pre>{{ response.user_response_text }}</pre>
    {% else %}
      <p>No response recorded.</p>
    {% endif %}
  {% endfor %}
  <hr>
  <p><a href="{{ url_for('index') }}">Back to scenarios</a></p>
</body>
</html>
"""
}

########################################################
# 1. Models (SQLAlchemy)
########################################################

class Scenario(Model): # type: ignore
    __tablename__ = "scenarios"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    steps = db.relationship("Step", backref="scenario", lazy=True)

class Step(db.Model): # type: ignore
    __tablename__ = "steps"
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.Integer, db.ForeignKey("scenarios.id"), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    prompt_text = db.Column(db.Text)
    responses = db.relationship("Response", backref="step", lazy=True)

class Response(db.Model): # type: ignore
    __tablename__ = "responses"
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.Integer, nullable=False)
    step_id = db.Column(db.Integer, db.ForeignKey("steps.id"), nullable=False)
    user_response_text = db.Column(db.Text)

# New models for coding and design results
class CodingResult(db.Model): # type: ignore
    __tablename__ = "coding_results"
    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.String(200), nullable=False)
    passed = db.Column(db.Integer, default=0)
    total = db.Column(db.Integer, default=0)
    execution_time = db.Column(db.Float, default=0.0)

class DesignResult(db.Model): # type: ignore
    __tablename__ = "design_results"
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.String(200), nullable=False)
    score = db.Column(db.Integer, default=0)

########################################################
# 2. CORS and Database Initialization
########################################################

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

first_request_done = False

@app.before_request
def setup_db_once():
    global first_request_done
    if first_request_done:
        return
    with app.app_context():
        # Create all tables (delete diagnostics.db if necessary)
        db.create_all()
        if not Scenario.query.first():
            # Scenario 1: Yelp-like Service
            scenario1 = Scenario(
                title="Design a Yelp-like Service",
                description=("Walk through major design aspects of building a Yelp-like platform. "
                             "Consider requirements, architecture, data modeling, scalability, "
                             "availability, security, and overall trade-offs.")
            )
            db.session.add(scenario1)
            db.session.commit()

            steps_data1 = [
                (1, "Requirements Gathering", "List key functional and non-functional requirements for a Yelp-like service. Consider user reviews, business search, and location-based filtering."),
                (2, "High-Level Architecture", "Outline your core architecture. Will you use a monolithic approach or microservices? What are the main components?"),
                (3, "Data Modeling & Storage", "What database(s) will you use? How will you model business, user, and review data? Discuss schema design and indexing strategies."),
                (4, "Scalability & Performance", "How will you handle high traffic? Consider caching, replication, and load balancing to support 10x traffic growth."),
                (5, "Availability & Fault Tolerance", "Discuss strategies for failover, redundancy, and disaster recovery in case of data center failures."),
                (6, "Security & Access Control", "How will you secure user data, enforce authentication, and protect against abuse or spam?"),
                (7, "Summary", "Summarize your design, highlight trade-offs, and note potential improvements.")
            ]
            for step_num, title, prompt in steps_data1:
                step_obj = Step(
                    scenario_id=scenario1.id, # type: ignore
                    step_number=step_num,
                    title=title,
                    prompt_text=prompt
                )
                db.session.add(step_obj)
            db.session.commit()

            # Scenario 2: E-commerce Platform
            scenario2 = Scenario(
                title="Design an E-commerce Platform",
                description=("Design a robust e-commerce platform that handles product listings, user accounts, "
                             "shopping carts, payments, and order fulfillment. Consider scalability, security, and performance.")
            )
            db.session.add(scenario2)
            db.session.commit()

            steps_data2 = [
                (1, "Requirements", "List the core functional and non-functional requirements for an e-commerce platform."),
                (2, "User & Product Data Modeling", "Describe how you would model user profiles, product catalogs, orders, and reviews."),
                (3, "High-Level System Architecture", "Outline the overall architecture including frontend, backend, and integrations with third-party services."),
                (4, "Scalability Strategies", "Discuss how you would scale the platform to handle increasing traffic and large data volumes."),
                (5, "Security Considerations", "What measures would you implement to ensure secure transactions and data protection?"),
                (6, "Deployment & Monitoring", "Explain your deployment strategy and how you would monitor the system in production."),
                (7, "Summary & Trade-offs", "Summarize your design decisions, highlighting trade-offs and potential future improvements.")
            ]
            for step_num, title, prompt in steps_data2:
                step_obj = Step(
                    scenario_id=scenario2.id, # type: ignore
                    step_number=step_num,
                    title=title,
                    prompt_text=prompt
                )
                db.session.add(step_obj)
            db.session.commit()

            # Scenario 3: Social Media Platform
            scenario3 = Scenario(
                title="Design a Social Media Platform",
                description=("Design a scalable social media platform where users can create profiles, share content, "
                             "and engage with a community. Consider real-time feeds, content moderation, privacy, and data storage.")
            )
            db.session.add(scenario3)
            db.session.commit()

            steps_data3 = [
                (1, "User Features", "List the core user features such as profile creation, posting, commenting, and sharing."),
                (2, "Content Feed Generation", "Describe how user feeds will be generated in real time with personalization."),
                (3, "Data Storage Strategy", "Explain your choice of databases (SQL vs. NoSQL) for storing posts, media, and profiles. Consider caching and sharding."),
                (4, "Real-Time Communication", "Outline how you would implement real-time updates and notifications (e.g., using WebSockets)."),
                (5, "Content Moderation", "Discuss automated filters and manual review processes for moderating user content."),
                (6, "Privacy and Security", "Detail measures to protect user data including encryption, access controls, and anonymization."),
                (7, "Summary", "Summarize your design and discuss trade-offs between scalability, performance, and privacy.")
            ]
            for step_num, title, prompt in steps_data3:
                step_obj = Step(
                    scenario_id=scenario3.id, # type: ignore
                    step_number=step_num,
                    title=title,
                    prompt_text=prompt
                )
                db.session.add(step_obj)
            db.session.commit()

            # Scenario 4: Real-Time Chat Application
            scenario4 = Scenario(
                title="Design a Real-Time Chat Application",
                description=("Design a real-time chat application that supports one-on-one and group conversations. "
                             "Consider message delivery, persistence, user presence, and security challenges.")
            )
            db.session.add(scenario4)
            db.session.commit()

            steps_data4 = [
                (1, "Core Messaging Features", "List essential features such as direct messaging, group chat, and read receipts."),
                (2, "Real-Time Communication", "Describe how messages are delivered instantly, for example, via WebSockets or long polling."),
                (3, "Message Persistence", "Explain how you would store chat history and user data, including database choices and indexing strategies."),
                (4, "Scalability", "Discuss strategies for scaling to millions of users, including load balancing and sharding."),
                (5, "Security", "Outline measures for data encryption, authentication, and spam/abuse prevention."),
                (6, "User Presence & Notifications", "Detail how you would implement presence detection and notification mechanisms."),
                (7, "Summary", "Summarize your architecture and discuss trade-offs between real-time performance and scalability.")
            ]
            for step_num, title, prompt in steps_data4:
                step_obj = Step(
                    scenario_id=scenario4.id, # type: ignore
                    step_number=step_num,
                    title=title,
                    prompt_text=prompt
                )
                db.session.add(step_obj)
            db.session.commit()

            # Scenario 5: Scalable Video Streaming Service
            scenario5 = Scenario(
                title="Design a Scalable Video Streaming Service",
                description=("Design a video streaming service that can handle live and on-demand content. "
                             "Consider video encoding, content delivery networks (CDNs), scalability, latency, and user experience.")
            )
            db.session.add(scenario5)
            db.session.commit()

            steps_data5 = [
                (1, "User Experience", "Define features for both viewers and content creators, such as live streaming, VOD, and recommendations."),
                (2, "Video Processing Pipeline", "Explain how videos are ingested, transcoded, and processed for multiple resolutions."),
                (3, "Content Delivery Strategy", "Discuss how CDNs and caching are used to reduce latency and ensure high availability."),
                (4, "Scalability", "Detail strategies to handle high concurrent viewers and traffic spikes."),
                (5, "Data Storage", "Outline how video files, metadata, and user data are stored, including trade-offs between different storage solutions."),
                (6, "Security & DRM", "Describe measures for protecting content, including DRM and encryption."),
                (7, "Summary", "Summarize your design, focusing on trade-offs between cost, performance, and scalability.")
            ]
            for step_num, title, prompt in steps_data5:
                step_obj = Step(
                    scenario_id=scenario5.id, # type: ignore
                    step_number=step_num,
                    title=title,
                    prompt_text=prompt
                )
                db.session.add(step_obj)
            db.session.commit()
    first_request_done = True

setup_db_once()

# Utility: Load diagnostic_data.json
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

########################################################
# 3. Routes
########################################################

@app.route("/")
def index():
    scenarios = Scenario.query.all()
    return render_template_string(TEMPLATES["index"], scenarios=scenarios)

############################
# CODING CHALLENGE ENDPOINTS
############################

@app.route('/api/coding_challenge', methods=['GET'])
def get_coding_challenge():
    """
    ---
    get:
      description: Get a coding challenge
      parameters:
        - in: query
          name: topic
          required: false
          schema:
            type: string
      responses:
        '200':
          description: A coding challenge
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  title:
                    type: string
                  difficulty:
                    type: string
                  category:
                    type: string
                  topics:
                    type: array
                    items:
                      type: string
                  company_context:
                    type: string
                  problem_statement:
                    type: string
                  input_format:
                    type: string
                  output_format:
                    type: string
                  test_cases:
                    type: array
                    items:
                      type: object
                      properties:
                        input:
                          type: string
                        expected:
                          type: string
                        description:
                          type: string
                  follow_up:
                    type: array
                    items:
                      type: string
        '404':
          description: No problem found for the given topic.
    """
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
    """
    ---
    get:
      description: Get coding challenges by skill level
      parameters:
        - in: query
          name: level
          required: true
          schema:
            type: string
            enum: [entry, intermediate, advanced]
      responses:
        '200':
          description: A list of coding challenges
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    title:
                      type: string
                    difficulty:
                      type: string
                    category:
                      type: string
                    topics:
                      type: array
                      items:
                        type: string
                    company_context:
                      type: string
                    problem_statement:
                      type: string
                    input_format:
                      type: string
                    output_format:
                      type: string
                    test_cases:
                      type: array
                      items:
                        type: object
                        properties:
                          input:
                            type: string
                          expected:
                            type: string
                          description:
                            type: string
                    follow_up:
                      type: array
                      items:
                        type: string
        '404':
          description: Invalid skill level.
    """
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
    """
    ---
    post:
      description: Submit a coding solution
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                problem_id:
                  type: string
                code:
                  type: string
      responses:
        '200':
          description: Submission result
          content:
            application/json:
              schema:
                type: object
                properties:
                  problem_id:
                    type: string
                  results:
                    type: array
                    items:
                      type: object
                      properties:
                        input:
                          type: string
                        expected:
                          type: string
                        output:
                          type: string
                        passed:
                          type: boolean
                        execution_time:
                          type: number
                        error:
                          type: string
                  passed_cases:
                    type: integer
                  total_cases:
                    type: integer
        '400':
          description: Invalid JSON or missing problem_id or code.
        '404':
          description: Problem not found.
    """
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
    new_result = CodingResult(
        problem_id=problem_id,
        passed=passed_cases,
        total=total_cases,
        execution_time=sum(r['execution_time'] for r in results)
    )
    db.session.add(new_result)
    db.session.commit()
    return jsonify({
        'problem_id': problem_id,
        'results': results,
        'passed_cases': passed_cases,
        'total_cases': total_cases
    })

############################
# DESIGN QUESTIONS ENDPOINTS
############################

@app.route('/api/design_questions', methods=['GET'])
def get_design_questions():
    """
    ---
    get:
      description: Get system design questions
      responses:
        '200':
          description: A list of system design questions
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    title:
                      type: string
                    difficulty:
                      type: string
                    context:
                      type: string
                    requirements:
                      type: object
                      properties:
                        functional:
                          type: array
                          items:
                            type: string
                        non_functional:
                          type: array
                          items:
                            type: string
                    evaluation_points:
                      type: array
                      items:
                        type: string
                    correct_option:
                      type: string
                    options:
                      type: array
                      items:
                        type: string
        '404':
          description: No system design questions found.
    """
    questions = load_design_questions()
    if not questions:
        abort(404, description="No system design questions found")
    return jsonify(questions)

@app.route('/api/submit_design', methods=['POST'])
def submit_design():
    """
    ---
    post:
      description: Submit system design answers
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                responses:
                  type: array
                  items:
                    type: object
                    properties:
                      question_id:
                        type: string
                      selected_option:
                        type: string
      responses:
        '200':
          description: Submission result
          content:
            application/json:
              schema:
                type: object
                properties:
                  total_score:
                    type: integer
                  max_score:
                    type: integer
        '400':
          description: Invalid JSON or no responses provided.
    """
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
            new_design = DesignResult(question_id=question_id, score=score)
            db.session.add(new_design)
    db.session.commit()
    return jsonify({
        'total_score': total_score,
        'max_score': max_score
    })

############################
# DIAGNOSTIC REPORT ENDPOINT
############################

@app.route('/api/diagnostic_report', methods=['GET'])
def diagnostic_report():
    """
    ---
    get:
      description: Generate a comprehensive diagnostic report
      responses:
        '200':
          description: Diagnostic report
          content:
            application/json:
              schema:
                type: object
                properties:
                  coding:
                    type: object
                    properties:
                      passed:
                        type: integer
                      total:
                        type: integer
                      percentage:
                        type: number
                  design:
                    type: object
                    properties:
                      score:
                        type: integer
                      total:
                        type: integer
                      percentage:
                        type: number
                  overall_recommendation:
                    type: string
    """
    coding_total = 0
    coding_possible = 0
    design_total = 0
    design_possible = 0
    coding_res = db.session.query(db.func.sum(CodingResult.passed), db.func.sum(CodingResult.total)).first()
    if coding_res and coding_res[0] is not None:
        coding_total, coding_possible = coding_res
    design_res = db.session.query(db.func.sum(DesignResult.score), db.func.count(DesignResult.id)).first()
    if design_res and design_res[0] is not None:
        design_total, design_possible = design_res
    report = {
        'coding': {
            'passed': coding_total or 0,
            'total': coding_possible or 0,
            'percentage': (coding_total / coding_possible * 100) if coding_possible else 0
        },
        'design': {
            'score': design_total or 0,
            'total': design_possible or 0,
            'percentage': (design_total / design_possible * 100) if design_possible else 0
        },
        'overall_recommendation': generate_recommendation(coding_total, coding_possible, design_total, design_possible)
    }
    return jsonify(report)

def generate_recommendation(coding_passed, coding_total, design_score, design_total):
    recommendations = []
    if not coding_total or coding_total == 0:
        recommendations.append("No coding challenges attempted.")
    else:
        coding_pct = (coding_passed / coding_total * 100) if coding_total else 0
        if coding_pct < 60:
            recommendations.append("Improve data structures and algorithms with more practice.")
        elif coding_pct < 80:
            recommendations.append("Solid coding skills; consider fine-tuning optimizations.")
        else:
            recommendations.append("Excellent coding performance; focus on advanced or system-level topics.")
    if not design_total or design_total == 0:
        recommendations.append("No system design questions attempted.")
    else:
        design_pct = (design_score / design_total * 100) if design_total else 0
        if design_pct < 60:
            recommendations.append("Study system design fundamentals: caching, load balancing, trade-offs.")
        elif design_pct < 80:
            recommendations.append("Good system design foundation; practice more real-world scenarios.")
        else:
            recommendations.append("Strong system design knowledge; keep refining with complex architectures.")
    return " ".join(recommendations)

############################
# WIZARD-SCENARIO ENDPOINTS
############################

@app.route('/api/wizard/scenarios', methods=['GET'])
def list_wizard_scenarios():
    """
    ---
    get:
      description: List all wizard scenarios
      responses:
        '200':
          description: A list of wizard scenarios
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    title:
                      type: string
                    description:
                      type: string
    """
    try:
        scenarios = Scenario.query.all()
        results = [
            {
                "id": getattr(sc, 'id', None),
                "title": getattr(sc, 'title', ''),
                "description": getattr(sc, 'description', '')
            } 
            for sc in (scenarios or [])
        ]
        return jsonify(results)
    except Exception as e:
        print(e)
        abort(500, description="Error retrieving scenarios")

@app.route('/api/wizard/scenario/<int:scenario_id>/steps', methods=['GET'])
def get_wizard_steps(scenario_id):
    """
    ---
    get:
      description: Get steps for a specific wizard scenario
      parameters:
        - in: path
          name: scenario_id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: A list of steps for the scenario
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    step_number:
                      type: integer
                    title:
                      type: string
                    prompt_text:
                      type: string
        '404':
          description: Scenario not found.
    """
    try:
        steps = Step.query.filter_by(scenario_id=scenario_id).order_by(Step.step_number.asc()).all()
        results = [{"id": st.id, "step_number": st.step_number, "title": st.title, "prompt_text": st.prompt_text} for st in steps]
        return jsonify(results)
    except Exception as e:
        print(e)
        abort(500, description="Error retrieving steps for scenario")

@app.route('/api/wizard/submit_response', methods=['POST'])
def submit_wizard_response():
    """
    ---
    post:
      description: Submit a response for a wizard step
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                scenario_id:
                  type: integer
                step_id:
                  type: integer
                user_response:
                  type: string
      responses:
        '200':
          description: Response saved
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        '400':
          description: Missing scenario_id or step_id.
        '500':
          description: Error storing response.
    """
    data = request.get_json()
    scenario_id = data.get('scenario_id')
    step_id = data.get('step_id')
    user_answer = data.get('user_response', "")
    if not scenario_id or not step_id:
        abort(400, "Missing scenario_id or step_id")
    try:
        existing_response = Response.query.filter_by(scenario_id=scenario_id, step_id=step_id).first()
        if existing_response:
            existing_response.user_response_text = user_answer
        else:
            new_resp = Response(scenario_id=scenario_id, step_id=step_id, user_response_text=user_answer)
            db.session.add(new_resp)
        db.session.commit()
        return jsonify({"message": "Response saved"})
    except Exception as e:
        print(e)
        abort(500, "Error storing response")

@app.route('/api/wizard/<int:scenario_id>/summary', methods=['GET'])
def wizard_summary(scenario_id):
    """
    ---
    get:
      description: Get summary of a wizard scenario
      parameters:
        - in: path
          name: scenario_id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Summary of the wizard scenario
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    step_id:
                      type: integer
                    step_number:
                      type: integer
                    title:
                      type: string
                    responses:
                      type: array
                      items:
                        type: string
        '404':
          description: Scenario not found.
    """
    try:
        steps = Step.query.filter_by(scenario_id=scenario_id).order_by(Step.step_number.asc()).all()
        summary = []
        for st in steps:
            resp_list = [r.user_response_text for r in st.responses]
            summary.append({
                "step_id": st.id, # type: ignore
                "step_number": st.step_number,
                "title": st.title,
                "responses": resp_list
            })
        return jsonify(summary)
    except Exception as e:
        print(e)
        abort(500, description="Error retrieving summary")

############################
# DIAGRAM STATE ENDPOINTS
############################

@app.route('/api/wizard/scenario/<int:scenario_id>/diagram', methods=['POST'])
def save_diagram_state(scenario_id):
    """
    ---
    post:
      description: Save the diagram state for a given scenario
      parameters:
        - in: path
          name: scenario_id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                diagram:
                  type: object
      responses:
        '200':
          description: Diagram state saved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        '400':
          description: Missing diagram state.
    """
    data = request.get_json()
    diagram_state = data.get('diagram')
    if not diagram_state:
        abort(400, description="Missing diagram state")
    filename = f"diagram_{scenario_id}.json"
    with open(filename, "w") as f:
        json.dump(diagram_state, f)
    return jsonify({"message": "Diagram state saved"}), 200

@app.route('/api/wizard/scenario/<int:scenario_id>/diagram', methods=['GET'])
def load_diagram_state(scenario_id):
    """
    ---
    get:
      description: Load the saved diagram state for a given scenario
      parameters:
        - in: path
          name: scenario_id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Diagram state retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  diagram:
                    type: object
        '404':
          description: No diagram state found.
    """
    filename = f"diagram_{scenario_id}.json"
    if not os.path.exists(filename):
        abort(404, description="No diagram state found")
    with open(filename, "r") as f:
        diagram_state = json.load(f)
    return jsonify({"diagram": diagram_state}), 200

############################
# MODEL ANSWERS ENDPOINT
############################

@app.route('/api/wizard/model_answers/<int:step_id>', methods=['GET'])
def get_model_answers(step_id):
    """
    ---
    get:
      description: Get the model answer for a given wizard step
      parameters:
        - in: path
          name: step_id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Model answer retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  model_answer:
                    type: string
    """
    model_answers = {
        1: "A comprehensive answer should include both functional and non-functional requirements, such as features, performance targets, scalability constraints, and security measures.",
        2: "Your architecture should define whether you use a monolithic or microservices approach, and list key components like API servers, databases, caching layers, and load balancers.",
        3: "Data modeling should justify your choice of storage (SQL vs. NoSQL), detail schema design, and discuss indexing strategies and trade-offs.",
        4: "Discuss how to scale the system, including load balancing, caching, and replication strategies to handle increased traffic.",
        5: "Explain your strategies for fault tolerance, redundancy, and disaster recovery to ensure system availability.",
        6: "Outline security measures like authentication, encryption, rate limiting, and abuse prevention.",
        7: "Summarize your design, including key trade-offs and potential improvements for future scalability and performance."
    }
    answer = model_answers.get(step_id, "No model answer available for this step.")
    return jsonify({"model_answer": answer})

########################################################
# SWAGGER CONFIGURATION
########################################################

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}
swagger = Swagger(app, config=swagger_config)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)