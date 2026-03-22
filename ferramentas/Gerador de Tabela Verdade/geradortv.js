
/****************************************************
Site criado por Chrysller Candido 03.03.2012

Email: chrysllercs@gmail.com

****************************************************/

var truth = 'V';
var falsity = 'F';
var negation = '&#x223c;';
var conjunction = '&';
var disjunction = '&#x2228;';
var disjunctionx = '&#x0078;';
var conditional = '&#62;';
var biconditional = '&#x2194';


var binConn = new Array("&", "v", ">", "=", "|", "x");
var unConn = new Array("~");
var propVar = new Array("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");


function clear() {
    document.getElementById('in').value = '';
    document.getElementsByName('style')[0].checked = true;

}

function construct() {
    var formula = getNoSpace(document.getElementById('in').value);

    if (checkSyntax(formula) == 0) {
        alert("Não é uma fórmula bem formada.");
        return;
    }

    var truthTable = new Array();
    truthTable = makeTable(formula);

    writeOut(truthTable, formula);
}


function getNoSpace(x) {
    var nospace = '';

    for (var i = 0; i < x.length; i++) {
        if (isParen(x.charAt(i)) || isPropVar(x.charAt(i)) || isBinConn(x.charAt(i)) || isUnConn(x.charAt(i))) {
            nospace = nospace + x.charAt(i);
        }
        else {
            continue;
        }
    }
    return nospace;
}

/**************************/

function isParen(y) {
    if (y == '(' || y == ')') {
        return true;
    }
    else {
        return false;
    }
}


/**************************/
function isBinConn(y) {
    for (var i = 0; i < binConn.length; i++) {
        if (y == binConn[i]) {
            return true;
        }
    }
    return false;
}


/**************************/
function isUnConn(y) {
    for (var i = 0; i < unConn.length; i++) {
        if (y == unConn[i]) {
            return true;
        }
    }
    return false;
}


/**************************/
function isPropVar(y) {
    for (var i = 0; i < propVar.length; i++) {
        if (y == propVar[i]) {
            return true;
        }
    }
    return false;
}


/**************************/
function getLp(y) {
    var l = 0;
    for (var i = 0; i < y.length; i++) {
        if (y.charAt(i) == '(') {
            l++;
        }
    }
    return l;
}

/**************************/
function getRp(y) {
    var l = 0;
    for (var i = 0; i < y.length; i++) {
        if (y.charAt(i) == ')') {
            l++;
        }
    }
    return l;
}

/**************************/
function checkSyntax(x) {

    if (x.length == 1) {
        if (isPropVar(x.charAt(0))) {
            return 1;
        }
        else {
            return 0;
        }
    }

    if (x.length > 1 && x.charAt(0) == '~') {
        if (checkSyntax(x.substring(1)) == 1) {
            return 1;
        }
        else {
            return 0;
        }
    }

    if (x.length > 1 && x.charAt(0) != '~') {
        if (isWffBinForm(x) == 1) {
            return 1;
        }
        else {
            return 0;
        }
    }
}

// returns 1 if the passed string is a well formed binary connective formula (i.e. well formed with a binary connective as its main connective), 0 otherwise
function isWffBinForm(s) {
    var syms = [];
    var hasConn = 0;
    var lstr = "";
    var rstr = "";

    for (i = 0; i < s.length; i++) {
        syms[i] = 0;
    }

    if (s.charAt(0) != '(' || s.charAt(s.length - 1) != ')') {
        return 0;
    }

    for (i = 1; i < (s.length - 1); i++) {
        if (isSym(i, s) == 1) {
            syms[i] = s.charAt(i);
        }
    }

    for (i = 0; i < s.length; i++) {
        if (isBinConn(syms[i])) {
            hasConn++;
        }
    }

    if (hasConn == 0 || hasConn > 1) {
        return 0;
    }

    for (var i = 0; i < s.length; i++) {
        if (isBinConn(syms[i])) {
            lstr = s.substring(1, i);
            rstr = s.substring(i + 1, s.length - 1);
            if (checkSyntax(lstr) == 1 && checkSyntax(rstr) == 1) {
                return 1;
            }
        }
    }
    return 0;
}

/**************************/
function isSym(ind, str) {
    var lstr = str.substring(0, ind);
    var rstr = str.substring(ind + 1, str.length);
    var result = false;

    if ((getLp(lstr) - getRp(lstr)) == 1 && (getRp(rstr) - getLp(rstr)) == 1) {
        result = true;
    }
    return result;
}


