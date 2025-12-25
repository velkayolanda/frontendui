import { Col } from "./Col";
import { Row } from "./Row";

export const Attribute = ({ item, label, attribute_name, attribute_value, children }) => {
    const raw = attribute_value != null ? attribute_value : item?.[attribute_name];

    const formatDateTime = (d) => {
        const date = d instanceof Date ? d : new Date(d);
        if (Number.isNaN(date.getTime())) return String(d); // fallback, když to není validní datum
        return new Intl.DateTimeFormat("cs-CZ", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const renderValue = (v) => {
        if (v == null) return ""; // nebo "—"
        if (typeof v === "boolean") return v ? "Ano" : "Ne";

        // DateTime: Date nebo ISO string (typicky obsahuje "T")
        if (v instanceof Date) return formatDateTime(v);
        if (typeof v === "string") {
            // zkus parse jen u něčeho, co vypadá jako ISO datetime
            if (v.includes("T")) return formatDateTime(v);
            return v;
        }

        if (typeof v === "object") return <pre className="mb-0">{JSON.stringify(v, null, 2)}</pre>;

        return String(v);
    };

    const value = children || renderValue(raw);

    return (
        <Row>
            {label ? (
                <>
                    <Col className="col-4">
                        <b>{label}</b>
                    </Col>
                    <Col className="col-8">{value}</Col>
                </>
            ) : (
                <Col className="col-12">{value}</Col>
            )}
        </Row>
    );
};
