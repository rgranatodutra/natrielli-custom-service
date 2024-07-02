import { InstancesMannager } from "inpulse-crm/connection/src/instances-mannager";


const instancesService = new InstancesMannager("http://localhost:9000");

export default instancesService;