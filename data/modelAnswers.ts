// src/data/modelAnswers.ts
import { ModelAnswer } from "../types/modelAnswers"

export const modelAnswers: ModelAnswer[] = [
  {
    id: 1,
    title: "Functional Requirements",
    answer: `A well-structured system should include:
- User authentication and authorization
- Real-time data processing capabilities
- Data persistence and retrieval
- API endpoints for external integrations
- Monitoring and logging functionality`,
    explanation: "Functional requirements define the specific behaviors and capabilities that a system must exhibit. They are the core features that deliver value to users.",
    keyPoints: [
      "Always start with user-facing features",
      "Include both primary and secondary functions",
      "Consider system-to-system interactions",
      "Define success criteria for each requirement"
    ],
    commonMistakes: [
      "Mixing functional and non-functional requirements",
      "Being too vague or too specific",
      "Forgetting to consider error cases",
      "Omitting administrative functions"
    ],
    additionalResources: [
      {
        title: "Writing Good Requirements",
        url: "https://www.example.com/requirements"
      }
    ]
  },{
    id: 2,
    title: "Non-Functional Requirements for E-commerce",
    answer: `- Performance: The site should load product pages in under 2 seconds.
  - Scalability: The system should handle 10,000 concurrent users with minimal performance degradation.
  - Security: All user data must be encrypted in transit and at rest. PCI DSS compliance is required.
  - Availability: The system should have 99.99% uptime.
  - Usability: The checkout process should be completed in under 5 steps.`,
    explanation: "Non-functional requirements define the quality attributes of the system. For an e-commerce platform, performance, scalability, security, availability, and usability are critical for a positive user experience and business success.",
    keyPoints: [
      "Quantify requirements whenever possible (e.g., response time, uptime).",
      "Prioritize non-functional requirements based on business needs.",
      "Consider trade-offs between different quality attributes.",
      "Use industry standards and best practices as benchmarks."
    ],
    commonMistakes: [
      "Ignoring non-functional requirements until late in the development process.",
      "Setting unrealistic or unachievable targets.",
      "Failing to consider the impact of non-functional requirements on cost.",
      "Not involving stakeholders in defining non-functional requirements."
    ],
    additionalResources: [
      {
        title: "Non-Functional Requirements in Software Engineering",
        url: "https://www.example.com/non-functional-requirements"
      }
    ]
  },
  {
    id: 3,
    title: "High-Level Architecture for Ride-Sharing",
    answer: `The system would likely have the following components:
  - Mobile Apps (iOS, Android) for riders and drivers.
  - API Gateway: Handles routing and authentication.
  - User Service: Manages user accounts and profiles.
  - Driver Service: Tracks driver location and availability.
  - Trip Service: Manages the matching of riders and drivers, trip progress, and payment.
  - Mapping Service: Provides map data, routing, and ETA calculations.
  - Notification Service: Sends push notifications and SMS messages.
  - Payment Service: Integrates with a third-party payment gateway.`,
    explanation: "A ride-sharing service requires a distributed architecture to handle real-time data, location tracking, and high concurrency.  The services are separated to allow for independent scaling and development.",
    keyPoints: [
      "Use a microservices architecture for flexibility and scalability.",
      "Prioritize real-time communication between riders and drivers.",
      "Consider geographic distribution and data sharding for global coverage.",
      "Use a robust messaging system (e.g., Kafka, RabbitMQ) for asynchronous communication."
    ],
    commonMistakes: [
      "Choosing a monolithic architecture that becomes difficult to scale.",
      "Underestimating the complexity of real-time location tracking.",
      "Not planning for high availability and fault tolerance.",
      "Failing to secure sensitive user data and payment information."
    ],
    additionalResources: [
      {
        title: "Designing a Ride-Sharing Service",
        url: "https://www.example.com/ride-sharing-architecture"
      }
    ]
  },
  {
      id: 4,
      title: "Relational Database Schema for a Blog",
      answer: `
        Users: (user_id INT PRIMARY KEY, username VARCHAR(255) UNIQUE, email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), registration_date DATETIME)
        Posts: (post_id INT PRIMARY KEY, user_id INT, title VARCHAR(255), content TEXT, publication_date DATETIME, FOREIGN KEY (user_id) REFERENCES Users(user_id))
        Comments: (comment_id INT PRIMARY KEY, post_id INT, user_id INT, content TEXT, comment_date DATETIME, FOREIGN KEY (post_id) REFERENCES Posts(post_id), FOREIGN KEY (user_id) REFERENCES Users(user_id))
        Tags: (tag_id INT PRIMARY KEY, name VARCHAR(255) UNIQUE)
        Post_Tags: (post_id INT, tag_id INT, PRIMARY KEY (post_id, tag_id), FOREIGN KEY (post_id) REFERENCES Posts(post_id), FOREIGN KEY (tag_id) REFERENCES Tags(tag_id))
      `,
      explanation: "This schema uses a standard relational model.  Users can create multiple posts. Comments are associated with both a user and a post.  A many-to-many relationship between posts and tags is implemented using a junction table (Post_Tags).",
      keyPoints: [
        "Use appropriate data types for each column.",
        "Define primary keys and foreign keys to ensure data integrity.",
        "Use unique constraints to prevent duplicate entries.",
        "Consider indexing columns that are frequently used in queries."
      ],
      commonMistakes: [
        "Using overly large data types (e.g., TEXT for short strings).",
        "Forgetting to add foreign key constraints.",
        "Creating redundant or unnecessary tables.",
        "Poorly designed many-to-many relationships."
      ],
      additionalResources: [
        {
          title: "Database Design Best Practices",
          url: "https://www.example.com/database-design"
        }
      ]
    },
    {
        id: 5,
        title: "Load Balancing Algorithms",
        answer: `
          - Round Robin: Distributes requests sequentially to each server.
          - Least Connections: Sends requests to the server with the fewest active connections.
          - IP Hash: Uses the client's IP address to determine which server to send the request to.
          - Weighted Round Robin: Similar to Round Robin, but servers with higher weights receive more requests.
          - Weighted Least Connections: Similar to Least Connections, but servers with higher weights receive more requests.
        `,
        explanation: "Different load balancing algorithms are suitable for different scenarios. Round Robin is simple but may not be optimal if servers have different capacities. Least Connections is better for dynamic workloads. IP Hash ensures session persistence.",
        keyPoints: [
          "Choose an algorithm based on your application's needs and server capabilities.",
          "Consider using health checks to monitor server availability.",
          "Use sticky sessions (session affinity) if your application requires it.",
          "Monitor load balancer performance and adjust the algorithm if needed."
        ],
        commonMistakes: [
          "Using the wrong algorithm for your workload.",
          "Not configuring health checks correctly.",
          "Overloading a single server due to misconfiguration.",
          "Failing to monitor load balancer performance."
        ],
        additionalResources: [
          {
            title: "Load Balancing Algorithms Explained",
            url: "https://www.example.com/load-balancing-algorithms"
          }
        ]
      }
];