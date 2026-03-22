/**
 * Gerador de Tabela Verdade
 * Original: Chrysller Candido (03.03.2012)
 * TypeScript port: pure functions, no DOM dependencies
 */

export type TableStyle = 'completo' | 'condensado'

const truth = 'V'
const falsity = 'F'
const negation = '&#x223c;'
const conjunction = '&amp;'
const disjunction = '&#x2228;'
const disjunctionx = '&#x0078;'
const conditional = '&gt;'
const biconditional = '&#x2194;'

const binConn = ['&', 'v', '>', '=', '|', 'x']
const unConn = ['~']
const propVar = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                 'N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

function isParen(y: string): boolean {
  return y === '(' || y === ')'
}

function isBinConn(y: string): boolean {
  return binConn.includes(y)
}

function isUnConn(y: string): boolean {
  return unConn.includes(y)
}

function isPropVar(y: string): boolean {
  return propVar.includes(y)
}

function getLp(y: string): number {
  let l = 0
  for (let i = 0; i < y.length; i++) {
    if (y.charAt(i) === '(') l++
  }
  return l
}

function getRp(y: string): number {
  let l = 0
  for (let i = 0; i < y.length; i++) {
    if (y.charAt(i) === ')') l++
  }
  return l
}

function checkSyntax(x: string): 0 | 1 {
  if (x.length === 1) {
    return isPropVar(x.charAt(0)) ? 1 : 0
  }
  if (x.length > 1 && x.charAt(0) === '~') {
    return checkSyntax(x.substring(1)) === 1 ? 1 : 0
  }
  if (x.length > 1 && x.charAt(0) !== '~') {
    return isWffBinForm(x) === 1 ? 1 : 0
  }
  return 0
}

function isSym(ind: number, str: string): boolean {
  const lstr = str.substring(0, ind)
  const rstr = str.substring(ind + 1, str.length)
  return (getLp(lstr) - getRp(lstr)) === 1 && (getRp(rstr) - getLp(rstr)) === 1
}

function isWffBinForm(s: string): 0 | 1 {
  const syms: (string | 0)[] = new Array(s.length).fill(0)
  let hasConn = 0

  if (s.charAt(0) !== '(' || s.charAt(s.length - 1) !== ')') return 0

  for (let i = 1; i < s.length - 1; i++) {
    if (isSym(i, s)) syms[i] = s.charAt(i)
  }

  for (let i = 0; i < s.length; i++) {
    if (isBinConn(syms[i] as string)) hasConn++
  }

  if (hasConn === 0 || hasConn > 1) return 0

  for (let i = 0; i < s.length; i++) {
    if (isBinConn(syms[i] as string)) {
      const lstr = s.substring(1, i)
      const rstr = s.substring(i + 1, s.length - 1)
      if (checkSyntax(lstr) === 1 && checkSyntax(rstr) === 1) return 1
    }
  }
  return 0
}

function getSenNum(x: string): number {
  let l = 0
  for (let i = 0; i < propVar.length; i++) {
    let k = 0
    for (let j = 0; j < x.length; j++) {
      if (x.charAt(j) === propVar[i]) k++
    }
    if (k > 0) l++
  }
  return l
}

function getRhs(s: string, x: number): string {
  let out = ''
  for (let a = 1; a < s.length; a++) {
    out = out + s.charAt(x + a)
    if (checkSyntax(out) === 1) return out
  }
  return ''
}

function getLhs(s: string, x: number): string {
  let out = ''
  let out2 = ''
  for (let a = 1; a < s.length; a++) {
    out = s.charAt(x - a) + out
    out2 = s.charAt(x - (a + 1)) + out
    if (checkSyntax(out) === 1 && checkSyntax(out2) !== 1) return out
  }
  return ''
}

function getSubStr(s: string, x: number): string {
  if (isUnConn(s.charAt(x))) return s.charAt(x) + getRhs(s, x)
  if (isBinConn(s.charAt(x))) return '(' + getLhs(s, x) + s.charAt(x) + getRhs(s, x) + ')'
  return ''
}

type TreeRow = [string, number, boolean | undefined]

function getTv(arr: TreeRow[], st: string): boolean {
  for (let a = 0; a < arr.length; a++) {
    if (st === arr[a][0] && arr[a][2] !== undefined) {
      return arr[a][2]!
    }
  }

  if (st.charAt(0) === '~') return !getTv(arr, st.substring(1))

  let index = 0
  let mainConn = ''
  for (let a = 0; a < st.length; a++) {
    if (isBinConn(st.charAt(a)) && isSym(a, st)) {
      index = a
      mainConn = st.charAt(a)
    }
  }

  const lhs = st.substring(1, index)
  const rhs = st.substring(index + 1, st.length - 1)

  if (mainConn === 'v') return getTv(arr, lhs) || getTv(arr, rhs)
  if (mainConn === 'x') return getTv(arr, lhs) !== getTv(arr, rhs)
  if (mainConn === '&') return getTv(arr, lhs) && getTv(arr, rhs)
  if (mainConn === '>') return !getTv(arr, lhs) || getTv(arr, rhs)
  if (mainConn === '=') return getTv(arr, lhs) === getTv(arr, rhs)
  if (mainConn === '|') return !(getTv(arr, lhs) && getTv(arr, rhs))
  return false
}

type Cell = string | boolean | undefined

