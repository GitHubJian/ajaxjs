var class2type = {}
var toString = class2type.toString

var types = [
  'Boolean',
  'Number',
  'String',
  'Function',
  'Array',
  'Date',
  'RegExp',
  'Object',
  'Error'
]

for (var i = 0; i < types.length; i++) {
  var name = types[i]
  class2type['[object ' + name + ']'] = name.toLowerCase()
}

function type(obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object'
}

var document = window.document,
  key,
  name,
  rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  scriptTypeRE = /^(?:text|application)\/javascript/i,
  xmlTypeRE = /^(?:text|application)\/xml/i,
  jsonType = 'application/json',
  htmlType = 'text/html',
  blankRE = /^\s*$/,
  originAnchor = document.createElement('a')

originAnchor.href = window.location.href

function empty() {}

function ajaxBeforeSend(xhr, settings) {
  var context = settings.context
  if (settings.beforeSend.call(context, xhr, settings) === false) {
    return false
  }
}

function ajaxDataFilter(data, type, settings) {
  if (settings.dataFilter == empty) return data
  var context = settings.context
  return settings.dataFilter.call(context, data, type)
}

function ajaxSuccess(data, xhr, settings) {
  var context = settings.context,
    status = 'success'
  settings.success.call(context, data, status, xhr)
  ajaxComplete(status, xhr, settings)
}

function ajaxError(error, type, xhr, settings) {
  var context = settings.context
  settings.error.call(context, xhr, type, error)
  ajaxComplete(type, xhr, settings)
}

function ajaxComplete(status, xhr, settings) {
  var context = settings.context
  settings.complete.call(context, xhr, status)
}

var ajaxSettings = {
  type: 'GET',
  beforeSend: empty,
  success: empty,
  error: empty,
  complete: empty,
  context: null,
  xhr: function() {
    return new window.XMLHttpRequest()
  },
  accepts: {
    script: 'text/javascript, application/javascript, application/x-javascript',
    json: jsonType,
    xml: 'application/xml, text/xml',
    html: htmlType,
    text: 'text/plain'
  },
  crossDomain: false,
  timeout: 0,
  processData: true,
  cache: true,
  dataFilter: empty
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

function mimeToDataType(mime) {
  if (mime) mime = mime.split(';', 2)[0]

  if (mime) {
    if (mime == htmlType) {
      return 'html'
    } else if (mime == jsonType) {
      return 'json'
    } else if (scriptTypeRE.test(mime)) {
      return 'script'
    } else if (xmlTypeRE.test(mime)) {
      return 'xml'
    }
  }

  return 'text'
}

function appendQuery(url, query) {
  if (query == '') return url
  return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

function serializeData(options) {
  if (options.processData && options.data && type(options.data) != 'string') {
    options.data = param(options.data)
  }
  if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
    options.url = appendQuery(options.url, options.data)
    options.data = undefined
  }
}

function ajax(options) {
  var settings = Object.assign({}, options || {}),
    urlAnchor,
    hashIndex

  for (key in ajaxSettings) {
    if (settings[key] === undefined) {
      settings[key] = ajaxSettings[key]
    }
  }

  if (!settings.crossDomain) {
    urlAnchor = document.createElement('a')
    urlAnchor.href = settings.url
    urlAnchor.href = urlAnchor.href
    settings.crossDomain =
      originAnchor.protocol + '//' + originAnchor.host !==
      urlAnchor.protocol + '//' + urlAnchor.host
  }

  if (!settings.url) {
    settings.url = window.location.toString()
  }
  if ((hashIndex = settings.url.indexOf('#')) > -1) {
    settings.url = settings.url.slice(0, hashIndex)
  }

  serializeData(settings)

  var dataType = settings.dataType

  if (settings.cache === false || (!options || options.cache !== true)) {
    settings.url = appendQuery(settings.url, '_=' + new Date().getTime())
  }

  var mime = settings.accepts[dataType],
    headers = {},
    setHeader = function(name, value) {
      headers[name.toLowerCase()] = [name, value]
    },
    protocol = /^([\w-]+:)\/\//.test(settings.url)
      ? RegExp.$1
      : window.location.protocol,
    xhr = settings.xhr(),
    nativeSetHeader = xhr.setRequestHeader,
    abortTimeout

  if (!settings.crossDomain) {
    setHeader('X-Requested-With', 'XMLHttpRequest')
  }
  setHeader('Accept', mime || '*/*')

  if ((mime = settings.mimeType || mime)) {
    if (mime.indexOf(',') > -1) {
      mime = mime.split(',', 2)[0]
    }

    xhr.overrideMimeType && xhr.overrideMimeType(mime)
  }

  if (
    settings.contentType ||
    (settings.contentType !== false &&
      settings.data &&
      settings.type.toUpperCase() != 'GET')
  ) {
    setHeader(
      'Content-Type',
      settings.contentType || 'application/x-www-form-urlencoded'
    )
  }

  if (settings.headers) {
    for (name in settings.headers) {
      setHeader(name, settings.headers[name])
    }
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      xhr.onreadystatechange = empty
      clearTimeout(abortTimeout)

      var result,
        error = false

      if (
        (xhr.status >= 200 && xhr.status < 300) ||
        xhr.status == 304 ||
        (xhr.status == 0 && protocol == 'file:')
      ) {
        dataType =
          dataType ||
          mimeToDataType(
            settings.mimeType || xhr.getResponseHeader('content-type')
          )

        if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob') {
          result = xhr.response
        } else {
          result = xhr.responseText

          try {
            result = ajaxDataFilter(result, dataType, settings)
            if (dataType == 'script') {
              ;(1, eval)(result)
            } else if (dataType == 'xml') {
              result = xhr.responseXML
            } else if (dataType == 'json') {
              result = blankRE.test(result) ? null : window.JSON.parse(result)
            }
          } catch (e) {
            error = e
          }

          if (error) {
            return ajaxError(error, 'parsererror', xhr, settings)
          }
        }

        ajaxSuccess(result, xhr, settings)
      } else {
        ajaxError(
          xhr.statusText || null,
          xhr.status ? 'error' : 'abort',
          xhr,
          settings
        )
      }
    }
  }

  if (ajaxBeforeSend(xhr, settings) === false) {
    xhr.abort()
    ajaxError(null, 'abort', xhr, settings)

    return xhr
  }

  var async = 'async' in settings ? settings.async : true
  xhr.open(
    settings.type,
    settings.url,
    async,
    settings.username,
    settings.password
  )

  if (settings.xhrFields) {
    for (name in settings.xhrFields) {
      xhr[name] = settings.xhrFields[name]
    }
  }

  for (name in headers) {
    nativeSetHeader.apply(xhr, headers[name])
  }

  if (settings.timeout > 0) {
    abortTimeout = setTimeout(function() {
      xhr.onreadystatechange = empty
      xhr.abort()
      ajaxError(null, 'timeout', xhr, settings)
    }, settings.timeout)
  }

  xhr.send(settings.data ? settings.data : null)

  return xhr
}

window.$fetch = function(options) {
  return new window.Promise(function(resolve, reject) {
    options.success = resolve
    options.error = reject

    ajax(options)
  })
}

window.$ajax = ajax
