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
 * <LeftColumn>
 *   <p>Some content here</p>
 * </LeftColumn>
 * 
 * @returns {JSX.Element} A React-Bootstrap column (`Col`) with the specified children.
 */
export const LeftColumn = ({children, ...props}) => {
    return (
        <Col xl={3} md={12} {...props}>{children}</Col> 
    )
}