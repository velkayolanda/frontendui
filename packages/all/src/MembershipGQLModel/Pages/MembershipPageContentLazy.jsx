import React, { useState } from "react"

import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { MembershipReadAsyncAction } from "../Queries"
import { MembershipPageContent } from "./MembershipPageContent"

/**
 * A lazy-loading component for displaying content of a membership entity.
 *
 * This component fetches membership data using `MembershipReadAsyncAction`, and passes the result
 * to `MembershipPageContent`. It provides change handlers (`onChange`, `onBlur`) and the `membership` entity
 * to its children via a render function.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string|number} props.membership - The membership ID to load.
 * @param {(params: { membership: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function (function-as-children) that receives:
 *   - `membership` — the fetched membership entity,
 *   - `onChange` — function to re-fetch when value changes,
 *   - `onBlur` — function to re-fetch when value is blurred.
 *
 * If `children` is not a function, it is rendered as-is inside `MembershipPageContent`.
 *
 * @returns {JSX.Element} A component that fetches the membership data and displays it,
 * or loading/error state.
 *
 * @example
 * <MembershipPageContentLazy membership={123}>
 *   {({ membership, onChange, onBlur }) => (
 *     <input value={membership.name} onChange={onChange} onBlur={onBlur} />
 *   )}
 * </MembershipPageContentLazy>
 */
export const MembershipPageContentLazy = ({ membership, children }) => {
    const { error, loading, entity, fetch } = useAsyncAction(MembershipReadAsyncAction, membership)
    const [delayer] = useState(() => CreateDelayer())
  
    const handleChange = async (e) => {
      const value = e?.target?.value && membership
      await delayer(() => fetch(value))
    }
  
    const handleBlur = async (e) => {
      const value = e?.target?.value && membership
      await delayer(() => fetch(value))
    }
  
    return (
      <>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (
          <MembershipPageContent membership={entity} onChange={handleChange} onBlur={handleBlur}>
            {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, {
                    ...child.props,
                    membership: entity,
                    onChange: handleChange,
                    onBlur: handleBlur
                  })
                : child
            )}
          </MembershipPageContent>
        )}
      </>
    )
}