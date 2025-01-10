mod tests {
   use num_bigint::BigInt;
   use std::cmp::Ordering;
 
   use crate::Key;
   use crate::KeyPart;
 
   use super::decode_key;
   use super::encode_key;
 
   fn roundtrip(key: Key) {
     let bytes = encode_key(&key).unwrap();
     let decoded = decode_key(&bytes).unwrap();
     assert_eq!(&key, &decoded);
     assert_eq!(format!("{:?}", key), format!("{:?}", decoded));
   }
 
   fn check_order(a: Key, b: Key, expected: Ordering) {
     let a_bytes = encode_key(&a).unwrap();
     let b_bytes = encode_key(&b).unwrap();
 
     assert_eq!(a.cmp(&b), expected);
     assert_eq!(a_bytes.cmp(&b_bytes), expected);
   }
 
   fn check_bijection(key: Key, serialized: &[u8]) {
     let bytes = encode_key(&key).unwrap();
     assert_eq!(&bytes[..], serialized);
     let decoded = decode_key(serialized).unwrap();
     assert_eq!(&key, &decoded);
   }
 
   #[test]
   fn simple_roundtrip() {
     roundtrip(Key(vec![
       KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00]),
       KeyPart::String("foo".to_string()),
       KeyPart::Float(-f64::NAN),
       KeyPart::Float(-f64::INFINITY),
       KeyPart::Float(-42.1),
       KeyPart::Float(-0.0),
       KeyPart::Float(0.0),
       KeyPart::Float(42.1),
       KeyPart::Float(f64::INFINITY),
       KeyPart::Float(f64::NAN),
       KeyPart::Int(BigInt::from(-10000)),
       KeyPart::Int(BigInt::from(-1)),
       KeyPart::Int(BigInt::from(0)),
       KeyPart::Int(BigInt::from(1)),
       KeyPart::Int(BigInt::from(10000)),
       KeyPart::False,
       KeyPart::True,
     ]));
   }
 
   #[test]
   #[rustfmt::skip]
   fn order_bytes() {
     check_order(
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Ordering::Equal,
     );
 
     check_order(
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x01])]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x01])]),
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Ordering::Greater,
     );
 
     check_order(
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00, 0x00])]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00, 0x00])]),
       Key(vec![KeyPart::Bytes(vec![0, 1, 2, 3, 0xff, 0x00, 0xff, 0x00])]),
       Ordering::Greater,
     );
   }
 
   #[test]
   #[rustfmt::skip]
   fn order_tags() {
     check_order(
       Key(vec![KeyPart::Bytes(vec![])]),
       Key(vec![KeyPart::String("".into())]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::String("".into())]),
       Key(vec![KeyPart::Int(BigInt::from(0))]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(0))]),
       Key(vec![KeyPart::Float(0.0)]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::Float(0.0)]),
       Key(vec![KeyPart::False]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::False]),
       Key(vec![KeyPart::True]),
       Ordering::Less,
     );
 
     check_order(
       Key(vec![KeyPart::True]),
       Key(vec![KeyPart::Bytes(vec![])]),
       Ordering::Greater,
     );
   }
 
   #[test]
   #[rustfmt::skip]
   fn order_floats() {
     check_order(
       Key(vec![KeyPart::Float(-f64::NAN)]),
       Key(vec![KeyPart::Float(-f64::INFINITY)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(-f64::INFINITY)]),
       Key(vec![KeyPart::Float(-10.0)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(-10.0)]),
       Key(vec![KeyPart::Float(-0.0)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(-0.0)]),
       Key(vec![KeyPart::Float(0.0)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(0.0)]),
       Key(vec![KeyPart::Float(10.0)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(10.0)]),
       Key(vec![KeyPart::Float(f64::INFINITY)]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Float(f64::INFINITY)]),
       Key(vec![KeyPart::Float(f64::NAN)]),
       Ordering::Less,
     );
   }
 
   #[test]
   #[rustfmt::skip]
   fn order_ints() {
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(-10000))]),
       Key(vec![KeyPart::Int(BigInt::from(-100))]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(-100))]),
       Key(vec![KeyPart::Int(BigInt::from(-1))]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(-1))]),
       Key(vec![KeyPart::Int(BigInt::from(0))]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(0))]),
       Key(vec![KeyPart::Int(BigInt::from(1))]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(1))]),
       Key(vec![KeyPart::Int(BigInt::from(100))]),
       Ordering::Less,
     );
     check_order(
       Key(vec![KeyPart::Int(BigInt::from(100))]),
       Key(vec![KeyPart::Int(BigInt::from(10000))]),
       Ordering::Less,
     );
   }
 
   #[test]
   #[rustfmt::skip]
   fn float_canonicalization() {
     let key1 = Key(vec![KeyPart::Float(f64::from_bits(0x7ff8000000000001))]);
     let key2 = Key(vec![KeyPart::Float(f64::from_bits(0x7ff8000000000002))]);
 
     assert_eq!(key1, key2);
     assert_eq!(encode_key(&key1).unwrap(), encode_key(&key2).unwrap());
   }
 
   #[test]
   #[rustfmt::skip]
   fn explicit_bijection() {
     // string
     check_bijection(
       Key(vec![KeyPart::String("hello".into())]),
       &[0x02, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00],
     );
 
     // zero byte escape
     check_bijection(
       Key(vec![KeyPart::Bytes(vec![0x01, 0x02, 0x00, 0x07, 0x08])]),
       &[0x01, 0x01, 0x02, 0x00, 0xff, 0x07, 0x08, 0x00],
     );
 
     // array
     check_bijection(
       Key(vec![
         KeyPart::String("hello".into()),
         KeyPart::Bytes(vec![0x01, 0x02, 0x00, 0x07, 0x08]),
       ]),
       &[
         0x02, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00, /* string */
         0x01, 0x01, 0x02, 0x00, 0xff, 0x07, 0x08, 0x00, /* bytes */
       ],
     );
   }
 }
 