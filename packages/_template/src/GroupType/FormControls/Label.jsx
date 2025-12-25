import { SimpleCardCapsule } from "../Components/CardCapsule"

/**
 * Komponenta pro jednoduché “označené” (labelované) zobrazení obsahu v kapsli.
 * Využívá {@link SimpleCardCapsule} jako vizuální obal a umožňuje vložit
 * do hlavičkové části (před `children`) volitelné nástroje/akce.
 *
 * Typické použití:
 * - panel s tlačítky (tools) + obsah (children),
 * - “sekce” formuláře s akcemi (např. Přidat, Obnovit, Uložit),
 * - obal pro vizuální sjednocení.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} [props.tools]
 *  Volitelné UI prvky zobrazené před hlavním obsahem (např. tlačítka, badge, filtr).
 * @param {React.ReactNode} [props.children]
 *  Hlavní obsah komponenty.
 * @param {Object<string, any>} [props.props]
 *  Další props jsou předány do {@link SimpleCardCapsule} (např. `id`, `title`, `header`,
 *  `style`, `className`, `data-*`).
 *
 * @returns {JSX.Element}
 *
 * @example
 * <Label
 *   title="Nastavení"
 *   tools={<button onClick={reset}>Reset</button>}
 * >
 *   <SettingsForm />
 * </Label>
 */
export const Label = ({tools, children, ...props}) => {
    return (
        <SimpleCardCapsule {...props}>
            {tools}
            {children}
        </SimpleCardCapsule>
    )
}