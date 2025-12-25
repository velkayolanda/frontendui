
function formatType(typeRef) {
    if (!typeRef) return "";
    const kind = typeRef.kind;
    if (kind === "NON_NULL") {
        return formatType(typeRef.ofType) + "!";
    } else if (kind === "LIST") {
        return "[" + formatType(typeRef.ofType) + "]";
    } else {
        const typeName = typeRef.name || "";
        if (typeName) {
            const builtInScalars = new Set(["String", "Int", "Float", "Boolean", "ID"]);
            if (builtInScalars.has(typeName)) {
                return typeName;
            }
            const anchor = typeName.toLowerCase();
            return `[${typeName}](#${anchor})`;
        }
        return "";
    }
}

// Generate markdown for a field.
function markdownForField(field) {
    let s = `- **${field.name}**: ${formatType(field.type)}`;
    if (field.description) {
        s += ` – ${field.description}`;
    }
    if (field.args && field.args.length > 0) {
        s += "\n  - **Arguments:**";
        field.args.forEach(arg => {
            s += `\n    - **${arg.name}**: ${formatType(arg.type)}`;
            if (arg.description) {
                s += ` – ${arg.description}`;
            }
        });
    }
    return s;
}

function markdownForInputField(field) {
    let s = `- **${field.name}**: ${formatType(field.type)}`;
    if (field.description) {
        s += ` – ${field.description}`;
    }
    return s;
}

function markdownForObjectType(typeObj) {
    let s = `#### ${typeObj.name}\n\n`;
    if (typeObj.description) s += `${typeObj.description}\n\n`;
    if (typeObj.fields) {
        s += "Fields:\n";
        typeObj.fields.forEach(field => {
            s += markdownForField(field) + "\n";
        });
        s += "\n";
    }
    return s;
}

function markdownForInputObjectType(typeObj) {
    let s = `#### ${typeObj.name}\n\n`;
    if (typeObj.description) s += `${typeObj.description}\n\n`;
    if (typeObj.inputFields) {
        s += "Input Fields:\n";
        typeObj.inputFields.forEach(field => {
            s += markdownForInputField(field) + "\n";
        });
        s += "\n";
    }
    return s;
}

function markdownForScalarType(typeObj) {
    let s = `#### ${typeObj.name}\n\n`;
    if (typeObj.description) s += `${typeObj.description}\n\n`;
    return s;
}

// Unwrap nested types to get the named type.
function getNamedType(typeRef) {
    while (typeRef && typeRef.ofType) {
        typeRef = typeRef.ofType;
    }
    return typeRef;
}

function variableTypeString(typeRef) {
    if (!typeRef) return "";
    const kind = typeRef.kind;
    if (kind === "NON_NULL") {
        return variableTypeString(typeRef.ofType) + "!";
    } else if (kind === "LIST") {
        return "[" + variableTypeString(typeRef.ofType) + "]";
    } else {
        return typeRef.name || "";
    }
}

function generateVariableDefinitions(args, typesByName) {
    let varDefs = [];
    args.forEach(arg => {
        if (arg.name === "where") {
            varDefs.push(`$${arg.name}: ${variableTypeString(arg.type)}`);
        } else {
            let named = getNamedType(arg.type);
            if (named.kind === "INPUT_OBJECT") {
                let inputDef = typesByName[named.name];
                if (inputDef && inputDef.inputFields) {
                    inputDef.inputFields.forEach(field => {
                        varDefs.push(`$${arg.name}_${field.name}: ${variableTypeString(field.type)}`);
                    });
                } else {
                    varDefs.push(`$${arg.name}: ${variableTypeString(arg.type)}`);
                }
            } else {
                varDefs.push(`$${arg.name}: ${variableTypeString(arg.type)}`);
            }
        }
    });
    return varDefs;
}

