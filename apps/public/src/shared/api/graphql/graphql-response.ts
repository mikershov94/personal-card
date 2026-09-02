export interface GraphqlError {
    message: string;
    extensions?: Record<string, unknown>;
}

export interface GraphqlResponse<TResult = unknown> {
    data?: TResult;
    errors?: readonly GraphqlError[];
}
