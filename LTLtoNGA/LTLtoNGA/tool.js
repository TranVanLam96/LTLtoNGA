var inspect = require('util').inspect
module.exports.getNegative = (str) => {
    return '-' + str
}


module.exports.checkInclude = (array1, array2) => {
    let returnArr = [];
    for (let i = 0; i < array2.length; i++) {
        if (!array1.includes(module.exports.getNegative(array2[i]))) {
            returnArr.push(array2[i])
        }
    }
    return returnArr;
}

module.exports.checkIncludeArray = (array1, array2) => {
    for (let elemArr2 of array2) {
        let check = true;
        for (let elemArr1 of array1) {
            if (!elemArr2.includes(elemArr1)) {
                check = false;
                continue;
            }
        }
        if (check) return true;
    }
    return false;
}

var checkDuplicate = (array) => {
    let arr = [];
    for (let i = 0; i < array.length; i++) {
        let checkDup = true;
        for (let j = i + 1; j < array.length; j++) {
            if (equivalentArray(array[i], array[j])) {
                checkDup = false;
                continue;
            }
        }
        if (checkDup) {
            arr.push(array[i]);
        }
    }
    return arr;
}

var equivalentArray = (array1, array2) => {
    if (array1.length !== array2.length) {
        return false
    }
    for (let elem of array1) {
        if (!array2.includes(elem + '')) {
            return false
        }
    }
    return true;
}

module.exports.convertToXmlObject = (initialObject) => {
    initialObject.Q = checkDuplicate(initialObject.Q);
    initialObject.Q0 = checkDuplicate(initialObject.Q0);
    initialObject.F = checkDuplicate(initialObject.F);
    let generateId = 0;
    let returnObject = {
        Q: [],
        Q0: [],
        a2AP: '',
        transition: [],
        F: []
    };
    for (let i = 0; i < initialObject.Q.length; i++) {
        let tempObj = {
            '$': {
                id: generateId,
                name: initialObject.Q[i].join(',')
            }
        }
        returnObject.Q.push(tempObj);
        generateId++;
    }

    for (let i = 0; i < initialObject.F.length; i++) {
        for (let j = 0; j < initialObject.Q.length; j++) {
            if (equivalentArray(initialObject.F[i], initialObject.Q[j])) {
                returnObject.F.push(returnObject.Q[j])
            }
        }
    }

    for (let i = 0; i < initialObject.Q0.length; i++) {
        for (let j = 0; j < initialObject.Q.length; j++) {
            if (equivalentArray(initialObject.Q0[i], initialObject.Q[j])) {
                returnObject.Q0.push(returnObject.Q[j])
            }
        }
    }
    for (let state of returnObject.Q) {
        for (let fstate of returnObject.F) {
            if (state['$'].id + '' === fstate['$'].id + '') {
                Object.assign(state, { final: '' })
            }
        }
    }

    for (let state of returnObject.Q) {
        for (let istate of returnObject.Q0) {
            if (state['$'].id + '' === istate['$'].id + '') {
                Object.assign(state, { initial: '' })
            }
        }
    }
    for (let _transition of initialObject.transition) {
        for (let i = 0; i < initialObject.Q.length; i++) {
            if (equivalentArray(_transition.from, initialObject.Q[i])) {
                _transition.from = returnObject.Q[i]['$'].id + ''
                break;
            }
        }
    }

    for (let _transition of initialObject.transition) {
        for (let i = 0; i < initialObject.Q.length; i++) {
            if (equivalentArray(_transition.to, initialObject.Q[i])) {
                _transition.to = returnObject.Q[i]['$'].id + '';
                break;
            }
        }
    }
    returnObject.transition = initialObject.transition;
    returnObject.a2AP = initialObject.a2AP;
    return returnObject;
}