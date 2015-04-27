#![feature(libc)]

extern crate libc;

#[no_mangle]
pub extern "C" fn simple() -> i32 {
    1234
}

#[test]
fn it_works() {
}
