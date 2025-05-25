/* eslint-disable react/prop-types */
import Card from "react-bootstrap/Card";
import {useEffect} from 'react'
import { SimpleCardCapsule } from "./SimpleCardCapsule";

/**
 * shared module.
 * @module shared/components
 */

/**
 * A reusable card component that encapsulates content with a title and children.
 *
 * This component is a wrapper around a `Card` element. It renders a title in the card header
 * and any additional content in the card body. The `title` is displayed prominently, while
 * the `children` prop allows for flexible content to be passed inside the card.
 *
 * @param {Object} props - The props for the CardCapsule component.
 * @param {string} [props.title=""] - The title displayed in the card's header.
 * @param {React.ReactNode} [props.children=null] - The content to display inside the card's body.
 *
 * @returns {JSX.Element} The rendered card component with a header and body.
 *
 * @example
 * // Usage example:
 * <CardCapsule title="My Card Title">
 *   <p>This is some content inside the card.</p>
 * </CardCapsule>
 */
export const CardCapsule_ = ({title="", children=null, id=null}) => {
    useEffect(() => {
        if (!id) return
        const hash = window?.location?.hash; // Get the hash from the URL
        // console.log("CardCapsule", hash, id, (hash !== `#${id}`))
        if (hash !== `#${id}`) return
        
        const scrollTo = () => {
            const elementId = hash.substring(1); // Remove the '#' to get the ID
            const targetElement = document.getElementById(elementId);

            if (targetElement) {
                // Scroll to the element if it exists
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
        const timeout = setTimeout(scrollTo, 100);

        return () => clearTimeout(timeout);
    }, [id]); // Run only once when the component mounts

    return (
        <Card id={id}>
            <Card.Header>
                <Card.Title>
                    {title}
                </Card.Title>
            </Card.Header>
            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    )
}
    
export const CardCapsule = SimpleCardCapsule