export const Col = ({ children, className, ...props }) => {
    return (
        <div {...props} className={className ? className + " col" : "col"}>
            {children}
        </div>
    )
}

