export class JsonModel<T> {
    public Success: boolean;
    public Messages: JsonModeltMessage[];
    public Result: T;
}

export class JsonModeltMessage {
    public IsError: boolean;
    public Message: string;
}