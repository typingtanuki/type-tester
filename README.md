# type-tester
A small library to test for types in javascript.

Currently relies on arguments.caller.callee, so it does not play well with strict mode.
It might be improved by adding support for the reflection API on browsers which allows for it.

##Basic usage:
```javascript
function(/*number*/ aNumber, /*[optional] string*/ aString){
    TypeTester.check();
    
    //Function code
}
```

##Full guide:

### Simple type check
```javascript
function(/*<type>*/ varName){
  // ...
}
```
Is equivalent to a:
```javascript
if(typeof varName!=<type>){
  console.warn(...);
}
```

### Optional arguments
By default, passing null, undefined as an argument will raise a warning.
In order to allow for optional arguments, use the following markup:
```javascript
function(/*[optional] <type>*/ varName){
  // ...
}
```

### Argument count
Passing more arguments to a function than what the signature allows, will raise a warning.
Passing to few arguments will also trigger a warning, unless the extra arguments are marked as optional.
```javascript
function(/*<type>*/ var1, /*[optional] <type>*/ var2){
  // ...
}
```
This function will work when calling it as:
```javascript
f(1, 2);
```
```javascript
f(1); //2 is optional
```

A warning will be raised in the following cases:
```javascript
f(); //1 is not optional
```
```javascript
f(1, 2, 3); //The function only takes 2 arguments
```

### Virtual types
Some extra values are allowed for the <type> which are not actually returned by 'typeof'.

* 'any': Accept any type (no check)
* 'int': Only accept integer
* 'float': Accept both integers and floating points numbers
* 'array': Only accept arrays

## Planned features

* Support for '/* array[type] */ varName' notation
* Support for regex pattern matching as '/* /regex/ */ varName'
