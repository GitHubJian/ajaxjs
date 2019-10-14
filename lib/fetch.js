if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k

    if (this == null) {
      throw new TypeError('this is null or not defined')
    }

    var O = Object(this)

    var len = O.length >>> 0

    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function')
    }

    if (arguments.length > 1) {
      T = thisArg
    }

    k = 0

    while (k < len) {
      var kValue

      if (k in O) {
        kValue = O[k]
        callback.call(T, kValue, k, O)
      }

      k++
    }
  }
}

// typeof
// zepto.js
var class2type = {}
var toString = class2type.toString
var names = 'Boolean Number String Function Array Date RegExp Object Error'.split(
  ' '
)

for (var i = 0, len = names.length; i < len; i++) {
  var name = names[i]

  class2type['[object ' + name + ']'] = name.toLowerCase()
}

function type(obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object'
}

function isObject(value) {
  return type(value) === 'object'
}

function isFunction(value) {
  return type(value) == 'function'
}

function isArray(value) {
  return type(value) == 'array'
}

function Headers(headers) {
  this.map = {}

  if (headers instanceof Headers) {
    headers.forEach(function(value, name) {
      this.append(name, value)
    }, this)
  } else if (isArray(headers)) {
    headers.forEach(function(header) {
      this.append(header[0], header[1])
    }, this)
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name])
    }, this)
  }
}

var arr = [1, 2]

var h = {
  print: function(v) {
    console.log(v)
  }
}

// 很少用到数组的 thisArg 参数
// 今天就遇到了这个问题
arr.forEach(function(v) {
  this.print(v)
}, h)