function makeTable(str: string, style: TableStyle): Cell[][] {
  const senNum = getSenNum(str)
  const colNum = str.length + senNum
  const rowNum = Math.pow(2, senNum) + 1

  const table: Cell[][] = Array.from({ length: colNum }, () => new Array(rowNum))

  // Fill variable truth-value columns
  let counter = 0
  for (let i = senNum - 1; i >= 0; i--) {
    const alt = Math.pow(2, counter++)
    let l = 0
    let value = true
    for (let j = 1; j < table[i].length; j++) {
      table[i][j] = value
      l++
      if (l === alt) { value = !value; l = 0 }
    }
  }

  // Set header row for formula characters
  for (let i = senNum, l = 0; i < table.length; i++, l++) {
    table[i][0] = str.charAt(l)
  }

  // Build ordered sentence array
  const atSenArray: string[] = []
  for (let i = 0; i < str.length; i++) {
    if (!atSenArray.includes(str.charAt(i)) && isPropVar(str.charAt(i))) {
      atSenArray.push(str.charAt(i))
    }
  }

  const ordAtSenArray: string[] = []
  for (let i = 0; i < propVar.length; i++) {
    for (let j = 0; j < senNum; j++) {
      if (atSenArray[j] === propVar[i]) ordAtSenArray.push(atSenArray[j])
    }
  }

  for (let i = 0; i < senNum; i++) table[i][0] = ordAtSenArray[i]

  // Build tree
  let ele = 0
  for (let i = 0; i < str.length; i++) {
    if (isBinConn(str.charAt(i)) || isUnConn(str.charAt(i))) ele++
  }
  ele += senNum

  const tree: TreeRow[] = Array.from({ length: ele }, () => ['', -1, undefined])

  for (let i = 0; i < senNum; i++) tree[i][0] = ordAtSenArray[i]

  let l = senNum
  for (let i = 0; i < str.length; i++) {
    if (isBinConn(str.charAt(i)) || isUnConn(str.charAt(i))) {
      tree[l][0] = getSubStr(str, i)
      tree[l][1] = i
      l++
    }
  }

  // Sort tree by substring length (ascending)
  tree.sort((a, b) => a[0].length - b[0].length)

  // Fill table rows
  for (let i = 1; i < rowNum; i++) {
    for (let j = 0; j < senNum; j++) tree[j][2] = table[j][i] as boolean

    for (let j = senNum; j < tree.length; j++) {
      tree[j][2] = getTv(tree, tree[j][0])
    }

    if (style === 'completo') {
      for (let j = 0; j < str.length; j++) {
        if (isPropVar(str.charAt(j))) {
          for (let k = 0; k < senNum; k++) {
            if (str.charAt(j) === tree[k][0]) table[j + senNum][i] = tree[k][2]
          }
        }
      }
      for (let j = senNum; j < tree.length; j++) {
        if (tree[j][1] >= 0) table[tree[j][1] + senNum][i] = tree[j][2]
      }
    }

    if (style === 'condensado') {
      table[(tree[tree.length - 1][1]) + senNum][i] = tree[tree.length - 1][2]
    }

    for (let j = 0; j < tree.length; j++) tree[j][2] = undefined
  }

  return table
}

function getNoSpace(x: string): string {
  let nospace = ''
  for (let i = 0; i < x.length; i++) {
    const c = x.charAt(i)
    if (isParen(c) || isPropVar(c) || isBinConn(c) || isUnConn(c)) nospace += c
  }
  return nospace
}

function getValue(arg: Cell): string {
  if (typeof arg === 'string' && (isPropVar(arg) || isParen(arg))) return arg
  if (typeof arg === 'string' && (isUnConn(arg) || isBinConn(arg))) return getUnicode(arg)
  if (arg === true) return truth
  if (arg === false) return falsity
  return ' '
}

function getUnicode(arg: string): string {
  switch (arg) {
    case '~': return negation
    case '&': return conjunction
    case 'v': return disjunction
    case 'x': return disjunctionx
    case '>': return conditional
    case '=': return biconditional
    default: return arg
  }
}

function writeOut(arr: Cell[][], str: string): string {
  const rowNumber = arr[0].length
  const colNumber = arr.length
  let mainConnIndex = 0
  const senNum = getSenNum(str)

  if (str.charAt(0) === '~' || str.length === 1) {
    mainConnIndex = senNum
  } else {
    for (let a = 0; a < str.length; a++) {
      if (isBinConn(str.charAt(a)) && isSym(a, str)) {
        mainConnIndex = a + senNum
      }
    }
  }

  let outString = ''
  for (let i = 0; i < rowNumber; i++) {
    outString += '<tr>'
    for (let j = 0; j < colNumber; j++) {
      if (i === 0) {
        if (j === senNum - 1) {
          outString += `<th style="border-right:1px solid black;">${getValue(arr[j][i])}</th><th>&nbsp;</th>`
        } else {
          outString += `<th>${getValue(arr[j][i])}</th>`
        }
      } else {
        if (j === senNum - 1) {
          outString += `<td style="border-right:1px solid black;">${getValue(arr[j][i])}</td><td>&nbsp;</td>`
        } else if (j === mainConnIndex) {
          outString += `<td style='color: red;'>${getValue(arr[j][i])}</td>`
        } else {
          outString += `<td>${getValue(arr[j][i])}</td>`
        }
      }
    }
    outString += '</tr>'
  }

  return `<table class='truth'>${outString}</table>`
}

/** Public API */
export interface GenerateResult {
  html: string
}

export function generateTruthTable(formula: string, style: TableStyle): GenerateResult | null {
  const clean = getNoSpace(formula)
  if (checkSyntax(clean) === 0) return null

  const table = makeTable(clean, style)
  const html = writeOut(table, clean)
  return { html }
}

export { checkSyntax, getNoSpace }