function generateFieldArguments(args, typesByName) {
    let parts = [];
    args.forEach(arg => {
        if (arg.name === "where") {
            parts.push(`${arg.name}: $${arg.name}`);
        } else {
            let named = getNamedType(arg.type);
            if (named.kind === "INPUT_OBJECT") {
                let inputDef = typesByName[named.name];
                if (inputDef && inputDef.inputFields) {
                    let fields = [];
                    inputDef.inputFields.forEach(field => {
                        fields.push(`${field.name}: $${arg.name}_${field.name}`);
                    });
                    let objStr = "{" + fields.join(", ") + "}";
                    parts.push(`${arg.name}: ${objStr}`);
                } else {
                    parts.push(`${arg.name}: $${arg.name}`);
                }
            } else {
                parts.push(`${arg.name}: $${arg.name}`);
            }
        }
    });
    return parts.length > 0 ? "(" + parts.join(", ") + ")" : "";
}

function getFragmentName(typeName) {
    if (typeName.endsWith("GQLModelUpdateError")) {
        return "Error";
    } else if (typeName.endsWith("GQLModel")) {
        return typeName.slice(0, -"GQLModel".length);
    } else {
        return typeName;
    }
}

// Helper: recursively check if a type (or its nested ofType) is NON_NULL.
function isMandatory(typeRef) {
    if (!typeRef) return false;
    if (typeRef.kind === "NON_NULL") return true;
    return typeRef.ofType ? isMandatory(typeRef.ofType) : false;
}

// Returns true if any argument of the field is mandatory.
function hasMandatoryArgs(field) {
    return field.args && field.args.some(arg => isMandatory(arg.type));
}

// Updated fragment generator: for fields within a fragment,
// if the field's fragment would be the same as the current fragment, output just "field { id }".
function generateSelectionSetWithFragments(typeRef, typesByName, fragments, depth = 0, maxDepth = 2, indentLevel = 1, indentStr = "  ") {
    const base = getNamedType(typeRef);
    if (base.kind === "UNION") {
        let possibleTypes = base.possibleTypes;
        if (!possibleTypes) {
            const unionDef = typesByName[base.name];
            possibleTypes = unionDef ? (unionDef.possibleTypes || []) : [];
        }
        let unionLines = [];
        possibleTypes.forEach(possible => {
            const possibleName = possible.name;
            if (!fragments[possibleName]) {
                generateSelectionSetWithFragments(possible, typesByName, fragments, depth + 1, maxDepth, indentLevel + 1, indentStr);
            }
            const inlineFragment = `... on ${possibleName} { ...${getFragmentName(possibleName)} }`;
            unionLines.push(indentStr.repeat(indentLevel) + inlineFragment);
        });
        if (unionLines.length > 0) {
            const unionBlock = "{\n" + unionLines.join("\n") + "\n" + indentStr.repeat(indentLevel - 1) + "}";
            return unionBlock;
        } else {
            return "";
        }
    } else if (base.kind !== "OBJECT") {
        return "";
    }
    if (depth >= maxDepth) {
        return "{ __typename, id }";
    }
    const typeName = base.name;
    if (!fragments[typeName]) {
        const typeDef = typesByName[typeName];
        let fragmentBody = "";
        if (!typeDef || !typeDef.fields) {
            fragmentBody = "{ __typename, id }";
        } else {
            let fragmentLines = [];
            // Always include __typename first.
            fragmentLines.push(indentStr.repeat(indentLevel) + "__typename");
            typeDef.fields.forEach(f => {
                let line = indentStr.repeat(indentLevel);
                // Check if field has arguments and mandatory ones should be commented.
                if (f.args && hasMandatoryArgs(f)) {
                    line += "# " + f.name;
                } else {
                    const fNamed = getNamedType(f.type);
                    const fragName = getFragmentName(fNamed.name || "");
                    const currentFrag = getFragmentName(typeName);
                    // If the field's fragment would be the same as the current fragment, output field { id }.
                    if (["OBJECT", "UNION"].includes(fNamed.kind)) {
                        if (fragName === currentFrag) {
                            const fragmentLinesCpy = [...fragmentLines]

                            if (!fragmentLinesCpy.includes("__typename")) {
                                fragmentLinesCpy.unshift("__typename");
                            }
                            if (!fragmentLinesCpy.includes("id")) {
                                fragmentLinesCpy.push("id");
                            }
                            line += `${f.name} { ${fragmentLinesCpy.join("\n")} }`;
                        } else if (depth + 1 < maxDepth) {
                            const subSelection = generateSelectionSetWithFragments(f.type, typesByName, fragments, depth + 1, maxDepth, indentLevel + 1, indentStr);
                            line += `${f.name} ${subSelection}`;
                        } else {
                            line += `${f.name} { __typename id }`;
                        }
                    } else {
                        line += f.name;
                    }
                }
                fragmentLines.push(line);
            });
            fragmentBody = "{\n" + fragmentLines.join("\n") + "\n" + indentStr.repeat(indentLevel - 1) + "}";
        }
        const fragmentDef = `fragment ${getFragmentName(typeName)} on ${typeName} ${fragmentBody}`;
        fragments[typeName] = fragmentDef;
    }
    return "{\n" + indentStr + `...${getFragmentName(typeName)}\n}`;
}

