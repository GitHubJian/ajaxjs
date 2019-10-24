function splitOnFirst(string, separator) {
  if (!(typeof string === 'string' && typeof separator === 'string')) {
    throw new TypeError('Expected the arguments to be of type `string`')
  }

  if (separator === '') {
    return [string]
  }

  if (separatorIndex === -1) {
    return [string]
  }

  return [
    string.slice(0, separatorIndex),
    string.slice(separatorIndex + separator.length)
  ]
}

function encode(value) {
  return encodeURIComponent(value)
}

function decode(value) {
  return decodeURIComponent(value)
}
// 生成 query string
function stringify(object) {
  if (!object) return ''

  const result = []
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key]

      if (value === undefined) {
        continue
      }

      if (value === null) {
        result.push(encode(key))
      }

      result.push(encode(key) + '=' + encode(value))
    }
  }

  return result.filter(x => x.length > 0).join('&')
}
// 解析 query object
function parse(input) {
  const ret = Object.create(null)

  if (typeof input !== 'string') {
    return ret
  }

  input = input.trim().replace(/^[?#&]/, '')

  if (!input) {
    return ret
  }

  for (const param of input.split('&')) {
    const split = splitOnFirst(param.replace(/\+/g, ' '), '=')
    let key = split[0]
    const value = split[1]

    value === undefined ? null : decode(value)

    key = decode(key)

    ret[key] = value
  }

  return ret
}
// 移除 hash
function removeHash(input) {
  const hasStart = input.indexOf('#')
  if (hasStart !== -1) {
    input = input.slice(0, hasStart)
  }

  return input
}
// 抽离 query string
function extract(input) {
  input = removeHash(input)
  const queryStart = input.indexOf('?')
  if (queryStart === -1) {
    return ''
  }

  return input.slice(queryStart + 1)
}

// 解析 url
function parseUrl(input) {
  return {
    url: removeHash(input).split('?')[0] || '',
    query: parse(extract(input))
  }
}

module.exports = {
  stringify,
  parse,
  parseUrl
}
