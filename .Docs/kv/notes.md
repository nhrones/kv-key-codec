float canonicalization:
Require the decimal precision to be 9 for float and 17 for double 
(this is the definition of Pmin in the IEEE754-2008 standard, Section 5.12.2)

```js
function DoubleToIEEE(f) {
    var buf = new ArrayBuffer(8);
    (new Float64Array(buf))[0] = f;
    return [ (new Uint32Array(buf))[0] ,(new Uint32Array(buf))[1] ];
}
```

The following solution allows to represent x = round-to-double(1.1) as
"1.1" instead of "1.1000000000000001" (which has 17 digits and its
distance to x is smaller than |x - 1.1|). However it is more difficult
to implement. 

  - JavaScript uses double (IEEE 754) to represent all numbers
  - double consists of [sign, exponent(11bit), mantissa(52bit)] fields. 
  Value of number is computed using formula: 
  (-1)^sign * (1.mantissa) * 2^(exponent - 1023). 
  (1.mantissa - means that we take bits of mantissa add 1 at the beginning and tread that value as number,    
  e.g. if mantissa = 101 we get number 1.101 (bin) = 1 + 1/2 + 1/8 (dec) = 1.625 (dec).
  - We can get value of sign bit testing if number is greater than zero. There is a small issue with 0 here because double have +0 and -0 values, but we can distinguish these two by computing 1/value and checking if value is +Inf or -Inf.
  - Since 1 <= 1.mantissa < 2 we can get value of exponent using Math.log2 e.g. Math.floor(Math.log2(666.0)) = 9 so exponent is exponent - 1023 = 9 and exponent = 1032, which in binary is (1032).toString(2) = "10000001000"
  - After we get exponent we can scale number to zero exponent without changing mantissa, value = value / Math.pow(2, Math.floor(Math.log2(666.0))), now value represents number (-1)^sign * (1.mantissa). If we ignore sign and multiply that by 2^52 we get integer value that have same bits as 1.mantissa: ((666 / Math.pow(2, Math.floor(Math.log2(666)))) * Math.pow(2, 52)).toString(2) = "10100110100000000000000000000000000000000000000000000" (we must ignore leading 1).
  - After some string concat's you will get what you want
