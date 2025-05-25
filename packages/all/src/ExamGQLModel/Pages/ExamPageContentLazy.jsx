import React, { useState } from "react"

import { CreateDelayer, ErrorHandler, LoadingSpinner } from "@hrbolek/uoisfrontend-shared"
import { useAsyncAction } from "@hrbolek/uoisfrontend-gql-shared"
import { ExamReadAsyncAction } from "../Queries"
import { ExamPageContent } from "./ExamPageContent"

/**
 * A lazy-loading component for displaying content of a exam entity.
 *
 * This component fetches exam data using `ExamReadAsyncAction`, and passes the result
 * to `ExamPageContent`. It provides change handlers (`onChange`, `onBlur`) and the `exam` entity
 * to its children via a render function.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string|number} props.exam - The exam ID to load.
 * @param {(params: { exam: Object, onChange: function, onBlur: function }) => React.ReactNode} [props.children] -
 *   Optional render function (function-as-children) that receives:
 *   - `exam` — the fetched exam entity,
 *   - `onChange` — function to re-fetch when value changes,
 *   - `onBlur` — function to re-fetch when value is blurred.
 *
 * If `children` is not a function, it is rendered as-is inside `ExamPageContent`.
 *
 * @returns {JSX.Element} A component that fetches the exam data and displays it,
 * or loading/error state.
 *
 * @example
 * <ExamPageContentLazy exam={123}>
 *   {({ exam, onChange, onBlur }) => (
 *     <input value={exam.name} onChange={onChange} onBlur={onBlur} />
 *   )}
 * </ExamPageContentLazy>
 */
export const ExamPageContentLazy = ({ exam, children }) => {
    const { error, loading, entity, fetch } = useAsyncAction(ExamReadAsyncAction, exam)
    const [delayer] = useState(() => CreateDelayer())
  
    const handleChange = async (e) => {
      const value = e?.target?.value && exam
      await delayer(() => fetch(value))
    }
  
    const handleBlur = async (e) => {
      const value = e?.target?.value && exam
      await delayer(() => fetch(value))
    }
  
    return (
      <>
        {loading && <LoadingSpinner />}
        {error && <ErrorHandler errors={error} />}
        {entity && (
          <ExamPageContent exam={entity} onChange={handleChange} onBlur={handleBlur}>
            {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, {
                    ...child.props,
                    exam: entity,
                    onChange: handleChange,
                    onBlur: handleBlur
                  })
                : child
            )}
          </ExamPageContent>
        )}
      </>
    )
}