function makeTable(str) {
    var senNum = getSenNum(str);
    var colNum = str.length + senNum;
    var rowNum = Math.pow(2, senNum) + 1;
    var subString = "";

    var table = new Array(colNum);

    for (i = 0; i < colNum; i++) {
        table[i] = new Array(rowNum);
    }

    var counter = 0;
    for (i = (senNum - 1); i >= 0; i--) {
        var alt = Math.pow(2, counter);
        counter++;
        var l = 0;
        var value = true;
        for (j = 1; j < table[i].length; j++) {
            table[i][j] = value;
            l++;
            if (l == alt) {
                value = !value;
                l = 0;
            }
        }
    }

    var l = 0;
    for (i = senNum; i < table.length; i++) {
        table[i][0] = str.charAt(l);
        l++;
    }

    var atSenArray = new Array(senNum);
    l = 0;

    for (i = 0; i < str.length; i++) {
        var isIn = false;
        for (j = 0; j < senNum; j++) {
            if (str.charAt(i) == atSenArray[j]) {
                isIn = true;
            }
        }
        if (isIn == false && isPropVar(str.charAt(i))) {
            atSenArray[l] = str.charAt(i);
            l++;
        }
    }

    var ordAtSenArray = new Array(senNum);

    l = 0;
    for (i = 0; i < propVar.length; i++) {
        for (j = 0; j < senNum; j++) {
            if (atSenArray[j] == propVar[i]) {
                ordAtSenArray[l] = atSenArray[j];
                l++
            }
        }
    }

    for (i = 0; i < senNum; i++) {
        table[i][0] = ordAtSenArray[i];
    }

    //ow construir uma matriz (árvore),

    var ele = 0;

    for (var i = 0; i < str.length; i++) {
        if (isBinConn(str.charAt(i)) || isUnConn(str.charAt(i))) {
            ele++;
        }
    }

    ele = ele + senNum;

    var tree = new Array(ele);

    for (var i = 0; i < tree.length; i++) {
        tree[i] = new Array(3);
    }

    for (var i = 0; i < senNum; i++) {
        tree[i][0] = ordAtSenArray[i];
    }

    l = senNum;
    for (var i = 0; i < str.length; i++) {
        if (isBinConn(str.charAt(i)) || isUnConn(str.charAt(i))) {
            subString = getSubStr(str, i);
            tree[l][0] = subString;
            tree[l][1] = i;
            l++;
        }
    }



    var f, g, h;

    for (f = 0; f < (tree.length - 1); f++) {
        for (g = f + 1; g < tree.length; g++) {
            if (tree[f][0].length > tree[g][0].length) {
                k = tree[f];
                tree[f] = tree[g];
                tree[g] = k;
            }
        }
    }




    for (var i = 1; i < rowNum; i++) {


        for (var j = 0; j < senNum; j++) {
            tree[j][2] = table[j][i];
        }


        for (var j = senNum; j < tree.length; j++) {
            tree[j][2] = getTv(tree, tree[j][0]);
        }


        if (document.getElementsByName('style')[0].checked) {
            for (var j = 0; j < str.length; j++) {
                if (isPropVar(str.charAt(j))) {
                    for (var k = 0; k < senNum; k++) {
                        if (str.charAt(j) == tree[k][0]) {
                            table[j + senNum][i] = tree[k][2];
                        }
                    }
                }
            }

            for (var j = senNum; j < tree.length; j++) {
                if (tree[j][1] >= 0) {
                    l = tree[j][1] + senNum;
                    table[l][i] = tree[j][2];
                }
            }
        }


        if (document.getElementsByName('style')[1].checked) {
            table[(tree[tree.length - 1][1]) + senNum][i] = tree[tree.length - 1][2]
        }

        for (var j = 0; j < tree.length; j++) {
            tree[j][2] = undefined;
        }
    }
    return table;
}



function getSubStr(s, x) {
    var result = "";

    if (isUnConn(s.charAt(x))) {
        result = s.charAt(x) + getRhs(s, x);
        return result;
    }
    if (isBinConn(s.charAt(x))) {
        result = '(' + getLhs(s, x) + s.charAt(x) + getRhs(s, x) + ')';
        return result;
    }

}

