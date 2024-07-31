class BotAttendance {
    public readonly type: string;
    public readonly phone: string;
    private step: number;

    constructor(type: string, phone: string, step: number) {
        this.type = type;
        this.phone = phone;
        this.step = step;
    }

    public getStep(): number {
        return this.step;
    }

    public nextStep() {
        this.step++;
    }
}

export default BotAttendance;