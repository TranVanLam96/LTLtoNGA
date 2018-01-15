var tool = require('./tool')
var generateCom = require('combinations-generator')
var inspect = require('util').inspect
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const { exec } = require('child_process');
var builder = new xml2js.Builder();



/*****INPUT*******/
var pUqUm = {
    pUq:{p:'p',q:'q'},
    m:'m'
}

var phi1_U_phi2 = 'pUqUm'
var X_phi = ''
var phi1 = Object.getOwnPropertyNames(pUqUm)[0];
var phi2 = Object.getOwnPropertyNames(pUqUm)[1];
var a2AP = ['p', 'q','m'];
/** ******************/



var generateCL = () => {
    let temp = [];
    let cl = (phi) => {
        for (let key in phi) {
            if (Object.getOwnPropertyNames(phi[key])[0] === '0') {
                temp.push(phi[key]);
                continue;
            } else {
                temp.push(key)
                cl(phi[key]);
            }
        }

    }
    cl(pUqUm);
    temp.unshift(phi1_U_phi2);
    if(X_phi !== ''){
        temp.push(X_phi)
    }
    let negativeTemp = [];
    temp.forEach((elem) => {
        negativeTemp.push(tool.getNegative(elem));
    })

    let arr = [];
    for (let i = 0; i <= temp.length; i++) {
        let iterator = generateCom(negativeTemp, i);
        for (let elemNeg of Array.from(iterator)) {
            let a = elemNeg.concat(tool.checkInclude(elemNeg, temp));
            arr.push(a);
        }
    }
    arr.push(temp);
    return arr;
}


var LTLtoNGA = () => {
    let cl = generateCL();
    let Q0 = cl.slice().filter((elem) => {
        return elem.includes(phi1_U_phi2 + '')
    })
    let Q = [];
    let F = [];
    let transition = [];
    let W = Q0.slice();
    while (W.length !== 0) {
        let alpha = W[W.length - 1];
        W.pop();
        Q.push(alpha);
        if (!alpha.includes(phi1_U_phi2) || alpha.includes(phi2)) {
            F.push(alpha);
        }
        for (let beta of cl) {
            if (conditionL2(phi1_U_phi2, alpha, beta) && conditionL1(phi1_U_phi2, alpha, beta)) {
                transition.push({
                    from: alpha,
                    to: beta,
                    read: getReadTransition(alpha)
                });
                if (!tool.checkIncludeArray(beta, Q)) {
                    W.push(beta);
                }
            }
        }
    }
    return {
        Q: Q,
        a2AP: a2AP,
        Q0: Q0,
        transition: transition,
        F: F
    }
}

var conditionL2 = (phi1_U_phi2, alpha, beta) => {
    let check = alpha.includes(phi2) || (alpha.includes(phi1) && beta.includes(phi1_U_phi2));
    if (alpha.includes(phi1_U_phi2)) {
        return check
    } else {
        if (!check) {
            return true
        } else {
            return false
        }
    }
}

var conditionL1 = (phi1_U_phi2, alpha, beta) => {
    if (alpha.includes(X_phi)) {
        return beta.includes(phi1_U_phi2)
    } else {
        return !beta.includes(phi1_U_phi2)
    }
}

var getReadTransition = (alpha) => {
    let arr = [];
    for (let elem of alpha) {
        if (elem.length === 1) {
            arr.push(elem)
        }
    }
    return arr.join(',');

}

var rs = LTLtoNGA();
rs = tool.convertToXmlObject(rs);
console.log(inspect(rs, true, 12))
var jsonXml_post = {
    structure: {
        type: 'fa',
        automaton: {
            state: rs.Q,
            transition: rs.transition
        }
    }
};

var xml = builder.buildObject(jsonXml_post);
fs.writeFile(path.resolve('./output/NGA.jff'), xml, function(err) {
    if (err) {
        return console.log(err);
    }
    console.log("NGA saved!");
});