import { readFileSync } from 'fs';
import path from 'path';
import { AnswerMessageAction, TransferAttendanceAction } from '@infotecrs/bot-sdk/actions';
import { Whatsapp } from "@infotecrs/types/src";
import BotAttendance from './bot-attendance';

interface ComercialBotSettings {
    initialMessage: string;
    invalidMessage: string;
    validMessage: string;
    maxTries: number;
    onMaxTries: string;
    options: Record<string, { id: number, name: string, description: string }>;
}

class ComercialBot {
    private attendances: BotAttendance[] = [];
    private initialMessage: string;
    private invalidMessage: string;
    private validMessage: string;
    private options: Record<string, { id: number, name: string, description: string }>;

    constructor() {
        const settings = this.loadSettings();

        try {
            this.initialMessage = settings.initialMessage;
            this.invalidMessage = settings.invalidMessage;
            this.validMessage = settings.validMessage;
            this.options = settings.options;
        } catch {
            throw new Error("invalid settings for comercial-bot");
        }
    }

    private loadSettings(): ComercialBotSettings {
        try {
            const rootDir = process.cwd();
            const configPath = path.join(rootDir, process.env.COMERCIAL_CONFIG_FILE || "comercial.settings.json");
            const configFile = readFileSync(configPath, "utf-8");
            const configJson = JSON.parse(configFile);

            return configJson as ComercialBotSettings;
        } catch (err) {
            console.error(err);
            throw err
        }

    }

    private getOrCreate(phone: string): BotAttendance {
        const findAttendance = this.attendances.find(a => a.phone === phone);

        if (!findAttendance) {
            const createdAttendance = new BotAttendance("comercial", phone, 1);
            this.attendances.push(createdAttendance);

            return createdAttendance;
        }

        return findAttendance;
    }

    private finish(phone: string) {
        this.attendances = this.attendances.filter(a => a.phone !== phone);
    }

    public fetchResponse(contact: Whatsapp.Contact, receivedMessage: string): Array<TransferAttendanceAction | AnswerMessageAction> {
        const attendance = this.getOrCreate(contact.phone);
        const step = attendance.getStep();

        if (step == 1) {
            const optionsString = Object.entries(this.options).map(([key, value]) => `${key}: ${value.name} | ${value.description}`).join("\n");
            const messageString = this.initialMessage + "\n" + optionsString;
            const answerAction = new AnswerMessageAction(messageString);
            attendance.nextStep();

            return [answerAction];
        }
        if (step == 2) {
            const findOption = Object.entries(this.options).find(([key]) => receivedMessage.includes(key));

            if (!findOption) {
                const answerAction = new AnswerMessageAction(this.invalidMessage);

                return [answerAction];
            }

            const messageString = this.validMessage.replace("{name}", findOption[1].name).replace("{description}", findOption[1].description);
            const answerAction = new AnswerMessageAction(messageString);
            const transferAction = new TransferAttendanceAction(findOption[1].id, 2);

            this.finish(contact.phone);

            return [answerAction, transferAction];
        }

        return [];
    }

}

export default ComercialBot;
