function whichChild(l) {
    var  i = 0;
    while((l = l.previousSibling) != null) ++i;
    return i;
}

function findChildWithClass(l, className) {
    var children = l.children;
    var child;
    for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.classList.contains(className)) {
            return child;
        }
    }
}

function followClassCrumbs(className, l) {
    l = l || document.body;
    var child = findChildWithClass(l, className);
    if (!child) {
        throw Error('Cannot find element with "kbdbl-focused" class');
    }

    var deeperChild;
    while (deeperChild = findChildWithClass(child, className)) {
        child = deeperChild;
    }
    return child;
}

function findParentWithClass(l, className) {
    var parentL = l.parentElement;
    if (parentL && parentL.classList && parentL.classList.contains(className)) {
        return parentL;
    }
    return findParentWithClass(parentL, className);
}

function hyphenToCamel(data) {
    return data.replace(/-[a-z]/g, function(string){ return string[1].toUpperCase(); })
}

function findLHorizontally(l, qryInc) {
    var className = 'kbdbl-x';
    var containerClassName = 'kbdbl-row';
    var parentL = l.parentElement;
    if (!parentL) {
        return parentL;
    }
    var dimDataAttr = hyphenToCamel(className);
    if (!l.dataset[dimDataAttr] || !parentL.classList.contains(containerClassName)) {
        return findLHorizontally(parentL, qryInc);
    }

    var curDim = l.dataset[dimDataAttr];
    var newDim = (parseInt(curDim) + parseInt(qryInc));
    var foundL = findChildWithClass(parentL, className + '-' + newDim);
    if (foundL) {
        return foundL;
    } else {
        return findLHorizontally(parentL, qryInc);
    }
}
// TODO replace in every cell need of kbdbl-y. Fetch it from closest parent row
function findLVertically(l, qryInc, auxClass) {
    var className = 'kbdbl-y';
    var containerClassName = 'kbdbl-container';
    var parentL = l.parentElement;
    if (!parentL) {
        return parentL;
    }
    var dimDataAttr = hyphenToCamel(className);
    if (!l.dataset[dimDataAttr] || !parentL.classList.contains(containerClassName)) {
        if (auxClass === true) {
            var auxClassName = 'kbdbl-x';
            var auxDimDataAttr = hyphenToCamel(auxClassName);
            if (l.dataset[auxDimDataAttr]) {
                auxClass = auxClassName + '-' + l.dataset[auxDimDataAttr];
            }
        }
        return findLVertically(parentL, qryInc, auxClass);
    }

    var curDim = l.dataset[dimDataAttr];
    var newDim = (parseInt(curDim) + parseInt(qryInc));
    var foundL = findChildWithClass(parentL, className + '-' + newDim);
    if (!foundL) {
        return findLVertically(parentL, qryInc, 'kbdbl-focused');
    }

    var diveForFocus = (foundL.dataset['diveForFocus'] === 'true');
    if (diveForFocus) {
        // TODO how to make this independent from kbdbl- namespace?
        // event does not work as we need to return foundL
        // unless dispatch a focusable:found event, that will be caught and focus() or data-on-focus-event will be executed
        foundL = followClassCrumbs('kbdbl-focused', foundL);
    } else if (auxClass && auxClass !== true) {
        foundL = findChildWithClass(foundL, auxClass);
    }
    return foundL;
}