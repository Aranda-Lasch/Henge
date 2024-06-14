let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
var fxhash = "oo" + Array(49).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('')
let b58dec 
let fxhashTrunc 
let regex 
let hashes 
let sfc32
class fxSeed{
  constructor(seed){
    if(seed){fxhash = seed}
    b58dec = str => [...str].reduce((p, c) => p * alphabet.length + alphabet.indexOf(c) | 0, 0)
    fxhashTrunc = fxhash.slice(2)
    regex = new RegExp(".{" + ((fxhashTrunc.length / 4) | 0) + "}", 'g')
    hashes = fxhashTrunc.match(regex).map(h => b58dec(h))
    sfc32 = (a, b, c, d) => {
      return () => {
        a |= 0; b |= 0; c |= 0; d |= 0
        var t = (a + b | 0) + d | 0
        d = d + 1 | 0
        a = b ^ b >>> 9
        b = c + (c << 3) | 0
        c = c << 21 | c >>> 11
        c = c + t | 0
        return (t >>> 0) / 4294967296
      }
    }
    return sfc32(...hashes)
  }
}
var fxrand = new fxSeed()
// var fxrand = new fxSeed("op4TnDBpEKLVCevqRdurfqcbQPND49kp58FFwkt4x7h36YwpVGw")
// true if preview mode active, false otherwise
// you can append preview=1 to the URL to simulate preview active
var isFxpreview = new URLSearchParams(window.location.search).get('preview') === "1"
// call this method to trigger the preview
function fxpreview() {
  console.log("fxhash: TRIGGER PREVIEW")
}