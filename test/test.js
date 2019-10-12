var $ = {}

$.isArray = function(v) {
  return Array.isArray(v)
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]'
}

function serialize(params, obj, traditional) {
  var type,
    array = $.isArray(obj)

  $.each(obj, function(key, value) {
    type = $.type(value)
    if (array) {
      params.add(value.name, value.value)
    } else if (type == 'array' || (!traditional && type == 'object')) {
      serialize(params, value, traditional, key)
    } else {
      params.add(key, value)
    }
  })
}

function serialize(params, obj) {
  for (var name in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, name)) {
      params.add(name, obj[name])
    }
  }
}

function param(obj) {
  var params = []
  params.add = function(key, value) {
    this.push(escape(key) + '=' + escape(value))
  }

  serialize(params, obj)

  return params.join('&').replace(/%20/g, '+')
}

$.param = function(obj, traditional) {
  var params = []
  params.add = function(key, value) {
    if ($.isFunction(value)) value = value()
    if (value == null) value = ''
    this.push(escape(key) + '=' + escape(value))
  }
  serialize(params, obj, traditional)
  return params.join('&').replace(/%20/g, '+')
}

console.log(
  $.param({
    a: 1,
    b: 2
  })
)
