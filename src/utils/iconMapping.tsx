
import { Icon } from "@chakra-ui/react";
import { FaCloudversify } from "react-icons/fa"; // CloudIcon
import { GiUnbalanced } from "react-icons/gi"; // BalancerIcon
import { HiMiniQueueList } from "react-icons/hi2"; // QueueIcon
import { GiServerRack } from "react-icons/gi"; // ServerIcon
import { TbApiAppOff } from "react-icons/tb"; // APIIcon
import { BsPersonArmsUp } from "react-icons/bs"; // UserIcon
import { HiMiniArrowsPointingOut } from "react-icons/hi2"; // MicroserviceIcon
import { TbExternalLinkOff } from "react-icons/tb"; // ExternalAPIIcon
import { GiBurstBlob } from "react-icons/gi"; // BlobStorageIcon
import { SiMongodb } from "react-icons/si";
import { DiRedis } from "react-icons/di";
import { GiFirewall } from "react-icons/gi";
import { FaPizzaSlice } from "react-icons/fa6";
import { FaMedapps } from "react-icons/fa6";
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import { SiGooglepubsub } from "react-icons/si";
import { SiGraphql } from "react-icons/si";
import { GiKeyLock } from "react-icons/gi";
import { GrDocumentStore } from "react-icons/gr";
import { GiTimeDynamite } from "react-icons/gi";
import { BiLogoPostgresql } from "react-icons/bi";



export const getIconForType = (type: string, color?: string, size: string | number = 6): JSX.Element => {
  const iconProps = {
    boxSize: size,
    color: color,
  };

  switch (type) {
    // Databases
    case "RelationalDB":
      // @ts-ignore
      return <Icon as={BiLogoPostgresql} {...iconProps} />;
    case "NoSQL_Document":
      // @ts-ignore
      return <Icon as={GrDocumentStore} {...iconProps} />;
    case "NoSQL_KeyValue":
      // @ts-ignore
      return <Icon as={GiKeyLock} {...iconProps} />;
      case "NoSQL_WideColumn":
      // @ts-ignore
      return <Icon as={SiMongodb} {...iconProps} />;
    case "NoSQL_Graph":
      // @ts-ignore
      return <Icon as={SiGraphql} {...iconProps} />;
    case "SearchEngine":
      // @ts-ignore
      return <Icon as={MdOutlineScreenSearchDesktop} {...iconProps} />;
    case "TimeSeriesDB":
      // @ts-ignore
      return <Icon as={GiTimeDynamite} {...iconProps} />;
    // Caching
    case "Cache_InMemory":
      // @ts-ignore
      return <Icon as={DiRedis} {...iconProps} />;
    case "Cache_CDN":
      // @ts-ignore
      return <Icon as={FaCloudversify} {...iconProps} />;
    // Load Balancers
    case "LoadBalancer_Elastic":
    case "LoadBalancer_Traditional":
    case "LoadBalancer_Application":
    case "LoadBalancer_Network":
      // @ts-ignore
      return <Icon as={GiUnbalanced} {...iconProps} />;
    // Messaging
    case "MessageQueue":
      // @ts-ignore
      return <Icon as={HiMiniQueueList} {...iconProps} />;
    case "PubSub":
      // @ts-ignore
      return <Icon as={SiGooglepubsub} {...iconProps} />;
    // Servers
    case "WebServer":
      // @ts-ignore
      return <Icon as={FaMedapps} {...iconProps} />;
    case "AppServer":
      // @ts-ignore
      return <Icon as={GiServerRack} {...iconProps} />;
    // Other
    case "APIGateway":
      // @ts-ignore
      return <Icon as={TbApiAppOff} {...iconProps} />;
    case "Firewall":
      // @ts-ignore
      return <Icon as={GiFirewall} {...iconProps} />;
    case "User":
      // @ts-ignore
      return <Icon as={BsPersonArmsUp} {...iconProps} />;
    case "Microservice":
      // @ts-ignore
      return <Icon as={HiMiniArrowsPointingOut} {...iconProps} />;
    case "ExternalAPI":
      // @ts-ignore
      return <Icon as={TbExternalLinkOff} {...iconProps} />;
    case "BlobStorage":
      // @ts-ignore
      return <Icon as={GiBurstBlob} {...iconProps} />;
    default:
      // @ts-ignore
      return <Icon as={FaPizzaSlice} {...iconProps} />;
  }
};