// Generate Query/Mutation example usage.
// Top-level examples use the field name in the header.
function generateQueryExample(field, typesByName, operationType = "query", maxDepth = 2) {
    if (operationType === "mutation") {
        maxDepth = 3;
    }
    const args = field.args || [];
    const varDefs = generateVariableDefinitions(args, typesByName);
    let varDefsStr = "";
    if (varDefs.length > 0) {
        varDefsStr = "(" + varDefs.join(", ") + ")";
    }
    const fieldArgs = generateFieldArguments(args, typesByName);
    let fragments = {};
    let selectionSet = "";
    const base = getNamedType(field.type);
    if (["OBJECT", "UNION"].includes(base.kind)) {
        selectionSet = generateSelectionSetWithFragments(field.type, typesByName, fragments, 0, maxDepth, 1, "  ");
        if (!selectionSet.trim().startsWith("{")) {
            selectionSet = "{\n    " + selectionSet.trim() + "\n  }";
        }
    }
    if (operationType === "mutation" && !selectionSet) {
        selectionSet = "{ __typename, id }";
    }
    let lines = [];
    lines.push(`${operationType} ${field.name}${varDefsStr} {`);
    lines.push(`  ${field.name}${fieldArgs} ${selectionSet}`);
    lines.push("}");
    let query = lines.join("\n");
    if (Object.keys(fragments).length > 0) {
        const fragmentsText = Object.keys(fragments)
            .map(frag => fragments[frag])
            .join("\n\n");
        query += "\n\n" + fragmentsText;
    }
    return query;
}

function generateEntityQueryExample(typeName, typesByName, maxDepth = 2) {
    let fragments = {};
    let selectionSet = generateSelectionSetWithFragments(
        { kind: "OBJECT", name: typeName }, // obalíme typ jako field.type
        typesByName,
        fragments,
        0,
        maxDepth,
        1,
        "  "
    );

    if (!selectionSet.trim().startsWith("{")) {
        selectionSet = "{\n    " + selectionSet.trim() + "\n  }";
    }

    const lines = [];
    lines.push(`query($representations: [_Any!]!) {`);
    lines.push(`  _entities(representations: $representations) {`);
    lines.push(`    ... on ${typeName} ${selectionSet}`);
    lines.push(`  }`);
    lines.push(`}`);

    let query = lines.join("\n");

    if (Object.keys(fragments).length > 0) {
        const fragmentsText = Object.values(fragments).join("\n\n");
        query += "\n\n" + fragmentsText;
    }

    return query;
}

export function generateQuery(introspection, typeName) {
    const schemaData = introspection.__schema;
    // console.log("generateQuery.schemaData", schemaData)
    const types = schemaData.types;
    const typesByName = {};
    for (const t of types) {
        if (t.name.startsWith("__")) continue;
        typesByName[t.name] = t;
    }

    const queryTypeName = schemaData.queryType ? schemaData.queryType.name : null;
    const mutationTypeName = schemaData.mutationType ? schemaData.mutationType.name : null;
    const queryType = typesByName[queryTypeName]
    // najdeme pole, která vracejí požadovaný typ (a nejsou NON_NULL na vrcholu)
    const matchingField = queryType.fields.find(field => {
        const topLevelKind = field.type.kind;
        const namedType = getNamedType(field.type);
        const hasReturnType = topLevelKind !== "NON_NULL" && namedType.name === typeName;
        return hasReturnType && field.name.endsWith("ById")
    });

    if (matchingField) {
        const result = generateQueryExample(matchingField, typesByName)
        return result
    }
    return null
}