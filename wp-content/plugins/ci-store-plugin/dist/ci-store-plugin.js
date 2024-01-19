(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("CIStore", [], factory);
	else if(typeof exports === 'object')
		exports["CIStore"] = factory();
	else
		root["CIStore"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 98:
/***/ (function(module, exports) {

var global = typeof self !== 'undefined' ? self : this;
var __self__ = (function () {
function F() {
this.fetch = false;
this.DOMException = global.DOMException
}
F.prototype = global;
return new F();
})();
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
})(__self__);
__self__.fetch.ponyfill = true;
// Remove "polyfill" property added by whatwg-fetch
delete __self__.fetch.polyfill;
// Choose between native implementation (global) or custom implementation (__self__)
// var ctx = global.fetch ? global : __self__;
var ctx = __self__; // this line disable service worker support temporarily
exports = ctx.fetch // To enable: import fetch from 'cross-fetch'
exports["default"] = ctx.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = ctx.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = ctx.Headers
exports.Request = ctx.Request
exports.Response = ctx.Response
module.exports = exports


/***/ }),

/***/ 263:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(537);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(667);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(770), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(711), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_2___ = new URL(/* asset import */ __webpack_require__(199), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_3___ = new URL(/* asset import */ __webpack_require__(204), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_4___ = new URL(/* asset import */ __webpack_require__(931), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_5___ = new URL(/* asset import */ __webpack_require__(486), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_6___ = new URL(/* asset import */ __webpack_require__(609), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_7___ = new URL(/* asset import */ __webpack_require__(469), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_8___ = new URL(/* asset import */ __webpack_require__(991), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_9___ = new URL(/* asset import */ __webpack_require__(122), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_10___ = new URL(/* asset import */ __webpack_require__(144), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_11___ = new URL(/* asset import */ __webpack_require__(221), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_12___ = new URL(/* asset import */ __webpack_require__(956), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_13___ = new URL(/* asset import */ __webpack_require__(460), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_14___ = new URL(/* asset import */ __webpack_require__(321), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_15___ = new URL(/* asset import */ __webpack_require__(281), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_16___ = new URL(/* asset import */ __webpack_require__(254), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_17___ = new URL(/* asset import */ __webpack_require__(647), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_18___ = new URL(/* asset import */ __webpack_require__(692), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_2___);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_3___);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_4___);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_5___);
var ___CSS_LOADER_URL_REPLACEMENT_6___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_6___);
var ___CSS_LOADER_URL_REPLACEMENT_7___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_7___);
var ___CSS_LOADER_URL_REPLACEMENT_8___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_8___);
var ___CSS_LOADER_URL_REPLACEMENT_9___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_9___);
var ___CSS_LOADER_URL_REPLACEMENT_10___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_10___);
var ___CSS_LOADER_URL_REPLACEMENT_11___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_11___);
var ___CSS_LOADER_URL_REPLACEMENT_12___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_12___);
var ___CSS_LOADER_URL_REPLACEMENT_13___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_13___);
var ___CSS_LOADER_URL_REPLACEMENT_14___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_14___);
var ___CSS_LOADER_URL_REPLACEMENT_15___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_15___);
var ___CSS_LOADER_URL_REPLACEMENT_16___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_16___);
var ___CSS_LOADER_URL_REPLACEMENT_17___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_17___);
var ___CSS_LOADER_URL_REPLACEMENT_18___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_18___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*!
 * Bootstrap  v5.3.2 (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */:root,[data-bs-theme=light]{--bs-blue: #0d6efd;--bs-indigo: #6610f2;--bs-purple: #6f42c1;--bs-pink: #d63384;--bs-red: #dc3545;--bs-orange: #fd7e14;--bs-yellow: #ffc107;--bs-green: #198754;--bs-teal: #20c997;--bs-cyan: #0dcaf0;--bs-black: #000;--bs-white: #fff;--bs-gray: #6c757d;--bs-gray-dark: #343a40;--bs-gray-100: #f8f9fa;--bs-gray-200: #e9ecef;--bs-gray-300: #dee2e6;--bs-gray-400: #ced4da;--bs-gray-500: #adb5bd;--bs-gray-600: #6c757d;--bs-gray-700: #495057;--bs-gray-800: #343a40;--bs-gray-900: #212529;--bs-primary: #0d6efd;--bs-secondary: #6c757d;--bs-success: #198754;--bs-info: #0dcaf0;--bs-warning: #ffc107;--bs-danger: #dc3545;--bs-light: #f8f9fa;--bs-dark: #212529;--bs-primary-rgb: 13, 110, 253;--bs-secondary-rgb: 108, 117, 125;--bs-success-rgb: 25, 135, 84;--bs-info-rgb: 13, 202, 240;--bs-warning-rgb: 255, 193, 7;--bs-danger-rgb: 220, 53, 69;--bs-light-rgb: 248, 249, 250;--bs-dark-rgb: 33, 37, 41;--bs-primary-text-emphasis: #052c65;--bs-secondary-text-emphasis: #2b2f32;--bs-success-text-emphasis: #0a3622;--bs-info-text-emphasis: #055160;--bs-warning-text-emphasis: #664d03;--bs-danger-text-emphasis: #58151c;--bs-light-text-emphasis: #495057;--bs-dark-text-emphasis: #495057;--bs-primary-bg-subtle: #cfe2ff;--bs-secondary-bg-subtle: #e2e3e5;--bs-success-bg-subtle: #d1e7dd;--bs-info-bg-subtle: #cff4fc;--bs-warning-bg-subtle: #fff3cd;--bs-danger-bg-subtle: #f8d7da;--bs-light-bg-subtle: #fcfcfd;--bs-dark-bg-subtle: #ced4da;--bs-primary-border-subtle: #9ec5fe;--bs-secondary-border-subtle: #c4c8cb;--bs-success-border-subtle: #a3cfbb;--bs-info-border-subtle: #9eeaf9;--bs-warning-border-subtle: #ffe69c;--bs-danger-border-subtle: #f1aeb5;--bs-light-border-subtle: #e9ecef;--bs-dark-border-subtle: #adb5bd;--bs-white-rgb: 255, 255, 255;--bs-black-rgb: 0, 0, 0;--bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));--bs-body-font-family: var(--bs-font-sans-serif);--bs-body-font-size:1rem;--bs-body-font-weight: 400;--bs-body-line-height: 1.5;--bs-body-color: #212529;--bs-body-color-rgb: 33, 37, 41;--bs-body-bg: #fff;--bs-body-bg-rgb: 255, 255, 255;--bs-emphasis-color: #000;--bs-emphasis-color-rgb: 0, 0, 0;--bs-secondary-color: rgba(33, 37, 41, 0.75);--bs-secondary-color-rgb: 33, 37, 41;--bs-secondary-bg: #e9ecef;--bs-secondary-bg-rgb: 233, 236, 239;--bs-tertiary-color: rgba(33, 37, 41, 0.5);--bs-tertiary-color-rgb: 33, 37, 41;--bs-tertiary-bg: #f8f9fa;--bs-tertiary-bg-rgb: 248, 249, 250;--bs-heading-color: inherit;--bs-link-color: #0d6efd;--bs-link-color-rgb: 13, 110, 253;--bs-link-decoration: underline;--bs-link-hover-color: #0a58ca;--bs-link-hover-color-rgb: 10, 88, 202;--bs-code-color: #d63384;--bs-highlight-color: #212529;--bs-highlight-bg: #fff3cd;--bs-border-width: 1px;--bs-border-style: solid;--bs-border-color: #dee2e6;--bs-border-color-translucent: rgba(0, 0, 0, 0.175);--bs-border-radius: 0.375rem;--bs-border-radius-sm: 0.25rem;--bs-border-radius-lg: 0.5rem;--bs-border-radius-xl: 1rem;--bs-border-radius-xxl: 2rem;--bs-border-radius-2xl: var(--bs-border-radius-xxl);--bs-border-radius-pill: 50rem;--bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);--bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);--bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);--bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075);--bs-focus-ring-width: 0.25rem;--bs-focus-ring-opacity: 0.25;--bs-focus-ring-color: rgba(13, 110, 253, 0.25);--bs-form-valid-color: #198754;--bs-form-valid-border-color: #198754;--bs-form-invalid-color: #dc3545;--bs-form-invalid-border-color: #dc3545}[data-bs-theme=dark]{color-scheme:dark;--bs-body-color: #dee2e6;--bs-body-color-rgb: 222, 226, 230;--bs-body-bg: #212529;--bs-body-bg-rgb: 33, 37, 41;--bs-emphasis-color: #fff;--bs-emphasis-color-rgb: 255, 255, 255;--bs-secondary-color: rgba(222, 226, 230, 0.75);--bs-secondary-color-rgb: 222, 226, 230;--bs-secondary-bg: #343a40;--bs-secondary-bg-rgb: 52, 58, 64;--bs-tertiary-color: rgba(222, 226, 230, 0.5);--bs-tertiary-color-rgb: 222, 226, 230;--bs-tertiary-bg: #2b3035;--bs-tertiary-bg-rgb: 43, 48, 53;--bs-primary-text-emphasis: #6ea8fe;--bs-secondary-text-emphasis: #a7acb1;--bs-success-text-emphasis: #75b798;--bs-info-text-emphasis: #6edff6;--bs-warning-text-emphasis: #ffda6a;--bs-danger-text-emphasis: #ea868f;--bs-light-text-emphasis: #f8f9fa;--bs-dark-text-emphasis: #dee2e6;--bs-primary-bg-subtle: #031633;--bs-secondary-bg-subtle: #161719;--bs-success-bg-subtle: #051b11;--bs-info-bg-subtle: #032830;--bs-warning-bg-subtle: #332701;--bs-danger-bg-subtle: #2c0b0e;--bs-light-bg-subtle: #343a40;--bs-dark-bg-subtle: #1a1d20;--bs-primary-border-subtle: #084298;--bs-secondary-border-subtle: #41464b;--bs-success-border-subtle: #0f5132;--bs-info-border-subtle: #087990;--bs-warning-border-subtle: #997404;--bs-danger-border-subtle: #842029;--bs-light-border-subtle: #495057;--bs-dark-border-subtle: #343a40;--bs-heading-color: inherit;--bs-link-color: #6ea8fe;--bs-link-hover-color: #8bb9fe;--bs-link-color-rgb: 110, 168, 254;--bs-link-hover-color-rgb: 139, 185, 254;--bs-code-color: #e685b5;--bs-highlight-color: #dee2e6;--bs-highlight-bg: #664d03;--bs-border-color: #495057;--bs-border-color-translucent: rgba(255, 255, 255, 0.15);--bs-form-valid-color: #75b798;--bs-form-valid-border-color: #75b798;--bs-form-invalid-color: #ea868f;--bs-form-invalid-border-color: #ea868f}*,*::before,*::after{box-sizing:border-box}@media(prefers-reduced-motion: no-preference){:root{scroll-behavior:smooth}}body{margin:0;font-family:var(--bs-body-font-family);font-size:var(--bs-body-font-size);font-weight:var(--bs-body-font-weight);line-height:var(--bs-body-line-height);color:var(--bs-body-color);text-align:var(--bs-body-text-align);background-color:var(--bs-body-bg);-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0,0,0,0)}hr{margin:1rem 0;color:inherit;border:0;border-top:var(--bs-border-width) solid;opacity:.25}h6,.h6,h5,.h5,h4,.h4,h3,.h3,h2,.h2,h1,.h1{margin-top:0;margin-bottom:.5rem;font-weight:500;line-height:1.2;color:var(--bs-heading-color)}h1,.h1{font-size:calc(1.375rem + 1.5vw)}@media(min-width: 1200px){h1,.h1{font-size:2.5rem}}h2,.h2{font-size:calc(1.325rem + 0.9vw)}@media(min-width: 1200px){h2,.h2{font-size:2rem}}h3,.h3{font-size:calc(1.3rem + 0.6vw)}@media(min-width: 1200px){h3,.h3{font-size:1.75rem}}h4,.h4{font-size:calc(1.275rem + 0.3vw)}@media(min-width: 1200px){h4,.h4{font-size:1.5rem}}h5,.h5{font-size:1.25rem}h6,.h6{font-size:1rem}p{margin-top:0;margin-bottom:1rem}abbr[title]{text-decoration:underline dotted;cursor:help;text-decoration-skip-ink:none}address{margin-bottom:1rem;font-style:normal;line-height:inherit}ol,ul{padding-left:2rem}ol,ul,dl{margin-top:0;margin-bottom:1rem}ol ol,ul ul,ol ul,ul ol{margin-bottom:0}dt{font-weight:700}dd{margin-bottom:.5rem;margin-left:0}blockquote{margin:0 0 1rem}b,strong{font-weight:bolder}small,.small{font-size:0.875em}mark,.mark{padding:.1875em;color:var(--bs-highlight-color);background-color:var(--bs-highlight-bg)}sub,sup{position:relative;font-size:0.75em;line-height:0;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}a{color:rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));text-decoration:underline}a:hover{--bs-link-color-rgb: var(--bs-link-hover-color-rgb)}a:not([href]):not([class]),a:not([href]):not([class]):hover{color:inherit;text-decoration:none}pre,code,kbd,samp{font-family:var(--bs-font-monospace);font-size:1em}pre{display:block;margin-top:0;margin-bottom:1rem;overflow:auto;font-size:0.875em}pre code{font-size:inherit;color:inherit;word-break:normal}code{font-size:0.875em;color:var(--bs-code-color);word-wrap:break-word}a>code{color:inherit}kbd{padding:.1875rem .375rem;font-size:0.875em;color:var(--bs-body-bg);background-color:var(--bs-body-color);border-radius:.25rem}kbd kbd{padding:0;font-size:1em}figure{margin:0 0 1rem}img,svg{vertical-align:middle}table{caption-side:bottom;border-collapse:collapse}caption{padding-top:.5rem;padding-bottom:.5rem;color:var(--bs-secondary-color);text-align:left}th{text-align:inherit;text-align:-webkit-match-parent}thead,tbody,tfoot,tr,td,th{border-color:inherit;border-style:solid;border-width:0}label{display:inline-block}button{border-radius:0}button:focus:not(:focus-visible){outline:0}input,button,select,optgroup,textarea{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}button,select{text-transform:none}[role=button]{cursor:pointer}select{word-wrap:normal}select:disabled{opacity:1}[list]:not([type=date]):not([type=datetime-local]):not([type=month]):not([type=week]):not([type=time])::-webkit-calendar-picker-indicator{display:none !important}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button}button:not(:disabled),[type=button]:not(:disabled),[type=reset]:not(:disabled),[type=submit]:not(:disabled){cursor:pointer}::-moz-focus-inner{padding:0;border-style:none}textarea{resize:vertical}fieldset{min-width:0;padding:0;margin:0;border:0}legend{float:left;width:100%;padding:0;margin-bottom:.5rem;font-size:calc(1.275rem + 0.3vw);line-height:inherit}@media(min-width: 1200px){legend{font-size:1.5rem}}legend+*{clear:left}::-webkit-datetime-edit-fields-wrapper,::-webkit-datetime-edit-text,::-webkit-datetime-edit-minute,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-year-field{padding:0}::-webkit-inner-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-color-swatch-wrapper{padding:0}::file-selector-button{font:inherit;-webkit-appearance:button}output{display:inline-block}iframe{border:0}summary{display:list-item;cursor:pointer}progress{vertical-align:baseline}[hidden]{display:none !important}.lead{font-size:1.25rem;font-weight:300}.display-1{font-size:calc(1.625rem + 4.5vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-1{font-size:5rem}}.display-2{font-size:calc(1.575rem + 3.9vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-2{font-size:4.5rem}}.display-3{font-size:calc(1.525rem + 3.3vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-3{font-size:4rem}}.display-4{font-size:calc(1.475rem + 2.7vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-4{font-size:3.5rem}}.display-5{font-size:calc(1.425rem + 2.1vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-5{font-size:3rem}}.display-6{font-size:calc(1.375rem + 1.5vw);font-weight:300;line-height:1.2}@media(min-width: 1200px){.display-6{font-size:2.5rem}}.list-unstyled{padding-left:0;list-style:none}.list-inline{padding-left:0;list-style:none}.list-inline-item{display:inline-block}.list-inline-item:not(:last-child){margin-right:.5rem}.initialism{font-size:0.875em;text-transform:uppercase}.blockquote{margin-bottom:1rem;font-size:1.25rem}.blockquote>:last-child{margin-bottom:0}.blockquote-footer{margin-top:-1rem;margin-bottom:1rem;font-size:0.875em;color:#6c757d}.blockquote-footer::before{content:"— "}.img-fluid{max-width:100%;height:auto}.img-thumbnail{padding:.25rem;background-color:var(--bs-body-bg);border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius);max-width:100%;height:auto}.figure{display:inline-block}.figure-img{margin-bottom:.5rem;line-height:1}.figure-caption{font-size:0.875em;color:var(--bs-secondary-color)}.container,.container-fluid,.container-xxl,.container-xl,.container-lg,.container-md,.container-sm{--bs-gutter-x: 1.5rem;--bs-gutter-y: 0;width:100%;padding-right:calc(var(--bs-gutter-x)*.5);padding-left:calc(var(--bs-gutter-x)*.5);margin-right:auto;margin-left:auto}@media(min-width: 576px){.container-sm,.container{max-width:540px}}@media(min-width: 768px){.container-md,.container-sm,.container{max-width:720px}}@media(min-width: 992px){.container-lg,.container-md,.container-sm,.container{max-width:960px}}@media(min-width: 1200px){.container-xl,.container-lg,.container-md,.container-sm,.container{max-width:1140px}}@media(min-width: 1400px){.container-xxl,.container-xl,.container-lg,.container-md,.container-sm,.container{max-width:1320px}}:root{--bs-breakpoint-xs: 0;--bs-breakpoint-sm: 576px;--bs-breakpoint-md: 768px;--bs-breakpoint-lg: 992px;--bs-breakpoint-xl: 1200px;--bs-breakpoint-xxl: 1400px}.row{--bs-gutter-x: 1.5rem;--bs-gutter-y: 0;display:flex;flex-wrap:wrap;margin-top:calc(-1*var(--bs-gutter-y));margin-right:calc(-0.5*var(--bs-gutter-x));margin-left:calc(-0.5*var(--bs-gutter-x))}.row>*{flex-shrink:0;width:100%;max-width:100%;padding-right:calc(var(--bs-gutter-x)*.5);padding-left:calc(var(--bs-gutter-x)*.5);margin-top:var(--bs-gutter-y)}.col{flex:1 0 0%}.row-cols-auto>*{flex:0 0 auto;width:auto}.row-cols-1>*{flex:0 0 auto;width:100%}.row-cols-2>*{flex:0 0 auto;width:50%}.row-cols-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-4>*{flex:0 0 auto;width:25%}.row-cols-5>*{flex:0 0 auto;width:20%}.row-cols-6>*{flex:0 0 auto;width:16.66666667%}.col-auto{flex:0 0 auto;width:auto}.col-1{flex:0 0 auto;width:8.33333333%}.col-2{flex:0 0 auto;width:16.66666667%}.col-3{flex:0 0 auto;width:25%}.col-4{flex:0 0 auto;width:33.33333333%}.col-5{flex:0 0 auto;width:41.66666667%}.col-6{flex:0 0 auto;width:50%}.col-7{flex:0 0 auto;width:58.33333333%}.col-8{flex:0 0 auto;width:66.66666667%}.col-9{flex:0 0 auto;width:75%}.col-10{flex:0 0 auto;width:83.33333333%}.col-11{flex:0 0 auto;width:91.66666667%}.col-12{flex:0 0 auto;width:100%}.offset-1{margin-left:8.33333333%}.offset-2{margin-left:16.66666667%}.offset-3{margin-left:25%}.offset-4{margin-left:33.33333333%}.offset-5{margin-left:41.66666667%}.offset-6{margin-left:50%}.offset-7{margin-left:58.33333333%}.offset-8{margin-left:66.66666667%}.offset-9{margin-left:75%}.offset-10{margin-left:83.33333333%}.offset-11{margin-left:91.66666667%}.g-0,.gx-0{--bs-gutter-x: 0}.g-0,.gy-0{--bs-gutter-y: 0}.g-1,.gx-1{--bs-gutter-x: 0.25rem}.g-1,.gy-1{--bs-gutter-y: 0.25rem}.g-2,.gx-2{--bs-gutter-x: 0.5rem}.g-2,.gy-2{--bs-gutter-y: 0.5rem}.g-3,.gx-3{--bs-gutter-x: 1rem}.g-3,.gy-3{--bs-gutter-y: 1rem}.g-4,.gx-4{--bs-gutter-x: 1.5rem}.g-4,.gy-4{--bs-gutter-y: 1.5rem}.g-5,.gx-5{--bs-gutter-x: 3rem}.g-5,.gy-5{--bs-gutter-y: 3rem}@media(min-width: 576px){.col-sm{flex:1 0 0%}.row-cols-sm-auto>*{flex:0 0 auto;width:auto}.row-cols-sm-1>*{flex:0 0 auto;width:100%}.row-cols-sm-2>*{flex:0 0 auto;width:50%}.row-cols-sm-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-sm-4>*{flex:0 0 auto;width:25%}.row-cols-sm-5>*{flex:0 0 auto;width:20%}.row-cols-sm-6>*{flex:0 0 auto;width:16.66666667%}.col-sm-auto{flex:0 0 auto;width:auto}.col-sm-1{flex:0 0 auto;width:8.33333333%}.col-sm-2{flex:0 0 auto;width:16.66666667%}.col-sm-3{flex:0 0 auto;width:25%}.col-sm-4{flex:0 0 auto;width:33.33333333%}.col-sm-5{flex:0 0 auto;width:41.66666667%}.col-sm-6{flex:0 0 auto;width:50%}.col-sm-7{flex:0 0 auto;width:58.33333333%}.col-sm-8{flex:0 0 auto;width:66.66666667%}.col-sm-9{flex:0 0 auto;width:75%}.col-sm-10{flex:0 0 auto;width:83.33333333%}.col-sm-11{flex:0 0 auto;width:91.66666667%}.col-sm-12{flex:0 0 auto;width:100%}.offset-sm-0{margin-left:0}.offset-sm-1{margin-left:8.33333333%}.offset-sm-2{margin-left:16.66666667%}.offset-sm-3{margin-left:25%}.offset-sm-4{margin-left:33.33333333%}.offset-sm-5{margin-left:41.66666667%}.offset-sm-6{margin-left:50%}.offset-sm-7{margin-left:58.33333333%}.offset-sm-8{margin-left:66.66666667%}.offset-sm-9{margin-left:75%}.offset-sm-10{margin-left:83.33333333%}.offset-sm-11{margin-left:91.66666667%}.g-sm-0,.gx-sm-0{--bs-gutter-x: 0}.g-sm-0,.gy-sm-0{--bs-gutter-y: 0}.g-sm-1,.gx-sm-1{--bs-gutter-x: 0.25rem}.g-sm-1,.gy-sm-1{--bs-gutter-y: 0.25rem}.g-sm-2,.gx-sm-2{--bs-gutter-x: 0.5rem}.g-sm-2,.gy-sm-2{--bs-gutter-y: 0.5rem}.g-sm-3,.gx-sm-3{--bs-gutter-x: 1rem}.g-sm-3,.gy-sm-3{--bs-gutter-y: 1rem}.g-sm-4,.gx-sm-4{--bs-gutter-x: 1.5rem}.g-sm-4,.gy-sm-4{--bs-gutter-y: 1.5rem}.g-sm-5,.gx-sm-5{--bs-gutter-x: 3rem}.g-sm-5,.gy-sm-5{--bs-gutter-y: 3rem}}@media(min-width: 768px){.col-md{flex:1 0 0%}.row-cols-md-auto>*{flex:0 0 auto;width:auto}.row-cols-md-1>*{flex:0 0 auto;width:100%}.row-cols-md-2>*{flex:0 0 auto;width:50%}.row-cols-md-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-md-4>*{flex:0 0 auto;width:25%}.row-cols-md-5>*{flex:0 0 auto;width:20%}.row-cols-md-6>*{flex:0 0 auto;width:16.66666667%}.col-md-auto{flex:0 0 auto;width:auto}.col-md-1{flex:0 0 auto;width:8.33333333%}.col-md-2{flex:0 0 auto;width:16.66666667%}.col-md-3{flex:0 0 auto;width:25%}.col-md-4{flex:0 0 auto;width:33.33333333%}.col-md-5{flex:0 0 auto;width:41.66666667%}.col-md-6{flex:0 0 auto;width:50%}.col-md-7{flex:0 0 auto;width:58.33333333%}.col-md-8{flex:0 0 auto;width:66.66666667%}.col-md-9{flex:0 0 auto;width:75%}.col-md-10{flex:0 0 auto;width:83.33333333%}.col-md-11{flex:0 0 auto;width:91.66666667%}.col-md-12{flex:0 0 auto;width:100%}.offset-md-0{margin-left:0}.offset-md-1{margin-left:8.33333333%}.offset-md-2{margin-left:16.66666667%}.offset-md-3{margin-left:25%}.offset-md-4{margin-left:33.33333333%}.offset-md-5{margin-left:41.66666667%}.offset-md-6{margin-left:50%}.offset-md-7{margin-left:58.33333333%}.offset-md-8{margin-left:66.66666667%}.offset-md-9{margin-left:75%}.offset-md-10{margin-left:83.33333333%}.offset-md-11{margin-left:91.66666667%}.g-md-0,.gx-md-0{--bs-gutter-x: 0}.g-md-0,.gy-md-0{--bs-gutter-y: 0}.g-md-1,.gx-md-1{--bs-gutter-x: 0.25rem}.g-md-1,.gy-md-1{--bs-gutter-y: 0.25rem}.g-md-2,.gx-md-2{--bs-gutter-x: 0.5rem}.g-md-2,.gy-md-2{--bs-gutter-y: 0.5rem}.g-md-3,.gx-md-3{--bs-gutter-x: 1rem}.g-md-3,.gy-md-3{--bs-gutter-y: 1rem}.g-md-4,.gx-md-4{--bs-gutter-x: 1.5rem}.g-md-4,.gy-md-4{--bs-gutter-y: 1.5rem}.g-md-5,.gx-md-5{--bs-gutter-x: 3rem}.g-md-5,.gy-md-5{--bs-gutter-y: 3rem}}@media(min-width: 992px){.col-lg{flex:1 0 0%}.row-cols-lg-auto>*{flex:0 0 auto;width:auto}.row-cols-lg-1>*{flex:0 0 auto;width:100%}.row-cols-lg-2>*{flex:0 0 auto;width:50%}.row-cols-lg-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-lg-4>*{flex:0 0 auto;width:25%}.row-cols-lg-5>*{flex:0 0 auto;width:20%}.row-cols-lg-6>*{flex:0 0 auto;width:16.66666667%}.col-lg-auto{flex:0 0 auto;width:auto}.col-lg-1{flex:0 0 auto;width:8.33333333%}.col-lg-2{flex:0 0 auto;width:16.66666667%}.col-lg-3{flex:0 0 auto;width:25%}.col-lg-4{flex:0 0 auto;width:33.33333333%}.col-lg-5{flex:0 0 auto;width:41.66666667%}.col-lg-6{flex:0 0 auto;width:50%}.col-lg-7{flex:0 0 auto;width:58.33333333%}.col-lg-8{flex:0 0 auto;width:66.66666667%}.col-lg-9{flex:0 0 auto;width:75%}.col-lg-10{flex:0 0 auto;width:83.33333333%}.col-lg-11{flex:0 0 auto;width:91.66666667%}.col-lg-12{flex:0 0 auto;width:100%}.offset-lg-0{margin-left:0}.offset-lg-1{margin-left:8.33333333%}.offset-lg-2{margin-left:16.66666667%}.offset-lg-3{margin-left:25%}.offset-lg-4{margin-left:33.33333333%}.offset-lg-5{margin-left:41.66666667%}.offset-lg-6{margin-left:50%}.offset-lg-7{margin-left:58.33333333%}.offset-lg-8{margin-left:66.66666667%}.offset-lg-9{margin-left:75%}.offset-lg-10{margin-left:83.33333333%}.offset-lg-11{margin-left:91.66666667%}.g-lg-0,.gx-lg-0{--bs-gutter-x: 0}.g-lg-0,.gy-lg-0{--bs-gutter-y: 0}.g-lg-1,.gx-lg-1{--bs-gutter-x: 0.25rem}.g-lg-1,.gy-lg-1{--bs-gutter-y: 0.25rem}.g-lg-2,.gx-lg-2{--bs-gutter-x: 0.5rem}.g-lg-2,.gy-lg-2{--bs-gutter-y: 0.5rem}.g-lg-3,.gx-lg-3{--bs-gutter-x: 1rem}.g-lg-3,.gy-lg-3{--bs-gutter-y: 1rem}.g-lg-4,.gx-lg-4{--bs-gutter-x: 1.5rem}.g-lg-4,.gy-lg-4{--bs-gutter-y: 1.5rem}.g-lg-5,.gx-lg-5{--bs-gutter-x: 3rem}.g-lg-5,.gy-lg-5{--bs-gutter-y: 3rem}}@media(min-width: 1200px){.col-xl{flex:1 0 0%}.row-cols-xl-auto>*{flex:0 0 auto;width:auto}.row-cols-xl-1>*{flex:0 0 auto;width:100%}.row-cols-xl-2>*{flex:0 0 auto;width:50%}.row-cols-xl-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-xl-4>*{flex:0 0 auto;width:25%}.row-cols-xl-5>*{flex:0 0 auto;width:20%}.row-cols-xl-6>*{flex:0 0 auto;width:16.66666667%}.col-xl-auto{flex:0 0 auto;width:auto}.col-xl-1{flex:0 0 auto;width:8.33333333%}.col-xl-2{flex:0 0 auto;width:16.66666667%}.col-xl-3{flex:0 0 auto;width:25%}.col-xl-4{flex:0 0 auto;width:33.33333333%}.col-xl-5{flex:0 0 auto;width:41.66666667%}.col-xl-6{flex:0 0 auto;width:50%}.col-xl-7{flex:0 0 auto;width:58.33333333%}.col-xl-8{flex:0 0 auto;width:66.66666667%}.col-xl-9{flex:0 0 auto;width:75%}.col-xl-10{flex:0 0 auto;width:83.33333333%}.col-xl-11{flex:0 0 auto;width:91.66666667%}.col-xl-12{flex:0 0 auto;width:100%}.offset-xl-0{margin-left:0}.offset-xl-1{margin-left:8.33333333%}.offset-xl-2{margin-left:16.66666667%}.offset-xl-3{margin-left:25%}.offset-xl-4{margin-left:33.33333333%}.offset-xl-5{margin-left:41.66666667%}.offset-xl-6{margin-left:50%}.offset-xl-7{margin-left:58.33333333%}.offset-xl-8{margin-left:66.66666667%}.offset-xl-9{margin-left:75%}.offset-xl-10{margin-left:83.33333333%}.offset-xl-11{margin-left:91.66666667%}.g-xl-0,.gx-xl-0{--bs-gutter-x: 0}.g-xl-0,.gy-xl-0{--bs-gutter-y: 0}.g-xl-1,.gx-xl-1{--bs-gutter-x: 0.25rem}.g-xl-1,.gy-xl-1{--bs-gutter-y: 0.25rem}.g-xl-2,.gx-xl-2{--bs-gutter-x: 0.5rem}.g-xl-2,.gy-xl-2{--bs-gutter-y: 0.5rem}.g-xl-3,.gx-xl-3{--bs-gutter-x: 1rem}.g-xl-3,.gy-xl-3{--bs-gutter-y: 1rem}.g-xl-4,.gx-xl-4{--bs-gutter-x: 1.5rem}.g-xl-4,.gy-xl-4{--bs-gutter-y: 1.5rem}.g-xl-5,.gx-xl-5{--bs-gutter-x: 3rem}.g-xl-5,.gy-xl-5{--bs-gutter-y: 3rem}}@media(min-width: 1400px){.col-xxl{flex:1 0 0%}.row-cols-xxl-auto>*{flex:0 0 auto;width:auto}.row-cols-xxl-1>*{flex:0 0 auto;width:100%}.row-cols-xxl-2>*{flex:0 0 auto;width:50%}.row-cols-xxl-3>*{flex:0 0 auto;width:33.33333333%}.row-cols-xxl-4>*{flex:0 0 auto;width:25%}.row-cols-xxl-5>*{flex:0 0 auto;width:20%}.row-cols-xxl-6>*{flex:0 0 auto;width:16.66666667%}.col-xxl-auto{flex:0 0 auto;width:auto}.col-xxl-1{flex:0 0 auto;width:8.33333333%}.col-xxl-2{flex:0 0 auto;width:16.66666667%}.col-xxl-3{flex:0 0 auto;width:25%}.col-xxl-4{flex:0 0 auto;width:33.33333333%}.col-xxl-5{flex:0 0 auto;width:41.66666667%}.col-xxl-6{flex:0 0 auto;width:50%}.col-xxl-7{flex:0 0 auto;width:58.33333333%}.col-xxl-8{flex:0 0 auto;width:66.66666667%}.col-xxl-9{flex:0 0 auto;width:75%}.col-xxl-10{flex:0 0 auto;width:83.33333333%}.col-xxl-11{flex:0 0 auto;width:91.66666667%}.col-xxl-12{flex:0 0 auto;width:100%}.offset-xxl-0{margin-left:0}.offset-xxl-1{margin-left:8.33333333%}.offset-xxl-2{margin-left:16.66666667%}.offset-xxl-3{margin-left:25%}.offset-xxl-4{margin-left:33.33333333%}.offset-xxl-5{margin-left:41.66666667%}.offset-xxl-6{margin-left:50%}.offset-xxl-7{margin-left:58.33333333%}.offset-xxl-8{margin-left:66.66666667%}.offset-xxl-9{margin-left:75%}.offset-xxl-10{margin-left:83.33333333%}.offset-xxl-11{margin-left:91.66666667%}.g-xxl-0,.gx-xxl-0{--bs-gutter-x: 0}.g-xxl-0,.gy-xxl-0{--bs-gutter-y: 0}.g-xxl-1,.gx-xxl-1{--bs-gutter-x: 0.25rem}.g-xxl-1,.gy-xxl-1{--bs-gutter-y: 0.25rem}.g-xxl-2,.gx-xxl-2{--bs-gutter-x: 0.5rem}.g-xxl-2,.gy-xxl-2{--bs-gutter-y: 0.5rem}.g-xxl-3,.gx-xxl-3{--bs-gutter-x: 1rem}.g-xxl-3,.gy-xxl-3{--bs-gutter-y: 1rem}.g-xxl-4,.gx-xxl-4{--bs-gutter-x: 1.5rem}.g-xxl-4,.gy-xxl-4{--bs-gutter-y: 1.5rem}.g-xxl-5,.gx-xxl-5{--bs-gutter-x: 3rem}.g-xxl-5,.gy-xxl-5{--bs-gutter-y: 3rem}}.table{--bs-table-color-type: initial;--bs-table-bg-type: initial;--bs-table-color-state: initial;--bs-table-bg-state: initial;--bs-table-color: var(--bs-emphasis-color);--bs-table-bg: var(--bs-body-bg);--bs-table-border-color: var(--bs-border-color);--bs-table-accent-bg: transparent;--bs-table-striped-color: var(--bs-emphasis-color);--bs-table-striped-bg: rgba(var(--bs-emphasis-color-rgb), 0.05);--bs-table-active-color: var(--bs-emphasis-color);--bs-table-active-bg: rgba(var(--bs-emphasis-color-rgb), 0.1);--bs-table-hover-color: var(--bs-emphasis-color);--bs-table-hover-bg: rgba(var(--bs-emphasis-color-rgb), 0.075);width:100%;margin-bottom:1rem;vertical-align:top;border-color:var(--bs-table-border-color)}.table>:not(caption)>*>*{padding:.5rem .5rem;color:var(--bs-table-color-state, var(--bs-table-color-type, var(--bs-table-color)));background-color:var(--bs-table-bg);border-bottom-width:var(--bs-border-width);box-shadow:inset 0 0 0 9999px var(--bs-table-bg-state, var(--bs-table-bg-type, var(--bs-table-accent-bg)))}.table>tbody{vertical-align:inherit}.table>thead{vertical-align:bottom}.table-group-divider{border-top:calc(var(--bs-border-width)*2) solid currentcolor}.caption-top{caption-side:top}.table-sm>:not(caption)>*>*{padding:.25rem .25rem}.table-bordered>:not(caption)>*{border-width:var(--bs-border-width) 0}.table-bordered>:not(caption)>*>*{border-width:0 var(--bs-border-width)}.table-borderless>:not(caption)>*>*{border-bottom-width:0}.table-borderless>:not(:first-child){border-top-width:0}.table-striped>tbody>tr:nth-of-type(odd)>*{--bs-table-color-type: var(--bs-table-striped-color);--bs-table-bg-type: var(--bs-table-striped-bg)}.table-striped-columns>:not(caption)>tr>:nth-child(even){--bs-table-color-type: var(--bs-table-striped-color);--bs-table-bg-type: var(--bs-table-striped-bg)}.table-active{--bs-table-color-state: var(--bs-table-active-color);--bs-table-bg-state: var(--bs-table-active-bg)}.table-hover>tbody>tr:hover>*{--bs-table-color-state: var(--bs-table-hover-color);--bs-table-bg-state: var(--bs-table-hover-bg)}.table-primary{--bs-table-color: #000;--bs-table-bg: #cfe2ff;--bs-table-border-color: #a6b5cc;--bs-table-striped-bg: #c5d7f2;--bs-table-striped-color: #000;--bs-table-active-bg: #bacbe6;--bs-table-active-color: #000;--bs-table-hover-bg: #bfd1ec;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-secondary{--bs-table-color: #000;--bs-table-bg: #e2e3e5;--bs-table-border-color: #b5b6b7;--bs-table-striped-bg: #d7d8da;--bs-table-striped-color: #000;--bs-table-active-bg: #cbccce;--bs-table-active-color: #000;--bs-table-hover-bg: #d1d2d4;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-success{--bs-table-color: #000;--bs-table-bg: #d1e7dd;--bs-table-border-color: #a7b9b1;--bs-table-striped-bg: #c7dbd2;--bs-table-striped-color: #000;--bs-table-active-bg: #bcd0c7;--bs-table-active-color: #000;--bs-table-hover-bg: #c1d6cc;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-info{--bs-table-color: #000;--bs-table-bg: #cff4fc;--bs-table-border-color: #a6c3ca;--bs-table-striped-bg: #c5e8ef;--bs-table-striped-color: #000;--bs-table-active-bg: #badce3;--bs-table-active-color: #000;--bs-table-hover-bg: #bfe2e9;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-warning{--bs-table-color: #000;--bs-table-bg: #fff3cd;--bs-table-border-color: #ccc2a4;--bs-table-striped-bg: #f2e7c3;--bs-table-striped-color: #000;--bs-table-active-bg: #e6dbb9;--bs-table-active-color: #000;--bs-table-hover-bg: #ece1be;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-danger{--bs-table-color: #000;--bs-table-bg: #f8d7da;--bs-table-border-color: #c6acae;--bs-table-striped-bg: #eccccf;--bs-table-striped-color: #000;--bs-table-active-bg: #dfc2c4;--bs-table-active-color: #000;--bs-table-hover-bg: #e5c7ca;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-light{--bs-table-color: #000;--bs-table-bg: #f8f9fa;--bs-table-border-color: #c6c7c8;--bs-table-striped-bg: #ecedee;--bs-table-striped-color: #000;--bs-table-active-bg: #dfe0e1;--bs-table-active-color: #000;--bs-table-hover-bg: #e5e6e7;--bs-table-hover-color: #000;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-dark{--bs-table-color: #fff;--bs-table-bg: #212529;--bs-table-border-color: #4d5154;--bs-table-striped-bg: #2c3034;--bs-table-striped-color: #fff;--bs-table-active-bg: #373b3e;--bs-table-active-color: #fff;--bs-table-hover-bg: #323539;--bs-table-hover-color: #fff;color:var(--bs-table-color);border-color:var(--bs-table-border-color)}.table-responsive{overflow-x:auto;-webkit-overflow-scrolling:touch}@media(max-width: 575.98px){.table-responsive-sm{overflow-x:auto;-webkit-overflow-scrolling:touch}}@media(max-width: 767.98px){.table-responsive-md{overflow-x:auto;-webkit-overflow-scrolling:touch}}@media(max-width: 991.98px){.table-responsive-lg{overflow-x:auto;-webkit-overflow-scrolling:touch}}@media(max-width: 1199.98px){.table-responsive-xl{overflow-x:auto;-webkit-overflow-scrolling:touch}}@media(max-width: 1399.98px){.table-responsive-xxl{overflow-x:auto;-webkit-overflow-scrolling:touch}}.form-label{margin-bottom:.5rem}.col-form-label{padding-top:calc(0.375rem + var(--bs-border-width));padding-bottom:calc(0.375rem + var(--bs-border-width));margin-bottom:0;font-size:inherit;line-height:1.5}.col-form-label-lg{padding-top:calc(0.5rem + var(--bs-border-width));padding-bottom:calc(0.5rem + var(--bs-border-width));font-size:1.25rem}.col-form-label-sm{padding-top:calc(0.25rem + var(--bs-border-width));padding-bottom:calc(0.25rem + var(--bs-border-width));font-size:0.875rem}.form-text{margin-top:.25rem;font-size:0.875em;color:var(--bs-secondary-color)}.form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;font-weight:400;line-height:1.5;color:var(--bs-body-color);appearance:none;background-color:var(--bs-body-bg);background-clip:padding-box;border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-control{transition:none}}.form-control[type=file]{overflow:hidden}.form-control[type=file]:not(:disabled):not([readonly]){cursor:pointer}.form-control:focus{color:var(--bs-body-color);background-color:var(--bs-body-bg);border-color:#86b7fe;outline:0;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.form-control::-webkit-date-and-time-value{min-width:85px;height:1.5em;margin:0}.form-control::-webkit-datetime-edit{display:block;padding:0}.form-control::placeholder{color:var(--bs-secondary-color);opacity:1}.form-control:disabled{background-color:var(--bs-secondary-bg);opacity:1}.form-control::file-selector-button{padding:.375rem .75rem;margin:-0.375rem -0.75rem;margin-inline-end:.75rem;color:var(--bs-body-color);background-color:var(--bs-tertiary-bg);pointer-events:none;border-color:inherit;border-style:solid;border-width:0;border-inline-end-width:var(--bs-border-width);border-radius:0;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-control::file-selector-button{transition:none}}.form-control:hover:not(:disabled):not([readonly])::file-selector-button{background-color:var(--bs-secondary-bg)}.form-control-plaintext{display:block;width:100%;padding:.375rem 0;margin-bottom:0;line-height:1.5;color:var(--bs-body-color);background-color:rgba(0,0,0,0);border:solid rgba(0,0,0,0);border-width:var(--bs-border-width) 0}.form-control-plaintext:focus{outline:0}.form-control-plaintext.form-control-sm,.form-control-plaintext.form-control-lg{padding-right:0;padding-left:0}.form-control-sm{min-height:calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2));padding:.25rem .5rem;font-size:0.875rem;border-radius:var(--bs-border-radius-sm)}.form-control-sm::file-selector-button{padding:.25rem .5rem;margin:-0.25rem -0.5rem;margin-inline-end:.5rem}.form-control-lg{min-height:calc(1.5em + 1rem + calc(var(--bs-border-width) * 2));padding:.5rem 1rem;font-size:1.25rem;border-radius:var(--bs-border-radius-lg)}.form-control-lg::file-selector-button{padding:.5rem 1rem;margin:-0.5rem -1rem;margin-inline-end:1rem}textarea.form-control{min-height:calc(1.5em + 0.75rem + calc(var(--bs-border-width) * 2))}textarea.form-control-sm{min-height:calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2))}textarea.form-control-lg{min-height:calc(1.5em + 1rem + calc(var(--bs-border-width) * 2))}.form-control-color{width:3rem;height:calc(1.5em + 0.75rem + calc(var(--bs-border-width) * 2));padding:.375rem}.form-control-color:not(:disabled):not([readonly]){cursor:pointer}.form-control-color::-moz-color-swatch{border:0 !important;border-radius:var(--bs-border-radius)}.form-control-color::-webkit-color-swatch{border:0 !important;border-radius:var(--bs-border-radius)}.form-control-color.form-control-sm{height:calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2))}.form-control-color.form-control-lg{height:calc(1.5em + 1rem + calc(var(--bs-border-width) * 2))}.form-select{--bs-form-select-bg-img: url(${___CSS_LOADER_URL_REPLACEMENT_0___});display:block;width:100%;padding:.375rem 2.25rem .375rem .75rem;font-size:1rem;font-weight:400;line-height:1.5;color:var(--bs-body-color);appearance:none;background-color:var(--bs-body-bg);background-image:var(--bs-form-select-bg-img),var(--bs-form-select-bg-icon, none);background-repeat:no-repeat;background-position:right .75rem center;background-size:16px 12px;border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius);transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-select{transition:none}}.form-select:focus{border-color:#86b7fe;outline:0;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.form-select[multiple],.form-select[size]:not([size="1"]){padding-right:.75rem;background-image:none}.form-select:disabled{background-color:var(--bs-secondary-bg)}.form-select:-moz-focusring{color:rgba(0,0,0,0);text-shadow:0 0 0 var(--bs-body-color)}.form-select-sm{padding-top:.25rem;padding-bottom:.25rem;padding-left:.5rem;font-size:0.875rem;border-radius:var(--bs-border-radius-sm)}.form-select-lg{padding-top:.5rem;padding-bottom:.5rem;padding-left:1rem;font-size:1.25rem;border-radius:var(--bs-border-radius-lg)}[data-bs-theme=dark] .form-select{--bs-form-select-bg-img: url(${___CSS_LOADER_URL_REPLACEMENT_1___})}.form-check{display:block;min-height:1.5rem;padding-left:1.5em;margin-bottom:.125rem}.form-check .form-check-input{float:left;margin-left:-1.5em}.form-check-reverse{padding-right:1.5em;padding-left:0;text-align:right}.form-check-reverse .form-check-input{float:right;margin-right:-1.5em;margin-left:0}.form-check-input{--bs-form-check-bg: var(--bs-body-bg);flex-shrink:0;width:1em;height:1em;margin-top:.25em;vertical-align:top;appearance:none;background-color:var(--bs-form-check-bg);background-image:var(--bs-form-check-bg-image);background-repeat:no-repeat;background-position:center;background-size:contain;border:var(--bs-border-width) solid var(--bs-border-color);print-color-adjust:exact}.form-check-input[type=checkbox]{border-radius:.25em}.form-check-input[type=radio]{border-radius:50%}.form-check-input:active{filter:brightness(90%)}.form-check-input:focus{border-color:#86b7fe;outline:0;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.form-check-input:checked{background-color:#0d6efd;border-color:#0d6efd}.form-check-input:checked[type=checkbox]{--bs-form-check-bg-image: url(${___CSS_LOADER_URL_REPLACEMENT_2___})}.form-check-input:checked[type=radio]{--bs-form-check-bg-image: url(${___CSS_LOADER_URL_REPLACEMENT_3___})}.form-check-input[type=checkbox]:indeterminate{background-color:#0d6efd;border-color:#0d6efd;--bs-form-check-bg-image: url(${___CSS_LOADER_URL_REPLACEMENT_4___})}.form-check-input:disabled{pointer-events:none;filter:none;opacity:.5}.form-check-input[disabled]~.form-check-label,.form-check-input:disabled~.form-check-label{cursor:default;opacity:.5}.form-switch{padding-left:2.5em}.form-switch .form-check-input{--bs-form-switch-bg: url(${___CSS_LOADER_URL_REPLACEMENT_5___});width:2em;margin-left:-2.5em;background-image:var(--bs-form-switch-bg);background-position:left center;border-radius:2em;transition:background-position .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-switch .form-check-input{transition:none}}.form-switch .form-check-input:focus{--bs-form-switch-bg: url(${___CSS_LOADER_URL_REPLACEMENT_6___})}.form-switch .form-check-input:checked{background-position:right center;--bs-form-switch-bg: url(${___CSS_LOADER_URL_REPLACEMENT_7___})}.form-switch.form-check-reverse{padding-right:2.5em;padding-left:0}.form-switch.form-check-reverse .form-check-input{margin-right:-2.5em;margin-left:0}.form-check-inline{display:inline-block;margin-right:1rem}.btn-check{position:absolute;clip:rect(0, 0, 0, 0);pointer-events:none}.btn-check[disabled]+.btn,.btn-check:disabled+.btn{pointer-events:none;filter:none;opacity:.65}[data-bs-theme=dark] .form-switch .form-check-input:not(:checked):not(:focus){--bs-form-switch-bg: url(${___CSS_LOADER_URL_REPLACEMENT_8___})}.form-range{width:100%;height:1.5rem;padding:0;appearance:none;background-color:rgba(0,0,0,0)}.form-range:focus{outline:0}.form-range:focus::-webkit-slider-thumb{box-shadow:0 0 0 1px #fff,0 0 0 .25rem rgba(13,110,253,.25)}.form-range:focus::-moz-range-thumb{box-shadow:0 0 0 1px #fff,0 0 0 .25rem rgba(13,110,253,.25)}.form-range::-moz-focus-outer{border:0}.form-range::-webkit-slider-thumb{width:1rem;height:1rem;margin-top:-0.25rem;appearance:none;background-color:#0d6efd;border:0;border-radius:1rem;transition:background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-range::-webkit-slider-thumb{transition:none}}.form-range::-webkit-slider-thumb:active{background-color:#b6d4fe}.form-range::-webkit-slider-runnable-track{width:100%;height:.5rem;color:rgba(0,0,0,0);cursor:pointer;background-color:var(--bs-secondary-bg);border-color:rgba(0,0,0,0);border-radius:1rem}.form-range::-moz-range-thumb{width:1rem;height:1rem;appearance:none;background-color:#0d6efd;border:0;border-radius:1rem;transition:background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.form-range::-moz-range-thumb{transition:none}}.form-range::-moz-range-thumb:active{background-color:#b6d4fe}.form-range::-moz-range-track{width:100%;height:.5rem;color:rgba(0,0,0,0);cursor:pointer;background-color:var(--bs-secondary-bg);border-color:rgba(0,0,0,0);border-radius:1rem}.form-range:disabled{pointer-events:none}.form-range:disabled::-webkit-slider-thumb{background-color:var(--bs-secondary-color)}.form-range:disabled::-moz-range-thumb{background-color:var(--bs-secondary-color)}.form-floating{position:relative}.form-floating>.form-control,.form-floating>.form-control-plaintext,.form-floating>.form-select{height:calc(3.5rem + calc(var(--bs-border-width) * 2));min-height:calc(3.5rem + calc(var(--bs-border-width) * 2));line-height:1.25}.form-floating>label{position:absolute;top:0;left:0;z-index:2;height:100%;padding:1rem .75rem;overflow:hidden;text-align:start;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;border:var(--bs-border-width) solid rgba(0,0,0,0);transform-origin:0 0;transition:opacity .1s ease-in-out,transform .1s ease-in-out}@media(prefers-reduced-motion: reduce){.form-floating>label{transition:none}}.form-floating>.form-control,.form-floating>.form-control-plaintext{padding:1rem .75rem}.form-floating>.form-control::placeholder,.form-floating>.form-control-plaintext::placeholder{color:rgba(0,0,0,0)}.form-floating>.form-control:focus,.form-floating>.form-control:not(:placeholder-shown),.form-floating>.form-control-plaintext:focus,.form-floating>.form-control-plaintext:not(:placeholder-shown){padding-top:1.625rem;padding-bottom:.625rem}.form-floating>.form-control:-webkit-autofill,.form-floating>.form-control-plaintext:-webkit-autofill{padding-top:1.625rem;padding-bottom:.625rem}.form-floating>.form-select{padding-top:1.625rem;padding-bottom:.625rem}.form-floating>.form-control:focus~label,.form-floating>.form-control:not(:placeholder-shown)~label,.form-floating>.form-control-plaintext~label,.form-floating>.form-select~label{color:rgba(var(--bs-body-color-rgb), 0.65);transform:scale(0.85) translateY(-0.5rem) translateX(0.15rem)}.form-floating>.form-control:focus~label::after,.form-floating>.form-control:not(:placeholder-shown)~label::after,.form-floating>.form-control-plaintext~label::after,.form-floating>.form-select~label::after{position:absolute;inset:1rem .375rem;z-index:-1;height:1.5em;content:"";background-color:var(--bs-body-bg);border-radius:var(--bs-border-radius)}.form-floating>.form-control:-webkit-autofill~label{color:rgba(var(--bs-body-color-rgb), 0.65);transform:scale(0.85) translateY(-0.5rem) translateX(0.15rem)}.form-floating>.form-control-plaintext~label{border-width:var(--bs-border-width) 0}.form-floating>:disabled~label,.form-floating>.form-control:disabled~label{color:#6c757d}.form-floating>:disabled~label::after,.form-floating>.form-control:disabled~label::after{background-color:var(--bs-secondary-bg)}.input-group{position:relative;display:flex;flex-wrap:wrap;align-items:stretch;width:100%}.input-group>.form-control,.input-group>.form-select,.input-group>.form-floating{position:relative;flex:1 1 auto;width:1%;min-width:0}.input-group>.form-control:focus,.input-group>.form-select:focus,.input-group>.form-floating:focus-within{z-index:5}.input-group .btn{position:relative;z-index:2}.input-group .btn:focus{z-index:5}.input-group-text{display:flex;align-items:center;padding:.375rem .75rem;font-size:1rem;font-weight:400;line-height:1.5;color:var(--bs-body-color);text-align:center;white-space:nowrap;background-color:var(--bs-tertiary-bg);border:var(--bs-border-width) solid var(--bs-border-color);border-radius:var(--bs-border-radius)}.input-group-lg>.form-control,.input-group-lg>.form-select,.input-group-lg>.input-group-text,.input-group-lg>.btn{padding:.5rem 1rem;font-size:1.25rem;border-radius:var(--bs-border-radius-lg)}.input-group-sm>.form-control,.input-group-sm>.form-select,.input-group-sm>.input-group-text,.input-group-sm>.btn{padding:.25rem .5rem;font-size:0.875rem;border-radius:var(--bs-border-radius-sm)}.input-group-lg>.form-select,.input-group-sm>.form-select{padding-right:3rem}.input-group:not(.has-validation)>:not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating),.input-group:not(.has-validation)>.dropdown-toggle:nth-last-child(n+3),.input-group:not(.has-validation)>.form-floating:not(:last-child)>.form-control,.input-group:not(.has-validation)>.form-floating:not(:last-child)>.form-select{border-top-right-radius:0;border-bottom-right-radius:0}.input-group.has-validation>:nth-last-child(n+3):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating),.input-group.has-validation>.dropdown-toggle:nth-last-child(n+4),.input-group.has-validation>.form-floating:nth-last-child(n+3)>.form-control,.input-group.has-validation>.form-floating:nth-last-child(n+3)>.form-select{border-top-right-radius:0;border-bottom-right-radius:0}.input-group>:not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback){margin-left:calc(var(--bs-border-width)*-1);border-top-left-radius:0;border-bottom-left-radius:0}.input-group>.form-floating:not(:first-child)>.form-control,.input-group>.form-floating:not(:first-child)>.form-select{border-top-left-radius:0;border-bottom-left-radius:0}.valid-feedback{display:none;width:100%;margin-top:.25rem;font-size:0.875em;color:var(--bs-form-valid-color)}.valid-tooltip{position:absolute;top:100%;z-index:5;display:none;max-width:100%;padding:.25rem .5rem;margin-top:.1rem;font-size:0.875rem;color:#fff;background-color:var(--bs-success);border-radius:var(--bs-border-radius)}.was-validated :valid~.valid-feedback,.was-validated :valid~.valid-tooltip,.is-valid~.valid-feedback,.is-valid~.valid-tooltip{display:block}.was-validated .form-control:valid,.form-control.is-valid{border-color:var(--bs-form-valid-border-color);padding-right:calc(1.5em + 0.75rem);background-image:url(${___CSS_LOADER_URL_REPLACEMENT_9___});background-repeat:no-repeat;background-position:right calc(0.375em + 0.1875rem) center;background-size:calc(0.75em + 0.375rem) calc(0.75em + 0.375rem)}.was-validated .form-control:valid:focus,.form-control.is-valid:focus{border-color:var(--bs-form-valid-border-color);box-shadow:0 0 0 .25rem rgba(var(--bs-success-rgb), 0.25)}.was-validated textarea.form-control:valid,textarea.form-control.is-valid{padding-right:calc(1.5em + 0.75rem);background-position:top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem)}.was-validated .form-select:valid,.form-select.is-valid{border-color:var(--bs-form-valid-border-color)}.was-validated .form-select:valid:not([multiple]):not([size]),.was-validated .form-select:valid:not([multiple])[size="1"],.form-select.is-valid:not([multiple]):not([size]),.form-select.is-valid:not([multiple])[size="1"]{--bs-form-select-bg-icon: url(${___CSS_LOADER_URL_REPLACEMENT_9___});padding-right:4.125rem;background-position:right .75rem center,center right 2.25rem;background-size:16px 12px,calc(0.75em + 0.375rem) calc(0.75em + 0.375rem)}.was-validated .form-select:valid:focus,.form-select.is-valid:focus{border-color:var(--bs-form-valid-border-color);box-shadow:0 0 0 .25rem rgba(var(--bs-success-rgb), 0.25)}.was-validated .form-control-color:valid,.form-control-color.is-valid{width:calc(3rem + calc(1.5em + 0.75rem))}.was-validated .form-check-input:valid,.form-check-input.is-valid{border-color:var(--bs-form-valid-border-color)}.was-validated .form-check-input:valid:checked,.form-check-input.is-valid:checked{background-color:var(--bs-form-valid-color)}.was-validated .form-check-input:valid:focus,.form-check-input.is-valid:focus{box-shadow:0 0 0 .25rem rgba(var(--bs-success-rgb), 0.25)}.was-validated .form-check-input:valid~.form-check-label,.form-check-input.is-valid~.form-check-label{color:var(--bs-form-valid-color)}.form-check-inline .form-check-input~.valid-feedback{margin-left:.5em}.was-validated .input-group>.form-control:not(:focus):valid,.input-group>.form-control:not(:focus).is-valid,.was-validated .input-group>.form-select:not(:focus):valid,.input-group>.form-select:not(:focus).is-valid,.was-validated .input-group>.form-floating:not(:focus-within):valid,.input-group>.form-floating:not(:focus-within).is-valid{z-index:3}.invalid-feedback{display:none;width:100%;margin-top:.25rem;font-size:0.875em;color:var(--bs-form-invalid-color)}.invalid-tooltip{position:absolute;top:100%;z-index:5;display:none;max-width:100%;padding:.25rem .5rem;margin-top:.1rem;font-size:0.875rem;color:#fff;background-color:var(--bs-danger);border-radius:var(--bs-border-radius)}.was-validated :invalid~.invalid-feedback,.was-validated :invalid~.invalid-tooltip,.is-invalid~.invalid-feedback,.is-invalid~.invalid-tooltip{display:block}.was-validated .form-control:invalid,.form-control.is-invalid{border-color:var(--bs-form-invalid-border-color);padding-right:calc(1.5em + 0.75rem);background-image:url(${___CSS_LOADER_URL_REPLACEMENT_10___});background-repeat:no-repeat;background-position:right calc(0.375em + 0.1875rem) center;background-size:calc(0.75em + 0.375rem) calc(0.75em + 0.375rem)}.was-validated .form-control:invalid:focus,.form-control.is-invalid:focus{border-color:var(--bs-form-invalid-border-color);box-shadow:0 0 0 .25rem rgba(var(--bs-danger-rgb), 0.25)}.was-validated textarea.form-control:invalid,textarea.form-control.is-invalid{padding-right:calc(1.5em + 0.75rem);background-position:top calc(0.375em + 0.1875rem) right calc(0.375em + 0.1875rem)}.was-validated .form-select:invalid,.form-select.is-invalid{border-color:var(--bs-form-invalid-border-color)}.was-validated .form-select:invalid:not([multiple]):not([size]),.was-validated .form-select:invalid:not([multiple])[size="1"],.form-select.is-invalid:not([multiple]):not([size]),.form-select.is-invalid:not([multiple])[size="1"]{--bs-form-select-bg-icon: url(${___CSS_LOADER_URL_REPLACEMENT_10___});padding-right:4.125rem;background-position:right .75rem center,center right 2.25rem;background-size:16px 12px,calc(0.75em + 0.375rem) calc(0.75em + 0.375rem)}.was-validated .form-select:invalid:focus,.form-select.is-invalid:focus{border-color:var(--bs-form-invalid-border-color);box-shadow:0 0 0 .25rem rgba(var(--bs-danger-rgb), 0.25)}.was-validated .form-control-color:invalid,.form-control-color.is-invalid{width:calc(3rem + calc(1.5em + 0.75rem))}.was-validated .form-check-input:invalid,.form-check-input.is-invalid{border-color:var(--bs-form-invalid-border-color)}.was-validated .form-check-input:invalid:checked,.form-check-input.is-invalid:checked{background-color:var(--bs-form-invalid-color)}.was-validated .form-check-input:invalid:focus,.form-check-input.is-invalid:focus{box-shadow:0 0 0 .25rem rgba(var(--bs-danger-rgb), 0.25)}.was-validated .form-check-input:invalid~.form-check-label,.form-check-input.is-invalid~.form-check-label{color:var(--bs-form-invalid-color)}.form-check-inline .form-check-input~.invalid-feedback{margin-left:.5em}.was-validated .input-group>.form-control:not(:focus):invalid,.input-group>.form-control:not(:focus).is-invalid,.was-validated .input-group>.form-select:not(:focus):invalid,.input-group>.form-select:not(:focus).is-invalid,.was-validated .input-group>.form-floating:not(:focus-within):invalid,.input-group>.form-floating:not(:focus-within).is-invalid{z-index:4}.btn{--bs-btn-padding-x: 0.75rem;--bs-btn-padding-y: 0.375rem;--bs-btn-font-family: ;--bs-btn-font-size:1rem;--bs-btn-font-weight: 400;--bs-btn-line-height: 1.5;--bs-btn-color: var(--bs-body-color);--bs-btn-bg: transparent;--bs-btn-border-width: var(--bs-border-width);--bs-btn-border-color: transparent;--bs-btn-border-radius: var(--bs-border-radius);--bs-btn-hover-border-color: transparent;--bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);--bs-btn-disabled-opacity: 0.65;--bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);display:inline-block;padding:var(--bs-btn-padding-y) var(--bs-btn-padding-x);font-family:var(--bs-btn-font-family);font-size:var(--bs-btn-font-size);font-weight:var(--bs-btn-font-weight);line-height:var(--bs-btn-line-height);color:var(--bs-btn-color);text-align:center;text-decoration:none;vertical-align:middle;cursor:pointer;user-select:none;border:var(--bs-btn-border-width) solid var(--bs-btn-border-color);border-radius:var(--bs-btn-border-radius);background-color:var(--bs-btn-bg);transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.btn{transition:none}}.btn:hover{color:var(--bs-btn-hover-color);background-color:var(--bs-btn-hover-bg);border-color:var(--bs-btn-hover-border-color)}.btn-check+.btn:hover{color:var(--bs-btn-color);background-color:var(--bs-btn-bg);border-color:var(--bs-btn-border-color)}.btn:focus-visible{color:var(--bs-btn-hover-color);background-color:var(--bs-btn-hover-bg);border-color:var(--bs-btn-hover-border-color);outline:0;box-shadow:var(--bs-btn-focus-box-shadow)}.btn-check:focus-visible+.btn{border-color:var(--bs-btn-hover-border-color);outline:0;box-shadow:var(--bs-btn-focus-box-shadow)}.btn-check:checked+.btn,:not(.btn-check)+.btn:active,.btn:first-child:active,.btn.active,.btn.show{color:var(--bs-btn-active-color);background-color:var(--bs-btn-active-bg);border-color:var(--bs-btn-active-border-color)}.btn-check:checked+.btn:focus-visible,:not(.btn-check)+.btn:active:focus-visible,.btn:first-child:active:focus-visible,.btn.active:focus-visible,.btn.show:focus-visible{box-shadow:var(--bs-btn-focus-box-shadow)}.btn:disabled,.btn.disabled,fieldset:disabled .btn{color:var(--bs-btn-disabled-color);pointer-events:none;background-color:var(--bs-btn-disabled-bg);border-color:var(--bs-btn-disabled-border-color);opacity:var(--bs-btn-disabled-opacity)}.btn-primary{--bs-btn-color: #fff;--bs-btn-bg: #0d6efd;--bs-btn-border-color: #0d6efd;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #0b5ed7;--bs-btn-hover-border-color: #0a58ca;--bs-btn-focus-shadow-rgb: 49, 132, 253;--bs-btn-active-color: #fff;--bs-btn-active-bg: #0a58ca;--bs-btn-active-border-color: #0a53be;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #fff;--bs-btn-disabled-bg: #0d6efd;--bs-btn-disabled-border-color: #0d6efd}.btn-secondary{--bs-btn-color: #fff;--bs-btn-bg: #6c757d;--bs-btn-border-color: #6c757d;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #5c636a;--bs-btn-hover-border-color: #565e64;--bs-btn-focus-shadow-rgb: 130, 138, 145;--bs-btn-active-color: #fff;--bs-btn-active-bg: #565e64;--bs-btn-active-border-color: #51585e;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #fff;--bs-btn-disabled-bg: #6c757d;--bs-btn-disabled-border-color: #6c757d}.btn-success{--bs-btn-color: #fff;--bs-btn-bg: #198754;--bs-btn-border-color: #198754;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #157347;--bs-btn-hover-border-color: #146c43;--bs-btn-focus-shadow-rgb: 60, 153, 110;--bs-btn-active-color: #fff;--bs-btn-active-bg: #146c43;--bs-btn-active-border-color: #13653f;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #fff;--bs-btn-disabled-bg: #198754;--bs-btn-disabled-border-color: #198754}.btn-info{--bs-btn-color: #000;--bs-btn-bg: #0dcaf0;--bs-btn-border-color: #0dcaf0;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #31d2f2;--bs-btn-hover-border-color: #25cff2;--bs-btn-focus-shadow-rgb: 11, 172, 204;--bs-btn-active-color: #000;--bs-btn-active-bg: #3dd5f3;--bs-btn-active-border-color: #25cff2;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #000;--bs-btn-disabled-bg: #0dcaf0;--bs-btn-disabled-border-color: #0dcaf0}.btn-warning{--bs-btn-color: #000;--bs-btn-bg: #ffc107;--bs-btn-border-color: #ffc107;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #ffca2c;--bs-btn-hover-border-color: #ffc720;--bs-btn-focus-shadow-rgb: 217, 164, 6;--bs-btn-active-color: #000;--bs-btn-active-bg: #ffcd39;--bs-btn-active-border-color: #ffc720;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #000;--bs-btn-disabled-bg: #ffc107;--bs-btn-disabled-border-color: #ffc107}.btn-danger{--bs-btn-color: #fff;--bs-btn-bg: #dc3545;--bs-btn-border-color: #dc3545;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #bb2d3b;--bs-btn-hover-border-color: #b02a37;--bs-btn-focus-shadow-rgb: 225, 83, 97;--bs-btn-active-color: #fff;--bs-btn-active-bg: #b02a37;--bs-btn-active-border-color: #a52834;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #fff;--bs-btn-disabled-bg: #dc3545;--bs-btn-disabled-border-color: #dc3545}.btn-light{--bs-btn-color: #000;--bs-btn-bg: #f8f9fa;--bs-btn-border-color: #f8f9fa;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #d3d4d5;--bs-btn-hover-border-color: #c6c7c8;--bs-btn-focus-shadow-rgb: 211, 212, 213;--bs-btn-active-color: #000;--bs-btn-active-bg: #c6c7c8;--bs-btn-active-border-color: #babbbc;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #000;--bs-btn-disabled-bg: #f8f9fa;--bs-btn-disabled-border-color: #f8f9fa}.btn-dark{--bs-btn-color: #fff;--bs-btn-bg: #212529;--bs-btn-border-color: #212529;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #424649;--bs-btn-hover-border-color: #373b3e;--bs-btn-focus-shadow-rgb: 66, 70, 73;--bs-btn-active-color: #fff;--bs-btn-active-bg: #4d5154;--bs-btn-active-border-color: #373b3e;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #fff;--bs-btn-disabled-bg: #212529;--bs-btn-disabled-border-color: #212529}.btn-outline-primary{--bs-btn-color: #0d6efd;--bs-btn-border-color: #0d6efd;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #0d6efd;--bs-btn-hover-border-color: #0d6efd;--bs-btn-focus-shadow-rgb: 13, 110, 253;--bs-btn-active-color: #fff;--bs-btn-active-bg: #0d6efd;--bs-btn-active-border-color: #0d6efd;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #0d6efd;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #0d6efd;--bs-gradient: none}.btn-outline-secondary{--bs-btn-color: #6c757d;--bs-btn-border-color: #6c757d;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #6c757d;--bs-btn-hover-border-color: #6c757d;--bs-btn-focus-shadow-rgb: 108, 117, 125;--bs-btn-active-color: #fff;--bs-btn-active-bg: #6c757d;--bs-btn-active-border-color: #6c757d;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #6c757d;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #6c757d;--bs-gradient: none}.btn-outline-success{--bs-btn-color: #198754;--bs-btn-border-color: #198754;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #198754;--bs-btn-hover-border-color: #198754;--bs-btn-focus-shadow-rgb: 25, 135, 84;--bs-btn-active-color: #fff;--bs-btn-active-bg: #198754;--bs-btn-active-border-color: #198754;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #198754;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #198754;--bs-gradient: none}.btn-outline-info{--bs-btn-color: #0dcaf0;--bs-btn-border-color: #0dcaf0;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #0dcaf0;--bs-btn-hover-border-color: #0dcaf0;--bs-btn-focus-shadow-rgb: 13, 202, 240;--bs-btn-active-color: #000;--bs-btn-active-bg: #0dcaf0;--bs-btn-active-border-color: #0dcaf0;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #0dcaf0;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #0dcaf0;--bs-gradient: none}.btn-outline-warning{--bs-btn-color: #ffc107;--bs-btn-border-color: #ffc107;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #ffc107;--bs-btn-hover-border-color: #ffc107;--bs-btn-focus-shadow-rgb: 255, 193, 7;--bs-btn-active-color: #000;--bs-btn-active-bg: #ffc107;--bs-btn-active-border-color: #ffc107;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #ffc107;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #ffc107;--bs-gradient: none}.btn-outline-danger{--bs-btn-color: #dc3545;--bs-btn-border-color: #dc3545;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #dc3545;--bs-btn-hover-border-color: #dc3545;--bs-btn-focus-shadow-rgb: 220, 53, 69;--bs-btn-active-color: #fff;--bs-btn-active-bg: #dc3545;--bs-btn-active-border-color: #dc3545;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #dc3545;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #dc3545;--bs-gradient: none}.btn-outline-light{--bs-btn-color: #f8f9fa;--bs-btn-border-color: #f8f9fa;--bs-btn-hover-color: #000;--bs-btn-hover-bg: #f8f9fa;--bs-btn-hover-border-color: #f8f9fa;--bs-btn-focus-shadow-rgb: 248, 249, 250;--bs-btn-active-color: #000;--bs-btn-active-bg: #f8f9fa;--bs-btn-active-border-color: #f8f9fa;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #f8f9fa;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #f8f9fa;--bs-gradient: none}.btn-outline-dark{--bs-btn-color: #212529;--bs-btn-border-color: #212529;--bs-btn-hover-color: #fff;--bs-btn-hover-bg: #212529;--bs-btn-hover-border-color: #212529;--bs-btn-focus-shadow-rgb: 33, 37, 41;--bs-btn-active-color: #fff;--bs-btn-active-bg: #212529;--bs-btn-active-border-color: #212529;--bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);--bs-btn-disabled-color: #212529;--bs-btn-disabled-bg: transparent;--bs-btn-disabled-border-color: #212529;--bs-gradient: none}.btn-link{--bs-btn-font-weight: 400;--bs-btn-color: var(--bs-link-color);--bs-btn-bg: transparent;--bs-btn-border-color: transparent;--bs-btn-hover-color: var(--bs-link-hover-color);--bs-btn-hover-border-color: transparent;--bs-btn-active-color: var(--bs-link-hover-color);--bs-btn-active-border-color: transparent;--bs-btn-disabled-color: #6c757d;--bs-btn-disabled-border-color: transparent;--bs-btn-box-shadow: 0 0 0 #000;--bs-btn-focus-shadow-rgb: 49, 132, 253;text-decoration:underline}.btn-link:focus-visible{color:var(--bs-btn-color)}.btn-link:hover{color:var(--bs-btn-hover-color)}.btn-lg,.btn-group-lg>.btn{--bs-btn-padding-y: 0.5rem;--bs-btn-padding-x: 1rem;--bs-btn-font-size:1.25rem;--bs-btn-border-radius: var(--bs-border-radius-lg)}.btn-sm,.btn-group-sm>.btn{--bs-btn-padding-y: 0.25rem;--bs-btn-padding-x: 0.5rem;--bs-btn-font-size:0.875rem;--bs-btn-border-radius: var(--bs-border-radius-sm)}.fade{transition:opacity .15s linear}@media(prefers-reduced-motion: reduce){.fade{transition:none}}.fade:not(.show){opacity:0}.collapse:not(.show){display:none}.collapsing{height:0;overflow:hidden;transition:height .35s ease}@media(prefers-reduced-motion: reduce){.collapsing{transition:none}}.collapsing.collapse-horizontal{width:0;height:auto;transition:width .35s ease}@media(prefers-reduced-motion: reduce){.collapsing.collapse-horizontal{transition:none}}.dropup,.dropend,.dropdown,.dropstart,.dropup-center,.dropdown-center{position:relative}.dropdown-toggle{white-space:nowrap}.dropdown-toggle::after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid;border-right:.3em solid rgba(0,0,0,0);border-bottom:0;border-left:.3em solid rgba(0,0,0,0)}.dropdown-toggle:empty::after{margin-left:0}.dropdown-menu{--bs-dropdown-zindex: 1000;--bs-dropdown-min-width: 10rem;--bs-dropdown-padding-x: 0;--bs-dropdown-padding-y: 0.5rem;--bs-dropdown-spacer: 0.125rem;--bs-dropdown-font-size:1rem;--bs-dropdown-color: var(--bs-body-color);--bs-dropdown-bg: var(--bs-body-bg);--bs-dropdown-border-color: var(--bs-border-color-translucent);--bs-dropdown-border-radius: var(--bs-border-radius);--bs-dropdown-border-width: var(--bs-border-width);--bs-dropdown-inner-border-radius: calc(var(--bs-border-radius) - var(--bs-border-width));--bs-dropdown-divider-bg: var(--bs-border-color-translucent);--bs-dropdown-divider-margin-y: 0.5rem;--bs-dropdown-box-shadow: var(--bs-box-shadow);--bs-dropdown-link-color: var(--bs-body-color);--bs-dropdown-link-hover-color: var(--bs-body-color);--bs-dropdown-link-hover-bg: var(--bs-tertiary-bg);--bs-dropdown-link-active-color: #fff;--bs-dropdown-link-active-bg: #0d6efd;--bs-dropdown-link-disabled-color: var(--bs-tertiary-color);--bs-dropdown-item-padding-x: 1rem;--bs-dropdown-item-padding-y: 0.25rem;--bs-dropdown-header-color: #6c757d;--bs-dropdown-header-padding-x: 1rem;--bs-dropdown-header-padding-y: 0.5rem;position:absolute;z-index:var(--bs-dropdown-zindex);display:none;min-width:var(--bs-dropdown-min-width);padding:var(--bs-dropdown-padding-y) var(--bs-dropdown-padding-x);margin:0;font-size:var(--bs-dropdown-font-size);color:var(--bs-dropdown-color);text-align:left;list-style:none;background-color:var(--bs-dropdown-bg);background-clip:padding-box;border:var(--bs-dropdown-border-width) solid var(--bs-dropdown-border-color);border-radius:var(--bs-dropdown-border-radius)}.dropdown-menu[data-bs-popper]{top:100%;left:0;margin-top:var(--bs-dropdown-spacer)}.dropdown-menu-start{--bs-position: start}.dropdown-menu-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-end{--bs-position: end}.dropdown-menu-end[data-bs-popper]{right:0;left:auto}@media(min-width: 576px){.dropdown-menu-sm-start{--bs-position: start}.dropdown-menu-sm-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-sm-end{--bs-position: end}.dropdown-menu-sm-end[data-bs-popper]{right:0;left:auto}}@media(min-width: 768px){.dropdown-menu-md-start{--bs-position: start}.dropdown-menu-md-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-md-end{--bs-position: end}.dropdown-menu-md-end[data-bs-popper]{right:0;left:auto}}@media(min-width: 992px){.dropdown-menu-lg-start{--bs-position: start}.dropdown-menu-lg-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-lg-end{--bs-position: end}.dropdown-menu-lg-end[data-bs-popper]{right:0;left:auto}}@media(min-width: 1200px){.dropdown-menu-xl-start{--bs-position: start}.dropdown-menu-xl-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-xl-end{--bs-position: end}.dropdown-menu-xl-end[data-bs-popper]{right:0;left:auto}}@media(min-width: 1400px){.dropdown-menu-xxl-start{--bs-position: start}.dropdown-menu-xxl-start[data-bs-popper]{right:auto;left:0}.dropdown-menu-xxl-end{--bs-position: end}.dropdown-menu-xxl-end[data-bs-popper]{right:0;left:auto}}.dropup .dropdown-menu[data-bs-popper]{top:auto;bottom:100%;margin-top:0;margin-bottom:var(--bs-dropdown-spacer)}.dropup .dropdown-toggle::after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:0;border-right:.3em solid rgba(0,0,0,0);border-bottom:.3em solid;border-left:.3em solid rgba(0,0,0,0)}.dropup .dropdown-toggle:empty::after{margin-left:0}.dropend .dropdown-menu[data-bs-popper]{top:0;right:auto;left:100%;margin-top:0;margin-left:var(--bs-dropdown-spacer)}.dropend .dropdown-toggle::after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid rgba(0,0,0,0);border-right:0;border-bottom:.3em solid rgba(0,0,0,0);border-left:.3em solid}.dropend .dropdown-toggle:empty::after{margin-left:0}.dropend .dropdown-toggle::after{vertical-align:0}.dropstart .dropdown-menu[data-bs-popper]{top:0;right:100%;left:auto;margin-top:0;margin-right:var(--bs-dropdown-spacer)}.dropstart .dropdown-toggle::after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:""}.dropstart .dropdown-toggle::after{display:none}.dropstart .dropdown-toggle::before{display:inline-block;margin-right:.255em;vertical-align:.255em;content:"";border-top:.3em solid rgba(0,0,0,0);border-right:.3em solid;border-bottom:.3em solid rgba(0,0,0,0)}.dropstart .dropdown-toggle:empty::after{margin-left:0}.dropstart .dropdown-toggle::before{vertical-align:0}.dropdown-divider{height:0;margin:var(--bs-dropdown-divider-margin-y) 0;overflow:hidden;border-top:1px solid var(--bs-dropdown-divider-bg);opacity:1}.dropdown-item{display:block;width:100%;padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);clear:both;font-weight:400;color:var(--bs-dropdown-link-color);text-align:inherit;text-decoration:none;white-space:nowrap;background-color:rgba(0,0,0,0);border:0;border-radius:var(--bs-dropdown-item-border-radius, 0)}.dropdown-item:hover,.dropdown-item:focus{color:var(--bs-dropdown-link-hover-color);background-color:var(--bs-dropdown-link-hover-bg)}.dropdown-item.active,.dropdown-item:active{color:var(--bs-dropdown-link-active-color);text-decoration:none;background-color:var(--bs-dropdown-link-active-bg)}.dropdown-item.disabled,.dropdown-item:disabled{color:var(--bs-dropdown-link-disabled-color);pointer-events:none;background-color:rgba(0,0,0,0)}.dropdown-menu.show{display:block}.dropdown-header{display:block;padding:var(--bs-dropdown-header-padding-y) var(--bs-dropdown-header-padding-x);margin-bottom:0;font-size:0.875rem;color:var(--bs-dropdown-header-color);white-space:nowrap}.dropdown-item-text{display:block;padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);color:var(--bs-dropdown-link-color)}.dropdown-menu-dark{--bs-dropdown-color: #dee2e6;--bs-dropdown-bg: #343a40;--bs-dropdown-border-color: var(--bs-border-color-translucent);--bs-dropdown-box-shadow: ;--bs-dropdown-link-color: #dee2e6;--bs-dropdown-link-hover-color: #fff;--bs-dropdown-divider-bg: var(--bs-border-color-translucent);--bs-dropdown-link-hover-bg: rgba(255, 255, 255, 0.15);--bs-dropdown-link-active-color: #fff;--bs-dropdown-link-active-bg: #0d6efd;--bs-dropdown-link-disabled-color: #adb5bd;--bs-dropdown-header-color: #adb5bd}.btn-group,.btn-group-vertical{position:relative;display:inline-flex;vertical-align:middle}.btn-group>.btn,.btn-group-vertical>.btn{position:relative;flex:1 1 auto}.btn-group>.btn-check:checked+.btn,.btn-group>.btn-check:focus+.btn,.btn-group>.btn:hover,.btn-group>.btn:focus,.btn-group>.btn:active,.btn-group>.btn.active,.btn-group-vertical>.btn-check:checked+.btn,.btn-group-vertical>.btn-check:focus+.btn,.btn-group-vertical>.btn:hover,.btn-group-vertical>.btn:focus,.btn-group-vertical>.btn:active,.btn-group-vertical>.btn.active{z-index:1}.btn-toolbar{display:flex;flex-wrap:wrap;justify-content:flex-start}.btn-toolbar .input-group{width:auto}.btn-group{border-radius:var(--bs-border-radius)}.btn-group>:not(.btn-check:first-child)+.btn,.btn-group>.btn-group:not(:first-child){margin-left:calc(var(--bs-border-width)*-1)}.btn-group>.btn:not(:last-child):not(.dropdown-toggle),.btn-group>.btn.dropdown-toggle-split:first-child,.btn-group>.btn-group:not(:last-child)>.btn{border-top-right-radius:0;border-bottom-right-radius:0}.btn-group>.btn:nth-child(n+3),.btn-group>:not(.btn-check)+.btn,.btn-group>.btn-group:not(:first-child)>.btn{border-top-left-radius:0;border-bottom-left-radius:0}.dropdown-toggle-split{padding-right:.5625rem;padding-left:.5625rem}.dropdown-toggle-split::after,.dropup .dropdown-toggle-split::after,.dropend .dropdown-toggle-split::after{margin-left:0}.dropstart .dropdown-toggle-split::before{margin-right:0}.btn-sm+.dropdown-toggle-split,.btn-group-sm>.btn+.dropdown-toggle-split{padding-right:.375rem;padding-left:.375rem}.btn-lg+.dropdown-toggle-split,.btn-group-lg>.btn+.dropdown-toggle-split{padding-right:.75rem;padding-left:.75rem}.btn-group-vertical{flex-direction:column;align-items:flex-start;justify-content:center}.btn-group-vertical>.btn,.btn-group-vertical>.btn-group{width:100%}.btn-group-vertical>.btn:not(:first-child),.btn-group-vertical>.btn-group:not(:first-child){margin-top:calc(var(--bs-border-width)*-1)}.btn-group-vertical>.btn:not(:last-child):not(.dropdown-toggle),.btn-group-vertical>.btn-group:not(:last-child)>.btn{border-bottom-right-radius:0;border-bottom-left-radius:0}.btn-group-vertical>.btn~.btn,.btn-group-vertical>.btn-group:not(:first-child)>.btn{border-top-left-radius:0;border-top-right-radius:0}.nav{--bs-nav-link-padding-x: 1rem;--bs-nav-link-padding-y: 0.5rem;--bs-nav-link-font-weight: ;--bs-nav-link-color: var(--bs-link-color);--bs-nav-link-hover-color: var(--bs-link-hover-color);--bs-nav-link-disabled-color: var(--bs-secondary-color);display:flex;flex-wrap:wrap;padding-left:0;margin-bottom:0;list-style:none}.nav-link{display:block;padding:var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);font-size:var(--bs-nav-link-font-size);font-weight:var(--bs-nav-link-font-weight);color:var(--bs-nav-link-color);text-decoration:none;background:none;border:0;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out}@media(prefers-reduced-motion: reduce){.nav-link{transition:none}}.nav-link:hover,.nav-link:focus{color:var(--bs-nav-link-hover-color)}.nav-link:focus-visible{outline:0;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.nav-link.disabled,.nav-link:disabled{color:var(--bs-nav-link-disabled-color);pointer-events:none;cursor:default}.nav-tabs{--bs-nav-tabs-border-width: var(--bs-border-width);--bs-nav-tabs-border-color: var(--bs-border-color);--bs-nav-tabs-border-radius: var(--bs-border-radius);--bs-nav-tabs-link-hover-border-color: var(--bs-secondary-bg) var(--bs-secondary-bg) var(--bs-border-color);--bs-nav-tabs-link-active-color: var(--bs-emphasis-color);--bs-nav-tabs-link-active-bg: var(--bs-body-bg);--bs-nav-tabs-link-active-border-color: var(--bs-border-color) var(--bs-border-color) var(--bs-body-bg);border-bottom:var(--bs-nav-tabs-border-width) solid var(--bs-nav-tabs-border-color)}.nav-tabs .nav-link{margin-bottom:calc(-1*var(--bs-nav-tabs-border-width));border:var(--bs-nav-tabs-border-width) solid rgba(0,0,0,0);border-top-left-radius:var(--bs-nav-tabs-border-radius);border-top-right-radius:var(--bs-nav-tabs-border-radius)}.nav-tabs .nav-link:hover,.nav-tabs .nav-link:focus{isolation:isolate;border-color:var(--bs-nav-tabs-link-hover-border-color)}.nav-tabs .nav-link.active,.nav-tabs .nav-item.show .nav-link{color:var(--bs-nav-tabs-link-active-color);background-color:var(--bs-nav-tabs-link-active-bg);border-color:var(--bs-nav-tabs-link-active-border-color)}.nav-tabs .dropdown-menu{margin-top:calc(-1*var(--bs-nav-tabs-border-width));border-top-left-radius:0;border-top-right-radius:0}.nav-pills{--bs-nav-pills-border-radius: var(--bs-border-radius);--bs-nav-pills-link-active-color: #fff;--bs-nav-pills-link-active-bg: #0d6efd}.nav-pills .nav-link{border-radius:var(--bs-nav-pills-border-radius)}.nav-pills .nav-link.active,.nav-pills .show>.nav-link{color:var(--bs-nav-pills-link-active-color);background-color:var(--bs-nav-pills-link-active-bg)}.nav-underline{--bs-nav-underline-gap: 1rem;--bs-nav-underline-border-width: 0.125rem;--bs-nav-underline-link-active-color: var(--bs-emphasis-color);gap:var(--bs-nav-underline-gap)}.nav-underline .nav-link{padding-right:0;padding-left:0;border-bottom:var(--bs-nav-underline-border-width) solid rgba(0,0,0,0)}.nav-underline .nav-link:hover,.nav-underline .nav-link:focus{border-bottom-color:currentcolor}.nav-underline .nav-link.active,.nav-underline .show>.nav-link{font-weight:700;color:var(--bs-nav-underline-link-active-color);border-bottom-color:currentcolor}.nav-fill>.nav-link,.nav-fill .nav-item{flex:1 1 auto;text-align:center}.nav-justified>.nav-link,.nav-justified .nav-item{flex-basis:0;flex-grow:1;text-align:center}.nav-fill .nav-item .nav-link,.nav-justified .nav-item .nav-link{width:100%}.tab-content>.tab-pane{display:none}.tab-content>.active{display:block}.navbar{--bs-navbar-padding-x: 0;--bs-navbar-padding-y: 0.5rem;--bs-navbar-color: rgba(var(--bs-emphasis-color-rgb), 0.65);--bs-navbar-hover-color: rgba(var(--bs-emphasis-color-rgb), 0.8);--bs-navbar-disabled-color: rgba(var(--bs-emphasis-color-rgb), 0.3);--bs-navbar-active-color: rgba(var(--bs-emphasis-color-rgb), 1);--bs-navbar-brand-padding-y: 0.3125rem;--bs-navbar-brand-margin-end: 1rem;--bs-navbar-brand-font-size: 1.25rem;--bs-navbar-brand-color: rgba(var(--bs-emphasis-color-rgb), 1);--bs-navbar-brand-hover-color: rgba(var(--bs-emphasis-color-rgb), 1);--bs-navbar-nav-link-padding-x: 0.5rem;--bs-navbar-toggler-padding-y: 0.25rem;--bs-navbar-toggler-padding-x: 0.75rem;--bs-navbar-toggler-font-size: 1.25rem;--bs-navbar-toggler-icon-bg: url(${___CSS_LOADER_URL_REPLACEMENT_11___});--bs-navbar-toggler-border-color: rgba(var(--bs-emphasis-color-rgb), 0.15);--bs-navbar-toggler-border-radius: var(--bs-border-radius);--bs-navbar-toggler-focus-width: 0.25rem;--bs-navbar-toggler-transition: box-shadow 0.15s ease-in-out;position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:var(--bs-navbar-padding-y) var(--bs-navbar-padding-x)}.navbar>.container,.navbar>.container-fluid,.navbar>.container-sm,.navbar>.container-md,.navbar>.container-lg,.navbar>.container-xl,.navbar>.container-xxl{display:flex;flex-wrap:inherit;align-items:center;justify-content:space-between}.navbar-brand{padding-top:var(--bs-navbar-brand-padding-y);padding-bottom:var(--bs-navbar-brand-padding-y);margin-right:var(--bs-navbar-brand-margin-end);font-size:var(--bs-navbar-brand-font-size);color:var(--bs-navbar-brand-color);text-decoration:none;white-space:nowrap}.navbar-brand:hover,.navbar-brand:focus{color:var(--bs-navbar-brand-hover-color)}.navbar-nav{--bs-nav-link-padding-x: 0;--bs-nav-link-padding-y: 0.5rem;--bs-nav-link-font-weight: ;--bs-nav-link-color: var(--bs-navbar-color);--bs-nav-link-hover-color: var(--bs-navbar-hover-color);--bs-nav-link-disabled-color: var(--bs-navbar-disabled-color);display:flex;flex-direction:column;padding-left:0;margin-bottom:0;list-style:none}.navbar-nav .nav-link.active,.navbar-nav .nav-link.show{color:var(--bs-navbar-active-color)}.navbar-nav .dropdown-menu{position:static}.navbar-text{padding-top:.5rem;padding-bottom:.5rem;color:var(--bs-navbar-color)}.navbar-text a,.navbar-text a:hover,.navbar-text a:focus{color:var(--bs-navbar-active-color)}.navbar-collapse{flex-basis:100%;flex-grow:1;align-items:center}.navbar-toggler{padding:var(--bs-navbar-toggler-padding-y) var(--bs-navbar-toggler-padding-x);font-size:var(--bs-navbar-toggler-font-size);line-height:1;color:var(--bs-navbar-color);background-color:rgba(0,0,0,0);border:var(--bs-border-width) solid var(--bs-navbar-toggler-border-color);border-radius:var(--bs-navbar-toggler-border-radius);transition:var(--bs-navbar-toggler-transition)}@media(prefers-reduced-motion: reduce){.navbar-toggler{transition:none}}.navbar-toggler:hover{text-decoration:none}.navbar-toggler:focus{text-decoration:none;outline:0;box-shadow:0 0 0 var(--bs-navbar-toggler-focus-width)}.navbar-toggler-icon{display:inline-block;width:1.5em;height:1.5em;vertical-align:middle;background-image:var(--bs-navbar-toggler-icon-bg);background-repeat:no-repeat;background-position:center;background-size:100%}.navbar-nav-scroll{max-height:var(--bs-scroll-height, 75vh);overflow-y:auto}@media(min-width: 576px){.navbar-expand-sm{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand-sm .navbar-nav{flex-direction:row}.navbar-expand-sm .navbar-nav .dropdown-menu{position:absolute}.navbar-expand-sm .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand-sm .navbar-nav-scroll{overflow:visible}.navbar-expand-sm .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand-sm .navbar-toggler{display:none}.navbar-expand-sm .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand-sm .offcanvas .offcanvas-header{display:none}.navbar-expand-sm .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}}@media(min-width: 768px){.navbar-expand-md{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand-md .navbar-nav{flex-direction:row}.navbar-expand-md .navbar-nav .dropdown-menu{position:absolute}.navbar-expand-md .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand-md .navbar-nav-scroll{overflow:visible}.navbar-expand-md .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand-md .navbar-toggler{display:none}.navbar-expand-md .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand-md .offcanvas .offcanvas-header{display:none}.navbar-expand-md .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}}@media(min-width: 992px){.navbar-expand-lg{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand-lg .navbar-nav{flex-direction:row}.navbar-expand-lg .navbar-nav .dropdown-menu{position:absolute}.navbar-expand-lg .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand-lg .navbar-nav-scroll{overflow:visible}.navbar-expand-lg .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand-lg .navbar-toggler{display:none}.navbar-expand-lg .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand-lg .offcanvas .offcanvas-header{display:none}.navbar-expand-lg .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}}@media(min-width: 1200px){.navbar-expand-xl{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand-xl .navbar-nav{flex-direction:row}.navbar-expand-xl .navbar-nav .dropdown-menu{position:absolute}.navbar-expand-xl .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand-xl .navbar-nav-scroll{overflow:visible}.navbar-expand-xl .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand-xl .navbar-toggler{display:none}.navbar-expand-xl .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand-xl .offcanvas .offcanvas-header{display:none}.navbar-expand-xl .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}}@media(min-width: 1400px){.navbar-expand-xxl{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand-xxl .navbar-nav{flex-direction:row}.navbar-expand-xxl .navbar-nav .dropdown-menu{position:absolute}.navbar-expand-xxl .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand-xxl .navbar-nav-scroll{overflow:visible}.navbar-expand-xxl .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand-xxl .navbar-toggler{display:none}.navbar-expand-xxl .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand-xxl .offcanvas .offcanvas-header{display:none}.navbar-expand-xxl .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}}.navbar-expand{flex-wrap:nowrap;justify-content:flex-start}.navbar-expand .navbar-nav{flex-direction:row}.navbar-expand .navbar-nav .dropdown-menu{position:absolute}.navbar-expand .navbar-nav .nav-link{padding-right:var(--bs-navbar-nav-link-padding-x);padding-left:var(--bs-navbar-nav-link-padding-x)}.navbar-expand .navbar-nav-scroll{overflow:visible}.navbar-expand .navbar-collapse{display:flex !important;flex-basis:auto}.navbar-expand .navbar-toggler{display:none}.navbar-expand .offcanvas{position:static;z-index:auto;flex-grow:1;width:auto !important;height:auto !important;visibility:visible !important;background-color:rgba(0,0,0,0) !important;border:0 !important;transform:none !important;transition:none}.navbar-expand .offcanvas .offcanvas-header{display:none}.navbar-expand .offcanvas .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible}.navbar-dark,.navbar[data-bs-theme=dark]{--bs-navbar-color: rgba(255, 255, 255, 0.55);--bs-navbar-hover-color: rgba(255, 255, 255, 0.75);--bs-navbar-disabled-color: rgba(255, 255, 255, 0.25);--bs-navbar-active-color: #fff;--bs-navbar-brand-color: #fff;--bs-navbar-brand-hover-color: #fff;--bs-navbar-toggler-border-color: rgba(255, 255, 255, 0.1);--bs-navbar-toggler-icon-bg: url(${___CSS_LOADER_URL_REPLACEMENT_12___})}[data-bs-theme=dark] .navbar-toggler-icon{--bs-navbar-toggler-icon-bg: url(${___CSS_LOADER_URL_REPLACEMENT_12___})}.card{--bs-card-spacer-y: 1rem;--bs-card-spacer-x: 1rem;--bs-card-title-spacer-y: 0.5rem;--bs-card-title-color: ;--bs-card-subtitle-color: ;--bs-card-border-width: var(--bs-border-width);--bs-card-border-color: var(--bs-border-color-translucent);--bs-card-border-radius: var(--bs-border-radius);--bs-card-box-shadow: ;--bs-card-inner-border-radius: calc(var(--bs-border-radius) - (var(--bs-border-width)));--bs-card-cap-padding-y: 0.5rem;--bs-card-cap-padding-x: 1rem;--bs-card-cap-bg: rgba(var(--bs-body-color-rgb), 0.03);--bs-card-cap-color: ;--bs-card-height: ;--bs-card-color: ;--bs-card-bg: var(--bs-body-bg);--bs-card-img-overlay-padding: 1rem;--bs-card-group-margin: 0.75rem;position:relative;display:flex;flex-direction:column;min-width:0;height:var(--bs-card-height);color:var(--bs-body-color);word-wrap:break-word;background-color:var(--bs-card-bg);background-clip:border-box;border:var(--bs-card-border-width) solid var(--bs-card-border-color);border-radius:var(--bs-card-border-radius)}.card>hr{margin-right:0;margin-left:0}.card>.list-group{border-top:inherit;border-bottom:inherit}.card>.list-group:first-child{border-top-width:0;border-top-left-radius:var(--bs-card-inner-border-radius);border-top-right-radius:var(--bs-card-inner-border-radius)}.card>.list-group:last-child{border-bottom-width:0;border-bottom-right-radius:var(--bs-card-inner-border-radius);border-bottom-left-radius:var(--bs-card-inner-border-radius)}.card>.card-header+.list-group,.card>.list-group+.card-footer{border-top:0}.card-body{flex:1 1 auto;padding:var(--bs-card-spacer-y) var(--bs-card-spacer-x);color:var(--bs-card-color)}.card-title{margin-bottom:var(--bs-card-title-spacer-y);color:var(--bs-card-title-color)}.card-subtitle{margin-top:calc(-0.5*var(--bs-card-title-spacer-y));margin-bottom:0;color:var(--bs-card-subtitle-color)}.card-text:last-child{margin-bottom:0}.card-link+.card-link{margin-left:var(--bs-card-spacer-x)}.card-header{padding:var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);margin-bottom:0;color:var(--bs-card-cap-color);background-color:var(--bs-card-cap-bg);border-bottom:var(--bs-card-border-width) solid var(--bs-card-border-color)}.card-header:first-child{border-radius:var(--bs-card-inner-border-radius) var(--bs-card-inner-border-radius) 0 0}.card-footer{padding:var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);color:var(--bs-card-cap-color);background-color:var(--bs-card-cap-bg);border-top:var(--bs-card-border-width) solid var(--bs-card-border-color)}.card-footer:last-child{border-radius:0 0 var(--bs-card-inner-border-radius) var(--bs-card-inner-border-radius)}.card-header-tabs{margin-right:calc(-0.5*var(--bs-card-cap-padding-x));margin-bottom:calc(-1*var(--bs-card-cap-padding-y));margin-left:calc(-0.5*var(--bs-card-cap-padding-x));border-bottom:0}.card-header-tabs .nav-link.active{background-color:var(--bs-card-bg);border-bottom-color:var(--bs-card-bg)}.card-header-pills{margin-right:calc(-0.5*var(--bs-card-cap-padding-x));margin-left:calc(-0.5*var(--bs-card-cap-padding-x))}.card-img-overlay{position:absolute;top:0;right:0;bottom:0;left:0;padding:var(--bs-card-img-overlay-padding);border-radius:var(--bs-card-inner-border-radius)}.card-img,.card-img-top,.card-img-bottom{width:100%}.card-img,.card-img-top{border-top-left-radius:var(--bs-card-inner-border-radius);border-top-right-radius:var(--bs-card-inner-border-radius)}.card-img,.card-img-bottom{border-bottom-right-radius:var(--bs-card-inner-border-radius);border-bottom-left-radius:var(--bs-card-inner-border-radius)}.card-group>.card{margin-bottom:var(--bs-card-group-margin)}@media(min-width: 576px){.card-group{display:flex;flex-flow:row wrap}.card-group>.card{flex:1 0 0%;margin-bottom:0}.card-group>.card+.card{margin-left:0;border-left:0}.card-group>.card:not(:last-child){border-top-right-radius:0;border-bottom-right-radius:0}.card-group>.card:not(:last-child) .card-img-top,.card-group>.card:not(:last-child) .card-header{border-top-right-radius:0}.card-group>.card:not(:last-child) .card-img-bottom,.card-group>.card:not(:last-child) .card-footer{border-bottom-right-radius:0}.card-group>.card:not(:first-child){border-top-left-radius:0;border-bottom-left-radius:0}.card-group>.card:not(:first-child) .card-img-top,.card-group>.card:not(:first-child) .card-header{border-top-left-radius:0}.card-group>.card:not(:first-child) .card-img-bottom,.card-group>.card:not(:first-child) .card-footer{border-bottom-left-radius:0}}.accordion{--bs-accordion-color: var(--bs-body-color);--bs-accordion-bg: var(--bs-body-bg);--bs-accordion-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-radius 0.15s ease;--bs-accordion-border-color: var(--bs-border-color);--bs-accordion-border-width: var(--bs-border-width);--bs-accordion-border-radius: var(--bs-border-radius);--bs-accordion-inner-border-radius: calc(var(--bs-border-radius) - (var(--bs-border-width)));--bs-accordion-btn-padding-x: 1.25rem;--bs-accordion-btn-padding-y: 1rem;--bs-accordion-btn-color: var(--bs-body-color);--bs-accordion-btn-bg: var(--bs-accordion-bg);--bs-accordion-btn-icon: url(${___CSS_LOADER_URL_REPLACEMENT_13___});--bs-accordion-btn-icon-width: 1.25rem;--bs-accordion-btn-icon-transform: rotate(-180deg);--bs-accordion-btn-icon-transition: transform 0.2s ease-in-out;--bs-accordion-btn-active-icon: url(${___CSS_LOADER_URL_REPLACEMENT_14___});--bs-accordion-btn-focus-border-color: #86b7fe;--bs-accordion-btn-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);--bs-accordion-body-padding-x: 1.25rem;--bs-accordion-body-padding-y: 1rem;--bs-accordion-active-color: var(--bs-primary-text-emphasis);--bs-accordion-active-bg: var(--bs-primary-bg-subtle)}.accordion-button{position:relative;display:flex;align-items:center;width:100%;padding:var(--bs-accordion-btn-padding-y) var(--bs-accordion-btn-padding-x);font-size:1rem;color:var(--bs-accordion-btn-color);text-align:left;background-color:var(--bs-accordion-btn-bg);border:0;border-radius:0;overflow-anchor:none;transition:var(--bs-accordion-transition)}@media(prefers-reduced-motion: reduce){.accordion-button{transition:none}}.accordion-button:not(.collapsed){color:var(--bs-accordion-active-color);background-color:var(--bs-accordion-active-bg);box-shadow:inset 0 calc(-1*var(--bs-accordion-border-width)) 0 var(--bs-accordion-border-color)}.accordion-button:not(.collapsed)::after{background-image:var(--bs-accordion-btn-active-icon);transform:var(--bs-accordion-btn-icon-transform)}.accordion-button::after{flex-shrink:0;width:var(--bs-accordion-btn-icon-width);height:var(--bs-accordion-btn-icon-width);margin-left:auto;content:"";background-image:var(--bs-accordion-btn-icon);background-repeat:no-repeat;background-size:var(--bs-accordion-btn-icon-width);transition:var(--bs-accordion-btn-icon-transition)}@media(prefers-reduced-motion: reduce){.accordion-button::after{transition:none}}.accordion-button:hover{z-index:2}.accordion-button:focus{z-index:3;border-color:var(--bs-accordion-btn-focus-border-color);outline:0;box-shadow:var(--bs-accordion-btn-focus-box-shadow)}.accordion-header{margin-bottom:0}.accordion-item{color:var(--bs-accordion-color);background-color:var(--bs-accordion-bg);border:var(--bs-accordion-border-width) solid var(--bs-accordion-border-color)}.accordion-item:first-of-type{border-top-left-radius:var(--bs-accordion-border-radius);border-top-right-radius:var(--bs-accordion-border-radius)}.accordion-item:first-of-type .accordion-button{border-top-left-radius:var(--bs-accordion-inner-border-radius);border-top-right-radius:var(--bs-accordion-inner-border-radius)}.accordion-item:not(:first-of-type){border-top:0}.accordion-item:last-of-type{border-bottom-right-radius:var(--bs-accordion-border-radius);border-bottom-left-radius:var(--bs-accordion-border-radius)}.accordion-item:last-of-type .accordion-button.collapsed{border-bottom-right-radius:var(--bs-accordion-inner-border-radius);border-bottom-left-radius:var(--bs-accordion-inner-border-radius)}.accordion-item:last-of-type .accordion-collapse{border-bottom-right-radius:var(--bs-accordion-border-radius);border-bottom-left-radius:var(--bs-accordion-border-radius)}.accordion-body{padding:var(--bs-accordion-body-padding-y) var(--bs-accordion-body-padding-x)}.accordion-flush .accordion-collapse{border-width:0}.accordion-flush .accordion-item{border-right:0;border-left:0;border-radius:0}.accordion-flush .accordion-item:first-child{border-top:0}.accordion-flush .accordion-item:last-child{border-bottom:0}.accordion-flush .accordion-item .accordion-button,.accordion-flush .accordion-item .accordion-button.collapsed{border-radius:0}[data-bs-theme=dark] .accordion-button::after{--bs-accordion-btn-icon: url(${___CSS_LOADER_URL_REPLACEMENT_15___});--bs-accordion-btn-active-icon: url(${___CSS_LOADER_URL_REPLACEMENT_15___})}.breadcrumb{--bs-breadcrumb-padding-x: 0;--bs-breadcrumb-padding-y: 0;--bs-breadcrumb-margin-bottom: 1rem;--bs-breadcrumb-bg: ;--bs-breadcrumb-border-radius: ;--bs-breadcrumb-divider-color: var(--bs-secondary-color);--bs-breadcrumb-item-padding-x: 0.5rem;--bs-breadcrumb-item-active-color: var(--bs-secondary-color);display:flex;flex-wrap:wrap;padding:var(--bs-breadcrumb-padding-y) var(--bs-breadcrumb-padding-x);margin-bottom:var(--bs-breadcrumb-margin-bottom);font-size:var(--bs-breadcrumb-font-size);list-style:none;background-color:var(--bs-breadcrumb-bg);border-radius:var(--bs-breadcrumb-border-radius)}.breadcrumb-item+.breadcrumb-item{padding-left:var(--bs-breadcrumb-item-padding-x)}.breadcrumb-item+.breadcrumb-item::before{float:left;padding-right:var(--bs-breadcrumb-item-padding-x);color:var(--bs-breadcrumb-divider-color);content:var(--bs-breadcrumb-divider, "/") /* rtl: var(--bs-breadcrumb-divider, "/") */}.breadcrumb-item.active{color:var(--bs-breadcrumb-item-active-color)}.pagination{--bs-pagination-padding-x: 0.75rem;--bs-pagination-padding-y: 0.375rem;--bs-pagination-font-size:1rem;--bs-pagination-color: var(--bs-link-color);--bs-pagination-bg: var(--bs-body-bg);--bs-pagination-border-width: var(--bs-border-width);--bs-pagination-border-color: var(--bs-border-color);--bs-pagination-border-radius: var(--bs-border-radius);--bs-pagination-hover-color: var(--bs-link-hover-color);--bs-pagination-hover-bg: var(--bs-tertiary-bg);--bs-pagination-hover-border-color: var(--bs-border-color);--bs-pagination-focus-color: var(--bs-link-hover-color);--bs-pagination-focus-bg: var(--bs-secondary-bg);--bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);--bs-pagination-active-color: #fff;--bs-pagination-active-bg: #0d6efd;--bs-pagination-active-border-color: #0d6efd;--bs-pagination-disabled-color: var(--bs-secondary-color);--bs-pagination-disabled-bg: var(--bs-secondary-bg);--bs-pagination-disabled-border-color: var(--bs-border-color);display:flex;padding-left:0;list-style:none}.page-link{position:relative;display:block;padding:var(--bs-pagination-padding-y) var(--bs-pagination-padding-x);font-size:var(--bs-pagination-font-size);color:var(--bs-pagination-color);text-decoration:none;background-color:var(--bs-pagination-bg);border:var(--bs-pagination-border-width) solid var(--bs-pagination-border-color);transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}@media(prefers-reduced-motion: reduce){.page-link{transition:none}}.page-link:hover{z-index:2;color:var(--bs-pagination-hover-color);background-color:var(--bs-pagination-hover-bg);border-color:var(--bs-pagination-hover-border-color)}.page-link:focus{z-index:3;color:var(--bs-pagination-focus-color);background-color:var(--bs-pagination-focus-bg);outline:0;box-shadow:var(--bs-pagination-focus-box-shadow)}.page-link.active,.active>.page-link{z-index:3;color:var(--bs-pagination-active-color);background-color:var(--bs-pagination-active-bg);border-color:var(--bs-pagination-active-border-color)}.page-link.disabled,.disabled>.page-link{color:var(--bs-pagination-disabled-color);pointer-events:none;background-color:var(--bs-pagination-disabled-bg);border-color:var(--bs-pagination-disabled-border-color)}.page-item:not(:first-child) .page-link{margin-left:calc(var(--bs-border-width)*-1)}.page-item:first-child .page-link{border-top-left-radius:var(--bs-pagination-border-radius);border-bottom-left-radius:var(--bs-pagination-border-radius)}.page-item:last-child .page-link{border-top-right-radius:var(--bs-pagination-border-radius);border-bottom-right-radius:var(--bs-pagination-border-radius)}.pagination-lg{--bs-pagination-padding-x: 1.5rem;--bs-pagination-padding-y: 0.75rem;--bs-pagination-font-size:1.25rem;--bs-pagination-border-radius: var(--bs-border-radius-lg)}.pagination-sm{--bs-pagination-padding-x: 0.5rem;--bs-pagination-padding-y: 0.25rem;--bs-pagination-font-size:0.875rem;--bs-pagination-border-radius: var(--bs-border-radius-sm)}.badge{--bs-badge-padding-x: 0.65em;--bs-badge-padding-y: 0.35em;--bs-badge-font-size:0.75em;--bs-badge-font-weight: 700;--bs-badge-color: #fff;--bs-badge-border-radius: var(--bs-border-radius);display:inline-block;padding:var(--bs-badge-padding-y) var(--bs-badge-padding-x);font-size:var(--bs-badge-font-size);font-weight:var(--bs-badge-font-weight);line-height:1;color:var(--bs-badge-color);text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:var(--bs-badge-border-radius)}.badge:empty{display:none}.btn .badge{position:relative;top:-1px}.alert{--bs-alert-bg: transparent;--bs-alert-padding-x: 1rem;--bs-alert-padding-y: 1rem;--bs-alert-margin-bottom: 1rem;--bs-alert-color: inherit;--bs-alert-border-color: transparent;--bs-alert-border: var(--bs-border-width) solid var(--bs-alert-border-color);--bs-alert-border-radius: var(--bs-border-radius);--bs-alert-link-color: inherit;position:relative;padding:var(--bs-alert-padding-y) var(--bs-alert-padding-x);margin-bottom:var(--bs-alert-margin-bottom);color:var(--bs-alert-color);background-color:var(--bs-alert-bg);border:var(--bs-alert-border);border-radius:var(--bs-alert-border-radius)}.alert-heading{color:inherit}.alert-link{font-weight:700;color:var(--bs-alert-link-color)}.alert-dismissible{padding-right:3rem}.alert-dismissible .btn-close{position:absolute;top:0;right:0;z-index:2;padding:1.25rem 1rem}.alert-primary{--bs-alert-color: var(--bs-primary-text-emphasis);--bs-alert-bg: var(--bs-primary-bg-subtle);--bs-alert-border-color: var(--bs-primary-border-subtle);--bs-alert-link-color: var(--bs-primary-text-emphasis)}.alert-secondary{--bs-alert-color: var(--bs-secondary-text-emphasis);--bs-alert-bg: var(--bs-secondary-bg-subtle);--bs-alert-border-color: var(--bs-secondary-border-subtle);--bs-alert-link-color: var(--bs-secondary-text-emphasis)}.alert-success{--bs-alert-color: var(--bs-success-text-emphasis);--bs-alert-bg: var(--bs-success-bg-subtle);--bs-alert-border-color: var(--bs-success-border-subtle);--bs-alert-link-color: var(--bs-success-text-emphasis)}.alert-info{--bs-alert-color: var(--bs-info-text-emphasis);--bs-alert-bg: var(--bs-info-bg-subtle);--bs-alert-border-color: var(--bs-info-border-subtle);--bs-alert-link-color: var(--bs-info-text-emphasis)}.alert-warning{--bs-alert-color: var(--bs-warning-text-emphasis);--bs-alert-bg: var(--bs-warning-bg-subtle);--bs-alert-border-color: var(--bs-warning-border-subtle);--bs-alert-link-color: var(--bs-warning-text-emphasis)}.alert-danger{--bs-alert-color: var(--bs-danger-text-emphasis);--bs-alert-bg: var(--bs-danger-bg-subtle);--bs-alert-border-color: var(--bs-danger-border-subtle);--bs-alert-link-color: var(--bs-danger-text-emphasis)}.alert-light{--bs-alert-color: var(--bs-light-text-emphasis);--bs-alert-bg: var(--bs-light-bg-subtle);--bs-alert-border-color: var(--bs-light-border-subtle);--bs-alert-link-color: var(--bs-light-text-emphasis)}.alert-dark{--bs-alert-color: var(--bs-dark-text-emphasis);--bs-alert-bg: var(--bs-dark-bg-subtle);--bs-alert-border-color: var(--bs-dark-border-subtle);--bs-alert-link-color: var(--bs-dark-text-emphasis)}@keyframes progress-bar-stripes{0%{background-position-x:1rem}}.progress,.progress-stacked{--bs-progress-height: 1rem;--bs-progress-font-size:0.75rem;--bs-progress-bg: var(--bs-secondary-bg);--bs-progress-border-radius: var(--bs-border-radius);--bs-progress-box-shadow: var(--bs-box-shadow-inset);--bs-progress-bar-color: #fff;--bs-progress-bar-bg: #0d6efd;--bs-progress-bar-transition: width 0.6s ease;display:flex;height:var(--bs-progress-height);overflow:hidden;font-size:var(--bs-progress-font-size);background-color:var(--bs-progress-bg);border-radius:var(--bs-progress-border-radius)}.progress-bar{display:flex;flex-direction:column;justify-content:center;overflow:hidden;color:var(--bs-progress-bar-color);text-align:center;white-space:nowrap;background-color:var(--bs-progress-bar-bg);transition:var(--bs-progress-bar-transition)}@media(prefers-reduced-motion: reduce){.progress-bar{transition:none}}.progress-bar-striped{background-image:linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);background-size:var(--bs-progress-height) var(--bs-progress-height)}.progress-stacked>.progress{overflow:visible}.progress-stacked>.progress>.progress-bar{width:100%}.progress-bar-animated{animation:1s linear infinite progress-bar-stripes}@media(prefers-reduced-motion: reduce){.progress-bar-animated{animation:none}}.list-group{--bs-list-group-color: var(--bs-body-color);--bs-list-group-bg: var(--bs-body-bg);--bs-list-group-border-color: var(--bs-border-color);--bs-list-group-border-width: var(--bs-border-width);--bs-list-group-border-radius: var(--bs-border-radius);--bs-list-group-item-padding-x: 1rem;--bs-list-group-item-padding-y: 0.5rem;--bs-list-group-action-color: var(--bs-secondary-color);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-tertiary-bg);--bs-list-group-action-active-color: var(--bs-body-color);--bs-list-group-action-active-bg: var(--bs-secondary-bg);--bs-list-group-disabled-color: var(--bs-secondary-color);--bs-list-group-disabled-bg: var(--bs-body-bg);--bs-list-group-active-color: #fff;--bs-list-group-active-bg: #0d6efd;--bs-list-group-active-border-color: #0d6efd;display:flex;flex-direction:column;padding-left:0;margin-bottom:0;border-radius:var(--bs-list-group-border-radius)}.list-group-numbered{list-style-type:none;counter-reset:section}.list-group-numbered>.list-group-item::before{content:counters(section, ".") ". ";counter-increment:section}.list-group-item-action{width:100%;color:var(--bs-list-group-action-color);text-align:inherit}.list-group-item-action:hover,.list-group-item-action:focus{z-index:1;color:var(--bs-list-group-action-hover-color);text-decoration:none;background-color:var(--bs-list-group-action-hover-bg)}.list-group-item-action:active{color:var(--bs-list-group-action-active-color);background-color:var(--bs-list-group-action-active-bg)}.list-group-item{position:relative;display:block;padding:var(--bs-list-group-item-padding-y) var(--bs-list-group-item-padding-x);color:var(--bs-list-group-color);text-decoration:none;background-color:var(--bs-list-group-bg);border:var(--bs-list-group-border-width) solid var(--bs-list-group-border-color)}.list-group-item:first-child{border-top-left-radius:inherit;border-top-right-radius:inherit}.list-group-item:last-child{border-bottom-right-radius:inherit;border-bottom-left-radius:inherit}.list-group-item.disabled,.list-group-item:disabled{color:var(--bs-list-group-disabled-color);pointer-events:none;background-color:var(--bs-list-group-disabled-bg)}.list-group-item.active{z-index:2;color:var(--bs-list-group-active-color);background-color:var(--bs-list-group-active-bg);border-color:var(--bs-list-group-active-border-color)}.list-group-item+.list-group-item{border-top-width:0}.list-group-item+.list-group-item.active{margin-top:calc(-1*var(--bs-list-group-border-width));border-top-width:var(--bs-list-group-border-width)}.list-group-horizontal{flex-direction:row}.list-group-horizontal>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal>.list-group-item.active{margin-top:0}.list-group-horizontal>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}@media(min-width: 576px){.list-group-horizontal-sm{flex-direction:row}.list-group-horizontal-sm>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal-sm>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal-sm>.list-group-item.active{margin-top:0}.list-group-horizontal-sm>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal-sm>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}}@media(min-width: 768px){.list-group-horizontal-md{flex-direction:row}.list-group-horizontal-md>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal-md>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal-md>.list-group-item.active{margin-top:0}.list-group-horizontal-md>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal-md>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}}@media(min-width: 992px){.list-group-horizontal-lg{flex-direction:row}.list-group-horizontal-lg>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal-lg>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal-lg>.list-group-item.active{margin-top:0}.list-group-horizontal-lg>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal-lg>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}}@media(min-width: 1200px){.list-group-horizontal-xl{flex-direction:row}.list-group-horizontal-xl>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal-xl>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal-xl>.list-group-item.active{margin-top:0}.list-group-horizontal-xl>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal-xl>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}}@media(min-width: 1400px){.list-group-horizontal-xxl{flex-direction:row}.list-group-horizontal-xxl>.list-group-item:first-child:not(:last-child){border-bottom-left-radius:var(--bs-list-group-border-radius);border-top-right-radius:0}.list-group-horizontal-xxl>.list-group-item:last-child:not(:first-child){border-top-right-radius:var(--bs-list-group-border-radius);border-bottom-left-radius:0}.list-group-horizontal-xxl>.list-group-item.active{margin-top:0}.list-group-horizontal-xxl>.list-group-item+.list-group-item{border-top-width:var(--bs-list-group-border-width);border-left-width:0}.list-group-horizontal-xxl>.list-group-item+.list-group-item.active{margin-left:calc(-1*var(--bs-list-group-border-width));border-left-width:var(--bs-list-group-border-width)}}.list-group-flush{border-radius:0}.list-group-flush>.list-group-item{border-width:0 0 var(--bs-list-group-border-width)}.list-group-flush>.list-group-item:last-child{border-bottom-width:0}.list-group-item-primary{--bs-list-group-color: var(--bs-primary-text-emphasis);--bs-list-group-bg: var(--bs-primary-bg-subtle);--bs-list-group-border-color: var(--bs-primary-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-primary-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-primary-border-subtle);--bs-list-group-active-color: var(--bs-primary-bg-subtle);--bs-list-group-active-bg: var(--bs-primary-text-emphasis);--bs-list-group-active-border-color: var(--bs-primary-text-emphasis)}.list-group-item-secondary{--bs-list-group-color: var(--bs-secondary-text-emphasis);--bs-list-group-bg: var(--bs-secondary-bg-subtle);--bs-list-group-border-color: var(--bs-secondary-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-secondary-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-secondary-border-subtle);--bs-list-group-active-color: var(--bs-secondary-bg-subtle);--bs-list-group-active-bg: var(--bs-secondary-text-emphasis);--bs-list-group-active-border-color: var(--bs-secondary-text-emphasis)}.list-group-item-success{--bs-list-group-color: var(--bs-success-text-emphasis);--bs-list-group-bg: var(--bs-success-bg-subtle);--bs-list-group-border-color: var(--bs-success-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-success-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-success-border-subtle);--bs-list-group-active-color: var(--bs-success-bg-subtle);--bs-list-group-active-bg: var(--bs-success-text-emphasis);--bs-list-group-active-border-color: var(--bs-success-text-emphasis)}.list-group-item-info{--bs-list-group-color: var(--bs-info-text-emphasis);--bs-list-group-bg: var(--bs-info-bg-subtle);--bs-list-group-border-color: var(--bs-info-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-info-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-info-border-subtle);--bs-list-group-active-color: var(--bs-info-bg-subtle);--bs-list-group-active-bg: var(--bs-info-text-emphasis);--bs-list-group-active-border-color: var(--bs-info-text-emphasis)}.list-group-item-warning{--bs-list-group-color: var(--bs-warning-text-emphasis);--bs-list-group-bg: var(--bs-warning-bg-subtle);--bs-list-group-border-color: var(--bs-warning-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-warning-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-warning-border-subtle);--bs-list-group-active-color: var(--bs-warning-bg-subtle);--bs-list-group-active-bg: var(--bs-warning-text-emphasis);--bs-list-group-active-border-color: var(--bs-warning-text-emphasis)}.list-group-item-danger{--bs-list-group-color: var(--bs-danger-text-emphasis);--bs-list-group-bg: var(--bs-danger-bg-subtle);--bs-list-group-border-color: var(--bs-danger-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-danger-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-danger-border-subtle);--bs-list-group-active-color: var(--bs-danger-bg-subtle);--bs-list-group-active-bg: var(--bs-danger-text-emphasis);--bs-list-group-active-border-color: var(--bs-danger-text-emphasis)}.list-group-item-light{--bs-list-group-color: var(--bs-light-text-emphasis);--bs-list-group-bg: var(--bs-light-bg-subtle);--bs-list-group-border-color: var(--bs-light-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-light-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-light-border-subtle);--bs-list-group-active-color: var(--bs-light-bg-subtle);--bs-list-group-active-bg: var(--bs-light-text-emphasis);--bs-list-group-active-border-color: var(--bs-light-text-emphasis)}.list-group-item-dark{--bs-list-group-color: var(--bs-dark-text-emphasis);--bs-list-group-bg: var(--bs-dark-bg-subtle);--bs-list-group-border-color: var(--bs-dark-border-subtle);--bs-list-group-action-hover-color: var(--bs-emphasis-color);--bs-list-group-action-hover-bg: var(--bs-dark-border-subtle);--bs-list-group-action-active-color: var(--bs-emphasis-color);--bs-list-group-action-active-bg: var(--bs-dark-border-subtle);--bs-list-group-active-color: var(--bs-dark-bg-subtle);--bs-list-group-active-bg: var(--bs-dark-text-emphasis);--bs-list-group-active-border-color: var(--bs-dark-text-emphasis)}.btn-close{--bs-btn-close-color: #000;--bs-btn-close-bg: url(${___CSS_LOADER_URL_REPLACEMENT_16___});--bs-btn-close-opacity: 0.5;--bs-btn-close-hover-opacity: 0.75;--bs-btn-close-focus-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);--bs-btn-close-focus-opacity: 1;--bs-btn-close-disabled-opacity: 0.25;--bs-btn-close-white-filter: invert(1) grayscale(100%) brightness(200%);box-sizing:content-box;width:1em;height:1em;padding:.25em .25em;color:var(--bs-btn-close-color);background:rgba(0,0,0,0) var(--bs-btn-close-bg) center/1em auto no-repeat;border:0;border-radius:.375rem;opacity:var(--bs-btn-close-opacity)}.btn-close:hover{color:var(--bs-btn-close-color);text-decoration:none;opacity:var(--bs-btn-close-hover-opacity)}.btn-close:focus{outline:0;box-shadow:var(--bs-btn-close-focus-shadow);opacity:var(--bs-btn-close-focus-opacity)}.btn-close:disabled,.btn-close.disabled{pointer-events:none;user-select:none;opacity:var(--bs-btn-close-disabled-opacity)}.btn-close-white{filter:var(--bs-btn-close-white-filter)}[data-bs-theme=dark] .btn-close{filter:var(--bs-btn-close-white-filter)}.toast{--bs-toast-zindex: 1090;--bs-toast-padding-x: 0.75rem;--bs-toast-padding-y: 0.5rem;--bs-toast-spacing: 1.5rem;--bs-toast-max-width: 350px;--bs-toast-font-size:0.875rem;--bs-toast-color: ;--bs-toast-bg: rgba(var(--bs-body-bg-rgb), 0.85);--bs-toast-border-width: var(--bs-border-width);--bs-toast-border-color: var(--bs-border-color-translucent);--bs-toast-border-radius: var(--bs-border-radius);--bs-toast-box-shadow: var(--bs-box-shadow);--bs-toast-header-color: var(--bs-secondary-color);--bs-toast-header-bg: rgba(var(--bs-body-bg-rgb), 0.85);--bs-toast-header-border-color: var(--bs-border-color-translucent);width:var(--bs-toast-max-width);max-width:100%;font-size:var(--bs-toast-font-size);color:var(--bs-toast-color);pointer-events:auto;background-color:var(--bs-toast-bg);background-clip:padding-box;border:var(--bs-toast-border-width) solid var(--bs-toast-border-color);box-shadow:var(--bs-toast-box-shadow);border-radius:var(--bs-toast-border-radius)}.toast.showing{opacity:0}.toast:not(.show){display:none}.toast-container{--bs-toast-zindex: 1090;position:absolute;z-index:var(--bs-toast-zindex);width:max-content;max-width:100%;pointer-events:none}.toast-container>:not(:last-child){margin-bottom:var(--bs-toast-spacing)}.toast-header{display:flex;align-items:center;padding:var(--bs-toast-padding-y) var(--bs-toast-padding-x);color:var(--bs-toast-header-color);background-color:var(--bs-toast-header-bg);background-clip:padding-box;border-bottom:var(--bs-toast-border-width) solid var(--bs-toast-header-border-color);border-top-left-radius:calc(var(--bs-toast-border-radius) - var(--bs-toast-border-width));border-top-right-radius:calc(var(--bs-toast-border-radius) - var(--bs-toast-border-width))}.toast-header .btn-close{margin-right:calc(-0.5*var(--bs-toast-padding-x));margin-left:var(--bs-toast-padding-x)}.toast-body{padding:var(--bs-toast-padding-x);word-wrap:break-word}.modal{--bs-modal-zindex: 1055;--bs-modal-width: 500px;--bs-modal-padding: 1rem;--bs-modal-margin: 0.5rem;--bs-modal-color: ;--bs-modal-bg: var(--bs-body-bg);--bs-modal-border-color: var(--bs-border-color-translucent);--bs-modal-border-width: var(--bs-border-width);--bs-modal-border-radius: var(--bs-border-radius-lg);--bs-modal-box-shadow: var(--bs-box-shadow-sm);--bs-modal-inner-border-radius: calc(var(--bs-border-radius-lg) - (var(--bs-border-width)));--bs-modal-header-padding-x: 1rem;--bs-modal-header-padding-y: 1rem;--bs-modal-header-padding: 1rem 1rem;--bs-modal-header-border-color: var(--bs-border-color);--bs-modal-header-border-width: var(--bs-border-width);--bs-modal-title-line-height: 1.5;--bs-modal-footer-gap: 0.5rem;--bs-modal-footer-bg: ;--bs-modal-footer-border-color: var(--bs-border-color);--bs-modal-footer-border-width: var(--bs-border-width);position:fixed;top:0;left:0;z-index:var(--bs-modal-zindex);display:none;width:100%;height:100%;overflow-x:hidden;overflow-y:auto;outline:0}.modal-dialog{position:relative;width:auto;margin:var(--bs-modal-margin);pointer-events:none}.modal.fade .modal-dialog{transition:transform .3s ease-out;transform:translate(0, -50px)}@media(prefers-reduced-motion: reduce){.modal.fade .modal-dialog{transition:none}}.modal.show .modal-dialog{transform:none}.modal.modal-static .modal-dialog{transform:scale(1.02)}.modal-dialog-scrollable{height:calc(100% - var(--bs-modal-margin)*2)}.modal-dialog-scrollable .modal-content{max-height:100%;overflow:hidden}.modal-dialog-scrollable .modal-body{overflow-y:auto}.modal-dialog-centered{display:flex;align-items:center;min-height:calc(100% - var(--bs-modal-margin)*2)}.modal-content{position:relative;display:flex;flex-direction:column;width:100%;color:var(--bs-modal-color);pointer-events:auto;background-color:var(--bs-modal-bg);background-clip:padding-box;border:var(--bs-modal-border-width) solid var(--bs-modal-border-color);border-radius:var(--bs-modal-border-radius);outline:0}.modal-backdrop{--bs-backdrop-zindex: 1050;--bs-backdrop-bg: #000;--bs-backdrop-opacity: 0.5;position:fixed;top:0;left:0;z-index:var(--bs-backdrop-zindex);width:100vw;height:100vh;background-color:var(--bs-backdrop-bg)}.modal-backdrop.fade{opacity:0}.modal-backdrop.show{opacity:var(--bs-backdrop-opacity)}.modal-header{display:flex;flex-shrink:0;align-items:center;justify-content:space-between;padding:var(--bs-modal-header-padding);border-bottom:var(--bs-modal-header-border-width) solid var(--bs-modal-header-border-color);border-top-left-radius:var(--bs-modal-inner-border-radius);border-top-right-radius:var(--bs-modal-inner-border-radius)}.modal-header .btn-close{padding:calc(var(--bs-modal-header-padding-y)*.5) calc(var(--bs-modal-header-padding-x)*.5);margin:calc(-0.5*var(--bs-modal-header-padding-y)) calc(-0.5*var(--bs-modal-header-padding-x)) calc(-0.5*var(--bs-modal-header-padding-y)) auto}.modal-title{margin-bottom:0;line-height:var(--bs-modal-title-line-height)}.modal-body{position:relative;flex:1 1 auto;padding:var(--bs-modal-padding)}.modal-footer{display:flex;flex-shrink:0;flex-wrap:wrap;align-items:center;justify-content:flex-end;padding:calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap)*.5);background-color:var(--bs-modal-footer-bg);border-top:var(--bs-modal-footer-border-width) solid var(--bs-modal-footer-border-color);border-bottom-right-radius:var(--bs-modal-inner-border-radius);border-bottom-left-radius:var(--bs-modal-inner-border-radius)}.modal-footer>*{margin:calc(var(--bs-modal-footer-gap)*.5)}@media(min-width: 576px){.modal{--bs-modal-margin: 1.75rem;--bs-modal-box-shadow: var(--bs-box-shadow)}.modal-dialog{max-width:var(--bs-modal-width);margin-right:auto;margin-left:auto}.modal-sm{--bs-modal-width: 300px}}@media(min-width: 992px){.modal-lg,.modal-xl{--bs-modal-width: 800px}}@media(min-width: 1200px){.modal-xl{--bs-modal-width: 1140px}}.modal-fullscreen{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen .modal-header,.modal-fullscreen .modal-footer{border-radius:0}.modal-fullscreen .modal-body{overflow-y:auto}@media(max-width: 575.98px){.modal-fullscreen-sm-down{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen-sm-down .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen-sm-down .modal-header,.modal-fullscreen-sm-down .modal-footer{border-radius:0}.modal-fullscreen-sm-down .modal-body{overflow-y:auto}}@media(max-width: 767.98px){.modal-fullscreen-md-down{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen-md-down .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen-md-down .modal-header,.modal-fullscreen-md-down .modal-footer{border-radius:0}.modal-fullscreen-md-down .modal-body{overflow-y:auto}}@media(max-width: 991.98px){.modal-fullscreen-lg-down{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen-lg-down .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen-lg-down .modal-header,.modal-fullscreen-lg-down .modal-footer{border-radius:0}.modal-fullscreen-lg-down .modal-body{overflow-y:auto}}@media(max-width: 1199.98px){.modal-fullscreen-xl-down{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen-xl-down .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen-xl-down .modal-header,.modal-fullscreen-xl-down .modal-footer{border-radius:0}.modal-fullscreen-xl-down .modal-body{overflow-y:auto}}@media(max-width: 1399.98px){.modal-fullscreen-xxl-down{width:100vw;max-width:none;height:100%;margin:0}.modal-fullscreen-xxl-down .modal-content{height:100%;border:0;border-radius:0}.modal-fullscreen-xxl-down .modal-header,.modal-fullscreen-xxl-down .modal-footer{border-radius:0}.modal-fullscreen-xxl-down .modal-body{overflow-y:auto}}.tooltip{--bs-tooltip-zindex: 1080;--bs-tooltip-max-width: 200px;--bs-tooltip-padding-x: 0.5rem;--bs-tooltip-padding-y: 0.25rem;--bs-tooltip-margin: ;--bs-tooltip-font-size:0.875rem;--bs-tooltip-color: var(--bs-body-bg);--bs-tooltip-bg: var(--bs-emphasis-color);--bs-tooltip-border-radius: var(--bs-border-radius);--bs-tooltip-opacity: 0.9;--bs-tooltip-arrow-width: 0.8rem;--bs-tooltip-arrow-height: 0.4rem;z-index:var(--bs-tooltip-zindex);display:block;margin:var(--bs-tooltip-margin);font-family:var(--bs-font-sans-serif);font-style:normal;font-weight:400;line-height:1.5;text-align:left;text-align:start;text-decoration:none;text-shadow:none;text-transform:none;letter-spacing:normal;word-break:normal;white-space:normal;word-spacing:normal;line-break:auto;font-size:var(--bs-tooltip-font-size);word-wrap:break-word;opacity:0}.tooltip.show{opacity:var(--bs-tooltip-opacity)}.tooltip .tooltip-arrow{display:block;width:var(--bs-tooltip-arrow-width);height:var(--bs-tooltip-arrow-height)}.tooltip .tooltip-arrow::before{position:absolute;content:"";border-color:rgba(0,0,0,0);border-style:solid}.bs-tooltip-top .tooltip-arrow,.bs-tooltip-auto[data-popper-placement^=top] .tooltip-arrow{bottom:calc(-1*var(--bs-tooltip-arrow-height))}.bs-tooltip-top .tooltip-arrow::before,.bs-tooltip-auto[data-popper-placement^=top] .tooltip-arrow::before{top:-1px;border-width:var(--bs-tooltip-arrow-height) calc(var(--bs-tooltip-arrow-width)*.5) 0;border-top-color:var(--bs-tooltip-bg)}.bs-tooltip-end .tooltip-arrow,.bs-tooltip-auto[data-popper-placement^=right] .tooltip-arrow{left:calc(-1*var(--bs-tooltip-arrow-height));width:var(--bs-tooltip-arrow-height);height:var(--bs-tooltip-arrow-width)}.bs-tooltip-end .tooltip-arrow::before,.bs-tooltip-auto[data-popper-placement^=right] .tooltip-arrow::before{right:-1px;border-width:calc(var(--bs-tooltip-arrow-width)*.5) var(--bs-tooltip-arrow-height) calc(var(--bs-tooltip-arrow-width)*.5) 0;border-right-color:var(--bs-tooltip-bg)}.bs-tooltip-bottom .tooltip-arrow,.bs-tooltip-auto[data-popper-placement^=bottom] .tooltip-arrow{top:calc(-1*var(--bs-tooltip-arrow-height))}.bs-tooltip-bottom .tooltip-arrow::before,.bs-tooltip-auto[data-popper-placement^=bottom] .tooltip-arrow::before{bottom:-1px;border-width:0 calc(var(--bs-tooltip-arrow-width)*.5) var(--bs-tooltip-arrow-height);border-bottom-color:var(--bs-tooltip-bg)}.bs-tooltip-start .tooltip-arrow,.bs-tooltip-auto[data-popper-placement^=left] .tooltip-arrow{right:calc(-1*var(--bs-tooltip-arrow-height));width:var(--bs-tooltip-arrow-height);height:var(--bs-tooltip-arrow-width)}.bs-tooltip-start .tooltip-arrow::before,.bs-tooltip-auto[data-popper-placement^=left] .tooltip-arrow::before{left:-1px;border-width:calc(var(--bs-tooltip-arrow-width)*.5) 0 calc(var(--bs-tooltip-arrow-width)*.5) var(--bs-tooltip-arrow-height);border-left-color:var(--bs-tooltip-bg)}.tooltip-inner{max-width:var(--bs-tooltip-max-width);padding:var(--bs-tooltip-padding-y) var(--bs-tooltip-padding-x);color:var(--bs-tooltip-color);text-align:center;background-color:var(--bs-tooltip-bg);border-radius:var(--bs-tooltip-border-radius)}.popover{--bs-popover-zindex: 1070;--bs-popover-max-width: 276px;--bs-popover-font-size:0.875rem;--bs-popover-bg: var(--bs-body-bg);--bs-popover-border-width: var(--bs-border-width);--bs-popover-border-color: var(--bs-border-color-translucent);--bs-popover-border-radius: var(--bs-border-radius-lg);--bs-popover-inner-border-radius: calc(var(--bs-border-radius-lg) - var(--bs-border-width));--bs-popover-box-shadow: var(--bs-box-shadow);--bs-popover-header-padding-x: 1rem;--bs-popover-header-padding-y: 0.5rem;--bs-popover-header-font-size:1rem;--bs-popover-header-color: inherit;--bs-popover-header-bg: var(--bs-secondary-bg);--bs-popover-body-padding-x: 1rem;--bs-popover-body-padding-y: 1rem;--bs-popover-body-color: var(--bs-body-color);--bs-popover-arrow-width: 1rem;--bs-popover-arrow-height: 0.5rem;--bs-popover-arrow-border: var(--bs-popover-border-color);z-index:var(--bs-popover-zindex);display:block;max-width:var(--bs-popover-max-width);font-family:var(--bs-font-sans-serif);font-style:normal;font-weight:400;line-height:1.5;text-align:left;text-align:start;text-decoration:none;text-shadow:none;text-transform:none;letter-spacing:normal;word-break:normal;white-space:normal;word-spacing:normal;line-break:auto;font-size:var(--bs-popover-font-size);word-wrap:break-word;background-color:var(--bs-popover-bg);background-clip:padding-box;border:var(--bs-popover-border-width) solid var(--bs-popover-border-color);border-radius:var(--bs-popover-border-radius)}.popover .popover-arrow{display:block;width:var(--bs-popover-arrow-width);height:var(--bs-popover-arrow-height)}.popover .popover-arrow::before,.popover .popover-arrow::after{position:absolute;display:block;content:"";border-color:rgba(0,0,0,0);border-style:solid;border-width:0}.bs-popover-top>.popover-arrow,.bs-popover-auto[data-popper-placement^=top]>.popover-arrow{bottom:calc(-1*(var(--bs-popover-arrow-height)) - var(--bs-popover-border-width))}.bs-popover-top>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=top]>.popover-arrow::before,.bs-popover-top>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=top]>.popover-arrow::after{border-width:var(--bs-popover-arrow-height) calc(var(--bs-popover-arrow-width)*.5) 0}.bs-popover-top>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=top]>.popover-arrow::before{bottom:0;border-top-color:var(--bs-popover-arrow-border)}.bs-popover-top>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=top]>.popover-arrow::after{bottom:var(--bs-popover-border-width);border-top-color:var(--bs-popover-bg)}.bs-popover-end>.popover-arrow,.bs-popover-auto[data-popper-placement^=right]>.popover-arrow{left:calc(-1*(var(--bs-popover-arrow-height)) - var(--bs-popover-border-width));width:var(--bs-popover-arrow-height);height:var(--bs-popover-arrow-width)}.bs-popover-end>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=right]>.popover-arrow::before,.bs-popover-end>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=right]>.popover-arrow::after{border-width:calc(var(--bs-popover-arrow-width)*.5) var(--bs-popover-arrow-height) calc(var(--bs-popover-arrow-width)*.5) 0}.bs-popover-end>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=right]>.popover-arrow::before{left:0;border-right-color:var(--bs-popover-arrow-border)}.bs-popover-end>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=right]>.popover-arrow::after{left:var(--bs-popover-border-width);border-right-color:var(--bs-popover-bg)}.bs-popover-bottom>.popover-arrow,.bs-popover-auto[data-popper-placement^=bottom]>.popover-arrow{top:calc(-1*(var(--bs-popover-arrow-height)) - var(--bs-popover-border-width))}.bs-popover-bottom>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=bottom]>.popover-arrow::before,.bs-popover-bottom>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=bottom]>.popover-arrow::after{border-width:0 calc(var(--bs-popover-arrow-width)*.5) var(--bs-popover-arrow-height)}.bs-popover-bottom>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=bottom]>.popover-arrow::before{top:0;border-bottom-color:var(--bs-popover-arrow-border)}.bs-popover-bottom>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=bottom]>.popover-arrow::after{top:var(--bs-popover-border-width);border-bottom-color:var(--bs-popover-bg)}.bs-popover-bottom .popover-header::before,.bs-popover-auto[data-popper-placement^=bottom] .popover-header::before{position:absolute;top:0;left:50%;display:block;width:var(--bs-popover-arrow-width);margin-left:calc(-0.5*var(--bs-popover-arrow-width));content:"";border-bottom:var(--bs-popover-border-width) solid var(--bs-popover-header-bg)}.bs-popover-start>.popover-arrow,.bs-popover-auto[data-popper-placement^=left]>.popover-arrow{right:calc(-1*(var(--bs-popover-arrow-height)) - var(--bs-popover-border-width));width:var(--bs-popover-arrow-height);height:var(--bs-popover-arrow-width)}.bs-popover-start>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=left]>.popover-arrow::before,.bs-popover-start>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=left]>.popover-arrow::after{border-width:calc(var(--bs-popover-arrow-width)*.5) 0 calc(var(--bs-popover-arrow-width)*.5) var(--bs-popover-arrow-height)}.bs-popover-start>.popover-arrow::before,.bs-popover-auto[data-popper-placement^=left]>.popover-arrow::before{right:0;border-left-color:var(--bs-popover-arrow-border)}.bs-popover-start>.popover-arrow::after,.bs-popover-auto[data-popper-placement^=left]>.popover-arrow::after{right:var(--bs-popover-border-width);border-left-color:var(--bs-popover-bg)}.popover-header{padding:var(--bs-popover-header-padding-y) var(--bs-popover-header-padding-x);margin-bottom:0;font-size:var(--bs-popover-header-font-size);color:var(--bs-popover-header-color);background-color:var(--bs-popover-header-bg);border-bottom:var(--bs-popover-border-width) solid var(--bs-popover-border-color);border-top-left-radius:var(--bs-popover-inner-border-radius);border-top-right-radius:var(--bs-popover-inner-border-radius)}.popover-header:empty{display:none}.popover-body{padding:var(--bs-popover-body-padding-y) var(--bs-popover-body-padding-x);color:var(--bs-popover-body-color)}.carousel{position:relative}.carousel.pointer-event{touch-action:pan-y}.carousel-inner{position:relative;width:100%;overflow:hidden}.carousel-inner::after{display:block;clear:both;content:""}.carousel-item{position:relative;display:none;float:left;width:100%;margin-right:-100%;backface-visibility:hidden;transition:transform .6s ease-in-out}@media(prefers-reduced-motion: reduce){.carousel-item{transition:none}}.carousel-item.active,.carousel-item-next,.carousel-item-prev{display:block}.carousel-item-next:not(.carousel-item-start),.active.carousel-item-end{transform:translateX(100%)}.carousel-item-prev:not(.carousel-item-end),.active.carousel-item-start{transform:translateX(-100%)}.carousel-fade .carousel-item{opacity:0;transition-property:opacity;transform:none}.carousel-fade .carousel-item.active,.carousel-fade .carousel-item-next.carousel-item-start,.carousel-fade .carousel-item-prev.carousel-item-end{z-index:1;opacity:1}.carousel-fade .active.carousel-item-start,.carousel-fade .active.carousel-item-end{z-index:0;opacity:0;transition:opacity 0s .6s}@media(prefers-reduced-motion: reduce){.carousel-fade .active.carousel-item-start,.carousel-fade .active.carousel-item-end{transition:none}}.carousel-control-prev,.carousel-control-next{position:absolute;top:0;bottom:0;z-index:1;display:flex;align-items:center;justify-content:center;width:15%;padding:0;color:#fff;text-align:center;background:none;border:0;opacity:.5;transition:opacity .15s ease}@media(prefers-reduced-motion: reduce){.carousel-control-prev,.carousel-control-next{transition:none}}.carousel-control-prev:hover,.carousel-control-prev:focus,.carousel-control-next:hover,.carousel-control-next:focus{color:#fff;text-decoration:none;outline:0;opacity:.9}.carousel-control-prev{left:0}.carousel-control-next{right:0}.carousel-control-prev-icon,.carousel-control-next-icon{display:inline-block;width:2rem;height:2rem;background-repeat:no-repeat;background-position:50%;background-size:100% 100%}.carousel-control-prev-icon{background-image:url(${___CSS_LOADER_URL_REPLACEMENT_17___})}.carousel-control-next-icon{background-image:url(${___CSS_LOADER_URL_REPLACEMENT_18___})}.carousel-indicators{position:absolute;right:0;bottom:0;left:0;z-index:2;display:flex;justify-content:center;padding:0;margin-right:15%;margin-bottom:1rem;margin-left:15%}.carousel-indicators [data-bs-target]{box-sizing:content-box;flex:0 1 auto;width:30px;height:3px;padding:0;margin-right:3px;margin-left:3px;text-indent:-999px;cursor:pointer;background-color:#fff;background-clip:padding-box;border:0;border-top:10px solid rgba(0,0,0,0);border-bottom:10px solid rgba(0,0,0,0);opacity:.5;transition:opacity .6s ease}@media(prefers-reduced-motion: reduce){.carousel-indicators [data-bs-target]{transition:none}}.carousel-indicators .active{opacity:1}.carousel-caption{position:absolute;right:15%;bottom:1.25rem;left:15%;padding-top:1.25rem;padding-bottom:1.25rem;color:#fff;text-align:center}.carousel-dark .carousel-control-prev-icon,.carousel-dark .carousel-control-next-icon{filter:invert(1) grayscale(100)}.carousel-dark .carousel-indicators [data-bs-target]{background-color:#000}.carousel-dark .carousel-caption{color:#000}[data-bs-theme=dark] .carousel .carousel-control-prev-icon,[data-bs-theme=dark] .carousel .carousel-control-next-icon,[data-bs-theme=dark].carousel .carousel-control-prev-icon,[data-bs-theme=dark].carousel .carousel-control-next-icon{filter:invert(1) grayscale(100)}[data-bs-theme=dark] .carousel .carousel-indicators [data-bs-target],[data-bs-theme=dark].carousel .carousel-indicators [data-bs-target]{background-color:#000}[data-bs-theme=dark] .carousel .carousel-caption,[data-bs-theme=dark].carousel .carousel-caption{color:#000}.spinner-grow,.spinner-border{display:inline-block;width:var(--bs-spinner-width);height:var(--bs-spinner-height);vertical-align:var(--bs-spinner-vertical-align);border-radius:50%;animation:var(--bs-spinner-animation-speed) linear infinite var(--bs-spinner-animation-name)}@keyframes spinner-border{to{transform:rotate(360deg) /* rtl:ignore */}}.spinner-border{--bs-spinner-width: 2rem;--bs-spinner-height: 2rem;--bs-spinner-vertical-align: -0.125em;--bs-spinner-border-width: 0.25em;--bs-spinner-animation-speed: 0.75s;--bs-spinner-animation-name: spinner-border;border:var(--bs-spinner-border-width) solid currentcolor;border-right-color:rgba(0,0,0,0)}.spinner-border-sm{--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;--bs-spinner-border-width: 0.2em}@keyframes spinner-grow{0%{transform:scale(0)}50%{opacity:1;transform:none}}.spinner-grow{--bs-spinner-width: 2rem;--bs-spinner-height: 2rem;--bs-spinner-vertical-align: -0.125em;--bs-spinner-animation-speed: 0.75s;--bs-spinner-animation-name: spinner-grow;background-color:currentcolor;opacity:0}.spinner-grow-sm{--bs-spinner-width: 1rem;--bs-spinner-height: 1rem}@media(prefers-reduced-motion: reduce){.spinner-border,.spinner-grow{--bs-spinner-animation-speed: 1.5s}}.offcanvas,.offcanvas-xxl,.offcanvas-xl,.offcanvas-lg,.offcanvas-md,.offcanvas-sm{--bs-offcanvas-zindex: 1045;--bs-offcanvas-width: 400px;--bs-offcanvas-height: 30vh;--bs-offcanvas-padding-x: 1rem;--bs-offcanvas-padding-y: 1rem;--bs-offcanvas-color: var(--bs-body-color);--bs-offcanvas-bg: var(--bs-body-bg);--bs-offcanvas-border-width: var(--bs-border-width);--bs-offcanvas-border-color: var(--bs-border-color-translucent);--bs-offcanvas-box-shadow: var(--bs-box-shadow-sm);--bs-offcanvas-transition: transform 0.3s ease-in-out;--bs-offcanvas-title-line-height: 1.5}@media(max-width: 575.98px){.offcanvas-sm{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}}@media(max-width: 575.98px)and (prefers-reduced-motion: reduce){.offcanvas-sm{transition:none}}@media(max-width: 575.98px){.offcanvas-sm.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas-sm.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas-sm.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas-sm.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas-sm.showing,.offcanvas-sm.show:not(.hiding){transform:none}.offcanvas-sm.showing,.offcanvas-sm.hiding,.offcanvas-sm.show{visibility:visible}}@media(min-width: 576px){.offcanvas-sm{--bs-offcanvas-height: auto;--bs-offcanvas-border-width: 0;background-color:rgba(0,0,0,0) !important}.offcanvas-sm .offcanvas-header{display:none}.offcanvas-sm .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible;background-color:rgba(0,0,0,0) !important}}@media(max-width: 767.98px){.offcanvas-md{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}}@media(max-width: 767.98px)and (prefers-reduced-motion: reduce){.offcanvas-md{transition:none}}@media(max-width: 767.98px){.offcanvas-md.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas-md.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas-md.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas-md.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas-md.showing,.offcanvas-md.show:not(.hiding){transform:none}.offcanvas-md.showing,.offcanvas-md.hiding,.offcanvas-md.show{visibility:visible}}@media(min-width: 768px){.offcanvas-md{--bs-offcanvas-height: auto;--bs-offcanvas-border-width: 0;background-color:rgba(0,0,0,0) !important}.offcanvas-md .offcanvas-header{display:none}.offcanvas-md .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible;background-color:rgba(0,0,0,0) !important}}@media(max-width: 991.98px){.offcanvas-lg{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}}@media(max-width: 991.98px)and (prefers-reduced-motion: reduce){.offcanvas-lg{transition:none}}@media(max-width: 991.98px){.offcanvas-lg.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas-lg.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas-lg.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas-lg.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas-lg.showing,.offcanvas-lg.show:not(.hiding){transform:none}.offcanvas-lg.showing,.offcanvas-lg.hiding,.offcanvas-lg.show{visibility:visible}}@media(min-width: 992px){.offcanvas-lg{--bs-offcanvas-height: auto;--bs-offcanvas-border-width: 0;background-color:rgba(0,0,0,0) !important}.offcanvas-lg .offcanvas-header{display:none}.offcanvas-lg .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible;background-color:rgba(0,0,0,0) !important}}@media(max-width: 1199.98px){.offcanvas-xl{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}}@media(max-width: 1199.98px)and (prefers-reduced-motion: reduce){.offcanvas-xl{transition:none}}@media(max-width: 1199.98px){.offcanvas-xl.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas-xl.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas-xl.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas-xl.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas-xl.showing,.offcanvas-xl.show:not(.hiding){transform:none}.offcanvas-xl.showing,.offcanvas-xl.hiding,.offcanvas-xl.show{visibility:visible}}@media(min-width: 1200px){.offcanvas-xl{--bs-offcanvas-height: auto;--bs-offcanvas-border-width: 0;background-color:rgba(0,0,0,0) !important}.offcanvas-xl .offcanvas-header{display:none}.offcanvas-xl .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible;background-color:rgba(0,0,0,0) !important}}@media(max-width: 1399.98px){.offcanvas-xxl{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}}@media(max-width: 1399.98px)and (prefers-reduced-motion: reduce){.offcanvas-xxl{transition:none}}@media(max-width: 1399.98px){.offcanvas-xxl.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas-xxl.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas-xxl.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas-xxl.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas-xxl.showing,.offcanvas-xxl.show:not(.hiding){transform:none}.offcanvas-xxl.showing,.offcanvas-xxl.hiding,.offcanvas-xxl.show{visibility:visible}}@media(min-width: 1400px){.offcanvas-xxl{--bs-offcanvas-height: auto;--bs-offcanvas-border-width: 0;background-color:rgba(0,0,0,0) !important}.offcanvas-xxl .offcanvas-header{display:none}.offcanvas-xxl .offcanvas-body{display:flex;flex-grow:0;padding:0;overflow-y:visible;background-color:rgba(0,0,0,0) !important}}.offcanvas{position:fixed;bottom:0;z-index:var(--bs-offcanvas-zindex);display:flex;flex-direction:column;max-width:100%;color:var(--bs-offcanvas-color);visibility:hidden;background-color:var(--bs-offcanvas-bg);background-clip:padding-box;outline:0;transition:var(--bs-offcanvas-transition)}@media(prefers-reduced-motion: reduce){.offcanvas{transition:none}}.offcanvas.offcanvas-start{top:0;left:0;width:var(--bs-offcanvas-width);border-right:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(-100%)}.offcanvas.offcanvas-end{top:0;right:0;width:var(--bs-offcanvas-width);border-left:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateX(100%)}.offcanvas.offcanvas-top{top:0;right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-bottom:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(-100%)}.offcanvas.offcanvas-bottom{right:0;left:0;height:var(--bs-offcanvas-height);max-height:100%;border-top:var(--bs-offcanvas-border-width) solid var(--bs-offcanvas-border-color);transform:translateY(100%)}.offcanvas.showing,.offcanvas.show:not(.hiding){transform:none}.offcanvas.showing,.offcanvas.hiding,.offcanvas.show{visibility:visible}.offcanvas-backdrop{position:fixed;top:0;left:0;z-index:1040;width:100vw;height:100vh;background-color:#000}.offcanvas-backdrop.fade{opacity:0}.offcanvas-backdrop.show{opacity:.5}.offcanvas-header{display:flex;align-items:center;justify-content:space-between;padding:var(--bs-offcanvas-padding-y) var(--bs-offcanvas-padding-x)}.offcanvas-header .btn-close{padding:calc(var(--bs-offcanvas-padding-y)*.5) calc(var(--bs-offcanvas-padding-x)*.5);margin-top:calc(-0.5*var(--bs-offcanvas-padding-y));margin-right:calc(-0.5*var(--bs-offcanvas-padding-x));margin-bottom:calc(-0.5*var(--bs-offcanvas-padding-y))}.offcanvas-title{margin-bottom:0;line-height:var(--bs-offcanvas-title-line-height)}.offcanvas-body{flex-grow:1;padding:var(--bs-offcanvas-padding-y) var(--bs-offcanvas-padding-x);overflow-y:auto}.placeholder{display:inline-block;min-height:1em;vertical-align:middle;cursor:wait;background-color:currentcolor;opacity:.5}.placeholder.btn::before{display:inline-block;content:""}.placeholder-xs{min-height:.6em}.placeholder-sm{min-height:.8em}.placeholder-lg{min-height:1.2em}.placeholder-glow .placeholder{animation:placeholder-glow 2s ease-in-out infinite}@keyframes placeholder-glow{50%{opacity:.2}}.placeholder-wave{mask-image:linear-gradient(130deg, #000 55%, rgba(0, 0, 0, 0.8) 75%, #000 95%);mask-size:200% 100%;animation:placeholder-wave 2s linear infinite}@keyframes placeholder-wave{100%{mask-position:-200% 0%}}.clearfix::after{display:block;clear:both;content:""}.text-bg-primary{color:#fff !important;background-color:RGBA(var(--bs-primary-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-secondary{color:#fff !important;background-color:RGBA(var(--bs-secondary-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-success{color:#fff !important;background-color:RGBA(var(--bs-success-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-info{color:#000 !important;background-color:RGBA(var(--bs-info-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-warning{color:#000 !important;background-color:RGBA(var(--bs-warning-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-danger{color:#fff !important;background-color:RGBA(var(--bs-danger-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-light{color:#000 !important;background-color:RGBA(var(--bs-light-rgb), var(--bs-bg-opacity, 1)) !important}.text-bg-dark{color:#fff !important;background-color:RGBA(var(--bs-dark-rgb), var(--bs-bg-opacity, 1)) !important}.link-primary{color:RGBA(var(--bs-primary-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-primary-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-primary:hover,.link-primary:focus{color:RGBA(10, 88, 202, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(10, 88, 202, var(--bs-link-underline-opacity, 1)) !important}.link-secondary{color:RGBA(var(--bs-secondary-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-secondary-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-secondary:hover,.link-secondary:focus{color:RGBA(86, 94, 100, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(86, 94, 100, var(--bs-link-underline-opacity, 1)) !important}.link-success{color:RGBA(var(--bs-success-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-success-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-success:hover,.link-success:focus{color:RGBA(20, 108, 67, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(20, 108, 67, var(--bs-link-underline-opacity, 1)) !important}.link-info{color:RGBA(var(--bs-info-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-info-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-info:hover,.link-info:focus{color:RGBA(61, 213, 243, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(61, 213, 243, var(--bs-link-underline-opacity, 1)) !important}.link-warning{color:RGBA(var(--bs-warning-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-warning-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-warning:hover,.link-warning:focus{color:RGBA(255, 205, 57, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(255, 205, 57, var(--bs-link-underline-opacity, 1)) !important}.link-danger{color:RGBA(var(--bs-danger-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-danger-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-danger:hover,.link-danger:focus{color:RGBA(176, 42, 55, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(176, 42, 55, var(--bs-link-underline-opacity, 1)) !important}.link-light{color:RGBA(var(--bs-light-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-light-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-light:hover,.link-light:focus{color:RGBA(249, 250, 251, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(249, 250, 251, var(--bs-link-underline-opacity, 1)) !important}.link-dark{color:RGBA(var(--bs-dark-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-dark-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-dark:hover,.link-dark:focus{color:RGBA(26, 30, 33, var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(26, 30, 33, var(--bs-link-underline-opacity, 1)) !important}.link-body-emphasis{color:RGBA(var(--bs-emphasis-color-rgb), var(--bs-link-opacity, 1)) !important;text-decoration-color:RGBA(var(--bs-emphasis-color-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-body-emphasis:hover,.link-body-emphasis:focus{color:RGBA(var(--bs-emphasis-color-rgb), var(--bs-link-opacity, 0.75)) !important;text-decoration-color:RGBA(var(--bs-emphasis-color-rgb), var(--bs-link-underline-opacity, 0.75)) !important}.focus-ring:focus{outline:0;box-shadow:var(--bs-focus-ring-x, 0) var(--bs-focus-ring-y, 0) var(--bs-focus-ring-blur, 0) var(--bs-focus-ring-width) var(--bs-focus-ring-color)}.icon-link{display:inline-flex;gap:.375rem;align-items:center;text-decoration-color:rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 0.5));text-underline-offset:.25em;backface-visibility:hidden}.icon-link>.bi{flex-shrink:0;width:1em;height:1em;fill:currentcolor;transition:.2s ease-in-out transform}@media(prefers-reduced-motion: reduce){.icon-link>.bi{transition:none}}.icon-link-hover:hover>.bi,.icon-link-hover:focus-visible>.bi{transform:var(--bs-icon-link-transform, translate3d(0.25em, 0, 0))}.ratio{position:relative;width:100%}.ratio::before{display:block;padding-top:var(--bs-aspect-ratio);content:""}.ratio>*{position:absolute;top:0;left:0;width:100%;height:100%}.ratio-1x1{--bs-aspect-ratio: 100%}.ratio-4x3{--bs-aspect-ratio: 75%}.ratio-16x9{--bs-aspect-ratio: 56.25%}.ratio-21x9{--bs-aspect-ratio: 42.8571428571%}.fixed-top{position:fixed;top:0;right:0;left:0;z-index:1030}.fixed-bottom{position:fixed;right:0;bottom:0;left:0;z-index:1030}.sticky-top{position:sticky;top:0;z-index:1020}.sticky-bottom{position:sticky;bottom:0;z-index:1020}@media(min-width: 576px){.sticky-sm-top{position:sticky;top:0;z-index:1020}.sticky-sm-bottom{position:sticky;bottom:0;z-index:1020}}@media(min-width: 768px){.sticky-md-top{position:sticky;top:0;z-index:1020}.sticky-md-bottom{position:sticky;bottom:0;z-index:1020}}@media(min-width: 992px){.sticky-lg-top{position:sticky;top:0;z-index:1020}.sticky-lg-bottom{position:sticky;bottom:0;z-index:1020}}@media(min-width: 1200px){.sticky-xl-top{position:sticky;top:0;z-index:1020}.sticky-xl-bottom{position:sticky;bottom:0;z-index:1020}}@media(min-width: 1400px){.sticky-xxl-top{position:sticky;top:0;z-index:1020}.sticky-xxl-bottom{position:sticky;bottom:0;z-index:1020}}.hstack{display:flex;flex-direction:row;align-items:center;align-self:stretch}.vstack{display:flex;flex:1 1 auto;flex-direction:column;align-self:stretch}.visually-hidden,.visually-hidden-focusable:not(:focus):not(:focus-within){width:1px !important;height:1px !important;padding:0 !important;margin:-1px !important;overflow:hidden !important;clip:rect(0, 0, 0, 0) !important;white-space:nowrap !important;border:0 !important}.visually-hidden:not(caption),.visually-hidden-focusable:not(:focus):not(:focus-within):not(caption){position:absolute !important}.stretched-link::after{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;content:""}.text-truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vr{display:inline-block;align-self:stretch;width:var(--bs-border-width);min-height:1em;background-color:currentcolor;opacity:.25}.align-baseline{vertical-align:baseline !important}.align-top{vertical-align:top !important}.align-middle{vertical-align:middle !important}.align-bottom{vertical-align:bottom !important}.align-text-bottom{vertical-align:text-bottom !important}.align-text-top{vertical-align:text-top !important}.float-start{float:left !important}.float-end{float:right !important}.float-none{float:none !important}.object-fit-contain{object-fit:contain !important}.object-fit-cover{object-fit:cover !important}.object-fit-fill{object-fit:fill !important}.object-fit-scale{object-fit:scale-down !important}.object-fit-none{object-fit:none !important}.opacity-0{opacity:0 !important}.opacity-25{opacity:.25 !important}.opacity-50{opacity:.5 !important}.opacity-75{opacity:.75 !important}.opacity-100{opacity:1 !important}.overflow-auto{overflow:auto !important}.overflow-hidden{overflow:hidden !important}.overflow-visible{overflow:visible !important}.overflow-scroll{overflow:scroll !important}.overflow-x-auto{overflow-x:auto !important}.overflow-x-hidden{overflow-x:hidden !important}.overflow-x-visible{overflow-x:visible !important}.overflow-x-scroll{overflow-x:scroll !important}.overflow-y-auto{overflow-y:auto !important}.overflow-y-hidden{overflow-y:hidden !important}.overflow-y-visible{overflow-y:visible !important}.overflow-y-scroll{overflow-y:scroll !important}.d-inline{display:inline !important}.d-inline-block{display:inline-block !important}.d-block{display:block !important}.d-grid{display:grid !important}.d-inline-grid{display:inline-grid !important}.d-table{display:table !important}.d-table-row{display:table-row !important}.d-table-cell{display:table-cell !important}.d-flex{display:flex !important}.d-inline-flex{display:inline-flex !important}.d-none{display:none !important}.shadow{box-shadow:var(--bs-box-shadow) !important}.shadow-sm{box-shadow:var(--bs-box-shadow-sm) !important}.shadow-lg{box-shadow:var(--bs-box-shadow-lg) !important}.shadow-none{box-shadow:none !important}.focus-ring-primary{--bs-focus-ring-color: rgba(var(--bs-primary-rgb), var(--bs-focus-ring-opacity))}.focus-ring-secondary{--bs-focus-ring-color: rgba(var(--bs-secondary-rgb), var(--bs-focus-ring-opacity))}.focus-ring-success{--bs-focus-ring-color: rgba(var(--bs-success-rgb), var(--bs-focus-ring-opacity))}.focus-ring-info{--bs-focus-ring-color: rgba(var(--bs-info-rgb), var(--bs-focus-ring-opacity))}.focus-ring-warning{--bs-focus-ring-color: rgba(var(--bs-warning-rgb), var(--bs-focus-ring-opacity))}.focus-ring-danger{--bs-focus-ring-color: rgba(var(--bs-danger-rgb), var(--bs-focus-ring-opacity))}.focus-ring-light{--bs-focus-ring-color: rgba(var(--bs-light-rgb), var(--bs-focus-ring-opacity))}.focus-ring-dark{--bs-focus-ring-color: rgba(var(--bs-dark-rgb), var(--bs-focus-ring-opacity))}.position-static{position:static !important}.position-relative{position:relative !important}.position-absolute{position:absolute !important}.position-fixed{position:fixed !important}.position-sticky{position:sticky !important}.top-0{top:0 !important}.top-50{top:50% !important}.top-100{top:100% !important}.bottom-0{bottom:0 !important}.bottom-50{bottom:50% !important}.bottom-100{bottom:100% !important}.start-0{left:0 !important}.start-50{left:50% !important}.start-100{left:100% !important}.end-0{right:0 !important}.end-50{right:50% !important}.end-100{right:100% !important}.translate-middle{transform:translate(-50%, -50%) !important}.translate-middle-x{transform:translateX(-50%) !important}.translate-middle-y{transform:translateY(-50%) !important}.border{border:var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important}.border-0{border:0 !important}.border-top{border-top:var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important}.border-top-0{border-top:0 !important}.border-end{border-right:var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important}.border-end-0{border-right:0 !important}.border-bottom{border-bottom:var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important}.border-bottom-0{border-bottom:0 !important}.border-start{border-left:var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important}.border-start-0{border-left:0 !important}.border-primary{--bs-border-opacity: 1;border-color:rgba(var(--bs-primary-rgb), var(--bs-border-opacity)) !important}.border-secondary{--bs-border-opacity: 1;border-color:rgba(var(--bs-secondary-rgb), var(--bs-border-opacity)) !important}.border-success{--bs-border-opacity: 1;border-color:rgba(var(--bs-success-rgb), var(--bs-border-opacity)) !important}.border-info{--bs-border-opacity: 1;border-color:rgba(var(--bs-info-rgb), var(--bs-border-opacity)) !important}.border-warning{--bs-border-opacity: 1;border-color:rgba(var(--bs-warning-rgb), var(--bs-border-opacity)) !important}.border-danger{--bs-border-opacity: 1;border-color:rgba(var(--bs-danger-rgb), var(--bs-border-opacity)) !important}.border-light{--bs-border-opacity: 1;border-color:rgba(var(--bs-light-rgb), var(--bs-border-opacity)) !important}.border-dark{--bs-border-opacity: 1;border-color:rgba(var(--bs-dark-rgb), var(--bs-border-opacity)) !important}.border-black{--bs-border-opacity: 1;border-color:rgba(var(--bs-black-rgb), var(--bs-border-opacity)) !important}.border-white{--bs-border-opacity: 1;border-color:rgba(var(--bs-white-rgb), var(--bs-border-opacity)) !important}.border-primary-subtle{border-color:var(--bs-primary-border-subtle) !important}.border-secondary-subtle{border-color:var(--bs-secondary-border-subtle) !important}.border-success-subtle{border-color:var(--bs-success-border-subtle) !important}.border-info-subtle{border-color:var(--bs-info-border-subtle) !important}.border-warning-subtle{border-color:var(--bs-warning-border-subtle) !important}.border-danger-subtle{border-color:var(--bs-danger-border-subtle) !important}.border-light-subtle{border-color:var(--bs-light-border-subtle) !important}.border-dark-subtle{border-color:var(--bs-dark-border-subtle) !important}.border-1{border-width:1px !important}.border-2{border-width:2px !important}.border-3{border-width:3px !important}.border-4{border-width:4px !important}.border-5{border-width:5px !important}.border-opacity-10{--bs-border-opacity: 0.1}.border-opacity-25{--bs-border-opacity: 0.25}.border-opacity-50{--bs-border-opacity: 0.5}.border-opacity-75{--bs-border-opacity: 0.75}.border-opacity-100{--bs-border-opacity: 1}.w-25{width:25% !important}.w-50{width:50% !important}.w-75{width:75% !important}.w-100{width:100% !important}.w-auto{width:auto !important}.mw-100{max-width:100% !important}.vw-100{width:100vw !important}.min-vw-100{min-width:100vw !important}.h-25{height:25% !important}.h-50{height:50% !important}.h-75{height:75% !important}.h-100{height:100% !important}.h-auto{height:auto !important}.mh-100{max-height:100% !important}.vh-100{height:100vh !important}.min-vh-100{min-height:100vh !important}.flex-fill{flex:1 1 auto !important}.flex-row{flex-direction:row !important}.flex-column{flex-direction:column !important}.flex-row-reverse{flex-direction:row-reverse !important}.flex-column-reverse{flex-direction:column-reverse !important}.flex-grow-0{flex-grow:0 !important}.flex-grow-1{flex-grow:1 !important}.flex-shrink-0{flex-shrink:0 !important}.flex-shrink-1{flex-shrink:1 !important}.flex-wrap{flex-wrap:wrap !important}.flex-nowrap{flex-wrap:nowrap !important}.flex-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-start{justify-content:flex-start !important}.justify-content-end{justify-content:flex-end !important}.justify-content-center{justify-content:center !important}.justify-content-between{justify-content:space-between !important}.justify-content-around{justify-content:space-around !important}.justify-content-evenly{justify-content:space-evenly !important}.align-items-start{align-items:flex-start !important}.align-items-end{align-items:flex-end !important}.align-items-center{align-items:center !important}.align-items-baseline{align-items:baseline !important}.align-items-stretch{align-items:stretch !important}.align-content-start{align-content:flex-start !important}.align-content-end{align-content:flex-end !important}.align-content-center{align-content:center !important}.align-content-between{align-content:space-between !important}.align-content-around{align-content:space-around !important}.align-content-stretch{align-content:stretch !important}.align-self-auto{align-self:auto !important}.align-self-start{align-self:flex-start !important}.align-self-end{align-self:flex-end !important}.align-self-center{align-self:center !important}.align-self-baseline{align-self:baseline !important}.align-self-stretch{align-self:stretch !important}.order-first{order:-1 !important}.order-0{order:0 !important}.order-1{order:1 !important}.order-2{order:2 !important}.order-3{order:3 !important}.order-4{order:4 !important}.order-5{order:5 !important}.order-last{order:6 !important}.m-0{margin:0 !important}.m-1{margin:.25rem !important}.m-2{margin:.5rem !important}.m-3{margin:1rem !important}.m-4{margin:1.5rem !important}.m-5{margin:3rem !important}.m-auto{margin:auto !important}.mx-0{margin-right:0 !important;margin-left:0 !important}.mx-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-3{margin-right:1rem !important;margin-left:1rem !important}.mx-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-5{margin-right:3rem !important;margin-left:3rem !important}.mx-auto{margin-right:auto !important;margin-left:auto !important}.my-0{margin-top:0 !important;margin-bottom:0 !important}.my-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-0{margin-top:0 !important}.mt-1{margin-top:.25rem !important}.mt-2{margin-top:.5rem !important}.mt-3{margin-top:1rem !important}.mt-4{margin-top:1.5rem !important}.mt-5{margin-top:3rem !important}.mt-auto{margin-top:auto !important}.me-0{margin-right:0 !important}.me-1{margin-right:.25rem !important}.me-2{margin-right:.5rem !important}.me-3{margin-right:1rem !important}.me-4{margin-right:1.5rem !important}.me-5{margin-right:3rem !important}.me-auto{margin-right:auto !important}.mb-0{margin-bottom:0 !important}.mb-1{margin-bottom:.25rem !important}.mb-2{margin-bottom:.5rem !important}.mb-3{margin-bottom:1rem !important}.mb-4{margin-bottom:1.5rem !important}.mb-5{margin-bottom:3rem !important}.mb-auto{margin-bottom:auto !important}.ms-0{margin-left:0 !important}.ms-1{margin-left:.25rem !important}.ms-2{margin-left:.5rem !important}.ms-3{margin-left:1rem !important}.ms-4{margin-left:1.5rem !important}.ms-5{margin-left:3rem !important}.ms-auto{margin-left:auto !important}.p-0{padding:0 !important}.p-1{padding:.25rem !important}.p-2{padding:.5rem !important}.p-3{padding:1rem !important}.p-4{padding:1.5rem !important}.p-5{padding:3rem !important}.px-0{padding-right:0 !important;padding-left:0 !important}.px-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-3{padding-right:1rem !important;padding-left:1rem !important}.px-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-5{padding-right:3rem !important;padding-left:3rem !important}.py-0{padding-top:0 !important;padding-bottom:0 !important}.py-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-0{padding-top:0 !important}.pt-1{padding-top:.25rem !important}.pt-2{padding-top:.5rem !important}.pt-3{padding-top:1rem !important}.pt-4{padding-top:1.5rem !important}.pt-5{padding-top:3rem !important}.pe-0{padding-right:0 !important}.pe-1{padding-right:.25rem !important}.pe-2{padding-right:.5rem !important}.pe-3{padding-right:1rem !important}.pe-4{padding-right:1.5rem !important}.pe-5{padding-right:3rem !important}.pb-0{padding-bottom:0 !important}.pb-1{padding-bottom:.25rem !important}.pb-2{padding-bottom:.5rem !important}.pb-3{padding-bottom:1rem !important}.pb-4{padding-bottom:1.5rem !important}.pb-5{padding-bottom:3rem !important}.ps-0{padding-left:0 !important}.ps-1{padding-left:.25rem !important}.ps-2{padding-left:.5rem !important}.ps-3{padding-left:1rem !important}.ps-4{padding-left:1.5rem !important}.ps-5{padding-left:3rem !important}.gap-0{gap:0 !important}.gap-1{gap:.25rem !important}.gap-2{gap:.5rem !important}.gap-3{gap:1rem !important}.gap-4{gap:1.5rem !important}.gap-5{gap:3rem !important}.row-gap-0{row-gap:0 !important}.row-gap-1{row-gap:.25rem !important}.row-gap-2{row-gap:.5rem !important}.row-gap-3{row-gap:1rem !important}.row-gap-4{row-gap:1.5rem !important}.row-gap-5{row-gap:3rem !important}.column-gap-0{column-gap:0 !important}.column-gap-1{column-gap:.25rem !important}.column-gap-2{column-gap:.5rem !important}.column-gap-3{column-gap:1rem !important}.column-gap-4{column-gap:1.5rem !important}.column-gap-5{column-gap:3rem !important}.font-monospace{font-family:var(--bs-font-monospace) !important}.fs-1{font-size:calc(1.375rem + 1.5vw) !important}.fs-2{font-size:calc(1.325rem + 0.9vw) !important}.fs-3{font-size:calc(1.3rem + 0.6vw) !important}.fs-4{font-size:calc(1.275rem + 0.3vw) !important}.fs-5{font-size:1.25rem !important}.fs-6{font-size:1rem !important}.fst-italic{font-style:italic !important}.fst-normal{font-style:normal !important}.fw-lighter{font-weight:lighter !important}.fw-light{font-weight:300 !important}.fw-normal{font-weight:400 !important}.fw-medium{font-weight:500 !important}.fw-semibold{font-weight:600 !important}.fw-bold{font-weight:700 !important}.fw-bolder{font-weight:bolder !important}.lh-1{line-height:1 !important}.lh-sm{line-height:1.25 !important}.lh-base{line-height:1.5 !important}.lh-lg{line-height:2 !important}.text-start{text-align:left !important}.text-end{text-align:right !important}.text-center{text-align:center !important}.text-decoration-none{text-decoration:none !important}.text-decoration-underline{text-decoration:underline !important}.text-decoration-line-through{text-decoration:line-through !important}.text-lowercase{text-transform:lowercase !important}.text-uppercase{text-transform:uppercase !important}.text-capitalize{text-transform:capitalize !important}.text-wrap{white-space:normal !important}.text-nowrap{white-space:nowrap !important}.text-break{word-wrap:break-word !important;word-break:break-word !important}.text-primary{--bs-text-opacity: 1;color:rgba(var(--bs-primary-rgb), var(--bs-text-opacity)) !important}.text-secondary{--bs-text-opacity: 1;color:rgba(var(--bs-secondary-rgb), var(--bs-text-opacity)) !important}.text-success{--bs-text-opacity: 1;color:rgba(var(--bs-success-rgb), var(--bs-text-opacity)) !important}.text-info{--bs-text-opacity: 1;color:rgba(var(--bs-info-rgb), var(--bs-text-opacity)) !important}.text-warning{--bs-text-opacity: 1;color:rgba(var(--bs-warning-rgb), var(--bs-text-opacity)) !important}.text-danger{--bs-text-opacity: 1;color:rgba(var(--bs-danger-rgb), var(--bs-text-opacity)) !important}.text-light{--bs-text-opacity: 1;color:rgba(var(--bs-light-rgb), var(--bs-text-opacity)) !important}.text-dark{--bs-text-opacity: 1;color:rgba(var(--bs-dark-rgb), var(--bs-text-opacity)) !important}.text-black{--bs-text-opacity: 1;color:rgba(var(--bs-black-rgb), var(--bs-text-opacity)) !important}.text-white{--bs-text-opacity: 1;color:rgba(var(--bs-white-rgb), var(--bs-text-opacity)) !important}.text-body{--bs-text-opacity: 1;color:rgba(var(--bs-body-color-rgb), var(--bs-text-opacity)) !important}.text-muted{--bs-text-opacity: 1;color:var(--bs-secondary-color) !important}.text-black-50{--bs-text-opacity: 1;color:rgba(0,0,0,.5) !important}.text-white-50{--bs-text-opacity: 1;color:rgba(255,255,255,.5) !important}.text-body-secondary{--bs-text-opacity: 1;color:var(--bs-secondary-color) !important}.text-body-tertiary{--bs-text-opacity: 1;color:var(--bs-tertiary-color) !important}.text-body-emphasis{--bs-text-opacity: 1;color:var(--bs-emphasis-color) !important}.text-reset{--bs-text-opacity: 1;color:inherit !important}.text-opacity-25{--bs-text-opacity: 0.25}.text-opacity-50{--bs-text-opacity: 0.5}.text-opacity-75{--bs-text-opacity: 0.75}.text-opacity-100{--bs-text-opacity: 1}.text-primary-emphasis{color:var(--bs-primary-text-emphasis) !important}.text-secondary-emphasis{color:var(--bs-secondary-text-emphasis) !important}.text-success-emphasis{color:var(--bs-success-text-emphasis) !important}.text-info-emphasis{color:var(--bs-info-text-emphasis) !important}.text-warning-emphasis{color:var(--bs-warning-text-emphasis) !important}.text-danger-emphasis{color:var(--bs-danger-text-emphasis) !important}.text-light-emphasis{color:var(--bs-light-text-emphasis) !important}.text-dark-emphasis{color:var(--bs-dark-text-emphasis) !important}.link-opacity-10{--bs-link-opacity: 0.1}.link-opacity-10-hover:hover{--bs-link-opacity: 0.1}.link-opacity-25{--bs-link-opacity: 0.25}.link-opacity-25-hover:hover{--bs-link-opacity: 0.25}.link-opacity-50{--bs-link-opacity: 0.5}.link-opacity-50-hover:hover{--bs-link-opacity: 0.5}.link-opacity-75{--bs-link-opacity: 0.75}.link-opacity-75-hover:hover{--bs-link-opacity: 0.75}.link-opacity-100{--bs-link-opacity: 1}.link-opacity-100-hover:hover{--bs-link-opacity: 1}.link-offset-1{text-underline-offset:.125em !important}.link-offset-1-hover:hover{text-underline-offset:.125em !important}.link-offset-2{text-underline-offset:.25em !important}.link-offset-2-hover:hover{text-underline-offset:.25em !important}.link-offset-3{text-underline-offset:.375em !important}.link-offset-3-hover:hover{text-underline-offset:.375em !important}.link-underline-primary{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-primary-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-secondary{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-secondary-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-success{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-success-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-info{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-info-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-warning{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-warning-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-danger{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-danger-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-light{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-light-rgb), var(--bs-link-underline-opacity)) !important}.link-underline-dark{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-dark-rgb), var(--bs-link-underline-opacity)) !important}.link-underline{--bs-link-underline-opacity: 1;text-decoration-color:rgba(var(--bs-link-color-rgb), var(--bs-link-underline-opacity, 1)) !important}.link-underline-opacity-0{--bs-link-underline-opacity: 0}.link-underline-opacity-0-hover:hover{--bs-link-underline-opacity: 0}.link-underline-opacity-10{--bs-link-underline-opacity: 0.1}.link-underline-opacity-10-hover:hover{--bs-link-underline-opacity: 0.1}.link-underline-opacity-25{--bs-link-underline-opacity: 0.25}.link-underline-opacity-25-hover:hover{--bs-link-underline-opacity: 0.25}.link-underline-opacity-50{--bs-link-underline-opacity: 0.5}.link-underline-opacity-50-hover:hover{--bs-link-underline-opacity: 0.5}.link-underline-opacity-75{--bs-link-underline-opacity: 0.75}.link-underline-opacity-75-hover:hover{--bs-link-underline-opacity: 0.75}.link-underline-opacity-100{--bs-link-underline-opacity: 1}.link-underline-opacity-100-hover:hover{--bs-link-underline-opacity: 1}.bg-primary{--bs-bg-opacity: 1;background-color:rgba(var(--bs-primary-rgb), var(--bs-bg-opacity)) !important}.bg-secondary{--bs-bg-opacity: 1;background-color:rgba(var(--bs-secondary-rgb), var(--bs-bg-opacity)) !important}.bg-success{--bs-bg-opacity: 1;background-color:rgba(var(--bs-success-rgb), var(--bs-bg-opacity)) !important}.bg-info{--bs-bg-opacity: 1;background-color:rgba(var(--bs-info-rgb), var(--bs-bg-opacity)) !important}.bg-warning{--bs-bg-opacity: 1;background-color:rgba(var(--bs-warning-rgb), var(--bs-bg-opacity)) !important}.bg-danger{--bs-bg-opacity: 1;background-color:rgba(var(--bs-danger-rgb), var(--bs-bg-opacity)) !important}.bg-light{--bs-bg-opacity: 1;background-color:rgba(var(--bs-light-rgb), var(--bs-bg-opacity)) !important}.bg-dark{--bs-bg-opacity: 1;background-color:rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important}.bg-black{--bs-bg-opacity: 1;background-color:rgba(var(--bs-black-rgb), var(--bs-bg-opacity)) !important}.bg-white{--bs-bg-opacity: 1;background-color:rgba(var(--bs-white-rgb), var(--bs-bg-opacity)) !important}.bg-body{--bs-bg-opacity: 1;background-color:rgba(var(--bs-body-bg-rgb), var(--bs-bg-opacity)) !important}.bg-transparent{--bs-bg-opacity: 1;background-color:rgba(0,0,0,0) !important}.bg-body-secondary{--bs-bg-opacity: 1;background-color:rgba(var(--bs-secondary-bg-rgb), var(--bs-bg-opacity)) !important}.bg-body-tertiary{--bs-bg-opacity: 1;background-color:rgba(var(--bs-tertiary-bg-rgb), var(--bs-bg-opacity)) !important}.bg-opacity-10{--bs-bg-opacity: 0.1}.bg-opacity-25{--bs-bg-opacity: 0.25}.bg-opacity-50{--bs-bg-opacity: 0.5}.bg-opacity-75{--bs-bg-opacity: 0.75}.bg-opacity-100{--bs-bg-opacity: 1}.bg-primary-subtle{background-color:var(--bs-primary-bg-subtle) !important}.bg-secondary-subtle{background-color:var(--bs-secondary-bg-subtle) !important}.bg-success-subtle{background-color:var(--bs-success-bg-subtle) !important}.bg-info-subtle{background-color:var(--bs-info-bg-subtle) !important}.bg-warning-subtle{background-color:var(--bs-warning-bg-subtle) !important}.bg-danger-subtle{background-color:var(--bs-danger-bg-subtle) !important}.bg-light-subtle{background-color:var(--bs-light-bg-subtle) !important}.bg-dark-subtle{background-color:var(--bs-dark-bg-subtle) !important}.bg-gradient{background-image:var(--bs-gradient) !important}.user-select-all{user-select:all !important}.user-select-auto{user-select:auto !important}.user-select-none{user-select:none !important}.pe-none{pointer-events:none !important}.pe-auto{pointer-events:auto !important}.rounded{border-radius:var(--bs-border-radius) !important}.rounded-0{border-radius:0 !important}.rounded-1{border-radius:var(--bs-border-radius-sm) !important}.rounded-2{border-radius:var(--bs-border-radius) !important}.rounded-3{border-radius:var(--bs-border-radius-lg) !important}.rounded-4{border-radius:var(--bs-border-radius-xl) !important}.rounded-5{border-radius:var(--bs-border-radius-xxl) !important}.rounded-circle{border-radius:50% !important}.rounded-pill{border-radius:var(--bs-border-radius-pill) !important}.rounded-top{border-top-left-radius:var(--bs-border-radius) !important;border-top-right-radius:var(--bs-border-radius) !important}.rounded-top-0{border-top-left-radius:0 !important;border-top-right-radius:0 !important}.rounded-top-1{border-top-left-radius:var(--bs-border-radius-sm) !important;border-top-right-radius:var(--bs-border-radius-sm) !important}.rounded-top-2{border-top-left-radius:var(--bs-border-radius) !important;border-top-right-radius:var(--bs-border-radius) !important}.rounded-top-3{border-top-left-radius:var(--bs-border-radius-lg) !important;border-top-right-radius:var(--bs-border-radius-lg) !important}.rounded-top-4{border-top-left-radius:var(--bs-border-radius-xl) !important;border-top-right-radius:var(--bs-border-radius-xl) !important}.rounded-top-5{border-top-left-radius:var(--bs-border-radius-xxl) !important;border-top-right-radius:var(--bs-border-radius-xxl) !important}.rounded-top-circle{border-top-left-radius:50% !important;border-top-right-radius:50% !important}.rounded-top-pill{border-top-left-radius:var(--bs-border-radius-pill) !important;border-top-right-radius:var(--bs-border-radius-pill) !important}.rounded-end{border-top-right-radius:var(--bs-border-radius) !important;border-bottom-right-radius:var(--bs-border-radius) !important}.rounded-end-0{border-top-right-radius:0 !important;border-bottom-right-radius:0 !important}.rounded-end-1{border-top-right-radius:var(--bs-border-radius-sm) !important;border-bottom-right-radius:var(--bs-border-radius-sm) !important}.rounded-end-2{border-top-right-radius:var(--bs-border-radius) !important;border-bottom-right-radius:var(--bs-border-radius) !important}.rounded-end-3{border-top-right-radius:var(--bs-border-radius-lg) !important;border-bottom-right-radius:var(--bs-border-radius-lg) !important}.rounded-end-4{border-top-right-radius:var(--bs-border-radius-xl) !important;border-bottom-right-radius:var(--bs-border-radius-xl) !important}.rounded-end-5{border-top-right-radius:var(--bs-border-radius-xxl) !important;border-bottom-right-radius:var(--bs-border-radius-xxl) !important}.rounded-end-circle{border-top-right-radius:50% !important;border-bottom-right-radius:50% !important}.rounded-end-pill{border-top-right-radius:var(--bs-border-radius-pill) !important;border-bottom-right-radius:var(--bs-border-radius-pill) !important}.rounded-bottom{border-bottom-right-radius:var(--bs-border-radius) !important;border-bottom-left-radius:var(--bs-border-radius) !important}.rounded-bottom-0{border-bottom-right-radius:0 !important;border-bottom-left-radius:0 !important}.rounded-bottom-1{border-bottom-right-radius:var(--bs-border-radius-sm) !important;border-bottom-left-radius:var(--bs-border-radius-sm) !important}.rounded-bottom-2{border-bottom-right-radius:var(--bs-border-radius) !important;border-bottom-left-radius:var(--bs-border-radius) !important}.rounded-bottom-3{border-bottom-right-radius:var(--bs-border-radius-lg) !important;border-bottom-left-radius:var(--bs-border-radius-lg) !important}.rounded-bottom-4{border-bottom-right-radius:var(--bs-border-radius-xl) !important;border-bottom-left-radius:var(--bs-border-radius-xl) !important}.rounded-bottom-5{border-bottom-right-radius:var(--bs-border-radius-xxl) !important;border-bottom-left-radius:var(--bs-border-radius-xxl) !important}.rounded-bottom-circle{border-bottom-right-radius:50% !important;border-bottom-left-radius:50% !important}.rounded-bottom-pill{border-bottom-right-radius:var(--bs-border-radius-pill) !important;border-bottom-left-radius:var(--bs-border-radius-pill) !important}.rounded-start{border-bottom-left-radius:var(--bs-border-radius) !important;border-top-left-radius:var(--bs-border-radius) !important}.rounded-start-0{border-bottom-left-radius:0 !important;border-top-left-radius:0 !important}.rounded-start-1{border-bottom-left-radius:var(--bs-border-radius-sm) !important;border-top-left-radius:var(--bs-border-radius-sm) !important}.rounded-start-2{border-bottom-left-radius:var(--bs-border-radius) !important;border-top-left-radius:var(--bs-border-radius) !important}.rounded-start-3{border-bottom-left-radius:var(--bs-border-radius-lg) !important;border-top-left-radius:var(--bs-border-radius-lg) !important}.rounded-start-4{border-bottom-left-radius:var(--bs-border-radius-xl) !important;border-top-left-radius:var(--bs-border-radius-xl) !important}.rounded-start-5{border-bottom-left-radius:var(--bs-border-radius-xxl) !important;border-top-left-radius:var(--bs-border-radius-xxl) !important}.rounded-start-circle{border-bottom-left-radius:50% !important;border-top-left-radius:50% !important}.rounded-start-pill{border-bottom-left-radius:var(--bs-border-radius-pill) !important;border-top-left-radius:var(--bs-border-radius-pill) !important}.visible{visibility:visible !important}.invisible{visibility:hidden !important}.z-n1{z-index:-1 !important}.z-0{z-index:0 !important}.z-1{z-index:1 !important}.z-2{z-index:2 !important}.z-3{z-index:3 !important}@media(min-width: 576px){.float-sm-start{float:left !important}.float-sm-end{float:right !important}.float-sm-none{float:none !important}.object-fit-sm-contain{object-fit:contain !important}.object-fit-sm-cover{object-fit:cover !important}.object-fit-sm-fill{object-fit:fill !important}.object-fit-sm-scale{object-fit:scale-down !important}.object-fit-sm-none{object-fit:none !important}.d-sm-inline{display:inline !important}.d-sm-inline-block{display:inline-block !important}.d-sm-block{display:block !important}.d-sm-grid{display:grid !important}.d-sm-inline-grid{display:inline-grid !important}.d-sm-table{display:table !important}.d-sm-table-row{display:table-row !important}.d-sm-table-cell{display:table-cell !important}.d-sm-flex{display:flex !important}.d-sm-inline-flex{display:inline-flex !important}.d-sm-none{display:none !important}.flex-sm-fill{flex:1 1 auto !important}.flex-sm-row{flex-direction:row !important}.flex-sm-column{flex-direction:column !important}.flex-sm-row-reverse{flex-direction:row-reverse !important}.flex-sm-column-reverse{flex-direction:column-reverse !important}.flex-sm-grow-0{flex-grow:0 !important}.flex-sm-grow-1{flex-grow:1 !important}.flex-sm-shrink-0{flex-shrink:0 !important}.flex-sm-shrink-1{flex-shrink:1 !important}.flex-sm-wrap{flex-wrap:wrap !important}.flex-sm-nowrap{flex-wrap:nowrap !important}.flex-sm-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-sm-start{justify-content:flex-start !important}.justify-content-sm-end{justify-content:flex-end !important}.justify-content-sm-center{justify-content:center !important}.justify-content-sm-between{justify-content:space-between !important}.justify-content-sm-around{justify-content:space-around !important}.justify-content-sm-evenly{justify-content:space-evenly !important}.align-items-sm-start{align-items:flex-start !important}.align-items-sm-end{align-items:flex-end !important}.align-items-sm-center{align-items:center !important}.align-items-sm-baseline{align-items:baseline !important}.align-items-sm-stretch{align-items:stretch !important}.align-content-sm-start{align-content:flex-start !important}.align-content-sm-end{align-content:flex-end !important}.align-content-sm-center{align-content:center !important}.align-content-sm-between{align-content:space-between !important}.align-content-sm-around{align-content:space-around !important}.align-content-sm-stretch{align-content:stretch !important}.align-self-sm-auto{align-self:auto !important}.align-self-sm-start{align-self:flex-start !important}.align-self-sm-end{align-self:flex-end !important}.align-self-sm-center{align-self:center !important}.align-self-sm-baseline{align-self:baseline !important}.align-self-sm-stretch{align-self:stretch !important}.order-sm-first{order:-1 !important}.order-sm-0{order:0 !important}.order-sm-1{order:1 !important}.order-sm-2{order:2 !important}.order-sm-3{order:3 !important}.order-sm-4{order:4 !important}.order-sm-5{order:5 !important}.order-sm-last{order:6 !important}.m-sm-0{margin:0 !important}.m-sm-1{margin:.25rem !important}.m-sm-2{margin:.5rem !important}.m-sm-3{margin:1rem !important}.m-sm-4{margin:1.5rem !important}.m-sm-5{margin:3rem !important}.m-sm-auto{margin:auto !important}.mx-sm-0{margin-right:0 !important;margin-left:0 !important}.mx-sm-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-sm-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-sm-3{margin-right:1rem !important;margin-left:1rem !important}.mx-sm-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-sm-5{margin-right:3rem !important;margin-left:3rem !important}.mx-sm-auto{margin-right:auto !important;margin-left:auto !important}.my-sm-0{margin-top:0 !important;margin-bottom:0 !important}.my-sm-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-sm-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-sm-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-sm-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-sm-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-sm-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-sm-0{margin-top:0 !important}.mt-sm-1{margin-top:.25rem !important}.mt-sm-2{margin-top:.5rem !important}.mt-sm-3{margin-top:1rem !important}.mt-sm-4{margin-top:1.5rem !important}.mt-sm-5{margin-top:3rem !important}.mt-sm-auto{margin-top:auto !important}.me-sm-0{margin-right:0 !important}.me-sm-1{margin-right:.25rem !important}.me-sm-2{margin-right:.5rem !important}.me-sm-3{margin-right:1rem !important}.me-sm-4{margin-right:1.5rem !important}.me-sm-5{margin-right:3rem !important}.me-sm-auto{margin-right:auto !important}.mb-sm-0{margin-bottom:0 !important}.mb-sm-1{margin-bottom:.25rem !important}.mb-sm-2{margin-bottom:.5rem !important}.mb-sm-3{margin-bottom:1rem !important}.mb-sm-4{margin-bottom:1.5rem !important}.mb-sm-5{margin-bottom:3rem !important}.mb-sm-auto{margin-bottom:auto !important}.ms-sm-0{margin-left:0 !important}.ms-sm-1{margin-left:.25rem !important}.ms-sm-2{margin-left:.5rem !important}.ms-sm-3{margin-left:1rem !important}.ms-sm-4{margin-left:1.5rem !important}.ms-sm-5{margin-left:3rem !important}.ms-sm-auto{margin-left:auto !important}.p-sm-0{padding:0 !important}.p-sm-1{padding:.25rem !important}.p-sm-2{padding:.5rem !important}.p-sm-3{padding:1rem !important}.p-sm-4{padding:1.5rem !important}.p-sm-5{padding:3rem !important}.px-sm-0{padding-right:0 !important;padding-left:0 !important}.px-sm-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-sm-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-sm-3{padding-right:1rem !important;padding-left:1rem !important}.px-sm-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-sm-5{padding-right:3rem !important;padding-left:3rem !important}.py-sm-0{padding-top:0 !important;padding-bottom:0 !important}.py-sm-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-sm-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-sm-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-sm-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-sm-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-sm-0{padding-top:0 !important}.pt-sm-1{padding-top:.25rem !important}.pt-sm-2{padding-top:.5rem !important}.pt-sm-3{padding-top:1rem !important}.pt-sm-4{padding-top:1.5rem !important}.pt-sm-5{padding-top:3rem !important}.pe-sm-0{padding-right:0 !important}.pe-sm-1{padding-right:.25rem !important}.pe-sm-2{padding-right:.5rem !important}.pe-sm-3{padding-right:1rem !important}.pe-sm-4{padding-right:1.5rem !important}.pe-sm-5{padding-right:3rem !important}.pb-sm-0{padding-bottom:0 !important}.pb-sm-1{padding-bottom:.25rem !important}.pb-sm-2{padding-bottom:.5rem !important}.pb-sm-3{padding-bottom:1rem !important}.pb-sm-4{padding-bottom:1.5rem !important}.pb-sm-5{padding-bottom:3rem !important}.ps-sm-0{padding-left:0 !important}.ps-sm-1{padding-left:.25rem !important}.ps-sm-2{padding-left:.5rem !important}.ps-sm-3{padding-left:1rem !important}.ps-sm-4{padding-left:1.5rem !important}.ps-sm-5{padding-left:3rem !important}.gap-sm-0{gap:0 !important}.gap-sm-1{gap:.25rem !important}.gap-sm-2{gap:.5rem !important}.gap-sm-3{gap:1rem !important}.gap-sm-4{gap:1.5rem !important}.gap-sm-5{gap:3rem !important}.row-gap-sm-0{row-gap:0 !important}.row-gap-sm-1{row-gap:.25rem !important}.row-gap-sm-2{row-gap:.5rem !important}.row-gap-sm-3{row-gap:1rem !important}.row-gap-sm-4{row-gap:1.5rem !important}.row-gap-sm-5{row-gap:3rem !important}.column-gap-sm-0{column-gap:0 !important}.column-gap-sm-1{column-gap:.25rem !important}.column-gap-sm-2{column-gap:.5rem !important}.column-gap-sm-3{column-gap:1rem !important}.column-gap-sm-4{column-gap:1.5rem !important}.column-gap-sm-5{column-gap:3rem !important}.text-sm-start{text-align:left !important}.text-sm-end{text-align:right !important}.text-sm-center{text-align:center !important}}@media(min-width: 768px){.float-md-start{float:left !important}.float-md-end{float:right !important}.float-md-none{float:none !important}.object-fit-md-contain{object-fit:contain !important}.object-fit-md-cover{object-fit:cover !important}.object-fit-md-fill{object-fit:fill !important}.object-fit-md-scale{object-fit:scale-down !important}.object-fit-md-none{object-fit:none !important}.d-md-inline{display:inline !important}.d-md-inline-block{display:inline-block !important}.d-md-block{display:block !important}.d-md-grid{display:grid !important}.d-md-inline-grid{display:inline-grid !important}.d-md-table{display:table !important}.d-md-table-row{display:table-row !important}.d-md-table-cell{display:table-cell !important}.d-md-flex{display:flex !important}.d-md-inline-flex{display:inline-flex !important}.d-md-none{display:none !important}.flex-md-fill{flex:1 1 auto !important}.flex-md-row{flex-direction:row !important}.flex-md-column{flex-direction:column !important}.flex-md-row-reverse{flex-direction:row-reverse !important}.flex-md-column-reverse{flex-direction:column-reverse !important}.flex-md-grow-0{flex-grow:0 !important}.flex-md-grow-1{flex-grow:1 !important}.flex-md-shrink-0{flex-shrink:0 !important}.flex-md-shrink-1{flex-shrink:1 !important}.flex-md-wrap{flex-wrap:wrap !important}.flex-md-nowrap{flex-wrap:nowrap !important}.flex-md-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-md-start{justify-content:flex-start !important}.justify-content-md-end{justify-content:flex-end !important}.justify-content-md-center{justify-content:center !important}.justify-content-md-between{justify-content:space-between !important}.justify-content-md-around{justify-content:space-around !important}.justify-content-md-evenly{justify-content:space-evenly !important}.align-items-md-start{align-items:flex-start !important}.align-items-md-end{align-items:flex-end !important}.align-items-md-center{align-items:center !important}.align-items-md-baseline{align-items:baseline !important}.align-items-md-stretch{align-items:stretch !important}.align-content-md-start{align-content:flex-start !important}.align-content-md-end{align-content:flex-end !important}.align-content-md-center{align-content:center !important}.align-content-md-between{align-content:space-between !important}.align-content-md-around{align-content:space-around !important}.align-content-md-stretch{align-content:stretch !important}.align-self-md-auto{align-self:auto !important}.align-self-md-start{align-self:flex-start !important}.align-self-md-end{align-self:flex-end !important}.align-self-md-center{align-self:center !important}.align-self-md-baseline{align-self:baseline !important}.align-self-md-stretch{align-self:stretch !important}.order-md-first{order:-1 !important}.order-md-0{order:0 !important}.order-md-1{order:1 !important}.order-md-2{order:2 !important}.order-md-3{order:3 !important}.order-md-4{order:4 !important}.order-md-5{order:5 !important}.order-md-last{order:6 !important}.m-md-0{margin:0 !important}.m-md-1{margin:.25rem !important}.m-md-2{margin:.5rem !important}.m-md-3{margin:1rem !important}.m-md-4{margin:1.5rem !important}.m-md-5{margin:3rem !important}.m-md-auto{margin:auto !important}.mx-md-0{margin-right:0 !important;margin-left:0 !important}.mx-md-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-md-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-md-3{margin-right:1rem !important;margin-left:1rem !important}.mx-md-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-md-5{margin-right:3rem !important;margin-left:3rem !important}.mx-md-auto{margin-right:auto !important;margin-left:auto !important}.my-md-0{margin-top:0 !important;margin-bottom:0 !important}.my-md-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-md-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-md-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-md-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-md-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-md-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-md-0{margin-top:0 !important}.mt-md-1{margin-top:.25rem !important}.mt-md-2{margin-top:.5rem !important}.mt-md-3{margin-top:1rem !important}.mt-md-4{margin-top:1.5rem !important}.mt-md-5{margin-top:3rem !important}.mt-md-auto{margin-top:auto !important}.me-md-0{margin-right:0 !important}.me-md-1{margin-right:.25rem !important}.me-md-2{margin-right:.5rem !important}.me-md-3{margin-right:1rem !important}.me-md-4{margin-right:1.5rem !important}.me-md-5{margin-right:3rem !important}.me-md-auto{margin-right:auto !important}.mb-md-0{margin-bottom:0 !important}.mb-md-1{margin-bottom:.25rem !important}.mb-md-2{margin-bottom:.5rem !important}.mb-md-3{margin-bottom:1rem !important}.mb-md-4{margin-bottom:1.5rem !important}.mb-md-5{margin-bottom:3rem !important}.mb-md-auto{margin-bottom:auto !important}.ms-md-0{margin-left:0 !important}.ms-md-1{margin-left:.25rem !important}.ms-md-2{margin-left:.5rem !important}.ms-md-3{margin-left:1rem !important}.ms-md-4{margin-left:1.5rem !important}.ms-md-5{margin-left:3rem !important}.ms-md-auto{margin-left:auto !important}.p-md-0{padding:0 !important}.p-md-1{padding:.25rem !important}.p-md-2{padding:.5rem !important}.p-md-3{padding:1rem !important}.p-md-4{padding:1.5rem !important}.p-md-5{padding:3rem !important}.px-md-0{padding-right:0 !important;padding-left:0 !important}.px-md-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-md-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-md-3{padding-right:1rem !important;padding-left:1rem !important}.px-md-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-md-5{padding-right:3rem !important;padding-left:3rem !important}.py-md-0{padding-top:0 !important;padding-bottom:0 !important}.py-md-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-md-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-md-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-md-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-md-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-md-0{padding-top:0 !important}.pt-md-1{padding-top:.25rem !important}.pt-md-2{padding-top:.5rem !important}.pt-md-3{padding-top:1rem !important}.pt-md-4{padding-top:1.5rem !important}.pt-md-5{padding-top:3rem !important}.pe-md-0{padding-right:0 !important}.pe-md-1{padding-right:.25rem !important}.pe-md-2{padding-right:.5rem !important}.pe-md-3{padding-right:1rem !important}.pe-md-4{padding-right:1.5rem !important}.pe-md-5{padding-right:3rem !important}.pb-md-0{padding-bottom:0 !important}.pb-md-1{padding-bottom:.25rem !important}.pb-md-2{padding-bottom:.5rem !important}.pb-md-3{padding-bottom:1rem !important}.pb-md-4{padding-bottom:1.5rem !important}.pb-md-5{padding-bottom:3rem !important}.ps-md-0{padding-left:0 !important}.ps-md-1{padding-left:.25rem !important}.ps-md-2{padding-left:.5rem !important}.ps-md-3{padding-left:1rem !important}.ps-md-4{padding-left:1.5rem !important}.ps-md-5{padding-left:3rem !important}.gap-md-0{gap:0 !important}.gap-md-1{gap:.25rem !important}.gap-md-2{gap:.5rem !important}.gap-md-3{gap:1rem !important}.gap-md-4{gap:1.5rem !important}.gap-md-5{gap:3rem !important}.row-gap-md-0{row-gap:0 !important}.row-gap-md-1{row-gap:.25rem !important}.row-gap-md-2{row-gap:.5rem !important}.row-gap-md-3{row-gap:1rem !important}.row-gap-md-4{row-gap:1.5rem !important}.row-gap-md-5{row-gap:3rem !important}.column-gap-md-0{column-gap:0 !important}.column-gap-md-1{column-gap:.25rem !important}.column-gap-md-2{column-gap:.5rem !important}.column-gap-md-3{column-gap:1rem !important}.column-gap-md-4{column-gap:1.5rem !important}.column-gap-md-5{column-gap:3rem !important}.text-md-start{text-align:left !important}.text-md-end{text-align:right !important}.text-md-center{text-align:center !important}}@media(min-width: 992px){.float-lg-start{float:left !important}.float-lg-end{float:right !important}.float-lg-none{float:none !important}.object-fit-lg-contain{object-fit:contain !important}.object-fit-lg-cover{object-fit:cover !important}.object-fit-lg-fill{object-fit:fill !important}.object-fit-lg-scale{object-fit:scale-down !important}.object-fit-lg-none{object-fit:none !important}.d-lg-inline{display:inline !important}.d-lg-inline-block{display:inline-block !important}.d-lg-block{display:block !important}.d-lg-grid{display:grid !important}.d-lg-inline-grid{display:inline-grid !important}.d-lg-table{display:table !important}.d-lg-table-row{display:table-row !important}.d-lg-table-cell{display:table-cell !important}.d-lg-flex{display:flex !important}.d-lg-inline-flex{display:inline-flex !important}.d-lg-none{display:none !important}.flex-lg-fill{flex:1 1 auto !important}.flex-lg-row{flex-direction:row !important}.flex-lg-column{flex-direction:column !important}.flex-lg-row-reverse{flex-direction:row-reverse !important}.flex-lg-column-reverse{flex-direction:column-reverse !important}.flex-lg-grow-0{flex-grow:0 !important}.flex-lg-grow-1{flex-grow:1 !important}.flex-lg-shrink-0{flex-shrink:0 !important}.flex-lg-shrink-1{flex-shrink:1 !important}.flex-lg-wrap{flex-wrap:wrap !important}.flex-lg-nowrap{flex-wrap:nowrap !important}.flex-lg-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-lg-start{justify-content:flex-start !important}.justify-content-lg-end{justify-content:flex-end !important}.justify-content-lg-center{justify-content:center !important}.justify-content-lg-between{justify-content:space-between !important}.justify-content-lg-around{justify-content:space-around !important}.justify-content-lg-evenly{justify-content:space-evenly !important}.align-items-lg-start{align-items:flex-start !important}.align-items-lg-end{align-items:flex-end !important}.align-items-lg-center{align-items:center !important}.align-items-lg-baseline{align-items:baseline !important}.align-items-lg-stretch{align-items:stretch !important}.align-content-lg-start{align-content:flex-start !important}.align-content-lg-end{align-content:flex-end !important}.align-content-lg-center{align-content:center !important}.align-content-lg-between{align-content:space-between !important}.align-content-lg-around{align-content:space-around !important}.align-content-lg-stretch{align-content:stretch !important}.align-self-lg-auto{align-self:auto !important}.align-self-lg-start{align-self:flex-start !important}.align-self-lg-end{align-self:flex-end !important}.align-self-lg-center{align-self:center !important}.align-self-lg-baseline{align-self:baseline !important}.align-self-lg-stretch{align-self:stretch !important}.order-lg-first{order:-1 !important}.order-lg-0{order:0 !important}.order-lg-1{order:1 !important}.order-lg-2{order:2 !important}.order-lg-3{order:3 !important}.order-lg-4{order:4 !important}.order-lg-5{order:5 !important}.order-lg-last{order:6 !important}.m-lg-0{margin:0 !important}.m-lg-1{margin:.25rem !important}.m-lg-2{margin:.5rem !important}.m-lg-3{margin:1rem !important}.m-lg-4{margin:1.5rem !important}.m-lg-5{margin:3rem !important}.m-lg-auto{margin:auto !important}.mx-lg-0{margin-right:0 !important;margin-left:0 !important}.mx-lg-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-lg-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-lg-3{margin-right:1rem !important;margin-left:1rem !important}.mx-lg-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-lg-5{margin-right:3rem !important;margin-left:3rem !important}.mx-lg-auto{margin-right:auto !important;margin-left:auto !important}.my-lg-0{margin-top:0 !important;margin-bottom:0 !important}.my-lg-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-lg-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-lg-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-lg-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-lg-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-lg-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-lg-0{margin-top:0 !important}.mt-lg-1{margin-top:.25rem !important}.mt-lg-2{margin-top:.5rem !important}.mt-lg-3{margin-top:1rem !important}.mt-lg-4{margin-top:1.5rem !important}.mt-lg-5{margin-top:3rem !important}.mt-lg-auto{margin-top:auto !important}.me-lg-0{margin-right:0 !important}.me-lg-1{margin-right:.25rem !important}.me-lg-2{margin-right:.5rem !important}.me-lg-3{margin-right:1rem !important}.me-lg-4{margin-right:1.5rem !important}.me-lg-5{margin-right:3rem !important}.me-lg-auto{margin-right:auto !important}.mb-lg-0{margin-bottom:0 !important}.mb-lg-1{margin-bottom:.25rem !important}.mb-lg-2{margin-bottom:.5rem !important}.mb-lg-3{margin-bottom:1rem !important}.mb-lg-4{margin-bottom:1.5rem !important}.mb-lg-5{margin-bottom:3rem !important}.mb-lg-auto{margin-bottom:auto !important}.ms-lg-0{margin-left:0 !important}.ms-lg-1{margin-left:.25rem !important}.ms-lg-2{margin-left:.5rem !important}.ms-lg-3{margin-left:1rem !important}.ms-lg-4{margin-left:1.5rem !important}.ms-lg-5{margin-left:3rem !important}.ms-lg-auto{margin-left:auto !important}.p-lg-0{padding:0 !important}.p-lg-1{padding:.25rem !important}.p-lg-2{padding:.5rem !important}.p-lg-3{padding:1rem !important}.p-lg-4{padding:1.5rem !important}.p-lg-5{padding:3rem !important}.px-lg-0{padding-right:0 !important;padding-left:0 !important}.px-lg-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-lg-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-lg-3{padding-right:1rem !important;padding-left:1rem !important}.px-lg-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-lg-5{padding-right:3rem !important;padding-left:3rem !important}.py-lg-0{padding-top:0 !important;padding-bottom:0 !important}.py-lg-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-lg-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-lg-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-lg-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-lg-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-lg-0{padding-top:0 !important}.pt-lg-1{padding-top:.25rem !important}.pt-lg-2{padding-top:.5rem !important}.pt-lg-3{padding-top:1rem !important}.pt-lg-4{padding-top:1.5rem !important}.pt-lg-5{padding-top:3rem !important}.pe-lg-0{padding-right:0 !important}.pe-lg-1{padding-right:.25rem !important}.pe-lg-2{padding-right:.5rem !important}.pe-lg-3{padding-right:1rem !important}.pe-lg-4{padding-right:1.5rem !important}.pe-lg-5{padding-right:3rem !important}.pb-lg-0{padding-bottom:0 !important}.pb-lg-1{padding-bottom:.25rem !important}.pb-lg-2{padding-bottom:.5rem !important}.pb-lg-3{padding-bottom:1rem !important}.pb-lg-4{padding-bottom:1.5rem !important}.pb-lg-5{padding-bottom:3rem !important}.ps-lg-0{padding-left:0 !important}.ps-lg-1{padding-left:.25rem !important}.ps-lg-2{padding-left:.5rem !important}.ps-lg-3{padding-left:1rem !important}.ps-lg-4{padding-left:1.5rem !important}.ps-lg-5{padding-left:3rem !important}.gap-lg-0{gap:0 !important}.gap-lg-1{gap:.25rem !important}.gap-lg-2{gap:.5rem !important}.gap-lg-3{gap:1rem !important}.gap-lg-4{gap:1.5rem !important}.gap-lg-5{gap:3rem !important}.row-gap-lg-0{row-gap:0 !important}.row-gap-lg-1{row-gap:.25rem !important}.row-gap-lg-2{row-gap:.5rem !important}.row-gap-lg-3{row-gap:1rem !important}.row-gap-lg-4{row-gap:1.5rem !important}.row-gap-lg-5{row-gap:3rem !important}.column-gap-lg-0{column-gap:0 !important}.column-gap-lg-1{column-gap:.25rem !important}.column-gap-lg-2{column-gap:.5rem !important}.column-gap-lg-3{column-gap:1rem !important}.column-gap-lg-4{column-gap:1.5rem !important}.column-gap-lg-5{column-gap:3rem !important}.text-lg-start{text-align:left !important}.text-lg-end{text-align:right !important}.text-lg-center{text-align:center !important}}@media(min-width: 1200px){.float-xl-start{float:left !important}.float-xl-end{float:right !important}.float-xl-none{float:none !important}.object-fit-xl-contain{object-fit:contain !important}.object-fit-xl-cover{object-fit:cover !important}.object-fit-xl-fill{object-fit:fill !important}.object-fit-xl-scale{object-fit:scale-down !important}.object-fit-xl-none{object-fit:none !important}.d-xl-inline{display:inline !important}.d-xl-inline-block{display:inline-block !important}.d-xl-block{display:block !important}.d-xl-grid{display:grid !important}.d-xl-inline-grid{display:inline-grid !important}.d-xl-table{display:table !important}.d-xl-table-row{display:table-row !important}.d-xl-table-cell{display:table-cell !important}.d-xl-flex{display:flex !important}.d-xl-inline-flex{display:inline-flex !important}.d-xl-none{display:none !important}.flex-xl-fill{flex:1 1 auto !important}.flex-xl-row{flex-direction:row !important}.flex-xl-column{flex-direction:column !important}.flex-xl-row-reverse{flex-direction:row-reverse !important}.flex-xl-column-reverse{flex-direction:column-reverse !important}.flex-xl-grow-0{flex-grow:0 !important}.flex-xl-grow-1{flex-grow:1 !important}.flex-xl-shrink-0{flex-shrink:0 !important}.flex-xl-shrink-1{flex-shrink:1 !important}.flex-xl-wrap{flex-wrap:wrap !important}.flex-xl-nowrap{flex-wrap:nowrap !important}.flex-xl-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-xl-start{justify-content:flex-start !important}.justify-content-xl-end{justify-content:flex-end !important}.justify-content-xl-center{justify-content:center !important}.justify-content-xl-between{justify-content:space-between !important}.justify-content-xl-around{justify-content:space-around !important}.justify-content-xl-evenly{justify-content:space-evenly !important}.align-items-xl-start{align-items:flex-start !important}.align-items-xl-end{align-items:flex-end !important}.align-items-xl-center{align-items:center !important}.align-items-xl-baseline{align-items:baseline !important}.align-items-xl-stretch{align-items:stretch !important}.align-content-xl-start{align-content:flex-start !important}.align-content-xl-end{align-content:flex-end !important}.align-content-xl-center{align-content:center !important}.align-content-xl-between{align-content:space-between !important}.align-content-xl-around{align-content:space-around !important}.align-content-xl-stretch{align-content:stretch !important}.align-self-xl-auto{align-self:auto !important}.align-self-xl-start{align-self:flex-start !important}.align-self-xl-end{align-self:flex-end !important}.align-self-xl-center{align-self:center !important}.align-self-xl-baseline{align-self:baseline !important}.align-self-xl-stretch{align-self:stretch !important}.order-xl-first{order:-1 !important}.order-xl-0{order:0 !important}.order-xl-1{order:1 !important}.order-xl-2{order:2 !important}.order-xl-3{order:3 !important}.order-xl-4{order:4 !important}.order-xl-5{order:5 !important}.order-xl-last{order:6 !important}.m-xl-0{margin:0 !important}.m-xl-1{margin:.25rem !important}.m-xl-2{margin:.5rem !important}.m-xl-3{margin:1rem !important}.m-xl-4{margin:1.5rem !important}.m-xl-5{margin:3rem !important}.m-xl-auto{margin:auto !important}.mx-xl-0{margin-right:0 !important;margin-left:0 !important}.mx-xl-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-xl-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-xl-3{margin-right:1rem !important;margin-left:1rem !important}.mx-xl-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-xl-5{margin-right:3rem !important;margin-left:3rem !important}.mx-xl-auto{margin-right:auto !important;margin-left:auto !important}.my-xl-0{margin-top:0 !important;margin-bottom:0 !important}.my-xl-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-xl-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-xl-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-xl-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-xl-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-xl-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-xl-0{margin-top:0 !important}.mt-xl-1{margin-top:.25rem !important}.mt-xl-2{margin-top:.5rem !important}.mt-xl-3{margin-top:1rem !important}.mt-xl-4{margin-top:1.5rem !important}.mt-xl-5{margin-top:3rem !important}.mt-xl-auto{margin-top:auto !important}.me-xl-0{margin-right:0 !important}.me-xl-1{margin-right:.25rem !important}.me-xl-2{margin-right:.5rem !important}.me-xl-3{margin-right:1rem !important}.me-xl-4{margin-right:1.5rem !important}.me-xl-5{margin-right:3rem !important}.me-xl-auto{margin-right:auto !important}.mb-xl-0{margin-bottom:0 !important}.mb-xl-1{margin-bottom:.25rem !important}.mb-xl-2{margin-bottom:.5rem !important}.mb-xl-3{margin-bottom:1rem !important}.mb-xl-4{margin-bottom:1.5rem !important}.mb-xl-5{margin-bottom:3rem !important}.mb-xl-auto{margin-bottom:auto !important}.ms-xl-0{margin-left:0 !important}.ms-xl-1{margin-left:.25rem !important}.ms-xl-2{margin-left:.5rem !important}.ms-xl-3{margin-left:1rem !important}.ms-xl-4{margin-left:1.5rem !important}.ms-xl-5{margin-left:3rem !important}.ms-xl-auto{margin-left:auto !important}.p-xl-0{padding:0 !important}.p-xl-1{padding:.25rem !important}.p-xl-2{padding:.5rem !important}.p-xl-3{padding:1rem !important}.p-xl-4{padding:1.5rem !important}.p-xl-5{padding:3rem !important}.px-xl-0{padding-right:0 !important;padding-left:0 !important}.px-xl-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-xl-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-xl-3{padding-right:1rem !important;padding-left:1rem !important}.px-xl-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-xl-5{padding-right:3rem !important;padding-left:3rem !important}.py-xl-0{padding-top:0 !important;padding-bottom:0 !important}.py-xl-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-xl-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-xl-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-xl-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-xl-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-xl-0{padding-top:0 !important}.pt-xl-1{padding-top:.25rem !important}.pt-xl-2{padding-top:.5rem !important}.pt-xl-3{padding-top:1rem !important}.pt-xl-4{padding-top:1.5rem !important}.pt-xl-5{padding-top:3rem !important}.pe-xl-0{padding-right:0 !important}.pe-xl-1{padding-right:.25rem !important}.pe-xl-2{padding-right:.5rem !important}.pe-xl-3{padding-right:1rem !important}.pe-xl-4{padding-right:1.5rem !important}.pe-xl-5{padding-right:3rem !important}.pb-xl-0{padding-bottom:0 !important}.pb-xl-1{padding-bottom:.25rem !important}.pb-xl-2{padding-bottom:.5rem !important}.pb-xl-3{padding-bottom:1rem !important}.pb-xl-4{padding-bottom:1.5rem !important}.pb-xl-5{padding-bottom:3rem !important}.ps-xl-0{padding-left:0 !important}.ps-xl-1{padding-left:.25rem !important}.ps-xl-2{padding-left:.5rem !important}.ps-xl-3{padding-left:1rem !important}.ps-xl-4{padding-left:1.5rem !important}.ps-xl-5{padding-left:3rem !important}.gap-xl-0{gap:0 !important}.gap-xl-1{gap:.25rem !important}.gap-xl-2{gap:.5rem !important}.gap-xl-3{gap:1rem !important}.gap-xl-4{gap:1.5rem !important}.gap-xl-5{gap:3rem !important}.row-gap-xl-0{row-gap:0 !important}.row-gap-xl-1{row-gap:.25rem !important}.row-gap-xl-2{row-gap:.5rem !important}.row-gap-xl-3{row-gap:1rem !important}.row-gap-xl-4{row-gap:1.5rem !important}.row-gap-xl-5{row-gap:3rem !important}.column-gap-xl-0{column-gap:0 !important}.column-gap-xl-1{column-gap:.25rem !important}.column-gap-xl-2{column-gap:.5rem !important}.column-gap-xl-3{column-gap:1rem !important}.column-gap-xl-4{column-gap:1.5rem !important}.column-gap-xl-5{column-gap:3rem !important}.text-xl-start{text-align:left !important}.text-xl-end{text-align:right !important}.text-xl-center{text-align:center !important}}@media(min-width: 1400px){.float-xxl-start{float:left !important}.float-xxl-end{float:right !important}.float-xxl-none{float:none !important}.object-fit-xxl-contain{object-fit:contain !important}.object-fit-xxl-cover{object-fit:cover !important}.object-fit-xxl-fill{object-fit:fill !important}.object-fit-xxl-scale{object-fit:scale-down !important}.object-fit-xxl-none{object-fit:none !important}.d-xxl-inline{display:inline !important}.d-xxl-inline-block{display:inline-block !important}.d-xxl-block{display:block !important}.d-xxl-grid{display:grid !important}.d-xxl-inline-grid{display:inline-grid !important}.d-xxl-table{display:table !important}.d-xxl-table-row{display:table-row !important}.d-xxl-table-cell{display:table-cell !important}.d-xxl-flex{display:flex !important}.d-xxl-inline-flex{display:inline-flex !important}.d-xxl-none{display:none !important}.flex-xxl-fill{flex:1 1 auto !important}.flex-xxl-row{flex-direction:row !important}.flex-xxl-column{flex-direction:column !important}.flex-xxl-row-reverse{flex-direction:row-reverse !important}.flex-xxl-column-reverse{flex-direction:column-reverse !important}.flex-xxl-grow-0{flex-grow:0 !important}.flex-xxl-grow-1{flex-grow:1 !important}.flex-xxl-shrink-0{flex-shrink:0 !important}.flex-xxl-shrink-1{flex-shrink:1 !important}.flex-xxl-wrap{flex-wrap:wrap !important}.flex-xxl-nowrap{flex-wrap:nowrap !important}.flex-xxl-wrap-reverse{flex-wrap:wrap-reverse !important}.justify-content-xxl-start{justify-content:flex-start !important}.justify-content-xxl-end{justify-content:flex-end !important}.justify-content-xxl-center{justify-content:center !important}.justify-content-xxl-between{justify-content:space-between !important}.justify-content-xxl-around{justify-content:space-around !important}.justify-content-xxl-evenly{justify-content:space-evenly !important}.align-items-xxl-start{align-items:flex-start !important}.align-items-xxl-end{align-items:flex-end !important}.align-items-xxl-center{align-items:center !important}.align-items-xxl-baseline{align-items:baseline !important}.align-items-xxl-stretch{align-items:stretch !important}.align-content-xxl-start{align-content:flex-start !important}.align-content-xxl-end{align-content:flex-end !important}.align-content-xxl-center{align-content:center !important}.align-content-xxl-between{align-content:space-between !important}.align-content-xxl-around{align-content:space-around !important}.align-content-xxl-stretch{align-content:stretch !important}.align-self-xxl-auto{align-self:auto !important}.align-self-xxl-start{align-self:flex-start !important}.align-self-xxl-end{align-self:flex-end !important}.align-self-xxl-center{align-self:center !important}.align-self-xxl-baseline{align-self:baseline !important}.align-self-xxl-stretch{align-self:stretch !important}.order-xxl-first{order:-1 !important}.order-xxl-0{order:0 !important}.order-xxl-1{order:1 !important}.order-xxl-2{order:2 !important}.order-xxl-3{order:3 !important}.order-xxl-4{order:4 !important}.order-xxl-5{order:5 !important}.order-xxl-last{order:6 !important}.m-xxl-0{margin:0 !important}.m-xxl-1{margin:.25rem !important}.m-xxl-2{margin:.5rem !important}.m-xxl-3{margin:1rem !important}.m-xxl-4{margin:1.5rem !important}.m-xxl-5{margin:3rem !important}.m-xxl-auto{margin:auto !important}.mx-xxl-0{margin-right:0 !important;margin-left:0 !important}.mx-xxl-1{margin-right:.25rem !important;margin-left:.25rem !important}.mx-xxl-2{margin-right:.5rem !important;margin-left:.5rem !important}.mx-xxl-3{margin-right:1rem !important;margin-left:1rem !important}.mx-xxl-4{margin-right:1.5rem !important;margin-left:1.5rem !important}.mx-xxl-5{margin-right:3rem !important;margin-left:3rem !important}.mx-xxl-auto{margin-right:auto !important;margin-left:auto !important}.my-xxl-0{margin-top:0 !important;margin-bottom:0 !important}.my-xxl-1{margin-top:.25rem !important;margin-bottom:.25rem !important}.my-xxl-2{margin-top:.5rem !important;margin-bottom:.5rem !important}.my-xxl-3{margin-top:1rem !important;margin-bottom:1rem !important}.my-xxl-4{margin-top:1.5rem !important;margin-bottom:1.5rem !important}.my-xxl-5{margin-top:3rem !important;margin-bottom:3rem !important}.my-xxl-auto{margin-top:auto !important;margin-bottom:auto !important}.mt-xxl-0{margin-top:0 !important}.mt-xxl-1{margin-top:.25rem !important}.mt-xxl-2{margin-top:.5rem !important}.mt-xxl-3{margin-top:1rem !important}.mt-xxl-4{margin-top:1.5rem !important}.mt-xxl-5{margin-top:3rem !important}.mt-xxl-auto{margin-top:auto !important}.me-xxl-0{margin-right:0 !important}.me-xxl-1{margin-right:.25rem !important}.me-xxl-2{margin-right:.5rem !important}.me-xxl-3{margin-right:1rem !important}.me-xxl-4{margin-right:1.5rem !important}.me-xxl-5{margin-right:3rem !important}.me-xxl-auto{margin-right:auto !important}.mb-xxl-0{margin-bottom:0 !important}.mb-xxl-1{margin-bottom:.25rem !important}.mb-xxl-2{margin-bottom:.5rem !important}.mb-xxl-3{margin-bottom:1rem !important}.mb-xxl-4{margin-bottom:1.5rem !important}.mb-xxl-5{margin-bottom:3rem !important}.mb-xxl-auto{margin-bottom:auto !important}.ms-xxl-0{margin-left:0 !important}.ms-xxl-1{margin-left:.25rem !important}.ms-xxl-2{margin-left:.5rem !important}.ms-xxl-3{margin-left:1rem !important}.ms-xxl-4{margin-left:1.5rem !important}.ms-xxl-5{margin-left:3rem !important}.ms-xxl-auto{margin-left:auto !important}.p-xxl-0{padding:0 !important}.p-xxl-1{padding:.25rem !important}.p-xxl-2{padding:.5rem !important}.p-xxl-3{padding:1rem !important}.p-xxl-4{padding:1.5rem !important}.p-xxl-5{padding:3rem !important}.px-xxl-0{padding-right:0 !important;padding-left:0 !important}.px-xxl-1{padding-right:.25rem !important;padding-left:.25rem !important}.px-xxl-2{padding-right:.5rem !important;padding-left:.5rem !important}.px-xxl-3{padding-right:1rem !important;padding-left:1rem !important}.px-xxl-4{padding-right:1.5rem !important;padding-left:1.5rem !important}.px-xxl-5{padding-right:3rem !important;padding-left:3rem !important}.py-xxl-0{padding-top:0 !important;padding-bottom:0 !important}.py-xxl-1{padding-top:.25rem !important;padding-bottom:.25rem !important}.py-xxl-2{padding-top:.5rem !important;padding-bottom:.5rem !important}.py-xxl-3{padding-top:1rem !important;padding-bottom:1rem !important}.py-xxl-4{padding-top:1.5rem !important;padding-bottom:1.5rem !important}.py-xxl-5{padding-top:3rem !important;padding-bottom:3rem !important}.pt-xxl-0{padding-top:0 !important}.pt-xxl-1{padding-top:.25rem !important}.pt-xxl-2{padding-top:.5rem !important}.pt-xxl-3{padding-top:1rem !important}.pt-xxl-4{padding-top:1.5rem !important}.pt-xxl-5{padding-top:3rem !important}.pe-xxl-0{padding-right:0 !important}.pe-xxl-1{padding-right:.25rem !important}.pe-xxl-2{padding-right:.5rem !important}.pe-xxl-3{padding-right:1rem !important}.pe-xxl-4{padding-right:1.5rem !important}.pe-xxl-5{padding-right:3rem !important}.pb-xxl-0{padding-bottom:0 !important}.pb-xxl-1{padding-bottom:.25rem !important}.pb-xxl-2{padding-bottom:.5rem !important}.pb-xxl-3{padding-bottom:1rem !important}.pb-xxl-4{padding-bottom:1.5rem !important}.pb-xxl-5{padding-bottom:3rem !important}.ps-xxl-0{padding-left:0 !important}.ps-xxl-1{padding-left:.25rem !important}.ps-xxl-2{padding-left:.5rem !important}.ps-xxl-3{padding-left:1rem !important}.ps-xxl-4{padding-left:1.5rem !important}.ps-xxl-5{padding-left:3rem !important}.gap-xxl-0{gap:0 !important}.gap-xxl-1{gap:.25rem !important}.gap-xxl-2{gap:.5rem !important}.gap-xxl-3{gap:1rem !important}.gap-xxl-4{gap:1.5rem !important}.gap-xxl-5{gap:3rem !important}.row-gap-xxl-0{row-gap:0 !important}.row-gap-xxl-1{row-gap:.25rem !important}.row-gap-xxl-2{row-gap:.5rem !important}.row-gap-xxl-3{row-gap:1rem !important}.row-gap-xxl-4{row-gap:1.5rem !important}.row-gap-xxl-5{row-gap:3rem !important}.column-gap-xxl-0{column-gap:0 !important}.column-gap-xxl-1{column-gap:.25rem !important}.column-gap-xxl-2{column-gap:.5rem !important}.column-gap-xxl-3{column-gap:1rem !important}.column-gap-xxl-4{column-gap:1.5rem !important}.column-gap-xxl-5{column-gap:3rem !important}.text-xxl-start{text-align:left !important}.text-xxl-end{text-align:right !important}.text-xxl-center{text-align:center !important}}@media(min-width: 1200px){.fs-1{font-size:2.5rem !important}.fs-2{font-size:2rem !important}.fs-3{font-size:1.75rem !important}.fs-4{font-size:1.5rem !important}}@media print{.d-print-inline{display:inline !important}.d-print-inline-block{display:inline-block !important}.d-print-block{display:block !important}.d-print-grid{display:grid !important}.d-print-inline-grid{display:inline-grid !important}.d-print-table{display:table !important}.d-print-table-row{display:table-row !important}.d-print-table-cell{display:table-cell !important}.d-print-flex{display:flex !important}.d-print-inline-flex{display:inline-flex !important}.d-print-none{display:none !important}}.btn-icon{font-family:initial}`, "",{"version":3,"sources":["webpack://./src/assets/plugin.scss","webpack://./node_modules/bootstrap/scss/mixins/_banner.scss","webpack://./node_modules/bootstrap/scss/_root.scss","webpack://./node_modules/bootstrap/scss/vendor/_rfs.scss","webpack://./node_modules/bootstrap/scss/mixins/_color-mode.scss","webpack://./node_modules/bootstrap/scss/_reboot.scss","webpack://./node_modules/bootstrap/scss/_variables.scss","webpack://./node_modules/bootstrap/scss/mixins/_border-radius.scss","webpack://./node_modules/bootstrap/scss/_type.scss","webpack://./node_modules/bootstrap/scss/mixins/_lists.scss","webpack://./node_modules/bootstrap/scss/_images.scss","webpack://./node_modules/bootstrap/scss/mixins/_image.scss","webpack://./node_modules/bootstrap/scss/_containers.scss","webpack://./node_modules/bootstrap/scss/mixins/_container.scss","webpack://./node_modules/bootstrap/scss/mixins/_breakpoints.scss","webpack://./node_modules/bootstrap/scss/_grid.scss","webpack://./node_modules/bootstrap/scss/mixins/_grid.scss","webpack://./node_modules/bootstrap/scss/_tables.scss","webpack://./node_modules/bootstrap/scss/mixins/_table-variants.scss","webpack://./node_modules/bootstrap/scss/forms/_labels.scss","webpack://./node_modules/bootstrap/scss/forms/_form-text.scss","webpack://./node_modules/bootstrap/scss/forms/_form-control.scss","webpack://./node_modules/bootstrap/scss/mixins/_transition.scss","webpack://./node_modules/bootstrap/scss/mixins/_gradients.scss","webpack://./node_modules/bootstrap/scss/forms/_form-select.scss","webpack://./node_modules/bootstrap/scss/forms/_form-check.scss","webpack://./node_modules/bootstrap/scss/forms/_form-range.scss","webpack://./node_modules/bootstrap/scss/forms/_floating-labels.scss","webpack://./node_modules/bootstrap/scss/forms/_input-group.scss","webpack://./node_modules/bootstrap/scss/mixins/_forms.scss","webpack://./node_modules/bootstrap/scss/_buttons.scss","webpack://./node_modules/bootstrap/scss/mixins/_buttons.scss","webpack://./node_modules/bootstrap/scss/_transitions.scss","webpack://./node_modules/bootstrap/scss/_dropdown.scss","webpack://./node_modules/bootstrap/scss/mixins/_caret.scss","webpack://./node_modules/bootstrap/scss/_button-group.scss","webpack://./node_modules/bootstrap/scss/_nav.scss","webpack://./node_modules/bootstrap/scss/_navbar.scss","webpack://./node_modules/bootstrap/scss/_card.scss","webpack://./node_modules/bootstrap/scss/_accordion.scss","webpack://./node_modules/bootstrap/scss/_breadcrumb.scss","webpack://./node_modules/bootstrap/scss/_pagination.scss","webpack://./node_modules/bootstrap/scss/mixins/_pagination.scss","webpack://./node_modules/bootstrap/scss/_badge.scss","webpack://./node_modules/bootstrap/scss/_alert.scss","webpack://./node_modules/bootstrap/scss/_progress.scss","webpack://./node_modules/bootstrap/scss/_list-group.scss","webpack://./node_modules/bootstrap/scss/_close.scss","webpack://./node_modules/bootstrap/scss/_toasts.scss","webpack://./node_modules/bootstrap/scss/_modal.scss","webpack://./node_modules/bootstrap/scss/mixins/_backdrop.scss","webpack://./node_modules/bootstrap/scss/_tooltip.scss","webpack://./node_modules/bootstrap/scss/mixins/_reset-text.scss","webpack://./node_modules/bootstrap/scss/_popover.scss","webpack://./node_modules/bootstrap/scss/_carousel.scss","webpack://./node_modules/bootstrap/scss/mixins/_clearfix.scss","webpack://./node_modules/bootstrap/scss/_spinners.scss","webpack://./node_modules/bootstrap/scss/_offcanvas.scss","webpack://./node_modules/bootstrap/scss/_placeholders.scss","webpack://./node_modules/bootstrap/scss/helpers/_color-bg.scss","webpack://./node_modules/bootstrap/scss/helpers/_colored-links.scss","webpack://./node_modules/bootstrap/scss/helpers/_focus-ring.scss","webpack://./node_modules/bootstrap/scss/helpers/_icon-link.scss","webpack://./node_modules/bootstrap/scss/helpers/_ratio.scss","webpack://./node_modules/bootstrap/scss/helpers/_position.scss","webpack://./node_modules/bootstrap/scss/helpers/_stacks.scss","webpack://./node_modules/bootstrap/scss/helpers/_visually-hidden.scss","webpack://./node_modules/bootstrap/scss/mixins/_visually-hidden.scss","webpack://./node_modules/bootstrap/scss/helpers/_stretched-link.scss","webpack://./node_modules/bootstrap/scss/helpers/_text-truncation.scss","webpack://./node_modules/bootstrap/scss/mixins/_text-truncate.scss","webpack://./node_modules/bootstrap/scss/helpers/_vr.scss","webpack://./node_modules/bootstrap/scss/mixins/_utilities.scss","webpack://./node_modules/bootstrap/scss/utilities/_api.scss"],"names":[],"mappings":"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","sourcesContent":["@import '~bootstrap/scss/bootstrap';\n/*\n\nfix html entity icons in bootstrap button\n\n*/\n.btn-icon {\n  font-family: initial;\n}\n","@mixin bsBanner($file) {\n  /*!\n   * Bootstrap #{$file} v5.3.2 (https://getbootstrap.com/)\n   * Copyright 2011-2023 The Bootstrap Authors\n   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)\n   */\n}\n",":root,\n[data-bs-theme=\"light\"] {\n  // Note: Custom variable values only support SassScript inside `#{}`.\n\n  // Colors\n  //\n  // Generate palettes for full colors, grays, and theme colors.\n\n  @each $color, $value in $colors {\n    --#{$prefix}#{$color}: #{$value};\n  }\n\n  @each $color, $value in $grays {\n    --#{$prefix}gray-#{$color}: #{$value};\n  }\n\n  @each $color, $value in $theme-colors {\n    --#{$prefix}#{$color}: #{$value};\n  }\n\n  @each $color, $value in $theme-colors-rgb {\n    --#{$prefix}#{$color}-rgb: #{$value};\n  }\n\n  @each $color, $value in $theme-colors-text {\n    --#{$prefix}#{$color}-text-emphasis: #{$value};\n  }\n\n  @each $color, $value in $theme-colors-bg-subtle {\n    --#{$prefix}#{$color}-bg-subtle: #{$value};\n  }\n\n  @each $color, $value in $theme-colors-border-subtle {\n    --#{$prefix}#{$color}-border-subtle: #{$value};\n  }\n\n  --#{$prefix}white-rgb: #{to-rgb($white)};\n  --#{$prefix}black-rgb: #{to-rgb($black)};\n\n  // Fonts\n\n  // Note: Use `inspect` for lists so that quoted items keep the quotes.\n  // See https://github.com/sass/sass/issues/2383#issuecomment-336349172\n  --#{$prefix}font-sans-serif: #{inspect($font-family-sans-serif)};\n  --#{$prefix}font-monospace: #{inspect($font-family-monospace)};\n  --#{$prefix}gradient: #{$gradient};\n\n  // Root and body\n  // scss-docs-start root-body-variables\n  @if $font-size-root != null {\n    --#{$prefix}root-font-size: #{$font-size-root};\n  }\n  --#{$prefix}body-font-family: #{inspect($font-family-base)};\n  @include rfs($font-size-base, --#{$prefix}body-font-size);\n  --#{$prefix}body-font-weight: #{$font-weight-base};\n  --#{$prefix}body-line-height: #{$line-height-base};\n  @if $body-text-align != null {\n    --#{$prefix}body-text-align: #{$body-text-align};\n  }\n\n  --#{$prefix}body-color: #{$body-color};\n  --#{$prefix}body-color-rgb: #{to-rgb($body-color)};\n  --#{$prefix}body-bg: #{$body-bg};\n  --#{$prefix}body-bg-rgb: #{to-rgb($body-bg)};\n\n  --#{$prefix}emphasis-color: #{$body-emphasis-color};\n  --#{$prefix}emphasis-color-rgb: #{to-rgb($body-emphasis-color)};\n\n  --#{$prefix}secondary-color: #{$body-secondary-color};\n  --#{$prefix}secondary-color-rgb: #{to-rgb($body-secondary-color)};\n  --#{$prefix}secondary-bg: #{$body-secondary-bg};\n  --#{$prefix}secondary-bg-rgb: #{to-rgb($body-secondary-bg)};\n\n  --#{$prefix}tertiary-color: #{$body-tertiary-color};\n  --#{$prefix}tertiary-color-rgb: #{to-rgb($body-tertiary-color)};\n  --#{$prefix}tertiary-bg: #{$body-tertiary-bg};\n  --#{$prefix}tertiary-bg-rgb: #{to-rgb($body-tertiary-bg)};\n  // scss-docs-end root-body-variables\n\n  --#{$prefix}heading-color: #{$headings-color};\n\n  --#{$prefix}link-color: #{$link-color};\n  --#{$prefix}link-color-rgb: #{to-rgb($link-color)};\n  --#{$prefix}link-decoration: #{$link-decoration};\n\n  --#{$prefix}link-hover-color: #{$link-hover-color};\n  --#{$prefix}link-hover-color-rgb: #{to-rgb($link-hover-color)};\n\n  @if $link-hover-decoration != null {\n    --#{$prefix}link-hover-decoration: #{$link-hover-decoration};\n  }\n\n  --#{$prefix}code-color: #{$code-color};\n  --#{$prefix}highlight-color: #{$mark-color};\n  --#{$prefix}highlight-bg: #{$mark-bg};\n\n  // scss-docs-start root-border-var\n  --#{$prefix}border-width: #{$border-width};\n  --#{$prefix}border-style: #{$border-style};\n  --#{$prefix}border-color: #{$border-color};\n  --#{$prefix}border-color-translucent: #{$border-color-translucent};\n\n  --#{$prefix}border-radius: #{$border-radius};\n  --#{$prefix}border-radius-sm: #{$border-radius-sm};\n  --#{$prefix}border-radius-lg: #{$border-radius-lg};\n  --#{$prefix}border-radius-xl: #{$border-radius-xl};\n  --#{$prefix}border-radius-xxl: #{$border-radius-xxl};\n  --#{$prefix}border-radius-2xl: var(--#{$prefix}border-radius-xxl); // Deprecated in v5.3.0 for consistency\n  --#{$prefix}border-radius-pill: #{$border-radius-pill};\n  // scss-docs-end root-border-var\n\n  --#{$prefix}box-shadow: #{$box-shadow};\n  --#{$prefix}box-shadow-sm: #{$box-shadow-sm};\n  --#{$prefix}box-shadow-lg: #{$box-shadow-lg};\n  --#{$prefix}box-shadow-inset: #{$box-shadow-inset};\n\n  // Focus styles\n  // scss-docs-start root-focus-variables\n  --#{$prefix}focus-ring-width: #{$focus-ring-width};\n  --#{$prefix}focus-ring-opacity: #{$focus-ring-opacity};\n  --#{$prefix}focus-ring-color: #{$focus-ring-color};\n  // scss-docs-end root-focus-variables\n\n  // scss-docs-start root-form-validation-variables\n  --#{$prefix}form-valid-color: #{$form-valid-color};\n  --#{$prefix}form-valid-border-color: #{$form-valid-border-color};\n  --#{$prefix}form-invalid-color: #{$form-invalid-color};\n  --#{$prefix}form-invalid-border-color: #{$form-invalid-border-color};\n  // scss-docs-end root-form-validation-variables\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark, true) {\n    color-scheme: dark;\n\n    // scss-docs-start root-dark-mode-vars\n    --#{$prefix}body-color: #{$body-color-dark};\n    --#{$prefix}body-color-rgb: #{to-rgb($body-color-dark)};\n    --#{$prefix}body-bg: #{$body-bg-dark};\n    --#{$prefix}body-bg-rgb: #{to-rgb($body-bg-dark)};\n\n    --#{$prefix}emphasis-color: #{$body-emphasis-color-dark};\n    --#{$prefix}emphasis-color-rgb: #{to-rgb($body-emphasis-color-dark)};\n\n    --#{$prefix}secondary-color: #{$body-secondary-color-dark};\n    --#{$prefix}secondary-color-rgb: #{to-rgb($body-secondary-color-dark)};\n    --#{$prefix}secondary-bg: #{$body-secondary-bg-dark};\n    --#{$prefix}secondary-bg-rgb: #{to-rgb($body-secondary-bg-dark)};\n\n    --#{$prefix}tertiary-color: #{$body-tertiary-color-dark};\n    --#{$prefix}tertiary-color-rgb: #{to-rgb($body-tertiary-color-dark)};\n    --#{$prefix}tertiary-bg: #{$body-tertiary-bg-dark};\n    --#{$prefix}tertiary-bg-rgb: #{to-rgb($body-tertiary-bg-dark)};\n\n    @each $color, $value in $theme-colors-text-dark {\n      --#{$prefix}#{$color}-text-emphasis: #{$value};\n    }\n\n    @each $color, $value in $theme-colors-bg-subtle-dark {\n      --#{$prefix}#{$color}-bg-subtle: #{$value};\n    }\n\n    @each $color, $value in $theme-colors-border-subtle-dark {\n      --#{$prefix}#{$color}-border-subtle: #{$value};\n    }\n\n    --#{$prefix}heading-color: #{$headings-color-dark};\n\n    --#{$prefix}link-color: #{$link-color-dark};\n    --#{$prefix}link-hover-color: #{$link-hover-color-dark};\n    --#{$prefix}link-color-rgb: #{to-rgb($link-color-dark)};\n    --#{$prefix}link-hover-color-rgb: #{to-rgb($link-hover-color-dark)};\n\n    --#{$prefix}code-color: #{$code-color-dark};\n    --#{$prefix}highlight-color: #{$mark-color-dark};\n    --#{$prefix}highlight-bg: #{$mark-bg-dark};\n\n    --#{$prefix}border-color: #{$border-color-dark};\n    --#{$prefix}border-color-translucent: #{$border-color-translucent-dark};\n\n    --#{$prefix}form-valid-color: #{$form-valid-color-dark};\n    --#{$prefix}form-valid-border-color: #{$form-valid-border-color-dark};\n    --#{$prefix}form-invalid-color: #{$form-invalid-color-dark};\n    --#{$prefix}form-invalid-border-color: #{$form-invalid-border-color-dark};\n    // scss-docs-end root-dark-mode-vars\n  }\n}\n","// stylelint-disable scss/dimension-no-non-numeric-values\n\n// SCSS RFS mixin\n//\n// Automated responsive values for font sizes, paddings, margins and much more\n//\n// Licensed under MIT (https://github.com/twbs/rfs/blob/main/LICENSE)\n\n// Configuration\n\n// Base value\n$rfs-base-value: 1.25rem !default;\n$rfs-unit: rem !default;\n\n@if $rfs-unit != rem and $rfs-unit != px {\n  @error \"`#{$rfs-unit}` is not a valid unit for $rfs-unit. Use `px` or `rem`.\";\n}\n\n// Breakpoint at where values start decreasing if screen width is smaller\n$rfs-breakpoint: 1200px !default;\n$rfs-breakpoint-unit: px !default;\n\n@if $rfs-breakpoint-unit != px and $rfs-breakpoint-unit != em and $rfs-breakpoint-unit != rem {\n  @error \"`#{$rfs-breakpoint-unit}` is not a valid unit for $rfs-breakpoint-unit. Use `px`, `em` or `rem`.\";\n}\n\n// Resize values based on screen height and width\n$rfs-two-dimensional: false !default;\n\n// Factor of decrease\n$rfs-factor: 10 !default;\n\n@if type-of($rfs-factor) != number or $rfs-factor <= 1 {\n  @error \"`#{$rfs-factor}` is not a valid  $rfs-factor, it must be greater than 1.\";\n}\n\n// Mode. Possibilities: \"min-media-query\", \"max-media-query\"\n$rfs-mode: min-media-query !default;\n\n// Generate enable or disable classes. Possibilities: false, \"enable\" or \"disable\"\n$rfs-class: false !default;\n\n// 1 rem = $rfs-rem-value px\n$rfs-rem-value: 16 !default;\n\n// Safari iframe resize bug: https://github.com/twbs/rfs/issues/14\n$rfs-safari-iframe-resize-bug-fix: false !default;\n\n// Disable RFS by setting $enable-rfs to false\n$enable-rfs: true !default;\n\n// Cache $rfs-base-value unit\n$rfs-base-value-unit: unit($rfs-base-value);\n\n@function divide($dividend, $divisor, $precision: 10) {\n  $sign: if($dividend > 0 and $divisor > 0 or $dividend < 0 and $divisor < 0, 1, -1);\n  $dividend: abs($dividend);\n  $divisor: abs($divisor);\n  @if $dividend == 0 {\n    @return 0;\n  }\n  @if $divisor == 0 {\n    @error \"Cannot divide by 0\";\n  }\n  $remainder: $dividend;\n  $result: 0;\n  $factor: 10;\n  @while ($remainder > 0 and $precision >= 0) {\n    $quotient: 0;\n    @while ($remainder >= $divisor) {\n      $remainder: $remainder - $divisor;\n      $quotient: $quotient + 1;\n    }\n    $result: $result * 10 + $quotient;\n    $factor: $factor * .1;\n    $remainder: $remainder * 10;\n    $precision: $precision - 1;\n    @if ($precision < 0 and $remainder >= $divisor * 5) {\n      $result: $result + 1;\n    }\n  }\n  $result: $result * $factor * $sign;\n  $dividend-unit: unit($dividend);\n  $divisor-unit: unit($divisor);\n  $unit-map: (\n    \"px\": 1px,\n    \"rem\": 1rem,\n    \"em\": 1em,\n    \"%\": 1%\n  );\n  @if ($dividend-unit != $divisor-unit and map-has-key($unit-map, $dividend-unit)) {\n    $result: $result * map-get($unit-map, $dividend-unit);\n  }\n  @return $result;\n}\n\n// Remove px-unit from $rfs-base-value for calculations\n@if $rfs-base-value-unit == px {\n  $rfs-base-value: divide($rfs-base-value, $rfs-base-value * 0 + 1);\n}\n@else if $rfs-base-value-unit == rem {\n  $rfs-base-value: divide($rfs-base-value, divide($rfs-base-value * 0 + 1, $rfs-rem-value));\n}\n\n// Cache $rfs-breakpoint unit to prevent multiple calls\n$rfs-breakpoint-unit-cache: unit($rfs-breakpoint);\n\n// Remove unit from $rfs-breakpoint for calculations\n@if $rfs-breakpoint-unit-cache == px {\n  $rfs-breakpoint: divide($rfs-breakpoint, $rfs-breakpoint * 0 + 1);\n}\n@else if $rfs-breakpoint-unit-cache == rem or $rfs-breakpoint-unit-cache == \"em\" {\n  $rfs-breakpoint: divide($rfs-breakpoint, divide($rfs-breakpoint * 0 + 1, $rfs-rem-value));\n}\n\n// Calculate the media query value\n$rfs-mq-value: if($rfs-breakpoint-unit == px, #{$rfs-breakpoint}px, #{divide($rfs-breakpoint, $rfs-rem-value)}#{$rfs-breakpoint-unit});\n$rfs-mq-property-width: if($rfs-mode == max-media-query, max-width, min-width);\n$rfs-mq-property-height: if($rfs-mode == max-media-query, max-height, min-height);\n\n// Internal mixin used to determine which media query needs to be used\n@mixin _rfs-media-query {\n  @if $rfs-two-dimensional {\n    @if $rfs-mode == max-media-query {\n      @media (#{$rfs-mq-property-width}: #{$rfs-mq-value}), (#{$rfs-mq-property-height}: #{$rfs-mq-value}) {\n        @content;\n      }\n    }\n    @else {\n      @media (#{$rfs-mq-property-width}: #{$rfs-mq-value}) and (#{$rfs-mq-property-height}: #{$rfs-mq-value}) {\n        @content;\n      }\n    }\n  }\n  @else {\n    @media (#{$rfs-mq-property-width}: #{$rfs-mq-value}) {\n      @content;\n    }\n  }\n}\n\n// Internal mixin that adds disable classes to the selector if needed.\n@mixin _rfs-rule {\n  @if $rfs-class == disable and $rfs-mode == max-media-query {\n    // Adding an extra class increases specificity, which prevents the media query to override the property\n    &,\n    .disable-rfs &,\n    &.disable-rfs {\n      @content;\n    }\n  }\n  @else if $rfs-class == enable and $rfs-mode == min-media-query {\n    .enable-rfs &,\n    &.enable-rfs {\n      @content;\n    }\n  } @else {\n    @content;\n  }\n}\n\n// Internal mixin that adds enable classes to the selector if needed.\n@mixin _rfs-media-query-rule {\n\n  @if $rfs-class == enable {\n    @if $rfs-mode == min-media-query {\n      @content;\n    }\n\n    @include _rfs-media-query () {\n      .enable-rfs &,\n      &.enable-rfs {\n        @content;\n      }\n    }\n  }\n  @else {\n    @if $rfs-class == disable and $rfs-mode == min-media-query {\n      .disable-rfs &,\n      &.disable-rfs {\n        @content;\n      }\n    }\n    @include _rfs-media-query () {\n      @content;\n    }\n  }\n}\n\n// Helper function to get the formatted non-responsive value\n@function rfs-value($values) {\n  // Convert to list\n  $values: if(type-of($values) != list, ($values,), $values);\n\n  $val: \"\";\n\n  // Loop over each value and calculate value\n  @each $value in $values {\n    @if $value == 0 {\n      $val: $val + \" 0\";\n    }\n    @else {\n      // Cache $value unit\n      $unit: if(type-of($value) == \"number\", unit($value), false);\n\n      @if $unit == px {\n        // Convert to rem if needed\n        $val: $val + \" \" + if($rfs-unit == rem, #{divide($value, $value * 0 + $rfs-rem-value)}rem, $value);\n      }\n      @else if $unit == rem {\n        // Convert to px if needed\n        $val: $val + \" \" + if($rfs-unit == px, #{divide($value, $value * 0 + 1) * $rfs-rem-value}px, $value);\n      } @else {\n        // If $value isn't a number (like inherit) or $value has a unit (not px or rem, like 1.5em) or $ is 0, just print the value\n        $val: $val + \" \" + $value;\n      }\n    }\n  }\n\n  // Remove first space\n  @return unquote(str-slice($val, 2));\n}\n\n// Helper function to get the responsive value calculated by RFS\n@function rfs-fluid-value($values) {\n  // Convert to list\n  $values: if(type-of($values) != list, ($values,), $values);\n\n  $val: \"\";\n\n  // Loop over each value and calculate value\n  @each $value in $values {\n    @if $value == 0 {\n      $val: $val + \" 0\";\n    } @else {\n      // Cache $value unit\n      $unit: if(type-of($value) == \"number\", unit($value), false);\n\n      // If $value isn't a number (like inherit) or $value has a unit (not px or rem, like 1.5em) or $ is 0, just print the value\n      @if not $unit or $unit != px and $unit != rem {\n        $val: $val + \" \" + $value;\n      } @else {\n        // Remove unit from $value for calculations\n        $value: divide($value, $value * 0 + if($unit == px, 1, divide(1, $rfs-rem-value)));\n\n        // Only add the media query if the value is greater than the minimum value\n        @if abs($value) <= $rfs-base-value or not $enable-rfs {\n          $val: $val + \" \" + if($rfs-unit == rem, #{divide($value, $rfs-rem-value)}rem, #{$value}px);\n        }\n        @else {\n          // Calculate the minimum value\n          $value-min: $rfs-base-value + divide(abs($value) - $rfs-base-value, $rfs-factor);\n\n          // Calculate difference between $value and the minimum value\n          $value-diff: abs($value) - $value-min;\n\n          // Base value formatting\n          $min-width: if($rfs-unit == rem, #{divide($value-min, $rfs-rem-value)}rem, #{$value-min}px);\n\n          // Use negative value if needed\n          $min-width: if($value < 0, -$min-width, $min-width);\n\n          // Use `vmin` if two-dimensional is enabled\n          $variable-unit: if($rfs-two-dimensional, vmin, vw);\n\n          // Calculate the variable width between 0 and $rfs-breakpoint\n          $variable-width: #{divide($value-diff * 100, $rfs-breakpoint)}#{$variable-unit};\n\n          // Return the calculated value\n          $val: $val + \" calc(\" + $min-width + if($value < 0, \" - \", \" + \") + $variable-width + \")\";\n        }\n      }\n    }\n  }\n\n  // Remove first space\n  @return unquote(str-slice($val, 2));\n}\n\n// RFS mixin\n@mixin rfs($values, $property: font-size) {\n  @if $values != null {\n    $val: rfs-value($values);\n    $fluid-val: rfs-fluid-value($values);\n\n    // Do not print the media query if responsive & non-responsive values are the same\n    @if $val == $fluid-val {\n      #{$property}: $val;\n    }\n    @else {\n      @include _rfs-rule () {\n        #{$property}: if($rfs-mode == max-media-query, $val, $fluid-val);\n\n        // Include safari iframe resize fix if needed\n        min-width: if($rfs-safari-iframe-resize-bug-fix, (0 * 1vw), null);\n      }\n\n      @include _rfs-media-query-rule () {\n        #{$property}: if($rfs-mode == max-media-query, $fluid-val, $val);\n      }\n    }\n  }\n}\n\n// Shorthand helper mixins\n@mixin font-size($value) {\n  @include rfs($value);\n}\n\n@mixin padding($value) {\n  @include rfs($value, padding);\n}\n\n@mixin padding-top($value) {\n  @include rfs($value, padding-top);\n}\n\n@mixin padding-right($value) {\n  @include rfs($value, padding-right);\n}\n\n@mixin padding-bottom($value) {\n  @include rfs($value, padding-bottom);\n}\n\n@mixin padding-left($value) {\n  @include rfs($value, padding-left);\n}\n\n@mixin margin($value) {\n  @include rfs($value, margin);\n}\n\n@mixin margin-top($value) {\n  @include rfs($value, margin-top);\n}\n\n@mixin margin-right($value) {\n  @include rfs($value, margin-right);\n}\n\n@mixin margin-bottom($value) {\n  @include rfs($value, margin-bottom);\n}\n\n@mixin margin-left($value) {\n  @include rfs($value, margin-left);\n}\n","// scss-docs-start color-mode-mixin\n@mixin color-mode($mode: light, $root: false) {\n  @if $color-mode-type == \"media-query\" {\n    @if $root == true {\n      @media (prefers-color-scheme: $mode) {\n        :root {\n          @content;\n        }\n      }\n    } @else {\n      @media (prefers-color-scheme: $mode) {\n        @content;\n      }\n    }\n  } @else {\n    [data-bs-theme=\"#{$mode}\"] {\n      @content;\n    }\n  }\n}\n// scss-docs-end color-mode-mixin\n","// stylelint-disable declaration-no-important, selector-no-qualifying-type, property-no-vendor-prefix\n\n\n// Reboot\n//\n// Normalization of HTML elements, manually forked from Normalize.css to remove\n// styles targeting irrelevant browsers while applying new styles.\n//\n// Normalize is licensed MIT. https://github.com/necolas/normalize.css\n\n\n// Document\n//\n// Change from `box-sizing: content-box` so that `width` is not affected by `padding` or `border`.\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n\n// Root\n//\n// Ability to the value of the root font sizes, affecting the value of `rem`.\n// null by default, thus nothing is generated.\n\n:root {\n  @if $font-size-root != null {\n    @include font-size(var(--#{$prefix}root-font-size));\n  }\n\n  @if $enable-smooth-scroll {\n    @media (prefers-reduced-motion: no-preference) {\n      scroll-behavior: smooth;\n    }\n  }\n}\n\n\n// Body\n//\n// 1. Remove the margin in all browsers.\n// 2. As a best practice, apply a default `background-color`.\n// 3. Prevent adjustments of font size after orientation changes in iOS.\n// 4. Change the default tap highlight to be completely transparent in iOS.\n\n// scss-docs-start reboot-body-rules\nbody {\n  margin: 0; // 1\n  font-family: var(--#{$prefix}body-font-family);\n  @include font-size(var(--#{$prefix}body-font-size));\n  font-weight: var(--#{$prefix}body-font-weight);\n  line-height: var(--#{$prefix}body-line-height);\n  color: var(--#{$prefix}body-color);\n  text-align: var(--#{$prefix}body-text-align);\n  background-color: var(--#{$prefix}body-bg); // 2\n  -webkit-text-size-adjust: 100%; // 3\n  -webkit-tap-highlight-color: rgba($black, 0); // 4\n}\n// scss-docs-end reboot-body-rules\n\n\n// Content grouping\n//\n// 1. Reset Firefox's gray color\n\nhr {\n  margin: $hr-margin-y 0;\n  color: $hr-color; // 1\n  border: 0;\n  border-top: $hr-border-width solid $hr-border-color;\n  opacity: $hr-opacity;\n}\n\n\n// Typography\n//\n// 1. Remove top margins from headings\n//    By default, `<h1>`-`<h6>` all receive top and bottom margins. We nuke the top\n//    margin for easier control within type scales as it avoids margin collapsing.\n\n%heading {\n  margin-top: 0; // 1\n  margin-bottom: $headings-margin-bottom;\n  font-family: $headings-font-family;\n  font-style: $headings-font-style;\n  font-weight: $headings-font-weight;\n  line-height: $headings-line-height;\n  color: var(--#{$prefix}heading-color);\n}\n\nh1 {\n  @extend %heading;\n  @include font-size($h1-font-size);\n}\n\nh2 {\n  @extend %heading;\n  @include font-size($h2-font-size);\n}\n\nh3 {\n  @extend %heading;\n  @include font-size($h3-font-size);\n}\n\nh4 {\n  @extend %heading;\n  @include font-size($h4-font-size);\n}\n\nh5 {\n  @extend %heading;\n  @include font-size($h5-font-size);\n}\n\nh6 {\n  @extend %heading;\n  @include font-size($h6-font-size);\n}\n\n\n// Reset margins on paragraphs\n//\n// Similarly, the top margin on `<p>`s get reset. However, we also reset the\n// bottom margin to use `rem` units instead of `em`.\n\np {\n  margin-top: 0;\n  margin-bottom: $paragraph-margin-bottom;\n}\n\n\n// Abbreviations\n//\n// 1. Add the correct text decoration in Chrome, Edge, Opera, and Safari.\n// 2. Add explicit cursor to indicate changed behavior.\n// 3. Prevent the text-decoration to be skipped.\n\nabbr[title] {\n  text-decoration: underline dotted; // 1\n  cursor: help; // 2\n  text-decoration-skip-ink: none; // 3\n}\n\n\n// Address\n\naddress {\n  margin-bottom: 1rem;\n  font-style: normal;\n  line-height: inherit;\n}\n\n\n// Lists\n\nol,\nul {\n  padding-left: 2rem;\n}\n\nol,\nul,\ndl {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\nol ol,\nul ul,\nol ul,\nul ol {\n  margin-bottom: 0;\n}\n\ndt {\n  font-weight: $dt-font-weight;\n}\n\n// 1. Undo browser default\n\ndd {\n  margin-bottom: .5rem;\n  margin-left: 0; // 1\n}\n\n\n// Blockquote\n\nblockquote {\n  margin: 0 0 1rem;\n}\n\n\n// Strong\n//\n// Add the correct font weight in Chrome, Edge, and Safari\n\nb,\nstrong {\n  font-weight: $font-weight-bolder;\n}\n\n\n// Small\n//\n// Add the correct font size in all browsers\n\nsmall {\n  @include font-size($small-font-size);\n}\n\n\n// Mark\n\nmark {\n  padding: $mark-padding;\n  color: var(--#{$prefix}highlight-color);\n  background-color: var(--#{$prefix}highlight-bg);\n}\n\n\n// Sub and Sup\n//\n// Prevent `sub` and `sup` elements from affecting the line height in\n// all browsers.\n\nsub,\nsup {\n  position: relative;\n  @include font-size($sub-sup-font-size);\n  line-height: 0;\n  vertical-align: baseline;\n}\n\nsub { bottom: -.25em; }\nsup { top: -.5em; }\n\n\n// Links\n\na {\n  color: rgba(var(--#{$prefix}link-color-rgb), var(--#{$prefix}link-opacity, 1));\n  text-decoration: $link-decoration;\n\n  &:hover {\n    --#{$prefix}link-color-rgb: var(--#{$prefix}link-hover-color-rgb);\n    text-decoration: $link-hover-decoration;\n  }\n}\n\n// And undo these styles for placeholder links/named anchors (without href).\n// It would be more straightforward to just use a[href] in previous block, but that\n// causes specificity issues in many other styles that are too complex to fix.\n// See https://github.com/twbs/bootstrap/issues/19402\n\na:not([href]):not([class]) {\n  &,\n  &:hover {\n    color: inherit;\n    text-decoration: none;\n  }\n}\n\n\n// Code\n\npre,\ncode,\nkbd,\nsamp {\n  font-family: $font-family-code;\n  @include font-size(1em); // Correct the odd `em` font sizing in all browsers.\n}\n\n// 1. Remove browser default top margin\n// 2. Reset browser default of `1em` to use `rem`s\n// 3. Don't allow content to break outside\n\npre {\n  display: block;\n  margin-top: 0; // 1\n  margin-bottom: 1rem; // 2\n  overflow: auto; // 3\n  @include font-size($code-font-size);\n  color: $pre-color;\n\n  // Account for some code outputs that place code tags in pre tags\n  code {\n    @include font-size(inherit);\n    color: inherit;\n    word-break: normal;\n  }\n}\n\ncode {\n  @include font-size($code-font-size);\n  color: var(--#{$prefix}code-color);\n  word-wrap: break-word;\n\n  // Streamline the style when inside anchors to avoid broken underline and more\n  a > & {\n    color: inherit;\n  }\n}\n\nkbd {\n  padding: $kbd-padding-y $kbd-padding-x;\n  @include font-size($kbd-font-size);\n  color: $kbd-color;\n  background-color: $kbd-bg;\n  @include border-radius($border-radius-sm);\n\n  kbd {\n    padding: 0;\n    @include font-size(1em);\n    font-weight: $nested-kbd-font-weight;\n  }\n}\n\n\n// Figures\n//\n// Apply a consistent margin strategy (matches our type styles).\n\nfigure {\n  margin: 0 0 1rem;\n}\n\n\n// Images and content\n\nimg,\nsvg {\n  vertical-align: middle;\n}\n\n\n// Tables\n//\n// Prevent double borders\n\ntable {\n  caption-side: bottom;\n  border-collapse: collapse;\n}\n\ncaption {\n  padding-top: $table-cell-padding-y;\n  padding-bottom: $table-cell-padding-y;\n  color: $table-caption-color;\n  text-align: left;\n}\n\n// 1. Removes font-weight bold by inheriting\n// 2. Matches default `<td>` alignment by inheriting `text-align`.\n// 3. Fix alignment for Safari\n\nth {\n  font-weight: $table-th-font-weight; // 1\n  text-align: inherit; // 2\n  text-align: -webkit-match-parent; // 3\n}\n\nthead,\ntbody,\ntfoot,\ntr,\ntd,\nth {\n  border-color: inherit;\n  border-style: solid;\n  border-width: 0;\n}\n\n\n// Forms\n//\n// 1. Allow labels to use `margin` for spacing.\n\nlabel {\n  display: inline-block; // 1\n}\n\n// Remove the default `border-radius` that macOS Chrome adds.\n// See https://github.com/twbs/bootstrap/issues/24093\n\nbutton {\n  // stylelint-disable-next-line property-disallowed-list\n  border-radius: 0;\n}\n\n// Explicitly remove focus outline in Chromium when it shouldn't be\n// visible (e.g. as result of mouse click or touch tap). It already\n// should be doing this automatically, but seems to currently be\n// confused and applies its very visible two-tone outline anyway.\n\nbutton:focus:not(:focus-visible) {\n  outline: 0;\n}\n\n// 1. Remove the margin in Firefox and Safari\n\ninput,\nbutton,\nselect,\noptgroup,\ntextarea {\n  margin: 0; // 1\n  font-family: inherit;\n  @include font-size(inherit);\n  line-height: inherit;\n}\n\n// Remove the inheritance of text transform in Firefox\nbutton,\nselect {\n  text-transform: none;\n}\n// Set the cursor for non-`<button>` buttons\n//\n// Details at https://github.com/twbs/bootstrap/pull/30562\n[role=\"button\"] {\n  cursor: pointer;\n}\n\nselect {\n  // Remove the inheritance of word-wrap in Safari.\n  // See https://github.com/twbs/bootstrap/issues/24990\n  word-wrap: normal;\n\n  // Undo the opacity change from Chrome\n  &:disabled {\n    opacity: 1;\n  }\n}\n\n// Remove the dropdown arrow only from text type inputs built with datalists in Chrome.\n// See https://stackoverflow.com/a/54997118\n\n[list]:not([type=\"date\"]):not([type=\"datetime-local\"]):not([type=\"month\"]):not([type=\"week\"]):not([type=\"time\"])::-webkit-calendar-picker-indicator {\n  display: none !important;\n}\n\n// 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n//    controls in Android 4.\n// 2. Correct the inability to style clickable types in iOS and Safari.\n// 3. Opinionated: add \"hand\" cursor to non-disabled button elements.\n\nbutton,\n[type=\"button\"], // 1\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button; // 2\n\n  @if $enable-button-pointers {\n    &:not(:disabled) {\n      cursor: pointer; // 3\n    }\n  }\n}\n\n// Remove inner border and padding from Firefox, but don't restore the outline like Normalize.\n\n::-moz-focus-inner {\n  padding: 0;\n  border-style: none;\n}\n\n// 1. Textareas should really only resize vertically so they don't break their (horizontal) containers.\n\ntextarea {\n  resize: vertical; // 1\n}\n\n// 1. Browsers set a default `min-width: min-content;` on fieldsets,\n//    unlike e.g. `<div>`s, which have `min-width: 0;` by default.\n//    So we reset that to ensure fieldsets behave more like a standard block element.\n//    See https://github.com/twbs/bootstrap/issues/12359\n//    and https://html.spec.whatwg.org/multipage/#the-fieldset-and-legend-elements\n// 2. Reset the default outline behavior of fieldsets so they don't affect page layout.\n\nfieldset {\n  min-width: 0; // 1\n  padding: 0; // 2\n  margin: 0; // 2\n  border: 0; // 2\n}\n\n// 1. By using `float: left`, the legend will behave like a block element.\n//    This way the border of a fieldset wraps around the legend if present.\n// 2. Fix wrapping bug.\n//    See https://github.com/twbs/bootstrap/issues/29712\n\nlegend {\n  float: left; // 1\n  width: 100%;\n  padding: 0;\n  margin-bottom: $legend-margin-bottom;\n  @include font-size($legend-font-size);\n  font-weight: $legend-font-weight;\n  line-height: inherit;\n\n  + * {\n    clear: left; // 2\n  }\n}\n\n// Fix height of inputs with a type of datetime-local, date, month, week, or time\n// See https://github.com/twbs/bootstrap/issues/18842\n\n::-webkit-datetime-edit-fields-wrapper,\n::-webkit-datetime-edit-text,\n::-webkit-datetime-edit-minute,\n::-webkit-datetime-edit-hour-field,\n::-webkit-datetime-edit-day-field,\n::-webkit-datetime-edit-month-field,\n::-webkit-datetime-edit-year-field {\n  padding: 0;\n}\n\n::-webkit-inner-spin-button {\n  height: auto;\n}\n\n// 1. This overrides the extra rounded corners on search inputs in iOS so that our\n//    `.form-control` class can properly style them. Note that this cannot simply\n//    be added to `.form-control` as it's not specific enough. For details, see\n//    https://github.com/twbs/bootstrap/issues/11586.\n// 2. Correct the outline style in Safari.\n\n[type=\"search\"] {\n  -webkit-appearance: textfield; // 1\n  outline-offset: -2px; // 2\n}\n\n// 1. A few input types should stay LTR\n// See https://rtlstyling.com/posts/rtl-styling#form-inputs\n// 2. RTL only output\n// See https://rtlcss.com/learn/usage-guide/control-directives/#raw\n\n/* rtl:raw:\n[type=\"tel\"],\n[type=\"url\"],\n[type=\"email\"],\n[type=\"number\"] {\n  direction: ltr;\n}\n*/\n\n// Remove the inner padding in Chrome and Safari on macOS.\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n// Remove padding around color pickers in webkit browsers\n\n::-webkit-color-swatch-wrapper {\n  padding: 0;\n}\n\n\n// 1. Inherit font family and line height for file input buttons\n// 2. Correct the inability to style clickable types in iOS and Safari.\n\n::file-selector-button {\n  font: inherit; // 1\n  -webkit-appearance: button; // 2\n}\n\n// Correct element displays\n\noutput {\n  display: inline-block;\n}\n\n// Remove border from iframe\n\niframe {\n  border: 0;\n}\n\n// Summary\n//\n// 1. Add the correct display in all browsers\n\nsummary {\n  display: list-item; // 1\n  cursor: pointer;\n}\n\n\n// Progress\n//\n// Add the correct vertical alignment in Chrome, Firefox, and Opera.\n\nprogress {\n  vertical-align: baseline;\n}\n\n\n// Hidden attribute\n//\n// Always hide an element with the `hidden` HTML attribute.\n\n[hidden] {\n  display: none !important;\n}\n","// Variables\n//\n// Variables should follow the `$component-state-property-size` formula for\n// consistent naming. Ex: $nav-link-disabled-color and $modal-content-box-shadow-xs.\n\n// Color system\n\n// scss-docs-start gray-color-variables\n$white:    #fff !default;\n$gray-100: #f8f9fa !default;\n$gray-200: #e9ecef !default;\n$gray-300: #dee2e6 !default;\n$gray-400: #ced4da !default;\n$gray-500: #adb5bd !default;\n$gray-600: #6c757d !default;\n$gray-700: #495057 !default;\n$gray-800: #343a40 !default;\n$gray-900: #212529 !default;\n$black:    #000 !default;\n// scss-docs-end gray-color-variables\n\n// fusv-disable\n// scss-docs-start gray-colors-map\n$grays: (\n  \"100\": $gray-100,\n  \"200\": $gray-200,\n  \"300\": $gray-300,\n  \"400\": $gray-400,\n  \"500\": $gray-500,\n  \"600\": $gray-600,\n  \"700\": $gray-700,\n  \"800\": $gray-800,\n  \"900\": $gray-900\n) !default;\n// scss-docs-end gray-colors-map\n// fusv-enable\n\n// scss-docs-start color-variables\n$blue:    #0d6efd !default;\n$indigo:  #6610f2 !default;\n$purple:  #6f42c1 !default;\n$pink:    #d63384 !default;\n$red:     #dc3545 !default;\n$orange:  #fd7e14 !default;\n$yellow:  #ffc107 !default;\n$green:   #198754 !default;\n$teal:    #20c997 !default;\n$cyan:    #0dcaf0 !default;\n// scss-docs-end color-variables\n\n// scss-docs-start colors-map\n$colors: (\n  \"blue\":       $blue,\n  \"indigo\":     $indigo,\n  \"purple\":     $purple,\n  \"pink\":       $pink,\n  \"red\":        $red,\n  \"orange\":     $orange,\n  \"yellow\":     $yellow,\n  \"green\":      $green,\n  \"teal\":       $teal,\n  \"cyan\":       $cyan,\n  \"black\":      $black,\n  \"white\":      $white,\n  \"gray\":       $gray-600,\n  \"gray-dark\":  $gray-800\n) !default;\n// scss-docs-end colors-map\n\n// The contrast ratio to reach against white, to determine if color changes from \"light\" to \"dark\". Acceptable values for WCAG 2.0 are 3, 4.5 and 7.\n// See https://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast\n$min-contrast-ratio:   4.5 !default;\n\n// Customize the light and dark text colors for use in our color contrast function.\n$color-contrast-dark:      $black !default;\n$color-contrast-light:     $white !default;\n\n// fusv-disable\n$blue-100: tint-color($blue, 80%) !default;\n$blue-200: tint-color($blue, 60%) !default;\n$blue-300: tint-color($blue, 40%) !default;\n$blue-400: tint-color($blue, 20%) !default;\n$blue-500: $blue !default;\n$blue-600: shade-color($blue, 20%) !default;\n$blue-700: shade-color($blue, 40%) !default;\n$blue-800: shade-color($blue, 60%) !default;\n$blue-900: shade-color($blue, 80%) !default;\n\n$indigo-100: tint-color($indigo, 80%) !default;\n$indigo-200: tint-color($indigo, 60%) !default;\n$indigo-300: tint-color($indigo, 40%) !default;\n$indigo-400: tint-color($indigo, 20%) !default;\n$indigo-500: $indigo !default;\n$indigo-600: shade-color($indigo, 20%) !default;\n$indigo-700: shade-color($indigo, 40%) !default;\n$indigo-800: shade-color($indigo, 60%) !default;\n$indigo-900: shade-color($indigo, 80%) !default;\n\n$purple-100: tint-color($purple, 80%) !default;\n$purple-200: tint-color($purple, 60%) !default;\n$purple-300: tint-color($purple, 40%) !default;\n$purple-400: tint-color($purple, 20%) !default;\n$purple-500: $purple !default;\n$purple-600: shade-color($purple, 20%) !default;\n$purple-700: shade-color($purple, 40%) !default;\n$purple-800: shade-color($purple, 60%) !default;\n$purple-900: shade-color($purple, 80%) !default;\n\n$pink-100: tint-color($pink, 80%) !default;\n$pink-200: tint-color($pink, 60%) !default;\n$pink-300: tint-color($pink, 40%) !default;\n$pink-400: tint-color($pink, 20%) !default;\n$pink-500: $pink !default;\n$pink-600: shade-color($pink, 20%) !default;\n$pink-700: shade-color($pink, 40%) !default;\n$pink-800: shade-color($pink, 60%) !default;\n$pink-900: shade-color($pink, 80%) !default;\n\n$red-100: tint-color($red, 80%) !default;\n$red-200: tint-color($red, 60%) !default;\n$red-300: tint-color($red, 40%) !default;\n$red-400: tint-color($red, 20%) !default;\n$red-500: $red !default;\n$red-600: shade-color($red, 20%) !default;\n$red-700: shade-color($red, 40%) !default;\n$red-800: shade-color($red, 60%) !default;\n$red-900: shade-color($red, 80%) !default;\n\n$orange-100: tint-color($orange, 80%) !default;\n$orange-200: tint-color($orange, 60%) !default;\n$orange-300: tint-color($orange, 40%) !default;\n$orange-400: tint-color($orange, 20%) !default;\n$orange-500: $orange !default;\n$orange-600: shade-color($orange, 20%) !default;\n$orange-700: shade-color($orange, 40%) !default;\n$orange-800: shade-color($orange, 60%) !default;\n$orange-900: shade-color($orange, 80%) !default;\n\n$yellow-100: tint-color($yellow, 80%) !default;\n$yellow-200: tint-color($yellow, 60%) !default;\n$yellow-300: tint-color($yellow, 40%) !default;\n$yellow-400: tint-color($yellow, 20%) !default;\n$yellow-500: $yellow !default;\n$yellow-600: shade-color($yellow, 20%) !default;\n$yellow-700: shade-color($yellow, 40%) !default;\n$yellow-800: shade-color($yellow, 60%) !default;\n$yellow-900: shade-color($yellow, 80%) !default;\n\n$green-100: tint-color($green, 80%) !default;\n$green-200: tint-color($green, 60%) !default;\n$green-300: tint-color($green, 40%) !default;\n$green-400: tint-color($green, 20%) !default;\n$green-500: $green !default;\n$green-600: shade-color($green, 20%) !default;\n$green-700: shade-color($green, 40%) !default;\n$green-800: shade-color($green, 60%) !default;\n$green-900: shade-color($green, 80%) !default;\n\n$teal-100: tint-color($teal, 80%) !default;\n$teal-200: tint-color($teal, 60%) !default;\n$teal-300: tint-color($teal, 40%) !default;\n$teal-400: tint-color($teal, 20%) !default;\n$teal-500: $teal !default;\n$teal-600: shade-color($teal, 20%) !default;\n$teal-700: shade-color($teal, 40%) !default;\n$teal-800: shade-color($teal, 60%) !default;\n$teal-900: shade-color($teal, 80%) !default;\n\n$cyan-100: tint-color($cyan, 80%) !default;\n$cyan-200: tint-color($cyan, 60%) !default;\n$cyan-300: tint-color($cyan, 40%) !default;\n$cyan-400: tint-color($cyan, 20%) !default;\n$cyan-500: $cyan !default;\n$cyan-600: shade-color($cyan, 20%) !default;\n$cyan-700: shade-color($cyan, 40%) !default;\n$cyan-800: shade-color($cyan, 60%) !default;\n$cyan-900: shade-color($cyan, 80%) !default;\n\n$blues: (\n  \"blue-100\": $blue-100,\n  \"blue-200\": $blue-200,\n  \"blue-300\": $blue-300,\n  \"blue-400\": $blue-400,\n  \"blue-500\": $blue-500,\n  \"blue-600\": $blue-600,\n  \"blue-700\": $blue-700,\n  \"blue-800\": $blue-800,\n  \"blue-900\": $blue-900\n) !default;\n\n$indigos: (\n  \"indigo-100\": $indigo-100,\n  \"indigo-200\": $indigo-200,\n  \"indigo-300\": $indigo-300,\n  \"indigo-400\": $indigo-400,\n  \"indigo-500\": $indigo-500,\n  \"indigo-600\": $indigo-600,\n  \"indigo-700\": $indigo-700,\n  \"indigo-800\": $indigo-800,\n  \"indigo-900\": $indigo-900\n) !default;\n\n$purples: (\n  \"purple-100\": $purple-100,\n  \"purple-200\": $purple-200,\n  \"purple-300\": $purple-300,\n  \"purple-400\": $purple-400,\n  \"purple-500\": $purple-500,\n  \"purple-600\": $purple-600,\n  \"purple-700\": $purple-700,\n  \"purple-800\": $purple-800,\n  \"purple-900\": $purple-900\n) !default;\n\n$pinks: (\n  \"pink-100\": $pink-100,\n  \"pink-200\": $pink-200,\n  \"pink-300\": $pink-300,\n  \"pink-400\": $pink-400,\n  \"pink-500\": $pink-500,\n  \"pink-600\": $pink-600,\n  \"pink-700\": $pink-700,\n  \"pink-800\": $pink-800,\n  \"pink-900\": $pink-900\n) !default;\n\n$reds: (\n  \"red-100\": $red-100,\n  \"red-200\": $red-200,\n  \"red-300\": $red-300,\n  \"red-400\": $red-400,\n  \"red-500\": $red-500,\n  \"red-600\": $red-600,\n  \"red-700\": $red-700,\n  \"red-800\": $red-800,\n  \"red-900\": $red-900\n) !default;\n\n$oranges: (\n  \"orange-100\": $orange-100,\n  \"orange-200\": $orange-200,\n  \"orange-300\": $orange-300,\n  \"orange-400\": $orange-400,\n  \"orange-500\": $orange-500,\n  \"orange-600\": $orange-600,\n  \"orange-700\": $orange-700,\n  \"orange-800\": $orange-800,\n  \"orange-900\": $orange-900\n) !default;\n\n$yellows: (\n  \"yellow-100\": $yellow-100,\n  \"yellow-200\": $yellow-200,\n  \"yellow-300\": $yellow-300,\n  \"yellow-400\": $yellow-400,\n  \"yellow-500\": $yellow-500,\n  \"yellow-600\": $yellow-600,\n  \"yellow-700\": $yellow-700,\n  \"yellow-800\": $yellow-800,\n  \"yellow-900\": $yellow-900\n) !default;\n\n$greens: (\n  \"green-100\": $green-100,\n  \"green-200\": $green-200,\n  \"green-300\": $green-300,\n  \"green-400\": $green-400,\n  \"green-500\": $green-500,\n  \"green-600\": $green-600,\n  \"green-700\": $green-700,\n  \"green-800\": $green-800,\n  \"green-900\": $green-900\n) !default;\n\n$teals: (\n  \"teal-100\": $teal-100,\n  \"teal-200\": $teal-200,\n  \"teal-300\": $teal-300,\n  \"teal-400\": $teal-400,\n  \"teal-500\": $teal-500,\n  \"teal-600\": $teal-600,\n  \"teal-700\": $teal-700,\n  \"teal-800\": $teal-800,\n  \"teal-900\": $teal-900\n) !default;\n\n$cyans: (\n  \"cyan-100\": $cyan-100,\n  \"cyan-200\": $cyan-200,\n  \"cyan-300\": $cyan-300,\n  \"cyan-400\": $cyan-400,\n  \"cyan-500\": $cyan-500,\n  \"cyan-600\": $cyan-600,\n  \"cyan-700\": $cyan-700,\n  \"cyan-800\": $cyan-800,\n  \"cyan-900\": $cyan-900\n) !default;\n// fusv-enable\n\n// scss-docs-start theme-color-variables\n$primary:       $blue !default;\n$secondary:     $gray-600 !default;\n$success:       $green !default;\n$info:          $cyan !default;\n$warning:       $yellow !default;\n$danger:        $red !default;\n$light:         $gray-100 !default;\n$dark:          $gray-900 !default;\n// scss-docs-end theme-color-variables\n\n// scss-docs-start theme-colors-map\n$theme-colors: (\n  \"primary\":    $primary,\n  \"secondary\":  $secondary,\n  \"success\":    $success,\n  \"info\":       $info,\n  \"warning\":    $warning,\n  \"danger\":     $danger,\n  \"light\":      $light,\n  \"dark\":       $dark\n) !default;\n// scss-docs-end theme-colors-map\n\n// scss-docs-start theme-text-variables\n$primary-text-emphasis:   shade-color($primary, 60%) !default;\n$secondary-text-emphasis: shade-color($secondary, 60%) !default;\n$success-text-emphasis:   shade-color($success, 60%) !default;\n$info-text-emphasis:      shade-color($info, 60%) !default;\n$warning-text-emphasis:   shade-color($warning, 60%) !default;\n$danger-text-emphasis:    shade-color($danger, 60%) !default;\n$light-text-emphasis:     $gray-700 !default;\n$dark-text-emphasis:      $gray-700 !default;\n// scss-docs-end theme-text-variables\n\n// scss-docs-start theme-bg-subtle-variables\n$primary-bg-subtle:       tint-color($primary, 80%) !default;\n$secondary-bg-subtle:     tint-color($secondary, 80%) !default;\n$success-bg-subtle:       tint-color($success, 80%) !default;\n$info-bg-subtle:          tint-color($info, 80%) !default;\n$warning-bg-subtle:       tint-color($warning, 80%) !default;\n$danger-bg-subtle:        tint-color($danger, 80%) !default;\n$light-bg-subtle:         mix($gray-100, $white) !default;\n$dark-bg-subtle:          $gray-400 !default;\n// scss-docs-end theme-bg-subtle-variables\n\n// scss-docs-start theme-border-subtle-variables\n$primary-border-subtle:   tint-color($primary, 60%) !default;\n$secondary-border-subtle: tint-color($secondary, 60%) !default;\n$success-border-subtle:   tint-color($success, 60%) !default;\n$info-border-subtle:      tint-color($info, 60%) !default;\n$warning-border-subtle:   tint-color($warning, 60%) !default;\n$danger-border-subtle:    tint-color($danger, 60%) !default;\n$light-border-subtle:     $gray-200 !default;\n$dark-border-subtle:      $gray-500 !default;\n// scss-docs-end theme-border-subtle-variables\n\n// Characters which are escaped by the escape-svg function\n$escaped-characters: (\n  (\"<\", \"%3c\"),\n  (\">\", \"%3e\"),\n  (\"#\", \"%23\"),\n  (\"(\", \"%28\"),\n  (\")\", \"%29\"),\n) !default;\n\n// Options\n//\n// Quickly modify global styling by enabling or disabling optional features.\n\n$enable-caret:                true !default;\n$enable-rounded:              true !default;\n$enable-shadows:              false !default;\n$enable-gradients:            false !default;\n$enable-transitions:          true !default;\n$enable-reduced-motion:       true !default;\n$enable-smooth-scroll:        true !default;\n$enable-grid-classes:         true !default;\n$enable-container-classes:    true !default;\n$enable-cssgrid:              false !default;\n$enable-button-pointers:      true !default;\n$enable-rfs:                  true !default;\n$enable-validation-icons:     true !default;\n$enable-negative-margins:     false !default;\n$enable-deprecation-messages: true !default;\n$enable-important-utilities:  true !default;\n\n$enable-dark-mode:            true !default;\n$color-mode-type:             data !default; // `data` or `media-query`\n\n// Prefix for :root CSS variables\n\n$variable-prefix:             bs- !default; // Deprecated in v5.2.0 for the shorter `$prefix`\n$prefix:                      $variable-prefix !default;\n\n// Gradient\n//\n// The gradient which is added to components if `$enable-gradients` is `true`\n// This gradient is also added to elements with `.bg-gradient`\n// scss-docs-start variable-gradient\n$gradient: linear-gradient(180deg, rgba($white, .15), rgba($white, 0)) !default;\n// scss-docs-end variable-gradient\n\n// Spacing\n//\n// Control the default styling of most Bootstrap elements by modifying these\n// variables. Mostly focused on spacing.\n// You can add more entries to the $spacers map, should you need more variation.\n\n// scss-docs-start spacer-variables-maps\n$spacer: 1rem !default;\n$spacers: (\n  0: 0,\n  1: $spacer * .25,\n  2: $spacer * .5,\n  3: $spacer,\n  4: $spacer * 1.5,\n  5: $spacer * 3,\n) !default;\n// scss-docs-end spacer-variables-maps\n\n// Position\n//\n// Define the edge positioning anchors of the position utilities.\n\n// scss-docs-start position-map\n$position-values: (\n  0: 0,\n  50: 50%,\n  100: 100%\n) !default;\n// scss-docs-end position-map\n\n// Body\n//\n// Settings for the `<body>` element.\n\n$body-text-align:           null !default;\n$body-color:                $gray-900 !default;\n$body-bg:                   $white !default;\n\n$body-secondary-color:      rgba($body-color, .75) !default;\n$body-secondary-bg:         $gray-200 !default;\n\n$body-tertiary-color:       rgba($body-color, .5) !default;\n$body-tertiary-bg:          $gray-100 !default;\n\n$body-emphasis-color:       $black !default;\n\n// Links\n//\n// Style anchor elements.\n\n$link-color:                              $primary !default;\n$link-decoration:                         underline !default;\n$link-shade-percentage:                   20% !default;\n$link-hover-color:                        shift-color($link-color, $link-shade-percentage) !default;\n$link-hover-decoration:                   null !default;\n\n$stretched-link-pseudo-element:           after !default;\n$stretched-link-z-index:                  1 !default;\n\n// Icon links\n// scss-docs-start icon-link-variables\n$icon-link-gap:               .375rem !default;\n$icon-link-underline-offset:  .25em !default;\n$icon-link-icon-size:         1em !default;\n$icon-link-icon-transition:   .2s ease-in-out transform !default;\n$icon-link-icon-transform:    translate3d(.25em, 0, 0) !default;\n// scss-docs-end icon-link-variables\n\n// Paragraphs\n//\n// Style p element.\n\n$paragraph-margin-bottom:   1rem !default;\n\n\n// Grid breakpoints\n//\n// Define the minimum dimensions at which your layout will change,\n// adapting to different screen sizes, for use in media queries.\n\n// scss-docs-start grid-breakpoints\n$grid-breakpoints: (\n  xs: 0,\n  sm: 576px,\n  md: 768px,\n  lg: 992px,\n  xl: 1200px,\n  xxl: 1400px\n) !default;\n// scss-docs-end grid-breakpoints\n\n@include _assert-ascending($grid-breakpoints, \"$grid-breakpoints\");\n@include _assert-starts-at-zero($grid-breakpoints, \"$grid-breakpoints\");\n\n\n// Grid containers\n//\n// Define the maximum width of `.container` for different screen sizes.\n\n// scss-docs-start container-max-widths\n$container-max-widths: (\n  sm: 540px,\n  md: 720px,\n  lg: 960px,\n  xl: 1140px,\n  xxl: 1320px\n) !default;\n// scss-docs-end container-max-widths\n\n@include _assert-ascending($container-max-widths, \"$container-max-widths\");\n\n\n// Grid columns\n//\n// Set the number of columns and specify the width of the gutters.\n\n$grid-columns:                12 !default;\n$grid-gutter-width:           1.5rem !default;\n$grid-row-columns:            6 !default;\n\n// Container padding\n\n$container-padding-x: $grid-gutter-width !default;\n\n\n// Components\n//\n// Define common padding and border radius sizes and more.\n\n// scss-docs-start border-variables\n$border-width:                1px !default;\n$border-widths: (\n  1: 1px,\n  2: 2px,\n  3: 3px,\n  4: 4px,\n  5: 5px\n) !default;\n$border-style:                solid !default;\n$border-color:                $gray-300 !default;\n$border-color-translucent:    rgba($black, .175) !default;\n// scss-docs-end border-variables\n\n// scss-docs-start border-radius-variables\n$border-radius:               .375rem !default;\n$border-radius-sm:            .25rem !default;\n$border-radius-lg:            .5rem !default;\n$border-radius-xl:            1rem !default;\n$border-radius-xxl:           2rem !default;\n$border-radius-pill:          50rem !default;\n// scss-docs-end border-radius-variables\n// fusv-disable\n$border-radius-2xl:           $border-radius-xxl !default; // Deprecated in v5.3.0\n// fusv-enable\n\n// scss-docs-start box-shadow-variables\n$box-shadow:                  0 .5rem 1rem rgba($black, .15) !default;\n$box-shadow-sm:               0 .125rem .25rem rgba($black, .075) !default;\n$box-shadow-lg:               0 1rem 3rem rgba($black, .175) !default;\n$box-shadow-inset:            inset 0 1px 2px rgba($black, .075) !default;\n// scss-docs-end box-shadow-variables\n\n$component-active-color:      $white !default;\n$component-active-bg:         $primary !default;\n\n// scss-docs-start focus-ring-variables\n$focus-ring-width:      .25rem !default;\n$focus-ring-opacity:    .25 !default;\n$focus-ring-color:      rgba($primary, $focus-ring-opacity) !default;\n$focus-ring-blur:       0 !default;\n$focus-ring-box-shadow: 0 0 $focus-ring-blur $focus-ring-width $focus-ring-color !default;\n// scss-docs-end focus-ring-variables\n\n// scss-docs-start caret-variables\n$caret-width:                 .3em !default;\n$caret-vertical-align:        $caret-width * .85 !default;\n$caret-spacing:               $caret-width * .85 !default;\n// scss-docs-end caret-variables\n\n$transition-base:             all .2s ease-in-out !default;\n$transition-fade:             opacity .15s linear !default;\n// scss-docs-start collapse-transition\n$transition-collapse:         height .35s ease !default;\n$transition-collapse-width:   width .35s ease !default;\n// scss-docs-end collapse-transition\n\n// stylelint-disable function-disallowed-list\n// scss-docs-start aspect-ratios\n$aspect-ratios: (\n  \"1x1\": 100%,\n  \"4x3\": calc(3 / 4 * 100%),\n  \"16x9\": calc(9 / 16 * 100%),\n  \"21x9\": calc(9 / 21 * 100%)\n) !default;\n// scss-docs-end aspect-ratios\n// stylelint-enable function-disallowed-list\n\n// Typography\n//\n// Font, line-height, and color for body text, headings, and more.\n\n// scss-docs-start font-variables\n// stylelint-disable value-keyword-case\n$font-family-sans-serif:      system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", \"Noto Sans\", \"Liberation Sans\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\" !default;\n$font-family-monospace:       SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace !default;\n// stylelint-enable value-keyword-case\n$font-family-base:            var(--#{$prefix}font-sans-serif) !default;\n$font-family-code:            var(--#{$prefix}font-monospace) !default;\n\n// $font-size-root affects the value of `rem`, which is used for as well font sizes, paddings, and margins\n// $font-size-base affects the font size of the body text\n$font-size-root:              null !default;\n$font-size-base:              1rem !default; // Assumes the browser default, typically `16px`\n$font-size-sm:                $font-size-base * .875 !default;\n$font-size-lg:                $font-size-base * 1.25 !default;\n\n$font-weight-lighter:         lighter !default;\n$font-weight-light:           300 !default;\n$font-weight-normal:          400 !default;\n$font-weight-medium:          500 !default;\n$font-weight-semibold:        600 !default;\n$font-weight-bold:            700 !default;\n$font-weight-bolder:          bolder !default;\n\n$font-weight-base:            $font-weight-normal !default;\n\n$line-height-base:            1.5 !default;\n$line-height-sm:              1.25 !default;\n$line-height-lg:              2 !default;\n\n$h1-font-size:                $font-size-base * 2.5 !default;\n$h2-font-size:                $font-size-base * 2 !default;\n$h3-font-size:                $font-size-base * 1.75 !default;\n$h4-font-size:                $font-size-base * 1.5 !default;\n$h5-font-size:                $font-size-base * 1.25 !default;\n$h6-font-size:                $font-size-base !default;\n// scss-docs-end font-variables\n\n// scss-docs-start font-sizes\n$font-sizes: (\n  1: $h1-font-size,\n  2: $h2-font-size,\n  3: $h3-font-size,\n  4: $h4-font-size,\n  5: $h5-font-size,\n  6: $h6-font-size\n) !default;\n// scss-docs-end font-sizes\n\n// scss-docs-start headings-variables\n$headings-margin-bottom:      $spacer * .5 !default;\n$headings-font-family:        null !default;\n$headings-font-style:         null !default;\n$headings-font-weight:        500 !default;\n$headings-line-height:        1.2 !default;\n$headings-color:              inherit !default;\n// scss-docs-end headings-variables\n\n// scss-docs-start display-headings\n$display-font-sizes: (\n  1: 5rem,\n  2: 4.5rem,\n  3: 4rem,\n  4: 3.5rem,\n  5: 3rem,\n  6: 2.5rem\n) !default;\n\n$display-font-family: null !default;\n$display-font-style:  null !default;\n$display-font-weight: 300 !default;\n$display-line-height: $headings-line-height !default;\n// scss-docs-end display-headings\n\n// scss-docs-start type-variables\n$lead-font-size:              $font-size-base * 1.25 !default;\n$lead-font-weight:            300 !default;\n\n$small-font-size:             .875em !default;\n\n$sub-sup-font-size:           .75em !default;\n\n// fusv-disable\n$text-muted:                  var(--#{$prefix}secondary-color) !default; // Deprecated in 5.3.0\n// fusv-enable\n\n$initialism-font-size:        $small-font-size !default;\n\n$blockquote-margin-y:         $spacer !default;\n$blockquote-font-size:        $font-size-base * 1.25 !default;\n$blockquote-footer-color:     $gray-600 !default;\n$blockquote-footer-font-size: $small-font-size !default;\n\n$hr-margin-y:                 $spacer !default;\n$hr-color:                    inherit !default;\n\n// fusv-disable\n$hr-bg-color:                 null !default; // Deprecated in v5.2.0\n$hr-height:                   null !default; // Deprecated in v5.2.0\n// fusv-enable\n\n$hr-border-color:             null !default; // Allows for inherited colors\n$hr-border-width:             var(--#{$prefix}border-width) !default;\n$hr-opacity:                  .25 !default;\n\n// scss-docs-start vr-variables\n$vr-border-width:             var(--#{$prefix}border-width) !default;\n// scss-docs-end vr-variables\n\n$legend-margin-bottom:        .5rem !default;\n$legend-font-size:            1.5rem !default;\n$legend-font-weight:          null !default;\n\n$dt-font-weight:              $font-weight-bold !default;\n\n$list-inline-padding:         .5rem !default;\n\n$mark-padding:                .1875em !default;\n$mark-color:                  $body-color !default;\n$mark-bg:                     $yellow-100 !default;\n// scss-docs-end type-variables\n\n\n// Tables\n//\n// Customizes the `.table` component with basic values, each used across all table variations.\n\n// scss-docs-start table-variables\n$table-cell-padding-y:        .5rem !default;\n$table-cell-padding-x:        .5rem !default;\n$table-cell-padding-y-sm:     .25rem !default;\n$table-cell-padding-x-sm:     .25rem !default;\n\n$table-cell-vertical-align:   top !default;\n\n$table-color:                 var(--#{$prefix}emphasis-color) !default;\n$table-bg:                    var(--#{$prefix}body-bg) !default;\n$table-accent-bg:             transparent !default;\n\n$table-th-font-weight:        null !default;\n\n$table-striped-color:         $table-color !default;\n$table-striped-bg-factor:     .05 !default;\n$table-striped-bg:            rgba(var(--#{$prefix}emphasis-color-rgb), $table-striped-bg-factor) !default;\n\n$table-active-color:          $table-color !default;\n$table-active-bg-factor:      .1 !default;\n$table-active-bg:             rgba(var(--#{$prefix}emphasis-color-rgb), $table-active-bg-factor) !default;\n\n$table-hover-color:           $table-color !default;\n$table-hover-bg-factor:       .075 !default;\n$table-hover-bg:              rgba(var(--#{$prefix}emphasis-color-rgb), $table-hover-bg-factor) !default;\n\n$table-border-factor:         .2 !default;\n$table-border-width:          var(--#{$prefix}border-width) !default;\n$table-border-color:          var(--#{$prefix}border-color) !default;\n\n$table-striped-order:         odd !default;\n$table-striped-columns-order: even !default;\n\n$table-group-separator-color: currentcolor !default;\n\n$table-caption-color:         var(--#{$prefix}secondary-color) !default;\n\n$table-bg-scale:              -80% !default;\n// scss-docs-end table-variables\n\n// scss-docs-start table-loop\n$table-variants: (\n  \"primary\":    shift-color($primary, $table-bg-scale),\n  \"secondary\":  shift-color($secondary, $table-bg-scale),\n  \"success\":    shift-color($success, $table-bg-scale),\n  \"info\":       shift-color($info, $table-bg-scale),\n  \"warning\":    shift-color($warning, $table-bg-scale),\n  \"danger\":     shift-color($danger, $table-bg-scale),\n  \"light\":      $light,\n  \"dark\":       $dark,\n) !default;\n// scss-docs-end table-loop\n\n\n// Buttons + Forms\n//\n// Shared variables that are reassigned to `$input-` and `$btn-` specific variables.\n\n// scss-docs-start input-btn-variables\n$input-btn-padding-y:         .375rem !default;\n$input-btn-padding-x:         .75rem !default;\n$input-btn-font-family:       null !default;\n$input-btn-font-size:         $font-size-base !default;\n$input-btn-line-height:       $line-height-base !default;\n\n$input-btn-focus-width:         $focus-ring-width !default;\n$input-btn-focus-color-opacity: $focus-ring-opacity !default;\n$input-btn-focus-color:         $focus-ring-color !default;\n$input-btn-focus-blur:          $focus-ring-blur !default;\n$input-btn-focus-box-shadow:    $focus-ring-box-shadow !default;\n\n$input-btn-padding-y-sm:      .25rem !default;\n$input-btn-padding-x-sm:      .5rem !default;\n$input-btn-font-size-sm:      $font-size-sm !default;\n\n$input-btn-padding-y-lg:      .5rem !default;\n$input-btn-padding-x-lg:      1rem !default;\n$input-btn-font-size-lg:      $font-size-lg !default;\n\n$input-btn-border-width:      var(--#{$prefix}border-width) !default;\n// scss-docs-end input-btn-variables\n\n\n// Buttons\n//\n// For each of Bootstrap's buttons, define text, background, and border color.\n\n// scss-docs-start btn-variables\n$btn-color:                   var(--#{$prefix}body-color) !default;\n$btn-padding-y:               $input-btn-padding-y !default;\n$btn-padding-x:               $input-btn-padding-x !default;\n$btn-font-family:             $input-btn-font-family !default;\n$btn-font-size:               $input-btn-font-size !default;\n$btn-line-height:             $input-btn-line-height !default;\n$btn-white-space:             null !default; // Set to `nowrap` to prevent text wrapping\n\n$btn-padding-y-sm:            $input-btn-padding-y-sm !default;\n$btn-padding-x-sm:            $input-btn-padding-x-sm !default;\n$btn-font-size-sm:            $input-btn-font-size-sm !default;\n\n$btn-padding-y-lg:            $input-btn-padding-y-lg !default;\n$btn-padding-x-lg:            $input-btn-padding-x-lg !default;\n$btn-font-size-lg:            $input-btn-font-size-lg !default;\n\n$btn-border-width:            $input-btn-border-width !default;\n\n$btn-font-weight:             $font-weight-normal !default;\n$btn-box-shadow:              inset 0 1px 0 rgba($white, .15), 0 1px 1px rgba($black, .075) !default;\n$btn-focus-width:             $input-btn-focus-width !default;\n$btn-focus-box-shadow:        $input-btn-focus-box-shadow !default;\n$btn-disabled-opacity:        .65 !default;\n$btn-active-box-shadow:       inset 0 3px 5px rgba($black, .125) !default;\n\n$btn-link-color:              var(--#{$prefix}link-color) !default;\n$btn-link-hover-color:        var(--#{$prefix}link-hover-color) !default;\n$btn-link-disabled-color:     $gray-600 !default;\n$btn-link-focus-shadow-rgb:   to-rgb(mix(color-contrast($link-color), $link-color, 15%)) !default;\n\n// Allows for customizing button radius independently from global border radius\n$btn-border-radius:           var(--#{$prefix}border-radius) !default;\n$btn-border-radius-sm:        var(--#{$prefix}border-radius-sm) !default;\n$btn-border-radius-lg:        var(--#{$prefix}border-radius-lg) !default;\n\n$btn-transition:              color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out !default;\n\n$btn-hover-bg-shade-amount:       15% !default;\n$btn-hover-bg-tint-amount:        15% !default;\n$btn-hover-border-shade-amount:   20% !default;\n$btn-hover-border-tint-amount:    10% !default;\n$btn-active-bg-shade-amount:      20% !default;\n$btn-active-bg-tint-amount:       20% !default;\n$btn-active-border-shade-amount:  25% !default;\n$btn-active-border-tint-amount:   10% !default;\n// scss-docs-end btn-variables\n\n\n// Forms\n\n// scss-docs-start form-text-variables\n$form-text-margin-top:                  .25rem !default;\n$form-text-font-size:                   $small-font-size !default;\n$form-text-font-style:                  null !default;\n$form-text-font-weight:                 null !default;\n$form-text-color:                       var(--#{$prefix}secondary-color) !default;\n// scss-docs-end form-text-variables\n\n// scss-docs-start form-label-variables\n$form-label-margin-bottom:              .5rem !default;\n$form-label-font-size:                  null !default;\n$form-label-font-style:                 null !default;\n$form-label-font-weight:                null !default;\n$form-label-color:                      null !default;\n// scss-docs-end form-label-variables\n\n// scss-docs-start form-input-variables\n$input-padding-y:                       $input-btn-padding-y !default;\n$input-padding-x:                       $input-btn-padding-x !default;\n$input-font-family:                     $input-btn-font-family !default;\n$input-font-size:                       $input-btn-font-size !default;\n$input-font-weight:                     $font-weight-base !default;\n$input-line-height:                     $input-btn-line-height !default;\n\n$input-padding-y-sm:                    $input-btn-padding-y-sm !default;\n$input-padding-x-sm:                    $input-btn-padding-x-sm !default;\n$input-font-size-sm:                    $input-btn-font-size-sm !default;\n\n$input-padding-y-lg:                    $input-btn-padding-y-lg !default;\n$input-padding-x-lg:                    $input-btn-padding-x-lg !default;\n$input-font-size-lg:                    $input-btn-font-size-lg !default;\n\n$input-bg:                              var(--#{$prefix}body-bg) !default;\n$input-disabled-color:                  null !default;\n$input-disabled-bg:                     var(--#{$prefix}secondary-bg) !default;\n$input-disabled-border-color:           null !default;\n\n$input-color:                           var(--#{$prefix}body-color) !default;\n$input-border-color:                    var(--#{$prefix}border-color) !default;\n$input-border-width:                    $input-btn-border-width !default;\n$input-box-shadow:                      var(--#{$prefix}box-shadow-inset) !default;\n\n$input-border-radius:                   var(--#{$prefix}border-radius) !default;\n$input-border-radius-sm:                var(--#{$prefix}border-radius-sm) !default;\n$input-border-radius-lg:                var(--#{$prefix}border-radius-lg) !default;\n\n$input-focus-bg:                        $input-bg !default;\n$input-focus-border-color:              tint-color($component-active-bg, 50%) !default;\n$input-focus-color:                     $input-color !default;\n$input-focus-width:                     $input-btn-focus-width !default;\n$input-focus-box-shadow:                $input-btn-focus-box-shadow !default;\n\n$input-placeholder-color:               var(--#{$prefix}secondary-color) !default;\n$input-plaintext-color:                 var(--#{$prefix}body-color) !default;\n\n$input-height-border:                   calc(#{$input-border-width} * 2) !default; // stylelint-disable-line function-disallowed-list\n\n$input-height-inner:                    add($input-line-height * 1em, $input-padding-y * 2) !default;\n$input-height-inner-half:               add($input-line-height * .5em, $input-padding-y) !default;\n$input-height-inner-quarter:            add($input-line-height * .25em, $input-padding-y * .5) !default;\n\n$input-height:                          add($input-line-height * 1em, add($input-padding-y * 2, $input-height-border, false)) !default;\n$input-height-sm:                       add($input-line-height * 1em, add($input-padding-y-sm * 2, $input-height-border, false)) !default;\n$input-height-lg:                       add($input-line-height * 1em, add($input-padding-y-lg * 2, $input-height-border, false)) !default;\n\n$input-transition:                      border-color .15s ease-in-out, box-shadow .15s ease-in-out !default;\n\n$form-color-width:                      3rem !default;\n// scss-docs-end form-input-variables\n\n// scss-docs-start form-check-variables\n$form-check-input-width:                  1em !default;\n$form-check-min-height:                   $font-size-base * $line-height-base !default;\n$form-check-padding-start:                $form-check-input-width + .5em !default;\n$form-check-margin-bottom:                .125rem !default;\n$form-check-label-color:                  null !default;\n$form-check-label-cursor:                 null !default;\n$form-check-transition:                   null !default;\n\n$form-check-input-active-filter:          brightness(90%) !default;\n\n$form-check-input-bg:                     $input-bg !default;\n$form-check-input-border:                 var(--#{$prefix}border-width) solid var(--#{$prefix}border-color) !default;\n$form-check-input-border-radius:          .25em !default;\n$form-check-radio-border-radius:          50% !default;\n$form-check-input-focus-border:           $input-focus-border-color !default;\n$form-check-input-focus-box-shadow:       $focus-ring-box-shadow !default;\n\n$form-check-input-checked-color:          $component-active-color !default;\n$form-check-input-checked-bg-color:       $component-active-bg !default;\n$form-check-input-checked-border-color:   $form-check-input-checked-bg-color !default;\n$form-check-input-checked-bg-image:       url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='none' stroke='#{$form-check-input-checked-color}' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/></svg>\") !default;\n$form-check-radio-checked-bg-image:       url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='2' fill='#{$form-check-input-checked-color}'/></svg>\") !default;\n\n$form-check-input-indeterminate-color:          $component-active-color !default;\n$form-check-input-indeterminate-bg-color:       $component-active-bg !default;\n$form-check-input-indeterminate-border-color:   $form-check-input-indeterminate-bg-color !default;\n$form-check-input-indeterminate-bg-image:       url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='none' stroke='#{$form-check-input-indeterminate-color}' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/></svg>\") !default;\n\n$form-check-input-disabled-opacity:        .5 !default;\n$form-check-label-disabled-opacity:        $form-check-input-disabled-opacity !default;\n$form-check-btn-check-disabled-opacity:    $btn-disabled-opacity !default;\n\n$form-check-inline-margin-end:    1rem !default;\n// scss-docs-end form-check-variables\n\n// scss-docs-start form-switch-variables\n$form-switch-color:               rgba($black, .25) !default;\n$form-switch-width:               2em !default;\n$form-switch-padding-start:       $form-switch-width + .5em !default;\n$form-switch-bg-image:            url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='#{$form-switch-color}'/></svg>\") !default;\n$form-switch-border-radius:       $form-switch-width !default;\n$form-switch-transition:          background-position .15s ease-in-out !default;\n\n$form-switch-focus-color:         $input-focus-border-color !default;\n$form-switch-focus-bg-image:      url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='#{$form-switch-focus-color}'/></svg>\") !default;\n\n$form-switch-checked-color:       $component-active-color !default;\n$form-switch-checked-bg-image:    url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='#{$form-switch-checked-color}'/></svg>\") !default;\n$form-switch-checked-bg-position: right center !default;\n// scss-docs-end form-switch-variables\n\n// scss-docs-start input-group-variables\n$input-group-addon-padding-y:           $input-padding-y !default;\n$input-group-addon-padding-x:           $input-padding-x !default;\n$input-group-addon-font-weight:         $input-font-weight !default;\n$input-group-addon-color:               $input-color !default;\n$input-group-addon-bg:                  var(--#{$prefix}tertiary-bg) !default;\n$input-group-addon-border-color:        $input-border-color !default;\n// scss-docs-end input-group-variables\n\n// scss-docs-start form-select-variables\n$form-select-padding-y:             $input-padding-y !default;\n$form-select-padding-x:             $input-padding-x !default;\n$form-select-font-family:           $input-font-family !default;\n$form-select-font-size:             $input-font-size !default;\n$form-select-indicator-padding:     $form-select-padding-x * 3 !default; // Extra padding for background-image\n$form-select-font-weight:           $input-font-weight !default;\n$form-select-line-height:           $input-line-height !default;\n$form-select-color:                 $input-color !default;\n$form-select-bg:                    $input-bg !default;\n$form-select-disabled-color:        null !default;\n$form-select-disabled-bg:           $input-disabled-bg !default;\n$form-select-disabled-border-color: $input-disabled-border-color !default;\n$form-select-bg-position:           right $form-select-padding-x center !default;\n$form-select-bg-size:               16px 12px !default; // In pixels because image dimensions\n$form-select-indicator-color:       $gray-800 !default;\n$form-select-indicator:             url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='#{$form-select-indicator-color}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/></svg>\") !default;\n\n$form-select-feedback-icon-padding-end: $form-select-padding-x * 2.5 + $form-select-indicator-padding !default;\n$form-select-feedback-icon-position:    center right $form-select-indicator-padding !default;\n$form-select-feedback-icon-size:        $input-height-inner-half $input-height-inner-half !default;\n\n$form-select-border-width:        $input-border-width !default;\n$form-select-border-color:        $input-border-color !default;\n$form-select-border-radius:       $input-border-radius !default;\n$form-select-box-shadow:          var(--#{$prefix}box-shadow-inset) !default;\n\n$form-select-focus-border-color:  $input-focus-border-color !default;\n$form-select-focus-width:         $input-focus-width !default;\n$form-select-focus-box-shadow:    0 0 0 $form-select-focus-width $input-btn-focus-color !default;\n\n$form-select-padding-y-sm:        $input-padding-y-sm !default;\n$form-select-padding-x-sm:        $input-padding-x-sm !default;\n$form-select-font-size-sm:        $input-font-size-sm !default;\n$form-select-border-radius-sm:    $input-border-radius-sm !default;\n\n$form-select-padding-y-lg:        $input-padding-y-lg !default;\n$form-select-padding-x-lg:        $input-padding-x-lg !default;\n$form-select-font-size-lg:        $input-font-size-lg !default;\n$form-select-border-radius-lg:    $input-border-radius-lg !default;\n\n$form-select-transition:          $input-transition !default;\n// scss-docs-end form-select-variables\n\n// scss-docs-start form-range-variables\n$form-range-track-width:          100% !default;\n$form-range-track-height:         .5rem !default;\n$form-range-track-cursor:         pointer !default;\n$form-range-track-bg:             var(--#{$prefix}secondary-bg) !default;\n$form-range-track-border-radius:  1rem !default;\n$form-range-track-box-shadow:     var(--#{$prefix}box-shadow-inset) !default;\n\n$form-range-thumb-width:                   1rem !default;\n$form-range-thumb-height:                  $form-range-thumb-width !default;\n$form-range-thumb-bg:                      $component-active-bg !default;\n$form-range-thumb-border:                  0 !default;\n$form-range-thumb-border-radius:           1rem !default;\n$form-range-thumb-box-shadow:              0 .1rem .25rem rgba($black, .1) !default;\n$form-range-thumb-focus-box-shadow:        0 0 0 1px $body-bg, $input-focus-box-shadow !default;\n$form-range-thumb-focus-box-shadow-width:  $input-focus-width !default; // For focus box shadow issue in Edge\n$form-range-thumb-active-bg:               tint-color($component-active-bg, 70%) !default;\n$form-range-thumb-disabled-bg:             var(--#{$prefix}secondary-color) !default;\n$form-range-thumb-transition:              background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out !default;\n// scss-docs-end form-range-variables\n\n// scss-docs-start form-file-variables\n$form-file-button-color:          $input-color !default;\n$form-file-button-bg:             var(--#{$prefix}tertiary-bg) !default;\n$form-file-button-hover-bg:       var(--#{$prefix}secondary-bg) !default;\n// scss-docs-end form-file-variables\n\n// scss-docs-start form-floating-variables\n$form-floating-height:                  add(3.5rem, $input-height-border) !default;\n$form-floating-line-height:             1.25 !default;\n$form-floating-padding-x:               $input-padding-x !default;\n$form-floating-padding-y:               1rem !default;\n$form-floating-input-padding-t:         1.625rem !default;\n$form-floating-input-padding-b:         .625rem !default;\n$form-floating-label-height:            1.5em !default;\n$form-floating-label-opacity:           .65 !default;\n$form-floating-label-transform:         scale(.85) translateY(-.5rem) translateX(.15rem) !default;\n$form-floating-label-disabled-color:    $gray-600 !default;\n$form-floating-transition:              opacity .1s ease-in-out, transform .1s ease-in-out !default;\n// scss-docs-end form-floating-variables\n\n// Form validation\n\n// scss-docs-start form-feedback-variables\n$form-feedback-margin-top:          $form-text-margin-top !default;\n$form-feedback-font-size:           $form-text-font-size !default;\n$form-feedback-font-style:          $form-text-font-style !default;\n$form-feedback-valid-color:         $success !default;\n$form-feedback-invalid-color:       $danger !default;\n\n$form-feedback-icon-valid-color:    $form-feedback-valid-color !default;\n$form-feedback-icon-valid:          url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='#{$form-feedback-icon-valid-color}' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/></svg>\") !default;\n$form-feedback-icon-invalid-color:  $form-feedback-invalid-color !default;\n$form-feedback-icon-invalid:        url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='#{$form-feedback-icon-invalid-color}'><circle cx='6' cy='6' r='4.5'/><path stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/><circle cx='6' cy='8.2' r='.6' fill='#{$form-feedback-icon-invalid-color}' stroke='none'/></svg>\") !default;\n// scss-docs-end form-feedback-variables\n\n// scss-docs-start form-validation-colors\n$form-valid-color:                  $form-feedback-valid-color !default;\n$form-valid-border-color:           $form-feedback-valid-color !default;\n$form-invalid-color:                $form-feedback-invalid-color !default;\n$form-invalid-border-color:         $form-feedback-invalid-color !default;\n// scss-docs-end form-validation-colors\n\n// scss-docs-start form-validation-states\n$form-validation-states: (\n  \"valid\": (\n    \"color\": var(--#{$prefix}form-valid-color),\n    \"icon\": $form-feedback-icon-valid,\n    \"tooltip-color\": #fff,\n    \"tooltip-bg-color\": var(--#{$prefix}success),\n    \"focus-box-shadow\": 0 0 $input-btn-focus-blur $input-focus-width rgba(var(--#{$prefix}success-rgb), $input-btn-focus-color-opacity),\n    \"border-color\": var(--#{$prefix}form-valid-border-color),\n  ),\n  \"invalid\": (\n    \"color\": var(--#{$prefix}form-invalid-color),\n    \"icon\": $form-feedback-icon-invalid,\n    \"tooltip-color\": #fff,\n    \"tooltip-bg-color\": var(--#{$prefix}danger),\n    \"focus-box-shadow\": 0 0 $input-btn-focus-blur $input-focus-width rgba(var(--#{$prefix}danger-rgb), $input-btn-focus-color-opacity),\n    \"border-color\": var(--#{$prefix}form-invalid-border-color),\n  )\n) !default;\n// scss-docs-end form-validation-states\n\n// Z-index master list\n//\n// Warning: Avoid customizing these values. They're used for a bird's eye view\n// of components dependent on the z-axis and are designed to all work together.\n\n// scss-docs-start zindex-stack\n$zindex-dropdown:                   1000 !default;\n$zindex-sticky:                     1020 !default;\n$zindex-fixed:                      1030 !default;\n$zindex-offcanvas-backdrop:         1040 !default;\n$zindex-offcanvas:                  1045 !default;\n$zindex-modal-backdrop:             1050 !default;\n$zindex-modal:                      1055 !default;\n$zindex-popover:                    1070 !default;\n$zindex-tooltip:                    1080 !default;\n$zindex-toast:                      1090 !default;\n// scss-docs-end zindex-stack\n\n// scss-docs-start zindex-levels-map\n$zindex-levels: (\n  n1: -1,\n  0: 0,\n  1: 1,\n  2: 2,\n  3: 3\n) !default;\n// scss-docs-end zindex-levels-map\n\n\n// Navs\n\n// scss-docs-start nav-variables\n$nav-link-padding-y:                .5rem !default;\n$nav-link-padding-x:                1rem !default;\n$nav-link-font-size:                null !default;\n$nav-link-font-weight:              null !default;\n$nav-link-color:                    var(--#{$prefix}link-color) !default;\n$nav-link-hover-color:              var(--#{$prefix}link-hover-color) !default;\n$nav-link-transition:               color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out !default;\n$nav-link-disabled-color:           var(--#{$prefix}secondary-color) !default;\n$nav-link-focus-box-shadow:         $focus-ring-box-shadow !default;\n\n$nav-tabs-border-color:             var(--#{$prefix}border-color) !default;\n$nav-tabs-border-width:             var(--#{$prefix}border-width) !default;\n$nav-tabs-border-radius:            var(--#{$prefix}border-radius) !default;\n$nav-tabs-link-hover-border-color:  var(--#{$prefix}secondary-bg) var(--#{$prefix}secondary-bg) $nav-tabs-border-color !default;\n$nav-tabs-link-active-color:        var(--#{$prefix}emphasis-color) !default;\n$nav-tabs-link-active-bg:           var(--#{$prefix}body-bg) !default;\n$nav-tabs-link-active-border-color: var(--#{$prefix}border-color) var(--#{$prefix}border-color) $nav-tabs-link-active-bg !default;\n\n$nav-pills-border-radius:           var(--#{$prefix}border-radius) !default;\n$nav-pills-link-active-color:       $component-active-color !default;\n$nav-pills-link-active-bg:          $component-active-bg !default;\n\n$nav-underline-gap:                 1rem !default;\n$nav-underline-border-width:        .125rem !default;\n$nav-underline-link-active-color:   var(--#{$prefix}emphasis-color) !default;\n// scss-docs-end nav-variables\n\n\n// Navbar\n\n// scss-docs-start navbar-variables\n$navbar-padding-y:                  $spacer * .5 !default;\n$navbar-padding-x:                  null !default;\n\n$navbar-nav-link-padding-x:         .5rem !default;\n\n$navbar-brand-font-size:            $font-size-lg !default;\n// Compute the navbar-brand padding-y so the navbar-brand will have the same height as navbar-text and nav-link\n$nav-link-height:                   $font-size-base * $line-height-base + $nav-link-padding-y * 2 !default;\n$navbar-brand-height:               $navbar-brand-font-size * $line-height-base !default;\n$navbar-brand-padding-y:            ($nav-link-height - $navbar-brand-height) * .5 !default;\n$navbar-brand-margin-end:           1rem !default;\n\n$navbar-toggler-padding-y:          .25rem !default;\n$navbar-toggler-padding-x:          .75rem !default;\n$navbar-toggler-font-size:          $font-size-lg !default;\n$navbar-toggler-border-radius:      $btn-border-radius !default;\n$navbar-toggler-focus-width:        $btn-focus-width !default;\n$navbar-toggler-transition:         box-shadow .15s ease-in-out !default;\n\n$navbar-light-color:                rgba(var(--#{$prefix}emphasis-color-rgb), .65) !default;\n$navbar-light-hover-color:          rgba(var(--#{$prefix}emphasis-color-rgb), .8) !default;\n$navbar-light-active-color:         rgba(var(--#{$prefix}emphasis-color-rgb), 1) !default;\n$navbar-light-disabled-color:       rgba(var(--#{$prefix}emphasis-color-rgb), .3) !default;\n$navbar-light-icon-color:           rgba($body-color, .75) !default;\n$navbar-light-toggler-icon-bg:      url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'><path stroke='#{$navbar-light-icon-color}' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/></svg>\") !default;\n$navbar-light-toggler-border-color: rgba(var(--#{$prefix}emphasis-color-rgb), .15) !default;\n$navbar-light-brand-color:          $navbar-light-active-color !default;\n$navbar-light-brand-hover-color:    $navbar-light-active-color !default;\n// scss-docs-end navbar-variables\n\n// scss-docs-start navbar-dark-variables\n$navbar-dark-color:                 rgba($white, .55) !default;\n$navbar-dark-hover-color:           rgba($white, .75) !default;\n$navbar-dark-active-color:          $white !default;\n$navbar-dark-disabled-color:        rgba($white, .25) !default;\n$navbar-dark-icon-color:            $navbar-dark-color !default;\n$navbar-dark-toggler-icon-bg:       url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'><path stroke='#{$navbar-dark-icon-color}' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/></svg>\") !default;\n$navbar-dark-toggler-border-color:  rgba($white, .1) !default;\n$navbar-dark-brand-color:           $navbar-dark-active-color !default;\n$navbar-dark-brand-hover-color:     $navbar-dark-active-color !default;\n// scss-docs-end navbar-dark-variables\n\n\n// Dropdowns\n//\n// Dropdown menu container and contents.\n\n// scss-docs-start dropdown-variables\n$dropdown-min-width:                10rem !default;\n$dropdown-padding-x:                0 !default;\n$dropdown-padding-y:                .5rem !default;\n$dropdown-spacer:                   .125rem !default;\n$dropdown-font-size:                $font-size-base !default;\n$dropdown-color:                    var(--#{$prefix}body-color) !default;\n$dropdown-bg:                       var(--#{$prefix}body-bg) !default;\n$dropdown-border-color:             var(--#{$prefix}border-color-translucent) !default;\n$dropdown-border-radius:            var(--#{$prefix}border-radius) !default;\n$dropdown-border-width:             var(--#{$prefix}border-width) !default;\n$dropdown-inner-border-radius:      calc(#{$dropdown-border-radius} - #{$dropdown-border-width}) !default; // stylelint-disable-line function-disallowed-list\n$dropdown-divider-bg:               $dropdown-border-color !default;\n$dropdown-divider-margin-y:         $spacer * .5 !default;\n$dropdown-box-shadow:               var(--#{$prefix}box-shadow) !default;\n\n$dropdown-link-color:               var(--#{$prefix}body-color) !default;\n$dropdown-link-hover-color:         $dropdown-link-color !default;\n$dropdown-link-hover-bg:            var(--#{$prefix}tertiary-bg) !default;\n\n$dropdown-link-active-color:        $component-active-color !default;\n$dropdown-link-active-bg:           $component-active-bg !default;\n\n$dropdown-link-disabled-color:      var(--#{$prefix}tertiary-color) !default;\n\n$dropdown-item-padding-y:           $spacer * .25 !default;\n$dropdown-item-padding-x:           $spacer !default;\n\n$dropdown-header-color:             $gray-600 !default;\n$dropdown-header-padding-x:         $dropdown-item-padding-x !default;\n$dropdown-header-padding-y:         $dropdown-padding-y !default;\n// fusv-disable\n$dropdown-header-padding:           $dropdown-header-padding-y $dropdown-header-padding-x !default; // Deprecated in v5.2.0\n// fusv-enable\n// scss-docs-end dropdown-variables\n\n// scss-docs-start dropdown-dark-variables\n$dropdown-dark-color:               $gray-300 !default;\n$dropdown-dark-bg:                  $gray-800 !default;\n$dropdown-dark-border-color:        $dropdown-border-color !default;\n$dropdown-dark-divider-bg:          $dropdown-divider-bg !default;\n$dropdown-dark-box-shadow:          null !default;\n$dropdown-dark-link-color:          $dropdown-dark-color !default;\n$dropdown-dark-link-hover-color:    $white !default;\n$dropdown-dark-link-hover-bg:       rgba($white, .15) !default;\n$dropdown-dark-link-active-color:   $dropdown-link-active-color !default;\n$dropdown-dark-link-active-bg:      $dropdown-link-active-bg !default;\n$dropdown-dark-link-disabled-color: $gray-500 !default;\n$dropdown-dark-header-color:        $gray-500 !default;\n// scss-docs-end dropdown-dark-variables\n\n\n// Pagination\n\n// scss-docs-start pagination-variables\n$pagination-padding-y:              .375rem !default;\n$pagination-padding-x:              .75rem !default;\n$pagination-padding-y-sm:           .25rem !default;\n$pagination-padding-x-sm:           .5rem !default;\n$pagination-padding-y-lg:           .75rem !default;\n$pagination-padding-x-lg:           1.5rem !default;\n\n$pagination-font-size:              $font-size-base !default;\n\n$pagination-color:                  var(--#{$prefix}link-color) !default;\n$pagination-bg:                     var(--#{$prefix}body-bg) !default;\n$pagination-border-radius:          var(--#{$prefix}border-radius) !default;\n$pagination-border-width:           var(--#{$prefix}border-width) !default;\n$pagination-margin-start:           calc(#{$pagination-border-width} * -1) !default; // stylelint-disable-line function-disallowed-list\n$pagination-border-color:           var(--#{$prefix}border-color) !default;\n\n$pagination-focus-color:            var(--#{$prefix}link-hover-color) !default;\n$pagination-focus-bg:               var(--#{$prefix}secondary-bg) !default;\n$pagination-focus-box-shadow:       $focus-ring-box-shadow !default;\n$pagination-focus-outline:          0 !default;\n\n$pagination-hover-color:            var(--#{$prefix}link-hover-color) !default;\n$pagination-hover-bg:               var(--#{$prefix}tertiary-bg) !default;\n$pagination-hover-border-color:     var(--#{$prefix}border-color) !default; // Todo in v6: remove this?\n\n$pagination-active-color:           $component-active-color !default;\n$pagination-active-bg:              $component-active-bg !default;\n$pagination-active-border-color:    $component-active-bg !default;\n\n$pagination-disabled-color:         var(--#{$prefix}secondary-color) !default;\n$pagination-disabled-bg:            var(--#{$prefix}secondary-bg) !default;\n$pagination-disabled-border-color:  var(--#{$prefix}border-color) !default;\n\n$pagination-transition:              color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out !default;\n\n$pagination-border-radius-sm:       var(--#{$prefix}border-radius-sm) !default;\n$pagination-border-radius-lg:       var(--#{$prefix}border-radius-lg) !default;\n// scss-docs-end pagination-variables\n\n\n// Placeholders\n\n// scss-docs-start placeholders\n$placeholder-opacity-max:           .5 !default;\n$placeholder-opacity-min:           .2 !default;\n// scss-docs-end placeholders\n\n// Cards\n\n// scss-docs-start card-variables\n$card-spacer-y:                     $spacer !default;\n$card-spacer-x:                     $spacer !default;\n$card-title-spacer-y:               $spacer * .5 !default;\n$card-title-color:                  null !default;\n$card-subtitle-color:               null !default;\n$card-border-width:                 var(--#{$prefix}border-width) !default;\n$card-border-color:                 var(--#{$prefix}border-color-translucent) !default;\n$card-border-radius:                var(--#{$prefix}border-radius) !default;\n$card-box-shadow:                   null !default;\n$card-inner-border-radius:          subtract($card-border-radius, $card-border-width) !default;\n$card-cap-padding-y:                $card-spacer-y * .5 !default;\n$card-cap-padding-x:                $card-spacer-x !default;\n$card-cap-bg:                       rgba(var(--#{$prefix}body-color-rgb), .03) !default;\n$card-cap-color:                    null !default;\n$card-height:                       null !default;\n$card-color:                        null !default;\n$card-bg:                           var(--#{$prefix}body-bg) !default;\n$card-img-overlay-padding:          $spacer !default;\n$card-group-margin:                 $grid-gutter-width * .5 !default;\n// scss-docs-end card-variables\n\n// Accordion\n\n// scss-docs-start accordion-variables\n$accordion-padding-y:                     1rem !default;\n$accordion-padding-x:                     1.25rem !default;\n$accordion-color:                         var(--#{$prefix}body-color) !default;\n$accordion-bg:                            var(--#{$prefix}body-bg) !default;\n$accordion-border-width:                  var(--#{$prefix}border-width) !default;\n$accordion-border-color:                  var(--#{$prefix}border-color) !default;\n$accordion-border-radius:                 var(--#{$prefix}border-radius) !default;\n$accordion-inner-border-radius:           subtract($accordion-border-radius, $accordion-border-width) !default;\n\n$accordion-body-padding-y:                $accordion-padding-y !default;\n$accordion-body-padding-x:                $accordion-padding-x !default;\n\n$accordion-button-padding-y:              $accordion-padding-y !default;\n$accordion-button-padding-x:              $accordion-padding-x !default;\n$accordion-button-color:                  var(--#{$prefix}body-color) !default;\n$accordion-button-bg:                     var(--#{$prefix}accordion-bg) !default;\n$accordion-transition:                    $btn-transition, border-radius .15s ease !default;\n$accordion-button-active-bg:              var(--#{$prefix}primary-bg-subtle) !default;\n$accordion-button-active-color:           var(--#{$prefix}primary-text-emphasis) !default;\n\n$accordion-button-focus-border-color:     $input-focus-border-color !default;\n$accordion-button-focus-box-shadow:       $btn-focus-box-shadow !default;\n\n$accordion-icon-width:                    1.25rem !default;\n$accordion-icon-color:                    $body-color !default;\n$accordion-icon-active-color:             $primary-text-emphasis !default;\n$accordion-icon-transition:               transform .2s ease-in-out !default;\n$accordion-icon-transform:                rotate(-180deg) !default;\n\n$accordion-button-icon:         url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#{$accordion-icon-color}'><path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/></svg>\") !default;\n$accordion-button-active-icon:  url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#{$accordion-icon-active-color}'><path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/></svg>\") !default;\n// scss-docs-end accordion-variables\n\n// Tooltips\n\n// scss-docs-start tooltip-variables\n$tooltip-font-size:                 $font-size-sm !default;\n$tooltip-max-width:                 200px !default;\n$tooltip-color:                     var(--#{$prefix}body-bg) !default;\n$tooltip-bg:                        var(--#{$prefix}emphasis-color) !default;\n$tooltip-border-radius:             var(--#{$prefix}border-radius) !default;\n$tooltip-opacity:                   .9 !default;\n$tooltip-padding-y:                 $spacer * .25 !default;\n$tooltip-padding-x:                 $spacer * .5 !default;\n$tooltip-margin:                    null !default; // TODO: remove this in v6\n\n$tooltip-arrow-width:               .8rem !default;\n$tooltip-arrow-height:              .4rem !default;\n// fusv-disable\n$tooltip-arrow-color:               null !default; // Deprecated in Bootstrap 5.2.0 for CSS variables\n// fusv-enable\n// scss-docs-end tooltip-variables\n\n// Form tooltips must come after regular tooltips\n// scss-docs-start tooltip-feedback-variables\n$form-feedback-tooltip-padding-y:     $tooltip-padding-y !default;\n$form-feedback-tooltip-padding-x:     $tooltip-padding-x !default;\n$form-feedback-tooltip-font-size:     $tooltip-font-size !default;\n$form-feedback-tooltip-line-height:   null !default;\n$form-feedback-tooltip-opacity:       $tooltip-opacity !default;\n$form-feedback-tooltip-border-radius: $tooltip-border-radius !default;\n// scss-docs-end tooltip-feedback-variables\n\n\n// Popovers\n\n// scss-docs-start popover-variables\n$popover-font-size:                 $font-size-sm !default;\n$popover-bg:                        var(--#{$prefix}body-bg) !default;\n$popover-max-width:                 276px !default;\n$popover-border-width:              var(--#{$prefix}border-width) !default;\n$popover-border-color:              var(--#{$prefix}border-color-translucent) !default;\n$popover-border-radius:             var(--#{$prefix}border-radius-lg) !default;\n$popover-inner-border-radius:       calc(#{$popover-border-radius} - #{$popover-border-width}) !default; // stylelint-disable-line function-disallowed-list\n$popover-box-shadow:                var(--#{$prefix}box-shadow) !default;\n\n$popover-header-font-size:          $font-size-base !default;\n$popover-header-bg:                 var(--#{$prefix}secondary-bg) !default;\n$popover-header-color:              $headings-color !default;\n$popover-header-padding-y:          .5rem !default;\n$popover-header-padding-x:          $spacer !default;\n\n$popover-body-color:                var(--#{$prefix}body-color) !default;\n$popover-body-padding-y:            $spacer !default;\n$popover-body-padding-x:            $spacer !default;\n\n$popover-arrow-width:               1rem !default;\n$popover-arrow-height:              .5rem !default;\n// scss-docs-end popover-variables\n\n// fusv-disable\n// Deprecated in Bootstrap 5.2.0 for CSS variables\n$popover-arrow-color:               $popover-bg !default;\n$popover-arrow-outer-color:         var(--#{$prefix}border-color-translucent) !default;\n// fusv-enable\n\n\n// Toasts\n\n// scss-docs-start toast-variables\n$toast-max-width:                   350px !default;\n$toast-padding-x:                   .75rem !default;\n$toast-padding-y:                   .5rem !default;\n$toast-font-size:                   .875rem !default;\n$toast-color:                       null !default;\n$toast-background-color:            rgba(var(--#{$prefix}body-bg-rgb), .85) !default;\n$toast-border-width:                var(--#{$prefix}border-width) !default;\n$toast-border-color:                var(--#{$prefix}border-color-translucent) !default;\n$toast-border-radius:               var(--#{$prefix}border-radius) !default;\n$toast-box-shadow:                  var(--#{$prefix}box-shadow) !default;\n$toast-spacing:                     $container-padding-x !default;\n\n$toast-header-color:                var(--#{$prefix}secondary-color) !default;\n$toast-header-background-color:     rgba(var(--#{$prefix}body-bg-rgb), .85) !default;\n$toast-header-border-color:         $toast-border-color !default;\n// scss-docs-end toast-variables\n\n\n// Badges\n\n// scss-docs-start badge-variables\n$badge-font-size:                   .75em !default;\n$badge-font-weight:                 $font-weight-bold !default;\n$badge-color:                       $white !default;\n$badge-padding-y:                   .35em !default;\n$badge-padding-x:                   .65em !default;\n$badge-border-radius:               var(--#{$prefix}border-radius) !default;\n// scss-docs-end badge-variables\n\n\n// Modals\n\n// scss-docs-start modal-variables\n$modal-inner-padding:               $spacer !default;\n\n$modal-footer-margin-between:       .5rem !default;\n\n$modal-dialog-margin:               .5rem !default;\n$modal-dialog-margin-y-sm-up:       1.75rem !default;\n\n$modal-title-line-height:           $line-height-base !default;\n\n$modal-content-color:               null !default;\n$modal-content-bg:                  var(--#{$prefix}body-bg) !default;\n$modal-content-border-color:        var(--#{$prefix}border-color-translucent) !default;\n$modal-content-border-width:        var(--#{$prefix}border-width) !default;\n$modal-content-border-radius:       var(--#{$prefix}border-radius-lg) !default;\n$modal-content-inner-border-radius: subtract($modal-content-border-radius, $modal-content-border-width) !default;\n$modal-content-box-shadow-xs:       var(--#{$prefix}box-shadow-sm) !default;\n$modal-content-box-shadow-sm-up:    var(--#{$prefix}box-shadow) !default;\n\n$modal-backdrop-bg:                 $black !default;\n$modal-backdrop-opacity:            .5 !default;\n\n$modal-header-border-color:         var(--#{$prefix}border-color) !default;\n$modal-header-border-width:         $modal-content-border-width !default;\n$modal-header-padding-y:            $modal-inner-padding !default;\n$modal-header-padding-x:            $modal-inner-padding !default;\n$modal-header-padding:              $modal-header-padding-y $modal-header-padding-x !default; // Keep this for backwards compatibility\n\n$modal-footer-bg:                   null !default;\n$modal-footer-border-color:         $modal-header-border-color !default;\n$modal-footer-border-width:         $modal-header-border-width !default;\n\n$modal-sm:                          300px !default;\n$modal-md:                          500px !default;\n$modal-lg:                          800px !default;\n$modal-xl:                          1140px !default;\n\n$modal-fade-transform:              translate(0, -50px) !default;\n$modal-show-transform:              none !default;\n$modal-transition:                  transform .3s ease-out !default;\n$modal-scale-transform:             scale(1.02) !default;\n// scss-docs-end modal-variables\n\n\n// Alerts\n//\n// Define alert colors, border radius, and padding.\n\n// scss-docs-start alert-variables\n$alert-padding-y:               $spacer !default;\n$alert-padding-x:               $spacer !default;\n$alert-margin-bottom:           1rem !default;\n$alert-border-radius:           var(--#{$prefix}border-radius) !default;\n$alert-link-font-weight:        $font-weight-bold !default;\n$alert-border-width:            var(--#{$prefix}border-width) !default;\n$alert-dismissible-padding-r:   $alert-padding-x * 3 !default; // 3x covers width of x plus default padding on either side\n// scss-docs-end alert-variables\n\n// fusv-disable\n$alert-bg-scale:                -80% !default; // Deprecated in v5.2.0, to be removed in v6\n$alert-border-scale:            -70% !default; // Deprecated in v5.2.0, to be removed in v6\n$alert-color-scale:             40% !default; // Deprecated in v5.2.0, to be removed in v6\n// fusv-enable\n\n// Progress bars\n\n// scss-docs-start progress-variables\n$progress-height:                   1rem !default;\n$progress-font-size:                $font-size-base * .75 !default;\n$progress-bg:                       var(--#{$prefix}secondary-bg) !default;\n$progress-border-radius:            var(--#{$prefix}border-radius) !default;\n$progress-box-shadow:               var(--#{$prefix}box-shadow-inset) !default;\n$progress-bar-color:                $white !default;\n$progress-bar-bg:                   $primary !default;\n$progress-bar-animation-timing:     1s linear infinite !default;\n$progress-bar-transition:           width .6s ease !default;\n// scss-docs-end progress-variables\n\n\n// List group\n\n// scss-docs-start list-group-variables\n$list-group-color:                  var(--#{$prefix}body-color) !default;\n$list-group-bg:                     var(--#{$prefix}body-bg) !default;\n$list-group-border-color:           var(--#{$prefix}border-color) !default;\n$list-group-border-width:           var(--#{$prefix}border-width) !default;\n$list-group-border-radius:          var(--#{$prefix}border-radius) !default;\n\n$list-group-item-padding-y:         $spacer * .5 !default;\n$list-group-item-padding-x:         $spacer !default;\n// fusv-disable\n$list-group-item-bg-scale:          -80% !default; // Deprecated in v5.3.0\n$list-group-item-color-scale:       40% !default; // Deprecated in v5.3.0\n// fusv-enable\n\n$list-group-hover-bg:               var(--#{$prefix}tertiary-bg) !default;\n$list-group-active-color:           $component-active-color !default;\n$list-group-active-bg:              $component-active-bg !default;\n$list-group-active-border-color:    $list-group-active-bg !default;\n\n$list-group-disabled-color:         var(--#{$prefix}secondary-color) !default;\n$list-group-disabled-bg:            $list-group-bg !default;\n\n$list-group-action-color:           var(--#{$prefix}secondary-color) !default;\n$list-group-action-hover-color:     var(--#{$prefix}emphasis-color) !default;\n\n$list-group-action-active-color:    var(--#{$prefix}body-color) !default;\n$list-group-action-active-bg:       var(--#{$prefix}secondary-bg) !default;\n// scss-docs-end list-group-variables\n\n\n// Image thumbnails\n\n// scss-docs-start thumbnail-variables\n$thumbnail-padding:                 .25rem !default;\n$thumbnail-bg:                      var(--#{$prefix}body-bg) !default;\n$thumbnail-border-width:            var(--#{$prefix}border-width) !default;\n$thumbnail-border-color:            var(--#{$prefix}border-color) !default;\n$thumbnail-border-radius:           var(--#{$prefix}border-radius) !default;\n$thumbnail-box-shadow:              var(--#{$prefix}box-shadow-sm) !default;\n// scss-docs-end thumbnail-variables\n\n\n// Figures\n\n// scss-docs-start figure-variables\n$figure-caption-font-size:          $small-font-size !default;\n$figure-caption-color:              var(--#{$prefix}secondary-color) !default;\n// scss-docs-end figure-variables\n\n\n// Breadcrumbs\n\n// scss-docs-start breadcrumb-variables\n$breadcrumb-font-size:              null !default;\n$breadcrumb-padding-y:              0 !default;\n$breadcrumb-padding-x:              0 !default;\n$breadcrumb-item-padding-x:         .5rem !default;\n$breadcrumb-margin-bottom:          1rem !default;\n$breadcrumb-bg:                     null !default;\n$breadcrumb-divider-color:          var(--#{$prefix}secondary-color) !default;\n$breadcrumb-active-color:           var(--#{$prefix}secondary-color) !default;\n$breadcrumb-divider:                quote(\"/\") !default;\n$breadcrumb-divider-flipped:        $breadcrumb-divider !default;\n$breadcrumb-border-radius:          null !default;\n// scss-docs-end breadcrumb-variables\n\n// Carousel\n\n// scss-docs-start carousel-variables\n$carousel-control-color:             $white !default;\n$carousel-control-width:             15% !default;\n$carousel-control-opacity:           .5 !default;\n$carousel-control-hover-opacity:     .9 !default;\n$carousel-control-transition:        opacity .15s ease !default;\n\n$carousel-indicator-width:           30px !default;\n$carousel-indicator-height:          3px !default;\n$carousel-indicator-hit-area-height: 10px !default;\n$carousel-indicator-spacer:          3px !default;\n$carousel-indicator-opacity:         .5 !default;\n$carousel-indicator-active-bg:       $white !default;\n$carousel-indicator-active-opacity:  1 !default;\n$carousel-indicator-transition:      opacity .6s ease !default;\n\n$carousel-caption-width:             70% !default;\n$carousel-caption-color:             $white !default;\n$carousel-caption-padding-y:         1.25rem !default;\n$carousel-caption-spacer:            1.25rem !default;\n\n$carousel-control-icon-width:        2rem !default;\n\n$carousel-control-prev-icon-bg:      url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#{$carousel-control-color}'><path d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/></svg>\") !default;\n$carousel-control-next-icon-bg:      url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#{$carousel-control-color}'><path d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/></svg>\") !default;\n\n$carousel-transition-duration:       .6s !default;\n$carousel-transition:                transform $carousel-transition-duration ease-in-out !default; // Define transform transition first if using multiple transitions (e.g., `transform 2s ease, opacity .5s ease-out`)\n// scss-docs-end carousel-variables\n\n// scss-docs-start carousel-dark-variables\n$carousel-dark-indicator-active-bg:  $black !default;\n$carousel-dark-caption-color:        $black !default;\n$carousel-dark-control-icon-filter:  invert(1) grayscale(100) !default;\n// scss-docs-end carousel-dark-variables\n\n\n// Spinners\n\n// scss-docs-start spinner-variables\n$spinner-width:           2rem !default;\n$spinner-height:          $spinner-width !default;\n$spinner-vertical-align:  -.125em !default;\n$spinner-border-width:    .25em !default;\n$spinner-animation-speed: .75s !default;\n\n$spinner-width-sm:        1rem !default;\n$spinner-height-sm:       $spinner-width-sm !default;\n$spinner-border-width-sm: .2em !default;\n// scss-docs-end spinner-variables\n\n\n// Close\n\n// scss-docs-start close-variables\n$btn-close-width:            1em !default;\n$btn-close-height:           $btn-close-width !default;\n$btn-close-padding-x:        .25em !default;\n$btn-close-padding-y:        $btn-close-padding-x !default;\n$btn-close-color:            $black !default;\n$btn-close-bg:               url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#{$btn-close-color}'><path d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/></svg>\") !default;\n$btn-close-focus-shadow:     $focus-ring-box-shadow !default;\n$btn-close-opacity:          .5 !default;\n$btn-close-hover-opacity:    .75 !default;\n$btn-close-focus-opacity:    1 !default;\n$btn-close-disabled-opacity: .25 !default;\n$btn-close-white-filter:     invert(1) grayscale(100%) brightness(200%) !default;\n// scss-docs-end close-variables\n\n\n// Offcanvas\n\n// scss-docs-start offcanvas-variables\n$offcanvas-padding-y:               $modal-inner-padding !default;\n$offcanvas-padding-x:               $modal-inner-padding !default;\n$offcanvas-horizontal-width:        400px !default;\n$offcanvas-vertical-height:         30vh !default;\n$offcanvas-transition-duration:     .3s !default;\n$offcanvas-border-color:            $modal-content-border-color !default;\n$offcanvas-border-width:            $modal-content-border-width !default;\n$offcanvas-title-line-height:       $modal-title-line-height !default;\n$offcanvas-bg-color:                var(--#{$prefix}body-bg) !default;\n$offcanvas-color:                   var(--#{$prefix}body-color) !default;\n$offcanvas-box-shadow:              $modal-content-box-shadow-xs !default;\n$offcanvas-backdrop-bg:             $modal-backdrop-bg !default;\n$offcanvas-backdrop-opacity:        $modal-backdrop-opacity !default;\n// scss-docs-end offcanvas-variables\n\n// Code\n\n$code-font-size:                    $small-font-size !default;\n$code-color:                        $pink !default;\n\n$kbd-padding-y:                     .1875rem !default;\n$kbd-padding-x:                     .375rem !default;\n$kbd-font-size:                     $code-font-size !default;\n$kbd-color:                         var(--#{$prefix}body-bg) !default;\n$kbd-bg:                            var(--#{$prefix}body-color) !default;\n$nested-kbd-font-weight:            null !default; // Deprecated in v5.2.0, removing in v6\n\n$pre-color:                         null !default;\n","// stylelint-disable property-disallowed-list\n// Single side border-radius\n\n// Helper function to replace negative values with 0\n@function valid-radius($radius) {\n  $return: ();\n  @each $value in $radius {\n    @if type-of($value) == number {\n      $return: append($return, max($value, 0));\n    } @else {\n      $return: append($return, $value);\n    }\n  }\n  @return $return;\n}\n\n// scss-docs-start border-radius-mixins\n@mixin border-radius($radius: $border-radius, $fallback-border-radius: false) {\n  @if $enable-rounded {\n    border-radius: valid-radius($radius);\n  }\n  @else if $fallback-border-radius != false {\n    border-radius: $fallback-border-radius;\n  }\n}\n\n@mixin border-top-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-top-left-radius: valid-radius($radius);\n    border-top-right-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-end-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-top-right-radius: valid-radius($radius);\n    border-bottom-right-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-bottom-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-bottom-right-radius: valid-radius($radius);\n    border-bottom-left-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-start-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-top-left-radius: valid-radius($radius);\n    border-bottom-left-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-top-start-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-top-left-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-top-end-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-top-right-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-bottom-end-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-bottom-right-radius: valid-radius($radius);\n  }\n}\n\n@mixin border-bottom-start-radius($radius: $border-radius) {\n  @if $enable-rounded {\n    border-bottom-left-radius: valid-radius($radius);\n  }\n}\n// scss-docs-end border-radius-mixins\n","//\n// Headings\n//\n.h1 {\n  @extend h1;\n}\n\n.h2 {\n  @extend h2;\n}\n\n.h3 {\n  @extend h3;\n}\n\n.h4 {\n  @extend h4;\n}\n\n.h5 {\n  @extend h5;\n}\n\n.h6 {\n  @extend h6;\n}\n\n\n.lead {\n  @include font-size($lead-font-size);\n  font-weight: $lead-font-weight;\n}\n\n// Type display classes\n@each $display, $font-size in $display-font-sizes {\n  .display-#{$display} {\n    @include font-size($font-size);\n    font-family: $display-font-family;\n    font-style: $display-font-style;\n    font-weight: $display-font-weight;\n    line-height: $display-line-height;\n  }\n}\n\n//\n// Emphasis\n//\n.small {\n  @extend small;\n}\n\n.mark {\n  @extend mark;\n}\n\n//\n// Lists\n//\n\n.list-unstyled {\n  @include list-unstyled();\n}\n\n// Inline turns list items into inline-block\n.list-inline {\n  @include list-unstyled();\n}\n.list-inline-item {\n  display: inline-block;\n\n  &:not(:last-child) {\n    margin-right: $list-inline-padding;\n  }\n}\n\n\n//\n// Misc\n//\n\n// Builds on `abbr`\n.initialism {\n  @include font-size($initialism-font-size);\n  text-transform: uppercase;\n}\n\n// Blockquotes\n.blockquote {\n  margin-bottom: $blockquote-margin-y;\n  @include font-size($blockquote-font-size);\n\n  > :last-child {\n    margin-bottom: 0;\n  }\n}\n\n.blockquote-footer {\n  margin-top: -$blockquote-margin-y;\n  margin-bottom: $blockquote-margin-y;\n  @include font-size($blockquote-footer-font-size);\n  color: $blockquote-footer-color;\n\n  &::before {\n    content: \"\\2014\\00A0\"; // em dash, nbsp\n  }\n}\n","// Lists\n\n// Unstyled keeps list items block level, just removes default browser padding and list-style\n@mixin list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n","// Responsive images (ensure images don't scale beyond their parents)\n//\n// This is purposefully opt-in via an explicit class rather than being the default for all `<img>`s.\n// We previously tried the \"images are responsive by default\" approach in Bootstrap v2,\n// and abandoned it in Bootstrap v3 because it breaks lots of third-party widgets (including Google Maps)\n// which weren't expecting the images within themselves to be involuntarily resized.\n// See also https://github.com/twbs/bootstrap/issues/18178\n.img-fluid {\n  @include img-fluid();\n}\n\n\n// Image thumbnails\n.img-thumbnail {\n  padding: $thumbnail-padding;\n  background-color: $thumbnail-bg;\n  border: $thumbnail-border-width solid $thumbnail-border-color;\n  @include border-radius($thumbnail-border-radius);\n  @include box-shadow($thumbnail-box-shadow);\n\n  // Keep them at most 100% wide\n  @include img-fluid();\n}\n\n//\n// Figures\n//\n\n.figure {\n  // Ensures the caption's text aligns with the image.\n  display: inline-block;\n}\n\n.figure-img {\n  margin-bottom: $spacer * .5;\n  line-height: 1;\n}\n\n.figure-caption {\n  @include font-size($figure-caption-font-size);\n  color: $figure-caption-color;\n}\n","// Image Mixins\n// - Responsive image\n// - Retina image\n\n\n// Responsive image\n//\n// Keep images from scaling beyond the width of their parents.\n\n@mixin img-fluid {\n  // Part 1: Set a maximum relative to the parent\n  max-width: 100%;\n  // Part 2: Override the height to auto, otherwise images will be stretched\n  // when setting a width and height attribute on the img element.\n  height: auto;\n}\n","// Container widths\n//\n// Set the container width, and override it for fixed navbars in media queries.\n\n@if $enable-container-classes {\n  // Single container class with breakpoint max-widths\n  .container,\n  // 100% wide container at all breakpoints\n  .container-fluid {\n    @include make-container();\n  }\n\n  // Responsive containers that are 100% wide until a breakpoint\n  @each $breakpoint, $container-max-width in $container-max-widths {\n    .container-#{$breakpoint} {\n      @extend .container-fluid;\n    }\n\n    @include media-breakpoint-up($breakpoint, $grid-breakpoints) {\n      %responsive-container-#{$breakpoint} {\n        max-width: $container-max-width;\n      }\n\n      // Extend each breakpoint which is smaller or equal to the current breakpoint\n      $extend-breakpoint: true;\n\n      @each $name, $width in $grid-breakpoints {\n        @if ($extend-breakpoint) {\n          .container#{breakpoint-infix($name, $grid-breakpoints)} {\n            @extend %responsive-container-#{$breakpoint};\n          }\n\n          // Once the current breakpoint is reached, stop extending\n          @if ($breakpoint == $name) {\n            $extend-breakpoint: false;\n          }\n        }\n      }\n    }\n  }\n}\n","// Container mixins\n\n@mixin make-container($gutter: $container-padding-x) {\n  --#{$prefix}gutter-x: #{$gutter};\n  --#{$prefix}gutter-y: 0;\n  width: 100%;\n  padding-right: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  padding-left: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  margin-right: auto;\n  margin-left: auto;\n}\n","// Breakpoint viewport sizes and media queries.\n//\n// Breakpoints are defined as a map of (name: minimum width), order from small to large:\n//\n//    (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px)\n//\n// The map defined in the `$grid-breakpoints` global variable is used as the `$breakpoints` argument by default.\n\n// Name of the next breakpoint, or null for the last breakpoint.\n//\n//    >> breakpoint-next(sm)\n//    md\n//    >> breakpoint-next(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    md\n//    >> breakpoint-next(sm, $breakpoint-names: (xs sm md lg xl xxl))\n//    md\n@function breakpoint-next($name, $breakpoints: $grid-breakpoints, $breakpoint-names: map-keys($breakpoints)) {\n  $n: index($breakpoint-names, $name);\n  @if not $n {\n    @error \"breakpoint `#{$name}` not found in `#{$breakpoints}`\";\n  }\n  @return if($n < length($breakpoint-names), nth($breakpoint-names, $n + 1), null);\n}\n\n// Minimum breakpoint width. Null for the smallest (first) breakpoint.\n//\n//    >> breakpoint-min(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    576px\n@function breakpoint-min($name, $breakpoints: $grid-breakpoints) {\n  $min: map-get($breakpoints, $name);\n  @return if($min != 0, $min, null);\n}\n\n// Maximum breakpoint width.\n// The maximum value is reduced by 0.02px to work around the limitations of\n// `min-` and `max-` prefixes and viewports with fractional widths.\n// See https://www.w3.org/TR/mediaqueries-4/#mq-min-max\n// Uses 0.02px rather than 0.01px to work around a current rounding bug in Safari.\n// See https://bugs.webkit.org/show_bug.cgi?id=178261\n//\n//    >> breakpoint-max(md, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    767.98px\n@function breakpoint-max($name, $breakpoints: $grid-breakpoints) {\n  $max: map-get($breakpoints, $name);\n  @return if($max and $max > 0, $max - .02, null);\n}\n\n// Returns a blank string if smallest breakpoint, otherwise returns the name with a dash in front.\n// Useful for making responsive utilities.\n//\n//    >> breakpoint-infix(xs, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    \"\"  (Returns a blank string)\n//    >> breakpoint-infix(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    \"-sm\"\n@function breakpoint-infix($name, $breakpoints: $grid-breakpoints) {\n  @return if(breakpoint-min($name, $breakpoints) == null, \"\", \"-#{$name}\");\n}\n\n// Media of at least the minimum breakpoint width. No query for the smallest breakpoint.\n// Makes the @content apply to the given breakpoint and wider.\n@mixin media-breakpoint-up($name, $breakpoints: $grid-breakpoints) {\n  $min: breakpoint-min($name, $breakpoints);\n  @if $min {\n    @media (min-width: $min) {\n      @content;\n    }\n  } @else {\n    @content;\n  }\n}\n\n// Media of at most the maximum breakpoint width. No query for the largest breakpoint.\n// Makes the @content apply to the given breakpoint and narrower.\n@mixin media-breakpoint-down($name, $breakpoints: $grid-breakpoints) {\n  $max: breakpoint-max($name, $breakpoints);\n  @if $max {\n    @media (max-width: $max) {\n      @content;\n    }\n  } @else {\n    @content;\n  }\n}\n\n// Media that spans multiple breakpoint widths.\n// Makes the @content apply between the min and max breakpoints\n@mixin media-breakpoint-between($lower, $upper, $breakpoints: $grid-breakpoints) {\n  $min: breakpoint-min($lower, $breakpoints);\n  $max: breakpoint-max($upper, $breakpoints);\n\n  @if $min != null and $max != null {\n    @media (min-width: $min) and (max-width: $max) {\n      @content;\n    }\n  } @else if $max == null {\n    @include media-breakpoint-up($lower, $breakpoints) {\n      @content;\n    }\n  } @else if $min == null {\n    @include media-breakpoint-down($upper, $breakpoints) {\n      @content;\n    }\n  }\n}\n\n// Media between the breakpoint's minimum and maximum widths.\n// No minimum for the smallest breakpoint, and no maximum for the largest one.\n// Makes the @content apply only to the given breakpoint, not viewports any wider or narrower.\n@mixin media-breakpoint-only($name, $breakpoints: $grid-breakpoints) {\n  $min:  breakpoint-min($name, $breakpoints);\n  $next: breakpoint-next($name, $breakpoints);\n  $max:  breakpoint-max($next, $breakpoints);\n\n  @if $min != null and $max != null {\n    @media (min-width: $min) and (max-width: $max) {\n      @content;\n    }\n  } @else if $max == null {\n    @include media-breakpoint-up($name, $breakpoints) {\n      @content;\n    }\n  } @else if $min == null {\n    @include media-breakpoint-down($next, $breakpoints) {\n      @content;\n    }\n  }\n}\n","// Row\n//\n// Rows contain your columns.\n\n:root {\n  @each $name, $value in $grid-breakpoints {\n    --#{$prefix}breakpoint-#{$name}: #{$value};\n  }\n}\n\n@if $enable-grid-classes {\n  .row {\n    @include make-row();\n\n    > * {\n      @include make-col-ready();\n    }\n  }\n}\n\n@if $enable-cssgrid {\n  .grid {\n    display: grid;\n    grid-template-rows: repeat(var(--#{$prefix}rows, 1), 1fr);\n    grid-template-columns: repeat(var(--#{$prefix}columns, #{$grid-columns}), 1fr);\n    gap: var(--#{$prefix}gap, #{$grid-gutter-width});\n\n    @include make-cssgrid();\n  }\n}\n\n\n// Columns\n//\n// Common styles for small and large grid columns\n\n@if $enable-grid-classes {\n  @include make-grid-columns();\n}\n","// Grid system\n//\n// Generate semantic grid columns with these mixins.\n\n@mixin make-row($gutter: $grid-gutter-width) {\n  --#{$prefix}gutter-x: #{$gutter};\n  --#{$prefix}gutter-y: 0;\n  display: flex;\n  flex-wrap: wrap;\n  // TODO: Revisit calc order after https://github.com/react-bootstrap/react-bootstrap/issues/6039 is fixed\n  margin-top: calc(-1 * var(--#{$prefix}gutter-y)); // stylelint-disable-line function-disallowed-list\n  margin-right: calc(-.5 * var(--#{$prefix}gutter-x)); // stylelint-disable-line function-disallowed-list\n  margin-left: calc(-.5 * var(--#{$prefix}gutter-x)); // stylelint-disable-line function-disallowed-list\n}\n\n@mixin make-col-ready() {\n  // Add box sizing if only the grid is loaded\n  box-sizing: if(variable-exists(include-column-box-sizing) and $include-column-box-sizing, border-box, null);\n  // Prevent columns from becoming too narrow when at smaller grid tiers by\n  // always setting `width: 100%;`. This works because we set the width\n  // later on to override this initial width.\n  flex-shrink: 0;\n  width: 100%;\n  max-width: 100%; // Prevent `.col-auto`, `.col` (& responsive variants) from breaking out the grid\n  padding-right: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  padding-left: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  margin-top: var(--#{$prefix}gutter-y);\n}\n\n@mixin make-col($size: false, $columns: $grid-columns) {\n  @if $size {\n    flex: 0 0 auto;\n    width: percentage(divide($size, $columns));\n\n  } @else {\n    flex: 1 1 0;\n    max-width: 100%;\n  }\n}\n\n@mixin make-col-auto() {\n  flex: 0 0 auto;\n  width: auto;\n}\n\n@mixin make-col-offset($size, $columns: $grid-columns) {\n  $num: divide($size, $columns);\n  margin-left: if($num == 0, 0, percentage($num));\n}\n\n// Row columns\n//\n// Specify on a parent element(e.g., .row) to force immediate children into NN\n// number of columns. Supports wrapping to new lines, but does not do a Masonry\n// style grid.\n@mixin row-cols($count) {\n  > * {\n    flex: 0 0 auto;\n    width: percentage(divide(1, $count));\n  }\n}\n\n// Framework grid generation\n//\n// Used only by Bootstrap to generate the correct number of grid classes given\n// any value of `$grid-columns`.\n\n@mixin make-grid-columns($columns: $grid-columns, $gutter: $grid-gutter-width, $breakpoints: $grid-breakpoints) {\n  @each $breakpoint in map-keys($breakpoints) {\n    $infix: breakpoint-infix($breakpoint, $breakpoints);\n\n    @include media-breakpoint-up($breakpoint, $breakpoints) {\n      // Provide basic `.col-{bp}` classes for equal-width flexbox columns\n      .col#{$infix} {\n        flex: 1 0 0%; // Flexbugs #4: https://github.com/philipwalton/flexbugs#flexbug-4\n      }\n\n      .row-cols#{$infix}-auto > * {\n        @include make-col-auto();\n      }\n\n      @if $grid-row-columns > 0 {\n        @for $i from 1 through $grid-row-columns {\n          .row-cols#{$infix}-#{$i} {\n            @include row-cols($i);\n          }\n        }\n      }\n\n      .col#{$infix}-auto {\n        @include make-col-auto();\n      }\n\n      @if $columns > 0 {\n        @for $i from 1 through $columns {\n          .col#{$infix}-#{$i} {\n            @include make-col($i, $columns);\n          }\n        }\n\n        // `$columns - 1` because offsetting by the width of an entire row isn't possible\n        @for $i from 0 through ($columns - 1) {\n          @if not ($infix == \"\" and $i == 0) { // Avoid emitting useless .offset-0\n            .offset#{$infix}-#{$i} {\n              @include make-col-offset($i, $columns);\n            }\n          }\n        }\n      }\n\n      // Gutters\n      //\n      // Make use of `.g-*`, `.gx-*` or `.gy-*` utilities to change spacing between the columns.\n      @each $key, $value in $gutters {\n        .g#{$infix}-#{$key},\n        .gx#{$infix}-#{$key} {\n          --#{$prefix}gutter-x: #{$value};\n        }\n\n        .g#{$infix}-#{$key},\n        .gy#{$infix}-#{$key} {\n          --#{$prefix}gutter-y: #{$value};\n        }\n      }\n    }\n  }\n}\n\n@mixin make-cssgrid($columns: $grid-columns, $breakpoints: $grid-breakpoints) {\n  @each $breakpoint in map-keys($breakpoints) {\n    $infix: breakpoint-infix($breakpoint, $breakpoints);\n\n    @include media-breakpoint-up($breakpoint, $breakpoints) {\n      @if $columns > 0 {\n        @for $i from 1 through $columns {\n          .g-col#{$infix}-#{$i} {\n            grid-column: auto / span $i;\n          }\n        }\n\n        // Start with `1` because `0` is and invalid value.\n        // Ends with `$columns - 1` because offsetting by the width of an entire row isn't possible.\n        @for $i from 1 through ($columns - 1) {\n          .g-start#{$infix}-#{$i} {\n            grid-column-start: $i;\n          }\n        }\n      }\n    }\n  }\n}\n","//\n// Basic Bootstrap table\n//\n\n.table {\n  // Reset needed for nesting tables\n  --#{$prefix}table-color-type: initial;\n  --#{$prefix}table-bg-type: initial;\n  --#{$prefix}table-color-state: initial;\n  --#{$prefix}table-bg-state: initial;\n  // End of reset\n  --#{$prefix}table-color: #{$table-color};\n  --#{$prefix}table-bg: #{$table-bg};\n  --#{$prefix}table-border-color: #{$table-border-color};\n  --#{$prefix}table-accent-bg: #{$table-accent-bg};\n  --#{$prefix}table-striped-color: #{$table-striped-color};\n  --#{$prefix}table-striped-bg: #{$table-striped-bg};\n  --#{$prefix}table-active-color: #{$table-active-color};\n  --#{$prefix}table-active-bg: #{$table-active-bg};\n  --#{$prefix}table-hover-color: #{$table-hover-color};\n  --#{$prefix}table-hover-bg: #{$table-hover-bg};\n\n  width: 100%;\n  margin-bottom: $spacer;\n  vertical-align: $table-cell-vertical-align;\n  border-color: var(--#{$prefix}table-border-color);\n\n  // Target th & td\n  // We need the child combinator to prevent styles leaking to nested tables which doesn't have a `.table` class.\n  // We use the universal selectors here to simplify the selector (else we would need 6 different selectors).\n  // Another advantage is that this generates less code and makes the selector less specific making it easier to override.\n  // stylelint-disable-next-line selector-max-universal\n  > :not(caption) > * > * {\n    padding: $table-cell-padding-y $table-cell-padding-x;\n    // Following the precept of cascades: https://codepen.io/miriamsuzanne/full/vYNgodb\n    color: var(--#{$prefix}table-color-state, var(--#{$prefix}table-color-type, var(--#{$prefix}table-color)));\n    background-color: var(--#{$prefix}table-bg);\n    border-bottom-width: $table-border-width;\n    box-shadow: inset 0 0 0 9999px var(--#{$prefix}table-bg-state, var(--#{$prefix}table-bg-type, var(--#{$prefix}table-accent-bg)));\n  }\n\n  > tbody {\n    vertical-align: inherit;\n  }\n\n  > thead {\n    vertical-align: bottom;\n  }\n}\n\n.table-group-divider {\n  border-top: calc(#{$table-border-width} * 2) solid $table-group-separator-color; // stylelint-disable-line function-disallowed-list\n}\n\n//\n// Change placement of captions with a class\n//\n\n.caption-top {\n  caption-side: top;\n}\n\n\n//\n// Condensed table w/ half padding\n//\n\n.table-sm {\n  // stylelint-disable-next-line selector-max-universal\n  > :not(caption) > * > * {\n    padding: $table-cell-padding-y-sm $table-cell-padding-x-sm;\n  }\n}\n\n\n// Border versions\n//\n// Add or remove borders all around the table and between all the columns.\n//\n// When borders are added on all sides of the cells, the corners can render odd when\n// these borders do not have the same color or if they are semi-transparent.\n// Therefor we add top and border bottoms to the `tr`s and left and right borders\n// to the `td`s or `th`s\n\n.table-bordered {\n  > :not(caption) > * {\n    border-width: $table-border-width 0;\n\n    // stylelint-disable-next-line selector-max-universal\n    > * {\n      border-width: 0 $table-border-width;\n    }\n  }\n}\n\n.table-borderless {\n  // stylelint-disable-next-line selector-max-universal\n  > :not(caption) > * > * {\n    border-bottom-width: 0;\n  }\n\n  > :not(:first-child) {\n    border-top-width: 0;\n  }\n}\n\n// Zebra-striping\n//\n// Default zebra-stripe styles (alternating gray and transparent backgrounds)\n\n// For rows\n.table-striped {\n  > tbody > tr:nth-of-type(#{$table-striped-order}) > * {\n    --#{$prefix}table-color-type: var(--#{$prefix}table-striped-color);\n    --#{$prefix}table-bg-type: var(--#{$prefix}table-striped-bg);\n  }\n}\n\n// For columns\n.table-striped-columns {\n  > :not(caption) > tr > :nth-child(#{$table-striped-columns-order}) {\n    --#{$prefix}table-color-type: var(--#{$prefix}table-striped-color);\n    --#{$prefix}table-bg-type: var(--#{$prefix}table-striped-bg);\n  }\n}\n\n// Active table\n//\n// The `.table-active` class can be added to highlight rows or cells\n\n.table-active {\n  --#{$prefix}table-color-state: var(--#{$prefix}table-active-color);\n  --#{$prefix}table-bg-state: var(--#{$prefix}table-active-bg);\n}\n\n// Hover effect\n//\n// Placed here since it has to come after the potential zebra striping\n\n.table-hover {\n  > tbody > tr:hover > * {\n    --#{$prefix}table-color-state: var(--#{$prefix}table-hover-color);\n    --#{$prefix}table-bg-state: var(--#{$prefix}table-hover-bg);\n  }\n}\n\n\n// Table variants\n//\n// Table variants set the table cell backgrounds, border colors\n// and the colors of the striped, hovered & active tables\n\n@each $color, $value in $table-variants {\n  @include table-variant($color, $value);\n}\n\n// Responsive tables\n//\n// Generate series of `.table-responsive-*` classes for configuring the screen\n// size of where your table will overflow.\n\n@each $breakpoint in map-keys($grid-breakpoints) {\n  $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n  @include media-breakpoint-down($breakpoint) {\n    .table-responsive#{$infix} {\n      overflow-x: auto;\n      -webkit-overflow-scrolling: touch;\n    }\n  }\n}\n","// scss-docs-start table-variant\n@mixin table-variant($state, $background) {\n  .table-#{$state} {\n    $color: color-contrast(opaque($body-bg, $background));\n    $hover-bg: mix($color, $background, percentage($table-hover-bg-factor));\n    $striped-bg: mix($color, $background, percentage($table-striped-bg-factor));\n    $active-bg: mix($color, $background, percentage($table-active-bg-factor));\n    $table-border-color: mix($color, $background, percentage($table-border-factor));\n\n    --#{$prefix}table-color: #{$color};\n    --#{$prefix}table-bg: #{$background};\n    --#{$prefix}table-border-color: #{$table-border-color};\n    --#{$prefix}table-striped-bg: #{$striped-bg};\n    --#{$prefix}table-striped-color: #{color-contrast($striped-bg)};\n    --#{$prefix}table-active-bg: #{$active-bg};\n    --#{$prefix}table-active-color: #{color-contrast($active-bg)};\n    --#{$prefix}table-hover-bg: #{$hover-bg};\n    --#{$prefix}table-hover-color: #{color-contrast($hover-bg)};\n\n    color: var(--#{$prefix}table-color);\n    border-color: var(--#{$prefix}table-border-color);\n  }\n}\n// scss-docs-end table-variant\n","//\n// Labels\n//\n\n.form-label {\n  margin-bottom: $form-label-margin-bottom;\n  @include font-size($form-label-font-size);\n  font-style: $form-label-font-style;\n  font-weight: $form-label-font-weight;\n  color: $form-label-color;\n}\n\n// For use with horizontal and inline forms, when you need the label (or legend)\n// text to align with the form controls.\n.col-form-label {\n  padding-top: add($input-padding-y, $input-border-width);\n  padding-bottom: add($input-padding-y, $input-border-width);\n  margin-bottom: 0; // Override the `<legend>` default\n  @include font-size(inherit); // Override the `<legend>` default\n  font-style: $form-label-font-style;\n  font-weight: $form-label-font-weight;\n  line-height: $input-line-height;\n  color: $form-label-color;\n}\n\n.col-form-label-lg {\n  padding-top: add($input-padding-y-lg, $input-border-width);\n  padding-bottom: add($input-padding-y-lg, $input-border-width);\n  @include font-size($input-font-size-lg);\n}\n\n.col-form-label-sm {\n  padding-top: add($input-padding-y-sm, $input-border-width);\n  padding-bottom: add($input-padding-y-sm, $input-border-width);\n  @include font-size($input-font-size-sm);\n}\n","//\n// Form text\n//\n\n.form-text {\n  margin-top: $form-text-margin-top;\n  @include font-size($form-text-font-size);\n  font-style: $form-text-font-style;\n  font-weight: $form-text-font-weight;\n  color: $form-text-color;\n}\n","//\n// General form controls (plus a few specific high-level interventions)\n//\n\n.form-control {\n  display: block;\n  width: 100%;\n  padding: $input-padding-y $input-padding-x;\n  font-family: $input-font-family;\n  @include font-size($input-font-size);\n  font-weight: $input-font-weight;\n  line-height: $input-line-height;\n  color: $input-color;\n  appearance: none; // Fix appearance for date inputs in Safari\n  background-color: $input-bg;\n  background-clip: padding-box;\n  border: $input-border-width solid $input-border-color;\n\n  // Note: This has no effect on <select>s in some browsers, due to the limited stylability of `<select>`s in CSS.\n  @include border-radius($input-border-radius, 0);\n\n  @include box-shadow($input-box-shadow);\n  @include transition($input-transition);\n\n  &[type=\"file\"] {\n    overflow: hidden; // prevent pseudo element button overlap\n\n    &:not(:disabled):not([readonly]) {\n      cursor: pointer;\n    }\n  }\n\n  // Customize the `:focus` state to imitate native WebKit styles.\n  &:focus {\n    color: $input-focus-color;\n    background-color: $input-focus-bg;\n    border-color: $input-focus-border-color;\n    outline: 0;\n    @if $enable-shadows {\n      @include box-shadow($input-box-shadow, $input-focus-box-shadow);\n    } @else {\n      // Avoid using mixin so we can pass custom focus shadow properly\n      box-shadow: $input-focus-box-shadow;\n    }\n  }\n\n  &::-webkit-date-and-time-value {\n    // On Android Chrome, form-control's \"width: 100%\" makes the input width too small\n    // Tested under Android 11 / Chrome 89, Android 12 / Chrome 100, Android 13 / Chrome 109\n    //\n    // On iOS Safari, form-control's \"appearance: none\" + \"width: 100%\" makes the input width too small\n    // Tested under iOS 16.2 / Safari 16.2\n    min-width: 85px; // Seems to be a good minimum safe width\n\n    // Add some height to date inputs on iOS\n    // https://github.com/twbs/bootstrap/issues/23307\n    // TODO: we can remove this workaround once https://bugs.webkit.org/show_bug.cgi?id=198959 is resolved\n    // Multiply line-height by 1em if it has no unit\n    height: if(unit($input-line-height) == \"\", $input-line-height * 1em, $input-line-height);\n\n    // Android Chrome type=\"date\" is taller than the other inputs\n    // because of \"margin: 1px 24px 1px 4px\" inside the shadow DOM\n    // Tested under Android 11 / Chrome 89, Android 12 / Chrome 100, Android 13 / Chrome 109\n    margin: 0;\n  }\n\n  // Prevent excessive date input height in Webkit\n  // https://github.com/twbs/bootstrap/issues/34433\n  &::-webkit-datetime-edit {\n    display: block;\n    padding: 0;\n  }\n\n  // Placeholder\n  &::placeholder {\n    color: $input-placeholder-color;\n    // Override Firefox's unusual default opacity; see https://github.com/twbs/bootstrap/pull/11526.\n    opacity: 1;\n  }\n\n  // Disabled inputs\n  //\n  // HTML5 says that controls under a fieldset > legend:first-child won't be\n  // disabled if the fieldset is disabled. Due to implementation difficulty, we\n  // don't honor that edge case; we style them as disabled anyway.\n  &:disabled {\n    color: $input-disabled-color;\n    background-color: $input-disabled-bg;\n    border-color: $input-disabled-border-color;\n    // iOS fix for unreadable disabled content; see https://github.com/twbs/bootstrap/issues/11655.\n    opacity: 1;\n  }\n\n  // File input buttons theming\n  &::file-selector-button {\n    padding: $input-padding-y $input-padding-x;\n    margin: (-$input-padding-y) (-$input-padding-x);\n    margin-inline-end: $input-padding-x;\n    color: $form-file-button-color;\n    @include gradient-bg($form-file-button-bg);\n    pointer-events: none;\n    border-color: inherit;\n    border-style: solid;\n    border-width: 0;\n    border-inline-end-width: $input-border-width;\n    border-radius: 0; // stylelint-disable-line property-disallowed-list\n    @include transition($btn-transition);\n  }\n\n  &:hover:not(:disabled):not([readonly])::file-selector-button {\n    background-color: $form-file-button-hover-bg;\n  }\n}\n\n// Readonly controls as plain text\n//\n// Apply class to a readonly input to make it appear like regular plain\n// text (without any border, background color, focus indicator)\n\n.form-control-plaintext {\n  display: block;\n  width: 100%;\n  padding: $input-padding-y 0;\n  margin-bottom: 0; // match inputs if this class comes on inputs with default margins\n  line-height: $input-line-height;\n  color: $input-plaintext-color;\n  background-color: transparent;\n  border: solid transparent;\n  border-width: $input-border-width 0;\n\n  &:focus {\n    outline: 0;\n  }\n\n  &.form-control-sm,\n  &.form-control-lg {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n\n// Form control sizing\n//\n// Build on `.form-control` with modifier classes to decrease or increase the\n// height and font-size of form controls.\n//\n// Repeated in `_input_group.scss` to avoid Sass extend issues.\n\n.form-control-sm {\n  min-height: $input-height-sm;\n  padding: $input-padding-y-sm $input-padding-x-sm;\n  @include font-size($input-font-size-sm);\n  @include border-radius($input-border-radius-sm);\n\n  &::file-selector-button {\n    padding: $input-padding-y-sm $input-padding-x-sm;\n    margin: (-$input-padding-y-sm) (-$input-padding-x-sm);\n    margin-inline-end: $input-padding-x-sm;\n  }\n}\n\n.form-control-lg {\n  min-height: $input-height-lg;\n  padding: $input-padding-y-lg $input-padding-x-lg;\n  @include font-size($input-font-size-lg);\n  @include border-radius($input-border-radius-lg);\n\n  &::file-selector-button {\n    padding: $input-padding-y-lg $input-padding-x-lg;\n    margin: (-$input-padding-y-lg) (-$input-padding-x-lg);\n    margin-inline-end: $input-padding-x-lg;\n  }\n}\n\n// Make sure textareas don't shrink too much when resized\n// https://github.com/twbs/bootstrap/pull/29124\n// stylelint-disable selector-no-qualifying-type\ntextarea {\n  &.form-control {\n    min-height: $input-height;\n  }\n\n  &.form-control-sm {\n    min-height: $input-height-sm;\n  }\n\n  &.form-control-lg {\n    min-height: $input-height-lg;\n  }\n}\n// stylelint-enable selector-no-qualifying-type\n\n.form-control-color {\n  width: $form-color-width;\n  height: $input-height;\n  padding: $input-padding-y;\n\n  &:not(:disabled):not([readonly]) {\n    cursor: pointer;\n  }\n\n  &::-moz-color-swatch {\n    border: 0 !important; // stylelint-disable-line declaration-no-important\n    @include border-radius($input-border-radius);\n  }\n\n  &::-webkit-color-swatch {\n    border: 0 !important; // stylelint-disable-line declaration-no-important\n    @include border-radius($input-border-radius);\n  }\n\n  &.form-control-sm { height: $input-height-sm; }\n  &.form-control-lg { height: $input-height-lg; }\n}\n","// stylelint-disable property-disallowed-list\n@mixin transition($transition...) {\n  @if length($transition) == 0 {\n    $transition: $transition-base;\n  }\n\n  @if length($transition) > 1 {\n    @each $value in $transition {\n      @if $value == null or $value == none {\n        @warn \"The keyword 'none' or 'null' must be used as a single argument.\";\n      }\n    }\n  }\n\n  @if $enable-transitions {\n    @if nth($transition, 1) != null {\n      transition: $transition;\n    }\n\n    @if $enable-reduced-motion and nth($transition, 1) != null and nth($transition, 1) != none {\n      @media (prefers-reduced-motion: reduce) {\n        transition: none;\n      }\n    }\n  }\n}\n","// Gradients\n\n// scss-docs-start gradient-bg-mixin\n@mixin gradient-bg($color: null) {\n  background-color: $color;\n\n  @if $enable-gradients {\n    background-image: var(--#{$prefix}gradient);\n  }\n}\n// scss-docs-end gradient-bg-mixin\n\n// scss-docs-start gradient-mixins\n// Horizontal gradient, from left to right\n//\n// Creates two color stops, start and end, by specifying a color and position for each color stop.\n@mixin gradient-x($start-color: $gray-700, $end-color: $gray-800, $start-percent: 0%, $end-percent: 100%) {\n  background-image: linear-gradient(to right, $start-color $start-percent, $end-color $end-percent);\n}\n\n// Vertical gradient, from top to bottom\n//\n// Creates two color stops, start and end, by specifying a color and position for each color stop.\n@mixin gradient-y($start-color: $gray-700, $end-color: $gray-800, $start-percent: null, $end-percent: null) {\n  background-image: linear-gradient(to bottom, $start-color $start-percent, $end-color $end-percent);\n}\n\n@mixin gradient-directional($start-color: $gray-700, $end-color: $gray-800, $deg: 45deg) {\n  background-image: linear-gradient($deg, $start-color, $end-color);\n}\n\n@mixin gradient-x-three-colors($start-color: $blue, $mid-color: $purple, $color-stop: 50%, $end-color: $red) {\n  background-image: linear-gradient(to right, $start-color, $mid-color $color-stop, $end-color);\n}\n\n@mixin gradient-y-three-colors($start-color: $blue, $mid-color: $purple, $color-stop: 50%, $end-color: $red) {\n  background-image: linear-gradient($start-color, $mid-color $color-stop, $end-color);\n}\n\n@mixin gradient-radial($inner-color: $gray-700, $outer-color: $gray-800) {\n  background-image: radial-gradient(circle, $inner-color, $outer-color);\n}\n\n@mixin gradient-striped($color: rgba($white, .15), $angle: 45deg) {\n  background-image: linear-gradient($angle, $color 25%, transparent 25%, transparent 50%, $color 50%, $color 75%, transparent 75%, transparent);\n}\n// scss-docs-end gradient-mixins\n","// Select\n//\n// Replaces the browser default select with a custom one, mostly pulled from\n// https://primer.github.io/.\n\n.form-select {\n  --#{$prefix}form-select-bg-img: #{escape-svg($form-select-indicator)};\n\n  display: block;\n  width: 100%;\n  padding: $form-select-padding-y $form-select-indicator-padding $form-select-padding-y $form-select-padding-x;\n  font-family: $form-select-font-family;\n  @include font-size($form-select-font-size);\n  font-weight: $form-select-font-weight;\n  line-height: $form-select-line-height;\n  color: $form-select-color;\n  appearance: none;\n  background-color: $form-select-bg;\n  background-image: var(--#{$prefix}form-select-bg-img), var(--#{$prefix}form-select-bg-icon, none);\n  background-repeat: no-repeat;\n  background-position: $form-select-bg-position;\n  background-size: $form-select-bg-size;\n  border: $form-select-border-width solid $form-select-border-color;\n  @include border-radius($form-select-border-radius, 0);\n  @include box-shadow($form-select-box-shadow);\n  @include transition($form-select-transition);\n\n  &:focus {\n    border-color: $form-select-focus-border-color;\n    outline: 0;\n    @if $enable-shadows {\n      @include box-shadow($form-select-box-shadow, $form-select-focus-box-shadow);\n    } @else {\n      // Avoid using mixin so we can pass custom focus shadow properly\n      box-shadow: $form-select-focus-box-shadow;\n    }\n  }\n\n  &[multiple],\n  &[size]:not([size=\"1\"]) {\n    padding-right: $form-select-padding-x;\n    background-image: none;\n  }\n\n  &:disabled {\n    color: $form-select-disabled-color;\n    background-color: $form-select-disabled-bg;\n    border-color: $form-select-disabled-border-color;\n  }\n\n  // Remove outline from select box in FF\n  &:-moz-focusring {\n    color: transparent;\n    text-shadow: 0 0 0 $form-select-color;\n  }\n}\n\n.form-select-sm {\n  padding-top: $form-select-padding-y-sm;\n  padding-bottom: $form-select-padding-y-sm;\n  padding-left: $form-select-padding-x-sm;\n  @include font-size($form-select-font-size-sm);\n  @include border-radius($form-select-border-radius-sm);\n}\n\n.form-select-lg {\n  padding-top: $form-select-padding-y-lg;\n  padding-bottom: $form-select-padding-y-lg;\n  padding-left: $form-select-padding-x-lg;\n  @include font-size($form-select-font-size-lg);\n  @include border-radius($form-select-border-radius-lg);\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    .form-select {\n      --#{$prefix}form-select-bg-img: #{escape-svg($form-select-indicator-dark)};\n    }\n  }\n}\n","//\n// Check/radio\n//\n\n.form-check {\n  display: block;\n  min-height: $form-check-min-height;\n  padding-left: $form-check-padding-start;\n  margin-bottom: $form-check-margin-bottom;\n\n  .form-check-input {\n    float: left;\n    margin-left: $form-check-padding-start * -1;\n  }\n}\n\n.form-check-reverse {\n  padding-right: $form-check-padding-start;\n  padding-left: 0;\n  text-align: right;\n\n  .form-check-input {\n    float: right;\n    margin-right: $form-check-padding-start * -1;\n    margin-left: 0;\n  }\n}\n\n.form-check-input {\n  --#{$prefix}form-check-bg: #{$form-check-input-bg};\n\n  flex-shrink: 0;\n  width: $form-check-input-width;\n  height: $form-check-input-width;\n  margin-top: ($line-height-base - $form-check-input-width) * .5; // line-height minus check height\n  vertical-align: top;\n  appearance: none;\n  background-color: var(--#{$prefix}form-check-bg);\n  background-image: var(--#{$prefix}form-check-bg-image);\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: contain;\n  border: $form-check-input-border;\n  print-color-adjust: exact; // Keep themed appearance for print\n  @include transition($form-check-transition);\n\n  &[type=\"checkbox\"] {\n    @include border-radius($form-check-input-border-radius);\n  }\n\n  &[type=\"radio\"] {\n    // stylelint-disable-next-line property-disallowed-list\n    border-radius: $form-check-radio-border-radius;\n  }\n\n  &:active {\n    filter: $form-check-input-active-filter;\n  }\n\n  &:focus {\n    border-color: $form-check-input-focus-border;\n    outline: 0;\n    box-shadow: $form-check-input-focus-box-shadow;\n  }\n\n  &:checked {\n    background-color: $form-check-input-checked-bg-color;\n    border-color: $form-check-input-checked-border-color;\n\n    &[type=\"checkbox\"] {\n      @if $enable-gradients {\n        --#{$prefix}form-check-bg-image: #{escape-svg($form-check-input-checked-bg-image)}, var(--#{$prefix}gradient);\n      } @else {\n        --#{$prefix}form-check-bg-image: #{escape-svg($form-check-input-checked-bg-image)};\n      }\n    }\n\n    &[type=\"radio\"] {\n      @if $enable-gradients {\n        --#{$prefix}form-check-bg-image: #{escape-svg($form-check-radio-checked-bg-image)}, var(--#{$prefix}gradient);\n      } @else {\n        --#{$prefix}form-check-bg-image: #{escape-svg($form-check-radio-checked-bg-image)};\n      }\n    }\n  }\n\n  &[type=\"checkbox\"]:indeterminate {\n    background-color: $form-check-input-indeterminate-bg-color;\n    border-color: $form-check-input-indeterminate-border-color;\n\n    @if $enable-gradients {\n      --#{$prefix}form-check-bg-image: #{escape-svg($form-check-input-indeterminate-bg-image)}, var(--#{$prefix}gradient);\n    } @else {\n      --#{$prefix}form-check-bg-image: #{escape-svg($form-check-input-indeterminate-bg-image)};\n    }\n  }\n\n  &:disabled {\n    pointer-events: none;\n    filter: none;\n    opacity: $form-check-input-disabled-opacity;\n  }\n\n  // Use disabled attribute in addition of :disabled pseudo-class\n  // See: https://github.com/twbs/bootstrap/issues/28247\n  &[disabled],\n  &:disabled {\n    ~ .form-check-label {\n      cursor: default;\n      opacity: $form-check-label-disabled-opacity;\n    }\n  }\n}\n\n.form-check-label {\n  color: $form-check-label-color;\n  cursor: $form-check-label-cursor;\n}\n\n//\n// Switch\n//\n\n.form-switch {\n  padding-left: $form-switch-padding-start;\n\n  .form-check-input {\n    --#{$prefix}form-switch-bg: #{escape-svg($form-switch-bg-image)};\n\n    width: $form-switch-width;\n    margin-left: $form-switch-padding-start * -1;\n    background-image: var(--#{$prefix}form-switch-bg);\n    background-position: left center;\n    @include border-radius($form-switch-border-radius);\n    @include transition($form-switch-transition);\n\n    &:focus {\n      --#{$prefix}form-switch-bg: #{escape-svg($form-switch-focus-bg-image)};\n    }\n\n    &:checked {\n      background-position: $form-switch-checked-bg-position;\n\n      @if $enable-gradients {\n        --#{$prefix}form-switch-bg: #{escape-svg($form-switch-checked-bg-image)}, var(--#{$prefix}gradient);\n      } @else {\n        --#{$prefix}form-switch-bg: #{escape-svg($form-switch-checked-bg-image)};\n      }\n    }\n  }\n\n  &.form-check-reverse {\n    padding-right: $form-switch-padding-start;\n    padding-left: 0;\n\n    .form-check-input {\n      margin-right: $form-switch-padding-start * -1;\n      margin-left: 0;\n    }\n  }\n}\n\n.form-check-inline {\n  display: inline-block;\n  margin-right: $form-check-inline-margin-end;\n}\n\n.btn-check {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n\n  &[disabled],\n  &:disabled {\n    + .btn {\n      pointer-events: none;\n      filter: none;\n      opacity: $form-check-btn-check-disabled-opacity;\n    }\n  }\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    .form-switch .form-check-input:not(:checked):not(:focus) {\n      --#{$prefix}form-switch-bg: #{escape-svg($form-switch-bg-image-dark)};\n    }\n  }\n}\n","// Range\n//\n// Style range inputs the same across browsers. Vendor-specific rules for pseudo\n// elements cannot be mixed. As such, there are no shared styles for focus or\n// active states on prefixed selectors.\n\n.form-range {\n  width: 100%;\n  height: add($form-range-thumb-height, $form-range-thumb-focus-box-shadow-width * 2);\n  padding: 0; // Need to reset padding\n  appearance: none;\n  background-color: transparent;\n\n  &:focus {\n    outline: 0;\n\n    // Pseudo-elements must be split across multiple rulesets to have an effect.\n    // No box-shadow() mixin for focus accessibility.\n    &::-webkit-slider-thumb { box-shadow: $form-range-thumb-focus-box-shadow; }\n    &::-moz-range-thumb     { box-shadow: $form-range-thumb-focus-box-shadow; }\n  }\n\n  &::-moz-focus-outer {\n    border: 0;\n  }\n\n  &::-webkit-slider-thumb {\n    width: $form-range-thumb-width;\n    height: $form-range-thumb-height;\n    margin-top: ($form-range-track-height - $form-range-thumb-height) * .5; // Webkit specific\n    appearance: none;\n    @include gradient-bg($form-range-thumb-bg);\n    border: $form-range-thumb-border;\n    @include border-radius($form-range-thumb-border-radius);\n    @include box-shadow($form-range-thumb-box-shadow);\n    @include transition($form-range-thumb-transition);\n\n    &:active {\n      @include gradient-bg($form-range-thumb-active-bg);\n    }\n  }\n\n  &::-webkit-slider-runnable-track {\n    width: $form-range-track-width;\n    height: $form-range-track-height;\n    color: transparent; // Why?\n    cursor: $form-range-track-cursor;\n    background-color: $form-range-track-bg;\n    border-color: transparent;\n    @include border-radius($form-range-track-border-radius);\n    @include box-shadow($form-range-track-box-shadow);\n  }\n\n  &::-moz-range-thumb {\n    width: $form-range-thumb-width;\n    height: $form-range-thumb-height;\n    appearance: none;\n    @include gradient-bg($form-range-thumb-bg);\n    border: $form-range-thumb-border;\n    @include border-radius($form-range-thumb-border-radius);\n    @include box-shadow($form-range-thumb-box-shadow);\n    @include transition($form-range-thumb-transition);\n\n    &:active {\n      @include gradient-bg($form-range-thumb-active-bg);\n    }\n  }\n\n  &::-moz-range-track {\n    width: $form-range-track-width;\n    height: $form-range-track-height;\n    color: transparent;\n    cursor: $form-range-track-cursor;\n    background-color: $form-range-track-bg;\n    border-color: transparent; // Firefox specific?\n    @include border-radius($form-range-track-border-radius);\n    @include box-shadow($form-range-track-box-shadow);\n  }\n\n  &:disabled {\n    pointer-events: none;\n\n    &::-webkit-slider-thumb {\n      background-color: $form-range-thumb-disabled-bg;\n    }\n\n    &::-moz-range-thumb {\n      background-color: $form-range-thumb-disabled-bg;\n    }\n  }\n}\n",".form-floating {\n  position: relative;\n\n  > .form-control,\n  > .form-control-plaintext,\n  > .form-select {\n    height: $form-floating-height;\n    min-height: $form-floating-height;\n    line-height: $form-floating-line-height;\n  }\n\n  > label {\n    position: absolute;\n    top: 0;\n    left: 0;\n    z-index: 2;\n    height: 100%; // allow textareas\n    padding: $form-floating-padding-y $form-floating-padding-x;\n    overflow: hidden;\n    text-align: start;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    pointer-events: none;\n    border: $input-border-width solid transparent; // Required for aligning label's text with the input as it affects inner box model\n    transform-origin: 0 0;\n    @include transition($form-floating-transition);\n  }\n\n  > .form-control,\n  > .form-control-plaintext {\n    padding: $form-floating-padding-y $form-floating-padding-x;\n\n    &::placeholder {\n      color: transparent;\n    }\n\n    &:focus,\n    &:not(:placeholder-shown) {\n      padding-top: $form-floating-input-padding-t;\n      padding-bottom: $form-floating-input-padding-b;\n    }\n    // Duplicated because `:-webkit-autofill` invalidates other selectors when grouped\n    &:-webkit-autofill {\n      padding-top: $form-floating-input-padding-t;\n      padding-bottom: $form-floating-input-padding-b;\n    }\n  }\n\n  > .form-select {\n    padding-top: $form-floating-input-padding-t;\n    padding-bottom: $form-floating-input-padding-b;\n  }\n\n  > .form-control:focus,\n  > .form-control:not(:placeholder-shown),\n  > .form-control-plaintext,\n  > .form-select {\n    ~ label {\n      color: rgba(var(--#{$prefix}body-color-rgb), #{$form-floating-label-opacity});\n      transform: $form-floating-label-transform;\n\n      &::after {\n        position: absolute;\n        inset: $form-floating-padding-y ($form-floating-padding-x * .5);\n        z-index: -1;\n        height: $form-floating-label-height;\n        content: \"\";\n        background-color: $input-bg;\n        @include border-radius($input-border-radius);\n      }\n    }\n  }\n  // Duplicated because `:-webkit-autofill` invalidates other selectors when grouped\n  > .form-control:-webkit-autofill {\n    ~ label {\n      color: rgba(var(--#{$prefix}body-color-rgb), #{$form-floating-label-opacity});\n      transform: $form-floating-label-transform;\n    }\n  }\n\n  > .form-control-plaintext {\n    ~ label {\n      border-width: $input-border-width 0; // Required to properly position label text - as explained above\n    }\n  }\n\n  > :disabled ~ label,\n  > .form-control:disabled ~ label { // Required for `.form-control`s because of specificity\n    color: $form-floating-label-disabled-color;\n\n    &::after {\n      background-color: $input-disabled-bg;\n    }\n  }\n}\n","//\n// Base styles\n//\n\n.input-group {\n  position: relative;\n  display: flex;\n  flex-wrap: wrap; // For form validation feedback\n  align-items: stretch;\n  width: 100%;\n\n  > .form-control,\n  > .form-select,\n  > .form-floating {\n    position: relative; // For focus state's z-index\n    flex: 1 1 auto;\n    width: 1%;\n    min-width: 0; // https://stackoverflow.com/questions/36247140/why-dont-flex-items-shrink-past-content-size\n  }\n\n  // Bring the \"active\" form control to the top of surrounding elements\n  > .form-control:focus,\n  > .form-select:focus,\n  > .form-floating:focus-within {\n    z-index: 5;\n  }\n\n  // Ensure buttons are always above inputs for more visually pleasing borders.\n  // This isn't needed for `.input-group-text` since it shares the same border-color\n  // as our inputs.\n  .btn {\n    position: relative;\n    z-index: 2;\n\n    &:focus {\n      z-index: 5;\n    }\n  }\n}\n\n\n// Textual addons\n//\n// Serves as a catch-all element for any text or radio/checkbox input you wish\n// to prepend or append to an input.\n\n.input-group-text {\n  display: flex;\n  align-items: center;\n  padding: $input-group-addon-padding-y $input-group-addon-padding-x;\n  @include font-size($input-font-size); // Match inputs\n  font-weight: $input-group-addon-font-weight;\n  line-height: $input-line-height;\n  color: $input-group-addon-color;\n  text-align: center;\n  white-space: nowrap;\n  background-color: $input-group-addon-bg;\n  border: $input-border-width solid $input-group-addon-border-color;\n  @include border-radius($input-border-radius);\n}\n\n\n// Sizing\n//\n// Remix the default form control sizing classes into new ones for easier\n// manipulation.\n\n.input-group-lg > .form-control,\n.input-group-lg > .form-select,\n.input-group-lg > .input-group-text,\n.input-group-lg > .btn {\n  padding: $input-padding-y-lg $input-padding-x-lg;\n  @include font-size($input-font-size-lg);\n  @include border-radius($input-border-radius-lg);\n}\n\n.input-group-sm > .form-control,\n.input-group-sm > .form-select,\n.input-group-sm > .input-group-text,\n.input-group-sm > .btn {\n  padding: $input-padding-y-sm $input-padding-x-sm;\n  @include font-size($input-font-size-sm);\n  @include border-radius($input-border-radius-sm);\n}\n\n.input-group-lg > .form-select,\n.input-group-sm > .form-select {\n  padding-right: $form-select-padding-x + $form-select-indicator-padding;\n}\n\n\n// Rounded corners\n//\n// These rulesets must come after the sizing ones to properly override sm and lg\n// border-radius values when extending. They're more specific than we'd like\n// with the `.input-group >` part, but without it, we cannot override the sizing.\n\n// stylelint-disable-next-line no-duplicate-selectors\n.input-group {\n  &:not(.has-validation) {\n    > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating),\n    > .dropdown-toggle:nth-last-child(n + 3),\n    > .form-floating:not(:last-child) > .form-control,\n    > .form-floating:not(:last-child) > .form-select {\n      @include border-end-radius(0);\n    }\n  }\n\n  &.has-validation {\n    > :nth-last-child(n + 3):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating),\n    > .dropdown-toggle:nth-last-child(n + 4),\n    > .form-floating:nth-last-child(n + 3) > .form-control,\n    > .form-floating:nth-last-child(n + 3) > .form-select {\n      @include border-end-radius(0);\n    }\n  }\n\n  $validation-messages: \"\";\n  @each $state in map-keys($form-validation-states) {\n    $validation-messages: $validation-messages + \":not(.\" + unquote($state) + \"-tooltip)\" + \":not(.\" + unquote($state) + \"-feedback)\";\n  }\n\n  > :not(:first-child):not(.dropdown-menu)#{$validation-messages} {\n    margin-left: calc(#{$input-border-width} * -1); // stylelint-disable-line function-disallowed-list\n    @include border-start-radius(0);\n  }\n\n  > .form-floating:not(:first-child) > .form-control,\n  > .form-floating:not(:first-child) > .form-select {\n    @include border-start-radius(0);\n  }\n}\n","// This mixin uses an `if()` technique to be compatible with Dart Sass\n// See https://github.com/sass/sass/issues/1873#issuecomment-152293725 for more details\n\n// scss-docs-start form-validation-mixins\n@mixin form-validation-state-selector($state) {\n  @if ($state == \"valid\" or $state == \"invalid\") {\n    .was-validated #{if(&, \"&\", \"\")}:#{$state},\n    #{if(&, \"&\", \"\")}.is-#{$state} {\n      @content;\n    }\n  } @else {\n    #{if(&, \"&\", \"\")}.is-#{$state} {\n      @content;\n    }\n  }\n}\n\n@mixin form-validation-state(\n  $state,\n  $color,\n  $icon,\n  $tooltip-color: color-contrast($color),\n  $tooltip-bg-color: rgba($color, $form-feedback-tooltip-opacity),\n  $focus-box-shadow: 0 0 $input-btn-focus-blur $input-focus-width rgba($color, $input-btn-focus-color-opacity),\n  $border-color: $color\n) {\n  .#{$state}-feedback {\n    display: none;\n    width: 100%;\n    margin-top: $form-feedback-margin-top;\n    @include font-size($form-feedback-font-size);\n    font-style: $form-feedback-font-style;\n    color: $color;\n  }\n\n  .#{$state}-tooltip {\n    position: absolute;\n    top: 100%;\n    z-index: 5;\n    display: none;\n    max-width: 100%; // Contain to parent when possible\n    padding: $form-feedback-tooltip-padding-y $form-feedback-tooltip-padding-x;\n    margin-top: .1rem;\n    @include font-size($form-feedback-tooltip-font-size);\n    line-height: $form-feedback-tooltip-line-height;\n    color: $tooltip-color;\n    background-color: $tooltip-bg-color;\n    @include border-radius($form-feedback-tooltip-border-radius);\n  }\n\n  @include form-validation-state-selector($state) {\n    ~ .#{$state}-feedback,\n    ~ .#{$state}-tooltip {\n      display: block;\n    }\n  }\n\n  .form-control {\n    @include form-validation-state-selector($state) {\n      border-color: $border-color;\n\n      @if $enable-validation-icons {\n        padding-right: $input-height-inner;\n        background-image: escape-svg($icon);\n        background-repeat: no-repeat;\n        background-position: right $input-height-inner-quarter center;\n        background-size: $input-height-inner-half $input-height-inner-half;\n      }\n\n      &:focus {\n        border-color: $border-color;\n        box-shadow: $focus-box-shadow;\n      }\n    }\n  }\n\n  // stylelint-disable-next-line selector-no-qualifying-type\n  textarea.form-control {\n    @include form-validation-state-selector($state) {\n      @if $enable-validation-icons {\n        padding-right: $input-height-inner;\n        background-position: top $input-height-inner-quarter right $input-height-inner-quarter;\n      }\n    }\n  }\n\n  .form-select {\n    @include form-validation-state-selector($state) {\n      border-color: $border-color;\n\n      @if $enable-validation-icons {\n        &:not([multiple]):not([size]),\n        &:not([multiple])[size=\"1\"] {\n          --#{$prefix}form-select-bg-icon: #{escape-svg($icon)};\n          padding-right: $form-select-feedback-icon-padding-end;\n          background-position: $form-select-bg-position, $form-select-feedback-icon-position;\n          background-size: $form-select-bg-size, $form-select-feedback-icon-size;\n        }\n      }\n\n      &:focus {\n        border-color: $border-color;\n        box-shadow: $focus-box-shadow;\n      }\n    }\n  }\n\n  .form-control-color {\n    @include form-validation-state-selector($state) {\n      @if $enable-validation-icons {\n        width: add($form-color-width, $input-height-inner);\n      }\n    }\n  }\n\n  .form-check-input {\n    @include form-validation-state-selector($state) {\n      border-color: $border-color;\n\n      &:checked {\n        background-color: $color;\n      }\n\n      &:focus {\n        box-shadow: $focus-box-shadow;\n      }\n\n      ~ .form-check-label {\n        color: $color;\n      }\n    }\n  }\n  .form-check-inline .form-check-input {\n    ~ .#{$state}-feedback {\n      margin-left: .5em;\n    }\n  }\n\n  .input-group {\n    > .form-control:not(:focus),\n    > .form-select:not(:focus),\n    > .form-floating:not(:focus-within) {\n      @include form-validation-state-selector($state) {\n        @if $state == \"valid\" {\n          z-index: 3;\n        } @else if $state == \"invalid\" {\n          z-index: 4;\n        }\n      }\n    }\n  }\n}\n// scss-docs-end form-validation-mixins\n","//\n// Base styles\n//\n\n.btn {\n  // scss-docs-start btn-css-vars\n  --#{$prefix}btn-padding-x: #{$btn-padding-x};\n  --#{$prefix}btn-padding-y: #{$btn-padding-y};\n  --#{$prefix}btn-font-family: #{$btn-font-family};\n  @include rfs($btn-font-size, --#{$prefix}btn-font-size);\n  --#{$prefix}btn-font-weight: #{$btn-font-weight};\n  --#{$prefix}btn-line-height: #{$btn-line-height};\n  --#{$prefix}btn-color: #{$btn-color};\n  --#{$prefix}btn-bg: transparent;\n  --#{$prefix}btn-border-width: #{$btn-border-width};\n  --#{$prefix}btn-border-color: transparent;\n  --#{$prefix}btn-border-radius: #{$btn-border-radius};\n  --#{$prefix}btn-hover-border-color: transparent;\n  --#{$prefix}btn-box-shadow: #{$btn-box-shadow};\n  --#{$prefix}btn-disabled-opacity: #{$btn-disabled-opacity};\n  --#{$prefix}btn-focus-box-shadow: 0 0 0 #{$btn-focus-width} rgba(var(--#{$prefix}btn-focus-shadow-rgb), .5);\n  // scss-docs-end btn-css-vars\n\n  display: inline-block;\n  padding: var(--#{$prefix}btn-padding-y) var(--#{$prefix}btn-padding-x);\n  font-family: var(--#{$prefix}btn-font-family);\n  @include font-size(var(--#{$prefix}btn-font-size));\n  font-weight: var(--#{$prefix}btn-font-weight);\n  line-height: var(--#{$prefix}btn-line-height);\n  color: var(--#{$prefix}btn-color);\n  text-align: center;\n  text-decoration: if($link-decoration == none, null, none);\n  white-space: $btn-white-space;\n  vertical-align: middle;\n  cursor: if($enable-button-pointers, pointer, null);\n  user-select: none;\n  border: var(--#{$prefix}btn-border-width) solid var(--#{$prefix}btn-border-color);\n  @include border-radius(var(--#{$prefix}btn-border-radius));\n  @include gradient-bg(var(--#{$prefix}btn-bg));\n  @include box-shadow(var(--#{$prefix}btn-box-shadow));\n  @include transition($btn-transition);\n\n  &:hover {\n    color: var(--#{$prefix}btn-hover-color);\n    text-decoration: if($link-hover-decoration == underline, none, null);\n    background-color: var(--#{$prefix}btn-hover-bg);\n    border-color: var(--#{$prefix}btn-hover-border-color);\n  }\n\n  .btn-check + &:hover {\n    // override for the checkbox/radio buttons\n    color: var(--#{$prefix}btn-color);\n    background-color: var(--#{$prefix}btn-bg);\n    border-color: var(--#{$prefix}btn-border-color);\n  }\n\n  &:focus-visible {\n    color: var(--#{$prefix}btn-hover-color);\n    @include gradient-bg(var(--#{$prefix}btn-hover-bg));\n    border-color: var(--#{$prefix}btn-hover-border-color);\n    outline: 0;\n    // Avoid using mixin so we can pass custom focus shadow properly\n    @if $enable-shadows {\n      box-shadow: var(--#{$prefix}btn-box-shadow), var(--#{$prefix}btn-focus-box-shadow);\n    } @else {\n      box-shadow: var(--#{$prefix}btn-focus-box-shadow);\n    }\n  }\n\n  .btn-check:focus-visible + & {\n    border-color: var(--#{$prefix}btn-hover-border-color);\n    outline: 0;\n    // Avoid using mixin so we can pass custom focus shadow properly\n    @if $enable-shadows {\n      box-shadow: var(--#{$prefix}btn-box-shadow), var(--#{$prefix}btn-focus-box-shadow);\n    } @else {\n      box-shadow: var(--#{$prefix}btn-focus-box-shadow);\n    }\n  }\n\n  .btn-check:checked + &,\n  :not(.btn-check) + &:active,\n  &:first-child:active,\n  &.active,\n  &.show {\n    color: var(--#{$prefix}btn-active-color);\n    background-color: var(--#{$prefix}btn-active-bg);\n    // Remove CSS gradients if they're enabled\n    background-image: if($enable-gradients, none, null);\n    border-color: var(--#{$prefix}btn-active-border-color);\n    @include box-shadow(var(--#{$prefix}btn-active-shadow));\n\n    &:focus-visible {\n      // Avoid using mixin so we can pass custom focus shadow properly\n      @if $enable-shadows {\n        box-shadow: var(--#{$prefix}btn-active-shadow), var(--#{$prefix}btn-focus-box-shadow);\n      } @else {\n        box-shadow: var(--#{$prefix}btn-focus-box-shadow);\n      }\n    }\n  }\n\n  &:disabled,\n  &.disabled,\n  fieldset:disabled & {\n    color: var(--#{$prefix}btn-disabled-color);\n    pointer-events: none;\n    background-color: var(--#{$prefix}btn-disabled-bg);\n    background-image: if($enable-gradients, none, null);\n    border-color: var(--#{$prefix}btn-disabled-border-color);\n    opacity: var(--#{$prefix}btn-disabled-opacity);\n    @include box-shadow(none);\n  }\n}\n\n\n//\n// Alternate buttons\n//\n\n// scss-docs-start btn-variant-loops\n@each $color, $value in $theme-colors {\n  .btn-#{$color} {\n    @if $color == \"light\" {\n      @include button-variant(\n        $value,\n        $value,\n        $hover-background: shade-color($value, $btn-hover-bg-shade-amount),\n        $hover-border: shade-color($value, $btn-hover-border-shade-amount),\n        $active-background: shade-color($value, $btn-active-bg-shade-amount),\n        $active-border: shade-color($value, $btn-active-border-shade-amount)\n      );\n    } @else if $color == \"dark\" {\n      @include button-variant(\n        $value,\n        $value,\n        $hover-background: tint-color($value, $btn-hover-bg-tint-amount),\n        $hover-border: tint-color($value, $btn-hover-border-tint-amount),\n        $active-background: tint-color($value, $btn-active-bg-tint-amount),\n        $active-border: tint-color($value, $btn-active-border-tint-amount)\n      );\n    } @else {\n      @include button-variant($value, $value);\n    }\n  }\n}\n\n@each $color, $value in $theme-colors {\n  .btn-outline-#{$color} {\n    @include button-outline-variant($value);\n  }\n}\n// scss-docs-end btn-variant-loops\n\n\n//\n// Link buttons\n//\n\n// Make a button look and behave like a link\n.btn-link {\n  --#{$prefix}btn-font-weight: #{$font-weight-normal};\n  --#{$prefix}btn-color: #{$btn-link-color};\n  --#{$prefix}btn-bg: transparent;\n  --#{$prefix}btn-border-color: transparent;\n  --#{$prefix}btn-hover-color: #{$btn-link-hover-color};\n  --#{$prefix}btn-hover-border-color: transparent;\n  --#{$prefix}btn-active-color: #{$btn-link-hover-color};\n  --#{$prefix}btn-active-border-color: transparent;\n  --#{$prefix}btn-disabled-color: #{$btn-link-disabled-color};\n  --#{$prefix}btn-disabled-border-color: transparent;\n  --#{$prefix}btn-box-shadow: 0 0 0 #000; // Can't use `none` as keyword negates all values when used with multiple shadows\n  --#{$prefix}btn-focus-shadow-rgb: #{$btn-link-focus-shadow-rgb};\n\n  text-decoration: $link-decoration;\n  @if $enable-gradients {\n    background-image: none;\n  }\n\n  &:hover,\n  &:focus-visible {\n    text-decoration: $link-hover-decoration;\n  }\n\n  &:focus-visible {\n    color: var(--#{$prefix}btn-color);\n  }\n\n  &:hover {\n    color: var(--#{$prefix}btn-hover-color);\n  }\n\n  // No need for an active state here\n}\n\n\n//\n// Button Sizes\n//\n\n.btn-lg {\n  @include button-size($btn-padding-y-lg, $btn-padding-x-lg, $btn-font-size-lg, $btn-border-radius-lg);\n}\n\n.btn-sm {\n  @include button-size($btn-padding-y-sm, $btn-padding-x-sm, $btn-font-size-sm, $btn-border-radius-sm);\n}\n","// Button variants\n//\n// Easily pump out default styles, as well as :hover, :focus, :active,\n// and disabled options for all buttons\n\n// scss-docs-start btn-variant-mixin\n@mixin button-variant(\n  $background,\n  $border,\n  $color: color-contrast($background),\n  $hover-background: if($color == $color-contrast-light, shade-color($background, $btn-hover-bg-shade-amount), tint-color($background, $btn-hover-bg-tint-amount)),\n  $hover-border: if($color == $color-contrast-light, shade-color($border, $btn-hover-border-shade-amount), tint-color($border, $btn-hover-border-tint-amount)),\n  $hover-color: color-contrast($hover-background),\n  $active-background: if($color == $color-contrast-light, shade-color($background, $btn-active-bg-shade-amount), tint-color($background, $btn-active-bg-tint-amount)),\n  $active-border: if($color == $color-contrast-light, shade-color($border, $btn-active-border-shade-amount), tint-color($border, $btn-active-border-tint-amount)),\n  $active-color: color-contrast($active-background),\n  $disabled-background: $background,\n  $disabled-border: $border,\n  $disabled-color: color-contrast($disabled-background)\n) {\n  --#{$prefix}btn-color: #{$color};\n  --#{$prefix}btn-bg: #{$background};\n  --#{$prefix}btn-border-color: #{$border};\n  --#{$prefix}btn-hover-color: #{$hover-color};\n  --#{$prefix}btn-hover-bg: #{$hover-background};\n  --#{$prefix}btn-hover-border-color: #{$hover-border};\n  --#{$prefix}btn-focus-shadow-rgb: #{to-rgb(mix($color, $border, 15%))};\n  --#{$prefix}btn-active-color: #{$active-color};\n  --#{$prefix}btn-active-bg: #{$active-background};\n  --#{$prefix}btn-active-border-color: #{$active-border};\n  --#{$prefix}btn-active-shadow: #{$btn-active-box-shadow};\n  --#{$prefix}btn-disabled-color: #{$disabled-color};\n  --#{$prefix}btn-disabled-bg: #{$disabled-background};\n  --#{$prefix}btn-disabled-border-color: #{$disabled-border};\n}\n// scss-docs-end btn-variant-mixin\n\n// scss-docs-start btn-outline-variant-mixin\n@mixin button-outline-variant(\n  $color,\n  $color-hover: color-contrast($color),\n  $active-background: $color,\n  $active-border: $color,\n  $active-color: color-contrast($active-background)\n) {\n  --#{$prefix}btn-color: #{$color};\n  --#{$prefix}btn-border-color: #{$color};\n  --#{$prefix}btn-hover-color: #{$color-hover};\n  --#{$prefix}btn-hover-bg: #{$active-background};\n  --#{$prefix}btn-hover-border-color: #{$active-border};\n  --#{$prefix}btn-focus-shadow-rgb: #{to-rgb($color)};\n  --#{$prefix}btn-active-color: #{$active-color};\n  --#{$prefix}btn-active-bg: #{$active-background};\n  --#{$prefix}btn-active-border-color: #{$active-border};\n  --#{$prefix}btn-active-shadow: #{$btn-active-box-shadow};\n  --#{$prefix}btn-disabled-color: #{$color};\n  --#{$prefix}btn-disabled-bg: transparent;\n  --#{$prefix}btn-disabled-border-color: #{$color};\n  --#{$prefix}gradient: none;\n}\n// scss-docs-end btn-outline-variant-mixin\n\n// scss-docs-start btn-size-mixin\n@mixin button-size($padding-y, $padding-x, $font-size, $border-radius) {\n  --#{$prefix}btn-padding-y: #{$padding-y};\n  --#{$prefix}btn-padding-x: #{$padding-x};\n  @include rfs($font-size, --#{$prefix}btn-font-size);\n  --#{$prefix}btn-border-radius: #{$border-radius};\n}\n// scss-docs-end btn-size-mixin\n",".fade {\n  @include transition($transition-fade);\n\n  &:not(.show) {\n    opacity: 0;\n  }\n}\n\n// scss-docs-start collapse-classes\n.collapse {\n  &:not(.show) {\n    display: none;\n  }\n}\n\n.collapsing {\n  height: 0;\n  overflow: hidden;\n  @include transition($transition-collapse);\n\n  &.collapse-horizontal {\n    width: 0;\n    height: auto;\n    @include transition($transition-collapse-width);\n  }\n}\n// scss-docs-end collapse-classes\n","// The dropdown wrapper (`<div>`)\n.dropup,\n.dropend,\n.dropdown,\n.dropstart,\n.dropup-center,\n.dropdown-center {\n  position: relative;\n}\n\n.dropdown-toggle {\n  white-space: nowrap;\n\n  // Generate the caret automatically\n  @include caret();\n}\n\n// The dropdown menu\n.dropdown-menu {\n  // scss-docs-start dropdown-css-vars\n  --#{$prefix}dropdown-zindex: #{$zindex-dropdown};\n  --#{$prefix}dropdown-min-width: #{$dropdown-min-width};\n  --#{$prefix}dropdown-padding-x: #{$dropdown-padding-x};\n  --#{$prefix}dropdown-padding-y: #{$dropdown-padding-y};\n  --#{$prefix}dropdown-spacer: #{$dropdown-spacer};\n  @include rfs($dropdown-font-size, --#{$prefix}dropdown-font-size);\n  --#{$prefix}dropdown-color: #{$dropdown-color};\n  --#{$prefix}dropdown-bg: #{$dropdown-bg};\n  --#{$prefix}dropdown-border-color: #{$dropdown-border-color};\n  --#{$prefix}dropdown-border-radius: #{$dropdown-border-radius};\n  --#{$prefix}dropdown-border-width: #{$dropdown-border-width};\n  --#{$prefix}dropdown-inner-border-radius: #{$dropdown-inner-border-radius};\n  --#{$prefix}dropdown-divider-bg: #{$dropdown-divider-bg};\n  --#{$prefix}dropdown-divider-margin-y: #{$dropdown-divider-margin-y};\n  --#{$prefix}dropdown-box-shadow: #{$dropdown-box-shadow};\n  --#{$prefix}dropdown-link-color: #{$dropdown-link-color};\n  --#{$prefix}dropdown-link-hover-color: #{$dropdown-link-hover-color};\n  --#{$prefix}dropdown-link-hover-bg: #{$dropdown-link-hover-bg};\n  --#{$prefix}dropdown-link-active-color: #{$dropdown-link-active-color};\n  --#{$prefix}dropdown-link-active-bg: #{$dropdown-link-active-bg};\n  --#{$prefix}dropdown-link-disabled-color: #{$dropdown-link-disabled-color};\n  --#{$prefix}dropdown-item-padding-x: #{$dropdown-item-padding-x};\n  --#{$prefix}dropdown-item-padding-y: #{$dropdown-item-padding-y};\n  --#{$prefix}dropdown-header-color: #{$dropdown-header-color};\n  --#{$prefix}dropdown-header-padding-x: #{$dropdown-header-padding-x};\n  --#{$prefix}dropdown-header-padding-y: #{$dropdown-header-padding-y};\n  // scss-docs-end dropdown-css-vars\n\n  position: absolute;\n  z-index: var(--#{$prefix}dropdown-zindex);\n  display: none; // none by default, but block on \"open\" of the menu\n  min-width: var(--#{$prefix}dropdown-min-width);\n  padding: var(--#{$prefix}dropdown-padding-y) var(--#{$prefix}dropdown-padding-x);\n  margin: 0; // Override default margin of ul\n  @include font-size(var(--#{$prefix}dropdown-font-size));\n  color: var(--#{$prefix}dropdown-color);\n  text-align: left; // Ensures proper alignment if parent has it changed (e.g., modal footer)\n  list-style: none;\n  background-color: var(--#{$prefix}dropdown-bg);\n  background-clip: padding-box;\n  border: var(--#{$prefix}dropdown-border-width) solid var(--#{$prefix}dropdown-border-color);\n  @include border-radius(var(--#{$prefix}dropdown-border-radius));\n  @include box-shadow(var(--#{$prefix}dropdown-box-shadow));\n\n  &[data-bs-popper] {\n    top: 100%;\n    left: 0;\n    margin-top: var(--#{$prefix}dropdown-spacer);\n  }\n\n  @if $dropdown-padding-y == 0 {\n    > .dropdown-item:first-child,\n    > li:first-child .dropdown-item {\n      @include border-top-radius(var(--#{$prefix}dropdown-inner-border-radius));\n    }\n    > .dropdown-item:last-child,\n    > li:last-child .dropdown-item {\n      @include border-bottom-radius(var(--#{$prefix}dropdown-inner-border-radius));\n    }\n\n  }\n}\n\n// scss-docs-start responsive-breakpoints\n// We deliberately hardcode the `bs-` prefix because we check\n// this custom property in JS to determine Popper's positioning\n\n@each $breakpoint in map-keys($grid-breakpoints) {\n  @include media-breakpoint-up($breakpoint) {\n    $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n    .dropdown-menu#{$infix}-start {\n      --bs-position: start;\n\n      &[data-bs-popper] {\n        right: auto;\n        left: 0;\n      }\n    }\n\n    .dropdown-menu#{$infix}-end {\n      --bs-position: end;\n\n      &[data-bs-popper] {\n        right: 0;\n        left: auto;\n      }\n    }\n  }\n}\n// scss-docs-end responsive-breakpoints\n\n// Allow for dropdowns to go bottom up (aka, dropup-menu)\n// Just add .dropup after the standard .dropdown class and you're set.\n.dropup {\n  .dropdown-menu[data-bs-popper] {\n    top: auto;\n    bottom: 100%;\n    margin-top: 0;\n    margin-bottom: var(--#{$prefix}dropdown-spacer);\n  }\n\n  .dropdown-toggle {\n    @include caret(up);\n  }\n}\n\n.dropend {\n  .dropdown-menu[data-bs-popper] {\n    top: 0;\n    right: auto;\n    left: 100%;\n    margin-top: 0;\n    margin-left: var(--#{$prefix}dropdown-spacer);\n  }\n\n  .dropdown-toggle {\n    @include caret(end);\n    &::after {\n      vertical-align: 0;\n    }\n  }\n}\n\n.dropstart {\n  .dropdown-menu[data-bs-popper] {\n    top: 0;\n    right: 100%;\n    left: auto;\n    margin-top: 0;\n    margin-right: var(--#{$prefix}dropdown-spacer);\n  }\n\n  .dropdown-toggle {\n    @include caret(start);\n    &::before {\n      vertical-align: 0;\n    }\n  }\n}\n\n\n// Dividers (basically an `<hr>`) within the dropdown\n.dropdown-divider {\n  height: 0;\n  margin: var(--#{$prefix}dropdown-divider-margin-y) 0;\n  overflow: hidden;\n  border-top: 1px solid var(--#{$prefix}dropdown-divider-bg);\n  opacity: 1; // Revisit in v6 to de-dupe styles that conflict with <hr> element\n}\n\n// Links, buttons, and more within the dropdown menu\n//\n// `<button>`-specific styles are denoted with `// For <button>s`\n.dropdown-item {\n  display: block;\n  width: 100%; // For `<button>`s\n  padding: var(--#{$prefix}dropdown-item-padding-y) var(--#{$prefix}dropdown-item-padding-x);\n  clear: both;\n  font-weight: $font-weight-normal;\n  color: var(--#{$prefix}dropdown-link-color);\n  text-align: inherit; // For `<button>`s\n  text-decoration: if($link-decoration == none, null, none);\n  white-space: nowrap; // prevent links from randomly breaking onto new lines\n  background-color: transparent; // For `<button>`s\n  border: 0; // For `<button>`s\n  @include border-radius(var(--#{$prefix}dropdown-item-border-radius, 0));\n\n  &:hover,\n  &:focus {\n    color: var(--#{$prefix}dropdown-link-hover-color);\n    text-decoration: if($link-hover-decoration == underline, none, null);\n    @include gradient-bg(var(--#{$prefix}dropdown-link-hover-bg));\n  }\n\n  &.active,\n  &:active {\n    color: var(--#{$prefix}dropdown-link-active-color);\n    text-decoration: none;\n    @include gradient-bg(var(--#{$prefix}dropdown-link-active-bg));\n  }\n\n  &.disabled,\n  &:disabled {\n    color: var(--#{$prefix}dropdown-link-disabled-color);\n    pointer-events: none;\n    background-color: transparent;\n    // Remove CSS gradients if they're enabled\n    background-image: if($enable-gradients, none, null);\n  }\n}\n\n.dropdown-menu.show {\n  display: block;\n}\n\n// Dropdown section headers\n.dropdown-header {\n  display: block;\n  padding: var(--#{$prefix}dropdown-header-padding-y) var(--#{$prefix}dropdown-header-padding-x);\n  margin-bottom: 0; // for use with heading elements\n  @include font-size($font-size-sm);\n  color: var(--#{$prefix}dropdown-header-color);\n  white-space: nowrap; // as with > li > a\n}\n\n// Dropdown text\n.dropdown-item-text {\n  display: block;\n  padding: var(--#{$prefix}dropdown-item-padding-y) var(--#{$prefix}dropdown-item-padding-x);\n  color: var(--#{$prefix}dropdown-link-color);\n}\n\n// Dark dropdowns\n.dropdown-menu-dark {\n  // scss-docs-start dropdown-dark-css-vars\n  --#{$prefix}dropdown-color: #{$dropdown-dark-color};\n  --#{$prefix}dropdown-bg: #{$dropdown-dark-bg};\n  --#{$prefix}dropdown-border-color: #{$dropdown-dark-border-color};\n  --#{$prefix}dropdown-box-shadow: #{$dropdown-dark-box-shadow};\n  --#{$prefix}dropdown-link-color: #{$dropdown-dark-link-color};\n  --#{$prefix}dropdown-link-hover-color: #{$dropdown-dark-link-hover-color};\n  --#{$prefix}dropdown-divider-bg: #{$dropdown-dark-divider-bg};\n  --#{$prefix}dropdown-link-hover-bg: #{$dropdown-dark-link-hover-bg};\n  --#{$prefix}dropdown-link-active-color: #{$dropdown-dark-link-active-color};\n  --#{$prefix}dropdown-link-active-bg: #{$dropdown-dark-link-active-bg};\n  --#{$prefix}dropdown-link-disabled-color: #{$dropdown-dark-link-disabled-color};\n  --#{$prefix}dropdown-header-color: #{$dropdown-dark-header-color};\n  // scss-docs-end dropdown-dark-css-vars\n}\n","// scss-docs-start caret-mixins\n@mixin caret-down($width: $caret-width) {\n  border-top: $width solid;\n  border-right: $width solid transparent;\n  border-bottom: 0;\n  border-left: $width solid transparent;\n}\n\n@mixin caret-up($width: $caret-width) {\n  border-top: 0;\n  border-right: $width solid transparent;\n  border-bottom: $width solid;\n  border-left: $width solid transparent;\n}\n\n@mixin caret-end($width: $caret-width) {\n  border-top: $width solid transparent;\n  border-right: 0;\n  border-bottom: $width solid transparent;\n  border-left: $width solid;\n}\n\n@mixin caret-start($width: $caret-width) {\n  border-top: $width solid transparent;\n  border-right: $width solid;\n  border-bottom: $width solid transparent;\n}\n\n@mixin caret(\n  $direction: down,\n  $width: $caret-width,\n  $spacing: $caret-spacing,\n  $vertical-align: $caret-vertical-align\n) {\n  @if $enable-caret {\n    &::after {\n      display: inline-block;\n      margin-left: $spacing;\n      vertical-align: $vertical-align;\n      content: \"\";\n      @if $direction == down {\n        @include caret-down($width);\n      } @else if $direction == up {\n        @include caret-up($width);\n      } @else if $direction == end {\n        @include caret-end($width);\n      }\n    }\n\n    @if $direction == start {\n      &::after {\n        display: none;\n      }\n\n      &::before {\n        display: inline-block;\n        margin-right: $spacing;\n        vertical-align: $vertical-align;\n        content: \"\";\n        @include caret-start($width);\n      }\n    }\n\n    &:empty::after {\n      margin-left: 0;\n    }\n  }\n}\n// scss-docs-end caret-mixins\n","// Make the div behave like a button\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-flex;\n  vertical-align: middle; // match .btn alignment given font-size hack above\n\n  > .btn {\n    position: relative;\n    flex: 1 1 auto;\n  }\n\n  // Bring the hover, focused, and \"active\" buttons to the front to overlay\n  // the borders properly\n  > .btn-check:checked + .btn,\n  > .btn-check:focus + .btn,\n  > .btn:hover,\n  > .btn:focus,\n  > .btn:active,\n  > .btn.active {\n    z-index: 1;\n  }\n}\n\n// Optional: Group multiple button groups together for a toolbar\n.btn-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-start;\n\n  .input-group {\n    width: auto;\n  }\n}\n\n.btn-group {\n  @include border-radius($btn-border-radius);\n\n  // Prevent double borders when buttons are next to each other\n  > :not(.btn-check:first-child) + .btn,\n  > .btn-group:not(:first-child) {\n    margin-left: calc(#{$btn-border-width} * -1); // stylelint-disable-line function-disallowed-list\n  }\n\n  // Reset rounded corners\n  > .btn:not(:last-child):not(.dropdown-toggle),\n  > .btn.dropdown-toggle-split:first-child,\n  > .btn-group:not(:last-child) > .btn {\n    @include border-end-radius(0);\n  }\n\n  // The left radius should be 0 if the button is:\n  // - the \"third or more\" child\n  // - the second child and the previous element isn't `.btn-check` (making it the first child visually)\n  // - part of a btn-group which isn't the first child\n  > .btn:nth-child(n + 3),\n  > :not(.btn-check) + .btn,\n  > .btn-group:not(:first-child) > .btn {\n    @include border-start-radius(0);\n  }\n}\n\n// Sizing\n//\n// Remix the default button sizing classes into new ones for easier manipulation.\n\n.btn-group-sm > .btn { @extend .btn-sm; }\n.btn-group-lg > .btn { @extend .btn-lg; }\n\n\n//\n// Split button dropdowns\n//\n\n.dropdown-toggle-split {\n  padding-right: $btn-padding-x * .75;\n  padding-left: $btn-padding-x * .75;\n\n  &::after,\n  .dropup &::after,\n  .dropend &::after {\n    margin-left: 0;\n  }\n\n  .dropstart &::before {\n    margin-right: 0;\n  }\n}\n\n.btn-sm + .dropdown-toggle-split {\n  padding-right: $btn-padding-x-sm * .75;\n  padding-left: $btn-padding-x-sm * .75;\n}\n\n.btn-lg + .dropdown-toggle-split {\n  padding-right: $btn-padding-x-lg * .75;\n  padding-left: $btn-padding-x-lg * .75;\n}\n\n\n// The clickable button for toggling the menu\n// Set the same inset shadow as the :active state\n.btn-group.show .dropdown-toggle {\n  @include box-shadow($btn-active-box-shadow);\n\n  // Show no shadow for `.btn-link` since it has no other button styles.\n  &.btn-link {\n    @include box-shadow(none);\n  }\n}\n\n\n//\n// Vertical button groups\n//\n\n.btn-group-vertical {\n  flex-direction: column;\n  align-items: flex-start;\n  justify-content: center;\n\n  > .btn,\n  > .btn-group {\n    width: 100%;\n  }\n\n  > .btn:not(:first-child),\n  > .btn-group:not(:first-child) {\n    margin-top: calc(#{$btn-border-width} * -1); // stylelint-disable-line function-disallowed-list\n  }\n\n  // Reset rounded corners\n  > .btn:not(:last-child):not(.dropdown-toggle),\n  > .btn-group:not(:last-child) > .btn {\n    @include border-bottom-radius(0);\n  }\n\n  > .btn ~ .btn,\n  > .btn-group:not(:first-child) > .btn {\n    @include border-top-radius(0);\n  }\n}\n","// Base class\n//\n// Kickstart any navigation component with a set of style resets. Works with\n// `<nav>`s, `<ul>`s or `<ol>`s.\n\n.nav {\n  // scss-docs-start nav-css-vars\n  --#{$prefix}nav-link-padding-x: #{$nav-link-padding-x};\n  --#{$prefix}nav-link-padding-y: #{$nav-link-padding-y};\n  @include rfs($nav-link-font-size, --#{$prefix}nav-link-font-size);\n  --#{$prefix}nav-link-font-weight: #{$nav-link-font-weight};\n  --#{$prefix}nav-link-color: #{$nav-link-color};\n  --#{$prefix}nav-link-hover-color: #{$nav-link-hover-color};\n  --#{$prefix}nav-link-disabled-color: #{$nav-link-disabled-color};\n  // scss-docs-end nav-css-vars\n\n  display: flex;\n  flex-wrap: wrap;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n\n.nav-link {\n  display: block;\n  padding: var(--#{$prefix}nav-link-padding-y) var(--#{$prefix}nav-link-padding-x);\n  @include font-size(var(--#{$prefix}nav-link-font-size));\n  font-weight: var(--#{$prefix}nav-link-font-weight);\n  color: var(--#{$prefix}nav-link-color);\n  text-decoration: if($link-decoration == none, null, none);\n  background: none;\n  border: 0;\n  @include transition($nav-link-transition);\n\n  &:hover,\n  &:focus {\n    color: var(--#{$prefix}nav-link-hover-color);\n    text-decoration: if($link-hover-decoration == underline, none, null);\n  }\n\n  &:focus-visible {\n    outline: 0;\n    box-shadow: $nav-link-focus-box-shadow;\n  }\n\n  // Disabled state lightens text\n  &.disabled,\n  &:disabled {\n    color: var(--#{$prefix}nav-link-disabled-color);\n    pointer-events: none;\n    cursor: default;\n  }\n}\n\n//\n// Tabs\n//\n\n.nav-tabs {\n  // scss-docs-start nav-tabs-css-vars\n  --#{$prefix}nav-tabs-border-width: #{$nav-tabs-border-width};\n  --#{$prefix}nav-tabs-border-color: #{$nav-tabs-border-color};\n  --#{$prefix}nav-tabs-border-radius: #{$nav-tabs-border-radius};\n  --#{$prefix}nav-tabs-link-hover-border-color: #{$nav-tabs-link-hover-border-color};\n  --#{$prefix}nav-tabs-link-active-color: #{$nav-tabs-link-active-color};\n  --#{$prefix}nav-tabs-link-active-bg: #{$nav-tabs-link-active-bg};\n  --#{$prefix}nav-tabs-link-active-border-color: #{$nav-tabs-link-active-border-color};\n  // scss-docs-end nav-tabs-css-vars\n\n  border-bottom: var(--#{$prefix}nav-tabs-border-width) solid var(--#{$prefix}nav-tabs-border-color);\n\n  .nav-link {\n    margin-bottom: calc(-1 * var(--#{$prefix}nav-tabs-border-width)); // stylelint-disable-line function-disallowed-list\n    border: var(--#{$prefix}nav-tabs-border-width) solid transparent;\n    @include border-top-radius(var(--#{$prefix}nav-tabs-border-radius));\n\n    &:hover,\n    &:focus {\n      // Prevents active .nav-link tab overlapping focus outline of previous/next .nav-link\n      isolation: isolate;\n      border-color: var(--#{$prefix}nav-tabs-link-hover-border-color);\n    }\n  }\n\n  .nav-link.active,\n  .nav-item.show .nav-link {\n    color: var(--#{$prefix}nav-tabs-link-active-color);\n    background-color: var(--#{$prefix}nav-tabs-link-active-bg);\n    border-color: var(--#{$prefix}nav-tabs-link-active-border-color);\n  }\n\n  .dropdown-menu {\n    // Make dropdown border overlap tab border\n    margin-top: calc(-1 * var(--#{$prefix}nav-tabs-border-width)); // stylelint-disable-line function-disallowed-list\n    // Remove the top rounded corners here since there is a hard edge above the menu\n    @include border-top-radius(0);\n  }\n}\n\n\n//\n// Pills\n//\n\n.nav-pills {\n  // scss-docs-start nav-pills-css-vars\n  --#{$prefix}nav-pills-border-radius: #{$nav-pills-border-radius};\n  --#{$prefix}nav-pills-link-active-color: #{$nav-pills-link-active-color};\n  --#{$prefix}nav-pills-link-active-bg: #{$nav-pills-link-active-bg};\n  // scss-docs-end nav-pills-css-vars\n\n  .nav-link {\n    @include border-radius(var(--#{$prefix}nav-pills-border-radius));\n  }\n\n  .nav-link.active,\n  .show > .nav-link {\n    color: var(--#{$prefix}nav-pills-link-active-color);\n    @include gradient-bg(var(--#{$prefix}nav-pills-link-active-bg));\n  }\n}\n\n\n//\n// Underline\n//\n\n.nav-underline {\n  // scss-docs-start nav-underline-css-vars\n  --#{$prefix}nav-underline-gap: #{$nav-underline-gap};\n  --#{$prefix}nav-underline-border-width: #{$nav-underline-border-width};\n  --#{$prefix}nav-underline-link-active-color: #{$nav-underline-link-active-color};\n  // scss-docs-end nav-underline-css-vars\n\n  gap: var(--#{$prefix}nav-underline-gap);\n\n  .nav-link {\n    padding-right: 0;\n    padding-left: 0;\n    border-bottom: var(--#{$prefix}nav-underline-border-width) solid transparent;\n\n    &:hover,\n    &:focus {\n      border-bottom-color: currentcolor;\n    }\n  }\n\n  .nav-link.active,\n  .show > .nav-link {\n    font-weight: $font-weight-bold;\n    color: var(--#{$prefix}nav-underline-link-active-color);\n    border-bottom-color: currentcolor;\n  }\n}\n\n\n//\n// Justified variants\n//\n\n.nav-fill {\n  > .nav-link,\n  .nav-item {\n    flex: 1 1 auto;\n    text-align: center;\n  }\n}\n\n.nav-justified {\n  > .nav-link,\n  .nav-item {\n    flex-basis: 0;\n    flex-grow: 1;\n    text-align: center;\n  }\n}\n\n.nav-fill,\n.nav-justified {\n  .nav-item .nav-link {\n    width: 100%; // Make sure button will grow\n  }\n}\n\n\n// Tabbable tabs\n//\n// Hide tabbable panes to start, show them when `.active`\n\n.tab-content {\n  > .tab-pane {\n    display: none;\n  }\n  > .active {\n    display: block;\n  }\n}\n","// Navbar\n//\n// Provide a static navbar from which we expand to create full-width, fixed, and\n// other navbar variations.\n\n.navbar {\n  // scss-docs-start navbar-css-vars\n  --#{$prefix}navbar-padding-x: #{if($navbar-padding-x == null, 0, $navbar-padding-x)};\n  --#{$prefix}navbar-padding-y: #{$navbar-padding-y};\n  --#{$prefix}navbar-color: #{$navbar-light-color};\n  --#{$prefix}navbar-hover-color: #{$navbar-light-hover-color};\n  --#{$prefix}navbar-disabled-color: #{$navbar-light-disabled-color};\n  --#{$prefix}navbar-active-color: #{$navbar-light-active-color};\n  --#{$prefix}navbar-brand-padding-y: #{$navbar-brand-padding-y};\n  --#{$prefix}navbar-brand-margin-end: #{$navbar-brand-margin-end};\n  --#{$prefix}navbar-brand-font-size: #{$navbar-brand-font-size};\n  --#{$prefix}navbar-brand-color: #{$navbar-light-brand-color};\n  --#{$prefix}navbar-brand-hover-color: #{$navbar-light-brand-hover-color};\n  --#{$prefix}navbar-nav-link-padding-x: #{$navbar-nav-link-padding-x};\n  --#{$prefix}navbar-toggler-padding-y: #{$navbar-toggler-padding-y};\n  --#{$prefix}navbar-toggler-padding-x: #{$navbar-toggler-padding-x};\n  --#{$prefix}navbar-toggler-font-size: #{$navbar-toggler-font-size};\n  --#{$prefix}navbar-toggler-icon-bg: #{escape-svg($navbar-light-toggler-icon-bg)};\n  --#{$prefix}navbar-toggler-border-color: #{$navbar-light-toggler-border-color};\n  --#{$prefix}navbar-toggler-border-radius: #{$navbar-toggler-border-radius};\n  --#{$prefix}navbar-toggler-focus-width: #{$navbar-toggler-focus-width};\n  --#{$prefix}navbar-toggler-transition: #{$navbar-toggler-transition};\n  // scss-docs-end navbar-css-vars\n\n  position: relative;\n  display: flex;\n  flex-wrap: wrap; // allow us to do the line break for collapsing content\n  align-items: center;\n  justify-content: space-between; // space out brand from logo\n  padding: var(--#{$prefix}navbar-padding-y) var(--#{$prefix}navbar-padding-x);\n  @include gradient-bg();\n\n  // Because flex properties aren't inherited, we need to redeclare these first\n  // few properties so that content nested within behave properly.\n  // The `flex-wrap` property is inherited to simplify the expanded navbars\n  %container-flex-properties {\n    display: flex;\n    flex-wrap: inherit;\n    align-items: center;\n    justify-content: space-between;\n  }\n\n  > .container,\n  > .container-fluid {\n    @extend %container-flex-properties;\n  }\n\n  @each $breakpoint, $container-max-width in $container-max-widths {\n    > .container#{breakpoint-infix($breakpoint, $container-max-widths)} {\n      @extend %container-flex-properties;\n    }\n  }\n}\n\n\n// Navbar brand\n//\n// Used for brand, project, or site names.\n\n.navbar-brand {\n  padding-top: var(--#{$prefix}navbar-brand-padding-y);\n  padding-bottom: var(--#{$prefix}navbar-brand-padding-y);\n  margin-right: var(--#{$prefix}navbar-brand-margin-end);\n  @include font-size(var(--#{$prefix}navbar-brand-font-size));\n  color: var(--#{$prefix}navbar-brand-color);\n  text-decoration: if($link-decoration == none, null, none);\n  white-space: nowrap;\n\n  &:hover,\n  &:focus {\n    color: var(--#{$prefix}navbar-brand-hover-color);\n    text-decoration: if($link-hover-decoration == underline, none, null);\n  }\n}\n\n\n// Navbar nav\n//\n// Custom navbar navigation (doesn't require `.nav`, but does make use of `.nav-link`).\n\n.navbar-nav {\n  // scss-docs-start navbar-nav-css-vars\n  --#{$prefix}nav-link-padding-x: 0;\n  --#{$prefix}nav-link-padding-y: #{$nav-link-padding-y};\n  @include rfs($nav-link-font-size, --#{$prefix}nav-link-font-size);\n  --#{$prefix}nav-link-font-weight: #{$nav-link-font-weight};\n  --#{$prefix}nav-link-color: var(--#{$prefix}navbar-color);\n  --#{$prefix}nav-link-hover-color: var(--#{$prefix}navbar-hover-color);\n  --#{$prefix}nav-link-disabled-color: var(--#{$prefix}navbar-disabled-color);\n  // scss-docs-end navbar-nav-css-vars\n\n  display: flex;\n  flex-direction: column; // cannot use `inherit` to get the `.navbar`s value\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n\n  .nav-link {\n    &.active,\n    &.show {\n      color: var(--#{$prefix}navbar-active-color);\n    }\n  }\n\n  .dropdown-menu {\n    position: static;\n  }\n}\n\n\n// Navbar text\n//\n//\n\n.navbar-text {\n  padding-top: $nav-link-padding-y;\n  padding-bottom: $nav-link-padding-y;\n  color: var(--#{$prefix}navbar-color);\n\n  a,\n  a:hover,\n  a:focus  {\n    color: var(--#{$prefix}navbar-active-color);\n  }\n}\n\n\n// Responsive navbar\n//\n// Custom styles for responsive collapsing and toggling of navbar contents.\n// Powered by the collapse Bootstrap JavaScript plugin.\n\n// When collapsed, prevent the toggleable navbar contents from appearing in\n// the default flexbox row orientation. Requires the use of `flex-wrap: wrap`\n// on the `.navbar` parent.\n.navbar-collapse {\n  flex-basis: 100%;\n  flex-grow: 1;\n  // For always expanded or extra full navbars, ensure content aligns itself\n  // properly vertically. Can be easily overridden with flex utilities.\n  align-items: center;\n}\n\n// Button for toggling the navbar when in its collapsed state\n.navbar-toggler {\n  padding: var(--#{$prefix}navbar-toggler-padding-y) var(--#{$prefix}navbar-toggler-padding-x);\n  @include font-size(var(--#{$prefix}navbar-toggler-font-size));\n  line-height: 1;\n  color: var(--#{$prefix}navbar-color);\n  background-color: transparent; // remove default button style\n  border: var(--#{$prefix}border-width) solid var(--#{$prefix}navbar-toggler-border-color); // remove default button style\n  @include border-radius(var(--#{$prefix}navbar-toggler-border-radius));\n  @include transition(var(--#{$prefix}navbar-toggler-transition));\n\n  &:hover {\n    text-decoration: none;\n  }\n\n  &:focus {\n    text-decoration: none;\n    outline: 0;\n    box-shadow: 0 0 0 var(--#{$prefix}navbar-toggler-focus-width);\n  }\n}\n\n// Keep as a separate element so folks can easily override it with another icon\n// or image file as needed.\n.navbar-toggler-icon {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  vertical-align: middle;\n  background-image: var(--#{$prefix}navbar-toggler-icon-bg);\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 100%;\n}\n\n.navbar-nav-scroll {\n  max-height: var(--#{$prefix}scroll-height, 75vh);\n  overflow-y: auto;\n}\n\n// scss-docs-start navbar-expand-loop\n// Generate series of `.navbar-expand-*` responsive classes for configuring\n// where your navbar collapses.\n.navbar-expand {\n  @each $breakpoint in map-keys($grid-breakpoints) {\n    $next: breakpoint-next($breakpoint, $grid-breakpoints);\n    $infix: breakpoint-infix($next, $grid-breakpoints);\n\n    // stylelint-disable-next-line scss/selector-no-union-class-name\n    &#{$infix} {\n      @include media-breakpoint-up($next) {\n        flex-wrap: nowrap;\n        justify-content: flex-start;\n\n        .navbar-nav {\n          flex-direction: row;\n\n          .dropdown-menu {\n            position: absolute;\n          }\n\n          .nav-link {\n            padding-right: var(--#{$prefix}navbar-nav-link-padding-x);\n            padding-left: var(--#{$prefix}navbar-nav-link-padding-x);\n          }\n        }\n\n        .navbar-nav-scroll {\n          overflow: visible;\n        }\n\n        .navbar-collapse {\n          display: flex !important; // stylelint-disable-line declaration-no-important\n          flex-basis: auto;\n        }\n\n        .navbar-toggler {\n          display: none;\n        }\n\n        .offcanvas {\n          // stylelint-disable declaration-no-important\n          position: static;\n          z-index: auto;\n          flex-grow: 1;\n          width: auto !important;\n          height: auto !important;\n          visibility: visible !important;\n          background-color: transparent !important;\n          border: 0 !important;\n          transform: none !important;\n          @include box-shadow(none);\n          @include transition(none);\n          // stylelint-enable declaration-no-important\n\n          .offcanvas-header {\n            display: none;\n          }\n\n          .offcanvas-body {\n            display: flex;\n            flex-grow: 0;\n            padding: 0;\n            overflow-y: visible;\n          }\n        }\n      }\n    }\n  }\n}\n// scss-docs-end navbar-expand-loop\n\n// Navbar themes\n//\n// Styles for switching between navbars with light or dark background.\n\n.navbar-light {\n  @include deprecate(\"`.navbar-light`\", \"v5.2.0\", \"v6.0.0\", true);\n}\n\n.navbar-dark,\n.navbar[data-bs-theme=\"dark\"] {\n  // scss-docs-start navbar-dark-css-vars\n  --#{$prefix}navbar-color: #{$navbar-dark-color};\n  --#{$prefix}navbar-hover-color: #{$navbar-dark-hover-color};\n  --#{$prefix}navbar-disabled-color: #{$navbar-dark-disabled-color};\n  --#{$prefix}navbar-active-color: #{$navbar-dark-active-color};\n  --#{$prefix}navbar-brand-color: #{$navbar-dark-brand-color};\n  --#{$prefix}navbar-brand-hover-color: #{$navbar-dark-brand-hover-color};\n  --#{$prefix}navbar-toggler-border-color: #{$navbar-dark-toggler-border-color};\n  --#{$prefix}navbar-toggler-icon-bg: #{escape-svg($navbar-dark-toggler-icon-bg)};\n  // scss-docs-end navbar-dark-css-vars\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    .navbar-toggler-icon {\n      --#{$prefix}navbar-toggler-icon-bg: #{escape-svg($navbar-dark-toggler-icon-bg)};\n    }\n  }\n}\n","//\n// Base styles\n//\n\n.card {\n  // scss-docs-start card-css-vars\n  --#{$prefix}card-spacer-y: #{$card-spacer-y};\n  --#{$prefix}card-spacer-x: #{$card-spacer-x};\n  --#{$prefix}card-title-spacer-y: #{$card-title-spacer-y};\n  --#{$prefix}card-title-color: #{$card-title-color};\n  --#{$prefix}card-subtitle-color: #{$card-subtitle-color};\n  --#{$prefix}card-border-width: #{$card-border-width};\n  --#{$prefix}card-border-color: #{$card-border-color};\n  --#{$prefix}card-border-radius: #{$card-border-radius};\n  --#{$prefix}card-box-shadow: #{$card-box-shadow};\n  --#{$prefix}card-inner-border-radius: #{$card-inner-border-radius};\n  --#{$prefix}card-cap-padding-y: #{$card-cap-padding-y};\n  --#{$prefix}card-cap-padding-x: #{$card-cap-padding-x};\n  --#{$prefix}card-cap-bg: #{$card-cap-bg};\n  --#{$prefix}card-cap-color: #{$card-cap-color};\n  --#{$prefix}card-height: #{$card-height};\n  --#{$prefix}card-color: #{$card-color};\n  --#{$prefix}card-bg: #{$card-bg};\n  --#{$prefix}card-img-overlay-padding: #{$card-img-overlay-padding};\n  --#{$prefix}card-group-margin: #{$card-group-margin};\n  // scss-docs-end card-css-vars\n\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0; // See https://github.com/twbs/bootstrap/pull/22740#issuecomment-305868106\n  height: var(--#{$prefix}card-height);\n  color: var(--#{$prefix}body-color);\n  word-wrap: break-word;\n  background-color: var(--#{$prefix}card-bg);\n  background-clip: border-box;\n  border: var(--#{$prefix}card-border-width) solid var(--#{$prefix}card-border-color);\n  @include border-radius(var(--#{$prefix}card-border-radius));\n  @include box-shadow(var(--#{$prefix}card-box-shadow));\n\n  > hr {\n    margin-right: 0;\n    margin-left: 0;\n  }\n\n  > .list-group {\n    border-top: inherit;\n    border-bottom: inherit;\n\n    &:first-child {\n      border-top-width: 0;\n      @include border-top-radius(var(--#{$prefix}card-inner-border-radius));\n    }\n\n    &:last-child  {\n      border-bottom-width: 0;\n      @include border-bottom-radius(var(--#{$prefix}card-inner-border-radius));\n    }\n  }\n\n  // Due to specificity of the above selector (`.card > .list-group`), we must\n  // use a child selector here to prevent double borders.\n  > .card-header + .list-group,\n  > .list-group + .card-footer {\n    border-top: 0;\n  }\n}\n\n.card-body {\n  // Enable `flex-grow: 1` for decks and groups so that card blocks take up\n  // as much space as possible, ensuring footers are aligned to the bottom.\n  flex: 1 1 auto;\n  padding: var(--#{$prefix}card-spacer-y) var(--#{$prefix}card-spacer-x);\n  color: var(--#{$prefix}card-color);\n}\n\n.card-title {\n  margin-bottom: var(--#{$prefix}card-title-spacer-y);\n  color: var(--#{$prefix}card-title-color);\n}\n\n.card-subtitle {\n  margin-top: calc(-.5 * var(--#{$prefix}card-title-spacer-y)); // stylelint-disable-line function-disallowed-list\n  margin-bottom: 0;\n  color: var(--#{$prefix}card-subtitle-color);\n}\n\n.card-text:last-child {\n  margin-bottom: 0;\n}\n\n.card-link {\n  &:hover {\n    text-decoration: if($link-hover-decoration == underline, none, null);\n  }\n\n  + .card-link {\n    margin-left: var(--#{$prefix}card-spacer-x);\n  }\n}\n\n//\n// Optional textual caps\n//\n\n.card-header {\n  padding: var(--#{$prefix}card-cap-padding-y) var(--#{$prefix}card-cap-padding-x);\n  margin-bottom: 0; // Removes the default margin-bottom of <hN>\n  color: var(--#{$prefix}card-cap-color);\n  background-color: var(--#{$prefix}card-cap-bg);\n  border-bottom: var(--#{$prefix}card-border-width) solid var(--#{$prefix}card-border-color);\n\n  &:first-child {\n    @include border-radius(var(--#{$prefix}card-inner-border-radius) var(--#{$prefix}card-inner-border-radius) 0 0);\n  }\n}\n\n.card-footer {\n  padding: var(--#{$prefix}card-cap-padding-y) var(--#{$prefix}card-cap-padding-x);\n  color: var(--#{$prefix}card-cap-color);\n  background-color: var(--#{$prefix}card-cap-bg);\n  border-top: var(--#{$prefix}card-border-width) solid var(--#{$prefix}card-border-color);\n\n  &:last-child {\n    @include border-radius(0 0 var(--#{$prefix}card-inner-border-radius) var(--#{$prefix}card-inner-border-radius));\n  }\n}\n\n\n//\n// Header navs\n//\n\n.card-header-tabs {\n  margin-right: calc(-.5 * var(--#{$prefix}card-cap-padding-x)); // stylelint-disable-line function-disallowed-list\n  margin-bottom: calc(-1 * var(--#{$prefix}card-cap-padding-y)); // stylelint-disable-line function-disallowed-list\n  margin-left: calc(-.5 * var(--#{$prefix}card-cap-padding-x)); // stylelint-disable-line function-disallowed-list\n  border-bottom: 0;\n\n  .nav-link.active {\n    background-color: var(--#{$prefix}card-bg);\n    border-bottom-color: var(--#{$prefix}card-bg);\n  }\n}\n\n.card-header-pills {\n  margin-right: calc(-.5 * var(--#{$prefix}card-cap-padding-x)); // stylelint-disable-line function-disallowed-list\n  margin-left: calc(-.5 * var(--#{$prefix}card-cap-padding-x)); // stylelint-disable-line function-disallowed-list\n}\n\n// Card image\n.card-img-overlay {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: var(--#{$prefix}card-img-overlay-padding);\n  @include border-radius(var(--#{$prefix}card-inner-border-radius));\n}\n\n.card-img,\n.card-img-top,\n.card-img-bottom {\n  width: 100%; // Required because we use flexbox and this inherently applies align-self: stretch\n}\n\n.card-img,\n.card-img-top {\n  @include border-top-radius(var(--#{$prefix}card-inner-border-radius));\n}\n\n.card-img,\n.card-img-bottom {\n  @include border-bottom-radius(var(--#{$prefix}card-inner-border-radius));\n}\n\n\n//\n// Card groups\n//\n\n.card-group {\n  // The child selector allows nested `.card` within `.card-group`\n  // to display properly.\n  > .card {\n    margin-bottom: var(--#{$prefix}card-group-margin);\n  }\n\n  @include media-breakpoint-up(sm) {\n    display: flex;\n    flex-flow: row wrap;\n    // The child selector allows nested `.card` within `.card-group`\n    // to display properly.\n    > .card {\n      // Flexbugs #4: https://github.com/philipwalton/flexbugs#flexbug-4\n      flex: 1 0 0%;\n      margin-bottom: 0;\n\n      + .card {\n        margin-left: 0;\n        border-left: 0;\n      }\n\n      // Handle rounded corners\n      @if $enable-rounded {\n        &:not(:last-child) {\n          @include border-end-radius(0);\n\n          .card-img-top,\n          .card-header {\n            // stylelint-disable-next-line property-disallowed-list\n            border-top-right-radius: 0;\n          }\n          .card-img-bottom,\n          .card-footer {\n            // stylelint-disable-next-line property-disallowed-list\n            border-bottom-right-radius: 0;\n          }\n        }\n\n        &:not(:first-child) {\n          @include border-start-radius(0);\n\n          .card-img-top,\n          .card-header {\n            // stylelint-disable-next-line property-disallowed-list\n            border-top-left-radius: 0;\n          }\n          .card-img-bottom,\n          .card-footer {\n            // stylelint-disable-next-line property-disallowed-list\n            border-bottom-left-radius: 0;\n          }\n        }\n      }\n    }\n  }\n}\n","//\n// Base styles\n//\n\n.accordion {\n  // scss-docs-start accordion-css-vars\n  --#{$prefix}accordion-color: #{$accordion-color};\n  --#{$prefix}accordion-bg: #{$accordion-bg};\n  --#{$prefix}accordion-transition: #{$accordion-transition};\n  --#{$prefix}accordion-border-color: #{$accordion-border-color};\n  --#{$prefix}accordion-border-width: #{$accordion-border-width};\n  --#{$prefix}accordion-border-radius: #{$accordion-border-radius};\n  --#{$prefix}accordion-inner-border-radius: #{$accordion-inner-border-radius};\n  --#{$prefix}accordion-btn-padding-x: #{$accordion-button-padding-x};\n  --#{$prefix}accordion-btn-padding-y: #{$accordion-button-padding-y};\n  --#{$prefix}accordion-btn-color: #{$accordion-button-color};\n  --#{$prefix}accordion-btn-bg: #{$accordion-button-bg};\n  --#{$prefix}accordion-btn-icon: #{escape-svg($accordion-button-icon)};\n  --#{$prefix}accordion-btn-icon-width: #{$accordion-icon-width};\n  --#{$prefix}accordion-btn-icon-transform: #{$accordion-icon-transform};\n  --#{$prefix}accordion-btn-icon-transition: #{$accordion-icon-transition};\n  --#{$prefix}accordion-btn-active-icon: #{escape-svg($accordion-button-active-icon)};\n  --#{$prefix}accordion-btn-focus-border-color: #{$accordion-button-focus-border-color};\n  --#{$prefix}accordion-btn-focus-box-shadow: #{$accordion-button-focus-box-shadow};\n  --#{$prefix}accordion-body-padding-x: #{$accordion-body-padding-x};\n  --#{$prefix}accordion-body-padding-y: #{$accordion-body-padding-y};\n  --#{$prefix}accordion-active-color: #{$accordion-button-active-color};\n  --#{$prefix}accordion-active-bg: #{$accordion-button-active-bg};\n  // scss-docs-end accordion-css-vars\n}\n\n.accordion-button {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 100%;\n  padding: var(--#{$prefix}accordion-btn-padding-y) var(--#{$prefix}accordion-btn-padding-x);\n  @include font-size($font-size-base);\n  color: var(--#{$prefix}accordion-btn-color);\n  text-align: left; // Reset button style\n  background-color: var(--#{$prefix}accordion-btn-bg);\n  border: 0;\n  @include border-radius(0);\n  overflow-anchor: none;\n  @include transition(var(--#{$prefix}accordion-transition));\n\n  &:not(.collapsed) {\n    color: var(--#{$prefix}accordion-active-color);\n    background-color: var(--#{$prefix}accordion-active-bg);\n    box-shadow: inset 0 calc(-1 * var(--#{$prefix}accordion-border-width)) 0 var(--#{$prefix}accordion-border-color); // stylelint-disable-line function-disallowed-list\n\n    &::after {\n      background-image: var(--#{$prefix}accordion-btn-active-icon);\n      transform: var(--#{$prefix}accordion-btn-icon-transform);\n    }\n  }\n\n  // Accordion icon\n  &::after {\n    flex-shrink: 0;\n    width: var(--#{$prefix}accordion-btn-icon-width);\n    height: var(--#{$prefix}accordion-btn-icon-width);\n    margin-left: auto;\n    content: \"\";\n    background-image: var(--#{$prefix}accordion-btn-icon);\n    background-repeat: no-repeat;\n    background-size: var(--#{$prefix}accordion-btn-icon-width);\n    @include transition(var(--#{$prefix}accordion-btn-icon-transition));\n  }\n\n  &:hover {\n    z-index: 2;\n  }\n\n  &:focus {\n    z-index: 3;\n    border-color: var(--#{$prefix}accordion-btn-focus-border-color);\n    outline: 0;\n    box-shadow: var(--#{$prefix}accordion-btn-focus-box-shadow);\n  }\n}\n\n.accordion-header {\n  margin-bottom: 0;\n}\n\n.accordion-item {\n  color: var(--#{$prefix}accordion-color);\n  background-color: var(--#{$prefix}accordion-bg);\n  border: var(--#{$prefix}accordion-border-width) solid var(--#{$prefix}accordion-border-color);\n\n  &:first-of-type {\n    @include border-top-radius(var(--#{$prefix}accordion-border-radius));\n\n    .accordion-button {\n      @include border-top-radius(var(--#{$prefix}accordion-inner-border-radius));\n    }\n  }\n\n  &:not(:first-of-type) {\n    border-top: 0;\n  }\n\n  // Only set a border-radius on the last item if the accordion is collapsed\n  &:last-of-type {\n    @include border-bottom-radius(var(--#{$prefix}accordion-border-radius));\n\n    .accordion-button {\n      &.collapsed {\n        @include border-bottom-radius(var(--#{$prefix}accordion-inner-border-radius));\n      }\n    }\n\n    .accordion-collapse {\n      @include border-bottom-radius(var(--#{$prefix}accordion-border-radius));\n    }\n  }\n}\n\n.accordion-body {\n  padding: var(--#{$prefix}accordion-body-padding-y) var(--#{$prefix}accordion-body-padding-x);\n}\n\n\n// Flush accordion items\n//\n// Remove borders and border-radius to keep accordion items edge-to-edge.\n\n.accordion-flush {\n  .accordion-collapse {\n    border-width: 0;\n  }\n\n  .accordion-item {\n    border-right: 0;\n    border-left: 0;\n    @include border-radius(0);\n\n    &:first-child { border-top: 0; }\n    &:last-child { border-bottom: 0; }\n\n    .accordion-button {\n      &,\n      &.collapsed {\n        @include border-radius(0);\n      }\n    }\n  }\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    .accordion-button::after {\n      --#{$prefix}accordion-btn-icon: #{escape-svg($accordion-button-icon-dark)};\n      --#{$prefix}accordion-btn-active-icon: #{escape-svg($accordion-button-active-icon-dark)};\n    }\n  }\n}\n",".breadcrumb {\n  // scss-docs-start breadcrumb-css-vars\n  --#{$prefix}breadcrumb-padding-x: #{$breadcrumb-padding-x};\n  --#{$prefix}breadcrumb-padding-y: #{$breadcrumb-padding-y};\n  --#{$prefix}breadcrumb-margin-bottom: #{$breadcrumb-margin-bottom};\n  @include rfs($breadcrumb-font-size, --#{$prefix}breadcrumb-font-size);\n  --#{$prefix}breadcrumb-bg: #{$breadcrumb-bg};\n  --#{$prefix}breadcrumb-border-radius: #{$breadcrumb-border-radius};\n  --#{$prefix}breadcrumb-divider-color: #{$breadcrumb-divider-color};\n  --#{$prefix}breadcrumb-item-padding-x: #{$breadcrumb-item-padding-x};\n  --#{$prefix}breadcrumb-item-active-color: #{$breadcrumb-active-color};\n  // scss-docs-end breadcrumb-css-vars\n\n  display: flex;\n  flex-wrap: wrap;\n  padding: var(--#{$prefix}breadcrumb-padding-y) var(--#{$prefix}breadcrumb-padding-x);\n  margin-bottom: var(--#{$prefix}breadcrumb-margin-bottom);\n  @include font-size(var(--#{$prefix}breadcrumb-font-size));\n  list-style: none;\n  background-color: var(--#{$prefix}breadcrumb-bg);\n  @include border-radius(var(--#{$prefix}breadcrumb-border-radius));\n}\n\n.breadcrumb-item {\n  // The separator between breadcrumbs (by default, a forward-slash: \"/\")\n  + .breadcrumb-item {\n    padding-left: var(--#{$prefix}breadcrumb-item-padding-x);\n\n    &::before {\n      float: left; // Suppress inline spacings and underlining of the separator\n      padding-right: var(--#{$prefix}breadcrumb-item-padding-x);\n      color: var(--#{$prefix}breadcrumb-divider-color);\n      content: var(--#{$prefix}breadcrumb-divider, escape-svg($breadcrumb-divider)) #{\"/* rtl:\"} var(--#{$prefix}breadcrumb-divider, escape-svg($breadcrumb-divider-flipped)) #{\"*/\"};\n    }\n  }\n\n  &.active {\n    color: var(--#{$prefix}breadcrumb-item-active-color);\n  }\n}\n",".pagination {\n  // scss-docs-start pagination-css-vars\n  --#{$prefix}pagination-padding-x: #{$pagination-padding-x};\n  --#{$prefix}pagination-padding-y: #{$pagination-padding-y};\n  @include rfs($pagination-font-size, --#{$prefix}pagination-font-size);\n  --#{$prefix}pagination-color: #{$pagination-color};\n  --#{$prefix}pagination-bg: #{$pagination-bg};\n  --#{$prefix}pagination-border-width: #{$pagination-border-width};\n  --#{$prefix}pagination-border-color: #{$pagination-border-color};\n  --#{$prefix}pagination-border-radius: #{$pagination-border-radius};\n  --#{$prefix}pagination-hover-color: #{$pagination-hover-color};\n  --#{$prefix}pagination-hover-bg: #{$pagination-hover-bg};\n  --#{$prefix}pagination-hover-border-color: #{$pagination-hover-border-color};\n  --#{$prefix}pagination-focus-color: #{$pagination-focus-color};\n  --#{$prefix}pagination-focus-bg: #{$pagination-focus-bg};\n  --#{$prefix}pagination-focus-box-shadow: #{$pagination-focus-box-shadow};\n  --#{$prefix}pagination-active-color: #{$pagination-active-color};\n  --#{$prefix}pagination-active-bg: #{$pagination-active-bg};\n  --#{$prefix}pagination-active-border-color: #{$pagination-active-border-color};\n  --#{$prefix}pagination-disabled-color: #{$pagination-disabled-color};\n  --#{$prefix}pagination-disabled-bg: #{$pagination-disabled-bg};\n  --#{$prefix}pagination-disabled-border-color: #{$pagination-disabled-border-color};\n  // scss-docs-end pagination-css-vars\n\n  display: flex;\n  @include list-unstyled();\n}\n\n.page-link {\n  position: relative;\n  display: block;\n  padding: var(--#{$prefix}pagination-padding-y) var(--#{$prefix}pagination-padding-x);\n  @include font-size(var(--#{$prefix}pagination-font-size));\n  color: var(--#{$prefix}pagination-color);\n  text-decoration: if($link-decoration == none, null, none);\n  background-color: var(--#{$prefix}pagination-bg);\n  border: var(--#{$prefix}pagination-border-width) solid var(--#{$prefix}pagination-border-color);\n  @include transition($pagination-transition);\n\n  &:hover {\n    z-index: 2;\n    color: var(--#{$prefix}pagination-hover-color);\n    text-decoration: if($link-hover-decoration == underline, none, null);\n    background-color: var(--#{$prefix}pagination-hover-bg);\n    border-color: var(--#{$prefix}pagination-hover-border-color);\n  }\n\n  &:focus {\n    z-index: 3;\n    color: var(--#{$prefix}pagination-focus-color);\n    background-color: var(--#{$prefix}pagination-focus-bg);\n    outline: $pagination-focus-outline;\n    box-shadow: var(--#{$prefix}pagination-focus-box-shadow);\n  }\n\n  &.active,\n  .active > & {\n    z-index: 3;\n    color: var(--#{$prefix}pagination-active-color);\n    @include gradient-bg(var(--#{$prefix}pagination-active-bg));\n    border-color: var(--#{$prefix}pagination-active-border-color);\n  }\n\n  &.disabled,\n  .disabled > & {\n    color: var(--#{$prefix}pagination-disabled-color);\n    pointer-events: none;\n    background-color: var(--#{$prefix}pagination-disabled-bg);\n    border-color: var(--#{$prefix}pagination-disabled-border-color);\n  }\n}\n\n.page-item {\n  &:not(:first-child) .page-link {\n    margin-left: $pagination-margin-start;\n  }\n\n  @if $pagination-margin-start == calc(#{$pagination-border-width} * -1) {\n    &:first-child {\n      .page-link {\n        @include border-start-radius(var(--#{$prefix}pagination-border-radius));\n      }\n    }\n\n    &:last-child {\n      .page-link {\n        @include border-end-radius(var(--#{$prefix}pagination-border-radius));\n      }\n    }\n  } @else {\n    // Add border-radius to all pageLinks in case they have left margin\n    .page-link {\n      @include border-radius(var(--#{$prefix}pagination-border-radius));\n    }\n  }\n}\n\n\n//\n// Sizing\n//\n\n.pagination-lg {\n  @include pagination-size($pagination-padding-y-lg, $pagination-padding-x-lg, $font-size-lg, $pagination-border-radius-lg);\n}\n\n.pagination-sm {\n  @include pagination-size($pagination-padding-y-sm, $pagination-padding-x-sm, $font-size-sm, $pagination-border-radius-sm);\n}\n","// Pagination\n\n// scss-docs-start pagination-mixin\n@mixin pagination-size($padding-y, $padding-x, $font-size, $border-radius) {\n  --#{$prefix}pagination-padding-x: #{$padding-x};\n  --#{$prefix}pagination-padding-y: #{$padding-y};\n  @include rfs($font-size, --#{$prefix}pagination-font-size);\n  --#{$prefix}pagination-border-radius: #{$border-radius};\n}\n// scss-docs-end pagination-mixin\n","// Base class\n//\n// Requires one of the contextual, color modifier classes for `color` and\n// `background-color`.\n\n.badge {\n  // scss-docs-start badge-css-vars\n  --#{$prefix}badge-padding-x: #{$badge-padding-x};\n  --#{$prefix}badge-padding-y: #{$badge-padding-y};\n  @include rfs($badge-font-size, --#{$prefix}badge-font-size);\n  --#{$prefix}badge-font-weight: #{$badge-font-weight};\n  --#{$prefix}badge-color: #{$badge-color};\n  --#{$prefix}badge-border-radius: #{$badge-border-radius};\n  // scss-docs-end badge-css-vars\n\n  display: inline-block;\n  padding: var(--#{$prefix}badge-padding-y) var(--#{$prefix}badge-padding-x);\n  @include font-size(var(--#{$prefix}badge-font-size));\n  font-weight: var(--#{$prefix}badge-font-weight);\n  line-height: 1;\n  color: var(--#{$prefix}badge-color);\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  @include border-radius(var(--#{$prefix}badge-border-radius));\n  @include gradient-bg();\n\n  // Empty badges collapse automatically\n  &:empty {\n    display: none;\n  }\n}\n\n// Quick fix for badges in buttons\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n","//\n// Base styles\n//\n\n.alert {\n  // scss-docs-start alert-css-vars\n  --#{$prefix}alert-bg: transparent;\n  --#{$prefix}alert-padding-x: #{$alert-padding-x};\n  --#{$prefix}alert-padding-y: #{$alert-padding-y};\n  --#{$prefix}alert-margin-bottom: #{$alert-margin-bottom};\n  --#{$prefix}alert-color: inherit;\n  --#{$prefix}alert-border-color: transparent;\n  --#{$prefix}alert-border: #{$alert-border-width} solid var(--#{$prefix}alert-border-color);\n  --#{$prefix}alert-border-radius: #{$alert-border-radius};\n  --#{$prefix}alert-link-color: inherit;\n  // scss-docs-end alert-css-vars\n\n  position: relative;\n  padding: var(--#{$prefix}alert-padding-y) var(--#{$prefix}alert-padding-x);\n  margin-bottom: var(--#{$prefix}alert-margin-bottom);\n  color: var(--#{$prefix}alert-color);\n  background-color: var(--#{$prefix}alert-bg);\n  border: var(--#{$prefix}alert-border);\n  @include border-radius(var(--#{$prefix}alert-border-radius));\n}\n\n// Headings for larger alerts\n.alert-heading {\n  // Specified to prevent conflicts of changing $headings-color\n  color: inherit;\n}\n\n// Provide class for links that match alerts\n.alert-link {\n  font-weight: $alert-link-font-weight;\n  color: var(--#{$prefix}alert-link-color);\n}\n\n\n// Dismissible alerts\n//\n// Expand the right padding and account for the close button's positioning.\n\n.alert-dismissible {\n  padding-right: $alert-dismissible-padding-r;\n\n  // Adjust close link position\n  .btn-close {\n    position: absolute;\n    top: 0;\n    right: 0;\n    z-index: $stretched-link-z-index + 1;\n    padding: $alert-padding-y * 1.25 $alert-padding-x;\n  }\n}\n\n\n// scss-docs-start alert-modifiers\n// Generate contextual modifier classes for colorizing the alert\n@each $state in map-keys($theme-colors) {\n  .alert-#{$state} {\n    --#{$prefix}alert-color: var(--#{$prefix}#{$state}-text-emphasis);\n    --#{$prefix}alert-bg: var(--#{$prefix}#{$state}-bg-subtle);\n    --#{$prefix}alert-border-color: var(--#{$prefix}#{$state}-border-subtle);\n    --#{$prefix}alert-link-color: var(--#{$prefix}#{$state}-text-emphasis);\n  }\n}\n// scss-docs-end alert-modifiers\n","// Disable animation if transitions are disabled\n\n// scss-docs-start progress-keyframes\n@if $enable-transitions {\n  @keyframes progress-bar-stripes {\n    0% { background-position-x: $progress-height; }\n  }\n}\n// scss-docs-end progress-keyframes\n\n.progress,\n.progress-stacked {\n  // scss-docs-start progress-css-vars\n  --#{$prefix}progress-height: #{$progress-height};\n  @include rfs($progress-font-size, --#{$prefix}progress-font-size);\n  --#{$prefix}progress-bg: #{$progress-bg};\n  --#{$prefix}progress-border-radius: #{$progress-border-radius};\n  --#{$prefix}progress-box-shadow: #{$progress-box-shadow};\n  --#{$prefix}progress-bar-color: #{$progress-bar-color};\n  --#{$prefix}progress-bar-bg: #{$progress-bar-bg};\n  --#{$prefix}progress-bar-transition: #{$progress-bar-transition};\n  // scss-docs-end progress-css-vars\n\n  display: flex;\n  height: var(--#{$prefix}progress-height);\n  overflow: hidden; // force rounded corners by cropping it\n  @include font-size(var(--#{$prefix}progress-font-size));\n  background-color: var(--#{$prefix}progress-bg);\n  @include border-radius(var(--#{$prefix}progress-border-radius));\n  @include box-shadow(var(--#{$prefix}progress-box-shadow));\n}\n\n.progress-bar {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  overflow: hidden;\n  color: var(--#{$prefix}progress-bar-color);\n  text-align: center;\n  white-space: nowrap;\n  background-color: var(--#{$prefix}progress-bar-bg);\n  @include transition(var(--#{$prefix}progress-bar-transition));\n}\n\n.progress-bar-striped {\n  @include gradient-striped();\n  background-size: var(--#{$prefix}progress-height) var(--#{$prefix}progress-height);\n}\n\n.progress-stacked > .progress {\n  overflow: visible;\n}\n\n.progress-stacked > .progress > .progress-bar {\n  width: 100%;\n}\n\n@if $enable-transitions {\n  .progress-bar-animated {\n    animation: $progress-bar-animation-timing progress-bar-stripes;\n\n    @if $enable-reduced-motion {\n      @media (prefers-reduced-motion: reduce) {\n        animation: none;\n      }\n    }\n  }\n}\n","// Base class\n//\n// Easily usable on <ul>, <ol>, or <div>.\n\n.list-group {\n  // scss-docs-start list-group-css-vars\n  --#{$prefix}list-group-color: #{$list-group-color};\n  --#{$prefix}list-group-bg: #{$list-group-bg};\n  --#{$prefix}list-group-border-color: #{$list-group-border-color};\n  --#{$prefix}list-group-border-width: #{$list-group-border-width};\n  --#{$prefix}list-group-border-radius: #{$list-group-border-radius};\n  --#{$prefix}list-group-item-padding-x: #{$list-group-item-padding-x};\n  --#{$prefix}list-group-item-padding-y: #{$list-group-item-padding-y};\n  --#{$prefix}list-group-action-color: #{$list-group-action-color};\n  --#{$prefix}list-group-action-hover-color: #{$list-group-action-hover-color};\n  --#{$prefix}list-group-action-hover-bg: #{$list-group-hover-bg};\n  --#{$prefix}list-group-action-active-color: #{$list-group-action-active-color};\n  --#{$prefix}list-group-action-active-bg: #{$list-group-action-active-bg};\n  --#{$prefix}list-group-disabled-color: #{$list-group-disabled-color};\n  --#{$prefix}list-group-disabled-bg: #{$list-group-disabled-bg};\n  --#{$prefix}list-group-active-color: #{$list-group-active-color};\n  --#{$prefix}list-group-active-bg: #{$list-group-active-bg};\n  --#{$prefix}list-group-active-border-color: #{$list-group-active-border-color};\n  // scss-docs-end list-group-css-vars\n\n  display: flex;\n  flex-direction: column;\n\n  // No need to set list-style: none; since .list-group-item is block level\n  padding-left: 0; // reset padding because ul and ol\n  margin-bottom: 0;\n  @include border-radius(var(--#{$prefix}list-group-border-radius));\n}\n\n.list-group-numbered {\n  list-style-type: none;\n  counter-reset: section;\n\n  > .list-group-item::before {\n    // Increments only this instance of the section counter\n    content: counters(section, \".\") \". \";\n    counter-increment: section;\n  }\n}\n\n// Interactive list items\n//\n// Use anchor or button elements instead of `li`s or `div`s to create interactive\n// list items. Includes an extra `.active` modifier class for selected items.\n\n.list-group-item-action {\n  width: 100%; // For `<button>`s (anchors become 100% by default though)\n  color: var(--#{$prefix}list-group-action-color);\n  text-align: inherit; // For `<button>`s (anchors inherit)\n\n  // Hover state\n  &:hover,\n  &:focus {\n    z-index: 1; // Place hover/focus items above their siblings for proper border styling\n    color: var(--#{$prefix}list-group-action-hover-color);\n    text-decoration: none;\n    background-color: var(--#{$prefix}list-group-action-hover-bg);\n  }\n\n  &:active {\n    color: var(--#{$prefix}list-group-action-active-color);\n    background-color: var(--#{$prefix}list-group-action-active-bg);\n  }\n}\n\n// Individual list items\n//\n// Use on `li`s or `div`s within the `.list-group` parent.\n\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: var(--#{$prefix}list-group-item-padding-y) var(--#{$prefix}list-group-item-padding-x);\n  color: var(--#{$prefix}list-group-color);\n  text-decoration: if($link-decoration == none, null, none);\n  background-color: var(--#{$prefix}list-group-bg);\n  border: var(--#{$prefix}list-group-border-width) solid var(--#{$prefix}list-group-border-color);\n\n  &:first-child {\n    @include border-top-radius(inherit);\n  }\n\n  &:last-child {\n    @include border-bottom-radius(inherit);\n  }\n\n  &.disabled,\n  &:disabled {\n    color: var(--#{$prefix}list-group-disabled-color);\n    pointer-events: none;\n    background-color: var(--#{$prefix}list-group-disabled-bg);\n  }\n\n  // Include both here for `<a>`s and `<button>`s\n  &.active {\n    z-index: 2; // Place active items above their siblings for proper border styling\n    color: var(--#{$prefix}list-group-active-color);\n    background-color: var(--#{$prefix}list-group-active-bg);\n    border-color: var(--#{$prefix}list-group-active-border-color);\n  }\n\n  // stylelint-disable-next-line scss/selector-no-redundant-nesting-selector\n  & + .list-group-item {\n    border-top-width: 0;\n\n    &.active {\n      margin-top: calc(-1 * var(--#{$prefix}list-group-border-width)); // stylelint-disable-line function-disallowed-list\n      border-top-width: var(--#{$prefix}list-group-border-width);\n    }\n  }\n}\n\n// Horizontal\n//\n// Change the layout of list group items from vertical (default) to horizontal.\n\n@each $breakpoint in map-keys($grid-breakpoints) {\n  @include media-breakpoint-up($breakpoint) {\n    $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n    .list-group-horizontal#{$infix} {\n      flex-direction: row;\n\n      > .list-group-item {\n        &:first-child:not(:last-child) {\n          @include border-bottom-start-radius(var(--#{$prefix}list-group-border-radius));\n          @include border-top-end-radius(0);\n        }\n\n        &:last-child:not(:first-child) {\n          @include border-top-end-radius(var(--#{$prefix}list-group-border-radius));\n          @include border-bottom-start-radius(0);\n        }\n\n        &.active {\n          margin-top: 0;\n        }\n\n        + .list-group-item {\n          border-top-width: var(--#{$prefix}list-group-border-width);\n          border-left-width: 0;\n\n          &.active {\n            margin-left: calc(-1 * var(--#{$prefix}list-group-border-width)); // stylelint-disable-line function-disallowed-list\n            border-left-width: var(--#{$prefix}list-group-border-width);\n          }\n        }\n      }\n    }\n  }\n}\n\n\n// Flush list items\n//\n// Remove borders and border-radius to keep list group items edge-to-edge. Most\n// useful within other components (e.g., cards).\n\n.list-group-flush {\n  @include border-radius(0);\n\n  > .list-group-item {\n    border-width: 0 0 var(--#{$prefix}list-group-border-width);\n\n    &:last-child {\n      border-bottom-width: 0;\n    }\n  }\n}\n\n\n// scss-docs-start list-group-modifiers\n// List group contextual variants\n//\n// Add modifier classes to change text and background color on individual items.\n// Organizationally, this must come after the `:hover` states.\n\n@each $state in map-keys($theme-colors) {\n  .list-group-item-#{$state} {\n    --#{$prefix}list-group-color: var(--#{$prefix}#{$state}-text-emphasis);\n    --#{$prefix}list-group-bg: var(--#{$prefix}#{$state}-bg-subtle);\n    --#{$prefix}list-group-border-color: var(--#{$prefix}#{$state}-border-subtle);\n    --#{$prefix}list-group-action-hover-color: var(--#{$prefix}emphasis-color);\n    --#{$prefix}list-group-action-hover-bg: var(--#{$prefix}#{$state}-border-subtle);\n    --#{$prefix}list-group-action-active-color: var(--#{$prefix}emphasis-color);\n    --#{$prefix}list-group-action-active-bg: var(--#{$prefix}#{$state}-border-subtle);\n    --#{$prefix}list-group-active-color: var(--#{$prefix}#{$state}-bg-subtle);\n    --#{$prefix}list-group-active-bg: var(--#{$prefix}#{$state}-text-emphasis);\n    --#{$prefix}list-group-active-border-color: var(--#{$prefix}#{$state}-text-emphasis);\n  }\n}\n// scss-docs-end list-group-modifiers\n","// Transparent background and border properties included for button version.\n// iOS requires the button element instead of an anchor tag.\n// If you want the anchor version, it requires `href=\"#\"`.\n// See https://developer.mozilla.org/en-US/docs/Web/Events/click#Safari_Mobile\n\n.btn-close {\n  // scss-docs-start close-css-vars\n  --#{$prefix}btn-close-color: #{$btn-close-color};\n  --#{$prefix}btn-close-bg: #{ escape-svg($btn-close-bg) };\n  --#{$prefix}btn-close-opacity: #{$btn-close-opacity};\n  --#{$prefix}btn-close-hover-opacity: #{$btn-close-hover-opacity};\n  --#{$prefix}btn-close-focus-shadow: #{$btn-close-focus-shadow};\n  --#{$prefix}btn-close-focus-opacity: #{$btn-close-focus-opacity};\n  --#{$prefix}btn-close-disabled-opacity: #{$btn-close-disabled-opacity};\n  --#{$prefix}btn-close-white-filter: #{$btn-close-white-filter};\n  // scss-docs-end close-css-vars\n\n  box-sizing: content-box;\n  width: $btn-close-width;\n  height: $btn-close-height;\n  padding: $btn-close-padding-y $btn-close-padding-x;\n  color: var(--#{$prefix}btn-close-color);\n  background: transparent var(--#{$prefix}btn-close-bg) center / $btn-close-width auto no-repeat; // include transparent for button elements\n  border: 0; // for button elements\n  @include border-radius();\n  opacity: var(--#{$prefix}btn-close-opacity);\n\n  // Override <a>'s hover style\n  &:hover {\n    color: var(--#{$prefix}btn-close-color);\n    text-decoration: none;\n    opacity: var(--#{$prefix}btn-close-hover-opacity);\n  }\n\n  &:focus {\n    outline: 0;\n    box-shadow: var(--#{$prefix}btn-close-focus-shadow);\n    opacity: var(--#{$prefix}btn-close-focus-opacity);\n  }\n\n  &:disabled,\n  &.disabled {\n    pointer-events: none;\n    user-select: none;\n    opacity: var(--#{$prefix}btn-close-disabled-opacity);\n  }\n}\n\n@mixin btn-close-white() {\n  filter: var(--#{$prefix}btn-close-white-filter);\n}\n\n.btn-close-white {\n  @include btn-close-white();\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    .btn-close {\n      @include btn-close-white();\n    }\n  }\n}\n",".toast {\n  // scss-docs-start toast-css-vars\n  --#{$prefix}toast-zindex: #{$zindex-toast};\n  --#{$prefix}toast-padding-x: #{$toast-padding-x};\n  --#{$prefix}toast-padding-y: #{$toast-padding-y};\n  --#{$prefix}toast-spacing: #{$toast-spacing};\n  --#{$prefix}toast-max-width: #{$toast-max-width};\n  @include rfs($toast-font-size, --#{$prefix}toast-font-size);\n  --#{$prefix}toast-color: #{$toast-color};\n  --#{$prefix}toast-bg: #{$toast-background-color};\n  --#{$prefix}toast-border-width: #{$toast-border-width};\n  --#{$prefix}toast-border-color: #{$toast-border-color};\n  --#{$prefix}toast-border-radius: #{$toast-border-radius};\n  --#{$prefix}toast-box-shadow: #{$toast-box-shadow};\n  --#{$prefix}toast-header-color: #{$toast-header-color};\n  --#{$prefix}toast-header-bg: #{$toast-header-background-color};\n  --#{$prefix}toast-header-border-color: #{$toast-header-border-color};\n  // scss-docs-end toast-css-vars\n\n  width: var(--#{$prefix}toast-max-width);\n  max-width: 100%;\n  @include font-size(var(--#{$prefix}toast-font-size));\n  color: var(--#{$prefix}toast-color);\n  pointer-events: auto;\n  background-color: var(--#{$prefix}toast-bg);\n  background-clip: padding-box;\n  border: var(--#{$prefix}toast-border-width) solid var(--#{$prefix}toast-border-color);\n  box-shadow: var(--#{$prefix}toast-box-shadow);\n  @include border-radius(var(--#{$prefix}toast-border-radius));\n\n  &.showing {\n    opacity: 0;\n  }\n\n  &:not(.show) {\n    display: none;\n  }\n}\n\n.toast-container {\n  --#{$prefix}toast-zindex: #{$zindex-toast};\n\n  position: absolute;\n  z-index: var(--#{$prefix}toast-zindex);\n  width: max-content;\n  max-width: 100%;\n  pointer-events: none;\n\n  > :not(:last-child) {\n    margin-bottom: var(--#{$prefix}toast-spacing);\n  }\n}\n\n.toast-header {\n  display: flex;\n  align-items: center;\n  padding: var(--#{$prefix}toast-padding-y) var(--#{$prefix}toast-padding-x);\n  color: var(--#{$prefix}toast-header-color);\n  background-color: var(--#{$prefix}toast-header-bg);\n  background-clip: padding-box;\n  border-bottom: var(--#{$prefix}toast-border-width) solid var(--#{$prefix}toast-header-border-color);\n  @include border-top-radius(calc(var(--#{$prefix}toast-border-radius) - var(--#{$prefix}toast-border-width)));\n\n  .btn-close {\n    margin-right: calc(-.5 * var(--#{$prefix}toast-padding-x)); // stylelint-disable-line function-disallowed-list\n    margin-left: var(--#{$prefix}toast-padding-x);\n  }\n}\n\n.toast-body {\n  padding: var(--#{$prefix}toast-padding-x);\n  word-wrap: break-word;\n}\n","// stylelint-disable function-disallowed-list\n\n// .modal-open      - body class for killing the scroll\n// .modal           - container to scroll within\n// .modal-dialog    - positioning shell for the actual modal\n// .modal-content   - actual modal w/ bg and corners and stuff\n\n\n// Container that the modal scrolls within\n.modal {\n  // scss-docs-start modal-css-vars\n  --#{$prefix}modal-zindex: #{$zindex-modal};\n  --#{$prefix}modal-width: #{$modal-md};\n  --#{$prefix}modal-padding: #{$modal-inner-padding};\n  --#{$prefix}modal-margin: #{$modal-dialog-margin};\n  --#{$prefix}modal-color: #{$modal-content-color};\n  --#{$prefix}modal-bg: #{$modal-content-bg};\n  --#{$prefix}modal-border-color: #{$modal-content-border-color};\n  --#{$prefix}modal-border-width: #{$modal-content-border-width};\n  --#{$prefix}modal-border-radius: #{$modal-content-border-radius};\n  --#{$prefix}modal-box-shadow: #{$modal-content-box-shadow-xs};\n  --#{$prefix}modal-inner-border-radius: #{$modal-content-inner-border-radius};\n  --#{$prefix}modal-header-padding-x: #{$modal-header-padding-x};\n  --#{$prefix}modal-header-padding-y: #{$modal-header-padding-y};\n  --#{$prefix}modal-header-padding: #{$modal-header-padding}; // Todo in v6: Split this padding into x and y\n  --#{$prefix}modal-header-border-color: #{$modal-header-border-color};\n  --#{$prefix}modal-header-border-width: #{$modal-header-border-width};\n  --#{$prefix}modal-title-line-height: #{$modal-title-line-height};\n  --#{$prefix}modal-footer-gap: #{$modal-footer-margin-between};\n  --#{$prefix}modal-footer-bg: #{$modal-footer-bg};\n  --#{$prefix}modal-footer-border-color: #{$modal-footer-border-color};\n  --#{$prefix}modal-footer-border-width: #{$modal-footer-border-width};\n  // scss-docs-end modal-css-vars\n\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: var(--#{$prefix}modal-zindex);\n  display: none;\n  width: 100%;\n  height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n  // Prevent Chrome on Windows from adding a focus outline. For details, see\n  // https://github.com/twbs/bootstrap/pull/10951.\n  outline: 0;\n  // We deliberately don't use `-webkit-overflow-scrolling: touch;` due to a\n  // gnarly iOS Safari bug: https://bugs.webkit.org/show_bug.cgi?id=158342\n  // See also https://github.com/twbs/bootstrap/issues/17695\n}\n\n// Shell div to position the modal with bottom padding\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: var(--#{$prefix}modal-margin);\n  // allow clicks to pass through for custom click handling to close modal\n  pointer-events: none;\n\n  // When fading in the modal, animate it to slide down\n  .modal.fade & {\n    @include transition($modal-transition);\n    transform: $modal-fade-transform;\n  }\n  .modal.show & {\n    transform: $modal-show-transform;\n  }\n\n  // When trying to close, animate focus to scale\n  .modal.modal-static & {\n    transform: $modal-scale-transform;\n  }\n}\n\n.modal-dialog-scrollable {\n  height: calc(100% - var(--#{$prefix}modal-margin) * 2);\n\n  .modal-content {\n    max-height: 100%;\n    overflow: hidden;\n  }\n\n  .modal-body {\n    overflow-y: auto;\n  }\n}\n\n.modal-dialog-centered {\n  display: flex;\n  align-items: center;\n  min-height: calc(100% - var(--#{$prefix}modal-margin) * 2);\n}\n\n// Actual modal\n.modal-content {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%; // Ensure `.modal-content` extends the full width of the parent `.modal-dialog`\n  // counteract the pointer-events: none; in the .modal-dialog\n  color: var(--#{$prefix}modal-color);\n  pointer-events: auto;\n  background-color: var(--#{$prefix}modal-bg);\n  background-clip: padding-box;\n  border: var(--#{$prefix}modal-border-width) solid var(--#{$prefix}modal-border-color);\n  @include border-radius(var(--#{$prefix}modal-border-radius));\n  @include box-shadow(var(--#{$prefix}modal-box-shadow));\n  // Remove focus outline from opened modal\n  outline: 0;\n}\n\n// Modal background\n.modal-backdrop {\n  // scss-docs-start modal-backdrop-css-vars\n  --#{$prefix}backdrop-zindex: #{$zindex-modal-backdrop};\n  --#{$prefix}backdrop-bg: #{$modal-backdrop-bg};\n  --#{$prefix}backdrop-opacity: #{$modal-backdrop-opacity};\n  // scss-docs-end modal-backdrop-css-vars\n\n  @include overlay-backdrop(var(--#{$prefix}backdrop-zindex), var(--#{$prefix}backdrop-bg), var(--#{$prefix}backdrop-opacity));\n}\n\n// Modal header\n// Top section of the modal w/ title and dismiss\n.modal-header {\n  display: flex;\n  flex-shrink: 0;\n  align-items: center;\n  justify-content: space-between; // Put modal header elements (title and dismiss) on opposite ends\n  padding: var(--#{$prefix}modal-header-padding);\n  border-bottom: var(--#{$prefix}modal-header-border-width) solid var(--#{$prefix}modal-header-border-color);\n  @include border-top-radius(var(--#{$prefix}modal-inner-border-radius));\n\n  .btn-close {\n    padding: calc(var(--#{$prefix}modal-header-padding-y) * .5) calc(var(--#{$prefix}modal-header-padding-x) * .5);\n    margin: calc(-.5 * var(--#{$prefix}modal-header-padding-y)) calc(-.5 * var(--#{$prefix}modal-header-padding-x)) calc(-.5 * var(--#{$prefix}modal-header-padding-y)) auto;\n  }\n}\n\n// Title text within header\n.modal-title {\n  margin-bottom: 0;\n  line-height: var(--#{$prefix}modal-title-line-height);\n}\n\n// Modal body\n// Where all modal content resides (sibling of .modal-header and .modal-footer)\n.modal-body {\n  position: relative;\n  // Enable `flex-grow: 1` so that the body take up as much space as possible\n  // when there should be a fixed height on `.modal-dialog`.\n  flex: 1 1 auto;\n  padding: var(--#{$prefix}modal-padding);\n}\n\n// Footer (for actions)\n.modal-footer {\n  display: flex;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n  align-items: center; // vertically center\n  justify-content: flex-end; // Right align buttons with flex property because text-align doesn't work on flex items\n  padding: calc(var(--#{$prefix}modal-padding) - var(--#{$prefix}modal-footer-gap) * .5);\n  background-color: var(--#{$prefix}modal-footer-bg);\n  border-top: var(--#{$prefix}modal-footer-border-width) solid var(--#{$prefix}modal-footer-border-color);\n  @include border-bottom-radius(var(--#{$prefix}modal-inner-border-radius));\n\n  // Place margin between footer elements\n  // This solution is far from ideal because of the universal selector usage,\n  // but is needed to fix https://github.com/twbs/bootstrap/issues/24800\n  > * {\n    margin: calc(var(--#{$prefix}modal-footer-gap) * .5); // Todo in v6: replace with gap on parent class\n  }\n}\n\n// Scale up the modal\n@include media-breakpoint-up(sm) {\n  .modal {\n    --#{$prefix}modal-margin: #{$modal-dialog-margin-y-sm-up};\n    --#{$prefix}modal-box-shadow: #{$modal-content-box-shadow-sm-up};\n  }\n\n  // Automatically set modal's width for larger viewports\n  .modal-dialog {\n    max-width: var(--#{$prefix}modal-width);\n    margin-right: auto;\n    margin-left: auto;\n  }\n\n  .modal-sm {\n    --#{$prefix}modal-width: #{$modal-sm};\n  }\n}\n\n@include media-breakpoint-up(lg) {\n  .modal-lg,\n  .modal-xl {\n    --#{$prefix}modal-width: #{$modal-lg};\n  }\n}\n\n@include media-breakpoint-up(xl) {\n  .modal-xl {\n    --#{$prefix}modal-width: #{$modal-xl};\n  }\n}\n\n// scss-docs-start modal-fullscreen-loop\n@each $breakpoint in map-keys($grid-breakpoints) {\n  $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n  $postfix: if($infix != \"\", $infix + \"-down\", \"\");\n\n  @include media-breakpoint-down($breakpoint) {\n    .modal-fullscreen#{$postfix} {\n      width: 100vw;\n      max-width: none;\n      height: 100%;\n      margin: 0;\n\n      .modal-content {\n        height: 100%;\n        border: 0;\n        @include border-radius(0);\n      }\n\n      .modal-header,\n      .modal-footer {\n        @include border-radius(0);\n      }\n\n      .modal-body {\n        overflow-y: auto;\n      }\n    }\n  }\n}\n// scss-docs-end modal-fullscreen-loop\n","// Shared between modals and offcanvases\n@mixin overlay-backdrop($zindex, $backdrop-bg, $backdrop-opacity) {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: $zindex;\n  width: 100vw;\n  height: 100vh;\n  background-color: $backdrop-bg;\n\n  // Fade for backdrop\n  &.fade { opacity: 0; }\n  &.show { opacity: $backdrop-opacity; }\n}\n","// Base class\n.tooltip {\n  // scss-docs-start tooltip-css-vars\n  --#{$prefix}tooltip-zindex: #{$zindex-tooltip};\n  --#{$prefix}tooltip-max-width: #{$tooltip-max-width};\n  --#{$prefix}tooltip-padding-x: #{$tooltip-padding-x};\n  --#{$prefix}tooltip-padding-y: #{$tooltip-padding-y};\n  --#{$prefix}tooltip-margin: #{$tooltip-margin};\n  @include rfs($tooltip-font-size, --#{$prefix}tooltip-font-size);\n  --#{$prefix}tooltip-color: #{$tooltip-color};\n  --#{$prefix}tooltip-bg: #{$tooltip-bg};\n  --#{$prefix}tooltip-border-radius: #{$tooltip-border-radius};\n  --#{$prefix}tooltip-opacity: #{$tooltip-opacity};\n  --#{$prefix}tooltip-arrow-width: #{$tooltip-arrow-width};\n  --#{$prefix}tooltip-arrow-height: #{$tooltip-arrow-height};\n  // scss-docs-end tooltip-css-vars\n\n  z-index: var(--#{$prefix}tooltip-zindex);\n  display: block;\n  margin: var(--#{$prefix}tooltip-margin);\n  @include deprecate(\"`$tooltip-margin`\", \"v5\", \"v5.x\", true);\n  // Our parent element can be arbitrary since tooltips are by default inserted as a sibling of their target element.\n  // So reset our font and text properties to avoid inheriting weird values.\n  @include reset-text();\n  @include font-size(var(--#{$prefix}tooltip-font-size));\n  // Allow breaking very long words so they don't overflow the tooltip's bounds\n  word-wrap: break-word;\n  opacity: 0;\n\n  &.show { opacity: var(--#{$prefix}tooltip-opacity); }\n\n  .tooltip-arrow {\n    display: block;\n    width: var(--#{$prefix}tooltip-arrow-width);\n    height: var(--#{$prefix}tooltip-arrow-height);\n\n    &::before {\n      position: absolute;\n      content: \"\";\n      border-color: transparent;\n      border-style: solid;\n    }\n  }\n}\n\n.bs-tooltip-top .tooltip-arrow {\n  bottom: calc(-1 * var(--#{$prefix}tooltip-arrow-height)); // stylelint-disable-line function-disallowed-list\n\n  &::before {\n    top: -1px;\n    border-width: var(--#{$prefix}tooltip-arrow-height) calc(var(--#{$prefix}tooltip-arrow-width) * .5) 0; // stylelint-disable-line function-disallowed-list\n    border-top-color: var(--#{$prefix}tooltip-bg);\n  }\n}\n\n/* rtl:begin:ignore */\n.bs-tooltip-end .tooltip-arrow {\n  left: calc(-1 * var(--#{$prefix}tooltip-arrow-height)); // stylelint-disable-line function-disallowed-list\n  width: var(--#{$prefix}tooltip-arrow-height);\n  height: var(--#{$prefix}tooltip-arrow-width);\n\n  &::before {\n    right: -1px;\n    border-width: calc(var(--#{$prefix}tooltip-arrow-width) * .5) var(--#{$prefix}tooltip-arrow-height) calc(var(--#{$prefix}tooltip-arrow-width) * .5) 0; // stylelint-disable-line function-disallowed-list\n    border-right-color: var(--#{$prefix}tooltip-bg);\n  }\n}\n\n/* rtl:end:ignore */\n\n.bs-tooltip-bottom .tooltip-arrow {\n  top: calc(-1 * var(--#{$prefix}tooltip-arrow-height)); // stylelint-disable-line function-disallowed-list\n\n  &::before {\n    bottom: -1px;\n    border-width: 0 calc(var(--#{$prefix}tooltip-arrow-width) * .5) var(--#{$prefix}tooltip-arrow-height); // stylelint-disable-line function-disallowed-list\n    border-bottom-color: var(--#{$prefix}tooltip-bg);\n  }\n}\n\n/* rtl:begin:ignore */\n.bs-tooltip-start .tooltip-arrow {\n  right: calc(-1 * var(--#{$prefix}tooltip-arrow-height)); // stylelint-disable-line function-disallowed-list\n  width: var(--#{$prefix}tooltip-arrow-height);\n  height: var(--#{$prefix}tooltip-arrow-width);\n\n  &::before {\n    left: -1px;\n    border-width: calc(var(--#{$prefix}tooltip-arrow-width) * .5) 0 calc(var(--#{$prefix}tooltip-arrow-width) * .5) var(--#{$prefix}tooltip-arrow-height); // stylelint-disable-line function-disallowed-list\n    border-left-color: var(--#{$prefix}tooltip-bg);\n  }\n}\n\n/* rtl:end:ignore */\n\n.bs-tooltip-auto {\n  &[data-popper-placement^=\"top\"] {\n    @extend .bs-tooltip-top;\n  }\n  &[data-popper-placement^=\"right\"] {\n    @extend .bs-tooltip-end;\n  }\n  &[data-popper-placement^=\"bottom\"] {\n    @extend .bs-tooltip-bottom;\n  }\n  &[data-popper-placement^=\"left\"] {\n    @extend .bs-tooltip-start;\n  }\n}\n\n// Wrapper for the tooltip content\n.tooltip-inner {\n  max-width: var(--#{$prefix}tooltip-max-width);\n  padding: var(--#{$prefix}tooltip-padding-y) var(--#{$prefix}tooltip-padding-x);\n  color: var(--#{$prefix}tooltip-color);\n  text-align: center;\n  background-color: var(--#{$prefix}tooltip-bg);\n  @include border-radius(var(--#{$prefix}tooltip-border-radius));\n}\n","@mixin reset-text {\n  font-family: $font-family-base;\n  // We deliberately do NOT reset font-size or overflow-wrap / word-wrap.\n  font-style: normal;\n  font-weight: $font-weight-normal;\n  line-height: $line-height-base;\n  text-align: left; // Fallback for where `start` is not supported\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  white-space: normal;\n  word-spacing: normal;\n  line-break: auto;\n}\n",".popover {\n  // scss-docs-start popover-css-vars\n  --#{$prefix}popover-zindex: #{$zindex-popover};\n  --#{$prefix}popover-max-width: #{$popover-max-width};\n  @include rfs($popover-font-size, --#{$prefix}popover-font-size);\n  --#{$prefix}popover-bg: #{$popover-bg};\n  --#{$prefix}popover-border-width: #{$popover-border-width};\n  --#{$prefix}popover-border-color: #{$popover-border-color};\n  --#{$prefix}popover-border-radius: #{$popover-border-radius};\n  --#{$prefix}popover-inner-border-radius: #{$popover-inner-border-radius};\n  --#{$prefix}popover-box-shadow: #{$popover-box-shadow};\n  --#{$prefix}popover-header-padding-x: #{$popover-header-padding-x};\n  --#{$prefix}popover-header-padding-y: #{$popover-header-padding-y};\n  @include rfs($popover-header-font-size, --#{$prefix}popover-header-font-size);\n  --#{$prefix}popover-header-color: #{$popover-header-color};\n  --#{$prefix}popover-header-bg: #{$popover-header-bg};\n  --#{$prefix}popover-body-padding-x: #{$popover-body-padding-x};\n  --#{$prefix}popover-body-padding-y: #{$popover-body-padding-y};\n  --#{$prefix}popover-body-color: #{$popover-body-color};\n  --#{$prefix}popover-arrow-width: #{$popover-arrow-width};\n  --#{$prefix}popover-arrow-height: #{$popover-arrow-height};\n  --#{$prefix}popover-arrow-border: var(--#{$prefix}popover-border-color);\n  // scss-docs-end popover-css-vars\n\n  z-index: var(--#{$prefix}popover-zindex);\n  display: block;\n  max-width: var(--#{$prefix}popover-max-width);\n  // Our parent element can be arbitrary since tooltips are by default inserted as a sibling of their target element.\n  // So reset our font and text properties to avoid inheriting weird values.\n  @include reset-text();\n  @include font-size(var(--#{$prefix}popover-font-size));\n  // Allow breaking very long words so they don't overflow the popover's bounds\n  word-wrap: break-word;\n  background-color: var(--#{$prefix}popover-bg);\n  background-clip: padding-box;\n  border: var(--#{$prefix}popover-border-width) solid var(--#{$prefix}popover-border-color);\n  @include border-radius(var(--#{$prefix}popover-border-radius));\n  @include box-shadow(var(--#{$prefix}popover-box-shadow));\n\n  .popover-arrow {\n    display: block;\n    width: var(--#{$prefix}popover-arrow-width);\n    height: var(--#{$prefix}popover-arrow-height);\n\n    &::before,\n    &::after {\n      position: absolute;\n      display: block;\n      content: \"\";\n      border-color: transparent;\n      border-style: solid;\n      border-width: 0;\n    }\n  }\n}\n\n.bs-popover-top {\n  > .popover-arrow {\n    bottom: calc(-1 * (var(--#{$prefix}popover-arrow-height)) - var(--#{$prefix}popover-border-width)); // stylelint-disable-line function-disallowed-list\n\n    &::before,\n    &::after {\n      border-width: var(--#{$prefix}popover-arrow-height) calc(var(--#{$prefix}popover-arrow-width) * .5) 0; // stylelint-disable-line function-disallowed-list\n    }\n\n    &::before {\n      bottom: 0;\n      border-top-color: var(--#{$prefix}popover-arrow-border);\n    }\n\n    &::after {\n      bottom: var(--#{$prefix}popover-border-width);\n      border-top-color: var(--#{$prefix}popover-bg);\n    }\n  }\n}\n\n/* rtl:begin:ignore */\n.bs-popover-end {\n  > .popover-arrow {\n    left: calc(-1 * (var(--#{$prefix}popover-arrow-height)) - var(--#{$prefix}popover-border-width)); // stylelint-disable-line function-disallowed-list\n    width: var(--#{$prefix}popover-arrow-height);\n    height: var(--#{$prefix}popover-arrow-width);\n\n    &::before,\n    &::after {\n      border-width: calc(var(--#{$prefix}popover-arrow-width) * .5) var(--#{$prefix}popover-arrow-height) calc(var(--#{$prefix}popover-arrow-width) * .5) 0; // stylelint-disable-line function-disallowed-list\n    }\n\n    &::before {\n      left: 0;\n      border-right-color: var(--#{$prefix}popover-arrow-border);\n    }\n\n    &::after {\n      left: var(--#{$prefix}popover-border-width);\n      border-right-color: var(--#{$prefix}popover-bg);\n    }\n  }\n}\n\n/* rtl:end:ignore */\n\n.bs-popover-bottom {\n  > .popover-arrow {\n    top: calc(-1 * (var(--#{$prefix}popover-arrow-height)) - var(--#{$prefix}popover-border-width)); // stylelint-disable-line function-disallowed-list\n\n    &::before,\n    &::after {\n      border-width: 0 calc(var(--#{$prefix}popover-arrow-width) * .5) var(--#{$prefix}popover-arrow-height); // stylelint-disable-line function-disallowed-list\n    }\n\n    &::before {\n      top: 0;\n      border-bottom-color: var(--#{$prefix}popover-arrow-border);\n    }\n\n    &::after {\n      top: var(--#{$prefix}popover-border-width);\n      border-bottom-color: var(--#{$prefix}popover-bg);\n    }\n  }\n\n  // This will remove the popover-header's border just below the arrow\n  .popover-header::before {\n    position: absolute;\n    top: 0;\n    left: 50%;\n    display: block;\n    width: var(--#{$prefix}popover-arrow-width);\n    margin-left: calc(-.5 * var(--#{$prefix}popover-arrow-width)); // stylelint-disable-line function-disallowed-list\n    content: \"\";\n    border-bottom: var(--#{$prefix}popover-border-width) solid var(--#{$prefix}popover-header-bg);\n  }\n}\n\n/* rtl:begin:ignore */\n.bs-popover-start {\n  > .popover-arrow {\n    right: calc(-1 * (var(--#{$prefix}popover-arrow-height)) - var(--#{$prefix}popover-border-width)); // stylelint-disable-line function-disallowed-list\n    width: var(--#{$prefix}popover-arrow-height);\n    height: var(--#{$prefix}popover-arrow-width);\n\n    &::before,\n    &::after {\n      border-width: calc(var(--#{$prefix}popover-arrow-width) * .5) 0 calc(var(--#{$prefix}popover-arrow-width) * .5) var(--#{$prefix}popover-arrow-height); // stylelint-disable-line function-disallowed-list\n    }\n\n    &::before {\n      right: 0;\n      border-left-color: var(--#{$prefix}popover-arrow-border);\n    }\n\n    &::after {\n      right: var(--#{$prefix}popover-border-width);\n      border-left-color: var(--#{$prefix}popover-bg);\n    }\n  }\n}\n\n/* rtl:end:ignore */\n\n.bs-popover-auto {\n  &[data-popper-placement^=\"top\"] {\n    @extend .bs-popover-top;\n  }\n  &[data-popper-placement^=\"right\"] {\n    @extend .bs-popover-end;\n  }\n  &[data-popper-placement^=\"bottom\"] {\n    @extend .bs-popover-bottom;\n  }\n  &[data-popper-placement^=\"left\"] {\n    @extend .bs-popover-start;\n  }\n}\n\n// Offset the popover to account for the popover arrow\n.popover-header {\n  padding: var(--#{$prefix}popover-header-padding-y) var(--#{$prefix}popover-header-padding-x);\n  margin-bottom: 0; // Reset the default from Reboot\n  @include font-size(var(--#{$prefix}popover-header-font-size));\n  color: var(--#{$prefix}popover-header-color);\n  background-color: var(--#{$prefix}popover-header-bg);\n  border-bottom: var(--#{$prefix}popover-border-width) solid var(--#{$prefix}popover-border-color);\n  @include border-top-radius(var(--#{$prefix}popover-inner-border-radius));\n\n  &:empty {\n    display: none;\n  }\n}\n\n.popover-body {\n  padding: var(--#{$prefix}popover-body-padding-y) var(--#{$prefix}popover-body-padding-x);\n  color: var(--#{$prefix}popover-body-color);\n}\n","// Notes on the classes:\n//\n// 1. .carousel.pointer-event should ideally be pan-y (to allow for users to scroll vertically)\n//    even when their scroll action started on a carousel, but for compatibility (with Firefox)\n//    we're preventing all actions instead\n// 2. The .carousel-item-start and .carousel-item-end is used to indicate where\n//    the active slide is heading.\n// 3. .active.carousel-item is the current slide.\n// 4. .active.carousel-item-start and .active.carousel-item-end is the current\n//    slide in its in-transition state. Only one of these occurs at a time.\n// 5. .carousel-item-next.carousel-item-start and .carousel-item-prev.carousel-item-end\n//    is the upcoming slide in transition.\n\n.carousel {\n  position: relative;\n}\n\n.carousel.pointer-event {\n  touch-action: pan-y;\n}\n\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n  @include clearfix();\n}\n\n.carousel-item {\n  position: relative;\n  display: none;\n  float: left;\n  width: 100%;\n  margin-right: -100%;\n  backface-visibility: hidden;\n  @include transition($carousel-transition);\n}\n\n.carousel-item.active,\n.carousel-item-next,\n.carousel-item-prev {\n  display: block;\n}\n\n.carousel-item-next:not(.carousel-item-start),\n.active.carousel-item-end {\n  transform: translateX(100%);\n}\n\n.carousel-item-prev:not(.carousel-item-end),\n.active.carousel-item-start {\n  transform: translateX(-100%);\n}\n\n\n//\n// Alternate transitions\n//\n\n.carousel-fade {\n  .carousel-item {\n    opacity: 0;\n    transition-property: opacity;\n    transform: none;\n  }\n\n  .carousel-item.active,\n  .carousel-item-next.carousel-item-start,\n  .carousel-item-prev.carousel-item-end {\n    z-index: 1;\n    opacity: 1;\n  }\n\n  .active.carousel-item-start,\n  .active.carousel-item-end {\n    z-index: 0;\n    opacity: 0;\n    @include transition(opacity 0s $carousel-transition-duration);\n  }\n}\n\n\n//\n// Left/right controls for nav\n//\n\n.carousel-control-prev,\n.carousel-control-next {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  z-index: 1;\n  // Use flex for alignment (1-3)\n  display: flex; // 1. allow flex styles\n  align-items: center; // 2. vertically center contents\n  justify-content: center; // 3. horizontally center contents\n  width: $carousel-control-width;\n  padding: 0;\n  color: $carousel-control-color;\n  text-align: center;\n  background: none;\n  border: 0;\n  opacity: $carousel-control-opacity;\n  @include transition($carousel-control-transition);\n\n  // Hover/focus state\n  &:hover,\n  &:focus {\n    color: $carousel-control-color;\n    text-decoration: none;\n    outline: 0;\n    opacity: $carousel-control-hover-opacity;\n  }\n}\n.carousel-control-prev {\n  left: 0;\n  background-image: if($enable-gradients, linear-gradient(90deg, rgba($black, .25), rgba($black, .001)), null);\n}\n.carousel-control-next {\n  right: 0;\n  background-image: if($enable-gradients, linear-gradient(270deg, rgba($black, .25), rgba($black, .001)), null);\n}\n\n// Icons for within\n.carousel-control-prev-icon,\n.carousel-control-next-icon {\n  display: inline-block;\n  width: $carousel-control-icon-width;\n  height: $carousel-control-icon-width;\n  background-repeat: no-repeat;\n  background-position: 50%;\n  background-size: 100% 100%;\n}\n\n/* rtl:options: {\n  \"autoRename\": true,\n  \"stringMap\":[ {\n    \"name\"    : \"prev-next\",\n    \"search\"  : \"prev\",\n    \"replace\" : \"next\"\n  } ]\n} */\n.carousel-control-prev-icon {\n  background-image: escape-svg($carousel-control-prev-icon-bg);\n}\n.carousel-control-next-icon {\n  background-image: escape-svg($carousel-control-next-icon-bg);\n}\n\n// Optional indicator pips/controls\n//\n// Add a container (such as a list) with the following class and add an item (ideally a focusable control,\n// like a button) with data-bs-target for each slide your carousel holds.\n\n.carousel-indicators {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 2;\n  display: flex;\n  justify-content: center;\n  padding: 0;\n  // Use the .carousel-control's width as margin so we don't overlay those\n  margin-right: $carousel-control-width;\n  margin-bottom: 1rem;\n  margin-left: $carousel-control-width;\n\n  [data-bs-target] {\n    box-sizing: content-box;\n    flex: 0 1 auto;\n    width: $carousel-indicator-width;\n    height: $carousel-indicator-height;\n    padding: 0;\n    margin-right: $carousel-indicator-spacer;\n    margin-left: $carousel-indicator-spacer;\n    text-indent: -999px;\n    cursor: pointer;\n    background-color: $carousel-indicator-active-bg;\n    background-clip: padding-box;\n    border: 0;\n    // Use transparent borders to increase the hit area by 10px on top and bottom.\n    border-top: $carousel-indicator-hit-area-height solid transparent;\n    border-bottom: $carousel-indicator-hit-area-height solid transparent;\n    opacity: $carousel-indicator-opacity;\n    @include transition($carousel-indicator-transition);\n  }\n\n  .active {\n    opacity: $carousel-indicator-active-opacity;\n  }\n}\n\n\n// Optional captions\n//\n//\n\n.carousel-caption {\n  position: absolute;\n  right: (100% - $carousel-caption-width) * .5;\n  bottom: $carousel-caption-spacer;\n  left: (100% - $carousel-caption-width) * .5;\n  padding-top: $carousel-caption-padding-y;\n  padding-bottom: $carousel-caption-padding-y;\n  color: $carousel-caption-color;\n  text-align: center;\n}\n\n// Dark mode carousel\n\n@mixin carousel-dark() {\n  .carousel-control-prev-icon,\n  .carousel-control-next-icon {\n    filter: $carousel-dark-control-icon-filter;\n  }\n\n  .carousel-indicators [data-bs-target] {\n    background-color: $carousel-dark-indicator-active-bg;\n  }\n\n  .carousel-caption {\n    color: $carousel-dark-caption-color;\n  }\n}\n\n.carousel-dark {\n  @include carousel-dark();\n}\n\n@if $enable-dark-mode {\n  @include color-mode(dark) {\n    @if $color-mode-type == \"media-query\" {\n      .carousel {\n        @include carousel-dark();\n      }\n    } @else {\n      .carousel,\n      &.carousel {\n        @include carousel-dark();\n      }\n    }\n  }\n}\n","// scss-docs-start clearfix\n@mixin clearfix() {\n  &::after {\n    display: block;\n    clear: both;\n    content: \"\";\n  }\n}\n// scss-docs-end clearfix\n","//\n// Rotating border\n//\n\n.spinner-grow,\n.spinner-border {\n  display: inline-block;\n  width: var(--#{$prefix}spinner-width);\n  height: var(--#{$prefix}spinner-height);\n  vertical-align: var(--#{$prefix}spinner-vertical-align);\n  // stylelint-disable-next-line property-disallowed-list\n  border-radius: 50%;\n  animation: var(--#{$prefix}spinner-animation-speed) linear infinite var(--#{$prefix}spinner-animation-name);\n}\n\n// scss-docs-start spinner-border-keyframes\n@keyframes spinner-border {\n  to { transform: rotate(360deg) #{\"/* rtl:ignore */\"}; }\n}\n// scss-docs-end spinner-border-keyframes\n\n.spinner-border {\n  // scss-docs-start spinner-border-css-vars\n  --#{$prefix}spinner-width: #{$spinner-width};\n  --#{$prefix}spinner-height: #{$spinner-height};\n  --#{$prefix}spinner-vertical-align: #{$spinner-vertical-align};\n  --#{$prefix}spinner-border-width: #{$spinner-border-width};\n  --#{$prefix}spinner-animation-speed: #{$spinner-animation-speed};\n  --#{$prefix}spinner-animation-name: spinner-border;\n  // scss-docs-end spinner-border-css-vars\n\n  border: var(--#{$prefix}spinner-border-width) solid currentcolor;\n  border-right-color: transparent;\n}\n\n.spinner-border-sm {\n  // scss-docs-start spinner-border-sm-css-vars\n  --#{$prefix}spinner-width: #{$spinner-width-sm};\n  --#{$prefix}spinner-height: #{$spinner-height-sm};\n  --#{$prefix}spinner-border-width: #{$spinner-border-width-sm};\n  // scss-docs-end spinner-border-sm-css-vars\n}\n\n//\n// Growing circle\n//\n\n// scss-docs-start spinner-grow-keyframes\n@keyframes spinner-grow {\n  0% {\n    transform: scale(0);\n  }\n  50% {\n    opacity: 1;\n    transform: none;\n  }\n}\n// scss-docs-end spinner-grow-keyframes\n\n.spinner-grow {\n  // scss-docs-start spinner-grow-css-vars\n  --#{$prefix}spinner-width: #{$spinner-width};\n  --#{$prefix}spinner-height: #{$spinner-height};\n  --#{$prefix}spinner-vertical-align: #{$spinner-vertical-align};\n  --#{$prefix}spinner-animation-speed: #{$spinner-animation-speed};\n  --#{$prefix}spinner-animation-name: spinner-grow;\n  // scss-docs-end spinner-grow-css-vars\n\n  background-color: currentcolor;\n  opacity: 0;\n}\n\n.spinner-grow-sm {\n  --#{$prefix}spinner-width: #{$spinner-width-sm};\n  --#{$prefix}spinner-height: #{$spinner-height-sm};\n}\n\n@if $enable-reduced-motion {\n  @media (prefers-reduced-motion: reduce) {\n    .spinner-border,\n    .spinner-grow {\n      --#{$prefix}spinner-animation-speed: #{$spinner-animation-speed * 2};\n    }\n  }\n}\n","// stylelint-disable function-disallowed-list\n\n%offcanvas-css-vars {\n  // scss-docs-start offcanvas-css-vars\n  --#{$prefix}offcanvas-zindex: #{$zindex-offcanvas};\n  --#{$prefix}offcanvas-width: #{$offcanvas-horizontal-width};\n  --#{$prefix}offcanvas-height: #{$offcanvas-vertical-height};\n  --#{$prefix}offcanvas-padding-x: #{$offcanvas-padding-x};\n  --#{$prefix}offcanvas-padding-y: #{$offcanvas-padding-y};\n  --#{$prefix}offcanvas-color: #{$offcanvas-color};\n  --#{$prefix}offcanvas-bg: #{$offcanvas-bg-color};\n  --#{$prefix}offcanvas-border-width: #{$offcanvas-border-width};\n  --#{$prefix}offcanvas-border-color: #{$offcanvas-border-color};\n  --#{$prefix}offcanvas-box-shadow: #{$offcanvas-box-shadow};\n  --#{$prefix}offcanvas-transition: #{transform $offcanvas-transition-duration ease-in-out};\n  --#{$prefix}offcanvas-title-line-height: #{$offcanvas-title-line-height};\n  // scss-docs-end offcanvas-css-vars\n}\n\n@each $breakpoint in map-keys($grid-breakpoints) {\n  $next: breakpoint-next($breakpoint, $grid-breakpoints);\n  $infix: breakpoint-infix($next, $grid-breakpoints);\n\n  .offcanvas#{$infix} {\n    @extend %offcanvas-css-vars;\n  }\n}\n\n@each $breakpoint in map-keys($grid-breakpoints) {\n  $next: breakpoint-next($breakpoint, $grid-breakpoints);\n  $infix: breakpoint-infix($next, $grid-breakpoints);\n\n  .offcanvas#{$infix} {\n    @include media-breakpoint-down($next) {\n      position: fixed;\n      bottom: 0;\n      z-index: var(--#{$prefix}offcanvas-zindex);\n      display: flex;\n      flex-direction: column;\n      max-width: 100%;\n      color: var(--#{$prefix}offcanvas-color);\n      visibility: hidden;\n      background-color: var(--#{$prefix}offcanvas-bg);\n      background-clip: padding-box;\n      outline: 0;\n      @include box-shadow(var(--#{$prefix}offcanvas-box-shadow));\n      @include transition(var(--#{$prefix}offcanvas-transition));\n\n      &.offcanvas-start {\n        top: 0;\n        left: 0;\n        width: var(--#{$prefix}offcanvas-width);\n        border-right: var(--#{$prefix}offcanvas-border-width) solid var(--#{$prefix}offcanvas-border-color);\n        transform: translateX(-100%);\n      }\n\n      &.offcanvas-end {\n        top: 0;\n        right: 0;\n        width: var(--#{$prefix}offcanvas-width);\n        border-left: var(--#{$prefix}offcanvas-border-width) solid var(--#{$prefix}offcanvas-border-color);\n        transform: translateX(100%);\n      }\n\n      &.offcanvas-top {\n        top: 0;\n        right: 0;\n        left: 0;\n        height: var(--#{$prefix}offcanvas-height);\n        max-height: 100%;\n        border-bottom: var(--#{$prefix}offcanvas-border-width) solid var(--#{$prefix}offcanvas-border-color);\n        transform: translateY(-100%);\n      }\n\n      &.offcanvas-bottom {\n        right: 0;\n        left: 0;\n        height: var(--#{$prefix}offcanvas-height);\n        max-height: 100%;\n        border-top: var(--#{$prefix}offcanvas-border-width) solid var(--#{$prefix}offcanvas-border-color);\n        transform: translateY(100%);\n      }\n\n      &.showing,\n      &.show:not(.hiding) {\n        transform: none;\n      }\n\n      &.showing,\n      &.hiding,\n      &.show {\n        visibility: visible;\n      }\n    }\n\n    @if not ($infix == \"\") {\n      @include media-breakpoint-up($next) {\n        --#{$prefix}offcanvas-height: auto;\n        --#{$prefix}offcanvas-border-width: 0;\n        background-color: transparent !important; // stylelint-disable-line declaration-no-important\n\n        .offcanvas-header {\n          display: none;\n        }\n\n        .offcanvas-body {\n          display: flex;\n          flex-grow: 0;\n          padding: 0;\n          overflow-y: visible;\n          // Reset `background-color` in case `.bg-*` classes are used in offcanvas\n          background-color: transparent !important; // stylelint-disable-line declaration-no-important\n        }\n      }\n    }\n  }\n}\n\n.offcanvas-backdrop {\n  @include overlay-backdrop($zindex-offcanvas-backdrop, $offcanvas-backdrop-bg, $offcanvas-backdrop-opacity);\n}\n\n.offcanvas-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: var(--#{$prefix}offcanvas-padding-y) var(--#{$prefix}offcanvas-padding-x);\n\n  .btn-close {\n    padding: calc(var(--#{$prefix}offcanvas-padding-y) * .5) calc(var(--#{$prefix}offcanvas-padding-x) * .5);\n    margin-top: calc(-.5 * var(--#{$prefix}offcanvas-padding-y));\n    margin-right: calc(-.5 * var(--#{$prefix}offcanvas-padding-x));\n    margin-bottom: calc(-.5 * var(--#{$prefix}offcanvas-padding-y));\n  }\n}\n\n.offcanvas-title {\n  margin-bottom: 0;\n  line-height: var(--#{$prefix}offcanvas-title-line-height);\n}\n\n.offcanvas-body {\n  flex-grow: 1;\n  padding: var(--#{$prefix}offcanvas-padding-y) var(--#{$prefix}offcanvas-padding-x);\n  overflow-y: auto;\n}\n",".placeholder {\n  display: inline-block;\n  min-height: 1em;\n  vertical-align: middle;\n  cursor: wait;\n  background-color: currentcolor;\n  opacity: $placeholder-opacity-max;\n\n  &.btn::before {\n    display: inline-block;\n    content: \"\";\n  }\n}\n\n// Sizing\n.placeholder-xs {\n  min-height: .6em;\n}\n\n.placeholder-sm {\n  min-height: .8em;\n}\n\n.placeholder-lg {\n  min-height: 1.2em;\n}\n\n// Animation\n.placeholder-glow {\n  .placeholder {\n    animation: placeholder-glow 2s ease-in-out infinite;\n  }\n}\n\n@keyframes placeholder-glow {\n  50% {\n    opacity: $placeholder-opacity-min;\n  }\n}\n\n.placeholder-wave {\n  mask-image: linear-gradient(130deg, $black 55%, rgba(0, 0, 0, (1 - $placeholder-opacity-min)) 75%, $black 95%);\n  mask-size: 200% 100%;\n  animation: placeholder-wave 2s linear infinite;\n}\n\n@keyframes placeholder-wave {\n  100% {\n    mask-position: -200% 0%;\n  }\n}\n","// All-caps `RGBA()` function used because of this Sass bug: https://github.com/sass/node-sass/issues/2251\n@each $color, $value in $theme-colors {\n  .text-bg-#{$color} {\n    color: color-contrast($value) if($enable-important-utilities, !important, null);\n    background-color: RGBA(var(--#{$prefix}#{$color}-rgb), var(--#{$prefix}bg-opacity, 1)) if($enable-important-utilities, !important, null);\n  }\n}\n","// All-caps `RGBA()` function used because of this Sass bug: https://github.com/sass/node-sass/issues/2251\n@each $color, $value in $theme-colors {\n  .link-#{$color} {\n    color: RGBA(var(--#{$prefix}#{$color}-rgb), var(--#{$prefix}link-opacity, 1)) if($enable-important-utilities, !important, null);\n    text-decoration-color: RGBA(var(--#{$prefix}#{$color}-rgb), var(--#{$prefix}link-underline-opacity, 1)) if($enable-important-utilities, !important, null);\n\n    @if $link-shade-percentage != 0 {\n      &:hover,\n      &:focus {\n        $hover-color: if(color-contrast($value) == $color-contrast-light, shade-color($value, $link-shade-percentage), tint-color($value, $link-shade-percentage));\n        color: RGBA(#{to-rgb($hover-color)}, var(--#{$prefix}link-opacity, 1)) if($enable-important-utilities, !important, null);\n        text-decoration-color: RGBA(to-rgb($hover-color), var(--#{$prefix}link-underline-opacity, 1)) if($enable-important-utilities, !important, null);\n      }\n    }\n  }\n}\n\n// One-off special link helper as a bridge until v6\n.link-body-emphasis {\n  color: RGBA(var(--#{$prefix}emphasis-color-rgb), var(--#{$prefix}link-opacity, 1)) if($enable-important-utilities, !important, null);\n  text-decoration-color: RGBA(var(--#{$prefix}emphasis-color-rgb), var(--#{$prefix}link-underline-opacity, 1)) if($enable-important-utilities, !important, null);\n\n  @if $link-shade-percentage != 0 {\n    &:hover,\n    &:focus {\n      color: RGBA(var(--#{$prefix}emphasis-color-rgb), var(--#{$prefix}link-opacity, .75)) if($enable-important-utilities, !important, null);\n      text-decoration-color: RGBA(var(--#{$prefix}emphasis-color-rgb), var(--#{$prefix}link-underline-opacity, .75)) if($enable-important-utilities, !important, null);\n    }\n  }\n}\n",".focus-ring:focus {\n  outline: 0;\n  // By default, there is no `--bs-focus-ring-x`, `--bs-focus-ring-y`, or `--bs-focus-ring-blur`, but we provide CSS variables with fallbacks to initial `0` values\n  box-shadow: var(--#{$prefix}focus-ring-x, 0) var(--#{$prefix}focus-ring-y, 0) var(--#{$prefix}focus-ring-blur, 0) var(--#{$prefix}focus-ring-width) var(--#{$prefix}focus-ring-color);\n}\n",".icon-link {\n  display: inline-flex;\n  gap: $icon-link-gap;\n  align-items: center;\n  text-decoration-color: rgba(var(--#{$prefix}link-color-rgb), var(--#{$prefix}link-opacity, .5));\n  text-underline-offset: $icon-link-underline-offset;\n  backface-visibility: hidden;\n\n  > .bi {\n    flex-shrink: 0;\n    width: $icon-link-icon-size;\n    height: $icon-link-icon-size;\n    fill: currentcolor;\n    @include transition($icon-link-icon-transition);\n  }\n}\n\n.icon-link-hover {\n  &:hover,\n  &:focus-visible {\n    > .bi {\n      transform: var(--#{$prefix}icon-link-transform, $icon-link-icon-transform);\n    }\n  }\n}\n","// Credit: Nicolas Gallagher and SUIT CSS.\n\n.ratio {\n  position: relative;\n  width: 100%;\n\n  &::before {\n    display: block;\n    padding-top: var(--#{$prefix}aspect-ratio);\n    content: \"\";\n  }\n\n  > * {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n  }\n}\n\n@each $key, $ratio in $aspect-ratios {\n  .ratio-#{$key} {\n    --#{$prefix}aspect-ratio: #{$ratio};\n  }\n}\n","// Shorthand\n\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: $zindex-fixed;\n}\n\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: $zindex-fixed;\n}\n\n// Responsive sticky top and bottom\n@each $breakpoint in map-keys($grid-breakpoints) {\n  @include media-breakpoint-up($breakpoint) {\n    $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n    .sticky#{$infix}-top {\n      position: sticky;\n      top: 0;\n      z-index: $zindex-sticky;\n    }\n\n    .sticky#{$infix}-bottom {\n      position: sticky;\n      bottom: 0;\n      z-index: $zindex-sticky;\n    }\n  }\n}\n","// scss-docs-start stacks\n.hstack {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  align-self: stretch;\n}\n\n.vstack {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  align-self: stretch;\n}\n// scss-docs-end stacks\n","//\n// Visually hidden\n//\n\n.visually-hidden,\n.visually-hidden-focusable:not(:focus):not(:focus-within) {\n  @include visually-hidden();\n}\n","// stylelint-disable declaration-no-important\n\n// Hide content visually while keeping it accessible to assistive technologies\n//\n// See: https://www.a11yproject.com/posts/2013-01-11-how-to-hide-content/\n// See: https://kittygiraudel.com/2016/10/13/css-hide-and-seek/\n\n@mixin visually-hidden() {\n  width: 1px !important;\n  height: 1px !important;\n  padding: 0 !important;\n  margin: -1px !important; // Fix for https://github.com/twbs/bootstrap/issues/25686\n  overflow: hidden !important;\n  clip: rect(0, 0, 0, 0) !important;\n  white-space: nowrap !important;\n  border: 0 !important;\n\n  // Fix for positioned table caption that could become anonymous cells\n  &:not(caption) {\n    position: absolute !important;\n  }\n}\n\n// Use to only display content when it's focused, or one of its child elements is focused\n// (i.e. when focus is within the element/container that the class was applied to)\n//\n// Useful for \"Skip to main content\" links; see https://www.w3.org/TR/2013/NOTE-WCAG20-TECHS-20130905/G1\n\n@mixin visually-hidden-focusable() {\n  &:not(:focus):not(:focus-within) {\n    @include visually-hidden();\n  }\n}\n","//\n// Stretched link\n//\n\n.stretched-link {\n  &::#{$stretched-link-pseudo-element} {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: $stretched-link-z-index;\n    content: \"\";\n  }\n}\n","//\n// Text truncation\n//\n\n.text-truncate {\n  @include text-truncate();\n}\n","// Text truncate\n// Requires inline-block or block for proper styling\n\n@mixin text-truncate() {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n",".vr {\n  display: inline-block;\n  align-self: stretch;\n  width: $vr-border-width;\n  min-height: 1em;\n  background-color: currentcolor;\n  opacity: $hr-opacity;\n}\n","// Utility generator\n// Used to generate utilities & print utilities\n@mixin generate-utility($utility, $infix: \"\", $is-rfs-media-query: false) {\n  $values: map-get($utility, values);\n\n  // If the values are a list or string, convert it into a map\n  @if type-of($values) == \"string\" or type-of(nth($values, 1)) != \"list\" {\n    $values: zip($values, $values);\n  }\n\n  @each $key, $value in $values {\n    $properties: map-get($utility, property);\n\n    // Multiple properties are possible, for example with vertical or horizontal margins or paddings\n    @if type-of($properties) == \"string\" {\n      $properties: append((), $properties);\n    }\n\n    // Use custom class if present\n    $property-class: if(map-has-key($utility, class), map-get($utility, class), nth($properties, 1));\n    $property-class: if($property-class == null, \"\", $property-class);\n\n    // Use custom CSS variable name if present, otherwise default to `class`\n    $css-variable-name: if(map-has-key($utility, css-variable-name), map-get($utility, css-variable-name), map-get($utility, class));\n\n    // State params to generate pseudo-classes\n    $state: if(map-has-key($utility, state), map-get($utility, state), ());\n\n    $infix: if($property-class == \"\" and str-slice($infix, 1, 1) == \"-\", str-slice($infix, 2), $infix);\n\n    // Don't prefix if value key is null (e.g. with shadow class)\n    $property-class-modifier: if($key, if($property-class == \"\" and $infix == \"\", \"\", \"-\") + $key, \"\");\n\n    @if map-get($utility, rfs) {\n      // Inside the media query\n      @if $is-rfs-media-query {\n        $val: rfs-value($value);\n\n        // Do not render anything if fluid and non fluid values are the same\n        $value: if($val == rfs-fluid-value($value), null, $val);\n      }\n      @else {\n        $value: rfs-fluid-value($value);\n      }\n    }\n\n    $is-css-var: map-get($utility, css-var);\n    $is-local-vars: map-get($utility, local-vars);\n    $is-rtl: map-get($utility, rtl);\n\n    @if $value != null {\n      @if $is-rtl == false {\n        /* rtl:begin:remove */\n      }\n\n      @if $is-css-var {\n        .#{$property-class + $infix + $property-class-modifier} {\n          --#{$prefix}#{$css-variable-name}: #{$value};\n        }\n\n        @each $pseudo in $state {\n          .#{$property-class + $infix + $property-class-modifier}-#{$pseudo}:#{$pseudo} {\n            --#{$prefix}#{$css-variable-name}: #{$value};\n          }\n        }\n      } @else {\n        .#{$property-class + $infix + $property-class-modifier} {\n          @each $property in $properties {\n            @if $is-local-vars {\n              @each $local-var, $variable in $is-local-vars {\n                --#{$prefix}#{$local-var}: #{$variable};\n              }\n            }\n            #{$property}: $value if($enable-important-utilities, !important, null);\n          }\n        }\n\n        @each $pseudo in $state {\n          .#{$property-class + $infix + $property-class-modifier}-#{$pseudo}:#{$pseudo} {\n            @each $property in $properties {\n              @if $is-local-vars {\n                @each $local-var, $variable in $is-local-vars {\n                  --#{$prefix}#{$local-var}: #{$variable};\n                }\n              }\n              #{$property}: $value if($enable-important-utilities, !important, null);\n            }\n          }\n        }\n      }\n\n      @if $is-rtl == false {\n        /* rtl:end:remove */\n      }\n    }\n  }\n}\n","// Loop over each breakpoint\n@each $breakpoint in map-keys($grid-breakpoints) {\n\n  // Generate media query if needed\n  @include media-breakpoint-up($breakpoint) {\n    $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n    // Loop over each utility property\n    @each $key, $utility in $utilities {\n      // The utility can be disabled with `false`, thus check if the utility is a map first\n      // Only proceed if responsive media queries are enabled or if it's the base media query\n      @if type-of($utility) == \"map\" and (map-get($utility, responsive) or $infix == \"\") {\n        @include generate-utility($utility, $infix);\n      }\n    }\n  }\n}\n\n// RFS rescaling\n@media (min-width: $rfs-mq-value) {\n  @each $breakpoint in map-keys($grid-breakpoints) {\n    $infix: breakpoint-infix($breakpoint, $grid-breakpoints);\n\n    @if (map-get($grid-breakpoints, $breakpoint) < $rfs-breakpoint) {\n      // Loop over each utility property\n      @each $key, $utility in $utilities {\n        // The utility can be disabled with `false`, thus check if the utility is a map first\n        // Only proceed if responsive media queries are enabled or if it's the base media query\n        @if type-of($utility) == \"map\" and map-get($utility, rfs) and (map-get($utility, responsive) or $infix == \"\") {\n          @include generate-utility($utility, $infix, true);\n        }\n      }\n    }\n  }\n}\n\n\n// Print utilities\n@media print {\n  @each $key, $utility in $utilities {\n    // The utility can be disabled with `false`, thus check if the utility is a map first\n    // Then check if the utility needs print styles\n    @if type-of($utility) == \"map\" and map-get($utility, print) == true {\n      @include generate-utility($utility, \"-print\");\n    }\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 667:
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ 537:
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ 448:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 Modernizr 3.0.0pre (Custom Build) | MIT
*/
var aa=__webpack_require__(294),ca=__webpack_require__(840);function p(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return"Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var da=new Set,ea={};function fa(a,b){ha(a,b);ha(a+"Capture",b)}
function ha(a,b){ea[a]=b;for(a=0;a<b.length;a++)da.add(b[a])}
var ia=!("undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement),ja=Object.prototype.hasOwnProperty,ka=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,la=
{},ma={};function oa(a){if(ja.call(ma,a))return!0;if(ja.call(la,a))return!1;if(ka.test(a))return ma[a]=!0;la[a]=!0;return!1}function pa(a,b,c,d){if(null!==c&&0===c.type)return!1;switch(typeof b){case "function":case "symbol":return!0;case "boolean":if(d)return!1;if(null!==c)return!c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return"data-"!==a&&"aria-"!==a;default:return!1}}
function qa(a,b,c,d){if(null===b||"undefined"===typeof b||pa(a,b,c,d))return!0;if(d)return!1;if(null!==c)switch(c.type){case 3:return!b;case 4:return!1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return!1}function v(a,b,c,d,e,f,g){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;this.removeEmptyString=g}var z={};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){z[a]=new v(a,0,!1,a,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];z[b]=new v(b,1,!1,a[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(a){z[a]=new v(a,2,!1,a.toLowerCase(),null,!1,!1)});
["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){z[a]=new v(a,2,!1,a,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){z[a]=new v(a,3,!1,a.toLowerCase(),null,!1,!1)});
["checked","multiple","muted","selected"].forEach(function(a){z[a]=new v(a,3,!0,a,null,!1,!1)});["capture","download"].forEach(function(a){z[a]=new v(a,4,!1,a,null,!1,!1)});["cols","rows","size","span"].forEach(function(a){z[a]=new v(a,6,!1,a,null,!1,!1)});["rowSpan","start"].forEach(function(a){z[a]=new v(a,5,!1,a.toLowerCase(),null,!1,!1)});var ra=/[\-:]([a-z])/g;function sa(a){return a[1].toUpperCase()}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(ra,
sa);z[b]=new v(b,1,!1,a,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!1,!1)});
z.xlinkHref=new v("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!0,!0)});
function ta(a,b,c,d){var e=z.hasOwnProperty(b)?z[b]:null;if(null!==e?0!==e.type:d||!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1])qa(b,c,e,d)&&(c=null),d||null===e?oa(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c)))}
var ua=aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,va=Symbol.for("react.element"),wa=Symbol.for("react.portal"),ya=Symbol.for("react.fragment"),za=Symbol.for("react.strict_mode"),Aa=Symbol.for("react.profiler"),Ba=Symbol.for("react.provider"),Ca=Symbol.for("react.context"),Da=Symbol.for("react.forward_ref"),Ea=Symbol.for("react.suspense"),Fa=Symbol.for("react.suspense_list"),Ga=Symbol.for("react.memo"),Ha=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");
var Ia=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var Ja=Symbol.iterator;function Ka(a){if(null===a||"object"!==typeof a)return null;a=Ja&&a[Ja]||a["@@iterator"];return"function"===typeof a?a:null}var A=Object.assign,La;function Ma(a){if(void 0===La)try{throw Error();}catch(c){var b=c.stack.trim().match(/\n( *(at )?)/);La=b&&b[1]||""}return"\n"+La+a}var Na=!1;
function Oa(a,b){if(!a||Na)return"";Na=!0;var c=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(b)if(b=function(){throw Error();},Object.defineProperty(b.prototype,"props",{set:function(){throw Error();}}),"object"===typeof Reflect&&Reflect.construct){try{Reflect.construct(b,[])}catch(l){var d=l}Reflect.construct(a,[],b)}else{try{b.call()}catch(l){d=l}a.call(b.prototype)}else{try{throw Error();}catch(l){d=l}a()}}catch(l){if(l&&d&&"string"===typeof l.stack){for(var e=l.stack.split("\n"),
f=d.stack.split("\n"),g=e.length-1,h=f.length-1;1<=g&&0<=h&&e[g]!==f[h];)h--;for(;1<=g&&0<=h;g--,h--)if(e[g]!==f[h]){if(1!==g||1!==h){do if(g--,h--,0>h||e[g]!==f[h]){var k="\n"+e[g].replace(" at new "," at ");a.displayName&&k.includes("<anonymous>")&&(k=k.replace("<anonymous>",a.displayName));return k}while(1<=g&&0<=h)}break}}}finally{Na=!1,Error.prepareStackTrace=c}return(a=a?a.displayName||a.name:"")?Ma(a):""}
function Pa(a){switch(a.tag){case 5:return Ma(a.type);case 16:return Ma("Lazy");case 13:return Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 2:case 15:return a=Oa(a.type,!1),a;case 11:return a=Oa(a.type.render,!1),a;case 1:return a=Oa(a.type,!0),a;default:return""}}
function Qa(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case ya:return"Fragment";case wa:return"Portal";case Aa:return"Profiler";case za:return"StrictMode";case Ea:return"Suspense";case Fa:return"SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case Ca:return(a.displayName||"Context")+".Consumer";case Ba:return(a._context.displayName||"Context")+".Provider";case Da:var b=a.render;a=a.displayName;a||(a=b.displayName||
b.name||"",a=""!==a?"ForwardRef("+a+")":"ForwardRef");return a;case Ga:return b=a.displayName||null,null!==b?b:Qa(a.type)||"Memo";case Ha:b=a._payload;a=a._init;try{return Qa(a(b))}catch(c){}}return null}
function Ra(a){var b=a.type;switch(a.tag){case 24:return"Cache";case 9:return(b.displayName||"Context")+".Consumer";case 10:return(b._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return a=b.render,a=a.displayName||a.name||"",b.displayName||(""!==a?"ForwardRef("+a+")":"ForwardRef");case 7:return"Fragment";case 5:return b;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Qa(b);case 8:return b===za?"StrictMode":"Mode";case 22:return"Offscreen";
case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if("function"===typeof b)return b.displayName||b.name||null;if("string"===typeof b)return b}return null}function Sa(a){switch(typeof a){case "boolean":case "number":case "string":case "undefined":return a;case "object":return a;default:return""}}
function Ta(a){var b=a.type;return(a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
function Ua(a){var b=Ta(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a)}});Object.defineProperty(a,b,{enumerable:c.enumerable});return{getValue:function(){return d},setValue:function(a){d=""+a},stopTracking:function(){a._valueTracker=
null;delete a[b]}}}}function Va(a){a._valueTracker||(a._valueTracker=Ua(a))}function Wa(a){if(!a)return!1;var b=a._valueTracker;if(!b)return!0;var c=b.getValue();var d="";a&&(d=Ta(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}function Xa(a){a=a||("undefined"!==typeof document?document:void 0);if("undefined"===typeof a)return null;try{return a.activeElement||a.body}catch(b){return a.body}}
function Ya(a,b){var c=b.checked;return A({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Za(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Sa(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value}}function ab(a,b){b=b.checked;null!=b&&ta(a,"checked",b,!1)}
function bb(a,b){ab(a,b);var c=Sa(b.value),d=b.type;if(null!=c)if("number"===d){if(0===c&&""===a.value||a.value!=c)a.value=""+c}else a.value!==""+c&&(a.value=""+c);else if("submit"===d||"reset"===d){a.removeAttribute("value");return}b.hasOwnProperty("value")?cb(a,b.type,c):b.hasOwnProperty("defaultValue")&&cb(a,b.type,Sa(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked)}
function db(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){var d=b.type;if(!("submit"!==d&&"reset"!==d||void 0!==b.value&&null!==b.value))return;b=""+a._wrapperState.initialValue;c||b===a.value||(a.value=b);a.defaultValue=b}c=a.name;""!==c&&(a.name="");a.defaultChecked=!!a._wrapperState.initialChecked;""!==c&&(a.name=c)}
function cb(a,b,c){if("number"!==b||Xa(a.ownerDocument)!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c)}var eb=Array.isArray;
function fb(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0)}else{c=""+Sa(c);b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e])}null!==b&&(b.selected=!0)}}
function gb(a,b){if(null!=b.dangerouslySetInnerHTML)throw Error(p(91));return A({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function hb(a,b){var c=b.value;if(null==c){c=b.children;b=b.defaultValue;if(null!=c){if(null!=b)throw Error(p(92));if(eb(c)){if(1<c.length)throw Error(p(93));c=c[0]}b=c}null==b&&(b="");c=b}a._wrapperState={initialValue:Sa(c)}}
function ib(a,b){var c=Sa(b.value),d=Sa(b.defaultValue);null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&a.defaultValue!==c&&(a.defaultValue=c));null!=d&&(a.defaultValue=""+d)}function jb(a){var b=a.textContent;b===a._wrapperState.initialValue&&""!==b&&null!==b&&(a.value=b)}function kb(a){switch(a){case "svg":return"http://www.w3.org/2000/svg";case "math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}
function lb(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?kb(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
var mb,nb=function(a){return"undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)})}:a}(function(a,b){if("http://www.w3.org/2000/svg"!==a.namespaceURI||"innerHTML"in a)a.innerHTML=b;else{mb=mb||document.createElement("div");mb.innerHTML="<svg>"+b.valueOf().toString()+"</svg>";for(b=mb.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild)}});
function ob(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b}
var pb={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,
zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},qb=["Webkit","ms","Moz","O"];Object.keys(pb).forEach(function(a){qb.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);pb[b]=pb[a]})});function rb(a,b,c){return null==b||"boolean"===typeof b||""===b?"":c||"number"!==typeof b||0===b||pb.hasOwnProperty(a)&&pb[a]?(""+b).trim():b+"px"}
function sb(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--"),e=rb(c,b[c],d);"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e}}var tb=A({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
function ub(a,b){if(b){if(tb[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML))throw Error(p(137,a));if(null!=b.dangerouslySetInnerHTML){if(null!=b.children)throw Error(p(60));if("object"!==typeof b.dangerouslySetInnerHTML||!("__html"in b.dangerouslySetInnerHTML))throw Error(p(61));}if(null!=b.style&&"object"!==typeof b.style)throw Error(p(62));}}
function vb(a,b){if(-1===a.indexOf("-"))return"string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return!1;default:return!0}}var wb=null;function xb(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}var yb=null,zb=null,Ab=null;
function Bb(a){if(a=Cb(a)){if("function"!==typeof yb)throw Error(p(280));var b=a.stateNode;b&&(b=Db(b),yb(a.stateNode,a.type,b))}}function Eb(a){zb?Ab?Ab.push(a):Ab=[a]:zb=a}function Fb(){if(zb){var a=zb,b=Ab;Ab=zb=null;Bb(a);if(b)for(a=0;a<b.length;a++)Bb(b[a])}}function Gb(a,b){return a(b)}function Hb(){}var Ib=!1;function Jb(a,b,c){if(Ib)return a(b,c);Ib=!0;try{return Gb(a,b,c)}finally{if(Ib=!1,null!==zb||null!==Ab)Hb(),Fb()}}
function Kb(a,b){var c=a.stateNode;if(null===c)return null;var d=Db(c);if(null===d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":case "onMouseEnter":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1}if(a)return null;if(c&&"function"!==
typeof c)throw Error(p(231,b,typeof c));return c}var Lb=!1;if(ia)try{var Mb={};Object.defineProperty(Mb,"passive",{get:function(){Lb=!0}});window.addEventListener("test",Mb,Mb);window.removeEventListener("test",Mb,Mb)}catch(a){Lb=!1}function Nb(a,b,c,d,e,f,g,h,k){var l=Array.prototype.slice.call(arguments,3);try{b.apply(c,l)}catch(m){this.onError(m)}}var Ob=!1,Pb=null,Qb=!1,Rb=null,Sb={onError:function(a){Ob=!0;Pb=a}};function Tb(a,b,c,d,e,f,g,h,k){Ob=!1;Pb=null;Nb.apply(Sb,arguments)}
function Ub(a,b,c,d,e,f,g,h,k){Tb.apply(this,arguments);if(Ob){if(Ob){var l=Pb;Ob=!1;Pb=null}else throw Error(p(198));Qb||(Qb=!0,Rb=l)}}function Vb(a){var b=a,c=a;if(a.alternate)for(;b.return;)b=b.return;else{a=b;do b=a,0!==(b.flags&4098)&&(c=b.return),a=b.return;while(a)}return 3===b.tag?c:null}function Wb(a){if(13===a.tag){var b=a.memoizedState;null===b&&(a=a.alternate,null!==a&&(b=a.memoizedState));if(null!==b)return b.dehydrated}return null}function Xb(a){if(Vb(a)!==a)throw Error(p(188));}
function Yb(a){var b=a.alternate;if(!b){b=Vb(a);if(null===b)throw Error(p(188));return b!==a?null:a}for(var c=a,d=b;;){var e=c.return;if(null===e)break;var f=e.alternate;if(null===f){d=e.return;if(null!==d){c=d;continue}break}if(e.child===f.child){for(f=e.child;f;){if(f===c)return Xb(e),a;if(f===d)return Xb(e),b;f=f.sibling}throw Error(p(188));}if(c.return!==d.return)c=e,d=f;else{for(var g=!1,h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling}if(!g){for(h=f.child;h;){if(h===
c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling}if(!g)throw Error(p(189));}}if(c.alternate!==d)throw Error(p(190));}if(3!==c.tag)throw Error(p(188));return c.stateNode.current===c?a:b}function Zb(a){a=Yb(a);return null!==a?$b(a):null}function $b(a){if(5===a.tag||6===a.tag)return a;for(a=a.child;null!==a;){var b=$b(a);if(null!==b)return b;a=a.sibling}return null}
var ac=ca.unstable_scheduleCallback,bc=ca.unstable_cancelCallback,cc=ca.unstable_shouldYield,dc=ca.unstable_requestPaint,B=ca.unstable_now,ec=ca.unstable_getCurrentPriorityLevel,fc=ca.unstable_ImmediatePriority,gc=ca.unstable_UserBlockingPriority,hc=ca.unstable_NormalPriority,ic=ca.unstable_LowPriority,jc=ca.unstable_IdlePriority,kc=null,lc=null;function mc(a){if(lc&&"function"===typeof lc.onCommitFiberRoot)try{lc.onCommitFiberRoot(kc,a,void 0,128===(a.current.flags&128))}catch(b){}}
var oc=Math.clz32?Math.clz32:nc,pc=Math.log,qc=Math.LN2;function nc(a){a>>>=0;return 0===a?32:31-(pc(a)/qc|0)|0}var rc=64,sc=4194304;
function tc(a){switch(a&-a){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return a&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return a&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;
default:return a}}function uc(a,b){var c=a.pendingLanes;if(0===c)return 0;var d=0,e=a.suspendedLanes,f=a.pingedLanes,g=c&268435455;if(0!==g){var h=g&~e;0!==h?d=tc(h):(f&=g,0!==f&&(d=tc(f)))}else g=c&~e,0!==g?d=tc(g):0!==f&&(d=tc(f));if(0===d)return 0;if(0!==b&&b!==d&&0===(b&e)&&(e=d&-d,f=b&-b,e>=f||16===e&&0!==(f&4194240)))return b;0!==(d&4)&&(d|=c&16);b=a.entangledLanes;if(0!==b)for(a=a.entanglements,b&=d;0<b;)c=31-oc(b),e=1<<c,d|=a[c],b&=~e;return d}
function vc(a,b){switch(a){case 1:case 2:case 4:return b+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return b+5E3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}
function wc(a,b){for(var c=a.suspendedLanes,d=a.pingedLanes,e=a.expirationTimes,f=a.pendingLanes;0<f;){var g=31-oc(f),h=1<<g,k=e[g];if(-1===k){if(0===(h&c)||0!==(h&d))e[g]=vc(h,b)}else k<=b&&(a.expiredLanes|=h);f&=~h}}function xc(a){a=a.pendingLanes&-1073741825;return 0!==a?a:a&1073741824?1073741824:0}function yc(){var a=rc;rc<<=1;0===(rc&4194240)&&(rc=64);return a}function zc(a){for(var b=[],c=0;31>c;c++)b.push(a);return b}
function Ac(a,b,c){a.pendingLanes|=b;536870912!==b&&(a.suspendedLanes=0,a.pingedLanes=0);a=a.eventTimes;b=31-oc(b);a[b]=c}function Bc(a,b){var c=a.pendingLanes&~b;a.pendingLanes=b;a.suspendedLanes=0;a.pingedLanes=0;a.expiredLanes&=b;a.mutableReadLanes&=b;a.entangledLanes&=b;b=a.entanglements;var d=a.eventTimes;for(a=a.expirationTimes;0<c;){var e=31-oc(c),f=1<<e;b[e]=0;d[e]=-1;a[e]=-1;c&=~f}}
function Cc(a,b){var c=a.entangledLanes|=b;for(a=a.entanglements;c;){var d=31-oc(c),e=1<<d;e&b|a[d]&b&&(a[d]|=b);c&=~e}}var C=0;function Dc(a){a&=-a;return 1<a?4<a?0!==(a&268435455)?16:536870912:4:1}var Ec,Fc,Gc,Hc,Ic,Jc=!1,Kc=[],Lc=null,Mc=null,Nc=null,Oc=new Map,Pc=new Map,Qc=[],Rc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Sc(a,b){switch(a){case "focusin":case "focusout":Lc=null;break;case "dragenter":case "dragleave":Mc=null;break;case "mouseover":case "mouseout":Nc=null;break;case "pointerover":case "pointerout":Oc.delete(b.pointerId);break;case "gotpointercapture":case "lostpointercapture":Pc.delete(b.pointerId)}}
function Tc(a,b,c,d,e,f){if(null===a||a.nativeEvent!==f)return a={blockedOn:b,domEventName:c,eventSystemFlags:d,nativeEvent:f,targetContainers:[e]},null!==b&&(b=Cb(b),null!==b&&Fc(b)),a;a.eventSystemFlags|=d;b=a.targetContainers;null!==e&&-1===b.indexOf(e)&&b.push(e);return a}
function Uc(a,b,c,d,e){switch(b){case "focusin":return Lc=Tc(Lc,a,b,c,d,e),!0;case "dragenter":return Mc=Tc(Mc,a,b,c,d,e),!0;case "mouseover":return Nc=Tc(Nc,a,b,c,d,e),!0;case "pointerover":var f=e.pointerId;Oc.set(f,Tc(Oc.get(f)||null,a,b,c,d,e));return!0;case "gotpointercapture":return f=e.pointerId,Pc.set(f,Tc(Pc.get(f)||null,a,b,c,d,e)),!0}return!1}
function Vc(a){var b=Wc(a.target);if(null!==b){var c=Vb(b);if(null!==c)if(b=c.tag,13===b){if(b=Wb(c),null!==b){a.blockedOn=b;Ic(a.priority,function(){Gc(c)});return}}else if(3===b&&c.stateNode.current.memoizedState.isDehydrated){a.blockedOn=3===c.tag?c.stateNode.containerInfo:null;return}}a.blockedOn=null}
function Xc(a){if(null!==a.blockedOn)return!1;for(var b=a.targetContainers;0<b.length;){var c=Yc(a.domEventName,a.eventSystemFlags,b[0],a.nativeEvent);if(null===c){c=a.nativeEvent;var d=new c.constructor(c.type,c);wb=d;c.target.dispatchEvent(d);wb=null}else return b=Cb(c),null!==b&&Fc(b),a.blockedOn=c,!1;b.shift()}return!0}function Zc(a,b,c){Xc(a)&&c.delete(b)}function $c(){Jc=!1;null!==Lc&&Xc(Lc)&&(Lc=null);null!==Mc&&Xc(Mc)&&(Mc=null);null!==Nc&&Xc(Nc)&&(Nc=null);Oc.forEach(Zc);Pc.forEach(Zc)}
function ad(a,b){a.blockedOn===b&&(a.blockedOn=null,Jc||(Jc=!0,ca.unstable_scheduleCallback(ca.unstable_NormalPriority,$c)))}
function bd(a){function b(b){return ad(b,a)}if(0<Kc.length){ad(Kc[0],a);for(var c=1;c<Kc.length;c++){var d=Kc[c];d.blockedOn===a&&(d.blockedOn=null)}}null!==Lc&&ad(Lc,a);null!==Mc&&ad(Mc,a);null!==Nc&&ad(Nc,a);Oc.forEach(b);Pc.forEach(b);for(c=0;c<Qc.length;c++)d=Qc[c],d.blockedOn===a&&(d.blockedOn=null);for(;0<Qc.length&&(c=Qc[0],null===c.blockedOn);)Vc(c),null===c.blockedOn&&Qc.shift()}var cd=ua.ReactCurrentBatchConfig,dd=!0;
function ed(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=1,fd(a,b,c,d)}finally{C=e,cd.transition=f}}function gd(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=4,fd(a,b,c,d)}finally{C=e,cd.transition=f}}
function fd(a,b,c,d){if(dd){var e=Yc(a,b,c,d);if(null===e)hd(a,b,d,id,c),Sc(a,d);else if(Uc(e,a,b,c,d))d.stopPropagation();else if(Sc(a,d),b&4&&-1<Rc.indexOf(a)){for(;null!==e;){var f=Cb(e);null!==f&&Ec(f);f=Yc(a,b,c,d);null===f&&hd(a,b,d,id,c);if(f===e)break;e=f}null!==e&&d.stopPropagation()}else hd(a,b,d,null,c)}}var id=null;
function Yc(a,b,c,d){id=null;a=xb(d);a=Wc(a);if(null!==a)if(b=Vb(a),null===b)a=null;else if(c=b.tag,13===c){a=Wb(b);if(null!==a)return a;a=null}else if(3===c){if(b.stateNode.current.memoizedState.isDehydrated)return 3===b.tag?b.stateNode.containerInfo:null;a=null}else b!==a&&(a=null);id=a;return null}
function jd(a){switch(a){case "cancel":case "click":case "close":case "contextmenu":case "copy":case "cut":case "auxclick":case "dblclick":case "dragend":case "dragstart":case "drop":case "focusin":case "focusout":case "input":case "invalid":case "keydown":case "keypress":case "keyup":case "mousedown":case "mouseup":case "paste":case "pause":case "play":case "pointercancel":case "pointerdown":case "pointerup":case "ratechange":case "reset":case "resize":case "seeked":case "submit":case "touchcancel":case "touchend":case "touchstart":case "volumechange":case "change":case "selectionchange":case "textInput":case "compositionstart":case "compositionend":case "compositionupdate":case "beforeblur":case "afterblur":case "beforeinput":case "blur":case "fullscreenchange":case "focus":case "hashchange":case "popstate":case "select":case "selectstart":return 1;case "drag":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "mousemove":case "mouseout":case "mouseover":case "pointermove":case "pointerout":case "pointerover":case "scroll":case "toggle":case "touchmove":case "wheel":case "mouseenter":case "mouseleave":case "pointerenter":case "pointerleave":return 4;
case "message":switch(ec()){case fc:return 1;case gc:return 4;case hc:case ic:return 16;case jc:return 536870912;default:return 16}default:return 16}}var kd=null,ld=null,md=null;function nd(){if(md)return md;var a,b=ld,c=b.length,d,e="value"in kd?kd.value:kd.textContent,f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);return md=e.slice(a,1<d?1-d:void 0)}
function od(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}function pd(){return!0}function qd(){return!1}
function rd(a){function b(b,d,e,f,g){this._reactName=b;this._targetInst=e;this.type=d;this.nativeEvent=f;this.target=g;this.currentTarget=null;for(var c in a)a.hasOwnProperty(c)&&(b=a[c],this[c]=b?b(f):f[c]);this.isDefaultPrevented=(null!=f.defaultPrevented?f.defaultPrevented:!1===f.returnValue)?pd:qd;this.isPropagationStopped=qd;return this}A(b.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&
(a.returnValue=!1),this.isDefaultPrevented=pd)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=pd)},persist:function(){},isPersistent:pd});return b}
var sd={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},td=rd(sd),ud=A({},sd,{view:0,detail:0}),vd=rd(ud),wd,xd,yd,Ad=A({},ud,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zd,button:0,buttons:0,relatedTarget:function(a){return void 0===a.relatedTarget?a.fromElement===a.srcElement?a.toElement:a.fromElement:a.relatedTarget},movementX:function(a){if("movementX"in
a)return a.movementX;a!==yd&&(yd&&"mousemove"===a.type?(wd=a.screenX-yd.screenX,xd=a.screenY-yd.screenY):xd=wd=0,yd=a);return wd},movementY:function(a){return"movementY"in a?a.movementY:xd}}),Bd=rd(Ad),Cd=A({},Ad,{dataTransfer:0}),Dd=rd(Cd),Ed=A({},ud,{relatedTarget:0}),Fd=rd(Ed),Gd=A({},sd,{animationName:0,elapsedTime:0,pseudoElement:0}),Hd=rd(Gd),Id=A({},sd,{clipboardData:function(a){return"clipboardData"in a?a.clipboardData:window.clipboardData}}),Jd=rd(Id),Kd=A({},sd,{data:0}),Ld=rd(Kd),Md={Esc:"Escape",
Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",
119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Od={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=Od[a])?!!b[a]:!1}function zd(){return Pd}
var Qd=A({},ud,{key:function(a){if(a.key){var b=Md[a.key]||a.key;if("Unidentified"!==b)return b}return"keypress"===a.type?(a=od(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?Nd[a.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zd,charCode:function(a){return"keypress"===a.type?od(a):0},keyCode:function(a){return"keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return"keypress"===
a.type?od(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),Rd=rd(Qd),Sd=A({},Ad,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=rd(Sd),Ud=A({},ud,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zd}),Vd=rd(Ud),Wd=A({},sd,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xd=rd(Wd),Yd=A({},Ad,{deltaX:function(a){return"deltaX"in a?a.deltaX:"wheelDeltaX"in a?-a.wheelDeltaX:0},
deltaY:function(a){return"deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:0,deltaMode:0}),Zd=rd(Yd),$d=[9,13,27,32],ae=ia&&"CompositionEvent"in window,be=null;ia&&"documentMode"in document&&(be=document.documentMode);var ce=ia&&"TextEvent"in window&&!be,de=ia&&(!ae||be&&8<be&&11>=be),ee=String.fromCharCode(32),fe=!1;
function ge(a,b){switch(a){case "keyup":return-1!==$d.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "focusout":return!0;default:return!1}}function he(a){a=a.detail;return"object"===typeof a&&"data"in a?a.data:null}var ie=!1;function je(a,b){switch(a){case "compositionend":return he(b);case "keypress":if(32!==b.which)return null;fe=!0;return ee;case "textInput":return a=b.data,a===ee&&fe?null:a;default:return null}}
function ke(a,b){if(ie)return"compositionend"===a||!ae&&ge(a,b)?(a=nd(),md=ld=kd=null,ie=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "compositionend":return de&&"ko"!==b.locale?null:b.data;default:return null}}
var le={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function me(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return"input"===b?!!le[a.type]:"textarea"===b?!0:!1}function ne(a,b,c,d){Eb(d);b=oe(b,"onChange");0<b.length&&(c=new td("onChange","change",null,c,d),a.push({event:c,listeners:b}))}var pe=null,qe=null;function re(a){se(a,0)}function te(a){var b=ue(a);if(Wa(b))return a}
function ve(a,b){if("change"===a)return b}var we=!1;if(ia){var xe;if(ia){var ye="oninput"in document;if(!ye){var ze=document.createElement("div");ze.setAttribute("oninput","return;");ye="function"===typeof ze.oninput}xe=ye}else xe=!1;we=xe&&(!document.documentMode||9<document.documentMode)}function Ae(){pe&&(pe.detachEvent("onpropertychange",Be),qe=pe=null)}function Be(a){if("value"===a.propertyName&&te(qe)){var b=[];ne(b,qe,a,xb(a));Jb(re,b)}}
function Ce(a,b,c){"focusin"===a?(Ae(),pe=b,qe=c,pe.attachEvent("onpropertychange",Be)):"focusout"===a&&Ae()}function De(a){if("selectionchange"===a||"keyup"===a||"keydown"===a)return te(qe)}function Ee(a,b){if("click"===a)return te(b)}function Fe(a,b){if("input"===a||"change"===a)return te(b)}function Ge(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var He="function"===typeof Object.is?Object.is:Ge;
function Ie(a,b){if(He(a,b))return!0;if("object"!==typeof a||null===a||"object"!==typeof b||null===b)return!1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return!1;for(d=0;d<c.length;d++){var e=c[d];if(!ja.call(b,e)||!He(a[e],b[e]))return!1}return!0}function Je(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
function Ke(a,b){var c=Je(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return{node:c,offset:b-a};a=d}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode}c=void 0}c=Je(c)}}function Le(a,b){return a&&b?a===b?!0:a&&3===a.nodeType?!1:b&&3===b.nodeType?Le(a,b.parentNode):"contains"in a?a.contains(b):a.compareDocumentPosition?!!(a.compareDocumentPosition(b)&16):!1:!1}
function Me(){for(var a=window,b=Xa();b instanceof a.HTMLIFrameElement;){try{var c="string"===typeof b.contentWindow.location.href}catch(d){c=!1}if(c)a=b.contentWindow;else break;b=Xa(a.document)}return b}function Ne(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}
function Oe(a){var b=Me(),c=a.focusedElem,d=a.selectionRange;if(b!==c&&c&&c.ownerDocument&&Le(c.ownerDocument.documentElement,c)){if(null!==d&&Ne(c))if(b=d.start,a=d.end,void 0===a&&(a=b),"selectionStart"in c)c.selectionStart=b,c.selectionEnd=Math.min(a,c.value.length);else if(a=(b=c.ownerDocument||document)&&b.defaultView||window,a.getSelection){a=a.getSelection();var e=c.textContent.length,f=Math.min(d.start,e);d=void 0===d.end?f:Math.min(d.end,e);!a.extend&&f>d&&(e=d,d=f,f=e);e=Ke(c,f);var g=Ke(c,
d);e&&g&&(1!==a.rangeCount||a.anchorNode!==e.node||a.anchorOffset!==e.offset||a.focusNode!==g.node||a.focusOffset!==g.offset)&&(b=b.createRange(),b.setStart(e.node,e.offset),a.removeAllRanges(),f>d?(a.addRange(b),a.extend(g.node,g.offset)):(b.setEnd(g.node,g.offset),a.addRange(b)))}b=[];for(a=c;a=a.parentNode;)1===a.nodeType&&b.push({element:a,left:a.scrollLeft,top:a.scrollTop});"function"===typeof c.focus&&c.focus();for(c=0;c<b.length;c++)a=b[c],a.element.scrollLeft=a.left,a.element.scrollTop=a.top}}
var Pe=ia&&"documentMode"in document&&11>=document.documentMode,Qe=null,Re=null,Se=null,Te=!1;
function Ue(a,b,c){var d=c.window===c?c.document:9===c.nodeType?c:c.ownerDocument;Te||null==Qe||Qe!==Xa(d)||(d=Qe,"selectionStart"in d&&Ne(d)?d={start:d.selectionStart,end:d.selectionEnd}:(d=(d.ownerDocument&&d.ownerDocument.defaultView||window).getSelection(),d={anchorNode:d.anchorNode,anchorOffset:d.anchorOffset,focusNode:d.focusNode,focusOffset:d.focusOffset}),Se&&Ie(Se,d)||(Se=d,d=oe(Re,"onSelect"),0<d.length&&(b=new td("onSelect","select",null,b,c),a.push({event:b,listeners:d}),b.target=Qe)))}
function Ve(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;return c}var We={animationend:Ve("Animation","AnimationEnd"),animationiteration:Ve("Animation","AnimationIteration"),animationstart:Ve("Animation","AnimationStart"),transitionend:Ve("Transition","TransitionEnd")},Xe={},Ye={};
ia&&(Ye=document.createElement("div").style,"AnimationEvent"in window||(delete We.animationend.animation,delete We.animationiteration.animation,delete We.animationstart.animation),"TransitionEvent"in window||delete We.transitionend.transition);function Ze(a){if(Xe[a])return Xe[a];if(!We[a])return a;var b=We[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in Ye)return Xe[a]=b[c];return a}var $e=Ze("animationend"),af=Ze("animationiteration"),bf=Ze("animationstart"),cf=Ze("transitionend"),df=new Map,ef="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function ff(a,b){df.set(a,b);fa(b,[a])}for(var gf=0;gf<ef.length;gf++){var hf=ef[gf],jf=hf.toLowerCase(),kf=hf[0].toUpperCase()+hf.slice(1);ff(jf,"on"+kf)}ff($e,"onAnimationEnd");ff(af,"onAnimationIteration");ff(bf,"onAnimationStart");ff("dblclick","onDoubleClick");ff("focusin","onFocus");ff("focusout","onBlur");ff(cf,"onTransitionEnd");ha("onMouseEnter",["mouseout","mouseover"]);ha("onMouseLeave",["mouseout","mouseover"]);ha("onPointerEnter",["pointerout","pointerover"]);
ha("onPointerLeave",["pointerout","pointerover"]);fa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fa("onBeforeInput",["compositionend","keypress","textInput","paste"]);fa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var lf="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),mf=new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
function nf(a,b,c){var d=a.type||"unknown-event";a.currentTarget=c;Ub(d,b,void 0,a);a.currentTarget=null}
function se(a,b){b=0!==(b&4);for(var c=0;c<a.length;c++){var d=a[c],e=d.event;d=d.listeners;a:{var f=void 0;if(b)for(var g=d.length-1;0<=g;g--){var h=d[g],k=h.instance,l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k}else for(g=0;g<d.length;g++){h=d[g];k=h.instance;l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k}}}if(Qb)throw a=Rb,Qb=!1,Rb=null,a;}
function D(a,b){var c=b[of];void 0===c&&(c=b[of]=new Set);var d=a+"__bubble";c.has(d)||(pf(b,a,2,!1),c.add(d))}function qf(a,b,c){var d=0;b&&(d|=4);pf(c,a,d,b)}var rf="_reactListening"+Math.random().toString(36).slice(2);function sf(a){if(!a[rf]){a[rf]=!0;da.forEach(function(b){"selectionchange"!==b&&(mf.has(b)||qf(b,!1,a),qf(b,!0,a))});var b=9===a.nodeType?a:a.ownerDocument;null===b||b[rf]||(b[rf]=!0,qf("selectionchange",!1,b))}}
function pf(a,b,c,d){switch(jd(b)){case 1:var e=ed;break;case 4:e=gd;break;default:e=fd}c=e.bind(null,b,c,a);e=void 0;!Lb||"touchstart"!==b&&"touchmove"!==b&&"wheel"!==b||(e=!0);d?void 0!==e?a.addEventListener(b,c,{capture:!0,passive:e}):a.addEventListener(b,c,!0):void 0!==e?a.addEventListener(b,c,{passive:e}):a.addEventListener(b,c,!1)}
function hd(a,b,c,d,e){var f=d;if(0===(b&1)&&0===(b&2)&&null!==d)a:for(;;){if(null===d)return;var g=d.tag;if(3===g||4===g){var h=d.stateNode.containerInfo;if(h===e||8===h.nodeType&&h.parentNode===e)break;if(4===g)for(g=d.return;null!==g;){var k=g.tag;if(3===k||4===k)if(k=g.stateNode.containerInfo,k===e||8===k.nodeType&&k.parentNode===e)return;g=g.return}for(;null!==h;){g=Wc(h);if(null===g)return;k=g.tag;if(5===k||6===k){d=f=g;continue a}h=h.parentNode}}d=d.return}Jb(function(){var d=f,e=xb(c),g=[];
a:{var h=df.get(a);if(void 0!==h){var k=td,n=a;switch(a){case "keypress":if(0===od(c))break a;case "keydown":case "keyup":k=Rd;break;case "focusin":n="focus";k=Fd;break;case "focusout":n="blur";k=Fd;break;case "beforeblur":case "afterblur":k=Fd;break;case "click":if(2===c.button)break a;case "auxclick":case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":k=Bd;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":k=
Dd;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":k=Vd;break;case $e:case af:case bf:k=Hd;break;case cf:k=Xd;break;case "scroll":k=vd;break;case "wheel":k=Zd;break;case "copy":case "cut":case "paste":k=Jd;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":k=Td}var t=0!==(b&4),J=!t&&"scroll"===a,x=t?null!==h?h+"Capture":null:h;t=[];for(var w=d,u;null!==
w;){u=w;var F=u.stateNode;5===u.tag&&null!==F&&(u=F,null!==x&&(F=Kb(w,x),null!=F&&t.push(tf(w,F,u))));if(J)break;w=w.return}0<t.length&&(h=new k(h,n,null,c,e),g.push({event:h,listeners:t}))}}if(0===(b&7)){a:{h="mouseover"===a||"pointerover"===a;k="mouseout"===a||"pointerout"===a;if(h&&c!==wb&&(n=c.relatedTarget||c.fromElement)&&(Wc(n)||n[uf]))break a;if(k||h){h=e.window===e?e:(h=e.ownerDocument)?h.defaultView||h.parentWindow:window;if(k){if(n=c.relatedTarget||c.toElement,k=d,n=n?Wc(n):null,null!==
n&&(J=Vb(n),n!==J||5!==n.tag&&6!==n.tag))n=null}else k=null,n=d;if(k!==n){t=Bd;F="onMouseLeave";x="onMouseEnter";w="mouse";if("pointerout"===a||"pointerover"===a)t=Td,F="onPointerLeave",x="onPointerEnter",w="pointer";J=null==k?h:ue(k);u=null==n?h:ue(n);h=new t(F,w+"leave",k,c,e);h.target=J;h.relatedTarget=u;F=null;Wc(e)===d&&(t=new t(x,w+"enter",n,c,e),t.target=u,t.relatedTarget=J,F=t);J=F;if(k&&n)b:{t=k;x=n;w=0;for(u=t;u;u=vf(u))w++;u=0;for(F=x;F;F=vf(F))u++;for(;0<w-u;)t=vf(t),w--;for(;0<u-w;)x=
vf(x),u--;for(;w--;){if(t===x||null!==x&&t===x.alternate)break b;t=vf(t);x=vf(x)}t=null}else t=null;null!==k&&wf(g,h,k,t,!1);null!==n&&null!==J&&wf(g,J,n,t,!0)}}}a:{h=d?ue(d):window;k=h.nodeName&&h.nodeName.toLowerCase();if("select"===k||"input"===k&&"file"===h.type)var na=ve;else if(me(h))if(we)na=Fe;else{na=De;var xa=Ce}else(k=h.nodeName)&&"input"===k.toLowerCase()&&("checkbox"===h.type||"radio"===h.type)&&(na=Ee);if(na&&(na=na(a,d))){ne(g,na,c,e);break a}xa&&xa(a,h,d);"focusout"===a&&(xa=h._wrapperState)&&
xa.controlled&&"number"===h.type&&cb(h,"number",h.value)}xa=d?ue(d):window;switch(a){case "focusin":if(me(xa)||"true"===xa.contentEditable)Qe=xa,Re=d,Se=null;break;case "focusout":Se=Re=Qe=null;break;case "mousedown":Te=!0;break;case "contextmenu":case "mouseup":case "dragend":Te=!1;Ue(g,c,e);break;case "selectionchange":if(Pe)break;case "keydown":case "keyup":Ue(g,c,e)}var $a;if(ae)b:{switch(a){case "compositionstart":var ba="onCompositionStart";break b;case "compositionend":ba="onCompositionEnd";
break b;case "compositionupdate":ba="onCompositionUpdate";break b}ba=void 0}else ie?ge(a,c)&&(ba="onCompositionEnd"):"keydown"===a&&229===c.keyCode&&(ba="onCompositionStart");ba&&(de&&"ko"!==c.locale&&(ie||"onCompositionStart"!==ba?"onCompositionEnd"===ba&&ie&&($a=nd()):(kd=e,ld="value"in kd?kd.value:kd.textContent,ie=!0)),xa=oe(d,ba),0<xa.length&&(ba=new Ld(ba,a,null,c,e),g.push({event:ba,listeners:xa}),$a?ba.data=$a:($a=he(c),null!==$a&&(ba.data=$a))));if($a=ce?je(a,c):ke(a,c))d=oe(d,"onBeforeInput"),
0<d.length&&(e=new Ld("onBeforeInput","beforeinput",null,c,e),g.push({event:e,listeners:d}),e.data=$a)}se(g,b)})}function tf(a,b,c){return{instance:a,listener:b,currentTarget:c}}function oe(a,b){for(var c=b+"Capture",d=[];null!==a;){var e=a,f=e.stateNode;5===e.tag&&null!==f&&(e=f,f=Kb(a,c),null!=f&&d.unshift(tf(a,f,e)),f=Kb(a,b),null!=f&&d.push(tf(a,f,e)));a=a.return}return d}function vf(a){if(null===a)return null;do a=a.return;while(a&&5!==a.tag);return a?a:null}
function wf(a,b,c,d,e){for(var f=b._reactName,g=[];null!==c&&c!==d;){var h=c,k=h.alternate,l=h.stateNode;if(null!==k&&k===d)break;5===h.tag&&null!==l&&(h=l,e?(k=Kb(c,f),null!=k&&g.unshift(tf(c,k,h))):e||(k=Kb(c,f),null!=k&&g.push(tf(c,k,h))));c=c.return}0!==g.length&&a.push({event:b,listeners:g})}var xf=/\r\n?/g,yf=/\u0000|\uFFFD/g;function zf(a){return("string"===typeof a?a:""+a).replace(xf,"\n").replace(yf,"")}function Af(a,b,c){b=zf(b);if(zf(a)!==b&&c)throw Error(p(425));}function Bf(){}
var Cf=null,Df=null;function Ef(a,b){return"textarea"===a||"noscript"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&null!=b.dangerouslySetInnerHTML.__html}
var Ff="function"===typeof setTimeout?setTimeout:void 0,Gf="function"===typeof clearTimeout?clearTimeout:void 0,Hf="function"===typeof Promise?Promise:void 0,Jf="function"===typeof queueMicrotask?queueMicrotask:"undefined"!==typeof Hf?function(a){return Hf.resolve(null).then(a).catch(If)}:Ff;function If(a){setTimeout(function(){throw a;})}
function Kf(a,b){var c=b,d=0;do{var e=c.nextSibling;a.removeChild(c);if(e&&8===e.nodeType)if(c=e.data,"/$"===c){if(0===d){a.removeChild(e);bd(b);return}d--}else"$"!==c&&"$?"!==c&&"$!"!==c||d++;c=e}while(c);bd(b)}function Lf(a){for(;null!=a;a=a.nextSibling){var b=a.nodeType;if(1===b||3===b)break;if(8===b){b=a.data;if("$"===b||"$!"===b||"$?"===b)break;if("/$"===b)return null}}return a}
function Mf(a){a=a.previousSibling;for(var b=0;a;){if(8===a.nodeType){var c=a.data;if("$"===c||"$!"===c||"$?"===c){if(0===b)return a;b--}else"/$"===c&&b++}a=a.previousSibling}return null}var Nf=Math.random().toString(36).slice(2),Of="__reactFiber$"+Nf,Pf="__reactProps$"+Nf,uf="__reactContainer$"+Nf,of="__reactEvents$"+Nf,Qf="__reactListeners$"+Nf,Rf="__reactHandles$"+Nf;
function Wc(a){var b=a[Of];if(b)return b;for(var c=a.parentNode;c;){if(b=c[uf]||c[Of]){c=b.alternate;if(null!==b.child||null!==c&&null!==c.child)for(a=Mf(a);null!==a;){if(c=a[Of])return c;a=Mf(a)}return b}a=c;c=a.parentNode}return null}function Cb(a){a=a[Of]||a[uf];return!a||5!==a.tag&&6!==a.tag&&13!==a.tag&&3!==a.tag?null:a}function ue(a){if(5===a.tag||6===a.tag)return a.stateNode;throw Error(p(33));}function Db(a){return a[Pf]||null}var Sf=[],Tf=-1;function Uf(a){return{current:a}}
function E(a){0>Tf||(a.current=Sf[Tf],Sf[Tf]=null,Tf--)}function G(a,b){Tf++;Sf[Tf]=a.current;a.current=b}var Vf={},H=Uf(Vf),Wf=Uf(!1),Xf=Vf;function Yf(a,b){var c=a.type.contextTypes;if(!c)return Vf;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}
function Zf(a){a=a.childContextTypes;return null!==a&&void 0!==a}function $f(){E(Wf);E(H)}function ag(a,b,c){if(H.current!==Vf)throw Error(p(168));G(H,b);G(Wf,c)}function bg(a,b,c){var d=a.stateNode;b=b.childContextTypes;if("function"!==typeof d.getChildContext)return c;d=d.getChildContext();for(var e in d)if(!(e in b))throw Error(p(108,Ra(a)||"Unknown",e));return A({},c,d)}
function cg(a){a=(a=a.stateNode)&&a.__reactInternalMemoizedMergedChildContext||Vf;Xf=H.current;G(H,a);G(Wf,Wf.current);return!0}function dg(a,b,c){var d=a.stateNode;if(!d)throw Error(p(169));c?(a=bg(a,b,Xf),d.__reactInternalMemoizedMergedChildContext=a,E(Wf),E(H),G(H,a)):E(Wf);G(Wf,c)}var eg=null,fg=!1,gg=!1;function hg(a){null===eg?eg=[a]:eg.push(a)}function ig(a){fg=!0;hg(a)}
function jg(){if(!gg&&null!==eg){gg=!0;var a=0,b=C;try{var c=eg;for(C=1;a<c.length;a++){var d=c[a];do d=d(!0);while(null!==d)}eg=null;fg=!1}catch(e){throw null!==eg&&(eg=eg.slice(a+1)),ac(fc,jg),e;}finally{C=b,gg=!1}}return null}var kg=[],lg=0,mg=null,ng=0,og=[],pg=0,qg=null,rg=1,sg="";function tg(a,b){kg[lg++]=ng;kg[lg++]=mg;mg=a;ng=b}
function ug(a,b,c){og[pg++]=rg;og[pg++]=sg;og[pg++]=qg;qg=a;var d=rg;a=sg;var e=32-oc(d)-1;d&=~(1<<e);c+=1;var f=32-oc(b)+e;if(30<f){var g=e-e%5;f=(d&(1<<g)-1).toString(32);d>>=g;e-=g;rg=1<<32-oc(b)+e|c<<e|d;sg=f+a}else rg=1<<f|c<<e|d,sg=a}function vg(a){null!==a.return&&(tg(a,1),ug(a,1,0))}function wg(a){for(;a===mg;)mg=kg[--lg],kg[lg]=null,ng=kg[--lg],kg[lg]=null;for(;a===qg;)qg=og[--pg],og[pg]=null,sg=og[--pg],og[pg]=null,rg=og[--pg],og[pg]=null}var xg=null,yg=null,I=!1,zg=null;
function Ag(a,b){var c=Bg(5,null,null,0);c.elementType="DELETED";c.stateNode=b;c.return=a;b=a.deletions;null===b?(a.deletions=[c],a.flags|=16):b.push(c)}
function Cg(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,xg=a,yg=Lf(b.firstChild),!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?null:b,null!==b?(a.stateNode=b,xg=a,yg=null,!0):!1;case 13:return b=8!==b.nodeType?null:b,null!==b?(c=null!==qg?{id:rg,overflow:sg}:null,a.memoizedState={dehydrated:b,treeContext:c,retryLane:1073741824},c=Bg(18,null,null,0),c.stateNode=b,c.return=a,a.child=c,xg=a,yg=
null,!0):!1;default:return!1}}function Dg(a){return 0!==(a.mode&1)&&0===(a.flags&128)}function Eg(a){if(I){var b=yg;if(b){var c=b;if(!Cg(a,b)){if(Dg(a))throw Error(p(418));b=Lf(c.nextSibling);var d=xg;b&&Cg(a,b)?Ag(d,c):(a.flags=a.flags&-4097|2,I=!1,xg=a)}}else{if(Dg(a))throw Error(p(418));a.flags=a.flags&-4097|2;I=!1;xg=a}}}function Fg(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag&&13!==a.tag;)a=a.return;xg=a}
function Gg(a){if(a!==xg)return!1;if(!I)return Fg(a),I=!0,!1;var b;(b=3!==a.tag)&&!(b=5!==a.tag)&&(b=a.type,b="head"!==b&&"body"!==b&&!Ef(a.type,a.memoizedProps));if(b&&(b=yg)){if(Dg(a))throw Hg(),Error(p(418));for(;b;)Ag(a,b),b=Lf(b.nextSibling)}Fg(a);if(13===a.tag){a=a.memoizedState;a=null!==a?a.dehydrated:null;if(!a)throw Error(p(317));a:{a=a.nextSibling;for(b=0;a;){if(8===a.nodeType){var c=a.data;if("/$"===c){if(0===b){yg=Lf(a.nextSibling);break a}b--}else"$"!==c&&"$!"!==c&&"$?"!==c||b++}a=a.nextSibling}yg=
null}}else yg=xg?Lf(a.stateNode.nextSibling):null;return!0}function Hg(){for(var a=yg;a;)a=Lf(a.nextSibling)}function Ig(){yg=xg=null;I=!1}function Jg(a){null===zg?zg=[a]:zg.push(a)}var Kg=ua.ReactCurrentBatchConfig;function Lg(a,b){if(a&&a.defaultProps){b=A({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);return b}return b}var Mg=Uf(null),Ng=null,Og=null,Pg=null;function Qg(){Pg=Og=Ng=null}function Rg(a){var b=Mg.current;E(Mg);a._currentValue=b}
function Sg(a,b,c){for(;null!==a;){var d=a.alternate;(a.childLanes&b)!==b?(a.childLanes|=b,null!==d&&(d.childLanes|=b)):null!==d&&(d.childLanes&b)!==b&&(d.childLanes|=b);if(a===c)break;a=a.return}}function Tg(a,b){Ng=a;Pg=Og=null;a=a.dependencies;null!==a&&null!==a.firstContext&&(0!==(a.lanes&b)&&(Ug=!0),a.firstContext=null)}
function Vg(a){var b=a._currentValue;if(Pg!==a)if(a={context:a,memoizedValue:b,next:null},null===Og){if(null===Ng)throw Error(p(308));Og=a;Ng.dependencies={lanes:0,firstContext:a}}else Og=Og.next=a;return b}var Wg=null;function Xg(a){null===Wg?Wg=[a]:Wg.push(a)}function Yg(a,b,c,d){var e=b.interleaved;null===e?(c.next=c,Xg(b)):(c.next=e.next,e.next=c);b.interleaved=c;return Zg(a,d)}
function Zg(a,b){a.lanes|=b;var c=a.alternate;null!==c&&(c.lanes|=b);c=a;for(a=a.return;null!==a;)a.childLanes|=b,c=a.alternate,null!==c&&(c.childLanes|=b),c=a,a=a.return;return 3===c.tag?c.stateNode:null}var $g=!1;function ah(a){a.updateQueue={baseState:a.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}
function bh(a,b){a=a.updateQueue;b.updateQueue===a&&(b.updateQueue={baseState:a.baseState,firstBaseUpdate:a.firstBaseUpdate,lastBaseUpdate:a.lastBaseUpdate,shared:a.shared,effects:a.effects})}function ch(a,b){return{eventTime:a,lane:b,tag:0,payload:null,callback:null,next:null}}
function dh(a,b,c){var d=a.updateQueue;if(null===d)return null;d=d.shared;if(0!==(K&2)){var e=d.pending;null===e?b.next=b:(b.next=e.next,e.next=b);d.pending=b;return Zg(a,c)}e=d.interleaved;null===e?(b.next=b,Xg(d)):(b.next=e.next,e.next=b);d.interleaved=b;return Zg(a,c)}function eh(a,b,c){b=b.updateQueue;if(null!==b&&(b=b.shared,0!==(c&4194240))){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c)}}
function fh(a,b){var c=a.updateQueue,d=a.alternate;if(null!==d&&(d=d.updateQueue,c===d)){var e=null,f=null;c=c.firstBaseUpdate;if(null!==c){do{var g={eventTime:c.eventTime,lane:c.lane,tag:c.tag,payload:c.payload,callback:c.callback,next:null};null===f?e=f=g:f=f.next=g;c=c.next}while(null!==c);null===f?e=f=b:f=f.next=b}else e=f=b;c={baseState:d.baseState,firstBaseUpdate:e,lastBaseUpdate:f,shared:d.shared,effects:d.effects};a.updateQueue=c;return}a=c.lastBaseUpdate;null===a?c.firstBaseUpdate=b:a.next=
b;c.lastBaseUpdate=b}
function gh(a,b,c,d){var e=a.updateQueue;$g=!1;var f=e.firstBaseUpdate,g=e.lastBaseUpdate,h=e.shared.pending;if(null!==h){e.shared.pending=null;var k=h,l=k.next;k.next=null;null===g?f=l:g.next=l;g=k;var m=a.alternate;null!==m&&(m=m.updateQueue,h=m.lastBaseUpdate,h!==g&&(null===h?m.firstBaseUpdate=l:h.next=l,m.lastBaseUpdate=k))}if(null!==f){var q=e.baseState;g=0;m=l=k=null;h=f;do{var r=h.lane,y=h.eventTime;if((d&r)===r){null!==m&&(m=m.next={eventTime:y,lane:0,tag:h.tag,payload:h.payload,callback:h.callback,
next:null});a:{var n=a,t=h;r=b;y=c;switch(t.tag){case 1:n=t.payload;if("function"===typeof n){q=n.call(y,q,r);break a}q=n;break a;case 3:n.flags=n.flags&-65537|128;case 0:n=t.payload;r="function"===typeof n?n.call(y,q,r):n;if(null===r||void 0===r)break a;q=A({},q,r);break a;case 2:$g=!0}}null!==h.callback&&0!==h.lane&&(a.flags|=64,r=e.effects,null===r?e.effects=[h]:r.push(h))}else y={eventTime:y,lane:r,tag:h.tag,payload:h.payload,callback:h.callback,next:null},null===m?(l=m=y,k=q):m=m.next=y,g|=r;
h=h.next;if(null===h)if(h=e.shared.pending,null===h)break;else r=h,h=r.next,r.next=null,e.lastBaseUpdate=r,e.shared.pending=null}while(1);null===m&&(k=q);e.baseState=k;e.firstBaseUpdate=l;e.lastBaseUpdate=m;b=e.shared.interleaved;if(null!==b){e=b;do g|=e.lane,e=e.next;while(e!==b)}else null===f&&(e.shared.lanes=0);hh|=g;a.lanes=g;a.memoizedState=q}}
function ih(a,b,c){a=b.effects;b.effects=null;if(null!==a)for(b=0;b<a.length;b++){var d=a[b],e=d.callback;if(null!==e){d.callback=null;d=c;if("function"!==typeof e)throw Error(p(191,e));e.call(d)}}}var jh=(new aa.Component).refs;function kh(a,b,c,d){b=a.memoizedState;c=c(d,b);c=null===c||void 0===c?b:A({},b,c);a.memoizedState=c;0===a.lanes&&(a.updateQueue.baseState=c)}
var nh={isMounted:function(a){return(a=a._reactInternals)?Vb(a)===a:!1},enqueueSetState:function(a,b,c){a=a._reactInternals;var d=L(),e=lh(a),f=ch(d,e);f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=dh(a,f,e);null!==b&&(mh(b,a,e,d),eh(b,a,e))},enqueueReplaceState:function(a,b,c){a=a._reactInternals;var d=L(),e=lh(a),f=ch(d,e);f.tag=1;f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=dh(a,f,e);null!==b&&(mh(b,a,e,d),eh(b,a,e))},enqueueForceUpdate:function(a,b){a=a._reactInternals;var c=L(),d=
lh(a),e=ch(c,d);e.tag=2;void 0!==b&&null!==b&&(e.callback=b);b=dh(a,e,d);null!==b&&(mh(b,a,d,c),eh(b,a,d))}};function oh(a,b,c,d,e,f,g){a=a.stateNode;return"function"===typeof a.shouldComponentUpdate?a.shouldComponentUpdate(d,f,g):b.prototype&&b.prototype.isPureReactComponent?!Ie(c,d)||!Ie(e,f):!0}
function ph(a,b,c){var d=!1,e=Vf;var f=b.contextType;"object"===typeof f&&null!==f?f=Vg(f):(e=Zf(b)?Xf:H.current,d=b.contextTypes,f=(d=null!==d&&void 0!==d)?Yf(a,e):Vf);b=new b(c,f);a.memoizedState=null!==b.state&&void 0!==b.state?b.state:null;b.updater=nh;a.stateNode=b;b._reactInternals=a;d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=e,a.__reactInternalMemoizedMaskedChildContext=f);return b}
function qh(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&nh.enqueueReplaceState(b,b.state,null)}
function rh(a,b,c,d){var e=a.stateNode;e.props=c;e.state=a.memoizedState;e.refs=jh;ah(a);var f=b.contextType;"object"===typeof f&&null!==f?e.context=Vg(f):(f=Zf(b)?Xf:H.current,e.context=Yf(a,f));e.state=a.memoizedState;f=b.getDerivedStateFromProps;"function"===typeof f&&(kh(a,b,f,c),e.state=a.memoizedState);"function"===typeof b.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||(b=e.state,
"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),b!==e.state&&nh.enqueueReplaceState(e,e.state,null),gh(a,c,e,d),e.state=a.memoizedState);"function"===typeof e.componentDidMount&&(a.flags|=4194308)}
function sh(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;if(c){if(1!==c.tag)throw Error(p(309));var d=c.stateNode}if(!d)throw Error(p(147,a));var e=d,f=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===f)return b.ref;b=function(a){var b=e.refs;b===jh&&(b=e.refs={});null===a?delete b[f]:b[f]=a};b._stringRef=f;return b}if("string"!==typeof a)throw Error(p(284));if(!c._owner)throw Error(p(290,a));}return a}
function th(a,b){a=Object.prototype.toString.call(b);throw Error(p(31,"[object Object]"===a?"object with keys {"+Object.keys(b).join(", ")+"}":a));}function uh(a){var b=a._init;return b(a._payload)}
function vh(a){function b(b,c){if(a){var d=b.deletions;null===d?(b.deletions=[c],b.flags|=16):d.push(c)}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b){a=wh(a,b);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return b.flags|=1048576,c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.flags|=2,c):d;b.flags|=2;return c}function g(b){a&&
null===b.alternate&&(b.flags|=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=xh(c,a.mode,d),b.return=a,b;b=e(b,c);b.return=a;return b}function k(a,b,c,d){var f=c.type;if(f===ya)return m(a,b,c.props.children,d,c.key);if(null!==b&&(b.elementType===f||"object"===typeof f&&null!==f&&f.$$typeof===Ha&&uh(f)===b.type))return d=e(b,c.props),d.ref=sh(a,b,c),d.return=a,d;d=yh(c.type,c.key,c.props,null,a.mode,d);d.ref=sh(a,b,c);d.return=a;return d}function l(a,b,c,d){if(null===b||4!==b.tag||
b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=zh(c,a.mode,d),b.return=a,b;b=e(b,c.children||[]);b.return=a;return b}function m(a,b,c,d,f){if(null===b||7!==b.tag)return b=Ah(c,a.mode,d,f),b.return=a,b;b=e(b,c);b.return=a;return b}function q(a,b,c){if("string"===typeof b&&""!==b||"number"===typeof b)return b=xh(""+b,a.mode,c),b.return=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case va:return c=yh(b.type,b.key,b.props,null,a.mode,c),
c.ref=sh(a,null,b),c.return=a,c;case wa:return b=zh(b,a.mode,c),b.return=a,b;case Ha:var d=b._init;return q(a,d(b._payload),c)}if(eb(b)||Ka(b))return b=Ah(b,a.mode,c,null),b.return=a,b;th(a,b)}return null}function r(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c&&""!==c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case va:return c.key===e?k(a,b,c,d):null;case wa:return c.key===e?l(a,b,c,d):null;case Ha:return e=c._init,r(a,
b,e(c._payload),d)}if(eb(c)||Ka(c))return null!==e?null:m(a,b,c,d,null);th(a,c)}return null}function y(a,b,c,d,e){if("string"===typeof d&&""!==d||"number"===typeof d)return a=a.get(c)||null,h(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case va:return a=a.get(null===d.key?c:d.key)||null,k(b,a,d,e);case wa:return a=a.get(null===d.key?c:d.key)||null,l(b,a,d,e);case Ha:var f=d._init;return y(a,b,c,f(d._payload),e)}if(eb(d)||Ka(d))return a=a.get(c)||null,m(b,a,d,e,null);th(b,d)}return null}
function n(e,g,h,k){for(var l=null,m=null,u=g,w=g=0,x=null;null!==u&&w<h.length;w++){u.index>w?(x=u,u=null):x=u.sibling;var n=r(e,u,h[w],k);if(null===n){null===u&&(u=x);break}a&&u&&null===n.alternate&&b(e,u);g=f(n,g,w);null===m?l=n:m.sibling=n;m=n;u=x}if(w===h.length)return c(e,u),I&&tg(e,w),l;if(null===u){for(;w<h.length;w++)u=q(e,h[w],k),null!==u&&(g=f(u,g,w),null===m?l=u:m.sibling=u,m=u);I&&tg(e,w);return l}for(u=d(e,u);w<h.length;w++)x=y(u,e,w,h[w],k),null!==x&&(a&&null!==x.alternate&&u.delete(null===
x.key?w:x.key),g=f(x,g,w),null===m?l=x:m.sibling=x,m=x);a&&u.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function t(e,g,h,k){var l=Ka(h);if("function"!==typeof l)throw Error(p(150));h=l.call(h);if(null==h)throw Error(p(151));for(var u=l=null,m=g,w=g=0,x=null,n=h.next();null!==m&&!n.done;w++,n=h.next()){m.index>w?(x=m,m=null):x=m.sibling;var t=r(e,m,n.value,k);if(null===t){null===m&&(m=x);break}a&&m&&null===t.alternate&&b(e,m);g=f(t,g,w);null===u?l=t:u.sibling=t;u=t;m=x}if(n.done)return c(e,
m),I&&tg(e,w),l;if(null===m){for(;!n.done;w++,n=h.next())n=q(e,n.value,k),null!==n&&(g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);I&&tg(e,w);return l}for(m=d(e,m);!n.done;w++,n=h.next())n=y(m,e,w,n.value,k),null!==n&&(a&&null!==n.alternate&&m.delete(null===n.key?w:n.key),g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);a&&m.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function J(a,d,f,h){"object"===typeof f&&null!==f&&f.type===ya&&null===f.key&&(f=f.props.children);if("object"===typeof f&&null!==f){switch(f.$$typeof){case va:a:{for(var k=
f.key,l=d;null!==l;){if(l.key===k){k=f.type;if(k===ya){if(7===l.tag){c(a,l.sibling);d=e(l,f.props.children);d.return=a;a=d;break a}}else if(l.elementType===k||"object"===typeof k&&null!==k&&k.$$typeof===Ha&&uh(k)===l.type){c(a,l.sibling);d=e(l,f.props);d.ref=sh(a,l,f);d.return=a;a=d;break a}c(a,l);break}else b(a,l);l=l.sibling}f.type===ya?(d=Ah(f.props.children,a.mode,h,f.key),d.return=a,a=d):(h=yh(f.type,f.key,f.props,null,a.mode,h),h.ref=sh(a,d,f),h.return=a,a=h)}return g(a);case wa:a:{for(l=f.key;null!==
d;){if(d.key===l)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[]);d.return=a;a=d;break a}else{c(a,d);break}else b(a,d);d=d.sibling}d=zh(f,a.mode,h);d.return=a;a=d}return g(a);case Ha:return l=f._init,J(a,d,l(f._payload),h)}if(eb(f))return n(a,d,f,h);if(Ka(f))return t(a,d,f,h);th(a,f)}return"string"===typeof f&&""!==f||"number"===typeof f?(f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f),d.return=a,a=d):
(c(a,d),d=xh(f,a.mode,h),d.return=a,a=d),g(a)):c(a,d)}return J}var Bh=vh(!0),Ch=vh(!1),Dh={},Eh=Uf(Dh),Fh=Uf(Dh),Gh=Uf(Dh);function Hh(a){if(a===Dh)throw Error(p(174));return a}function Ih(a,b){G(Gh,b);G(Fh,a);G(Eh,Dh);a=b.nodeType;switch(a){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:lb(null,"");break;default:a=8===a?b.parentNode:b,b=a.namespaceURI||null,a=a.tagName,b=lb(b,a)}E(Eh);G(Eh,b)}function Jh(){E(Eh);E(Fh);E(Gh)}
function Kh(a){Hh(Gh.current);var b=Hh(Eh.current);var c=lb(b,a.type);b!==c&&(G(Fh,a),G(Eh,c))}function Lh(a){Fh.current===a&&(E(Eh),E(Fh))}var M=Uf(0);
function Mh(a){for(var b=a;null!==b;){if(13===b.tag){var c=b.memoizedState;if(null!==c&&(c=c.dehydrated,null===c||"$?"===c.data||"$!"===c.data))return b}else if(19===b.tag&&void 0!==b.memoizedProps.revealOrder){if(0!==(b.flags&128))return b}else if(null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return null;b=b.return}b.sibling.return=b.return;b=b.sibling}return null}var Nh=[];
function Oh(){for(var a=0;a<Nh.length;a++)Nh[a]._workInProgressVersionPrimary=null;Nh.length=0}var Ph=ua.ReactCurrentDispatcher,Qh=ua.ReactCurrentBatchConfig,Rh=0,N=null,O=null,P=null,Sh=!1,Th=!1,Uh=0,Vh=0;function Q(){throw Error(p(321));}function Wh(a,b){if(null===b)return!1;for(var c=0;c<b.length&&c<a.length;c++)if(!He(a[c],b[c]))return!1;return!0}
function Xh(a,b,c,d,e,f){Rh=f;N=b;b.memoizedState=null;b.updateQueue=null;b.lanes=0;Ph.current=null===a||null===a.memoizedState?Yh:Zh;a=c(d,e);if(Th){f=0;do{Th=!1;Uh=0;if(25<=f)throw Error(p(301));f+=1;P=O=null;b.updateQueue=null;Ph.current=$h;a=c(d,e)}while(Th)}Ph.current=ai;b=null!==O&&null!==O.next;Rh=0;P=O=N=null;Sh=!1;if(b)throw Error(p(300));return a}function bi(){var a=0!==Uh;Uh=0;return a}
function ci(){var a={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};null===P?N.memoizedState=P=a:P=P.next=a;return P}function di(){if(null===O){var a=N.alternate;a=null!==a?a.memoizedState:null}else a=O.next;var b=null===P?N.memoizedState:P.next;if(null!==b)P=b,O=a;else{if(null===a)throw Error(p(310));O=a;a={memoizedState:O.memoizedState,baseState:O.baseState,baseQueue:O.baseQueue,queue:O.queue,next:null};null===P?N.memoizedState=P=a:P=P.next=a}return P}
function ei(a,b){return"function"===typeof b?b(a):b}
function fi(a){var b=di(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=O,e=d.baseQueue,f=c.pending;if(null!==f){if(null!==e){var g=e.next;e.next=f.next;f.next=g}d.baseQueue=e=f;c.pending=null}if(null!==e){f=e.next;d=d.baseState;var h=g=null,k=null,l=f;do{var m=l.lane;if((Rh&m)===m)null!==k&&(k=k.next={lane:0,action:l.action,hasEagerState:l.hasEagerState,eagerState:l.eagerState,next:null}),d=l.hasEagerState?l.eagerState:a(d,l.action);else{var q={lane:m,action:l.action,hasEagerState:l.hasEagerState,
eagerState:l.eagerState,next:null};null===k?(h=k=q,g=d):k=k.next=q;N.lanes|=m;hh|=m}l=l.next}while(null!==l&&l!==f);null===k?g=d:k.next=h;He(d,b.memoizedState)||(Ug=!0);b.memoizedState=d;b.baseState=g;b.baseQueue=k;c.lastRenderedState=d}a=c.interleaved;if(null!==a){e=a;do f=e.lane,N.lanes|=f,hh|=f,e=e.next;while(e!==a)}else null===e&&(c.lanes=0);return[b.memoizedState,c.dispatch]}
function gi(a){var b=di(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=c.dispatch,e=c.pending,f=b.memoizedState;if(null!==e){c.pending=null;var g=e=e.next;do f=a(f,g.action),g=g.next;while(g!==e);He(f,b.memoizedState)||(Ug=!0);b.memoizedState=f;null===b.baseQueue&&(b.baseState=f);c.lastRenderedState=f}return[f,d]}function hi(){}
function ii(a,b){var c=N,d=di(),e=b(),f=!He(d.memoizedState,e);f&&(d.memoizedState=e,Ug=!0);d=d.queue;ji(ki.bind(null,c,d,a),[a]);if(d.getSnapshot!==b||f||null!==P&&P.memoizedState.tag&1){c.flags|=2048;li(9,mi.bind(null,c,d,e,b),void 0,null);if(null===R)throw Error(p(349));0!==(Rh&30)||ni(c,b,e)}return e}function ni(a,b,c){a.flags|=16384;a={getSnapshot:b,value:c};b=N.updateQueue;null===b?(b={lastEffect:null,stores:null},N.updateQueue=b,b.stores=[a]):(c=b.stores,null===c?b.stores=[a]:c.push(a))}
function mi(a,b,c,d){b.value=c;b.getSnapshot=d;oi(b)&&pi(a)}function ki(a,b,c){return c(function(){oi(b)&&pi(a)})}function oi(a){var b=a.getSnapshot;a=a.value;try{var c=b();return!He(a,c)}catch(d){return!0}}function pi(a){var b=Zg(a,1);null!==b&&mh(b,a,1,-1)}
function qi(a){var b=ci();"function"===typeof a&&(a=a());b.memoizedState=b.baseState=a;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ei,lastRenderedState:a};b.queue=a;a=a.dispatch=ri.bind(null,N,a);return[b.memoizedState,a]}
function li(a,b,c,d){a={tag:a,create:b,destroy:c,deps:d,next:null};b=N.updateQueue;null===b?(b={lastEffect:null,stores:null},N.updateQueue=b,b.lastEffect=a.next=a):(c=b.lastEffect,null===c?b.lastEffect=a.next=a:(d=c.next,c.next=a,a.next=d,b.lastEffect=a));return a}function si(){return di().memoizedState}function ti(a,b,c,d){var e=ci();N.flags|=a;e.memoizedState=li(1|b,c,void 0,void 0===d?null:d)}
function ui(a,b,c,d){var e=di();d=void 0===d?null:d;var f=void 0;if(null!==O){var g=O.memoizedState;f=g.destroy;if(null!==d&&Wh(d,g.deps)){e.memoizedState=li(b,c,f,d);return}}N.flags|=a;e.memoizedState=li(1|b,c,f,d)}function vi(a,b){return ti(8390656,8,a,b)}function ji(a,b){return ui(2048,8,a,b)}function wi(a,b){return ui(4,2,a,b)}function xi(a,b){return ui(4,4,a,b)}
function yi(a,b){if("function"===typeof b)return a=a(),b(a),function(){b(null)};if(null!==b&&void 0!==b)return a=a(),b.current=a,function(){b.current=null}}function zi(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ui(4,4,yi.bind(null,b,a),c)}function Ai(){}function Bi(a,b){var c=di();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Wh(b,d[1]))return d[0];c.memoizedState=[a,b];return a}
function Ci(a,b){var c=di();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Wh(b,d[1]))return d[0];a=a();c.memoizedState=[a,b];return a}function Di(a,b,c){if(0===(Rh&21))return a.baseState&&(a.baseState=!1,Ug=!0),a.memoizedState=c;He(c,b)||(c=yc(),N.lanes|=c,hh|=c,a.baseState=!0);return b}function Ei(a,b){var c=C;C=0!==c&&4>c?c:4;a(!0);var d=Qh.transition;Qh.transition={};try{a(!1),b()}finally{C=c,Qh.transition=d}}function Fi(){return di().memoizedState}
function Gi(a,b,c){var d=lh(a);c={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(Hi(a))Ii(b,c);else if(c=Yg(a,b,c,d),null!==c){var e=L();mh(c,a,d,e);Ji(c,b,d)}}
function ri(a,b,c){var d=lh(a),e={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(Hi(a))Ii(b,e);else{var f=a.alternate;if(0===a.lanes&&(null===f||0===f.lanes)&&(f=b.lastRenderedReducer,null!==f))try{var g=b.lastRenderedState,h=f(g,c);e.hasEagerState=!0;e.eagerState=h;if(He(h,g)){var k=b.interleaved;null===k?(e.next=e,Xg(b)):(e.next=k.next,k.next=e);b.interleaved=e;return}}catch(l){}finally{}c=Yg(a,b,e,d);null!==c&&(e=L(),mh(c,a,d,e),Ji(c,b,d))}}
function Hi(a){var b=a.alternate;return a===N||null!==b&&b===N}function Ii(a,b){Th=Sh=!0;var c=a.pending;null===c?b.next=b:(b.next=c.next,c.next=b);a.pending=b}function Ji(a,b,c){if(0!==(c&4194240)){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c)}}
var ai={readContext:Vg,useCallback:Q,useContext:Q,useEffect:Q,useImperativeHandle:Q,useInsertionEffect:Q,useLayoutEffect:Q,useMemo:Q,useReducer:Q,useRef:Q,useState:Q,useDebugValue:Q,useDeferredValue:Q,useTransition:Q,useMutableSource:Q,useSyncExternalStore:Q,useId:Q,unstable_isNewReconciler:!1},Yh={readContext:Vg,useCallback:function(a,b){ci().memoizedState=[a,void 0===b?null:b];return a},useContext:Vg,useEffect:vi,useImperativeHandle:function(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ti(4194308,
4,yi.bind(null,b,a),c)},useLayoutEffect:function(a,b){return ti(4194308,4,a,b)},useInsertionEffect:function(a,b){return ti(4,2,a,b)},useMemo:function(a,b){var c=ci();b=void 0===b?null:b;a=a();c.memoizedState=[a,b];return a},useReducer:function(a,b,c){var d=ci();b=void 0!==c?c(b):b;d.memoizedState=d.baseState=b;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:a,lastRenderedState:b};d.queue=a;a=a.dispatch=Gi.bind(null,N,a);return[d.memoizedState,a]},useRef:function(a){var b=
ci();a={current:a};return b.memoizedState=a},useState:qi,useDebugValue:Ai,useDeferredValue:function(a){return ci().memoizedState=a},useTransition:function(){var a=qi(!1),b=a[0];a=Ei.bind(null,a[1]);ci().memoizedState=a;return[b,a]},useMutableSource:function(){},useSyncExternalStore:function(a,b,c){var d=N,e=ci();if(I){if(void 0===c)throw Error(p(407));c=c()}else{c=b();if(null===R)throw Error(p(349));0!==(Rh&30)||ni(d,b,c)}e.memoizedState=c;var f={value:c,getSnapshot:b};e.queue=f;vi(ki.bind(null,d,
f,a),[a]);d.flags|=2048;li(9,mi.bind(null,d,f,c,b),void 0,null);return c},useId:function(){var a=ci(),b=R.identifierPrefix;if(I){var c=sg;var d=rg;c=(d&~(1<<32-oc(d)-1)).toString(32)+c;b=":"+b+"R"+c;c=Uh++;0<c&&(b+="H"+c.toString(32));b+=":"}else c=Vh++,b=":"+b+"r"+c.toString(32)+":";return a.memoizedState=b},unstable_isNewReconciler:!1},Zh={readContext:Vg,useCallback:Bi,useContext:Vg,useEffect:ji,useImperativeHandle:zi,useInsertionEffect:wi,useLayoutEffect:xi,useMemo:Ci,useReducer:fi,useRef:si,useState:function(){return fi(ei)},
useDebugValue:Ai,useDeferredValue:function(a){var b=di();return Di(b,O.memoizedState,a)},useTransition:function(){var a=fi(ei)[0],b=di().memoizedState;return[a,b]},useMutableSource:hi,useSyncExternalStore:ii,useId:Fi,unstable_isNewReconciler:!1},$h={readContext:Vg,useCallback:Bi,useContext:Vg,useEffect:ji,useImperativeHandle:zi,useInsertionEffect:wi,useLayoutEffect:xi,useMemo:Ci,useReducer:gi,useRef:si,useState:function(){return gi(ei)},useDebugValue:Ai,useDeferredValue:function(a){var b=di();return null===
O?b.memoizedState=a:Di(b,O.memoizedState,a)},useTransition:function(){var a=gi(ei)[0],b=di().memoizedState;return[a,b]},useMutableSource:hi,useSyncExternalStore:ii,useId:Fi,unstable_isNewReconciler:!1};function Ki(a,b){try{var c="",d=b;do c+=Pa(d),d=d.return;while(d);var e=c}catch(f){e="\nError generating stack: "+f.message+"\n"+f.stack}return{value:a,source:b,stack:e,digest:null}}function Li(a,b,c){return{value:a,source:null,stack:null!=c?c:null,digest:null!=b?b:null}}
function Mi(a,b){try{console.error(b.value)}catch(c){setTimeout(function(){throw c;})}}var Ni="function"===typeof WeakMap?WeakMap:Map;function Oi(a,b,c){c=ch(-1,c);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){Pi||(Pi=!0,Qi=d);Mi(a,b)};return c}
function Ri(a,b,c){c=ch(-1,c);c.tag=3;var d=a.type.getDerivedStateFromError;if("function"===typeof d){var e=b.value;c.payload=function(){return d(e)};c.callback=function(){Mi(a,b)}}var f=a.stateNode;null!==f&&"function"===typeof f.componentDidCatch&&(c.callback=function(){Mi(a,b);"function"!==typeof d&&(null===Si?Si=new Set([this]):Si.add(this));var c=b.stack;this.componentDidCatch(b.value,{componentStack:null!==c?c:""})});return c}
function Ti(a,b,c){var d=a.pingCache;if(null===d){d=a.pingCache=new Ni;var e=new Set;d.set(b,e)}else e=d.get(b),void 0===e&&(e=new Set,d.set(b,e));e.has(c)||(e.add(c),a=Ui.bind(null,a,b,c),b.then(a,a))}function Vi(a){do{var b;if(b=13===a.tag)b=a.memoizedState,b=null!==b?null!==b.dehydrated?!0:!1:!0;if(b)return a;a=a.return}while(null!==a);return null}
function Wi(a,b,c,d,e){if(0===(a.mode&1))return a===b?a.flags|=65536:(a.flags|=128,c.flags|=131072,c.flags&=-52805,1===c.tag&&(null===c.alternate?c.tag=17:(b=ch(-1,1),b.tag=2,dh(c,b,1))),c.lanes|=1),a;a.flags|=65536;a.lanes=e;return a}var Xi=ua.ReactCurrentOwner,Ug=!1;function Yi(a,b,c,d){b.child=null===a?Ch(b,null,c,d):Bh(b,a.child,c,d)}
function Zi(a,b,c,d,e){c=c.render;var f=b.ref;Tg(b,e);d=Xh(a,b,c,d,f,e);c=bi();if(null!==a&&!Ug)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,$i(a,b,e);I&&c&&vg(b);b.flags|=1;Yi(a,b,d,e);return b.child}
function aj(a,b,c,d,e){if(null===a){var f=c.type;if("function"===typeof f&&!bj(f)&&void 0===f.defaultProps&&null===c.compare&&void 0===c.defaultProps)return b.tag=15,b.type=f,cj(a,b,f,d,e);a=yh(c.type,null,d,b,b.mode,e);a.ref=b.ref;a.return=b;return b.child=a}f=a.child;if(0===(a.lanes&e)){var g=f.memoizedProps;c=c.compare;c=null!==c?c:Ie;if(c(g,d)&&a.ref===b.ref)return $i(a,b,e)}b.flags|=1;a=wh(f,d);a.ref=b.ref;a.return=b;return b.child=a}
function cj(a,b,c,d,e){if(null!==a){var f=a.memoizedProps;if(Ie(f,d)&&a.ref===b.ref)if(Ug=!1,b.pendingProps=d=f,0!==(a.lanes&e))0!==(a.flags&131072)&&(Ug=!0);else return b.lanes=a.lanes,$i(a,b,e)}return dj(a,b,c,d,e)}
function ej(a,b,c){var d=b.pendingProps,e=d.children,f=null!==a?a.memoizedState:null;if("hidden"===d.mode)if(0===(b.mode&1))b.memoizedState={baseLanes:0,cachePool:null,transitions:null},G(fj,gj),gj|=c;else{if(0===(c&1073741824))return a=null!==f?f.baseLanes|c:c,b.lanes=b.childLanes=1073741824,b.memoizedState={baseLanes:a,cachePool:null,transitions:null},b.updateQueue=null,G(fj,gj),gj|=a,null;b.memoizedState={baseLanes:0,cachePool:null,transitions:null};d=null!==f?f.baseLanes:c;G(fj,gj);gj|=d}else null!==
f?(d=f.baseLanes|c,b.memoizedState=null):d=c,G(fj,gj),gj|=d;Yi(a,b,e,c);return b.child}function hj(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.flags|=512,b.flags|=2097152}function dj(a,b,c,d,e){var f=Zf(c)?Xf:H.current;f=Yf(b,f);Tg(b,e);c=Xh(a,b,c,d,f,e);d=bi();if(null!==a&&!Ug)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,$i(a,b,e);I&&d&&vg(b);b.flags|=1;Yi(a,b,c,e);return b.child}
function ij(a,b,c,d,e){if(Zf(c)){var f=!0;cg(b)}else f=!1;Tg(b,e);if(null===b.stateNode)jj(a,b),ph(b,c,d),rh(b,c,d,e),d=!0;else if(null===a){var g=b.stateNode,h=b.memoizedProps;g.props=h;var k=g.context,l=c.contextType;"object"===typeof l&&null!==l?l=Vg(l):(l=Zf(c)?Xf:H.current,l=Yf(b,l));var m=c.getDerivedStateFromProps,q="function"===typeof m||"function"===typeof g.getSnapshotBeforeUpdate;q||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||
(h!==d||k!==l)&&qh(b,g,d,l);$g=!1;var r=b.memoizedState;g.state=r;gh(b,d,g,e);k=b.memoizedState;h!==d||r!==k||Wf.current||$g?("function"===typeof m&&(kh(b,c,m,d),k=b.memoizedState),(h=$g||oh(b,c,h,d,r,k,l))?(q||"function"!==typeof g.UNSAFE_componentWillMount&&"function"!==typeof g.componentWillMount||("function"===typeof g.componentWillMount&&g.componentWillMount(),"function"===typeof g.UNSAFE_componentWillMount&&g.UNSAFE_componentWillMount()),"function"===typeof g.componentDidMount&&(b.flags|=4194308)):
("function"===typeof g.componentDidMount&&(b.flags|=4194308),b.memoizedProps=d,b.memoizedState=k),g.props=d,g.state=k,g.context=l,d=h):("function"===typeof g.componentDidMount&&(b.flags|=4194308),d=!1)}else{g=b.stateNode;bh(a,b);h=b.memoizedProps;l=b.type===b.elementType?h:Lg(b.type,h);g.props=l;q=b.pendingProps;r=g.context;k=c.contextType;"object"===typeof k&&null!==k?k=Vg(k):(k=Zf(c)?Xf:H.current,k=Yf(b,k));var y=c.getDerivedStateFromProps;(m="function"===typeof y||"function"===typeof g.getSnapshotBeforeUpdate)||
"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==q||r!==k)&&qh(b,g,d,k);$g=!1;r=b.memoizedState;g.state=r;gh(b,d,g,e);var n=b.memoizedState;h!==q||r!==n||Wf.current||$g?("function"===typeof y&&(kh(b,c,y,d),n=b.memoizedState),(l=$g||oh(b,c,l,d,r,n,k)||!1)?(m||"function"!==typeof g.UNSAFE_componentWillUpdate&&"function"!==typeof g.componentWillUpdate||("function"===typeof g.componentWillUpdate&&g.componentWillUpdate(d,n,k),"function"===typeof g.UNSAFE_componentWillUpdate&&
g.UNSAFE_componentWillUpdate(d,n,k)),"function"===typeof g.componentDidUpdate&&(b.flags|=4),"function"===typeof g.getSnapshotBeforeUpdate&&(b.flags|=1024)):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),b.memoizedProps=d,b.memoizedState=n),g.props=d,g.state=n,g.context=k,d=l):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===
a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),d=!1)}return kj(a,b,c,d,f,e)}
function kj(a,b,c,d,e,f){hj(a,b);var g=0!==(b.flags&128);if(!d&&!g)return e&&dg(b,c,!1),$i(a,b,f);d=b.stateNode;Xi.current=b;var h=g&&"function"!==typeof c.getDerivedStateFromError?null:d.render();b.flags|=1;null!==a&&g?(b.child=Bh(b,a.child,null,f),b.child=Bh(b,null,h,f)):Yi(a,b,h,f);b.memoizedState=d.state;e&&dg(b,c,!0);return b.child}function lj(a){var b=a.stateNode;b.pendingContext?ag(a,b.pendingContext,b.pendingContext!==b.context):b.context&&ag(a,b.context,!1);Ih(a,b.containerInfo)}
function mj(a,b,c,d,e){Ig();Jg(e);b.flags|=256;Yi(a,b,c,d);return b.child}var nj={dehydrated:null,treeContext:null,retryLane:0};function oj(a){return{baseLanes:a,cachePool:null,transitions:null}}
function pj(a,b,c){var d=b.pendingProps,e=M.current,f=!1,g=0!==(b.flags&128),h;(h=g)||(h=null!==a&&null===a.memoizedState?!1:0!==(e&2));if(h)f=!0,b.flags&=-129;else if(null===a||null!==a.memoizedState)e|=1;G(M,e&1);if(null===a){Eg(b);a=b.memoizedState;if(null!==a&&(a=a.dehydrated,null!==a))return 0===(b.mode&1)?b.lanes=1:"$!"===a.data?b.lanes=8:b.lanes=1073741824,null;g=d.children;a=d.fallback;return f?(d=b.mode,f=b.child,g={mode:"hidden",children:g},0===(d&1)&&null!==f?(f.childLanes=0,f.pendingProps=
g):f=qj(g,d,0,null),a=Ah(a,d,c,null),f.return=b,a.return=b,f.sibling=a,b.child=f,b.child.memoizedState=oj(c),b.memoizedState=nj,a):rj(b,g)}e=a.memoizedState;if(null!==e&&(h=e.dehydrated,null!==h))return sj(a,b,g,d,h,e,c);if(f){f=d.fallback;g=b.mode;e=a.child;h=e.sibling;var k={mode:"hidden",children:d.children};0===(g&1)&&b.child!==e?(d=b.child,d.childLanes=0,d.pendingProps=k,b.deletions=null):(d=wh(e,k),d.subtreeFlags=e.subtreeFlags&14680064);null!==h?f=wh(h,f):(f=Ah(f,g,c,null),f.flags|=2);f.return=
b;d.return=b;d.sibling=f;b.child=d;d=f;f=b.child;g=a.child.memoizedState;g=null===g?oj(c):{baseLanes:g.baseLanes|c,cachePool:null,transitions:g.transitions};f.memoizedState=g;f.childLanes=a.childLanes&~c;b.memoizedState=nj;return d}f=a.child;a=f.sibling;d=wh(f,{mode:"visible",children:d.children});0===(b.mode&1)&&(d.lanes=c);d.return=b;d.sibling=null;null!==a&&(c=b.deletions,null===c?(b.deletions=[a],b.flags|=16):c.push(a));b.child=d;b.memoizedState=null;return d}
function rj(a,b){b=qj({mode:"visible",children:b},a.mode,0,null);b.return=a;return a.child=b}function tj(a,b,c,d){null!==d&&Jg(d);Bh(b,a.child,null,c);a=rj(b,b.pendingProps.children);a.flags|=2;b.memoizedState=null;return a}
function sj(a,b,c,d,e,f,g){if(c){if(b.flags&256)return b.flags&=-257,d=Li(Error(p(422))),tj(a,b,g,d);if(null!==b.memoizedState)return b.child=a.child,b.flags|=128,null;f=d.fallback;e=b.mode;d=qj({mode:"visible",children:d.children},e,0,null);f=Ah(f,e,g,null);f.flags|=2;d.return=b;f.return=b;d.sibling=f;b.child=d;0!==(b.mode&1)&&Bh(b,a.child,null,g);b.child.memoizedState=oj(g);b.memoizedState=nj;return f}if(0===(b.mode&1))return tj(a,b,g,null);if("$!"===e.data){d=e.nextSibling&&e.nextSibling.dataset;
if(d)var h=d.dgst;d=h;f=Error(p(419));d=Li(f,d,void 0);return tj(a,b,g,d)}h=0!==(g&a.childLanes);if(Ug||h){d=R;if(null!==d){switch(g&-g){case 4:e=2;break;case 16:e=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:e=32;break;case 536870912:e=268435456;break;default:e=0}e=0!==(e&(d.suspendedLanes|g))?0:e;
0!==e&&e!==f.retryLane&&(f.retryLane=e,Zg(a,e),mh(d,a,e,-1))}uj();d=Li(Error(p(421)));return tj(a,b,g,d)}if("$?"===e.data)return b.flags|=128,b.child=a.child,b=vj.bind(null,a),e._reactRetry=b,null;a=f.treeContext;yg=Lf(e.nextSibling);xg=b;I=!0;zg=null;null!==a&&(og[pg++]=rg,og[pg++]=sg,og[pg++]=qg,rg=a.id,sg=a.overflow,qg=b);b=rj(b,d.children);b.flags|=4096;return b}function wj(a,b,c){a.lanes|=b;var d=a.alternate;null!==d&&(d.lanes|=b);Sg(a.return,b,c)}
function xj(a,b,c,d,e){var f=a.memoizedState;null===f?a.memoizedState={isBackwards:b,rendering:null,renderingStartTime:0,last:d,tail:c,tailMode:e}:(f.isBackwards=b,f.rendering=null,f.renderingStartTime=0,f.last=d,f.tail=c,f.tailMode=e)}
function yj(a,b,c){var d=b.pendingProps,e=d.revealOrder,f=d.tail;Yi(a,b,d.children,c);d=M.current;if(0!==(d&2))d=d&1|2,b.flags|=128;else{if(null!==a&&0!==(a.flags&128))a:for(a=b.child;null!==a;){if(13===a.tag)null!==a.memoizedState&&wj(a,c,b);else if(19===a.tag)wj(a,c,b);else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===b)break a;for(;null===a.sibling;){if(null===a.return||a.return===b)break a;a=a.return}a.sibling.return=a.return;a=a.sibling}d&=1}G(M,d);if(0===(b.mode&1))b.memoizedState=
null;else switch(e){case "forwards":c=b.child;for(e=null;null!==c;)a=c.alternate,null!==a&&null===Mh(a)&&(e=c),c=c.sibling;c=e;null===c?(e=b.child,b.child=null):(e=c.sibling,c.sibling=null);xj(b,!1,e,c,f);break;case "backwards":c=null;e=b.child;for(b.child=null;null!==e;){a=e.alternate;if(null!==a&&null===Mh(a)){b.child=e;break}a=e.sibling;e.sibling=c;c=e;e=a}xj(b,!0,c,null,f);break;case "together":xj(b,!1,null,null,void 0);break;default:b.memoizedState=null}return b.child}
function jj(a,b){0===(b.mode&1)&&null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2)}function $i(a,b,c){null!==a&&(b.dependencies=a.dependencies);hh|=b.lanes;if(0===(c&b.childLanes))return null;if(null!==a&&b.child!==a.child)throw Error(p(153));if(null!==b.child){a=b.child;c=wh(a,a.pendingProps);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=wh(a,a.pendingProps),c.return=b;c.sibling=null}return b.child}
function zj(a,b,c){switch(b.tag){case 3:lj(b);Ig();break;case 5:Kh(b);break;case 1:Zf(b.type)&&cg(b);break;case 4:Ih(b,b.stateNode.containerInfo);break;case 10:var d=b.type._context,e=b.memoizedProps.value;G(Mg,d._currentValue);d._currentValue=e;break;case 13:d=b.memoizedState;if(null!==d){if(null!==d.dehydrated)return G(M,M.current&1),b.flags|=128,null;if(0!==(c&b.child.childLanes))return pj(a,b,c);G(M,M.current&1);a=$i(a,b,c);return null!==a?a.sibling:null}G(M,M.current&1);break;case 19:d=0!==(c&
b.childLanes);if(0!==(a.flags&128)){if(d)return yj(a,b,c);b.flags|=128}e=b.memoizedState;null!==e&&(e.rendering=null,e.tail=null,e.lastEffect=null);G(M,M.current);if(d)break;else return null;case 22:case 23:return b.lanes=0,ej(a,b,c)}return $i(a,b,c)}var Aj,Bj,Cj,Dj;
Aj=function(a,b){for(var c=b.child;null!==c;){if(5===c.tag||6===c.tag)a.appendChild(c.stateNode);else if(4!==c.tag&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return}c.sibling.return=c.return;c=c.sibling}};Bj=function(){};
Cj=function(a,b,c,d){var e=a.memoizedProps;if(e!==d){a=b.stateNode;Hh(Eh.current);var f=null;switch(c){case "input":e=Ya(a,e);d=Ya(a,d);f=[];break;case "select":e=A({},e,{value:void 0});d=A({},d,{value:void 0});f=[];break;case "textarea":e=gb(a,e);d=gb(a,d);f=[];break;default:"function"!==typeof e.onClick&&"function"===typeof d.onClick&&(a.onclick=Bf)}ub(c,d);var g;c=null;for(l in e)if(!d.hasOwnProperty(l)&&e.hasOwnProperty(l)&&null!=e[l])if("style"===l){var h=e[l];for(g in h)h.hasOwnProperty(g)&&
(c||(c={}),c[g]="")}else"dangerouslySetInnerHTML"!==l&&"children"!==l&&"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&"autoFocus"!==l&&(ea.hasOwnProperty(l)?f||(f=[]):(f=f||[]).push(l,null));for(l in d){var k=d[l];h=null!=e?e[l]:void 0;if(d.hasOwnProperty(l)&&k!==h&&(null!=k||null!=h))if("style"===l)if(h){for(g in h)!h.hasOwnProperty(g)||k&&k.hasOwnProperty(g)||(c||(c={}),c[g]="");for(g in k)k.hasOwnProperty(g)&&h[g]!==k[g]&&(c||(c={}),c[g]=k[g])}else c||(f||(f=[]),f.push(l,
c)),c=k;else"dangerouslySetInnerHTML"===l?(k=k?k.__html:void 0,h=h?h.__html:void 0,null!=k&&h!==k&&(f=f||[]).push(l,k)):"children"===l?"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(l,""+k):"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&(ea.hasOwnProperty(l)?(null!=k&&"onScroll"===l&&D("scroll",a),f||h===k||(f=[])):(f=f||[]).push(l,k))}c&&(f=f||[]).push("style",c);var l=f;if(b.updateQueue=l)b.flags|=4}};Dj=function(a,b,c,d){c!==d&&(b.flags|=4)};
function Ej(a,b){if(!I)switch(a.tailMode){case "hidden":b=a.tail;for(var c=null;null!==b;)null!==b.alternate&&(c=b),b=b.sibling;null===c?a.tail=null:c.sibling=null;break;case "collapsed":c=a.tail;for(var d=null;null!==c;)null!==c.alternate&&(d=c),c=c.sibling;null===d?b||null===a.tail?a.tail=null:a.tail.sibling=null:d.sibling=null}}
function S(a){var b=null!==a.alternate&&a.alternate.child===a.child,c=0,d=0;if(b)for(var e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags&14680064,d|=e.flags&14680064,e.return=a,e=e.sibling;else for(e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags,d|=e.flags,e.return=a,e=e.sibling;a.subtreeFlags|=d;a.childLanes=c;return b}
function Fj(a,b,c){var d=b.pendingProps;wg(b);switch(b.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return S(b),null;case 1:return Zf(b.type)&&$f(),S(b),null;case 3:d=b.stateNode;Jh();E(Wf);E(H);Oh();d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)Gg(b)?b.flags|=4:null===a||a.memoizedState.isDehydrated&&0===(b.flags&256)||(b.flags|=1024,null!==zg&&(Gj(zg),zg=null));Bj(a,b);S(b);return null;case 5:Lh(b);var e=Hh(Gh.current);
c=b.type;if(null!==a&&null!=b.stateNode)Cj(a,b,c,d,e),a.ref!==b.ref&&(b.flags|=512,b.flags|=2097152);else{if(!d){if(null===b.stateNode)throw Error(p(166));S(b);return null}a=Hh(Eh.current);if(Gg(b)){d=b.stateNode;c=b.type;var f=b.memoizedProps;d[Of]=b;d[Pf]=f;a=0!==(b.mode&1);switch(c){case "dialog":D("cancel",d);D("close",d);break;case "iframe":case "object":case "embed":D("load",d);break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],d);break;case "source":D("error",d);break;case "img":case "image":case "link":D("error",
d);D("load",d);break;case "details":D("toggle",d);break;case "input":Za(d,f);D("invalid",d);break;case "select":d._wrapperState={wasMultiple:!!f.multiple};D("invalid",d);break;case "textarea":hb(d,f),D("invalid",d)}ub(c,f);e=null;for(var g in f)if(f.hasOwnProperty(g)){var h=f[g];"children"===g?"string"===typeof h?d.textContent!==h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,h,a),e=["children",h]):"number"===typeof h&&d.textContent!==""+h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,
h,a),e=["children",""+h]):ea.hasOwnProperty(g)&&null!=h&&"onScroll"===g&&D("scroll",d)}switch(c){case "input":Va(d);db(d,f,!0);break;case "textarea":Va(d);jb(d);break;case "select":case "option":break;default:"function"===typeof f.onClick&&(d.onclick=Bf)}d=e;b.updateQueue=d;null!==d&&(b.flags|=4)}else{g=9===e.nodeType?e:e.ownerDocument;"http://www.w3.org/1999/xhtml"===a&&(a=kb(c));"http://www.w3.org/1999/xhtml"===a?"script"===c?(a=g.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):
"string"===typeof d.is?a=g.createElement(c,{is:d.is}):(a=g.createElement(c),"select"===c&&(g=a,d.multiple?g.multiple=!0:d.size&&(g.size=d.size))):a=g.createElementNS(a,c);a[Of]=b;a[Pf]=d;Aj(a,b,!1,!1);b.stateNode=a;a:{g=vb(c,d);switch(c){case "dialog":D("cancel",a);D("close",a);e=d;break;case "iframe":case "object":case "embed":D("load",a);e=d;break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],a);e=d;break;case "source":D("error",a);e=d;break;case "img":case "image":case "link":D("error",
a);D("load",a);e=d;break;case "details":D("toggle",a);e=d;break;case "input":Za(a,d);e=Ya(a,d);D("invalid",a);break;case "option":e=d;break;case "select":a._wrapperState={wasMultiple:!!d.multiple};e=A({},d,{value:void 0});D("invalid",a);break;case "textarea":hb(a,d);e=gb(a,d);D("invalid",a);break;default:e=d}ub(c,e);h=e;for(f in h)if(h.hasOwnProperty(f)){var k=h[f];"style"===f?sb(a,k):"dangerouslySetInnerHTML"===f?(k=k?k.__html:void 0,null!=k&&nb(a,k)):"children"===f?"string"===typeof k?("textarea"!==
c||""!==k)&&ob(a,k):"number"===typeof k&&ob(a,""+k):"suppressContentEditableWarning"!==f&&"suppressHydrationWarning"!==f&&"autoFocus"!==f&&(ea.hasOwnProperty(f)?null!=k&&"onScroll"===f&&D("scroll",a):null!=k&&ta(a,f,k,g))}switch(c){case "input":Va(a);db(a,d,!1);break;case "textarea":Va(a);jb(a);break;case "option":null!=d.value&&a.setAttribute("value",""+Sa(d.value));break;case "select":a.multiple=!!d.multiple;f=d.value;null!=f?fb(a,!!d.multiple,f,!1):null!=d.defaultValue&&fb(a,!!d.multiple,d.defaultValue,
!0);break;default:"function"===typeof e.onClick&&(a.onclick=Bf)}switch(c){case "button":case "input":case "select":case "textarea":d=!!d.autoFocus;break a;case "img":d=!0;break a;default:d=!1}}d&&(b.flags|=4)}null!==b.ref&&(b.flags|=512,b.flags|=2097152)}S(b);return null;case 6:if(a&&null!=b.stateNode)Dj(a,b,a.memoizedProps,d);else{if("string"!==typeof d&&null===b.stateNode)throw Error(p(166));c=Hh(Gh.current);Hh(Eh.current);if(Gg(b)){d=b.stateNode;c=b.memoizedProps;d[Of]=b;if(f=d.nodeValue!==c)if(a=
xg,null!==a)switch(a.tag){case 3:Af(d.nodeValue,c,0!==(a.mode&1));break;case 5:!0!==a.memoizedProps.suppressHydrationWarning&&Af(d.nodeValue,c,0!==(a.mode&1))}f&&(b.flags|=4)}else d=(9===c.nodeType?c:c.ownerDocument).createTextNode(d),d[Of]=b,b.stateNode=d}S(b);return null;case 13:E(M);d=b.memoizedState;if(null===a||null!==a.memoizedState&&null!==a.memoizedState.dehydrated){if(I&&null!==yg&&0!==(b.mode&1)&&0===(b.flags&128))Hg(),Ig(),b.flags|=98560,f=!1;else if(f=Gg(b),null!==d&&null!==d.dehydrated){if(null===
a){if(!f)throw Error(p(318));f=b.memoizedState;f=null!==f?f.dehydrated:null;if(!f)throw Error(p(317));f[Of]=b}else Ig(),0===(b.flags&128)&&(b.memoizedState=null),b.flags|=4;S(b);f=!1}else null!==zg&&(Gj(zg),zg=null),f=!0;if(!f)return b.flags&65536?b:null}if(0!==(b.flags&128))return b.lanes=c,b;d=null!==d;d!==(null!==a&&null!==a.memoizedState)&&d&&(b.child.flags|=8192,0!==(b.mode&1)&&(null===a||0!==(M.current&1)?0===T&&(T=3):uj()));null!==b.updateQueue&&(b.flags|=4);S(b);return null;case 4:return Jh(),
Bj(a,b),null===a&&sf(b.stateNode.containerInfo),S(b),null;case 10:return Rg(b.type._context),S(b),null;case 17:return Zf(b.type)&&$f(),S(b),null;case 19:E(M);f=b.memoizedState;if(null===f)return S(b),null;d=0!==(b.flags&128);g=f.rendering;if(null===g)if(d)Ej(f,!1);else{if(0!==T||null!==a&&0!==(a.flags&128))for(a=b.child;null!==a;){g=Mh(a);if(null!==g){b.flags|=128;Ej(f,!1);d=g.updateQueue;null!==d&&(b.updateQueue=d,b.flags|=4);b.subtreeFlags=0;d=c;for(c=b.child;null!==c;)f=c,a=d,f.flags&=14680066,
g=f.alternate,null===g?(f.childLanes=0,f.lanes=a,f.child=null,f.subtreeFlags=0,f.memoizedProps=null,f.memoizedState=null,f.updateQueue=null,f.dependencies=null,f.stateNode=null):(f.childLanes=g.childLanes,f.lanes=g.lanes,f.child=g.child,f.subtreeFlags=0,f.deletions=null,f.memoizedProps=g.memoizedProps,f.memoizedState=g.memoizedState,f.updateQueue=g.updateQueue,f.type=g.type,a=g.dependencies,f.dependencies=null===a?null:{lanes:a.lanes,firstContext:a.firstContext}),c=c.sibling;G(M,M.current&1|2);return b.child}a=
a.sibling}null!==f.tail&&B()>Hj&&(b.flags|=128,d=!0,Ej(f,!1),b.lanes=4194304)}else{if(!d)if(a=Mh(g),null!==a){if(b.flags|=128,d=!0,c=a.updateQueue,null!==c&&(b.updateQueue=c,b.flags|=4),Ej(f,!0),null===f.tail&&"hidden"===f.tailMode&&!g.alternate&&!I)return S(b),null}else 2*B()-f.renderingStartTime>Hj&&1073741824!==c&&(b.flags|=128,d=!0,Ej(f,!1),b.lanes=4194304);f.isBackwards?(g.sibling=b.child,b.child=g):(c=f.last,null!==c?c.sibling=g:b.child=g,f.last=g)}if(null!==f.tail)return b=f.tail,f.rendering=
b,f.tail=b.sibling,f.renderingStartTime=B(),b.sibling=null,c=M.current,G(M,d?c&1|2:c&1),b;S(b);return null;case 22:case 23:return Ij(),d=null!==b.memoizedState,null!==a&&null!==a.memoizedState!==d&&(b.flags|=8192),d&&0!==(b.mode&1)?0!==(gj&1073741824)&&(S(b),b.subtreeFlags&6&&(b.flags|=8192)):S(b),null;case 24:return null;case 25:return null}throw Error(p(156,b.tag));}
function Jj(a,b){wg(b);switch(b.tag){case 1:return Zf(b.type)&&$f(),a=b.flags,a&65536?(b.flags=a&-65537|128,b):null;case 3:return Jh(),E(Wf),E(H),Oh(),a=b.flags,0!==(a&65536)&&0===(a&128)?(b.flags=a&-65537|128,b):null;case 5:return Lh(b),null;case 13:E(M);a=b.memoizedState;if(null!==a&&null!==a.dehydrated){if(null===b.alternate)throw Error(p(340));Ig()}a=b.flags;return a&65536?(b.flags=a&-65537|128,b):null;case 19:return E(M),null;case 4:return Jh(),null;case 10:return Rg(b.type._context),null;case 22:case 23:return Ij(),
null;case 24:return null;default:return null}}var Kj=!1,U=!1,Lj="function"===typeof WeakSet?WeakSet:Set,V=null;function Mj(a,b){var c=a.ref;if(null!==c)if("function"===typeof c)try{c(null)}catch(d){W(a,b,d)}else c.current=null}function Nj(a,b,c){try{c()}catch(d){W(a,b,d)}}var Oj=!1;
function Pj(a,b){Cf=dd;a=Me();if(Ne(a)){if("selectionStart"in a)var c={start:a.selectionStart,end:a.selectionEnd};else a:{c=(c=a.ownerDocument)&&c.defaultView||window;var d=c.getSelection&&c.getSelection();if(d&&0!==d.rangeCount){c=d.anchorNode;var e=d.anchorOffset,f=d.focusNode;d=d.focusOffset;try{c.nodeType,f.nodeType}catch(F){c=null;break a}var g=0,h=-1,k=-1,l=0,m=0,q=a,r=null;b:for(;;){for(var y;;){q!==c||0!==e&&3!==q.nodeType||(h=g+e);q!==f||0!==d&&3!==q.nodeType||(k=g+d);3===q.nodeType&&(g+=
q.nodeValue.length);if(null===(y=q.firstChild))break;r=q;q=y}for(;;){if(q===a)break b;r===c&&++l===e&&(h=g);r===f&&++m===d&&(k=g);if(null!==(y=q.nextSibling))break;q=r;r=q.parentNode}q=y}c=-1===h||-1===k?null:{start:h,end:k}}else c=null}c=c||{start:0,end:0}}else c=null;Df={focusedElem:a,selectionRange:c};dd=!1;for(V=b;null!==V;)if(b=V,a=b.child,0!==(b.subtreeFlags&1028)&&null!==a)a.return=b,V=a;else for(;null!==V;){b=V;try{var n=b.alternate;if(0!==(b.flags&1024))switch(b.tag){case 0:case 11:case 15:break;
case 1:if(null!==n){var t=n.memoizedProps,J=n.memoizedState,x=b.stateNode,w=x.getSnapshotBeforeUpdate(b.elementType===b.type?t:Lg(b.type,t),J);x.__reactInternalSnapshotBeforeUpdate=w}break;case 3:var u=b.stateNode.containerInfo;1===u.nodeType?u.textContent="":9===u.nodeType&&u.documentElement&&u.removeChild(u.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(p(163));}}catch(F){W(b,b.return,F)}a=b.sibling;if(null!==a){a.return=b.return;V=a;break}V=b.return}n=Oj;Oj=!1;return n}
function Qj(a,b,c){var d=b.updateQueue;d=null!==d?d.lastEffect:null;if(null!==d){var e=d=d.next;do{if((e.tag&a)===a){var f=e.destroy;e.destroy=void 0;void 0!==f&&Nj(b,c,f)}e=e.next}while(e!==d)}}function Rj(a,b){b=b.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){var c=b=b.next;do{if((c.tag&a)===a){var d=c.create;c.destroy=d()}c=c.next}while(c!==b)}}function Sj(a){var b=a.ref;if(null!==b){var c=a.stateNode;switch(a.tag){case 5:a=c;break;default:a=c}"function"===typeof b?b(a):b.current=a}}
function Tj(a){var b=a.alternate;null!==b&&(a.alternate=null,Tj(b));a.child=null;a.deletions=null;a.sibling=null;5===a.tag&&(b=a.stateNode,null!==b&&(delete b[Of],delete b[Pf],delete b[of],delete b[Qf],delete b[Rf]));a.stateNode=null;a.return=null;a.dependencies=null;a.memoizedProps=null;a.memoizedState=null;a.pendingProps=null;a.stateNode=null;a.updateQueue=null}function Uj(a){return 5===a.tag||3===a.tag||4===a.tag}
function Vj(a){a:for(;;){for(;null===a.sibling;){if(null===a.return||Uj(a.return))return null;a=a.return}a.sibling.return=a.return;for(a=a.sibling;5!==a.tag&&6!==a.tag&&18!==a.tag;){if(a.flags&2)continue a;if(null===a.child||4===a.tag)continue a;else a.child.return=a,a=a.child}if(!(a.flags&2))return a.stateNode}}
function Wj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?8===c.nodeType?c.parentNode.insertBefore(a,b):c.insertBefore(a,b):(8===c.nodeType?(b=c.parentNode,b.insertBefore(a,c)):(b=c,b.appendChild(a)),c=c._reactRootContainer,null!==c&&void 0!==c||null!==b.onclick||(b.onclick=Bf));else if(4!==d&&(a=a.child,null!==a))for(Wj(a,b,c),a=a.sibling;null!==a;)Wj(a,b,c),a=a.sibling}
function Xj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?c.insertBefore(a,b):c.appendChild(a);else if(4!==d&&(a=a.child,null!==a))for(Xj(a,b,c),a=a.sibling;null!==a;)Xj(a,b,c),a=a.sibling}var X=null,Yj=!1;function Zj(a,b,c){for(c=c.child;null!==c;)ak(a,b,c),c=c.sibling}
function ak(a,b,c){if(lc&&"function"===typeof lc.onCommitFiberUnmount)try{lc.onCommitFiberUnmount(kc,c)}catch(h){}switch(c.tag){case 5:U||Mj(c,b);case 6:var d=X,e=Yj;X=null;Zj(a,b,c);X=d;Yj=e;null!==X&&(Yj?(a=X,c=c.stateNode,8===a.nodeType?a.parentNode.removeChild(c):a.removeChild(c)):X.removeChild(c.stateNode));break;case 18:null!==X&&(Yj?(a=X,c=c.stateNode,8===a.nodeType?Kf(a.parentNode,c):1===a.nodeType&&Kf(a,c),bd(a)):Kf(X,c.stateNode));break;case 4:d=X;e=Yj;X=c.stateNode.containerInfo;Yj=!0;
Zj(a,b,c);X=d;Yj=e;break;case 0:case 11:case 14:case 15:if(!U&&(d=c.updateQueue,null!==d&&(d=d.lastEffect,null!==d))){e=d=d.next;do{var f=e,g=f.destroy;f=f.tag;void 0!==g&&(0!==(f&2)?Nj(c,b,g):0!==(f&4)&&Nj(c,b,g));e=e.next}while(e!==d)}Zj(a,b,c);break;case 1:if(!U&&(Mj(c,b),d=c.stateNode,"function"===typeof d.componentWillUnmount))try{d.props=c.memoizedProps,d.state=c.memoizedState,d.componentWillUnmount()}catch(h){W(c,b,h)}Zj(a,b,c);break;case 21:Zj(a,b,c);break;case 22:c.mode&1?(U=(d=U)||null!==
c.memoizedState,Zj(a,b,c),U=d):Zj(a,b,c);break;default:Zj(a,b,c)}}function bk(a){var b=a.updateQueue;if(null!==b){a.updateQueue=null;var c=a.stateNode;null===c&&(c=a.stateNode=new Lj);b.forEach(function(b){var d=ck.bind(null,a,b);c.has(b)||(c.add(b),b.then(d,d))})}}
function dk(a,b){var c=b.deletions;if(null!==c)for(var d=0;d<c.length;d++){var e=c[d];try{var f=a,g=b,h=g;a:for(;null!==h;){switch(h.tag){case 5:X=h.stateNode;Yj=!1;break a;case 3:X=h.stateNode.containerInfo;Yj=!0;break a;case 4:X=h.stateNode.containerInfo;Yj=!0;break a}h=h.return}if(null===X)throw Error(p(160));ak(f,g,e);X=null;Yj=!1;var k=e.alternate;null!==k&&(k.return=null);e.return=null}catch(l){W(e,b,l)}}if(b.subtreeFlags&12854)for(b=b.child;null!==b;)ek(b,a),b=b.sibling}
function ek(a,b){var c=a.alternate,d=a.flags;switch(a.tag){case 0:case 11:case 14:case 15:dk(b,a);fk(a);if(d&4){try{Qj(3,a,a.return),Rj(3,a)}catch(t){W(a,a.return,t)}try{Qj(5,a,a.return)}catch(t){W(a,a.return,t)}}break;case 1:dk(b,a);fk(a);d&512&&null!==c&&Mj(c,c.return);break;case 5:dk(b,a);fk(a);d&512&&null!==c&&Mj(c,c.return);if(a.flags&32){var e=a.stateNode;try{ob(e,"")}catch(t){W(a,a.return,t)}}if(d&4&&(e=a.stateNode,null!=e)){var f=a.memoizedProps,g=null!==c?c.memoizedProps:f,h=a.type,k=a.updateQueue;
a.updateQueue=null;if(null!==k)try{"input"===h&&"radio"===f.type&&null!=f.name&&ab(e,f);vb(h,g);var l=vb(h,f);for(g=0;g<k.length;g+=2){var m=k[g],q=k[g+1];"style"===m?sb(e,q):"dangerouslySetInnerHTML"===m?nb(e,q):"children"===m?ob(e,q):ta(e,m,q,l)}switch(h){case "input":bb(e,f);break;case "textarea":ib(e,f);break;case "select":var r=e._wrapperState.wasMultiple;e._wrapperState.wasMultiple=!!f.multiple;var y=f.value;null!=y?fb(e,!!f.multiple,y,!1):r!==!!f.multiple&&(null!=f.defaultValue?fb(e,!!f.multiple,
f.defaultValue,!0):fb(e,!!f.multiple,f.multiple?[]:"",!1))}e[Pf]=f}catch(t){W(a,a.return,t)}}break;case 6:dk(b,a);fk(a);if(d&4){if(null===a.stateNode)throw Error(p(162));e=a.stateNode;f=a.memoizedProps;try{e.nodeValue=f}catch(t){W(a,a.return,t)}}break;case 3:dk(b,a);fk(a);if(d&4&&null!==c&&c.memoizedState.isDehydrated)try{bd(b.containerInfo)}catch(t){W(a,a.return,t)}break;case 4:dk(b,a);fk(a);break;case 13:dk(b,a);fk(a);e=a.child;e.flags&8192&&(f=null!==e.memoizedState,e.stateNode.isHidden=f,!f||
null!==e.alternate&&null!==e.alternate.memoizedState||(gk=B()));d&4&&bk(a);break;case 22:m=null!==c&&null!==c.memoizedState;a.mode&1?(U=(l=U)||m,dk(b,a),U=l):dk(b,a);fk(a);if(d&8192){l=null!==a.memoizedState;if((a.stateNode.isHidden=l)&&!m&&0!==(a.mode&1))for(V=a,m=a.child;null!==m;){for(q=V=m;null!==V;){r=V;y=r.child;switch(r.tag){case 0:case 11:case 14:case 15:Qj(4,r,r.return);break;case 1:Mj(r,r.return);var n=r.stateNode;if("function"===typeof n.componentWillUnmount){d=r;c=r.return;try{b=d,n.props=
b.memoizedProps,n.state=b.memoizedState,n.componentWillUnmount()}catch(t){W(d,c,t)}}break;case 5:Mj(r,r.return);break;case 22:if(null!==r.memoizedState){hk(q);continue}}null!==y?(y.return=r,V=y):hk(q)}m=m.sibling}a:for(m=null,q=a;;){if(5===q.tag){if(null===m){m=q;try{e=q.stateNode,l?(f=e.style,"function"===typeof f.setProperty?f.setProperty("display","none","important"):f.display="none"):(h=q.stateNode,k=q.memoizedProps.style,g=void 0!==k&&null!==k&&k.hasOwnProperty("display")?k.display:null,h.style.display=
rb("display",g))}catch(t){W(a,a.return,t)}}}else if(6===q.tag){if(null===m)try{q.stateNode.nodeValue=l?"":q.memoizedProps}catch(t){W(a,a.return,t)}}else if((22!==q.tag&&23!==q.tag||null===q.memoizedState||q===a)&&null!==q.child){q.child.return=q;q=q.child;continue}if(q===a)break a;for(;null===q.sibling;){if(null===q.return||q.return===a)break a;m===q&&(m=null);q=q.return}m===q&&(m=null);q.sibling.return=q.return;q=q.sibling}}break;case 19:dk(b,a);fk(a);d&4&&bk(a);break;case 21:break;default:dk(b,
a),fk(a)}}function fk(a){var b=a.flags;if(b&2){try{a:{for(var c=a.return;null!==c;){if(Uj(c)){var d=c;break a}c=c.return}throw Error(p(160));}switch(d.tag){case 5:var e=d.stateNode;d.flags&32&&(ob(e,""),d.flags&=-33);var f=Vj(a);Xj(a,f,e);break;case 3:case 4:var g=d.stateNode.containerInfo,h=Vj(a);Wj(a,h,g);break;default:throw Error(p(161));}}catch(k){W(a,a.return,k)}a.flags&=-3}b&4096&&(a.flags&=-4097)}function ik(a,b,c){V=a;jk(a,b,c)}
function jk(a,b,c){for(var d=0!==(a.mode&1);null!==V;){var e=V,f=e.child;if(22===e.tag&&d){var g=null!==e.memoizedState||Kj;if(!g){var h=e.alternate,k=null!==h&&null!==h.memoizedState||U;h=Kj;var l=U;Kj=g;if((U=k)&&!l)for(V=e;null!==V;)g=V,k=g.child,22===g.tag&&null!==g.memoizedState?kk(e):null!==k?(k.return=g,V=k):kk(e);for(;null!==f;)V=f,jk(f,b,c),f=f.sibling;V=e;Kj=h;U=l}lk(a,b,c)}else 0!==(e.subtreeFlags&8772)&&null!==f?(f.return=e,V=f):lk(a,b,c)}}
function lk(a){for(;null!==V;){var b=V;if(0!==(b.flags&8772)){var c=b.alternate;try{if(0!==(b.flags&8772))switch(b.tag){case 0:case 11:case 15:U||Rj(5,b);break;case 1:var d=b.stateNode;if(b.flags&4&&!U)if(null===c)d.componentDidMount();else{var e=b.elementType===b.type?c.memoizedProps:Lg(b.type,c.memoizedProps);d.componentDidUpdate(e,c.memoizedState,d.__reactInternalSnapshotBeforeUpdate)}var f=b.updateQueue;null!==f&&ih(b,f,d);break;case 3:var g=b.updateQueue;if(null!==g){c=null;if(null!==b.child)switch(b.child.tag){case 5:c=
b.child.stateNode;break;case 1:c=b.child.stateNode}ih(b,g,c)}break;case 5:var h=b.stateNode;if(null===c&&b.flags&4){c=h;var k=b.memoizedProps;switch(b.type){case "button":case "input":case "select":case "textarea":k.autoFocus&&c.focus();break;case "img":k.src&&(c.src=k.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(null===b.memoizedState){var l=b.alternate;if(null!==l){var m=l.memoizedState;if(null!==m){var q=m.dehydrated;null!==q&&bd(q)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;
default:throw Error(p(163));}U||b.flags&512&&Sj(b)}catch(r){W(b,b.return,r)}}if(b===a){V=null;break}c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return}}function hk(a){for(;null!==V;){var b=V;if(b===a){V=null;break}var c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return}}
function kk(a){for(;null!==V;){var b=V;try{switch(b.tag){case 0:case 11:case 15:var c=b.return;try{Rj(4,b)}catch(k){W(b,c,k)}break;case 1:var d=b.stateNode;if("function"===typeof d.componentDidMount){var e=b.return;try{d.componentDidMount()}catch(k){W(b,e,k)}}var f=b.return;try{Sj(b)}catch(k){W(b,f,k)}break;case 5:var g=b.return;try{Sj(b)}catch(k){W(b,g,k)}}}catch(k){W(b,b.return,k)}if(b===a){V=null;break}var h=b.sibling;if(null!==h){h.return=b.return;V=h;break}V=b.return}}
var mk=Math.ceil,nk=ua.ReactCurrentDispatcher,ok=ua.ReactCurrentOwner,pk=ua.ReactCurrentBatchConfig,K=0,R=null,Y=null,Z=0,gj=0,fj=Uf(0),T=0,qk=null,hh=0,rk=0,sk=0,tk=null,uk=null,gk=0,Hj=Infinity,vk=null,Pi=!1,Qi=null,Si=null,wk=!1,xk=null,yk=0,zk=0,Ak=null,Bk=-1,Ck=0;function L(){return 0!==(K&6)?B():-1!==Bk?Bk:Bk=B()}
function lh(a){if(0===(a.mode&1))return 1;if(0!==(K&2)&&0!==Z)return Z&-Z;if(null!==Kg.transition)return 0===Ck&&(Ck=yc()),Ck;a=C;if(0!==a)return a;a=window.event;a=void 0===a?16:jd(a.type);return a}function mh(a,b,c,d){if(50<zk)throw zk=0,Ak=null,Error(p(185));Ac(a,c,d);if(0===(K&2)||a!==R)a===R&&(0===(K&2)&&(rk|=c),4===T&&Dk(a,Z)),Ek(a,d),1===c&&0===K&&0===(b.mode&1)&&(Hj=B()+500,fg&&jg())}
function Ek(a,b){var c=a.callbackNode;wc(a,b);var d=uc(a,a===R?Z:0);if(0===d)null!==c&&bc(c),a.callbackNode=null,a.callbackPriority=0;else if(b=d&-d,a.callbackPriority!==b){null!=c&&bc(c);if(1===b)0===a.tag?ig(Fk.bind(null,a)):hg(Fk.bind(null,a)),Jf(function(){0===(K&6)&&jg()}),c=null;else{switch(Dc(d)){case 1:c=fc;break;case 4:c=gc;break;case 16:c=hc;break;case 536870912:c=jc;break;default:c=hc}c=Gk(c,Hk.bind(null,a))}a.callbackPriority=b;a.callbackNode=c}}
function Hk(a,b){Bk=-1;Ck=0;if(0!==(K&6))throw Error(p(327));var c=a.callbackNode;if(Ik()&&a.callbackNode!==c)return null;var d=uc(a,a===R?Z:0);if(0===d)return null;if(0!==(d&30)||0!==(d&a.expiredLanes)||b)b=Jk(a,d);else{b=d;var e=K;K|=2;var f=Kk();if(R!==a||Z!==b)vk=null,Hj=B()+500,Lk(a,b);do try{Mk();break}catch(h){Nk(a,h)}while(1);Qg();nk.current=f;K=e;null!==Y?b=0:(R=null,Z=0,b=T)}if(0!==b){2===b&&(e=xc(a),0!==e&&(d=e,b=Ok(a,e)));if(1===b)throw c=qk,Lk(a,0),Dk(a,d),Ek(a,B()),c;if(6===b)Dk(a,d);
else{e=a.current.alternate;if(0===(d&30)&&!Pk(e)&&(b=Jk(a,d),2===b&&(f=xc(a),0!==f&&(d=f,b=Ok(a,f))),1===b))throw c=qk,Lk(a,0),Dk(a,d),Ek(a,B()),c;a.finishedWork=e;a.finishedLanes=d;switch(b){case 0:case 1:throw Error(p(345));case 2:Qk(a,uk,vk);break;case 3:Dk(a,d);if((d&130023424)===d&&(b=gk+500-B(),10<b)){if(0!==uc(a,0))break;e=a.suspendedLanes;if((e&d)!==d){L();a.pingedLanes|=a.suspendedLanes&e;break}a.timeoutHandle=Ff(Qk.bind(null,a,uk,vk),b);break}Qk(a,uk,vk);break;case 4:Dk(a,d);if((d&4194240)===
d)break;b=a.eventTimes;for(e=-1;0<d;){var g=31-oc(d);f=1<<g;g=b[g];g>e&&(e=g);d&=~f}d=e;d=B()-d;d=(120>d?120:480>d?480:1080>d?1080:1920>d?1920:3E3>d?3E3:4320>d?4320:1960*mk(d/1960))-d;if(10<d){a.timeoutHandle=Ff(Qk.bind(null,a,uk,vk),d);break}Qk(a,uk,vk);break;case 5:Qk(a,uk,vk);break;default:throw Error(p(329));}}}Ek(a,B());return a.callbackNode===c?Hk.bind(null,a):null}
function Ok(a,b){var c=tk;a.current.memoizedState.isDehydrated&&(Lk(a,b).flags|=256);a=Jk(a,b);2!==a&&(b=uk,uk=c,null!==b&&Gj(b));return a}function Gj(a){null===uk?uk=a:uk.push.apply(uk,a)}
function Pk(a){for(var b=a;;){if(b.flags&16384){var c=b.updateQueue;if(null!==c&&(c=c.stores,null!==c))for(var d=0;d<c.length;d++){var e=c[d],f=e.getSnapshot;e=e.value;try{if(!He(f(),e))return!1}catch(g){return!1}}}c=b.child;if(b.subtreeFlags&16384&&null!==c)c.return=b,b=c;else{if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return!0;b=b.return}b.sibling.return=b.return;b=b.sibling}}return!0}
function Dk(a,b){b&=~sk;b&=~rk;a.suspendedLanes|=b;a.pingedLanes&=~b;for(a=a.expirationTimes;0<b;){var c=31-oc(b),d=1<<c;a[c]=-1;b&=~d}}function Fk(a){if(0!==(K&6))throw Error(p(327));Ik();var b=uc(a,0);if(0===(b&1))return Ek(a,B()),null;var c=Jk(a,b);if(0!==a.tag&&2===c){var d=xc(a);0!==d&&(b=d,c=Ok(a,d))}if(1===c)throw c=qk,Lk(a,0),Dk(a,b),Ek(a,B()),c;if(6===c)throw Error(p(345));a.finishedWork=a.current.alternate;a.finishedLanes=b;Qk(a,uk,vk);Ek(a,B());return null}
function Rk(a,b){var c=K;K|=1;try{return a(b)}finally{K=c,0===K&&(Hj=B()+500,fg&&jg())}}function Sk(a){null!==xk&&0===xk.tag&&0===(K&6)&&Ik();var b=K;K|=1;var c=pk.transition,d=C;try{if(pk.transition=null,C=1,a)return a()}finally{C=d,pk.transition=c,K=b,0===(K&6)&&jg()}}function Ij(){gj=fj.current;E(fj)}
function Lk(a,b){a.finishedWork=null;a.finishedLanes=0;var c=a.timeoutHandle;-1!==c&&(a.timeoutHandle=-1,Gf(c));if(null!==Y)for(c=Y.return;null!==c;){var d=c;wg(d);switch(d.tag){case 1:d=d.type.childContextTypes;null!==d&&void 0!==d&&$f();break;case 3:Jh();E(Wf);E(H);Oh();break;case 5:Lh(d);break;case 4:Jh();break;case 13:E(M);break;case 19:E(M);break;case 10:Rg(d.type._context);break;case 22:case 23:Ij()}c=c.return}R=a;Y=a=wh(a.current,null);Z=gj=b;T=0;qk=null;sk=rk=hh=0;uk=tk=null;if(null!==Wg){for(b=
0;b<Wg.length;b++)if(c=Wg[b],d=c.interleaved,null!==d){c.interleaved=null;var e=d.next,f=c.pending;if(null!==f){var g=f.next;f.next=e;d.next=g}c.pending=d}Wg=null}return a}
function Nk(a,b){do{var c=Y;try{Qg();Ph.current=ai;if(Sh){for(var d=N.memoizedState;null!==d;){var e=d.queue;null!==e&&(e.pending=null);d=d.next}Sh=!1}Rh=0;P=O=N=null;Th=!1;Uh=0;ok.current=null;if(null===c||null===c.return){T=1;qk=b;Y=null;break}a:{var f=a,g=c.return,h=c,k=b;b=Z;h.flags|=32768;if(null!==k&&"object"===typeof k&&"function"===typeof k.then){var l=k,m=h,q=m.tag;if(0===(m.mode&1)&&(0===q||11===q||15===q)){var r=m.alternate;r?(m.updateQueue=r.updateQueue,m.memoizedState=r.memoizedState,
m.lanes=r.lanes):(m.updateQueue=null,m.memoizedState=null)}var y=Vi(g);if(null!==y){y.flags&=-257;Wi(y,g,h,f,b);y.mode&1&&Ti(f,l,b);b=y;k=l;var n=b.updateQueue;if(null===n){var t=new Set;t.add(k);b.updateQueue=t}else n.add(k);break a}else{if(0===(b&1)){Ti(f,l,b);uj();break a}k=Error(p(426))}}else if(I&&h.mode&1){var J=Vi(g);if(null!==J){0===(J.flags&65536)&&(J.flags|=256);Wi(J,g,h,f,b);Jg(Ki(k,h));break a}}f=k=Ki(k,h);4!==T&&(T=2);null===tk?tk=[f]:tk.push(f);f=g;do{switch(f.tag){case 3:f.flags|=65536;
b&=-b;f.lanes|=b;var x=Oi(f,k,b);fh(f,x);break a;case 1:h=k;var w=f.type,u=f.stateNode;if(0===(f.flags&128)&&("function"===typeof w.getDerivedStateFromError||null!==u&&"function"===typeof u.componentDidCatch&&(null===Si||!Si.has(u)))){f.flags|=65536;b&=-b;f.lanes|=b;var F=Ri(f,h,b);fh(f,F);break a}}f=f.return}while(null!==f)}Tk(c)}catch(na){b=na;Y===c&&null!==c&&(Y=c=c.return);continue}break}while(1)}function Kk(){var a=nk.current;nk.current=ai;return null===a?ai:a}
function uj(){if(0===T||3===T||2===T)T=4;null===R||0===(hh&268435455)&&0===(rk&268435455)||Dk(R,Z)}function Jk(a,b){var c=K;K|=2;var d=Kk();if(R!==a||Z!==b)vk=null,Lk(a,b);do try{Uk();break}catch(e){Nk(a,e)}while(1);Qg();K=c;nk.current=d;if(null!==Y)throw Error(p(261));R=null;Z=0;return T}function Uk(){for(;null!==Y;)Vk(Y)}function Mk(){for(;null!==Y&&!cc();)Vk(Y)}function Vk(a){var b=Wk(a.alternate,a,gj);a.memoizedProps=a.pendingProps;null===b?Tk(a):Y=b;ok.current=null}
function Tk(a){var b=a;do{var c=b.alternate;a=b.return;if(0===(b.flags&32768)){if(c=Fj(c,b,gj),null!==c){Y=c;return}}else{c=Jj(c,b);if(null!==c){c.flags&=32767;Y=c;return}if(null!==a)a.flags|=32768,a.subtreeFlags=0,a.deletions=null;else{T=6;Y=null;return}}b=b.sibling;if(null!==b){Y=b;return}Y=b=a}while(null!==b);0===T&&(T=5)}function Qk(a,b,c){var d=C,e=pk.transition;try{pk.transition=null,C=1,Xk(a,b,c,d)}finally{pk.transition=e,C=d}return null}
function Xk(a,b,c,d){do Ik();while(null!==xk);if(0!==(K&6))throw Error(p(327));c=a.finishedWork;var e=a.finishedLanes;if(null===c)return null;a.finishedWork=null;a.finishedLanes=0;if(c===a.current)throw Error(p(177));a.callbackNode=null;a.callbackPriority=0;var f=c.lanes|c.childLanes;Bc(a,f);a===R&&(Y=R=null,Z=0);0===(c.subtreeFlags&2064)&&0===(c.flags&2064)||wk||(wk=!0,Gk(hc,function(){Ik();return null}));f=0!==(c.flags&15990);if(0!==(c.subtreeFlags&15990)||f){f=pk.transition;pk.transition=null;
var g=C;C=1;var h=K;K|=4;ok.current=null;Pj(a,c);ek(c,a);Oe(Df);dd=!!Cf;Df=Cf=null;a.current=c;ik(c,a,e);dc();K=h;C=g;pk.transition=f}else a.current=c;wk&&(wk=!1,xk=a,yk=e);f=a.pendingLanes;0===f&&(Si=null);mc(c.stateNode,d);Ek(a,B());if(null!==b)for(d=a.onRecoverableError,c=0;c<b.length;c++)e=b[c],d(e.value,{componentStack:e.stack,digest:e.digest});if(Pi)throw Pi=!1,a=Qi,Qi=null,a;0!==(yk&1)&&0!==a.tag&&Ik();f=a.pendingLanes;0!==(f&1)?a===Ak?zk++:(zk=0,Ak=a):zk=0;jg();return null}
function Ik(){if(null!==xk){var a=Dc(yk),b=pk.transition,c=C;try{pk.transition=null;C=16>a?16:a;if(null===xk)var d=!1;else{a=xk;xk=null;yk=0;if(0!==(K&6))throw Error(p(331));var e=K;K|=4;for(V=a.current;null!==V;){var f=V,g=f.child;if(0!==(V.flags&16)){var h=f.deletions;if(null!==h){for(var k=0;k<h.length;k++){var l=h[k];for(V=l;null!==V;){var m=V;switch(m.tag){case 0:case 11:case 15:Qj(8,m,f)}var q=m.child;if(null!==q)q.return=m,V=q;else for(;null!==V;){m=V;var r=m.sibling,y=m.return;Tj(m);if(m===
l){V=null;break}if(null!==r){r.return=y;V=r;break}V=y}}}var n=f.alternate;if(null!==n){var t=n.child;if(null!==t){n.child=null;do{var J=t.sibling;t.sibling=null;t=J}while(null!==t)}}V=f}}if(0!==(f.subtreeFlags&2064)&&null!==g)g.return=f,V=g;else b:for(;null!==V;){f=V;if(0!==(f.flags&2048))switch(f.tag){case 0:case 11:case 15:Qj(9,f,f.return)}var x=f.sibling;if(null!==x){x.return=f.return;V=x;break b}V=f.return}}var w=a.current;for(V=w;null!==V;){g=V;var u=g.child;if(0!==(g.subtreeFlags&2064)&&null!==
u)u.return=g,V=u;else b:for(g=w;null!==V;){h=V;if(0!==(h.flags&2048))try{switch(h.tag){case 0:case 11:case 15:Rj(9,h)}}catch(na){W(h,h.return,na)}if(h===g){V=null;break b}var F=h.sibling;if(null!==F){F.return=h.return;V=F;break b}V=h.return}}K=e;jg();if(lc&&"function"===typeof lc.onPostCommitFiberRoot)try{lc.onPostCommitFiberRoot(kc,a)}catch(na){}d=!0}return d}finally{C=c,pk.transition=b}}return!1}function Yk(a,b,c){b=Ki(c,b);b=Oi(a,b,1);a=dh(a,b,1);b=L();null!==a&&(Ac(a,1,b),Ek(a,b))}
function W(a,b,c){if(3===a.tag)Yk(a,a,c);else for(;null!==b;){if(3===b.tag){Yk(b,a,c);break}else if(1===b.tag){var d=b.stateNode;if("function"===typeof b.type.getDerivedStateFromError||"function"===typeof d.componentDidCatch&&(null===Si||!Si.has(d))){a=Ki(c,a);a=Ri(b,a,1);b=dh(b,a,1);a=L();null!==b&&(Ac(b,1,a),Ek(b,a));break}}b=b.return}}
function Ui(a,b,c){var d=a.pingCache;null!==d&&d.delete(b);b=L();a.pingedLanes|=a.suspendedLanes&c;R===a&&(Z&c)===c&&(4===T||3===T&&(Z&130023424)===Z&&500>B()-gk?Lk(a,0):sk|=c);Ek(a,b)}function Zk(a,b){0===b&&(0===(a.mode&1)?b=1:(b=sc,sc<<=1,0===(sc&130023424)&&(sc=4194304)));var c=L();a=Zg(a,b);null!==a&&(Ac(a,b,c),Ek(a,c))}function vj(a){var b=a.memoizedState,c=0;null!==b&&(c=b.retryLane);Zk(a,c)}
function ck(a,b){var c=0;switch(a.tag){case 13:var d=a.stateNode;var e=a.memoizedState;null!==e&&(c=e.retryLane);break;case 19:d=a.stateNode;break;default:throw Error(p(314));}null!==d&&d.delete(b);Zk(a,c)}var Wk;
Wk=function(a,b,c){if(null!==a)if(a.memoizedProps!==b.pendingProps||Wf.current)Ug=!0;else{if(0===(a.lanes&c)&&0===(b.flags&128))return Ug=!1,zj(a,b,c);Ug=0!==(a.flags&131072)?!0:!1}else Ug=!1,I&&0!==(b.flags&1048576)&&ug(b,ng,b.index);b.lanes=0;switch(b.tag){case 2:var d=b.type;jj(a,b);a=b.pendingProps;var e=Yf(b,H.current);Tg(b,c);e=Xh(null,b,d,a,e,c);var f=bi();b.flags|=1;"object"===typeof e&&null!==e&&"function"===typeof e.render&&void 0===e.$$typeof?(b.tag=1,b.memoizedState=null,b.updateQueue=
null,Zf(d)?(f=!0,cg(b)):f=!1,b.memoizedState=null!==e.state&&void 0!==e.state?e.state:null,ah(b),e.updater=nh,b.stateNode=e,e._reactInternals=b,rh(b,d,a,c),b=kj(null,b,d,!0,f,c)):(b.tag=0,I&&f&&vg(b),Yi(null,b,e,c),b=b.child);return b;case 16:d=b.elementType;a:{jj(a,b);a=b.pendingProps;e=d._init;d=e(d._payload);b.type=d;e=b.tag=$k(d);a=Lg(d,a);switch(e){case 0:b=dj(null,b,d,a,c);break a;case 1:b=ij(null,b,d,a,c);break a;case 11:b=Zi(null,b,d,a,c);break a;case 14:b=aj(null,b,d,Lg(d.type,a),c);break a}throw Error(p(306,
d,""));}return b;case 0:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),dj(a,b,d,e,c);case 1:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),ij(a,b,d,e,c);case 3:a:{lj(b);if(null===a)throw Error(p(387));d=b.pendingProps;f=b.memoizedState;e=f.element;bh(a,b);gh(b,d,null,c);var g=b.memoizedState;d=g.element;if(f.isDehydrated)if(f={element:d,isDehydrated:!1,cache:g.cache,pendingSuspenseBoundaries:g.pendingSuspenseBoundaries,transitions:g.transitions},b.updateQueue.baseState=
f,b.memoizedState=f,b.flags&256){e=Ki(Error(p(423)),b);b=mj(a,b,d,c,e);break a}else if(d!==e){e=Ki(Error(p(424)),b);b=mj(a,b,d,c,e);break a}else for(yg=Lf(b.stateNode.containerInfo.firstChild),xg=b,I=!0,zg=null,c=Ch(b,null,d,c),b.child=c;c;)c.flags=c.flags&-3|4096,c=c.sibling;else{Ig();if(d===e){b=$i(a,b,c);break a}Yi(a,b,d,c)}b=b.child}return b;case 5:return Kh(b),null===a&&Eg(b),d=b.type,e=b.pendingProps,f=null!==a?a.memoizedProps:null,g=e.children,Ef(d,e)?g=null:null!==f&&Ef(d,f)&&(b.flags|=32),
hj(a,b),Yi(a,b,g,c),b.child;case 6:return null===a&&Eg(b),null;case 13:return pj(a,b,c);case 4:return Ih(b,b.stateNode.containerInfo),d=b.pendingProps,null===a?b.child=Bh(b,null,d,c):Yi(a,b,d,c),b.child;case 11:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),Zi(a,b,d,e,c);case 7:return Yi(a,b,b.pendingProps,c),b.child;case 8:return Yi(a,b,b.pendingProps.children,c),b.child;case 12:return Yi(a,b,b.pendingProps.children,c),b.child;case 10:a:{d=b.type._context;e=b.pendingProps;f=b.memoizedProps;
g=e.value;G(Mg,d._currentValue);d._currentValue=g;if(null!==f)if(He(f.value,g)){if(f.children===e.children&&!Wf.current){b=$i(a,b,c);break a}}else for(f=b.child,null!==f&&(f.return=b);null!==f;){var h=f.dependencies;if(null!==h){g=f.child;for(var k=h.firstContext;null!==k;){if(k.context===d){if(1===f.tag){k=ch(-1,c&-c);k.tag=2;var l=f.updateQueue;if(null!==l){l=l.shared;var m=l.pending;null===m?k.next=k:(k.next=m.next,m.next=k);l.pending=k}}f.lanes|=c;k=f.alternate;null!==k&&(k.lanes|=c);Sg(f.return,
c,b);h.lanes|=c;break}k=k.next}}else if(10===f.tag)g=f.type===b.type?null:f.child;else if(18===f.tag){g=f.return;if(null===g)throw Error(p(341));g.lanes|=c;h=g.alternate;null!==h&&(h.lanes|=c);Sg(g,c,b);g=f.sibling}else g=f.child;if(null!==g)g.return=f;else for(g=f;null!==g;){if(g===b){g=null;break}f=g.sibling;if(null!==f){f.return=g.return;g=f;break}g=g.return}f=g}Yi(a,b,e.children,c);b=b.child}return b;case 9:return e=b.type,d=b.pendingProps.children,Tg(b,c),e=Vg(e),d=d(e),b.flags|=1,Yi(a,b,d,c),
b.child;case 14:return d=b.type,e=Lg(d,b.pendingProps),e=Lg(d.type,e),aj(a,b,d,e,c);case 15:return cj(a,b,b.type,b.pendingProps,c);case 17:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),jj(a,b),b.tag=1,Zf(d)?(a=!0,cg(b)):a=!1,Tg(b,c),ph(b,d,e),rh(b,d,e,c),kj(null,b,d,!0,a,c);case 19:return yj(a,b,c);case 22:return ej(a,b,c)}throw Error(p(156,b.tag));};function Gk(a,b){return ac(a,b)}
function al(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null;this.index=0;this.ref=null;this.pendingProps=b;this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.subtreeFlags=this.flags=0;this.deletions=null;this.childLanes=this.lanes=0;this.alternate=null}function Bg(a,b,c,d){return new al(a,b,c,d)}function bj(a){a=a.prototype;return!(!a||!a.isReactComponent)}
function $k(a){if("function"===typeof a)return bj(a)?1:0;if(void 0!==a&&null!==a){a=a.$$typeof;if(a===Da)return 11;if(a===Ga)return 14}return 2}
function wh(a,b){var c=a.alternate;null===c?(c=Bg(a.tag,b,a.key,a.mode),c.elementType=a.elementType,c.type=a.type,c.stateNode=a.stateNode,c.alternate=a,a.alternate=c):(c.pendingProps=b,c.type=a.type,c.flags=0,c.subtreeFlags=0,c.deletions=null);c.flags=a.flags&14680064;c.childLanes=a.childLanes;c.lanes=a.lanes;c.child=a.child;c.memoizedProps=a.memoizedProps;c.memoizedState=a.memoizedState;c.updateQueue=a.updateQueue;b=a.dependencies;c.dependencies=null===b?null:{lanes:b.lanes,firstContext:b.firstContext};
c.sibling=a.sibling;c.index=a.index;c.ref=a.ref;return c}
function yh(a,b,c,d,e,f){var g=2;d=a;if("function"===typeof a)bj(a)&&(g=1);else if("string"===typeof a)g=5;else a:switch(a){case ya:return Ah(c.children,e,f,b);case za:g=8;e|=8;break;case Aa:return a=Bg(12,c,b,e|2),a.elementType=Aa,a.lanes=f,a;case Ea:return a=Bg(13,c,b,e),a.elementType=Ea,a.lanes=f,a;case Fa:return a=Bg(19,c,b,e),a.elementType=Fa,a.lanes=f,a;case Ia:return qj(c,e,f,b);default:if("object"===typeof a&&null!==a)switch(a.$$typeof){case Ba:g=10;break a;case Ca:g=9;break a;case Da:g=11;
break a;case Ga:g=14;break a;case Ha:g=16;d=null;break a}throw Error(p(130,null==a?a:typeof a,""));}b=Bg(g,c,b,e);b.elementType=a;b.type=d;b.lanes=f;return b}function Ah(a,b,c,d){a=Bg(7,a,d,b);a.lanes=c;return a}function qj(a,b,c,d){a=Bg(22,a,d,b);a.elementType=Ia;a.lanes=c;a.stateNode={isHidden:!1};return a}function xh(a,b,c){a=Bg(6,a,null,b);a.lanes=c;return a}
function zh(a,b,c){b=Bg(4,null!==a.children?a.children:[],a.key,b);b.lanes=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}
function bl(a,b,c,d,e){this.tag=b;this.containerInfo=a;this.finishedWork=this.pingCache=this.current=this.pendingChildren=null;this.timeoutHandle=-1;this.callbackNode=this.pendingContext=this.context=null;this.callbackPriority=0;this.eventTimes=zc(0);this.expirationTimes=zc(-1);this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0;this.entanglements=zc(0);this.identifierPrefix=d;this.onRecoverableError=e;this.mutableSourceEagerHydrationData=
null}function cl(a,b,c,d,e,f,g,h,k){a=new bl(a,b,c,h,k);1===b?(b=1,!0===f&&(b|=8)):b=0;f=Bg(3,null,null,b);a.current=f;f.stateNode=a;f.memoizedState={element:d,isDehydrated:c,cache:null,transitions:null,pendingSuspenseBoundaries:null};ah(f);return a}function dl(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return{$$typeof:wa,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}
function el(a){if(!a)return Vf;a=a._reactInternals;a:{if(Vb(a)!==a||1!==a.tag)throw Error(p(170));var b=a;do{switch(b.tag){case 3:b=b.stateNode.context;break a;case 1:if(Zf(b.type)){b=b.stateNode.__reactInternalMemoizedMergedChildContext;break a}}b=b.return}while(null!==b);throw Error(p(171));}if(1===a.tag){var c=a.type;if(Zf(c))return bg(a,c,b)}return b}
function fl(a,b,c,d,e,f,g,h,k){a=cl(c,d,!0,a,e,f,g,h,k);a.context=el(null);c=a.current;d=L();e=lh(c);f=ch(d,e);f.callback=void 0!==b&&null!==b?b:null;dh(c,f,e);a.current.lanes=e;Ac(a,e,d);Ek(a,d);return a}function gl(a,b,c,d){var e=b.current,f=L(),g=lh(e);c=el(c);null===b.context?b.context=c:b.pendingContext=c;b=ch(f,g);b.payload={element:a};d=void 0===d?null:d;null!==d&&(b.callback=d);a=dh(e,b,g);null!==a&&(mh(a,e,g,f),eh(a,e,g));return g}
function hl(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}function il(a,b){a=a.memoizedState;if(null!==a&&null!==a.dehydrated){var c=a.retryLane;a.retryLane=0!==c&&c<b?c:b}}function jl(a,b){il(a,b);(a=a.alternate)&&il(a,b)}function kl(){return null}var ll="function"===typeof reportError?reportError:function(a){console.error(a)};function ml(a){this._internalRoot=a}
nl.prototype.render=ml.prototype.render=function(a){var b=this._internalRoot;if(null===b)throw Error(p(409));gl(a,b,null,null)};nl.prototype.unmount=ml.prototype.unmount=function(){var a=this._internalRoot;if(null!==a){this._internalRoot=null;var b=a.containerInfo;Sk(function(){gl(null,a,null,null)});b[uf]=null}};function nl(a){this._internalRoot=a}
nl.prototype.unstable_scheduleHydration=function(a){if(a){var b=Hc();a={blockedOn:null,target:a,priority:b};for(var c=0;c<Qc.length&&0!==b&&b<Qc[c].priority;c++);Qc.splice(c,0,a);0===c&&Vc(a)}};function ol(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType)}function pl(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}function ql(){}
function rl(a,b,c,d,e){if(e){if("function"===typeof d){var f=d;d=function(){var a=hl(g);f.call(a)}}var g=fl(b,d,a,0,null,!1,!1,"",ql);a._reactRootContainer=g;a[uf]=g.current;sf(8===a.nodeType?a.parentNode:a);Sk();return g}for(;e=a.lastChild;)a.removeChild(e);if("function"===typeof d){var h=d;d=function(){var a=hl(k);h.call(a)}}var k=cl(a,0,!1,null,null,!1,!1,"",ql);a._reactRootContainer=k;a[uf]=k.current;sf(8===a.nodeType?a.parentNode:a);Sk(function(){gl(b,k,c,d)});return k}
function sl(a,b,c,d,e){var f=c._reactRootContainer;if(f){var g=f;if("function"===typeof e){var h=e;e=function(){var a=hl(g);h.call(a)}}gl(b,g,a,e)}else g=rl(c,b,a,e,d);return hl(g)}Ec=function(a){switch(a.tag){case 3:var b=a.stateNode;if(b.current.memoizedState.isDehydrated){var c=tc(b.pendingLanes);0!==c&&(Cc(b,c|1),Ek(b,B()),0===(K&6)&&(Hj=B()+500,jg()))}break;case 13:Sk(function(){var b=Zg(a,1);if(null!==b){var c=L();mh(b,a,1,c)}}),jl(a,1)}};
Fc=function(a){if(13===a.tag){var b=Zg(a,134217728);if(null!==b){var c=L();mh(b,a,134217728,c)}jl(a,134217728)}};Gc=function(a){if(13===a.tag){var b=lh(a),c=Zg(a,b);if(null!==c){var d=L();mh(c,a,b,d)}jl(a,b)}};Hc=function(){return C};Ic=function(a,b){var c=C;try{return C=a,b()}finally{C=c}};
yb=function(a,b,c){switch(b){case "input":bb(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Db(d);if(!e)throw Error(p(90));Wa(d);bb(d,e)}}}break;case "textarea":ib(a,c);break;case "select":b=c.value,null!=b&&fb(a,!!c.multiple,b,!1)}};Gb=Rk;Hb=Sk;
var tl={usingClientEntryPoint:!1,Events:[Cb,ue,Db,Eb,Fb,Rk]},ul={findFiberByHostInstance:Wc,bundleType:0,version:"18.2.0",rendererPackageName:"react-dom"};
var vl={bundleType:ul.bundleType,version:ul.version,rendererPackageName:ul.rendererPackageName,rendererConfig:ul.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ua.ReactCurrentDispatcher,findHostInstanceByFiber:function(a){a=Zb(a);return null===a?null:a.stateNode},findFiberByHostInstance:ul.findFiberByHostInstance||
kl,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.2.0-next-9e3b772b8-20220608"};if("undefined"!==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__){var wl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!wl.isDisabled&&wl.supportsFiber)try{kc=wl.inject(vl),lc=wl}catch(a){}}exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=tl;
exports.createPortal=function(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;if(!ol(b))throw Error(p(200));return dl(a,b,null,c)};exports.createRoot=function(a,b){if(!ol(a))throw Error(p(299));var c=!1,d="",e=ll;null!==b&&void 0!==b&&(!0===b.unstable_strictMode&&(c=!0),void 0!==b.identifierPrefix&&(d=b.identifierPrefix),void 0!==b.onRecoverableError&&(e=b.onRecoverableError));b=cl(a,1,!1,null,null,c,!1,d,e);a[uf]=b.current;sf(8===a.nodeType?a.parentNode:a);return new ml(b)};
exports.findDOMNode=function(a){if(null==a)return null;if(1===a.nodeType)return a;var b=a._reactInternals;if(void 0===b){if("function"===typeof a.render)throw Error(p(188));a=Object.keys(a).join(",");throw Error(p(268,a));}a=Zb(b);a=null===a?null:a.stateNode;return a};exports.flushSync=function(a){return Sk(a)};exports.hydrate=function(a,b,c){if(!pl(b))throw Error(p(200));return sl(null,a,b,!0,c)};
exports.hydrateRoot=function(a,b,c){if(!ol(a))throw Error(p(405));var d=null!=c&&c.hydratedSources||null,e=!1,f="",g=ll;null!==c&&void 0!==c&&(!0===c.unstable_strictMode&&(e=!0),void 0!==c.identifierPrefix&&(f=c.identifierPrefix),void 0!==c.onRecoverableError&&(g=c.onRecoverableError));b=fl(b,null,a,1,null!=c?c:null,e,!1,f,g);a[uf]=b.current;sf(a);if(d)for(a=0;a<d.length;a++)c=d[a],e=c._getVersion,e=e(c._source),null==b.mutableSourceEagerHydrationData?b.mutableSourceEagerHydrationData=[c,e]:b.mutableSourceEagerHydrationData.push(c,
e);return new nl(b)};exports.render=function(a,b,c){if(!pl(b))throw Error(p(200));return sl(null,a,b,!1,c)};exports.unmountComponentAtNode=function(a){if(!pl(a))throw Error(p(40));return a._reactRootContainer?(Sk(function(){sl(null,null,a,!1,function(){a._reactRootContainer=null;a[uf]=null})}),!0):!1};exports.unstable_batchedUpdates=Rk;
exports.unstable_renderSubtreeIntoContainer=function(a,b,c,d){if(!pl(c))throw Error(p(200));if(null==a||void 0===a._reactInternals)throw Error(p(38));return sl(a,b,c,!1,d)};exports.version="18.2.0-next-9e3b772b8-20220608";


/***/ }),

/***/ 745:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


var m = __webpack_require__(935);
if (true) {
  exports.s = m.createRoot;
  __webpack_unused_export__ = m.hydrateRoot;
} else { var i; }


/***/ }),

/***/ 935:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function checkDCE() {
  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  if (
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }
  if (false) {}
  try {
    // Verify that the code above has been dead code eliminated (DCE'd).
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    // DevTools shouldn't crash React, no matter what.
    // We should still report in case we break this code.
    console.error(err);
  }
}

if (true) {
  // DCE check should happen before ReactDOM bundle executes so that
  // DevTools can report bad minification during injection.
  checkDCE();
  module.exports = __webpack_require__(448);
} else {}


/***/ }),

/***/ 408:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z=Symbol.iterator;function A(a){if(null===a||"object"!==typeof a)return null;a=z&&a[z]||a["@@iterator"];return"function"===typeof a?a:null}
var B={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C=Object.assign,D={};function E(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B}E.prototype.isReactComponent={};
E.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,a,b,"setState")};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B}var H=G.prototype=new F;
H.constructor=G;C(H,E.prototype);H.isPureReactComponent=!0;var I=Array.isArray,J=Object.prototype.hasOwnProperty,K={current:null},L={key:!0,ref:!0,__self:!0,__source:!0};
function M(a,b,e){var d,c={},k=null,h=null;if(null!=b)for(d in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)J.call(b,d)&&!L.hasOwnProperty(d)&&(c[d]=b[d]);var g=arguments.length-2;if(1===g)c.children=e;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];c.children=f}if(a&&a.defaultProps)for(d in g=a.defaultProps,g)void 0===c[d]&&(c[d]=g[d]);return{$$typeof:l,type:a,key:k,ref:h,props:c,_owner:K.current}}
function N(a,b){return{$$typeof:l,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return"object"===typeof a&&null!==a&&a.$$typeof===l}function escape(a){var b={"=":"=0",":":"=2"};return"$"+a.replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g;function Q(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
function R(a,b,e,d,c){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case l:case n:h=!0}}if(h)return h=a,c=c(h),a=""===d?"."+Q(h,0):d,I(c)?(e="",null!=a&&(e=a.replace(P,"$&/")+"/"),R(c,b,e,"",function(a){return a})):null!=c&&(O(c)&&(c=N(c,e+(!c.key||h&&h.key===c.key?"":(""+c.key).replace(P,"$&/")+"/")+a)),b.push(c)),1;h=0;d=""===d?".":d+":";if(I(a))for(var g=0;g<a.length;g++){k=
a[g];var f=d+Q(k,g);h+=R(k,b,e,f,c)}else if(f=A(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=d+Q(k,g++),h+=R(k,b,e,f,c);else if("object"===k)throw b=String(a),Error("Objects are not valid as a React child (found: "+("[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b)+"). If you meant to render a collection of children, use an array instead.");return h}
function S(a,b,e){if(null==a)return a;var d=[],c=0;R(a,d,"","",function(a){return b.call(e,a,c++)});return d}function T(a){if(-1===a._status){var b=a._result;b=b();b.then(function(b){if(0===a._status||-1===a._status)a._status=1,a._result=b},function(b){if(0===a._status||-1===a._status)a._status=2,a._result=b});-1===a._status&&(a._status=0,a._result=b)}if(1===a._status)return a._result.default;throw a._result;}
var U={current:null},V={transition:null},W={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:V,ReactCurrentOwner:K};exports.Children={map:S,forEach:function(a,b,e){S(a,function(){b.apply(this,arguments)},e)},count:function(a){var b=0;S(a,function(){b++});return b},toArray:function(a){return S(a,function(a){return a})||[]},only:function(a){if(!O(a))throw Error("React.Children.only expected to receive a single React element child.");return a}};exports.Component=E;exports.Fragment=p;
exports.Profiler=r;exports.PureComponent=G;exports.StrictMode=q;exports.Suspense=w;exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W;
exports.cloneElement=function(a,b,e){if(null===a||void 0===a)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+a+".");var d=C({},a.props),c=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=K.current);void 0!==b.key&&(c=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)J.call(b,f)&&!L.hasOwnProperty(f)&&(d[f]=void 0===b[f]&&void 0!==g?g[f]:b[f])}var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){g=Array(f);
for(var m=0;m<f;m++)g[m]=arguments[m+2];d.children=g}return{$$typeof:l,type:a.type,key:c,ref:k,props:d,_owner:h}};exports.createContext=function(a){a={$$typeof:u,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null};a.Provider={$$typeof:t,_context:a};return a.Consumer=a};exports.createElement=M;exports.createFactory=function(a){var b=M.bind(null,a);b.type=a;return b};exports.createRef=function(){return{current:null}};
exports.forwardRef=function(a){return{$$typeof:v,render:a}};exports.isValidElement=O;exports.lazy=function(a){return{$$typeof:y,_payload:{_status:-1,_result:a},_init:T}};exports.memo=function(a,b){return{$$typeof:x,type:a,compare:void 0===b?null:b}};exports.startTransition=function(a){var b=V.transition;V.transition={};try{a()}finally{V.transition=b}};exports.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.");};
exports.useCallback=function(a,b){return U.current.useCallback(a,b)};exports.useContext=function(a){return U.current.useContext(a)};exports.useDebugValue=function(){};exports.useDeferredValue=function(a){return U.current.useDeferredValue(a)};exports.useEffect=function(a,b){return U.current.useEffect(a,b)};exports.useId=function(){return U.current.useId()};exports.useImperativeHandle=function(a,b,e){return U.current.useImperativeHandle(a,b,e)};
exports.useInsertionEffect=function(a,b){return U.current.useInsertionEffect(a,b)};exports.useLayoutEffect=function(a,b){return U.current.useLayoutEffect(a,b)};exports.useMemo=function(a,b){return U.current.useMemo(a,b)};exports.useReducer=function(a,b,e){return U.current.useReducer(a,b,e)};exports.useRef=function(a){return U.current.useRef(a)};exports.useState=function(a){return U.current.useState(a)};exports.useSyncExternalStore=function(a,b,e){return U.current.useSyncExternalStore(a,b,e)};
exports.useTransition=function(){return U.current.useTransition()};exports.version="18.2.0";


/***/ }),

/***/ 294:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (true) {
  module.exports = __webpack_require__(408);
} else {}


/***/ }),

/***/ 53:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function f(a,b){var c=a.length;a.push(b);a:for(;0<c;){var d=c-1>>>1,e=a[d];if(0<g(e,b))a[d]=b,a[c]=e,c=d;else break a}}function h(a){return 0===a.length?null:a[0]}function k(a){if(0===a.length)return null;var b=a[0],c=a.pop();if(c!==b){a[0]=c;a:for(var d=0,e=a.length,w=e>>>1;d<w;){var m=2*(d+1)-1,C=a[m],n=m+1,x=a[n];if(0>g(C,c))n<e&&0>g(x,C)?(a[d]=x,a[n]=c,d=n):(a[d]=C,a[m]=c,d=m);else if(n<e&&0>g(x,c))a[d]=x,a[n]=c,d=n;else break a}}return b}
function g(a,b){var c=a.sortIndex-b.sortIndex;return 0!==c?c:a.id-b.id}if("object"===typeof performance&&"function"===typeof performance.now){var l=performance;exports.unstable_now=function(){return l.now()}}else{var p=Date,q=p.now();exports.unstable_now=function(){return p.now()-q}}var r=[],t=[],u=1,v=null,y=3,z=!1,A=!1,B=!1,D="function"===typeof setTimeout?setTimeout:null,E="function"===typeof clearTimeout?clearTimeout:null,F="undefined"!==typeof setImmediate?setImmediate:null;
"undefined"!==typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function G(a){for(var b=h(t);null!==b;){if(null===b.callback)k(t);else if(b.startTime<=a)k(t),b.sortIndex=b.expirationTime,f(r,b);else break;b=h(t)}}function H(a){B=!1;G(a);if(!A)if(null!==h(r))A=!0,I(J);else{var b=h(t);null!==b&&K(H,b.startTime-a)}}
function J(a,b){A=!1;B&&(B=!1,E(L),L=-1);z=!0;var c=y;try{G(b);for(v=h(r);null!==v&&(!(v.expirationTime>b)||a&&!M());){var d=v.callback;if("function"===typeof d){v.callback=null;y=v.priorityLevel;var e=d(v.expirationTime<=b);b=exports.unstable_now();"function"===typeof e?v.callback=e:v===h(r)&&k(r);G(b)}else k(r);v=h(r)}if(null!==v)var w=!0;else{var m=h(t);null!==m&&K(H,m.startTime-b);w=!1}return w}finally{v=null,y=c,z=!1}}var N=!1,O=null,L=-1,P=5,Q=-1;
function M(){return exports.unstable_now()-Q<P?!1:!0}function R(){if(null!==O){var a=exports.unstable_now();Q=a;var b=!0;try{b=O(!0,a)}finally{b?S():(N=!1,O=null)}}else N=!1}var S;if("function"===typeof F)S=function(){F(R)};else if("undefined"!==typeof MessageChannel){var T=new MessageChannel,U=T.port2;T.port1.onmessage=R;S=function(){U.postMessage(null)}}else S=function(){D(R,0)};function I(a){O=a;N||(N=!0,S())}function K(a,b){L=D(function(){a(exports.unstable_now())},b)}
exports.unstable_IdlePriority=5;exports.unstable_ImmediatePriority=1;exports.unstable_LowPriority=4;exports.unstable_NormalPriority=3;exports.unstable_Profiling=null;exports.unstable_UserBlockingPriority=2;exports.unstable_cancelCallback=function(a){a.callback=null};exports.unstable_continueExecution=function(){A||z||(A=!0,I(J))};
exports.unstable_forceFrameRate=function(a){0>a||125<a?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):P=0<a?Math.floor(1E3/a):5};exports.unstable_getCurrentPriorityLevel=function(){return y};exports.unstable_getFirstCallbackNode=function(){return h(r)};exports.unstable_next=function(a){switch(y){case 1:case 2:case 3:var b=3;break;default:b=y}var c=y;y=b;try{return a()}finally{y=c}};exports.unstable_pauseExecution=function(){};
exports.unstable_requestPaint=function(){};exports.unstable_runWithPriority=function(a,b){switch(a){case 1:case 2:case 3:case 4:case 5:break;default:a=3}var c=y;y=a;try{return b()}finally{y=c}};
exports.unstable_scheduleCallback=function(a,b,c){var d=exports.unstable_now();"object"===typeof c&&null!==c?(c=c.delay,c="number"===typeof c&&0<c?d+c:d):c=d;switch(a){case 1:var e=-1;break;case 2:e=250;break;case 5:e=1073741823;break;case 4:e=1E4;break;default:e=5E3}e=c+e;a={id:u++,callback:b,priorityLevel:a,startTime:c,expirationTime:e,sortIndex:-1};c>d?(a.sortIndex=c,f(t,a),null===h(r)&&a===h(t)&&(B?(E(L),L=-1):B=!0,K(H,c-d))):(a.sortIndex=e,f(r,a),A||z||(A=!0,I(J)));return a};
exports.unstable_shouldYield=M;exports.unstable_wrapCallback=function(a){var b=y;return function(){var c=y;y=b;try{return a.apply(this,arguments)}finally{y=c}}};


/***/ }),

/***/ 840:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (true) {
  module.exports = __webpack_require__(53);
} else {}


/***/ }),

/***/ 921:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(795);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(569);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(565);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(216);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(589);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(263);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);


if (true) {
  if (!_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals || module.hot.invalidate) {
    var isEqualLocals = function isEqualLocals(a, b, isNamedExport) {
  if (!a && b || a && !b) {
    return false;
  }
  var p;
  for (p in a) {
    if (isNamedExport && p === "default") {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (a[p] !== b[p]) {
      return false;
    }
  }
  for (p in b) {
    if (isNamedExport && p === "default") {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (!a[p]) {
      return false;
    }
  }
  return true;
};
    var isNamedExport = !_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals;
    var oldLocals = isNamedExport ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__ : _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals;

    module.hot.accept(
      263,
      __WEBPACK_OUTDATED_DEPENDENCIES__ => { /* harmony import */ _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(263);
(function () {
        if (!isEqualLocals(oldLocals, isNamedExport ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__ : _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals, isNamedExport)) {
                module.hot.invalidate();

                return;
              }

              oldLocals = isNamedExport ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__ : _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals;

              update(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"]);
      })(__WEBPACK_OUTDATED_DEPENDENCIES__); }
    )
  }

  module.hot.dispose(function() {
    update();
  });
}



       /* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_plugin_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ 379:
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 569:
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 216:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 795:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 589:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 234:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  render: () => (/* binding */ render)
});

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/utils.mjs
// TYPES
// UTILS
const isServer = typeof window === 'undefined' || 'Deno' in window;
function noop() {
  return undefined;
}
function functionalUpdate(updater, input) {
  return typeof updater === 'function' ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === 'number' && value >= 0 && value !== Infinity;
}
function difference(array1, array2) {
  return array1.filter(x => !array2.includes(x));
}
function replaceAt(array, index, value) {
  const copy = array.slice(0);
  copy[index] = value;
  return copy;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function parseQueryArgs(arg1, arg2, arg3) {
  if (!isQueryKey(arg1)) {
    return arg1;
  }

  if (typeof arg2 === 'function') {
    return { ...arg3,
      queryKey: arg1,
      queryFn: arg2
    };
  }

  return { ...arg2,
    queryKey: arg1
  };
}
function parseMutationArgs(arg1, arg2, arg3) {
  if (isQueryKey(arg1)) {
    if (typeof arg2 === 'function') {
      return { ...arg3,
        mutationKey: arg1,
        mutationFn: arg2
      };
    }

    return { ...arg2,
      mutationKey: arg1
    };
  }

  if (typeof arg1 === 'function') {
    return { ...arg2,
      mutationFn: arg1
    };
  }

  return { ...arg1
  };
}
function parseFilterArgs(arg1, arg2, arg3) {
  return isQueryKey(arg1) ? [{ ...arg2,
    queryKey: arg1
  }, arg3] : [arg1 || {}, arg2];
}
function parseMutationFilterArgs(arg1, arg2, arg3) {
  return isQueryKey(arg1) ? [{ ...arg2,
    mutationKey: arg1
  }, arg3] : [arg1 || {}, arg2];
}
function matchQuery(filters, query) {
  const {
    type = 'all',
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;

  if (isQueryKey(queryKey)) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }

  if (type !== 'all') {
    const isActive = query.isActive();

    if (type === 'active' && !isActive) {
      return false;
    }

    if (type === 'inactive' && isActive) {
      return false;
    }
  }

  if (typeof stale === 'boolean' && query.isStale() !== stale) {
    return false;
  }

  if (typeof fetchStatus !== 'undefined' && fetchStatus !== query.state.fetchStatus) {
    return false;
  }

  if (predicate && !predicate(query)) {
    return false;
  }

  return true;
}
function matchMutation(filters, mutation) {
  const {
    exact,
    fetching,
    predicate,
    mutationKey
  } = filters;

  if (isQueryKey(mutationKey)) {
    if (!mutation.options.mutationKey) {
      return false;
    }

    if (exact) {
      if (hashQueryKey(mutation.options.mutationKey) !== hashQueryKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }

  if (typeof fetching === 'boolean' && mutation.state.status === 'loading' !== fetching) {
    return false;
  }

  if (predicate && !predicate(mutation)) {
    return false;
  }

  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashQueryKey;
  return hashFn(queryKey);
}
/**
 * Default query keys hash function.
 * Hashes the value into a stable hash.
 */

function hashQueryKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
    result[key] = val[key];
    return result;
  }, {}) : val);
}
/**
 * Checks if key `b` partially matches with key `a`.
 */

function partialMatchKey(a, b) {
  return partialDeepEqual(a, b);
}
/**
 * Checks if `b` partially matches with `a`.
 */

function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return !Object.keys(b).some(key => !partialDeepEqual(a[key], b[key]));
  }

  return false;
}
/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 */

function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }

  const array = isPlainArray(a) && isPlainArray(b);

  if (array || isPlainObject(a) && isPlainObject(b)) {
    const aSize = array ? a.length : Object.keys(a).length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;

    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      copy[key] = replaceEqualDeep(a[key], b[key]);

      if (copy[key] === a[key]) {
        equalItems++;
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy;
  }

  return b;
}
/**
 * Shallow compare objects. Only works with objects that always have the same properties.
 */

function shallowEqualObjects(a, b) {
  if (a && !b || b && !a) {
    return false;
  }

  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
} // Copied from: https://github.com/jonschlinkert/is-plain-object

function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  } // If has modified constructor


  const ctor = o.constructor;

  if (typeof ctor === 'undefined') {
    return true;
  } // If has modified prototype


  const prot = ctor.prototype;

  if (!hasObjectPrototype(prot)) {
    return false;
  } // If constructor does not have an Object-specific method


  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  } // Most likely a plain Object


  return true;
}

function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isQueryKey(value) {
  return Array.isArray(value);
}
function isError(value) {
  return value instanceof Error;
}
function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}
/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */

function scheduleMicrotask(callback) {
  sleep(0).then(callback);
}
function getAbortController() {
  if (typeof AbortController === 'function') {
    return new AbortController();
  }

  return;
}
function replaceData(prevData, data, options) {
  // Use prev data if an isDataEqual function is defined and returns `true`
  if (options.isDataEqual != null && options.isDataEqual(prevData, data)) {
    return prevData;
  } else if (typeof options.structuralSharing === 'function') {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    // Structurally share data between prev and new data if needed
    return replaceEqualDeep(prevData, data);
  }

  return data;
}


//# sourceMappingURL=utils.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/logger.mjs
const defaultLogger = console;


//# sourceMappingURL=logger.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/notifyManager.mjs


function createNotifyManager() {
  let queue = [];
  let transactions = 0;

  let notifyFn = callback => {
    callback();
  };

  let batchNotifyFn = callback => {
    callback();
  };

  const batch = callback => {
    let result;
    transactions++;

    try {
      result = callback();
    } finally {
      transactions--;

      if (!transactions) {
        flush();
      }
    }

    return result;
  };

  const schedule = callback => {
    if (transactions) {
      queue.push(callback);
    } else {
      scheduleMicrotask(() => {
        notifyFn(callback);
      });
    }
  };
  /**
   * All calls to the wrapped function will be batched.
   */


  const batchCalls = callback => {
    return (...args) => {
      schedule(() => {
        callback(...args);
      });
    };
  };

  const flush = () => {
    const originalQueue = queue;
    queue = [];

    if (originalQueue.length) {
      scheduleMicrotask(() => {
        batchNotifyFn(() => {
          originalQueue.forEach(callback => {
            notifyFn(callback);
          });
        });
      });
    }
  };
  /**
   * Use this method to set a custom notify function.
   * This can be used to for example wrap notifications with `React.act` while running tests.
   */


  const setNotifyFunction = fn => {
    notifyFn = fn;
  };
  /**
   * Use this method to set a custom function to batch notifications together into a single tick.
   * By default React Query will use the batch function provided by ReactDOM or React Native.
   */


  const setBatchNotifyFunction = fn => {
    batchNotifyFn = fn;
  };

  return {
    batch,
    batchCalls,
    schedule,
    setNotifyFunction,
    setBatchNotifyFunction
  };
} // SINGLETON

const notifyManager = createNotifyManager();


//# sourceMappingURL=notifyManager.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/subscribable.mjs
class Subscribable {
  constructor() {
    this.listeners = new Set();
    this.subscribe = this.subscribe.bind(this);
  }

  subscribe(listener) {
    const identity = {
      listener
    };
    this.listeners.add(identity);
    this.onSubscribe();
    return () => {
      this.listeners.delete(identity);
      this.onUnsubscribe();
    };
  }

  hasListeners() {
    return this.listeners.size > 0;
  }

  onSubscribe() {// Do nothing
  }

  onUnsubscribe() {// Do nothing
  }

}


//# sourceMappingURL=subscribable.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/focusManager.mjs



class FocusManager extends Subscribable {
  constructor() {
    super();

    this.setup = onFocus => {
      // addEventListener does not exist in React Native, but window does
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isServer && window.addEventListener) {
        const listener = () => onFocus(); // Listen to visibillitychange and focus


        window.addEventListener('visibilitychange', listener, false);
        window.addEventListener('focus', listener, false);
        return () => {
          // Be sure to unsubscribe if a new handler is set
          window.removeEventListener('visibilitychange', listener);
          window.removeEventListener('focus', listener);
        };
      }

      return;
    };
  }

  onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  }

  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;

      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = undefined;
    }
  }

  setEventListener(setup) {
    var _this$cleanup2;

    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup(focused => {
      if (typeof focused === 'boolean') {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    });
  }

  setFocused(focused) {
    const changed = this.focused !== focused;

    if (changed) {
      this.focused = focused;
      this.onFocus();
    }
  }

  onFocus() {
    this.listeners.forEach(({
      listener
    }) => {
      listener();
    });
  }

  isFocused() {
    if (typeof this.focused === 'boolean') {
      return this.focused;
    } // document global can be unavailable in react native


    if (typeof document === 'undefined') {
      return true;
    }

    return [undefined, 'visible', 'prerender'].includes(document.visibilityState);
  }

}
const focusManager = new FocusManager();


//# sourceMappingURL=focusManager.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/onlineManager.mjs



const onlineEvents = ['online', 'offline'];
class OnlineManager extends Subscribable {
  constructor() {
    super();

    this.setup = onOnline => {
      // addEventListener does not exist in React Native, but window does
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isServer && window.addEventListener) {
        const listener = () => onOnline(); // Listen to online


        onlineEvents.forEach(event => {
          window.addEventListener(event, listener, false);
        });
        return () => {
          // Be sure to unsubscribe if a new handler is set
          onlineEvents.forEach(event => {
            window.removeEventListener(event, listener);
          });
        };
      }

      return;
    };
  }

  onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  }

  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;

      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = undefined;
    }
  }

  setEventListener(setup) {
    var _this$cleanup2;

    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup(online => {
      if (typeof online === 'boolean') {
        this.setOnline(online);
      } else {
        this.onOnline();
      }
    });
  }

  setOnline(online) {
    const changed = this.online !== online;

    if (changed) {
      this.online = online;
      this.onOnline();
    }
  }

  onOnline() {
    this.listeners.forEach(({
      listener
    }) => {
      listener();
    });
  }

  isOnline() {
    if (typeof this.online === 'boolean') {
      return this.online;
    }

    if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
      return true;
    }

    return navigator.onLine;
  }

}
const onlineManager = new OnlineManager();


//# sourceMappingURL=onlineManager.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/retryer.mjs




function defaultRetryDelay(failureCount) {
  return Math.min(1000 * 2 ** failureCount, 30000);
}

function canFetch(networkMode) {
  return (networkMode != null ? networkMode : 'online') === 'online' ? onlineManager.isOnline() : true;
}
class CancelledError {
  constructor(options) {
    this.revert = options == null ? void 0 : options.revert;
    this.silent = options == null ? void 0 : options.silent;
  }

}
function isCancelledError(value) {
  return value instanceof CancelledError;
}
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let isResolved = false;
  let continueFn;
  let promiseResolve;
  let promiseReject;
  const promise = new Promise((outerResolve, outerReject) => {
    promiseResolve = outerResolve;
    promiseReject = outerReject;
  });

  const cancel = cancelOptions => {
    if (!isResolved) {
      reject(new CancelledError(cancelOptions));
      config.abort == null ? void 0 : config.abort();
    }
  };

  const cancelRetry = () => {
    isRetryCancelled = true;
  };

  const continueRetry = () => {
    isRetryCancelled = false;
  };

  const shouldPause = () => !focusManager.isFocused() || config.networkMode !== 'always' && !onlineManager.isOnline();

  const resolve = value => {
    if (!isResolved) {
      isResolved = true;
      config.onSuccess == null ? void 0 : config.onSuccess(value);
      continueFn == null ? void 0 : continueFn();
      promiseResolve(value);
    }
  };

  const reject = value => {
    if (!isResolved) {
      isResolved = true;
      config.onError == null ? void 0 : config.onError(value);
      continueFn == null ? void 0 : continueFn();
      promiseReject(value);
    }
  };

  const pause = () => {
    return new Promise(continueResolve => {
      continueFn = value => {
        const canContinue = isResolved || !shouldPause();

        if (canContinue) {
          continueResolve(value);
        }

        return canContinue;
      };

      config.onPause == null ? void 0 : config.onPause();
    }).then(() => {
      continueFn = undefined;

      if (!isResolved) {
        config.onContinue == null ? void 0 : config.onContinue();
      }
    });
  }; // Create loop function


  const run = () => {
    // Do nothing if already resolved
    if (isResolved) {
      return;
    }

    let promiseOrValue; // Execute query

    try {
      promiseOrValue = config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }

    Promise.resolve(promiseOrValue).then(resolve).catch(error => {
      var _config$retry, _config$retryDelay;

      // Stop if the fetch is already resolved
      if (isResolved) {
        return;
      } // Do we need to retry the request?


      const retry = (_config$retry = config.retry) != null ? _config$retry : 3;
      const retryDelay = (_config$retryDelay = config.retryDelay) != null ? _config$retryDelay : defaultRetryDelay;
      const delay = typeof retryDelay === 'function' ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === 'number' && failureCount < retry || typeof retry === 'function' && retry(failureCount, error);

      if (isRetryCancelled || !shouldRetry) {
        // We are done if the query does not need to be retried
        reject(error);
        return;
      }

      failureCount++; // Notify on fail

      config.onFail == null ? void 0 : config.onFail(failureCount, error); // Delay

      sleep(delay) // Pause if the document is not visible or when the device is offline
      .then(() => {
        if (shouldPause()) {
          return pause();
        }

        return;
      }).then(() => {
        if (isRetryCancelled) {
          reject(error);
        } else {
          run();
        }
      });
    });
  }; // Start loop


  if (canFetch(config.networkMode)) {
    run();
  } else {
    pause().then(run);
  }

  return {
    promise,
    cancel,
    continue: () => {
      const didContinue = continueFn == null ? void 0 : continueFn();
      return didContinue ? promise : Promise.resolve();
    },
    cancelRetry,
    continueRetry
  };
}


//# sourceMappingURL=retryer.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/removable.mjs


class Removable {
  destroy() {
    this.clearGcTimeout();
  }

  scheduleGc() {
    this.clearGcTimeout();

    if (isValidTimeout(this.cacheTime)) {
      this.gcTimeout = setTimeout(() => {
        this.optionalRemove();
      }, this.cacheTime);
    }
  }

  updateCacheTime(newCacheTime) {
    // Default to 5 minutes (Infinity for server-side) if no cache time is set
    this.cacheTime = Math.max(this.cacheTime || 0, newCacheTime != null ? newCacheTime : isServer ? Infinity : 5 * 60 * 1000);
  }

  clearGcTimeout() {
    if (this.gcTimeout) {
      clearTimeout(this.gcTimeout);
      this.gcTimeout = undefined;
    }
  }

}


//# sourceMappingURL=removable.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/query.mjs






// CLASS
class Query extends Removable {
  constructor(config) {
    super();
    this.abortSignalConsumed = false;
    this.defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.cache = config.cache;
    this.logger = config.logger || defaultLogger;
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    this.initialState = config.state || getDefaultState(this.options);
    this.state = this.initialState;
    this.scheduleGc();
  }

  get meta() {
    return this.options.meta;
  }

  setOptions(options) {
    this.options = { ...this.defaultOptions,
      ...options
    };
    this.updateCacheTime(this.options.cacheTime);
  }

  optionalRemove() {
    if (!this.observers.length && this.state.fetchStatus === 'idle') {
      this.cache.remove(this);
    }
  }

  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options); // Set data and mark it as cached

    this.dispatch({
      data,
      type: 'success',
      dataUpdatedAt: options == null ? void 0 : options.updatedAt,
      manual: options == null ? void 0 : options.manual
    });
    return data;
  }

  setState(state, setStateOptions) {
    this.dispatch({
      type: 'setState',
      state,
      setStateOptions
    });
  }

  cancel(options) {
    var _this$retryer;

    const promise = this.promise;
    (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.cancel(options);
    return promise ? promise.then(noop).catch(noop) : Promise.resolve();
  }

  destroy() {
    super.destroy();
    this.cancel({
      silent: true
    });
  }

  reset() {
    this.destroy();
    this.setState(this.initialState);
  }

  isActive() {
    return this.observers.some(observer => observer.options.enabled !== false);
  }

  isDisabled() {
    return this.getObserversCount() > 0 && !this.isActive();
  }

  isStale() {
    return this.state.isInvalidated || !this.state.dataUpdatedAt || this.observers.some(observer => observer.getCurrentResult().isStale);
  }

  isStaleByTime(staleTime = 0) {
    return this.state.isInvalidated || !this.state.dataUpdatedAt || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }

  onFocus() {
    var _this$retryer2;

    const observer = this.observers.find(x => x.shouldFetchOnWindowFocus());

    if (observer) {
      observer.refetch({
        cancelRefetch: false
      });
    } // Continue fetch if currently paused


    (_this$retryer2 = this.retryer) == null ? void 0 : _this$retryer2.continue();
  }

  onOnline() {
    var _this$retryer3;

    const observer = this.observers.find(x => x.shouldFetchOnReconnect());

    if (observer) {
      observer.refetch({
        cancelRefetch: false
      });
    } // Continue fetch if currently paused


    (_this$retryer3 = this.retryer) == null ? void 0 : _this$retryer3.continue();
  }

  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer); // Stop the query from being garbage collected

      this.clearGcTimeout();
      this.cache.notify({
        type: 'observerAdded',
        query: this,
        observer
      });
    }
  }

  removeObserver(observer) {
    if (this.observers.includes(observer)) {
      this.observers = this.observers.filter(x => x !== observer);

      if (!this.observers.length) {
        // If the transport layer does not support cancellation
        // we'll let the query continue so the result can be cached
        if (this.retryer) {
          if (this.abortSignalConsumed) {
            this.retryer.cancel({
              revert: true
            });
          } else {
            this.retryer.cancelRetry();
          }
        }

        this.scheduleGc();
      }

      this.cache.notify({
        type: 'observerRemoved',
        query: this,
        observer
      });
    }
  }

  getObserversCount() {
    return this.observers.length;
  }

  invalidate() {
    if (!this.state.isInvalidated) {
      this.dispatch({
        type: 'invalidate'
      });
    }
  }

  fetch(options, fetchOptions) {
    var _this$options$behavio, _context$fetchOptions;

    if (this.state.fetchStatus !== 'idle') {
      if (this.state.dataUpdatedAt && fetchOptions != null && fetchOptions.cancelRefetch) {
        // Silently cancel current fetch if the user wants to cancel refetches
        this.cancel({
          silent: true
        });
      } else if (this.promise) {
        var _this$retryer4;

        // make sure that retries that were potentially cancelled due to unmounts can continue
        (_this$retryer4 = this.retryer) == null ? void 0 : _this$retryer4.continueRetry(); // Return current promise if we are already fetching

        return this.promise;
      }
    } // Update config if passed, otherwise the config from the last execution is used


    if (options) {
      this.setOptions(options);
    } // Use the options from the first observer with a query function if no function is found.
    // This can happen when the query is hydrated or created with setQueryData.


    if (!this.options.queryFn) {
      const observer = this.observers.find(x => x.options.queryFn);

      if (observer) {
        this.setOptions(observer.options);
      }
    }

    if (false) {}

    const abortController = getAbortController(); // Create query function context

    const queryFnContext = {
      queryKey: this.queryKey,
      pageParam: undefined,
      meta: this.meta
    }; // Adds an enumerable signal property to the object that
    // which sets abortSignalConsumed to true when the signal
    // is read.

    const addSignalProperty = object => {
      Object.defineProperty(object, 'signal', {
        enumerable: true,
        get: () => {
          if (abortController) {
            this.abortSignalConsumed = true;
            return abortController.signal;
          }

          return undefined;
        }
      });
    };

    addSignalProperty(queryFnContext); // Create fetch function

    const fetchFn = () => {
      if (!this.options.queryFn) {
        return Promise.reject("Missing queryFn for queryKey '" + this.options.queryHash + "'");
      }

      this.abortSignalConsumed = false;
      return this.options.queryFn(queryFnContext);
    }; // Trigger behavior hook


    const context = {
      fetchOptions,
      options: this.options,
      queryKey: this.queryKey,
      state: this.state,
      fetchFn
    };
    addSignalProperty(context);
    (_this$options$behavio = this.options.behavior) == null ? void 0 : _this$options$behavio.onFetch(context); // Store state in case the current fetch needs to be reverted

    this.revertState = this.state; // Set to fetching state if not already in it

    if (this.state.fetchStatus === 'idle' || this.state.fetchMeta !== ((_context$fetchOptions = context.fetchOptions) == null ? void 0 : _context$fetchOptions.meta)) {
      var _context$fetchOptions2;

      this.dispatch({
        type: 'fetch',
        meta: (_context$fetchOptions2 = context.fetchOptions) == null ? void 0 : _context$fetchOptions2.meta
      });
    }

    const onError = error => {
      // Optimistically update state if needed
      if (!(isCancelledError(error) && error.silent)) {
        this.dispatch({
          type: 'error',
          error: error
        });
      }

      if (!isCancelledError(error)) {
        var _this$cache$config$on, _this$cache$config, _this$cache$config$on2, _this$cache$config2;

        // Notify cache callback
        (_this$cache$config$on = (_this$cache$config = this.cache.config).onError) == null ? void 0 : _this$cache$config$on.call(_this$cache$config, error, this);
        (_this$cache$config$on2 = (_this$cache$config2 = this.cache.config).onSettled) == null ? void 0 : _this$cache$config$on2.call(_this$cache$config2, this.state.data, error, this);

        if (false) {}
      }

      if (!this.isFetchingOptimistic) {
        // Schedule query gc after fetching
        this.scheduleGc();
      }

      this.isFetchingOptimistic = false;
    }; // Try to fetch the data


    this.retryer = createRetryer({
      fn: context.fetchFn,
      abort: abortController == null ? void 0 : abortController.abort.bind(abortController),
      onSuccess: data => {
        var _this$cache$config$on3, _this$cache$config3, _this$cache$config$on4, _this$cache$config4;

        if (typeof data === 'undefined') {
          if (false) {}

          onError(new Error(this.queryHash + " data is undefined"));
          return;
        }

        this.setData(data); // Notify cache callback

        (_this$cache$config$on3 = (_this$cache$config3 = this.cache.config).onSuccess) == null ? void 0 : _this$cache$config$on3.call(_this$cache$config3, data, this);
        (_this$cache$config$on4 = (_this$cache$config4 = this.cache.config).onSettled) == null ? void 0 : _this$cache$config$on4.call(_this$cache$config4, data, this.state.error, this);

        if (!this.isFetchingOptimistic) {
          // Schedule query gc after fetching
          this.scheduleGc();
        }

        this.isFetchingOptimistic = false;
      },
      onError,
      onFail: (failureCount, error) => {
        this.dispatch({
          type: 'failed',
          failureCount,
          error
        });
      },
      onPause: () => {
        this.dispatch({
          type: 'pause'
        });
      },
      onContinue: () => {
        this.dispatch({
          type: 'continue'
        });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode
    });
    this.promise = this.retryer.promise;
    return this.promise;
  }

  dispatch(action) {
    const reducer = state => {
      var _action$meta, _action$dataUpdatedAt;

      switch (action.type) {
        case 'failed':
          return { ...state,
            fetchFailureCount: action.failureCount,
            fetchFailureReason: action.error
          };

        case 'pause':
          return { ...state,
            fetchStatus: 'paused'
          };

        case 'continue':
          return { ...state,
            fetchStatus: 'fetching'
          };

        case 'fetch':
          return { ...state,
            fetchFailureCount: 0,
            fetchFailureReason: null,
            fetchMeta: (_action$meta = action.meta) != null ? _action$meta : null,
            fetchStatus: canFetch(this.options.networkMode) ? 'fetching' : 'paused',
            ...(!state.dataUpdatedAt && {
              error: null,
              status: 'loading'
            })
          };

        case 'success':
          return { ...state,
            data: action.data,
            dataUpdateCount: state.dataUpdateCount + 1,
            dataUpdatedAt: (_action$dataUpdatedAt = action.dataUpdatedAt) != null ? _action$dataUpdatedAt : Date.now(),
            error: null,
            isInvalidated: false,
            status: 'success',
            ...(!action.manual && {
              fetchStatus: 'idle',
              fetchFailureCount: 0,
              fetchFailureReason: null
            })
          };

        case 'error':
          const error = action.error;

          if (isCancelledError(error) && error.revert && this.revertState) {
            return { ...this.revertState,
              fetchStatus: 'idle'
            };
          }

          return { ...state,
            error: error,
            errorUpdateCount: state.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: state.fetchFailureCount + 1,
            fetchFailureReason: error,
            fetchStatus: 'idle',
            status: 'error'
          };

        case 'invalidate':
          return { ...state,
            isInvalidated: true
          };

        case 'setState':
          return { ...state,
            ...action.state
          };
      }
    };

    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach(observer => {
        observer.onQueryUpdate(action);
      });
      this.cache.notify({
        query: this,
        type: 'updated',
        action
      });
    });
  }

}

function getDefaultState(options) {
  const data = typeof options.initialData === 'function' ? options.initialData() : options.initialData;
  const hasData = typeof data !== 'undefined';
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === 'function' ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt != null ? initialDataUpdatedAt : Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? 'success' : 'loading',
    fetchStatus: 'idle'
  };
}


//# sourceMappingURL=query.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/queryCache.mjs





// CLASS
class QueryCache extends Subscribable {
  constructor(config) {
    super();
    this.config = config || {};
    this.queries = [];
    this.queriesMap = {};
  }

  build(client, options, state) {
    var _options$queryHash;

    const queryKey = options.queryKey;
    const queryHash = (_options$queryHash = options.queryHash) != null ? _options$queryHash : hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);

    if (!query) {
      query = new Query({
        cache: this,
        logger: client.getLogger(),
        queryKey,
        queryHash,
        options: client.defaultQueryOptions(options),
        state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }

    return query;
  }

  add(query) {
    if (!this.queriesMap[query.queryHash]) {
      this.queriesMap[query.queryHash] = query;
      this.queries.push(query);
      this.notify({
        type: 'added',
        query
      });
    }
  }

  remove(query) {
    const queryInMap = this.queriesMap[query.queryHash];

    if (queryInMap) {
      query.destroy();
      this.queries = this.queries.filter(x => x !== query);

      if (queryInMap === query) {
        delete this.queriesMap[query.queryHash];
      }

      this.notify({
        type: 'removed',
        query
      });
    }
  }

  clear() {
    notifyManager.batch(() => {
      this.queries.forEach(query => {
        this.remove(query);
      });
    });
  }

  get(queryHash) {
    return this.queriesMap[queryHash];
  }

  getAll() {
    return this.queries;
  }

  find(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);

    if (typeof filters.exact === 'undefined') {
      filters.exact = true;
    }

    return this.queries.find(query => matchQuery(filters, query));
  }

  findAll(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    return Object.keys(filters).length > 0 ? this.queries.filter(query => matchQuery(filters, query)) : this.queries;
  }

  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach(({
        listener
      }) => {
        listener(event);
      });
    });
  }

  onFocus() {
    notifyManager.batch(() => {
      this.queries.forEach(query => {
        query.onFocus();
      });
    });
  }

  onOnline() {
    notifyManager.batch(() => {
      this.queries.forEach(query => {
        query.onOnline();
      });
    });
  }

}


//# sourceMappingURL=queryCache.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/mutation.mjs





// CLASS
class Mutation extends Removable {
  constructor(config) {
    super();
    this.defaultOptions = config.defaultOptions;
    this.mutationId = config.mutationId;
    this.mutationCache = config.mutationCache;
    this.logger = config.logger || defaultLogger;
    this.observers = [];
    this.state = config.state || mutation_getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }

  setOptions(options) {
    this.options = { ...this.defaultOptions,
      ...options
    };
    this.updateCacheTime(this.options.cacheTime);
  }

  get meta() {
    return this.options.meta;
  }

  setState(state) {
    this.dispatch({
      type: 'setState',
      state
    });
  }

  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer); // Stop the mutation from being garbage collected

      this.clearGcTimeout();
      this.mutationCache.notify({
        type: 'observerAdded',
        mutation: this,
        observer
      });
    }
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(x => x !== observer);
    this.scheduleGc();
    this.mutationCache.notify({
      type: 'observerRemoved',
      mutation: this,
      observer
    });
  }

  optionalRemove() {
    if (!this.observers.length) {
      if (this.state.status === 'loading') {
        this.scheduleGc();
      } else {
        this.mutationCache.remove(this);
      }
    }
  }

  continue() {
    var _this$retryer$continu, _this$retryer;

    return (_this$retryer$continu = (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.continue()) != null ? _this$retryer$continu : this.execute();
  }

  async execute() {
    const executeMutation = () => {
      var _this$options$retry;

      this.retryer = createRetryer({
        fn: () => {
          if (!this.options.mutationFn) {
            return Promise.reject('No mutationFn found');
          }

          return this.options.mutationFn(this.state.variables);
        },
        onFail: (failureCount, error) => {
          this.dispatch({
            type: 'failed',
            failureCount,
            error
          });
        },
        onPause: () => {
          this.dispatch({
            type: 'pause'
          });
        },
        onContinue: () => {
          this.dispatch({
            type: 'continue'
          });
        },
        retry: (_this$options$retry = this.options.retry) != null ? _this$options$retry : 0,
        retryDelay: this.options.retryDelay,
        networkMode: this.options.networkMode
      });
      return this.retryer.promise;
    };

    const restored = this.state.status === 'loading';

    try {
      var _this$mutationCache$c3, _this$mutationCache$c4, _this$options$onSucce, _this$options2, _this$mutationCache$c5, _this$mutationCache$c6, _this$options$onSettl, _this$options3;

      if (!restored) {
        var _this$mutationCache$c, _this$mutationCache$c2, _this$options$onMutat, _this$options;

        this.dispatch({
          type: 'loading',
          variables: this.options.variables
        }); // Notify cache callback

        await ((_this$mutationCache$c = (_this$mutationCache$c2 = this.mutationCache.config).onMutate) == null ? void 0 : _this$mutationCache$c.call(_this$mutationCache$c2, this.state.variables, this));
        const context = await ((_this$options$onMutat = (_this$options = this.options).onMutate) == null ? void 0 : _this$options$onMutat.call(_this$options, this.state.variables));

        if (context !== this.state.context) {
          this.dispatch({
            type: 'loading',
            context,
            variables: this.state.variables
          });
        }
      }

      const data = await executeMutation(); // Notify cache callback

      await ((_this$mutationCache$c3 = (_this$mutationCache$c4 = this.mutationCache.config).onSuccess) == null ? void 0 : _this$mutationCache$c3.call(_this$mutationCache$c4, data, this.state.variables, this.state.context, this));
      await ((_this$options$onSucce = (_this$options2 = this.options).onSuccess) == null ? void 0 : _this$options$onSucce.call(_this$options2, data, this.state.variables, this.state.context)); // Notify cache callback

      await ((_this$mutationCache$c5 = (_this$mutationCache$c6 = this.mutationCache.config).onSettled) == null ? void 0 : _this$mutationCache$c5.call(_this$mutationCache$c6, data, null, this.state.variables, this.state.context, this));
      await ((_this$options$onSettl = (_this$options3 = this.options).onSettled) == null ? void 0 : _this$options$onSettl.call(_this$options3, data, null, this.state.variables, this.state.context));
      this.dispatch({
        type: 'success',
        data
      });
      return data;
    } catch (error) {
      try {
        var _this$mutationCache$c7, _this$mutationCache$c8, _this$options$onError, _this$options4, _this$mutationCache$c9, _this$mutationCache$c10, _this$options$onSettl2, _this$options5;

        // Notify cache callback
        await ((_this$mutationCache$c7 = (_this$mutationCache$c8 = this.mutationCache.config).onError) == null ? void 0 : _this$mutationCache$c7.call(_this$mutationCache$c8, error, this.state.variables, this.state.context, this));

        if (false) {}

        await ((_this$options$onError = (_this$options4 = this.options).onError) == null ? void 0 : _this$options$onError.call(_this$options4, error, this.state.variables, this.state.context)); // Notify cache callback

        await ((_this$mutationCache$c9 = (_this$mutationCache$c10 = this.mutationCache.config).onSettled) == null ? void 0 : _this$mutationCache$c9.call(_this$mutationCache$c10, undefined, error, this.state.variables, this.state.context, this));
        await ((_this$options$onSettl2 = (_this$options5 = this.options).onSettled) == null ? void 0 : _this$options$onSettl2.call(_this$options5, undefined, error, this.state.variables, this.state.context));
        throw error;
      } finally {
        this.dispatch({
          type: 'error',
          error: error
        });
      }
    }
  }

  dispatch(action) {
    const reducer = state => {
      switch (action.type) {
        case 'failed':
          return { ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };

        case 'pause':
          return { ...state,
            isPaused: true
          };

        case 'continue':
          return { ...state,
            isPaused: false
          };

        case 'loading':
          return { ...state,
            context: action.context,
            data: undefined,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: !canFetch(this.options.networkMode),
            status: 'loading',
            variables: action.variables
          };

        case 'success':
          return { ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: 'success',
            isPaused: false
          };

        case 'error':
          return { ...state,
            data: undefined,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: 'error'
          };

        case 'setState':
          return { ...state,
            ...action.state
          };
      }
    };

    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach(observer => {
        observer.onMutationUpdate(action);
      });
      this.mutationCache.notify({
        mutation: this,
        type: 'updated',
        action
      });
    });
  }

}
function mutation_getDefaultState() {
  return {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: 'idle',
    variables: undefined
  };
}


//# sourceMappingURL=mutation.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/mutationCache.mjs





// CLASS
class MutationCache extends Subscribable {
  constructor(config) {
    super();
    this.config = config || {};
    this.mutations = [];
    this.mutationId = 0;
  }

  build(client, options, state) {
    const mutation = new Mutation({
      mutationCache: this,
      logger: client.getLogger(),
      mutationId: ++this.mutationId,
      options: client.defaultMutationOptions(options),
      state,
      defaultOptions: options.mutationKey ? client.getMutationDefaults(options.mutationKey) : undefined
    });
    this.add(mutation);
    return mutation;
  }

  add(mutation) {
    this.mutations.push(mutation);
    this.notify({
      type: 'added',
      mutation
    });
  }

  remove(mutation) {
    this.mutations = this.mutations.filter(x => x !== mutation);
    this.notify({
      type: 'removed',
      mutation
    });
  }

  clear() {
    notifyManager.batch(() => {
      this.mutations.forEach(mutation => {
        this.remove(mutation);
      });
    });
  }

  getAll() {
    return this.mutations;
  }

  find(filters) {
    if (typeof filters.exact === 'undefined') {
      filters.exact = true;
    }

    return this.mutations.find(mutation => matchMutation(filters, mutation));
  }

  findAll(filters) {
    return this.mutations.filter(mutation => matchMutation(filters, mutation));
  }

  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach(({
        listener
      }) => {
        listener(event);
      });
    });
  }

  resumePausedMutations() {
    var _this$resuming;

    this.resuming = ((_this$resuming = this.resuming) != null ? _this$resuming : Promise.resolve()).then(() => {
      const pausedMutations = this.mutations.filter(x => x.state.isPaused);
      return notifyManager.batch(() => pausedMutations.reduce((promise, mutation) => promise.then(() => mutation.continue().catch(noop)), Promise.resolve()));
    }).then(() => {
      this.resuming = undefined;
    });
    return this.resuming;
  }

}


//# sourceMappingURL=mutationCache.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/infiniteQueryBehavior.mjs
function infiniteQueryBehavior() {
  return {
    onFetch: context => {
      context.fetchFn = () => {
        var _context$fetchOptions, _context$fetchOptions2, _context$fetchOptions3, _context$fetchOptions4, _context$state$data, _context$state$data2;

        const refetchPage = (_context$fetchOptions = context.fetchOptions) == null ? void 0 : (_context$fetchOptions2 = _context$fetchOptions.meta) == null ? void 0 : _context$fetchOptions2.refetchPage;
        const fetchMore = (_context$fetchOptions3 = context.fetchOptions) == null ? void 0 : (_context$fetchOptions4 = _context$fetchOptions3.meta) == null ? void 0 : _context$fetchOptions4.fetchMore;
        const pageParam = fetchMore == null ? void 0 : fetchMore.pageParam;
        const isFetchingNextPage = (fetchMore == null ? void 0 : fetchMore.direction) === 'forward';
        const isFetchingPreviousPage = (fetchMore == null ? void 0 : fetchMore.direction) === 'backward';
        const oldPages = ((_context$state$data = context.state.data) == null ? void 0 : _context$state$data.pages) || [];
        const oldPageParams = ((_context$state$data2 = context.state.data) == null ? void 0 : _context$state$data2.pageParams) || [];
        let newPageParams = oldPageParams;
        let cancelled = false;

        const addSignalProperty = object => {
          Object.defineProperty(object, 'signal', {
            enumerable: true,
            get: () => {
              var _context$signal;

              if ((_context$signal = context.signal) != null && _context$signal.aborted) {
                cancelled = true;
              } else {
                var _context$signal2;

                (_context$signal2 = context.signal) == null ? void 0 : _context$signal2.addEventListener('abort', () => {
                  cancelled = true;
                });
              }

              return context.signal;
            }
          });
        }; // Get query function


        const queryFn = context.options.queryFn || (() => Promise.reject("Missing queryFn for queryKey '" + context.options.queryHash + "'"));

        const buildNewPages = (pages, param, page, previous) => {
          newPageParams = previous ? [param, ...newPageParams] : [...newPageParams, param];
          return previous ? [page, ...pages] : [...pages, page];
        }; // Create function to fetch a page


        const fetchPage = (pages, manual, param, previous) => {
          if (cancelled) {
            return Promise.reject('Cancelled');
          }

          if (typeof param === 'undefined' && !manual && pages.length) {
            return Promise.resolve(pages);
          }

          const queryFnContext = {
            queryKey: context.queryKey,
            pageParam: param,
            meta: context.options.meta
          };
          addSignalProperty(queryFnContext);
          const queryFnResult = queryFn(queryFnContext);
          const promise = Promise.resolve(queryFnResult).then(page => buildNewPages(pages, param, page, previous));
          return promise;
        };

        let promise; // Fetch first page?

        if (!oldPages.length) {
          promise = fetchPage([]);
        } // Fetch next page?
        else if (isFetchingNextPage) {
          const manual = typeof pageParam !== 'undefined';
          const param = manual ? pageParam : getNextPageParam(context.options, oldPages);
          promise = fetchPage(oldPages, manual, param);
        } // Fetch previous page?
        else if (isFetchingPreviousPage) {
          const manual = typeof pageParam !== 'undefined';
          const param = manual ? pageParam : getPreviousPageParam(context.options, oldPages);
          promise = fetchPage(oldPages, manual, param, true);
        } // Refetch pages
        else {
          newPageParams = [];
          const manual = typeof context.options.getNextPageParam === 'undefined';
          const shouldFetchFirstPage = refetchPage && oldPages[0] ? refetchPage(oldPages[0], 0, oldPages) : true; // Fetch first page

          promise = shouldFetchFirstPage ? fetchPage([], manual, oldPageParams[0]) : Promise.resolve(buildNewPages([], oldPageParams[0], oldPages[0])); // Fetch remaining pages

          for (let i = 1; i < oldPages.length; i++) {
            promise = promise.then(pages => {
              const shouldFetchNextPage = refetchPage && oldPages[i] ? refetchPage(oldPages[i], i, oldPages) : true;

              if (shouldFetchNextPage) {
                const param = manual ? oldPageParams[i] : getNextPageParam(context.options, pages);
                return fetchPage(pages, manual, param);
              }

              return Promise.resolve(buildNewPages(pages, oldPageParams[i], oldPages[i]));
            });
          }
        }

        const finalPromise = promise.then(pages => ({
          pages,
          pageParams: newPageParams
        }));
        return finalPromise;
      };
    }
  };
}
function getNextPageParam(options, pages) {
  return options.getNextPageParam == null ? void 0 : options.getNextPageParam(pages[pages.length - 1], pages);
}
function getPreviousPageParam(options, pages) {
  return options.getPreviousPageParam == null ? void 0 : options.getPreviousPageParam(pages[0], pages);
}
/**
 * Checks if there is a next page.
 * Returns `undefined` if it cannot be determined.
 */

function hasNextPage(options, pages) {
  if (options.getNextPageParam && Array.isArray(pages)) {
    const nextPageParam = getNextPageParam(options, pages);
    return typeof nextPageParam !== 'undefined' && nextPageParam !== null && nextPageParam !== false;
  }

  return;
}
/**
 * Checks if there is a previous page.
 * Returns `undefined` if it cannot be determined.
 */

function hasPreviousPage(options, pages) {
  if (options.getPreviousPageParam && Array.isArray(pages)) {
    const previousPageParam = getPreviousPageParam(options, pages);
    return typeof previousPageParam !== 'undefined' && previousPageParam !== null && previousPageParam !== false;
  }

  return;
}


//# sourceMappingURL=infiniteQueryBehavior.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/queryClient.mjs









// CLASS
class QueryClient {
  constructor(config = {}) {
    this.queryCache = config.queryCache || new QueryCache();
    this.mutationCache = config.mutationCache || new MutationCache();
    this.logger = config.logger || defaultLogger;
    this.defaultOptions = config.defaultOptions || {};
    this.queryDefaults = [];
    this.mutationDefaults = [];
    this.mountCount = 0;

    if (false) {}
  }

  mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
    this.unsubscribeFocus = focusManager.subscribe(() => {
      if (focusManager.isFocused()) {
        this.resumePausedMutations();
        this.queryCache.onFocus();
      }
    });
    this.unsubscribeOnline = onlineManager.subscribe(() => {
      if (onlineManager.isOnline()) {
        this.resumePausedMutations();
        this.queryCache.onOnline();
      }
    });
  }

  unmount() {
    var _this$unsubscribeFocu, _this$unsubscribeOnli;

    this.mountCount--;
    if (this.mountCount !== 0) return;
    (_this$unsubscribeFocu = this.unsubscribeFocus) == null ? void 0 : _this$unsubscribeFocu.call(this);
    this.unsubscribeFocus = undefined;
    (_this$unsubscribeOnli = this.unsubscribeOnline) == null ? void 0 : _this$unsubscribeOnli.call(this);
    this.unsubscribeOnline = undefined;
  }

  isFetching(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    filters.fetchStatus = 'fetching';
    return this.queryCache.findAll(filters).length;
  }

  isMutating(filters) {
    return this.mutationCache.findAll({ ...filters,
      fetching: true
    }).length;
  }

  getQueryData(queryKey, filters) {
    var _this$queryCache$find;

    return (_this$queryCache$find = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find.state.data;
  }

  ensureQueryData(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    const cachedData = this.getQueryData(parsedOptions.queryKey);
    return cachedData ? Promise.resolve(cachedData) : this.fetchQuery(parsedOptions);
  }

  getQueriesData(queryKeyOrFilters) {
    return this.getQueryCache().findAll(queryKeyOrFilters).map(({
      queryKey,
      state
    }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }

  setQueryData(queryKey, updater, options) {
    const query = this.queryCache.find(queryKey);
    const prevData = query == null ? void 0 : query.state.data;
    const data = functionalUpdate(updater, prevData);

    if (typeof data === 'undefined') {
      return undefined;
    }

    const parsedOptions = parseQueryArgs(queryKey);
    const defaultedOptions = this.defaultQueryOptions(parsedOptions);
    return this.queryCache.build(this, defaultedOptions).setData(data, { ...options,
      manual: true
    });
  }

  setQueriesData(queryKeyOrFilters, updater, options) {
    return notifyManager.batch(() => this.getQueryCache().findAll(queryKeyOrFilters).map(({
      queryKey
    }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
  }

  getQueryState(queryKey, filters) {
    var _this$queryCache$find2;

    return (_this$queryCache$find2 = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find2.state;
  }

  removeQueries(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    const queryCache = this.queryCache;
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach(query => {
        queryCache.remove(query);
      });
    });
  }

  resetQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    const queryCache = this.queryCache;
    const refetchFilters = {
      type: 'active',
      ...filters
    };
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach(query => {
        query.reset();
      });
      return this.refetchQueries(refetchFilters, options);
    });
  }

  cancelQueries(arg1, arg2, arg3) {
    const [filters, cancelOptions = {}] = parseFilterArgs(arg1, arg2, arg3);

    if (typeof cancelOptions.revert === 'undefined') {
      cancelOptions.revert = true;
    }

    const promises = notifyManager.batch(() => this.queryCache.findAll(filters).map(query => query.cancel(cancelOptions)));
    return Promise.all(promises).then(noop).catch(noop);
  }

  invalidateQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    return notifyManager.batch(() => {
      var _ref, _filters$refetchType;

      this.queryCache.findAll(filters).forEach(query => {
        query.invalidate();
      });

      if (filters.refetchType === 'none') {
        return Promise.resolve();
      }

      const refetchFilters = { ...filters,
        type: (_ref = (_filters$refetchType = filters.refetchType) != null ? _filters$refetchType : filters.type) != null ? _ref : 'active'
      };
      return this.refetchQueries(refetchFilters, options);
    });
  }

  refetchQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    const promises = notifyManager.batch(() => this.queryCache.findAll(filters).filter(query => !query.isDisabled()).map(query => {
      var _options$cancelRefetc;

      return query.fetch(undefined, { ...options,
        cancelRefetch: (_options$cancelRefetc = options == null ? void 0 : options.cancelRefetch) != null ? _options$cancelRefetc : true,
        meta: {
          refetchPage: filters.refetchPage
        }
      });
    }));
    let promise = Promise.all(promises).then(noop);

    if (!(options != null && options.throwOnError)) {
      promise = promise.catch(noop);
    }

    return promise;
  }

  fetchQuery(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    const defaultedOptions = this.defaultQueryOptions(parsedOptions); // https://github.com/tannerlinsley/react-query/issues/652

    if (typeof defaultedOptions.retry === 'undefined') {
      defaultedOptions.retry = false;
    }

    const query = this.queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(defaultedOptions.staleTime) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }

  prefetchQuery(arg1, arg2, arg3) {
    return this.fetchQuery(arg1, arg2, arg3).then(noop).catch(noop);
  }

  fetchInfiniteQuery(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    parsedOptions.behavior = infiniteQueryBehavior();
    return this.fetchQuery(parsedOptions);
  }

  prefetchInfiniteQuery(arg1, arg2, arg3) {
    return this.fetchInfiniteQuery(arg1, arg2, arg3).then(noop).catch(noop);
  }

  resumePausedMutations() {
    return this.mutationCache.resumePausedMutations();
  }

  getQueryCache() {
    return this.queryCache;
  }

  getMutationCache() {
    return this.mutationCache;
  }

  getLogger() {
    return this.logger;
  }

  getDefaultOptions() {
    return this.defaultOptions;
  }

  setDefaultOptions(options) {
    this.defaultOptions = options;
  }

  setQueryDefaults(queryKey, options) {
    const result = this.queryDefaults.find(x => hashQueryKey(queryKey) === hashQueryKey(x.queryKey));

    if (result) {
      result.defaultOptions = options;
    } else {
      this.queryDefaults.push({
        queryKey,
        defaultOptions: options
      });
    }
  }

  getQueryDefaults(queryKey) {
    if (!queryKey) {
      return undefined;
    } // Get the first matching defaults


    const firstMatchingDefaults = this.queryDefaults.find(x => partialMatchKey(queryKey, x.queryKey)); // Additional checks and error in dev mode

    if (false) {}

    return firstMatchingDefaults == null ? void 0 : firstMatchingDefaults.defaultOptions;
  }

  setMutationDefaults(mutationKey, options) {
    const result = this.mutationDefaults.find(x => hashQueryKey(mutationKey) === hashQueryKey(x.mutationKey));

    if (result) {
      result.defaultOptions = options;
    } else {
      this.mutationDefaults.push({
        mutationKey,
        defaultOptions: options
      });
    }
  }

  getMutationDefaults(mutationKey) {
    if (!mutationKey) {
      return undefined;
    } // Get the first matching defaults


    const firstMatchingDefaults = this.mutationDefaults.find(x => partialMatchKey(mutationKey, x.mutationKey)); // Additional checks and error in dev mode

    if (false) {}

    return firstMatchingDefaults == null ? void 0 : firstMatchingDefaults.defaultOptions;
  }

  defaultQueryOptions(options) {
    if (options != null && options._defaulted) {
      return options;
    }

    const defaultedOptions = { ...this.defaultOptions.queries,
      ...this.getQueryDefaults(options == null ? void 0 : options.queryKey),
      ...options,
      _defaulted: true
    };

    if (!defaultedOptions.queryHash && defaultedOptions.queryKey) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
    } // dependent default values


    if (typeof defaultedOptions.refetchOnReconnect === 'undefined') {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== 'always';
    }

    if (typeof defaultedOptions.useErrorBoundary === 'undefined') {
      defaultedOptions.useErrorBoundary = !!defaultedOptions.suspense;
    }

    return defaultedOptions;
  }

  defaultMutationOptions(options) {
    if (options != null && options._defaulted) {
      return options;
    }

    return { ...this.defaultOptions.mutations,
      ...this.getMutationDefaults(options == null ? void 0 : options.mutationKey),
      ...options,
      _defaulted: true
    };
  }

  clear() {
    this.queryCache.clear();
    this.mutationCache.clear();
  }

}


//# sourceMappingURL=queryClient.mjs.map

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(294);
;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs
'use client';


const defaultContext = /*#__PURE__*/react.createContext(undefined);
const QueryClientSharingContext = /*#__PURE__*/react.createContext(false); // If we are given a context, we will use it.
// Otherwise, if contextSharing is on, we share the first and at least one
// instance of the context across the window
// to ensure that if React Query is used across
// different bundles or microfrontends they will
// all use the same **instance** of context, regardless
// of module scoping.

function getQueryClientContext(context, contextSharing) {
  if (context) {
    return context;
  }

  if (contextSharing && typeof window !== 'undefined') {
    if (!window.ReactQueryClientContext) {
      window.ReactQueryClientContext = defaultContext;
    }

    return window.ReactQueryClientContext;
  }

  return defaultContext;
}

const useQueryClient = ({
  context
} = {}) => {
  const queryClient = react.useContext(getQueryClientContext(context, react.useContext(QueryClientSharingContext)));

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  return queryClient;
};
const QueryClientProvider = ({
  client,
  children,
  context,
  contextSharing = false
}) => {
  react.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);

  if (false) {}

  const Context = getQueryClientContext(context, contextSharing);
  return /*#__PURE__*/react.createElement(QueryClientSharingContext.Provider, {
    value: !context && contextSharing
  }, /*#__PURE__*/react.createElement(Context.Provider, {
    value: client
  }, children));
};


//# sourceMappingURL=QueryClientProvider.mjs.map

// EXTERNAL MODULE: ./node_modules/react-dom/client.js
var client = __webpack_require__(745);
// EXTERNAL MODULE: ./src/assets/plugin.scss
var assets_plugin = __webpack_require__(921);
;// CONCATENATED MODULE: ./src/views/home/Home.tsx

const HomePage = () => {
    return (react.createElement("div", null,
        react.createElement("h1", null, "Home Page")));
};

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/queryObserver.mjs






class QueryObserver extends Subscribable {
  constructor(client, options) {
    super();
    this.client = client;
    this.options = options;
    this.trackedProps = new Set();
    this.selectError = null;
    this.bindMethods();
    this.setOptions(options);
  }

  bindMethods() {
    this.remove = this.remove.bind(this);
    this.refetch = this.refetch.bind(this);
  }

  onSubscribe() {
    if (this.listeners.size === 1) {
      this.currentQuery.addObserver(this);

      if (shouldFetchOnMount(this.currentQuery, this.options)) {
        this.executeFetch();
      }

      this.updateTimers();
    }
  }

  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }

  shouldFetchOnReconnect() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnReconnect);
  }

  shouldFetchOnWindowFocus() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnWindowFocus);
  }

  destroy() {
    this.listeners = new Set();
    this.clearStaleTimeout();
    this.clearRefetchInterval();
    this.currentQuery.removeObserver(this);
  }

  setOptions(options, notifyOptions) {
    const prevOptions = this.options;
    const prevQuery = this.currentQuery;
    this.options = this.client.defaultQueryOptions(options);

    if (false) {}

    if (!shallowEqualObjects(prevOptions, this.options)) {
      this.client.getQueryCache().notify({
        type: 'observerOptionsUpdated',
        query: this.currentQuery,
        observer: this
      });
    }

    if (typeof this.options.enabled !== 'undefined' && typeof this.options.enabled !== 'boolean') {
      throw new Error('Expected enabled to be a boolean');
    } // Keep previous query key if the user does not supply one


    if (!this.options.queryKey) {
      this.options.queryKey = prevOptions.queryKey;
    }

    this.updateQuery();
    const mounted = this.hasListeners(); // Fetch if there are subscribers

    if (mounted && shouldFetchOptionally(this.currentQuery, prevQuery, this.options, prevOptions)) {
      this.executeFetch();
    } // Update result


    this.updateResult(notifyOptions); // Update stale interval if needed

    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || this.options.staleTime !== prevOptions.staleTime)) {
      this.updateStaleTimeout();
    }

    const nextRefetchInterval = this.computeRefetchInterval(); // Update refetch interval if needed

    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || nextRefetchInterval !== this.currentRefetchInterval)) {
      this.updateRefetchInterval(nextRefetchInterval);
    }
  }

  getOptimisticResult(options) {
    const query = this.client.getQueryCache().build(this.client, options);
    const result = this.createResult(query, options);

    if (shouldAssignObserverCurrentProperties(this, result, options)) {
      // this assigns the optimistic result to the current Observer
      // because if the query function changes, useQuery will be performing
      // an effect where it would fetch again.
      // When the fetch finishes, we perform a deep data cloning in order
      // to reuse objects references. This deep data clone is performed against
      // the `observer.currentResult.data` property
      // When QueryKey changes, we refresh the query and get new `optimistic`
      // result, while we leave the `observer.currentResult`, so when new data
      // arrives, it finds the old `observer.currentResult` which is related
      // to the old QueryKey. Which means that currentResult and selectData are
      // out of sync already.
      // To solve this, we move the cursor of the currentResult everytime
      // an observer reads an optimistic value.
      // When keeping the previous data, the result doesn't change until new
      // data arrives.
      this.currentResult = result;
      this.currentResultOptions = this.options;
      this.currentResultState = this.currentQuery.state;
    }

    return result;
  }

  getCurrentResult() {
    return this.currentResult;
  }

  trackResult(result) {
    const trackedResult = {};
    Object.keys(result).forEach(key => {
      Object.defineProperty(trackedResult, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          this.trackedProps.add(key);
          return result[key];
        }
      });
    });
    return trackedResult;
  }

  getCurrentQuery() {
    return this.currentQuery;
  }

  remove() {
    this.client.getQueryCache().remove(this.currentQuery);
  }

  refetch({
    refetchPage,
    ...options
  } = {}) {
    return this.fetch({ ...options,
      meta: {
        refetchPage
      }
    });
  }

  fetchOptimistic(options) {
    const defaultedOptions = this.client.defaultQueryOptions(options);
    const query = this.client.getQueryCache().build(this.client, defaultedOptions);
    query.isFetchingOptimistic = true;
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }

  fetch(fetchOptions) {
    var _fetchOptions$cancelR;

    return this.executeFetch({ ...fetchOptions,
      cancelRefetch: (_fetchOptions$cancelR = fetchOptions.cancelRefetch) != null ? _fetchOptions$cancelR : true
    }).then(() => {
      this.updateResult();
      return this.currentResult;
    });
  }

  executeFetch(fetchOptions) {
    // Make sure we reference the latest query as the current one might have been removed
    this.updateQuery(); // Fetch

    let promise = this.currentQuery.fetch(this.options, fetchOptions);

    if (!(fetchOptions != null && fetchOptions.throwOnError)) {
      promise = promise.catch(noop);
    }

    return promise;
  }

  updateStaleTimeout() {
    this.clearStaleTimeout();

    if (isServer || this.currentResult.isStale || !isValidTimeout(this.options.staleTime)) {
      return;
    }

    const time = timeUntilStale(this.currentResult.dataUpdatedAt, this.options.staleTime); // The timeout is sometimes triggered 1 ms before the stale time expiration.
    // To mitigate this issue we always add 1 ms to the timeout.

    const timeout = time + 1;
    this.staleTimeoutId = setTimeout(() => {
      if (!this.currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }

  computeRefetchInterval() {
    var _this$options$refetch;

    return typeof this.options.refetchInterval === 'function' ? this.options.refetchInterval(this.currentResult.data, this.currentQuery) : (_this$options$refetch = this.options.refetchInterval) != null ? _this$options$refetch : false;
  }

  updateRefetchInterval(nextInterval) {
    this.clearRefetchInterval();
    this.currentRefetchInterval = nextInterval;

    if (isServer || this.options.enabled === false || !isValidTimeout(this.currentRefetchInterval) || this.currentRefetchInterval === 0) {
      return;
    }

    this.refetchIntervalId = setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.executeFetch();
      }
    }, this.currentRefetchInterval);
  }

  updateTimers() {
    this.updateStaleTimeout();
    this.updateRefetchInterval(this.computeRefetchInterval());
  }

  clearStaleTimeout() {
    if (this.staleTimeoutId) {
      clearTimeout(this.staleTimeoutId);
      this.staleTimeoutId = undefined;
    }
  }

  clearRefetchInterval() {
    if (this.refetchIntervalId) {
      clearInterval(this.refetchIntervalId);
      this.refetchIntervalId = undefined;
    }
  }

  createResult(query, options) {
    const prevQuery = this.currentQuery;
    const prevOptions = this.options;
    const prevResult = this.currentResult;
    const prevResultState = this.currentResultState;
    const prevResultOptions = this.currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.currentQueryInitialState;
    const prevQueryResult = queryChange ? this.currentResult : this.previousQueryResult;
    const {
      state
    } = query;
    let {
      dataUpdatedAt,
      error,
      errorUpdatedAt,
      fetchStatus,
      status
    } = state;
    let isPreviousData = false;
    let isPlaceholderData = false;
    let data; // Optimistically set result in fetching state if needed

    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);

      if (fetchOnMount || fetchOptionally) {
        fetchStatus = canFetch(query.options.networkMode) ? 'fetching' : 'paused';

        if (!dataUpdatedAt) {
          status = 'loading';
        }
      }

      if (options._optimisticResults === 'isRestoring') {
        fetchStatus = 'idle';
      }
    } // Keep previous data if needed


    if (options.keepPreviousData && !state.dataUpdatedAt && prevQueryResult != null && prevQueryResult.isSuccess && status !== 'error') {
      data = prevQueryResult.data;
      dataUpdatedAt = prevQueryResult.dataUpdatedAt;
      status = prevQueryResult.status;
      isPreviousData = true;
    } // Select data if needed
    else if (options.select && typeof state.data !== 'undefined') {
      // Memoize select result
      if (prevResult && state.data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === this.selectFn) {
        data = this.selectResult;
      } else {
        try {
          this.selectFn = options.select;
          data = options.select(state.data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          this.selectResult = data;
          this.selectError = null;
        } catch (selectError) {
          if (false) {}

          this.selectError = selectError;
        }
      }
    } // Use query data
    else {
      data = state.data;
    } // Show placeholder data if needed


    if (typeof options.placeholderData !== 'undefined' && typeof data === 'undefined' && status === 'loading') {
      let placeholderData; // Memoize placeholder data

      if (prevResult != null && prevResult.isPlaceholderData && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
      } else {
        placeholderData = typeof options.placeholderData === 'function' ? options.placeholderData() : options.placeholderData;

        if (options.select && typeof placeholderData !== 'undefined') {
          try {
            placeholderData = options.select(placeholderData);
            this.selectError = null;
          } catch (selectError) {
            if (false) {}

            this.selectError = selectError;
          }
        }
      }

      if (typeof placeholderData !== 'undefined') {
        status = 'success';
        data = replaceData(prevResult == null ? void 0 : prevResult.data, placeholderData, options);
        isPlaceholderData = true;
      }
    }

    if (this.selectError) {
      error = this.selectError;
      data = this.selectResult;
      errorUpdatedAt = Date.now();
      status = 'error';
    }

    const isFetching = fetchStatus === 'fetching';
    const isLoading = status === 'loading';
    const isError = status === 'error';
    const result = {
      status,
      fetchStatus,
      isLoading,
      isSuccess: status === 'success',
      isError,
      isInitialLoading: isLoading && isFetching,
      data,
      dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: state.fetchFailureCount,
      failureReason: state.fetchFailureReason,
      errorUpdateCount: state.errorUpdateCount,
      isFetched: state.dataUpdateCount > 0 || state.errorUpdateCount > 0,
      isFetchedAfterMount: state.dataUpdateCount > queryInitialState.dataUpdateCount || state.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isLoading,
      isLoadingError: isError && state.dataUpdatedAt === 0,
      isPaused: fetchStatus === 'paused',
      isPlaceholderData,
      isPreviousData,
      isRefetchError: isError && state.dataUpdatedAt !== 0,
      isStale: isStale(query, options),
      refetch: this.refetch,
      remove: this.remove
    };
    return result;
  }

  updateResult(notifyOptions) {
    const prevResult = this.currentResult;
    const nextResult = this.createResult(this.currentQuery, this.options);
    this.currentResultState = this.currentQuery.state;
    this.currentResultOptions = this.options; // Only notify and update result if something has changed

    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }

    this.currentResult = nextResult; // Determine which callbacks to trigger

    const defaultNotifyOptions = {
      cache: true
    };

    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }

      const {
        notifyOnChangeProps
      } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === 'function' ? notifyOnChangeProps() : notifyOnChangeProps;

      if (notifyOnChangePropsValue === 'all' || !notifyOnChangePropsValue && !this.trackedProps.size) {
        return true;
      }

      const includedProps = new Set(notifyOnChangePropsValue != null ? notifyOnChangePropsValue : this.trackedProps);

      if (this.options.useErrorBoundary) {
        includedProps.add('error');
      }

      return Object.keys(this.currentResult).some(key => {
        const typedKey = key;
        const changed = this.currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };

    if ((notifyOptions == null ? void 0 : notifyOptions.listeners) !== false && shouldNotifyListeners()) {
      defaultNotifyOptions.listeners = true;
    }

    this.notify({ ...defaultNotifyOptions,
      ...notifyOptions
    });
  }

  updateQuery() {
    const query = this.client.getQueryCache().build(this.client, this.options);

    if (query === this.currentQuery) {
      return;
    }

    const prevQuery = this.currentQuery;
    this.currentQuery = query;
    this.currentQueryInitialState = query.state;
    this.previousQueryResult = this.currentResult;

    if (this.hasListeners()) {
      prevQuery == null ? void 0 : prevQuery.removeObserver(this);
      query.addObserver(this);
    }
  }

  onQueryUpdate(action) {
    const notifyOptions = {};

    if (action.type === 'success') {
      notifyOptions.onSuccess = !action.manual;
    } else if (action.type === 'error' && !isCancelledError(action.error)) {
      notifyOptions.onError = true;
    }

    this.updateResult(notifyOptions);

    if (this.hasListeners()) {
      this.updateTimers();
    }
  }

  notify(notifyOptions) {
    notifyManager.batch(() => {
      // First trigger the configuration callbacks
      if (notifyOptions.onSuccess) {
        var _this$options$onSucce, _this$options, _this$options$onSettl, _this$options2;

        (_this$options$onSucce = (_this$options = this.options).onSuccess) == null ? void 0 : _this$options$onSucce.call(_this$options, this.currentResult.data);
        (_this$options$onSettl = (_this$options2 = this.options).onSettled) == null ? void 0 : _this$options$onSettl.call(_this$options2, this.currentResult.data, null);
      } else if (notifyOptions.onError) {
        var _this$options$onError, _this$options3, _this$options$onSettl2, _this$options4;

        (_this$options$onError = (_this$options3 = this.options).onError) == null ? void 0 : _this$options$onError.call(_this$options3, this.currentResult.error);
        (_this$options$onSettl2 = (_this$options4 = this.options).onSettled) == null ? void 0 : _this$options$onSettl2.call(_this$options4, undefined, this.currentResult.error);
      } // Then trigger the listeners


      if (notifyOptions.listeners) {
        this.listeners.forEach(({
          listener
        }) => {
          listener(this.currentResult);
        });
      } // Then the cache listeners


      if (notifyOptions.cache) {
        this.client.getQueryCache().notify({
          query: this.currentQuery,
          type: 'observerResultsUpdated'
        });
      }
    });
  }

}

function shouldLoadOnMount(query, options) {
  return options.enabled !== false && !query.state.dataUpdatedAt && !(query.state.status === 'error' && options.retryOnMount === false);
}

function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.dataUpdatedAt > 0 && shouldFetchOn(query, options, options.refetchOnMount);
}

function shouldFetchOn(query, options, field) {
  if (options.enabled !== false) {
    const value = typeof field === 'function' ? field(query) : field;
    return value === 'always' || value !== false && isStale(query, options);
  }

  return false;
}

function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return options.enabled !== false && (query !== prevQuery || prevOptions.enabled === false) && (!options.suspense || query.state.status !== 'error') && isStale(query, options);
}

function isStale(query, options) {
  return query.isStaleByTime(options.staleTime);
} // this function would decide if we will update the observer's 'current'
// properties after an optimistic reading via getOptimisticResult


function shouldAssignObserverCurrentProperties(observer, optimisticResult, options) {
  // it is important to keep this condition like this for three reasons:
  // 1. It will get removed in the v5
  // 2. it reads: don't update the properties if we want to keep the previous
  // data.
  // 3. The opposite condition (!options.keepPreviousData) would fallthrough
  // and will result in a bad decision
  if (options.keepPreviousData) {
    return false;
  } // this means we want to put some placeholder data when pending and queryKey
  // changed.


  if (options.placeholderData !== undefined) {
    // re-assign properties only if current data is placeholder data
    // which means that data did not arrive yet, so, if there is some cached data
    // we need to "prepare" to receive it
    return optimisticResult.isPlaceholderData;
  } // if the newly created result isn't what the observer is holding as current,
  // then we'll need to update the properties as well


  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  } // basically, just keep previous properties if nothing changed


  return false;
}


//# sourceMappingURL=queryObserver.mjs.map

// EXTERNAL MODULE: ./node_modules/use-sync-external-store/shim/index.js
var shim = __webpack_require__(688);
;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/useSyncExternalStore.mjs
'use client';


const useSyncExternalStore = shim.useSyncExternalStore;


//# sourceMappingURL=useSyncExternalStore.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/QueryErrorResetBoundary.mjs
'use client';


function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}

const QueryErrorResetBoundaryContext = /*#__PURE__*/react.createContext(createValue()); // HOOK

const useQueryErrorResetBoundary = () => react.useContext(QueryErrorResetBoundaryContext); // COMPONENT

const QueryErrorResetBoundary = ({
  children
}) => {
  const [value] = React.useState(() => createValue());
  return /*#__PURE__*/React.createElement(QueryErrorResetBoundaryContext.Provider, {
    value: value
  }, typeof children === 'function' ? children(value) : children);
};


//# sourceMappingURL=QueryErrorResetBoundary.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/isRestoring.mjs
'use client';


const IsRestoringContext = /*#__PURE__*/react.createContext(false);
const useIsRestoring = () => react.useContext(IsRestoringContext);
const IsRestoringProvider = IsRestoringContext.Provider;


//# sourceMappingURL=isRestoring.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/utils.mjs
function shouldThrowError(_useErrorBoundary, params) {
  // Allow useErrorBoundary function to override throwing behavior on a per-error basis
  if (typeof _useErrorBoundary === 'function') {
    return _useErrorBoundary(...params);
  }

  return !!_useErrorBoundary;
}


//# sourceMappingURL=utils.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/errorBoundaryUtils.mjs
'use client';



const ensurePreventErrorBoundaryRetry = (options, errorResetBoundary) => {
  if (options.suspense || options.useErrorBoundary) {
    // Prevent retrying failed query if the error boundary has not been reset yet
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
const useClearResetErrorBoundary = errorResetBoundary => {
  react.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
const getHasError = ({
  result,
  errorResetBoundary,
  useErrorBoundary,
  query
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && shouldThrowError(useErrorBoundary, [result.error, query]);
};


//# sourceMappingURL=errorBoundaryUtils.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/suspense.mjs
const ensureStaleTime = defaultedOptions => {
  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly mounting after suspending
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1000;
    }
  }
};
const willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
const shouldSuspend = (defaultedOptions, result, isRestoring) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && willFetch(result, isRestoring);
const fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).then(({
  data
}) => {
  defaultedOptions.onSuccess == null ? void 0 : defaultedOptions.onSuccess(data);
  defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(data, null);
}).catch(error => {
  errorResetBoundary.clearReset();
  defaultedOptions.onError == null ? void 0 : defaultedOptions.onError(error);
  defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(undefined, error);
});


//# sourceMappingURL=suspense.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/useBaseQuery.mjs
'use client';









function useBaseQuery(options, Observer) {
  const queryClient = useQueryClient({
    context: options.context
  });
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedOptions = queryClient.defaultQueryOptions(options); // Make sure results are optimistically set in fetching state before subscribing or updating options

  defaultedOptions._optimisticResults = isRestoring ? 'isRestoring' : 'optimistic'; // Include callbacks in batch renders

  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  ensureStaleTime(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = react.useState(() => new Observer(queryClient, defaultedOptions));
  const result = observer.getOptimisticResult(defaultedOptions);
  useSyncExternalStore(react.useCallback(onStoreChange => {
    const unsubscribe = isRestoring ? () => undefined : observer.subscribe(notifyManager.batchCalls(onStoreChange)); // Update result to make sure we did not miss any query updates
    // between creating the observer and subscribing to it.

    observer.updateResult();
    return unsubscribe;
  }, [observer, isRestoring]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  react.useEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions(defaultedOptions, {
      listeners: false
    });
  }, [defaultedOptions, observer]); // Handle suspense

  if (shouldSuspend(defaultedOptions, result, isRestoring)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  } // Handle error boundary


  if (getHasError({
    result,
    errorResetBoundary,
    useErrorBoundary: defaultedOptions.useErrorBoundary,
    query: observer.getCurrentQuery()
  })) {
    throw result.error;
  } // Handle result property usage tracking


  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}


//# sourceMappingURL=useBaseQuery.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/useQuery.mjs
'use client';



function useQuery(arg1, arg2, arg3) {
  const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
  return useBaseQuery(parsedOptions, QueryObserver);
}


//# sourceMappingURL=useQuery.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/query-core/build/lib/mutationObserver.mjs





// CLASS
class MutationObserver extends Subscribable {
  constructor(client, options) {
    super();
    this.client = client;
    this.setOptions(options);
    this.bindMethods();
    this.updateResult();
  }

  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }

  setOptions(options) {
    var _this$currentMutation;

    const prevOptions = this.options;
    this.options = this.client.defaultMutationOptions(options);

    if (!shallowEqualObjects(prevOptions, this.options)) {
      this.client.getMutationCache().notify({
        type: 'observerOptionsUpdated',
        mutation: this.currentMutation,
        observer: this
      });
    }

    (_this$currentMutation = this.currentMutation) == null ? void 0 : _this$currentMutation.setOptions(this.options);
  }

  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$currentMutation2;

      (_this$currentMutation2 = this.currentMutation) == null ? void 0 : _this$currentMutation2.removeObserver(this);
    }
  }

  onMutationUpdate(action) {
    this.updateResult(); // Determine which callbacks to trigger

    const notifyOptions = {
      listeners: true
    };

    if (action.type === 'success') {
      notifyOptions.onSuccess = true;
    } else if (action.type === 'error') {
      notifyOptions.onError = true;
    }

    this.notify(notifyOptions);
  }

  getCurrentResult() {
    return this.currentResult;
  }

  reset() {
    this.currentMutation = undefined;
    this.updateResult();
    this.notify({
      listeners: true
    });
  }

  mutate(variables, options) {
    this.mutateOptions = options;

    if (this.currentMutation) {
      this.currentMutation.removeObserver(this);
    }

    this.currentMutation = this.client.getMutationCache().build(this.client, { ...this.options,
      variables: typeof variables !== 'undefined' ? variables : this.options.variables
    });
    this.currentMutation.addObserver(this);
    return this.currentMutation.execute();
  }

  updateResult() {
    const state = this.currentMutation ? this.currentMutation.state : mutation_getDefaultState();
    const result = { ...state,
      isLoading: state.status === 'loading',
      isSuccess: state.status === 'success',
      isError: state.status === 'error',
      isIdle: state.status === 'idle',
      mutate: this.mutate,
      reset: this.reset
    };
    this.currentResult = result;
  }

  notify(options) {
    notifyManager.batch(() => {
      // First trigger the mutate callbacks
      if (this.mutateOptions && this.hasListeners()) {
        if (options.onSuccess) {
          var _this$mutateOptions$o, _this$mutateOptions, _this$mutateOptions$o2, _this$mutateOptions2;

          (_this$mutateOptions$o = (_this$mutateOptions = this.mutateOptions).onSuccess) == null ? void 0 : _this$mutateOptions$o.call(_this$mutateOptions, this.currentResult.data, this.currentResult.variables, this.currentResult.context);
          (_this$mutateOptions$o2 = (_this$mutateOptions2 = this.mutateOptions).onSettled) == null ? void 0 : _this$mutateOptions$o2.call(_this$mutateOptions2, this.currentResult.data, null, this.currentResult.variables, this.currentResult.context);
        } else if (options.onError) {
          var _this$mutateOptions$o3, _this$mutateOptions3, _this$mutateOptions$o4, _this$mutateOptions4;

          (_this$mutateOptions$o3 = (_this$mutateOptions3 = this.mutateOptions).onError) == null ? void 0 : _this$mutateOptions$o3.call(_this$mutateOptions3, this.currentResult.error, this.currentResult.variables, this.currentResult.context);
          (_this$mutateOptions$o4 = (_this$mutateOptions4 = this.mutateOptions).onSettled) == null ? void 0 : _this$mutateOptions$o4.call(_this$mutateOptions4, undefined, this.currentResult.error, this.currentResult.variables, this.currentResult.context);
        }
      } // Then trigger the listeners


      if (options.listeners) {
        this.listeners.forEach(({
          listener
        }) => {
          listener(this.currentResult);
        });
      }
    });
  }

}


//# sourceMappingURL=mutationObserver.mjs.map

;// CONCATENATED MODULE: ./node_modules/@tanstack/react-query/build/lib/useMutation.mjs
'use client';






function useMutation(arg1, arg2, arg3) {
  const options = parseMutationArgs(arg1, arg2, arg3);
  const queryClient = useQueryClient({
    context: options.context
  });
  const [observer] = react.useState(() => new MutationObserver(queryClient, options));
  react.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = useSyncExternalStore(react.useCallback(onStoreChange => observer.subscribe(notifyManager.batchCalls(onStoreChange)), [observer]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  const mutate = react.useCallback((variables, mutateOptions) => {
    observer.mutate(variables, mutateOptions).catch(useMutation_noop);
  }, [observer]);

  if (result.error && shouldThrowError(observer.options.useErrorBoundary, [result.error])) {
    throw result.error;
  }

  return { ...result,
    mutate,
    mutateAsync: result.mutate
  };
} // eslint-disable-next-line @typescript-eslint/no-empty-function

function useMutation_noop() {}


//# sourceMappingURL=useMutation.mjs.map

;// CONCATENATED MODULE: ./src/utils/formatDuration.ts
function formatDuration(seconds) {
    var date = new Date(0);
    if (seconds)
        date.setSeconds(seconds); // specify value for SECONDS here
    return date.toISOString().substring(11, 19);
    //   if (isNaN(seconds)) return '';
    //   seconds = Math.round(seconds);
    //   const m = Math.floor(seconds / 60);
    //   const s = seconds % 60;
    //   return `${m}:${('0' + s).slice(-2)}`;
}

;// CONCATENATED MODULE: ./src/utils/datestamp.ts

function datestamp() {
    let dateObj = new Date();
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();
    return [year, month, day].join('-');
}
function parseDate(s) {
    return new Date(Date.parse(s));
}
function since(s) {
    const d = new Date(Date.parse(s));
    const dif = Date.now() - d.getTime();
    return formatDuration(dif / 1000);
}

// EXTERNAL MODULE: ./node_modules/cross-fetch/dist/browser-ponyfill.js
var browser_ponyfill = __webpack_require__(98);
var browser_ponyfill_default = /*#__PURE__*/__webpack_require__.n(browser_ponyfill);
;// CONCATENATED MODULE: ./src/utils/fetchWordpressAjax.tsx
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function fetchWordpressAjax(params = { action: '' }) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL(location.origin);
        url.pathname = '/wp-admin/admin-ajax.php';
        Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
        const res = yield browser_ponyfill_default()(url);
        if (!res.ok) {
            const info = { message: 'ERROR', description: 'There was a problem' };
            try {
                const err = yield res.json();
                info.message = (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : '';
                info.description = (_b = err === null || err === void 0 ? void 0 : err.description) !== null && _b !== void 0 ? _b : '';
            }
            catch (e) { }
            return Promise.reject({ error: info });
        }
        const data = yield res.json();
        return data;
    });
}

;// CONCATENATED MODULE: ./src/views/jobs/Jobs.tsx





var JobStatus;
(function (JobStatus) {
    JobStatus["NONE"] = "none";
    JobStatus["STARTING"] = "starting";
    JobStatus["STARTED"] = "started";
    JobStatus["STOPPING"] = "stopping";
    JobStatus["STOPPED"] = "stopped";
    JobStatus["COMPLETING"] = "completing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["DELETING"] = "deleting";
    JobStatus["ERROR"] = "error";
})(JobStatus || (JobStatus = {}));
var JobProcess;
(function (JobProcess) {
    JobProcess["IDLE"] = "idle";
    JobProcess["RUNNING"] = "running";
})(JobProcess || (JobProcess = {}));
const useJobs = () => {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: () => {
            return fetchWordpressAjax({ action: 'cronjob_do_cmd', cmd: 'get_jobs' });
        },
        // keepPreviousData: true,
        initialData: [],
        placeholderData: [],
        refetchInterval: 5000
    });
};
const useJobsStatus = (cmd) => {
    return useQuery({
        queryKey: ['jobs_status', cmd],
        queryFn: () => {
            return fetchWordpressAjax({ action: 'cronjob_do_cmd', cmd });
        }
    });
};
const ICON_PLAY = String.fromCharCode(9654);
const ICON_PAUSE = '⏸︎';
const ICON_REFRESH = '↺';
const ICON_WAITING = react.createElement("div", { className: 'spinner-grow spinner-grow-sm', role: 'status' });
const iCON_DELETE = react.createElement(react.Fragment, null, "\u00D7");
const ICON_ERROR = '!';
const JobIcon = ({ job }) => {
    switch (job.status) {
        case JobStatus.STARTED:
            return ICON_PAUSE;
        case JobStatus.STOPPING:
        case JobStatus.COMPLETING:
        case JobStatus.STARTING:
        case JobStatus.DELETING:
            return ICON_WAITING;
        case JobStatus.COMPLETED:
            return iCON_DELETE;
        case JobStatus.STOPPED:
            return iCON_DELETE;
        case JobStatus.ERROR:
            return ICON_ERROR;
        case JobStatus.NONE:
        default:
            return ICON_PLAY;
    }
};
const Jobs = () => {
    var _a, _b;
    const jobs = useJobs();
    const [statusCmd, setStatusCmd] = (0,react.useState)('pause_jobs');
    const jobsStatus = useJobsStatus(statusCmd);
    const queryClient = useQueryClient();
    const updateJobs = () => {
        queryClient.invalidateQueries(['jobs']);
    };
    const mutationJob = useMutation({
        mutationFn: (options) => fetchWordpressAjax(Object.assign({ action: 'cronjob_do_cmd' }, options)),
        onSuccess: (data) => queryClient.setQueryData(['jobs'], data)
    });
    const mutationJobStatus = useMutation({
        mutationFn: (options) => fetchWordpressAjax(Object.assign({ action: 'cronjob_do_cmd' }, options)),
        onSuccess: (data) => {
            console.log('success', data);
            queryClient.setQueryData(['jobs_status'], data);
        }
    });
    const cleanJobs = () => {
        mutationJob.mutate({ cmd: 'clean_jobs' });
    };
    const createJob = () => {
        const action = prompt('Action?', 'import_western_page');
        if (action) {
            mutationJob.mutate({ cmd: 'create_job', job_args: JSON.stringify({ action, product_id: 6 }) });
        }
    };
    const importWPS = () => {
        const product_id = prompt('Product ID?');
        if (product_id) {
            mutationJob.mutate({ cmd: 'create_job', job_args: JSON.stringify({ action: 'import_western_product', product_id }) });
        }
    };
    const resetJob = (job) => {
        mutationJob.mutate({ cmd: 'reset_job', job_id: job.id });
    };
    const deleteJob = (job) => {
        if (job.status === JobStatus.DELETING) {
            if (confirm('Are you sure you want to force delete this job?')) {
                mutationJob.mutate({ cmd: 'force_delete_job', job_id: job.id });
            }
        }
        else {
            if (confirm('Are you sure you want to delete this job?')) {
                mutationJob.mutate({ cmd: 'delete_job', job_id: job.id });
            }
        }
    };
    const startJob = (job) => {
        mutationJob.mutate({ cmd: 'start_job', job_id: job.id });
    };
    const stopJob = (job) => {
        mutationJob.mutate({ cmd: 'stop_job', job_id: job.id });
    };
    const processJobs = () => {
        mutationJob.mutate({ cmd: 'process_jobs' });
    };
    const toggleJobsStatus = () => {
        console.log(statusCmd === 'resume_jobs' ? 'pause_jobs' : 'resume_jobs');
        setStatusCmd((cmd) => (cmd === 'resume_jobs' ? 'pause_jobs' : 'resume_jobs'));
        // mutationJobStatus.mutate({ cmd: jobsStatus.data.active ? 'pause_jobs' : 'resume_jobs' });
    };
    const toggleJob = (job) => {
        switch (job.status) {
            case JobStatus.NONE:
                startJob(job);
                break;
            case JobStatus.STARTING:
                alert('Starting...');
                break;
            case JobStatus.STARTED:
                stopJob(job);
                break;
            case JobStatus.COMPLETING:
                alert('Completing...');
            case JobStatus.COMPLETED:
                deleteJob(job);
                break;
            case JobStatus.STOPPING:
                alert('Stopping...');
            case JobStatus.STOPPED:
                deleteJob(job);
                break;
            case JobStatus.DELETING:
                alert('Deleting...');
            case JobStatus.ERROR:
                alert('There was a problem running this job.');
        }
    };
    return (react.createElement("div", { className: 'd-flex flex-column gap-3 p-3' },
        react.createElement("div", { className: 'd-flex gap-3' },
            react.createElement("button", { className: 'btn btn-primary', onClick: cleanJobs }, "Clean Jobs"),
            react.createElement("button", { className: 'btn btn-primary', onClick: createJob }, "Create Job"),
            react.createElement("button", { className: 'btn btn-primary', onClick: processJobs }, "Process Jobs"),
            react.createElement("button", { className: 'btn btn-primary', onClick: importWPS }, "Import WPS"),
            react.createElement("button", { className: 'btn btn-primary btn-icon', onClick: toggleJobsStatus }, ((_a = jobsStatus === null || jobsStatus === void 0 ? void 0 : jobsStatus.data) === null || _a === void 0 ? void 0 : _a.active) ? ICON_PAUSE : ICON_PLAY)),
        react.createElement("div", { className: 'position-relative' },
            react.createElement("div", { className: 'bg-primary', style: { opacity: jobs.isFetching || mutationJob.isLoading ? 1 : 0, transition: 'opacity 0.3s', width: '100%', height: 5 } }),
            ((_b = jobs.data) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (react.createElement("table", { className: 'table table-sm table-bordered align-middle' },
                react.createElement("thead", null,
                    react.createElement("tr", null,
                        react.createElement("th", { style: { width: 1 } }),
                        react.createElement("th", null, "id"),
                        react.createElement("th", null, "process"),
                        react.createElement("th", null, "status"),
                        react.createElement("th", null, "action"),
                        react.createElement("th", null, "timer"),
                        react.createElement("th", null, "args"),
                        react.createElement("th", { style: { width: 1 } },
                            react.createElement("button", { className: 'btn btn-primary', onClick: updateJobs }, ICON_REFRESH)))),
                react.createElement("tbody", { className: 'table-group-divider' }, jobs.data.map((job) => {
                    var _a;
                    return (react.createElement(react.Fragment, null,
                        react.createElement("tr", null,
                            react.createElement("td", null,
                                react.createElement("button", { className: 'btn btn-primary btn-icon', style: { fontFamily: 'initial' }, onClick: () => toggleJob(job) },
                                    react.createElement(JobIcon, { job: job }))),
                            react.createElement("td", null, job.id),
                            react.createElement("td", null, (_a = job === null || job === void 0 ? void 0 : job.process) !== null && _a !== void 0 ? _a : 'unknown'),
                            react.createElement("td", null, job.status),
                            react.createElement("td", null, job.action),
                            react.createElement("td", { title: job.created }, job.completed ? since(job.completed) : job.started ? react.createElement("b", null, since(job.started)) : '-'),
                            react.createElement("td", null, Object.keys(job.args).map((k) => (react.createElement("span", null,
                                k,
                                ": ",
                                job.args[k],
                                ",",
                                ' ')))),
                            react.createElement("td", { className: 'd-flex gap-2' },
                                react.createElement("button", { className: 'btn btn-primary', onClick: () => resetJob(job), title: 'reset' }, "reset"),
                                react.createElement("button", { className: 'btn btn-primary', onClick: () => deleteJob(job), title: 'delete' }, "\u00D7")))));
                })))) : (react.createElement("div", null, jobs.isLoading ? react.createElement("h4", null, "Loadiung...") : react.createElement("h4", null, "Currently, there are no jobs in progress."))))));
};

;// CONCATENATED MODULE: ./src/views/logs/Logs.tsx



const useLogs = () => {
    return useQuery({
        queryKey: ['logs'],
        queryFn: () => {
            return fetchWordpressAjax({ action: 'logs_do_cmd', cmd: 'get_logs' });
        },
        keepPreviousData: true,
        initialData: [],
        refetchInterval: 10000
    });
};
const Logs = () => {
    var _a, _b, _c, _d;
    const queryClient = useQueryClient();
    const logs = useLogs();
    const $pre = react.useRef();
    const mutationLog = useMutation({
        mutationFn: (options) => fetchWordpressAjax(Object.assign({ action: 'logs_do_cmd' }, options)),
        onSuccess: (data) => queryClient.setQueryData(['logs'], data)
    });
    const refresh = () => {
        queryClient.invalidateQueries(['logs']);
    };
    const clear = () => {
        mutationLog.mutate({ cmd: 'clear_logs' });
    };
    return (react.createElement("div", { className: 'd-flex flex-column gap-3 p-3' },
        react.createElement("div", { className: 'd-flex gap-3' },
            react.createElement("button", { className: 'btn btn-primary', onClick: clear }, "Clear Logs"),
            react.createElement("button", { className: 'btn btn-primary', onClick: refresh }, "\u21BA")),
        react.createElement("div", { className: 'position-relative' },
            react.createElement("div", { style: { background: 'black', padding: '0.5em' } },
                react.createElement("pre", { ref: $pre, style: {
                        color: 'orange',
                        margin: 0,
                        padding: 0,
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        lineHeight: 1.5,
                        maxHeight: 1.5 * 12 * 50,
                        minHeight: 300
                    }, dangerouslySetInnerHTML: { __html: (_d = (_c = (_b = (_a = logs === null || logs === void 0 ? void 0 : logs.data) === null || _a === void 0 ? void 0 : _a.splice) === null || _b === void 0 ? void 0 : _b.call(_a, 0)) === null || _c === void 0 ? void 0 : _c.reverse().join('\n')) !== null && _d !== void 0 ? _d : '' } })))));
};

;// CONCATENATED MODULE: ./src/wordpress-plugin.tsx







// import { WordPressApp } from './wordpress/WordpressApp';
// const root = createRoot(document.getElementById('product-root'));
// root.render(<WordPressApp />);
// const InputField = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
//   return (
//     <>
//       <label htmlFor={`input_${name}`}>{label}</label>
//       <input type='text' id={`input_${name}`} name={name} value={value} onChange={onChange} />
//     </>
//   );
// };
// const AppInner = () => {
//   return <div>Main</div>;
// };
// const xAppInner = () => {
//   const [pageSize, setPageSize] = useState(100);
//   const [pageCursor, setPageCursor] = useState<string>(null);
//   const [productId, setProductId] = useState<number>(null);
//   const products = useWesternProducts({ pageSize, pageCursor });
//   const post = usePost('MASTER_952322');
//   useEffect(() => {
//     if (post.isSuccess) {
//       setFields({
//         'post[post_title]': post.data.post_title,
//         'post[meta_input][_sku]': post.data.meta_input._sku,
//         'post[post_content]': post.data.post_content,
//         'post[meta_input][_price]': post.data.meta_input._price
//       });
//     }
//   }, [post.isSuccess]);
//   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
//     e.preventDefault();
//     const data = new FormData(e.currentTarget);
//     const response = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data }).then((r) => r.json());
//     console.log({ response });
//   };
//   const [fields, setFields] = useState({
//     'post[post_title]': 'newprodctitle',
//     'post[meta_input][_sku]': 'MASTER_952322',
//     'post[post_content]': 'desc 231',
//     'post[meta_input][_price]': '99'
//   });
//   const updateFields: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const delta = { [e.currentTarget.getAttribute('name')]: e.currentTarget.value };
//     setFields((f) => ({ ...f, ...delta }));
//   };
//   return (
//     <div style={{ position: 'relative' }}>
//       <PauseCron />
//       {/* <CronStatus /> */}
//       <hr />
//       {/* <TestAPI /> */}
//       {/* <CronJobManager /> */}
//       <hr />
//       <h1>Test React AppZZ</h1>
//       <pre>{JSON.stringify(post, null, 2)}</pre>
//       <form method='post' action='' onSubmit={handleSubmit}>
//         <input type='hidden' name='action' value='ci_woo_action' />
//         <input type='hidden' name='post[post_type]' value='product' />
//         <input type='hidden' name='post[post_status]' value='publish' />
//         <div className='gap-2' style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr' }}>
//           <InputField label='Sku' name='post[meta_input][_sku]' value={fields['post[meta_input][_sku]']} onChange={updateFields} />
//           <InputField label='Title' name='post[post_title]' value={fields['post[post_title]']} onChange={updateFields} />
//           <InputField label='Description' name='post[post_content]' value={fields['post[post_content]']} onChange={updateFields} />
//           <InputField label='Price' name='post[meta_input][_price]' value={fields['post[meta_input][_price]']} onChange={updateFields} />
//         </div>
//         <input type='submit' name='submit_product' value='Add Product' />
//       </form>
//       <input type='number' min={1} max={1000} step={10} value={pageSize} onChange={(e) => setPageSize(parseInt(e.currentTarget.value))} />
//       <button className='btn btn-primary'>Go</button>
//       <button className='btn btn-primary' disabled={!products.data?.meta?.cursor?.next} onClick={() => setPageCursor(products.data?.meta?.cursor?.next)}>
//         Next Page {products.data?.meta?.cursor?.next}
//       </button>
//       <div className='d-flex'>
//         {products.isSuccess ? (
//           <div>
//             {products?.data?.data?.map((p) => (
//               <div key={`row_${p.id}`} onClick={() => setProductId(p.id)}>
//                 {p.name}
//               </div>
//             ))}
//           </div>
//         ) : null}
//         {productId ? <WesternProduct productId={productId} /> : <h1>Waiting</h1>}
//       </div>
//       {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
//       <GlobalLoader />
//     </div>
//   );
// };
const App = ({ children }) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } } });
    return (react.createElement(react.StrictMode, null,
        react.createElement(QueryClientProvider, { client: queryClient }, children)));
};
const render = (id, page = null) => {
    const root = (0,client/* createRoot */.s)(document.getElementById(id));
    switch (page) {
        case 'jobs':
            root.render(react.createElement(App, null,
                react.createElement(Jobs, null),
                react.createElement(Logs, null)));
            break;
        case 'logs':
            root.render(react.createElement(App, null,
                react.createElement(Logs, null)));
            break;
        default:
            root.render(react.createElement(App, null,
                react.createElement(HomePage, null)));
    }
};


/***/ }),

/***/ 250:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var e=__webpack_require__(294);function h(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var k="function"===typeof Object.is?Object.is:h,l=e.useState,m=e.useEffect,n=e.useLayoutEffect,p=e.useDebugValue;function q(a,b){var d=b(),f=l({inst:{value:d,getSnapshot:b}}),c=f[0].inst,g=f[1];n(function(){c.value=d;c.getSnapshot=b;r(c)&&g({inst:c})},[a,d,b]);m(function(){r(c)&&g({inst:c});return a(function(){r(c)&&g({inst:c})})},[a]);p(d);return d}
function r(a){var b=a.getSnapshot;a=a.value;try{var d=b();return!k(a,d)}catch(f){return!0}}function t(a,b){return b()}var u="undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement?t:q;exports.useSyncExternalStore=void 0!==e.useSyncExternalStore?e.useSyncExternalStore:u;


/***/ }),

/***/ 688:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (true) {
  module.exports = __webpack_require__(250);
} else {}


/***/ }),

/***/ 204:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%272%27 fill=%27%23fff%27/%3e%3c/svg%3e";

/***/ }),

/***/ 609:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27%2386b7fe%27/%3e%3c/svg%3e";

/***/ }),

/***/ 469:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27%23fff%27/%3e%3c/svg%3e";

/***/ }),

/***/ 486:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27rgba%280, 0, 0, 0.25%29%27/%3e%3c/svg%3e";

/***/ }),

/***/ 991:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27-4 -4 8 8%27%3e%3ccircle r=%273%27 fill=%27rgba%28255, 255, 255, 0.25%29%27/%3e%3c/svg%3e";

/***/ }),

/***/ 144:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27 width=%2712%27 height=%2712%27 fill=%27none%27 stroke=%27%23dc3545%27%3e%3ccircle cx=%276%27 cy=%276%27 r=%274.5%27/%3e%3cpath stroke-linejoin=%27round%27 d=%27M5.8 3.6h.4L6 6.5z%27/%3e%3ccircle cx=%276%27 cy=%278.2%27 r=%27.6%27 fill=%27%23dc3545%27 stroke=%27none%27/%3e%3c/svg%3e";

/***/ }),

/***/ 254:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%23000%27%3e%3cpath d=%27M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 321:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%23052c65%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 460:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%23212529%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 281:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%236ea8fe%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 647:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%23fff%27%3e%3cpath d=%27M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 692:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%23fff%27%3e%3cpath d=%27M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z%27/%3e%3c/svg%3e";

/***/ }),

/***/ 770:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e";

/***/ }),

/***/ 711:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23dee2e6%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e";

/***/ }),

/***/ 931:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3e%3cpath fill=%27none%27 stroke=%27%23fff%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%273%27 d=%27M6 10h8%27/%3e%3c/svg%3e";

/***/ }),

/***/ 199:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3e%3cpath fill=%27none%27 stroke=%27%23fff%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%273%27 d=%27m6 10 3 3 6-6%27/%3e%3c/svg%3e";

/***/ }),

/***/ 956:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 30 30%27%3e%3cpath stroke=%27rgba%28255, 255, 255, 0.55%29%27 stroke-linecap=%27round%27 stroke-miterlimit=%2710%27 stroke-width=%272%27 d=%27M4 7h22M4 15h22M4 23h22%27/%3e%3c/svg%3e";

/***/ }),

/***/ 221:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 30 30%27%3e%3cpath stroke=%27rgba%2833, 37, 41, 0.75%29%27 stroke-linecap=%27round%27 stroke-miterlimit=%2710%27 stroke-width=%272%27 d=%27M4 7h22M4 15h22M4 23h22%27/%3e%3c/svg%3e";

/***/ }),

/***/ 122:
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 8%27%3e%3cpath fill=%27%23198754%27 d=%27M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z%27/%3e%3c/svg%3e";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 		} catch(e) {
/******/ 			module.error = e;
/******/ 			throw e;
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("index." + __webpack_require__.h() + ".hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("9603ceab6f7049fcb657")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "CIStore:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		// eslint-disable-next-line no-unused-vars
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId) {
/******/ 				return trackBlockingPromise(require.e(chunkId));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				//inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results);
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							},
/******/ 							[])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								} else {
/******/ 									return setStatus("ready").then(function () {
/******/ 										return updatedModules;
/******/ 									});
/******/ 								}
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 			826: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		var currentUpdatedModulesList;
/******/ 		var waitingUpdateResolves = {};
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			currentUpdatedModulesList = updatedModulesList;
/******/ 			return new Promise((resolve, reject) => {
/******/ 				waitingUpdateResolves[chunkId] = resolve;
/******/ 				// start update chunk loading
/******/ 				var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				var loadingEnded = (event) => {
/******/ 					if(waitingUpdateResolves[chunkId]) {
/******/ 						waitingUpdateResolves[chunkId] = undefined
/******/ 						var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 						var realSrc = event && event.target && event.target.src;
/******/ 						error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 						error.name = 'ChunkLoadError';
/******/ 						error.type = errorType;
/******/ 						error.request = realSrc;
/******/ 						reject(error);
/******/ 					}
/******/ 				};
/******/ 				__webpack_require__.l(url, loadingEnded);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		self["webpackHotUpdateCIStore"] = (chunkId, moreModules, runtime) => {
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = moreModules[moduleId];
/******/ 					if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 			if(waitingUpdateResolves[chunkId]) {
/******/ 				waitingUpdateResolves[chunkId]();
/******/ 				waitingUpdateResolves[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result;
/******/ 					if (newModuleFactory) {
/******/ 						result = getAffectedModuleEffects(moduleId);
/******/ 					} else {
/******/ 						result = {
/******/ 							type: "disposed",
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err2) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err2,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err2);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.jsonp = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(234);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=ci-store-plugin.js.map