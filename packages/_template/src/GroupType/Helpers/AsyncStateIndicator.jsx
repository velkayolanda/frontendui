import { ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"

export const AsyncStateIndicator = ({ error, loading, text, children }) => {
    return (<>
        {error && <ErrorHandler errors={error} />}
        {loading && <LoadingSpinner text={text} />}
        {/* {!error && !loading && children} */}
    </>)
}