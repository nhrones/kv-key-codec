
export function isKeyValid(keyVal) {

   if (keyVal[0] === '[') {
      keyVal = removeBrackets(keyVal)
      console.log('keyval ', keyVal)
   }
   const strParts = keyVal.split(",")
   console.log('strParts ', strParts)
}

function removeBrackets(str) {
     return str.substring(1, str.length -1)
}

function isNumber(str) {
   str = "" + str // we only process strings!
   return !isNaN(str) && !isNaN(parseFloat(str))
 }