declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        bedrockModelId: string;
    };
    openai: {
        apiKey: string;
        baseURL: string | undefined;
        model: string;
    };
};
export default _default;
