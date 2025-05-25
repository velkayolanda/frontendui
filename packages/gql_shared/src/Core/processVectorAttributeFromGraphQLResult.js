import { ItemActions } from "../Store";

/**
 * Middleware-like function to process a specific vector attribute from a GraphQL query result.
 * Extracts the relevant data, identifies the vector attribute, and dispatches an action to update the attribute.
 *
 * @param {string} vectorname - The name of the vector attribute to extract and process.
 * @returns {Function} A function that takes the `jsonResult` and returns a middleware function.
 *
 * @throws {Error} If `vectorname` is not a string.
 * @throws {Error} If `jsonResult` is not a valid object.
 *
 * @example
 * // Define the vector processing middleware
 * const processVectorMiddleware = processVectorAttributeFromGraphQLResult("events");
 *
 * const query EmptyQueryRead($id: id) {
 *   result: emptyById(id: $id) {
 *      __typename
 *      id
 * }
 *
 * const EmptyReadAsyncAction = createAsyncGraphQLAction(EmptyQueryRead, processVectorMiddleware)
 * dispatch(EmptyReadAsyncAction)
 */
export const processVectorAttributeFromGraphQLResult = (vectorname) => {
    if (typeof vectorname !== "string") {
        throw new Error("processVectorAttributeFromGraphQLResult: 'vectorname' must be a string.");
    }

    return (jsonResult) => {
        if (typeof jsonResult !== "object" || jsonResult === null) {
            console.log("processVectorAttributeFromGraphQLResult: 'jsonResult' must be a valid object.", jsonResult)
            throw new Error("processVectorAttributeFromGraphQLResult: 'jsonResult' must be a valid object.");
        }

        return (dispatch, getState, next) => {
            const data = jsonResult?.data;
            // console.log(data)
            if (!data) {
                console.warn("processVectorAttributeFromGraphQLResult: No data found in jsonResult");
                return next(jsonResult);
            }

            let result = data?.result;

            // Extract the single key's value if result is not directly present
            if (!result && Object.keys(data).length === 1) {
                const singleKey = Object.keys(data)[0];
                result = data[singleKey];
            }

            if (!result || !Array.isArray(result[vectorname])) {
                console.warn(`processVectorAttributeFromGraphQLResult: No valid vector '${vectorname}' found in the result`, data);
                return next(jsonResult);
            }

            // Dispatch UpdateSubVector synchronously
            dispatch(ItemActions.item_updateAttributeVector({ item: result, vectorname }));

            return next(jsonResult); // Pass to the next middleware
        };
    };
};
