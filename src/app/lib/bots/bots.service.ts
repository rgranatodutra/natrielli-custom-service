import { Whatsapp } from "@infotecrs/types/src";
import ComercialBot from "./entity/comercial.bot";

class BotsService {
    public static comercialBot: ComercialBot = new ComercialBot();

    public static fetchComercialBot(contact: Whatsapp.Contact, message: string) {
        return this.comercialBot.fetchResponse(contact, message);
    }
}

export default BotsService;