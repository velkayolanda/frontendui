import Col from "react-bootstrap/Col"

/**
 * A functional component representing a left column layout.
 * 
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the column.
 * 
 * @example
 * // Example usage of LeftColumn
 * import { LeftColumn } from './LeftColumn';
 * 
 * <MiddleColumn>
 *   <p>Some content here</p>
 * </MiddleColumn>
 * 
 * @returns {JSX.Element} A React-Bootstrap column (`Col`) with the specified children.
 */
export const MiddleColumn = ({children, ...props}) => {
    return (
        <Col xl={9} md={12} {...props}>{children}</Col> 
    )
}