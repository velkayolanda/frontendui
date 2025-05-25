const styles = {
    capsuleContainer: {
        position: "relative", // Allows positioning of the title
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "var(--bs-border-width) solid var(--bs-border-color)", // Border around the component
        
        borderRadius: "8px", // Rounded corners

        // borderBottom: "2px solid #6c757d", // pouze dolní linka
        // borderTop: "2px solid #6c757d",
        // borderLeft: "none",
        // borderRight: "none",
        // borderRadius: "0", // žádné zaoblení

        padding: "16px", // Padding inside the container
        margin: "16px 0", // Margin around the container
        color: "#6c757d",
        backgroundColor: "white",
        textAlign: "center",
        width: "100%",
        minWidth: "300px",
        // zIndex: 10
    },
    capsuleTitle: {
        position: "absolute", // Position the title on the border
        top: "-10px", // Move above the border
        // left: "50%", // Center horizontally
        // transform: "translateX(-50%)", // Adjust for horizontal centering
        left: "16px", // Center horizontally
        backgroundColor: "white", // Match background color to container
        padding: "0 8px", // Add some padding around the text
        textTransform: "uppercase",
        fontSize: "0.85rem",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        color: "#6c757d",
    },
    childrenWrapper: {
        width: "100%", // Ensure children fill the width of the container
        textAlign: "left", // Align child content to the left
    },
};

export const SimpleCardCapsule = ({ id, title, children, style, ...props }) => {
    return (
        <div id={{id}} style={{...styles.capsuleContainer, ...style}}>
            <span style={styles.capsuleTitle}>{title}</span>
            <div style={styles.childrenWrapper}>
                {children}
            </div>
        </div>
    );
};

// export const SimpleCardCapsule = ({ title, children }) => {
//     return (
//         <div >
//             <span >{title}</span>
//             <div >
//                 {children}
//             </div>
//         </div>
//     );
// };