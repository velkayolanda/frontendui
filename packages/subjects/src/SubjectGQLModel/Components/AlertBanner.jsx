/** @module Components */
/**
 * Jednoduchý znovupoužitelný alert banner.
 *
 * Pokud `message` není vyplněná, komponenta nic nevykreslí.
 *
 * @component
 * @param {Object} props - Vstupní vlastnosti komponenty.
 * @param {string} props.message - Text hlášky.
 * @param {"primary"|"secondary"|"success"|"danger"|"warning"|"info"|"light"|"dark"} [props.variant="warning"] - Bootstrap varianta alertu.
 * @param {string} [props.className=""] - Doplňkové CSS třídy.
 *
 * @returns {JSX.Element|null} Alert komponenta nebo `null`.
 */
export const AlertBanner = ({ message, variant = "warning", className = "" }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${variant} ${className}`.trim()} role="alert">
      {message}
    </div>
  );
};
