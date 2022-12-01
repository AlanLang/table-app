/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/v4.5.9/LICENSE
 */

(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {
    /**
     * Brings an environment as close to ECMAScript 5 compliance
     * as is possible with the facilities of erstwhile engines.
     *
     * Annotated ES5: http://es5.github.com/ (specific links below)
     * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
     */

        // Shortcut to an often accessed properties, in order to avoid multiple
        // dereference that costs universally. This also holds a reference to known-good
        // functions.
    var $Array = Array;
    var ArrayPrototype = $Array.prototype;
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;
    var $Function = Function;
    var FunctionPrototype = $Function.prototype;
    var $String = String;
    var StringPrototype = $String.prototype;
    var $Number = Number;
    var NumberPrototype = $Number.prototype;
    var array_slice = ArrayPrototype.slice;
    var array_splice = ArrayPrototype.splice;
    var array_push = ArrayPrototype.push;
    var array_unshift = ArrayPrototype.unshift;
    var array_concat = ArrayPrototype.concat;
    var array_join = ArrayPrototype.join;
    var call = FunctionPrototype.call;
    var apply = FunctionPrototype.apply;
    var max = Math.max;
    var min = Math.min;

    // Having a toString local variable name breaks in Opera so use to_string.
    var to_string = ObjectPrototype.toString;

    /* global Symbol */
    /* eslint-disable one-var-declaration-per-line, no-redeclare, max-statements-per-line */
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    var isCallable; /* inlined from https://npmjs.com/is-callable */
    var fnToStr = Function.prototype.toString, constructorRegex = /^\s*class /,
        isES6ClassFn = function isES6ClassFn(value) {
            try {
                var fnStr = fnToStr.call(value);
                var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
                var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
                var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
                return constructorRegex.test(spaceStripped);
            } catch (e) {
                return false; /* not a function */
            }
        }, tryFunctionObject = function tryFunctionObject(value) {
            try {
                if (isES6ClassFn(value)) {
                    return false;
                }
                fnToStr.call(value);
                return true;
            } catch (e) {
                return false;
            }
        }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) {
            if (!value) {
                return false;
            }
            if (typeof value !== 'function' && typeof value !== 'object') {
                return false;
            }
            if (hasToStringTag) {
                return tryFunctionObject(value);
            }
            if (isES6ClassFn(value)) {
                return false;
            }
            var strClass = to_string.call(value);
            return strClass === fnClass || strClass === genClass;
        };

    var isRegex; /* inlined from https://npmjs.com/is-regex */
    var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) {
        try {
            regexExec.call(value);
            return true;
        } catch (e) {
            return false;
        }
    }, regexClass = '[object RegExp]';
    isRegex = function isRegex(value) {
        if (typeof value !== 'object') {
            return false;
        }
        return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass;
    };
    var isString; /* inlined from https://npmjs.com/is-string */
    var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) {
        try {
            strValue.call(value);
            return true;
        } catch (e) {
            return false;
        }
    }, stringClass = '[object String]';
    isString = function isString(value) {
        if (typeof value === 'string') {
            return true;
        }
        if (typeof value !== 'object') {
            return false;
        }
        return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass;
    };
    /* eslint-enable one-var-declaration-per-line, no-redeclare, max-statements-per-line */

    /* inlined from http://npmjs.com/define-properties */
    var supportsDescriptors = $Object.defineProperty && (function () {
        try {
            var obj = {};
            $Object.defineProperty(obj, 'x', {enumerable: false, value: obj});
            for (var _ in obj) { // jscs:ignore disallowUnusedVariables
                return false;
            }
            return obj.x === obj;
        } catch (e) { /* this is ES3 */
            return false;
        }
    }());
    var defineProperties = (function (has) {
        // Define configurable, writable, and non-enumerable props
        // if they don't exist.
        var defineProperty;
        if (supportsDescriptors) {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) {
                    return;
                }
                $Object.defineProperty(object, name, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: method
                });
            };
        } else {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) {
                    return;
                }
                object[name] = method;
            };
        }
        return function defineProperties(object, map, forceAssign) {
            for (var name in map) {
                if (has.call(map, name)) {
                    defineProperty(object, name, map[name], forceAssign);
                }
            }
        };
    }(ObjectPrototype.hasOwnProperty));

    //
    // Util
    // ======
    //

    /* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
    var isPrimitive = function isPrimitive(input) {
        var type = typeof input;
        return input === null || (type !== 'object' && type !== 'function');
    };

    var isActualNaN = $Number.isNaN || function isActualNaN(x) {
        return x !== x;
    };

    var ES = {
        // ES5 9.4
        // http://es5.github.com/#x9.4
        // http://jsperf.com/to-integer
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
        ToInteger: function ToInteger(num) {
            var n = +num;
            if (isActualNaN(n)) {
                n = 0;
            } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
            return n;
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
        ToPrimitive: function ToPrimitive(input) {
            var val, valueOf, toStr;
            if (isPrimitive(input)) {
                return input;
            }
            valueOf = input.valueOf;
            if (isCallable(valueOf)) {
                val = valueOf.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            toStr = input.toString;
            if (isCallable(toStr)) {
                val = toStr.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            throw new TypeError();
        },

        // ES5 9.9
        // http://es5.github.com/#x9.9
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
        ToObject: function (o) {
            if (o == null) { // this matches both null and undefined
                throw new TypeError("can't convert " + o + ' to object');
            }
            return $Object(o);
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
        ToUint32: function ToUint32(x) {
            return x >>> 0;
        }
    };

    //
    // Function
    // ========
    //

    // ES-5 15.3.4.5
    // http://es5.github.com/#x15.3.4.5

    var Empty = function Empty() {
    };

    defineProperties(FunctionPrototype, {
        bind: function bind(that) { // .length is 1
            // 1. Let Target be the this value.
            var target = this;
            // 2. If IsCallable(Target) is false, throw a TypeError exception.
            if (!isCallable(target)) {
                throw new TypeError('Function.prototype.bind called on incompatible ' + target);
            }
            // 3. Let A be a new (possibly empty) internal list of all of the
            //   argument values provided after thisArg (arg1, arg2 etc), in order.
            // XXX slicedArgs will stand in for "A" if used
            var args = array_slice.call(arguments, 1); // for normal call
            // 4. Let F be a new native ECMAScript object.
            // 11. Set the [[Prototype]] internal property of F to the standard
            //   built-in Function prototype object as specified in 15.3.3.1.
            // 12. Set the [[Call]] internal property of F as described in
            //   15.3.4.5.1.
            // 13. Set the [[Construct]] internal property of F as described in
            //   15.3.4.5.2.
            // 14. Set the [[HasInstance]] internal property of F as described in
            //   15.3.4.5.3.
            var bound;
            var binder = function () {

                if (this instanceof bound) {
                    // 15.3.4.5.2 [[Construct]]
                    // When the [[Construct]] internal method of a function object,
                    // F that was created using the bind function is called with a
                    // list of arguments ExtraArgs, the following steps are taken:
                    // 1. Let target be the value of F's [[TargetFunction]]
                    //   internal property.
                    // 2. If target has no [[Construct]] internal method, a
                    //   TypeError exception is thrown.
                    // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Construct]] internal
                    //   method of target providing args as the arguments.

                    var result = apply.call(
                        target,
                        this,
                        array_concat.call(args, array_slice.call(arguments))
                    );
                    if ($Object(result) === result) {
                        return result;
                    }
                    return this;

                } else {
                    // 15.3.4.5.1 [[Call]]
                    // When the [[Call]] internal method of a function object, F,
                    // which was created using the bind function is called with a
                    // this value and a list of arguments ExtraArgs, the following
                    // steps are taken:
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal
                    //   property.
                    // 3. Let target be the value of F's [[TargetFunction]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Call]] internal method
                    //   of target providing boundThis as the this value and
                    //   providing args as the arguments.

                    // equiv: target.call(this, ...boundArgs, ...args)
                    return apply.call(
                        target,
                        that,
                        array_concat.call(args, array_slice.call(arguments))
                    );

                }

            };

            // 15. If the [[Class]] internal property of Target is "Function", then
            //     a. Let L be the length property of Target minus the length of A.
            //     b. Set the length own property of F to either 0 or L, whichever is
            //       larger.
            // 16. Else set the length own property of F to 0.

            var boundLength = max(0, target.length - args.length);

            // 17. Set the attributes of the length own property of F to the values
            //   specified in 15.3.5.1.
            var boundArgs = [];
            for (var i = 0; i < boundLength; i++) {
                array_push.call(boundArgs, '$' + i);
            }

            // XXX Build a dynamic function with desired amount of arguments is the only
            // way to set the length property of a function.
            // In environments where Content Security Policies enabled (Chrome extensions,
            // for ex.) all use of eval or Function costructor throws an exception.
            // However in all of these environments Function.prototype.bind exists
            // and so this code will never be executed.
            bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);

            if (target.prototype) {
                Empty.prototype = target.prototype;
                bound.prototype = new Empty();
                // Clean up dangling references.
                Empty.prototype = null;
            }

            // TODO
            // 18. Set the [[Extensible]] internal property of F to true.

            // TODO
            // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
            // 20. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
            //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
            //   false.
            // 21. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
            //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
            //   and false.

            // TODO
            // NOTE Function objects created using Function.prototype.bind do not
            // have a prototype property or the [[Code]], [[FormalParameters]], and
            // [[Scope]] internal properties.
            // XXX can't delete prototype in pure-js.

            // 22. Return F.
            return bound;
        }
    });

    // _Please note: Shortcuts are defined after `Function.prototype.bind` as we
    // use it in defining shortcuts.
    var owns = call.bind(ObjectPrototype.hasOwnProperty);
    var toStr = call.bind(ObjectPrototype.toString);
    var arraySlice = call.bind(array_slice);
    var arraySliceApply = apply.bind(array_slice);
    var strSlice = call.bind(StringPrototype.slice);
    var strSplit = call.bind(StringPrototype.split);
    var strIndexOf = call.bind(StringPrototype.indexOf);
    var pushCall = call.bind(array_push);
    var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);
    var arraySort = call.bind(ArrayPrototype.sort);

    //
    // Array
    // =====
    //

    var isArray = $Array.isArray || function isArray(obj) {
        return toStr(obj) === '[object Array]';
    };

    // ES5 15.4.4.12
    // http://es5.github.com/#x15.4.4.13
    // Return len+argCount.
    // [bugfix, ielt8]
    // IE < 8 bug: [].unshift(0) === undefined but should be "1"
    var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
    defineProperties(ArrayPrototype, {
        unshift: function () {
            array_unshift.apply(this, arguments);
            return this.length;
        }
    }, hasUnshiftReturnValueBug);

    // ES5 15.4.3.2
    // http://es5.github.com/#x15.4.3.2
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
    defineProperties($Array, {isArray: isArray});

    // The IsCallable() check in the Array functions
    // has been replaced with a strict check on the
    // internal class of the object to trap cases where
    // the provided function was actually a regular
    // expression literal, which in V8 and
    // JavaScriptCore is a typeof "function".  Only in
    // V8 are regular expression literals permitted as
    // reduce parameters, so it is desirable in the
    // general case for the shim to match the more
    // strict and common behavior of rejecting regular
    // expressions.

    // ES5 15.4.4.18
    // http://es5.github.com/#x15.4.4.18
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

    // Check failure of by-index access of string characters (IE < 9)
    // and failure of `0 in boxedString` (Rhino)
    var boxedString = $Object('a');
    var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

    var properlyBoxesContext = function properlyBoxed(method) {
        // Check node 0.6.21 bug where third parameter is not boxed
        var properlyBoxesNonStrict = true;
        var properlyBoxesStrict = true;
        var threwException = false;
        if (method) {
            try {
                method.call('foo', function (_, __, context) {
                    if (typeof context !== 'object') {
                        properlyBoxesNonStrict = false;
                    }
                });

                method.call([1], function () {
                    'use strict';

                    properlyBoxesStrict = typeof this === 'string';
                }, 'x');
            } catch (e) {
                threwException = true;
            }
        }
        return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;
    };

    defineProperties(ArrayPrototype, {
        forEach: function forEach(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var i = -1;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.forEach callback must be a function');
            }

            while (++i < length) {
                if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object
                    if (typeof T === 'undefined') {
                        callbackfn(self[i], i, object);
                    } else {
                        callbackfn.call(T, self[i], i, object);
                    }
                }
            }
        }
    }, !properlyBoxesContext(ArrayPrototype.forEach));

    // ES5 15.4.4.19
    // http://es5.github.com/#x15.4.4.19
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    defineProperties(ArrayPrototype, {
        map: function map(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = $Array(length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.map callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    if (typeof T === 'undefined') {
                        result[i] = callbackfn(self[i], i, object);
                    } else {
                        result[i] = callbackfn.call(T, self[i], i, object);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.map));

    // ES5 15.4.4.20
    // http://es5.github.com/#x15.4.4.20
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
    defineProperties(ArrayPrototype, {
        filter: function filter(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = [];
            var value;
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.filter callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    value = self[i];
                    if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                        pushCall(result, value);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.filter));

    // ES5 15.4.4.16
    // http://es5.github.com/#x15.4.4.16
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
    defineProperties(ArrayPrototype, {
        every: function every(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.every callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return false;
                }
            }
            return true;
        }
    }, !properlyBoxesContext(ArrayPrototype.every));

    // ES5 15.4.4.17
    // http://es5.github.com/#x15.4.4.17
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
    defineProperties(ArrayPrototype, {
        some: function some(callbackfn/*, thisArg */) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.some callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return true;
                }
            }
            return false;
        }
    }, !properlyBoxesContext(ArrayPrototype.some));

    // ES5 15.4.4.21
    // http://es5.github.com/#x15.4.4.21
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
    var reduceCoercesToObject = false;
    if (ArrayPrototype.reduce) {
        reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) {
            return list;
        }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduce: function reduce(callbackfn/*, initialValue*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduce callback must be a function');
            }

            // no value to return if no initial value and an empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduce of empty array with no initial value');
            }

            var i = 0;
            var result;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (++i >= length) {
                        throw new TypeError('reduce of empty array with no initial value');
                    }
                } while (true);
            }

            for (; i < length; i++) {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            }

            return result;
        }
    }, !reduceCoercesToObject);

    // ES5 15.4.4.22
    // http://es5.github.com/#x15.4.4.22
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
    var reduceRightCoercesToObject = false;
    if (ArrayPrototype.reduceRight) {
        reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) {
            return list;
        }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduceRight: function reduceRight(callbackfn/*, initial*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduceRight callback must be a function');
            }

            // no value to return if no initial value, empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduceRight of empty array with no initial value');
            }

            var result;
            var i = length - 1;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i--];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (--i < 0) {
                        throw new TypeError('reduceRight of empty array with no initial value');
                    }
                } while (true);
            }

            if (i < 0) {
                return result;
            }

            do {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            } while (i--);

            return result;
        }
    }, !reduceRightCoercesToObject);

    // ES5 15.4.4.14
    // http://es5.github.com/#x15.4.4.14
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
    if (!ArrayPrototype.indexOf) {
        defineProperties(ArrayPrototype, {
            indexOf: function indexOf(searchElement/*, fromIndex */) {
                var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
                var length = ES.ToUint32(self.length);

                if (length === 0) {
                    return -1;
                }

                var i = 0;
                if (arguments.length > 1) {
                    i = ES.ToInteger(arguments[1]);
                }

                // handle negative indices
                i = i >= 0 ? i : max(0, length + i);
                for (; i < length; i++) {
                    if (i in self && self[i] === searchElement) {
                        return i;
                    }
                }
                return -1;
            }
        }, hasFirefox2IndexOfBug);
    }

    // ES5 15.4.4.15
    // http://es5.github.com/#x15.4.4.15
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
    var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
    if (!ArrayPrototype.lastIndexOf) {
        defineProperties(ArrayPrototype, {
            lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {
                var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
                var length = ES.ToUint32(self.length);

                if (length === 0) {
                    return -1;
                }
                var i = length - 1;
                if (arguments.length > 1) {
                    i = min(i, ES.ToInteger(arguments[1]));
                }
                // handle negative indices
                i = i >= 0 ? i : length - Math.abs(i);
                for (; i >= 0; i--) {
                    if (i in self && searchElement === self[i]) {
                        return i;
                    }
                }
                return -1;
            }
        }, hasFirefox2LastIndexOfBug);
    }

    // ES5 15.4.4.12
    // http://es5.github.com/#x15.4.4.12
    var spliceNoopReturnsEmptyArray = (function () {
        var a = [1, 2];
        var result = a.splice();
        return a.length === 2 && isArray(result) && result.length === 0;
    }());
    defineProperties(ArrayPrototype, {
        // Safari 5.0 bug where .splice() returns undefined
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            } else {
                return array_splice.apply(this, arguments);
            }
        }
    }, !spliceNoopReturnsEmptyArray);

    var spliceWorksWithEmptyObject = (function () {
        var obj = {};
        ArrayPrototype.splice.call(obj, 0, 0, 1);
        return obj.length === 1;
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            }
            var args = arguments;
            this.length = max(ES.ToInteger(this.length), 0);
            if (arguments.length > 0 && typeof deleteCount !== 'number') {
                args = arraySlice(arguments);
                if (args.length < 2) {
                    pushCall(args, this.length - start);
                } else {
                    args[1] = ES.ToInteger(deleteCount);
                }
            }
            return array_splice.apply(this, args);
        }
    }, !spliceWorksWithEmptyObject);
    var spliceWorksWithLargeSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
        var arr = new $Array(1e5);
        // note: the index MUST be 8 or larger or the test will false pass
        arr[8] = 'x';
        arr.splice(1, 1);
        // note: this test must be defined *after* the indexOf shim
        // per https://github.com/es-shims/es5-shim/issues/313
        return arr.indexOf('x') === 7;
    }());
    var spliceWorksWithSmallSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Opera 12.15 breaks on this, no idea why.
        var n = 256;
        var arr = [];
        arr[n] = 'a';
        arr.splice(n + 1, 0, 'b');
        return arr[n] === 'a';
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            var O = ES.ToObject(this);
            var A = [];
            var len = ES.ToUint32(O.length);
            var relativeStart = ES.ToInteger(start);
            var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
            var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);

            var k = 0;
            var from;
            while (k < actualDeleteCount) {
                from = $String(actualStart + k);
                if (owns(O, from)) {
                    A[k] = O[from];
                }
                k += 1;
            }

            var items = arraySlice(arguments, 2);
            var itemCount = items.length;
            var to;
            if (itemCount < actualDeleteCount) {
                k = actualStart;
                var maxK = len - actualDeleteCount;
                while (k < maxK) {
                    from = $String(k + actualDeleteCount);
                    to = $String(k + itemCount);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k += 1;
                }
                k = len;
                var minK = len - actualDeleteCount + itemCount;
                while (k > minK) {
                    delete O[k - 1];
                    k -= 1;
                }
            } else if (itemCount > actualDeleteCount) {
                k = len - actualDeleteCount;
                while (k > actualStart) {
                    from = $String(k + actualDeleteCount - 1);
                    to = $String(k + itemCount - 1);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k -= 1;
                }
            }
            k = actualStart;
            for (var i = 0; i < items.length; ++i) {
                O[k] = items[i];
                k += 1;
            }
            O.length = len - actualDeleteCount + itemCount;

            return A;
        }
    }, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);

    var originalJoin = ArrayPrototype.join;
    var hasStringJoinBug;
    try {
        hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';
    } catch (e) {
        hasStringJoinBug = true;
    }
    if (hasStringJoinBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);
            }
        }, hasStringJoinBug);
    }

    var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';
    if (hasJoinUndefinedBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(this, sep);
            }
        }, hasJoinUndefinedBug);
    }

    var pushShim = function push(item) {
        var O = ES.ToObject(this);
        var n = ES.ToUint32(O.length);
        var i = 0;
        while (i < arguments.length) {
            O[n + i] = arguments[i];
            i += 1;
        }
        O.length = n + i;
        return n + i;
    };

    var pushIsNotGeneric = (function () {
        var obj = {};
        var result = Array.prototype.push.call(obj, undefined);
        return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);
    }());
    defineProperties(ArrayPrototype, {
        push: function push(item) {
            if (isArray(this)) {
                return array_push.apply(this, arguments);
            }
            return pushShim.apply(this, arguments);
        }
    }, pushIsNotGeneric);

    // This fixes a very weird bug in Opera 10.6 when pushing `undefined
    var pushUndefinedIsWeird = (function () {
        var arr = [];
        var result = arr.push(undefined);
        return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);
    }());
    defineProperties(ArrayPrototype, {push: pushShim}, pushUndefinedIsWeird);

    // ES5 15.2.3.14
    // http://es5.github.io/#x15.4.4.10
    // Fix boxed string bug
    defineProperties(ArrayPrototype, {
        slice: function (start, end) {
            var arr = isString(this) ? strSplit(this, '') : this;
            return arraySliceApply(arr, arguments);
        }
    }, splitString);

    var sortIgnoresNonFunctions = (function () {
        try {
            [1, 2].sort(null);
            [1, 2].sort({});
            return true;
        } catch (e) {
        }
        return false;
    }());
    var sortThrowsOnRegex = (function () {
        // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`
        try {
            [1, 2].sort(/a/);
            return false;
        } catch (e) {
        }
        return true;
    }());
    var sortIgnoresUndefined = (function () {
        // applies in IE 8, for one.
        try {
            [1, 2].sort(undefined);
            return true;
        } catch (e) {
        }
        return false;
    }());
    defineProperties(ArrayPrototype, {
        sort: function sort(compareFn) {
            if (typeof compareFn === 'undefined') {
                return arraySort(this);
            }
            if (!isCallable(compareFn)) {
                throw new TypeError('Array.prototype.sort callback must be a function');
            }
            return arraySort(this, compareFn);
        }
    }, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);

    //
    // Object
    // ======
    //

    // ES5 15.2.3.14
    // http://es5.github.com/#x15.2.3.14

    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = !isEnum({'toString': null}, 'toString');
    var hasProtoEnumBug = isEnum(function () {
    }, 'prototype');
    var hasStringEnumBug = !owns('x', '0');
    var equalsConstructorPrototype = function (o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
        $window: true,
        $console: true,
        $parent: true,
        $self: true,
        $frame: true,
        $frames: true,
        $frameElement: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $external: true,
        $width: true,
        $height: true
    };
    var hasAutomationEqualityBug = (function () {
        /* globals window */
        if (typeof window === 'undefined') {
            return false;
        }
        for (var k in window) {
            try {
                if (!excludedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    equalsConstructorPrototype(window[k]);
                }
            } catch (e) {
                return true;
            }
        }
        return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (object) {
        if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(object);
        }
        try {
            return equalsConstructorPrototype(object);
        } catch (e) {
            return false;
        }
    };
    var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
    // can be replaced with require('is-arguments') if we ever use a build process instead
    var isStandardArguments = function isArguments(value) {
        return toStr(value) === '[object Arguments]';
    };
    var isLegacyArguments = function isArguments(value) {
        return value !== null &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            value.length >= 0 &&
            !isArray(value) &&
            isCallable(value.callee);
    };
    var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

    defineProperties($Object, {
        keys: function keys(object) {
            var isFn = isCallable(object);
            var isArgs = isArguments(object);
            var isObject = object !== null && typeof object === 'object';
            var isStr = isObject && isString(object);

            if (!isObject && !isFn && !isArgs) {
                throw new TypeError('Object.keys called on a non-object');
            }

            var theKeys = [];
            var skipProto = hasProtoEnumBug && isFn;
            if ((isStr && hasStringEnumBug) || isArgs) {
                for (var i = 0; i < object.length; ++i) {
                    pushCall(theKeys, $String(i));
                }
            }

            if (!isArgs) {
                for (var name in object) {
                    if (!(skipProto && name === 'prototype') && owns(object, name)) {
                        pushCall(theKeys, $String(name));
                    }
                }
            }

            if (hasDontEnumBug) {
                var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j];
                    if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                        pushCall(theKeys, dontEnum);
                    }
                }
            }
            return theKeys;
        }
    });

    var keysWorksWithArguments = $Object.keys && (function () {
        // Safari 5.0 bug
        return $Object.keys(arguments).length === 2;
    }(1, 2));
    var keysHasArgumentsLengthBug = $Object.keys && (function () {
        var argKeys = $Object.keys(arguments);
        return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
    }(1));
    var originalKeys = $Object.keys;
    defineProperties($Object, {
        keys: function keys(object) {
            if (isArguments(object)) {
                return originalKeys(arraySlice(object));
            } else {
                return originalKeys(object);
            }
        }
    }, !keysWorksWithArguments || keysHasArgumentsLengthBug);

    //
    // Date
    // ====
    //

    var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;
    var aNegativeTestDate = new Date(-1509842289600292);
    var aPositiveTestDate = new Date(1449662400000);
    var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';
    var hasToDateStringFormatBug;
    var hasToStringFormatBug;
    var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();
    if (timeZoneOffset < -720) {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';
        hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    } else {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';
        hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    }

    var originalGetFullYear = call.bind(Date.prototype.getFullYear);
    var originalGetMonth = call.bind(Date.prototype.getMonth);
    var originalGetDate = call.bind(Date.prototype.getDate);
    var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);
    var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);
    var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);
    var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);
    var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);
    var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);
    var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);
    var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);
    var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var daysInMonth = function daysInMonth(month, year) {
        return originalGetDate(new Date(year, month, 0));
    };

    defineProperties(Date.prototype, {
        getFullYear: function getFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            if (year < 0 && originalGetMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getMonth: function getMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getDate: function getDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            var date = originalGetDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        },
        getUTCFullYear: function getUTCFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            if (year < 0 && originalGetUTCMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getUTCMonth: function getUTCMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getUTCDate: function getUTCDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            var date = originalGetUTCDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        }
    }, hasNegativeMonthYearBug);

    defineProperties(Date.prototype, {
        toUTCString: function toUTCString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = originalGetUTCDay(this);
            var date = originalGetUTCDate(this);
            var month = originalGetUTCMonth(this);
            var year = originalGetUTCFullYear(this);
            var hour = originalGetUTCHours(this);
            var minute = originalGetUTCMinutes(this);
            var second = originalGetUTCSeconds(this);
            return dayName[day] + ', ' +
                (date < 10 ? '0' + date : date) + ' ' +
                monthName[month] + ' ' +
                year + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second) + ' GMT';
        }
    }, hasNegativeMonthYearBug || hasToUTCStringFormatBug);

    // Opera 12 has `,`
    defineProperties(Date.prototype, {
        toDateString: function toDateString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = this.getDay();
            var date = this.getDate();
            var month = this.getMonth();
            var year = this.getFullYear();
            return dayName[day] + ' ' +
                monthName[month] + ' ' +
                (date < 10 ? '0' + date : date) + ' ' +
                year;
        }
    }, hasNegativeMonthYearBug || hasToDateStringFormatBug);

    // FR环境下面ie8重写tostring会导致new Date('2016/10')这样的日期创建失败，先屏蔽
    // can't use defineProperties here because of toString enumeration issue in IE <= 8
    // if (hasNegativeMonthYearBug || hasToStringFormatBug) {
    //     Date.prototype.toString = function toString() {
    //         if (!this || !(this instanceof Date)) {
    //             throw new TypeError('this is not a Date object.');
    //         }
    //         var day = this.getDay();
    //         var date = this.getDate();
    //         var month = this.getMonth();
    //         var year = this.getFullYear();
    //         var hour = this.getHours();
    //         var minute = this.getMinutes();
    //         var second = this.getSeconds();
    //         var timezoneOffset = this.getTimezoneOffset();
    //         var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);
    //         var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);
    //         return dayName[day] + ' ' +
    //             monthName[month] + ' ' +
    //             (date < 10 ? '0' + date : date) + ' ' +
    //             year + ' ' +
    //             (hour < 10 ? '0' + hour : hour) + ':' +
    //             (minute < 10 ? '0' + minute : minute) + ':' +
    //             (second < 10 ? '0' + second : second) + ' GMT' +
    //             (timezoneOffset > 0 ? '-' : '+') +
    //             (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +
    //             (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);
    //     };
    //     if (supportsDescriptors) {
    //         $Object.defineProperty(Date.prototype, 'toString', {
    //             configurable: true,
    //             enumerable: false,
    //             writable: true
    //         });
    //     }
    // }

    // ES5 15.9.5.43
    // http://es5.github.com/#x15.9.5.43
    // This function returns a String value represent the instance in time
    // represented by this Date object. The format of the String is the Date Time
    // string format defined in 15.9.1.15. All fields are present in the String.
    // The time zone is always UTC, denoted by the suffix Z. If the time value of
    // this object is not a finite Number a RangeError exception is thrown.
    var negativeDate = -62198755200000;
    var negativeYearString = '-000001';
    var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
    var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';

    var getTime = call.bind(Date.prototype.getTime);

    defineProperties(Date.prototype, {
        toISOString: function toISOString() {
            if (!isFinite(this) || !isFinite(getTime(this))) {
                // Adope Photoshop requires the second check.
                throw new RangeError('Date.prototype.toISOString called on non-finite value.');
            }

            var year = originalGetUTCFullYear(this);

            var month = originalGetUTCMonth(this);
            // see https://github.com/es-shims/es5-shim/issues/111
            year += Math.floor(month / 12);
            month = ((month % 12) + 12) % 12;

            // the date time string format is specified in 15.9.1.15.
            var result = [month + 1, originalGetUTCDate(this), originalGetUTCHours(this), originalGetUTCMinutes(this), originalGetUTCSeconds(this)];
            year = (
                (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
                strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
            );

            for (var i = 0; i < result.length; ++i) {
                // pad months, days, hours, minutes, and seconds to have two digits.
                result[i] = strSlice('00' + result[i], -2);
            }
            // pad milliseconds to have three digits.
            return (
                year + '-' + arraySlice(result, 0, 2).join('-') +
                'T' + arraySlice(result, 2).join(':') + '.' +
                strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'
            );
        }
    }, hasNegativeDateBug || hasSafari51DateBug);

    // ES5 15.9.5.44
    // http://es5.github.com/#x15.9.5.44
    // This function provides a String representation of a Date object for use by
    // JSON.stringify (15.12.3).
    var dateToJSONIsSupported = (function () {
        try {
            return Date.prototype.toJSON &&
                new Date(NaN).toJSON() === null &&
                new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
                Date.prototype.toJSON.call({ // generic
                    toISOString: function () {
                        return true;
                    }
                });
        } catch (e) {
            return false;
        }
    }());
    if (!dateToJSONIsSupported) {
        Date.prototype.toJSON = function toJSON(key) {
            // When the toJSON method is called with argument key, the following
            // steps are taken:

            // 1.  Let O be the result of calling ToObject, giving it the this
            // value as its argument.
            // 2. Let tv be ES.ToPrimitive(O, hint Number).
            var O = $Object(this);
            var tv = ES.ToPrimitive(O);
            // 3. If tv is a Number and is not finite, return null.
            if (typeof tv === 'number' && !isFinite(tv)) {
                return null;
            }
            // 4. Let toISO be the result of calling the [[Get]] internal method of
            // O with argument "toISOString".
            var toISO = O.toISOString;
            // 5. If IsCallable(toISO) is false, throw a TypeError exception.
            if (!isCallable(toISO)) {
                throw new TypeError('toISOString property is not callable');
            }
            // 6. Return the result of calling the [[Call]] internal method of
            //  toISO with O as the this value and an empty argument list.
            return toISO.call(O);

            // NOTE 1 The argument is ignored.

            // NOTE 2 The toJSON function is intentionally generic; it does not
            // require that its this value be a Date object. Therefore, it can be
            // transferred to other kinds of objects for use as a method. However,
            // it does require that any such object have a toISOString method. An
            // object is free to use the argument key to filter its
            // stringification.
        };
    }

    // ES5 15.9.4.2
    // http://es5.github.com/#x15.9.4.2
    // based on work shared by Daniel Friesen (dantman)
    // http://gist.github.com/303249
    var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
    var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
    var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
    if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
        // XXX global assignment won't work in embeddings that use
        // an alternate object for the context.
        /* global Date: true */
        var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
        var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
        // eslint-disable-next-line no-implicit-globals, no-global-assign
        Date = (function (NativeDate) {
            // Date.length === 7
            var DateShim = function Date(Y, M, D, h, m, s, ms) {
                var length = arguments.length;
                var date;
                if (this instanceof NativeDate) {
                    var seconds = s;
                    var millis = ms;
                    if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
                        // work around a Safari 8/9 bug where it treats the seconds as signed
                        var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                        var sToShift = Math.floor(msToShift / 1e3);
                        seconds += sToShift;
                        millis -= sToShift * 1e3;
                    }
                    date = length === 1 && $String(Y) === Y ? // isString(Y)
                        // We explicitly pass it through parse:
                        new NativeDate(DateShim.parse(Y)) :
                        // We have to manually make calls depending on argument
                        // length here
                        length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
                            length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
                                length >= 5 ? new NativeDate(Y, M, D, h, m) :
                                    length >= 4 ? new NativeDate(Y, M, D, h) :
                                        length >= 3 ? new NativeDate(Y, M, D) :
                                            length >= 2 ? new NativeDate(Y, M) :
                                                length >= 1 ? new NativeDate(Y instanceof NativeDate ? +Y : Y) :
                                                    new NativeDate();
                } else {
                    date = NativeDate.apply(this, arguments);
                }
                if (!isPrimitive(date)) {
                    // Prevent mixups with unfixed Date object
                    defineProperties(date, {constructor: DateShim}, true);
                }
                return date;
            };

            // 15.9.1.15 Date Time String Format.
            var isoDateExpression = new RegExp('^' +
                '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                // 6-digit extended year
                '(?:-(\\d{2})' + // optional month capture
                '(?:-(\\d{2})' + // optional day capture
                '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                ':(\\d{2})' + // seconds capture
                '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
                '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                '([-+])' + // sign capture
                '(\\d{2})' + // hours offset capture
                ':(\\d{2})' + // minutes offset capture
                ')' +
                ')?)?)?)?' +
                '$');

            var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

            var dayFromMonth = function dayFromMonth(year, month) {
                var t = month > 1 ? 1 : 0;
                return (
                    months[month] +
                    Math.floor((year - 1969 + t) / 4) -
                    Math.floor((year - 1901 + t) / 100) +
                    Math.floor((year - 1601 + t) / 400) +
                    (365 * (year - 1970))
                );
            };

            var toUTC = function toUTC(t) {
                var s = 0;
                var ms = t;
                if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
                    // work around a Safari 8/9 bug where it treats the seconds as signed
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                    var sToShift = Math.floor(msToShift / 1e3);
                    s += sToShift;
                    ms -= sToShift * 1e3;
                }
                return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
            };

            // Copy any custom methods a 3rd party library may have added
            for (var key in NativeDate) {
                if (owns(NativeDate, key)) {
                    DateShim[key] = NativeDate[key];
                }
            }

            // Copy "native" methods explicitly; they may be non-enumerable
            defineProperties(DateShim, {
                now: NativeDate.now,
                UTC: NativeDate.UTC
            }, true);
            DateShim.prototype = NativeDate.prototype;
            defineProperties(DateShim.prototype, {constructor: DateShim}, true);

            // Upgrade Date.parse to handle simplified ISO 8601 strings
            var parseShim = function parse(string) {
                var match = isoDateExpression.exec(string);
                if (match) {
                    // parse months, days, hours, minutes, seconds, and milliseconds
                    // provide default values if necessary
                    // parse the UTC offset component
                    var year = $Number(match[1]),
                        month = $Number(match[2] || 1) - 1,
                        day = $Number(match[3] || 1) - 1,
                        hour = $Number(match[4] || 0),
                        minute = $Number(match[5] || 0),
                        second = $Number(match[6] || 0),
                        millisecond = Math.floor($Number(match[7] || 0) * 1000),
                        // When time zone is missed, local offset should be used
                        // (ES 5.1 bug)
                        // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                        isLocalTime = Boolean(match[4] && !match[8]),
                        signOffset = match[9] === '-' ? 1 : -1,
                        hourOffset = $Number(match[10] || 0),
                        minuteOffset = $Number(match[11] || 0),
                        result;
                    var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
                    if (
                        hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
                        minute < 60 && second < 60 && millisecond < 1000 &&
                        month > -1 && month < 12 && hourOffset < 24 &&
                        minuteOffset < 60 && // detect invalid offsets
                        day > -1 &&
                        day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
                    ) {
                        result = (
                            ((dayFromMonth(year, month) + day) * 24) +
                            hour +
                            (hourOffset * signOffset)
                        ) * 60;
                        result = ((
                            ((result + minute + (minuteOffset * signOffset)) * 60) +
                            second
                        ) * 1000) + millisecond;
                        if (isLocalTime) {
                            result = toUTC(result);
                        }
                        if (-8.64e15 <= result && result <= 8.64e15) {
                            return result;
                        }
                    }
                    return NaN;
                }
                return NativeDate.parse.apply(this, arguments);
            };
            defineProperties(DateShim, {parse: parseShim});

            return DateShim;
        }(Date));
        /* global Date: false */
    }

    // ES5 15.9.4.4
    // http://es5.github.com/#x15.9.4.4
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    //
    // Number
    // ======
    //

    // ES5.1 15.7.4.5
    // http://es5.github.com/#x15.7.4.5
    var hasToFixedBugs = NumberPrototype.toFixed && (
        (0.00008).toFixed(3) !== '0.000' ||
        (0.9).toFixed(0) !== '1' ||
        (1.255).toFixed(2) !== '1.25' ||
        (1000000000000000128).toFixed(0) !== '1000000000000000128'
    );

    var toFixedHelpers = {
        base: 1e7,
        size: 6,
        data: [0, 0, 0, 0, 0, 0],
        multiply: function multiply(n, c) {
            var i = -1;
            var c2 = c;
            while (++i < toFixedHelpers.size) {
                c2 += n * toFixedHelpers.data[i];
                toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
                c2 = Math.floor(c2 / toFixedHelpers.base);
            }
        },
        divide: function divide(n) {
            var i = toFixedHelpers.size;
            var c = 0;
            while (--i >= 0) {
                c += toFixedHelpers.data[i];
                toFixedHelpers.data[i] = Math.floor(c / n);
                c = (c % n) * toFixedHelpers.base;
            }
        },
        numToString: function numToString() {
            var i = toFixedHelpers.size;
            var s = '';
            while (--i >= 0) {
                if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
                    var t = $String(toFixedHelpers.data[i]);
                    if (s === '') {
                        s = t;
                    } else {
                        s += strSlice('0000000', 0, 7 - t.length) + t;
                    }
                }
            }
            return s;
        },
        pow: function pow(x, n, acc) {
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
        },
        log: function log(x) {
            var n = 0;
            var x2 = x;
            while (x2 >= 4096) {
                n += 12;
                x2 /= 4096;
            }
            while (x2 >= 2) {
                n += 1;
                x2 /= 2;
            }
            return n;
        }
    };

    var toFixedShim = function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = $Number(fractionDigits);
        f = isActualNaN(f) ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = $Number(this);

        if (isActualNaN(x)) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return $String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
            } else {
                m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    };
    defineProperties(NumberPrototype, {toFixed: toFixedShim}, hasToFixedBugs);

    //
    // String
    // ======
    //

    // ES5 15.5.4.14
    // http://es5.github.com/#x15.5.4.14

    // [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
    // Many browsers do not split properly with regular expressions or they
    // do not perform the split correctly under obscure conditions.
    // See http://blog.stevenlevithan.com/archives/cross-browser-split
    // I've tested in many browsers and this seems to cover the deviant ones:
    //    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
    //    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
    //    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
    //       [undefined, "t", undefined, "e", ...]
    //    ''.split(/.?/) should be [], not [""]
    //    '.'.split(/()()/) should be ["."], not ["", "", "."]

    if (
        'ab'.split(/(?:ab)*/).length !== 2 ||
        '.'.split(/(.?)(.?)/).length !== 4 ||
        'tesst'.split(/(s)*/)[1] === 't' ||
        'test'.split(/(?:)/, -1).length !== 4 ||
        ''.split(/.?/).length ||
        '.'.split(/()()/).length > 1
    ) {
        (function () {
            var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
            var maxSafe32BitInt = Math.pow(2, 32) - 1;

            StringPrototype.split = function (separator, limit) {
                var string = String(this);
                if (typeof separator === 'undefined' && limit === 0) {
                    return [];
                }

                // If `separator` is not a regex, use native split
                if (!isRegex(separator)) {
                    return strSplit(this, separator, limit);
                }

                var output = [];
                var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') + // in ES6
                    (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
                    lastLastIndex = 0,
                    // Make `global` and avoid `lastIndex` issues by working with a copy
                    separator2, match, lastIndex, lastLength;
                var separatorCopy = new RegExp(separator.source, flags + 'g');
                if (!compliantExecNpcg) {
                    // Doesn't need flags gy, but they don't hurt
                    separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
                }
                /* Values for `limit`, per the spec:
                 * If undefined: 4294967295 // maxSafe32BitInt
                 * If 0, Infinity, or NaN: 0
                 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
                 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
                 * If other: Type-convert, then use the above rules
                 */
                var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
                match = separatorCopy.exec(string);
                while (match) {
                    // `separatorCopy.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        pushCall(output, strSlice(string, lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            /* eslint-disable no-loop-func */
                            match[0].replace(separator2, function () {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (typeof arguments[i] === 'undefined') {
                                        match[i] = void 0;
                                    }
                                }
                            });
                            /* eslint-enable no-loop-func */
                        }
                        if (match.length > 1 && match.index < string.length) {
                            array_push.apply(output, arraySlice(match, 1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= splitLimit) {
                            break;
                        }
                    }
                    if (separatorCopy.lastIndex === match.index) {
                        separatorCopy.lastIndex++; // Avoid an infinite loop
                    }
                    match = separatorCopy.exec(string);
                }
                if (lastLastIndex === string.length) {
                    if (lastLength || !separatorCopy.test('')) {
                        pushCall(output, '');
                    }
                } else {
                    pushCall(output, strSlice(string, lastLastIndex));
                }
                return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
            };
        }());

        // [bugfix, chrome]
        // If separator is undefined, then the result array contains just one String,
        // which is the this value (converted to a String). If limit is not undefined,
        // then the output array is truncated so that it contains no more than limit
        // elements.
        // "0".split(undefined, 0) -> []
    } else if ('0'.split(void 0, 0).length) {
        StringPrototype.split = function split(separator, limit) {
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }
            return strSplit(this, separator, limit);
        };
    }

    var str_replace = StringPrototype.replace;
    var replaceReportsGroupsCorrectly = (function () {
        var groups = [];
        'x'.replace(/x(.)?/g, function (match, group) {
            pushCall(groups, group);
        });
        return groups.length === 1 && typeof groups[0] === 'undefined';
    }());

    if (!replaceReportsGroupsCorrectly) {
        StringPrototype.replace = function replace(searchValue, replaceValue) {
            var isFn = isCallable(replaceValue);
            var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
            if (!isFn || !hasCapturingGroups) {
                return str_replace.call(this, searchValue, replaceValue);
            } else {
                var wrappedReplaceValue = function (match) {
                    var length = arguments.length;
                    var originalLastIndex = searchValue.lastIndex;
                    searchValue.lastIndex = 0;
                    var args = searchValue.exec(match) || [];
                    searchValue.lastIndex = originalLastIndex;
                    pushCall(args, arguments[length - 2], arguments[length - 1]);
                    return replaceValue.apply(this, args);
                };
                return str_replace.call(this, searchValue, wrappedReplaceValue);
            }
        };
    }

    // ECMA-262, 3rd B.2.3
    // Not an ECMAScript standard, although ECMAScript 3rd Edition has a
    // non-normative section suggesting uniform semantics and it should be
    // normalized across all browsers
    // [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
    var string_substr = StringPrototype.substr;
    var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
    defineProperties(StringPrototype, {
        substr: function substr(start, length) {
            var normalizedStart = start;
            if (start < 0) {
                normalizedStart = max(this.length + start, 0);
            }
            return string_substr.call(this, normalizedStart, length);
        }
    }, hasNegativeSubstrBug);

    // ES5 15.5.4.20
    // whitespace from: http://es5.github.io/#x15.5.4.20
    var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
        '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
        '\u2029\uFEFF';
    var zeroWidth = '\u200b';
    var wsRegexChars = '[' + ws + ']';
    var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
    var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
    var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
    defineProperties(StringPrototype, {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        trim: function trim() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
        }
    }, hasTrimWhitespaceBug);
    var trim = call.bind(String.prototype.trim);

    var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var S = $String(this);
            var searchStr = $String(searchString);
            var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;
            var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);
            var start = min(max(pos, 0), S.length);
            var searchLen = searchStr.length;
            var k = start + searchLen;
            while (k > 0) {
                k = max(0, k - searchLen);
                var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);
                if (index !== -1) {
                    return k + index;
                }
            }
            return -1;
        }
    }, hasLastIndexBug);

    var originalLastIndexOf = StringPrototype.lastIndexOf;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            return originalLastIndexOf.apply(this, arguments);
        }
    }, StringPrototype.lastIndexOf.length !== 1);

    // ES-5 15.1.2.2
    // eslint-disable-next-line radix
    if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
        /* global parseInt: true */
        parseInt = (function (origParseInt) {
            var hexRegex = /^[\-+]?0[xX]/;
            return function parseInt(str, radix) {
                var string = trim(String(str));
                var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
                return origParseInt(string, defaultedRadix);
            };
        }(parseInt));
    }

    // https://es5.github.io/#x15.1.2.3
    if (1 / parseFloat('-0') !== -Infinity) {
        /* global parseFloat: true */
        parseFloat = (function (origParseFloat) {
            return function parseFloat(string) {
                var inputString = trim(String(string));
                var result = origParseFloat(inputString);
                return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;
            };
        }(parseFloat));
    }

    if (String(new RangeError('test')) !== 'RangeError: test') {
        var errorToStringShim = function toString() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var name = this.name;
            if (typeof name === 'undefined') {
                name = 'Error';
            } else if (typeof name !== 'string') {
                name = $String(name);
            }
            var msg = this.message;
            if (typeof msg === 'undefined') {
                msg = '';
            } else if (typeof msg !== 'string') {
                msg = $String(msg);
            }
            if (!name) {
                return msg;
            }
            if (!msg) {
                return name;
            }
            return name + ': ' + msg;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        Error.prototype.toString = errorToStringShim;
    }

    if (supportsDescriptors) {
        var ensureNonEnumerable = function (obj, prop) {
            if (isEnum(obj, prop)) {
                var desc = Object.getOwnPropertyDescriptor(obj, prop);
                if (desc.configurable) {
                    desc.enumerable = false;
                    Object.defineProperty(obj, prop, desc);
                }
            }
        };
        ensureNonEnumerable(Error.prototype, 'message');
        if (Error.prototype.message !== '') {
            Error.prototype.message = '';
        }
        ensureNonEnumerable(Error.prototype, 'name');
    }

    if (String(/a/mig) !== '/a/gim') {
        var regexToString = function toString() {
            var str = '/' + this.source + '/';
            if (this.global) {
                str += 'g';
            }
            if (this.ignoreCase) {
                str += 'i';
            }
            if (this.multiline) {
                str += 'm';
            }
            return str;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        RegExp.prototype.toString = regexToString;
    }
}));

(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    var call = Function.call;
    var prototypeOfObject = Object.prototype;
    var owns = call.bind(prototypeOfObject.hasOwnProperty);
    var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);
    var toStr = call.bind(prototypeOfObject.toString);

    // If JS engine supports accessors creating shortcuts.
    var defineGetter;
    var defineSetter;
    var lookupGetter;
    var lookupSetter;
    var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
    if (supportsAccessors) {
        /* eslint-disable no-underscore-dangle */
        defineGetter = call.bind(prototypeOfObject.__defineGetter__);
        defineSetter = call.bind(prototypeOfObject.__defineSetter__);
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
        /* eslint-enable no-underscore-dangle */
    }

    var isPrimitive = function isPrimitive(o) {
        return o == null || (typeof o !== 'object' && typeof o !== 'function');
    };

    // ES5 15.2.3.2
    // http://es5.github.com/#x15.2.3.2
    if (!Object.getPrototypeOf) {
        // https://github.com/es-shims/es5-shim/issues#issue/2
        // http://ejohn.org/blog/objectgetprototypeof/
        // recommended by fschaefer on github
        //
        // sure, and webreflection says ^_^
        // ... this will nerever possibly return null
        // ... Opera Mini breaks here with infinite loops
        Object.getPrototypeOf = function getPrototypeOf(object) {
            // eslint-disable-next-line no-proto
            var proto = object.__proto__;
            if (proto || proto === null) {
                return proto;
            } else if (toStr(object.constructor) === '[object Function]') {
                return object.constructor.prototype;
            } else if (object instanceof Object) {
                return prototypeOfObject;
            } else {
                // Correctly return null for Objects created with `Object.create(null)`
                // (shammed or native) or `{ __proto__: null}`.  Also returns null for
                // cross-realm objects on browsers that lack `__proto__` support (like
                // IE <11), but that's the best we can do.
                return null;
            }
        };
    }

    // ES5 15.2.3.3
    // http://es5.github.com/#x15.2.3.3

    var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
        try {
            object.sentinel = 0;
            return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
        } catch (exception) {
            return false;
        }
    };

    // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
    if (Object.defineProperty) {
        var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
        var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
            doesGetOwnPropertyDescriptorWork(document.createElement('div'));
        if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
            var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
        }
    }

    if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
        var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

        /* eslint-disable no-proto */
        Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT + object);
            }

            // make a valiant attempt to use the real getOwnPropertyDescriptor
            // for I8's DOM elements.
            if (getOwnPropertyDescriptorFallback) {
                try {
                    return getOwnPropertyDescriptorFallback.call(Object, object, property);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            var descriptor;

            // If object does not owns property return undefined immediately.
            if (!owns(object, property)) {
                return descriptor;
            }

            // If object has a property then it's for sure `configurable`, and
            // probably `enumerable`. Detect enumerability though.
            descriptor = {
                enumerable: isEnumerable(object, property),
                configurable: true
            };

            // If JS engine supports accessor properties then property may be a
            // getter or setter.
            if (supportsAccessors) {
                // Unfortunately `__lookupGetter__` will return a getter even
                // if object has own non getter property along with a same named
                // inherited getter. To avoid misbehavior we temporary remove
                // `__proto__` so that `__lookupGetter__` will return getter only
                // if it's owned by an object.
                var prototype = object.__proto__;
                var notPrototypeOfObject = object !== prototypeOfObject;
                // avoid recursion problem, breaking in Opera Mini when
                // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
                // or any other Object.prototype accessor
                if (notPrototypeOfObject) {
                    object.__proto__ = prototypeOfObject;
                }

                var getter = lookupGetter(object, property);
                var setter = lookupSetter(object, property);

                if (notPrototypeOfObject) {
                    // Once we have getter and setter we can put values back.
                    object.__proto__ = prototype;
                }

                if (getter || setter) {
                    if (getter) {
                        descriptor.get = getter;
                    }
                    if (setter) {
                        descriptor.set = setter;
                    }
                    // If it was accessor property we're done and return here
                    // in order to avoid adding `value` to the descriptor.
                    return descriptor;
                }
            }

            // If we got this far we know that object has an own property that is
            // not an accessor so we set it as a value and return descriptor.
            descriptor.value = object[property];
            descriptor.writable = true;
            return descriptor;
        };
        /* eslint-enable no-proto */
    }

    // ES5 15.2.3.4
    // http://es5.github.com/#x15.2.3.4
    if (!Object.getOwnPropertyNames) {
        Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
            return Object.keys(object);
        };
    }

    // ES5 15.2.3.5
    // http://es5.github.com/#x15.2.3.5
    if (!Object.create) {

        // Contributed by Brandon Benvie, October, 2012
        var createEmpty;
        var supportsProto = !({__proto__: null} instanceof Object);
        // the following produces false positives
        // in Opera Mini => not a reliable check
        // Object.prototype.__proto__ === null

        // Check for document.domain and active x support
        // No need to use active x approach when document.domain is not set
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        /* global ActiveXObject */
        var shouldUseActiveX = function shouldUseActiveX() {
            // return early if document.domain not set
            if (!document.domain) {
                return false;
            }

            try {
                return !!new ActiveXObject('htmlfile');
            } catch (exception) {
                return false;
            }
        };

        // This supports IE8 when document.domain is used
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        var getEmptyViaActiveX = function getEmptyViaActiveX() {
            var empty;
            var xDoc;

            xDoc = new ActiveXObject('htmlfile');

            var script = 'script';
            xDoc.write('<' + script + '></' + script + '>');
            xDoc.close();

            empty = xDoc.parentWindow.Object.prototype;
            xDoc = null;

            return empty;
        };

        // The original implementation using an iframe
        // before the activex approach was added
        // see https://github.com/es-shims/es5-shim/issues/150
        var getEmptyViaIFrame = function getEmptyViaIFrame() {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            var empty;

            iframe.style.display = 'none';
            parent.appendChild(iframe);
            // eslint-disable-next-line no-script-url
            iframe.src = 'javascript:';

            empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;

            return empty;
        };

        /* global document */
        if (supportsProto || typeof document === 'undefined') {
            createEmpty = function () {
                return {__proto__: null};
            };
        } else {
            // In old IE __proto__ can't be used to manually set `null`, nor does
            // any other method exist to make an object that inherits from nothing,
            // aside from Object.prototype itself. Instead, create a new global
            // object and *steal* its Object.prototype and strip it bare. This is
            // used as the prototype to create nullary objects.
            createEmpty = function () {
                // Determine which approach to use
                // see https://github.com/es-shims/es5-shim/issues/150
                var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

                delete empty.constructor;
                delete empty.hasOwnProperty;
                delete empty.propertyIsEnumerable;
                delete empty.isPrototypeOf;
                delete empty.toLocaleString;
                delete empty.toString;
                delete empty.valueOf;

                var Empty = function Empty() {
                };
                Empty.prototype = empty;
                // short-circuit future calls
                createEmpty = function () {
                    return new Empty();
                };
                return new Empty();
            };
        }

        Object.create = function create(prototype, properties) {

            var object;
            var Type = function Type() {
            }; // An empty constructor.

            if (prototype === null) {
                object = createEmpty();
            } else {
                if (prototype !== null && isPrimitive(prototype)) {
                    // In the native implementation `parent` can be `null`
                    // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                    // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                    // like they are in modern browsers. Using `Object.create` on DOM elements
                    // is...err...probably inappropriate, but the native version allows for it.
                    throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
                }
                Type.prototype = prototype;
                object = new Type();
                // IE has no built-in implementation of `Object.getPrototypeOf`
                // neither `__proto__`, but this manually setting `__proto__` will
                // guarantee that `Object.getPrototypeOf` will work as expected with
                // objects created using `Object.create`
                // eslint-disable-next-line no-proto
                object.__proto__ = prototype;
            }

            if (properties !== void 0) {
                Object.defineProperties(object, properties);
            }

            return object;
        };
    }

    // ES5 15.2.3.6
    // http://es5.github.com/#x15.2.3.6

    // Patch for WebKit and IE8 standard mode
    // Designed by hax <hax.github.com>
    // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
    // IE8 Reference:
    //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
    //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
    // WebKit Bugs:
    //     https://bugs.webkit.org/show_bug.cgi?id=36423

    var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
        try {
            Object.defineProperty(object, 'sentinel', {});
            return 'sentinel' in object;
        } catch (exception) {
            return false;
        }
    };

    // check whether defineProperty works if it's given. Otherwise,
    // shim partially.
    if (Object.defineProperty) {
        var definePropertyWorksOnObject = doesDefinePropertyWork({});
        var definePropertyWorksOnDom = typeof document === 'undefined' ||
            doesDefinePropertyWork(document.createElement('div'));
        if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
            var definePropertyFallback = Object.defineProperty,
                definePropertiesFallback = Object.defineProperties;
        }
    }

    if (!Object.defineProperty || definePropertyFallback) {
        var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
        var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
        var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

        Object.defineProperty = function defineProperty(object, property, descriptor) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT_TARGET + object);
            }
            if (isPrimitive(descriptor)) {
                throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
            }
            // make a valiant attempt to use the real defineProperty
            // for I8's DOM elements.
            if (definePropertyFallback) {
                try {
                    return definePropertyFallback.call(Object, object, property, descriptor);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            // If it's a data property.
            if ('value' in descriptor) {
                // fail silently if 'writable', 'enumerable', or 'configurable'
                // are requested but not supported
                /*
                 // alternate approach:
                 if ( // can't implement these features; allow false but not true
                 ('writable' in descriptor && !descriptor.writable) ||
                 ('enumerable' in descriptor && !descriptor.enumerable) ||
                 ('configurable' in descriptor && !descriptor.configurable)
                 ))
                 throw new RangeError(
                 'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                 );
                 */

                if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
                    // As accessors are supported only on engines implementing
                    // `__proto__` we can safely override `__proto__` while defining
                    // a property to make sure that we don't hit an inherited
                    // accessor.
                    /* eslint-disable no-proto */
                    var prototype = object.__proto__;
                    object.__proto__ = prototypeOfObject;
                    // Deleting a property anyway since getter / setter may be
                    // defined on object itself.
                    delete object[property];
                    object[property] = descriptor.value;
                    // Setting original `__proto__` back now.
                    object.__proto__ = prototype;
                    /* eslint-enable no-proto */
                } else {
                    object[property] = descriptor.value;
                }
            } else {
                var hasGetter = 'get' in descriptor;
                var hasSetter = 'set' in descriptor;
                if (!supportsAccessors && (hasGetter || hasSetter)) {
                    throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
                }
                // If we got that far then getters and setters can be defined !!
                if (hasGetter) {
                    defineGetter(object, property, descriptor.get);
                }
                if (hasSetter) {
                    defineSetter(object, property, descriptor.set);
                }
            }
            return object;
        };
    }

    // ES5 15.2.3.7
    // http://es5.github.com/#x15.2.3.7
    if (!Object.defineProperties || definePropertiesFallback) {
        Object.defineProperties = function defineProperties(object, properties) {
            // make a valiant attempt to use the real defineProperties
            if (definePropertiesFallback) {
                try {
                    return definePropertiesFallback.call(Object, object, properties);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            Object.keys(properties).forEach(function (property) {
                if (property !== '__proto__') {
                    Object.defineProperty(object, property, properties[property]);
                }
            });
            return object;
        };
    }

    // ES5 15.2.3.8
    // http://es5.github.com/#x15.2.3.8
    if (!Object.seal) {
        Object.seal = function seal(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.seal can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.9
    // http://es5.github.com/#x15.2.3.9
    if (!Object.freeze) {
        Object.freeze = function freeze(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.freeze can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // detect a Rhino bug and patch it
    try {
        Object.freeze(function () {
        });
    } catch (exception) {
        Object.freeze = (function (freezeObject) {
            return function freeze(object) {
                if (typeof object === 'function') {
                    return object;
                } else {
                    return freezeObject(object);
                }
            };
        }(Object.freeze));
    }

    // ES5 15.2.3.10
    // http://es5.github.com/#x15.2.3.10
    if (!Object.preventExtensions) {
        Object.preventExtensions = function preventExtensions(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.preventExtensions can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.11
    // http://es5.github.com/#x15.2.3.11
    if (!Object.isSealed) {
        Object.isSealed = function isSealed(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isSealed can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.12
    // http://es5.github.com/#x15.2.3.12
    if (!Object.isFrozen) {
        Object.isFrozen = function isFrozen(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isFrozen can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.13
    // http://es5.github.com/#x15.2.3.13
    if (!Object.isExtensible) {
        Object.isExtensible = function isExtensible(object) {
            // 1. If Type(O) is not Object throw a TypeError exception.
            if (Object(object) !== object) {
                throw new TypeError('Object.isExtensible can only be called on Objects.');
            }
            // 2. Return the Boolean value of the [[Extensible]] internal property of O.
            var name = '';
            while (owns(object, name)) {
                name += '?';
            }
            object[name] = true;
            var returnValue = owns(object, name);
            delete object[name];
            return returnValue;
        };
    }

}));

(function () {

    if (!window.Element) {
        Element = function () {
        };

        Element.prototype.matches = function (el, selector) {
            var parent = el.parentNode
            var match = query(selector, parent)
            var len = match.length

            if (parent) {
                if (len) {
                    while (len--) {
                        if (match[len] == el) {
                            return true
                        }
                    }
                    return false
                } else {
                    return false
                }
            } else {
                var parent = document.createElement('div')
                parent.appendChild(el)
                match = query(selector, parent)
                parent.removeChild(el)
                return !!match.length
            }
        }
    }

    if (!window.CSSStyleDeclaration) {
        window.CSSStyleDeclaration = function () {
        };

        CSSStyleDeclaration.prototype.getProperty = function (a) {
            return this.getAttribute(a);
        };

        CSSStyleDeclaration.prototype.setProperty = function (a, b) {
            return this.setAttribute(a, b);
        };

        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
    }
}());
// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Known Issues:
//
// * Patterns are not implemented.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {

    (function () {

        // alias some functions to make (compiled) code shorter
        var m = Math;
        var mr = m.round;
        var ms = m.sin;
        var mc = m.cos;
        var abs = m.abs;
        var sqrt = m.sqrt;

        // this is used for sub pixel precision
        var Z = 10;
        var Z2 = Z / 2;

        /**
         * This funtion is assigned to the <canvas> elements as element.getContext().
         * @this {HTMLElement}
         * @return {CanvasRenderingContext2D_}
         */
        function getContext() {
            return this.context_ ||
                (this.context_ = new CanvasRenderingContext2D_(this));
        }

        var slice = Array.prototype.slice;

        /**
         * Binds a function to an object. The returned function will always use the
         * passed in {@code obj} as {@code this}.
         *
         * Example:
         *
         *   g = bind(f, obj, a, b)
         *   g(c, d) // will do f.call(obj, a, b, c, d)
         *
         * @param {Function} f The function to bind the object to
         * @param {Object} obj The object that should act as this when the function
         *     is called
         * @param {*} var_args Rest arguments that will be used as the initial
         *     arguments when the function is called
         * @return {Function} A new function that has bound this
         */
        function bind(f, obj, var_args) {
            var a = slice.call(arguments, 2);
            return function () {
                return f.apply(obj, a.concat(slice.call(arguments)));
            };
        }

        var G_vmlCanvasManager_ = {
            init: function (opt_doc) {
                if (/MSIE/.test(navigator.userAgent) && !window.opera) {
                    var doc = opt_doc || document;
                    // Create a dummy element so that IE will allow canvas elements to be
                    // recognized.
                    doc.createElement('vancanvas');
                    doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
                }
            },

            init_: function (doc) {

                if (!doc.namespaces) {
                    return;
                }

                // create xmlns
                if (!doc.namespaces['g_vml_']) {
                    doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml',
                        '#default#VML');

                }
                if (!doc.namespaces['g_o_']) {
                    doc.namespaces.add('g_o_', 'urn:schemas-microsoft-com:office:office',
                        '#default#VML');
                }

                // Setup default CSS.  Only add one style sheet per document
                if (!doc.styleSheets['ex_canvas_']) {
                    var ss = doc.createStyleSheet();
                    ss.owningElement.id = 'ex_canvas_';
                    ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
                        // default size is 300x150 in Gecko and Opera
                        'text-align:left;width:300px;height:150px}' +
                        'g_vml_\\:*{behavior:url(#default#VML)}' +
                        'g_o_\\:*{behavior:url(#default#VML)}';

                }

                // find all canvas elements
                var els = doc.getElementsByTagName('vancanvas');
                for (var i = 0; i < els.length; i++) {
                    this.initElement(els[i]);
                }
            },

            /**
             * Public initializes a canvas element so that it can be used as canvas
             * element from now on. This is called automatically before the page is
             * loaded but if you are creating elements using createElement you need to
             * make sure this is called on the element.
             * @param {HTMLElement} el The canvas element to initialize.
             * @return {HTMLElement} the element that was created.
             */
            initElement: function (el) {
                if (!el.getContext) {

                    el.getContext = getContext;

                    // Remove fallback content. There is no way to hide text nodes so we
                    // just remove all childNodes. We could hide all elements and remove
                    // text nodes but who really cares about the fallback content.
                    el.innerHTML = '';

                    // do not use inline function because that will leak memory
                    el.attachEvent('onpropertychange', onPropertyChange);
                    el.attachEvent('onresize', onResize);

                    var attrs = el.attributes;
                    if (attrs.width && attrs.width.specified) {
                        // TODO: use runtimeStyle and coordsize
                        // el.getContext().setWidth_(attrs.width.nodeValue);
                        el.style.width = attrs.width.nodeValue + 'px';
                    } else {
                        el.width = el.clientWidth;
                    }
                    if (attrs.height && attrs.height.specified) {
                        // TODO: use runtimeStyle and coordsize
                        // el.getContext().setHeight_(attrs.height.nodeValue);
                        el.style.height = attrs.height.nodeValue + 'px';
                    } else {
                        el.height = el.clientHeight;
                    }
                    //el.getContext().setCoordsize_()
                }
                return el;
            }
        };

        function onPropertyChange(e) {
            var el = e.srcElement;

            switch (e.propertyName) {
                case 'width':
                    el.style.width = el.attributes.width.nodeValue + 'px';
                    el.getContext().clearRect();
                    break;
                case 'height':
                    el.style.height = el.attributes.height.nodeValue + 'px';
                    el.getContext().clearRect();
                    break;
            }
        }

        function onResize(e) {
            var el = e.srcElement;
            if (el.firstChild) {
                el.firstChild.style.width = el.clientWidth + 'px';
                el.firstChild.style.height = el.clientHeight + 'px';
            }
        }

        G_vmlCanvasManager_.init();

        // precompute "00" to "FF"
        var dec2hex = [];
        for (var i = 0; i < 16; i++) {
            for (var j = 0; j < 16; j++) {
                dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
            }
        }

        function createMatrixIdentity() {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];
        }

        function matrixMultiply(m1, m2) {
            var result = createMatrixIdentity();

            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    var sum = 0;

                    for (var z = 0; z < 3; z++) {
                        sum += m1[x][z] * m2[z][y];
                    }

                    result[x][y] = sum;
                }
            }
            return result;
        }

        function copyState(o1, o2) {
            o2.fillStyle = o1.fillStyle;
            o2.lineCap = o1.lineCap;
            o2.lineJoin = o1.lineJoin;
            o2.lineWidth = o1.lineWidth;
            o2.miterLimit = o1.miterLimit;
            o2.shadowBlur = o1.shadowBlur;
            o2.shadowColor = o1.shadowColor;
            o2.shadowOffsetX = o1.shadowOffsetX;
            o2.shadowOffsetY = o1.shadowOffsetY;
            o2.strokeStyle = o1.strokeStyle;
            o2.globalAlpha = o1.globalAlpha;
            o2.arcScaleX_ = o1.arcScaleX_;
            o2.arcScaleY_ = o1.arcScaleY_;
            o2.lineScale_ = o1.lineScale_;
        }

        function processStyle(styleString) {
            var str, alpha = 1;

            styleString = String(styleString);
            if (styleString.substring(0, 3) == 'rgb') {
                var start = styleString.indexOf('(', 3);
                var end = styleString.indexOf(')', start + 1);
                var guts = styleString.substring(start + 1, end).split(',');

                str = '#';
                for (var i = 0; i < 3; i++) {
                    str += dec2hex[Number(guts[i])];
                }

                if (guts.length === 4 && styleString.substr(3, 1) === 'a') {
                    alpha = guts[3];
                }
            } else {
                str = styleString;
            }

            return {color: str, alpha: alpha};
        }

        function processLineCap(lineCap) {
            switch (lineCap) {
                case 'butt':
                    return 'flat';
                case 'round':
                    return 'round';
                case 'square':
                default:
                    return 'square';
            }
        }

        /**
         * This class implements CanvasRenderingContext2D interface as described by
         * the WHATWG.
         * @param {HTMLElement} surfaceElement The element that the 2D context should
         * be associated with
         */
        function CanvasRenderingContext2D_(surfaceElement) {
            this.m_ = createMatrixIdentity();

            this.mStack_ = [];
            this.aStack_ = [];
            this.currentPath_ = [];

            // Canvas context properties
            this.strokeStyle = '#000';
            this.fillStyle = '#000';
            this.font = '12px sans-serif';

            this.lineWidth = 1;
            this.lineJoin = 'miter';
            this.lineCap = 'butt';
            this.miterLimit = Z * 1;
            this.globalAlpha = 1;
            this.canvas = surfaceElement;

            var el = surfaceElement.ownerDocument.createElement('div');
            el.style.width = surfaceElement.clientWidth + 'px';
            el.style.height = surfaceElement.clientHeight + 'px';
            // el.style.overflow = 'hidden';
            el.style.position = 'absolute';
            surfaceElement.appendChild(el);

            this.element_ = el;
            this.arcScaleX_ = 1;
            this.arcScaleY_ = 1;
            this.lineScale_ = 1;
        }

        var contextPrototype = CanvasRenderingContext2D_.prototype;
        contextPrototype.clearRect = function () {
            this.element_.innerHTML = '';
        };

        contextPrototype.beginPath = function () {
            // TODO: Branch current matrix so that save/restore has no effect
            //       as per safari docs.
            this.currentPath_ = [];
        };

        contextPrototype.moveTo = function (aX, aY) {
            var p = this.getCoords_(aX, aY);
            this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
            this.currentX_ = p.x;
            this.currentY_ = p.y;
        };

        contextPrototype.lineTo = function (aX, aY) {
            var p = this.getCoords_(aX, aY);
            this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

            this.currentX_ = p.x;
            this.currentY_ = p.y;
        };

        contextPrototype.bezierCurveTo = function (aCP1x, aCP1y,
                                                   aCP2x, aCP2y,
                                                   aX, aY) {
            var p = this.getCoords_(aX, aY);
            var cp1 = this.getCoords_(aCP1x, aCP1y);
            var cp2 = this.getCoords_(aCP2x, aCP2y);
            bezierCurveTo(this, cp1, cp2, p);
        };

        // Helper function that takes the already fixed cordinates.
        function bezierCurveTo(self, cp1, cp2, p) {
            self.currentPath_.push({
                type: 'bezierCurveTo',
                cp1x: cp1.x,
                cp1y: cp1.y,
                cp2x: cp2.x,
                cp2y: cp2.y,
                x: p.x,
                y: p.y
            });
            self.currentX_ = p.x;
            self.currentY_ = p.y;
        }

        contextPrototype.quadraticCurveTo = function (aCPx, aCPy, aX, aY) {
            // the following is lifted almost directly from
            // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

            var cp = this.getCoords_(aCPx, aCPy);
            var p = this.getCoords_(aX, aY);

            var cp1 = {
                x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
                y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
            };
            var cp2 = {
                x: cp1.x + (p.x - this.currentX_) / 3.0,
                y: cp1.y + (p.y - this.currentY_) / 3.0
            };

            bezierCurveTo(this, cp1, cp2, p);
        };

        contextPrototype.arc = function (aX, aY, aRadius,
                                         aStartAngle, aEndAngle, aClockwise) {
            aRadius *= Z;
            var arcType = aClockwise ? 'at' : 'wa';

            var xStart = aX + mc(aStartAngle) * aRadius - Z2;
            var yStart = aY + ms(aStartAngle) * aRadius - Z2;

            var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
            var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

            // IE won't render arches drawn counter clockwise if xStart == xEnd.
            if (xStart == xEnd && !aClockwise) {
                xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                                 // that can be represented in binary
            }

            var p = this.getCoords_(aX, aY);
            var pStart = this.getCoords_(xStart, yStart);
            var pEnd = this.getCoords_(xEnd, yEnd);

            this.currentPath_.push({
                type: arcType,
                x: p.x,
                y: p.y,
                radius: aRadius,
                xStart: pStart.x,
                yStart: pStart.y,
                xEnd: pEnd.x,
                yEnd: pEnd.y
            });

        };

        contextPrototype.rect = function (aX, aY, aWidth, aHeight) {
            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
        };

        contextPrototype.strokeRect = function (aX, aY, aWidth, aHeight) {
            var oldPath = this.currentPath_;
            this.beginPath();

            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
            this.stroke();

            this.currentPath_ = oldPath;
        };

        contextPrototype.fillRect = function (aX, aY, aWidth, aHeight) {
            var oldPath = this.currentPath_;
            this.beginPath();

            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
            this.fill();

            this.currentPath_ = oldPath;
        };

        contextPrototype.createLinearGradient = function (aX0, aY0, aX1, aY1) {
            var gradient = new CanvasGradient_('gradient');
            gradient.x0_ = aX0;
            gradient.y0_ = aY0;
            gradient.x1_ = aX1;
            gradient.y1_ = aY1;
            return gradient;
        };

        contextPrototype.createRadialGradient = function (aX0, aY0, aR0,
                                                          aX1, aY1, aR1) {
            var gradient = new CanvasGradient_('gradientradial');
            gradient.x0_ = aX0;
            gradient.y0_ = aY0;
            gradient.r0_ = aR0;
            gradient.x1_ = aX1;
            gradient.y1_ = aY1;
            gradient.r1_ = aR1;
            return gradient;
        };

        contextPrototype.drawImage = function (image, var_args) {
            if (image.getContext) {
                this.element_.innerHTML += image.getContext("2d").element_.innerHTML;
            }
            var dx, dy, dw, dh, sx, sy, sw, sh;

            // to find the original width we overide the width and height
            var oldRuntimeWidth = image.runtimeStyle.width;
            var oldRuntimeHeight = image.runtimeStyle.height;
            image.runtimeStyle.width = 'auto';
            image.runtimeStyle.height = 'auto';

            // get the original size
            var w = image.width;
            var h = image.height;

            // and remove overides
            image.runtimeStyle.width = oldRuntimeWidth;
            image.runtimeStyle.height = oldRuntimeHeight;

            if (arguments.length === 3) {
                dx = arguments[1];
                dy = arguments[2];
                sx = sy = 0;
                sw = dw = w;
                sh = dh = h;
            } else if (arguments.length === 5) {
                dx = arguments[1];
                dy = arguments[2];
                dw = arguments[3];
                dh = arguments[4];
                sx = sy = 0;
                sw = w;
                sh = h;
            } else if (arguments.length === 9) {
                sx = arguments[1];
                sy = arguments[2];
                sw = arguments[3];
                sh = arguments[4];
                dx = arguments[5];
                dy = arguments[6];
                dw = arguments[7];
                dh = arguments[8];
            } else {
                throw Error('Invalid number of arguments');
            }

            var d = this.getCoords_(dx, dy);

            var w2 = sw / 2;
            var h2 = sh / 2;

            var vmlStr = [];

            var W = 10;
            var H = 10;

            // For some reason that I've now forgotten, using divs didn't work
            vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"',
                ' style="width:', W, 'px;height:', H, 'px;position:absolute;');

            // If filters are necessary (rotation exists), create them
            // filters are bog-slow, so only create them if abbsolutely necessary
            // The following check doesn't account for skews (which don't exist
            // in the canvas spec (yet) anyway.

            if (this.m_[0][0] !== 1 || this.m_[0][1]) {
                var filter = [];

                // Note the 12/21 reversal
                filter.push('M11=', this.m_[0][0], ',',
                    'M12=', this.m_[1][0], ',',
                    'M21=', this.m_[0][1], ',',
                    'M22=', this.m_[1][1], ',',
                    'Dx=', mr(d.x / Z), ',',
                    'Dy=', mr(d.y / Z), '');

                // Bounding box calculation (need to minimize displayed area so that
                // filters don't waste time on unused pixels.
                var max = d;
                var c2 = this.getCoords_(dx + dw, dy);
                var c3 = this.getCoords_(dx, dy + dh);
                var c4 = this.getCoords_(dx + dw, dy + dh);

                max.x = m.max(max.x, c2.x, c3.x, c4.x);
                max.y = m.max(max.y, c2.y, c3.y, c4.y);

                vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                    'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                    filter.join(''), ", sizingmethod='clip');")
            } else {
                vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
            }

            vmlStr.push(' ">',
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, 'px;',
                ' height:', Z * dh, 'px;"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

            this.element_.insertAdjacentHTML('BeforeEnd',
                vmlStr.join(''));
        };

        contextPrototype.stroke = function (aFill) {
            var lineStr = [];
            var lineOpen = false;
            var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
            var color = a.color;
            var opacity = a.alpha * this.globalAlpha;

            var W = 10;
            var H = 10;

            lineStr.push('<g_vml_:shape',
                ' filled="', !!aFill, '"',
                ' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
                ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                ' stroked="', !aFill, '"',
                ' path="');

            var newSeq = false;
            var min = {x: null, y: null};
            var max = {x: null, y: null};

            for (var i = 0; i < this.currentPath_.length; i++) {
                var p = this.currentPath_[i];
                var c;

                switch (p.type) {
                    case 'moveTo':
                        c = p;
                        lineStr.push(' m ', mr(p.x), ',', mr(p.y));
                        break;
                    case 'lineTo':
                        lineStr.push(' l ', mr(p.x), ',', mr(p.y));
                        break;
                    case 'close':
                        lineStr.push(' x ');
                        p = null;
                        break;
                    case 'bezierCurveTo':
                        lineStr.push(' c ',
                            mr(p.cp1x), ',', mr(p.cp1y), ',',
                            mr(p.cp2x), ',', mr(p.cp2y), ',',
                            mr(p.x), ',', mr(p.y));
                        break;
                    case 'at':
                    case 'wa':
                        lineStr.push(' ', p.type, ' ',
                            mr(p.x - this.arcScaleX_ * p.radius), ',',
                            mr(p.y - this.arcScaleY_ * p.radius), ' ',
                            mr(p.x + this.arcScaleX_ * p.radius), ',',
                            mr(p.y + this.arcScaleY_ * p.radius), ' ',
                            mr(p.xStart), ',', mr(p.yStart), ' ',
                            mr(p.xEnd), ',', mr(p.yEnd));
                        break;
                }


                // TODO: Following is broken for curves due to
                //       move to proper paths.

                // Figure out dimensions so we can do gradient fills
                // properly
                if (p) {
                    if (min.x == null || p.x < min.x) {
                        min.x = p.x;
                    }
                    if (max.x == null || p.x > max.x) {
                        max.x = p.x;
                    }
                    if (min.y == null || p.y < min.y) {
                        min.y = p.y;
                    }
                    if (max.y == null || p.y > max.y) {
                        max.y = p.y;
                    }
                }
            }
            lineStr.push(' ">');

            if (!aFill) {
                var lineWidth = this.lineScale_ * this.lineWidth;

                // VML cannot correctly render a line if the width is less than 1px.
                // In that case, we dilute the color to make the line look thinner.
                if (lineWidth < 1) {
                    opacity *= lineWidth;
                }

                lineStr.push(
                    '<g_vml_:stroke',
                    ' opacity="', opacity, '"',
                    ' joinstyle="', this.lineJoin, '"',
                    ' miterlimit="', this.miterLimit, '"',
                    ' endcap="', processLineCap(this.lineCap), '"',
                    ' weight="', lineWidth, 'px"',
                    ' color="', color, '" />'
                );
            } else if (this.fillStyle && typeof this.fillStyle == 'object') {
                var fillStyle = this.fillStyle;
                var angle = 0;
                var focus = {x: 0, y: 0};

                // additional offset
                var shift = 0;
                // scale factor for offset
                var expansion = 1;

                if (fillStyle.type_ == 'gradient') {
                    var x0 = fillStyle.x0_ / this.arcScaleX_;
                    var y0 = fillStyle.y0_ / this.arcScaleY_;
                    var x1 = fillStyle.x1_ / this.arcScaleX_;
                    var y1 = fillStyle.y1_ / this.arcScaleY_;
                    var p0 = this.getCoords_(x0, y0);
                    var p1 = this.getCoords_(x1, y1);
                    var dx = p1.x - p0.x;
                    var dy = p1.y - p0.y;
                    angle = Math.atan2(dx, dy) * 180 / Math.PI;

                    // The angle should be a non-negative number.
                    if (angle < 0) {
                        angle += 360;
                    }

                    // Very small angles produce an unexpected result because they are
                    // converted to a scientific notation string.
                    if (angle < 1e-6) {
                        angle = 0;
                    }
                } else {
                    var p0 = this.getCoords_(fillStyle.x0_, fillStyle.y0_);
                    var width = max.x - min.x;
                    var height = max.y - min.y;
                    focus = {
                        x: (p0.x - min.x) / width,
                        y: (p0.y - min.y) / height
                    };

                    width /= this.arcScaleX_ * Z;
                    height /= this.arcScaleY_ * Z;
                    var dimension = m.max(width, height);
                    shift = 2 * fillStyle.r0_ / dimension;
                    expansion = 2 * fillStyle.r1_ / dimension - shift;
                }

                // We need to sort the color stops in ascending order by offset,
                // otherwise IE won't interpret it correctly.
                var stops = fillStyle.colors_;
                stops.sort(function (cs1, cs2) {
                    return cs1.offset - cs2.offset;
                });

                var length = stops.length;
                var color1 = stops[0].color;
                var color2 = stops[length - 1].color;
                var opacity1 = stops[0].alpha * this.globalAlpha;
                var opacity2 = stops[length - 1].alpha * this.globalAlpha;

                var colors = [];
                for (var i = 0; i < length; i++) {
                    var stop = stops[i];
                    colors.push(stop.offset * expansion + shift + ' ' + stop.color);
                }

                // When colors attribute is used, the meanings of opacity and o:opacity2
                // are reversed.
                lineStr.push('<g_vml_:fill type="', fillStyle.type_, '"',
                    ' method="none" focus="100%"',
                    ' color="', color1, '"',
                    ' color2="', color2, '"',
                    ' colors="', colors.join(','), '"',
                    ' opacity="', opacity2, '"',
                    ' g_o_:opacity2="', opacity1, '"',
                    ' angle="', angle, '"',
                    ' focusposition="', focus.x, ',', focus.y, '" />');
            } else {
                lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
                    '" />');
            }

            lineStr.push('</g_vml_:shape>');

            this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
        };

        contextPrototype.fill = function () {
            this.stroke(true);
        }

        contextPrototype.closePath = function () {
            this.currentPath_.push({type: 'close'});
        };

        /**
         * @private
         */
        contextPrototype.getCoords_ = function (aX, aY) {
            var m = this.m_;
            return {
                x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
                y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
            }
        };

        contextPrototype.save = function () {
            var o = {};
            copyState(this, o);
            this.aStack_.push(o);
            this.mStack_.push(this.m_);
            this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
        };

        contextPrototype.restore = function () {
            copyState(this.aStack_.pop(), this);
            this.m_ = this.mStack_.pop();
        };

        function matrixIsFinite(m) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 2; k++) {
                    if (!isFinite(m[j][k]) || isNaN(m[j][k])) {
                        return false;
                    }
                }
            }
            return true;
        }

        function setM(ctx, m, updateLineScale) {
            if (!matrixIsFinite(m)) {
                return;
            }
            ctx.m_ = m;

            if (updateLineScale) {
                // Get the line scale.
                // Determinant of this.m_ means how much the area is enlarged by the
                // transformation. So its square root can be used as a scale factor
                // for width.
                var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
                ctx.lineScale_ = sqrt(abs(det));
            }
        }

        contextPrototype.translate = function (aX, aY) {
            var m1 = [
                [1, 0, 0],
                [0, 1, 0],
                [aX, aY, 1]
            ];

            setM(this, matrixMultiply(m1, this.m_), false);
        };

        contextPrototype.rotate = function (aRot) {
            var c = mc(aRot);
            var s = ms(aRot);

            var m1 = [
                [c, s, 0],
                [-s, c, 0],
                [0, 0, 1]
            ];

            setM(this, matrixMultiply(m1, this.m_), false);
        };

        contextPrototype.scale = function (aX, aY) {
            this.arcScaleX_ *= aX;
            this.arcScaleY_ *= aY;
            var m1 = [
                [aX, 0, 0],
                [0, aY, 0],
                [0, 0, 1]
            ];

            setM(this, matrixMultiply(m1, this.m_), true);
        };

        contextPrototype.transform = function (m11, m12, m21, m22, dx, dy) {
            var m1 = [
                [m11, m12, 0],
                [m21, m22, 0],
                [dx, dy, 1]
            ];

            setM(this, matrixMultiply(m1, this.m_), true);
        };

        contextPrototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
            var m = [
                [m11, m12, 0],
                [m21, m22, 0],
                [dx, dy, 1]
            ];

            setM(this, m, true);
        };

        /******** STUBS ********/
        contextPrototype.clip = function () {
            // TODO: Implement
        };

        contextPrototype.arcTo = function () {
            // TODO: Implement
        };

        contextPrototype.createPattern = function () {
            return new CanvasPattern_;
        };

        contextPrototype.measureText = function (textToDraw) {
            var hiddenSpan = document.createElement('span');
            hiddenSpan.style.font = this.font;
            hiddenSpan.innerHTML = textToDraw;
            var bodyNode = document.getElementsByTagName("body")[0];
            bodyNode.appendChild(hiddenSpan);
            var width = hiddenSpan.offsetWidth;
            bodyNode.removeChild(hiddenSpan);
            return {"width": width + 1};
        }

        contextPrototype.fillText = function (textToDraw, x, y) {
            var vmlStr = [];
            var textHeightStr = this.font.split("px")[0].replace(/(^\s+)|(\s+$)/g, "");
            var textHeight = /^\d+$/.test(textHeightStr) ? parseInt(textHeightStr) : 0;
            vmlStr.push('<g_vml_:shape style="font:' + this.font + ';',
                ' color:' + this.fillStyle + ';',
                ' position:absolute;',
                ' left:' + x + 'px;',
                ' top:' + (y - textHeight) + 'px;',
                ' width:' + this.measureText(textToDraw).width + 'px;',
                ' height:' + textHeight + 'px;"',
                ' ><g_vml_:textbox inset="0,0,0,0">' + textToDraw,
                ' </g_vml_:textbox>',
                '</g_vml_:shape>');

            this.element_.insertAdjacentHTML('BeforeEnd', vmlStr.join(''));
        }

        // Gradient / Pattern Stubs
        function CanvasGradient_(aType) {
            this.type_ = aType;
            this.x0_ = 0;
            this.y0_ = 0;
            this.r0_ = 0;
            this.x1_ = 0;
            this.y1_ = 0;
            this.r1_ = 0;
            this.colors_ = [];
        }

        CanvasGradient_.prototype.addColorStop = function (aOffset, aColor) {
            aColor = processStyle(aColor);
            this.colors_.push({
                offset: aOffset,
                color: aColor.color,
                alpha: aColor.alpha
            });
        };

        function CanvasPattern_() {
        }

        // set up externs
        VanCanvasManager = G_vmlCanvasManager_;
        CanvasRenderingContext2D = CanvasRenderingContext2D_;
        CanvasGradient = CanvasGradient_;
        CanvasPattern = CanvasPattern_;

    })();

} // if
// SimpleChart.start
/*
 * 图表Report端的展示控件, 用于在Report指定位置dom上 展示u图表.
 */
FR.SimpleChart = FR.extend(FR.Widget, {
    type: "simplechart",

    _init: function () {
        FR.SimpleChart.superclass._init.apply(this, arguments);

        var o = this.options;

        this.curChart = null;
        this.chartArray = [];

        this.width = o.chartWidth || 0;
        this.height = o.chartHeight || 0;

        if (this.width <= 0 || this.height <= 0) {
            return;
        }

        this.isNeedRefreshButton = !!o.isNeedRefreshButton;

        var selectedIndex = o.selectedIndex == undefined ? 0 : o.selectedIndex;
        this.selectedIndex = selectedIndex;

        if(this.element) {
            this.element.css('position', 'relative').css('width', this.width + 'px').css('height', this.height + 'px');
        }

        this.isNeedBackgroundGlyph = false;
        if ((o && o.items && o.items.length > 1) || this.isNeedRefreshButton){
            this.isNeedBackgroundGlyph = true;
        }

        FR.Chart.WebUtils._storeChartWidget(this, this.options.chartpainter_id_web_change_selected);
        this.changeChartImage(selectedIndex);

    },

    resize: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        var idx = this.selectedIndex;

        this.element.css({
            width: this.width,
            height: this.height
        });

        if (this.curChart.chartType == "div") {
            if (this.curChart.chartWidth != this.width
                || this.curChart.chartHeight != this.height) {
                var ids = FR.Chart.WebUtils._getChartIDAndIndex(this.options.items[idx].simpleChartInShowID);
                var chartSet = FR.ChartManager[ids[0]];
                this.curChart.css("width", this.width).css("height", this.height);
                chartSet[idx].resize(this.width, this.height);
                this.curChart.chartWidth = this.width;
                this.curChart.chartHeight = this.height;
            }
            var fineChart = FR.Chart.WebUtils.getChart(this.options.items[idx].simpleChartInShowID);
            if(fineChart){
                fineChart.refresh();
            }
        } else {
            if (this.curChart.chartWidth != this.width
                || this.curChart.chartHeight != this.height) {
                this.curChart.css("width", this.width).css("height", this.height);
                this.curChart.chartWidth = this.width;
                this.curChart.chartHeight = this.height;
            }
        }
    },

    destroy:function() {

        if (this.curChart.chartType === "div") {
            var idx = this.selectedIndex;
            var fineChart = FR.Chart.WebUtils.getChart(this.options.items[idx].simpleChartInShowID);

            if(fineChart){
                fineChart.clearAll && fineChart.clearAll();
            }
        }

        this.vanchartwidget && this.vanchartwidget.remove();
    },

    getChartItems:function(){
        return this.options.items;
    },

    changeChartImage: function (idx) {
        if (idx < 0 || idx >= this.options.items.length) {
            return;
        }

        if(this.selectedIndex != idx) {
            this.selectedIndex = idx;

            var FRSessionID = FR.SessionMgr.getSessionID();
            if(FRSessionID) {// kunsnat: BI的图表使用不需要此切换, 并且FRSessionID 为空.
                FR.ajax({
                    type: "POST",
                    url: FR.servletURL,
                    data: {
                        op: 'chart',
                        cmd: 'change_selected',
                        selectedValue: idx,
                        chartpainter_id_web_change_selected: this.options.chartpainter_id_web_change_selected,
                        chartID: this.options.items[idx].simpleChartInShowID
                    },
                    headers: {
                        sessionID: FRSessionID
                    },
                    async: false,
                    complete: function (res) {
                    }
                });
            }
        }

        if (!this.chartArray[idx]) {
            var url =  this.options.items[idx].url;
            var id = "Chart__" + this.options.items[idx].simpleChartInShowID;

            // kunsnat: 用于判断是否加载动态图表的div
            var isJS = this.options.items[idx].isJS;
            if (isJS) {
                var width = this.width;
                var height = this.height;

                var div = $("<div>");
                div.attr('id',id);
                div.appendTo(this.element);
                div.css('position', 'relative').css('background-color', 'transparent')
                    .css('width', width).css('height', height)
                    .css('left', 0 ).css('top', 0)
                    .css('onselectstart', false).css('userinteractionenabled', 'no');
                this.element.append(div.html());

                var self = this;
                FR.ajax({
                    type:'GET',
                    dataType:'json',
                    url: FR.servletURL + url,
                    data: {__time: new Date().getTime()},
                    beforeSend: function () {
                        // 开始加载动画
                        FR.HtmlLoader.loadingEffect({
                            el: div,
                            show: true,
                            delay: 1000,
                            loadingType: 'local'  // 局部加载动画
                        });
                    },
                    complete: function(result, status){
                        if (status === "success"){
                            var res = FR.jsonDecode(result.responseText);

                            // jim:火狐下面异步总是立刻跳过来执行啊，导致自适应布局调整图表控件大小时，
                            //web端会出现图表边框线不断变化，闪屏的感觉，先加个延迟了

                            var chartName = res.wrapperName;
                            if(chartName){
                                res.AnimateAttr = self.options.AnimateAttr;

                                if(res && res.wrapperName == "VanChartWrapper") {
                                    //轮播切换时，options数组是this.options.chartAttr.options
                                    var option = res.chartAttr || {};
                                    var optionArray = option.options;
                                    var scale = (optionArray && $.isArray(optionArray) && optionArray.length) ? optionArray[0].scale : option.scale;
                                    option.fontScale = scale;
                                }

                                if ($.browser.mozilla) {
                                    setTimeout( function () {
                                        self.vanchartwidget = new VanChartWidget(res, div);
                                    }, 200);
                                } else {
                                    self.vanchartwidget = new VanChartWidget(res, div);
                                }

                            }
                        } else {
                            self.element.html(result.responseText);
                        }

                        // 结束加载动画
                        if (FR.Browser.isIE9Later()) {
                            setTimeout(function () {
                                FR.HtmlLoader.loadingEffect({
                                    el: div,
                                    overflow:'hidden'
                                });
                            }, 200);
                        } else {
                            FR.HtmlLoader.loadingEffect({
                                el: div,
                                overflow:'hidden'
                            });
                        }
                    }
                });
                this.chartArray[idx] = div;
                this.chartArray[idx].chartType = "div";// kunsnat: 标记chartType, 是用的div还是image
                this.chartArray[idx].chartWidth = width;
                this.chartArray[idx].chartHeight = height;
            } else {
                var $image = $("<img src='" + url + "'/>").css("width", this.width).css("height", this.height)
                    .css('border-width', 0)// ie 强制0
                    .attr("idx", idx).css('position', 'relative').css('top', 0).css('left', 0);
                if($.browser.msie) {
                    var $msbox = $("<div>"); // kunsnat: IE6 加图片会有一层灰色背景, // 如果用滤镜, 则不支持事件点击.

                    this.chartArray[idx] = $image.appendTo($msbox);
                } else {
                    this.chartArray[idx] = $image.appendTo(this.element);
                }

                this.chartArray[idx].chartType = "img";
                this.chartArray[idx].chartWidth = this.width;
                this.chartArray[idx].chartHeight = this.height;
                // 添加热点地图
                if (this.options.items[idx].usemap && this.options.items[idx].mapHtml) {
                    this.chartArray[idx].attr("usemap", this.options.items[idx].usemap);
                    if ($.browser.msie) {
                        $msbox.append(this.options.items[idx].mapHtml);
                    } else {
                        this.element.append(this.options.items[idx].mapHtml);
                    }
                }
                if ($.browser.msie) {
                    this.element.append($msbox.html());
                    this.chartArray[idx] = $("img[idx='" + idx + "']", this.element);
                }

                if(this.isNeedBackgroundGlyph){
                    var background = new FR.Chart.BackgroundGlyph(this.element,this.getChartItems(),this.selectedIndex,this.isNeedRefreshButton,{width:this.width, height:this.height});
                    background.init4MouseHandler();
                    background.chartWidget = this;
                }
            }
        }

        this.chartArray[idx].idxNumber = idx;
        if (this.curChart) {
            if (this.curChart.idxNumber == idx) {
                if (this.curChart.chartType == "div") {
                    if (this.curChart.chartWidth != this.width
                        || this.curChart.chartHeight != this.height) {
                        var ids = FR.Chart.WebUtils._getChartIDAndIndex(this.options.items[idx].simpleChartInShowID);
                        var chartSet = FR.ChartManager[ids[0]];
                        chartSet[idx].resize(this.width, this.height);
                        this.curChart.chartWidth = this.width;
                        this.curChart.chartHeight = this.height;
                    }
                    var fineChart = FR.Chart.WebUtils.getChart(this.options.items[idx].simpleChartInShowID);
                    if(fineChart){
                        fineChart.refresh();
                    }
                }

                return;
            } else {
                if (this.curChart.chartWidth != this.width
                    || this.curChart.chartHeight != this.height) {
                    this.curChart.css("width", this.width).css("height",
                        this.height);
                    this.curChart.chartWidth = this.width;
                    this.curChart.chartHeight = this.height;
                }
            }
        }
        var next = this.chartArray[idx];

        if (this.curChart) {
            if (this.curChart.chartType == "div") {
                this.curChart.css('display', "none");
                if (next.chartType == "div") {
                    next.css('width', this.width + "px")
                        .css('height', this.height + 'px').css('display',
                            "");
                    this.curChart = next;
                    if (this.curChart.isNotFirstShow) {
                        if (this.curChart.chartWidth != this.width
                            || this.curChart.chartHeight != this.height) {
                            var ids = FR.Chart.WebUtils._getChartIDAndIndex(this.options.items[idx].simpleChartInShowID);
                            var chartSet = FR.ChartManager[ids[0]];
                            chartSet[idx].resize(this.width, this.height);
                            this.curChart.chartWidth = this.width;
                            this.curChart.chartHeight = this.height;
                        }
                        var fineChart = FR.Chart.WebUtils.getChart(this.options.items[idx].simpleChartInShowID);
                        if(fineChart){
                            fineChart.refresh();
                        }
                    } else {
                        this.curChart.isNotFirstShow = true;
                    }
                } else {
                    next.css("width", this.width).css("height", this.height)
                        .css('display', "").css({
                            opacity: 0.0
                        }).animate({
                            opacity: 1.0
                        }, 150, function () {
                        this.curChart = next;
                    }.createDelegate(this));
                }
            } else {
                this.curChart.css('display', 'none');// kunsnat: 10230 直接消失,初始图片到动态时 无法出现

                if (next.chartType == "div") {
                    next.css("width", this.width + "px")
                        .css("height", this.height + "px").css('display', "");
                    this.curChart = next;
                    if (this.curChart.isNotFirstShow) {
                        if (this.curChart.chartWidth != this.width
                            || this.curChart.chartHeight != this.height) {
                            var ids = FR.Chart.WebUtils._getChartIDAndIndex(this.options.items[idx].simpleChartInShowID);
                            var chartSet = FR.ChartManager[ids[0]];
                            chartSet[idx].resize(this.width, this.height);
                            this.curChart.chartWidth = this.width;
                            this.curChart.chartHeight = this.height;
                        }
                        var fineChart = FR.Chart.WebUtils.getChart(this.options.items[idx].simpleChartInShowID);
                        if(fineChart){
                            fineChart.refresh();
                        }
                    } else {
                        this.curChart.isNotFirstShow = true;
                    }
                } else {
                    next.css("width", this.width).css("height", this.height)
                        .css('display', "").css({
                            opacity: 0.0
                        }).animate({
                            opacity: 1.0
                        }, 150, function () {
                        this.curChart = next;
                    }.createDelegate(this));
                }
            }

        } else {
            if (next.chartType == "div") {
                next.isNotFirstShow = true;
                this.curChart = next;
            } else {
                next.css({
                    opacity: 1.0
                });
                this.curChart = next;
            }
        }
    }
});
$.shortcut("simplechart", FR.SimpleChart);
// simplechart end
;(function($){
    /**
     * 图表 表单初始化控件, 用于在Form指定位置 展示图表
     *
     *     @example
     *     var $root = $('<div>').appendTo('body');
     *     var chart = new FR.ChartWidget({}, $root);
     *
     * @class FR.ChartWidget
     */
    FR.ChartWidget = FR.extend(FR.Widget, /**@class FR.ChartWidget*/{
        _init: function () {
            FR.ChartWidget.superclass._init.apply(this, arguments);
            this.marginWidth = parseInt(this.options.marginLeft || 0) + parseInt(this.options.marginRight || 0);
            this.marginHeight = parseInt(this.options.marginTop || 0) + parseInt(this.options.marginBottom || 0);
            this.loadData();
            this._init4Style();
        },

        /**
         * 初始化布局样式，包括背景，边框，圆角
         * @private
         */
        _init4Style: function () {
            this._initBackGround();
            this._initChartBorder();
        },

        _initMargin: function ($chartWidget) {
            if (this.options.marginTop) {
                $chartWidget.css('marginTop', this.options.marginTop);
            }
            if (this.options.marginLeft) {
                $chartWidget.css('marginLeft', this.options.marginLeft);
            }
            if (this.options.marginBottom) {
                $chartWidget.css('marginBottom', this.options.marginBottom);
            }
            if (this.options.marginRight) {
                $chartWidget.css('marginRight', this.options.marginRight);
            }
        },

        _initChartBorder: function(){
            var border = this.options.border;
            if (border && !this.options.noBorderRender) {
                this.element.css('border-style', border.type);
                this.element.css('border-color', border.color);
                this.element.css('border-width', border.width);
                this.element.css('border-radius', border.borderRadius);
            }
        },

        _initBackGround: function () {
        	//设置控件背景
            if (!this.options.widgetBackground) {
            	return;
            }

            //因为有透明度, 如果直接设置opacity属性, 会被子层div继承, 因此平级放一个背景div
            // 无论是否有透明度，都平级放一个背景div。
            // 因为ie兼容模式下FR.setBackground用的一个单独的img标签，addChartComp时element.empty()会把背景给去掉
            this.$background = $("<div class='widgetBackground'></div>");
            this.$background.prependTo(this.element);
            this.$background.css('position', 'absolute');
            FR.setBackground(this.$background,  this.options.widgetBackground, this.element.height());

            var alpha = this.options.widgetOpacity;
            if(alpha === undefined){
            	return;
            }

        	//IE
            this.$background.css('filter', 'alpha(opacity=' + alpha * 100  +')');
            //Chrome ff
            this.$background.css('opacity', alpha);


        },
        /**
         * 加载数据
         */
        loadData: function () {
            var o = this.options;
            if (o.width && o.height) {
                this.element.width(o.width);
                this.element.height(o.height);
                this.reload();
            }
        },

        /**
         * 设置依赖参数 重新加载
         * @param source 依赖参数
         */
        setSource: function (source) {
            this.options.dependPara = source;
            this.reload();
        },

        /**
         * 返回依赖参数 宽度 高度
         * @returns {Json} 依赖参数
         */
        getDependence: function () {
            if (this.options.dependPara) {
                // 说明
                var depO = this.options.dependPara;
                depO.width = this.options.width;
                depO.height = this.options.height;
                delete this.options.dependPara;
                return depO;
            }

            var depO = {};
            if (FR.isArray(this.options.widgetExeDependence)) {
                for (var idx = 0; idx < this.options.widgetExeDependence.length; idx++) {
                    var dep = this.options.widgetExeDependence[idx];
                    var val = this.options.form.resolveVariable(dep);
                    if (val != "fr_primitive" && val != null) {
                        depO[dep.toUpperCase()] = val;
                    }
                }
            }
            return {
                para: depO,
                width: this.options.width,
                height: this.options.height
            };
        },

        //表单计算联动的图表, 表单其他控件联动图表一定会发请求，忽略oldDependence
        executeChart: function () {
            this.chartWidget && this.chartWidget.destroy && this.chartWidget.destroy();
            this.reload(true);
        },

        /**
         * 重新加载
         */
        reload: function (ignoreOldDependence) {

            //图表组件的宽度存在，并且大于0，然后reload
            var width = this.options.width, height = this.options.height;
            if (!width || !height || width < 0 || height < 0) {
                return;
            }

            var resizeTime = new Date();
            this.lastResizeTime = resizeTime;
            var self = this;
            setTimeout(function () {
                if (resizeTime == self.lastResizeTime) {
                	delete self.lastResizeTime;
    	            var dep = self.getDependence();
			        if (FR.equals(self.oldDependence, dep) && !ignoreOldDependence) {
			            return;
			        }

			        self.oldDependence = dep;

		            var para = {};
                    //对表单中图表para的处理参照报表块
                    //form.js collectionValue
		            for (var w in dep.para) {
		                var value = dep.para[w];
		                if (w.startWith("$")) {
		                    w = w.substring(1)
		                }
                        if (value == undefined) {
                            value = null;
                        }
		                para[w] = value;
		            }
		            var sourceUrl = FR.buildServletUrl({
		                op: 'fr_form',
		                cmd: 'form_getsource',
                        __chartsourcename__: self.options.widgetName,
                        __chartsize__: {
                            width: self.options.width - self.marginWidth,
                            height: self.options.height - self.marginHeight
                        }
		            });
		            //不同步，firefox下加载时，背景会闪动
		            FR.ajax({
		                url: sourceUrl,
		                type: 'POST',
		                data: {
		                    __parameters__: FR.jsonEncode(para)
		                },
                        headers: {
                            sessionID: self.options.form.sessionID
                        },
		                // 数据量很大的时候，这里的Ajax请求时间很长
		                // 这里加一个fr的loading,缓解一下请求过程中页面空白的尴尬
		                beforeSend: function() {
                            // 开始加载动画
                            FR.HtmlLoader.loadingEffect({
                                el: self.element,
                                show: true,
                                fixed: false,
                                delay: 1000,
                                loadingType: 'local'  // 局部加载动画
                            });
		                },
		                complete: function (res, status) {
		                    if (!res.responseText) {
		                        return;
		                    }
		                    if (status == 'success') {
		                        self.chart = FR.jsonDecode(res.responseText);
		                        if(self.chart.length === 0){
		                        	self.element.html(res.responseText);
		                        	return;
		                        }
                                self.chart.AnimateAttr = self.options.AnimateAttr;

                                self.addChartComp();

                                var animateProcessor = FR.Report.Plugin.AnimateProcessor;
                                if (animateProcessor.item && FR.Plugin.validLevel(animateProcessor, animateProcessor.item)) {
                                    animateProcessor.item.action.call(self, self.element);
                                }

                                FR.HtmlLoader.loadingEffect({
                                    el: self.element,
                                    overflow:'hidden'
                                });
		                    }
		                }
		            });
                }
            }, 100);
        },

        /**
         * 添加图表控件
         */
        addChartComp: function () {
            if (!this.chart) {
                return;
            }
            try {
                this.chartWidget = FR.createWidget(this.chart, !!FR.SimpleChart);
            } catch(e) {
                this.chartWidget = new FR.SimpleChart(this.chart);
            }
            var widgetCopyright = this.element.children(".widget-copyrightInfo-div");
            this.element.empty();
            var widgetWidth = this.chart.chartWidth + this.marginWidth;
            var widgetHeight = this.chart.chartHeight + this.marginHeight;
            if(this.$background) {
                this.$background.css({
                    //@Mango CHART-1776，修改下获取宽高方式，之前获取方式有问题，会影响搜索框样式。。
                    width: widgetWidth,
                    height: widgetHeight
                });
                this.$background.appendTo(this.element);
            }
            this._initMargin(this.chartWidget.element);
            this.chartWidget.element.css('z-index', 1);
            this.chartWidget.element.appendTo(this.element);
            if (widgetCopyright.length > 0) {
                widgetCopyright.appendTo(this.element)
            }
        },


        //图表超链表单对象 表单对象为图表块
        formHyperlink: function () {
            var params = arguments[0];
            params.idInfo = {
                type: "CHART_EDITOR",
                name: params.widgetName
            };
            FR.Chart.WebUtils.changeParameter(params);
        },

        /**
         * 重置
         */
        reset: function () {
            this.reload();
        },

        /**
         * 重新设定大小
         * @param size
         */
        doResize: function (size) {
	        if (this.options.width == size.width
	            && this.options.height == size.height) {
	            return;
	        }
            var resizeTime = new Date();
            this.lastResizeTime = resizeTime;
            var self = this;
            setTimeout(function () {
                if (resizeTime == self.lastResizeTime) {
                	delete self.lastResizeTime;

                	// 表单图表控件的边框阴影是画在框架外部，即上层div中画，有标题的话不单独画
			    	if (!(FR.Browser.isIE && FR.Browser.isIE8Before()) && self.options.border) {
			    		//初始化时候父元素为空，resize时加上
			        	self.element.parent().css('box-shadow', self.options.border.borderStyle);
			        }

                    //REPORT-27528 这边需要更新下图表块隐藏时宽高为0的情形
                    if (size.width >= 0) {
                        self.options.width = size.width;
                        self.element.width(size.width);
                    }
                    if (size.height >= 0) {
                        self.options.height = size.height;
                        self.element.height(size.height);
                    }

                    if (self.$background) {
                        self.$background.css('width', size.width);
                        self.$background.css('height', size.height);
                    }
                    if (self.chartWidget) {
                        self.chartWidget.resize(size.width - self.marginWidth, size.height - self.marginHeight);
                    }else{
                        self.reload();
                    }

                }
            }, 100);
        }
    });
    $.shortcut("chartwidget", FR.ChartWidget);
})(jQuery);
;(function ($) {

    FR.ChartCprWidget = FR.extend(FR.Widget, {

        _init: function () {

            FR.ChartCprWidget.superclass._init.apply(this, arguments);

            var o = this.options;

            this.element
                .css('position', 'relative')
                .css('width', o.chartWidth + 'px')
                .css('height', o.chartHeight + 'px');

            var chartOpt = o.options.chartAttr;

            //cpr预览去掉工具栏
            var optArray = chartOpt.options ? chartOpt.options : [chartOpt];
            for (var i = 0, len = optArray.length; i < len; i++) {
                optArray[i].tools = {enabled: false};
            }

            var chart = VanCharts.init(this.element[0], {fontScale:chartOpt.fontScale})

            chart.setOptions(chartOpt);

        },

        resize: function() {

        }

    });

    $.shortcut("chartcprwidget", FR.ChartCprWidget);

})(jQuery);


;(function ($) {

    FR.ChartCprFormWidget = FR.extend(FR.Widget, {

        _init: function () {

            FR.ChartCprFormWidget.superclass._init.apply(this, arguments);

            var o = this.options;

            this.element
                .css('position', 'relative')
                .css('width', o.chartWidth + 'px')
                .css('height', o.chartHeight + 'px');

            if (!this.options.items || !this.options.items.length) {
                return;
            }

            var url = this.options.items[0].url;
            var self = this;

            FR.ajax({
                type: 'GET',
                dataType: 'json',
                url: FR.servletURL + url,
                data: {__time: new Date().getTime()},
                complete: function (result, status) {
                    if (status === "success") {

                        var res = FR.jsonDecode(result.responseText);

                        var chartOpt = res.chartAttr;

                        //cpr预览去掉工具栏
                        var optArray = chartOpt.options ? chartOpt.options : [chartOpt];
                        for (var i = 0, len = optArray.length; i < len; i++) {
                            optArray[i].tools = {enabled: false};
                        }

                        self.chart = VanCharts.init(self.element[0], {fontScale:chartOpt.fontScale});
                        self.chart.setOptions(chartOpt);
                    }
                }
            });

        },

        resize: function(width, height) {

            this.element
                .css('width', width + 'px')
                .css('height', height + 'px');

            this.chart && this.chart.resize();

        }

    });

    $.shortcut("chartcprformwidget", FR.ChartCprFormWidget);

})(jQuery);
function VanChartWidget(options, dom) {

    if (options.requiredJS) {
        for (var i = 0; i < options.requiredJS.length; i++) {
            FR.$defaultImport(options.requiredJS[i], 'js');
        }
    }

    if (options.requiredCSS) {
        for (var i = 0; i < options.requiredCSS.length; i++) {
            FR.$defaultImport(options.requiredCSS[i], 'css');
        }
    }

    FR.Chart.WebUtils.importFineChartJS(options.wrapperName);

    this.options = options;

    if (window[options.wrapperName]) {
        this.chartWrapper = new window[options.wrapperName](options, dom);
    } else if (Van.FRChartBridge[options.wrapperName]) {
        this.chartWrapper = new Van.FRChartBridge[options.wrapperName](options, dom);
    }

}

VanChartWidget.prototype.resize = function () {

    this.chartWrapper && this.chartWrapper.resize();

};

VanChartWidget.prototype.setAutoFitScale = function (fontScale, wScale, hScale) {

    if (this.chartWrapper && this.chartWrapper.setAutoFitScale) {

        this.chartWrapper.setAutoFitScale(fontScale, wScale, hScale);

    } else {

        this.resize();

    }

};

VanChartWidget.prototype.refresh = function (options) {

};

VanChartWidget.prototype.changeParameter = function (para) {

    var animateType = para.animateType || para.ANIMATETYPE,
        dealChartAjaxFnName = FR.Chart.WebUtils.getDealChartAjaxFnName(animateType);

    this.chartWrapper && this.chartWrapper[dealChartAjaxFnName](para);
};

VanChartWidget.prototype.remove = function () {
    this.chartWrapper && this.chartWrapper.chartID && FR.Chart.WebUtils._clearChart(this.chartWrapper, this.chartWrapper.chartID);

    this.options = this.chartWrapper = null;
};



Van = window.Van || {};Van.Cst=window.Van.Cst||{};Van.Cst.ChartKeyCst=Van.Cst.ChartKeyCst||{};Van.Cst.Condition=Van.Cst.Condition||{};Van.Cst.Condition.SERIES_INDEX="seriesIndex";Van.Cst.Condition.SERIES_COLOR="seriesColor";Van.Cst.Condition.SERIES_SYMBOL="seriesSymbol";Van.Cst.LineMap=Van.Cst.LineMap||{};Van.Cst.LineMap.CURVATURE="curvature";Van.Cst.AreaMap=Van.Cst.AreaMap||{};Van.Cst.AreaMap.NULL_COLOR="nullColor";Van.Cst.Mark=Van.Cst.Mark||{};Van.Cst.Mark.TYPE="type";Van.Cst.MapLayer=Van.Cst.MapLayer||{};Van.Cst.MapLayer.TYPE="type";Van.Cst.MapLayer.URL="url";Van.Cst.MapLayer.ATTRIBUTION="attribution";Van.Cst.MapLayer.WMS_LAYERS="wmsLayers";Van.Cst.MapLayer.MIN_ZOOM="minZoom";Van.Cst.MapLayer.MAX_ZOOM="maxZoom";Van.Cst.FieldID=Van.Cst.FieldID||{};Van.Cst.FieldID.MULTI_PIE_LEGEND_NAME="LEGEND_NAME";Van.Cst.Data=Van.Cst.Data||{};Van.Cst.Data.FIELD_ID="fieldID";Van.Cst.Data.CONDITION="condition";Van.Cst.Data.DATA="data";Van.Cst.ChartAttr=Van.Cst.ChartAttr||{};Van.Cst.ChartAttr.TITLE="title";Van.Cst.ChartAttr.BACKGROUND="background";Van.Cst.ChartAttr.PLOT_BACKGROUND="plotBackground";Van.Cst.ChartAttr.MAP_LAYER="mapLayer";Van.Cst.SwitchStyle=Van.Cst.SwitchStyle||{};Van.Cst.Common=Van.Cst.Common||{};Van.Cst.Common.CHART_ID_INFO="idInfo";Van.Cst.Common.WRAPPER_NAME="wrapperName";Van.Cst.Common.REQUIRED_JS="requiredJS";Van.Cst.Common.REQUIRED_CSS="requiredCSS";Van.Cst.Common.CHART_ATTR="chartAttr";
/**
 * Created by mengao on 2017/11/6.
 */
/**
 *
 * 各种web静态的方法. webUtils
 * Web资源管理 辅助类.
 * @class FR.Chart.WebUtils
 *
 */

FR.Chart = FR.Chart || {};

var DIV_CONTAINER;

$.extend(FR.Chart, /**FR.Chart*/{

    WebUtils: /**@class FR.Chart.WebUtils*/{

        /**
         * 根据图表类型名称确定是否需要加载老图表用的的js
         * @static
         * @param chartName 图表类型名称
         */
        importFineChartJS: function (chartName) {
            //老图表预览，需要导入老图表相关的JS文件
            if (chartName === "FineChart") {
                FR.$defaultImport('/com/fr/web/core/js/chart.utils.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.constants.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.shape.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.plotattr.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.axisglyph.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.datapoint.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.dataseries.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.glyph.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.legend.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.datasheet.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.handler.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.tooltip.js', 'js');
                FR.$defaultImport('/com/fr/web/core/js/chart.finechart.js', 'js');
            }
        },

        /**
         * 获取指定的图表集合中当前展示的图表
         * @para name 图表的名字
         * @returns {*} FineChart对象
         */
        getChart: function (name, ecName) {
            if (name.indexOf("__index__") >= 0) {
                name = name.substring(0, name.indexOf("__index__"));
            }
            var chartCollection = this._getChartCollection(name, ecName);
            if (chartCollection) {
                var index = chartCollection.Widget ? chartCollection.Widget.curChart.idxNumber : 0;
                if (chartCollection[index]) {
                    return chartCollection[index];
                }
            }
        },

        getChartWidget: function (name) {
            if (name.indexOf("__index__") >= 0) {
                name = name.substring(0, name.indexOf("__index__"));
            }
            var chartCollection = this._getChartCollection(name);
            if (chartCollection && chartCollection.Widget) {
                return chartCollection.Widget;
            }
        },

        _relateChart: function (params, fnName) {
            if (!params) {
                return;
            }

            if (params.idInfo) {
                var bridge = Van.Utils.getChartBridge(params.idInfo);
                if (bridge) {
                    bridge[fnName](params.para);
                    return;
                }
            }

            var chartID = params.chartID,
                para = params.para,
                ecName = params.ecName,
                sheetIndex = params.sheetIndex;


            if (!chartID && params.idInfo) {
                //兼容 9.0vancharts预览方式 或者是图表插件 联动
                chartID = params.idInfo.name;
                ecName = params.idInfo.ecName;
                sheetIndex = params.idInfo.sheetIndex;
            }

            if (!chartID) {
                return;
            }

            var chartSet = this._getChartCollection(chartID, ecName, sheetIndex);

            if (chartSet) {
                $.each(chartSet, function (id, chart) {
                    if (chart !== chartSet.Widget && chart[fnName]) {
                        chart[fnName](para);
                    }
                });
            }
        },


        /**
         * 图表用的参数变化
         */
        changeParameter: function () {

            var params = arguments[0];

            if (arguments.length === 2) {//兼容 用户模板 自定义js里面用到
                params = {chartID: arguments[0], para: arguments[1]};
            }

            if (!params) {
                return;
            }

            this._relateChart(params, this.getDealChartAjaxFnName(params.animateType));
        },

        getDealChartAjaxFnName: function (animateType) {
            switch (animateType) {
                case 'reload'://增量刷新
                case 'RELOAD':
                    return 'dealReloadChartAjax';
                case 'increment'://重新加载
                case 'INCREMENT':
                    return 'dealIncrementChartAjax';
                default:
                    return 'dealChartAjax';
            }
        },

        clearChartsWithECName: function (ecName) {
            if (FR.isEmpty(ecName)) {
                return;
            }

            this._clearCharts(function (chart) {
                return !FR.isEmpty(chart.ecName) && chart.ecName.toUpperCase() === ecName.toUpperCase();});
        },

        clearChartsWithSheetIndex: function (sheetIndex) {
            this._clearCharts(function (chart) {return chart.sheetIndex === sheetIndex;});
        },

        clearCharts: function () {
            this._clearCharts(function () {return true;});
            FR.ChartManager = null;
        },

        _clearCharts: function(filterFn) {
            if (FR.ChartManager) {
                for (var chartID in FR.ChartManager) {
                    var chartSet = FR.ChartManager[chartID];
                    if (chartSet && chartSet.Widget) {
                        var curIndex = chartSet.Widget.curChart.idxNumber || 0;

                        if (chartSet[curIndex] && filterFn(chartSet[curIndex])) {
                            for (var index in chartSet) {
                                var chart = chartSet[index];
                                chart && chart.clearAll && chart.clearAll();// chart bridge or chart wrapper
                                chart && chart.destroy && chart.destroy();// chart widget
                            }

                            delete FR.ChartManager[chartID];
                        }
                    }
                }
            }

            //清空图表同时要把VanCharts.instances都清空
            if (VanCharts && VanCharts.instances) {
                var _instances = VanCharts.instances;

                for (var chartIndex in _instances) {
                    var vanCharts = _instances[chartIndex];

                    if (vanCharts && filterFn(vanCharts)) {
                        vanCharts.clear && vanCharts.clear();
                        delete _instances[chartIndex];
                    }
                }
            }

            if($.browser.msie) {
                if(CollectGarbage) {
                    CollectGarbage();
                }
            }
        },

        //eg:VanChartWrapper
        _clearChart: function (chart, chartID) {
            var ids = FR.Chart.WebUtils._getChartIDAndIndex(chartID);

            if (FR.ChartManager[ids[0]]) {
                delete FR.ChartManager[ids[0]];
            }

            chart && chart.clearAll && chart.clearAll();
        },

        /**
         * 清空 图表资源
         * @static
         */
        chartDelete: function () {
            if (FR.ChartManager && FR.ChartManager.length > 0) {
                $.each(FR.ChartManager, function (id, chartSet) {
                    if (FR.ChartManager[id]) {
                        FR.ChartManager[id] = null;
                    }
                });
            }

            FR.ChartManager = null;
        },

        //判断图表是否能够接着钻取
        mapHasNextLayer: function (name) {

            var fineChart = this.getChart(name);
            return fineChart ? fineChart.hasNextLayer() : false;

        },

        //兼容之前的名字
        chart_Change_Parameter: function () {
            if (arguments.length !== 3) {
                return;
            }
            var arg = arguments[0] + "__" + arguments[1];
            if (arg.startWith('Elems')) {
                arg = arguments[1];
            }
            //后面这边不加"__"会把Cells_G14_也归纳为条件Cells_G1
            arg += "__";
            this.changeParameter(arg, arguments[2]);
        },

        _getChartCollection: function (name, ecName, sheetIndex) {
            if (!FR.ChartManager) {
                return {};
            }
            var chartCollection = this._findChartCollectionWithFilter(this._filterECName, name, ecName, sheetIndex);

            if (!chartCollection) {
                //单元格超链信息中没有sheetIndex
                chartCollection = this._findChartCollectionWithFilter(function () {return true;}, name);
            }
            return chartCollection;
        },

        _findChartCollectionWithFilter: function (filter, name, ecName, sheetIndex) {
            var result = null;

            $.each(FR.ChartManager, function (id, chartSet) {

                if (name.indexOf('__') != -1) {
                    //兼容老的模版
                    if (id.indexOf(name) !== -1 && filter(ecName, sheetIndex, chartSet)) {
                        result = chartSet;
                    }

                } else {
                    if ($.inArray(name, id.split('__')) !== -1 && filter(ecName, sheetIndex, chartSet)) {
                        result = chartSet;
                    }
                }
            });

            return result;
        },

        _filterECName: function (ecName, sheetIndex, chartSet) {
            if (ecName || sheetIndex !== undefined) {
                var index = chartSet.Widget ? chartSet.Widget.curChart.idxNumber : 0;

                if (ecName) {//frm 报表块名称
                    return FR.equals((ecName + '').toLowerCase(), (chartSet[index].ecName + '').toLowerCase());
                } else if (sheetIndex !== undefined) {//cpt 多sheet
                    return parseInt(sheetIndex) === chartSet[index].sheetIndex;
                }
            }
            return true;
        },

        _initChartManager: function() {
            if (!FR.ChartManager) {
                FR.ChartManager = {};

                var oldunload = window.onunload;
                if(typeof window.onunload != 'function') {
                    window.onunload = function() {
                        FR.Chart.WebUtils.clearCharts();
                    }
                } else {
                    window.onunload = function() {
                        oldunload();
                        FR.Chart.WebUtils.clearCharts();
                    }
                }
            }
        },

        //eg:FR.SimpleChart
        _storeChartWidget: function (chart, chartID) {
            this._initChartManager();

            var ids = FR.Chart.WebUtils._getChartIDAndIndex(chartID);

            if (FR.ChartManager[ids[0]]) {
                delete FR.ChartManager[ids[0]];
            }
            var chartSet = FR.ChartManager[ids[0]] = {};
            chartSet = chartSet || {};
            chartSet.Widget = chart;
        },

        //eg:VanChartWrapper
        _storeChart: function (chart, chartID) {
            this._initChartManager();

            var ids = FR.Chart.WebUtils._getChartIDAndIndex(chartID);

            var chartSet = FR.ChartManager[ids[0]] = FR.ChartManager[ids[0]] || {};
            chartSet[ids[1]] = chart;
        },

        /**
         * @Deprecated 用_storeChartWidget和_storeChart替代
         * 不能删除的原因：兼容老的第三方图表接口
         * 将图表,图表控件加入到ChartManager中
         * @static
         * @param chart 图表
         * @param chartID 图表id
         */
        _installChart: function (chart, chartID) {

            if (FR.Widget && chart instanceof FR.Widget){
                this._storeChartWidget(chart, chartID);
            } else {
                this._storeChart(chart, chartID);
                chart.inits();
            }
        },

        /**
         * 根据字符串得到图表的Cells__A1__A4 和 index
         * @static
         * @param id 图表id
         * @returns {Array} 返回对应的id, 序号资源数组.
         */
        _getChartIDAndIndex: function (id) {
            var str = id;
            var index = "";
            if (str.indexOf("__index__") >= 0) {
                index = str.substring(str.indexOf("__index__") + 9, str.length);
                str = str.substring(0, str.indexOf("__index__"));
            }
            if (str.indexOf("Chart") === 0 && str.indexOf("__") >= 0) {
                str = str.substring(str.indexOf("__") + 2, str.length);
            }
            return [str, index];
        },

        stringDimensionWidthDiv: function (text, font) {

            if (!DIV_CONTAINER) {
                DIV_CONTAINER = document.createElement("div");
                document.body.appendChild(DIV_CONTAINER);
            }

            DIV_CONTAINER.style.cssText = '';

            DIV_CONTAINER.style.visibility = "hidden";
            DIV_CONTAINER.style.whiteSpace = "nowrap";
            DIV_CONTAINER.style.position = 'absolute';
            DIV_CONTAINER.style.display = '';

            DIV_CONTAINER.style.fontFamily = font.fontName;
            DIV_CONTAINER.style.fontSize = font.size + 'px';
            DIV_CONTAINER.style.fontWeight = font.style;

            DIV_CONTAINER.innerHTML = text;

            var width = DIV_CONTAINER.offsetWidth || 0;
            var height = DIV_CONTAINER.offsetHeight || 0;
            var size = {width: width, height: height};

            DIV_CONTAINER.style.display = 'none';
            return size;
        }

    }
});
/**
 * Created by shine on 2019/7/2.
 * describe:
 */
!(function () {
    window.Van = window.Van || {};

    Van.Utils = Van.Utils || {};

    Van.Utils.initFRVan = function () {
        Van.FRChartBridge = Van.FRChartBridge || {};
        Van.FRChartBridge.Cache = Van.FRChartBridge.Cache || [];
    };

    Van.Utils.storeChartBridge = function (chartBridge) {
        Van.FRChartBridge.Cache.push(chartBridge);
    };

    /**
     * 获取前端图表对象
     * @param idInfo 图表标志信息
     * idInfo详情:
     *   {
     *      name:'chart0',        //必选。图表块名称 chart0 || 悬浮图表名称 Float0 || 所在单元格 A1。
     *      type:'CHART_EDITOR',  //可选。cpt-单元格图表 CPT_CELL_CHART || cpt-悬浮图表 FLOAT_CHART ||  frm-图表块 CHART_EDITOR || frm-报表块-单元格图表 FORM_EC_CELL_CHART。
     *      sheetIndex:0,         //可选。sheet下标。
     *      ecName:'report0'      //可选。图表所在报表块名称。
     *   }
     * @returns chartBridge前端图表对象
     */
    Van.Utils.getChartBridge = function (idInfo) {
        var result = null;

        if (!idInfo || FR.isEmpty(idInfo.name)) {
            return result;
        }

        var expandCellChart = function (id) {
            return !FR.isEmpty(id.originCellPosition) && id.name !== id.originCellPosition;
        };

        var propsEquals = function (props, bridgeIdInfo) {
            var equals = true;
            props.forEach(function (t) {
                equals = equals && (idInfo[t] === undefined || bridgeIdInfo[t] === idInfo[t]);
            });
            return equals;
        };

        Van.FRChartBridge.Cache.forEach(function (bridge) {

            var nameEquals = propsEquals(["name"], bridge.idInfo);

            if (expandCellChart(bridge.idInfo) && !expandCellChart(idInfo)) {
                //接口调用 单元格扩展图表 name指的是原始单元格位置originCellPosition
                nameEquals = idInfo.name === bridge.idInfo.originCellPosition;
            }

            if (nameEquals && propsEquals(["type", "sheetIndex", "ecName"], bridge.idInfo)) {
                result = bridge;
                return false;
            }
        });

        return result;
    };

    Van.Utils.clearCache = function (chartBridge) {
        Van.FRChartBridge.Cache.remove(chartBridge);
    };

    Van.Utils.doLinkWithFilter = function (bridgeChart, params, data, filter) {

        if (bridgeChart.options.doFineHyperlink) {

            bridgeChart.options.doFineHyperlink(bridgeChart._linkClickEvent(params), data, function (array) {
                return filter ? array.filter(filter) : array;
            });

            return;
        }

        var self = bridgeChart;

        FR.ajax({
            type: 'POST',
            url: FR.servletURL + '?op=chart&cmd=calculate_hyperlink',
            data: data,
            headers: {
                sessionID: FR.SessionMgr.getSessionID()
            },
            dataType: 'json',
            success: function (array) {
                if (array && array.length) {
                    if (filter) {
                        array = array.filter(filter);
                    }
                    FR.doHyperlink(self._linkClickEvent(params), array, true);
                }
            }
        });

    };

    /**
     * vanchart 超链
     * @param params  like:{x:华东,y:100,...}
     * @returns {*|{chartIndex, linkKey, linkParas, __time}}
     */
    Van.Utils.createLinkData4VanChart = function (params) {
        this.specialDealParams4VanChart(params);
        var hyperlink = params.hyperLink;
        return this.createLinkData(params, hyperlink);
    };

    //vanchart+第三方图表 超链 自动播放 等共用
    Van.Utils.createLinkData = function (params, hyperLink) {

        if (hyperLink && hyperLink.parasMap) {

            var parasMap = hyperLink.parasMap || [];

            var parameters = {};
            parasMap.forEach(function (para) {
                var props = para.props || [];
                var value = params;
                props.forEach(function (prop) {
                    value && (value = value[prop]);
                });

                var key = para.key;
                if (key && value !== undefined) {
                    parameters[key] = value;
                }
            });

            return {
                'chartIndex': params.chartIndex,
                'linkKey': params.linkKey,
                'linkParas': parameters,
                '__time': new Date().getTime()
            };
        }

    };

    //对vanchart里面的组合图 钻取目录等特殊处理的东西
    Van.Utils.specialDealParams4VanChart = function (params) {
        var linkKey, vanchart;
        if (params.linkKey === 'dTools') {//钻取目录
            linkKey = params.linkKey;
            vanchart = params.vanchart;
        } else {
            var series = params.series, pointOptions = params.options;
            linkKey = series.type;//normal
            if (pointOptions.plotIndex !== null && pointOptions.plotIndex !== undefined) {
                linkKey = pointOptions.plotIndex;//组合图
            }
            vanchart = series.vanchart;
        }
        vanchart = vanchart.vancharts.fullScreenFather || vanchart;

        var vancharts = vanchart.vancharts.charts;
        var chartIndex = 0;
        for (var i = 0; i < vancharts.length; i++) {
            if (vancharts[i] === vanchart) {
                chartIndex = i;
            }
        }

        var hyperLink = vanchart.options.hyperLink || [];

        params.hyperLink = hyperLink[linkKey];
        params.linkKey = linkKey;
        params.chartIndex = chartIndex;

        var options = params.options || {}, originalCategory = options.originalCategory,
            originalCategoryArray = options.originalCategoryArray;
        if (originalCategory && !originalCategoryArray) {
            //单个分类 后台没有往前台传分类数组
            //超链参数 设置分类数组 在此用分类构造分类数组
            options.originalCategoryArray = [originalCategory];
        }
    }

})();
Van.Utils.initFRVan();

Van.FRChartBridge.AbstractChart = function (options, dom) {
    if (options && dom) {
        this.options = options || {};
        this.dom = $(dom[0]);

        this.width = dom.width() || options.width;
        this.height = dom.height() || options.height;

        this.inits();

        return this;
    }
};

Van.FRChartBridge.AbstractChart.extend = function (props) {

    var NewClass = function () {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    //将父类的prototype取出并复制到NewClass的__super__ 静态变量中
    var parentProto = NewClass.__super__ = this.prototype;
    var proto = Object.create(parentProto); //复制parentProto到proto中
    //protos是一个新的prototype对象
    proto.constructor = NewClass;
    NewClass.prototype = proto;　//到这完成继承

    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
            NewClass[i] = this[i];
        }
    }

    _extend(proto, props); //将参数复制到NewClass的prototype中

    return NewClass;
};

function _extend(dest) {
    var i, j, len, src;

    for (j = 1, len = arguments.length; j < len; j++) {
        src = arguments[j];
        for (i in src) {
            dest[i] = src[i];
        }
    }
    return dest;
}

Van.FRChartBridge.AbstractChart.prototype = {
    initialize: Van.FRChartBridge.AbstractChart,

    inits: function () {

        this._store();

        this._createChart();

        this.autoRefresh();
    },

    _store: function () {
        //todo@shine 扩展图表发布之后整理下前端相关js
        this.chartID = this.options.chartID;

        this.sheetIndex = this.options.sheetIndex || 0;
        this.ecName = this.options.ecName || '';

        FR.Chart.WebUtils._storeChart(this, this.chartID);

        this.idInfo = this.options[Van.Cst.Common.CHART_ID_INFO];
        Van.Utils.storeChartBridge(this, this.idInfo);
    },

    _createChart: function () {

        this.clear();

        var op = this.options[Van.Cst.Common.CHART_ATTR];

        this.chart = this._init(this.dom[0], op);

        this._addTrialLicenseWater();
    },

    _addTrialLicenseWater: function() {
        //水印
        var chartAttr = this.options.chartAttr, dom = this.dom;
        if (chartAttr && chartAttr.trialLicenseWater) {
            var water = chartAttr.trialLicenseWater;
            Van.Helper.addTrialLicenseWater(dom, water);

            clearInterval(this.waterTimer);
            this.waterTimer = setInterval(function () {
                Van.Helper.addTrialLicenseWater(dom, water);
            }, 5 * 60 * 1000);
        }
    },

    /**
     * TODO 很经典的一个问题, FR的联动都是直接remove && reInit
     * 导致的之前的图表的自动刷新没有被暂停, Dom等全部释放不掉..........
     * 最合理的做法, 在联动的时候，把旧的ChartWrapper destroy掉
     * 以前VanCharts那边的做法是每次Init都去FR._chartAutoRefreshTimers里面清除不存在的Chart对应的Timer
     * 也算是一种解决方案吧
     * 这里先用这种containsNode的判断去处理, 后面研究下怎么实现第一种
     * @private
     */
    _checkDomExist: function () {
        var domNode = this.dom && this.dom[0];
        return domNode && document.body.contains(domNode);
    },


    // default empty function for handle callback in chartWidget.resize
    refresh: function () {
    },

    resize: function () {

        if (this.chart && this.chart.resize) {

            this.chart.resize();

        } else {

            // @CHART-3346  没有实现resize的图表，清空Dom重新实例化图表
            this.clear();

            this._createChart();
        }

    },

    clear: function () {
        this.chart && this.chart.clear && this.chart.clear();
        this.chart && this.chart.remove && this.chart.remove();
        this.chart && this.chart.dispose && this.chart.dispose();   // TODO 统一约定一下
        this.chart = null;

        clearInterval(this.waterTimer);
        this.waterTimer = null;

        // @CHART-4884
        // 这个问题的根本还是一些特殊的内存资源释放不掉
        // 这里比较明显的就是频繁的删除和新建webGLContext, 浏览器为了限制内存
        // 在页面内的WebGLContext多于一定数目的时候, 浏览器会自动释放掉旧的context
        // 使得render那边抛出` Too many active WebGL contexts. Oldest context will be lost `的警告
        // 这里在clearChart的时候, 统一做一下 loseContext的操作, 保证页面中正在运行的context不会被自动释放掉
        // 具体的图表在clear的时候, 还不确定是不是能够完全的将资源释放掉
        // 后面可能需要搞个专题测试一下
        // 此处改动主要参考自
        // https://github.com/pixijs/pixi.js/issues/2233#issuecomment-181650433
        var canvasArr = this.dom[0].getElementsByTagName('canvas');
        for (var i = 0; i < canvasArr.length; i++) {
            var webGLContext = canvasArr[i].getContext('webgl');
            webGLContext && webGLContext.getExtension('WEBGL_lose_context').loseContext()
        }

        this.dom.empty();
    },

    //动态参数刷新整个页面前会clearCharts
    clearAll: function () {
        this.clear();
        Van.Utils.clearCache(this);
    },

    getLinkFun: function () {
        return this._doLink.bind(this);
    },

    //图表超链
    //params:点击图形的数据信息的对象
    _doLink: function (params) {
        var hyperLink = params.hyperLink || this.options.chartAttr.hyperLink;

        this._doLinkWithFilter(params, hyperLink);
    },

    _doLinkWithFilter: function (params, hyperLink, filter) {

        if (hyperLink && hyperLink.parasMap) {

            var data = Van.Utils.createLinkData(params, hyperLink);

            $.extend(data, this.idInfo);

            Van.Utils.doLinkWithFilter(this, params, data, filter);
        }
    },

    _linkClickEvent: function (params) {
        return params.event;
    },

    //自动刷新
    autoRefresh: function () {
        var self = this, refreshTime = this.options.chartAttr.refreshTime || 0;

        if (refreshTime > 0) {
            this._autoRefreshTimer = setInterval(function () {
                if (self._checkDomExist()) {
                    self._refreshChart();
                } else {
                    clearInterval(self._autoRefreshTimer);
                    self.clear(); // 手动释放图表资源
                }
            }, refreshTime)
        }
    },

    //xxx联动图表（图表使用的参数para改变）
    dealChartAjax: function (para) {
        this._refreshChart(para);
    },

    _refreshChart: function (para, success) {
        para = para || {};

        var data = {
            'chartWidth': this.width || 0,
            'chartHeight': this.height || 0,
            '__time': new Date().getTime()
        };

        $.extend(data, para, this.idInfo);

        var self = this;

        if (!success) {
            success = function (chartRelateJS) {
                self._refreshOptions(chartRelateJS);
            }
        }

        FR.ajax({
            type: 'POST',
            url: FR.servletURL + '?op=chartlink&cmd=refresh_relate_data',
            data: data,
            headers: {
                sessionID: FR.SessionMgr.getSessionID()
            },
            dataType: 'json',
            beforeSend: function () {
                // 开始加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    show: true,
                    delay: 1000,
                    loadingType: 'local'  // 局部加载动画
                });
            },
            complete: function (result, status) {
                if (status === "success") {
                    result = FR.jsonDecode(result.responseText);
                    success(result);
                }

                // 结束加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    overflow: 'hidden'
                });
            }
        });
    },

    _refreshOptions: function (chartRelateJS) {
        var chartOp = chartRelateJS.chartAttr;

        if (this._refresh && this.chart) {
            //有刷新接口用刷新接口
            this._refresh(this.chart, chartOp);
            return;
        }

        //没有的话，先清空，再新建
        this.clear();

        this.options.chartAttr = chartOp;

        this._createChart();
    },

    _exportAsImage: function (index) {
        var data = {
            'sessionID': FR.SessionMgr.getSessionID(),
            'width': this.width || 0,
            'height': this.height || 0,
            'index': index,
            '__time': new Date().getTime()
        };

        $.extend(data, this.idInfo);

        var url = FR.servletURL + '?op=chart&cmd=export_image';

        for (var i in data) {
            url += ('&' + i + '=' + data[i]);
        }

        window.location = url;
    }
};

var BackgroundType = {
    COLOR: "color",
    GRADIENT: "gradient",
    IMAGE: "image"
};

var GradientDirection = {
    TO_TOP: "toTop",
    TO_LEFT: "toLeft",
    TO_RIGHT: "toRight",
    TO_BOTTOM: "toBottom"
};

function linearGradientAngle(direction, startColor, endColor) {

    switch (direction) {
        case GradientDirection.TO_TOP:
            return 0;
        case GradientDirection.TO_BOTTOM:
            return 180;
        case GradientDirection.TO_LEFT:
            return 270;
        case GradientDirection.TO_RIGHT:
            return 90;
    }
}


ExtendedChart = Van.FRChartBridge.AbstractChart.extend({

    _store: function () {
        var options = this.options;

        this.chartID = options.chartID;

        this.sheetIndex = options.sheetIndex || 0;
        this.ecName = options.ecName || '';

        FR.Chart.WebUtils._storeChart(this, this.chartID);
    },

    _createChart: function () {

        this.clear();

        var op = this.options.chartAttr;

        if (this._checkEmpty(op)) {
            this._addTrialLicenseWater();
            return;
        }

        this._dealChartBackground(op);

        this.chart = this._init(this._createInnerChartContainer(), op);

        this._checkEvent();

        this._addTrialLicenseWater();
    },

    _createInnerChartContainer: function() {
        var innerChartDomContainer = document.createElement('div');
        innerChartDomContainer.style.cssText = "position: absolute;width: 100%;height: 100%;";
        innerChartDomContainer.setAttribute('domname', 'innerChartContainer');
        this.dom[0].appendChild(innerChartDomContainer);
        return innerChartDomContainer;
    },

    _checkEmpty: function(chartAttr) {
        this.emptyDataRender && this.emptyDataRender.remove();

        if (this._emptyData(chartAttr)) {

            this.emptyDataRender = VanCharts.showEmptyDataTip({
                dom: this.dom[0],
                emptyDataTip: chartAttr.emptyDataTip,
                chartWidth: this.width,
                chartHeight: this.height,
                language: chartAttr.language
            });

            this._clearBackground();

            return true;
        }

        return false;
    },

    /**
     * TODO 很经典的一个问题, FR的联动都是直接remove && reInit
     * 导致的之前的图表的自动刷新没有被暂停, Dom等全部释放不掉..........
     * 最合理的做法, 在联动的时候，把旧的ChartWrapper destroy掉
     * 以前VanCharts那边的做法是每次Init都去FR._chartAutoRefreshTimers里面清除不存在的Chart对应的Timer
     * 也算是一种解决方案吧
     * 这里先用这种containsNode的判断去处理, 后面研究下怎么实现第一种
     * @private
     */
    _checkDomExist: function () {
        var domNode = this.dom && this.dom[0];
        return domNode && document.body.contains(domNode);
    },

    _checkEvent: function () {

        var self = this;

        if (!this.chart.on) {
            this.chart.on = function (eventType, fn) {
                self._events_ = self._events_ || {};

                var fnArray = self._events_[eventType] || [];

                fnArray.push(fn);

                self._events_[eventType] = fnArray;
            }
        }

        if (!this.chart.fire) {
            this.chart.fire = function (eventType, paras) {
                self._events_ = self._events_ || {};

                var fnArray = self._events_[eventType] || [];

                fnArray.forEach(function (fn) {
                    fn && fn.call(self, paras);
                })
            }
        }

        if (this.animateOverlap()) {
            this.chart.on('exitEnd', this._autoLink.bind(this));
        } else {
            this.chart.on('exitEnd', this._autoReloadLink.bind(this));
            this.chart.on('exitBegin', this._autoIncrementLink.bind(this));
        }
    },

    //return true。 动画重叠：指的是当前节点结束动画和下一个节点的初始动画是同时进行的。eg:目录齿轮、水球图、夜光仪表盘
    //默认 return false。动画不重叠：指的是当前节点结束动画完再进行下一个节点的初始动画。eg：轮播gis图、kpi、粒子计数器
    animateOverlap: function () {
        return false;
    },

    _emptyData: function (options) {
        return false;
    },

    hasBackground: function () {
        return false;
    },

    _clearBackground: function () {
        if (this._backgroundEl && this._backgroundEl.parentNode) {
            this._backgroundEl.parentNode.removeChild(this._backgroundEl);
        }
        this._backgroundEl = null;
    },

    // 预处理图表背景设置
    _dealChartBackground: function (originOp) {

        var background = originOp.background;
        var dom = this.dom[0];

        if (background && this.hasBackground()) {

            if (this._backgroundEl) {
                this._clearBackground();
            }

            this._backgroundEl = document.createElement('div');
            dom.insertBefore(this._backgroundEl, dom.firstChild);

            var opacity = originOp.opacity == null ? 1 : originOp.opacity;

            var backgroundValue = background.value,
                cssText = "position: absolute;width: 100%;height: 100%;top:0;left:0;";

            switch (background.type) {
                case BackgroundType.COLOR:
                    cssText += "background:" + backgroundValue + ";";
                    break;
                case BackgroundType.IMAGE:
                    cssText += "background:url(" + backgroundValue + ") no-repeat; background-size: cover;";
                    opacity = 1; // CHART-3192: 图片背景透明度不生效
                    break;
                case BackgroundType.GRADIENT:
                    cssText += [
                        "background: linear-gradient(",
                        linearGradientAngle(background.direction) + "deg,",
                        backgroundValue[0] + ",",
                        backgroundValue[1] + ");"
                    ].join("");
            }

            cssText += "opacity:" + opacity;

            this._backgroundEl.style.cssText = cssText;
        }

    },

    // default empty function for handle callback in chartWidget.resize
    refresh: function () {
    },

    resize: function () {

        if (this.chart && this.chart.resize) {

            this.chart.resize();

        } else {

            // @CHART-3346  没有实现resize的图表，清空Dom重新实例化图表
            this.clear();

            this._createChart();
        }

    },

    setAutoFitScale: function (fontScale, wScale, hScale) {
        this.width = this.dom.width() || this.width;
        this.height = this.dom.height() || this.height;
        this.resize();
    },

    clear: function () {
        this.chart && this.chart.clear && this.chart.clear();
        this.chart && this.chart.remove && this.chart.remove();
        this.chart && this.chart.dispose && this.chart.dispose();   // TODO 统一约定一下
        this.chart = null;

        var dom = this.dom[0];

        this._clearBackground();

        clearInterval(this.waterTimer);
        this.waterTimer = null;

        // @CHART-4884
        // 这个问题的根本还是一些特殊的内存资源释放不掉
        // 这里比较明显的就是频繁的删除和新建webGLContext, 浏览器为了限制内存
        // 在页面内的WebGLContext多于一定数目的时候, 浏览器会自动释放掉旧的context
        // 使得render那边抛出` Too many active WebGL contexts. Oldest context will be lost `的警告
        // 这里在clearChart的时候, 统一做一下 loseContext的操作, 保证页面中正在运行的context不会被自动释放掉
        // 具体的图表在clear的时候, 还不确定是不是能够完全的将资源释放掉
        // 后面可能需要搞个专题测试一下
        // 此处改动主要参考自
        // https://github.com/pixijs/pixi.js/issues/2233#issuecomment-181650433
        var canvasArr = dom.getElementsByTagName('canvas');
        for (var i = 0; i < canvasArr.length; i++) {
            var webGLContext = canvasArr[i].getContext('webgl');
            webGLContext && webGLContext.getExtension('WEBGL_lose_context').loseContext()
        }

        this.dom.empty();
    },

    //动态参数刷新整个页面前会clearCharts
    clearAll: function () {
        this.clear();
    },

    //调用前端库导出接口
    _exportChartImage: function () {
        if (!this._exportImage || !this.options.chartAttr.exportImage) {
            return;
        }
        var export_dom = document.createElement('div');
        export_dom.style.width = this.width + 'px';
        export_dom.style.height = this.height + 'px';

        var initFun = this._exportInit || this._init;
        var export_chart = initFun.bind(this)(export_dom, FR.clone(this.options.chartAttr));

        var self = this;
        setTimeout(function () {
            FR.ajax({
                type: 'POST',
                url: FR.servletURL + '?op=chart&cmd=save_export_image',
                data: {
                    chartID: self.chartID,
                    imageString: self._exportImage(export_chart)
                },
                headers: {
                    sessionID: FR.SessionMgr.getSessionID()
                },
                dataType: 'json'
            });
        }, 100);
    },

    getLinkFun: function () {
        return this._doLink.bind(this);
    },

    //图表超链
    //params:点击图形的数据信息的对象
    _doLink: function (params) {
        var hyperLink = params.hyperLink || this.options.chartAttr.hyperLink;

        this._doLinkWithFilter(params, hyperLink);
    },

    _getPopLinkID: function () {
        var chartPopLinkID = '';

        var chartWidget = FR.Chart.WebUtils.getChartWidget(this.chartID);
        if (chartWidget && chartWidget.options && chartWidget.options['ChartHyperlink_ID']) {
            //当前图表是： 超链-悬浮窗图表 对应的图表
            chartPopLinkID = chartWidget.options['ChartHyperlink_ID'];
        }

        return chartPopLinkID;
    },

    _doLinkWithFilter: function (params, hyperLink, filter) {

        if (hyperLink && hyperLink.parasMap) {

            var data = Van.Utils.createLinkData(params, hyperLink);

            $.extend(data, {
                'chartID': this.chartID,
                'sheetIndex': this.sheetIndex,
                'ecName': this.ecName,
                'ChartHyperlink_ID': this._getPopLinkID()
            }, this.idInfo);

            Van.Utils.doLinkWithFilter(this, params, data, filter);
        }
    },

    _linkClickEvent: function (params) {
        return params.event;
    },


    //执行所有超链 animateOverlap图表用
    _autoLink: function (params) {
        this._autoLinkWithFilter(params);
    },

    //执行 增量刷新动画超链 非animateOverlap图表用
    _autoIncrementLink: function (params) {
        this._autoLinkWithFilter(params, function (singleLink) {
            return (singleLink && singleLink.data && singleLink.data.indexOf("animateType:\'increment\'") > -1)
                || (singleLink && singleLink.javaScript && singleLink.javaScript.animateType && singleLink.javaScript.animateType.toLowerCase() === 'increment');
        });
    },

    //执行 重新加载动画超链 非animateOverlap图表用
    _autoReloadLink: function (params) {
        this._autoLinkWithFilter(params, function (singleLink) {
            return (singleLink && singleLink.data && singleLink.data.indexOf("animateType:\'reload\'") > -1)
                || (singleLink && singleLink.javaScript && singleLink.javaScript.animateType && singleLink.javaScript.animateType.toLowerCase() === 'reload');
        });
    },

    _autoLinkWithFilter: function (params, filter) {
        if (!this._checkDomExist()) {
            this.clear();
            return;
        }

        var autoLink = this.options.chartAttr.autoLink || {};

        params.linkKey = 'autoLink';
        this._doLinkWithFilter(params, autoLink, filter);
    },


    //xxx联动图表 图表动画为增量刷新
    dealIncrementChartAjax: function (para) {
        this._refreshChart(para, this._incrementRefresh.bind(this))
    },

    //平滑更新式的刷新 updateRefresh （大部分大屏图表为：不透明度由100%～0%，时间1s，函数ease）
    _incrementRefresh: function (relateChartList) {
        this.dom[0].className = 'bigscreen-fade-out-exit';
        var self = this;
        setTimeout(function () {
            self.clear();
            self.dom[0].className = ' ';

            self.options.chartAttr = relateChartList[0].chartAttr;

            self._createChart();
        }, 1000);
    },

    _reloadAnimate: function () {
        var animateProcessor = FR.Report.Plugin.AnimateProcessor;
        if (animateProcessor.item && FR.Plugin.validLevel(animateProcessor, animateProcessor.item)) {
            animateProcessor.item.action.call(this, this.dom.parent());
        }
    },

    //xxx联动图表 图表动画为重新加载
    dealReloadChartAjax: function (para) {
        this._reloadAnimate();
        this._refreshChart(para);
    },

    //自动刷新
    autoRefresh: function () {
        var self = this, refreshTime = this.options.chartAttr.refreshTime || 0;

        if (refreshTime > 0) {
            this._autoRefreshTimer = setInterval(function () {
                if (self._checkDomExist()) {
                    self._refreshChart();
                } else {
                    clearInterval(self._autoRefreshTimer);
                    self.clear(); // 手动释放图表资源
                }
            }, refreshTime)
        }
    },

    //xxx联动图表（图表使用的参数para改变）
    dealChartAjax: function (para) {
        this._refreshChart(para);
    },

    _refreshChart: function (para, success) {
        para = para || {};

        var data = {
            'chartID': this.chartID,
            'chartWidth': this.width || 0,
            'chartHeight': this.height || 0,
            'sheetIndex': this.sheetIndex,
            'ecName': this.ecName,
            '__parameters__': para,
            '__time': new Date().getTime()
        };

        $.extend(data, this.idInfo);

        var self = this;

        if (!success) {
            success = function (relateChartList) {
                self._refreshOptions(relateChartList[0].chartAttr);
            }
        }

        FR.ajax({
            type: 'POST',
            url: FR.servletURL + '?op=chartlink&cmd=refresh_relate_data',
            data: data,
            headers: {
                sessionID: FR.SessionMgr.getSessionID()
            },
            dataType: 'json',
            beforeSend: function () {
                // 开始加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    show: true,
                    delay: 1000,
                    loadingType: 'local'  // 局部加载动画
                });
            },
            complete: function (result, status) {
                if (status === "success") {
                    result =  FR.jsonDecode(result.responseText);
                    var attrList = result.relateChartList || result;

                    success(attrList);
                }

                // 结束加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    overflow: 'hidden'
                });
            }
        });
    },

    _refreshOptions: function (chartOp) {

        if (this._refresh && this.chart) {
            //有刷新接口用刷新接口
            this._refresh(this.chart, chartOp);
            return;
        }

        //图表自身的刷新请求成功后调用此方法，如果此时图表所在报表块刚好刷新把dom删掉了，就不用执行刷新操作了
        if (this._checkDomExist()) {

            //没有刷新接口的话，先清空，再新建
            this.clear();

            this.options.chartAttr = chartOp;

            this._createChart();
        }
    }

});


!(function () {
    window.Van = window.Van || {};
    window.Van.Helper = window.Van.Helper || {};
    window.Van.Helper.addTrialLicenseWater = function (chartEl, text) {

        var width = chartEl.width();

        var gap1 = 20, gap2 = 10, gap3 = 8;
        var frFont = {fontName: 'MicrosoftYaHei-Bold', size: 16},
            textDim = FR.Chart.WebUtils.stringDimensionWidthDiv(text, frFont);

        while (frFont.size >= 12 && textDim.width > width) {
            frFont.size--;
            textDim = FR.Chart.WebUtils.stringDimensionWidthDiv(text, frFont)
        }
        frFont.size = Math.max(frFont.size, 12);
        textDim = FR.Chart.WebUtils.stringDimensionWidthDiv(text, frFont);

        var r = gap1, b = gap1;

        var rectEl = chartEl.data('trail-lic-water-rect');
        var textEl = chartEl.data('trail-lic-water-text');
        if (rectEl) {
            rectEl.remove();
        }
        if (textEl) {
            textEl.remove();
        }

        rectEl = $("<div></div>");
        chartEl.data('trail-lic-water-rect', rectEl);
        chartEl.append(rectEl);

        rectEl.css({
            position: 'absolute',
            right: r,
            bottom: b,
            width: textDim.width + gap2 * 2,
            height: textDim.height + gap3 * 2,
            'background-color': '#007ED3',
            opacity: 0.5,
            'border-radius': '4px'
        });


        textEl = $("<div></div>");
        chartEl.data('trail-lic-water-text', textEl);
        chartEl.append(textEl);

        textEl.css({
            position: 'absolute',
            right: r + gap2,
            bottom: b + gap3,
            color: 'white',
            'font-family': frFont.fontName,
            'font-size': frFont.size
        });
        textEl[0].innerHTML = text;
    };
})();
/**
 * Created by eason on 15/8/26.
 */
VanChartWrapper = ExtendedChart.extend({
    _init: function (dom, option) {

        this.autoRefreshTime = this.options.autoRefreshTime || 0;

        option = this._bindOption(option);

        if (!dom.getAttribute('id')) {
            dom.setAttribute('id', this.chartID);
        }

        var chart = VanCharts.init(dom, {wScale:option.wScale, hScale:option.hScale, fontScale:option.fontScale || option.scale});
        option.wScale = option.hScale = option.fontScale = null;

        chart.setOptions(option);

        chart._fixSingleMapDom(dom, option);

        chart.sheetIndex = this.sheetIndex;
        chart.ecName = this.ecName;

        //兼容之前开的接口
        this.vanCharts = chart;

        this._bindLinkFun(chart);

        return chart;
    },

    _createInnerChartContainer: function() {
        return this.dom[0];
    },

    setAutoFitScale: function(fontScale, wScale, hScale) {

        this.chart && this.chart.setAutoFitScale(fontScale, wScale, hScale);

    },

    _bindLinkFun: function (chart) {
        chart.doHyperlink = this.getLinkFun();
    },

    _doLink: function (params) {
        Van.Utils.specialDealParams4VanChart(params);

        ExtendedChart.prototype._doLink.call(this, params);
    },

    _bindOption: function (option, index) {
        option = this._bindCursorOption(option);
        option = this._bindExportImageUrl(option, index);
        return option;
    },

    /**
     * 绑定drag和dragging的手型光标，用于IE下地图可以显示小手
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _bindCursorOption: function(options){
        var baseURL = window.FR && window.FR.servletURL;
        if(!baseURL){ return options; }

        var getCursorOp = function (){
            return {
                drag: baseURL + "?op=resource&resource=/com/fr/web/cursor/cursor_hand.cur",
                dragging: baseURL + "?op=resource&resource=/com/fr/web/cursor/cursor_drag_hand.cur"
            }
        };
        // 轮播图表
        if(options && FR.isArray(options.options)){
            for(var i = -1; ++i < options.options.length;){
                options.options[i].cursor = getCursorOp();
            }
        } else {   // 单个图表
            options.cursor = getCursorOp();
        }

        return options;
    },

    _bindExportImageUrl: function (options, index) {
        var baseURL = window.FR && window.FR.servletURL;
        if(!baseURL){ return options; }

        var self = this;
        var bindSingleOption = function (singleOption, i) {
            singleOption = singleOption || {};
            singleOption.tools = singleOption.tools || {};
            var params = 'sessionID=' + FR.SessionMgr.getSessionID() + '&chartID=' + encodeURIComponent(self.chartID)
                + '&sheetIndex=' + self.sheetIndex + '&ecName=' + encodeURIComponent(self.ecName) +'&index=' + i;
            singleOption.tools.toImage = singleOption.tools.toImage || {};
            singleOption.tools.toImage.imageUrl = baseURL + '?op=chart&cmd=export_image&' + params;
            singleOption.tools.toImage.checkUrl = baseURL + '/export/check/font?format=chart&' + params;
        };

        if (options && FR.isArray(options.options)) {
            for(var i = 0, len = options.options.length; i < len; i++){
                bindSingleOption(options.options[i], i)
            }
        } else {
            bindSingleOption(options, index || 0);
        }

        return options;
    },

    clearAll: function () {
        this.chart && this.chart.clear();
        this._removeUseLessAutoRefreshTimer();
        this.chart = null;
    },

    _resetAttr: function (attr) {
        attr.startLoading = false;
        attr.endLoading = true;
        // @mango CHART-1786  moreLable置为null会导致merge option报错，监控刷新失效。
        // attr.moreLabel = null;
    },

    /*
     * 单个图表轮播切换接口
     * @param direction 轮播图表切换方向:1向右，-1向左
     */
    switchCarouselChart: function (direction) {
        this.chart.carousel.switchChartAndRestTimer(direction);
    },

    /*
    * 展示指定图表接口
    * @param index 指定图表的下标
    */
    showIndexChart: function (index) {
        this.chart.carousel.showIndexChartAndRestTimer(index);
    },

    getChartWithIndex: function (index) {
        return this.chart.charts[index];
    },

    getCurrentChartIndex: function () {
        var carousel = this.chart.carousel;
        return carousel && carousel.getIndex() || 0;
    },

    refreshData: function (options, index) {

        if (options && Object.prototype.toString.apply(options.options) === '[object Array]') {
            for (var i = 0, len = options.options.length; i < len; i++) {
                this._resetAttr(options.options[i]);
            }
        } else {
            this._resetAttr(options)
        }

        options = this._bindOption(options, index);

        this.chart.setData(options, index);

    },

    autoRefresh: function () {

        //去掉无用的刷新定时器
        this._removeUseLessAutoRefreshTimer();

        if (Array.isArray(this.autoRefreshTime)) {
            this._autoMultiRefresh(this.autoRefreshTime);
        } else {
            this._autoSingleRefresh(this.autoRefreshTime || 0);
        }

    },

    /**
     * 判断传入的索引值是否有效
     * @param s
     * @returns {boolean}
     * @private
     */
    _getValidIndex: function (s) {
        var charts = this.chart.charts, len = charts.length;
        return /^[0-9]+$/.test(s) && s < len;
    },

    /**
     * 数据刷新接口，
     * @param chartIndexList，可选参数，表示需要刷新的图表的索引值数组
     */
    dataRefresh: function (chartIndexList) {

        var self = this, chart = this.chart, charts = chart.charts;
        var len = charts.length;
        var getAllIndexList = function () {
            var i = len, indexList = [];
            while (i) {
                indexList.push(--i);
            }
            return indexList;
        };

        chartIndexList = FR.isArray(chartIndexList) ? chartIndexList : [chartIndexList];

        var validIndexList = chartIndexList.filter(function (indexValue) {
            return self._getValidIndex(indexValue);
        });

        if (validIndexList.length === 0) {
            validIndexList = getAllIndexList();
        }

        validIndexList.forEach(function (indexValue) {
            self._dataRefresh(indexValue);
        });

    },

    _removeUseLessAutoRefreshTimer: function () {
        //获取当前所有的定时器
        var timerArray = FR.autoRefreshTimers = FR.autoRefreshTimers || [];

        var i, j, timerEle, elementTimers, timerId, timerArrayLen = timerArray.length;

        for (i = timerArrayLen - 1; i >= 0; i--) {
            timerEle = timerArray[i];
            //删除无用的定时器
            if (!timerEle || !document.body.contains(timerEle)) {
                elementTimers = timerEle.__autoRefreshTimers || [];
                for (j = 0; j < elementTimers.length; j++) {
                    timerId = elementTimers[j];
                    clearInterval(timerId);
                }
                timerArray.splice(i, 1);
            }
        }

        var elementAutoRefreshTimers = this.dom[0].__autoRefreshTimers || [], len = elementAutoRefreshTimers.length;
        for (i = -1; ++i < len;) {
            clearInterval(elementAutoRefreshTimers.shift());
        }

    },

    _addNewAutoRefreshTimer: function (timerId) {
        var element = this.dom[0];
        //将定时器绑定在对应的dom上
        element.__autoRefreshTimers = element.__autoRefreshTimers || [];
        element.__autoRefreshTimers.push(timerId);

        FR.autoRefreshTimers.indexOf(element) < 0 && FR.autoRefreshTimers.push(element);
    },

    /**
     * 单个图表的监控刷新
     * @param time
     * @private
     */
    _autoSingleRefresh: function (time) {
        if (time < 1) {
            return;
        }

        var self = this;

        var timerId = setInterval(function () {

            self._dataRefresh();

        }, time * 1000);

        this._addNewAutoRefreshTimer(timerId);
    },

    /**
     * 更新图表数据，index表示图表在图表块内的索引值
     * @param index
     * @private
     */
    _dataRefresh: function (index) {
        if (!this.chart) {
            return;
        }
        var self = this,
            ID = self.chartID,
            width = self.width || 0,
            height = self.height || 0,
            sheetIndex = self.sheetIndex,
            ecName = self.ecName;

        var postData = {
            cmd: 'chart_auto_refresh',
            chartID: ID,
            chartWidth: width,
            chartHeight: height,
            sheetIndex: sheetIndex,
            ecName: ecName,
            __time: new Date().getTime()
        };

        // 图表切换必须指定index，非图表切换则不需要
        if (self.chart.charts.length > 1) {
            postData.index = index;
        }

        if (FR.servletURL) {
            FR.ajax({
                type: 'GET',
                url: FR.servletURL + '?op=chartauto',
                data: postData,
                headers: {
                    sessionID: FR.SessionMgr.getSessionID()
                },
                dataType: 'json',
                success: function (chartRelateJS) {
                    var attrList = chartRelateJS.relateChartList;
                    for (var i = 0, len = attrList.length; i < len; i++) {
                        var chartID = FR.Chart.WebUtils._getChartIDAndIndex(attrList[i].id);
                        var chartSet = FR.ChartManager[chartID[0]];
                        if (chartSet && chartSet[chartID[1]]) {
                            var chartAttr = attrList[i].chartAttr;
                            var wrapper = chartSet[chartID[1]];
                            var isEmptyData = chartAttr.series.length === 0;
                            var emptyMsg = {
                                componentName: attrList[i].id,
                                chartIndex: index,
                                errorMessage: "图表数据为空"
                            };

                            if(isEmptyData && FR._handleWidgetError && FR._handleWidgetError(emptyMsg)) {
                                return;
                            }

                            wrapper && wrapper.refreshData(chartAttr, index);
                        }
                    }
                }
            });
        }
    },

    _autoMultiRefresh: function (timeList) {
        var count = timeList.length;
        var self = this;
        var time;

        for (var index = 0; index < count; index++) {
            time = timeList[index];
            if (time < 1) {
                continue;
            }
            this._intervalRequest(self, time, index);
        }
    },

    /**
     * 图标切换中具体下标的单个图表监控刷新数据
     * @param self
     * @param time
     * @param index
     * @private
     */
    _intervalRequest: function (self, time, index) {
        var timerId = setInterval(function () {
            self._dataRefresh(index);
        }, time * 1000);

        this._addNewAutoRefreshTimer(timerId);
    },

    _chartRelated: function (attrList) {
        if (!this.chart) {
            return;
        }
        for (var i = 0; i < attrList.length; i++) {
            var chartID = FR.Chart.WebUtils._getChartIDAndIndex(attrList[i].id);
            var chartSet = FR.ChartManager[chartID[0]];
            if (chartSet && chartSet[chartID[1]]) {
                var chartAttr = attrList[i].chartAttr;
                chartSet[chartID[1]].refreshData(chartAttr);
            }
        }
    },

    dealChartAjax: function (para) {
        para = para || {};

        for (var w in para) {
            var value = para[w];
            if (w.startWith("$")) {
                w = w.substring(1)
            }
            if (value == undefined) {
                value = null;
            }
            para[w] = value;
        }

        var data = {
            'chartID': this.chartID,
            'chartWidth': this.width || 0,
            'chartHeight': this.height || 0,
            'sheetIndex': this.sheetIndex,
            'ecName': this.ecName,
            '__parameters__': para,
            '__time': new Date().getTime()
        };

        var self = this;

        FR.ajax({
            type: 'POST',  // @Chart-1185, 使用GET可能导致url过长抛414错误
            url: FR.servletURL + '?op=chartlink&cmd=refresh_relate_data',
            data: data,
            headers: {
                sessionID: FR.SessionMgr.getSessionID()
            },
            dataType: 'json',
            beforeSend: function () {
                // 开始加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    show: true,
                    delay: 1000,
                    loadingType: 'local'  // 局部加载动画
                });
            },
            complete: function (result, status) {
                if (status === "success") {
                    result =  FR.jsonDecode(result.responseText);
                    self._chartRelated(result.relateChartList);
                }

                // 结束加载动画
                FR.HtmlLoader.loadingEffect({
                    el: self.dom,
                    overflow: 'hidden'
                });
            }
        });

    },

    //xxx联动图表 图表动画为重新加载
    dealReloadChartAjax: function (para) {
        this._reloadAnimate();
        this.dealChartAjax(para);
    },

    //平滑更新式的刷新 updateRefresh （柱子涨落）
    _incrementRefresh: function (relateChartList) {
        var self = this;
        setTimeout(function () {
            self._chartRelated(relateChartList);
        }, 1000);
    }

});
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.VanCharts=e():t.VanCharts=e()}(window,(function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return t[n].call(a.exports,a,a.exports,i),a.l=!0,a.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)i.d(n,a,function(e){return t[e]}.bind(null,a));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=109)}([function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports["default"]=void 0;var _Browser=_interopRequireDefault(__webpack_require__(5)),_ColorUtils=_interopRequireDefault(__webpack_require__(6)),_Constants=_interopRequireDefault(__webpack_require__(1)),_vMap=_interopRequireDefault(__webpack_require__(40)),_EnvUtils=__webpack_require__(3),_CoreUtils=__webpack_require__(2),_HtmlUtils=__webpack_require__(73);function _interopRequireDefault(t){return t&&t.__esModule?t:{"default":t}}var templateRe=/\{ *([\w_\-]+) *\}/g,lastID=0,DOUBLE_PI=2*Math.PI,decimalPlacesRegExp=/(?:\d+)(?:\.(\d+))?(?:[eE]-(\d+))?/,decimalRegExp=/\.|[eE]-\d+/g,skipKeys={minSize:!0,maxSize:!0,name:!0},SCALE=1,DATE_DELIMITER=_Browser["default"].phantomjs?"-":"/",styleToCss={color:"fill",font:"font",fontFamily:"font-family",fontSize:"font-size",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",letterSpacing:"letter-spacing",lineHeight:"line-height",quotes:"quotes",textAlign:"text-align",textDecoration:"text-decoration",textIndent:"text-indent",textShadow:"text-shadow",textTransform:"text-transform",whiteSpace:"white-space",wordSpacing:"word-spacing",padding:"padding"},$T={setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,requestAnimationFrame:window.requestAnimationFrame||getPrefixed("RequestAnimationFrame"),cancelAnimationFrame:window.cancelAnimationFrame||getPrefixed("CancelAnimationFrame")||getPrefixed("CancelRequestAnimationFrame")};for(var k in $T)$T.hasOwnProperty(k)&&$T[k]&&$T[k].bind&&($T[k]=$T[k].bind(window));function initPaddingScale(t){SCALE=t||1}function pick(){for(var t,e=arguments.length,i=0;i<e;i++)if(null!=(t=arguments[i]))return t;return null}function includes(t,e){for(var i=0;i<t.length;i++)if(t[i]===e)return!0;return!1}function isArray(t){return"[object Array]"===Object.prototype.toString.apply(t)}function toArray(t){return Array.prototype.slice.call(t)}function setTextStyle(t,e){for(var i in e=cssNormalization(e))t.style(i,e[i])}function getTextDimension(t,e,i){return(0,_EnvUtils._getTextDimension)(t,e,i)}function getTextWrapDimension(t,e,i){var n=extend({"white-space":"normal",whiteSpace:"normal","word-wrap":"break-word",wordWrap:"break-word"},e);return(0,_EnvUtils._getHtmlTextDim)(t,n,i)}function getTextBBoxWithRotation(t,e){e=toRadian(e);var i=t.node(),n="div"===t.type?i.innerHTML:i.textContent,a=t.styles,r=!(0,_EnvUtils.isSupportSVG)(),o=(0,_EnvUtils._getTextDimension)(n,a,r),s=Math.abs(Math.cos(e)),l=Math.abs(Math.sin(e)),u=o.width,h=o.height;return{width:u*s+h*l,height:u*l+h*s}}function getGradientBackgroundCssText(t){var e=[],i=t.startColor,n=t.endColor,a="left",r="left top",o="right top",s=1;return t.x1===t.x2&&(a="top",r="left top",o="left bottom",s=0),e.push("background: -ms-linear-gradient("+a+", "+i+", "+n+")"),e.push("background-image: -moz-linear-gradient("+a+", "+i+", "+n+")"),e.push("background-image: -webkit-gradient(linear, "+r+", "+o+", color-stop(0, "+i+"), color-stop(1, "+n+"))"),e.push("filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="+_ColorUtils["default"].colorToHexARGB(i)+", endColorstr="+_ColorUtils["default"].colorToHexARGB(n)+", GradientType="+s+")"),e}function getBorderCssText(t){var e=[];return null!=t.borderWidth&&(e.push("border-style:solid"),e.push("border-width:"+t.borderWidth+"px")),null!=t.borderColor&&e.push("border-color:"+t.borderColor),null!=t.borderRadius&&(e.push("border-radius:"+t.borderRadius+"px"),e.push("-moz-border-radius:"+t.borderRadius+"px"),e.push("-webkit-border-radius:"+t.borderRadius+"px"),e.push("-o-border-radius:"+t.borderRadius+"px")),e}function setFullScreenDomBackground(t,e){setDomBackground(t,e,!0)}function setNormalScreenDomBackground(t,e){setDomBackground(t,e,!1)}function setDomBackground(t,e,i){window.duchamp&&(t._emptyCss=t._emptyCss||t.style.cssText,t.style.cssText=t._emptyCss);var n=[];if(e.backgroundColor){var a=i?getFullScreenBackgroundColor(e.backgroundColor):e.backgroundColor;if("string"==typeof a)if((0,_EnvUtils.isSupportSVG)())n.push("background-Color:"+a);else{var r=_ColorUtils["default"].colorToHexAlpha(a);n.push("background-Color:"+r.hex),n.push("filter:alpha(opacity="+100*r.alpha+")")}else"object"==typeof a&&(n=n.concat(getGradientBackgroundCssText(a)))}e.backgroundImage&&(n.push("background-image:url("+e.backgroundImage+")"),n.push("background-size:100% 100%")),n=n.concat(getBorderCssText(e)),e.shadow&&n.push("box-shadow:1px 1px 2px rgba(0,0,0,0.2)"),t.style.cssText+=";"+n.join(";")+";"}function getFullScreenBackgroundColor(t){if(null!=t)return"string"==typeof t?_ColorUtils["default"].colorToHex(t):"object"==typeof t?{x1:t.x1,y1:t.y1,x2:t.x2,y2:t.y2,startColor:_ColorUtils["default"].colorToHex(t.startColor),endColor:_ColorUtils["default"].colorToHex(t.endColor)}:void 0}function stamp(t){return t._vanchart_id=t._vanchart_id||"vancharts"+ ++lastID,t._vanchart_id}function extend(t){var e,i,n,a;for(i=1,n=arguments.length;i<n;i++)for(e in a=arguments[i])t[e]=a[e];return t}function domRotate(t,e){var i=[];i.push("transform:rotate("+e+"deg)"),i.push("-ms-transform:rotate("+e+"deg)"),i.push("-webkit-transform:rotate("+e+"deg)"),i.push("-moz-transform:rotate("+e+"deg)"),i.push("-o-transform:rotate("+e+"deg)");var n=Math.cos(toRadian(e)),a=Math.sin(toRadian(e));if(!(0,_EnvUtils.isSupportSVG)()){var r=e?["progid:DXImageTransform.Microsoft.Matrix(M11=",n,", M12=",-a,", M21=",a,", M22=",n,", sizingMethod='auto expand')"].join(""):"none";i.push("filter:"+r)}t.style.cssText+=i.join(";")+";"}function splitText(t,e,i,n,a){if(!t)return[];i-=2*(n=n||0);for(var r=[],o=0,s=(t+="").length;o<s;){for(var l=o;getTextDimension(t.substring(l,o+1),e,!1).width<i&&!(++o>=s););if(l==o)return["..."];var u=t.substring(l,o);if(0==a&&o!=s&&o-1>l){var h=t.charAt(o-1),d=t.charAt(o);if(/[A-Za-z]/.test(h)&&/[A-Za-z]/.test(d)){var c=t.charAt(o-2);u=t.substring(l,o-1),o--," "!==c&&"-"!==c&&(u+="-")}}r.push(u)}return r}function splitAndShrinkText(t,e,i,n,a,r,o){var s=clone(i),l=parseFloat(s.fontSize);l<e&&(l=s.fontSize=e);for(var u=splitText(t,s,n,r,o);u.length>2;){if(s.fontSize<=e){s.fontSize=e;var h=u[1]+u[2];u[1]=getEllipsisText(h,n,s,a),u=[u[0],u[1]],l=e;break}l=Math.max(e,l-1),s.fontSize=l,u=splitText(t,s,n,r,o)}return{text:u,fontSize:l+"px"}}function shrinkText(t,e,i,n,a,r){var o=clone(a);o.fontSize=Math.max(i,e);var s=getTextDimension(t,o,r).width;if(n<=0)return{labelContent:"",fontSize:o.fontSize+"px"};for(;s>=n;){if(o.fontSize-=1,o.fontSize<=e){o.fontSize=e,t=getEllipsisText(t,n,o,r);break}s=getTextDimension(t,o,r).width}return{labelContent:t,fontSize:o.fontSize+"px"}}function getTextDimensionWithRotation(t,e,i,n){return getTextDimRotated(getTextDimension(t,e,i),n)}function getTextDimRotated(t,e){var i=Math.abs(toRadian(e||0));return{width:t.width*Math.cos(i)+t.height*Math.sin(i),height:t.width*Math.sin(i)+t.height*Math.cos(i)}}function getDotCount(t,e){return(0,_CoreUtils.isNumberValue)(t)&&(0,_CoreUtils.isNumberValue)(e)&&Math.abs(e)>1e-6?Math.floor(t/e):0}function getDotStr(t){if(!(0,_CoreUtils.isNumberValue)(t)||Math.abs(t)<1e-6)return"";return getTargetFillArray(t,(function(){return"."})).join("")}function getEllipsisText(t,e,i,n){var a=t+"",r=a.length,o=getTextDimension(a,i,n).width,s=getTextDimension(".",i,n).width;if(o<=e)return t;for(var l=0;++l<=r;){if(getTextDimension(a.slice(0,l),i,n).width>e){var u="",h=a.slice(0,Math.max(l-1,0)),d=getDotCount(e-getTextDimension(h,i,n).width,s);return u=d>0?getDotStr(d):h?getDotStr(d=getDotCount(e-getTextDimension(h=h.slice(0,h.length-1),i,n).width,s)):".",h+u}}}function cssNormalization(t){var e={};for(var i in t)if(styleToCss[i]&&(e[styleToCss[i]]=t[i]),"color"==i&&(e.color=t[i]),"fontSize"==i){var n=t[i];-1!=n.indexOf("pt")&&(n=4*parseFloat(n)/3,e["font-size"]=n+"px")}return e}function reformCssArray(t){if(!(t instanceof Array))return[t,t,t,t];switch(t.length+""){case"4":return t;case"3":return[t[0],t[1],t[2],t[1]];case"2":return[t[0],t[1],t[0],t[1]];case"1":return[t[0],t[0],t[0],t[0]];case"0":return[0,0,0,0]}}function lineSubPixelOpt(t,e){return e%2==0?Math.round(t):Math.round(t-.5)+.5}function rectSubPixelOpt(){var t,e,i,n,a,r,o;return 2===arguments.length?(t=arguments[0].x,e=arguments[0].y,i=arguments[0].width,n=arguments[0].height,a=arguments[1]):(t=arguments[0],e=arguments[1],i=arguments[2],n=arguments[3],a=arguments[4]),{x:r=lineSubPixelOpt(t,a=a||0),y:o=lineSubPixelOpt(e,a),width:lineSubPixelOpt(t+i,a)-r,height:lineSubPixelOpt(e+n,a)-o}}function addArray(t,e){var i=[];if(t&&t.length)for(var n=0,a=t.length;n<a;n++)i.push(t[n]);if(e&&e.length)for(n=0,a=e.length;n<a;n++)i.push(e[n]);return i}function toFront(t){t&&t.parentNode&&t.parentNode.appendChild(t)}function toBack(t){t&&t.parentNode&&t.parentNode.insertBefore(t,t.parentNode.firstChild)}function toFrontOfAll(t){t.ownerSVGElement.appendChild(t)}function toBackOfAll(t){t.ownerSVGElement.appendChild(t,t.ownerSVGElement.firstChild)}function containsRect(t,e){return t.x<=e.x&&t.y<=e.y&&t.x+t.width>=e.x+e.width&&t.y+t.height>=e.y+e.height}function rectangleOverlapped(t,e){if(!t||!e)return!1;var i=Math.max(t.x,e.x),n=Math.max(t.y,e.y),a=Math.min(t.x+t.width,e.x+e.width),r=Math.min(t.y+t.height,e.y+e.height);return i<a&&n<r}function lineLine(t,e,i,n){var a=(n.x-i.x)*(t.y-i.y)-(n.y-i.y)*(t.x-i.x),r=(e.x-t.x)*(t.y-i.y)-(e.y-t.y)*(t.x-i.x),o=(n.y-i.y)*(e.x-t.x)-(n.x-i.x)*(e.y-t.y);if(0!==o){var s=a/o,l=r/o;if(0<=s&&s<=1&&0<=l&&l<=1)return!0}return!1}function lineRect(t,e,i){var n={x:i.x,y:i.y},a={x:i.x,y:i.y+i.height},r={x:i.x+i.width,y:i.y+i.height},o={x:i.x+i.width,y:i.y};return!!lineLine(t,e,n,a)||(!!lineLine(t,e,a,r)||(!!lineLine(t,e,r,o)||lineLine(t,e,o,n)))}function outsideRect(t,e){return!containsRect(t,e)&&!rectangleOverlapped(t,e)}function containsPoint(t,e){if(!t||!e)return!1;var i=pick(e.x||e[0]),n=pick(e.y||e[1]);return t.x<i&&t.x+t.width>i&&t.y<n&&t.y+t.height>n}function isValidRect(t){var e=t.width,i=t.height;return e>0&&i>0}function makeValueInRange(t,e,i){var n=Math.min(t,e),a=Math.max(t,e)-n;return((i-n)%a+a)%a+n}function getValueInDomain(t,e){return Math.min(Math.max(t,e[0]),e[1])}function toRadian(t){return Math.PI*(t/180)}function toDegree(t){return 180*t/Math.PI}function getFormatterFunction(formatter){if(null==formatter||""===formatter)return null;if("string"==typeof formatter){var formatterFunc=new Function("return "+formatter)();return"string"==typeof formatterFunc?(eval("var _tmpFunc = "+formatterFunc),_tmpFunc):formatterFunc}return formatter}function format(t,e){e&&e.match&&e.match(/D/)&&(t=(0,_CoreUtils.isEmpty)(t)||isNaN(t)?t:+t),e=getFormatterFunction(e);try{return"function"==typeof e?e.bind(t)(t):t}catch(i){return t}}function endsWith(t,e,i){return null!=t&&null!=e&&((i===undefined||i>t.length)&&(i=t.length),t.substring(i-e.length,i)===e)}function startsWith(t,e,i){return i=!i||i<0?0:+i,t.substring(i,i+e.length)===e}function clone(t){if(null==t||"object"!=typeof t)return t;if(t instanceof Date)return(e=new Date).setTime(t.getTime()),e;if(t instanceof Array){for(var e=[],i=0,n=t.length;i<n;++i)e[i]=clone(t[i]);return e}if(t instanceof String)return t+"";if(t instanceof Object){e={};for(var a in t)t.hasOwnProperty(a)&&(e[a]=clone(t[a]));return e}}function makeBounds(){var t=0,e=0,i=0,n=0;if(2===arguments.length){var a=arguments[0],r=arguments[1];t=pick(a.x,a[0]),e=pick(a.y,a[1]),i=pick(r.width,r[0]),n=pick(r.height,r[1])}else 4===arguments.length&&(t=arguments[0],e=arguments[1],i=arguments[2],n=arguments[3]);return{x:t,y:e,width:i,height:n}}function distance(t,e){var i=pick(t.x,t[0]),n=pick(t.y,t[1]),a=i-pick(e.x,e[0]),r=n-pick(e.y,e[1]);return Math.sqrt(a*a+r*r)}function log(t,e){return accDiv(newMathLog(e),newMathLog(t))}function newMathLog(t){return t<1?-Math.log(accDiv(1,t)):Math.log(t)}function getOrder(t){var e=0;if(t>0&&t<1)for(;t<1;)t=accMul(t,10),e--;else if(t>=10)for(;t>=10;)t=accDiv(t,10),e++;return e}function getPercentValue(t,e){return t?(-1!=(t+="").indexOf("%")&&(t=parseFloat(t)*e/100),parseFloat(t)):0}function getDecimalPlaces(t){var e=(t+"").match(decimalPlacesRegExp);return e?(e[1]?e[1].length:0)+(+e[2]||0):0}function accAdd(t,e){if(t%1==0&&e%1==0)return t+e;var i=getDecimalPlaces(t),n=getDecimalPlaces(e),a=Math.pow(10,Math.max(i,n));return(accMul(t,a)+accMul(e,a))/a}function accDiv(t,e){if(t%1==0&&e%1==0)return t/e;var i=t+"",n=e+"",a=-getDecimalPlaces(t);a+=getDecimalPlaces(e);var r=i.replace(decimalRegExp,""),o=n.replace(decimalRegExp,"");return a>0?r/o*Math.pow(10,a):r/o/Math.pow(10,-a)}function accMul(t,e){if(t%1==0&&e%1==0)return t*e;var i=t+"",n=e+"",a=getDecimalPlaces(t);return a+=getDecimalPlaces(e),i.replace(decimalRegExp,"")*n.replace(decimalRegExp,"")/Math.pow(10,a)}function niceValue(t,e){var i=(t=+t)/(e=e-1||4),n=t<0;i=Math.abs(i),t=Math.abs(t);var a=parseInt(Math.log(i)/Math.log(10));if(!isFinite(a))return t;var r=Math.pow(10,a);i!==r&&(a+=1,r=Math.pow(10,a));var o=i/r;[.1,.2,.25,.5,1].some((function(t){if(o<t)return o=t,!0}));var s=(o=accMul(o,Math.pow(10,a)))*e;return n?-1*s:s}function objectToArray(t){if(t.length)return[].slice.call(t);var e=[];for(var i in t)e.push(t[i]);return e}function date2int(t){if(null==t)return null;var e=new Date("1970-01-01");return(t=value2date(t)).getTime()-e.getTime()}function int2date(t){var e=new Date("1970-01-01");return t=t||0,new Date(t+e.getTime())}function value2date(t,e){if((0,_CoreUtils.hasNotDefined)(t))return new Date(undefined);if("string"==typeof t&&t.match(/^\s*$/))return new Date(undefined);if(!isNaN(t))return new Date(+t);var i=t;if("string"==typeof i){if(e&&(i.match(/^(20|21|22|23|[0-1]\d):[0-5]\d$/)||i.match(/^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/))){var n=new Date;return new Date(n.toLocaleDateString()+" "+i)}("Invalid Date"==(i=new Date(Date.parse(i.replace(/[-/|\.]/g,DATE_DELIMITER))))||"NaN"==i)&&FR&&FR.str2Date&&(i=FR.str2Date(t,"yyyy-MM-dd HH:mm:ss"))}return i}function makeTranslate(t){return"translate("+pick(t.x,t[0])+","+pick(t.y,t[1])+")"}function makeTranslate3d(t){return _Browser["default"].any3d?"translate3d("+pick(t.x,t[0])+"px,"+pick(t.y,t[1])+"px,"+pick(t.z,t[2],0)+"px)":makeTranslateWithPX(t)}function makeTranslateWithPX(t){return"translate("+pick(t.x,t[0])+"px,"+pick(t.y,t[1])+"px)"}function isImageMarker(t){return-1==(_Constants["default"].LOCATION+_Constants["default"].STAR+_Constants["default"].CIRCLE+_Constants["default"].SQUARE+_Constants["default"].DIAMOND+_Constants["default"].TRIANGLE+_Constants["default"].CIRCLE_HOLLOW+_Constants["default"].SQUARE_HOLLOW+_Constants["default"].DIAMOND_HOLLOW+_Constants["default"].TRIANGLE_HOLLOW+_Constants["default"].SYMBOL_AUTO+_Constants["default"].ANCHOR_ICON).indexOf(t)&&(0,_CoreUtils.hasDefined)(t)}function isNullMarker(t){return(0,_CoreUtils.hasNotDefined)(t.symbol)}function getDefaultMarkerSymbol(t){var e=[_Constants["default"].CIRCLE,_Constants["default"].CIRCLE_HOLLOW,_Constants["default"].SQUARE,_Constants["default"].SQUARE_HOLLOW,_Constants["default"].DIAMOND,_Constants["default"].DIAMOND_HOLLOW,_Constants["default"].TRIANGLE,_Constants["default"].TRIANGLE_HOLLOW];return e[t%e.length]}function splitWords(t){return(t=t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")).split(/\s+/)}function trim(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function removeEvent(t,e,i){t.removeEventListener?t.removeEventListener(e,i,!1):t.attachEvent&&t.detachEvent("on"+e,i)}function dealFloatPrecision(t){return Math.abs(t)<1e-6?0:t}function getDomWidth(t){if(t.getWidth)return t.getWidth();var e=t.currentStyle||document.defaultView.getComputedStyle(t);return((t.clientWidth||Math.round(parseFloat(e.width)))-parseInt(e.paddingLeft,10)-parseInt(e.paddingRight,10)).toFixed(0)-0}function getDomHeight(t){if(t.getHeight)return t.getHeight();var e=t.currentStyle||document.defaultView.getComputedStyle(t);return((t.clientHeight||Math.round(parseFloat(e.height)))-parseInt(e.paddingTop,10)-parseInt(e.paddingBottom,10)).toFixed(0)-0}function hasTouch(){var t=window.document;return t&&t.documentElement.ontouchstart!==undefined}function getArcPoint(t,e){return[t*Math.sin(e),-t*Math.cos(e)]}function getArcByPoint(t,e){return(2*Math.PI-(Math.atan2(e,t)-Math.PI/2))%(2*Math.PI)}function calculateAutoMinMaxAndGap(t,e,i){e<t&&(t=0,e=100);var n=accAdd(e,-t),a=getOrder(n),r=Math.pow(10,a);a<=0?(t=accMul(t,Math.pow(10,1-a)),t=accDiv(Math.floor(t),Math.pow(10,1-a))):t=Math.floor(t/r)*r;for(var o=accMul(accDiv(i,10),r),s=0;s<n;)s=accAdd(o,s);for(var l=accDiv(s,i);t+l*i<e;)l=accDiv(s=accAdd(o,s),i);return[t,e=accAdd(t,accMul(s=accDiv(s,i),i)),s]}function indexOf(t,e){for(var i=0;i<t.length;i++)if(t[i]===e)return i;return-1}function hasChn(t){return/[\u4E00-\u9FA5]/.test(t)}function paddingConvertWithScale(t){return Math.round((0,_EnvUtils.convertREMtoPX)(t)*SCALE)}function getComputedStyle(t,e,i){if(1!==t.nodeType)throw new Error("element is not a DOM element.");"function"!=typeof i&&(i=function(t){return t});var n=splitWords(e),a={};return n.forEach((function(e){a[camelCase(e)]=i(function(e,i){var n=t.currentStyle?t.currentStyle:window.getComputedStyle(t,null),a=n[i],r=parseFloat(n["padding-left"]),o=parseFloat(n["border-left-width"]);if(r=isNaN(r)?0:r,o=isNaN(o)?0:o,"auto"===a&&("width"===i||"height"===i)){var s=e.getBoundingClientRect();a="width"===i?s.right-s.left:s.bottom-s.top,a-=2*(r+o),a+="px"}return a}(t,e))})),a}function camelCase(t){return t.replace(/^-ms-/,"ms-").replace(/-([\da-z])/gi,(function(t,e){return e.toUpperCase()}))}function toPng(t){window.location=t}function computeArc(t,e,i,n,a){var r=Math.asin(a),o=Math.abs(t-i),s=Math.abs(e-n),l=Math.sqrt(o*o+s*s)/2,u=(t>i?-1:1)*l/Math.tan(r),h=Math.atan((e-n)/(i-t)),d=(t+i)/2+u*Math.sin(h),c=(e+n)/2+u*Math.cos(h),f=t-d,p=e-c,g=i-d,m=n-c,v=normalRadian(Math.atan2(p,f)),_=normalRadian(Math.atan2(m,g));return v>_&&(_+=DOUBLE_PI),[d,c,l/a,v,_]}function normalRadian(t){return(t%=DOUBLE_PI)<0&&(t+=DOUBLE_PI),t}function formatNum(t,e){var i=Math.pow(10,e||5);return Math.round(t*i)/i}function wrapNum(t,e,i){var n=e[1],a=e[0],r=n-a;return t===n&&i?t:((t-a)%r+r)%r+a}function bind(t,e){var i=Array.prototype.slice;if(t.bind)return t.bind.apply(t,i.call(arguments,1));var n=i.call(arguments,2);return function(){return t.apply(e,n.length?n.concat(i.call(arguments)):arguments)}}function getParamString(t,e,i){var n=[];for(var a in t)n.push(encodeURIComponent(i?a.toUpperCase():a)+"="+encodeURIComponent(t[a]));return(e&&-1!==e.indexOf("?")?"&":"?")+n.join("&")}function template(t,e){return t.replace(templateRe,(function(t,i){var n=e[i];if(n===undefined)throw new Error("No value provided for variable "+t);return"function"==typeof n&&(n=n(e)),n}))}function setOptions(t,e){for(var i in t.hasOwnProperty("options")||(t.options=t.options?Object.create(t.options):{}),e)t.options[i]=e[i];return t.options}function createOptions(t,e){return e.forEach((function(e){if(e)for(var i in e)(0,_CoreUtils.hasNotDefined)(t[i])&&!skipKeys[i]&&(t[i]=e[i])})),t}function getPrefixed(t){return window["webkit"+t]||window["moz"+t]||window["ms"+t]}!function(){var t,e=!0,i=$T.setTimeout,n=$T.requestAnimationFrame,a=$T.cancelAnimationFrame,r=$T.clearTimeout;try{t=window.frameElement}catch(h){}if(t){var o=[],s=[];n&&($T.requestAnimationFrame=function(t){if(e)return n(t);o.push(t)}),$T.setTimeout=function(t,n){if(e)return i(t,n);t.__$delay__=n,s.push(t)};var l=n||function(t){return i(t,16)};l((function a(){"none"===(t.style.display||"").toLowerCase()?e=!1:function(){if(!e){e=!0;for(var t=-1;++t<o.length;)o[t].call();for(o=[],t=-1;++t<s.length;){var i=s[t];$T.setTimeout(i,i.__$delay__)}s=[]}}(),l(a)}))}var u=$T.requestAnimationFrame||function(t){return _Browser["default"].phantomjs?window.setTimeout(t,16):$T.setTimeout(t,16)};$T.setInterval=function(t,e){var i=(new Date).getTime(),n={};return n.value=u((function a(){n.value=u(a),(new Date).getTime()-i>=e&&(t.call(),i=(new Date).getTime())})),n},$T.clearInterval=a?function(t){t&&a(t.value)}:function(t){t&&r(t.value)},_Browser["default"].phantomjs&&($T.setTimeout=window.setTimeout)}();var lastTime=0;function timeoutDefer(t){var e=+new Date,i=Math.max(0,16-(e-lastTime));return lastTime=e+i,_Browser["default"].phantomjs?window.setTimeout(t,i):$T.setTimeout(t,i)}var requestFn=$T.requestAnimationFrame||timeoutDefer,cancelFn=$T.cancelAnimationFrame||function(t){$T.clearTimeout(t)};function requestAnimFrame(t,e,i){if(!i||requestFn!==timeoutDefer)return requestFn.call(window,bind(t,e));t.call(e)}function cancelAnimFrame(t){t&&cancelFn.call(window,t)}function throttle(t,e,i){var n,a,r,o,s;return o=function(){n=!1,a&&(r.apply(i,a),a=!1)},r=function(){n?a=arguments:(t.apply(i,arguments),s=setTimeout(o,e),n=!0)},r.cancel=function(){clearTimeout(s),n=a=!1},r}function rebind(t,e){for(var i,n=1,a=arguments.length;++n<a;)t[i=arguments[n]]=_rebind(t,e,e[i]);return t}function _rebind(t,e,i){return function(){var n=i.apply(e,arguments);return n===e?t:n}}function bindData(t,e,i){var n,a,r,o,s=t.length,l=e.length,u=[],h=[],d=[],c={},f=[];for(n=-1;++n<s;)r=t[n],c[a=i?i(r.datum()):n]=r,f[n]=a;for(n=-1;++n<l;)o=e[n],(r=c[a=i?i(o):n])?!0!==r&&(r.datum(o),d.push(r)):u.push(o),c[a]=!0;for(n=-1;++n<s;)!0!==c[f[n]]&&h.push(t[n]);return{update:d,enter:u,exit:h}}function dispatch(){for(var t=new d3_dispatch,e=-1,i=arguments.length;++e<i;)t[arguments[e]]=d3_dispatch_event(t);return t}function d3_dispatch(){}function d3_dispatch_event(t){var e=[],i=new _vMap["default"];function n(){for(var i,n=e,a=-1,r=n.length;++a<r;)(i=n[a].on)&&i.apply(this,arguments);return t}return n.on=function(n,a){var r,o=i.get(n);return arguments.length<2?o&&o.on:(o&&(o.on=null,e=e.slice(0,r=e.indexOf(o)).concat(e.slice(r+1)),i.remove(n)),a&&e.push(i.set(n,{on:a})),t)},n}function falseFn(){return!1}function trueFn(){return!0}function emptyFn(){}function encodeCategoryArray(t){if(!isArray(t))return t;if(window.JSON)return JSON.stringify(t);for(var e="[",i=-1;++i<t.length;)e+=(i>0?",":"")+'"'+t[i]+'"';return e+"]"}function decodeCategoryArray(categoryArrayStr){return window.JSON?JSON.parse(categoryArrayStr):eval("("+categoryArrayStr+")")}function getTargetFillArray(t,e){if(null!=t){if(null==e)return Array.apply(null,Array(t));for(var i=[],n=0;n<t;n++)i.push("");return i.map(e)}}function value2PX(t){return t+"px"}function CSSText(t){return Object.keys(t).map((function(e){return e+":"+t[e]})).join(";")+";"}function attrText(t){return" "+Object.keys(t).map((function(e){return e+"="+t[e]})).join(" ")+" "}function spliceText(){return Array.prototype.slice.apply(arguments).join("")}function stringify(t){if("object"==typeof JSON)return JSON.stringify(t);var e,i="";if(null===t)return String(t);switch(typeof t){case"number":case"boolean":return String(t);case"string":return'"'+t+'"';case"undefined":case"function":return undefined}switch(Object.prototype.toString.call(t)){case"[object Array]":i+="[";for(var n=0,a=t.length-1;n<a;n++)i+=((e=stringify(t[n]))===undefined?null:e)+",";return i+=stringify(t[n]),i+="]";case"[object Date]":return'"'+(t.toJSON?t.toJSON():t.toString())+'"';case"[object RegExp]":return"{}";case"[object Object]":for(var n in i+="{",t)t.hasOwnProperty(n)&&(e=stringify(t[n]))!==undefined&&(i+='"'+n+'":'+e+",");return i=i.slice(0,-1),i+="}"}}function ObjectValues(t){if(Object.values)return Object.values(t);var e,i=[];for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&i.push(t[e]);return i}function ObjectKeys(t){if(Object.keys)return Object.keys(t);var e,i=Object.prototype.hasOwnProperty,n=!{toString:null}.propertyIsEnumerable("toString"),a=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],r=a.length,o=[];for(e in t)i.call(t,e)&&o.push(e);if(n)for(var s=0;s<r;s++)i.call(t,a[s])&&o.push(a[s]);return o}function htmlEncode(t){var e={"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"," ":"&nbsp;"};return null==t?null:(t=""+t).replace(new RegExp('&|"|<|>|\\s',"gm"),(function(t){return e[t]?e[t]:"&nbsp;"}))}function replaceScript4Xss(t){if(null==t)return null;var e=/&#x([0-9A-F]+);/gi,i=/&#(\d+);/gi;return t=""+t,e.test(t)?t=t.replace(e,(function(t,e){return String.fromCharCode(parseInt(e,16))})):i.test(t)&&(t=t.replace(i,(function(t,e){return String.fromCharCode(parseInt(e,10))}))),/script|svg|alert|confirm|prompt|onload|onclick|onmouseover|onfocus|onerror/gi.test(t)?htmlEncode(t):t}d3_dispatch.prototype.on=function(t,e){var i=t.indexOf("."),n="";if(i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),t)return arguments.length<2?this[t].on(n):this[t].on(n,e);if(2===arguments.length){if(null==e)for(t in this)this.hasOwnProperty(t)&&this[t].on(n,null);return this}};var parseParam=function(t){if(null==t||""===t)return{url:"",params:{}};if(!/(.+)\?(.+)$/.test(t))return{url:t,params:{}};var e={},i=/(.+)\?(.+)$/.exec(t)[1];return/(.+)\?(.+)$/.exec(t)[2].split("&").forEach((function(t){if(/=/.test(t)){var i=t.split("="),n=i[0],a=i[1];a=decodeURIComponent(a),a=/^\d+$/.test(a)?parseFloat(a):a,e.hasOwnProperty(n)?e[n]=[].concat(e[n],a):e[n]=a}else e[t]=!0})),{url:i,params:e}},BaseUtils={dispatch:dispatch,rebind:rebind,throttle:throttle,requestAnimFrame:requestAnimFrame,cancelAnimFrame:cancelAnimFrame,getParamString:getParamString,template:template,setOptions:setOptions,createOptions:createOptions,formatNum:formatNum,wrapNum:wrapNum,bind:bind,initPaddingScale:initPaddingScale,toPng:toPng,getDomWidth:getDomWidth,getDomHeight:getDomHeight,makeTranslate:makeTranslate,makeTranslateWithPX:makeTranslateWithPX,makeTranslate3d:makeTranslate3d,clone:clone,date2int:date2int,int2date:int2date,value2date:value2date,log:log,getPercentValue:getPercentValue,accAdd:accAdd,accDiv:accDiv,accMul:accMul,dealFloatPrecision:dealFloatPrecision,niceValue:niceValue,objectToArray:objectToArray,toArray:toArray,pick:pick,includes:includes,getTextDimension:getTextDimension,splitText:splitText,splitAndShrinkText:splitAndShrinkText,shrinkText:shrinkText,getTextDimensionWithRotation:getTextDimensionWithRotation,getTextDimRotated:getTextDimRotated,getEllipsisText:getEllipsisText,isArray:isArray,indexOf:indexOf,startsWith:startsWith,endsWith:endsWith,cssNormalization:cssNormalization,reformCssArray:reformCssArray,rectSubPixelOpt:rectSubPixelOpt,lineSubPixelOpt:lineSubPixelOpt,toFront:toFront,toBack:toBack,containsRect:containsRect,rectangleOverlapped:rectangleOverlapped,outsideRect:outsideRect,isValidRect:isValidRect,lineRect:lineRect,containsPoint:containsPoint,setTextStyle:setTextStyle,domRotate:domRotate,makeValueInRange:makeValueInRange,getValueInDomain:getValueInDomain,toRadian:toRadian,toDegree:toDegree,getFormatterFunction:getFormatterFunction,format:format,hasTouch:hasTouch,distance:distance,makeBounds:makeBounds,isImageMarker:isImageMarker,isNullMarker:isNullMarker,getDefaultMarkerSymbol:getDefaultMarkerSymbol,getArcPoint:getArcPoint,getTextWrapDimension:getTextWrapDimension,stamp:stamp,splitWords:splitWords,trim:trim,extend:extend,getGradientBackgroundCssText:getGradientBackgroundCssText,getBorderCssText:getBorderCssText,setNormalScreenDomBackground:setNormalScreenDomBackground,setFullScreenDomBackground:setFullScreenDomBackground,getFullScreenBackgroundColor:getFullScreenBackgroundColor,getArcByPoint:getArcByPoint,calculateAutoMinMaxAndGap:calculateAutoMinMaxAndGap,hasChn:hasChn,paddingConvertWithScale:paddingConvertWithScale,getComputedStyle:getComputedStyle,computeArc:computeArc,normalRadian:normalRadian,bindData:bindData,falseFn:falseFn,trueFn:trueFn,emptyFn:emptyFn,decodeCategoryArray:decodeCategoryArray,encodeCategoryArray:encodeCategoryArray,getTextBBoxWithRotation:getTextBBoxWithRotation,replaceScript4Xss:replaceScript4Xss,parseParam:parseParam,getTargetFillArray:getTargetFillArray,value2PX:value2PX,CSSText:CSSText,attrText:attrText,spliceText:spliceText,stringify:stringify,ObjectValues:ObjectValues,ObjectKeys:ObjectKeys,setTimeout:$T.setTimeout,clearTimeout:$T.clearTimeout,setInterval:$T.setInterval,clearInterval:$T.clearInterval,requestAnimationFrame:$T.requestAnimationFrame,cancelAnimationFrame:$T.cancelAnimationFrame},_default=BaseUtils;exports["default"]=_default},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;e["default"]={DARK:"dark",LIGHT:"light",BLANK_VALUE_PERCENTAGE:"  ",INSTANCES_KEY:"vancharts_index_",SELECT_ANIMATION:"select",UPDATE_EXIT_ENTER_ANIMATION:"update_exit_enter",SELECT_STYLE_ANIMATION:"select_style",CHART_HIDE:"vancharts-chart-hide",EXPORT_HIDE:"vancharts-export-hide",SCALE_EXPAND_ANIMATION:"scale_expand",SCALE_MINIFY_ANIMATION:"scale_minify",GEO:"geographic_co_sys",PLANE:"plane_co_sys",BUTTON:"button",CAROUSEL:"carousel",NO_ARROW:"no_arrow",BAR_CHART:"bar",COLUMN_CHART:"column",LINE_CHART:"line",AREA_CHART:"area",PIE_CHART:"pie",MULTIPIE_CHART:"multiPie",TREEMAP_CHART:"treeMap",SCATTER_CHART:"scatter",BUBBLE_CHART:"bubble",FORCE_BUBBLE_CHART:"forceBubble",GANTT_CHART:"gantt",GAUGE_CHART:"gauge",POINTER_GAUGE:"pointer",POINTER_SEMI_GAUGE:"pointer_semi",SLOT_GAUGE:"slot",THERMOMETER_GAUGE:"thermometer",RING_GAUGE:"ring",RADAR_CHART:"radar",COLUMN_RADAR:"columnRadar",LINE_RADAR:"lineRadar",POINT_MAP:"pointMap",AREA_MAP:"areaMap",HEAT_MAP:"heatMap",LINE_MAP:"lineMap",FUNNEL_CHART:"funnel",WORD_CLOUD_CHART:"wordCloud",STRUCTURE_CHART:"structure",MULTI_CHARTS:"multiCharts",BOX_CHART:"box",MARKER_RADIUS:3.5,LARGE_CHART_TYPE:{line:!0,area:!0,scatter:!0,bubble:!0,gantt:!0,pointMap:!0,areaMap:!0,lineMap:!0},VANCHART:"vanchart",FULL_SCREEN_ICON:"fullScreen",EXPORT_ICON:"toImage",SORT:"sort",MENU_ICON:"vancharts-icon-menu",REFRESH_ICON:"vancharts-icon-refresh",TOOLBAR_ICON_SIZE:32,AXIS_GROUP:"vanchart-axis-group",BOTTOM:"bottom",TOP:"top",LEFT:"left",RIGHT:"right",RIGHT_TOP:"right-top",RIGHT_BOTTOM:"right-bottom",LEFT_TOP:"left-top",LEFT_BOTTOM:"left-bottom",LEFT_TO_RIGHT:"left-to-right",RIGHT_TO_LEFT:"right-to-left",BOTTOM_TO_TOP:"bottom-to-top",TOP_TO_BOTTOM:"top-to-bottom",DISORDER:"disorder",DESCENDING:"descending",ASCENDING:"ascending",CIRCLE:"circle",SQUARE:"square",DIAMOND:"diamond",TRIANGLE:"triangle",STAR:"star",LOCATION:"location",SYMBOL_AUTO:"auto",CIRCLE_HOLLOW:"circle_hollow",SQUARE_HOLLOW:"square_hollow",DIAMOND_HOLLOW:"diamond_hollow",TRIANGLE_HOLLOW:"triangle_hollow",NORMAL_ICON:"normal-legend-icon",PIE_ICON:"pie-legend-icon",DONUT_ICON:"donut-legend-icon",BUBBLE_ICON:"bubble-legend-icon",SCATTER_ICON:"scatter-legend-icon",TREEMAP_ICON:"treeMap-legend-icon",NULL_MARKER:"null-marker-legend-icon",SOLID_NAIL_ICON:"solid_nail",CANCEL_SOLID_NAIL_ICON:"cancel_solid_nail",ANCHOR_ICON:"anchor",ANCHOR_ICON_SIZE:28,POINT_MAP_IMG_COLOR:"rgb(99,178,238)",FLOW:"flow",DEFAULT_OPACITY:1,HOVER_OPACITY:.2,SOLID:"solid",DASHED:"dashed",DASH_ARRAY:{solid:"none",dashed:"6,6"},SAME_ARC:"sameArc",DIFFERENT_ARC:"differentArc",AUTO:"auto",OUTSIDE:"outside",INSIDE:"inside",CENTER:"center",OVERLAP_RATE:.15,EXCEED_RATE:.15,FONTSIZE_RATE:2,STYLE_GRADUAL:"gradual",STYLE_NORMAL:"normal",STYLE_CUSTOM:"custom",HORIZONTAL_LAYOUT:"horizontal",VERTICAL_LAYOUT:"vertical",POLYGON_RADAR:"polygon",CIRCLE_RADAR:"circle",SIZE_BY_AREA:"area",SIZE_BY_WIDTH:"width",GRADUAL_LIGHTER:"lighter",GRADUAL_DARKER:"darker",STATE_TO_DROP:"to-drop",STATE_DROPPED:"dropped",STATE_TO_SHOW:"to-show",STATE_SHOW:"show",EXPONENTIAL:"exponential",LINEAR:"linear",LOGARITHMIC:"logarithmic",POLYNOMIAL:"polynomial",AXIS_ARROW_PATH:{left:"M-10, 0 L-2, 4 L-6, 0 L-2, -4 L-10, 0",right:"M2,-4 L10,0 L2,4 L6,0 L2,-4",up:"M-4,-2 L0,-10 L4,-2 L0,-6 L-4,-2",down:"M-4, 2 L0, 10, L4, 2 L0, 6 L-4, 2"},DIRECTION_LEFT:2,DIRECTION_RIGHT:4,DIRECTION_UP:8,DIRECTION_DOWN:16,STAGES:{NORMAL:0,SELECT:1,KEEP:2,ZOOM:3},EFFECT_KEY:"__effect__",AUTO_REFRESH:"auto_refresh",EMPTY_DATA_DOMAIN:[0,100],DEFAULT_PERCENT_INTERVAL:.25,DEFAULT_LOG_INTERVAL:1,MIN_TIME_AXIS_INTERVAL:1e3,MAX_TICKS_NUM:1e3,MAX_MINOR_TICKS_NUM:2e3,GANTT_CANVAS_WIDTH:4e3,GANTT_MAX_CANVAS_NUM:15,INCREMENT_REFRESH:"increment",INCREMENT_TIP_REFRESH:"tip_increment",OVERALL_REFRESH:"overall",INTERVAL:"interval",ELLIPSIS:"ellipsis",MULTI_LINE:"multiLine",MULTI_LINE_HEIGHT:1.2,ZOOM_TYPE:"zoom",SCROLL_TYPE:"scroll",SORT_ASCENDING:0,SORT_DESCENDING:1,SORT_NORMAL:2}},function(t,e,i){"use strict";function n(t){return""===t||null===t||t===undefined}function a(t){return t==undefined||null==t}function r(t){return"number"==typeof t&&!isNaN(t)}function o(t){return null===t||t===undefined}Object.defineProperty(e,"__esModule",{value:!0}),e.assign=void 0,e.fixDivisor=function(t){return r(t)&&0!==t?t:1},e.hasDefined=function(t){return!o(t)},e.hasNotDefined=o,e.isEmpty=n,e.isEmptyObj=function(t){return null==t||0===Object.keys(t).length},e.isNull=a,e.isNumber=r,e.isNumberValue=function(t){return!n(t)&&!isNaN(t)},e.isString=function(t){if(a(t))return!1;return"string"==typeof t||null!==t.constructor&&t.constructor===String};var s=Object.assign||function(t){if(t===undefined||null===t)throw new TypeError("Cannot convert undefined or null to object");for(var e=Object(t),i=1;i<arguments.length;i++){var n=arguments[i];if(n!==undefined&&null!==n)for(var a in n)n.hasOwnProperty(a)&&(e[a]=n[a])}return e};e.assign=s},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e._getCanvasTextDim=f,e._getHtmlTextDim=_,e._getSvgTextDim=c,e._getTextDimension=function(t,e,i){if(T(),(0,n.isEmpty)(t))return{width:0,height:0};0;if(i||!g())return _(t,e,i);return e["writing-mode"]?c(t,e):f(t,e)},e.convertREMtoPX=m,e.createCanvas=y,e.createImage=function(t,e,i){if(window&&window.createImageWithLoadingCount)return window.createImageWithLoadingCount(t,e,i);var n=new Image;e&&(n.width=e);i&&(n.height=i);return n.crossOrigin="Anonymous",n.src=t,n},e.getDefaultFontSize=function(){0;if((0,n.hasNotDefined)(d)){var t=document.documentElement.currentStyle||document.defaultView.getComputedStyle(document.documentElement);d=function(t){if(-1!=t.indexOf("px"))return parseFloat(t);if(-1!=t.indexOf("pt"))return 4*parseFloat(t)/3;return 16}(t.fontSize)}return d},e.getPlainText=p,e.getTextHeight=v,e.getTitleText=function(t){var e=t.title;if(e.text&&e.useHtml)return p(e.text);return e.text||""},e.getTransPrefix=void 0,e.isSupportBracketStyleBrowser=function(){var t=navigator.userAgent;if(t.indexOf("Windows NT 5.0")>-1||t.indexOf("Windows 2000")>-1||t.indexOf("Windows NT 5.1")>-1||t.indexOf("Windows XP")>-1||t.indexOf("Windows NT 5.2")>-1||t.indexOf("Windows 2003")>-1||t.indexOf("Windows NT 6.0")>-1||t.indexOf("Windows Vista")>-1||t.indexOf("Windows NT 6.1")>-1||t.indexOf("Windows 7")>-1)return!1;return!0},e.isSupportSVG=g,e.supportFillFilter=function(){return g()||!1},e.svg2zr=function(t){var e={},i=a["default"].pick(t["fill-opacity"],1);e.fill=t.fill&&"none"!=t.fill?r["default"].mixColorWithAlpha(t.fill,i):null;var n=a["default"].pick(t["stroke-opacity"],1);return e.stroke=t.stroke&&"none"!=t.stroke?r["default"].mixColorWithAlpha(t.stroke,n):null,e.lineWidth=a["default"].pick(t["stroke-width"],0),e};var n=i(2),a=s(i(0)),r=s(i(6)),o=(i(73),s(i(5)));function s(t){return t&&t.__esModule?t:{"default":t}}var l,u,h,d;e.getTransPrefix=function(){return"-webkit-transform"in document.body.style?"-webkit-":"-moz-transform"in document.body.style?"-moz-":"-ms-transform"in document.body.style?"-ms-":""};window.SVGSVGElement;function c(t,e){u.style.display="";var i=u._textNode;for(var n in i.textContent=t,i.style.cssText="",e)"function"!=typeof e[n]&&"color"!=n&&(i.style[n]=e[n]);!i.style.whiteSpace&&(i.style.whiteSpace="pre");var a=i.getBBox(),r={width:a.width,height:a.height};return u.style.display="none",r}function f(t,e){T();var i=m(e.fontSize)+"px",n=e.fontStyle||"",a=e.fontWeight||"",r=e.fontFamily||"",o="italic"===n?5:0;-1===r.indexOf(",")&&(r='"'+r+'"'),l.font=n+" "+a+" "+i+" "+r;var s={width:l.measureText(t).width+o||0,height:v(e)};return e["writing-mode"],s}function p(t){return T(),h.style.cssText="visibility: hidden;",h.innerHTML=t,h.textContent?h.textContent:h.innerText}function g(){return!!window.SVGSVGElement}function m(t){return t=-1!=(t+="").indexOf("pt")?4*parseFloat(t)/3:parseFloat(t)}function v(t){return m(t.fontSize||"12px")}function _(t,e,i,n){for(var r in void 0===n&&(n=0),T(),g()?(h.style.cssText="",h.style.visibility="hidden",h.style.display=""):(h._hide||(h.style.cssText="visibility:hidden;",h._hide=!0),h.style.writingMode="",h.style.width="",h.style.height=""),h.style.whiteSpace="nowrap",h.style.position="absolute",e)!o["default"].ielt9||"fontSize"!==r&&"font-size"!==r?"function"!=typeof e[r]&&"color"!=r&&(h.style[r]=e[r]):h.style[r]=a["default"].value2PX(Math.ceil(parseFloat(e[r])));i?h.innerHTML=t:h.textContent?h.textContent=t:h.innerText=t;var s=h.getBoundingClientRect(),l={width:Math.ceil(s.right-s.left),height:Math.ceil(s.bottom-s.top)};return""!==t&&(0===l.width||0===l.height)&&n<2&&(l=_(t,e,i,++n)),g()&&(h.style.display="none"),l}function y(){var t=document.createElement(window.VAN_CANVAS||"canvas");return window.VanCanvasManager&&VanCanvasManager.initElement(t),t}var A=!1;function T(){if(!A&&(A=!0,h=document.createElement("div"),document.body.appendChild(h),g())){var t=y();t.style.cssText="position: absolute; top: -10000px; left: 0; visibility: hidden;",document.body.appendChild(t),l=t.getContext("2d"),(u=document.createElementNS("http://www.w3.org/2000/svg","svg")).style.width=0,u.style.height=0,document.body.appendChild(u);var e=document.createElementNS("http://www.w3.org/2000/svg","text");u.appendChild(e),u._textNode=e,u.style.visibility="hidden"}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.register=e.getComponents=e.getComponent=e.ComponentsRenderOrder=e.ComponentsOrder=e.ComponentCst=void 0;e.ComponentsOrder=["tooltip","tools","title","dTools","geo","rangeLegend","legend","zoom","dataSheet","xAxis","yAxis","polar","angleAxis","radiusAxis","gaugeAxis","value","category","multiCategory","datetime","levelBar","processes","timeAxis","moreLabel","crossLine","plotScroll","pieIndicator"];e.ComponentsRenderOrder=["tooltip","title","dTools","geo","zoom","dataSheet","xAxis","yAxis","polar","angleAxis","radiusAxis","gaugeAxis","rangeLegend","legend","levelBar","processes","timeAxis","moreLabel","crossLine","plotScroll","pieIndicator","tools"];e.ComponentCst={TOOLTIP_COMPONENT:"tooltip",TOOLBAR_COMPONENT:"tools",GEO_COMPONENT:"geo",DRILL_TOOLS:"dTools",TITLE_COMPONENT:"title",RANGE_LEGEND_COMPONENT:"rangeLegend",INTERVAL_RANGE_LEGEND:"intervalRangeLegend",GradientRangeLegend:"gradientRangeLegend",LEGEND_COMPONENT:"legend",DATA_SHEET_COMPONENT:"dataSheet",ZOOM_COMPONENT:"zoom",X_AXIS_COMPONENT:"xAxis",Y_AXIS_COMPONENT:"yAxis",POLAR_COMPONENT:"polar",RADIUS_AXIS_COMPONENT:"radiusAxis",ANGLE_AXIS_COMPONENT:"angleAxis",GAUGE_AXIS_COMPONENT:"gaugeAxis",VALUE_AXIS_COMPONENT:"value",CATEGORY_AXIS_COMPONENT:"category",DATE_AXIS_COMPONENT:"datetime",LEVELBAR:"levelBar",PROCESSES:"processes",TIMEAXIS:"timeAxis",MORELABEL_COMPONENT:"moreLabel",MULTI_CATEGORY_AXIS_COMPONENT:"multiCategory",CROSS_LINE:"crossLine",PLOT_SCROLL:"plotScroll",PIE_INDICATOR:"pieIndicator"};var n=Object.create(null);e.register=function(t,e){return n[t]=e};e.getComponents=function(){return n};e.getComponent=function(t){return n[t]}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=navigator.userAgent.toLowerCase(),r=document.documentElement,o="ActiveXObject"in window,s=-1!==a.indexOf("webkit"),l=-1!==a.indexOf("phantom"),u=-1!==a.search("android [23]"),h=-1!==a.indexOf("chrome"),d=-1!==a.indexOf("gecko")&&!s&&!window.opera&&!o,c=0===navigator.platform.indexOf("Win"),f=a.indexOf("macintosh")>-1,p="undefined"!=typeof orientation||-1!==a.indexOf("mobile"),g=!window.PointerEvent&&window.MSPointerEvent,m=window.PointerEvent||g,v=o&&"transition"in r.style,_="WebKitCSSMatrix"in window&&"m11"in new window.WebKitCSSMatrix&&!u,y="MozPerspective"in r.style,A="OTransition"in r.style,T=/iphone/i.test(a),x=/ipad/i.test(a),b=/ipod/i.test(a),C=!window.L_NO_TOUCH&&(m||"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch);try{var L=document.createElement("canvas");n=!(!window.WebGLRenderingContext||!(L.getContext("webgl")||L.getContext("experimental-webgl")||L.getContext("moz-webgl")))}catch(P){n=!1}var M={ie:o,ielt9:o&&!document.addEventListener,ie9:o&&9===document.documentMode,edge:"msLaunchUri"in navigator&&!("documentMode"in document),webkit:s,gecko:d,android:-1!==a.indexOf("android"),android23:u,chrome:h,safari:!h&&-1!==a.indexOf("safari"),win:c,mac:f,ie3d:v,webkit3d:_,gecko3d:y,opera12:A,any3d:(v||_||y)&&!A&&!l,mobile:p,mobileWebkit:p&&s,mobileWebkit3d:p&&_,mobileOpera:p&&window.opera,mobileGecko:p&&d,touch:!!C,msPointer:!!g,pointer:!!m,retina:(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI)>1,phantomjs:l,iPhone:T,iPad:x,iPod:b,ios:T||x||b,webgl:n};e["default"]=M},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=i(2),a={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#0ff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000",blanchedalmond:"#ffebcd",blue:"#00f",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#0ff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgrey:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#f0f",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",grey:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#789",lightslategrey:"#789",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#0f0",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#f0f",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#f00",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#fff",whitesmoke:"#f5f5f5",yellow:"#ff0",yellowgreen:"#9acd32"},r={},o=[0,0,0,1],s=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i;function l(t,e){return t<=e[0]?t=e[0]:t>=e[1]&&(t=e[1]),t}function u(t,e){if("function"!=typeof e)throw new TypeError;for(var i=t?t.length:0,n=0;n<i;n++)t[n]=e(t[n]);return t}function h(t){if(a[t]&&(t=a[t]),r[t])return r[t].slice();if(t=function(t){return String(t).replace(/\s+/g,"")}(t),/^#[\da-f]{3}$/i.test(t)){var e=(240&(t=parseInt(t.slice(1),16)))<<4,i=15&t;t="#"+((1<<24)+((n=(3840&t)<<8)<<4)+n+(e<<4)+e+(i<<4)+i).toString(16).slice(1)}var n,h,d;if(!(n=t.match(s)))return r[t]=o,o.slice();var c=[];if(n[2])c=u([(h=n[2].replace("#","").split(""))[0]+h[1],h[2]+h[3],h[4]+h[5]],(function(t){return l(parseInt(t,16),[0,255])}));else if(n[4]){var f=n[4].split(",");d=f[3],c=u(f.slice(0,3),(function(t){return l(t=Math.floor(t.indexOf("%")>0?2.55*parseInt(t,0):t),[0,255])})),void 0!==d&&c.push(l(parseFloat(d),[0,1]))}return 3===c.length&&c.push(1),r[t]=c.slice(),c}function d(t,e){if(e=e||"rgb",t&&(3===t.length||4===t.length)){if(t=u(t,(function(t){return t>1?Math.ceil(t):t})),e.indexOf("hex")>-1)return"#"+((1<<24)+(t[0]<<16)+(t[1]<<8)+ +t[2]).toString(16).slice(1);if(e.indexOf("hs")>-1){var i=u(t.slice(1,3),(function(t){return t+"%"}));t[1]=i[0],t[2]=i[1]}return e.indexOf("a")>-1?(3===t.length&&t.push(1),t[3]=l(t[3],[0,1]),e+"("+t.slice(0,4).join(", ")+")"):e+"("+t.slice(0,3).join(", ")+")"}}function c(t,e,i){e=Math.min(1,Math.max(0,e)),i=Math.min(1,Math.max(0,i));var n=0,a=0,r=0;if(0===e)n=a=r=255*i+.5;else{var o=6*(t-Math.floor(t)),s=o-Math.floor(o),l=i*(1-e),u=i*(1-e*s),h=i*(1-e*(1-s));switch(Math.floor(o)){case 0:n=255*i+.5,a=255*h+.5,r=255*l+.5;break;case 1:n=255*u+.5,a=255*i+.5,r=255*l+.5;break;case 2:n=255*l+.5,a=255*i+.5,r=255*h+.5;break;case 3:n=255*l+.5,a=255*u+.5,r=255*i+.5;break;case 4:n=255*h+.5,a=255*l+.5,r=255*i+.5;break;case 5:n=255*i+.5,a=255*l+.5,r=255*u+.5}}var d=[];return d.push(Math.floor(n)),d.push(Math.floor(a)),d.push(Math.floor(r)),d}function f(t,e,i){var n,a,r,o=[3],s=t>e?t:e;i>s&&(s=i);var l=t<e?t:e;if(i<l&&(l=i),r=s/255,0===(a=0!==s?(s-l)/s:0))n=0;else{var u=(s-t)/(s-l),h=(s-e)/(s-l),d=(s-i)/(s-l);n=t==s?d-h:e==s?2+u-d:4+h-u,(n/=6)<0&&(n+=1)}return o[0]=n,o[1]=a,o[2]=r,o}function p(t){return t&&"string"==typeof t&&-1!=t.indexOf("rgba")?h(t)[3]:1}function g(t){var e,i,n,a=d(h(t),"rgba").replace(/\s+/g,"").match(/rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([.\d]+))?\)/);return{hex:"#"+(e=1===(e=(+a[1]).toString(16)).length?"0"+e:e)+(i=1===(i=(+a[2]).toString(16)).length?"0"+i:i)+(n=1===(n=(+a[3]).toString(16)).length?"0"+n:n),alpha:+(a[5]?a[5]:1)}}var m={hasColorName:function(t){return a[t]},toColor:d,hsb2rgb:c,hsl2rgb:function(t,e,i){t/=360,i/=100;var n=[];if(0==(e=e/100))n=[Math.round(255*i),Math.round(255*i),Math.round(255*i)];else for(var a=i>=.5?i+e-i*e:i*(1+e),r=2*i-a,o=(n[0]=t+1/3,n[1]=t,n[2]=t-1/3,0);o<n.length;o++){var s=n[o];switch(s<0?s+=1:s>1&&(s-=1),!0){case s<1/6:s=r+6*(a-r)*s;break;case 1/6<=s&&s<.5:s=a;break;case.5<=s&&s<2/3:s=r+(a-r)*(4-6*s);break;default:s=r}n[o]=Math.round(255*s)}return n},rgb2hsb:f,rgb2hsl:function(t,e,i){t/=255,e/=255,i/=255;var n,a,r=Math.min(t,e,i),o=Math.max(t,e,i),s=(r+o)/2,l=o-r;if(o==r)n=0,a=0;else{switch(a=s>.5?l/(2-o-r):l/(o+r),o){case t:n=(e-i)/l+(e<i?6:0);break;case e:n=2+(i-t)/l;break;case i:n=4+(t-e)/l}n=Math.round(60*n)}return[n,a=Math.round(100*a),s=Math.round(100*s)]},createColorsWithHsb:function(t,e){e=e||1;for(var i=h(t=t||"blue"),n=f(i[0],i[1],i[2]),a=[],r=n[0],o=n[1],s=n[2],l=0;l<e;l++){var u=o*(1-l/e),p=s+l*(1-s)/e;a.push(d(c(r,u,p)))}return a},getRGBAColorArray:h,mixColorWithHSB:function(t,e,i,n){var a=h(t),r=f(a[0],a[1],a[2]);return r[0]+=e,r[1]+=i,r[2]+=n,d(c(r[0],r[1],r[2]),"rgb")},getHighLightColor:function(t){for(var e=h(t),i=[],n=0;n<3;n++){var a=e[n];a<=128?i.push(l(a-(255-a)*(255-2*a)/(2*a),[0,255])):i.push(l(a+a*(2*a-255)/(2*(255-a)),[0,255]))}var r=[];for(n=0;n<3;n++)r.push(Math.round(.65*e[n]+.35*i[n]));return d(r,"rgb")},getColorWithDivider:function(t,e){var i=h(t);i.length=3;for(var n=0;n<3;n++)i[n]=parseInt(i[n]/e,10);return d(i,"rgb")},mixColorWithAlpha:function(t,e){var i=h(t);return i[3]=e,d(i,"rgba")},getColorOpacity:p,getColorOpacityWithoutDefault:function(t){return t&&"string"==typeof t&&-1!=t.indexOf("rgba")?p(t):undefined},colorToHex:function(t){return g(t).hex},colorToHexAlpha:g,colorToHexARGB:function(t){var e=g(t);return"#"+("0"+(255*e.alpha|0).toString(16)).slice(-2)+e.hex.replace("#","")},getClickColor:function(t){var e=h(t);e.length=3;for(var i=0;i<2;i++)e[i]=parseInt(.95*e[i],10);return d(e,"rgb")},getStandardColorAndOpacity:function(t,e){if((0,n.isEmpty)(t))return{hex:t,alpha:e};(0,n.isEmpty)(e)&&(e=1),e=l(parseFloat(e),[0,1]);var i=g(t);return null!=i.alpha&&(e*=i.alpha),{hex:i.hex,oriAlpha:i.alpha,alpha:e}}};e["default"]=m},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=s(i(0)),a=s(i(13)),r=s(i(5)),o=i(2);function s(t){return t&&t.__esModule?t:{"default":t}}var l={get:function(t){return"string"==typeof t?document.getElementById(t):t},getStyle:function(t,e){var i=t.style[e]||t.currentStyle&&t.currentStyle[e];if((!i||"auto"===i)&&document.defaultView){var n=document.defaultView.getComputedStyle(t,null);i=n?n[e]:null}return"auto"===i?null:i},create:function(t,e,i){var n=document.createElement(t);return n.className=e||"",i&&i.appendChild(n),n},remove:function(t){t&&t.parentNode&&t.parentNode.removeChild(t)},empty:function(t){for(;t.firstChild;)t.removeChild(t.firstChild)},toFront:function(t){t&&t.parentNode&&t.parentNode.appendChild(t)},toBack:function(t){if(t&&t.parentNode){var e=t.parentNode;e.insertBefore(t,e.firstChild)}},hasClass:function(t,e){if(t.classList!==undefined)return t.classList.contains(e);var i=l.getClass(t);return i.length>0&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(i)},addClass:function(t,e){if(t.classList!==undefined)for(var i=n["default"].splitWords(e),a=0,r=i.length;a<r;a++)t.classList.add(i[a]);else if(!l.hasClass(t,e)){var o=l.getClass(t);l.setClass(t,(o?o+" ":"")+e)}},removeClass:function(t,e){t.classList!==undefined?t.classList.remove(e):l.setClass(t,n["default"].trim((" "+l.getClass(t)+" ").replace(" "+e+" "," ")))},setClass:function(t,e){t.className.baseVal===undefined?t.className=e:t.className.baseVal=e},getClass:function(t){return t.className.baseVal===undefined?t.className:t.className.baseVal},setOpacity:function(t,e){"opacity"in t.style?t.style.opacity=e:"filter"in t.style&&l._setOpacityIE(t,e)},_setOpacityIE:function(t,e){var i=!1,n="DXImageTransform.Microsoft.Alpha";try{i=t.filters.item(n)}catch(a){if(1===e)return}e=Math.round(100*e),i?(i.Enabled=100!==e,i.Opacity=e):t.style.filter+=" progid:"+n+"(opacity="+e+")"},testProp:function(t){for(var e=document.documentElement.style,i=0;i<t.length;i++)if(t[i]in e)return t[i];return!1},setTransform:function(t,e,i){var n=e||{x:0,y:0};t.style[l.TRANSFORM]=(r["default"].ie3d?"translate("+n.x+"px,"+n.y+"px)":"translate3d("+n.x+"px,"+n.y+"px,0)")+(i?" scale("+i+")":"")},setPosition:function(t,e){t._leaflet_pos=e,r["default"].any3d?l.setTransform(t,e):(t.style.left=e.x+"px",t.style.top=e.y+"px")},getPosition:function(t){return t._leaflet_pos||a["default"].create({x:0,y:0})},getMousePos:function(t,e){var i,n,r=t.touches?t.touches.length?t.touches[0]:t.changedTouches[0]:t,o=e.getBoundingClientRect();return null==o.width?(i=Math.round(r.clientX-o.left),n=Math.round(r.clientY-o.top)):(i=Math.round((r.clientX-o.left)*(e.offsetWidth/o.width)),n=Math.round((r.clientY-o.top)*(e.offsetHeight/o.height))),a["default"].create(i,n)},_wheelPxFactor:r["default"].win&&r["default"].chrome?2:r["default"].gecko?window.devicePixelRatio:1,getWheelDelta:function(t){return r["default"].edge?t.wheelDeltaY/2:t.deltaY&&0===t.deltaMode?-t.deltaY/l._wheelPxFactor:t.deltaY&&1===t.deltaMode?20*-t.deltaY:t.deltaY&&2===t.deltaMode?60*-t.deltaY:t.deltaX||t.deltaZ?0:t.wheelDelta?(t.wheelDeltaY||t.wheelDelta)/2:t.detail&&Math.abs(t.detail)<32765?20*-t.detail:t.detail?t.detail/-32765*60:0},preventDefault:function(t){return t.preventDefault?t.preventDefault():t.returnValue=!1,this},stopPropagation:function(t){return t.stopPropagation?t.stopPropagation():t.cancelBubble=!0,this},stop:function(t){return l.preventDefault(t).stopPropagation(t)},attr:function(){if(!(arguments.length<2)){var t,e,i=arguments[0],n=arguments[1],a=arguments[2];if("string"==typeof n)(0,o.hasDefined)(a)?i.setAttribute(n,a):i&&i.getAttribute&&(e=i.getAttribute(n));else if((0,o.hasDefined)(n)&&"object"==typeof n)for(t in n)i.setAttribute(t,n[t]);return e}},style:function(t,e){Object.keys(e).forEach((function(i){t.style[i]=e[i]}))},createSvgDom:function(t,e){var i=document.createElementNS("http://www.w3.org/2000/svg",t);return e&&e.appendChild(i),i},appendSvgStr2Dom:function(t,e){var i=document.createElement("div");i.innerHTML="<svg>"+e+"</svg>";for(var n=i.childNodes[0].childNodes,a=0,r=n.length;a<r;a++)t.appendChild(n[0])}};!function(){l.TRANSFORM=l.testProp(["transform","WebkitTransform","OTransform","MozTransform","msTransform"]),l.TRANSFORM_ORIGIN=l.testProp(["transformOrigin","WebkitTransformOrigin","OTransformOrigin","MozTransformOrigin","msTransformOrigin"]);var t=l.TRANSITION=l.testProp(["webkitTransition","transition","OTransition","MozTransition","msTransition"]);l.TRANSITION_END="webkitTransition"===t||"OTransition"===t?t+"End":"transitionend"}();var u=l;e["default"]=u},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(40))&&n.__esModule?n:{"default":n};var r=Math.PI/2,o="object"==typeof window?window:o,s=11,l=.1,u="Float32Array"in o;function h(t,e){return 1-3*e+3*t}function d(t,e){return 3*e-6*t}function c(t){return 3*t}function f(t,e,i){return((h(e,i)*t+d(e,i))*t+c(e))*t}function p(t,e,i){return 3*h(e,i)*t*t+2*d(e,i)*t+c(e)}function g(t,e,i,n,a){var r,o,s=0;do{(r=f(o=e+(i-e)/2,n,a)-t)>0?i=o:e=o}while(Math.abs(r)>1e-7&&++s<10);return o}function m(t,e,i,n){if(4!==arguments.length)throw new Error("BezierEasing requires 4 arguments.");for(var a=0;a<4;++a)if("number"!=typeof arguments[a]||isNaN(arguments[a])||!isFinite(arguments[a]))throw new Error("BezierEasing arguments should be integers.");if(t<0||t>1||i<0||i>1)throw new Error("BezierEasing x values must be in [0, 1] range.");var r=u?new Float32Array(s):[];function o(e,n){for(var a=0;a<4;++a){var r=p(n,t,i);if(0===r)return n;n-=(f(n,t,i)-e)/r}return n}function h(){for(var e=0;e<s;++e)r[e]=f(e*l,t,i)}function d(e){for(var n=0,a=1;10!=a&&r[a]<=e;++a)n+=l;--a;var s=n+(e-r[a])/(r[a+1]-r[a])*l,u=p(s,t,i);return u>=.001?o(e,s):0===u?s:g(e,n,n+l,t,i)}var c=!1;function m(){c=!0,t==e&&i==n||h()}var v=function(a){return c||m(),t===e&&i===n?a:0===a?0:1-a<.001?1:f(d(a),e,n)};v.getControlPoints=function(){return[{x:t,y:e},{x:i,y:n}]};var _=[t,e,i,n],y="BezierEasing("+_+")";return v.toString=function(){return y},v}m.css={ease:m(.25,.1,.25,1),linear:m(0,0,1,1),"ease-in":m(.42,0,1,1),"ease-out":m(0,0,.58,1),"ease-in-out":m(.42,0,.58,1),swing:m(.02,.01,.47,1),"ease-in-back":m(.6,-.28,.735,.045),"ease-out-back":m(.175,.885,.32,1.275),"ease-in-quart":m(.895,.03,.685,.22),"ease-out-quart":m(.165,.84,.44,1),"ease-in-quint":m(.755,.05,.855,.06),"ease-out-quint":m(.23,1,.32,1),"ease-in-quad":m(.55,.085,.68,.53),"ease-out-quad":m(.25,.46,.45,.94),"ease-in-out-quad":m(.455,.03,.515,.955),"ease-out-cubic":m(.215,.61,.355,1)},m.custom={"ease-out":m(0,0,.16,1),"ease-out-quint":m(.19,1,.22,1),"ease-out-back":m(.18,.89,.32,1.6)},m.calculateCubicOutT=function(t){return 1-Math.pow(1-t,1/3)},m.calculateQuadInT=function(t){return Math.sqrt(t)};var v=2*Math.PI,_=function(t){return t},y=function(){return _},A=new a["default"]({linear:y,poly:function(t){return function(e){return Math.pow(e,t)}},quad:function(){return L},cubic:function(){return M},sin:function(){return P},exp:function(){return S},circle:function(){return w},elastic:function(t,e){var i;arguments.length<2&&(e=.45);arguments.length?i=e/v*Math.asin(1/t):(t=1,i=e/4);return function(n){return 1+t*Math.pow(2,-10*n)*Math.sin((n-i)*v/e)}},back:function(t){t||(t=1.70158);return function(e){return e*e*((t+1)*e-t)}},bounce:function(){return E}}),T=new a["default"]({"in":_,out:b,"in-out":C,"out-in":function(t){return C(b(t))}});function x(t){return function(e){return e<=0?0:e>=1?1:t(e)}}function b(t){return function(e){return 1-t(1-e)}}function C(t){return function(e){return.5*(e<.5?t(2*e):2-t(2-2*e))}}function L(t){return t*t}function M(t){return t*t*t}function P(t){return 1-Math.cos(t*r)}function S(t){return Math.pow(2,10*(t-1))}function w(t){return 1-Math.sqrt(1-t*t)}function E(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}m.ease=function(t){var e=t.indexOf("-"),i=e>=0?t.slice(0,e):t,n=e>=0?t.slice(e+1):"in";return i=A.get(i)||y,x((n=T.get(n)||_)(i.apply(null,Array.prototype.slice.call(arguments,1))))};var O=m;e["default"]=O},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=r(i(40)),a=r(i(1));function r(t){return t&&t.__esModule?t:{"default":t}}var o,s=1e-6,l=Math.PI,u=2*l-s,h=l/2,d=Math.abs;function c(t){return t>1?h:t<-1?-h:Math.asin(t)}function f(t){return t[0]}function p(t){return t[1]}function g(t){return t}function m(){return!0}var v={};function _(){return 0}v.arc=function(){var t=!0,e=!0,i=A,n=T,a=_,r=y,o=x,s=b,d=C;function f(){var f=Math.max(0,+i.apply(this,arguments)),g=Math.max(0,+n.apply(this,arguments)),m=o.apply(this,arguments)-h,v=s.apply(this,arguments)-h,_=Math.abs(v-m),A=m>v?0:1;if(g<f&&(T=g,g=f,f=T),_>=u)return p(g,A)+(f?p(f,1-A):"")+"Z";var T,x,b,C,S,w,E,O,R,k,I,D,N=0,B=0,F=[];if((C=(+d.apply(this,arguments)||0)/2)&&(b=r===y?Math.sqrt(f*f+g*g):+r.apply(this,arguments),A||(B*=-1),g&&(B=c(b/g*Math.sin(C))),f&&(N=c(b/f*Math.sin(C)))),g){S=g*Math.cos(m+B),w=g*Math.sin(m+B),E=g*Math.cos(v-B),O=g*Math.sin(v-B);var G=Math.abs(v-m-2*B)<=l?0:1;if(B&&L(S,w,E,O)===A^G){var H=(m+v)/2;S=g*Math.cos(H),w=g*Math.sin(H),E=O=null}}else S=w=0;if(f){R=f*Math.cos(v-N),k=f*Math.sin(v-N),I=f*Math.cos(m+N),D=f*Math.sin(m+N);var z=Math.abs(m-v+2*N)<=l?0:1;if(N&&L(R,k,I,D)===1-A^z){var V=(m+v)/2;R=f*Math.cos(V),k=f*Math.sin(V),I=D=null}}else R=k=0;if((T=Math.min(Math.abs(g-f)/2,+a.apply(this,arguments)))>.001){x=f<g^A?0:1;var W=null==I?[R,k]:null==E?[S,w]:P([S,w],[I,D],[E,O],[R,k]),U=S-W[0],Y=w-W[1],X=E-W[0],j=O-W[1],Z=1/Math.sin(Math.acos((U*X+Y*j)/(Math.sqrt(U*U+Y*Y)*Math.sqrt(X*X+j*j)))/2),Q=Math.sqrt(W[0]*W[0]+W[1]*W[1]);if(null!=E){var q=Math.min(T,(g-Q)/(Z+1)),K=M(null==I?[R,k]:[I,D],[S,w],g,q,A),J=M([E,O],[R,k],g,q,A);T===q?F.push("M",K[0],"A",q,",",q," 0 0,",x," ",K[1],"A",g,",",g," 0 ",1-A^L(K[1][0],K[1][1],J[1][0],J[1][1]),",",A," ",J[1],"A",q,",",q," 0 0,",x," ",J[0]):F.push("M",K[0],"A",q,",",q," 0 1,",x," ",J[0])}else F.push("M",S,",",w);if(null!=I){var $=Math.min(T,(f-Q)/(Z-1)),tt=M([S,w],[I,D],f,-$,A),et=M([R,k],null==E?[S,w]:[E,O],f,-$,A);T===$?F.push("L",et[0],"A",$,",",$," 0 0,",x," ",et[1],"A",f,",",f," 0 ",A^L(et[1][0],et[1][1],tt[1][0],tt[1][1]),",",1-A," ",tt[1],"A",$,",",$," 0 0,",x," ",tt[0]):F.push("L",et[0],"A",$,",",$," 0 0,",x," ",tt[0])}else t&&F.push("L",R,",",k)}else F.push("M",S,",",w),null!=E&&F.push("A",g,",",g," 0 ",G,",",A," ",E,",",O),t&&F.push("L",R,",",k),null!=I&&F.push("A",f,",",f," 0 ",z,",",1-A," ",I,",",D);return e&&F.push("Z"),F.join("")}function p(t,e){return"M0,"+t+"A"+t+","+t+" 0 1,"+e+" 0,"+-t+"A"+t+","+t+" 0 1,"+e+" 0,"+t}return f.toCenter=function(e){return arguments.length?(t=!!e,f):t},f.closePath=function(t){return arguments.length?(e=!!t,f):e},f.innerRadius=function(t){return arguments.length?(i=S(t),f):i},f.outerRadius=function(t){return arguments.length?(n=S(t),f):n},f.cornerRadius=function(t){return arguments.length?(a=S(t),f):a},f.padRadius=function(t){return arguments.length?(r=t==y?y:S(t),f):r},f.startAngle=function(t){return arguments.length?(o=S(t),f):o},f.endAngle=function(t){return arguments.length?(s=S(t),f):s},f.padAngle=function(t){return arguments.length?(d=S(t),f):d},f.centroid=function(){var t=(+i.apply(this,arguments)+ +n.apply(this,arguments))/2,e=(+o.apply(this,arguments)+ +s.apply(this,arguments))/2-h;return[Math.cos(e)*t,Math.sin(e)*t]},f};var y="auto";function A(t){return t.innerRadius}function T(t){return t.outerRadius}function x(t){return t.startAngle}function b(t){return t.endAngle}function C(t){return t&&t.padAngle}function L(t,e,i,n){return(t-i)*e-(e-n)*t>0?0:1}function M(t,e,i,n,a){var r=t[0]-e[0],o=t[1]-e[1],s=(a?n:-n)/Math.sqrt(r*r+o*o),l=s*o,u=-s*r,h=t[0]+l,d=t[1]+u,c=e[0]+l,f=e[1]+u,p=(h+c)/2,g=(d+f)/2,m=c-h,v=f-d,_=m*m+v*v,y=i-n,A=h*f-c*d,T=(v<0?-1:1)*Math.sqrt(y*y*_-A*A),x=(A*v-m*T)/_,b=(-A*m-v*T)/_,C=(A*v+m*T)/_,L=(-A*m+v*T)/_,M=x-p,P=b-g,S=C-p,w=L-g;return M*M+P*P>S*S+w*w&&(x=C,b=L),[[x-l,b-u],[x*i/y,b*i/y]]}function P(t,e,i,n){var a=t[0],r=i[0],o=e[0]-a,s=n[0]-r,l=t[1],u=i[1],h=e[1]-l,d=n[1]-u,c=(s*(l-u)-d*(a-r))/(d*o-s*h);return[a+c*o,l+c*h]}function S(t){return"function"==typeof t?t:function(){return t}}function w(t){var e=f,i=p,n=m,a=O,r=a.key,o=.7;function s(r,s){var l,u=[],h=[],d=-1,c=r.length,f=S(e),p=S(i);function g(){u.push("M",a(t(h),o))}for(;++d<c;)n.call(this,l=r[d],d)?h.push([+f.call(this,l,d),+p.call(this,l,d)]):h.length&&(g(),h=[]);return h.length&&g(),u.length?u.join(""):null}return s.x=function(t){return arguments.length?(e=t,s):e},s.y=function(t){return arguments.length?(i=t,s):i},s.defined=function(t){return arguments.length?(n=t,s):n},s.interpolate=function(t){return arguments.length?(r="function"==typeof t?a=t:(a=E.get(t)||O).key,s):r},s.tension=function(t){return arguments.length?(o=t,s):o},s}v.line=function(t){return o=t,w(g)};var E=new n["default"]({linear:O,"linear-closed":function(t){return O(t)+"Z"},step:function(t){var e=0,i=t.length,n=t[0],a=[n[0],",",n[1]];for(;++e<i;)a.push("H",(n[0]+(n=t[e])[0])/2,"V",n[1]);i>1&&a.push("H",n[0]);return a.join("")},"step-before":R,"step-after":k,basis:B,"basis-open":function(t){if(t.length<4)return O(t);var e,i=[],n=-1,a=t.length,r=[0],o=[0];for(;++n<3;)e=t[n],r.push(e[0]),o.push(e[1]);i.push(F(z,r)+","+F(z,o)),--n;for(;++n<a;)e=t[n],r.shift(),r.push(e[0]),o.shift(),o.push(e[1]),V(i,r,o);return i.join("")},"basis-closed":function(t){var e,i,n=-1,a=t.length,r=a+4,o=[],s=[];for(;++n<4;)i=t[n%a],o.push(i[0]),s.push(i[1]);e=[F(z,o),",",F(z,s)],--n;for(;++n<r;)i=t[n%a],o.shift(),o.push(i[0]),s.shift(),s.push(i[1]),V(e,o,s);return e.join("")},bundle:function(t,e){var i=t.length-1;if(i)for(var n,a,r=t[0][0],o=t[0][1],s=t[i][0]-r,l=t[i][1]-o,u=-1;++u<=i;)n=t[u],a=u/i,n[0]=e*n[0]+(1-e)*(r+a*s),n[1]=e*n[1]+(1-e)*(o+a*l);return B(t)},cardinal:function(t,e){return t.length<3?O(t):t[0]+I(t)},"cardinal-open":function(t,e){return t.length<4?O(t):t[1]+D(t.slice(1,-1),N(t,e))},"cardinal-closed":function(t,e){return t.length<3?O(t):t[0]+D((t.push(t[0]),t),N([t[t.length-2]].concat(t,[t[1]]),e))},monotone:function(t){return t.length<3?O(t):t[0]+D(t,function(t){var e,i,n,a,r=[],o=function(t){var e=0,i=t.length-1,n=[],a=t[0],r=t[1],o=n[0]=W(a,r);for(;++e<i;)n[e]=(o+(o=W(a=r,r=t[e+1])))/2;return n[e]=o,n}(t),l=-1,u=t.length-1;for(;++l<u;)e=W(t[l],t[l+1]),d(e)<s?o[l]=o[l+1]=0:(a=(i=o[l]/e)*i+(n=o[l+1]/e)*n)>9&&(a=3*e/Math.sqrt(a),o[l]=a*i,o[l+1]=a*n);l=-1;for(;++l<=u;)a=(t[Math.min(u,l+1)][0]-t[Math.max(0,l-1)][0])/(6*(1+o[l]*o[l])),r.push([a||0,o[l]*a||0]);return r}(t))}});function O(t){return t.join("L")}function R(t){for(var e=0,i=t.length,n=t[0],a=[n[0],",",n[1]];++e<i;)a.push("V",(n=t[e])[1],"H",n[0]);return a.join("")}function k(t){for(var e=0,i=t.length,n=t[0],a=[n[0],",",n[1]];++e<i;)a.push("H",(n=t[e])[0],"V",n[1]);return a.join("")}function I(t){if(t.length<3)return O(t);for(var e,i,n,a,r,s,l,u,h,d,c,f,p,g,m,v=1.5,_=2.5,y=0,A=0,T=t.length-1,x="";A++<T;)e=t[A-1],i=t[A],n=A==T?t[A]:t[A+1],o?(a=e[1]||0,r=e[0]||0,s=i[1]||0,l=i[0]||0,u=n[1]||0,h=n[0]||0):(a=e[0]||0,r=e[1]||0,s=i[0]||0,l=i[1]||0,u=n[0]||0,h=n[1]||0),c=(v*l+r)/_,p=(v*l+h)/_,(f=(v*s+u)/_)!=(d=(v*s+a)/_)&&(y=(p-c)*(f-s)/(f-d)+l-p),p+=y,(c+=y)>r&&c>l?p=2*l-(c=Math.max(r,l)):c<r&&c<l&&(p=2*l-(c=Math.min(r,l))),p>h&&p>l?c=2*l-(p=Math.max(h,l)):p<h&&p<l&&(c=2*l-(p=Math.min(h,l))),x+=o?"C"+(m||r||0)+","+(g||a||0)+","+(c||l||0)+","+(d||s||0)+","+l+","+s:"C"+(g||a||0)+","+(m||r||0)+","+(d||s||0)+","+(c||l||0)+","+s+","+l,g=f,m=p;return x}function D(t,e){if(e.length<1||t.length!=e.length&&t.length!=e.length+2)return O(t);var i=t.length!=e.length,n="",a=t[0],r=t[1],o=e[0],s=o,l=1;if(i&&(n+="Q"+(r[0]-2*o[0]/3)+","+(r[1]-2*o[1]/3)+","+r[0]+","+r[1],a=t[1],l=2),e.length>1){s=e[1],r=t[l],l++,n+="C"+(a[0]+o[0])+","+(a[1]+o[1])+","+(r[0]-s[0])+","+(r[1]-s[1])+","+r[0]+","+r[1];for(var u=2;u<e.length;u++,l++)r=t[l],s=e[u],n+="S"+(r[0]-s[0])+","+(r[1]-s[1])+","+r[0]+","+r[1]}if(i){var h=t[l];n+="Q"+(r[0]+2*s[0]/3)+","+(r[1]+2*s[1]/3)+","+h[0]+","+h[1]}return n}function N(t,e){for(var i,n=[],a=(1-e)/2,r=t[0],o=t[1],s=1,l=t.length;++s<l;)i=r,r=o,o=t[s],n.push([a*(o[0]-i[0]),a*(o[1]-i[1])]);return n}function B(t){if(t.length<3)return O(t);var e=1,i=t.length,n=t[0],a=n[0],r=n[1],o=[a,a,a,(n=t[1])[0]],s=[r,r,r,n[1]],l=[a,",",r,"L",F(z,o),",",F(z,s)];for(t.push(t[i-1]);++e<=i;)n=t[e],o.shift(),o.push(n[0]),s.shift(),s.push(n[1]),V(l,o,s);return t.pop(),l.push("L",n),l.join("")}function F(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]+t[3]*e[3]}E.forEach((function(t,e){e.key=t,e.closed=/-closed$/.test(t)})),v.d3_svg_lineCardinalHighCharts=I;var G=[0,2/3,1/3,0],H=[0,1/3,2/3,0],z=[0,1/6,2/3,1/6];function V(t,e,i){t.push("C",F(G,e),",",F(G,i),",",F(H,e),",",F(H,i),",",F(z,e),",",F(z,i))}function W(t,e){return(e[1]-t[1])/(e[0]-t[0])}function U(t){for(var e,i,n,a=-1,r=t.length;++a<r;)i=(e=t[a])[0],n=e[1]-h,e[0]=i*Math.cos(n),e[1]=i*Math.sin(n);return t}function Y(t){var e=f,i=f,n=0,a=p,r=m,o=O,s=o.key,l=o,u="L",h=.7;function d(s){var d,c,f,p=[],g=[],m=[],v=-1,_=s.length,y=S(e),A=S(n),T=e===i?function(){return c}:S(i),x=n===a?function(){return f}:S(a);function b(){p.push("M",o(t(m),h),u,l(t(g.reverse()),h),"Z")}for(;++v<_;)r.call(this,d=s[v],v)?(g.push([c=+y.call(this,d,v),f=+A.call(this,d,v)]),m.push([+T.call(this,d,v),+x.call(this,d,v)])):g.length&&(b(),g=[],m=[]);return g.length&&b(),p.length?p.join(""):null}return d.x=function(t){return arguments.length?(e=i=t,d):i},d.x0=function(t){return arguments.length?(e=t,d):e},d.x1=function(t){return arguments.length?(i=t,d):i},d.y=function(t){return arguments.length?(n=a=t,d):a},d.y0=function(t){return arguments.length?(n=t,d):n},d.y1=function(t){return arguments.length?(a=t,d):a},d.defined=function(t){return arguments.length?(r=t,d):r},d.interpolate=function(t){return arguments.length?(s="function"==typeof t?o=t:(o=E.get(t)||O).key,l=o.reverse||o,u=o.closed?"M":"L",d):s},d.tension=function(t){return arguments.length?(h=t,d):h},d}function X(t){return t.source}function j(t){return t.target}function Z(t){return[t.x,t.y]}function Q(t){return t/180*Math.PI}function q(t,e,i){return[(Math.sin(t)*e).toFixed(i),(-Math.cos(t)*e).toFixed(i)]}v.line.radial=function(){var t=w(U);return t.radius=t.x,delete t.x,t.angle=t.y,delete t.y,t},R.reverse=k,k.reverse=R,v.area=function(){return Y(g)},v.area.radial=function(){var t=Y(U);return t.radius=t.x,delete t.x,t.innerRadius=t.x0,delete t.x0,t.outerRadius=t.x1,delete t.x1,t.angle=t.y,delete t.y,t.startAngle=t.y0,delete t.y0,t.endAngle=t.y1,delete t.y1,t},v.diagonal=function(){var t=X,e=j,i=Z;function n(n,a){var r=t.call(this,n,a),o=e.call(this,n,a),s=(r.y+o.y)/2,l=[r,{x:r.x,y:s},{x:o.x,y:s},o];return"M"+(l=l.map(i))[0]+"C"+l[1]+" "+l[2]+" "+l[3]}return n.source=function(e){return arguments.length?(t=S(e),n):t},n.target=function(t){return arguments.length?(e=S(t),n):e},n.projection=function(t){return arguments.length?(i=t,n):i},n},v.getMarkerPath=function(t,e){switch(t){case a["default"].SYMBOL_AUTO:case a["default"].CIRCLE:case a["default"].CIRCLE_HOLLOW:return v.arc().outerRadius(e)({startAngle:0,endAngle:2*Math.PI});case a["default"].SQUARE:case a["default"].SQUARE_HOLLOW:return"M"+(-e+","+-e)+"L"+(e+","+-e)+"L"+(e+","+e)+"L"+(-e+","+e)+"Z";case a["default"].DIAMOND:case a["default"].DIAMOND_HOLLOW:return"M"+(-e+",0")+"L"+("0,"+-e)+"L"+(e+",0")+"L"+("0,"+e)+"Z";case a["default"].TRIANGLE:case a["default"].TRIANGLE_HOLLOW:var i=Math.sqrt(3);return"M"+(-2*e/i+","+e)+"L"+("0,"+-e)+"L"+(2*e/i+","+e)+"Z";case a["default"].STAR:for(var n=(e*=1.105)*Math.sin(Q(18))/(Math.sin(Q(36))+Math.sin(Q(18))*Math.cos(Q(36))),r="",o=-1;++o<5;){var s=o*Q(72),l=s+Q(36),u=q(s,e,3),h=q(l,n,3);r+=(o?"L":"M")+u[0]+","+u[1],r+="L"+h[0]+","+h[1]}return r+="z";case a["default"].LOCATION:return"M34.75,15.75A14.75,14.75,0,1,0,8.19,24.51L20,40,31.82,24.51h0A14.62,14.62,0,0,0,34.75,15.75ZM20,21.91a5.77,5.77,0,1,1,5.77-5.77A5.77,5.77,0,0,1,20,21.91Z";case a["default"].ANCHOR_ICON:return"M0,-28 C4.97056275,-28 9,-24.00634644 9,-19.07992512 C9,-17.8616986 8.75360187,-16.7005104 8.30750495,-15.642645 C7.4180692,-13.7976331 6.60280551,-12.1374788 5.86171387,-10.6522416 L5.49734905,-9.9241533 C2.09460285,-3.1449169 0.365363613,-0.2748662 0.309631348,-0.2486559 C0.152069092,0.0828853 -0.279388428,0.0828853 -0.451770485,-0.2486559 L-8.30750495,-15.642645 C-8.75360187,-16.7005104 -9,-17.8616986 -9,-19.07992512 C-9,-24.00634644 -4.97056275,-28 0,-28 Z M0,-22 C-1.65685425,-22 -3,-20.65685425 -3,-19 C-3,-17.3431458 -1.65685425,-16 0,-16 C1.65685425,-16 3,-17.3431458 3,-19 C3,-20.65685425 1.65685425,-22 0,-22 Z";default:return""}};var K=v;e["default"]=K},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=s(i(18)),a=s(i(40)),r=s(i(0)),o=i(2);function s(t){return t&&t.__esModule?t:{"default":t}}function l(t,e,i,n,a){var r=i(t[0],t[1]),s=n(e[0],e[1]);return function(t){var e=s(r(t));return a&&(0,o.hasDefined)(a[0])&&(e=Math.max(e,a[0])),a&&(0,o.hasDefined)(a[1])&&(e=Math.min(e,a[1])),e}}function u(t,e,i,n){var a=[],r=[],o=0,s=Math.min(t.length,e.length)-1;for(t[s]<t[0]&&(t=t.slice().reverse(),e=e.slice().reverse());++o<=s;)a.push(i(t[o-1],t[o])),r.push(n(e[o-1],e[o]));return function(e){var i=function(t,e,i,n){arguments.length<3&&(i=0);arguments.length<4&&(n=t.length);for(;i<n;){var a=i+n>>>1;h(t[a],e)>0?n=a:i=a+1}return i}(t,e,1,s)-1;return r[i](a[i](e))}}function h(t,e){return t<e?-1:t>e?1:t>=e?0:NaN}function d(t,e,i,a,r){var o,s;function h(){var n=Math.min(t.length,e.length)>2?u:l;return o=n(t,e,a,i,r),s=n(e,t,a,i,r),c}function c(t){return o(t)}return c.invert=function(t){return s(t)},c.domain=function(e){return arguments.length?(t=e.map(Number),h()):t},c.range=function(t){return arguments.length?(e=t,h()):e},c.minMax=function(t){return arguments.length?(r=t,h()):r},c.rangeRound=function(t){return c.range(t).interpolate(n["default"].interpolateRound)},c.interpolate=function(t){return arguments.length?(i=t,h()):i},c.uninterpolate=function(t){return arguments.length?(a=t,h()):a},c.copy=function(){return d(t,e,i,a,r)},h()}function c(t,e,i,n){function a(t){return(i?Math.log(t<0?0:t):-Math.log(t>0?0:-t))/Math.log(e)}function o(e){return t(a(e))}return o.invert=function(n){return function(t){return i?Math.pow(e,t):-Math.pow(e,-t)}(t.invert(n))},o.domain=function(e){return arguments.length?(i=e[0]>=0,t.domain((n=e.map(Number)).map(a)),o):n},o.base=function(i){return arguments.length?(e=+i,t.domain(n.map(a)),o):e},o.copy=function(){return c(t.copy(),e,i,n)},function(t,e){return r["default"].rebind(t,e,"range","rangeRound","interpolate")}(o,t)}function f(t,e){var i,n,r;function o(a){return n[((i.get(a)||("range"===e.t?i.set(a,t.push(a)):NaN))-1)%n.length]}function s(e,i){for(var n=[],a=t.length,r=0;r<a;r++)n.push(e+i*r);return n}return o.domain=function(n){if(!arguments.length)return t;t=[],i=new a["default"];for(var r,s=-1,l=n.length;++s<l;)i.has(r=n[s])||i.set(r,t.push(r));return o[e.t].apply(o,e.a)},o.range=function(t){return arguments.length?(n=t,r=0,e={t:"range",a:arguments},o):n},o.rangePoints=function(i,a){arguments.length<2&&(a=0);var l=i[0],u=i[1],h=t.length<2?(l=(l+u)/2,0):(u-l)/(t.length-1+a);return n=s(l+h*a/2,h),r=0,e={t:"rangePoints",a:arguments},o},o.rangeRoundPoints=function(i,a){arguments.length<2&&(a=0);var l=i[0],u=i[1],h=t.length<2?(l=u=Math.round((l+u)/2),0):(u-l)/(t.length-1+a)|0;return n=s(l+Math.round(h*a/2+(u-l-(t.length-1+a)*h)/2),h),r=0,e={t:"rangeRoundPoints",a:arguments},o},o.rangeBands=function(i,a,l){arguments.length<2&&(a=0),arguments.length<3&&(l=a);var u=i[1]<i[0],h=i[u-0],d=i[1-u],c=(d-h)/(t.length-a+2*l);return n=s(h+c*l,c),u&&n.reverse(),r=c*(1-a),e={t:"rangeBands",a:arguments},o},o.rangeRoundBands=function(i,a,l){arguments.length<2&&(a=0),arguments.length<3&&(l=a);var u=i[1]<i[0],h=i[u-0],d=i[1-u],c=Math.floor((d-h)/(t.length-a+2*l));return n=s(h+Math.round((d-h-(t.length-a)*c)/2),c),u&&n.reverse(),r=Math.round(c*(1-a)),e={t:"rangeRoundBands",a:arguments},o},o.rangeBand=function(){return r},o.rangeExtent=function(){return function(t){var e=t[0],i=t[t.length-1];return e<i?[e,i]:[i,e]}(e.a[0])},o.copy=function(){return f(t,e)},o.domain(t)}function p(t,e,i){var n,a;function r(e){return i[Math.max(0,Math.min(a,Math.floor(n*(e-t))))]}function o(){return n=i.length/(e-t),a=i.length-1,r}return r.domain=function(i){return arguments.length?(t=+i[0],e=+i[i.length-1],o()):[t,e]},r.range=function(t){return arguments.length?(i=t,o()):i},r.invertExtent=function(e){return[e=(e=i.indexOf(e))<0?NaN:e/n+t,e+1/n]},r.copy=function(){return p(t,e,i)},o()}function g(){return d([0,1],[0,1],n["default"].interpolateNumber,n["default"].uninterpolateNumber)}var m={linear:g,quantize:function(){return p(0,1,[0,1])},log:function(){return c(g().domain([0,1]),10,!0,[1,10])},ordinal:function(){return f([],{t:"range",a:[[]]})}};e["default"]=m},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=d(i(0)),a=d(i(6)),r=i(35),o=d(i(1)),s=d(i(12)),l=i(4),u=i(3),h=i(2);function d(t){return t&&t.__esModule?t:{"default":t}}var c=function(){return n["default"].paddingConvertWithScale(8)},f=s["default"].extend({initialize:function(t,e,i){this.componentType=e,this.vanchart=i,this.refresh(t)},refresh:function(t){this.options=t||this.options,t=this.options,n["default"].extend(this,{isFloat:t.floating,_floatX:this._getPercentValue(t.x,this.vanchart.width),_floatY:this._getPercentValue(t.y,this.vanchart.height)}),this._refresh&&this._refresh(t)},createComponentGroup:function(){return this.vanchart.renderer.group().addTo(this.getComponentParentGroup())},getComponentParentGroup:function(){var t=this.vanchart.isMap()&&!1;return this.isFloat||t?this.vanchart.frontGroup:this.vanchart.backGroup},useHtmlLabel:function(){return this.options.useHtml||!(0,u.isSupportSVG)()},_getLegendType:function(t){var e=t.options.marker,i="";switch(t.type){case o["default"].MULTIPIE_CHART:case o["default"].PIE_CHART:var a=t.options.innerRadius;return a&&parseFloat(a)>0?o["default"].DONUT_ICON:o["default"].PIE_ICON;case o["default"].RADAR_CHART:if(t.options.columnType)return o["default"].NORMAL_ICON;break;case o["default"].FORCE_BUBBLE_CHART:case o["default"].BUBBLE_CHART:return o["default"].BUBBLE_ICON;case o["default"].TREEMAP_CHART:return o["default"].TREEMAP_ICON;case o["default"].LINE_MAP:return o["default"].NULL_MARKER;case o["default"].POINT_MAP:return o["default"].ANCHOR_ICON;default:i=o["default"].NORMAL_ICON}return t.options.image&&(0,u.supportFillFilter)()?i=t.options.image:e&&((i=e.symbol?e.symbol:o["default"].NULL_MARKER)===o["default"].SYMBOL_AUTO&&(i=t.isMarkerDisplayable?o["default"].CIRCLE:o["default"].NULL_MARKER),t.type!=o["default"].SCATTER_CHART||n["default"].isImageMarker(i)||(i=o["default"].SCATTER_ICON+i)),i},_getPercentValue:function(t,e){return t?(-1!=(t+="").indexOf("%")&&(t=parseFloat(t)*e/100),parseFloat(t)):0},_setComponentBounds:function(t,e){this.isFloat||this.options&&this.options.onZero?this._updateFloatBounds(t,e):this._updateComponentBounds(t,e)},isHorizontal:function(){var t=this.getPosition();return t==o["default"].TOP||t==o["default"].BOTTOM},isVertical:function(){return!this.isHorizontal()},getPosition:function(){return this.options.position},_updateFloatBounds:function(t,e){e=Math.ceil(e);var i=this.vanchart.bounds,n=this._floatX,a=this._floatY,s=i.x+i.width-n,l=i.y+i.height-a;switch(t){case o["default"].TOP:case o["default"].BOTTOM:this.bounds={x:n,y:a,width:s,height:e};break;case o["default"].LEFT:case o["default"].RIGHT_TOP:case o["default"].RIGHT_BOTTOM:case o["default"].RIGHT:this.bounds={x:n,y:a,width:e,height:l}}if(this.options.onZero){var u=this.getStandardAxis();u&&(0,r.isFromZeroAxis)(u)?this._clipPlotBounds(t,e):this._clipPlotBoundsWhileFloat(t)}},getStandardAxis:function(){var t=this.componentType===l.ComponentCst.X_AXIS_COMPONENT?l.ComponentCst.Y_AXIS_COMPONENT:l.ComponentCst.X_AXIS_COMPONENT,e=0;if(t=this.vanchart.getComponent(t),!0===this.options.onZero){for(var i=t.getAxisCount();i--;)if(/^standard/.test(t.getAxis(i).alignAxisId)){e=i;break}}else e=this.options.onZero;return t.getAxis(e)},_updateComponentBounds:function(t,e){e=Math.ceil(e);var i=this.vanchart.bounds,n=i.x,a=i.y,r=i.width,s=i.height;switch(t){case o["default"].TOP:this.bounds={x:n,y:a,width:r,height:e};break;case o["default"].BOTTOM:this.bounds={x:n,y:a+s-e,width:r,height:e};break;case o["default"].LEFT:this.bounds={x:n,y:a,width:e,height:s};break;case o["default"].RIGHT_TOP:case o["default"].RIGHT_BOTTOM:case o["default"].RIGHT:this.bounds={x:n+r-e,y:a,width:e,height:s}}this.vanchart.setPlotBounds(i),this._clipPlotBounds(t,e)},_clipPlotBounds:function(t,e){e=Math.ceil(e);var i=this.vanchart.bounds,n=i.x,a=i.y,r=i.width,s=i.height;switch(t){case o["default"].TOP:i={x:n,y:a+e,width:r,height:s-e};break;case o["default"].BOTTOM:i={x:n,y:a,width:r,height:s-e};break;case o["default"].LEFT:i={x:n+e,y:a,width:r-e,height:s};break;case o["default"].RIGHT_TOP:case o["default"].RIGHT_BOTTOM:case o["default"].RIGHT:i={x:n,y:a,width:r-e,height:s}}this.vanchart.setPlotBounds(i)},_clipPlotBoundsWhileFloat:function(t){var e=this.vanchart.bounds,i=e.x,n=e.y,a=e.width,r=e.height;switch(t){case o["default"].TOP:e={x:i,y:n,width:a,height:r};break;case o["default"].BOTTOM:e={x:i,y:n,width:a,height:r-c()};break;case o["default"].LEFT:case o["default"].RIGHT_TOP:case o["default"].RIGHT_BOTTOM:case o["default"].RIGHT:e={x:i+c(),y:n,width:a-c(),height:r}}this.vanchart.setPlotBounds(e)},_recordForPlotBounds:function(t,e){e=Math.ceil(e),t===o["default"].RIGHT_TOP&&(t=o["default"].RIGHT),t===o["default"].RIGHT_BOTTOM&&(t=o["default"].RIGHT),this.vanchart.clipPool[t]=Math.max(this.vanchart.clipPool[t]||0,e)},_getBackgroundColor:function(){var t=this.option,e="string"==typeof t.plotBackgroundColor,i="string"==typeof t.backgroundColor,n=e?t.plotBackgroundColor:i?t.backgroundColor:"white";return a["default"].colorToHex(n)},_maxHeight:function(t){var e=this.vanchart.height;return t||this.options.maxHeight?this._getPercentValue(t||this.options.maxHeight,e):e},_maxLegendHeight:function(){return this.options.maxHeight?this._maxHeight():.3*this._maxHeight()},_maxWidth:function(t){var e=this.vanchart.width;return t||this.options.maxWidth?this._getPercentValue(t||this.options.maxWidth,e):e},_maxLegendWidth:function(){return this.options.maxWidth?this._maxWidth():.3*this._maxWidth()},_getTickContent:function(t,e){return e?n["default"].format(t,e):t},getPlotBounds:function(){return this.vanchart.bounds},getChartBounds:function(){return this.vanchart.getChartBounds()},getParentDom:function(){return this.vanchart.getParentDom()},getDivParentDom:function(){return this.vanchart.getDivParentDom()},getTooltipComponent:function(){return this.vanchart.components.tooltip},remove:function(){},_bindData:n["default"].bindData,invisible:function(){return(0,h.hasDefined)(this.options.visible)&&!1===this.options.visible},_innerClip:function(t,e){var i=this.vanchart.renderer;e=e||this.bounds;var a=n["default"].makeBounds(0,0,e.width,e.height);if(this._clip?i.updateClip(this._clip,a):this._clip=i.createClip(a),"vgroup"===t.type){var r=0+a.width,o=0+a.height;t.divG.style({clip:"rect(0px "+r+"px "+o+"px 0px)"}),i.clip(t.renderG,this._clip)}else i.clip(t,this._clip)}});e["default"]=f},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=a(i(0));function a(t){return t&&t.__esModule?t:{"default":t}}var r=a(i(31))["default"].extend({on:function(t,e,i){if("object"==typeof t)for(var a in t)this._on(a,t[a],e);else for(var r=0,o=(t=n["default"].splitWords(t)).length;r<o;r++)this._on(t[r],e,i);return this},off:function(t,e,i){if(t)if("object"==typeof t)for(var a in t)this._off(a,t[a],e);else for(var r=0,o=(t=n["default"].splitWords(t)).length;r<o;r++)this._off(t[r],e,i);else delete this._events;return this},_on:function(t,e,i){if(t&&e){this._events=this._events||{};var n=this._events[t];n||(n=[],this._events[t]=n),i===this&&(i=undefined);for(var a={fn:e,ctx:i},r=n,o=0,s=r.length;o<s;o++)if(r[o].fn===e&&r[o].ctx===i)return;r.push(a),n.count++}},_off:function(t,e,i){var a,r,o;if(this._events&&(a=this._events[t]))if(e){if(i===this&&(i=undefined),a)for(r=0,o=a.length;r<o;r++){var s=a[r];if(s.ctx===i&&s.fn===e)return s.fn=n["default"].falseFn,this._firingCount&&(this._events[t]=a=a.slice()),void a.splice(r,1)}}else{for(r=0,o=a.length;r<o;r++)a[r].fn=n["default"].falseFn;delete this._events[t]}},fire:function(t,e,i){if(!this.listens(t,i))return this;var n=e;if(this._events){var a=this._events[t];if(a){this._firingCount=this._firingCount+1||1;for(var r=0,o=a.length;r<o;r++){var s=a[r];s.fn.call(s.ctx||this,n)}this._firingCount--}}return i&&this._propagateEvent(n),this},listens:function(t,e){var i=this._events&&this._events[t];if(i&&i.length)return!0;if(e)for(var n in this._eventParents)if(this._eventParents[n].listens(t,e))return!0;return!1},once:function(t,e,i){if("object"==typeof t){for(var a in t)this.once(a,t[a],e);return this}var r=n["default"].bind((function(){this.off(t,e,i).off(t,r,i)}),this);return this.on(t,e,i).on(t,r,i)},addEventParent:function(t){return this._eventParents=this._eventParents||{},this._eventParents[n["default"].stamp(t)]=t,this},removeEventParent:function(t){return this._eventParents&&delete this._eventParents[n["default"].stamp(t)],this},_propagateEvent:function(t){for(var e in this._eventParents)this._eventParents[e].fire(t.srcEvent.type,t,!0)}});e["default"]=r},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(0))&&n.__esModule?n:{"default":n};var r=function(t,e,i){this.x=i?Math.round(t):t,this.y=i?Math.round(e):e};r.prototype={clone:function(){return new r(this.x,this.y)},add:function(t){return this.clone()._add(r.create(t))},_add:function(t){return this.x+=t.x,this.y+=t.y,this},subtract:function(t){return this.clone()._subtract(r.create(t))},_subtract:function(t){return this.x-=t.x,this.y-=t.y,this},divideBy:function(t){return this.clone()._divideBy(t)},_divideBy:function(t){return this.x/=t,this.y/=t,this},multiplyBy:function(t){return this.clone()._multiplyBy(t)},_multiplyBy:function(t){return this.x*=t,this.y*=t,this},scaleBy:function(t){return new r(this.x*t.x,this.y*t.y)},unscaleBy:function(t){return new r(this.x/t.x,this.y/t.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},distanceTo:function(t){var e=(t=r.create(t)).x-this.x,i=t.y-this.y;return Math.sqrt(e*e+i*i)},equals:function(t){return(t=r.create(t)).x===this.x&&t.y===this.y},contains:function(t){return t=r.create(t),Math.abs(t.x)<=Math.abs(this.x)&&Math.abs(t.y)<=Math.abs(this.y)},toString:function(){return"Point("+a["default"].formatNum(this.x)+", "+a["default"].formatNum(this.y)+")"}},r.create=function(t,e,i){return t instanceof r?t:a["default"].isArray(t)?new r(t[0],t[1]):t===undefined||null===t?t:"object"==typeof t&&"x"in t&&"y"in t?new r(t.x,t.y):new r(t,e,i)};var o=r;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=C(i(0)),a=C(i(16)),r=C(i(6)),o=C(i(1)),s=C(i(53)),l=C(i(12)),u=C(i(8)),h=C(i(9)),d=i(4),c=C(i(28)),f=i(27),p=C(i(5)),g=i(3),m=i(2),v=i(86),_=i(48),y=i(36),A=i(22),T=i(17),x=i(15),b=C(i(62));function C(t){return t&&t.__esModule?t:{"default":t}}var L=l["default"].extend({vanChartType:"series",initialize:function(t,e,i){this.vanchart=e,this.points=[],this.refresh(t,i)},refresh:function(t,e){var i,s=n["default"].clone(t),l=this.vanchart,u=s.type||l.options.chartType,h=l.options.plotOptions,d=[s,h[u],h];if(this.minSize=a["default"].queryList(d,"minSize"),this.maxSize=a["default"].queryList(d,"maxSize"),this.originalColor=s.color,this.originalMarkerFillColor=s.marker&&s.marker.fillColor,this.interpolate=this._getSeriesInterpolate(d),s=this.options=n["default"].createOptions(s,[h[u],h]),this.type=u,this.stack=s.stack,this.index=e,this.className="vancharts-series-"+e,this.name=n["default"].pick(s.name,o["default"].BLANK_VALUE_PERCENTAGE),this.visible=n["default"].pick(s.visible,!0),this.state=this.visible?o["default"].STATE_SHOW:o["default"].STATE_DROPPED,this.isMarkerDisplayable=!0,!this.isSeriesAccumulated()&&this.type!==o["default"].STRUCTURE_CHART){var c=this.options.color||l.getDefaultSeriesColor(this.name),f=s.opacity,p=(0,m.hasDefined)(s.color),g=(0,m.hasDefined)(s.fillColor)&&1!=s.fillColor;c=(i=r["default"].getStandardColorAndOpacity(c,f)).hex,f=this.isGradualStyle()?this._getGradualStyleOpacity():i.alpha;var v=this.options.fillColor;v=!0===v?c:v;var _=+s.fillColorOpacity;_=isNaN(_)?this._getDefaultFillColorOpacity():_,p&&!g&&(_*=i.oriAlpha),v=(i=r["default"].getStandardColorAndOpacity(v,_)).hex,_=i.alpha;var y=s.marker=n["default"].clone(s.marker);if((0,m.hasDefined)(y)){var A=this._getMarkerColorAlpha();y.fillColor=A.markerColor,y.fillColorOpacity=A.markerOpacity,this.type===o["default"].SCATTER_CHART&&y.symbol===o["default"].SYMBOL_AUTO&&(s.marker.symbol=n["default"].getDefaultMarkerSymbol(e))}this.color=c,this.opacity=f,this.fillColor=v,this.fillColorOpacity=_,this.marker=y}if((0,m.hasDefined)(this.options.startAngle)){var T=this.options.startAngle,x=this.options.endAngle;T>x&&(T-=360),T===x&&(x=T+360),this.startAngle=n["default"].toRadian(T),this.endAngle=n["default"].toRadian(x)}u===o["default"].PIE_CHART&&(this.category=this.name),this._bindAxis();var b=this._loadData?this._loadData(s.data):s.data||[];return this.isTreeSeries()||this._dealData(b),this},_getGradualStyleOpacity:function(){return(0,m.hasDefined)(this.options.opacity)?this.options.opacity:1},isGradualStyle:function(){return this.options.gradualStyle===o["default"].STYLE_CUSTOM},_dealData:function(t){var e,i,n,a,r=[],o=this,l={},u=this.vanchart,h=this.type;for(this.points.forEach((function(t){var e=o._getPointKey(t);l[e]=l[e]||[],l[e].push(t)})),e=0,i=t.length;e<i;e++){n=o._getPointKey(t[e]);var d=null;if(a=l[n]){for(var c=0,f=a.length;c<f;c++)if(d=a[c]){a[c]=null;break}d&&(d._lastValue=d.options[o.getTargetKey()],d._lastPercent=d.percentage,d._lastArrivalRate=d.arrivalRate,d.childSeries=null,d.geo=null,d.refresh(t[e]))}d||(d=new s["default"](t[e],this)),r.push(d)}for(n in l)l[n]&&l[n].forEach((function(t){u.removePointGraphics(t,h)}));var p=this.points=r;if(this.isSeriesAccumulated())for(e=-1,i=p.length;++e<i;)p[e].points=p},_getPointKey:function(t){return this.isMultiCategoryAxisBased()?n["default"].encodeCategoryArray(t.categoryArray):t.x},isMultiCategoryAxisBased:function(){var t=this[this.getBaseAxisType()];return t&&t.isMultiCateAxis&&t.isMultiCateAxis()},_getDefaultFillColorOpacity:function(){return 1},getStackAxis:function(){return this[this.getTargetKey()+"Axis"]},isNullValue:function(t){var e=t.options[t.series.getTargetKey()];return"-"==e||(0,m.hasNotDefined)(e)},_getMarkerColorAlpha:function(){var t=this.vanchart,e=this.options,i=t.options.plotOptions,n=i[this.type],a=n&&n.marker||i.marker,o=e.opacity,s=e.marker,l=s&&s.fillColor||this.options.color||a&&a.fillColor||t.getDefaultSeriesColor(this.name),u=o;if((0,m.hasDefined)(l)){var h=r["default"].getStandardColorAndOpacity(l,o);l=h.hex,u=h.alpha}return{markerColor:l,markerOpacity:u}},_bindAxis:function(){var t=this,e=t.options,i=t.vanchart;t._getAxisTypes().forEach((function(n){if(i[n]){var a=i[n](e[n]);a&&(a.series.push(t),t[n]=a)}}))},supportTooltipShared:function(){return this.xAxis||this.yAxis||this.angleAxis},_getAxisTypes:function(){return["xAxis","yAxis"]},getTargetKey:function(){return"y"},getBaseAxisType:function(){return"xAxis"},_calculateAutoLabelPos:function(t,e,i,n,a,r){void 0===r&&(r=!1);var o,s,l,u,h,d=t.labelDim,c=this.vanchart.bounds;i?(0,m.hasDefined)(a)?a?(s=Math.max(0,e.y),l=c.height-d.height,o=(0,v.verticalPosFix)(s,l,3,d,e,n)):(l=0,s=Math.min(e.y,c.height-d.height),o=(0,v.verticalPosFix)(s,l,-3,d,e,n)):(s=Math.max(0,e.y),l=c.height-d.height,(o=(0,v.verticalPosFix)(s,l,3,d,e,n))||(l=0,s=Math.min(e.y,c.height-d.height),o=(0,v.verticalPosFix)(s,l,-3,d,e,n))):(0,m.hasDefined)(a)?a?(u=Math.max(0,e.x),h=c.width-d.width,o=(0,v.horizontalPosFix)(u,h,3,d,e,n)):(h=0,u=Math.min(e.x,c.width-d.width),o=(0,v.horizontalPosFix)(u,h,-3,d,e,n)):(u=Math.max(0,e.x),h=c.width-d.width,(o=(0,v.horizontalPosFix)(u,h,3,d,e,n))||(h=0,u=Math.min(e.x,c.width-d.width),o=(0,v.horizontalPosFix)(u,h,-3,d,e,n)));return o||(r?{}:e)},_getArcPoint:function(t,e){return[this._dealWithFloat(t*Math.sin(e)),this._dealWithFloat(-t*Math.cos(e))]},_getNormalTrendLineXYValues:function(t){var e=[],i=[],n=this.vanchart.isInverted()?"posY":"posX",a=this.vanchart.isInverted()?o["default"].LEFT:o["default"].BOTTOM;return t.points.sort((function(t,e){return t[n]-e[n]})),t.points.forEach((function(t){t.isNull||(e.push(t.posX),i.push(t.posY))})),[e,i,a,t.xAxis&&t.xAxis.isAxisReversed()]},_getSeriesInterpolate:function(t){var e=a["default"].queryList(t,"step"),i=a["default"].queryList(t,"curve"),n=t[0],r="linear";return n.step||e&&!n.curve?r="step-after":(n.curve||i&&!n.step)&&(r="cardinal"),r},_getAngle:function(t,e){return e=e||{x:0,y:0},Math.atan2(t.y-e.y,t.x-e.x)/(Math.PI/180)},_getBackgroundColor:function(){var t=this.vanchart.options,e="string"==typeof t.plotBackgroundColor,i="string"==typeof t.backgroundColor,n=e?t.plotBackgroundColor:i?t.backgroundColor:"white";return r["default"].colorToHex(n)},_getBackgroundColorWithAlpha:function(){var t=this.vanchart.options;return"string"==typeof t.plotBackgroundColor?t.plotBackgroundColor:"string"==typeof t.backgroundColor?t.backgroundColor:void 0},getSeryTotalValue:function(){var t=0;return this.points.forEach((function(e){t+=e.getTargetValue()})),t},getLegendKey:function(t){return this.isSeriesAccumulated()?t.name:this.name},calculateLabelInfo:function(t){(0,c["default"])(t)},_getPercentValue:function(t,e){return t?(-1!==(t+="").indexOf("%")&&(t=parseFloat(t)*e/100),parseFloat(t)):0},isSupportLegendHighlight:function(){return!0},isSeriesAccumulated:function(){return!1},isTreeSeries:function(){return!1},addPoint:function(t,e){var i=this._getOriginSerData(),n=this.vanchart;i.push(t),e&&n.update()},removePoint:function(t,e){if(!(t<0)){var i=this,n=this.vanchart,a=this._getOriginSerData(),r=n.series.indexOf(i);a.splice(t,1),i.options.data.splice(t,1),n._removeAllAndHasNoAdd(i.options,r)&&(i.remove(),n.series.splice(r,1),n.options.series.splice(r,1)),e&&n.update()}},updatePoint:function(t,e,i){if(!(t<0)){var n=this.vanchart;this._getOriginSerData()[t]=e,i&&n.update()}},updateSeries:function(t){var e=this.vanchart,i=e.options.series,a=e.series.indexOf(this);(t=n["default"].clone(t)).data=i[a].data,i[a]=t},calculatePointIndex:function(t){var e=this,i=this.vanchart,a=-1,r=0,s=this._getOriginSerData(),l=n["default"].clone,u=function(t){if(t.lnglat)return t;var n=i.getCurrentGeo(),a=n.getFeaturesByName(t.name,e.type),r=n.getDataPointLngLat({options:t,series:e},a&&a[0]),o=l(t);return o.lnglat=r,r&&o},h=e.type===o["default"].LINE_MAP;if(h&&(!u(t.from)||!u(t.to)))return-1;for(var d,c,f=function(t){if(h){var e=l(t);return e.from=u(t.from),e.to=u(t.to),e.from&&e.to&&e}return t};r<s.length;)if(d=f(t),c=f(s[r]),d&&c){if(e._getPointKey(d)===e._getPointKey(c)){a=r;break}r++}else r++;return a},_getOriginSerData:function(){var t=this.vanchart,e=t.options.series,i=t.series.indexOf(this);return i<0?[]:e[i].data}});L.include({getClosestPoint:function(){return null},getDefaultTooltipFormatter:function(){return{categoryFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '') : arguments[0]}",changedPercentFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '#.##%') : arguments[0]}",changedValueFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '') : arguments[0]}",identifier:"{CATEGORY}{SERIES}{VALUE}",percentFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '#.##%') : arguments[0]}",seriesFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '') : arguments[0]}",valueFormat:"function(){return window.FR ? FR.contentFormat(arguments[0], '') : arguments[0]}"}},isToolTipFollow:function(t){return!this.vanchart.isMobile()&&t.options.tooltip.follow},getTooltipPos:function(t,e,i){var n;if(this.isToolTipFollow(t)){var a=i.containerPoint;n=[a.x+10,a.y+10]}else n=this._getFixedPos(t,e);if(n){var r=this.vanchart.bounds,o=r.y,s=r.x,l=r.y+r.height,u=r.x+r.width,h=n[0],d=n[1];return h<s?h+=s-h:h+e.width>u&&(h-=h+e.width-u),d<o?d+=o-d:d+e.height>l&&(d-=d+e.height-l),[h,d]}},getFillFilter:function(t){return t},filterRender:function(){this.useCanvas()?this._canvasRender():this._svgFilterRender()},render:function(){this.useCanvas()?this._canvasRender():this._svgRender()},useCanvas:n["default"].falseFn,_createGroup:function(t,e){return t.group().addTo(e.clipSeriesGroup)},_svgRender:function(){this.initialAnimationMoving=!this.group,this.drawPolarAxis&&this.drawPolarAxis();var t=this.vanchart,e=t.renderer;this.group||(this.group=this._createGroup(e,t).attr("transform",n["default"].makeTranslate(this._getTranslate()))),t.isMobile()||this.group.style("cursor",this._pointerStyle()),this.group.attr("class",this.className+" "+this.type),this.type===o["default"].GAUGE_CHART?this.group.animate({duration:600,ease:"quad-out",attr:{transform:n["default"].makeTranslate(this._getTranslate())}}):this.group.attr("transform",n["default"].makeTranslate(this._getTranslate())),this.drawSeries&&this.drawSeries(),this.drawPoints()},_svgFilterRender:function(){var t=this;t.getDataToDraw().forEach((function(e){e.isVisible()?(e.graphic&&e.graphic.style({display:"inline"}),e.textGraphic||t._createTextGraphic(e),e.effectGraphic||t.drawPointEffect(e)):(e.graphic&&e.graphic.style({display:"none"}),e.textGraphic&&e.textGraphic.remove(),e.textGraphic=null,t.clearPointEffect(e))}))},_canvasRender:function(){this._canvas||(this._canvas=(0,f.createCanvasRenderer)(this.vanchart.dom,this.vanchart),this._canvas.onAdd()),this._canvas.clearAll(),this._canvas.addSeries(this)},_pointerStyle:function(){var t=this.points.filter((function(t){return!t.isNull}));return t[0]&&(t[0].options.onClick||this.vanchart.options.hyperLink)?"pointer":""},getDataToDraw:function(){return this.points},getTextDataToDraw:function(){return this.getDataToDraw()},updatePointGraphic:function(){},_updateMarkerPointGraphic:function(t){var e=t.graphic,i=t.options;if(e){var a=i.marker,r=a&&a.symbol;n["default"].isImageMarker(r)?(e.markerPath&&e.markerPath.remove(),e.markerPath=null):(e.image&&e.image.remove(),e.image=null)}},drawPoints:function(){var t=this,e=t.vanchart,i=this._getPointGraphicGroup();i&&e.registerInteractiveTarget(this,i),this.initialAnimationMoving&&this.initialAnimation&&this.initialAnimation();for(var n=this._calculateAnimationDelay(),a=t.getDataToDraw(),r=0,o=a.length;r<o;r++)t.drawPoint(a[r],n)},_drawEffectPoints:function(){var t=this;t.getTextDataToDraw().forEach((function(e){t.drawPointEffect(e)}))},drawPointEffect:function(t){var e=t.series;e.clearPointEffect(t);var i=t.getEffectTime();i&&(e.effectAnimation(t),t.effectInterval=n["default"].setInterval((function(){e.effectAnimation(t)}),i))},clearPointEffect:function(t){t.clearPointEffect()},effectAnimation:function(){},_drawUpdatePoints:function(t,e){this._updatePointGraphicStyle(t),this.vanchart.isZoomingWithLargeModel()?t.graphic.attr(this.getPointUpdateAnimationAttr(t,e).attr):t.graphic.animate(this.getPointUpdateAnimationAttr(t,e)),this.vanchart.registerInteractiveTarget(t,t.graphic)},_drawEnterPoints:function(t){var e=this,i=e._getPointGraphicGroup(),n=t.graphic=this._createPointGraphic(t);e._updatePointGraphicStyle(t);var a=e.reShowPoint(t),r=a&&e.getPointReShowAttr?e.getPointReShowAttr:e.getPointInitAttr,o=a&&e.getPointReShowStyle?e.getPointReShowStyle:e.getPointInitStyle,s=a&&e.getPointReShowAnimationAttr?e.getPointReShowAnimationAttr:e.getPointInitAnimationAttr;t.hasEffect()||t.isPieZeroPoint()?n.addTo(i):n.addToBack(i),n.attr(r?r.call(e,t):{}).style(o?o.call(e,t):{}).animate(s?s.call(e,t):{}),e.vanchart.registerInteractiveTarget(t,n)},_drawExitPoints:function(t){var e=t.series;e.getPointDropAnimationAttr?t.graphic.animate(e.getPointDropAnimationAttr(t)).remove():t.graphic.remove()},drawPoint:function(t,e){e=e||0;var i=t.isVisible(),n=t.graphic&&t.graphic.isVisible();this.clearPointEffect(t),i===n?t.graphic&&this._drawUpdatePoints(t,e):i&&!n?t.graphic&&!t.graphic.removed()?(t.graphic.style("display","inline"),this._drawUpdatePoints(t,e)):this._drawEnterPoints(t):!i&&n&&this._drawExitPoints(t)},_getEffectTime:function(t){return(0,m.hasNotDefined)(t.options.effect)||isNaN(t.options.effect.period)?t.series.getDefaultEffectTime():t.options.effect.period},_getPointEffectGroup:function(t){var e=t.series,i=e.vanchart.renderer;return t.effectGraphic=t.effectGraphic||i.group().addTo(e._getPointGraphicGroup()).style("pointer-events","none")},_createPointGraphic:function(t){var e=this.getPointGraphicKey(t);return this.vanchart.renderer[e]()},getStyle:function(t){var e=t.options,i=t.series,n=t.getPointBorderColor(t.borderColor);return{fill:i.getFillFilter(t.color,t),"fill-opacity":e.image?1:t.opacity,stroke:n,"stroke-opacity":t.borderOpacity,"stroke-width":e.borderWidth,filter:"none"}},_updateHighLightOpacity:function(t,e){var i=this.vanchart.highlightTarget;if(null!=i&&this.isSupportLegendHighlight()){var n=this.getLegendKey(t)==i||t._rangeItem==i?1:o["default"].HOVER_OPACITY;e["fill-opacity"]=e["stroke-opacity"]=n}},_getDynamicStyle:function(t){var e=this.getStyle(t);return this._updateHighLightOpacity(t,e),e["pointer-events"]="auto",e},_updatePointGraphicStyle:function(t,e){e=e||t.series._getDynamicStyle(t),t.graphic&&t.graphic.style(e)},_getPointLabelStyle:function(t,e){var i;switch(e){case"label":i={"fill-opacity":t.labelOpacity()};break;case"labelBorder":i={"stroke-opacity":t.labelBorderOpacity,"fill-opacity":1};break;case"leadLine":i={"stroke-opacity":t.autoLabelOpacity()}}return this._updateHighLightOpacity(t,i,e),"label"===e&&t.textGraphic&&"div"===t.textGraphic.type&&(i.opacity=i["fill-opacity"]),i},_updatePointLabelStyle:function(t){var e=this._getPointLabelStyle(t,"label"),i=this._getPointLabelStyle(t,"labelBorder"),n=this._getPointLabelStyle(t,"leadLine");t.leadLine&&t.leadLine.style(n),t.textGraphic&&t.textGraphic.style(e),t.textBorderPath&&t.textBorderPath.style(i)},_createMarker:function(t,e){var i=t.symbol,a=this.vanchart.renderer;if(e=e||a.group(),n["default"].isImageMarker(i)){var r=t.width,o=t.height;e.image=a.image({preserveAspectRatio:"none",x:-r/2,y:-o/2,width:r,height:o}).imageContent(i).addTo(e)}else e.markerPath=a.path().addTo(e);return e},_updateImageMarker:function(t,e){var i=this.vanchart.renderer,n=t.width,a=t.height,r=t.symbol;e.image=e.image||i.image({preserveAspectRatio:"none"}).addTo(e),e.image.imageContent(r).attr({x:-n/2,y:-a/2,width:n,height:a})},_updateMarker:function(t,e,i){e=e||t.graphic;var a=(i=i||t.options.marker).symbol,r=this.vanchart,s=this._getBackgroundColorWithAlpha()||(0,A.getThemeAutoValue)(o["default"].AUTO,"markerStrokeColor",r.isDarkTheme());if(n["default"].isImageMarker(a))this._updateImageMarker(i,e);else{e.image&&e.image.remove();var l=i.fillColorOpacity,u=this.vanchart.highlightTarget;if((0,m.hasDefined)(u))l=this.getLegendKey(t)==u||t._rangeItem==u?1:o["default"].HOVER_OPACITY;var d=this.type===o["default"].LINE_CHART,c=this._isHollowMarker(a),f=i.fillColor,p=this._getMarkerRadius(t,i,!1),g=p>0?this._defaultStrokeWidth(t.series.vanchart):0;e.markerPath=e.markerPath||this.vanchart.renderer.path().addTo(e),c?e.markerPath.attr({d:h["default"].getMarkerPath(a,p)}).style({stroke:f,"stroke-width":g,"stroke-opacity":l,fill:s,"fill-opacity":l}):d?e.markerPath.attr({d:h["default"].getMarkerPath(a,p)}).style({fill:f,"fill-opacity":l,stroke:s,"stroke-width":g,"stroke-opacity":l}):e.markerPath.attr({d:h["default"].getMarkerPath(a,p)}).style({fill:f,"fill-opacity":l,stroke:"none","stroke-width":0})}},_getMarkerRadius:function(t,e,i){var n=e.symbol,a=t.series.isMarkerDisplayable,r=this._isHollowMarker(n),s=this.type===o["default"].LINE_CHART,l=(0,T.getMarkerRadius)(e.radius);return(l=a||i?l:0)<=0?l:(l=r?l-this._defaultStrokeWidth(t.series.vanchart)/2:s?l+this._defaultStrokeWidth(t.series.vanchart)/2:l)+(i?2:0)},_onMarkerPressed:function(t){var e=(t.options&&t.options.marker).symbol;if(t.graphic&&!n["default"].isImageMarker(e)){var i=this._isHollowMarker(e),a=t.clickColor,r=t.clickOpacity,o=i?{stroke:a,"stroke-opacity":r}:{fill:a,"fill-opacity":r};t.graphic.markerPath.style(o)}},_onMarkerState:function(t,e){var i=t.options.marker,a=i.symbol,r=5,s=this;if(t.graphic)if(r=2,n["default"].isImageMarker(a)){var l=i.width+(e?4:0),d=i.height+(e?4:0);t.graphic.image&&t.graphic.image.interrupt(o["default"].SELECT_ANIMATION).transition(o["default"].SELECT_ANIMATION).animate({duration:300,ease:u["default"].custom["ease-out-back"],attr:{x:-l/2,y:-d/2,width:l,height:d}})}else{var c=this._getMarkerRadius(t,i,e),f=this.type===o["default"].LINE_CHART;!function(e,i,n){if(!(0,m.hasNotDefined)(e)){var r={duration:300,ease:u["default"].custom["ease-out-back"],attr:{d:h["default"].getMarkerPath(a,i)}};i>0&&n&&(r.style={"stroke-width":s._defaultStrokeWidth(t.series.vanchart)}),e.interrupt(o["default"].SELECT_ANIMATION).transition(o["default"].SELECT_ANIMATION).animate(r)}}(t.graphic.markerPath,c,f)}var p=t.series,g=0,v=0;if(p.type===o["default"].RADAR_CHART){var _=p._getArcPoint(r,t.radian);g=_[0],v=_[1]}else{v=-r;var y=t.options.dataLabels;(t.labelAlign||y.align)===o["default"].BOTTOM&&(v=r)}p._labelTransformState(t,g,v,e,300,u["default"].custom["ease-out-back"])},removeDefaultMarker:function(){var t=this;t.defaultMarker&&t.defaultMarker.remove(),t.defaultMarker=null},_onMarkerMouseOver:function(t){var e=t.series;if(e._onMarkerState(t,!0),!t.graphic){var i=this._getDefaultMarker(t);e.defaultMarker=e.defaultMarker||this._createMarker(i).addTo(this.group),e.defaultMarker.attr("transform","translate("+t.posX+","+t.posY+") scale(0.01)"),this._updateMarker(t,e.defaultMarker,i),e.defaultMarker.interrupt(o["default"].SELECT_ANIMATION).transition(o["default"].SELECT_ANIMATION).animate({duration:300,ease:"ease",attr:{transform:"translate("+t.posX+","+t.posY+") scale(1.5)"}})}},_onMarkerMouseOut:function(t){var e=t.series;e._onMarkerState(t,!1),!t.graphic&&e.defaultMarker&&(e.defaultMarker.animate({duration:300,ease:"ease",attr:{transform:"translate("+t.posX+","+t.posY+") scale(0.01)"}}).remove(),e.defaultMarker=null)},_getDefaultMarker:function(t){return{symbol:o["default"].CIRCLE,fillColor:t.options.marker.fillColor,fillColorOpacity:t.options.marker.fillColorOpacity,radius:o["default"].MARKER_RADIUS,enabled:!0}},_calculateAnimationDelay:function(){return 0},_isHollowMarker:function(t){return t&&-1!==t.indexOf("hollow")},_animateEnd:function(){this._showLabels(),this._drawEffectPoints()},_showLabels:function(){var t=this,e=t.vanchart;t._updateDataLabels(),t._updateCateLabels&&t._updateCateLabels(),e._needShowMoreLabel()&&t.getTextDataToDraw().forEach((function(e){e.visible&&t.visible&&t._showMoreLabel(e)})),e._removeChangeDataState(t)},_showMoreLabel:function(t,e,i){if(this._isShowMoreLabel(t)){var a=this,r=a.vanchart,s=t.points,l=r.getComponent(d.ComponentCst.MORELABEL_COMPONENT);if(!r.isMobileFlow()&&a.type!==o["default"].GANTT_CHART){var u=t._lastValue||0,h=t._lastArrivalRate||0,c=function(t){var e=t.gaugeType;return e===o["default"].POINTER_SEMI_GAUGE||e===o["default"].POINTER_GAUGE||r.isPointOrAreaOrHeatMap()},f=n["default"].accAdd(+t.options[a.getTargetKey()],-u);if(0===f||isNaN(f))s&&t===s[s.length-1]&&c(a)&&l.showWithPoint(t,e,i);else{t.changedValue=f;var p=f/u;if(t.changedPercent=isFinite(p)?p:p<0?"-∞":"∞",a.type===o["default"].FUNNEL_CHART&&(t.changedArrivalRate=n["default"].accAdd(t.arrivalRate,h)),c(a))return l.collectPoint(t),void(t===s[s.length-1]&&l.showWithPoint(t,e,i));l.collectPoint(t),l.showWithPoint(t,e,i)}}}},_isShowMoreLabel:function(t){return!0},calcMoreLabelPosition:function(t,e){return{startX:t.x+t.width/2,centerY:t.y-e.height/2,direction:"top"}},hasChangedPointWithChangeDataState:function(){for(var t=this.points.filter((function(t){return!t.isNull})),e=!1,i=0;i<t.length;){var n=t[i];if(n.value!=n._lastValue){e=!0;break}i++}return e&&this.vanchart._changeDataState},_updateDataLabels:function(){var t=this;t.getTextDataToDraw().forEach((function(e){t._createTextGraphic(e),t._updatePointLabelStyle(e)}))},_removeDataLabels:function(){this.getTextDataToDraw().forEach((function(t){t.removeTextGraphic(),t.newMoreLabelG&&t.newMoreLabelG.remove(),t.newMoreLabelG=null}))},_createTextGraphic:function(t){t.hasValidDataLabel()&&(t.removeTextGraphic(),(0,y.createTextBorderPath)(t),t.options.dataLabels.useRichText?(0,_.createRichTextLabel)(t):this.createCommonTextLabel(t),t.labelPos.startPos&&(t.leadLine=this._getPointTextLabelGroup().append(this._getLeadLine(t))))},createCommonTextLabel:function(t){var e=this.vanchart.renderer,i=t.labelContent,a=t.options.dataLabels,r=a.useHtml,o=a.labelWidth,s=a.labelHeight,l=this._getPointTextLabelGroup(),u=e.vtext(r).attr("transform",n["default"].makeTranslate(this._labelTrans(t))).style({"pointer-events":"none","white-space":"pre","word-wrap":"normal"});this._hasOuterLineFilter(a,t.labelAlign)&&u.attr("filter",this._getOuterLineFilter());var h=0,d=t.labelDim.height/2,c=t.labelDim.width/2,f=null!=o||null!=s?{width:o+"px",height:s+"px",overflow:"hidden"}:{};if(i&&1===i.length&&this._isVerticalLabel(i[0].style)){var g=i[0],m=g.text,v=g.style;c=r?-c:p["default"].ie?.5*-c:0,u.style({"margin-top":-d+"px","text-align":"center"}).style(f).attr("dx",c).attr("dy",-d).style(v).textContent(m)}else{u.tspans=[];for(var _=0,y=i.length;_<y;_++){var A=i[_],T=A.dim,x=A.text,b=A.style,C=-t.labelDim.width/2,L=-t.labelDim.height/2+.85*T.height,M=this._calculateLabelAlignShift(t.options.dataLabels._align,t.labelDim,T);u.tspans.push(e.vtspan(r).style({"margin-top":-d+"px","text-align":"center"}).style(f).attr("y",h).attr("x",0).attr("dy",L).attr("dx",M+C).style(b).textContent(x).addTo(u)),h+=T.height+2}}t.textGraphic=l.append(u)},_calculateLabelAlignShift:function(t,e,i){switch(t){case o["default"].LEFT:return 0;case o["default"].RIGHT:return e.width-i.width;case o["default"].CENTER:default:return(e.width-i.width)/2}},_isVerticalLabel:function(t){return!!t&&("tb-rl"===t.writingMode||"tb-rl"===t["writing-mode"]||"vertical-rl"===t["-webkit-writing-mode"])},_hasOuterLineFilter:function(t,e){if(!(0,g.isSupportSVG)()||t.style)return!1;var i=this.type;return i===o["default"].LINE_CHART||i===o["default"].COLUMN_CHART&&e===o["default"].OUTSIDE||i===o["default"].BAR_CHART&&e===o["default"].OUTSIDE},_getOuterLineFilter:function(){var t=this.vanchart,e=t.renderer,i=this._getBackgroundColorWithAlpha()||"rgba(255,255,255,0)";return t.outerLineFilter?e.updateOuterLineFilter(t.outerLineFilter,i,1):t.outerLineFilter=e.createOuterLineFilter(i,1),e.toPatternProperty(t.outerLineFilter)},_labelTrans:function(t){return(0,y.isNeedBorder)(t)?(0,y.labelTransWithBorder)(t):{x:t.labelPos.x+t.labelDim.width/2,y:t.labelPos.y+t.labelDim.height/2}},_labelFontSizeState:function(t,e,i,n){if(t.labelPos){var a=t.series._labelTrans(t),r=e?1.1:1;if(t.textGraphic){var s="div"===t.textGraphic.type?{duration:i,ease:n,style:{transform:"translate("+a.x+"px,"+a.y+"px)scale("+r+")"}}:{duration:i,ease:n,attr:{transform:"translate("+a.x+","+a.y+")scale("+r+")"}};t.textGraphic&&t.textGraphic.interrupt(o["default"].SELECT_ANIMATION).transition(o["default"].SELECT_ANIMATION).animate(s)}}},_labelTransformState:function(t,e,i,a,r,o){if(!this.vanchart.onSeriesRendering()&&t.labelPos){var s=t.series._labelTrans(t);a&&(s={x:s.x+e,y:s.y+i}),t.textGraphic&&t.textGraphic.animate({duration:r,ease:o,attr:{transform:n["default"].makeTranslate(s)},style:{transform:"translate("+s.x+"px,"+s.y+"px)"}}),this.labelBorderTransformState(t,e,i,a,r,o)}},labelBorderTransformState:function(t,e,i,a,r,o){if(t.textBorderPath){var s=(0,y.getBorderBounds)(t),l={x:s.x,y:s.y};a&&(l={x:l.x+e,y:l.y+i}),t.textBorderPath.animate({duration:r,ease:o,attr:{transform:n["default"].makeTranslate(l)}})}},_outSideLabelColorState:function(t,e,i,n){var a=t.labelContent.length;t.textGraphic&&t.textGraphic.tspans&&t.textGraphic.tspans.forEach((function(t,e){if(e<a){var r=t.styles;t.transition(o["default"].SELECT_STYLE_ANIMATION).animate({duration:i,ease:n,style:{color:r.color,fill:r.color}})}}))},_getChosenPointLeadLinePath:function(t,e,i){function n(t){return{x:t.x+e,y:t.y+i}}var a=t.labelPos,r={startPos:n(a.startPos),midPos:n(a.midPos),endPos:n(a.endPos)};return this._getLeadLinePathWithPos(r)},_leadLineState:function(t,e,i,n,a,r){var s=t.series,l=t.labelPos,u=t.options.dataLabels;if(l&&l.startPos){var h=l,d=u.connectorColor||t.color;n&&(d=t.mouseOverColor),t.leadLine&&(t.leadLine.transition(o["default"].SELECT_ANIMATION).animate({duration:a||100,ease:r||"ease",attr:{d:n?this._getChosenPointLeadLinePath(t,e,i):s._getLeadLinePathWithPos(h)}}),t.leadLine.transition(o["default"].SELECT_STYLE_ANIMATION).animate({duration:a||100,ease:r||"ease",style:{stroke:d}}))}},_getLeadLine:function(t){return this.vanchart.renderer.path().attr("d",this._getLeadLinePath(t)).style({fill:"none",stroke:t.options.dataLabels.connectorColor||t.color,"stroke-opacity":t.autoLabelOpacity(),"stroke-width":t.options.dataLabels.connectorWidth||0})},_getLeadLinePath:function(t){return this._getLeadLinePathWithPos(t.labelPos)},_getLeadLinePathWithPos:function(t){var e=t.startPos,i=t.midPos,n=t.endPos,a=this._dealWithFloat;return"M"+a(e.x)+","+a(e.y)+"L"+a(i.x)+","+a(i.y)+"L"+a(n.x)+","+a(n.y)},_dealWithFloat:function(t){return Math.abs(t)<1e-6?0:t},_getPointGraphicGroup:function(){return this.group},_getPointTextLabelGroup:function(){if(!this.textGraphicGroup){var t=this.vanchart,e=t.seriesTextRenderGroup,i=t.seriesTextDivGroup;this.textGraphicGroup=t.renderer.vgroup(),e.append(this.textGraphicGroup.renderG),i.append(this.textGraphicGroup.divG)}return this.textGraphicGroup.renderG.attr("transform",n["default"].makeTranslate(this._getTranslate())),this.textGraphicGroup.divG.attr("transform",n["default"].makeTranslate3d(this._getTranslate())),this.textGraphicGroup},_getTranslate:function(){return this.vanchart.bounds},getEvents:function(){return{mouseover:this._onSeriesMouseOver,mouseout:this._onSeriesMouseOut,seriesUnChosen:this._seriesUnChosen,pointMouseOver:this._onPointMouseOver,pointMouseOut:this._onPointMouseOut,tap:this._onSeriesTap}},_onPointMouseOver:function(t){t.graphic&&t.graphic.style("cursor",t.onClick?"pointer":"")},_seriesUnChosen:function(t){this._onSeriesMouseOut&&this._onSeriesMouseOut(t)},_onSeriesMouseOver:function(t){var e=this,i=e.vanchart,n=i.hoverSeries,a=i.hoverPoint;n!=e&&(n&&n.fire("seriesUnChosen",t),i.hoverSeries=e);var r=e.getClosestPoint(t.containerPoint);r&&r!=a&&(a&&a.fire("mouseout",t),i.registerInteractiveTarget(r,r.series.defaultMarker),r.fire("mouseover",t),i.registerInteractiveTarget(r,r.series.defaultMarker))},_onSeriesTap:function(t){this.vanchart&&this.vanchart.isMobile()&&this.fire("mouseover",t)},getPressedStyle:function(){return null},onPointPress:function(){var t=this,e=t.series.getPressedStyle(t);e&&t.graphic&&t.graphic.style(e)},onPointPressUp:function(){var t=this,e=t.series,i=e.getHighLightStyle&&e.getHighLightStyle(t);i&&t.graphic&&t.graphic.style(i)},remove:function(){var t=this,e=t.vanchart;this.points.forEach((function(i){e.removePointGraphics(i,t.type,!1)})),this._canvas&&this._canvas.remove(),this.cateLabelGroup&&this.cateLabelGroup.remove(),this.textGraphicGroup&&this.textGraphicGroup.remove(),this.group&&this.group.remove(),this.textGraphicGroup=this._canvas=this.group=null},reShowPoint:function(t){var e=t.series.vanchart.getComponent(d.ComponentCst.LEGEND_COMPONENT);return e&&e.items&&e.reShowPoint(t)},updateDelay:function(t){var e=this,i=e.vanchart,n=i.getComponent(d.ComponentCst.LEGEND_COMPONENT);if(n&&n.showSeries(e))for(var a=i.seriesOfType(e.type),r=0,o=a.length;r<o;r++)if(n.toDropSeries(a[r]))return t||150;return 0},_defaultStrokeWidth:function(t){return 2*(0,x.autoFitFontScale)(t)},getKey:function(){var t=this.vanchart.options;return b["default"].getSeriesKey(this.options,t)}}),L.include({toFrontPosition:function(){var t=this.group.node();t&&!this._toFront&&(this._nextSibling=t.nextSibling,this._toFront=!0,n["default"].toFront(t))},resetPosition:function(){var t=this.group.node();t&&this._nextSibling&&this._toFront&&(this._toFront=!1,this._nextSibling&&this._nextSibling.parentNode&&this._nextSibling.parentNode==t.parentNode&&t.parentNode.insertBefore(t,this._nextSibling))},getGroupTrans:function(){return[0,0]},getAbsoluteLabelPos:function(t){var e=t.x,i=t.y,n=this.getGroupTrans();return{x:e+n[0],y:i+n[1]}},isSupportVerticalLabel:function(){return!1}});var M=L;e["default"]=M},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.OneTenthTextVerPadding=function(t){return.1*parseFloat(t+="")},e.QuarterTextVerPadding=function(t){return.25*parseFloat(t+="")},e.autoFitFontScale=function(t){if(t.vancharts.fullScreenFather){var e=t.vancharts.fullScreenFather.vancharts.autoFitScale.fontScale||1;return(t.vancharts.autoFitScale.fontScale||1)*e}return t.vancharts.autoFitScale.fontScale||1}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n={queryList:function(t,e){if(!t||!t.length||!e)return undefined;for(var i=0;i<t.length;i++){var n=t[i]&&t[i][e];if(n!=undefined)return n}},merge:function a(t,e,i){for(var n in e)if(e.hasOwnProperty(n)){var r=t[n];"object"==typeof r&&null!=r?a(t[n],e[n],i):!i&&n in t&&r!=undefined||(t[n]=e[n])}return t}};e["default"]=n},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getLineStyle=function(t){var e=t.color,i=t.lineWidth,n=t.lineType,r=void 0===n?a["default"].SOLID:n,o=t.opacity,s=void 0===o?1:o;return i=null==a["default"].DASH_ARRAY[r]?0:i,{fill:"none",stroke:e,"stroke-width":i,"stroke-opacity":s,"stroke-dasharray":a["default"].DASH_ARRAY[r]}},e.getMarkerRadius=function(t){return isNaN(t)?a["default"].MARKER_RADIUS:t};var n,a=(n=i(1))&&n.__esModule?n:{"default":n}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(6))&&n.__esModule?n:{"default":n};var r=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,o=new RegExp(r.source,"g");function s(t,e){var i=typeof e;return function(t,e){if("string"!=typeof t||"string"!=typeof e)return!1;return e.indexOf("url")>-1&&t.indexOf("url")<0||t.indexOf("url")>-1&&e.indexOf("url")<0}(t,e)?function(){return e}:("string"===i?a["default"].hasColorName(e)||/^(#|rgb\(|hsl\()/.test(e)?u:d:Array.isArray(e)?p:"object"===i&&isNaN(e)?c:f)(t,e)}function l(t){return t<16?"0"+Math.max(0,t).toString(16):Math.min(255,t).toString(16)}function u(t,e){t="none"==t||""==t?e:t,t=a["default"].getRGBAColorArray(t),e=a["default"].getRGBAColorArray(e);var i=t[0],n=t[1],r=t[2],o=e[0]-i,s=e[1]-n,u=e[2]-r;return function(t){return"#"+l(Math.round(i+o*t))+l(Math.round(n+s*t))+l(Math.round(r+u*t))}}function h(t){var e=t.match(/matrix\((\d+\.?\d*|\.?\d+), 0, 0, (\d+\.?\d*|\.?\d+), ([-+]?\d+\.?\d*|\.?\d+), ([-+]?\d+\.?\d*|\.?\d+)\)/);return e?"translate("+e[3]+"px,"+e[4]+"px)scale("+e[1]+")":t}function d(t,e){var i,n,a,s=r.lastIndex=o.lastIndex=0,l=-1,u=[],d=[];for(e+="",t=h(t+=""),e=h(e);(i=r.exec(t))&&(n=o.exec(e));)(a=n.index)>s&&(a=e.slice(s,a),u[l]?u[l]+=a:u[++l]=a),(i=i[0])===(n=n[0])?u[l]?u[l]+=n:u[++l]=n:(u[++l]=null,d.push({i:l,x:f(i,n)})),s=o.lastIndex;return s<e.length&&(a=e.slice(s),u[l]?u[l]+=a:u[++l]=a),u.length<2?d[0]?(e=d[0].x,function(t){return e(t)+""}):function(){return e}:(e=d.length,function(t){for(var i,n=0;n<e;++n)u[(i=d[n]).i]=i.x(t);return u.join("")})}function c(t,e){var i,n={},a={};for(i in t)i in e?n[i]=s(t[i],e[i]):a[i]=t[i];for(i in e)i in t||(a[i]=e[i]);return function(t){for(i in n)a[i]=n[i](t);return a}}function f(t,e){return t=+t,e=+e,function(i){return t*(1-i)+e*i}}function p(t,e){var i,n=[],a=[],r=t.length,o=e.length,l=Math.min(t.length,e.length);for(i=0;i<l;++i)n.push(s(t[i],e[i]));for(;i<r;++i)a[i]=t[i];for(;i<o;++i)a[i]=e[i];return function(t){for(i=0;i<l;++i)a[i]=n[i](t);return a}}function g(t){var e=document.createElementNS("http://www.w3.org/2000/svg","g");return(g=function(t){if(null!=t){e.setAttribute("transform",t);var i=e.transform.baseVal.consolidate()}return new m(i?i.matrix:y)})(t)}function m(t){var e,i,n,a=[t.a,t.b],r=[t.c,t.d],o=_(a),s=v(a,r),l=_(((e=r)[0]+=(n=-s)*(i=a)[0],e[1]+=n*i[1],e))||0;a[0]*r[1]<r[0]*a[1]&&(a[0]*=-1,a[1]*=-1,o*=-1,s*=-1),this.rotate=180*(o?Math.atan2(a[1],a[0]):Math.atan2(-r[0],r[1]))/Math.PI,this.translate=[t.e,t.f],this.scale=[o,l],this.skew=l?180*Math.atan2(s,l)/Math.PI:0}function v(t,e){return t[0]*e[0]+t[1]*e[1]}function _(t){var e=Math.sqrt(v(t,t));return e&&(t[0]/=e,t[1]/=e),e}m.prototype.toString=function(){return"translate("+this.translate+")rotate("+this.rotate+")skewX("+this.skew+")scale("+this.scale+")"};var y={a:1,b:0,c:0,d:1,e:0,f:0};s.identity=function(t){return t},s.interpolateRound=function(t,e){return e-=t,function(i){return Math.round(t+e*i)}},s.uninterpolateNumber=function(t,e){return e=(e-=t=+t)||1/e,function(i){return(i-t)/e}},s.interpolateNumber=function(t,e){return t=+t,e=+e,function(i){return t*(1-i)+e*i}},s.interpolate=s,s.interpolateRgb=u,s.interpolateTransform=function(t,e){var i,n=[],a=[],r=g(t),o=g(e),s=r.translate,l=o.translate,u=r.rotate,h=o.rotate,d=r.skew,c=o.skew,p=r.scale,m=o.scale;return s[0]!=l[0]||s[1]!=l[1]?(n.push("translate(",null,",",null,")"),a.push({i:1,x:f(s[0],l[0])},{i:3,x:f(s[1],l[1])})):l[0]||l[1]?n.push("translate("+l+")"):n.push(""),u!=h?(u-h>180?h+=360:h-u>180&&(u+=360),a.push({i:n.push(n.pop()+"rotate(",null,")")-2,x:f(u,h)})):h&&n.push(n.pop()+"rotate("+h+")"),d!=c?a.push({i:n.push(n.pop()+"skewX(",null,")")-2,x:f(d,c)}):c&&n.push(n.pop()+"skewX("+c+")"),p[0]!=m[0]||p[1]!=m[1]?(i=n.push(n.pop()+"scale(",null,",",null,")"),a.push({i:i-4,x:f(p[0],m[0])},{i:i-2,x:f(p[1],m[1])})):1===m[0]&&1===m[1]||n.push(n.pop()+"scale("+m+")"),i=a.length,function(t){for(var e,r=-1;++r<i;)n[(e=a[r]).i]=e.x(t);return n.join("")}},s.interpolateArray=p;var A=s;e["default"]=A},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=h(i(1)),a=h(i(0)),r=h(i(9)),o=h(i(8)),s=h(i(51)),l=h(i(54)),u=h(i(55));function h(t){return t&&t.__esModule?t:{"default":t}}function d(t,e,i){var n=t.series,r=n.vanchart.renderer,o=t.graphic||t;o.effectShadowFilter=o.effectShadowFilter||r.createDropShadowFilter(3,3,.75,5,91/255,91/255,91/255);var s=r.toPatternProperty(o.effectShadowFilter);return{period:n._getEffectTime(t),translate:isNaN(e)||isNaN(i)?"":a["default"].makeTranslate({x:e,y:i}),firstTweenFun:function(){return function(t){return r&&r.updateDropShadowFilter&&r.updateDropShadowFilter(o.effectShadowFilter,3*t,3*t,.75*t,5*t,91/255,91/255,91/255),s}},secondTweenFun:function(){return function(t){return r&&r.updateDropShadowFilter&&r.updateDropShadowFilter(o.effectShadowFilter,3*(1-t),3*(1-t),.75*(1-t),5*(1-t),91/255,91/255,91/255),s}}}}function c(t,e,i){var n={"fill-opacity":0,stroke:"none",fill:t.color},a=r["default"].arc().innerRadius(t.radius).startAngle(0).endAngle(360);f(t,{isMap:i,initStyle:n,pathFun:function(e){return a({outerRadius:t.radius+e*t.radius*1.5})},trans:e})}function f(t,e){var i,n,r=t.series,o=r.vanchart,s=o.renderer,h=e.initStyle,d=e.trans||{x:t.posX,y:t.posY};if(e.isMap){var c=t.getLatLng();d=c&&o.latLngToLayerPoint(c)||{x:0,y:0},i=t.effectGraphic=t.effectGraphic||(new u["default"]).addTo(o.getEffectLayer()),n=function(){return(new l["default"]).addTo(i)._path.style(h).attr("transform",a["default"].makeTranslate(d)).style("pointer-events","none")}}else i=r._getPointEffectGroup(t).attr("transform",a["default"].makeTranslate(d)),n=function(){return s.path().addTo(i).style(h)};function f(t,i,n){t.style(h).effectTransition().delay(i).ease("linear").duration(n).styleTween("stroke-width",(function(){return e.borderFun})).styleTween(e.opacityKey||"fill-opacity",(function(){return function(t){return.3*(1-t)}})).attrTween("d",(function(){return e.pathFun}))}var p=i.firstG=i.firstG||n(),g=i.secondG=i.secondG||n(),m=i.thirdG=i.thirdG||n(),v=r._getEffectTime(t)/r.getDefaultEffectTime();f(p,0,1600*v),f(g,440*v,1600*v),f(m,880*v,1600*v)}var p={MARKER_EFFECT_TIME:2560,markerEffectAnimation:function(t,e){var i=t.options.marker;if(i&&i.symbol){var n=function(t){return t*s*2.5},o=i.symbol,s=i.radius;if(a["default"].isImageMarker(o))return;f(t,{isMap:e,initStyle:{fill:"none",stroke:i.fillColor,"stroke-width":0,"stroke-opacity":0},opacityKey:"stroke-opacity",pathFun:function(t){return r["default"].getMarkerPath(o,s+n(t)/2-1)},borderFun:n})}else!function(t,e){var i=t.options.marker,n=i.radius,a={"fill-opacity":0,stroke:"none",fill:i.fillColor},o=r["default"].arc().innerRadius(0).startAngle(0).endAngle(360);function s(t){return o({outerRadius:t*n*3.5})}f(t,{isMap:e,initStyle:a,pathFun:s})}(t,e)},bubbleEffectAnimation:function(t,e){c(t,null,e)},AREA_STYLE_EFFECT_TIME:2e3,areaStyleEffectAnimation:function(t,e,i){var a=d(t,e,i);t.graphic.interrupt(n["default"].SCALE_EXPAND_ANIMATION).interrupt(n["default"].SCALE_MINIFY_ANIMATION),new s["default"](t.graphic,n["default"].SCALE_EXPAND_ANIMATION).ease(o["default"].css["ease-out-quad"]).duration(.5*a.period).attrTween("filter",a.firstTweenFun).attr("transform",a.translate+"scale(1.05)"),new s["default"](t.graphic,n["default"].SCALE_MINIFY_ANIMATION).ease(o["default"].css["ease-in-quad"]).delay(.5*a.period).duration(.5*a.period).attrTween("filter",a.secondTweenFun).attr("transform",a.translate+"scale(1)")},isAreaStyleEffectChart:function(t){return t===n["default"].FUNNEL_CHART||t===n["default"].MULTIPIE_CHART||t===n["default"].PIE_CHART||t===n["default"].COLUMN_RADAR||t===n["default"].TREEMAP_CHART},areaMapEffectAnimation:function(t,e){var i=d(e);t._path.style("filter","inherit").effectTransition().ease(o["default"].css["ease-out-quad"]).duration(.5*i.period).attrTween("filter",i.firstTweenFun).style("fill-opacity",.5).transition().ease(o["default"].css["ease-in-quad"]).duration(.5*i.period).attrTween("filter",i.secondTweenFun).style("fill-opacity",1)},POINT_MAP_EFFECT_TIME:3200,pointMapEffectAnimation:function(t,e){var i=e.series,r=i.vanchart,h=e.options,d=h.markerType===n["default"].ANCHOR_ICON?h.markerSize:h.icon.iconSize[0],c=d/90,f=h.markerType===n["default"].ANCHOR_ICON?d/n["default"].ANCHOR_ICON_SIZE:1,p=i._getEffectTime(e),g=function(){var t=e.getLatLng(),i=t&&r.latLngToLayerPoint(t)||{x:0,y:0};return{x:i.x,y:i.y}};function m(){return function(e){var i=g();return(t._icon?a["default"].makeTranslate3d({x:i.x,y:i.y-25*e}):a["default"].makeTranslate({x:i.x,y:i.y-25*e}))+" scale("+f+")"}}function v(){return function(e){var i=g();return(t._icon?a["default"].makeTranslate3d({x:i.x,y:i.y-25*(1-e)}):a["default"].makeTranslate({x:i.x,y:i.y-25*(1-e)}))+" scale("+f+")"}}var _=t._icon||t._path.rawElement;new s["default"]({node:function(){return _}},n["default"].EFFECT_KEY).ease(o["default"].css["ease-out-quint"]).duration(.25*p).styleTween("transform",m).attrTween("transform",m).transition().ease(o["default"].css["ease-in-quint"]).duration(.25*p).styleTween("transform",v).attrTween("transform",v).transition().ease(o["default"].css["ease-out-quint"]).duration(.25*p).styleTween("transform",m).attrTween("transform",m).transition().ease(o["default"].css["ease-in-quint"]).duration(.25*p).styleTween("transform",v).attrTween("transform",v);var y={"fill-opacity":0,fill:e.color},A=e.effectGraphic=e.effectGraphic||(new u["default"]).addTo(r.getEffectLayer());function T(){return(new l["default"]).addTo(A)._path.style(y).attr("d","M-56,0a56,16 0 1,0 112,0a56,16 0 1,0 -112,0")}var x=g(),b=a["default"].makeTranslate({x:x.x,y:x.y}),C=b+" scale("+c+")";function L(t,e,i){t.style(y).attr("transform",C),t.effectTransition().delay(e).ease("linear").duration(i).attrTween("transform",(function(){return function(t){return b+"scale("+(c+1.4*c*t)+")"}})).styleTween("fill-opacity",(function(){return function(t){return.6*(1-t)}}))}var M=A.firstG=A.firstG||T(),P=A.secondG=A.secondG||T(),S=A.thirdG=A.thirdG||T(),w=p/i.getDefaultEffectTime();L(M,0,2e3*w),L(P,600*w,2e3*w),L(S,1200*w,2e3*w)},forceBubbleEffectAnimation:c};e["default"]=p},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(0))&&n.__esModule?n:{"default":n};var r=function(t,e,i){if(isNaN(t)||isNaN(e))throw new Error("Invalid LatLng object: ("+t+", "+e+")");this.lat=+t,this.lng=+e,i!==undefined&&(this.alt=+i)};r.prototype={equals:function(t,e){return!!t&&(t=r.create(t),Math.max(Math.abs(this.lat-t.lat),Math.abs(this.lng-t.lng))<=(e===undefined?1e-9:e))},toString:function(t){return"LatLng("+a["default"].formatNum(this.lat,t)+", "+a["default"].formatNum(this.lng,t)+")"},distanceTo:function(t){return L.CRS.Earth.distance(this,r.create(t))},wrap:function(){return L.CRS.Earth.wrapLatLng(this)},clone:function(){return new r(this.lat,this.lng,this.alt)}},r.create=function(t,e,i){return t instanceof r?t:a["default"].isArray(t)&&"object"!=typeof t[0]?3===t.length?new r(t[0],t[1],t[2]):2===t.length?new r(t[0],t[1]):null:t===undefined||null===t?t:"object"==typeof t&&"lat"in t?new r(t.lat,"lng"in t?t.lng:t.lon,t.alt):e===undefined?null:new r(t,e,i)};var o=r;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=r(i(12)),a=r(i(0));function r(t){return t&&t.__esModule?t:{"default":t}}var o=n["default"].extend({options:{pane:"overlayPane",nonBubblingEvents:[]},addTo:function(t){return t.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(t){return t&&t.removeLayer(this),this},exitAnimate:function(t){t._pointLayer.remove(this)},getPane:function(t){return this._map.getPane(t?this.options[t]||t:this.options.pane)},beforeAdd:function(t){this._renderer=t.getMapRenderer(this)},_layerAdd:function(t){var e=t.target;if(e.hasLayer(this)){if(this._map=e,this._zoomAnimated=e._zoomAnimated,this.getEvents){var i=this.getEvents();e.on(i,this),this.once("remove",(function(){e.off(i,this)}),this)}this.onAdd(e)}},_reset:a["default"].falseFn,_project:a["default"].falseFn,_update:a["default"].falseFn,setAttr:a["default"].falseFn});e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.fixOptionsWithTheme=function(t,e){if(t.isMap())return function(t){var e=t.theme===n["default"].DARK;(0,a.hasDefined)(t.geo.aMapLayer)&&(t.geo.aMapLayer=u(t.geo.aMapLayer,"mapAMapLayer",e));(0,a.hasDefined)(t.geo.tileLayer)&&(t.geo.tileLayerOptions=function(t,e){if(t.tileLayerOptions&&!(0,a.isEmptyObj)(t.tileLayerOptions))return t.tileLayerOptions;if(t.tileLayer===l.mapTileLayer.dark)return l[e].dark;if(t.tileLayer===l.mapTileLayer.light)return l[e].light;return{}}(t.geo,"mapTileLayerOptions"));t.legend&&t.legend.backgroundColor&&(t.legend.backgroundColor=u(t.legend.backgroundColor,"mapLegendBackgroundColor",e));t.rangeLegend&&t.rangeLegend.backgroundColor&&(t.rangeLegend.backgroundColor=u(t.rangeLegend.backgroundColor,"mapLegendBackgroundColor",e));t.title&&t.title.backgroundColor&&(t.title.backgroundColor=u(t.title.backgroundColor,"mapTitleBackgroundColor",e));t.dTools&&(t.dTools.backgroundColor=u(t.dTools.backgroundColor,"dToolItemBackground",e));var i=t.plotOptions,s=i.areaMap||{},h=s.nullColor||i.nullColor,d=s.borderColor||i.borderColor;(0,a.isEmptyObj)(s)?(h||d)&&(i.nullColor=u(h,"nullColor",e),i.borderColor=u(d,"mapBorderColor",e)):(s.nullColor=u(h,"nullColor",e),s.borderColor=u(d,"mapBorderColor",e));return function(t,e){(r["default"].ie9||r["default"].ielt9)&&(0,o.isAMapLayer)({geo:t})&&(t.tileLayer=e?l.mapTileLayer.dark:l.mapTileLayer.light,t.tileLayerOptions=e?l.mapTileLayerOptions.dark:l.mapTileLayerOptions.light,t.attribution='<a><img src="http://webapi.amap.com/theme/v1.3/mapinfo_05.png" width="67" height="16">&copy; 2016 AutoNavi</a>',t.aMapLayer=null)}(t.geo,e),t}(e)},e.getThemeAutoValue=u;var n=s(i(1)),a=i(2),r=s(i(5)),o=i(26);function s(t){return t&&t.__esModule?t:{"default":t}}var l={mapTileLayer:{light:"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",dark:"http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"},mapAMapLayer:{light:"amap://styles/normal",dark:"amap://styles/grey"},mapTileLayerOptions:{light:{minZoom:3,maxZoom:18},dark:{minZoom:0,maxZoom:16}},nullColor:{light:"rgba(214,214,214,0.70)",dark:"rgba(75,75,75,0.70)"},mapBorderColor:{light:"#FFFFFF",dark:"#000000"},mapLegendBackgroundColor:{light:"rgba(255,255,255,0.9)",dark:"rgba(0,0,0,0.9)"},mapTitleBackgroundColor:{light:"rgba(255,255,255,0.75)",dark:"rgba(0,0,0,0.75)"},hinge:{light:"#656B6D",dark:"rgba(255,255,255,0)"},pointerPaneBackgroundColor:{light:"#FFFFFF",dark:"rgba(255,255,255,0)"},paneBackgroundColor:{light:"#ECECEC",dark:"#48494F"},gaugeLabelColor:{light:"#444444",dark:"#E8E8E8"},pointBorderColor:{light:"#FFFFFF",dark:"#000000"},dToolItemBackground:{light:"rgba(255,255,255,1)",dark:"rgba(0,0,0,0.8)"},markerStrokeColor:{light:"#FFFFFF",dark:"#000000"},pieCateLabelColor:{light:"#444444",dark:"#E8E8E8"},fullScreenBackground:{light:"#ffffff",dark:"#000816"}};function u(t,e,i){return t!==n["default"].AUTO?t:i?l[e].dark:l[e].light}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getSeriesFillFilter=function(t,e){var i=e.options,s=e.vanchart,u=i.gradualStyle,h=i.gradualColors,d=i.type;if(u===n["default"].STYLE_NORMAL)return t;if(function(t){return!(0,o.supportFillFilter)()||t!==n["default"].COLUMN_CHART&&t!==n["default"].BAR_CHART}(d))return l(i,t);var c=s.renderer,f=function(t){return t.options.type===n["default"].COLUMN_CHART?function(t){var e=t.options,i=t.yAxis,a=e.inverted,r=i.options.reversed;if(a)return r?n["default"].RIGHT_TO_LEFT:n["default"].LEFT_TO_RIGHT;return r?n["default"].TOP_TO_BOTTOM:n["default"].BOTTOM_TO_TOP}(t):function(t){var e=t.options,i=t.xAxis,a=e.inverted,r=i.options.reversed;if(a)return r?n["default"].BOTTOM_TO_TOP:n["default"].TOP_TO_BOTTOM;return r?n["default"].RIGHT_TO_LEFT:n["default"].LEFT_TO_RIGHT}(t)}(e),p=(0,a.gradualLocation)(f),g=u===n["default"].STYLE_CUSTOM?h:[t,r["default"].getColorWithDivider(t,.9)],m={offset:"0%","stop-color":g[0]},v={offset:"100%","stop-color":g[1]};e.colorGradient?c.updateColorGradient(e.colorGradient,p,[m,v]):e.colorGradient=c.colorGradient(p,[m,v]);return c.toPatternProperty(e.colorGradient)},e.highLightGradualColor=function(t){var e=r["default"].getHighLightColor(t[0]),i=r["default"].getHighLightColor(t[1]);return[r["default"].getColorWithDivider(e,1/.95),r["default"].getColorWithDivider(i,1/.95)]},e.notSupportGradualColor=l;var n=s(i(1)),a=i(47),r=s(i(6)),o=i(3);function s(t){return t&&t.__esModule?t:{"default":t}}function l(t,e){var i=t.gradualStyle,a=t.gradualColors;return i===n["default"].STYLE_CUSTOM?a[1]:e}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(13))&&n.__esModule?n:{"default":n};var r=function(t,e){if(t)for(var i=e?[t,e]:t,n=0,a=i.length;n<a;n++)this.extend(i[n])};r.prototype={extend:function(t){return t=a["default"].create(t),this.min||this.max?(this.min.x=Math.min(t.x,this.min.x),this.max.x=Math.max(t.x,this.max.x),this.min.y=Math.min(t.y,this.min.y),this.max.y=Math.max(t.y,this.max.y)):(this.min=t.clone(),this.max=t.clone()),this},getCenter:function(t){return new a["default"]((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,t)},getBottomLeft:function(){return new a["default"](this.min.x,this.max.y)},getTopRight:function(){return new a["default"](this.max.x,this.min.y)},getSize:function(){return this.max.subtract(this.min)},contains:function(t){var e,i;return(t="number"==typeof t[0]||t instanceof a["default"]?a["default"].create(t):r.create(t))instanceof r?(e=t.min,i=t.max):e=i=t,e.x>=this.min.x&&i.x<=this.max.x&&e.y>=this.min.y&&i.y<=this.max.y},intersects:function(t){t=r.create(t);var e=this.min,i=this.max,n=t.min,a=t.max,o=a.x>=e.x&&n.x<=i.x,s=a.y>=e.y&&n.y<=i.y;return o&&s},overlaps:function(t){t=r.create(t);var e=this.min,i=this.max,n=t.min,a=t.max,o=a.x>e.x&&n.x<i.x,s=a.y>e.y&&n.y<i.y;return o&&s},isValid:function(){return!(!this.min||!this.max)}},r.create=function(t,e){return!t||t instanceof r?t:new r(t,e)};var o=r;e["default"]=o},function(t,e,i){"use strict";var n;Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var a=((n=i(31))&&n.__esModule?n:{"default":n})["default"].extend({initialize:function(t){this.renderer=t,this.ctx=t.ctx,this.cut=null,this._initialize(t)},setStyle:function(t){for(var e in this.style)t.hasOwnProperty(e)&&(this.style[e]=t[e]);return this},drawStyle:function(){var t=this.style;return this.renderer.lineWidth(t.lineWidth),this.renderer.strokeStyle(t.strokeStyle),this.renderer.fillStyle(t.fillStyle),this.renderer.beginNewPath(),this},contain:function(){},animate:function(){return this.cut||(this.cut=this.renderer.animation.animate(this.style)),this},delay:function(t){return this.cut.delay(t),this},duration:function(t){return this.cut.duration(t),this},tween:function(t,e){return this.cut.tween(t,e),this},end:function(t){return this.cut.end(t),this},stop:function(){return this.cut.stop(),this},ease:function(t){return this.cut.ease(t),this},remove:function(){this.cut&&this.cut.stop(),this.needToRemove=!0}});e["default"]=a},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.isAMapLayer=function(t){return t&&t.geo&&(0,a.hasDefined)(t.geo.aMapLayer)},e.isPointMap=function(t){return t===n["default"].POINT_MAP||t===n["default"].SCATTER_CHART||t===n["default"].BUBBLE_CHART},e.isPointMapAnchorIcon=function(t,e){return t===n["default"].POINT_MAP&&e===n["default"].ANCHOR_ICON},e.isPointMapDefaultImgFn=function(t,e){return t===n["default"].POINT_MAP&&e!==n["default"].ANCHOR_ICON},e.useLowVersionAMapLayer=function(){if(r["default"].ie||r["default"].ios||!r["default"].webgl)return!0;return!(r["default"].win||r["default"].android||r["default"].mac)};var n=o(i(1)),a=i(2),r=o(i(5));function o(t){return t&&t.__esModule?t:{"default":t}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=e.createCanvasRenderer=void 0;var n=s(i(123)),a=s(i(78)),r=s(i(82)),o=i(3);i(136);function s(t){return t&&t.__esModule?t:{"default":t}}e.createCanvasRenderer=function(t,e,i){return new r["default"](t,e,i)};var l=function(t,e){return(0,o.isSupportSVG)()?new n["default"](t,e):new a["default"](t,e)};e["default"]=l},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.calculateCustomLabel=u,e["default"]=void 0,e.defaultLabelContent=h;var n=l(i(0)),a=l(i(1)),r=i(41),o=i(139),s=i(49);function l(t){return t&&t.__esModule?t:{"default":t}}function u(t,e){var i=(e=e||t.options.dataLabels).formatter,r="";try{r+=n["default"].getFormatterFunction(i).call(t)}catch(h){}var s=function(t,e){var i=(0,o.defaultValueStyle)(t,e);t.series.isSupportVerticalLabel()&&e.orientation&&e.orientation===a["default"].VERTICAL_LAYOUT&&(i=n["default"].extend({},i,{writingMode:"tb-rl","writing-mode":"tb-rl","-webkit-writing-mode":"vertical-rl"}));return i}(t,e),l=!!t.series.vanchart.isMap()||e.useHtml,u=n["default"].getTextDimension(r,s,l);return e.useHtml&&(u.width=isNaN(parseFloat(e.labelWidth))?u.width:parseFloat(e.labelWidth),u.height=isNaN(parseFloat(e.labelHeight))?u.height:parseFloat(e.labelHeight)),[{text:r,style:s,dim:u}]}function h(t,e){e=e||t.options.dataLabels;var i=t.series,s=e.formatter,l=s.identifier,u=[r.NAME,r.CATEGORY,r.SERIES],h=[r.VALUE,r.PERCENT,r.ARRIVALRATE,r.LEVEL],d=o.defaultCategoryStyle,c=o.defaultValueStyle;i.type===a["default"].TREEMAP_CHART?(h.unshift(u.shift()),c=d):i.type===a["default"].GANTT_CHART?(u=[],h=[r.PROCESSES,r.SERIES,r.STARTTIME,r.FINISHTIME,r.DURATION,r.PROGRESS]):i.type===a["default"].BAR_CHART&&e.align===a["default"].AUTO&&(u=u.filter((function(t){return-1!==l.indexOf(t)})),h=h.filter((function(t){return-1!==l.indexOf(t)})),1===u.length&&1===h.length&&(u=[],h=[r.CATEGORY,r.SERIES,r.VALUE,r.PERCENT]));var f=[];function p(t){return t.map(g).filter(m)}function g(e){if(-1!==l.indexOf(e)){var a=r.propMap[e][0],o=r.propMap[e][1],u=t[a],h=s[o]||i._getLabelFormatFn&&i._getLabelFormatFn(a),d=n["default"].format(u,h);return i._postLabel?i._postLabel(d,a):d}return null}function m(t){return null!==t}function v(i,r,o){if(r.length){var s=r.join(a["default"].BLANK_VALUE_PERCENTAGE),l=o(t,e),u=n["default"].getTextDimension(s,l,e.useHtml);i.push({text:s,style:l,dim:u})}}return v(f,p(u),d),v(f,p(h),c),f}var d=function(t,e){if(!function(t,e){var i=(e=e||t&&t.options&&t.options.dataLabels)&&e.enabled&&e.formatter;return t.series.vanchart.isMap()?i:i&&t.isVisible()}(t,e))return t.labelDim={width:0,height:0},void(t.labelContent=[]);var i=(e=e||t.options.dataLabels).formatter;t.labelContent="object"==typeof i?function(t,e){var i=t.series,l=i.type;if(e&&e.useRichText)return(0,s.getLabelRichTextDetail)(t,e.richText,e.autoStyle,e.formatter);if(i.vanchart.isMap())return function(t,e){if(!t||!e||!e.enabled)return{};var i=e.formatter,a=!0,s=[];if(-1!==i.identifier.indexOf(r.NAME)){var l=n["default"].format(t.name,i.areaNameFormat),u=(0,o.defaultCategoryStyle)(t,e),h=n["default"].getTextDimension(l,u,a);s.push({text:l,style:u,dim:h})}var d=function(t,e){var i=e.showAllSeries,a=e.formatter,s=a.identifier,l=i?t.points.filter((function(t){return t.series.visible})):[t],u=(0,o.defaultValueStyle)(t,e);return l.map((function(t){var e="",i=-1!==s.indexOf(r.SERIES),o=-1!==s.indexOf(r.VALUE)||-1!==s.indexOf(r.SIZE),l=-1!==s.indexOf(r.PERCENT),h=n["default"].format(t.seriesName,a.seriesFormat),d=n["default"].format(t.originalValue,a.valueFormat),c=n["default"].format(t.percentage,a.percentFormat);i&&(e+=h,(o||l)&&(e+=":")),o&&(e+=d,l&&(e+=" ")),l&&(e+=c);var f=n["default"].getTextDimension(e,u,!0);return{text:e,style:u,dim:f,seriesName:t.seriesName}}))}(t,e);return s.push.apply(s,d),s}(t,e);return l===a["default"].BUBBLE_CHART||l===a["default"].SCATTER_CHART?function(t){var e=t.options.dataLabels,i=e.formatter,a=i.identifier,s=[];if(-1!=a.indexOf(r.DESCRIPTION)){var l=(0,o.defaultCategoryStyle)(t,e),u=n["default"].getTextDimension(t.options.description,l,e.useHtml);s.push({text:t.options.description,style:l,dim:u})}if(-1!=a.indexOf(r.SERIES)){var h=n["default"].format(t.seriesName,i.seriesFormat),d=(0,o.defaultCategoryStyle)(t,e),c=n["default"].getTextDimension(h,d,e.useHtml);s.push({text:h,style:d,dim:c})}if(-1!=a.indexOf(r.X)||-1!=a.indexOf(r.Y)||-1!=a.indexOf(r.SIZE)){var f=(0,r.getXYSizeString)(t,i,a),p=(0,o.defaultValueStyle)(t,e),g=n["default"].getTextDimension(f,p,e.useHtml);s.push({text:f,style:p,dim:g})}return s}(t):l===a["default"].FUNNEL_CHART?function(t){var e=t.options.dataLabels,i=e.formatter,s=i.identifier;if(e.align==a["default"].INSIDE)return h(t);var l=t.series,u=[];if(-1!=s.indexOf(r.NAME)){var d=n["default"].format(t.name,i.nameFormat),c=(0,o.defaultCategoryStyle)(t,e),f=n["default"].getTextDimension(d,c,e.useHtml);u.nameLabelContent={text:d,style:c,dim:f},l.maxNameLabelWidth||(l.maxNameLabelWidth=0),l.maxNameLabelWidth=Math.max(l.maxNameLabelWidth,f.width)}if(-1!=s.indexOf(r.VALUE)||-1!=s.indexOf(r.PERCENT)||-1!=s.indexOf(r.ARRIVALRATE)){var p=[];-1!=s.indexOf(r.VALUE)&&p.push(n["default"].format(t.originalValue,i.valueFormat)),-1!=s.indexOf(r.PERCENT)&&p.push(n["default"].format(t.percentage,i.percentFormat)),-1!=s.indexOf(r.ARRIVALRATE)&&p.push(n["default"].format(t.arrivalRate,i.arrivalRateFormat));var g=p.join(a["default"].BLANK_VALUE_PERCENTAGE),m=(0,o.defaultValueStyle)(t),v=n["default"].getTextDimension(g,m,e.useHtml);u.valueLabelContent={text:g,style:m,dim:v},l.maxValueLabelWidth||(l.maxValueLabelWidth=0),l.maxValueLabelWidth=Math.max(l.maxValueLabelWidth,v.width)}return u}(t):l===a["default"].COLUMN_CHART?function(t){var e=t.options.dataLabels,i=e.formatter,s=e.orientation,l=i.identifier;if(s&&s===a["default"].VERTICAL_LAYOUT){var u=n["default"].extend({writingMode:"tb-rl","writing-mode":"tb-rl","-webkit-writing-mode":"vertical-rl"},(0,o.defaultValueStyle)(t,e)),d=[];[r.CATEGORY,r.SERIES,r.VALUE,r.PERCENT].forEach((function(e){if(-1!==l.indexOf(e)){var a=r.propMap[e];if(a&&2===a.length){var o=a[0],s=a[1];d.push(n["default"].format(t[o],i[s]))}}}));var c=d.join(a["default"].BLANK_VALUE_PERCENTAGE);return[{text:c,style:u,dim:n["default"].getTextDimension(c,u,!1)}]}return h(t,e)}(t):h(t,e)}(t,e):u(t,e);var l=e.useRichText?(0,s.getRichTextDim)(t.labelContent):(0,r.calculateTextDim)(t.labelContent,t),d=l.width,c=l.height,f=l.nameValueGap,p=void 0===f?0:f;t.labelDim={width:d,height:c,nameValueGap:p,innerTextDim:l}};e["default"]=d},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(0))&&n.__esModule?n:{"default":n};function r(){this.addedBounds=[]}r.prototype={constructor:r,addBounds:function(t){this.addedBounds.push(t)},isValidBounds:function(t){return t.width>0&&t.height>0},isOverlapped:function(t){for(var e=0,i=this.addedBounds.length;e<i;e++)if(a["default"].rectangleOverlapped(t,this.addedBounds[e]))return!0;return!1},calculateOverlapRate:function(){var t,e,i,n,r=a["default"].clone(this.addedBounds),o=r.length,s={},l=0,u=-1,h=0;for(t=0,i=r.length;t<i;t++)for(e=t+1;e<i;e++)a["default"].rectangleOverlapped(r[t],r[e])&&(s[t]=s[t]||[],s[e]=s[e]||[],s[t].push(e),s[e].push(t),s[t].length>l&&(l=s[t].length,u=t),s[e].length>l&&(l=s[e].length,u=e));for(;l;){for(h++,t=0,i=s[u].length;t<i;t++)(n=s[s[u][t]]).splice(n.indexOf(u),1);for(t in s[u]=[],l=0,s)s[t].length>l&&(l=s[t].length,u=t)}return 0===o?0:h/o},isEmpty:function(){return 0===this.addedBounds.length}};var o=r;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=r(i(31)),a=r(i(0));function r(t){return t&&t.__esModule?t:{"default":t}}var o=n["default"].extend({z:0,initialize:function(t){this.init(t)},init:function(t){this.vanchart=t.vanchart,this.handler=t,this.parent=t},contain:function(t){return a["default"].containsPoint(this.getBoundingRect(),t)},getBoundingRect:function(){},getActions:function(){return{}}});e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(0))&&n.__esModule?n:{"default":n};function r(){}r.extend=function(t){var e=function(){this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()},i=e.__super__=this.prototype,n=Object.create(i);for(var r in n.constructor=e,e.prototype=n,this)this.hasOwnProperty(r)&&"prototype"!==r&&(e[r]=this[r]);return n.options&&(t.options=a["default"].extend(Object.create(n.options),t.options)),a["default"].extend(n,t),n._initHooks=[],n.callInitHooks=function(){if(!this._initHooksCalled){i.callInitHooks&&i.callInitHooks.call(this),this._initHooksCalled=!0;for(var t=0,e=n._initHooks.length;t<e;t++)n._initHooks[t].call(this)}},e},r.include=function(t){return a["default"].extend(this.prototype,t),this},r.addInitHook=function(t){var e=Array.prototype.slice.call(arguments,1),i="function"==typeof t?t:function(){this[t].apply(this,e)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(i),this};var o=r;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=o(i(0)),a=o(i(116)),r=i(2);function o(t){return t&&t.__esModule?t:{"default":t}}var s={},l="";function u(t){return null!=s[t]?s[t]:t}u.setLocale=function(t){var e=u.normalizeLocale(t);u.setCustomLocale((0,a["default"])(e))},u.setCustomLocale=function(t){(0,r.hasDefined)(t)&&(n["default"].extend(s,t),l=t._locale)},u.getLocale=function(){return l},u.getTextMap=function(){return s},u.i18nText=function(t){return s[t]},u.normalizeLocale=function(t){return t?t.toLowerCase().replace("_","-"):t};var h=u;e["default"]=h},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.areaMapPointsWithNormalLegend=f,e.areaPointMapPointsWithNormalLegend=g,e.areaPointMapPointsWithRangeLegend=h,e.areaPointMapValidPoints=l,e.getAllMapPoints=function(t){var e=l(t).reverse(),i=d(t),n=c(t);return e.concat(i).concat(n)},e.getHeatMapPoints=d,e.getLineMapPoints=c,e.mapPointsWithRangeLegend=u,e.pointMapLargeModePoints=function(t){var e=t.largeSeries;return l(t).forEach((function(t){var i=t.series,n=i.options,a=i.type;n.large&&e[a]&&e[a].points.push(t)})),e},e.pointMapPointsWithNormalLegend=p;var n,a=(n=i(1))&&n.__esModule?n:{"default":n},r=i(4),o=i(26),s=i(85);function l(t){return t.getComponent(r.ComponentCst.LEGEND_COMPONENT)?g(t):h(t).filter((function(t){return t.visible}))}function u(t,e){var i=[],n={},r={};return e.forEach((function(e){var o=e.type,s=o===a["default"].AREA_MAP,l=o===a["default"].LINE_MAP;e.points.forEach((function(e){var a=e.name,u=t.getFeaturesByName(a,o);if(l)i.push(e);else if(s)!n[a]&&u&&i.push(e),n[a]=!0;else{var h=t.getDataPointLngLat(e,u&&u[0]),d=h&&h.join("-");!r[d]&&d&&i.push(e),r[d]=!0}}))})),i}function h(t){return u(t.getCurrentGeo(),t.series).filter((function(t){var e=t.series.type;return e!==a["default"].LINE_MAP&&e!==a["default"].HEAT_MAP})).reverse()}function d(t){var e=t.getCurrentGeo(),i=t.series;return u(e,(0,s.seriesOfType)(i,a["default"].HEAT_MAP))}function c(t){return t.seriesOfType(a["default"].LINE_MAP).reduce((function(t,e){return t.concat(e.points)}),[]).filter((function(e){var i=e.series.options.large,n=t.getComponent(r.ComponentCst.RANGE_LEGEND_COMPONENT);if(i&&n){var a=n.type===r.ComponentCst.INTERVAL_RANGE_LEGEND,o=a?n._getMax():n.max,s=a?n._getMin():n.min;return e.getTargetValue()>=s&&e.getTargetValue()<=o}return!0}))}function f(t,e){var i=[],n={};return e.filter((function(t){return t.type===a["default"].AREA_MAP&&t.visible})).forEach((function(e){for(var a=e.type,r=e.points,o=0;o<r.length;o++){var s=r[o],l=s.name,u=t.getFeaturesByName(l,a);s.isNull&&!s.options.drilldown||(!n[l]&&u&&i.push(s),n[l]=!0)}})),i.reverse()}function p(t,e){var i=[],n={};return e.filter((function(t){return(0,o.isPointMap)(t.type)&&t.visible})).forEach((function(e){for(var r=e.type,o=e.points,s=0;s<o.length;s++){var l=o[s],u=l.name,h=t.getFeaturesByName(u,r),d=t.getDataPointLngLat(l,h&&h[0]),c=d&&d.join("-");c&&(r!==a["default"].BUBBLE_CHART?(n[c]||i.push(l),n[c]=!0):!isNaN(l.radius)&&i.push(l))}})),i.reverse()}function g(t){var e=t.series,i=t.getCurrentGeo();return f(i,e).concat(p(i,e))}},function(t,e,i){"use strict";function n(t){return t.reduce((function(t,e){return t+e}),0)}Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var a={lineH:function(t,e,i,n,a,r,o){return o||(o=e.append(t.line().style(i))),o.attr({x1:n,y1:r,x2:a,y2:r})},lineV:function(t,e,i,n,a,r,o){return o||(o=e.append(t.line().style(i))),o.attr({x1:r,y1:n,x2:r,y2:a})},rect:function(t,e,i,n,a,r,o,s){return s||(s=e.append(t.rect().style(i))),s.attr({x:n,y:a,width:r,height:o})},traverse:function(t,e,i,n){!function a(t,r,o,s,l){i&&i(t,r,o,s,l);var u,h=t[e];h&&(u=h.length)&&h.map((function(e,i){a(e,r+1,u,i,t)})),n&&n(t,r,o,s,l)}(t,0,0,0,null)},sum:n,distribValues:function(t,e){var i=n(t);return t.map((function(t){return t/i*e}))},getValidProgress:function(t){return t=+t,isNaN(t)||t<0?0:t>1?1:t}};e["default"]=a},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getEmptyDataDomain=function(t){var e=a["default"].EMPTY_DATA_DOMAIN,i=e[0],n=e[1];t&&!isNaN(t)&&(n*=Math.pow(10,Math.floor(Math.log(t)/Math.LN10)));return[i,n]},e.getFixedDomain=function(t,e,i){if(i&&e&&2===e.length){var n,a;if(n=parseFloat((0,o.hasDefined)(e[0])?e[0]:t[0]),a=parseFloat((0,o.hasDefined)(e[1])?e[1]:t[1]),n=isNaN(n)?null:n,a=isNaN(a)?null:a,n&&a){var r=n;n=Math.min(n,a),a=Math.max(r,a)}return[n,a]}return t},e.getForecast=function(t){for(var e=p(t),i=[0,0],n=0,a=t.length;n<a;n++)if(t[n].visible||!e){var r=t[n].options.trendLine;if(r&&r.period&&2===r.period.length){var o=r.period,s=o[0],l=o[1];i[0]=Math.min(i[0]||0,s),i[1]=Math.max(i[1]||0,l)}}return i},e.getFormatFunc=l,e.getIntegerNiceDomain=function(t,e,i){return t=n["default"].accMul(Math.floor(t/i),i),e=n["default"].accMul(Math.ceil(e/i),i),[t,e]},e.getLinearFormatTicks=function(t){var e=l(t.formatObj);return u(t).map((function(t){return e(t)}))},e.getLinearNiceInterval=f,e.getLinearTicks=u,e.getLinearTicksWithMax=d,e.getLinearTicksWithMin=h,e.getLinearValidInterval=function(t){var e=t.min,i=t.max,n=t.interval,a=t.count,r=t.type;if(c(e,i,n))return n;return f(e,i,a,r)},e.getLogTicks=function(t,e,i,a){var r=[],o=Math.pow(i,a);for(;t<=e;)r.push(t),t=n["default"].accMul(t,o);return r},e.getLogValidInterval=function(t,e,i,r){if(null==r)return a["default"].DEFAULT_LOG_INTERVAL;if(t*Math.pow(i,r*a["default"].MAX_TICKS_NUM)<e)return n["default"].log(i,e/t)/a["default"].MAX_TICKS_NUM;return r},e.getPercentValidInterval=function(t,e,i){if(null==i)return a["default"].DEFAULT_PERCENT_INTERVAL;if(Math.abs((e-t)/i)>a["default"].MAX_TICKS_NUM)return(e-t)/a["default"].MAX_TICKS_NUM;return i},e.hasVisibleSery=p,e.isFromZeroAxis=function(t){if(t.isLog())return t.isAxisReversed()?Math.abs(t._domain[1]-1)<1e-6:Math.abs(t._domain[0]-1)<1e-6;if(t.isAxisReversed())return Math.abs(t._domain[1])<1e-6;return Math.abs(t._domain[0])<1e-6},e.isInDomainValue=function(t,e){var i=Math.min.apply(Math,t),n=Math.max.apply(Math,t);return e>=i&&e<=n},e.isUseMaxHeight=function(t,e){if(e)return!t;return t},e.isValidLinearInterval=c,e.isZeroArray=function(t){for(var e=0,i=(t=t||[]).length;e<i;e++)if(Math.abs(+t[e])>0)return!1;return!0};var n=s(i(0)),a=s(i(1)),r=i(4),o=i(2);function s(t){return t&&t.__esModule?t:{"default":t}}function l(t){return"function"==typeof t?t:function(t){return t}}function u(t){var e=t.options,i=t.min,n=t.max,a=t.interval;if(0===a)return[];if((0,o.hasDefined)(e.tickInterval)){if((0,o.hasDefined)(e.min))return h(e.min,n,a);if((0,o.hasDefined)(e.max))return d(i,e.max,a)}return h(i,n,a)}function h(t,e,i){for(var a=[];t<=e;)a.push(t),t=n["default"].accAdd(t,i);return a}function d(t,e,i){for(var a=[];e>=t;)a.unshift(e),e=n["default"].accAdd(e,-i);return a}function c(t,e,i){return null!=i&&Math.abs((e-t)/i)<=a["default"].MAX_TICKS_NUM}function f(t,e,i,n){var o=e-t,s=Math.pow(10,Math.floor(Math.log(o/i)/Math.LN10)),l=i/o*s;return l<=.15?s*=10:l<=.35?s*=5:l<=.75&&(s*=2),n&&n===r.ComponentCst.DATE_AXIS_COMPONENT&&(s=Math.max(s,a["default"].MIN_TIME_AXIS_INTERVAL)),s}function p(t){for(var e=0,i=t.length;e<i;e++)if(t[e].visible)return!0;return!1}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.borderPaddingFn=void 0,e.createTextBorderPath=function(t){if(!_(t))return;var e=t.options,i=t.series,n=i.vanchart.renderer,a=i._getPointTextLabelGroup(),l=e.dataLabels,u=l.backgroundColor,h=l.borderWidth,d=l.borderType,f=l.borderColor,p=x(t),g=f===r["default"].AUTO?(0,s.notSupportGradualColor)(e,t.getSeriesColor()):f||m,v="string"==typeof u?u||m:function(t,e,i){return(0,o.createGradientBackground)(i,"textBorderBackgroundColorGradient",t,e)}(n,u,t);if(d===c)return t.textBorderPath=n.group().addTo(a).attr({transform:p.transform}),t.lineTriangleBorder=n.path().addTo(t.textBorderPath).attr({d:p.path[0]}).style({stroke:g,"stroke-width":h}),void(t.lineTriangleBorderRect=n.path().addTo(t.textBorderPath).attr({d:p.path[1]}).style({fill:v,"stroke-width":0}));t.textBorderPath=n.path().addTo(a).attr({d:p.path,transform:p.transform}).style({fill:v,stroke:g,"stroke-width":h})},e.fixLabelDimWithBorder=function(t){var e=t.labelDim,i=A(t);e.width+=i[0],e.height+=i[1]},e.getBorderBounds=T,e.getHorizontalPadding=function(t){var e=A(t);if(e&&2===e.length)return e[0];return 0},e.getLabelPadding=A,e.getPathAndTransform=x,e.isNeedBorder=_,e.labelTransWithBorder=function(t){var e=function(t){var e=t.options,i=t.location,n=t.labelDim,a=e.dataLabels.borderType,o=y(a,!1,n.innerTextDim),s=T(t),l=s.x,h=s.y,d=function(e){return e===r["default"].LEFT_TO_RIGHT||e===r["default"].RIGHT_TO_LEFT?{x:l-(o[0]-3)/2,y:h+o[1]/2}:{x:t.labelPos.x,y:h+(o[1]-3)/2}};switch(a){case u:case c:return d(i);default:return{x:t.labelPos.x,y:h+o[1]/2}}}(t),i=e.x,n=e.y;return{x:i+t.labelDim.width/2,y:n+t.labelDim.height/2}};var n=i(77),a=l(i(0)),r=l(i(1)),o=i(47),s=i(23);function l(t){return t&&t.__esModule?t:{"default":t}}var u="dialog",h="parallelogram",d="ellipse",c="lineTriangle",f=2,p=4,g=.175,m="rgba(0,0,0,0)",v=function(t){switch(t){case r["default"].RIGHT_TO_LEFT:return"left";case r["default"].LEFT_TO_RIGHT:return"right";case r["default"].TOP_TO_BOTTOM:return"bottom";default:return"top"}};function _(t){var e=t.labelContent,i=t.options,n=t.series,a=i.dataLabels||{},o=a.backgroundColor,s=a.borderWidth,l=a.orientation!==r["default"].VERTICAL_LAYOUT,u=n&&(n.type===r["default"].PIE_CHART||n.type===r["default"].LINE_CHART||n.type===r["default"].AREA_CHART||n.type===r["default"].BAR_CHART||n.type===r["default"].COLUMN_CHART);return l&&u&&e&&0!==e.length&&(s||o)}var y=function(t,e,i){var n=i||{},a=(n.width,n.height);switch(t){case u:return e?[8,5]:[8,8];case h:return[a?2*g*(a+5)+p:8,5];case d:return function(t){var e=t.width,i=void 0===e?0:e,n=t.height,a=void 0===n?0:n,r=function(t,e){return[2*(1.25*t-t),2*(1.25*e-e)]};return i>a?r(i,a):r(a,i).reverse()}(i);case c:return e?[8,5]:[8,8];default:return[8,5]}};function A(t){if(!_(t))return[0,0];var e=t.options,i=t.labelDim,n=e.dataLabels.borderType;return y(n,!1,i.innerTextDim)}function T(t){var e=t.options,i=t.labelDim,n=t.labelPos,a=n.x,r=n.y,o=i.width,s=i.height,l=e.dataLabels.borderType,h=v(t.location);switch(l){case u:case c:return function(t){switch(t){case"left":return{width:o-3,height:s,x:a,y:r};case"right":return{width:o-3,height:s,x:a+3,y:r};case"bottom":return{width:o,height:s-3,x:a,y:r+3};default:return{width:o,height:s-3,x:a,y:r}}}(h);default:return{width:o,height:s,x:a,y:r}}}function x(t){var e,i=t.options.dataLabels,r=i.borderType,o=i.borderRadius,s=v(t.location),l=T(t),p=l.width,m=l.height,_=l.x,y=l.y,A=a["default"].makeTranslate({x:_,y:y});switch(r){case h:e=(0,n.parallelogramBorderGenerator)(p,m,f,g*m);break;case u:e=(0,n.dialogBorderGenerator)(p,m,s,0,o,3);break;case d:e=(0,n.ellipseBorderGenerator)(p,m);break;case c:e=(0,n.lineTriangleGenerator)(p,m,s);break;default:e=(0,n.rectBorderGenerator)(p,m,0,o)}return{path:e,transform:A}}e.borderPaddingFn=y},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=M(i(1)),a=i(4),r=M(i(84)),o=M(i(44)),s=M(i(12)),l=M(i(16)),u=M(i(0)),h=M(i(32)),d=M(i(13)),c=M(i(209)),f=M(i(102)),p=function(t,e){if(!e&&t&&t.__esModule)return t;if(null===t||"object"!=typeof t&&"function"!=typeof t)return{"default":t};var i=L(e);if(i&&i.has(t))return i.get(t);var n={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var r in t)if("default"!==r&&Object.prototype.hasOwnProperty.call(t,r)){var o=a?Object.getOwnPropertyDescriptor(t,r):null;o&&(o.get||o.set)?Object.defineProperty(n,r,o):n[r]=t[r]}n["default"]=t,i&&i.set(t,n);return n}(i(217)),g=M(i(81)),m=M(i(27)),v=i(2),_=i(33),y=i(85),A=M(i(218)),T=i(22),x=i(103),b=i(46),C=M(i(62));function L(t){if("function"!=typeof WeakMap)return null;var e=new WeakMap,i=new WeakMap;return(L=function(t){return t?i:e})(t)}function M(t){return t&&t.__esModule?t:{"default":t}}function P(){return P=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t},P.apply(this,arguments)}var S=[a.ComponentCst.X_AXIS_COMPONENT,a.ComponentCst.Y_AXIS_COMPONENT,a.ComponentCst.ANGLE_AXIS_COMPONENT],w=s["default"].extend({vanChartType:"vanChart",initialize:function(t,e,i){this.wrapDom=e,this.width=u["default"].pick(t.width,u["default"].getDomWidth(e)),this.height=u["default"].pick(t.height,u["default"].getDomHeight(e)),this._plotZoom={x:1,y:1},this._plotOffset={x:0,y:0},this._eventsConfig={pinch:!0,pan:!0},this.vancharts=i,this.series=[],this.components={},this._targets={},this.animationCount=0,this._changeDataState=!1,this.fullScreenChart=null,this.setOptions(t),this._checkValidSize()&&this._init()},_init:function(){if(!this.__inited){this.__inited=!0;var t=this.wrapDom;this.isMobile()?this.isMobileFlow()?(this.handler=new c["default"](this,t),this.showTooltip=this.showTooltipMobileFlow):(this.handler=new f["default"](this,t),this.showTooltip=this.showTooltipMobile):this.handler=new f["default"](this,t),this._initDomLayout(this.wrapDom),this.update()}},setOptions:function(t){h["default"].setLocale(t.language),this.isMobileFlow()&&this._mutateOptions(t),t.series=t.series||[],t.series.forEach((function(t){t.data=t.data||[]})),this._mergeThemeConfig(t),(0,T.fixOptionsWithTheme)(this,t);var e=this.vancharts.autoFitScale||{};this._ganttResize||(0,x.autoFitOptions)(t,{_scale:e.scale,_fontScale:e.fontScale,_wScale:e.wScale,_hScale:e.hScale});var i=t.plotOptions;i.inverted&&t.dataSheet&&(t.dataSheet.enabled=!1),this.options=t,this.isLargeMode()&&n["default"].LARGE_CHART_TYPE[this.chartType()]&&(i.animation=!1,t.legend&&(t.legend.highlight=!1),t.rangeLegend&&(t.rangeLegend.highlight=!1)),(this.chartType()===n["default"].MULTI_CHARTS||this.isMap())&&Object.keys(n["default"].LARGE_CHART_TYPE).forEach((function(e){i[e]&&i[e].large&&(i.animation=!1,t.legend&&(t.legend.highlight=!1),t.rangeLegend&&(t.rangeLegend.highlight=!1))})),this.fullScreenChart&&this.fullScreenChart.setData(t)},_initDomLayout:function(t){this.dom=t,this.renderer=(0,m["default"])(t,this),this.renderer.onAdd(),this.on({animationStart:this._animationStart,animationEnd:this._animationEnd})},_animationStart:function(){this._animationStarted=!0,this.animationCount=0,this.removeMoreLabel(),this.series.forEach((function(t){t._removeDataLabels(),t._removeCateLabels&&t._removeCateLabels(),t.render()})),this.animationCount||this.fire("animationEnd")},onSeriesRendering:function(){return this._animationStarted},removeMoreLabel:function(){var t=this.getComponent(a.ComponentCst.MORELABEL_COMPONENT);t&&t.removeAllMoreLabels()},_animationEnd:function(){this.renderer&&(this._animationStarted=!1,this.series.forEach((function(t){t._animateEnd()})))},_removeChangeDataState:function(t){this._changeDataState&&(this._changeDataSeries=this._changeDataSeries||[],this._changeDataSeries.push(t),this._changeDataSeries.length>=this.series.length&&(this._changeDataState=!1,this._changeDataSeries=[]))},_needShowMoreLabel:function(){var t=this.options.moreLabel;return this._changeDataState&&t&&t.enabled&&!this.isLargeMode()},_clearMoreLabels:function(){this.series.forEach((function(t){t._clearMoreLabels()}))},_initIntermediateState:function(){if(this.colorMap={},this.orderMap={},this.cateMap={},this.scale=1,this.timeQueue=this.clearTimeQueue(),this.clipPool={},this.axisSize={left:0,right:0,bottom:0,top:0},this.layerMap=this.layerIndex=null,this.__contentBoundsInited=!1,this._plotZoom={x:1,y:1},this._plotOffset={x:0,y:0},this.isMobileFlow()){var t=this.getComponent(a.ComponentCst.PLOT_SCROLL);t&&(t.__inited=!1)}},_dealDuchampEmptyCss:function(t){window.duchamp&&t._emptyCss&&(t._emptyCss.indexOf(";width:")>-1?t._emptyCss=t._emptyCss.replace(/;width:\s*\d*px;/gi,";width:"+this.width+"px;"):t._emptyCss+="width:"+this.width+"px;",t._emptyCss.indexOf(";height:")>-1?t._emptyCss=t._emptyCss.replace(/;height:\s*\d*px;/gi,";height:"+this.height+"px;"):t._emptyCss+="height:"+this.height+"px;")},_resizeRenderer:function(){var t=this.wrapDom;if(this.width=u["default"].getDomWidth(t),this.height=u["default"].getDomHeight(t),this._size=new d["default"](this.width,this.height),this._dealDuchampEmptyCss(t),this._checkValidSize()){this._init(),this.clipPool={},this.axisSize={left:0,right:0,bottom:0,top:0},this.renderer&&this.renderer.resize(),this._canvasMap&&this._canvasMap.forEach((function(t){t.resize()})),this.isMap()&&(this.mapRenderer&&this.mapRenderer.resize(),this.markerRenderer&&this.markerRenderer.resize(),this._onResize(),this.components.geo.resize());var e=this.seriesOfType(n["default"].MULTIPIE_CHART)[0];e&&(e.chartInfo.radius=null);var i=this.getComponent(a.ComponentCst.MORELABEL_COMPONENT);i&&i.resize()}},refresh:function(t){if(t.__resizeRenderer&&this._resizeRenderer(),(0,y.isAutoRefreshChart)(t))this.autoRefresh(t);else{var e=this.components[a.ComponentCst.TOOLBAR_COMPONENT];if(e&&(e.remove(),this.components[a.ComponentCst.TOOLBAR_COMPONENT]=null,delete this.components[a.ComponentCst.TOOLBAR_COMPONENT]),this.setOptions(t),!this._checkValidSize())return;this.update()}},refreshRestore:function(){var t=this,e=t.components;S.forEach((function(i){e[i]&&t._restoreCategoryAxisBasedSeries(e[i])})),this.seriesOfType(n["default"].GAUGE_CHART).length==this.series.length&&this.series.sort((function(t,e){return t.index-e.index})),this.seriesOfType(n["default"].PIE_CHART).forEach((function(t){return t.orderData(null)}));var i=this.seriesOfType(n["default"].MULTIPIE_CHART);i.length&&i[0].orderData(null),this.update()},orderData:function(){var t=this,e=t.components;if(t.chartType()!==n["default"].BOX_CHART){S.forEach((function(i){e[i]&&t._orderCategoryAxisBasedSeries(e[i])})),t.chartType()===n["default"].RADAR_CHART&&[a.ComponentCst.POLAR_COMPONENT,a.ComponentCst.ANGLE_AXIS_COMPONENT,a.ComponentCst.RADIUS_AXIS_COMPONENT].forEach((function(t){t===a.ComponentCst.POLAR_COMPONENT?e[t]&&e[t].doLayout():e[t]&&e[t].orderLayout()}));var i=this.orderType==n["default"].ASCENDING,r=i?1:-1;this.seriesOfType(n["default"].GAUGE_CHART).length==this.series.length&&this.series.sort((function(t,e){return(t.getSeryTotalValue()-e.getSeryTotalValue())*r})),this.seriesOfType(n["default"].PIE_CHART).forEach((function(t){return t.orderData(i)}));var o=this.seriesOfType(n["default"].MULTIPIE_CHART);o&&o.length&&o[0].orderData(i),this.reRenderSeries(),S.concat([a.ComponentCst.ZOOM_COMPONENT,a.ComponentCst.DATA_SHEET_COMPONENT,a.ComponentCst.POLAR_COMPONENT]).forEach((function(t){e[t]&&e[t].render()}))}},_restoreCategoryAxisBasedSeries:function(t){for(var e=0,i=t.getAxisCount();e<i;e++){var n=t.getAxis(e),a=n.series;if(n._isBaseAxis()&&n.isCategory()&&this.orderMap&&Object.keys(this.orderMap).length){var r=this.orderMap[n.componentType][e],o={};r.forEach((function(t,e){o[t]=e}));for(var s=n._dataDomain,l=0,h=a.length;l<h;l++){var d=[],c=a[l],f=!0;c.points.forEach((function(t){d[u["default"].indexOf(s,t.getCategory())]=t.graphic,t.graphic||(f=!1)})),c.points.forEach((function(t){t.graphic=f?d[o[t.getCategory()]]:t.graphic,c.updatePointGraphic(t)}))}}}},_orderCategoryAxisBasedSeries:function(t){for(var e=this.orderType==n["default"].ASCENDING?1:-1,i=0,a=t.getAxisCount();i<a;i++){var r=t.getAxis(i);this.orderMap[r.componentType]=this.orderMap[r.componentType]||[],this.orderMap[r.componentType][i]||(this.orderMap[r.componentType][i]=r._dataDomain);var o,s,l=[],h={},d=[];if(r._isBaseAxis()&&r.isCategory()){o=r.series,s=o[0].points,r.isMultiCateAxis&&r.isMultiCateAxis()?function(){for(var t=[],i=-1;++i<s.length;){var n=s[i],a=0;n.points.forEach((function(t){t.visible&&t.series.visible&&(a+=t.getTargetValue())}));var r=n.options.categoryArray,o=u["default"].encodeCategoryArray(r.slice(0,r.length-1)),c={key:o,cate:u["default"].encodeCategoryArray(r),value:a};null==l[o]?l[o]=t.push([c])-1:t[l[o]].push(c)}t.forEach((function(t){t.sort((function(t,i){return(t.value-i.value)*e}))}));var f=0;t.forEach((function(t){t.forEach((function(t){h[t.cate]=f,d.push(t.cate),f++}))}))}():function(){for(var t=0,i=s.length;t<i;t++){var n=s[t],a=0;n.points.forEach((function(t){t.visible&&t.series.visible&&(a+=t.getTargetValue())})),l.push({key:n.category,value:a})}l.sort((function(t,i){return(t.value-i.value)*e})),l.forEach((function(t,e){h[t.key]=e,d.push(t.key)}))}();for(var c=r.getOriginalCategories(),f=0,p=o.length;f<p;f++){var g=[],m=o[f],v=!0;m.points.forEach((function(t){g[u["default"].indexOf(c,t.getCategory())]=t.graphic,t.graphic||(v=!1)})),m.points.forEach((function(t){t.graphic=v?g[h[t.getCategory()]]:t.graphic,m.updatePointGraphic(t)}))}r.setCategories(d)}}},addSeries:function(t){var e=t.type,i=this.options,n=(0,p["default"])(i),a=n[e].plotOptions;l["default"].merge(i,n[e].options,!1),i.plotOptions[e]?i.plotOptions[e]=l["default"].merge(i.plotOptions[e],a,!1):i.plotOptions=l["default"].merge(i.plotOptions,a,!1),i.series.push(t)},_checkValidSize:function(){return this.width&&this.height},autoRefresh:function(t){this.isMobileFlow()&&this._mutateOptions(t),this._mergeThemeConfig(t),(0,T.fixOptionsWithTheme)(this,t);var e=this.vancharts.autoFitScale||{};(0,x.autoFitOptions)(t,{_scale:e.scale,_fontScale:e.fontScale,_wScale:e.wScale,_hScale:e.hScale});var i=(0,A["default"])(this.options,t);if(this._checkValidSize()){var a=i.add||[],r=i.remove||[],o=i.update||[],s=i.option||{},h=i.isChange||!1,d=this,c=d.options,f=c.chartType;if(h){this._addData=a,this._removeData=r,this._updateData=o;var p={};this.series.forEach((function(t){var e=t.getKey(),i=p[e];i?i.push(t):(i=[t],p[e]=i)})),r.forEach((function(t,e){var i=C["default"].getSeriesKey(t,c),n=p[i],a=n&&n.length?n[0]:null;a&&(t.data&&t.data.forEach((function(t){var e=a.calculatePointIndex(t);(0,v.hasDefined)(e)&&a.removePoint(e,!1)})),d._removeAllAndHasNoAdd(a.options,e)&&n&&n.splice(0,1))})),a.forEach((function(e,i){var n=C["default"].getSeriesKey(e,t),a=p[n],r=a&&a.length?a[0]:null;r?e.data.forEach((function(t){r.addPoint(t)})):d.addSeries(e)})),o.forEach((function(e,i){var n=C["default"].getSeriesKey(e,t),a=p[n],r=a&&a.length?a[0]:null;r&&(r.updateSeries(e),e.data.forEach((function(t){var e=r.calculatePointIndex(t);(0,v.hasDefined)(e)&&r.updatePoint(e,t,!1)})))}));var g=i.changeSeriesKeyOrder||[];g.length>0&&c.series.sort((function(t,e){return u["default"].indexOf(g,C["default"].getSeriesKey(t,c))-u["default"].indexOf(g,C["default"].getSeriesKey(e,c))}));var m=i.changeCategoryKeyOrder||[];if(c.series.forEach((function(t,e){var i=t.type||f,n=m[e]||[],a=t.data||[];n.length>0&&a.sort((function(t,e){return u["default"].indexOf(n,C["default"].getPointKey(t,i))-u["default"].indexOf(n,C["default"].getPointKey(e,i))}))})),window.duchamp?this.options=t:l["default"].merge(this.options,s,!0),this.isGauge()&&(this._dealGaugeAxisOpt(t),this.options.gaugeAxis=t.gaugeAxis),this.isMap()&&(this.options.xAxis=this.options.yAxis=this.options.zoom=undefined),this.autoRefreshRender(),this.fullScreenChart){var _=u["default"].clone(t);this.fullScreenChart.charts[0].autoRefresh(_)}this.fire(n["default"].AUTO_REFRESH)}else this._changeDataState=!1}},_removeAllAndHasNoAdd:function(t,e){if(0===t.data.length){for(var i=this.options,n=(i.chartType,C["default"].getSeriesKey(t,i)),a=this._addData,r=0,o=a.length;r<o;r++){var s=a[r];if(C["default"].getSeriesKey(s,i)===n)return!1}return!0}return!1},autoRefreshRender:function(){this._changeDataState&&(this._changeDataSeries=[]),this._changeDataState=!0,this.update()},update:function(){this.fire("update"),this._initIntermediateState();for(var t,e,i=this.options,o=this,s=i.series,l=i.chartType,u=(0,a.getComponents)(),h=0,d=a.ComponentsOrder.length;h<d;h++){if(e=u[t=a.ComponentsOrder[h]],t==a.ComponentCst.RANGE_LEGEND_COMPONENT&&i[t]){var c=i[t].continuous?a.ComponentCst.GradientRangeLegend:a.ComponentCst.INTERVAL_RANGE_LEGEND;this.components[t]&&this.components[t].type!=c&&(this.components[t].remove(),this.components[t]=null,delete this.components[t]),e=(0,a.getComponent)(c)}if(e){var f=i[t]&&((0,v.hasNotDefined)(i[t].enabled)||i[t].enabled);f||t!=a.ComponentCst.TOOLBAR_COMPONENT||(f=!0,i[t]={enabled:!0,hidden:!1}),i[t]&&f?this.components[t]?this.components[t].refresh(i[t],o):this.components[t]=new e(i[t],t,o):this.components[t]&&(this.components[t].remove(),this.components[t]=null,delete this.components[t])}}var p,g,m={},_=[];for(var y in o.series.forEach((function(t){p=t.getKey();var e=m[p];e?e.push(t):(e=[t],m[p]=e)})),s.forEach((function(t,e){g=t.type||l;var a=(0,r["default"])(g);if(g==n["default"].GAUGE_CHART){var s=t.style||i.plotOptions.style;a=(0,r["default"])(s)}else if(g==n["default"].RADAR_CHART){var u=t.columnType||i.plotOptions.columnType;u=u?n["default"].COLUMN_RADAR:n["default"].LINE_RADAR,a=(0,r["default"])(u)}p=C["default"].getSeriesKey(t,o.options);var h=m[p],d=h&&h.length?h[0]:null;d=d?d.refresh(t,e):new a(t,o,e),_.push(d),h&&h.splice(0,1)})),m){var A=m[y];A&&A.forEach((function(t){t&&t.remove()}))}o.series=_;var T=this.components[a.ComponentCst.GAUGE_AXIS_COMPONENT];T&&T.initAttributesWithSeries();var x=this.components[a.ComponentCst.RANGE_LEGEND_COMPONENT];x&&x.initAttributesWithSeries(),_.forEach((function(t){if(t.type!==n["default"].LINE_MAP||!t.options.large)for(var e=0,i=t.points.length;e<i;e++)t.points[e].refreshPointColor()})),o.layoutComponentsAndCharts(),this.isMobileFlow()&&this.checkCrossLineFlag()},layoutComponentsAndCharts:function(){this.hoverPoint=this.hoverSeries=null,o["default"].PLANE_SYSTEM_LAYOUT(this),this.render()},_getDefaultBounds:function(){var t=this.options&&this.options.padding||this.chartType()===n["default"].TREEMAP_CHART?0:4;return t=(this.options&&this.options.borderWidth||0)+t,u["default"].makeBounds(t,t,Math.max(this.width-2*t,0),Math.max(this.height-2*t,0))},reRenderWholePlot:function(){o["default"].calculateSeries(this),o["default"].reLayoutPlotBounds(this),o["default"].calculateSeriesShapes(this),this.render()},dealAxisZoom:function(t,e){var i=this.options.zoom.zoomType,n=this.components.xAxis,a=this.components.yAxis;n&&-1!==i.indexOf("x")&&n.axisZoom(t,e),a&&-1!==i.indexOf("y")&&a.axisZoom(t,e),this.reRenderWholePlot()},reCalcValueAxisDataDomain:function(t){for(var e=t===a.ComponentCst.X_AXIS_COMPONENT?a.ComponentCst.Y_AXIS_COMPONENT:a.ComponentCst.X_AXIS_COMPONENT,i=this.components[e]._axisList,n=-1;++n<i.length;)i[n].calculateDomainFromData(undefined,!0)},clearAllEffects:function(){this.series.forEach((function(t){t.points.forEach((function(e){t.clearPointEffect(e)}))}))},drawAllEffects:function(){this.series.forEach((function(t){t._drawEffectPoints()}))},_calculateZoomParas:function(t,e){var i=this.bounds,n=Math.min(t.x,e.x)-i.x,a=Math.min(t.y,e.y)-i.y,r=Math.abs(t.x-e.x),o=Math.abs(t.y-e.y),s=Math.min(i.width/r,i.height/o),l=i.width/s,u=i.height/s;return{bounds:i,shiftX:(i.width-l)/2-n,shiftY:(i.height-u)/2-a,scale:s}},_dealGaugeAxisOpt:function(t){if(t.chartType===n["default"].GAUGE_CHART)return this._expandGaugeAxisOpt(t);for(var e=t.series,i=t.gaugeAxis,a=u["default"].isArray(i)?i:[i],r=0;r<e.length;r++){var o=e[r];if(o.type===n["default"].GAUGE_CHART&&-1===o.style.indexOf("pointer")){var s=a[o.gaugeAxis||0],l=o.data[0].target;(0,v.hasDefined)(l)&&"-"!==l&&(s.max=+l)}}t.gaugeAxis=a},_expandGaugeAxisOpt:function(t){var e=t.series,i=t.gaugeAxis,n=[];-1===t.plotOptions.style.indexOf("pointer")&&(e.forEach((function(t,e){var a=t.data[0].target,r=u["default"].clone(u["default"].isArray(i)?P({},i[0]):P({},i));(0,v.hasDefined)(a)&&"-"!==a&&(r.max=+a),t.gaugeAxis=e,n.push(r)})),t.gaugeAxis=n)},_mergeThemeConfig:function(t){var e=(0,p["default"])(t),i={};t.series.forEach((function(a){var r=a.type||t.chartType,o=e[r].plotOptions;if(r==n["default"].GAUGE_CHART){var s=a.style||t.plotOptions.gauge&&t.plotOptions.gauge.style||t.plotOptions.style;s="pointer_semi"==s?"pointer":s,o=e.gauge[s];["seriesLabel","valueLabel","percentageLabel"].forEach((function(t){(0,v.hasDefined)(a[t])&&l["default"].merge(a[t],o[t],!1)}))}i[r]||(i[r]=!0,l["default"].merge(t,e[r].options,!1),t.plotOptions[r]?t.plotOptions[r]=l["default"].merge(t.plotOptions[r],o,!1):t.plotOptions=l["default"].merge(t.plotOptions,o,!1))})),t.gaugeAxis&&this._dealGaugeAxisOpt(t),this.isMap()&&(t.xAxis=t.yAxis=t.zoom=undefined,u["default"].extend(t,e.MAP_CONFIG)),t.chartType==n["default"].RADAR_CHART&&(t.polar=t.polar||{}),t.tooltip=t.tooltip||{},t.colors&&0==t.colors.length&&(t.colors=(0,p.DEFAULT_COLORS)())},getChartMinMaxValue:function(){var t=Number.MAX_VALUE,e=-t,i=[];return this.series.forEach((function(t){return i=i.concat(t.points)})),(this.isMap()?(0,_.mapPointsWithRangeLegend)(this.getCurrentGeo(),this.series):i).filter((function(t){var e=(t.series.type===n["default"].BUBBLE_CHART||t.series.type===n["default"].FORCE_BUBBLE_CHART)&&!t.series.options.displayNegative,i=t.getTargetValue();return!(t.isNull||isNaN(i)||e&&i<0)})).forEach((function(i){var n=i.getTargetValue();e=Math.max(e,n),t=Math.min(t,n)})),t>e&&(t=0,e=100),[t,e]},getParentDom:function(){return this.dom},getDivParentDom:function(){return this.wrapDom},isInverted:function(){return!!this.options.plotOptions.inverted},setPlotBounds:function(t){this.bounds=t},getPlotClipBounds:function(){var t=0,e=0,i=this.bounds.width,n=this.bounds.height,a=[],r=0;return this.components.xAxis&&(a=a.concat(this.components.xAxis._axisList)),this.components.yAxis&&(a=a.concat(this.components.yAxis._axisList)),a.forEach((function(t){t.isPlotRangeWithMarker()&&(r=t.getPlotRangePadding())})),this.isInverted()?(e-=r,n+=2*r):(t-=r,i+=2*r),{x:t+this.bounds.x,y:e+this.bounds.y,width:Math.max(i+1,0),height:Math.max(n+1,0)}},getChartBounds:function(){return u["default"].makeBounds(0,0,this.width,this.height)},xAxis:function(t){t||(t=0);var e=this.components.xAxis;return e?e.getAxis(t):null},yAxis:function(t){t||(t=0);var e=this.components.yAxis;return e?e.getAxis(t):null},baseAxis:function(){return this.chartType()===n["default"].BAR_CHART?this.yAxis():this.xAxis()},polar:function(t){t||(t=0);var e=this.components.polar;return e?e.getAxis(t):null},angleAxis:function(t){t||(t=0);var e=this.components.angleAxis;return e?e.getAxis(t):null},radiusAxis:function(t){t||(t=0);var e=this.components.radiusAxis;return e?e.getAxis(t):null},gaugeAxis:function(t){t||(t=0);var e=this.components.gaugeAxis;return e?e.getAxis(t):null},getSharedAxis:function(){for(var t=[this.xAxis(),this.yAxis(),this.angleAxis()],e=0;e<t.length;e++){var i=t[e];if(i&&i.isCategory())return i}return null},getComponent:function(t){return this.components[t]},setComponent:function(t,e){this.components[e]=t},getDefaultSeriesColor:function(t){if(t+="",!this.colorMap[t]){var e=this.options.colors,i=0;for(var n in this.colorMap)++i;this.colorMap[t]=e[i%e.length]}return this.colorMap[t]},registerPointsPara:function(t){if((0,v.hasDefined)(t.category)){var e=this.cateMap,i=t.getCategory();return e[i]=e[i]||[],e[i].push(t),e[i]}},getValidPointsPara:function(t){return(this.cateMap[t]||[]).filter((function(t){return t.isVisible()&&t.options.tooltip&&t.options.tooltip.shared}))},getSharedPoints:function(t){var e=this.cateMap[t]||[];return e&&e.length?e.filter((function(t){return t.options.tooltip&&t.options.tooltip.shared})):[]},showSharedTooltip:function(t,e){if(t){var i=this,n=i.getValidPointsPara(t.getCategory()).reduce((function(t,e){return t?Math.abs(e.getTargetValue())>Math.abs(t.getTargetValue())?e:t:e}),0);i.showTooltip(n,e,i.getSharedPoints(t.getCategory())[0])}},showTooltip:u["default"].emptyFn,_showTooltip:function(t,e,i){var n;if(null==(n=this.handler)||!n.selectRect){var r=this.components[a.ComponentCst.TOOLTIP_COMPONENT];r&&r.showWithPoint(t,e,i)}},showTooltipMobile:function(){this._showTooltip.apply(this,arguments);var t=this,e=arguments[1];this.setTimeout("mobileTooltip",(function(){t.handler.removeAllChosen(e)}),4e3)},showTooltipMobileFlow:function(t,e,i){var n=this.components[a.ComponentCst.TOOLTIP_COMPONENT],r=n&&n.getMobileTextArray(t,e,i);this.__tooltipText=r},hideTooltip:function(){this.hoverPoint=null;var t=this.components[a.ComponentCst.TOOLTIP_COMPONENT];t&&t.hide()},showToolbarTooltip:function(t,e){var i=this.components[a.ComponentCst.TOOLTIP_COMPONENT];i&&i.showWithToolbarIcon(t,e)},set:function(t){"enable"in t&&this.handler&&(t.enable?this.handler.hammer.set({enable:!0}):(this.handler.hammer.set({enable:!1}),this.handler.removeAllChosen({containerPoint:{x:0,y:0}})))},isGauge:function(){return this.options.chartType===n["default"].GAUGE_CHART||this.options.chartType===n["default"].MULTI_CHARTS&&this.options.series.some((function(t){return t.type===n["default"].GAUGE_CHART}))},isMap:function(){return"vanChartMap"==this.vanChartType},chartType:function(){return this.options.chartType},isPointOrAreaOrHeatMap:function(){return this.options.chartType===n["default"].AREA_MAP||this.options.chartType===n["default"].POINT_MAP||this.options.chartType===n["default"].HEAT_MAP},isHeatMap:function(){return this.options.chartType==n["default"].HEAT_MAP},isAreaMap:function(){return this.options.chartType==n["default"].AREA_MAP},isForceBubble:function(){return"vanChartForceBubble"==this.vanChartType},isLargeMode:function(){var t=!1;return this.series&&this.series.length&&this.series.forEach((function(e){t=!!e.options.large||t})),t=!!this.options.plotOptions.large||t},hasRangeLegend:function(){return!!this.components[a.ComponentCst.RANGE_LEGEND_COMPONENT]},seriesOfType:function(t){return(0,y.seriesOfType)(this.series,t)},pointsOfType:function(t){var e=[];return this.series.forEach((function(i){i.type==t&&(e=e.concat(i.points))})),e},setTimeout:function(t,e,i){this.timeQueue[t]&&window.clearTimeout(this.timeQueue[t]),i?this.timeQueue[t]=window.setTimeout(e,i):(e&&e(),this.timeQueue[t]=null)},clearTimeQueue:function(){var t=this.timeQueue||{};return Object.keys(t).map((function(e){window.clearTimeout(t[e])})),{}},getSize:function(){return this._size&&!this._sizeChanged||(this._size=new d["default"](this.width,this.height),this._sizeChanged=!1),this._size.clone()},isZoomingWithLargeModel:function(){var t,e=0,i=this.options.series;for(t=-1;++t<i.length;)e+=i[t].data.length;return e>100&&this._zooming}});w.include({render:function(){if(this.vancharts.endLoading(),this.emptyDataRender&&this.emptyDataRender.remove(),this._isEmptyDataChart())this._showEmptyDataTip();else{var t=this,e=this.renderer;e.isRemoved()&&e.onAdd();var i=this.getPlotClipBounds();this.plotClip?e.updateClip(this.plotClip,i):this.plotClip=e.createClip(i),["backGroup","clipSeriesGroup","seriesGroup","seriesTextRenderGroup","frontGroup"].forEach(n),this.isMobileFlow()&&(n("crossLineGroup"),t.seriesTextRenderGroup.attr({"pointer-events":"none","touch-action":"none"}),t.frontGroup.attr({"pointer-events":"none","touch-action":"none"}),t.crossLineGroup.attr({"pointer-events":"none","touch-action":"none"}),n("crossLineGroup"),this.isMap()||e.clip(t.crossLineGroup,t.plotClip)),e.clip(t.clipSeriesGroup,t.plotClip),e.clip(t.seriesTextRenderGroup,t.plotClip),this._addDivClipGroup(i),this._renderBackground(),this.renderComponents(),this.renderSeries()}function n(i){t[i]||(t[i]=e.group().addClass(i).add(),t.isMap()&&t[i].addClass("map-component"))}},_addDivClipGroup:function(t){var e=this;e.seriesTextDivGroup||(e.seriesTextDivGroup=this.renderer.div().add()),e.seriesTextDivGroup.style({clip:"rect("+[t.y,t.x+t.width,t.y+t.height,t.x].join("px ")+"px)"})},_renderBackground:function(){var t=u["default"].makeBounds(0,0,this.width,this.height),e=this.bounds,i=this.options,n=this.renderer,a={backgroundColor:this.vancharts.fullScreenFather?u["default"].getFullScreenBackgroundColor(i.backgroundColor):i.backgroundColor,backgroundImage:i.backgroundImage,borderColor:i.borderColor,borderWidth:i.borderWidth,borderRadius:i.borderRadius||0,shadow:i.shadow},r={backgroundColor:i.plotBackgroundColor,backgroundImage:i.plotBackgroundImage,borderRadius:i.plotBorderRadius||0,shadow:i.plotShadow},o={borderWidth:i.plotBorderWidth,borderColor:i.plotBorderColor,borderRadius:i.plotBorderRadius||0};a.shadow&&(t.x+=b.BACKGROUND_SHADOW_FILTER.deviation,t.y+=b.BACKGROUND_SHADOW_FILTER.deviation,t.width-=2*b.BACKGROUND_SHADOW_FILTER.deviation,t.height-=2*b.BACKGROUND_SHADOW_FILTER.deviation),a.backgroundColor||a.backgroundImage||a.borderColor?this.chartBackgroundGroup=this.chartBackgroundGroup||n.group().addTo(this.backGroup):this.chartBackgroundGroup&&(this.chartBackgroundGroup.remove(),this.chartBackgroundGroup=null),r.backgroundColor||r.backgroundImage?this.plotBackgroundGroup=this.plotBackgroundGroup||this.renderer.group().addTo(this.backGroup):this.plotBackgroundGroup&&(this.plotBackgroundGroup.remove(),this.plotBackgroundGroup=null),o.borderWidth?this.plotBackgroundBorder=this.plotBackgroundBorder||this.renderer.rect().addTo(this.frontGroup):this.plotBackgroundBorder&&(this.plotBackgroundBorder.remove(),this.plotBackgroundBorder=null),i.geo||(0,b.renderRectangleBackground)(this.chartBackgroundGroup,a,t,n),(0,b.renderRectangleBackground)(this.plotBackgroundGroup,r,e,n),this._renderPlotBackgroundBorder(this.plotBackgroundBorder,o,e)},renderComponents:function(){var t=this;a.ComponentsRenderOrder.forEach((function(e){(0,v.hasDefined)(t.components[e])&&(e===a.ComponentCst.POLAR_COMPONENT?t.components[e]._axisList.forEach((function(t){var e,i;0===(null==(e=t.radiusAxis)?void 0:e.series.length)&&t.radiusAxis.remove(),0===(null==(i=t.angleAxis)?void 0:i.series.length)&&t.angleAxis.remove()})):t.components[e].render())}));var e=this,i=e.renderer;!e.highlightGroup&&e.plotClip&&i.clip(e.highlightGroup=i.group().addTo(e.backGroup),e.plotClip)},renderSeries:function(){var t=this.components[a.ComponentCst.TOOLTIP_COMPONENT];t&&t.immediateHide(),this.clearAllEffects();var e=this.getSharedAxis();e&&e.removeHighlightBackground&&e.removeHighlightBackground(),this.fire("animationStart"),this._renderTrendLine()},_isEmptyDataChart:function(){return!this.isMap()&&0===this.series.length},_showEmptyDataTip:function(){var t=this.getComponent(a.ComponentCst.TOOLTIP_COMPONENT);t&&t.immediateHide(),this.renderer&&this.renderer.remove(),this.emptyDataRender=(0,g["default"])({dom:this.wrapDom,emptyDataTip:this.options.emptyDataTip,chartWidth:this.width,chartHeight:this.height,chart:this})},_renderPlotBackgroundBorder:function(t,e,i){if(null!=t){var n=P({},i,{rx:e.borderRadius,ry:e.borderRadius});t.attr(n).style({fill:"none",stroke:e.borderColor,"stroke-width":e.borderWidth})}},filterRender:function(){for(var t=0,e=this.series.length;t<e;t++)this.series[t].filterRender()},cancelLegendHighlight:function(t){var e=this.getComponent(a.ComponentCst.LEGEND_COMPONENT);(e=e||this.getComponent(a.ComponentCst.RANGE_LEGEND_COMPONENT))&&e.highlighted&&!u["default"].containsPoint(e.bounds,t)&&(e.highlighted=!1,this.highlightTarget=null,this._updateSeriesStyle(),this._updateLegendStyle(),this._updateTrendLineStyle())},makeLegendHighlight:function(t){this.highlightTarget=t,this._updateSeriesStyle(),this._updateLegendStyle(),this._updateTrendLineStyle()},_updateLegendStyle:function(){(this.getComponent(a.ComponentCst.LEGEND_COMPONENT)||this.getComponent(a.ComponentCst.RANGE_LEGEND_COMPONENT)).items.forEach((function(t){t.updateLegendItemGraphicStyle()}))},_updateTrendLineStyle:function(){var t=this.highlightTarget,e=this.trendLines,i=this.trendLineGroup&&this.trendLineGroup.trendLines;if(e&&i)for(var a=0;a<e.length;a++){var r=e[a],o={d:r.d},s=r.trendLine.opacity,l=null==t||r.bindName===t?s:n["default"].HOVER_OPACITY;i[a].attr(o).style({"stroke-opacity":l})}},_updateSeriesStyle:function(){this.series.forEach((function(t){t.isSupportLegendHighlight()&&(t.useCanvas()?t._canvasRender():(t.drawSeries&&t.drawSeries(),t.getDataToDraw().filter((function(t){return t.isVisible()})).forEach((function(e){t._updatePointGraphicStyle(e)})),t.points&&t.points.forEach((function(e){e.hasValidDataLabel()&&t._updatePointLabelStyle(e)}))))}))},reRenderSeries:function(){o["default"].calculateSeries(this,!0),o["default"].calculateSeriesShapes(this),this.renderSeries()},removePointGraphics:function(t){var e=this;t&&t.children&&t.children.forEach((function(t){e.removePointGraphics(t)})),t&&t.remove(),t=null},registerInteractiveTarget:function(t,e){e&&(this._targets[u["default"].stamp(e.node())]=t),this.activeDataEvents(t)},activeDataEvents:function(t){t._events=null,t.getEvents&&t.on(t.getEvents(),t)},removeInteractiveTarget:function(t,e){e&&e.node()&&(this._targets[u["default"].stamp(e.node())]=null,delete this._targets[u["default"].stamp(e.node())]),t&&(t._events=null)},findInteractiveTarget:function(t){return this._targets[u["default"].stamp(t)]},addCanvasRendererForResize:function(t){this._canvasMap=this._canvasMap||[],this._canvasMap.push(t)},resize:function(){this._resizeRenderer(),(0,y.isDrillDownChart)(this.options)?this.drillMapResize():this.update(),this.isMobileFlow()&&this.flowResize(),this.fullScreenChart&&this.fullScreenChart.resize()},remove:function(){var t;this._animationStarted=!1,this.__inited=!1,this.force&&this.force.endTick(null).stop(),this.force=null,this.clearAllEffects(),this.clearTimeQueue(),this.renderer&&this.renderer.remove(),this.handler&&this.handler.destroy(),null==(t=this.autoTooltipController)||t.destroy();var e=this.getComponent(a.ComponentCst.TOOLTIP_COMPONENT);e&&e.remove();var i=this.getComponent(a.ComponentCst.MORELABEL_COMPONENT);i&&i.remove(),this.series&&this.series.forEach((function(t){t&&t.remove&&t.remove()})),this.emptyDataRender&&this.emptyDataRender.remove(),this.mainRenderer&&this.mainRenderer.remove(),this.markerRenderer&&this.markerRenderer.remove(),this.animationRenderer&&this.animationRenderer.remove(),this.emptyDataRender=null,this.mainRenderer=null,this.markerRenderer=null,this.animationRenderer=null,this.largeSeries&&Object.keys(this.largeSeries).map((function(t){this.largeSeries[t]._canvas&&this.largeSeries[t]._canvas.remove(),this.largeSeries[t]=null}),this),this.largeSeries=null,this.renderer=this.handler=this.plotClip=this.chartBackgroundGroup=this.trendLineGroup=this.seriesGroup=this.clipSeriesGroup=this.seriesTextRenderGroup=this.seriesTextDivGroup=null,this._animatingZoom=!1,this.validPoints=[]},canFireNativePanMove:function(){return!0},isMobile:function(){var t=this.options;return t&&null!=t.mobile?t.mobile:u["default"].hasTouch()},showTooltip:function(){this._showTooltip.apply(this,arguments)},isDarkTheme:function(){return this.options.theme===n["default"].DARK},useCanvas:u["default"].falseFn});var E=w;e["default"]=E},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n={PADDING:4,WEEKEND_COLOR:"rgba(169, 195, 200, 0.1)",THUMB_WIDTH:14,THUMB_FILTER:{dx:0,dy:0,opacity:.15,deviation:3,r:0,g:0,b:0},SLIDER_STYLE:{fill:"#8E8E8E","fill-opacity":.7,height:4,rx:3,ry:3},SLIDER_BACKGROUND_WIDTH:[18,120],SLIDER_BACKGROUND_STYLE:{fill:"#9D9D9D","fill-opacity":.2,height:4,rx:3,ry:3},MINUS_PATH:{size:[24,24],graphic:{cursor:"pointer",fill:"#8E8E8E","fill-opacity":.7,d:"M19,13 L19,11 L5,11 L5,13Z"}},PLUS_PATH:{size:[24,24],graphic:{cursor:"pointer",fill:"#8E8E8E","fill-opacity":.7,d:"M13,5 L13,11 L19,11 L19,13 L13,13 L13,19 L11,19 L11,13 L5,13 L5,11 L11,11 L11,5 L13,5 Z"}},MOUSE_EVENT_PATH:{size:[24,24],graphic:{cursor:"pointer",fill:"#FFFFFF","fill-opacity":0,d:"M0,0 L0,24 L24,24 L24,0 L0,0Z"}},AXIS_BORDER:{fill:"none","stroke-width":1,"stroke-opacity":.6},CONTENT_BORDER:{fill:"none","stroke-width":.5,"stroke-opacity":.4},CURRENT_TIME:new Date,MARKING_LINE:{textColor:"rgb(255,255,255)",textBorderMargin:4,textBorderRadius:4,strokeWidth:3}};e["default"]=n},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n,a=(n=i(20))&&n.__esModule?n:{"default":n};var r=function(t,e){if(t)for(var i=e?[t,e]:t,n=0,a=i.length;n<a;n++)this.extend(i[n])};r.prototype={extend:function(t){var e,i,n=this._southWest,o=this._northEast;if(t instanceof a["default"])e=t,i=t;else{if(!(t instanceof r))return t?this.extend(a["default"].create(t)||r.create(t)):this;if(e=t._southWest,i=t._northEast,!e||!i)return this}return n||o?(n.lat=Math.min(e.lat,n.lat),n.lng=Math.min(e.lng,n.lng),o.lat=Math.max(i.lat,o.lat),o.lng=Math.max(i.lng,o.lng)):(this._southWest=new a["default"](e.lat,e.lng),this._northEast=new a["default"](i.lat,i.lng)),this},pad:function(t){var e=this._southWest,i=this._northEast,n=Math.abs(e.lat-i.lat)*t,o=Math.abs(e.lng-i.lng)*t;return new r(new a["default"](e.lat-n,e.lng-o),new a["default"](i.lat+n,i.lng+o))},getCenter:function(){return new a["default"]((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new a["default"](this.getNorth(),this.getWest())},getSouthEast:function(){return new a["default"](this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(t){t="number"==typeof t[0]||t instanceof a["default"]?a["default"].create(t):r.create(t);var e,i,n=this._southWest,o=this._northEast;return t instanceof r?(e=t.getSouthWest(),i=t.getNorthEast()):e=i=t,e.lat>=n.lat&&i.lat<=o.lat&&e.lng>=n.lng&&i.lng<=o.lng},intersects:function(t){t=r.create(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),a=t.getNorthEast(),o=a.lat>=e.lat&&n.lat<=i.lat,s=a.lng>=e.lng&&n.lng<=i.lng;return o&&s},overlaps:function(t){t=r.create(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),a=t.getNorthEast(),o=a.lat>e.lat&&n.lat<i.lat,s=a.lng>e.lng&&n.lng<i.lng;return o&&s},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(t){return!!t&&(t=r.create(t),this._southWest.equals(t.getSouthWest())&&this._northEast.equals(t.getNorthEast()))},isValid:function(){return!(!this._southWest||!this._northEast)},isSame:function(){var t=this._southWest,e=this._northEast;return t.lat===e.lat&&t.lng===e.lng}},r.create=function(t,e){return t instanceof r?t:new r(t,e)};var o=r;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;function n(t,e){if(this._=Object.create(null),t){var i=this;if(t instanceof n)t.forEach((function(t,e){i.set(t,e)}));else if(Array.isArray(t)){var a,r=-1,o=t.length;if(1===arguments.length)for(;++r<o;)i.set(r,t[r]);else for(;++r<o;)i.set(e.call(t,a=t[r],r),a)}else for(var s in t)i.set(s,t[s])}}function a(t){return"__proto__"==(t+="")||"\0"===t[0]?"\0"+t:t}function r(t){return"\0"===(t+="")[0]?t.slice(1):t}n.prototype={has:function(t){return a(t)in this._},get:function(t){return this._[a(t)]},set:function(t,e){return this._[a(t)]=e},remove:function(t){return(t=a(t))in this._&&delete this._[t]},keys:function(){var t=[];for(var e in this._)t.push(r(e));return t},values:function(){var t=[];for(var e in this._)t.push(this._[e]);return t},entries:function(){var t=[];for(var e in this._)t.push({key:r(e),value:this._[e]});return t},size:function(){var t=0;for(var e in this._)++t;return t},empty:function(){for(var t in this._)return!1;return!0},forEach:function(t){for(var e in this._)t.call(this,r(e),this._[e])}};var o=n;e["default"]=o},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Y=e.X=e.VALUE=e.TO=e.TARGET_VALUE=e.SUMMARY_VALUE=e.STARTTIME=e.SIZE=e.SERIES=e.PROGRESS=e.PROCESSES=e.PERCENT=e.NAME=e.LEVEL=e.FROM=e.FINISHTIME=e.DURATION=e.DESCRIPTION=e.DATA_Q3=e.DATA_Q1=e.DATA_OUTLIER=e.DATA_NUMBER=e.DATA_MIN=e.DATA_MEDIAN=e.DATA_MAX=e.CATEGORY=e.ARRIVALRATE=void 0,e.calculateTextDim=function(t,e){if(t&&(t.nameLabelContent||t.valueLabelContent)&&"funnel"==e.series.type)return function(t,e){var i=0,n=0,a=0;if(e.nameLabelContent){i+=(r=e.nameLabelContent.dim).width,n=Math.max(n,r.height)}if(e.valueLabelContent){var r;i+=(r=e.valueLabelContent.dim).width,n=Math.max(n,r.height)}if(e.nameLabelContent&&e.valueLabelContent){i+=a=.02*t.series.vanchart.bounds.width}return{width:i,height:n,nameValueGap:a}}(e,t);var i=0,n=0;if(t&&t.length){for(var a=0,r=t.length;a<r;a++){var o=t[a].dim;i=Math.max(i,o.width),n+=o.height}n+=2*(r-1)}return{width:i,height:n}},e.getXYSizeString=function(t,e,i){var r=t.options,o=n["default"].format(r.x,e.XFormat),h=n["default"].format(r.y,e.YFormat),d="-"==r.size?"-":n["default"].format(r.size,e.sizeFormat),c="";-1==i.indexOf(s)&&-1==i.indexOf(l)||(c="(",-1!=i.indexOf(s)?(c+=o,-1!=i.indexOf(l)&&(c=c+","+h),c+=")"):(c+=h,c+=")"),c+=a["default"].BLANK_VALUE_PERCENTAGE);-1!=i.indexOf(u)&&"-"!=d&&(c+=d);return c},e.propMap=void 0;var n=r(i(0)),a=r(i(1));function r(t){return t&&t.__esModule?t:{"default":t}}var o="{SERIES}";e.SERIES=o;e.CATEGORY="{CATEGORY}";var s="{X}";e.X=s;var l="{Y}";e.Y=l;e.NAME="{NAME}";var u="{SIZE}";e.SIZE=u;e.DESCRIPTION="{DESCRIPTION}";var h="{VALUE}";e.VALUE=h;var d="{TARGET_VALUE}";e.TARGET_VALUE=d;var c="{PERCENT}";e.PERCENT=c;e.ARRIVALRATE="{ARRIVALRATE}";e.FROM="{FROM.NAME}";e.TO="{TO.NAME}";e.PROCESSES="{PROCESSES}";e.STARTTIME="{STARTTIME}";e.FINISHTIME="{FINISHTIME}";e.DURATION="{DURATION}";e.PROGRESS="{PROGRESS}";e.LEVEL="{LEVEL}";e.DATA_NUMBER="{DATA_NUMBER}";e.DATA_MAX="{DATA_MAX}";e.DATA_Q3="{DATA_Q3}";e.DATA_MEDIAN="{DATA_MEDIAN}";e.DATA_Q1="{DATA_Q1}";e.DATA_MIN="{DATA_MIN}";e.DATA_OUTLIER="{DATA_OUTLIER}";var f="{SUMMARY_VALUE}";e.SUMMARY_VALUE=f;var p={};e.propMap=p,["name","category","processes","startTime","finishTime","duration","progress","level","arrivalRate"].map((function(t){var e="{"+t.toUpperCase()+"}";p[e]=[t,t+"Format"]})),p[h]=["originalValue","valueFormat"],p[o]=["seriesName","seriesFormat"],p[c]=["percentage","percentFormat"],p[f]=["summaryValue","summaryValueFormat"],p[d]=["targetValue","targetValueFormat"]},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=s(i(114)),a=s(i(115)),r=s(i(43)),o=i(52);function s(t){return t&&t.__esModule?t:{"default":t}}var l=function(t,e){switch(e&&e.type){case o.SVG_RENDERER:return new n["default"](t,e);case o.VML_RENDERER:return new a["default"](t,e);default:return new r["default"](t,e)}};e["default"]=l},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.transformParser=e["default"]=void 0;var n=l(i(31)),a=l(i(7)),r=l(i(51)),o=l(i(0)),s=l(i(1));function l(t){return t&&t.__esModule?t:{"default":t}}var u=o["default"].isArray,h=n["default"].extend({initialize:function(t,e){return this.rawElement=t,this.renderer=e,this},node:function(){return this.rawElement},addTo:function(t){return(t=t||this.renderer._container).append(this),this},addToBack:function(t){return(t=(t=t||this.renderer._container).node()).firstChild?t.insertBefore(this.node(),t.firstChild):t.appendChild(this.node()),this},add:function(){return"div"===this.type?this.addTo(this.renderer._divContainer):this.addTo(this.renderer._container)},append:function(t){return this.node().appendChild(t.node()),t},datum:function(){return arguments.length?(this._datum=arguments[0],this):this._datum},addClass:function(t){return a["default"].addClass(this.node(),t),this},toBack:function(){a["default"].toBack(this.node())},remove:function(){var t=this.renderer.vanchart,e=t.findInteractiveTarget(this.node());return e&&t.removeInteractiveTarget(e,this),a["default"].remove(this.node()),this},removed:function(){return!(this.node().parentNode&&this.node().parentNode.tagName)},isVisible:function(){return!this.removed()&&"none"!=this.node().style.display},setType:function(t){return this.type=t,this},vRotate:function(t,e){return this.renderer.vRotate(this,t,e),this},vMiddle:function(){this.renderer.vMiddle(this)},vLeft:function(){this.renderer.vLeft(this)},vRight:function(){this.renderer.vRight(this)},animate:function(t){if(t){if(u(t)){for(var e=this.transition().setAnimation(t[0]),i=1,n=t.length;i<n;i++)e=e.transition(t[i]);return this.setTransitionEnd(e,t[n-1].style)}return this.setTransitionEnd(this.transition().setAnimation(t),t.style)}throw new Error("animate para empty")},setTransitionEnd:function(t,e){var i=this,n=this.renderer.vanchart;return++n.animationCount,i._animating&&--n.animationCount,i._animating=!0,t.each("end",(function(){i._animating=!1,e&&i.style(e),n._animationStarted&&(--n.animationCount||(n.animationCount=-1,n.fire("animationEnd")))}))},effectTransition:function(){return this.interrupt(s["default"].EFFECT_KEY),new r["default"](this,s["default"].EFFECT_KEY)},transition:function(t){return new r["default"](this,t,null,!this.renderer.isAnimation)},interrupt:function(t){var e,i=this.node(),n=r["default"].d3_transitionNamespace(t);return(e=i[n])&&e[e.active]&&(--e.count?delete e[e.active]:delete i[n],e.active+=.5),this},removeTransition:function(t){var e=this.node();if(!e)return this;var i=r["default"].d3_transitionNamespace(t);return t&&i&&e[i]&&delete e[i],this},removeEffectTransition:function(){return this.removeTransition(s["default"].EFFECT_KEY)}}),d=h;e["default"]=d;e.transformParser=function(t){var e,i,n;return(e=t.match(/translate\(\s*([\d|.|e|-]+)(?:[,\s]*)([\d|.|e|-]*)\s*\)/i))&&e.shift(),{translate:e,rotate:i=(i=t.match(/rotate\(\s*([\d|.|e|-]+[degratun]*)(?:[,\s]*)([\d|.|e|-]*)(?:[,\s]*)([\d|.|e|-]*)\s*\)/i))&&i[1]||0,scale:n=(n=t.match(/scale\(\s*([\d|.|e|-]+)\s*\)/i))&&+n[1]||1}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=c(i(1)),a=c(i(0)),r=i(4),o=c(i(29)),s=c(i(8)),l=c(i(16)),u=c(i(168)),h=i(2),d=i(86);function c(t){return t&&t.__esModule?t:{"default":t}}function f(t,e){var i=!e;!function(t){t.series.forEach((function(t){t.summaryValue=t.points.filter((function(t){return!t.isNull&&t.visible})).reduce((function(t,e){return t+e.getTargetValue()}),0)}))}(t),function(t){for(var e={},i=t.series,a=0,r=i.length;a<r;a++){var o=i[a],s=o.type;if(!o.isTreeSeries()&&s!=n["default"].WORD_CLOUD_CHART)if(o.isSeriesAccumulated())if(o._calculatePercentage)o._calculatePercentage();else{var l=m(o);A(o.points,l),y(o.points,l)}else o.visible&&o.points.map((function(t){var i=[s,o.stack,t.getCategory()].join("-");e[i]||(e[i]=[]),e[i].push(t)}))}for(var u in e){var h=e[u],d=m(h[0].series);A(h,d),y(h,d)}for(a=0,r=i.length;a<r;a++){var c=i[a];c._calcCategoryLabel&&c._calcCategoryLabel(),c.points.forEach((function(t){c.calculateLabelInfo(t)}))}!function(t){var e=-Number.MAX_VALUE;t.forEach((function(t){t.cateLabelProp&&(e=Math.max(t.cateLabelProp.dim.height,e))})),t.forEach((function(t){t.cateLabelProp&&(t.cateLabelProp.maxHeight=e)}))}(i)}(t),function(t){if(t&&t.length){var e=[];t.forEach((function(t){e=e.concat(t.points)})),A(e,t[0].getTargetKey())}}(t.seriesOfType(n["default"].WORD_CLOUD_CHART)),i&&(v(t,t.seriesOfType(n["default"].BUBBLE_CHART),n["default"].BUBBLE_CHART),v(t,t.seriesOfType(n["default"].SCATTER_CHART),n["default"].SCATTER_CHART),_(t.seriesOfType(n["default"].BUBBLE_CHART)),_(t.seriesOfType(n["default"].FORCE_BUBBLE_CHART)))}function p(t){for(var e=0,i=t.series.length;e<i;e++){var s=t.series[e];s.visible&&s.doLayout()}var l,h,c;(0,u["default"])(t),function(t){var e,i,o,s,l,u,h,d=t.series||[],c=t.bounds;d.forEach((function(d){var f,p;(function(t,e){var i=t.type;if(i!==n["default"].COLUMN_CHART&&i!==n["default"].BAR_CHART&&i!==n["default"].LINE_CHART&&i!==n["default"].AREA_CHART)return;if(e.isMobileFlow())return!e.hasShowScroll();var a=e.getComponent(r.ComponentCst.ZOOM_COMPONENT),o=a&&a.options&&a.options.zoomTool&&a.options.zoomTool,s=t[t.getBaseAxisType()];return!o.enabled||s.isCategory()})(d,t)&&(f=d.type,p=t.isInverted(),h=f===n["default"].BAR_CHART&&p||f!==n["default"].BAR_CHART&&!p,(d.points||[]).forEach((function(t){(function(t){return t.labelDim&&t.labelPos})(t)&&function(t,e,i){var n=i.options&&i.options.dataLabels;return!function(t,e,i){var n=i.labelPos,a=i.labelDim;return t?n.x+a.width<0||n.x>e.width:n.y+a.height<0||n.y>e.height}(t,e,i)&&!n.borderWidth&&!n.backgroundColor}(h,c,t)&&(!function(t,e){var i=e.series.type,r={x:0,y:0,width:t.width,height:t.height};if(i===n["default"].COLUMN_CHART||i===n["default"].BAR_CHART)return a["default"].outsideRect(r,e.rect);if(i===n["default"].AREA_CHART||i===n["default"].LINE_CHART){var o,s=e.posX,l=e.posY,u=e.options,h=e.series,d=u.marker;if(a["default"].isImageMarker(d.symbol))o=[d.width,d.height];else if(h.isMarkerDisplayable&&d.symbol===n["default"].SYMBOL_AUTO)o=[2*n["default"].MARKER_RADIUS,2*n["default"].MARKER_RADIUS];else{var c=d.radius||0;o=[2*c,2*c]}var f={x:s-o[0]/2,y:l-o[1]/2,width:o[0],height:o[1]};return a["default"].outsideRect(r,f)}return!1}(c,t)?(e=t.labelDim,i=t.labelPos,h?(l="width",u="x"):(l="height",u="y"),o=i[u],s=c[l]-i[u]-e[l],o<0&&s<0?i[u]=3:(i[u]=o<0?3:i[u],i[u]=s<0?c[l]-e[l]-3:i[u],i[u]=i[u]<0?3:i[u])):t.labelPos={})})))}))}(t),(0,d.adjustAutoChartLabel)(t),function(t){if(t.isMobileFlow())for(var e=new o["default"],i=0,n=t.series.length;i<n;i++){var r=t.series[i];r.visible&&r.points.forEach((function(t){if(t.labelPos){var i=r.getAbsoluteLabelPos(t.labelPos),n=a["default"].makeBounds(i,t.labelDim);e.isOverlapped(n)?t.labelPos=null:e.addBounds(n)}}))}}(t),l=t.seriesOfType(n["default"].PIE_CHART),h=[],c=l.reduce((function(t,e){return e.options.radius||h.push(e),t?Math.min(t,e.chartInfo.radius):e.chartInfo.radius}),0),h.map((function(t){t.adjustRadius(c)}))}function g(t,e){t.forEach((function(t){(t.marker&&t.marker.symbol)===n["default"].SYMBOL_AUTO&&(t.isMarkerDisplayable=e)}))}function m(t){return t.type===n["default"].FORCE_BUBBLE_CHART?"value":t.getTargetKey()}function v(t,e,i){var a,r;if(i==n["default"].BUBBLE_CHART)r="swing",a=function(t,e){return e.radius-t.radius};else if(i==n["default"].SCATTER_CHART){var o=t.isInverted();r="exp-in-out",a=function(t,e){return o?t.posY-e.posY:t.posX-e.posX}}var l=[];e.forEach((function(t){l=l.concat(t.points)})),l.sort(a);var u=l.length;u>0&&l.forEach((function(t,e){t.delayTime=800*s["default"].ease(r)(e/u)}))}function _(t){t.forEach((function(t){t._calculateMinMax4Radius()})),t.forEach((function(t){t._calculateBubbleRadius()}))}function y(t,e){var i,n;t&&t.length&&t.forEach((function(t){var a=t.options,r=t.series,o=r.options.stackByPercent,s=r.stack||o,l=r.getStackAxis(),u=l&&l.isLog()?1:0;if((0,h.hasDefined)(i)||(i=u),(0,h.hasDefined)(n)||(n=u),s){var d=o?t.percentage:t.getTargetValue();d>=u?(a[e+"0"]=i,i+=d):(a[e+"0"]=n,n+=d)}else a[e+"0"]=u}))}function A(t,e){var i=0;t.filter((function(t){return!t.isNull&&t.visible})).forEach((function(t){i+=Math.abs(t[e])||0})),i=i>0?i:1,t.forEach((function(t){var e=t.series,n=m(e),a=e[e.getBaseAxisType()],o=!e.stack&&a&&a.type!=r.ComponentCst.CATEGORY_AXIS_COMPONENT;t.percentage=o?1:t.series.isNullValue(t)?0:Math.abs(t[n])/i}))}function T(t){x(t),[r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.Y_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].dealOnZero()})),[r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.Y_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisBounds()}))}function x(t){t._initPlotBounds&&(t.bounds=l["default"].merge({},t._initPlotBounds)),t.clipPool={},t.axisSize={left:0,right:0,bottom:0,top:0},b(t),t.components[r.ComponentCst.DATA_SHEET_COMPONENT]&&t.components[r.ComponentCst.DATA_SHEET_COMPONENT].reCalculateSize(),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisClip()})),C(t),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.DATA_SHEET_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisSizeAndBounds()})),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.ZOOM_COMPONENT,r.ComponentCst.DATA_SHEET_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].fixBoundsByPlot()}))}function b(t){var e=[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT];if(t.components[r.ComponentCst.Y_AXIS_COMPONENT])for(var i=t.components[r.ComponentCst.Y_AXIS_COMPONENT]._axisList,n=i.length-1;n>=0;n--)if(i[n].isCategory()){e=e.reverse();break}e.forEach((function(e){t.components[e]&&t.components[e].calculateAxisSize()}))}function C(t){var e=t.getChartBounds(),i=t.bounds,a=i.x,r=i.y,o=i.width,s=i.height,l=Math.max(t.clipPool[n["default"].LEFT]||0,a),u=Math.max(t.clipPool[n["default"].RIGHT]||0,e.width-(a+o)),h=Math.max(t.clipPool[n["default"].TOP]||0,r),d=Math.max(t.clipPool[n["default"].BOTTOM]||0,e.height-(r+s));i={x:l,y:h,width:e.width-l-u,height:e.height-h-d},t.setPlotBounds(i)}var L={PLANE_SYSTEM_LAYOUT:function(t){f(t),function(t){t.bounds=t._getDefaultBounds(),function(t,e,i){if(0!==e.length){var a=t.options.plotOptions,r=a[i],o=r&&r.marker||a.marker;if((o&&o.symbol)===n["default"].SYMBOL_AUTO){var s=t.isInverted(),l=t.bounds,u=s?l.height:l.width,h=Math.round(u/40),d=function(t){return t.filter((function(t){return!t.isNull}))},c=Math.max.apply(Math,e.map((function(t){return d(t.points).length})));if(h<c)g(e,!1);else{var f=e.filter((function(t){return d(t.points).length===c}))[0],p=f.xAxis;if("category"!==p.type){var m=function(t,e,i){var n=[];return t.forEach((function(t){var a=t.points.map((function(t){return e.getAxisValue(t.options[i],t)}));n=n.concat(a)})),n}(e,p,"x"),v=Math.min.apply(Math,m),_=Math.max.apply(Math,m),y=d(f.points),A=h/4,T=(_-v)/4,x=[],b=[],C=[],L=[];y.forEach((function(t){var e=t.options,i=p.getAxisValue(e.x,t)-v;0<=i&&i<T?x.push(t):i>=T&&i<2*T?b.push(t):i>=2*T&&i<3*T?C.push(t):L.push(t)})),g(e,x.length<=A&&b.length<=A&&C.length<=A&&L.length<=A)}else g(e,!0)}}}}(t,t.seriesOfType(n["default"].LINE_CHART),n["default"].LINE_CHART),r.ComponentsOrder.map((function(e){e in t.components&&t.components[e]&&t.components[e].doLayout()}),this),t._initPlotBounds=t.bounds,b(t),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisClip()})),C(t),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.DATA_SHEET_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisSizeAndBounds()}));var e=!1,i=!1;[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT].forEach((function(i){e=t.components[i]&&t.components[i].adjustDomain4Radius()||e})),[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.DATA_SHEET_COMPONENT,r.ComponentCst.ZOOM_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].fixBoundsByPlot()})),[r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.Y_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].dealOnZero()})),[r.ComponentCst.X_AXIS_COMPONENT,r.ComponentCst.Y_AXIS_COMPONENT].forEach((function(e){t.components[e]&&t.components[e].updateAxisBounds()}));var a=t.getComponent(r.ComponentCst.ZOOM_COMPONENT);a&&a.zoomToolEnabled()&&a.isScroll()&&[r.ComponentCst.Y_AXIS_COMPONENT,r.ComponentCst.X_AXIS_COMPONENT].forEach((function(e){i=t.components[e]&&t.components[e].updateZoomDomain()||i}));(e||i)&&T(t),p(t)}(t)},reLayoutPlotBounds:T,calculateBubbleRadius:_,calculateDelayTime:v,calculateSeries:f,calculateSeriesShapes:p,calculateAxisBoundsAndClip:x};e["default"]=L},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=void 0;var n=s(i(1)),a=s(i(0)),r=s(i(5)),o=i(46);function s(t){return t&&t.__esModule?t:{"default":t}}var l={},u={},h=[n["default"].NORMAL_ICON,n["default"].BUBBLE_ICON,n["default"].SCATTER_ICON+n["default"].CIRCLE,n["default"].SCATTER_ICON+n["default"].CIRCLE_HOLLOW,n["default"].SCATTER_ICON+n["default"].SQUARE,n["default"].SCATTER_ICON+n["default"].SQUARE_HOLLOW];l[n["default"].PIE_ICON]="M16.1711539,7 C22.882066,7 28.7582496,10.4779063 32.0002511,15.682597 L15.492372,25 L0.00021052449,16.2548919 C3.15945315,10.7344266 9.21715568,7 16.1711539,7 Z",u[n["default"].PIE_ICON]={width:32,height:32},l[n["default"].TREEMAP_ICON]="M9,12H3c-1.6,0-3-1.4-3-3l0-6c0-1.6,1.3-3,3-3l6,0c1.7,0,3,1.4,3,3v6C12,10.6,10.6,12,9,12z",u[n["default"].TREEMAP_ICON]={width:12,height:12},l[n["default"].ANCHOR_ICON]="M14,0 C18.9705627,0 23,3.99365356 23,8.92007488 C23,10.1383014 22.7536019,11.2994896 22.3075049,12.357355 C21.4180692,14.2023669 20.6028055,15.8625212 19.8617139,17.3477584 L19.4973491,18.0758467 C16.0946028,24.8550831 14.3653636,27.7251338 14.3096313,27.7513441 C14.1520691,28.0828853 13.7206116,28.0828853 13.5482295,27.7513441 L5.69249505,12.357355 C5.24639813,11.2994896 5,10.1383014 5,8.92007488 C5,3.99365356 9.02943725,0 14,0 Z M14,6 C12.3431458,6 11,7.34314575 11,9 C11,10.6568542 12.3431458,12 14,12 C15.6568542,12 17,10.6568542 17,9 C17,7.34314575 15.6568542,6 14,6 Z",u[n["default"].ANCHOR_ICON]={width:28,height:28},l[n["default"].DONUT_ICON]="M16.1709434,8 C22.8819622,8 28.7582258,11.4603001 32.0001952,16.6386156 L21.5039708,22.5334633 C20.579905,20.4209885 18.4632188,18.9439669 15.9997895,18.9439669 C13.3586911,18.9439669 11.1161556,20.6417249 10.3145981,23.0001357 L-0.000152222903,17.2080129 C3.15904804,11.7155231 9.21683346,8 16.1709434,8 Z",u[n["default"].DONUT_ICON]={width:32,height:32},l[n["default"].NORMAL_ICON]="M0,0L12,0L12,12L0,12Z",u[n["default"].NORMAL_ICON]={width:12,height:12},l[n["default"].BUBBLE_ICON]="M6,11.5c-1.47,0-2.851-0.572-3.889-1.611C1.072,8.851,0.5,7.47,0.5,6s0.572-2.851,1.611-3.889C3.149,1.072,4.53,0.5,6,0.5s2.851,0.572,3.889,1.611C10.928,3.149,11.5,4.53,11.5,6s-0.572,2.851-1.611,3.889C8.851,10.928,7.47,11.5,6,11.5z",u[n["default"].BUBBLE_ICON]={width:11,height:11},l[n["default"].NULL_MARKER]="M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3254834 30.9684641,18.4100387 29.6643757,18.4946823 L29.5,18.5 L2.5,18.5 C1.11928813,18.5 0,17.3807119 0,16 C0,14.6745166 1.03153594,13.5899613 2.33562431,13.5053177 L2.5,13.5 L29.5,13.5 Z",u[n["default"].NULL_MARKER]={width:32,height:32},l[n["default"].CIRCLE]="M16,8 C19.5449966,8 22.5514499,10.3057777 23.6014229,13.499396 L23.6015963,13.4999235 L23.6167542,13.5465233 C23.6794628,13.741351 23.7349038,13.9394393 23.7827579,14.1404689 C23.7899489,14.1706765 23.7969842,14.2010193 23.8038463,14.2314277 C23.8497915,14.435015 23.8879903,14.641655 23.9180904,14.8509119 C23.9229126,14.8844344 23.9275355,14.9180889 23.9319484,14.9518094 C23.9586369,15.1557661 23.9776373,15.3620364 23.9886632,15.5704214 C23.9903758,15.6027909 23.9918939,15.6351629 23.993219,15.6675847 C23.997724,15.7777783 24,15.8886233 24,16 C24,16.1090141 23.9978195,16.217519 23.9934998,16.3254733 L24,16 C24,16.1417048 23.9963157,16.2825491 23.9890377,16.4224424 C23.9781504,16.6316396 23.9592447,16.8385728 23.9326156,17.0430797 C23.927786,17.0801933 23.922611,17.1178568 23.9171747,17.1554359 C23.8871888,17.3626011 23.8494053,17.5665752 23.8040476,17.7676797 C23.797382,17.7972309 23.7905887,17.8265688 23.7836345,17.8558445 C23.7356361,18.0579429 23.6798772,18.2573617 23.6167542,18.4534767 C23.6115923,18.4695107 23.6065308,18.4850679 23.6014229,18.500604 C22.5514499,21.6942223 19.5449966,24 16,24 C12.4550034,24 9.44855013,21.6942223 8.39857709,18.500604 L8.39857709,18.500604 L8.38324583,18.4534767 C8.32012283,18.2573617 8.26436385,18.0579429 8.21629457,17.855546 C8.2094113,17.8265688 8.20261802,17.7972309 8.19598662,17.7678316 C8.15059467,17.5665752 8.11281122,17.3626011 8.08291749,17.1560731 C8.07738904,17.1178568 8.072214,17.0801933 8.06730206,17.042447 C8.04075528,16.8385728 8.02184959,16.6316396 8.01096962,16.4225824 C8.00928221,16.3901483 8.00779361,16.3578034 8.00649762,16.3254091 C8.00218048,16.217519 8,16.1090141 8,16 C8,15.8872733 8.00233152,15.7750912 8.00694897,15.6634992 L8,16 C8,15.8559017 8.00380981,15.7126932 8.01133421,15.5704698 C8.02236272,15.3620364 8.04136312,15.1557661 8.06803842,14.9519101 C8.07246447,14.9180889 8.07708736,14.8844344 8.08191889,14.8508474 C8.11200967,14.641655 8.15020846,14.435015 8.19617811,14.2313197 C8.20301581,14.2010193 8.21005106,14.1706765 8.21725841,14.1404005 C8.26509616,13.9394393 8.32053716,13.741351 8.38324583,13.5465233 C8.38826834,13.5309195 8.393313,13.5154111 8.39840368,13.4999235 C9.44855013,10.3057777 12.4550034,8 16,8 Z M6.3149723,13.5002775 C6.10935719,14.2992437 6,15.136851 6,16 C6,16.8634306 6.10942855,17.7013028 6.31517356,18.5005044 L2.5,18.5 C1.11928813,18.5 1.69088438e-16,17.3807119 0,16 C-1.69088438e-16,14.6192881 1.11928813,13.5 2.5,13.5 L6.3149723,13.5002775 Z M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3807119 30.8807119,18.5 29.5,18.5 L25.6848264,18.5005044 C25.8905715,17.7013028 26,16.8634306 26,16 C26,15.136851 25.8906428,14.2992437 25.6850277,13.5002775 L29.5,13.5 Z",u[n["default"].CIRCLE]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].NULL_MARKER]="M0,0L12,0L12,12L0,12Z",u[n["default"].SCATTER_ICON+n["default"].NULL_MARKER]={width:12,height:12},l[n["default"].SCATTER_ICON+n["default"].NORMAL_ICON]="M0,0L12,0L12,12L0,12Z",u[n["default"].SCATTER_ICON+n["default"].NORMAL_ICON]={width:12,height:12},l[n["default"].SCATTER_ICON+n["default"].CIRCLE]="M4,8C2.897,8,1.897,7.551,1.173,6.827S0,5.103,0,4s0.449-2.103,1.173-2.827S2.897,0,4,0s2.103,0.449,2.827,1.173S8,2.897,8,4S7.551,6.103,6.827,6.827S5.103,8,4,8",u[n["default"].SCATTER_ICON+n["default"].CIRCLE]={width:8,height:8},l[n["default"].SQUARE]="M24,24 L8,24 L8,8 L24,8 L24,24 Z M6,13.5 L6,18.5 L2.5,18.5 C1.11928813,18.5 1.69088438e-16,17.3807119 0,16 C-1.69088438e-16,14.6192881 1.11928813,13.5 2.5,13.5 L6,13.5 Z M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3807119 30.8807119,18.5 29.5,18.5 L26,18.5 L26,13.5 L29.5,13.5 Z",u[n["default"].SQUARE]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].SQUARE]="M0,0h8c0,0,0,3.889,0,8C4,8,0,8,0,8V0z",u[n["default"].SCATTER_ICON+n["default"].SQUARE]={width:8,height:8},l[n["default"].DIAMOND]="M15.9903066,23.9806133 L8,15.9903066 L9.208,14.782 L10.49,13.5 L10.491,13.499 L15.9903066,8 L21.489,13.499 L21.49,13.5 L23.9806133,15.9903066 L15.9903066,23.9806133 Z M7.661,13.5 L5.17157288,15.9903066 L7.681,18.5 L2.5,18.5 C1.11928813,18.5 1.69088438e-16,17.3807119 0,16 C-1.69088438e-16,14.6192881 1.11928813,13.5 2.5,13.5 L7.661,13.5 Z M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3807119 30.8807119,18.5 29.5,18.5 L24.299,18.5 L26.8090404,15.9903066 L24.319,13.5 L29.5,13.5 Z",u[n["default"].DIAMOND]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].DIAMOND]="M0,4.5L4.502,0l4.5,4.5c0,0,0,0-4.5,4.5C0,4.5,0,4.5,0,4.5z",u[n["default"].SCATTER_ICON+n["default"].DIAMOND]={width:9,height:9},l[n["default"].TRIANGLE]="M16.0378418,0 L19.117,5.499 L19.118,5.5 L21.919,10.5 L25,16 L7,16 L10.106,10.5 L12.93,5.5 L12.931,5.499 L16.0378418,0 Z M10.634,5.5 L7.809,10.5 L2.5,10.5 C1.11928813,10.5 1.69088438e-16,9.38071187 0,8 C-1.69088438e-16,6.61928813 1.11928813,5.5 2.5,5.5 L10.634,5.5 Z M29.5,5.5 C30.8807119,5.5 32,6.61928813 32,8 C32,9.38071187 30.8807119,10.5 29.5,10.5 L24.211,10.5 L21.411,5.5 L29.5,5.5 Z",u[n["default"].TRIANGLE]={width:32,height:16},l[n["default"].SCATTER_ICON+n["default"].TRIANGLE]="M4.5,0L9,8c0,0-4.617,0-9,0L4.5,0z",u[n["default"].SCATTER_ICON+n["default"].TRIANGLE]={width:9,height:8},l[n["default"].CIRCLE_HOLLOW]="M16,8 C19.5449966,8 22.5514499,10.3057777 23.6014229,13.499396 L23.6015963,13.4999235 L23.6167542,13.5465233 C23.6777019,13.7358801 23.7317845,13.928317 23.7787086,14.1235407 C23.7872882,14.1592297 23.7956896,14.1952824 23.8038463,14.2314277 C23.8497915,14.435015 23.8879903,14.641655 23.9180904,14.8509119 C23.9229126,14.8844344 23.9275355,14.9180889 23.9319484,14.9518094 C23.9586369,15.1557661 23.9776373,15.3620364 23.9886632,15.5704214 C23.9903776,15.6028264 23.9918972,15.635234 23.9932234,15.6676915 C23.997724,15.7777783 24,15.8886233 24,16 C24,16.1090141 23.9978195,16.217519 23.9934998,16.3254733 L24,16 C24,16.1376367 23.9965242,16.2744617 23.9896556,16.4103918 C23.9794061,16.6131334 23.9616331,16.8136946 23.9366014,17.0119943 C23.9305879,17.059654 23.9240928,17.1076134 23.9171747,17.1554359 C23.8871888,17.3626011 23.8494053,17.5665752 23.8040476,17.7676797 C23.797382,17.7972309 23.7905887,17.8265688 23.7836345,17.8558445 C23.7356361,18.0579429 23.6798772,18.2573617 23.6167542,18.4534767 C23.6115923,18.4695107 23.6065308,18.4850679 23.6014229,18.500604 C22.5514499,21.6942223 19.5449966,24 16,24 C12.4550034,24 9.44855013,21.6942223 8.39857709,18.500604 L8.39857709,18.500604 L8.38324583,18.4534767 C8.32012283,18.2573617 8.26436385,18.0579429 8.21629457,17.855546 C8.2094113,17.8265688 8.20261802,17.7972309 8.19598662,17.7678316 C8.15059467,17.5665752 8.11281122,17.3626011 8.08291749,17.1560731 C8.0759072,17.1076134 8.06941213,17.059654 8.063344,17.0115615 C8.03836689,16.8136946 8.02059389,16.6131334 8.01035419,16.4105853 C8.00891706,16.3821445 8.00763622,16.3538585 8.00650265,16.3255346 C8.00218048,16.217519 8,16.1090141 8,16 C8,15.8828858 8.00251655,15.7663593 8.00749852,15.6504717 L8,16 C8,15.8559017 8.00380981,15.7126932 8.01133421,15.5704698 C8.02236272,15.3620364 8.04136312,15.1557661 8.06803842,14.9519101 C8.07246447,14.9180889 8.07708736,14.8844344 8.08191889,14.8508474 C8.11200967,14.641655 8.15020846,14.435015 8.19617811,14.2313197 C8.20431043,14.1952824 8.21271182,14.1592297 8.22135606,14.1232717 C8.26821552,13.928317 8.32229806,13.7358801 8.38324583,13.5465233 C8.38826834,13.5309195 8.393313,13.5154111 8.39840368,13.4999235 C9.44855013,10.3057777 12.4550034,8 16,8 Z M16,13 C15.3111497,13 14.6765255,13.232169 14.1701084,13.6225257 C14.1362044,13.6486674 14.1032121,13.675235 14.0708045,13.7024756 L14.1701084,13.6225257 C14.1165669,13.6637965 14.0644586,13.7068356 14.0138709,13.7515554 L14.0708045,13.7024756 C14.0277118,13.7386977 13.9856529,13.7761098 13.9446782,13.8146614 L14.0138709,13.7515554 C13.9699051,13.7904213 13.9270879,13.8305567 13.8854766,13.8719043 L13.9446782,13.8146614 C13.8378985,13.9151265 13.7384824,14.0233298 13.6473258,14.1383756 C13.6368951,14.1515401 13.6265907,14.1647705 13.6163955,14.1780888 L13.6473258,14.1383756 C13.6090135,14.1867283 13.5721602,14.2362897 13.5368324,14.2869932 L13.6163955,14.1780888 C13.5743585,14.2330025 13.5341763,14.2894111 13.4959425,14.3472212 L13.5368324,14.2869932 C13.5027613,14.3358931 13.4701091,14.3858553 13.4389354,14.4368202 L13.4959425,14.3472212 C13.4626638,14.3975389 13.4308612,14.4489183 13.4005963,14.5012977 L13.4389354,14.4368202 C13.4033853,14.4949401 13.369758,14.554364 13.3381421,14.6150034 L13.4005963,14.5012977 C13.3723903,14.5501138 13.3455199,14.5997986 13.3200351,14.6503019 L13.3381421,14.6150034 C13.2473225,14.7891954 13.1730999,14.9734175 13.1175715,15.1655725 C13.1073093,15.2010618 13.0975615,15.2373171 13.0884828,15.2738368 L13.1175715,15.1655725 C13.1012458,15.2220675 13.086536,15.2792482 13.0734954,15.3370614 L13.0884828,15.2738368 C13.0754205,15.3263804 13.0637434,15.3794713 13.0534925,15.4330686 L13.0734954,15.3370614 C13.0585643,15.4032557 13.0458216,15.470279 13.0353471,15.5380514 L13.0534925,15.4330686 C13.0413244,15.4966897 13.0311658,15.5610243 13.0230852,15.6260037 L13.0353471,15.5380514 C13.0253363,15.6028242 13.0173974,15.6682813 13.0116003,15.7343527 L13.0230852,15.6260037 C13.0157079,15.6853277 13.0100626,15.7451891 13.0062016,15.8055359 L13.0116003,15.7343527 C13.0039209,15.8218778 13,15.910481 13,16 L13.0062016,16.1944641 C13.0073861,16.2129774 13.0087385,16.231445 13.0102573,16.2498654 C13.013632,16.2908481 13.0178705,16.3319203 13.022929,16.3727383 L13.0102573,16.2498654 C13.0161479,16.3213064 13.0245416,16.3920378 13.0353507,16.4619715 L13.022929,16.3727383 C13.0310364,16.4381585 13.04125,16.5029257 13.0534998,16.5669698 L13.0353507,16.4619715 C13.0458294,16.5297683 13.0585781,16.5968154 13.0735166,16.6630328 L13.0534998,16.5669698 C13.0637294,16.6204516 13.075379,16.6734291 13.0884078,16.7258617 L13.0735166,16.6630328 C13.0865895,16.7209803 13.1013393,16.7782923 13.1177125,16.8349153 L13.0884078,16.7258617 C13.1423026,16.9427533 13.2197982,17.1503204 13.3180108,17.3456792 C13.3246022,17.3587906 13.3312971,17.3718666 13.3380847,17.3848865 L13.3180108,17.3456792 C13.3441457,17.3976651 13.3717476,17.4487866 13.4007621,17.4989892 L13.3380847,17.3848865 C13.3696522,17.4454392 13.4032253,17.50478 13.4387159,17.5628208 L13.4007621,17.4989892 C13.4310644,17.5514199 13.4629075,17.6028484 13.4962296,17.6532128 L13.4387159,17.5628208 C13.4698686,17.6137675 13.5024986,17.6637125 13.5365465,17.7125963 L13.4962296,17.6532128 C13.5318401,17.707036 13.5691396,17.759644 13.6080526,17.8109611 L13.5365465,17.7125963 C13.5719556,17.7634347 13.6088982,17.8131252 13.6473073,17.861601 L13.6080526,17.8109611 C13.6931837,17.9232288 13.7860372,18.0293185 13.885822,18.1284389 C13.8964986,18.1390479 13.9076052,18.149915 13.9187954,18.160696 L13.885822,18.1284389 C13.9274271,18.1697669 13.9702371,18.2098833 14.0141947,18.2487309 L13.9187954,18.160696 C13.9678609,18.2079674 14.0185326,18.2535833 14.0707205,18.2974537 L14.0141947,18.2487309 C14.0629696,18.2918356 14.1131575,18.3333782 14.16468,18.3732801 L14.0707205,18.2974537 C14.1103221,18.3307438 14.1507968,18.3630288 14.1921052,18.3942694 L14.16468,18.3732801 C14.2121928,18.4100768 14.2608407,18.4454783 14.3105621,18.4794232 L14.1921052,18.3942694 C14.6948472,18.7744814 15.3210873,19 16,19 C16.6911088,19 17.3276354,18.7663061 17.8348687,18.3736296 C17.8671266,18.3486473 17.8984246,18.3233892 17.9291955,18.2975244 L17.8348687,18.3736296 C17.8866635,18.3335325 17.9371101,18.2917776 17.9861291,18.2484446 L17.9291955,18.2975244 C17.9813387,18.2536948 18.0319684,18.2081227 18.080995,18.1608979 L17.9861291,18.2484446 C18.0300949,18.2095787 18.0729121,18.1694433 18.1145234,18.1280957 L18.080995,18.1608979 C18.1780724,18.0673882 18.2688642,17.9673983 18.3526742,17.8616244 C18.3659682,17.8448461 18.3790685,17.8279461 18.3919909,17.8109037 L18.3526742,17.8616244 C18.3909865,17.8132717 18.4278398,17.7637103 18.4631676,17.7130068 L18.3919909,17.8109037 C18.4309928,17.7594668 18.4683737,17.7067332 18.5040575,17.6527788 L18.4631676,17.7130068 C18.4972387,17.6641069 18.5298909,17.6141447 18.5610646,17.5631798 L18.5040575,17.6527788 C18.5373362,17.6024611 18.5691388,17.5510817 18.5994037,17.4987023 L18.5610646,17.5631798 C18.5966147,17.5050599 18.630242,17.445636 18.6618579,17.3849966 L18.5994037,17.4987023 C18.6283612,17.4485855 18.655911,17.3975532 18.6819991,17.3456595 L18.6618579,17.3849966 C18.7526775,17.2108046 18.8269001,17.0265825 18.8824285,16.8344275 C18.8926907,16.7989382 18.9024385,16.7626829 18.9115172,16.7261632 L18.8824285,16.8344275 C18.8987542,16.7779325 18.913464,16.7207518 18.9265046,16.6629386 L18.9115172,16.7261632 C18.9245795,16.6736196 18.9362566,16.6205287 18.9465075,16.5669314 L18.9265046,16.6629386 C18.9414357,16.5967443 18.9541784,16.529721 18.9646529,16.4619486 L18.9465075,16.5669314 C18.9587383,16.5029825 18.9689389,16.4383128 18.9770396,16.3729919 L18.9646529,16.4619486 C18.9754767,16.3919157 18.9838783,16.321083 18.9897696,16.2495386 L18.9770396,16.3729919 C18.9843968,16.3136658 18.990022,16.2538025 18.9938628,16.1934542 L18.9897696,16.2495386 C18.9965451,16.1672556 19,16.0840312 19,16 L18.9938628,15.8065458 C18.9923202,15.782308 18.9904898,15.7581485 18.9883749,15.7340706 C18.985222,15.6981354 18.9814008,15.6621027 18.9769475,15.6262662 L18.9883749,15.7340706 C18.9825793,15.6680872 18.9746476,15.6027166 18.9646493,15.5380285 L18.9769475,15.6262662 C18.96886,15.5611844 18.9586879,15.4967495 18.9465002,15.4330302 L18.9646493,15.5380285 C18.9541706,15.4702317 18.9414219,15.4031846 18.9264834,15.3369672 L18.9465002,15.4330302 C18.9362706,15.3795484 18.924621,15.3265709 18.9115922,15.2741383 L18.9264834,15.3369672 C18.9134105,15.2790197 18.8986607,15.2217077 18.8822875,15.1650847 L18.9115922,15.2741383 C18.8573364,15.0557938 18.7791625,14.8468991 18.6800126,14.6503964 C18.6740235,14.6385277 18.6680068,14.6267981 18.6619153,14.6151135 L18.6800126,14.6503964 C18.6544637,14.5997616 18.627522,14.5499496 18.5992379,14.5010108 L18.6619153,14.6151135 C18.6303478,14.5545608 18.5967747,14.49522 18.5612841,14.4371792 L18.5992379,14.5010108 C18.5689356,14.4485801 18.5370925,14.3971516 18.5037704,14.3467872 L18.5612841,14.4371792 C18.5301314,14.3862325 18.4975014,14.3362875 18.4634535,14.2874037 L18.5037704,14.3467872 C18.4656557,14.2891789 18.425606,14.2329629 18.383714,14.1782318 L18.4634535,14.2874037 C18.4280444,14.2365653 18.3911018,14.1868748 18.3526927,14.138399 L18.383714,14.1782318 C18.3008397,14.069958 18.2107553,13.9674954 18.114178,13.8715611 C18.0950728,13.852577 18.0753587,13.8335145 18.055387,13.8147227 L18.114178,13.8715611 C18.0725729,13.8302331 18.0297629,13.7901167 17.9858053,13.7512691 L18.055387,13.8147227 C18.0144184,13.7761746 17.9723657,13.7387655 17.9292795,13.7025463 L17.9858053,13.7512691 C17.9354288,13.7067489 17.883545,13.6638953 17.8302402,13.6227944 L17.9292795,13.7025463 C17.8874332,13.6673692 17.844612,13.6333145 17.8008624,13.6004283 L17.8302402,13.6227944 C17.7830456,13.5864048 17.7347371,13.5513893 17.6853746,13.5178077 L17.8008624,13.6004283 C17.2993184,13.2234229 16.6757508,13 16,13 Z M2.5,13.5 L6.3149723,13.5002775 C6.10935719,14.2992437 6,15.136851 6,16 C6,16.8634306 6.10942855,17.7013028 6.31517356,18.5005044 L2.5,18.5 C1.11928813,18.5 1.69088438e-16,17.3807119 0,16 C-1.69088438e-16,14.6192881 1.11928813,13.5 2.5,13.5 Z M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3807119 30.8807119,18.5 29.5,18.5 L25.6848264,18.5005044 C25.8905715,17.7013028 26,16.8634306 26,16 C26,15.136851 25.8906428,14.2992437 25.6850277,13.5002775 L29.5,13.5 Z",u[n["default"].CIRCLE_HOLLOW]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].CIRCLE_HOLLOW]="M4,2c1.102,0,2,0.898,2,2S5.102,6,4,6S2,5.102,2,4S2.898,2,4,2 M4,0C1.791,0,0,1.791,0,4s1.791,4,4,4s4-1.791,4-4S6.209,0,4,0",u[n["default"].SCATTER_ICON+n["default"].CIRCLE_HOLLOW]={width:8,height:8},l[n["default"].SQUARE_HOLLOW]="M24,16 L8,16 L8,0 L24,0 L24,16 Z M13,11 L19,11 L19,5 L13,5 L13,11 Z M6,5.5 L6,10.5 L2.5,10.5 C1.11928813,10.5 1.69088438e-16,9.38071187 0,8 C-1.69088438e-16,6.61928813 1.11928813,5.5 2.5,5.5 L6,5.5 Z M29.5,5.5 C30.8807119,5.5 32,6.61928813 32,8 C32,9.38071187 30.8807119,10.5 29.5,10.5 L26,10.5 L26,5.5 L29.5,5.5 Z",u[n["default"].SQUARE_HOLLOW]={width:32,height:16},l[n["default"].SCATTER_ICON+n["default"].SQUARE_HOLLOW]="M6,6H2V2h4V6z M8,0H0v8h8V0z",u[n["default"].SCATTER_ICON+n["default"].SQUARE_HOLLOW]={width:8,height:8},l[n["default"].DIAMOND_HOLLOW]="M24.1403066,15.9903066 L16.15,23.9806133 L8.15969337,15.9903066 L16.15,8 L24.1403066,15.9903066 Z M16.1952273,12.5 L15.254,13.44 L15.255,13.4403066 L12.6596934,16.0355339 L15.065,18.4403066 L15.064,18.44 L16.1952273,19.5710678 L17.326,18.44 L17.325,18.4403066 L19.7307612,16.0355339 L17.135,13.4403066 L17.136,13.44 L16.1952273,12.5 Z M7.881,13.4403066 L5.33126625,15.9903066 L7.781,18.4403066 L2.5,18.4403066 C1.11928813,18.4403066 1.69088438e-16,17.3210185 0,15.9403066 C-1.69088438e-16,14.5595948 1.11928813,13.4403066 2.5,13.4403066 L7.881,13.4403066 Z M29.5,13.4403066 C30.8807119,13.4403066 32,14.5595948 32,15.9403066 C32,17.3210185 30.8807119,18.4403066 29.5,18.4403066 L24.518,18.4403066 L26.9687338,15.9903066 L24.418,13.4403066 L29.5,13.4403066 Z",u[n["default"].DIAMOND_HOLLOW]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].DIAMOND_HOLLOW]="M2.121,4.999L5,2.121l2.878,2.878L5,7.879L2.121,4.999z M5,0L0,4.999L5,10l4.999-5.001L5,0z",u[n["default"].SCATTER_ICON+n["default"].DIAMOND_HOLLOW]={width:10,height:10},l[n["default"].TRIANGLE_HOLLOW]="M16.0378418,8 L19.117,13.499 L19.118,13.5 L21.919,18.5 L21.918,18.499 L25,24 L7,24 L10.49,17.821 L12.931,13.5 L16.0378418,8 Z M16.0126139,14.5555556 L13,20.5555556 L19,20.5555556 L16.0126139,14.5555556 Z M10.634,13.5 L7.81,18.5 L2.5,18.5 C1.11928813,18.5 1.69088438e-16,17.3807119 0,16 C-1.69088438e-16,14.6192881 1.11928813,13.5 2.5,13.5 L10.634,13.5 Z M29.5,13.5 C30.8807119,13.5 32,14.6192881 32,16 C32,17.3807119 30.8807119,18.5 29.5,18.5 L24.211,18.5 L21.41,13.5 L29.5,13.5 Z",u[n["default"].TRIANGLE_HOLLOW]={width:32,height:32},l[n["default"].SCATTER_ICON+n["default"].TRIANGLE_HOLLOW]="M5.001,3.34L7.402,7.5H2.598L5.001,3.34z M5.001,0.34L0,9h10L5.001,0.34z",u[n["default"].SCATTER_ICON+n["default"].TRIANGLE_HOLLOW]={width:10,height:9},l[n["default"].CANCEL_SOLID_NAIL_ICON]="M9.88665001,0.66302772 L15.3369723,6.11334999 C15.5519816,6.32835926 15.5546631,6.67427665 15.3429616,6.88597809 L15.032,7.196 L12.20397,4.90047724 L12.203,7.214 L12.191251,7.21567803 C11.61466,7.27939663 11.0575926,7.39811193 10.5373193,7.58997195 C8.99000288,8.16057239 8,9.30039352 8,11.0232892 C8,12.6560589 9.1021804,14.0343354 10.6810608,14.6630164 L10.000448,15.3429616 C9.78874651,15.5546631 9.44282913,15.5519816 9.22781985,15.3369723 L5.61269895,11.7218514 L1.91162117,14.9224705 C1.68056048,15.1222743 1.33158592,15.1071257 1.1122301,14.8877699 C0.892874286,14.6684141 0.877725725,14.3194395 1.07752951,14.0883788 L4.27737,10.3865224 L0.66302772,6.77218015 C0.448018443,6.55717087 0.445336913,6.21125349 0.657038355,5.99955205 L1.42367709,5.23291331 C1.63537853,5.02121187 1.98129592,5.0238934 2.19630519,5.23890268 L2.80711834,5.84974609 C3.92811083,5.24499301 5.14265419,4.97012373 6.28986414,5.03852636 L8.74268128,2.58561393 L8.35337254,2.19630519 C8.13836327,1.98129592 8.13568174,1.63537853 8.34738318,1.42367709 L9.11402191,0.657038355 C9.32572335,0.445336913 9.67164074,0.448018443 9.88665001,0.66302772 Z M12.1193785,14 L11.8892939,13.9675614 C11.8091361,13.9540311 11.7299341,13.9383004 11.6517849,13.9204471 L11.8118648,13.9537534 C11.7334145,13.9390116 11.6559248,13.9221531 11.5794887,13.9032527 L11.6517849,13.9204471 C11.5544648,13.8982141 11.4587773,13.8726894 11.3649098,13.8440231 L11.5794887,13.9032527 C11.4884953,13.8807527 11.3989952,13.8553589 11.3111453,13.8271972 L11.3649098,13.8440231 C11.2983303,13.8236903 11.2326663,13.801777 11.1679848,13.7783368 L11.3111453,13.8271972 C11.2268538,13.8001763 11.1440816,13.7706072 11.0629674,13.7386011 L11.1679848,13.7783368 C11.0893913,13.7498549 11.0122483,13.7191186 10.9366757,13.6862241 L11.0629674,13.7386011 C10.9997337,13.7136504 10.9375075,13.6872186 10.8763546,13.6593586 L10.8759896,13.6591923 C10.7280909,13.5918127 10.5861358,13.5158712 10.4514258,13.4322851 L10.451054,13.4320543 L10.2653721,13.3087228 L10.2653721,13.3087228 L10.2329741,13.2854408 C9.47768449,12.7361581 9,11.9286218 9,11.0232892 C9,9.08155961 10.6950744,8.45723413 11.9524298,8.25655839 L12.2338478,8.2173622 L12.491,8.19 L12.498,8.19 L12.7107776,8.17524012 C12.7216211,8.17461129 12.7323456,8.17401131 12.7429478,8.17343885 L13.0046306,8.16354563 C13.0125029,8.16337514 13.0202305,8.16321921 13.0278105,8.1630766 L13.20397,8.16156415 L13.20397,7 L14.2007699,7.80963001 C14.2004359,7.80963321 14.2001019,7.8096361 14.1997679,7.80963869 L14.779,8.279 L16,9.26929152 L13.20397,11.5213957 L13.20397,10.1569595 C13.0389041,10.1569595 12.8239945,10.1575604 12.5849621,10.1722995 L12.56665,10.1734535 L12.522725,10.1764279 C12.4725059,10.1799976 12.421351,10.184221 12.3694873,10.1892175 L12.3130872,10.1949329 L12.2772452,10.198865 C12.2249119,10.2047804 12.1720097,10.2115301 12.118762,10.2192317 L12.0492359,10.2298098 C11.992518,10.2388733 11.9355209,10.2490637 11.8785104,10.260521 C11.8651617,10.2632037 11.8518015,10.2659581 11.8384439,10.2687838 C11.7939065,10.2782077 11.7495739,10.2883819 11.7053966,10.2994094 C11.6802789,10.3056822 11.655588,10.3121282 11.630968,10.3188536 C11.5851172,10.3313709 11.5390209,10.3450131 11.493322,10.3597219 C11.4820278,10.3633554 11.4703659,10.3671853 11.4587324,10.3710862 C11.4051582,10.3890568 11.3524651,10.4084232 11.3006053,10.429405 C11.2920482,10.4328677 11.2836478,10.4363184 11.2752704,10.4398123 C11.2257274,10.4604705 11.176821,10.4827201 11.1289357,10.5066005 C11.1195046,10.5113041 11.1101804,10.5160362 11.1008969,10.5208316 C11.0520295,10.5460752 11.0043336,10.5730413 10.9579913,10.6018759 L10.944934,10.6100725 L10.944934,10.6100725 C10.5119146,10.8846331 10.2008847,11.3241623 10.2008847,12.0291263 C10.2008847,12.5042817 10.3975632,12.9408856 10.72645,13.2850418 C10.7334801,13.2919777 10.7405011,13.2992328 10.7475811,13.3064459 C10.7739287,13.3336586 10.801606,13.3603677 10.830093,13.3864463 C10.8437876,13.3987208 10.8578425,13.4112803 10.8720863,13.4236868 C10.8997984,13.4480407 10.9284991,13.471799 10.9578962,13.4949442 C10.9790748,13.5114695 11.0006542,13.5278687 11.0225868,13.5439388 C11.0383392,13.5555941 11.0540163,13.5667766 11.0698653,13.5777917 C11.0965085,13.5962255 11.1239664,13.6144958 11.1519041,13.6322655 C11.1794546,13.6498487 11.2073755,13.66682 11.2357405,13.6832929 C11.253785,13.6937271 11.2718669,13.703929 11.2901217,13.7139285 C11.3148246,13.7274953 11.340077,13.740773 11.3656395,13.7536636 C11.3964193,13.7691626 11.4275281,13.7840695 11.4590637,13.7984023 C11.4721014,13.8043422 11.4853413,13.8102257 11.498654,13.8160079 C11.535933,13.8321897 11.5737213,13.8475652 11.6120477,13.8621227 C11.6333891,13.8702335 11.6549219,13.8780941 11.6766162,13.8856959 C11.7096447,13.8972683 11.7431364,13.9082711 11.7769853,13.9186546 C11.8009237,13.9259967 11.8248232,13.9329676 11.8488911,13.9396287 L11.9364145,13.9622992 L11.9364145,13.9622992 L11.9488462,13.965271 C12.0048855,13.9785292 12.0617565,13.990128 12.1193785,14 Z",u[n["default"].CANCEL_SOLID_NAIL_ICON]={width:16,height:16},l[n["default"].SOLID_NAIL_ICON]="M8.857,10.5 L8.53562352,15.0012707 C8.51555147,15.2822795 8.28172476,15.5 8,15.5 C7.71827524,15.5 7.48444853,15.2822795 7.46437648,15.0012707 L7.142,10.5 L2.5,10.5 C2.22385763,10.5 2,10.2761424 2,10 L2,9 C2,8.72385763 2.22385763,8.5 2.5,8.5 L3.2845037,8.50001974 C3.61601399,7.37449249 4.21943872,6.40310103 5.0000612,5.69950541 L5,2.5 L4.5,2.5 C4.22385763,2.5 4,2.27614237 4,2 L4,1 C4,0.723857625 4.22385763,0.5 4.5,0.5 L11.5,0.5 C11.7761424,0.5 12,0.723857625 12,1 L12,2 C12,2.27614237 11.7761424,2.5 11.5,2.5 L11,2.5 L11.0006126,5.70011282 C11.7809796,6.40372414 12.3841913,7.37499328 12.7155869,8.50032724 L13.5,8.5 C13.7761424,8.5 14,8.72385763 14,9 L14,10 C14,10.2761424 13.7761424,10.5 13.5,10.5 L8.857,10.5 Z",u[n["default"].SOLID_NAIL_ICON]={width:16,height:16};var d={},c={};d[n["default"].PIE_ICON]="M15.795,7.943L7.909,12.5L0.205,8.052C1.756,5.333,4.68,3.5,8.032,3.5C11.338,3.5,14.23,5.287,15.795,7.943z",c[n["default"].PIE_ICON]={width:16,height:16},d[n["default"].TREEMAP_ICON]="M9,12H3c-1.6,0-3-1.4-3-3l0-6c0-1.6,1.3-3,3-3l6,0c1.7,0,3,1.4,3,3v6C12,10.6,10.6,12,9,12z",c[n["default"].TREEMAP_ICON]={width:12,height:12},d[n["default"].ANCHOR_ICON]="M8.14285714,0 C10.9831787,0 13.2857143,2.28208775 13.2857143,5.09718564 C13.2857143,5.79331509 13.1449154,6.45685123 12.8900028,7.0613457 C12.4273659,8.02102223 11.999847,8.89317483 11.6074461,9.68208765 L11.31973,10.2582317 C9.77350714,13.3419196 8.82483893,15.0274547 8.4737254,15.6155379 L8.4164712,15.710436 C8.3573567,15.8071979 8.32512941,15.8553995 8.31978934,15.8579109 C8.22975377,16.047363 7.98320661,16.047363 7.88470258,15.8579109 L3.39571146,7.0613457 C3.14079893,6.45685123 3,5.79331509 3,5.09718564 C3,2.28208775 5.30253557,0 8.14285714,0 Z M8.14285714,3.42857143 C7.19608329,3.42857143 6.42857143,4.19608329 6.42857143,5.14285714 C6.42857143,6.089631 7.19608329,6.85714286 8.14285714,6.85714286 C9.089631,6.85714286 9.85714286,6.089631 9.85714286,5.14285714 C9.85714286,4.19608329 9.089631,3.42857143 8.14285714,3.42857143 Z",c[n["default"].ANCHOR_ICON]={width:16,height:16},d[n["default"].DONUT_ICON]="M8.945,11.107c1.671,0,3.181,0.684,4.269,1.786l4.271-4.271c-4.686-4.686-12.284-4.686-16.971,0l4.216,4.216C5.815,11.768,7.302,11.107,8.945,11.107z",c[n["default"].DONUT_ICON]={width:18,height:18},d[n["default"].NORMAL_ICON]="M0,0L12,0L12,12L0,12Z",c[n["default"].NORMAL_ICON]={width:12,height:12},d[n["default"].BUBBLE_ICON]="M6,11.5c-1.47,0-2.851-0.572-3.889-1.611C1.072,8.851,0.5,7.47,0.5,6s0.572-2.851,1.611-3.889C3.149,1.072,4.53,0.5,6,0.5s2.851,0.572,3.889,1.611C10.928,3.149,11.5,4.53,11.5,6s-0.572,2.851-1.611,3.889C8.851,10.928,7.47,11.5,6,11.5z",c[n["default"].BUBBLE_ICON]={width:11,height:11},d[n["default"].NULL_MARKER]="M1,8L1,8c0-0.552,0.448-1,1-1h12c0.552,0,1,0.448,1,1v0c0,0.552-0.448,1-1,1H2C1.448,9,1,8.552,1,8z",c[n["default"].NULL_MARKER]={width:16,height:16},d[n["default"].CIRCLE]="M11,8c0,1.657-1.343,3-3,3S5,9.657,5,8s1.343-3,3-3S11,6.343,11,8z M14,7h-2.142C11.942,7.322,12,7.653,12,8s-0.058,0.678-0.142,1H14c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M4,8c0-0.347,0.058-0.678,0.142-1H2C1.448,7,1,7.448,1,8c0,0.552,0.448,1,1,1h2.142C4.058,8.678,4,8.347,4,8z",c[n["default"].CIRCLE]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].NULL_MARKER]="M0,0L12,0L12,12L0,12Z",c[n["default"].SCATTER_ICON+n["default"].NULL_MARKER]={width:12,height:12},d[n["default"].SCATTER_ICON+n["default"].NORMAL_ICON]="M0,0L12,0L12,12L0,12Z",c[n["default"].SCATTER_ICON+n["default"].NORMAL_ICON]={width:12,height:12},d[n["default"].SCATTER_ICON+n["default"].CIRCLE]="M4,8C2.897,8,1.897,7.551,1.173,6.827S0,5.103,0,4s0.449-2.103,1.173-2.827S2.897,0,4,0s2.103,0.449,2.827,1.173S8,2.897,8,4S7.551,6.103,6.827,6.827S5.103,8,4,8",c[n["default"].SCATTER_ICON+n["default"].CIRCLE]={width:8,height:8},d[n["default"].SQUARE]="M11,11H5V5h6V11z M14,7h-2v2h2c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M4,7H2C1.448,7,1,7.448,1,8c0,0.552,0.448,1,1,1h2V7z",c[n["default"].SQUARE]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].SQUARE]="M0,0h8c0,0,0,3.889,0,8C4,8,0,8,0,8V0z",c[n["default"].SCATTER_ICON+n["default"].SQUARE]={width:8,height:8},d[n["default"].DIAMOND]="M8,11L5,8l3-3l3,3L8,11z M14,7h-2.586l1,1l-1,1H14c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M3.586,8l1-1H2C1.448,7,1,7.448,1,8c0,0.552,0.448,1,1,1h2.586L3.586,8z",c[n["default"].DIAMOND]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].DIAMOND]="M0,4.5L4.502,0l4.5,4.5c0,0,0,0-4.5,4.5C0,4.5,0,4.5,0,4.5z",c[n["default"].SCATTER_ICON+n["default"].DIAMOND]={width:9,height:9},d[n["default"].TRIANGLE]="M5,10l3-5.196L11,10H5z M14,7h-3.577l1.155,2H14c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M5.577,7H2C1.448,7,1,7.448,1,8c0,0.552,0.448,1,1,1h2.423L5.577,7z",c[n["default"].TRIANGLE]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].TRIANGLE]="M4.5,0L9,8c0,0-4.617,0-9,0L4.5,0z",c[n["default"].SCATTER_ICON+n["default"].TRIANGLE]={width:9,height:8},d[n["default"].CIRCLE_HOLLOW]="M4.142,9H2C1.448,9,1,8.552,1,8c0-0.552,0.448-1,1-1h2.142C4.058,7.322,4,7.653,4,8S4.058,8.678,4.142,9zM14,7h-2.142C11.942,7.322,12,7.653,12,8s-0.058,0.678-0.142,1H14c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M8,7C7.449,7,7,7.449,7,8s0.449,1,1,1s1-0.449,1-1S8.551,7,8,7 M8,5c1.657,0,3,1.343,3,3s-1.343,3-3,3S5,9.657,5,8S6.343,5,8,5L8,5z",c[n["default"].CIRCLE_HOLLOW]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].CIRCLE_HOLLOW]="M4,2c1.102,0,2,0.898,2,2S5.102,6,4,6S2,5.102,2,4S2.898,2,4,2 M4,0C1.791,0,0,1.791,0,4s1.791,4,4,4s4-1.791,4-4S6.209,0,4,0",c[n["default"].SCATTER_ICON+n["default"].CIRCLE_HOLLOW]={width:8,height:8},d[n["default"].SQUARE_HOLLOW]="M4,9H2C1.448,9,1,8.552,1,8c0-0.552,0.448-1,1-1h2V9z M14,7h-2v2h2c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M9,7H7v2h2V7 M11,5v6H5V5H11L11,5z",c[n["default"].SQUARE_HOLLOW]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].SQUARE_HOLLOW]="M6,6H2V2h4V6z M8,0H0v8h8V0z",c[n["default"].SCATTER_ICON+n["default"].SQUARE_HOLLOW]={width:8,height:8},d[n["default"].DIAMOND_HOLLOW]="M4.157,9H2C1.448,9,1,8.552,1,8c0-0.552,0.448-1,1-1h2.157l-1,1L4.157,9z M14,7h-2.157l1,1l-1,1H14c0.552,0,1-0.448,1-1C15,7.448,14.552,7,14,7z M8,5.986L5.986,8L8,10.014L10.014,8L8,5.986 M8,4.571L11.429,8L8,11.429L4.571,8L8,4.571L8,4.571z",c[n["default"].DIAMOND_HOLLOW]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].DIAMOND_HOLLOW]="M2.121,4.999L5,2.121l2.878,2.878L5,7.879L2.121,4.999z M5,0L0,4.999L5,10l4.999-5.001L5,0z",c[n["default"].SCATTER_ICON+n["default"].DIAMOND_HOLLOW]={width:10,height:10},d[n["default"].TRIANGLE_HOLLOW]="M4.5,9H2C1.448,9,1,8.552,1,8s0.448-1,1-1h3.655L4.5,9z M14,7h-3.655L11.5,9H14c0.552,0,1-0.448,1-1S14.552,7,14,7z M8,6.938L6.232,10h3.536L8,6.938 M8,4.938L11.5,11h-7L8,4.938L8,4.938z",c[n["default"].TRIANGLE_HOLLOW]={width:16,height:16},d[n["default"].SCATTER_ICON+n["default"].TRIANGLE_HOLLOW]="M5.001,3.34L7.402,7.5H2.598L5.001,3.34z M5.001,0.34L0,9h10L5.001,0.34z",c[n["default"].SCATTER_ICON+n["default"].TRIANGLE_HOLLOW]={width:10,height:9},d[n["default"].SOLID_NAIL_ICON]=l[n["default"].SOLID_NAIL_ICON],c[n["default"].SOLID_NAIL_ICON]=u[n["default"].SOLID_NAIL_ICON],d[n["default"].CANCEL_SOLID_NAIL_ICON]=l[n["default"].CANCEL_SOLID_NAIL_ICON],c[n["default"].CANCEL_SOLID_NAIL_ICON]=u[n["default"].CANCEL_SOLID_NAIL_ICON];var f={};f[n["default"].CANCEL_SOLID_NAIL_ICON]="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACPTkDJAAAEBklEQVRYCc2XW0hUQRjH13U1pcKyDOrBKIrIiF6kMrpQRFlSsEQGuu5GJGQPEZkEPRRdqKgIeimiC7jeyC5LF7IbLJX2ENEFIqiUQKlAUyINNXW333fYOZxdz25nXaEGhm/mu/3/M9/MnF2b7R+3pNHAr6urmzYwMHCTXIGkpKRNJSUl36zmTZhAVVXV1EAg8ATA2QIKgQ/0lVZJ2K0yjeFXhk0DF59gMDiH7hdiMWJ0U8IE7Hb7TVbco2eMk0TCBFJSUj6D2WIkIGOrO5EQgfr6+oy+vr4HgC2IJGCVxIgPoQF8kRm4URfrYI6IQDzgikg0EnGXIF5wgH/HKoe+A1ybJdTyCN3r8XgqJaimpmbm0NDQRnTLmc4l2UTkWObjxG6lcUsqeCeW4OsU/8id0Ah4vd6l2BoMiY/hKAdrPTqdpCSIt5GnjEfpQnV19QFyHZR8RhKqBF4MxlXtZ14gzvECmvkDGITEIXZjE+Me8spjdUN8FYFGs8DR0Am4yuNyuXyM8+gtanEOMaalpW3v7e3NYLhR5qPRAG4mz3Pq/0LyUeZydqABEu84yAv7+/vHiF7fYpSpkLiGLhESXQCfJsdlt9vdLgCqQeA8qy6GhIty3FZ6nYAohAQv23UcNyiHOKQvOTl5Kyv8KTHcqlnkWUGfz3QKxBYznoFEBA9C8KiMwwhI4Eh2gkS1lNFdWFg4xGlfw7YfBiTmC0mMHELPMALxkiBRJ9s6U1bOqvcCfkpyWGnE3lK3IMyflfxOT0/fjFKvVZhD+OR0CFwerJPhpugzwB+za9tMCUiYgYQ/ehrusd3+TOyAV9CNO/oF2zmAypBbcHmo8jA/A3g+GF3aNVSGSMnvvOnoTD+1yjc1NfVjaCyHTWuAXsnJydmRm5s7oHTcgpWMe7GVcgtqlD4qgdra2smDg4P3cMxUzmaSqxsw6gF4DUApMkyPTyu6pdheGf1NCfj9/rS2trZbbOks5UxwJ+O36FYpnUiHwzEP8ZT+hr6C/sgE3Ma1O45tWBt2BqSOra2tlUj5gmmNhM3c8Tzqtg5F2MHka7lMnPA5pznbbL9C0pIYRoBaCdNCQ3QTq8wrLi7+ZDiYOgmI7vH5fBPY2npISG3zZRGG+JjDMAKAl+K9T0WQ8Gp2dvbqoqKi70qnSGC7E9Jldnd3a9ePHfKge8ljtEv5/03qTAFfi/Nd2GvnAoATrGo/MmiWxOTZPssPmd3iy4O0gDzjae+cTucPs3il0wiEkn0laBKAgxh3cmguKqdoMvLZJvY+d7ych+l9tJhIvVaCrKwsuTLtJJBntcAKuCRS5WConQkWkM+hbJL/imK30vQScPUcHR0ddklqJdDoE9rBS+jkpx383Y1G+389/gMn5fnTNGoooQAAAABJRU5ErkJggg==",f[n["default"].SOLID_NAIL_ICON]="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACPTkDJAAACIklEQVRYCe1WPU8CQRDlTolgYmEsTIhiQ2VnJ/obsJMCkFIsrPwJ/gB7WgwUWFDwB2xEa7TVxGhjgRQWYvg43yR3m1lk9/bOUxs3uezszLx5b2cXslZMM2q12gHCVcdxkpo0ZciyrHcEK+Vy+VyVZKsCrj8XlpzwLjan4/AToMNGEvMTcB8Bi7aGpSNAC+16vZ6dTCYV2HQfjAfO/9y27WqxWLyGPVEBtR0gYKlUugL5g6qAyk8YwurICasVoCoepf9fwH8HfDvQbrcXcZP3gl48whDWD6cVgJ+S1e/3a5i3/ApNxwnjYrX/NXPTQL7OZDKnKHTEfQHtzW63a7VarUsVTqmu0WisDofDRwAXVGBD/0c8Ht8oFAovs/KVRzAajY4jICfOBbfWLP7YzA40m83kYDB4QvtXZqICOnEhe4lEYj2fz9P7QBqSADxAqojug3ge85KU+f3FG4SMUOYCD5SKV046AhAf4ltGMGpy4lui2sThkdMsCeCB37IlAWjR808TT3PQWYuBB0QWi208QKS7IRJk4wztXCOXW/REDn9dob4D7w2PmBDxfGHjwtJDZYccENDBxdoVwQCGdAQBcJT6yvK5zdz+ZmgB2HXPK89tz2c6hxaA9vNdCzGmxF5eaAEoIEinxHi1jeZIBHAxRqwsKbQAnLs4Am6z2kbmdwSII/iTSzgej3kHhBijbbOk0B1Ip9O32HmHvlQqdcdqBjI/AacJs3z36jxpAAAAAElFTkSuQmCC";var p={getLegendIconSizeAndScale:function(t,e){if(r["default"].ielt9)return function(t){var e=c[t]?c[t]:c[n["default"].NORMAL_ICON];return{scale:1,iconWidth:e.width,width:e.width,height:e.height}}(t);var i=function(t){return u[t]?u[t]:u[n["default"].NORMAL_ICON]}(t),o=a["default"].includes(h,t)||!u[t]?.85*e:e,s=o/i.width;return{scale:s,iconWidth:o,width:e,height:s*i.height}},getLegendIconPath:function(t){return r["default"].ielt9?d[t]:l[t]},getLegendIconPng:function(t){return f[t]},hasIcon:function(t){return l[t]},getLegendOuterBounds:function(t,e){var i=e.borderWidth||0,n=e.shadow?o.BACKGROUND_SHADOW_FILTER.deviation:0;return{x:t.x-i/2-n,y:t.y-i/2-n,width:t.width+i+2*n,height:t.height+i+2*n}},maxIconSize:18};e["default"]=p},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.BACKGROUND_SHADOW_FILTER=void 0,e.renderRectangleBackground=function(t,e,i,n){if(!t)return;e.backgroundImage||(t.imageFill&&t.imageFill.remove(),t.imageFill=null);e.backgroundColor&&"object"==typeof e.backgroundColor||(t.gradientFill&&t.gradientFill.remove(),t.gradientFill=null);e.shadow||(t.backgroundShadowFilter&&t.backgroundShadowFilter.remove(),t.backgroundShadowFilter=null);var o=e.borderWidth||0,s=o/2,h=a["default"].rectSubPixelOpt(i.x+s,i.y+s,Math.max(i.width-o,0),Math.max(i.height-o,0),o);h.rx=h.ry=e.borderRadius||0;var d=function(t,e,i,n){var a={fill:u(t,e,i,n),stroke:e.borderColor||"none","stroke-width":e.borderWidth,filter:"none"};if(e.shadow){!(e.backgroundImage||e.backgroundColor&&0!==r["default"].getColorOpacity(e.backgroundColor)||e.borderColor&&0!==r["default"].getColorOpacity(e.borderColor)&&0!==e.borderWidth)&&(a.stroke="rgb(238,238,238)",a["stroke-width"]=1),a.filter=function(t,e){var i=l.dx,n=l.dy,a=l.opacity,r=l.deviation,o=l.r,s=l.g,u=l.b;return t.backgroundShadowFilter=t.backgroundShadowFilter||e.createDropShadowFilter(i,n,a,r,o,s,u),e.toPatternProperty(t.backgroundShadowFilter)}(t,n)}return a}(t,e,i,n);return t.backgroundRect=t.backgroundRect||n.rect().addTo(t),t.backgroundRect.attr(h).style(d),t.backgroundRect};var n=i(3),a=s(i(0)),r=s(i(6)),o=s(i(1));function s(t){return t&&t.__esModule?t:{"default":t}}var l={dx:0,dy:0,opacity:.4,deviation:3,r:0,g:0,b:0};function u(t,e,i,a){return e.backgroundColor||e.backgroundImage?e.backgroundImage?function(t,e,i,n){var a=i.x,r=i.y,s=i.width,l=i.height,u={x:a,y:r,width:s,height:l,patternUnits:"userSpaceOnUse"},h={x:0,y:0,width:s,height:l,preserveAspectRatio:"none"},d={options:{imageHeight:l,imageWidth:s},rect:{x:a,y:r,width:s,height:l},location:o["default"].BOTTOM_TO_TOP};return t.imageFill?n.updateImagePattern(t.imageFill,u,h,e.backgroundImage):t.imageFill=n.imagePattern(u,h,e.backgroundImage,d),n.toPatternProperty(t.imageFill)}(t,e,i,a):e.backgroundColor&&"object"==typeof e.backgroundColor?function(t,e,i,a){if(!(0,n.supportFillFilter)())return e.backgroundColor.startColor;var r=e.backgroundColor,o={x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2},s={offset:"0%","stop-color":r.startColor},l={offset:"100%","stop-color":r.endColor};return t.gradientFill?a.updateColorGradient(t.gradientFill,o,[s,l]):t.gradientFill=a.colorGradient(o,[s,l]),a.toPatternProperty(t.gradientFill)}(t,e,0,a):e.backgroundColor:"none"}e.BACKGROUND_SHADOW_FILTER=l},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.createGradientBackground=function(t,e,i,n){var a=function(t){return 100*t+"%"},r=a(n.x1),o=a(n.x2),s=a(n.y1),l=a(n.y2),u={x1:r,y1:s,x2:o,y2:l},h={offset:"0%","stop-color":n.startColor},d={offset:"100%","stop-color":n.endColor};t[e]?i.updateColorGradient(t[e],u,[h,d]):t[e]=i.colorGradient(u,[h,d]);return i.toPatternProperty(t[e])},e.gradientCircleImgURL=function(t,e){!function(){if(n)return;a=(0,o.createCanvas)(),n=a.getContext("2d")}();var i=t.startRadian,r=t.endRadian,l=t.clockwise,u=t.radius,h=t.lineWidth,d=t.isRoundLineCap,c=[2*u+h,2*u+h];f=c[0],p=c[1],a.width=f,a.height=p,a.style&&(a.style.cssText=a.style.cssText+"width: "+f+"px; height: "+p+"px;");var f,p;for(var g=function(t,e){return[t-Math.PI/2,e-Math.PI/2]}(i,r),m=g[0],v=g[1],_=e.startColor,y=e.endColor,A=function(t,e,i){i=i||100;for(var n=s["default"].getRGBAColorArray(t),a=s["default"].getRGBAColorArray(e),r=n[0],o=n[1],l=n[2],u=a[0],h=a[1],d=a[2],c=(u-r)/i,f=(h-o)/i,p=(d-l)/i,g=[],m=0;m<i;m++){var v="rgb("+parseInt(c*m+r)+","+parseInt(f*m+o)+","+parseInt(p*m+l)+")";g.push(v)}return g}(_,y),T=n,x=c[0]/2,b=c[1]/2,C=A.length-1,L=(v-m)/C,M=l?1/u:-1/u,P=m,S=0;S<C;S++){var w=A[S],E=A[S+1],O=x+Math.cos(P)*u,R=x+Math.cos(P+L)*u,k=b+Math.sin(P)*u,I=b+Math.sin(P+L)*u,D=T.createLinearGradient(O,k,R,I);D.addColorStop(0,w),D.addColorStop(1,E);var N=P+L;S!==C-1&&(N+=M),T.beginPath(),T.strokeStyle=D,T.fillStyle=D,T.arc(x,b,u,P,N,!l),T.lineWidth=h,T.lineCap=!d||0!==S&&S!==C-1?"butt":"round",T.fill(),T.stroke(),T.closePath(),P+=L}return a.toDataURL("image/png")},e.gradualLocation=function(t){var e,i,n,a;switch(e=i=n=a="0%",t){case r["default"].BOTTOM_TO_TOP:i="100%";break;case r["default"].TOP_TO_BOTTOM:a="100%";break;case r["default"].LEFT_TO_RIGHT:n="100%";break;case r["default"].RIGHT_TO_LEFT:e="100%"}return{x1:e,y1:i,x2:n,y2:a}};var n,a,r=l(i(1)),o=i(3),s=l(i(6));function l(t){return t&&t.__esModule?t:{"default":t}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.createDivRichTextWrapper=l,e.createRichTextLabel=function(t){var e=t.series,i=e.vanchart.renderer,n=e._getPointTextLabelGroup(),r=i.text().attr("transform",a["default"].makeTranslate(e._labelTrans(t))).style({"pointer-events":"none"}),l=[(0,o.getHorizontalPadding)(t),0];s(i,r,t.labelContent,t.labelDim,l,!1),t.textGraphic=n.append(r)},e.createRichTextTooltip=function(t,e,i,n){void 0===n&&(n=5);var a=l(t,e,n),r=document.createElement("div");r.appendChild(a.node()),i.innerHTML=r.innerHTML,t.richTextTooltip=a,r.innerHTML=""},e.richTextSpanMount=s;var n,a=(n=i(0))&&n.__esModule?n:{"default":n},r=i(49),o=i(36);function s(t,e,i,n,a,o){var s=n.height/2,l=n.width/2,u=0,h=0;a&&2===a.length&&(u=a[0]/2,h=a[1]/2);var d=0;if(e.tspans=[],i&&i.length)for(var c=(0,r.getAlignShift)(i,n,u),f=(0,r.getBaseLineShift)(i),p=0,g=i.length;p<g;p++){var m=i[p],v=f[p];if(m&&m.length){for(var _=-l,y=-s,A=c[p],T=0,x=0,b=m.length;x<b;x++){var C=m[x],L=C.text,M=C.style,P=C.dim,S=.85*P.height;e.tspans.push(t.vtspan(o).style({"margin-top":-s+"px","text-align":"center","white-space":"nowrap"}).attr("y",h+d+v[x]).attr("x",0).attr("dy",y+S).attr("dx",_+A).style({color:M.color,fontFamily:M.fontFamily,fontSize:M.fontSize,fontStyle:M.fontStyle,fontWeight:M.fontWeight,textDecoration:M.textDecoration}).textContent(L).addTo(e)),_+=P.width,T=Math.max(T,P.height)}d+=T+r.LABEL_GAP}}}function l(t,e,i,n){void 0===i&&(i=0),void 0===n&&(n=[0,0]);var o=t.series.vanchart.renderer,l=(0,r.getRichTextDim)(e),u=o.vtext(!0).attr("transform",a["default"].makeTranslate({x:l.width/2+i,y:l.height/2+i})).style({"pointer-events":"none"});return s(o,u,e,l,n,!0),u}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.LABEL_GAP=void 0,e.getAlignShift=function(t,e,i){var n=e.width;if(t&&t.length){for(var a=[],r=0,o=t.length;r<o;r++){var s=t[r],l=i,u="",h=0;if(s&&s.length){h=0,u="";for(var d=0,c=s.length;d<c;d++){var f=s[d],p=f.dim,g=f.style;h+=p.width,u=u||g.textAlign}}"center"===u.trim()&&(l=(n-h)/2),"right"===u.trim()&&(l=n-h-i),a.push(l)}return a}},e.getBaseLineShift=function(t){if(t&&t.length){for(var e=[],i=0,n=t.length;i<n;i++){var a=t[i];if(a&&a.length){for(var r=[],o=0,s=0,l=a.length;s<l;s++){var u=a[s].dim;o=Math.max(o,u.height)}for(var h=0,d=a.length;h<d;h++){var c=a[h].dim,f=(o-c.height)/2;r.push(f)}e.push(r)}}return e}},e.getLabelRichTextDetail=function(t,e,i,n){return m(t,e,i,n,!1)},e.getRichTextDim=function(t){var e=0,i=0;if(t&&t.length){for(var n=0,a=t.length;n<a;n++){var r=t[n],o=0,s=0;if(r&&r.length)for(var l=0,u=r.length;l<u;l++){var h=r[l].dim;o+=h.width,s=Math.max(s,h.height)}e=Math.max(e,o),i+=s+2}i-=2}return{width:e,height:i}},e.getTooltipRichTextDetail=function(t,e,i,n){return m(t,e,i,n,!0)};var n=u(i(0)),a=i(2),r=i(76),o=i(41),s=u(i(1)),l=i(15);function u(t){return t&&t.__esModule?t:{"default":t}}var h="#ffffff";function d(t,e,i,a){return-1!==a.indexOf(o.VALUE)||-1!==a.indexOf(o.SIZE)?n["default"].format(t.originalValue,i.valueFormat):c(t,e,i,a)}function c(t,e,i,a){var r=o.propMap[a];if(r&&2===r.length){var s=r[0],l=r[1],u=t[s],h=i[l]||e._getTooltipFormatFn&&e._getTooltipFormatFn(s);return n["default"].format(u,h)}return""}function f(t,e,i,r){if((0,a.isEmpty)(r))return"";var l=r.text;if(r.isField){var u=l.substring(1),h=e.type;return h===s["default"].LINE_MAP?function(t,e,i,n){var a=t.options;return-1!==n.indexOf(o.FROM)&&-1!==n.indexOf(o.TO)?a.from.name+"→"+a.to.name:d(t,e,i,n)}(t,e,i,u):e.vanchart.isMap()?d(t,e,i,u):h===s["default"].BUBBLE_CHART||h===s["default"].SCATTER_CHART?function(t,e,i,a){var r=t.options;return a===o.X?n["default"].format(r.x,i.XFormat):a===o.Y?n["default"].format(r.y,i.YFormat):a===o.SIZE?n["default"].format(r.size,i.sizeFormat):c(t,e,i,a)}(t,e,i,u):h===s["default"].BOX_CHART?function(t,e,i,r){var s=t.dataResult;if(null==s)return"";var l=[s.number,s.max,s.q3,s.median,s.q1,s.min],u=[i.dataNumberFormat,i.dataMaxFormat,i.dataQ3Format,i.dataMedianFormat,i.dataQ1Format,i.dataMinFormat],h=[o.DATA_NUMBER,o.DATA_MAX,o.DATA_Q3,o.DATA_MEDIAN,o.DATA_Q1,o.DATA_MIN].indexOf(r);if(-1!==h)return n["default"].format(l[h],u[h]);if(r===o.DATA_OUTLIER){if((0,a.hasDefined)(t.outlierData)){var d=t.outlierData.outlier;if((0,a.hasDefined)(d))return n["default"].format(d,i.dataOutlierFormat)}return""}return c(t,e,i,r)}(t,e,i,u):(0,a.hasNotDefined)(o.propMap[u])?function(t,e,i,a){var r=i[a.text]||{},o=r.format,s=r.formula,l=t.options[s];return l&&o?n["default"].format(l,o):""}(t,0,i,r):c(t,e,i,u)}return l}function p(t,e){return{fontSize:12*(0,l.autoFitFontScale)(t.series.vanchart)+"px",fontFamily:"Verdana",color:e?h:t.autoLabelColor(),textAlign:"left"}}function g(t,e,i,n,r){if(null==e)return i;var o=(0,l.autoFitFontScale)(t.series.vanchart);return(0,a.isEmpty)(e.fontSize)?e.fontSize=i.fontSize:e.fontSize=parseFloat(e.fontSize)*o+"px",(0,a.isEmpty)(e.fontFamily)&&(e.fontFamily=i.fontFamily),(0,a.isEmpty)(e.color)&&(e.color=n?i.color:r,e.autoColor=!n),e}function m(t,e,i,o,s){var l=t.series;if((0,a.isEmpty)(e))return[];for(var u=[],d=l&&l.vanchart.isMap(),c=(0,r.richTextParse)(e),m=0,v=c.length;m<v;m++){var _=c[m];if(_&&_.length){for(var y=[],A=0,T=_.length;A<T;A++){var x=_[A],b=s?h:t.autoLabelColor(),C=g(t,x.style,p(t,s),i,b),L=f(t,l,o,x)||"",M=n["default"].getTextDimension(L,C,s||d);y.push({text:L,style:C,dim:M})}u.push(y)}}return u}e.LABEL_GAP=2},function(t,e,i){"use strict";
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */
var n;n=function(){function t(t){return"function"==typeof t}var n=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},a=0,r=void 0,o=void 0,s=function(t,e){p[a]=t,p[a+1]=e,2===(a+=2)&&(o?o(g):A())},l="undefined"!=typeof window?window:undefined,u=l||{},h=u.MutationObserver||u.WebKitMutationObserver,d="undefined"==typeof self&&void 0!==e&&"[object process]"==={}.toString.call(e),c="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function f(){var t=setTimeout;return function(){return t(g,1)}}var p=new Array(1e3);function g(){for(var t=0;t<a;t+=2)(0,p[t])(p[t+1]),p[t]=undefined,p[t+1]=undefined;a=0}var m,v,_,y,A=void 0;function T(t,e){var i=this,n=new this.constructor(C);n[b]===undefined&&D(n);var a=i._state;if(a){var r=arguments[a-1];s((function(){return k(a,n,r,i._result)}))}else O(i,n,t,e);return n}function x(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(C);return P(e,t),e}d?A=function(){return e.nextTick(g)}:h?(v=0,_=new h(g),y=document.createTextNode(""),_.observe(y,{characterData:!0}),A=function(){y.data=v=++v%2}):c?((m=new MessageChannel).port1.onmessage=g,A=function(){return m.port2.postMessage(0)}):A=l===undefined?function(){try{var t=Function("return this")().require("vertx");return void 0!==(r=t.runOnLoop||t.runOnContext)?function(){r(g)}:f()}catch(e){return f()}}():f();var b=Math.random().toString(36).substring(2);function C(){}var L=void 0;function M(e,i,n){i.constructor===e.constructor&&n===T&&i.constructor.resolve===x?function(t,e){1===e._state?w(t,e._result):2===e._state?E(t,e._result):O(e,undefined,(function(e){return P(t,e)}),(function(e){return E(t,e)}))}(e,i):n===undefined?w(e,i):t(n)?function(t,e,i){s((function(t){var n=!1,a=function(t,e,i,n){try{t.call(e,i,n)}catch(a){return a}}(i,e,(function(i){n||(n=!0,e!==i?P(t,i):w(t,i))}),(function(e){n||(n=!0,E(t,e))}),t._label);!n&&a&&(n=!0,E(t,a))}),t)}(e,i,n):w(e,i)}function P(t,e){if(t===e)E(t,new TypeError("You cannot resolve a promise with itself"));else if(a=typeof(n=e),null===n||"object"!==a&&"function"!==a)w(t,e);else{var i=void 0;try{i=e.then}catch(r){return void E(t,r)}M(t,e,i)}var n,a}function S(t){t._onerror&&t._onerror(t._result),R(t)}function w(t,e){t._state===L&&(t._result=e,t._state=1,0!==t._subscribers.length&&s(R,t))}function E(t,e){t._state===L&&(t._state=2,t._result=e,s(S,t))}function O(t,e,i,n){var a=t._subscribers,r=a.length;t._onerror=null,a[r]=e,a[r+1]=i,a[r+2]=n,0===r&&t._state&&s(R,t)}function R(t){var e=t._subscribers,i=t._state;if(0!==e.length){for(var n=void 0,a=void 0,r=t._result,o=0;o<e.length;o+=3)n=e[o],a=e[o+i],n?k(i,n,a,r):a(r);t._subscribers.length=0}}function k(e,i,n,a){var r=t(n),o=void 0,s=void 0,l=!0;if(r){try{o=n(a)}catch(u){l=!1,s=u}if(i===o)return void E(i,new TypeError("A promises callback cannot return that same promise."))}else o=a;i._state!==L||(r&&l?P(i,o):!1===l?E(i,s):1===e?w(i,o):2===e&&E(i,o))}var I=0;function D(t){t[b]=I++,t._state=undefined,t._result=undefined,t._subscribers=[]}var N=function(){function t(t,e){this._instanceConstructor=t,this.promise=new t(C),this.promise[b]||D(this.promise),n(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?w(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&w(this.promise,this._result))):E(this.promise,new Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var e=0;this._state===L&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var i=this._instanceConstructor,n=i.resolve;if(n===x){var a=void 0,r=void 0,o=!1;try{a=t.then}catch(l){o=!0,r=l}if(a===T&&t._state!==L)this._settledAt(t._state,e,t._result);else if("function"!=typeof a)this._remaining--,this._result[e]=t;else if(i===B){var s=new i(C);o?E(s,r):M(s,t,a),this._willSettleAt(s,e)}else this._willSettleAt(new i((function(e){return e(t)})),e)}else this._willSettleAt(n(t),e)},t.prototype._settledAt=function(t,e,i){var n=this.promise;n._state===L&&(this._remaining--,2===t?E(n,i):this._result[e]=i),0===this._remaining&&w(n,this._result)},t.prototype._willSettleAt=function(t,e){var i=this;O(t,undefined,(function(t){return i._settledAt(1,e,t)}),(function(t){return i._settledAt(2,e,t)}))},t}(),B=function(){function e(t){this[b]=I++,this._result=this._state=undefined,this._subscribers=[],C!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e((function(e){P(t,e)}),(function(e){E(t,e)}))}catch(i){E(t,i)}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}())}return e.prototype["catch"]=function(t){return this.then(null,t)},e.prototype["finally"]=function(e){var i=this,n=i.constructor;return t(e)?i.then((function(t){return n.resolve(e()).then((function(){return t}))}),(function(t){return n.resolve(e()).then((function(){throw t}))})):i.then(e,e)},e}();return B.prototype.then=T,B.all=function(t){return new N(this,t).promise},B.race=function(t){var e=this;return n(t)?new e((function(i,n){for(var a=t.length,r=0;r<a;r++)e.resolve(t[r]).then(i,n)})):new e((function(t,e){return e(new TypeError("You must pass an array to race."))}))},B.resolve=x,B.reject=function(t){var e=new this(C);return E(e,t),e},B._setScheduler=function(t){o=t},B._setAsap=function(t){s=t},B._asap=s,B.polyfill=function(){var t=void 0;if(void 0!==i)t=i;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(a){throw new Error("polyfill failed because global object is unavailable in this environment")}var e=t.Promise;if(e){var n=null;try{n=Object.prototype.toString.call(e.resolve())}catch(a){}if("[object Promise]"===n&&!e.cast)return}t.Promise=B},B.Promise=B,B},t.exports=n()}).call(this,i(255),i(256))},function(t,e,i){"use strict";var n,a,r=t.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function l(t){if(n===setTimeout)return setTimeout(t,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(e){try{return n.call(null,t,0)}catch(e){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o}catch(t){n=o}try{a="function"==typeof clearTimeout?clearTimeout:s}catch(t){a=s}}();var u,h=[],d=!1,c=-1;function f(){d&&u&&(d=!1,u.length?h=u.concat(h):c=-1,h.length&&p())}function p(){if(!d){var t=l(f);d=!0;for(var e=h.length;e;){for(u=h,h=[];++c<e;)u&&u[c].run();c=-1,e=h.length}u=null,d=!1,function(t){if(a===clearTimeout)return clearTimeout(t);if((a===s||!a)&&clearTimeout)return a=clearTimeout,clearTimeout(t);try{a(t)}catch(e){try{return a.call(null,t)}catch(e){return a.call(this,t)}}}(t)}}function g(t,e){this.fun=t,this.array=e}function m(){}r.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var i=1;i<arguments.length;i++)e[i-1]=arguments[i];h.push(new g(t,e)),1!==h.length||d||l(p)},g.prototype.run=function(){this.fun.apply(null,this.array)},r.title="browser",r.browser=!0,r.env={},r.argv=[],r.version="",r.versions={},r.on=m,r.addListener=m,r.once=m,r.off=m,r.removeListener=m,r.removeAllListeners=m,r.emit=m,r.prependListener=m,r.prependOnceListener=m,r.listeners=function(t){return[]},r.binding=function(t){throw new Error("process.binding is not supported")},r.cwd=function(){return"/"},r.chdir=function(t){throw new Error("process.chdir is not supported")},r.umask=function(){return 0}},function(t,e,i){"use strict";var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(a){"object"==typeof window&&(n=window)}t.exports=n}])["default"]}));