function getTv(arr, st) {
    var tv = false;
    var rhs = "";
    var lhs = "";

    for (var a = 0; a < arr.length; a++) {
        if (st == arr[a][0] && isBoolean(arr[a][2])) {
            tv = arr[a][2];
            return tv;
        }
    }

    if (st.charAt(0) == '~') {
        tv = !getTv(arr, st.substring(1));
        return tv;
    }

    if (st.charAt(0) != '~') {
        var index = 0;
        var mainConn = "";

        for (var a = 0; a < st.length; a++) {
            if (isBinConn(st.charAt(a)) && isSym(a, st)) {
                index = a;
                mainConn = st.charAt(a);
            }
        }

        lhs = st.substring(1, index);
        rhs = st.substring(index + 1, st.length - 1);

        if (mainConn == 'v') {
            if (getTv(arr, lhs) == true || getTv(arr, rhs) == true) {
                tv = true;
                return tv;
            }
            else {
                tv = false;
                return tv;
            }
        }

        if (mainConn == 'x') {
            if ((getTv(arr, lhs) == true && getTv(arr, rhs) == false) || (getTv(arr, lhs) == false && getTv(arr, rhs) == true)) {
                tv = true;
                return tv;
            }
            else {
                tv = false;
                return tv;
            }
        }

        if (mainConn == '&') {
            if (getTv(arr, lhs) == true && getTv(arr, rhs) == true) {
                tv = true;
                return tv;
            }
            else {
                tv = false;
                return tv;
            }
        }

        if (mainConn == '>') {
            if (getTv(arr, lhs) == true && getTv(arr, rhs) == false) {
                tv = false;
                return tv;
            }
            else {
                tv = true;
                return tv;
            }
        }

        if (mainConn == '=') {
            if ((getTv(arr, lhs) == true && getTv(arr, rhs) == true) || (getTv(arr, lhs) == false && getTv(arr, rhs) == false)) {
                tv = true;
                return tv;
            }
            else {
                tv = false;
                return tv;
            }
        }

        if (mainConn == '|') {
            if (getTv(arr, lhs) == true && getTv(arr, rhs) == true) {
                tv = false;
                return tv;
            }
            else {
                tv = true;
                return tv;
            }
        }
    }
}


/**************************/
function getRhs(s, x) {
    var out = "";
    for (var a = 1; a < s.length; a++) {
        out = out + s.charAt(x + a);
        if (checkSyntax(out) == 1) {
            return out;
        }
    }
}

/**************************/
function getLhs(s, x) {
    var out = "";
    var out2 = "";
    for (var a = 1; a < s.length; a++) {
        out = s.charAt(x - a) + out;
        out2 = s.charAt(x - (a + 1)) + out;
        if (checkSyntax(out) == 1 && checkSyntax(out2) != 1) {
            return out;
        }
    }
}

/**************************/
function isBoolean(x) {
    if (x == true || x == false) {
        return true;
    }
    return false;
}


/**************************/
function getSenNum(x) {
    var l = 0;
    var k = 0;
    for (var i = 0; i < propVar.length; i++) {
        for (j = 0; j < x.length; j++) {
            if (x.charAt(j) == propVar[i]) {
                k++;
            }
        }
        if (k > 0) {
            l++;
        }
        k = 0;
    }
    return l;
}

/**************************/

function writeOut(arr, str) {
    var outString = "";
    var rowNumber = arr[0].length;
    var colNumber = arr.length;
    var mainConnIndex = 0;
    var senNum = getSenNum(str);

    if (str.charAt(0) == '~' || str.length == 1) {
        mainConnIndex = senNum;
    }
    else {
        for (var a = 0; a < str.length; a++) {
            if (isBinConn(str.charAt(a)) && isSym(a, str)) {
                mainConnIndex = a + senNum;
            }
        }
    }

    for (var i = 0; i < rowNumber; i++) {
        outString = outString + '<tr>';
        for (var j = 0; j < colNumber; j++) {
            if (i == 0) {
                if (j == (senNum - 1)) {
                    outString = outString + '<th style="border-right:1px solid black;">' + getValue(arr[j][i]) + '<\/th><th>&nbsp;<\/th>';
                }
                if (j != (senNum - 1)) {
                    outString = outString + '<th>' + getValue(arr[j][i]) + '<\/th>';
                }
            }
            else {
                if (j == (senNum - 1)) {
                    outString = outString + '<td style="border-right:1px solid black;">' + getValue(arr[j][i]) + '<\/td><td>&nbsp;<\/td>';
                }
                if (j == mainConnIndex) {
                    outString = outString + '<td style=\'color: red;\'>' + getValue(arr[j][i]) + '<\/td>';
                }
                if (j != mainConnIndex && j != (senNum - 1)) {
                    outString = outString + '<td>' + getValue(arr[j][i]) + '<\/td>';
                }
            }
        }
        outString = outString + '<\/tr>';
    }

    outString = '<table class=\'truth\'>' + outString + '<\/table>';
    document.getElementById('truthtable').innerHTML = outString;
}

function getValue(arg) {

    if (isPropVar(arg) || isParen(arg)) {
        return arg;
    }

    if (isUnConn(arg) || isBinConn(arg)) {
        return getUnicode(arg);
    }

    if (arg == true) {
        return truth;
    }
    if (arg == false) {
        return falsity;
    }
    if (arg == undefined) {
        return " ";
    }
}

function getUnicode(arg) {

    if (arg == '~') {
        return negation;
    }
    if (arg == '&') {
        return conjunction;
    }
    if (arg == 'v') {
        return disjunction;
    }
    if (arg == 'x') {
        return disjunctionx;
    }
    if (arg == '>') {
        return conditional;
    }
    if (arg == '=') {
        return biconditional;
    }
    if (arg == '|') {
        return sheffer;
    }
}
