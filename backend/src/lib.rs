#![feature(libc)]

extern crate libc;
extern crate mio;

#[no_mangle]
pub extern "C" fn simple() -> i32 {
    1234
}

pub extern fn server() -> bool {

    true
}

#[test]
fn it_works() {
}
