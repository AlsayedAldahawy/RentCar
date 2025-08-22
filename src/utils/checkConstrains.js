// function companyCheck(attributes) {
//     for (const attr of attributes) {
//         // Check type if defined
//         if (attr.type) {
//             const type = typeof attr.value;
//             if (
//                 (attr.type === 'string' && type !== 'string') ||
//                 (attr.type === 'number' && type !== 'number') ||
//                 (attr.type === 'boolean' && type !== 'boolean')
//             ) {
//                 throw new Error(`Attribute "${attr.name || ''}" must be of type ${attr.type}`);
//             }
//         }

//         // Check valuesList if defined
//         if (attr.valuesList && !attr.valuesList.includes(attr.value)) {
//             throw new Error(`Attribute "${attr.name || ''}" value doesn't match its definition`);
//         }

//         // Check length if len is defined and value is a string
//         if (attr.len && typeof attr.value === 'string' && attr.value.length !== attr.len) {
//             throw new Error(`Attribute "${attr.name || ''}" must be exactly ${attr.len} characters long`);
//         }
//     }
// }
