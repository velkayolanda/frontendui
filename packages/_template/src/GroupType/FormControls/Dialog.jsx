import Button from "react-bootstrap/Button"
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

/**
 * A customizable dialog component with a title, content, and action buttons.
 *
 * @param {Object} props - The properties for the Dialog component.
 * @param {React.ReactNode} props.children - The content to display inside the dialog.
 * @param {string} [props.title="Dialog"] - The title of the dialog.
 * @param {string} [props.oklabel="Ok"] - The label for the confirmation button.
 * @param {string} [props.cancellabel="Zrušit"] - The label for the cancel button.
 * @param {function} props.onOk - Callback for when the confirmation button is clicked.
 * @param {function} props.onCancel - Callback for when the cancel button or close button is clicked.
 *
 * @example
 * <Dialog
 *   title="Confirm Delete"
 *   oklabel="Delete"
 *   cancellabel="Cancel"
 *   onOk={handleConfirm}
 *   onCancel={handleCancel}
 * >
 *   Are you sure you want to delete this item?
 * </Dialog>
 *
 * @returns {JSX.Element} A styled modal dialog.
 */
export const Dialog = ({
    children,
    title = "Dialog",
    oklabel = "Ok",
    cancellabel = "Zrušit",
    onOk,
    onCancel,
}) => {
    const handleFinish = () => {
        if (onOk) onOk();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
    };

    return (
        <Modal 
            size="xl" 
            show={true} 
            onHide={handleCancel}
            backdrop="static"  // Prevent closing on outside click
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Row>
                    <Col>
                        <div className="d-flex justify-content-end">
                            <Button variant="outline-success" onClick={handleFinish}>
                              {oklabel}
                            </Button>
                            &nbsp;
                            <Button variant="outline-danger" onClick={handleCancel}>
                                {cancellabel}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Footer>
        </Modal>
    );
};

