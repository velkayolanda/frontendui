import { useEffect, useState } from "react"

import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { GroupReadAsyncAction } from "../Queries"
import { GroupPageContent } from "./GroupPageContent"

/**
 * A lazy-loading component for displaying content of a group entity.
 *
 * This component fetches group data using `GroupReadAsyncAction`, and passes the result
 * to `GroupPageContent`. It provides change handlers (`onChange`, `onBlur`) and the `group` entity
 * to its children via a render function.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string|number} props.group - The group ID to load.
 * @param {(params: { group: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function (function-as-children) that receives:
 *   - `group` — the fetched group entity,
 *   - `onChange` — function to re-fetch when value changes,
 *   - `onBlur` — function to re-fetch when value is blurred.
 *
 * If `children` is not a function, it is rendered as-is inside `GroupPageContent`.
 *
 * @returns {JSX.Element} A component that fetches the group data and displays it,
 * or loading/error state.
 *
 * @example
 * <GroupPageContentLazy group={123}>
 *   {({ group, onChange, onBlur }) => (
 *     <input value={group.name} onChange={onChange} onBlur={onBlur} />
 *   )}
 * </GroupPageContentLazy>
 */
export const GroupPageContentLazy = ({ group, children }) => {
    const { error, loading, entity, fetch, dispatchResult } = useAsyncAction(GroupReadAsyncAction, {id: group.id})
    const [delayer] = useState(() => CreateDelayer())
  
    const handleChange = async (e) => {
      const value = e?.target?.value ?? e
      await delayer(() => fetch(value))
    }
  
    const handleBlur = async (e) => {
      const value = e?.target?.value ?? e
      await delayer(() => fetch(value))
    }
  
    return (
      <>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (
          <GroupPageContent group={entity} onChange={handleChange} onBlur={handleBlur}>
            {typeof children === "function"
              ? children({ group: entity, onChange: handleChange, onBlur: handleBlur })
              : children}
          </GroupPageContent>
        )}
        {/* <hr />
        {JSON.stringify(group)}
        <hr />
        {JSON.stringify(dispatchResult)}
        <hr />
        {JSON.stringify(entity)}
        <hr /> */}
      </>
    )
}