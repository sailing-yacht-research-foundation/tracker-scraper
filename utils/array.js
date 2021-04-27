/**
 * Append array2 into array1.
 * This function should be used when array2 has large number of items.
 * In case array2 length is small we should use array1.push(...array2).
 * @param {Array} array1
 * @param {Array} array2
 */
function appendArray(array1, array2) {
    if (!array2 || !array2.length) {
        return;
    }
    array2.forEach((a) => {
        array1.push(a);
    });
}

exports.appendArray = appendArray;
