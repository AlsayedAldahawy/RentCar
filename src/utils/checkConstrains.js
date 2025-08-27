function companyCheck(attributes) {
    for (const attr of attributes) {
        const { name = '', value, type, len, valuesList } = attr;

        // Type check
        if (type && value != null) {
            const actualType = typeof value;
            if (
                (type === 'string' && actualType !== 'string') ||
                (type === 'number' && actualType !== 'number') ||
                (type === 'boolean' && actualType !== 'boolean')
            ) {
                throw new Error(`Attribute "${name}" must be of type ${type}`);
            }
        }

        // Allowed values check
        if (valuesList && !valuesList.includes(value)) {
            throw new Error(`Attribute "${name}" value "${value}" doesn't match its definition`);
        }

        // Max length check for strings
        if (len && typeof value === 'string' && value.length > len) {
            throw new Error(`Attribute "${name}" must not exceed ${len} characters`);
        }
    }
}

module.exports = companyCheck;
