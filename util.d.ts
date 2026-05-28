declare namespace JsonApi {
    /**
     * For when the spec stipulates that the document **MUST** contain “at least one of the following members.”
     */
    type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

    type Prohibit<T, K extends string> = {
        [P in K]?: never;
    } & Omit<T, K>;
}
