export interface GraphqlError {
    message: string;
    extensions?: Record<string, unknown>;
}

export interface GraphqlResponse {
    data?: unknown;
    errors?: readonly GraphqlError[];
}
