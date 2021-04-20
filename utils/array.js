function appendArray(array1, array2) {
    if (!array2 || !array2.length) {
        return;
    }
    array2.forEach((a) => {
        array1.push(a);
    });
}

exports.appendArray = appendArray;
