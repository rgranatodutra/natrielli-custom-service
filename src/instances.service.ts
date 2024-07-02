import { InstancesMannager } from "inpulse-crm/connection/src/instances-mannager";

const instancesService = new InstancesMannager(process.env.INSTANCES_SERVICE_URL || "http://localhost:9000");

export default instancesService;