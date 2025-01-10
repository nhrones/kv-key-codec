## The double datatype [IEEE 754-2008]
3.3.5 double
[Definition:]  The double datatype is patterned after the IEEE double-precision 64-bit floating point datatype [IEEE 754-2008].  Each floating point datatype has a value space that is a subset of the rational numbers.  Floating point numbers are often used to approximate arbitrary real numbers.

Note: The only significant differences between float and double are the three defining constants 53 (vs 24), −1074 (vs −149), and 971 (vs 104).
3.3.5.1 Value Space
The ·value space· of double contains the non-zero numbers  m × 2e , where m is an integer whose absolute value is less than 253, and e is an integer between −1074 and 971, inclusive.  In addition to these values, the ·value space· of double also contains the following ·special values·:  positiveZero, negativeZero, positiveInfinity, negativeInfinity, and notANumber.

Note: As explained below, the ·lexical representation· of the double value notANumber is 'NaN'.  Accordingly, in English text we generally use 'NaN' to refer to that value.  Similarly, we use 'INF' and '−INF' to refer to the two values positiveInfinity and negativeInfinity, and '0' and '−0' to refer to positiveZero and negativeZero.
Equality and order for double are defined as follows:
Equality is identity, except that  0 = −0  (although they are not identical) and  NaN ≠ NaN  (although NaN is of course identical to itself).
0 and −0 are thus equivalent for purposes of enumerations, identity constraints, and minimum and maximum values.
For the basic values, the order relation on double is the order relation for rational numbers.  INF is greater than all other non-NaN values; −INF is less than all other non-NaN values.  NaN is ·incomparable· with any value in the ·value space· including itself.  0 and −0 are greater than all the negative numbers and less than all the positive numbers.
Note: Any value ·incomparable· with the value used for the four bounding facets (·minInclusive·, ·maxInclusive·, ·minExclusive·, and ·maxExclusive·) will be excluded from the resulting restricted ·value space·.  In particular, when NaN is used as a facet value for a bounding facet, since no double values are ·comparable· with it, the result is a ·value space· that is empty.  If any other value is used for a bounding facet, NaN will be excluded from the resulting restricted ·value space·; to add NaN back in requires union with the NaN-only space (which may be derived using the pattern 'NaN').
Note: The Schema 1.0 version of this datatype did not differentiate between 0 and −0 and NaN was equal to itself.  The changes were made to make the datatype more closely mirror [IEEE 754-2008].
3.3.5.2 Lexical Mapping
The ·lexical space· of double is the set of all decimal numerals with or without a decimal point, numerals in scientific (exponential) notation, and the ·literals· 'INF', '+INF', '-INF', and 'NaN'
Lexical Space
[5]   doubleRep ::= noDecimalPtNumeral | decimalPtNumeral | scientificNotationNumeral | numericalSpecialRep
The doubleRep production is equivalent to this regular expression (after whitespace is eliminated from the expression):
(\+|-)?([0-9]+(\.[0-9]*)?|\.[0-9]+)([Ee](\+|-)?[0-9]+)? |(\+|-)?INF|NaN

The double datatype is designed to implement for schema processing the double-precision floating-point datatype of [IEEE 754-2008].  That specification does not specify specific ·lexical representations·, but does prescribe requirements on any ·lexical mapping· used.  Any ·lexical mapping· that maps the ·lexical space· just described onto the ·value space·, is a function, satisfies the requirements of [IEEE 754-2008], and correctly handles the mapping of the literals 'INF', 'NaN', etc., to the ·special values·, satisfies the conformance requirements of this specification.

Since IEEE allows some variation in rounding of values, processors conforming to this specification may exhibit some variation in their ·lexical mappings·.

The ·lexical mapping· ·doubleLexicalMap· is provided as an example of a simple algorithm that yields a conformant mapping, and that provides the most accurate rounding possible—and is thus useful for insuring inter-implementation reproducibility and inter-implementation round-tripping.  The simple rounding algorithm used in ·doubleLexicalMap· may be more efficiently implemented using the algorithms of [Clinger, WD (1990)].

Note: The Schema 1.0 version of this datatype did not permit rounding algorithms whose results differed from [Clinger, WD (1990)].
The ·canonical mapping· ·doubleCanonicalMap· is provided as an example of a mapping that does not produce unnecessarily long ·canonical representations·.  Other algorithms which do not yield identical results for mapping from float values to character strings are permitted by [IEEE 754-2008].