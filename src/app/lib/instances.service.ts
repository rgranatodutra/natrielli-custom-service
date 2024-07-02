import { InstancesMannager } from "inpulse-crm/connection/src/instances-mannager";

const instancesService = new InstancesMannager(process.env.REACT_APP_API_URL || "https://contec.inf.br");

export default instancesService;
