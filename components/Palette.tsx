import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, VStack, Heading, Divider, HStack } from "@chakra-ui/react"; // Added HStack for icon + label layout
import { CustomNodeModel } from "../types/node";
import { getIconForType } from "../utils/iconMapping"; // Import our new icon mapping

interface PaletteItem {
  type: string;
  label: string;
  details: string;
  color: string;
  category: string;
}

export const paletteItems: PaletteItem[] = [
  // --- Databases ---
  {
    category: "Databases",
    type: "RelationalDB",
    label: "Relational DB",
    details: "SQL-based (e.g., MySQL, PostgreSQL, Oracle)",
    color: "rgb(255, 99, 71)",
  },
  {
    category: "Databases",
    type: "NoSQL_Document",
    label: "NoSQL (Document)",
    details: "MongoDB, CouchDB",
    color: "rgb(255, 159, 64)",
  },
  {
    category: "Databases",
    type: "NoSQL_KeyValue",
    label: "NoSQL (Key-Value)",
    details: "Redis, Memcached",
    color: "rgb(255, 205, 86)",
  },
  {
    category: "Databases",
    type: "NoSQL_WideColumn",
    label: "NoSQL (Wide-Col)",
    details: "Cassandra, HBase",
    color: "rgb(75, 192, 192)",
  },
  {
    category: "Databases",
    type: "NoSQL_Graph",
    label: "NoSQL (Graph)",
    details: "Neo4j, Amazon Neptune",
    color: "rgb(54, 162, 235)",
  },
  {
    category: "Databases",
    type: "SearchEngine",
    label: "Search Engine",
    details: "Elasticsearch, Solr",
    color: "rgb(153, 102, 255)",
  },
  {
    category: "Databases",
    type: "TimeSeriesDB",
    label: "Time Series DB",
    details: "InfluxDB, Prometheus",
    color: "rgb(201, 203, 207)",
  },

  // --- Caching ---
  {
    category: "Caching",
    type: "Cache_InMemory",
    label: "In-Memory Cache",
    details: "Redis, Memcached (can also be a KV store)",
    color: "rgb(255, 205, 86)",
  },
  {
    category: "Caching",
    type: "Cache_CDN",
    label: "CDN",
    details: "Content Delivery Network (e.g., Cloudflare, Akamai)",
    color: "rgb(75, 192, 192)",
  },

  // --- Load Balancers ---
  {
    category: "Load Balancers",
    type: "LoadBalancer_Elastic",
    label: "Elastic LB(",
    details: "Dynamically scales (e.g., AWS ELB)",
    color: "rgb(255, 165, 0)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Traditional",
    label: "Traditional LB(",
    details: "Static load balancing (e.g., Nginx, HAProxy)",
    color: "rgb(138, 43, 226)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Application",
    label: "Application LB(",
    details: "Layer 7, routes based on content",
    color: "rgb(255, 99, 71)",
  },
  {
    category: "Load Balancers",
    type: "LoadBalancer_Network",
    label: "Network LB(",
    details: "Layer 4, routes based on IP protocol data",
    color: "rgb(60, 179, 113)",
  },

  // --- Messaging ---
  {
    category: "Messaging",
    type: "MessageQueue",
    label: "Message Queue",
    details: "RabbitMQ, Kafka, SQS",
    color: "rgb(54, 162, 235)",
  },
  {
    category: "Messaging",
    type: "PubSub",
    label: "Pub/Sub System",
    details: "Redis Pub/Sub, Google Pub/Sub, Kafka",
    color: "rgb(153, 102, 255)",
  },

  // --- Servers ---
  {
    category: "Servers",
    type: "WebServer",
    label: "Web Server",
    details: "Apache, Nginx",
    color: "rgb(106, 90, 205)",
  },
  {
    category: "Servers",
    type: "AppServer",
    label: "Application Server",
    details: "Node.js, Tomcat, Gunicorn",
    color: "rgb(255, 140, 0)",
  },

  // --- Other ---
  {
    category: "Other",
    type: "APIGateway",
    label: "API Gateway",
    details: "Handles routing, authentication, rate limiting",
    color: "rgb(255, 0, 0)",
  },
  {
    category: "Other",
    type: "Firewall",
    label: "Firewall",
    details: "Security, network traffic control",
    color: "rgb(0, 128, 0)", // Green
  },
  {
    category: "Other",
    type: "User",
    label: "User",
    details: "Represents a client/user",
    color: "rgb(128, 0, 128)", // Purple
  },
  {
    category: "Other",
    type: "Microservice",
    label: "Microservice",
    details: "Independent, small service",
    color: "rgb(210, 105, 30)",
  },
  {
    category: "Other",
    type: "ExternalAPI",
    label: "External API",
    details: "Third-party service integration",
    color: "rgb(0, 0, 255)", // Blue
  },
  {
    category: "Other",
    type: "BlobStorage",
    label: "Blob Storage",
    details: "Object storage for unstructured data (S3, Azure Blob Storage)",
    color: "rgb(139, 69, 19)", // Brown
  },
];

interface PaletteProps {
  onAddNode: (node: CustomNodeModel) => void;
}
interface PaletteProps {
  onAddNode: (node: CustomNodeModel) => void;
}

const Palette: React.FC<PaletteProps> = ({ onAddNode }) => {
  const groupedItems: { [category: string]: PaletteItem[] } = {};
  paletteItems.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <VStack spacing={3} align="stretch">
      {Object.keys(groupedItems).map((category) => (
        <React.Fragment key={category}>
          <Heading size="md">{category}</Heading>
          <Divider />
          {groupedItems[category].map((item) => (
            <Button
              key={item.type}
              draggable
              onDragStart={(event) => {
                const data = {
                  type: item.type,
                  label: item.label,
                  color: item.color,
                  details: item.details,
                  id: uuidv4(),
                };
                event.dataTransfer.setData("storm-diagram-node", JSON.stringify(data));
              }}
              width="100%"
              colorScheme="gray"
              backgroundColor={item.color}
              color="white"
            >
              <HStack spacing={2}>
                {getIconForType(item.type)} {/* Default size (24px) */}
                <span>{item.label}</span>
              </HStack>
            </Button>
          ))}
        </React.Fragment>
      ))}
    </VStack>
  );
};

export default Palette;