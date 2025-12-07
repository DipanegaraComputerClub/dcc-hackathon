import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl, supabaseKey, supabase;
var init_supabase = __esm(() => {
  supabaseUrl = process.env.SUPABASE_URL;
  supabaseKey = process.env.SUPABASE_KEY;
  supabase = createClient(supabaseUrl, supabaseKey);
});

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  var util = __require("util");
  module.exports = DelayedStream;
  function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  }
  util.inherits(DelayedStream, Stream);
  DelayedStream.create = function(source, options) {
    var delayedStream = new this;
    options = options || {};
    for (var option in options) {
      delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
      delayedStream._handleEmit(arguments);
      return realEmit.apply(source, arguments);
    };
    source.on("error", function() {});
    if (delayedStream.pauseStream) {
      source.pause();
    }
    return delayedStream;
  };
  Object.defineProperty(DelayedStream.prototype, "readable", {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });
  DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };
  DelayedStream.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }
    this.source.resume();
  };
  DelayedStream.prototype.pause = function() {
    this.source.pause();
  };
  DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };
  DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };
  DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
      this.emit.apply(this, args);
      return;
    }
    if (args[0] === "data") {
      this.dataSize += args[1].length;
      this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
  };
  DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
      return;
    }
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    this._maxDataSizeExceeded = true;
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(message));
  };
});

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS((exports, module) => {
  var util = __require("util");
  var Stream = __require("stream").Stream;
  var DelayedStream = require_delayed_stream();
  module.exports = CombinedStream;
  function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
  }
  util.inherits(CombinedStream, Stream);
  CombinedStream.create = function(options) {
    var combinedStream = new this;
    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }
    return combinedStream;
  };
  CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
  };
  CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      if (!(stream instanceof DelayedStream)) {
        var newStream = DelayedStream.create(stream, {
          maxDataSize: Infinity,
          pauseStream: this.pauseStreams
        });
        stream.on("data", this._checkDataSize.bind(this));
        stream = newStream;
      }
      this._handleErrors(stream);
      if (this.pauseStreams) {
        stream.pause();
      }
    }
    this._streams.push(stream);
    return this;
  };
  CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };
  CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
      this._pendingNext = true;
      return;
    }
    this._insideLoop = true;
    try {
      do {
        this._pendingNext = false;
        this._realGetNext();
      } while (this._pendingNext);
    } finally {
      this._insideLoop = false;
    }
  };
  CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == "undefined") {
      this.end();
      return;
    }
    if (typeof stream !== "function") {
      this._pipeNext(stream);
      return;
    }
    var getStream = stream;
    getStream(function(stream2) {
      var isStreamLike = CombinedStream.isStreamLike(stream2);
      if (isStreamLike) {
        stream2.on("data", this._checkDataSize.bind(this));
        this._handleErrors(stream2);
      }
      this._pipeNext(stream2);
    }.bind(this));
  };
  CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on("end", this._getNext.bind(this));
      stream.pipe(this, { end: false });
      return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
  };
  CombinedStream.prototype._handleErrors = function(stream) {
    var self = this;
    stream.on("error", function(err) {
      self._emitError(err);
    });
  };
  CombinedStream.prototype.write = function(data) {
    this.emit("data", data);
  };
  CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
      this._currentStream.pause();
    this.emit("pause");
  };
  CombinedStream.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
      this._currentStream.resume();
    this.emit("resume");
  };
  CombinedStream.prototype.end = function() {
    this._reset();
    this.emit("end");
  };
  CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit("close");
  };
  CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };
  CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(message));
  };
  CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self = this;
    this._streams.forEach(function(stream) {
      if (!stream.dataSize) {
        return;
      }
      self.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  };
  CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit("error", err);
  };
});

// node_modules/mime-db/db.json
var require_db = __commonJS((exports, module) => {
  module.exports = {
    "application/1d-interleaved-parityfec": {
      source: "iana"
    },
    "application/3gpdash-qoe-report+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/3gpp-ims+xml": {
      source: "iana",
      compressible: true
    },
    "application/3gpphal+json": {
      source: "iana",
      compressible: true
    },
    "application/3gpphalforms+json": {
      source: "iana",
      compressible: true
    },
    "application/a2l": {
      source: "iana"
    },
    "application/ace+cbor": {
      source: "iana"
    },
    "application/activemessage": {
      source: "iana"
    },
    "application/activity+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-directory+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcost+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcostparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointprop+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointpropparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-error+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamcontrol+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamparams+json": {
      source: "iana",
      compressible: true
    },
    "application/aml": {
      source: "iana"
    },
    "application/andrew-inset": {
      source: "iana",
      extensions: ["ez"]
    },
    "application/applefile": {
      source: "iana"
    },
    "application/applixware": {
      source: "apache",
      extensions: ["aw"]
    },
    "application/at+jwt": {
      source: "iana"
    },
    "application/atf": {
      source: "iana"
    },
    "application/atfx": {
      source: "iana"
    },
    "application/atom+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atom"]
    },
    "application/atomcat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomcat"]
    },
    "application/atomdeleted+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomdeleted"]
    },
    "application/atomicmail": {
      source: "iana"
    },
    "application/atomsvc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomsvc"]
    },
    "application/atsc-dwd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dwd"]
    },
    "application/atsc-dynamic-event-message": {
      source: "iana"
    },
    "application/atsc-held+xml": {
      source: "iana",
      compressible: true,
      extensions: ["held"]
    },
    "application/atsc-rdt+json": {
      source: "iana",
      compressible: true
    },
    "application/atsc-rsat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsat"]
    },
    "application/atxml": {
      source: "iana"
    },
    "application/auth-policy+xml": {
      source: "iana",
      compressible: true
    },
    "application/bacnet-xdd+zip": {
      source: "iana",
      compressible: false
    },
    "application/batch-smtp": {
      source: "iana"
    },
    "application/bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/beep+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/calendar+json": {
      source: "iana",
      compressible: true
    },
    "application/calendar+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xcs"]
    },
    "application/call-completion": {
      source: "iana"
    },
    "application/cals-1840": {
      source: "iana"
    },
    "application/captive+json": {
      source: "iana",
      compressible: true
    },
    "application/cbor": {
      source: "iana"
    },
    "application/cbor-seq": {
      source: "iana"
    },
    "application/cccex": {
      source: "iana"
    },
    "application/ccmp+xml": {
      source: "iana",
      compressible: true
    },
    "application/ccxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ccxml"]
    },
    "application/cdfx+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdfx"]
    },
    "application/cdmi-capability": {
      source: "iana",
      extensions: ["cdmia"]
    },
    "application/cdmi-container": {
      source: "iana",
      extensions: ["cdmic"]
    },
    "application/cdmi-domain": {
      source: "iana",
      extensions: ["cdmid"]
    },
    "application/cdmi-object": {
      source: "iana",
      extensions: ["cdmio"]
    },
    "application/cdmi-queue": {
      source: "iana",
      extensions: ["cdmiq"]
    },
    "application/cdni": {
      source: "iana"
    },
    "application/cea": {
      source: "iana"
    },
    "application/cea-2018+xml": {
      source: "iana",
      compressible: true
    },
    "application/cellml+xml": {
      source: "iana",
      compressible: true
    },
    "application/cfw": {
      source: "iana"
    },
    "application/city+json": {
      source: "iana",
      compressible: true
    },
    "application/clr": {
      source: "iana"
    },
    "application/clue+xml": {
      source: "iana",
      compressible: true
    },
    "application/clue_info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cms": {
      source: "iana"
    },
    "application/cnrp+xml": {
      source: "iana",
      compressible: true
    },
    "application/coap-group+json": {
      source: "iana",
      compressible: true
    },
    "application/coap-payload": {
      source: "iana"
    },
    "application/commonground": {
      source: "iana"
    },
    "application/conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cose": {
      source: "iana"
    },
    "application/cose-key": {
      source: "iana"
    },
    "application/cose-key-set": {
      source: "iana"
    },
    "application/cpl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cpl"]
    },
    "application/csrattrs": {
      source: "iana"
    },
    "application/csta+xml": {
      source: "iana",
      compressible: true
    },
    "application/cstadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/csvm+json": {
      source: "iana",
      compressible: true
    },
    "application/cu-seeme": {
      source: "apache",
      extensions: ["cu"]
    },
    "application/cwt": {
      source: "iana"
    },
    "application/cybercash": {
      source: "iana"
    },
    "application/dart": {
      compressible: true
    },
    "application/dash+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpd"]
    },
    "application/dash-patch+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpp"]
    },
    "application/dashdelta": {
      source: "iana"
    },
    "application/davmount+xml": {
      source: "iana",
      compressible: true,
      extensions: ["davmount"]
    },
    "application/dca-rft": {
      source: "iana"
    },
    "application/dcd": {
      source: "iana"
    },
    "application/dec-dx": {
      source: "iana"
    },
    "application/dialog-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/dicom": {
      source: "iana"
    },
    "application/dicom+json": {
      source: "iana",
      compressible: true
    },
    "application/dicom+xml": {
      source: "iana",
      compressible: true
    },
    "application/dii": {
      source: "iana"
    },
    "application/dit": {
      source: "iana"
    },
    "application/dns": {
      source: "iana"
    },
    "application/dns+json": {
      source: "iana",
      compressible: true
    },
    "application/dns-message": {
      source: "iana"
    },
    "application/docbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dbk"]
    },
    "application/dots+cbor": {
      source: "iana"
    },
    "application/dskpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/dssc+der": {
      source: "iana",
      extensions: ["dssc"]
    },
    "application/dssc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdssc"]
    },
    "application/dvcs": {
      source: "iana"
    },
    "application/ecmascript": {
      source: "iana",
      compressible: true,
      extensions: ["es", "ecma"]
    },
    "application/edi-consent": {
      source: "iana"
    },
    "application/edi-x12": {
      source: "iana",
      compressible: false
    },
    "application/edifact": {
      source: "iana",
      compressible: false
    },
    "application/efi": {
      source: "iana"
    },
    "application/elm+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/elm+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.cap+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/emergencycalldata.comment+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.control+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.deviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.ecall.msd": {
      source: "iana"
    },
    "application/emergencycalldata.providerinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.serviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.subscriberinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.veds+xml": {
      source: "iana",
      compressible: true
    },
    "application/emma+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emma"]
    },
    "application/emotionml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emotionml"]
    },
    "application/encaprtp": {
      source: "iana"
    },
    "application/epp+xml": {
      source: "iana",
      compressible: true
    },
    "application/epub+zip": {
      source: "iana",
      compressible: false,
      extensions: ["epub"]
    },
    "application/eshop": {
      source: "iana"
    },
    "application/exi": {
      source: "iana",
      extensions: ["exi"]
    },
    "application/expect-ct-report+json": {
      source: "iana",
      compressible: true
    },
    "application/express": {
      source: "iana",
      extensions: ["exp"]
    },
    "application/fastinfoset": {
      source: "iana"
    },
    "application/fastsoap": {
      source: "iana"
    },
    "application/fdt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fdt"]
    },
    "application/fhir+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fhir+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fido.trusted-apps+json": {
      compressible: true
    },
    "application/fits": {
      source: "iana"
    },
    "application/flexfec": {
      source: "iana"
    },
    "application/font-sfnt": {
      source: "iana"
    },
    "application/font-tdpfr": {
      source: "iana",
      extensions: ["pfr"]
    },
    "application/font-woff": {
      source: "iana",
      compressible: false
    },
    "application/framework-attributes+xml": {
      source: "iana",
      compressible: true
    },
    "application/geo+json": {
      source: "iana",
      compressible: true,
      extensions: ["geojson"]
    },
    "application/geo+json-seq": {
      source: "iana"
    },
    "application/geopackage+sqlite3": {
      source: "iana"
    },
    "application/geoxacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/gltf-buffer": {
      source: "iana"
    },
    "application/gml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["gml"]
    },
    "application/gpx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["gpx"]
    },
    "application/gxf": {
      source: "apache",
      extensions: ["gxf"]
    },
    "application/gzip": {
      source: "iana",
      compressible: false,
      extensions: ["gz"]
    },
    "application/h224": {
      source: "iana"
    },
    "application/held+xml": {
      source: "iana",
      compressible: true
    },
    "application/hjson": {
      extensions: ["hjson"]
    },
    "application/http": {
      source: "iana"
    },
    "application/hyperstudio": {
      source: "iana",
      extensions: ["stk"]
    },
    "application/ibe-key-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pkg-reply+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pp-data": {
      source: "iana"
    },
    "application/iges": {
      source: "iana"
    },
    "application/im-iscomposing+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/index": {
      source: "iana"
    },
    "application/index.cmd": {
      source: "iana"
    },
    "application/index.obj": {
      source: "iana"
    },
    "application/index.response": {
      source: "iana"
    },
    "application/index.vnd": {
      source: "iana"
    },
    "application/inkml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ink", "inkml"]
    },
    "application/iotp": {
      source: "iana"
    },
    "application/ipfix": {
      source: "iana",
      extensions: ["ipfix"]
    },
    "application/ipp": {
      source: "iana"
    },
    "application/isup": {
      source: "iana"
    },
    "application/its+xml": {
      source: "iana",
      compressible: true,
      extensions: ["its"]
    },
    "application/java-archive": {
      source: "apache",
      compressible: false,
      extensions: ["jar", "war", "ear"]
    },
    "application/java-serialized-object": {
      source: "apache",
      compressible: false,
      extensions: ["ser"]
    },
    "application/java-vm": {
      source: "apache",
      compressible: false,
      extensions: ["class"]
    },
    "application/javascript": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js", "mjs"]
    },
    "application/jf2feed+json": {
      source: "iana",
      compressible: true
    },
    "application/jose": {
      source: "iana"
    },
    "application/jose+json": {
      source: "iana",
      compressible: true
    },
    "application/jrd+json": {
      source: "iana",
      compressible: true
    },
    "application/jscalendar+json": {
      source: "iana",
      compressible: true
    },
    "application/json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["json", "map"]
    },
    "application/json-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/json-seq": {
      source: "iana"
    },
    "application/json5": {
      extensions: ["json5"]
    },
    "application/jsonml+json": {
      source: "apache",
      compressible: true,
      extensions: ["jsonml"]
    },
    "application/jwk+json": {
      source: "iana",
      compressible: true
    },
    "application/jwk-set+json": {
      source: "iana",
      compressible: true
    },
    "application/jwt": {
      source: "iana"
    },
    "application/kpml-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/kpml-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/ld+json": {
      source: "iana",
      compressible: true,
      extensions: ["jsonld"]
    },
    "application/lgr+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lgr"]
    },
    "application/link-format": {
      source: "iana"
    },
    "application/load-control+xml": {
      source: "iana",
      compressible: true
    },
    "application/lost+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lostxml"]
    },
    "application/lostsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/lpf+zip": {
      source: "iana",
      compressible: false
    },
    "application/lxf": {
      source: "iana"
    },
    "application/mac-binhex40": {
      source: "iana",
      extensions: ["hqx"]
    },
    "application/mac-compactpro": {
      source: "apache",
      extensions: ["cpt"]
    },
    "application/macwriteii": {
      source: "iana"
    },
    "application/mads+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mads"]
    },
    "application/manifest+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["webmanifest"]
    },
    "application/marc": {
      source: "iana",
      extensions: ["mrc"]
    },
    "application/marcxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mrcx"]
    },
    "application/mathematica": {
      source: "iana",
      extensions: ["ma", "nb", "mb"]
    },
    "application/mathml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mathml"]
    },
    "application/mathml-content+xml": {
      source: "iana",
      compressible: true
    },
    "application/mathml-presentation+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-associated-procedure-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-deregister+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-envelope+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-protection-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-reception-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-user-service-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbox": {
      source: "iana",
      extensions: ["mbox"]
    },
    "application/media-policy-dataset+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpf"]
    },
    "application/media_control+xml": {
      source: "iana",
      compressible: true
    },
    "application/mediaservercontrol+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mscml"]
    },
    "application/merge-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/metalink+xml": {
      source: "apache",
      compressible: true,
      extensions: ["metalink"]
    },
    "application/metalink4+xml": {
      source: "iana",
      compressible: true,
      extensions: ["meta4"]
    },
    "application/mets+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mets"]
    },
    "application/mf4": {
      source: "iana"
    },
    "application/mikey": {
      source: "iana"
    },
    "application/mipc": {
      source: "iana"
    },
    "application/missing-blocks+cbor-seq": {
      source: "iana"
    },
    "application/mmt-aei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["maei"]
    },
    "application/mmt-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musd"]
    },
    "application/mods+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mods"]
    },
    "application/moss-keys": {
      source: "iana"
    },
    "application/moss-signature": {
      source: "iana"
    },
    "application/mosskey-data": {
      source: "iana"
    },
    "application/mosskey-request": {
      source: "iana"
    },
    "application/mp21": {
      source: "iana",
      extensions: ["m21", "mp21"]
    },
    "application/mp4": {
      source: "iana",
      extensions: ["mp4s", "m4p"]
    },
    "application/mpeg4-generic": {
      source: "iana"
    },
    "application/mpeg4-iod": {
      source: "iana"
    },
    "application/mpeg4-iod-xmt": {
      source: "iana"
    },
    "application/mrb-consumer+xml": {
      source: "iana",
      compressible: true
    },
    "application/mrb-publish+xml": {
      source: "iana",
      compressible: true
    },
    "application/msc-ivr+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msc-mixer+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msword": {
      source: "iana",
      compressible: false,
      extensions: ["doc", "dot"]
    },
    "application/mud+json": {
      source: "iana",
      compressible: true
    },
    "application/multipart-core": {
      source: "iana"
    },
    "application/mxf": {
      source: "iana",
      extensions: ["mxf"]
    },
    "application/n-quads": {
      source: "iana",
      extensions: ["nq"]
    },
    "application/n-triples": {
      source: "iana",
      extensions: ["nt"]
    },
    "application/nasdata": {
      source: "iana"
    },
    "application/news-checkgroups": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-groupinfo": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-transmission": {
      source: "iana"
    },
    "application/nlsml+xml": {
      source: "iana",
      compressible: true
    },
    "application/node": {
      source: "iana",
      extensions: ["cjs"]
    },
    "application/nss": {
      source: "iana"
    },
    "application/oauth-authz-req+jwt": {
      source: "iana"
    },
    "application/oblivious-dns-message": {
      source: "iana"
    },
    "application/ocsp-request": {
      source: "iana"
    },
    "application/ocsp-response": {
      source: "iana"
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/oda": {
      source: "iana",
      extensions: ["oda"]
    },
    "application/odm+xml": {
      source: "iana",
      compressible: true
    },
    "application/odx": {
      source: "iana"
    },
    "application/oebps-package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["opf"]
    },
    "application/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogx"]
    },
    "application/omdoc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["omdoc"]
    },
    "application/onenote": {
      source: "apache",
      extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
    },
    "application/opc-nodeset+xml": {
      source: "iana",
      compressible: true
    },
    "application/oscore": {
      source: "iana"
    },
    "application/oxps": {
      source: "iana",
      extensions: ["oxps"]
    },
    "application/p21": {
      source: "iana"
    },
    "application/p21+zip": {
      source: "iana",
      compressible: false
    },
    "application/p2p-overlay+xml": {
      source: "iana",
      compressible: true,
      extensions: ["relo"]
    },
    "application/parityfec": {
      source: "iana"
    },
    "application/passport": {
      source: "iana"
    },
    "application/patch-ops-error+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xer"]
    },
    "application/pdf": {
      source: "iana",
      compressible: false,
      extensions: ["pdf"]
    },
    "application/pdx": {
      source: "iana"
    },
    "application/pem-certificate-chain": {
      source: "iana"
    },
    "application/pgp-encrypted": {
      source: "iana",
      compressible: false,
      extensions: ["pgp"]
    },
    "application/pgp-keys": {
      source: "iana",
      extensions: ["asc"]
    },
    "application/pgp-signature": {
      source: "iana",
      extensions: ["asc", "sig"]
    },
    "application/pics-rules": {
      source: "apache",
      extensions: ["prf"]
    },
    "application/pidf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pidf-diff+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pkcs10": {
      source: "iana",
      extensions: ["p10"]
    },
    "application/pkcs12": {
      source: "iana"
    },
    "application/pkcs7-mime": {
      source: "iana",
      extensions: ["p7m", "p7c"]
    },
    "application/pkcs7-signature": {
      source: "iana",
      extensions: ["p7s"]
    },
    "application/pkcs8": {
      source: "iana",
      extensions: ["p8"]
    },
    "application/pkcs8-encrypted": {
      source: "iana"
    },
    "application/pkix-attr-cert": {
      source: "iana",
      extensions: ["ac"]
    },
    "application/pkix-cert": {
      source: "iana",
      extensions: ["cer"]
    },
    "application/pkix-crl": {
      source: "iana",
      extensions: ["crl"]
    },
    "application/pkix-pkipath": {
      source: "iana",
      extensions: ["pkipath"]
    },
    "application/pkixcmp": {
      source: "iana",
      extensions: ["pki"]
    },
    "application/pls+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pls"]
    },
    "application/poc-settings+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/postscript": {
      source: "iana",
      compressible: true,
      extensions: ["ai", "eps", "ps"]
    },
    "application/ppsp-tracker+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+xml": {
      source: "iana",
      compressible: true
    },
    "application/provenance+xml": {
      source: "iana",
      compressible: true,
      extensions: ["provx"]
    },
    "application/prs.alvestrand.titrax-sheet": {
      source: "iana"
    },
    "application/prs.cww": {
      source: "iana",
      extensions: ["cww"]
    },
    "application/prs.cyn": {
      source: "iana",
      charset: "7-BIT"
    },
    "application/prs.hpub+zip": {
      source: "iana",
      compressible: false
    },
    "application/prs.nprend": {
      source: "iana"
    },
    "application/prs.plucker": {
      source: "iana"
    },
    "application/prs.rdf-xml-crypt": {
      source: "iana"
    },
    "application/prs.xsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/pskc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pskcxml"]
    },
    "application/pvd+json": {
      source: "iana",
      compressible: true
    },
    "application/qsig": {
      source: "iana"
    },
    "application/raml+yaml": {
      compressible: true,
      extensions: ["raml"]
    },
    "application/raptorfec": {
      source: "iana"
    },
    "application/rdap+json": {
      source: "iana",
      compressible: true
    },
    "application/rdf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rdf", "owl"]
    },
    "application/reginfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rif"]
    },
    "application/relax-ng-compact-syntax": {
      source: "iana",
      extensions: ["rnc"]
    },
    "application/remote-printing": {
      source: "iana"
    },
    "application/reputon+json": {
      source: "iana",
      compressible: true
    },
    "application/resource-lists+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rl"]
    },
    "application/resource-lists-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rld"]
    },
    "application/rfc+xml": {
      source: "iana",
      compressible: true
    },
    "application/riscos": {
      source: "iana"
    },
    "application/rlmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/rls-services+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rs"]
    },
    "application/route-apd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rapd"]
    },
    "application/route-s-tsid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sls"]
    },
    "application/route-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rusd"]
    },
    "application/rpki-ghostbusters": {
      source: "iana",
      extensions: ["gbr"]
    },
    "application/rpki-manifest": {
      source: "iana",
      extensions: ["mft"]
    },
    "application/rpki-publication": {
      source: "iana"
    },
    "application/rpki-roa": {
      source: "iana",
      extensions: ["roa"]
    },
    "application/rpki-updown": {
      source: "iana"
    },
    "application/rsd+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rsd"]
    },
    "application/rss+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rss"]
    },
    "application/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "application/rtploopback": {
      source: "iana"
    },
    "application/rtx": {
      source: "iana"
    },
    "application/samlassertion+xml": {
      source: "iana",
      compressible: true
    },
    "application/samlmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/sarif+json": {
      source: "iana",
      compressible: true
    },
    "application/sarif-external-properties+json": {
      source: "iana",
      compressible: true
    },
    "application/sbe": {
      source: "iana"
    },
    "application/sbml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sbml"]
    },
    "application/scaip+xml": {
      source: "iana",
      compressible: true
    },
    "application/scim+json": {
      source: "iana",
      compressible: true
    },
    "application/scvp-cv-request": {
      source: "iana",
      extensions: ["scq"]
    },
    "application/scvp-cv-response": {
      source: "iana",
      extensions: ["scs"]
    },
    "application/scvp-vp-request": {
      source: "iana",
      extensions: ["spq"]
    },
    "application/scvp-vp-response": {
      source: "iana",
      extensions: ["spp"]
    },
    "application/sdp": {
      source: "iana",
      extensions: ["sdp"]
    },
    "application/secevent+jwt": {
      source: "iana"
    },
    "application/senml+cbor": {
      source: "iana"
    },
    "application/senml+json": {
      source: "iana",
      compressible: true
    },
    "application/senml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["senmlx"]
    },
    "application/senml-etch+cbor": {
      source: "iana"
    },
    "application/senml-etch+json": {
      source: "iana",
      compressible: true
    },
    "application/senml-exi": {
      source: "iana"
    },
    "application/sensml+cbor": {
      source: "iana"
    },
    "application/sensml+json": {
      source: "iana",
      compressible: true
    },
    "application/sensml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sensmlx"]
    },
    "application/sensml-exi": {
      source: "iana"
    },
    "application/sep+xml": {
      source: "iana",
      compressible: true
    },
    "application/sep-exi": {
      source: "iana"
    },
    "application/session-info": {
      source: "iana"
    },
    "application/set-payment": {
      source: "iana"
    },
    "application/set-payment-initiation": {
      source: "iana",
      extensions: ["setpay"]
    },
    "application/set-registration": {
      source: "iana"
    },
    "application/set-registration-initiation": {
      source: "iana",
      extensions: ["setreg"]
    },
    "application/sgml": {
      source: "iana"
    },
    "application/sgml-open-catalog": {
      source: "iana"
    },
    "application/shf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["shf"]
    },
    "application/sieve": {
      source: "iana",
      extensions: ["siv", "sieve"]
    },
    "application/simple-filter+xml": {
      source: "iana",
      compressible: true
    },
    "application/simple-message-summary": {
      source: "iana"
    },
    "application/simplesymbolcontainer": {
      source: "iana"
    },
    "application/sipc": {
      source: "iana"
    },
    "application/slate": {
      source: "iana"
    },
    "application/smil": {
      source: "iana"
    },
    "application/smil+xml": {
      source: "iana",
      compressible: true,
      extensions: ["smi", "smil"]
    },
    "application/smpte336m": {
      source: "iana"
    },
    "application/soap+fastinfoset": {
      source: "iana"
    },
    "application/soap+xml": {
      source: "iana",
      compressible: true
    },
    "application/sparql-query": {
      source: "iana",
      extensions: ["rq"]
    },
    "application/sparql-results+xml": {
      source: "iana",
      compressible: true,
      extensions: ["srx"]
    },
    "application/spdx+json": {
      source: "iana",
      compressible: true
    },
    "application/spirits-event+xml": {
      source: "iana",
      compressible: true
    },
    "application/sql": {
      source: "iana"
    },
    "application/srgs": {
      source: "iana",
      extensions: ["gram"]
    },
    "application/srgs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["grxml"]
    },
    "application/sru+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sru"]
    },
    "application/ssdl+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ssdl"]
    },
    "application/ssml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ssml"]
    },
    "application/stix+json": {
      source: "iana",
      compressible: true
    },
    "application/swid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["swidtag"]
    },
    "application/tamp-apex-update": {
      source: "iana"
    },
    "application/tamp-apex-update-confirm": {
      source: "iana"
    },
    "application/tamp-community-update": {
      source: "iana"
    },
    "application/tamp-community-update-confirm": {
      source: "iana"
    },
    "application/tamp-error": {
      source: "iana"
    },
    "application/tamp-sequence-adjust": {
      source: "iana"
    },
    "application/tamp-sequence-adjust-confirm": {
      source: "iana"
    },
    "application/tamp-status-query": {
      source: "iana"
    },
    "application/tamp-status-response": {
      source: "iana"
    },
    "application/tamp-update": {
      source: "iana"
    },
    "application/tamp-update-confirm": {
      source: "iana"
    },
    "application/tar": {
      compressible: true
    },
    "application/taxii+json": {
      source: "iana",
      compressible: true
    },
    "application/td+json": {
      source: "iana",
      compressible: true
    },
    "application/tei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tei", "teicorpus"]
    },
    "application/tetra_isi": {
      source: "iana"
    },
    "application/thraud+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tfi"]
    },
    "application/timestamp-query": {
      source: "iana"
    },
    "application/timestamp-reply": {
      source: "iana"
    },
    "application/timestamped-data": {
      source: "iana",
      extensions: ["tsd"]
    },
    "application/tlsrpt+gzip": {
      source: "iana"
    },
    "application/tlsrpt+json": {
      source: "iana",
      compressible: true
    },
    "application/tnauthlist": {
      source: "iana"
    },
    "application/token-introspection+jwt": {
      source: "iana"
    },
    "application/toml": {
      compressible: true,
      extensions: ["toml"]
    },
    "application/trickle-ice-sdpfrag": {
      source: "iana"
    },
    "application/trig": {
      source: "iana",
      extensions: ["trig"]
    },
    "application/ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ttml"]
    },
    "application/tve-trigger": {
      source: "iana"
    },
    "application/tzif": {
      source: "iana"
    },
    "application/tzif-leap": {
      source: "iana"
    },
    "application/ubjson": {
      compressible: false,
      extensions: ["ubj"]
    },
    "application/ulpfec": {
      source: "iana"
    },
    "application/urc-grpsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/urc-ressheet+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsheet"]
    },
    "application/urc-targetdesc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["td"]
    },
    "application/urc-uisocketdesc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vcard+json": {
      source: "iana",
      compressible: true
    },
    "application/vcard+xml": {
      source: "iana",
      compressible: true
    },
    "application/vemmi": {
      source: "iana"
    },
    "application/vividence.scriptfile": {
      source: "apache"
    },
    "application/vnd.1000minds.decision-model+xml": {
      source: "iana",
      compressible: true,
      extensions: ["1km"]
    },
    "application/vnd.3gpp-prose+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ch+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-v2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.5gnas": {
      source: "iana"
    },
    "application/vnd.3gpp.access-transfer-events+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.bsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gmop+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gtpc": {
      source: "iana"
    },
    "application/vnd.3gpp.interworking-data": {
      source: "iana"
    },
    "application/vnd.3gpp.lpp": {
      source: "iana"
    },
    "application/vnd.3gpp.mc-signalling-ear": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-payload": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-signalling": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-floor-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-signed+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-init-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-transmission-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mid-call+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ngap": {
      source: "iana"
    },
    "application/vnd.3gpp.pfcp": {
      source: "iana"
    },
    "application/vnd.3gpp.pic-bw-large": {
      source: "iana",
      extensions: ["plb"]
    },
    "application/vnd.3gpp.pic-bw-small": {
      source: "iana",
      extensions: ["psb"]
    },
    "application/vnd.3gpp.pic-bw-var": {
      source: "iana",
      extensions: ["pvb"]
    },
    "application/vnd.3gpp.s1ap": {
      source: "iana"
    },
    "application/vnd.3gpp.sms": {
      source: "iana"
    },
    "application/vnd.3gpp.sms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-ext+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.state-and-event-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ussd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.bcmcsinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.sms": {
      source: "iana"
    },
    "application/vnd.3gpp2.tcap": {
      source: "iana",
      extensions: ["tcap"]
    },
    "application/vnd.3lightssoftware.imagescal": {
      source: "iana"
    },
    "application/vnd.3m.post-it-notes": {
      source: "iana",
      extensions: ["pwn"]
    },
    "application/vnd.accpac.simply.aso": {
      source: "iana",
      extensions: ["aso"]
    },
    "application/vnd.accpac.simply.imp": {
      source: "iana",
      extensions: ["imp"]
    },
    "application/vnd.acucobol": {
      source: "iana",
      extensions: ["acu"]
    },
    "application/vnd.acucorp": {
      source: "iana",
      extensions: ["atc", "acutc"]
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
      source: "apache",
      compressible: false,
      extensions: ["air"]
    },
    "application/vnd.adobe.flash.movie": {
      source: "iana"
    },
    "application/vnd.adobe.formscentral.fcdt": {
      source: "iana",
      extensions: ["fcdt"]
    },
    "application/vnd.adobe.fxp": {
      source: "iana",
      extensions: ["fxp", "fxpl"]
    },
    "application/vnd.adobe.partial-upload": {
      source: "iana"
    },
    "application/vnd.adobe.xdp+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdp"]
    },
    "application/vnd.adobe.xfdf": {
      source: "iana",
      extensions: ["xfdf"]
    },
    "application/vnd.aether.imp": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata-pagedef": {
      source: "iana"
    },
    "application/vnd.afpc.cmoca-cmresource": {
      source: "iana"
    },
    "application/vnd.afpc.foca-charset": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codedfont": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codepage": {
      source: "iana"
    },
    "application/vnd.afpc.modca": {
      source: "iana"
    },
    "application/vnd.afpc.modca-cmtable": {
      source: "iana"
    },
    "application/vnd.afpc.modca-formdef": {
      source: "iana"
    },
    "application/vnd.afpc.modca-mediummap": {
      source: "iana"
    },
    "application/vnd.afpc.modca-objectcontainer": {
      source: "iana"
    },
    "application/vnd.afpc.modca-overlay": {
      source: "iana"
    },
    "application/vnd.afpc.modca-pagesegment": {
      source: "iana"
    },
    "application/vnd.age": {
      source: "iana",
      extensions: ["age"]
    },
    "application/vnd.ah-barcode": {
      source: "iana"
    },
    "application/vnd.ahead.space": {
      source: "iana",
      extensions: ["ahead"]
    },
    "application/vnd.airzip.filesecure.azf": {
      source: "iana",
      extensions: ["azf"]
    },
    "application/vnd.airzip.filesecure.azs": {
      source: "iana",
      extensions: ["azs"]
    },
    "application/vnd.amadeus+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.amazon.ebook": {
      source: "apache",
      extensions: ["azw"]
    },
    "application/vnd.amazon.mobi8-ebook": {
      source: "iana"
    },
    "application/vnd.americandynamics.acc": {
      source: "iana",
      extensions: ["acc"]
    },
    "application/vnd.amiga.ami": {
      source: "iana",
      extensions: ["ami"]
    },
    "application/vnd.amundsen.maze+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.android.ota": {
      source: "iana"
    },
    "application/vnd.android.package-archive": {
      source: "apache",
      compressible: false,
      extensions: ["apk"]
    },
    "application/vnd.anki": {
      source: "iana"
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
      source: "iana",
      extensions: ["cii"]
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
      source: "apache",
      extensions: ["fti"]
    },
    "application/vnd.antix.game-component": {
      source: "iana",
      extensions: ["atx"]
    },
    "application/vnd.apache.arrow.file": {
      source: "iana"
    },
    "application/vnd.apache.arrow.stream": {
      source: "iana"
    },
    "application/vnd.apache.thrift.binary": {
      source: "iana"
    },
    "application/vnd.apache.thrift.compact": {
      source: "iana"
    },
    "application/vnd.apache.thrift.json": {
      source: "iana"
    },
    "application/vnd.api+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.aplextor.warrp+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apothekende.reservation+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apple.installer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpkg"]
    },
    "application/vnd.apple.keynote": {
      source: "iana",
      extensions: ["key"]
    },
    "application/vnd.apple.mpegurl": {
      source: "iana",
      extensions: ["m3u8"]
    },
    "application/vnd.apple.numbers": {
      source: "iana",
      extensions: ["numbers"]
    },
    "application/vnd.apple.pages": {
      source: "iana",
      extensions: ["pages"]
    },
    "application/vnd.apple.pkpass": {
      compressible: false,
      extensions: ["pkpass"]
    },
    "application/vnd.arastra.swi": {
      source: "iana"
    },
    "application/vnd.aristanetworks.swi": {
      source: "iana",
      extensions: ["swi"]
    },
    "application/vnd.artisan+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.artsquare": {
      source: "iana"
    },
    "application/vnd.astraea-software.iota": {
      source: "iana",
      extensions: ["iota"]
    },
    "application/vnd.audiograph": {
      source: "iana",
      extensions: ["aep"]
    },
    "application/vnd.autopackage": {
      source: "iana"
    },
    "application/vnd.avalon+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.avistar+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.balsamiq.bmml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bmml"]
    },
    "application/vnd.balsamiq.bmpr": {
      source: "iana"
    },
    "application/vnd.banana-accounting": {
      source: "iana"
    },
    "application/vnd.bbf.usp.error": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bekitzur-stech+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bint.med-content": {
      source: "iana"
    },
    "application/vnd.biopax.rdf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.blink-idb-value-wrapper": {
      source: "iana"
    },
    "application/vnd.blueice.multipass": {
      source: "iana",
      extensions: ["mpm"]
    },
    "application/vnd.bluetooth.ep.oob": {
      source: "iana"
    },
    "application/vnd.bluetooth.le.oob": {
      source: "iana"
    },
    "application/vnd.bmi": {
      source: "iana",
      extensions: ["bmi"]
    },
    "application/vnd.bpf": {
      source: "iana"
    },
    "application/vnd.bpf3": {
      source: "iana"
    },
    "application/vnd.businessobjects": {
      source: "iana",
      extensions: ["rep"]
    },
    "application/vnd.byu.uapi+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cab-jscript": {
      source: "iana"
    },
    "application/vnd.canon-cpdl": {
      source: "iana"
    },
    "application/vnd.canon-lips": {
      source: "iana"
    },
    "application/vnd.capasystems-pg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cendio.thinlinc.clientconf": {
      source: "iana"
    },
    "application/vnd.century-systems.tcp_stream": {
      source: "iana"
    },
    "application/vnd.chemdraw+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdxml"]
    },
    "application/vnd.chess-pgn": {
      source: "iana"
    },
    "application/vnd.chipnuts.karaoke-mmd": {
      source: "iana",
      extensions: ["mmd"]
    },
    "application/vnd.ciedi": {
      source: "iana"
    },
    "application/vnd.cinderella": {
      source: "iana",
      extensions: ["cdy"]
    },
    "application/vnd.cirpack.isdn-ext": {
      source: "iana"
    },
    "application/vnd.citationstyles.style+xml": {
      source: "iana",
      compressible: true,
      extensions: ["csl"]
    },
    "application/vnd.claymore": {
      source: "iana",
      extensions: ["cla"]
    },
    "application/vnd.cloanto.rp9": {
      source: "iana",
      extensions: ["rp9"]
    },
    "application/vnd.clonk.c4group": {
      source: "iana",
      extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
    },
    "application/vnd.cluetrust.cartomobile-config": {
      source: "iana",
      extensions: ["c11amc"]
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
      source: "iana",
      extensions: ["c11amz"]
    },
    "application/vnd.coffeescript": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet-template": {
      source: "iana"
    },
    "application/vnd.collection+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.doc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.next+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.comicbook+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.comicbook-rar": {
      source: "iana"
    },
    "application/vnd.commerce-battelle": {
      source: "iana"
    },
    "application/vnd.commonspace": {
      source: "iana",
      extensions: ["csp"]
    },
    "application/vnd.contact.cmsg": {
      source: "iana",
      extensions: ["cdbcmsg"]
    },
    "application/vnd.coreos.ignition+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cosmocaller": {
      source: "iana",
      extensions: ["cmc"]
    },
    "application/vnd.crick.clicker": {
      source: "iana",
      extensions: ["clkx"]
    },
    "application/vnd.crick.clicker.keyboard": {
      source: "iana",
      extensions: ["clkk"]
    },
    "application/vnd.crick.clicker.palette": {
      source: "iana",
      extensions: ["clkp"]
    },
    "application/vnd.crick.clicker.template": {
      source: "iana",
      extensions: ["clkt"]
    },
    "application/vnd.crick.clicker.wordbank": {
      source: "iana",
      extensions: ["clkw"]
    },
    "application/vnd.criticaltools.wbs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wbs"]
    },
    "application/vnd.cryptii.pipe+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.crypto-shade-file": {
      source: "iana"
    },
    "application/vnd.cryptomator.encrypted": {
      source: "iana"
    },
    "application/vnd.cryptomator.vault": {
      source: "iana"
    },
    "application/vnd.ctc-posml": {
      source: "iana",
      extensions: ["pml"]
    },
    "application/vnd.ctct.ws+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cups-pdf": {
      source: "iana"
    },
    "application/vnd.cups-postscript": {
      source: "iana"
    },
    "application/vnd.cups-ppd": {
      source: "iana",
      extensions: ["ppd"]
    },
    "application/vnd.cups-raster": {
      source: "iana"
    },
    "application/vnd.cups-raw": {
      source: "iana"
    },
    "application/vnd.curl": {
      source: "iana"
    },
    "application/vnd.curl.car": {
      source: "apache",
      extensions: ["car"]
    },
    "application/vnd.curl.pcurl": {
      source: "apache",
      extensions: ["pcurl"]
    },
    "application/vnd.cyan.dean.root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cybank": {
      source: "iana"
    },
    "application/vnd.cyclonedx+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cyclonedx+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.d2l.coursepackage1p0+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.d3m-dataset": {
      source: "iana"
    },
    "application/vnd.d3m-problem": {
      source: "iana"
    },
    "application/vnd.dart": {
      source: "iana",
      compressible: true,
      extensions: ["dart"]
    },
    "application/vnd.data-vision.rdz": {
      source: "iana",
      extensions: ["rdz"]
    },
    "application/vnd.datapackage+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dataresource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dbf": {
      source: "iana",
      extensions: ["dbf"]
    },
    "application/vnd.debian.binary-package": {
      source: "iana"
    },
    "application/vnd.dece.data": {
      source: "iana",
      extensions: ["uvf", "uvvf", "uvd", "uvvd"]
    },
    "application/vnd.dece.ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uvt", "uvvt"]
    },
    "application/vnd.dece.unspecified": {
      source: "iana",
      extensions: ["uvx", "uvvx"]
    },
    "application/vnd.dece.zip": {
      source: "iana",
      extensions: ["uvz", "uvvz"]
    },
    "application/vnd.denovo.fcselayout-link": {
      source: "iana",
      extensions: ["fe_launch"]
    },
    "application/vnd.desmume.movie": {
      source: "iana"
    },
    "application/vnd.dir-bi.plate-dl-nosuffix": {
      source: "iana"
    },
    "application/vnd.dm.delegation+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dna": {
      source: "iana",
      extensions: ["dna"]
    },
    "application/vnd.document+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dolby.mlp": {
      source: "apache",
      extensions: ["mlp"]
    },
    "application/vnd.dolby.mobile.1": {
      source: "iana"
    },
    "application/vnd.dolby.mobile.2": {
      source: "iana"
    },
    "application/vnd.doremir.scorecloud-binary-document": {
      source: "iana"
    },
    "application/vnd.dpgraph": {
      source: "iana",
      extensions: ["dpg"]
    },
    "application/vnd.dreamfactory": {
      source: "iana",
      extensions: ["dfac"]
    },
    "application/vnd.drive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ds-keypoint": {
      source: "apache",
      extensions: ["kpxx"]
    },
    "application/vnd.dtg.local": {
      source: "iana"
    },
    "application/vnd.dtg.local.flash": {
      source: "iana"
    },
    "application/vnd.dtg.local.html": {
      source: "iana"
    },
    "application/vnd.dvb.ait": {
      source: "iana",
      extensions: ["ait"]
    },
    "application/vnd.dvb.dvbisl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.dvbj": {
      source: "iana"
    },
    "application/vnd.dvb.esgcontainer": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcdftnotifaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess2": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgpdd": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcroaming": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-base": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-enhancement": {
      source: "iana"
    },
    "application/vnd.dvb.notif-aggregate-root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-container+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-generic+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-msglist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-init+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.pfr": {
      source: "iana"
    },
    "application/vnd.dvb.service": {
      source: "iana",
      extensions: ["svc"]
    },
    "application/vnd.dxr": {
      source: "iana"
    },
    "application/vnd.dynageo": {
      source: "iana",
      extensions: ["geo"]
    },
    "application/vnd.dzr": {
      source: "iana"
    },
    "application/vnd.easykaraoke.cdgdownload": {
      source: "iana"
    },
    "application/vnd.ecdis-update": {
      source: "iana"
    },
    "application/vnd.ecip.rlp": {
      source: "iana"
    },
    "application/vnd.eclipse.ditto+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ecowin.chart": {
      source: "iana",
      extensions: ["mag"]
    },
    "application/vnd.ecowin.filerequest": {
      source: "iana"
    },
    "application/vnd.ecowin.fileupdate": {
      source: "iana"
    },
    "application/vnd.ecowin.series": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesrequest": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesupdate": {
      source: "iana"
    },
    "application/vnd.efi.img": {
      source: "iana"
    },
    "application/vnd.efi.iso": {
      source: "iana"
    },
    "application/vnd.emclient.accessrequest+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.enliven": {
      source: "iana",
      extensions: ["nml"]
    },
    "application/vnd.enphase.envoy": {
      source: "iana"
    },
    "application/vnd.eprints.data+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.epson.esf": {
      source: "iana",
      extensions: ["esf"]
    },
    "application/vnd.epson.msf": {
      source: "iana",
      extensions: ["msf"]
    },
    "application/vnd.epson.quickanime": {
      source: "iana",
      extensions: ["qam"]
    },
    "application/vnd.epson.salt": {
      source: "iana",
      extensions: ["slt"]
    },
    "application/vnd.epson.ssf": {
      source: "iana",
      extensions: ["ssf"]
    },
    "application/vnd.ericsson.quickcall": {
      source: "iana"
    },
    "application/vnd.espass-espass+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.eszigno3+xml": {
      source: "iana",
      compressible: true,
      extensions: ["es3", "et3"]
    },
    "application/vnd.etsi.aoc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.asic-e+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.asic-s+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.cug+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvcommand+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-bc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-cod+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-npvr+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvservice+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mcid+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mheg5": {
      source: "iana"
    },
    "application/vnd.etsi.overload-control-policy-dataset+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.pstn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.sci+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.simservs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.timestamp-token": {
      source: "iana"
    },
    "application/vnd.etsi.tsl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.tsl.der": {
      source: "iana"
    },
    "application/vnd.eu.kasparian.car+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.eudora.data": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.profile": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.settings": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.theme": {
      source: "iana"
    },
    "application/vnd.exstream-empower+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.exstream-package": {
      source: "iana"
    },
    "application/vnd.ezpix-album": {
      source: "iana",
      extensions: ["ez2"]
    },
    "application/vnd.ezpix-package": {
      source: "iana",
      extensions: ["ez3"]
    },
    "application/vnd.f-secure.mobile": {
      source: "iana"
    },
    "application/vnd.familysearch.gedcom+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.fastcopy-disk-image": {
      source: "iana"
    },
    "application/vnd.fdf": {
      source: "iana",
      extensions: ["fdf"]
    },
    "application/vnd.fdsn.mseed": {
      source: "iana",
      extensions: ["mseed"]
    },
    "application/vnd.fdsn.seed": {
      source: "iana",
      extensions: ["seed", "dataless"]
    },
    "application/vnd.ffsns": {
      source: "iana"
    },
    "application/vnd.ficlab.flb+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.filmit.zfc": {
      source: "iana"
    },
    "application/vnd.fints": {
      source: "iana"
    },
    "application/vnd.firemonkeys.cloudcell": {
      source: "iana"
    },
    "application/vnd.flographit": {
      source: "iana",
      extensions: ["gph"]
    },
    "application/vnd.fluxtime.clip": {
      source: "iana",
      extensions: ["ftc"]
    },
    "application/vnd.font-fontforge-sfd": {
      source: "iana"
    },
    "application/vnd.framemaker": {
      source: "iana",
      extensions: ["fm", "frame", "maker", "book"]
    },
    "application/vnd.frogans.fnc": {
      source: "iana",
      extensions: ["fnc"]
    },
    "application/vnd.frogans.ltf": {
      source: "iana",
      extensions: ["ltf"]
    },
    "application/vnd.fsc.weblaunch": {
      source: "iana",
      extensions: ["fsc"]
    },
    "application/vnd.fujifilm.fb.docuworks": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.binder": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.jfi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fujitsu.oasys": {
      source: "iana",
      extensions: ["oas"]
    },
    "application/vnd.fujitsu.oasys2": {
      source: "iana",
      extensions: ["oa2"]
    },
    "application/vnd.fujitsu.oasys3": {
      source: "iana",
      extensions: ["oa3"]
    },
    "application/vnd.fujitsu.oasysgp": {
      source: "iana",
      extensions: ["fg5"]
    },
    "application/vnd.fujitsu.oasysprs": {
      source: "iana",
      extensions: ["bh2"]
    },
    "application/vnd.fujixerox.art-ex": {
      source: "iana"
    },
    "application/vnd.fujixerox.art4": {
      source: "iana"
    },
    "application/vnd.fujixerox.ddd": {
      source: "iana",
      extensions: ["ddd"]
    },
    "application/vnd.fujixerox.docuworks": {
      source: "iana",
      extensions: ["xdw"]
    },
    "application/vnd.fujixerox.docuworks.binder": {
      source: "iana",
      extensions: ["xbd"]
    },
    "application/vnd.fujixerox.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujixerox.hbpl": {
      source: "iana"
    },
    "application/vnd.fut-misnet": {
      source: "iana"
    },
    "application/vnd.futoin+cbor": {
      source: "iana"
    },
    "application/vnd.futoin+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fuzzysheet": {
      source: "iana",
      extensions: ["fzs"]
    },
    "application/vnd.genomatix.tuxedo": {
      source: "iana",
      extensions: ["txd"]
    },
    "application/vnd.gentics.grd+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geo+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geocube+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geogebra.file": {
      source: "iana",
      extensions: ["ggb"]
    },
    "application/vnd.geogebra.slides": {
      source: "iana"
    },
    "application/vnd.geogebra.tool": {
      source: "iana",
      extensions: ["ggt"]
    },
    "application/vnd.geometry-explorer": {
      source: "iana",
      extensions: ["gex", "gre"]
    },
    "application/vnd.geonext": {
      source: "iana",
      extensions: ["gxt"]
    },
    "application/vnd.geoplan": {
      source: "iana",
      extensions: ["g2w"]
    },
    "application/vnd.geospace": {
      source: "iana",
      extensions: ["g3w"]
    },
    "application/vnd.gerber": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt-response": {
      source: "iana"
    },
    "application/vnd.gmx": {
      source: "iana",
      extensions: ["gmx"]
    },
    "application/vnd.google-apps.document": {
      compressible: false,
      extensions: ["gdoc"]
    },
    "application/vnd.google-apps.presentation": {
      compressible: false,
      extensions: ["gslides"]
    },
    "application/vnd.google-apps.spreadsheet": {
      compressible: false,
      extensions: ["gsheet"]
    },
    "application/vnd.google-earth.kml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["kml"]
    },
    "application/vnd.google-earth.kmz": {
      source: "iana",
      compressible: false,
      extensions: ["kmz"]
    },
    "application/vnd.gov.sk.e-form+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gov.sk.e-form+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.gov.sk.xmldatacontainer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.grafeq": {
      source: "iana",
      extensions: ["gqf", "gqs"]
    },
    "application/vnd.gridmp": {
      source: "iana"
    },
    "application/vnd.groove-account": {
      source: "iana",
      extensions: ["gac"]
    },
    "application/vnd.groove-help": {
      source: "iana",
      extensions: ["ghf"]
    },
    "application/vnd.groove-identity-message": {
      source: "iana",
      extensions: ["gim"]
    },
    "application/vnd.groove-injector": {
      source: "iana",
      extensions: ["grv"]
    },
    "application/vnd.groove-tool-message": {
      source: "iana",
      extensions: ["gtm"]
    },
    "application/vnd.groove-tool-template": {
      source: "iana",
      extensions: ["tpl"]
    },
    "application/vnd.groove-vcard": {
      source: "iana",
      extensions: ["vcg"]
    },
    "application/vnd.hal+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hal+xml": {
      source: "iana",
      compressible: true,
      extensions: ["hal"]
    },
    "application/vnd.handheld-entertainment+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zmm"]
    },
    "application/vnd.hbci": {
      source: "iana",
      extensions: ["hbci"]
    },
    "application/vnd.hc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hcl-bireports": {
      source: "iana"
    },
    "application/vnd.hdt": {
      source: "iana"
    },
    "application/vnd.heroku+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hhe.lesson-player": {
      source: "iana",
      extensions: ["les"]
    },
    "application/vnd.hl7cda+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hl7v2+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hp-hpgl": {
      source: "iana",
      extensions: ["hpgl"]
    },
    "application/vnd.hp-hpid": {
      source: "iana",
      extensions: ["hpid"]
    },
    "application/vnd.hp-hps": {
      source: "iana",
      extensions: ["hps"]
    },
    "application/vnd.hp-jlyt": {
      source: "iana",
      extensions: ["jlt"]
    },
    "application/vnd.hp-pcl": {
      source: "iana",
      extensions: ["pcl"]
    },
    "application/vnd.hp-pclxl": {
      source: "iana",
      extensions: ["pclxl"]
    },
    "application/vnd.httphone": {
      source: "iana"
    },
    "application/vnd.hydrostatix.sof-data": {
      source: "iana",
      extensions: ["sfd-hdstx"]
    },
    "application/vnd.hyper+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyper-item+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyperdrive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hzn-3d-crossword": {
      source: "iana"
    },
    "application/vnd.ibm.afplinedata": {
      source: "iana"
    },
    "application/vnd.ibm.electronic-media": {
      source: "iana"
    },
    "application/vnd.ibm.minipay": {
      source: "iana",
      extensions: ["mpy"]
    },
    "application/vnd.ibm.modcap": {
      source: "iana",
      extensions: ["afp", "listafp", "list3820"]
    },
    "application/vnd.ibm.rights-management": {
      source: "iana",
      extensions: ["irm"]
    },
    "application/vnd.ibm.secure-container": {
      source: "iana",
      extensions: ["sc"]
    },
    "application/vnd.iccprofile": {
      source: "iana",
      extensions: ["icc", "icm"]
    },
    "application/vnd.ieee.1905": {
      source: "iana"
    },
    "application/vnd.igloader": {
      source: "iana",
      extensions: ["igl"]
    },
    "application/vnd.imagemeter.folder+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.imagemeter.image+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.immervision-ivp": {
      source: "iana",
      extensions: ["ivp"]
    },
    "application/vnd.immervision-ivu": {
      source: "iana",
      extensions: ["ivu"]
    },
    "application/vnd.ims.imsccv1p1": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p2": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p3": {
      source: "iana"
    },
    "application/vnd.ims.lis.v2.result+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy.id+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings.simple+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informedcontrol.rms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informix-visionary": {
      source: "iana"
    },
    "application/vnd.infotech.project": {
      source: "iana"
    },
    "application/vnd.infotech.project+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.innopath.wamp.notification": {
      source: "iana"
    },
    "application/vnd.insors.igm": {
      source: "iana",
      extensions: ["igm"]
    },
    "application/vnd.intercon.formnet": {
      source: "iana",
      extensions: ["xpw", "xpx"]
    },
    "application/vnd.intergeo": {
      source: "iana",
      extensions: ["i2g"]
    },
    "application/vnd.intertrust.digibox": {
      source: "iana"
    },
    "application/vnd.intertrust.nncp": {
      source: "iana"
    },
    "application/vnd.intu.qbo": {
      source: "iana",
      extensions: ["qbo"]
    },
    "application/vnd.intu.qfx": {
      source: "iana",
      extensions: ["qfx"]
    },
    "application/vnd.iptc.g2.catalogitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.conceptitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.knowledgeitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.packageitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.planningitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ipunplugged.rcprofile": {
      source: "iana",
      extensions: ["rcprofile"]
    },
    "application/vnd.irepository.package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["irp"]
    },
    "application/vnd.is-xpr": {
      source: "iana",
      extensions: ["xpr"]
    },
    "application/vnd.isac.fcs": {
      source: "iana",
      extensions: ["fcs"]
    },
    "application/vnd.iso11783-10+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.jam": {
      source: "iana",
      extensions: ["jam"]
    },
    "application/vnd.japannet-directory-service": {
      source: "iana"
    },
    "application/vnd.japannet-jpnstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-payment-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-registration": {
      source: "iana"
    },
    "application/vnd.japannet-registration-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-setstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-verification": {
      source: "iana"
    },
    "application/vnd.japannet-verification-wakeup": {
      source: "iana"
    },
    "application/vnd.jcp.javame.midlet-rms": {
      source: "iana",
      extensions: ["rms"]
    },
    "application/vnd.jisp": {
      source: "iana",
      extensions: ["jisp"]
    },
    "application/vnd.joost.joda-archive": {
      source: "iana",
      extensions: ["joda"]
    },
    "application/vnd.jsk.isdn-ngn": {
      source: "iana"
    },
    "application/vnd.kahootz": {
      source: "iana",
      extensions: ["ktz", "ktr"]
    },
    "application/vnd.kde.karbon": {
      source: "iana",
      extensions: ["karbon"]
    },
    "application/vnd.kde.kchart": {
      source: "iana",
      extensions: ["chrt"]
    },
    "application/vnd.kde.kformula": {
      source: "iana",
      extensions: ["kfo"]
    },
    "application/vnd.kde.kivio": {
      source: "iana",
      extensions: ["flw"]
    },
    "application/vnd.kde.kontour": {
      source: "iana",
      extensions: ["kon"]
    },
    "application/vnd.kde.kpresenter": {
      source: "iana",
      extensions: ["kpr", "kpt"]
    },
    "application/vnd.kde.kspread": {
      source: "iana",
      extensions: ["ksp"]
    },
    "application/vnd.kde.kword": {
      source: "iana",
      extensions: ["kwd", "kwt"]
    },
    "application/vnd.kenameaapp": {
      source: "iana",
      extensions: ["htke"]
    },
    "application/vnd.kidspiration": {
      source: "iana",
      extensions: ["kia"]
    },
    "application/vnd.kinar": {
      source: "iana",
      extensions: ["kne", "knp"]
    },
    "application/vnd.koan": {
      source: "iana",
      extensions: ["skp", "skd", "skt", "skm"]
    },
    "application/vnd.kodak-descriptor": {
      source: "iana",
      extensions: ["sse"]
    },
    "application/vnd.las": {
      source: "iana"
    },
    "application/vnd.las.las+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.las.las+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lasxml"]
    },
    "application/vnd.laszip": {
      source: "iana"
    },
    "application/vnd.leap+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.liberty-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
      source: "iana",
      extensions: ["lbd"]
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lbe"]
    },
    "application/vnd.logipipe.circuit+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.loom": {
      source: "iana"
    },
    "application/vnd.lotus-1-2-3": {
      source: "iana",
      extensions: ["123"]
    },
    "application/vnd.lotus-approach": {
      source: "iana",
      extensions: ["apr"]
    },
    "application/vnd.lotus-freelance": {
      source: "iana",
      extensions: ["pre"]
    },
    "application/vnd.lotus-notes": {
      source: "iana",
      extensions: ["nsf"]
    },
    "application/vnd.lotus-organizer": {
      source: "iana",
      extensions: ["org"]
    },
    "application/vnd.lotus-screencam": {
      source: "iana",
      extensions: ["scm"]
    },
    "application/vnd.lotus-wordpro": {
      source: "iana",
      extensions: ["lwp"]
    },
    "application/vnd.macports.portpkg": {
      source: "iana",
      extensions: ["portpkg"]
    },
    "application/vnd.mapbox-vector-tile": {
      source: "iana",
      extensions: ["mvt"]
    },
    "application/vnd.marlin.drm.actiontoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.conftoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.license+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.mdcf": {
      source: "iana"
    },
    "application/vnd.mason+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.maxar.archive.3tz+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.maxmind.maxmind-db": {
      source: "iana"
    },
    "application/vnd.mcd": {
      source: "iana",
      extensions: ["mcd"]
    },
    "application/vnd.medcalcdata": {
      source: "iana",
      extensions: ["mc1"]
    },
    "application/vnd.mediastation.cdkey": {
      source: "iana",
      extensions: ["cdkey"]
    },
    "application/vnd.meridian-slingshot": {
      source: "iana"
    },
    "application/vnd.mfer": {
      source: "iana",
      extensions: ["mwf"]
    },
    "application/vnd.mfmp": {
      source: "iana",
      extensions: ["mfm"]
    },
    "application/vnd.micro+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.micrografx.flo": {
      source: "iana",
      extensions: ["flo"]
    },
    "application/vnd.micrografx.igx": {
      source: "iana",
      extensions: ["igx"]
    },
    "application/vnd.microsoft.portable-executable": {
      source: "iana"
    },
    "application/vnd.microsoft.windows.thumbnail-cache": {
      source: "iana"
    },
    "application/vnd.miele+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.mif": {
      source: "iana",
      extensions: ["mif"]
    },
    "application/vnd.minisoft-hp3000-save": {
      source: "iana"
    },
    "application/vnd.mitsubishi.misty-guard.trustweb": {
      source: "iana"
    },
    "application/vnd.mobius.daf": {
      source: "iana",
      extensions: ["daf"]
    },
    "application/vnd.mobius.dis": {
      source: "iana",
      extensions: ["dis"]
    },
    "application/vnd.mobius.mbk": {
      source: "iana",
      extensions: ["mbk"]
    },
    "application/vnd.mobius.mqy": {
      source: "iana",
      extensions: ["mqy"]
    },
    "application/vnd.mobius.msl": {
      source: "iana",
      extensions: ["msl"]
    },
    "application/vnd.mobius.plc": {
      source: "iana",
      extensions: ["plc"]
    },
    "application/vnd.mobius.txf": {
      source: "iana",
      extensions: ["txf"]
    },
    "application/vnd.mophun.application": {
      source: "iana",
      extensions: ["mpn"]
    },
    "application/vnd.mophun.certificate": {
      source: "iana",
      extensions: ["mpc"]
    },
    "application/vnd.motorola.flexsuite": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.adsi": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.fis": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.gotap": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.kmr": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.ttc": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.wem": {
      source: "iana"
    },
    "application/vnd.motorola.iprm": {
      source: "iana"
    },
    "application/vnd.mozilla.xul+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xul"]
    },
    "application/vnd.ms-3mfdocument": {
      source: "iana"
    },
    "application/vnd.ms-artgalry": {
      source: "iana",
      extensions: ["cil"]
    },
    "application/vnd.ms-asf": {
      source: "iana"
    },
    "application/vnd.ms-cab-compressed": {
      source: "iana",
      extensions: ["cab"]
    },
    "application/vnd.ms-color.iccprofile": {
      source: "apache"
    },
    "application/vnd.ms-excel": {
      source: "iana",
      compressible: false,
      extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
      source: "iana",
      extensions: ["xlam"]
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
      source: "iana",
      extensions: ["xlsb"]
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
      source: "iana",
      extensions: ["xlsm"]
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
      source: "iana",
      extensions: ["xltm"]
    },
    "application/vnd.ms-fontobject": {
      source: "iana",
      compressible: true,
      extensions: ["eot"]
    },
    "application/vnd.ms-htmlhelp": {
      source: "iana",
      extensions: ["chm"]
    },
    "application/vnd.ms-ims": {
      source: "iana",
      extensions: ["ims"]
    },
    "application/vnd.ms-lrm": {
      source: "iana",
      extensions: ["lrm"]
    },
    "application/vnd.ms-office.activex+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-officetheme": {
      source: "iana",
      extensions: ["thmx"]
    },
    "application/vnd.ms-opentype": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-outlook": {
      compressible: false,
      extensions: ["msg"]
    },
    "application/vnd.ms-package.obfuscated-opentype": {
      source: "apache"
    },
    "application/vnd.ms-pki.seccat": {
      source: "apache",
      extensions: ["cat"]
    },
    "application/vnd.ms-pki.stl": {
      source: "apache",
      extensions: ["stl"]
    },
    "application/vnd.ms-playready.initiator+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-powerpoint": {
      source: "iana",
      compressible: false,
      extensions: ["ppt", "pps", "pot"]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
      source: "iana",
      extensions: ["ppam"]
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      source: "iana",
      extensions: ["pptm"]
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
      source: "iana",
      extensions: ["sldm"]
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
      source: "iana",
      extensions: ["ppsm"]
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
      source: "iana",
      extensions: ["potm"]
    },
    "application/vnd.ms-printdevicecapabilities+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-printing.printticket+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-printschematicket+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-project": {
      source: "iana",
      extensions: ["mpp", "mpt"]
    },
    "application/vnd.ms-tnef": {
      source: "iana"
    },
    "application/vnd.ms-windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.nwprinting.oob": {
      source: "iana"
    },
    "application/vnd.ms-windows.printerpairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.wsd.oob": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-resp": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-resp": {
      source: "iana"
    },
    "application/vnd.ms-word.document.macroenabled.12": {
      source: "iana",
      extensions: ["docm"]
    },
    "application/vnd.ms-word.template.macroenabled.12": {
      source: "iana",
      extensions: ["dotm"]
    },
    "application/vnd.ms-works": {
      source: "iana",
      extensions: ["wps", "wks", "wcm", "wdb"]
    },
    "application/vnd.ms-wpl": {
      source: "iana",
      extensions: ["wpl"]
    },
    "application/vnd.ms-xpsdocument": {
      source: "iana",
      compressible: false,
      extensions: ["xps"]
    },
    "application/vnd.msa-disk-image": {
      source: "iana"
    },
    "application/vnd.mseq": {
      source: "iana",
      extensions: ["mseq"]
    },
    "application/vnd.msign": {
      source: "iana"
    },
    "application/vnd.multiad.creator": {
      source: "iana"
    },
    "application/vnd.multiad.creator.cif": {
      source: "iana"
    },
    "application/vnd.music-niff": {
      source: "iana"
    },
    "application/vnd.musician": {
      source: "iana",
      extensions: ["mus"]
    },
    "application/vnd.muvee.style": {
      source: "iana",
      extensions: ["msty"]
    },
    "application/vnd.mynfc": {
      source: "iana",
      extensions: ["taglet"]
    },
    "application/vnd.nacamar.ybrid+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ncd.control": {
      source: "iana"
    },
    "application/vnd.ncd.reference": {
      source: "iana"
    },
    "application/vnd.nearst.inv+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nebumind.line": {
      source: "iana"
    },
    "application/vnd.nervana": {
      source: "iana"
    },
    "application/vnd.netfpx": {
      source: "iana"
    },
    "application/vnd.neurolanguage.nlu": {
      source: "iana",
      extensions: ["nlu"]
    },
    "application/vnd.nimn": {
      source: "iana"
    },
    "application/vnd.nintendo.nitro.rom": {
      source: "iana"
    },
    "application/vnd.nintendo.snes.rom": {
      source: "iana"
    },
    "application/vnd.nitf": {
      source: "iana",
      extensions: ["ntf", "nitf"]
    },
    "application/vnd.noblenet-directory": {
      source: "iana",
      extensions: ["nnd"]
    },
    "application/vnd.noblenet-sealer": {
      source: "iana",
      extensions: ["nns"]
    },
    "application/vnd.noblenet-web": {
      source: "iana",
      extensions: ["nnw"]
    },
    "application/vnd.nokia.catalogs": {
      source: "iana"
    },
    "application/vnd.nokia.conml+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.conml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.iptv.config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.isds-radio-presets": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.landmarkcollection+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.n-gage.ac+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ac"]
    },
    "application/vnd.nokia.n-gage.data": {
      source: "iana",
      extensions: ["ngdat"]
    },
    "application/vnd.nokia.n-gage.symbian.install": {
      source: "iana",
      extensions: ["n-gage"]
    },
    "application/vnd.nokia.ncd": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.radio-preset": {
      source: "iana",
      extensions: ["rpst"]
    },
    "application/vnd.nokia.radio-presets": {
      source: "iana",
      extensions: ["rpss"]
    },
    "application/vnd.novadigm.edm": {
      source: "iana",
      extensions: ["edm"]
    },
    "application/vnd.novadigm.edx": {
      source: "iana",
      extensions: ["edx"]
    },
    "application/vnd.novadigm.ext": {
      source: "iana",
      extensions: ["ext"]
    },
    "application/vnd.ntt-local.content-share": {
      source: "iana"
    },
    "application/vnd.ntt-local.file-transfer": {
      source: "iana"
    },
    "application/vnd.ntt-local.ogw_remote-access": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_remote": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_tcp_stream": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.chart": {
      source: "iana",
      extensions: ["odc"]
    },
    "application/vnd.oasis.opendocument.chart-template": {
      source: "iana",
      extensions: ["otc"]
    },
    "application/vnd.oasis.opendocument.database": {
      source: "iana",
      extensions: ["odb"]
    },
    "application/vnd.oasis.opendocument.formula": {
      source: "iana",
      extensions: ["odf"]
    },
    "application/vnd.oasis.opendocument.formula-template": {
      source: "iana",
      extensions: ["odft"]
    },
    "application/vnd.oasis.opendocument.graphics": {
      source: "iana",
      compressible: false,
      extensions: ["odg"]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
      source: "iana",
      extensions: ["otg"]
    },
    "application/vnd.oasis.opendocument.image": {
      source: "iana",
      extensions: ["odi"]
    },
    "application/vnd.oasis.opendocument.image-template": {
      source: "iana",
      extensions: ["oti"]
    },
    "application/vnd.oasis.opendocument.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["odp"]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
      source: "iana",
      extensions: ["otp"]
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      source: "iana",
      compressible: false,
      extensions: ["ods"]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
      source: "iana",
      extensions: ["ots"]
    },
    "application/vnd.oasis.opendocument.text": {
      source: "iana",
      compressible: false,
      extensions: ["odt"]
    },
    "application/vnd.oasis.opendocument.text-master": {
      source: "iana",
      extensions: ["odm"]
    },
    "application/vnd.oasis.opendocument.text-template": {
      source: "iana",
      extensions: ["ott"]
    },
    "application/vnd.oasis.opendocument.text-web": {
      source: "iana",
      extensions: ["oth"]
    },
    "application/vnd.obn": {
      source: "iana"
    },
    "application/vnd.ocf+cbor": {
      source: "iana"
    },
    "application/vnd.oci.image.manifest.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oftn.l10n+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessdownload+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessstreaming+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.cspg-hexbinary": {
      source: "iana"
    },
    "application/vnd.oipf.dae.svg+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.dae.xhtml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.mippvcontrolmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.pae.gem": {
      source: "iana"
    },
    "application/vnd.oipf.spdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.spdlist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.ueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.userprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.olpc-sugar": {
      source: "iana",
      extensions: ["xo"]
    },
    "application/vnd.oma-scws-config": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-request": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-response": {
      source: "iana"
    },
    "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.drm-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.imd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.ltkm": {
      source: "iana"
    },
    "application/vnd.oma.bcast.notification+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.provisioningtrigger": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgboot": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgdd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sgdu": {
      source: "iana"
    },
    "application/vnd.oma.bcast.simple-symbol-container": {
      source: "iana"
    },
    "application/vnd.oma.bcast.smartcard-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sprov+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.stkm": {
      source: "iana"
    },
    "application/vnd.oma.cab-address-book+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-feature-handler+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-pcc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-subs-invite+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-user-prefs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.dcd": {
      source: "iana"
    },
    "application/vnd.oma.dcdc": {
      source: "iana"
    },
    "application/vnd.oma.dd2+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dd2"]
    },
    "application/vnd.oma.drm.risd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.group-usage-list+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+cbor": {
      source: "iana"
    },
    "application/vnd.oma.lwm2m+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+tlv": {
      source: "iana"
    },
    "application/vnd.oma.pal+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.detailed-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.final-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.groups+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.invocation-descriptor+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.optimized-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.push": {
      source: "iana"
    },
    "application/vnd.oma.scidm.messages+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.xcap-directory+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.omads-email+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-file+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-folder+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omaloc-supl-init": {
      source: "iana"
    },
    "application/vnd.onepager": {
      source: "iana"
    },
    "application/vnd.onepagertamp": {
      source: "iana"
    },
    "application/vnd.onepagertamx": {
      source: "iana"
    },
    "application/vnd.onepagertat": {
      source: "iana"
    },
    "application/vnd.onepagertatp": {
      source: "iana"
    },
    "application/vnd.onepagertatx": {
      source: "iana"
    },
    "application/vnd.openblox.game+xml": {
      source: "iana",
      compressible: true,
      extensions: ["obgx"]
    },
    "application/vnd.openblox.game-binary": {
      source: "iana"
    },
    "application/vnd.openeye.oeb": {
      source: "iana"
    },
    "application/vnd.openofficeorg.extension": {
      source: "apache",
      extensions: ["oxt"]
    },
    "application/vnd.openstreetmap.data+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osm"]
    },
    "application/vnd.opentimestamps.ots": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawing+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["pptx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      source: "iana",
      extensions: ["sldx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      source: "iana",
      extensions: ["ppsx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
      source: "iana",
      extensions: ["potx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      source: "iana",
      compressible: false,
      extensions: ["xlsx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
      source: "iana",
      extensions: ["xltx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.theme+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.vmldrawing": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      source: "iana",
      compressible: false,
      extensions: ["docx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
      source: "iana",
      extensions: ["dotx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.core-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.relationships+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oracle.resource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.orange.indata": {
      source: "iana"
    },
    "application/vnd.osa.netdeploy": {
      source: "iana"
    },
    "application/vnd.osgeo.mapguide.package": {
      source: "iana",
      extensions: ["mgp"]
    },
    "application/vnd.osgi.bundle": {
      source: "iana"
    },
    "application/vnd.osgi.dp": {
      source: "iana",
      extensions: ["dp"]
    },
    "application/vnd.osgi.subsystem": {
      source: "iana",
      extensions: ["esa"]
    },
    "application/vnd.otps.ct-kip+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oxli.countgraph": {
      source: "iana"
    },
    "application/vnd.pagerduty+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.palm": {
      source: "iana",
      extensions: ["pdb", "pqa", "oprc"]
    },
    "application/vnd.panoply": {
      source: "iana"
    },
    "application/vnd.paos.xml": {
      source: "iana"
    },
    "application/vnd.patentdive": {
      source: "iana"
    },
    "application/vnd.patientecommsdoc": {
      source: "iana"
    },
    "application/vnd.pawaafile": {
      source: "iana",
      extensions: ["paw"]
    },
    "application/vnd.pcos": {
      source: "iana"
    },
    "application/vnd.pg.format": {
      source: "iana",
      extensions: ["str"]
    },
    "application/vnd.pg.osasli": {
      source: "iana",
      extensions: ["ei6"]
    },
    "application/vnd.piaccess.application-licence": {
      source: "iana"
    },
    "application/vnd.picsel": {
      source: "iana",
      extensions: ["efif"]
    },
    "application/vnd.pmi.widget": {
      source: "iana",
      extensions: ["wg"]
    },
    "application/vnd.poc.group-advertisement+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.pocketlearn": {
      source: "iana",
      extensions: ["plf"]
    },
    "application/vnd.powerbuilder6": {
      source: "iana",
      extensions: ["pbd"]
    },
    "application/vnd.powerbuilder6-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder7": {
      source: "iana"
    },
    "application/vnd.powerbuilder7-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder75": {
      source: "iana"
    },
    "application/vnd.powerbuilder75-s": {
      source: "iana"
    },
    "application/vnd.preminet": {
      source: "iana"
    },
    "application/vnd.previewsystems.box": {
      source: "iana",
      extensions: ["box"]
    },
    "application/vnd.proteus.magazine": {
      source: "iana",
      extensions: ["mgz"]
    },
    "application/vnd.psfs": {
      source: "iana"
    },
    "application/vnd.publishare-delta-tree": {
      source: "iana",
      extensions: ["qps"]
    },
    "application/vnd.pvi.ptid1": {
      source: "iana",
      extensions: ["ptid"]
    },
    "application/vnd.pwg-multiplexed": {
      source: "iana"
    },
    "application/vnd.pwg-xhtml-print+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.qualcomm.brew-app-res": {
      source: "iana"
    },
    "application/vnd.quarantainenet": {
      source: "iana"
    },
    "application/vnd.quark.quarkxpress": {
      source: "iana",
      extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
    },
    "application/vnd.quobject-quoxdocument": {
      source: "iana"
    },
    "application/vnd.radisys.moml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-stream+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-base+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-detect+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-group+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-speech+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-transform+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rainstor.data": {
      source: "iana"
    },
    "application/vnd.rapid": {
      source: "iana"
    },
    "application/vnd.rar": {
      source: "iana",
      extensions: ["rar"]
    },
    "application/vnd.realvnc.bed": {
      source: "iana",
      extensions: ["bed"]
    },
    "application/vnd.recordare.musicxml": {
      source: "iana",
      extensions: ["mxl"]
    },
    "application/vnd.recordare.musicxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musicxml"]
    },
    "application/vnd.renlearn.rlprint": {
      source: "iana"
    },
    "application/vnd.resilient.logic": {
      source: "iana"
    },
    "application/vnd.restful+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rig.cryptonote": {
      source: "iana",
      extensions: ["cryptonote"]
    },
    "application/vnd.rim.cod": {
      source: "apache",
      extensions: ["cod"]
    },
    "application/vnd.rn-realmedia": {
      source: "apache",
      extensions: ["rm"]
    },
    "application/vnd.rn-realmedia-vbr": {
      source: "apache",
      extensions: ["rmvb"]
    },
    "application/vnd.route66.link66+xml": {
      source: "iana",
      compressible: true,
      extensions: ["link66"]
    },
    "application/vnd.rs-274x": {
      source: "iana"
    },
    "application/vnd.ruckus.download": {
      source: "iana"
    },
    "application/vnd.s3sms": {
      source: "iana"
    },
    "application/vnd.sailingtracker.track": {
      source: "iana",
      extensions: ["st"]
    },
    "application/vnd.sar": {
      source: "iana"
    },
    "application/vnd.sbm.cid": {
      source: "iana"
    },
    "application/vnd.sbm.mid2": {
      source: "iana"
    },
    "application/vnd.scribus": {
      source: "iana"
    },
    "application/vnd.sealed.3df": {
      source: "iana"
    },
    "application/vnd.sealed.csf": {
      source: "iana"
    },
    "application/vnd.sealed.doc": {
      source: "iana"
    },
    "application/vnd.sealed.eml": {
      source: "iana"
    },
    "application/vnd.sealed.mht": {
      source: "iana"
    },
    "application/vnd.sealed.net": {
      source: "iana"
    },
    "application/vnd.sealed.ppt": {
      source: "iana"
    },
    "application/vnd.sealed.tiff": {
      source: "iana"
    },
    "application/vnd.sealed.xls": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.html": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.pdf": {
      source: "iana"
    },
    "application/vnd.seemail": {
      source: "iana",
      extensions: ["see"]
    },
    "application/vnd.seis+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.sema": {
      source: "iana",
      extensions: ["sema"]
    },
    "application/vnd.semd": {
      source: "iana",
      extensions: ["semd"]
    },
    "application/vnd.semf": {
      source: "iana",
      extensions: ["semf"]
    },
    "application/vnd.shade-save-file": {
      source: "iana"
    },
    "application/vnd.shana.informed.formdata": {
      source: "iana",
      extensions: ["ifm"]
    },
    "application/vnd.shana.informed.formtemplate": {
      source: "iana",
      extensions: ["itp"]
    },
    "application/vnd.shana.informed.interchange": {
      source: "iana",
      extensions: ["iif"]
    },
    "application/vnd.shana.informed.package": {
      source: "iana",
      extensions: ["ipk"]
    },
    "application/vnd.shootproof+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shopkick+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shp": {
      source: "iana"
    },
    "application/vnd.shx": {
      source: "iana"
    },
    "application/vnd.sigrok.session": {
      source: "iana"
    },
    "application/vnd.simtech-mindmapper": {
      source: "iana",
      extensions: ["twd", "twds"]
    },
    "application/vnd.siren+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.smaf": {
      source: "iana",
      extensions: ["mmf"]
    },
    "application/vnd.smart.notebook": {
      source: "iana"
    },
    "application/vnd.smart.teacher": {
      source: "iana",
      extensions: ["teacher"]
    },
    "application/vnd.snesdev-page-table": {
      source: "iana"
    },
    "application/vnd.software602.filler.form+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fo"]
    },
    "application/vnd.software602.filler.form-xml-zip": {
      source: "iana"
    },
    "application/vnd.solent.sdkm+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sdkm", "sdkd"]
    },
    "application/vnd.spotfire.dxp": {
      source: "iana",
      extensions: ["dxp"]
    },
    "application/vnd.spotfire.sfs": {
      source: "iana",
      extensions: ["sfs"]
    },
    "application/vnd.sqlite3": {
      source: "iana"
    },
    "application/vnd.sss-cod": {
      source: "iana"
    },
    "application/vnd.sss-dtf": {
      source: "iana"
    },
    "application/vnd.sss-ntf": {
      source: "iana"
    },
    "application/vnd.stardivision.calc": {
      source: "apache",
      extensions: ["sdc"]
    },
    "application/vnd.stardivision.draw": {
      source: "apache",
      extensions: ["sda"]
    },
    "application/vnd.stardivision.impress": {
      source: "apache",
      extensions: ["sdd"]
    },
    "application/vnd.stardivision.math": {
      source: "apache",
      extensions: ["smf"]
    },
    "application/vnd.stardivision.writer": {
      source: "apache",
      extensions: ["sdw", "vor"]
    },
    "application/vnd.stardivision.writer-global": {
      source: "apache",
      extensions: ["sgl"]
    },
    "application/vnd.stepmania.package": {
      source: "iana",
      extensions: ["smzip"]
    },
    "application/vnd.stepmania.stepchart": {
      source: "iana",
      extensions: ["sm"]
    },
    "application/vnd.street-stream": {
      source: "iana"
    },
    "application/vnd.sun.wadl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wadl"]
    },
    "application/vnd.sun.xml.calc": {
      source: "apache",
      extensions: ["sxc"]
    },
    "application/vnd.sun.xml.calc.template": {
      source: "apache",
      extensions: ["stc"]
    },
    "application/vnd.sun.xml.draw": {
      source: "apache",
      extensions: ["sxd"]
    },
    "application/vnd.sun.xml.draw.template": {
      source: "apache",
      extensions: ["std"]
    },
    "application/vnd.sun.xml.impress": {
      source: "apache",
      extensions: ["sxi"]
    },
    "application/vnd.sun.xml.impress.template": {
      source: "apache",
      extensions: ["sti"]
    },
    "application/vnd.sun.xml.math": {
      source: "apache",
      extensions: ["sxm"]
    },
    "application/vnd.sun.xml.writer": {
      source: "apache",
      extensions: ["sxw"]
    },
    "application/vnd.sun.xml.writer.global": {
      source: "apache",
      extensions: ["sxg"]
    },
    "application/vnd.sun.xml.writer.template": {
      source: "apache",
      extensions: ["stw"]
    },
    "application/vnd.sus-calendar": {
      source: "iana",
      extensions: ["sus", "susp"]
    },
    "application/vnd.svd": {
      source: "iana",
      extensions: ["svd"]
    },
    "application/vnd.swiftview-ics": {
      source: "iana"
    },
    "application/vnd.sycle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.syft+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.symbian.install": {
      source: "apache",
      extensions: ["sis", "sisx"]
    },
    "application/vnd.syncml+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xsm"]
    },
    "application/vnd.syncml.dm+wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["bdm"]
    },
    "application/vnd.syncml.dm+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xdm"]
    },
    "application/vnd.syncml.dm.notification": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["ddf"]
    },
    "application/vnd.syncml.dmtnds+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmtnds+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.syncml.ds.notification": {
      source: "iana"
    },
    "application/vnd.tableschema+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tao.intent-module-archive": {
      source: "iana",
      extensions: ["tao"]
    },
    "application/vnd.tcpdump.pcap": {
      source: "iana",
      extensions: ["pcap", "cap", "dmp"]
    },
    "application/vnd.think-cell.ppttc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tmd.mediaflex.api+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tml": {
      source: "iana"
    },
    "application/vnd.tmobile-livetv": {
      source: "iana",
      extensions: ["tmo"]
    },
    "application/vnd.tri.onesource": {
      source: "iana"
    },
    "application/vnd.trid.tpt": {
      source: "iana",
      extensions: ["tpt"]
    },
    "application/vnd.triscape.mxs": {
      source: "iana",
      extensions: ["mxs"]
    },
    "application/vnd.trueapp": {
      source: "iana",
      extensions: ["tra"]
    },
    "application/vnd.truedoc": {
      source: "iana"
    },
    "application/vnd.ubisoft.webplayer": {
      source: "iana"
    },
    "application/vnd.ufdl": {
      source: "iana",
      extensions: ["ufd", "ufdl"]
    },
    "application/vnd.uiq.theme": {
      source: "iana",
      extensions: ["utz"]
    },
    "application/vnd.umajin": {
      source: "iana",
      extensions: ["umj"]
    },
    "application/vnd.unity": {
      source: "iana",
      extensions: ["unityweb"]
    },
    "application/vnd.uoml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uoml"]
    },
    "application/vnd.uplanet.alert": {
      source: "iana"
    },
    "application/vnd.uplanet.alert-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.channel": {
      source: "iana"
    },
    "application/vnd.uplanet.channel-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.list": {
      source: "iana"
    },
    "application/vnd.uplanet.list-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.signal": {
      source: "iana"
    },
    "application/vnd.uri-map": {
      source: "iana"
    },
    "application/vnd.valve.source.material": {
      source: "iana"
    },
    "application/vnd.vcx": {
      source: "iana",
      extensions: ["vcx"]
    },
    "application/vnd.vd-study": {
      source: "iana"
    },
    "application/vnd.vectorworks": {
      source: "iana"
    },
    "application/vnd.vel+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.verimatrix.vcas": {
      source: "iana"
    },
    "application/vnd.veritone.aion+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.veryant.thin": {
      source: "iana"
    },
    "application/vnd.ves.encrypted": {
      source: "iana"
    },
    "application/vnd.vidsoft.vidconference": {
      source: "iana"
    },
    "application/vnd.visio": {
      source: "iana",
      extensions: ["vsd", "vst", "vss", "vsw"]
    },
    "application/vnd.visionary": {
      source: "iana",
      extensions: ["vis"]
    },
    "application/vnd.vividence.scriptfile": {
      source: "iana"
    },
    "application/vnd.vsf": {
      source: "iana",
      extensions: ["vsf"]
    },
    "application/vnd.wap.sic": {
      source: "iana"
    },
    "application/vnd.wap.slc": {
      source: "iana"
    },
    "application/vnd.wap.wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["wbxml"]
    },
    "application/vnd.wap.wmlc": {
      source: "iana",
      extensions: ["wmlc"]
    },
    "application/vnd.wap.wmlscriptc": {
      source: "iana",
      extensions: ["wmlsc"]
    },
    "application/vnd.webturbo": {
      source: "iana",
      extensions: ["wtb"]
    },
    "application/vnd.wfa.dpp": {
      source: "iana"
    },
    "application/vnd.wfa.p2p": {
      source: "iana"
    },
    "application/vnd.wfa.wsc": {
      source: "iana"
    },
    "application/vnd.windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.wmc": {
      source: "iana"
    },
    "application/vnd.wmf.bootstrap": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica.package": {
      source: "iana"
    },
    "application/vnd.wolfram.player": {
      source: "iana",
      extensions: ["nbp"]
    },
    "application/vnd.wordperfect": {
      source: "iana",
      extensions: ["wpd"]
    },
    "application/vnd.wqd": {
      source: "iana",
      extensions: ["wqd"]
    },
    "application/vnd.wrq-hp3000-labelled": {
      source: "iana"
    },
    "application/vnd.wt.stf": {
      source: "iana",
      extensions: ["stf"]
    },
    "application/vnd.wv.csp+wbxml": {
      source: "iana"
    },
    "application/vnd.wv.csp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.wv.ssp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xacml+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xara": {
      source: "iana",
      extensions: ["xar"]
    },
    "application/vnd.xfdl": {
      source: "iana",
      extensions: ["xfdl"]
    },
    "application/vnd.xfdl.webform": {
      source: "iana"
    },
    "application/vnd.xmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xmpie.cpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.dpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.plan": {
      source: "iana"
    },
    "application/vnd.xmpie.ppkg": {
      source: "iana"
    },
    "application/vnd.xmpie.xlim": {
      source: "iana"
    },
    "application/vnd.yamaha.hv-dic": {
      source: "iana",
      extensions: ["hvd"]
    },
    "application/vnd.yamaha.hv-script": {
      source: "iana",
      extensions: ["hvs"]
    },
    "application/vnd.yamaha.hv-voice": {
      source: "iana",
      extensions: ["hvp"]
    },
    "application/vnd.yamaha.openscoreformat": {
      source: "iana",
      extensions: ["osf"]
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osfpvg"]
    },
    "application/vnd.yamaha.remote-setup": {
      source: "iana"
    },
    "application/vnd.yamaha.smaf-audio": {
      source: "iana",
      extensions: ["saf"]
    },
    "application/vnd.yamaha.smaf-phrase": {
      source: "iana",
      extensions: ["spf"]
    },
    "application/vnd.yamaha.through-ngn": {
      source: "iana"
    },
    "application/vnd.yamaha.tunnel-udpencap": {
      source: "iana"
    },
    "application/vnd.yaoweme": {
      source: "iana"
    },
    "application/vnd.yellowriver-custom-menu": {
      source: "iana",
      extensions: ["cmp"]
    },
    "application/vnd.youtube.yt": {
      source: "iana"
    },
    "application/vnd.zul": {
      source: "iana",
      extensions: ["zir", "zirz"]
    },
    "application/vnd.zzazz.deck+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zaz"]
    },
    "application/voicexml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["vxml"]
    },
    "application/voucher-cms+json": {
      source: "iana",
      compressible: true
    },
    "application/vq-rtcpxr": {
      source: "iana"
    },
    "application/wasm": {
      source: "iana",
      compressible: true,
      extensions: ["wasm"]
    },
    "application/watcherinfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wif"]
    },
    "application/webpush-options+json": {
      source: "iana",
      compressible: true
    },
    "application/whoispp-query": {
      source: "iana"
    },
    "application/whoispp-response": {
      source: "iana"
    },
    "application/widget": {
      source: "iana",
      extensions: ["wgt"]
    },
    "application/winhlp": {
      source: "apache",
      extensions: ["hlp"]
    },
    "application/wita": {
      source: "iana"
    },
    "application/wordperfect5.1": {
      source: "iana"
    },
    "application/wsdl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wsdl"]
    },
    "application/wspolicy+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wspolicy"]
    },
    "application/x-7z-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["7z"]
    },
    "application/x-abiword": {
      source: "apache",
      extensions: ["abw"]
    },
    "application/x-ace-compressed": {
      source: "apache",
      extensions: ["ace"]
    },
    "application/x-amf": {
      source: "apache"
    },
    "application/x-apple-diskimage": {
      source: "apache",
      extensions: ["dmg"]
    },
    "application/x-arj": {
      compressible: false,
      extensions: ["arj"]
    },
    "application/x-authorware-bin": {
      source: "apache",
      extensions: ["aab", "x32", "u32", "vox"]
    },
    "application/x-authorware-map": {
      source: "apache",
      extensions: ["aam"]
    },
    "application/x-authorware-seg": {
      source: "apache",
      extensions: ["aas"]
    },
    "application/x-bcpio": {
      source: "apache",
      extensions: ["bcpio"]
    },
    "application/x-bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/x-bittorrent": {
      source: "apache",
      extensions: ["torrent"]
    },
    "application/x-blorb": {
      source: "apache",
      extensions: ["blb", "blorb"]
    },
    "application/x-bzip": {
      source: "apache",
      compressible: false,
      extensions: ["bz"]
    },
    "application/x-bzip2": {
      source: "apache",
      compressible: false,
      extensions: ["bz2", "boz"]
    },
    "application/x-cbr": {
      source: "apache",
      extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
    },
    "application/x-cdlink": {
      source: "apache",
      extensions: ["vcd"]
    },
    "application/x-cfs-compressed": {
      source: "apache",
      extensions: ["cfs"]
    },
    "application/x-chat": {
      source: "apache",
      extensions: ["chat"]
    },
    "application/x-chess-pgn": {
      source: "apache",
      extensions: ["pgn"]
    },
    "application/x-chrome-extension": {
      extensions: ["crx"]
    },
    "application/x-cocoa": {
      source: "nginx",
      extensions: ["cco"]
    },
    "application/x-compress": {
      source: "apache"
    },
    "application/x-conference": {
      source: "apache",
      extensions: ["nsc"]
    },
    "application/x-cpio": {
      source: "apache",
      extensions: ["cpio"]
    },
    "application/x-csh": {
      source: "apache",
      extensions: ["csh"]
    },
    "application/x-deb": {
      compressible: false
    },
    "application/x-debian-package": {
      source: "apache",
      extensions: ["deb", "udeb"]
    },
    "application/x-dgc-compressed": {
      source: "apache",
      extensions: ["dgc"]
    },
    "application/x-director": {
      source: "apache",
      extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
    },
    "application/x-doom": {
      source: "apache",
      extensions: ["wad"]
    },
    "application/x-dtbncx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ncx"]
    },
    "application/x-dtbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dtb"]
    },
    "application/x-dtbresource+xml": {
      source: "apache",
      compressible: true,
      extensions: ["res"]
    },
    "application/x-dvi": {
      source: "apache",
      compressible: false,
      extensions: ["dvi"]
    },
    "application/x-envoy": {
      source: "apache",
      extensions: ["evy"]
    },
    "application/x-eva": {
      source: "apache",
      extensions: ["eva"]
    },
    "application/x-font-bdf": {
      source: "apache",
      extensions: ["bdf"]
    },
    "application/x-font-dos": {
      source: "apache"
    },
    "application/x-font-framemaker": {
      source: "apache"
    },
    "application/x-font-ghostscript": {
      source: "apache",
      extensions: ["gsf"]
    },
    "application/x-font-libgrx": {
      source: "apache"
    },
    "application/x-font-linux-psf": {
      source: "apache",
      extensions: ["psf"]
    },
    "application/x-font-pcf": {
      source: "apache",
      extensions: ["pcf"]
    },
    "application/x-font-snf": {
      source: "apache",
      extensions: ["snf"]
    },
    "application/x-font-speedo": {
      source: "apache"
    },
    "application/x-font-sunos-news": {
      source: "apache"
    },
    "application/x-font-type1": {
      source: "apache",
      extensions: ["pfa", "pfb", "pfm", "afm"]
    },
    "application/x-font-vfont": {
      source: "apache"
    },
    "application/x-freearc": {
      source: "apache",
      extensions: ["arc"]
    },
    "application/x-futuresplash": {
      source: "apache",
      extensions: ["spl"]
    },
    "application/x-gca-compressed": {
      source: "apache",
      extensions: ["gca"]
    },
    "application/x-glulx": {
      source: "apache",
      extensions: ["ulx"]
    },
    "application/x-gnumeric": {
      source: "apache",
      extensions: ["gnumeric"]
    },
    "application/x-gramps-xml": {
      source: "apache",
      extensions: ["gramps"]
    },
    "application/x-gtar": {
      source: "apache",
      extensions: ["gtar"]
    },
    "application/x-gzip": {
      source: "apache"
    },
    "application/x-hdf": {
      source: "apache",
      extensions: ["hdf"]
    },
    "application/x-httpd-php": {
      compressible: true,
      extensions: ["php"]
    },
    "application/x-install-instructions": {
      source: "apache",
      extensions: ["install"]
    },
    "application/x-iso9660-image": {
      source: "apache",
      extensions: ["iso"]
    },
    "application/x-iwork-keynote-sffkey": {
      extensions: ["key"]
    },
    "application/x-iwork-numbers-sffnumbers": {
      extensions: ["numbers"]
    },
    "application/x-iwork-pages-sffpages": {
      extensions: ["pages"]
    },
    "application/x-java-archive-diff": {
      source: "nginx",
      extensions: ["jardiff"]
    },
    "application/x-java-jnlp-file": {
      source: "apache",
      compressible: false,
      extensions: ["jnlp"]
    },
    "application/x-javascript": {
      compressible: true
    },
    "application/x-keepass2": {
      extensions: ["kdbx"]
    },
    "application/x-latex": {
      source: "apache",
      compressible: false,
      extensions: ["latex"]
    },
    "application/x-lua-bytecode": {
      extensions: ["luac"]
    },
    "application/x-lzh-compressed": {
      source: "apache",
      extensions: ["lzh", "lha"]
    },
    "application/x-makeself": {
      source: "nginx",
      extensions: ["run"]
    },
    "application/x-mie": {
      source: "apache",
      extensions: ["mie"]
    },
    "application/x-mobipocket-ebook": {
      source: "apache",
      extensions: ["prc", "mobi"]
    },
    "application/x-mpegurl": {
      compressible: false
    },
    "application/x-ms-application": {
      source: "apache",
      extensions: ["application"]
    },
    "application/x-ms-shortcut": {
      source: "apache",
      extensions: ["lnk"]
    },
    "application/x-ms-wmd": {
      source: "apache",
      extensions: ["wmd"]
    },
    "application/x-ms-wmz": {
      source: "apache",
      extensions: ["wmz"]
    },
    "application/x-ms-xbap": {
      source: "apache",
      extensions: ["xbap"]
    },
    "application/x-msaccess": {
      source: "apache",
      extensions: ["mdb"]
    },
    "application/x-msbinder": {
      source: "apache",
      extensions: ["obd"]
    },
    "application/x-mscardfile": {
      source: "apache",
      extensions: ["crd"]
    },
    "application/x-msclip": {
      source: "apache",
      extensions: ["clp"]
    },
    "application/x-msdos-program": {
      extensions: ["exe"]
    },
    "application/x-msdownload": {
      source: "apache",
      extensions: ["exe", "dll", "com", "bat", "msi"]
    },
    "application/x-msmediaview": {
      source: "apache",
      extensions: ["mvb", "m13", "m14"]
    },
    "application/x-msmetafile": {
      source: "apache",
      extensions: ["wmf", "wmz", "emf", "emz"]
    },
    "application/x-msmoney": {
      source: "apache",
      extensions: ["mny"]
    },
    "application/x-mspublisher": {
      source: "apache",
      extensions: ["pub"]
    },
    "application/x-msschedule": {
      source: "apache",
      extensions: ["scd"]
    },
    "application/x-msterminal": {
      source: "apache",
      extensions: ["trm"]
    },
    "application/x-mswrite": {
      source: "apache",
      extensions: ["wri"]
    },
    "application/x-netcdf": {
      source: "apache",
      extensions: ["nc", "cdf"]
    },
    "application/x-ns-proxy-autoconfig": {
      compressible: true,
      extensions: ["pac"]
    },
    "application/x-nzb": {
      source: "apache",
      extensions: ["nzb"]
    },
    "application/x-perl": {
      source: "nginx",
      extensions: ["pl", "pm"]
    },
    "application/x-pilot": {
      source: "nginx",
      extensions: ["prc", "pdb"]
    },
    "application/x-pkcs12": {
      source: "apache",
      compressible: false,
      extensions: ["p12", "pfx"]
    },
    "application/x-pkcs7-certificates": {
      source: "apache",
      extensions: ["p7b", "spc"]
    },
    "application/x-pkcs7-certreqresp": {
      source: "apache",
      extensions: ["p7r"]
    },
    "application/x-pki-message": {
      source: "iana"
    },
    "application/x-rar-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["rar"]
    },
    "application/x-redhat-package-manager": {
      source: "nginx",
      extensions: ["rpm"]
    },
    "application/x-research-info-systems": {
      source: "apache",
      extensions: ["ris"]
    },
    "application/x-sea": {
      source: "nginx",
      extensions: ["sea"]
    },
    "application/x-sh": {
      source: "apache",
      compressible: true,
      extensions: ["sh"]
    },
    "application/x-shar": {
      source: "apache",
      extensions: ["shar"]
    },
    "application/x-shockwave-flash": {
      source: "apache",
      compressible: false,
      extensions: ["swf"]
    },
    "application/x-silverlight-app": {
      source: "apache",
      extensions: ["xap"]
    },
    "application/x-sql": {
      source: "apache",
      extensions: ["sql"]
    },
    "application/x-stuffit": {
      source: "apache",
      compressible: false,
      extensions: ["sit"]
    },
    "application/x-stuffitx": {
      source: "apache",
      extensions: ["sitx"]
    },
    "application/x-subrip": {
      source: "apache",
      extensions: ["srt"]
    },
    "application/x-sv4cpio": {
      source: "apache",
      extensions: ["sv4cpio"]
    },
    "application/x-sv4crc": {
      source: "apache",
      extensions: ["sv4crc"]
    },
    "application/x-t3vm-image": {
      source: "apache",
      extensions: ["t3"]
    },
    "application/x-tads": {
      source: "apache",
      extensions: ["gam"]
    },
    "application/x-tar": {
      source: "apache",
      compressible: true,
      extensions: ["tar"]
    },
    "application/x-tcl": {
      source: "apache",
      extensions: ["tcl", "tk"]
    },
    "application/x-tex": {
      source: "apache",
      extensions: ["tex"]
    },
    "application/x-tex-tfm": {
      source: "apache",
      extensions: ["tfm"]
    },
    "application/x-texinfo": {
      source: "apache",
      extensions: ["texinfo", "texi"]
    },
    "application/x-tgif": {
      source: "apache",
      extensions: ["obj"]
    },
    "application/x-ustar": {
      source: "apache",
      extensions: ["ustar"]
    },
    "application/x-virtualbox-hdd": {
      compressible: true,
      extensions: ["hdd"]
    },
    "application/x-virtualbox-ova": {
      compressible: true,
      extensions: ["ova"]
    },
    "application/x-virtualbox-ovf": {
      compressible: true,
      extensions: ["ovf"]
    },
    "application/x-virtualbox-vbox": {
      compressible: true,
      extensions: ["vbox"]
    },
    "application/x-virtualbox-vbox-extpack": {
      compressible: false,
      extensions: ["vbox-extpack"]
    },
    "application/x-virtualbox-vdi": {
      compressible: true,
      extensions: ["vdi"]
    },
    "application/x-virtualbox-vhd": {
      compressible: true,
      extensions: ["vhd"]
    },
    "application/x-virtualbox-vmdk": {
      compressible: true,
      extensions: ["vmdk"]
    },
    "application/x-wais-source": {
      source: "apache",
      extensions: ["src"]
    },
    "application/x-web-app-manifest+json": {
      compressible: true,
      extensions: ["webapp"]
    },
    "application/x-www-form-urlencoded": {
      source: "iana",
      compressible: true
    },
    "application/x-x509-ca-cert": {
      source: "iana",
      extensions: ["der", "crt", "pem"]
    },
    "application/x-x509-ca-ra-cert": {
      source: "iana"
    },
    "application/x-x509-next-ca-cert": {
      source: "iana"
    },
    "application/x-xfig": {
      source: "apache",
      extensions: ["fig"]
    },
    "application/x-xliff+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/x-xpinstall": {
      source: "apache",
      compressible: false,
      extensions: ["xpi"]
    },
    "application/x-xz": {
      source: "apache",
      extensions: ["xz"]
    },
    "application/x-zmachine": {
      source: "apache",
      extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
    },
    "application/x400-bp": {
      source: "iana"
    },
    "application/xacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/xaml+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xaml"]
    },
    "application/xcap-att+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xav"]
    },
    "application/xcap-caps+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xca"]
    },
    "application/xcap-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdf"]
    },
    "application/xcap-el+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xel"]
    },
    "application/xcap-error+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcap-ns+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xns"]
    },
    "application/xcon-conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcon-conference-info-diff+xml": {
      source: "iana",
      compressible: true
    },
    "application/xenc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xenc"]
    },
    "application/xhtml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtml", "xht"]
    },
    "application/xhtml-voice+xml": {
      source: "apache",
      compressible: true
    },
    "application/xliff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml", "xsl", "xsd", "rng"]
    },
    "application/xml-dtd": {
      source: "iana",
      compressible: true,
      extensions: ["dtd"]
    },
    "application/xml-external-parsed-entity": {
      source: "iana"
    },
    "application/xml-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/xmpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/xop+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xop"]
    },
    "application/xproc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xpl"]
    },
    "application/xslt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsl", "xslt"]
    },
    "application/xspf+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xspf"]
    },
    "application/xv+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mxml", "xhvml", "xvml", "xvm"]
    },
    "application/yang": {
      source: "iana",
      extensions: ["yang"]
    },
    "application/yang-data+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-data+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/yin+xml": {
      source: "iana",
      compressible: true,
      extensions: ["yin"]
    },
    "application/zip": {
      source: "iana",
      compressible: false,
      extensions: ["zip"]
    },
    "application/zlib": {
      source: "iana"
    },
    "application/zstd": {
      source: "iana"
    },
    "audio/1d-interleaved-parityfec": {
      source: "iana"
    },
    "audio/32kadpcm": {
      source: "iana"
    },
    "audio/3gpp": {
      source: "iana",
      compressible: false,
      extensions: ["3gpp"]
    },
    "audio/3gpp2": {
      source: "iana"
    },
    "audio/aac": {
      source: "iana"
    },
    "audio/ac3": {
      source: "iana"
    },
    "audio/adpcm": {
      source: "apache",
      extensions: ["adp"]
    },
    "audio/amr": {
      source: "iana",
      extensions: ["amr"]
    },
    "audio/amr-wb": {
      source: "iana"
    },
    "audio/amr-wb+": {
      source: "iana"
    },
    "audio/aptx": {
      source: "iana"
    },
    "audio/asc": {
      source: "iana"
    },
    "audio/atrac-advanced-lossless": {
      source: "iana"
    },
    "audio/atrac-x": {
      source: "iana"
    },
    "audio/atrac3": {
      source: "iana"
    },
    "audio/basic": {
      source: "iana",
      compressible: false,
      extensions: ["au", "snd"]
    },
    "audio/bv16": {
      source: "iana"
    },
    "audio/bv32": {
      source: "iana"
    },
    "audio/clearmode": {
      source: "iana"
    },
    "audio/cn": {
      source: "iana"
    },
    "audio/dat12": {
      source: "iana"
    },
    "audio/dls": {
      source: "iana"
    },
    "audio/dsr-es201108": {
      source: "iana"
    },
    "audio/dsr-es202050": {
      source: "iana"
    },
    "audio/dsr-es202211": {
      source: "iana"
    },
    "audio/dsr-es202212": {
      source: "iana"
    },
    "audio/dv": {
      source: "iana"
    },
    "audio/dvi4": {
      source: "iana"
    },
    "audio/eac3": {
      source: "iana"
    },
    "audio/encaprtp": {
      source: "iana"
    },
    "audio/evrc": {
      source: "iana"
    },
    "audio/evrc-qcp": {
      source: "iana"
    },
    "audio/evrc0": {
      source: "iana"
    },
    "audio/evrc1": {
      source: "iana"
    },
    "audio/evrcb": {
      source: "iana"
    },
    "audio/evrcb0": {
      source: "iana"
    },
    "audio/evrcb1": {
      source: "iana"
    },
    "audio/evrcnw": {
      source: "iana"
    },
    "audio/evrcnw0": {
      source: "iana"
    },
    "audio/evrcnw1": {
      source: "iana"
    },
    "audio/evrcwb": {
      source: "iana"
    },
    "audio/evrcwb0": {
      source: "iana"
    },
    "audio/evrcwb1": {
      source: "iana"
    },
    "audio/evs": {
      source: "iana"
    },
    "audio/flexfec": {
      source: "iana"
    },
    "audio/fwdred": {
      source: "iana"
    },
    "audio/g711-0": {
      source: "iana"
    },
    "audio/g719": {
      source: "iana"
    },
    "audio/g722": {
      source: "iana"
    },
    "audio/g7221": {
      source: "iana"
    },
    "audio/g723": {
      source: "iana"
    },
    "audio/g726-16": {
      source: "iana"
    },
    "audio/g726-24": {
      source: "iana"
    },
    "audio/g726-32": {
      source: "iana"
    },
    "audio/g726-40": {
      source: "iana"
    },
    "audio/g728": {
      source: "iana"
    },
    "audio/g729": {
      source: "iana"
    },
    "audio/g7291": {
      source: "iana"
    },
    "audio/g729d": {
      source: "iana"
    },
    "audio/g729e": {
      source: "iana"
    },
    "audio/gsm": {
      source: "iana"
    },
    "audio/gsm-efr": {
      source: "iana"
    },
    "audio/gsm-hr-08": {
      source: "iana"
    },
    "audio/ilbc": {
      source: "iana"
    },
    "audio/ip-mr_v2.5": {
      source: "iana"
    },
    "audio/isac": {
      source: "apache"
    },
    "audio/l16": {
      source: "iana"
    },
    "audio/l20": {
      source: "iana"
    },
    "audio/l24": {
      source: "iana",
      compressible: false
    },
    "audio/l8": {
      source: "iana"
    },
    "audio/lpc": {
      source: "iana"
    },
    "audio/melp": {
      source: "iana"
    },
    "audio/melp1200": {
      source: "iana"
    },
    "audio/melp2400": {
      source: "iana"
    },
    "audio/melp600": {
      source: "iana"
    },
    "audio/mhas": {
      source: "iana"
    },
    "audio/midi": {
      source: "apache",
      extensions: ["mid", "midi", "kar", "rmi"]
    },
    "audio/mobile-xmf": {
      source: "iana",
      extensions: ["mxmf"]
    },
    "audio/mp3": {
      compressible: false,
      extensions: ["mp3"]
    },
    "audio/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["m4a", "mp4a"]
    },
    "audio/mp4a-latm": {
      source: "iana"
    },
    "audio/mpa": {
      source: "iana"
    },
    "audio/mpa-robust": {
      source: "iana"
    },
    "audio/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/mpeg4-generic": {
      source: "iana"
    },
    "audio/musepack": {
      source: "apache"
    },
    "audio/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["oga", "ogg", "spx", "opus"]
    },
    "audio/opus": {
      source: "iana"
    },
    "audio/parityfec": {
      source: "iana"
    },
    "audio/pcma": {
      source: "iana"
    },
    "audio/pcma-wb": {
      source: "iana"
    },
    "audio/pcmu": {
      source: "iana"
    },
    "audio/pcmu-wb": {
      source: "iana"
    },
    "audio/prs.sid": {
      source: "iana"
    },
    "audio/qcelp": {
      source: "iana"
    },
    "audio/raptorfec": {
      source: "iana"
    },
    "audio/red": {
      source: "iana"
    },
    "audio/rtp-enc-aescm128": {
      source: "iana"
    },
    "audio/rtp-midi": {
      source: "iana"
    },
    "audio/rtploopback": {
      source: "iana"
    },
    "audio/rtx": {
      source: "iana"
    },
    "audio/s3m": {
      source: "apache",
      extensions: ["s3m"]
    },
    "audio/scip": {
      source: "iana"
    },
    "audio/silk": {
      source: "apache",
      extensions: ["sil"]
    },
    "audio/smv": {
      source: "iana"
    },
    "audio/smv-qcp": {
      source: "iana"
    },
    "audio/smv0": {
      source: "iana"
    },
    "audio/sofa": {
      source: "iana"
    },
    "audio/sp-midi": {
      source: "iana"
    },
    "audio/speex": {
      source: "iana"
    },
    "audio/t140c": {
      source: "iana"
    },
    "audio/t38": {
      source: "iana"
    },
    "audio/telephone-event": {
      source: "iana"
    },
    "audio/tetra_acelp": {
      source: "iana"
    },
    "audio/tetra_acelp_bb": {
      source: "iana"
    },
    "audio/tone": {
      source: "iana"
    },
    "audio/tsvcis": {
      source: "iana"
    },
    "audio/uemclip": {
      source: "iana"
    },
    "audio/ulpfec": {
      source: "iana"
    },
    "audio/usac": {
      source: "iana"
    },
    "audio/vdvi": {
      source: "iana"
    },
    "audio/vmr-wb": {
      source: "iana"
    },
    "audio/vnd.3gpp.iufp": {
      source: "iana"
    },
    "audio/vnd.4sb": {
      source: "iana"
    },
    "audio/vnd.audiokoz": {
      source: "iana"
    },
    "audio/vnd.celp": {
      source: "iana"
    },
    "audio/vnd.cisco.nse": {
      source: "iana"
    },
    "audio/vnd.cmles.radio-events": {
      source: "iana"
    },
    "audio/vnd.cns.anp1": {
      source: "iana"
    },
    "audio/vnd.cns.inf1": {
      source: "iana"
    },
    "audio/vnd.dece.audio": {
      source: "iana",
      extensions: ["uva", "uvva"]
    },
    "audio/vnd.digital-winds": {
      source: "iana",
      extensions: ["eol"]
    },
    "audio/vnd.dlna.adts": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.1": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.2": {
      source: "iana"
    },
    "audio/vnd.dolby.mlp": {
      source: "iana"
    },
    "audio/vnd.dolby.mps": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2x": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2z": {
      source: "iana"
    },
    "audio/vnd.dolby.pulse.1": {
      source: "iana"
    },
    "audio/vnd.dra": {
      source: "iana",
      extensions: ["dra"]
    },
    "audio/vnd.dts": {
      source: "iana",
      extensions: ["dts"]
    },
    "audio/vnd.dts.hd": {
      source: "iana",
      extensions: ["dtshd"]
    },
    "audio/vnd.dts.uhd": {
      source: "iana"
    },
    "audio/vnd.dvb.file": {
      source: "iana"
    },
    "audio/vnd.everad.plj": {
      source: "iana"
    },
    "audio/vnd.hns.audio": {
      source: "iana"
    },
    "audio/vnd.lucent.voice": {
      source: "iana",
      extensions: ["lvp"]
    },
    "audio/vnd.ms-playready.media.pya": {
      source: "iana",
      extensions: ["pya"]
    },
    "audio/vnd.nokia.mobile-xmf": {
      source: "iana"
    },
    "audio/vnd.nortel.vbk": {
      source: "iana"
    },
    "audio/vnd.nuera.ecelp4800": {
      source: "iana",
      extensions: ["ecelp4800"]
    },
    "audio/vnd.nuera.ecelp7470": {
      source: "iana",
      extensions: ["ecelp7470"]
    },
    "audio/vnd.nuera.ecelp9600": {
      source: "iana",
      extensions: ["ecelp9600"]
    },
    "audio/vnd.octel.sbc": {
      source: "iana"
    },
    "audio/vnd.presonus.multitrack": {
      source: "iana"
    },
    "audio/vnd.qcelp": {
      source: "iana"
    },
    "audio/vnd.rhetorex.32kadpcm": {
      source: "iana"
    },
    "audio/vnd.rip": {
      source: "iana",
      extensions: ["rip"]
    },
    "audio/vnd.rn-realaudio": {
      compressible: false
    },
    "audio/vnd.sealedmedia.softseal.mpeg": {
      source: "iana"
    },
    "audio/vnd.vmx.cvsd": {
      source: "iana"
    },
    "audio/vnd.wave": {
      compressible: false
    },
    "audio/vorbis": {
      source: "iana",
      compressible: false
    },
    "audio/vorbis-config": {
      source: "iana"
    },
    "audio/wav": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/wave": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/webm": {
      source: "apache",
      compressible: false,
      extensions: ["weba"]
    },
    "audio/x-aac": {
      source: "apache",
      compressible: false,
      extensions: ["aac"]
    },
    "audio/x-aiff": {
      source: "apache",
      extensions: ["aif", "aiff", "aifc"]
    },
    "audio/x-caf": {
      source: "apache",
      compressible: false,
      extensions: ["caf"]
    },
    "audio/x-flac": {
      source: "apache",
      extensions: ["flac"]
    },
    "audio/x-m4a": {
      source: "nginx",
      extensions: ["m4a"]
    },
    "audio/x-matroska": {
      source: "apache",
      extensions: ["mka"]
    },
    "audio/x-mpegurl": {
      source: "apache",
      extensions: ["m3u"]
    },
    "audio/x-ms-wax": {
      source: "apache",
      extensions: ["wax"]
    },
    "audio/x-ms-wma": {
      source: "apache",
      extensions: ["wma"]
    },
    "audio/x-pn-realaudio": {
      source: "apache",
      extensions: ["ram", "ra"]
    },
    "audio/x-pn-realaudio-plugin": {
      source: "apache",
      extensions: ["rmp"]
    },
    "audio/x-realaudio": {
      source: "nginx",
      extensions: ["ra"]
    },
    "audio/x-tta": {
      source: "apache"
    },
    "audio/x-wav": {
      source: "apache",
      extensions: ["wav"]
    },
    "audio/xm": {
      source: "apache",
      extensions: ["xm"]
    },
    "chemical/x-cdx": {
      source: "apache",
      extensions: ["cdx"]
    },
    "chemical/x-cif": {
      source: "apache",
      extensions: ["cif"]
    },
    "chemical/x-cmdf": {
      source: "apache",
      extensions: ["cmdf"]
    },
    "chemical/x-cml": {
      source: "apache",
      extensions: ["cml"]
    },
    "chemical/x-csml": {
      source: "apache",
      extensions: ["csml"]
    },
    "chemical/x-pdb": {
      source: "apache"
    },
    "chemical/x-xyz": {
      source: "apache",
      extensions: ["xyz"]
    },
    "font/collection": {
      source: "iana",
      extensions: ["ttc"]
    },
    "font/otf": {
      source: "iana",
      compressible: true,
      extensions: ["otf"]
    },
    "font/sfnt": {
      source: "iana"
    },
    "font/ttf": {
      source: "iana",
      compressible: true,
      extensions: ["ttf"]
    },
    "font/woff": {
      source: "iana",
      extensions: ["woff"]
    },
    "font/woff2": {
      source: "iana",
      extensions: ["woff2"]
    },
    "image/aces": {
      source: "iana",
      extensions: ["exr"]
    },
    "image/apng": {
      compressible: false,
      extensions: ["apng"]
    },
    "image/avci": {
      source: "iana",
      extensions: ["avci"]
    },
    "image/avcs": {
      source: "iana",
      extensions: ["avcs"]
    },
    "image/avif": {
      source: "iana",
      compressible: false,
      extensions: ["avif"]
    },
    "image/bmp": {
      source: "iana",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/cgm": {
      source: "iana",
      extensions: ["cgm"]
    },
    "image/dicom-rle": {
      source: "iana",
      extensions: ["drle"]
    },
    "image/emf": {
      source: "iana",
      extensions: ["emf"]
    },
    "image/fits": {
      source: "iana",
      extensions: ["fits"]
    },
    "image/g3fax": {
      source: "iana",
      extensions: ["g3"]
    },
    "image/gif": {
      source: "iana",
      compressible: false,
      extensions: ["gif"]
    },
    "image/heic": {
      source: "iana",
      extensions: ["heic"]
    },
    "image/heic-sequence": {
      source: "iana",
      extensions: ["heics"]
    },
    "image/heif": {
      source: "iana",
      extensions: ["heif"]
    },
    "image/heif-sequence": {
      source: "iana",
      extensions: ["heifs"]
    },
    "image/hej2k": {
      source: "iana",
      extensions: ["hej2"]
    },
    "image/hsj2": {
      source: "iana",
      extensions: ["hsj2"]
    },
    "image/ief": {
      source: "iana",
      extensions: ["ief"]
    },
    "image/jls": {
      source: "iana",
      extensions: ["jls"]
    },
    "image/jp2": {
      source: "iana",
      compressible: false,
      extensions: ["jp2", "jpg2"]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: ["jpeg", "jpg", "jpe"]
    },
    "image/jph": {
      source: "iana",
      extensions: ["jph"]
    },
    "image/jphc": {
      source: "iana",
      extensions: ["jhc"]
    },
    "image/jpm": {
      source: "iana",
      compressible: false,
      extensions: ["jpm"]
    },
    "image/jpx": {
      source: "iana",
      compressible: false,
      extensions: ["jpx", "jpf"]
    },
    "image/jxr": {
      source: "iana",
      extensions: ["jxr"]
    },
    "image/jxra": {
      source: "iana",
      extensions: ["jxra"]
    },
    "image/jxrs": {
      source: "iana",
      extensions: ["jxrs"]
    },
    "image/jxs": {
      source: "iana",
      extensions: ["jxs"]
    },
    "image/jxsc": {
      source: "iana",
      extensions: ["jxsc"]
    },
    "image/jxsi": {
      source: "iana",
      extensions: ["jxsi"]
    },
    "image/jxss": {
      source: "iana",
      extensions: ["jxss"]
    },
    "image/ktx": {
      source: "iana",
      extensions: ["ktx"]
    },
    "image/ktx2": {
      source: "iana",
      extensions: ["ktx2"]
    },
    "image/naplps": {
      source: "iana"
    },
    "image/pjpeg": {
      compressible: false
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: ["png"]
    },
    "image/prs.btif": {
      source: "iana",
      extensions: ["btif"]
    },
    "image/prs.pti": {
      source: "iana",
      extensions: ["pti"]
    },
    "image/pwg-raster": {
      source: "iana"
    },
    "image/sgi": {
      source: "apache",
      extensions: ["sgi"]
    },
    "image/svg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["svg", "svgz"]
    },
    "image/t38": {
      source: "iana",
      extensions: ["t38"]
    },
    "image/tiff": {
      source: "iana",
      compressible: false,
      extensions: ["tif", "tiff"]
    },
    "image/tiff-fx": {
      source: "iana",
      extensions: ["tfx"]
    },
    "image/vnd.adobe.photoshop": {
      source: "iana",
      compressible: true,
      extensions: ["psd"]
    },
    "image/vnd.airzip.accelerator.azv": {
      source: "iana",
      extensions: ["azv"]
    },
    "image/vnd.cns.inf2": {
      source: "iana"
    },
    "image/vnd.dece.graphic": {
      source: "iana",
      extensions: ["uvi", "uvvi", "uvg", "uvvg"]
    },
    "image/vnd.djvu": {
      source: "iana",
      extensions: ["djvu", "djv"]
    },
    "image/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "image/vnd.dwg": {
      source: "iana",
      extensions: ["dwg"]
    },
    "image/vnd.dxf": {
      source: "iana",
      extensions: ["dxf"]
    },
    "image/vnd.fastbidsheet": {
      source: "iana",
      extensions: ["fbs"]
    },
    "image/vnd.fpx": {
      source: "iana",
      extensions: ["fpx"]
    },
    "image/vnd.fst": {
      source: "iana",
      extensions: ["fst"]
    },
    "image/vnd.fujixerox.edmics-mmr": {
      source: "iana",
      extensions: ["mmr"]
    },
    "image/vnd.fujixerox.edmics-rlc": {
      source: "iana",
      extensions: ["rlc"]
    },
    "image/vnd.globalgraphics.pgb": {
      source: "iana"
    },
    "image/vnd.microsoft.icon": {
      source: "iana",
      compressible: true,
      extensions: ["ico"]
    },
    "image/vnd.mix": {
      source: "iana"
    },
    "image/vnd.mozilla.apng": {
      source: "iana"
    },
    "image/vnd.ms-dds": {
      compressible: true,
      extensions: ["dds"]
    },
    "image/vnd.ms-modi": {
      source: "iana",
      extensions: ["mdi"]
    },
    "image/vnd.ms-photo": {
      source: "apache",
      extensions: ["wdp"]
    },
    "image/vnd.net-fpx": {
      source: "iana",
      extensions: ["npx"]
    },
    "image/vnd.pco.b16": {
      source: "iana",
      extensions: ["b16"]
    },
    "image/vnd.radiance": {
      source: "iana"
    },
    "image/vnd.sealed.png": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.gif": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.jpg": {
      source: "iana"
    },
    "image/vnd.svf": {
      source: "iana"
    },
    "image/vnd.tencent.tap": {
      source: "iana",
      extensions: ["tap"]
    },
    "image/vnd.valve.source.texture": {
      source: "iana",
      extensions: ["vtf"]
    },
    "image/vnd.wap.wbmp": {
      source: "iana",
      extensions: ["wbmp"]
    },
    "image/vnd.xiff": {
      source: "iana",
      extensions: ["xif"]
    },
    "image/vnd.zbrush.pcx": {
      source: "iana",
      extensions: ["pcx"]
    },
    "image/webp": {
      source: "apache",
      extensions: ["webp"]
    },
    "image/wmf": {
      source: "iana",
      extensions: ["wmf"]
    },
    "image/x-3ds": {
      source: "apache",
      extensions: ["3ds"]
    },
    "image/x-cmu-raster": {
      source: "apache",
      extensions: ["ras"]
    },
    "image/x-cmx": {
      source: "apache",
      extensions: ["cmx"]
    },
    "image/x-freehand": {
      source: "apache",
      extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
    },
    "image/x-icon": {
      source: "apache",
      compressible: true,
      extensions: ["ico"]
    },
    "image/x-jng": {
      source: "nginx",
      extensions: ["jng"]
    },
    "image/x-mrsid-image": {
      source: "apache",
      extensions: ["sid"]
    },
    "image/x-ms-bmp": {
      source: "nginx",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/x-pcx": {
      source: "apache",
      extensions: ["pcx"]
    },
    "image/x-pict": {
      source: "apache",
      extensions: ["pic", "pct"]
    },
    "image/x-portable-anymap": {
      source: "apache",
      extensions: ["pnm"]
    },
    "image/x-portable-bitmap": {
      source: "apache",
      extensions: ["pbm"]
    },
    "image/x-portable-graymap": {
      source: "apache",
      extensions: ["pgm"]
    },
    "image/x-portable-pixmap": {
      source: "apache",
      extensions: ["ppm"]
    },
    "image/x-rgb": {
      source: "apache",
      extensions: ["rgb"]
    },
    "image/x-tga": {
      source: "apache",
      extensions: ["tga"]
    },
    "image/x-xbitmap": {
      source: "apache",
      extensions: ["xbm"]
    },
    "image/x-xcf": {
      compressible: false
    },
    "image/x-xpixmap": {
      source: "apache",
      extensions: ["xpm"]
    },
    "image/x-xwindowdump": {
      source: "apache",
      extensions: ["xwd"]
    },
    "message/cpim": {
      source: "iana"
    },
    "message/delivery-status": {
      source: "iana"
    },
    "message/disposition-notification": {
      source: "iana",
      extensions: [
        "disposition-notification"
      ]
    },
    "message/external-body": {
      source: "iana"
    },
    "message/feedback-report": {
      source: "iana"
    },
    "message/global": {
      source: "iana",
      extensions: ["u8msg"]
    },
    "message/global-delivery-status": {
      source: "iana",
      extensions: ["u8dsn"]
    },
    "message/global-disposition-notification": {
      source: "iana",
      extensions: ["u8mdn"]
    },
    "message/global-headers": {
      source: "iana",
      extensions: ["u8hdr"]
    },
    "message/http": {
      source: "iana",
      compressible: false
    },
    "message/imdn+xml": {
      source: "iana",
      compressible: true
    },
    "message/news": {
      source: "iana"
    },
    "message/partial": {
      source: "iana",
      compressible: false
    },
    "message/rfc822": {
      source: "iana",
      compressible: true,
      extensions: ["eml", "mime"]
    },
    "message/s-http": {
      source: "iana"
    },
    "message/sip": {
      source: "iana"
    },
    "message/sipfrag": {
      source: "iana"
    },
    "message/tracking-status": {
      source: "iana"
    },
    "message/vnd.si.simp": {
      source: "iana"
    },
    "message/vnd.wfa.wsc": {
      source: "iana",
      extensions: ["wsc"]
    },
    "model/3mf": {
      source: "iana",
      extensions: ["3mf"]
    },
    "model/e57": {
      source: "iana"
    },
    "model/gltf+json": {
      source: "iana",
      compressible: true,
      extensions: ["gltf"]
    },
    "model/gltf-binary": {
      source: "iana",
      compressible: true,
      extensions: ["glb"]
    },
    "model/iges": {
      source: "iana",
      compressible: false,
      extensions: ["igs", "iges"]
    },
    "model/mesh": {
      source: "iana",
      compressible: false,
      extensions: ["msh", "mesh", "silo"]
    },
    "model/mtl": {
      source: "iana",
      extensions: ["mtl"]
    },
    "model/obj": {
      source: "iana",
      extensions: ["obj"]
    },
    "model/step": {
      source: "iana"
    },
    "model/step+xml": {
      source: "iana",
      compressible: true,
      extensions: ["stpx"]
    },
    "model/step+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpz"]
    },
    "model/step-xml+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpxz"]
    },
    "model/stl": {
      source: "iana",
      extensions: ["stl"]
    },
    "model/vnd.collada+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dae"]
    },
    "model/vnd.dwf": {
      source: "iana",
      extensions: ["dwf"]
    },
    "model/vnd.flatland.3dml": {
      source: "iana"
    },
    "model/vnd.gdl": {
      source: "iana",
      extensions: ["gdl"]
    },
    "model/vnd.gs-gdl": {
      source: "apache"
    },
    "model/vnd.gs.gdl": {
      source: "iana"
    },
    "model/vnd.gtw": {
      source: "iana",
      extensions: ["gtw"]
    },
    "model/vnd.moml+xml": {
      source: "iana",
      compressible: true
    },
    "model/vnd.mts": {
      source: "iana",
      extensions: ["mts"]
    },
    "model/vnd.opengex": {
      source: "iana",
      extensions: ["ogex"]
    },
    "model/vnd.parasolid.transmit.binary": {
      source: "iana",
      extensions: ["x_b"]
    },
    "model/vnd.parasolid.transmit.text": {
      source: "iana",
      extensions: ["x_t"]
    },
    "model/vnd.pytha.pyox": {
      source: "iana"
    },
    "model/vnd.rosette.annotated-data-model": {
      source: "iana"
    },
    "model/vnd.sap.vds": {
      source: "iana",
      extensions: ["vds"]
    },
    "model/vnd.usdz+zip": {
      source: "iana",
      compressible: false,
      extensions: ["usdz"]
    },
    "model/vnd.valve.source.compiled-map": {
      source: "iana",
      extensions: ["bsp"]
    },
    "model/vnd.vtu": {
      source: "iana",
      extensions: ["vtu"]
    },
    "model/vrml": {
      source: "iana",
      compressible: false,
      extensions: ["wrl", "vrml"]
    },
    "model/x3d+binary": {
      source: "apache",
      compressible: false,
      extensions: ["x3db", "x3dbz"]
    },
    "model/x3d+fastinfoset": {
      source: "iana",
      extensions: ["x3db"]
    },
    "model/x3d+vrml": {
      source: "apache",
      compressible: false,
      extensions: ["x3dv", "x3dvz"]
    },
    "model/x3d+xml": {
      source: "iana",
      compressible: true,
      extensions: ["x3d", "x3dz"]
    },
    "model/x3d-vrml": {
      source: "iana",
      extensions: ["x3dv"]
    },
    "multipart/alternative": {
      source: "iana",
      compressible: false
    },
    "multipart/appledouble": {
      source: "iana"
    },
    "multipart/byteranges": {
      source: "iana"
    },
    "multipart/digest": {
      source: "iana"
    },
    "multipart/encrypted": {
      source: "iana",
      compressible: false
    },
    "multipart/form-data": {
      source: "iana",
      compressible: false
    },
    "multipart/header-set": {
      source: "iana"
    },
    "multipart/mixed": {
      source: "iana"
    },
    "multipart/multilingual": {
      source: "iana"
    },
    "multipart/parallel": {
      source: "iana"
    },
    "multipart/related": {
      source: "iana",
      compressible: false
    },
    "multipart/report": {
      source: "iana"
    },
    "multipart/signed": {
      source: "iana",
      compressible: false
    },
    "multipart/vnd.bint.med-plus": {
      source: "iana"
    },
    "multipart/voice-message": {
      source: "iana"
    },
    "multipart/x-mixed-replace": {
      source: "iana"
    },
    "text/1d-interleaved-parityfec": {
      source: "iana"
    },
    "text/cache-manifest": {
      source: "iana",
      compressible: true,
      extensions: ["appcache", "manifest"]
    },
    "text/calendar": {
      source: "iana",
      extensions: ["ics", "ifb"]
    },
    "text/calender": {
      compressible: true
    },
    "text/cmd": {
      compressible: true
    },
    "text/coffeescript": {
      extensions: ["coffee", "litcoffee"]
    },
    "text/cql": {
      source: "iana"
    },
    "text/cql-expression": {
      source: "iana"
    },
    "text/cql-identifier": {
      source: "iana"
    },
    "text/css": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["css"]
    },
    "text/csv": {
      source: "iana",
      compressible: true,
      extensions: ["csv"]
    },
    "text/csv-schema": {
      source: "iana"
    },
    "text/directory": {
      source: "iana"
    },
    "text/dns": {
      source: "iana"
    },
    "text/ecmascript": {
      source: "iana"
    },
    "text/encaprtp": {
      source: "iana"
    },
    "text/enriched": {
      source: "iana"
    },
    "text/fhirpath": {
      source: "iana"
    },
    "text/flexfec": {
      source: "iana"
    },
    "text/fwdred": {
      source: "iana"
    },
    "text/gff3": {
      source: "iana"
    },
    "text/grammar-ref-list": {
      source: "iana"
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: ["html", "htm", "shtml"]
    },
    "text/jade": {
      extensions: ["jade"]
    },
    "text/javascript": {
      source: "iana",
      compressible: true
    },
    "text/jcr-cnd": {
      source: "iana"
    },
    "text/jsx": {
      compressible: true,
      extensions: ["jsx"]
    },
    "text/less": {
      compressible: true,
      extensions: ["less"]
    },
    "text/markdown": {
      source: "iana",
      compressible: true,
      extensions: ["markdown", "md"]
    },
    "text/mathml": {
      source: "nginx",
      extensions: ["mml"]
    },
    "text/mdx": {
      compressible: true,
      extensions: ["mdx"]
    },
    "text/mizar": {
      source: "iana"
    },
    "text/n3": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["n3"]
    },
    "text/parameters": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/parityfec": {
      source: "iana"
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/provenance-notation": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/prs.fallenstein.rst": {
      source: "iana"
    },
    "text/prs.lines.tag": {
      source: "iana",
      extensions: ["dsc"]
    },
    "text/prs.prop.logic": {
      source: "iana"
    },
    "text/raptorfec": {
      source: "iana"
    },
    "text/red": {
      source: "iana"
    },
    "text/rfc822-headers": {
      source: "iana"
    },
    "text/richtext": {
      source: "iana",
      compressible: true,
      extensions: ["rtx"]
    },
    "text/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "text/rtp-enc-aescm128": {
      source: "iana"
    },
    "text/rtploopback": {
      source: "iana"
    },
    "text/rtx": {
      source: "iana"
    },
    "text/sgml": {
      source: "iana",
      extensions: ["sgml", "sgm"]
    },
    "text/shaclc": {
      source: "iana"
    },
    "text/shex": {
      source: "iana",
      extensions: ["shex"]
    },
    "text/slim": {
      extensions: ["slim", "slm"]
    },
    "text/spdx": {
      source: "iana",
      extensions: ["spdx"]
    },
    "text/strings": {
      source: "iana"
    },
    "text/stylus": {
      extensions: ["stylus", "styl"]
    },
    "text/t140": {
      source: "iana"
    },
    "text/tab-separated-values": {
      source: "iana",
      compressible: true,
      extensions: ["tsv"]
    },
    "text/troff": {
      source: "iana",
      extensions: ["t", "tr", "roff", "man", "me", "ms"]
    },
    "text/turtle": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["ttl"]
    },
    "text/ulpfec": {
      source: "iana"
    },
    "text/uri-list": {
      source: "iana",
      compressible: true,
      extensions: ["uri", "uris", "urls"]
    },
    "text/vcard": {
      source: "iana",
      compressible: true,
      extensions: ["vcard"]
    },
    "text/vnd.a": {
      source: "iana"
    },
    "text/vnd.abc": {
      source: "iana"
    },
    "text/vnd.ascii-art": {
      source: "iana"
    },
    "text/vnd.curl": {
      source: "iana",
      extensions: ["curl"]
    },
    "text/vnd.curl.dcurl": {
      source: "apache",
      extensions: ["dcurl"]
    },
    "text/vnd.curl.mcurl": {
      source: "apache",
      extensions: ["mcurl"]
    },
    "text/vnd.curl.scurl": {
      source: "apache",
      extensions: ["scurl"]
    },
    "text/vnd.debian.copyright": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.dmclientscript": {
      source: "iana"
    },
    "text/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "text/vnd.esmertec.theme-descriptor": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.familysearch.gedcom": {
      source: "iana",
      extensions: ["ged"]
    },
    "text/vnd.ficlab.flt": {
      source: "iana"
    },
    "text/vnd.fly": {
      source: "iana",
      extensions: ["fly"]
    },
    "text/vnd.fmi.flexstor": {
      source: "iana",
      extensions: ["flx"]
    },
    "text/vnd.gml": {
      source: "iana"
    },
    "text/vnd.graphviz": {
      source: "iana",
      extensions: ["gv"]
    },
    "text/vnd.hans": {
      source: "iana"
    },
    "text/vnd.hgl": {
      source: "iana"
    },
    "text/vnd.in3d.3dml": {
      source: "iana",
      extensions: ["3dml"]
    },
    "text/vnd.in3d.spot": {
      source: "iana",
      extensions: ["spot"]
    },
    "text/vnd.iptc.newsml": {
      source: "iana"
    },
    "text/vnd.iptc.nitf": {
      source: "iana"
    },
    "text/vnd.latex-z": {
      source: "iana"
    },
    "text/vnd.motorola.reflex": {
      source: "iana"
    },
    "text/vnd.ms-mediapackage": {
      source: "iana"
    },
    "text/vnd.net2phone.commcenter.command": {
      source: "iana"
    },
    "text/vnd.radisys.msml-basic-layout": {
      source: "iana"
    },
    "text/vnd.senx.warpscript": {
      source: "iana"
    },
    "text/vnd.si.uricatalogue": {
      source: "iana"
    },
    "text/vnd.sosi": {
      source: "iana"
    },
    "text/vnd.sun.j2me.app-descriptor": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["jad"]
    },
    "text/vnd.trolltech.linguist": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.wap.si": {
      source: "iana"
    },
    "text/vnd.wap.sl": {
      source: "iana"
    },
    "text/vnd.wap.wml": {
      source: "iana",
      extensions: ["wml"]
    },
    "text/vnd.wap.wmlscript": {
      source: "iana",
      extensions: ["wmls"]
    },
    "text/vtt": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["vtt"]
    },
    "text/x-asm": {
      source: "apache",
      extensions: ["s", "asm"]
    },
    "text/x-c": {
      source: "apache",
      extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
    },
    "text/x-component": {
      source: "nginx",
      extensions: ["htc"]
    },
    "text/x-fortran": {
      source: "apache",
      extensions: ["f", "for", "f77", "f90"]
    },
    "text/x-gwt-rpc": {
      compressible: true
    },
    "text/x-handlebars-template": {
      extensions: ["hbs"]
    },
    "text/x-java-source": {
      source: "apache",
      extensions: ["java"]
    },
    "text/x-jquery-tmpl": {
      compressible: true
    },
    "text/x-lua": {
      extensions: ["lua"]
    },
    "text/x-markdown": {
      compressible: true,
      extensions: ["mkd"]
    },
    "text/x-nfo": {
      source: "apache",
      extensions: ["nfo"]
    },
    "text/x-opml": {
      source: "apache",
      extensions: ["opml"]
    },
    "text/x-org": {
      compressible: true,
      extensions: ["org"]
    },
    "text/x-pascal": {
      source: "apache",
      extensions: ["p", "pas"]
    },
    "text/x-processing": {
      compressible: true,
      extensions: ["pde"]
    },
    "text/x-sass": {
      extensions: ["sass"]
    },
    "text/x-scss": {
      extensions: ["scss"]
    },
    "text/x-setext": {
      source: "apache",
      extensions: ["etx"]
    },
    "text/x-sfv": {
      source: "apache",
      extensions: ["sfv"]
    },
    "text/x-suse-ymp": {
      compressible: true,
      extensions: ["ymp"]
    },
    "text/x-uuencode": {
      source: "apache",
      extensions: ["uu"]
    },
    "text/x-vcalendar": {
      source: "apache",
      extensions: ["vcs"]
    },
    "text/x-vcard": {
      source: "apache",
      extensions: ["vcf"]
    },
    "text/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml"]
    },
    "text/xml-external-parsed-entity": {
      source: "iana"
    },
    "text/yaml": {
      compressible: true,
      extensions: ["yaml", "yml"]
    },
    "video/1d-interleaved-parityfec": {
      source: "iana"
    },
    "video/3gpp": {
      source: "iana",
      extensions: ["3gp", "3gpp"]
    },
    "video/3gpp-tt": {
      source: "iana"
    },
    "video/3gpp2": {
      source: "iana",
      extensions: ["3g2"]
    },
    "video/av1": {
      source: "iana"
    },
    "video/bmpeg": {
      source: "iana"
    },
    "video/bt656": {
      source: "iana"
    },
    "video/celb": {
      source: "iana"
    },
    "video/dv": {
      source: "iana"
    },
    "video/encaprtp": {
      source: "iana"
    },
    "video/ffv1": {
      source: "iana"
    },
    "video/flexfec": {
      source: "iana"
    },
    "video/h261": {
      source: "iana",
      extensions: ["h261"]
    },
    "video/h263": {
      source: "iana",
      extensions: ["h263"]
    },
    "video/h263-1998": {
      source: "iana"
    },
    "video/h263-2000": {
      source: "iana"
    },
    "video/h264": {
      source: "iana",
      extensions: ["h264"]
    },
    "video/h264-rcdo": {
      source: "iana"
    },
    "video/h264-svc": {
      source: "iana"
    },
    "video/h265": {
      source: "iana"
    },
    "video/iso.segment": {
      source: "iana",
      extensions: ["m4s"]
    },
    "video/jpeg": {
      source: "iana",
      extensions: ["jpgv"]
    },
    "video/jpeg2000": {
      source: "iana"
    },
    "video/jpm": {
      source: "apache",
      extensions: ["jpm", "jpgm"]
    },
    "video/jxsv": {
      source: "iana"
    },
    "video/mj2": {
      source: "iana",
      extensions: ["mj2", "mjp2"]
    },
    "video/mp1s": {
      source: "iana"
    },
    "video/mp2p": {
      source: "iana"
    },
    "video/mp2t": {
      source: "iana",
      extensions: ["ts"]
    },
    "video/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["mp4", "mp4v", "mpg4"]
    },
    "video/mp4v-es": {
      source: "iana"
    },
    "video/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/mpeg4-generic": {
      source: "iana"
    },
    "video/mpv": {
      source: "iana"
    },
    "video/nv": {
      source: "iana"
    },
    "video/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogv"]
    },
    "video/parityfec": {
      source: "iana"
    },
    "video/pointer": {
      source: "iana"
    },
    "video/quicktime": {
      source: "iana",
      compressible: false,
      extensions: ["qt", "mov"]
    },
    "video/raptorfec": {
      source: "iana"
    },
    "video/raw": {
      source: "iana"
    },
    "video/rtp-enc-aescm128": {
      source: "iana"
    },
    "video/rtploopback": {
      source: "iana"
    },
    "video/rtx": {
      source: "iana"
    },
    "video/scip": {
      source: "iana"
    },
    "video/smpte291": {
      source: "iana"
    },
    "video/smpte292m": {
      source: "iana"
    },
    "video/ulpfec": {
      source: "iana"
    },
    "video/vc1": {
      source: "iana"
    },
    "video/vc2": {
      source: "iana"
    },
    "video/vnd.cctv": {
      source: "iana"
    },
    "video/vnd.dece.hd": {
      source: "iana",
      extensions: ["uvh", "uvvh"]
    },
    "video/vnd.dece.mobile": {
      source: "iana",
      extensions: ["uvm", "uvvm"]
    },
    "video/vnd.dece.mp4": {
      source: "iana"
    },
    "video/vnd.dece.pd": {
      source: "iana",
      extensions: ["uvp", "uvvp"]
    },
    "video/vnd.dece.sd": {
      source: "iana",
      extensions: ["uvs", "uvvs"]
    },
    "video/vnd.dece.video": {
      source: "iana",
      extensions: ["uvv", "uvvv"]
    },
    "video/vnd.directv.mpeg": {
      source: "iana"
    },
    "video/vnd.directv.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dlna.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dvb.file": {
      source: "iana",
      extensions: ["dvb"]
    },
    "video/vnd.fvt": {
      source: "iana",
      extensions: ["fvt"]
    },
    "video/vnd.hns.video": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsavc": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsmpeg2": {
      source: "iana"
    },
    "video/vnd.motorola.video": {
      source: "iana"
    },
    "video/vnd.motorola.videop": {
      source: "iana"
    },
    "video/vnd.mpegurl": {
      source: "iana",
      extensions: ["mxu", "m4u"]
    },
    "video/vnd.ms-playready.media.pyv": {
      source: "iana",
      extensions: ["pyv"]
    },
    "video/vnd.nokia.interleaved-multimedia": {
      source: "iana"
    },
    "video/vnd.nokia.mp4vr": {
      source: "iana"
    },
    "video/vnd.nokia.videovoip": {
      source: "iana"
    },
    "video/vnd.objectvideo": {
      source: "iana"
    },
    "video/vnd.radgamettools.bink": {
      source: "iana"
    },
    "video/vnd.radgamettools.smacker": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg1": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg4": {
      source: "iana"
    },
    "video/vnd.sealed.swf": {
      source: "iana"
    },
    "video/vnd.sealedmedia.softseal.mov": {
      source: "iana"
    },
    "video/vnd.uvvu.mp4": {
      source: "iana",
      extensions: ["uvu", "uvvu"]
    },
    "video/vnd.vivo": {
      source: "iana",
      extensions: ["viv"]
    },
    "video/vnd.youtube.yt": {
      source: "iana"
    },
    "video/vp8": {
      source: "iana"
    },
    "video/vp9": {
      source: "iana"
    },
    "video/webm": {
      source: "apache",
      compressible: false,
      extensions: ["webm"]
    },
    "video/x-f4v": {
      source: "apache",
      extensions: ["f4v"]
    },
    "video/x-fli": {
      source: "apache",
      extensions: ["fli"]
    },
    "video/x-flv": {
      source: "apache",
      compressible: false,
      extensions: ["flv"]
    },
    "video/x-m4v": {
      source: "apache",
      extensions: ["m4v"]
    },
    "video/x-matroska": {
      source: "apache",
      compressible: false,
      extensions: ["mkv", "mk3d", "mks"]
    },
    "video/x-mng": {
      source: "apache",
      extensions: ["mng"]
    },
    "video/x-ms-asf": {
      source: "apache",
      extensions: ["asf", "asx"]
    },
    "video/x-ms-vob": {
      source: "apache",
      extensions: ["vob"]
    },
    "video/x-ms-wm": {
      source: "apache",
      extensions: ["wm"]
    },
    "video/x-ms-wmv": {
      source: "apache",
      compressible: false,
      extensions: ["wmv"]
    },
    "video/x-ms-wmx": {
      source: "apache",
      extensions: ["wmx"]
    },
    "video/x-ms-wvx": {
      source: "apache",
      extensions: ["wvx"]
    },
    "video/x-msvideo": {
      source: "apache",
      extensions: ["avi"]
    },
    "video/x-sgi-movie": {
      source: "apache",
      extensions: ["movie"]
    },
    "video/x-smv": {
      source: "apache",
      extensions: ["smv"]
    },
    "x-conference/x-cooltalk": {
      source: "apache",
      extensions: ["ice"]
    },
    "x-shader/x-fragment": {
      compressible: true
    },
    "x-shader/x-vertex": {
      compressible: true
    }
  };
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS((exports, module) => {
  /*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   */
  module.exports = require_db();
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS((exports) => {
  /*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */
  var db = require_mime_db();
  var extname = __require("path").extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports.charset = charset;
  exports.charsets = { lookup: charset };
  exports.contentType = contentType;
  exports.extension = extension;
  exports.extensions = Object.create(null);
  exports.lookup = lookup;
  exports.types = Object.create(null);
  populateMaps(exports.extensions, exports.types);
  function charset(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match2 = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match2 && db[match2[1].toLowerCase()];
    if (mime && mime.charset) {
      return mime.charset;
    }
    if (match2 && TEXT_TYPE_REGEXP.test(match2[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
    if (!mime) {
      return false;
    }
    if (mime.indexOf("charset") === -1) {
      var charset2 = exports.charset(mime);
      if (charset2)
        mime += "; charset=" + charset2.toLowerCase();
    }
    return mime;
  }
  function extension(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match2 = EXTRACT_TYPE_REGEXP.exec(type);
    var exts = match2 && exports.extensions[match2[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path) {
    if (!path || typeof path !== "string") {
      return false;
    }
    var extension2 = extname("x." + path).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", undefined, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type) {
      var mime = db[type];
      var exts = mime.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type] = exts;
      for (var i = 0;i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type;
      }
    });
  }
});

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS((exports, module) => {
  module.exports = defer;
  function defer(fn) {
    var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
    if (nextTick) {
      nextTick(fn);
    } else {
      setTimeout(fn, 0);
    }
  }
});

// node_modules/asynckit/lib/async.js
var require_async = __commonJS((exports, module) => {
  var defer = require_defer();
  module.exports = async;
  function async(callback) {
    var isAsync = false;
    defer(function() {
      isAsync = true;
    });
    return function async_callback(err, result) {
      if (isAsync) {
        callback(err, result);
      } else {
        defer(function nextTick_callback() {
          callback(err, result);
        });
      }
    };
  }
});

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS((exports, module) => {
  module.exports = abort;
  function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    state.jobs = {};
  }
  function clean(key) {
    if (typeof this.jobs[key] == "function") {
      this.jobs[key]();
    }
  }
});

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS((exports, module) => {
  var async = require_async();
  var abort = require_abort();
  module.exports = iterate;
  function iterate(list, iterator, state, callback) {
    var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
    state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
      if (!(key in state.jobs)) {
        return;
      }
      delete state.jobs[key];
      if (error) {
        abort(state);
      } else {
        state.results[key] = output;
      }
      callback(error, state.results);
    });
  }
  function runJob(iterator, key, item, callback) {
    var aborter;
    if (iterator.length == 2) {
      aborter = iterator(item, async(callback));
    } else {
      aborter = iterator(item, key, async(callback));
    }
    return aborter;
  }
});

// node_modules/asynckit/lib/state.js
var require_state = __commonJS((exports, module) => {
  module.exports = state;
  function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
      index: 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs: {},
      results: isNamedList ? {} : [],
      size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
      initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
        return sortMethod(list[a], list[b]);
      });
    }
    return initState;
  }
});

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS((exports, module) => {
  var abort = require_abort();
  var async = require_async();
  module.exports = terminator;
  function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
      return;
    }
    this.index = this.size;
    abort(this);
    async(callback)(null, this.results);
  }
});

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = parallel;
  function parallel(list, iterator, callback) {
    var state = initState(list);
    while (state.index < (state["keyedList"] || list).length) {
      iterate(list, iterator, state, function(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        if (Object.keys(state.jobs).length === 0) {
          callback(null, state.results);
          return;
        }
      });
      state.index++;
    }
    return terminator.bind(state, callback);
  }
});

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = serialOrdered;
  module.exports.ascending = ascending;
  module.exports.descending = descending;
  function serialOrdered(list, iterator, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator, state, function iteratorHandler(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      state.index++;
      if (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator, state, iteratorHandler);
        return;
      }
      callback(null, state.results);
    });
    return terminator.bind(state, callback);
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function descending(a, b) {
    return -1 * ascending(a, b);
  }
});

// node_modules/asynckit/serial.js
var require_serial = __commonJS((exports, module) => {
  var serialOrdered = require_serialOrdered();
  module.exports = serial;
  function serial(list, iterator, callback) {
    return serialOrdered(list, iterator, null, callback);
  }
});

// node_modules/asynckit/index.js
var require_asynckit = __commonJS((exports, module) => {
  module.exports = {
    parallel: require_parallel(),
    serial: require_serial(),
    serialOrdered: require_serialOrdered()
  };
});

// node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS((exports, module) => {
  module.exports = Object;
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS((exports, module) => {
  module.exports = Error;
});

// node_modules/es-errors/eval.js
var require_eval = __commonJS((exports, module) => {
  module.exports = EvalError;
});

// node_modules/es-errors/range.js
var require_range = __commonJS((exports, module) => {
  module.exports = RangeError;
});

// node_modules/es-errors/ref.js
var require_ref = __commonJS((exports, module) => {
  module.exports = ReferenceError;
});

// node_modules/es-errors/syntax.js
var require_syntax = __commonJS((exports, module) => {
  module.exports = SyntaxError;
});

// node_modules/es-errors/type.js
var require_type = __commonJS((exports, module) => {
  module.exports = TypeError;
});

// node_modules/es-errors/uri.js
var require_uri = __commonJS((exports, module) => {
  module.exports = URIError;
});

// node_modules/math-intrinsics/abs.js
var require_abs = __commonJS((exports, module) => {
  module.exports = Math.abs;
});

// node_modules/math-intrinsics/floor.js
var require_floor = __commonJS((exports, module) => {
  module.exports = Math.floor;
});

// node_modules/math-intrinsics/max.js
var require_max = __commonJS((exports, module) => {
  module.exports = Math.max;
});

// node_modules/math-intrinsics/min.js
var require_min = __commonJS((exports, module) => {
  module.exports = Math.min;
});

// node_modules/math-intrinsics/pow.js
var require_pow = __commonJS((exports, module) => {
  module.exports = Math.pow;
});

// node_modules/math-intrinsics/round.js
var require_round = __commonJS((exports, module) => {
  module.exports = Math.round;
});

// node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS((exports, module) => {
  module.exports = Number.isNaN || function isNaN(a) {
    return a !== a;
  };
});

// node_modules/math-intrinsics/sign.js
var require_sign = __commonJS((exports, module) => {
  var $isNaN = require_isNaN();
  module.exports = function sign(number) {
    if ($isNaN(number) || number === 0) {
      return number;
    }
    return number < 0 ? -1 : 1;
  };
});

// node_modules/gopd/gOPD.js
var require_gOPD = __commonJS((exports, module) => {
  module.exports = Object.getOwnPropertyDescriptor;
});

// node_modules/gopd/index.js
var require_gopd = __commonJS((exports, module) => {
  var $gOPD = require_gOPD();
  if ($gOPD) {
    try {
      $gOPD([], "length");
    } catch (e) {
      $gOPD = null;
    }
  }
  module.exports = $gOPD;
});

// node_modules/es-define-property/index.js
var require_es_define_property = __commonJS((exports, module) => {
  var $defineProperty = Object.defineProperty || false;
  if ($defineProperty) {
    try {
      $defineProperty({}, "a", { value: 1 });
    } catch (e) {
      $defineProperty = false;
    }
  }
  module.exports = $defineProperty;
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS((exports, module) => {
  module.exports = function hasSymbols() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS((exports, module) => {
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = require_shams();
  module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
});

// node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
});

// node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS((exports, module) => {
  var $Object = require_es_object_atoms();
  module.exports = $Object.getPrototypeOf || null;
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS((exports, module) => {
  var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
  var toStr = Object.prototype.toString;
  var max = Math.max;
  var funcType = "[object Function]";
  var concatty = function concatty(a, b) {
    var arr = [];
    for (var i = 0;i < a.length; i += 1) {
      arr[i] = a[i];
    }
    for (var j = 0;j < b.length; j += 1) {
      arr[j + a.length] = b[j];
    }
    return arr;
  };
  var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0;i < arrLike.length; i += 1, j += 1) {
      arr[j] = arrLike[i];
    }
    return arr;
  };
  var joiny = function(arr, joiner) {
    var str = "";
    for (var i = 0;i < arr.length; i += 1) {
      str += arr[i];
      if (i + 1 < arr.length) {
        str += joiner;
      }
    }
    return str;
  };
  module.exports = function bind(that) {
    var target = this;
    if (typeof target !== "function" || toStr.apply(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(this, concatty(args, arguments));
        if (Object(result) === result) {
          return result;
        }
        return this;
      }
      return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0;i < boundLength; i++) {
      boundArgs[i] = "$" + i;
    }
    bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
    if (target.prototype) {
      var Empty = function Empty() {};
      Empty.prototype = target.prototype;
      bound.prototype = new Empty;
      Empty.prototype = null;
    }
    return bound;
  };
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS((exports, module) => {
  var implementation = require_implementation();
  module.exports = Function.prototype.bind || implementation;
});

// node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS((exports, module) => {
  module.exports = Function.prototype.call;
});

// node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS((exports, module) => {
  module.exports = Function.prototype.apply;
});

// node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
});

// node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS((exports, module) => {
  var bind = require_function_bind();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var $reflectApply = require_reflectApply();
  module.exports = $reflectApply || bind.call($call, $apply);
});

// node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS((exports, module) => {
  var bind = require_function_bind();
  var $TypeError = require_type();
  var $call = require_functionCall();
  var $actualApply = require_actualApply();
  module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError("a function is required");
    }
    return $actualApply(bind, $call, args);
  };
});

// node_modules/dunder-proto/get.js
var require_get = __commonJS((exports, module) => {
  var callBind = require_call_bind_apply_helpers();
  var gOPD = require_gopd();
  var hasProtoAccessor;
  try {
    hasProtoAccessor = [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, "__proto__");
  var $Object = Object;
  var $getPrototypeOf = $Object.getPrototypeOf;
  module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? function getDunder(value) {
    return $getPrototypeOf(value == null ? value : $Object(value));
  } : false;
});

// node_modules/get-proto/index.js
var require_get_proto = __commonJS((exports, module) => {
  var reflectGetProto = require_Reflect_getPrototypeOf();
  var originalGetProto = require_Object_getPrototypeOf();
  var getDunderProto = require_get();
  module.exports = reflectGetProto ? function getProto(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto(O) {
    return getDunderProto(O);
  } : null;
});

// node_modules/hasown/index.js
var require_hasown = __commonJS((exports, module) => {
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind = require_function_bind();
  module.exports = bind.call(call, $hasOwn);
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS((exports, module) => {
  var undefined2;
  var $Object = require_es_object_atoms();
  var $Error = require_es_errors();
  var $EvalError = require_eval();
  var $RangeError = require_range();
  var $ReferenceError = require_ref();
  var $SyntaxError = require_syntax();
  var $TypeError = require_type();
  var $URIError = require_uri();
  var abs = require_abs();
  var floor = require_floor();
  var max = require_max();
  var min = require_min();
  var pow = require_pow();
  var round = require_round();
  var sign = require_sign();
  var $Function = Function;
  var getEvalledConstructor = function(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
    } catch (e) {}
  };
  var $gOPD = require_gopd();
  var $defineProperty = require_es_define_property();
  var throwTypeError = function() {
    throw new $TypeError;
  };
  var ThrowTypeError = $gOPD ? function() {
    try {
      arguments.callee;
      return throwTypeError;
    } catch (calleeThrows) {
      try {
        return $gOPD(arguments, "callee").get;
      } catch (gOPDthrows) {
        return throwTypeError;
      }
    }
  }() : throwTypeError;
  var hasSymbols = require_has_symbols()();
  var getProto = require_get_proto();
  var $ObjectGPO = require_Object_getPrototypeOf();
  var $ReflectGPO = require_Reflect_getPrototypeOf();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var needsEval = {};
  var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
  var INTRINSICS = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
    "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
    "%AsyncFromSyncIteratorPrototype%": undefined2,
    "%AsyncFunction%": needsEval,
    "%AsyncGenerator%": needsEval,
    "%AsyncGeneratorFunction%": needsEval,
    "%AsyncIteratorPrototype%": needsEval,
    "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
    "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
    "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": $Error,
    "%eval%": eval,
    "%EvalError%": $EvalError,
    "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
    "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
    "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
    "%Function%": $Function,
    "%GeneratorFunction%": needsEval,
    "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
    "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
    "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
    "%JSON%": typeof JSON === "object" ? JSON : undefined2,
    "%Map%": typeof Map === "undefined" ? undefined2 : Map,
    "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Map()[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": $Object,
    "%Object.getOwnPropertyDescriptor%": $gOPD,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
    "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
    "%RangeError%": $RangeError,
    "%ReferenceError%": $ReferenceError,
    "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set === "undefined" ? undefined2 : Set,
    "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Set()[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
    "%Symbol%": hasSymbols ? Symbol : undefined2,
    "%SyntaxError%": $SyntaxError,
    "%ThrowTypeError%": ThrowTypeError,
    "%TypedArray%": TypedArray,
    "%TypeError%": $TypeError,
    "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
    "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
    "%URIError%": $URIError,
    "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
    "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
    "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
    "%Function.prototype.call%": $call,
    "%Function.prototype.apply%": $apply,
    "%Object.defineProperty%": $defineProperty,
    "%Object.getPrototypeOf%": $ObjectGPO,
    "%Math.abs%": abs,
    "%Math.floor%": floor,
    "%Math.max%": max,
    "%Math.min%": min,
    "%Math.pow%": pow,
    "%Math.round%": round,
    "%Math.sign%": sign,
    "%Reflect.getPrototypeOf%": $ReflectGPO
  };
  if (getProto) {
    try {
      null.error;
    } catch (e) {
      errorProto = getProto(getProto(e));
      INTRINSICS["%Error.prototype%"] = errorProto;
    }
  }
  var errorProto;
  var doEval = function doEval(name) {
    var value;
    if (name === "%AsyncFunction%") {
      value = getEvalledConstructor("async function () {}");
    } else if (name === "%GeneratorFunction%") {
      value = getEvalledConstructor("function* () {}");
    } else if (name === "%AsyncGeneratorFunction%") {
      value = getEvalledConstructor("async function* () {}");
    } else if (name === "%AsyncGenerator%") {
      var fn = doEval("%AsyncGeneratorFunction%");
      if (fn) {
        value = fn.prototype;
      }
    } else if (name === "%AsyncIteratorPrototype%") {
      var gen = doEval("%AsyncGenerator%");
      if (gen && getProto) {
        value = getProto(gen.prototype);
      }
    }
    INTRINSICS[name] = value;
    return value;
  };
  var LEGACY_ALIASES = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  };
  var bind = require_function_bind();
  var hasOwn = require_hasown();
  var $concat = bind.call($call, Array.prototype.concat);
  var $spliceApply = bind.call($apply, Array.prototype.splice);
  var $replace = bind.call($call, String.prototype.replace);
  var $strSlice = bind.call($call, String.prototype.slice);
  var $exec = bind.call($call, RegExp.prototype.exec);
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === "%" && last !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
    } else if (last === "%" && first !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
    }
    var result = [];
    $replace(string, rePropName, function(match2, number, quote, subString) {
      result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match2;
    });
    return result;
  };
  var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES[intrinsicName];
      intrinsicName = "%" + alias[0] + "%";
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS[intrinsicName];
      if (value === needsEval) {
        value = doEval(intrinsicName);
      }
      if (typeof value === "undefined" && !allowMissing) {
        throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
      }
      return {
        alias,
        name: intrinsicName,
        value
      };
    }
    throw new $SyntaxError("intrinsic " + name + " does not exist!");
  };
  module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== "string" || name.length === 0) {
      throw new $TypeError("intrinsic name must be a non-empty string");
    }
    if (arguments.length > 1 && typeof allowMissing !== "boolean") {
      throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
    var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
      intrinsicBaseName = alias[0];
      $spliceApply(parts, $concat([0, 1], alias));
    }
    for (var i = 1, isOwn = true;i < parts.length; i += 1) {
      var part = parts[i];
      var first = $strSlice(part, 0, 1);
      var last = $strSlice(part, -1);
      if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
        throw new $SyntaxError("property names with quotes must have matching quotes");
      }
      if (part === "constructor" || !isOwn) {
        skipFurtherCaching = true;
      }
      intrinsicBaseName += "." + part;
      intrinsicRealName = "%" + intrinsicBaseName + "%";
      if (hasOwn(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS[intrinsicRealName];
      } else if (value != null) {
        if (!(part in value)) {
          if (!allowMissing) {
            throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
          }
          return;
        }
        if ($gOPD && i + 1 >= parts.length) {
          var desc = $gOPD(value, part);
          isOwn = !!desc;
          if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
            value = desc.get;
          } else {
            value = value[part];
          }
        } else {
          isOwn = hasOwn(value, part);
          value = value[part];
        }
        if (isOwn && !skipFurtherCaching) {
          INTRINSICS[intrinsicRealName] = value;
        }
      }
    }
    return value;
  };
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS((exports, module) => {
  var hasSymbols = require_shams();
  module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag;
  };
});

// node_modules/es-set-tostringtag/index.js
var require_es_set_tostringtag = __commonJS((exports, module) => {
  var GetIntrinsic = require_get_intrinsic();
  var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
  var hasToStringTag = require_shams2()();
  var hasOwn = require_hasown();
  var $TypeError = require_type();
  var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
  module.exports = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
      throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
    }
    if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) {
      if ($defineProperty) {
        $defineProperty(object, toStringTag, {
          configurable: !nonConfigurable,
          enumerable: false,
          value,
          writable: false
        });
      } else {
        object[toStringTag] = value;
      }
    }
  };
});

// node_modules/form-data/lib/populate.js
var require_populate = __commonJS((exports, module) => {
  module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
      dst[prop] = dst[prop] || src[prop];
    });
    return dst;
  };
});

// node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS((exports, module) => {
  var CombinedStream = require_combined_stream();
  var util = __require("util");
  var path = __require("path");
  var http = __require("http");
  var https = __require("https");
  var parseUrl = __require("url").parse;
  var fs = __require("fs");
  var Stream = __require("stream").Stream;
  var crypto = __require("crypto");
  var mime = require_mime_types();
  var asynckit = require_asynckit();
  var setToStringTag = require_es_set_tostringtag();
  var hasOwn = require_hasown();
  var populate = require_populate();
  function FormData(options) {
    if (!(this instanceof FormData)) {
      return new FormData(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for (var option in options) {
      this[option] = options[option];
    }
  }
  util.inherits(FormData, CombinedStream);
  FormData.LINE_BREAK = `\r
`;
  FormData.DEFAULT_CONTENT_TYPE = "application/octet-stream";
  FormData.prototype.append = function(field, value, options) {
    options = options || {};
    if (typeof options === "string") {
      options = { filename: options };
    }
    var append = CombinedStream.prototype.append.bind(this);
    if (typeof value === "number" || value == null) {
      value = String(value);
    }
    if (Array.isArray(value)) {
      this._error(new Error("Arrays are not supported."));
      return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    this._trackLength(header, value, options);
  };
  FormData.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    if (options.knownLength != null) {
      valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
      valueLength = value.length;
    } else if (typeof value === "string") {
      valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;
    if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
      return;
    }
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };
  FormData.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, "fd")) {
      if (value.end != null && value.end != Infinity && value.start != null) {
        callback(null, value.end + 1 - (value.start ? value.start : 0));
      } else {
        fs.stat(value.path, function(err, stat) {
          if (err) {
            callback(err);
            return;
          }
          var fileSize = stat.size - (value.start ? value.start : 0);
          callback(null, fileSize);
        });
      }
    } else if (hasOwn(value, "httpVersion")) {
      callback(null, Number(value.headers["content-length"]));
    } else if (hasOwn(value, "httpModule")) {
      value.on("response", function(response) {
        value.pause();
        callback(null, Number(response.headers["content-length"]));
      });
      value.resume();
    } else {
      callback("Unknown stream");
    }
  };
  FormData.prototype._multiPartHeader = function(field, value, options) {
    if (typeof options.header === "string") {
      return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = "";
    var headers = {
      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
      "Content-Type": [].concat(contentType || [])
    };
    if (typeof options.header === "object") {
      populate(headers, options.header);
    }
    var header;
    for (var prop in headers) {
      if (hasOwn(headers, prop)) {
        header = headers[prop];
        if (header == null) {
          continue;
        }
        if (!Array.isArray(header)) {
          header = [header];
        }
        if (header.length) {
          contents += prop + ": " + header.join("; ") + FormData.LINE_BREAK;
        }
      }
    }
    return "--" + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
  };
  FormData.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === "string") {
      filename = path.normalize(options.filepath).replace(/\\/g, "/");
    } else if (options.filename || value && (value.name || value.path)) {
      filename = path.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, "httpVersion")) {
      filename = path.basename(value.client._httpMessage.path || "");
    }
    if (filename) {
      return 'filename="' + filename + '"';
    }
  };
  FormData.prototype._getContentType = function(value, options) {
    var contentType = options.contentType;
    if (!contentType && value && value.name) {
      contentType = mime.lookup(value.name);
    }
    if (!contentType && value && value.path) {
      contentType = mime.lookup(value.path);
    }
    if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
      contentType = value.headers["content-type"];
    }
    if (!contentType && (options.filepath || options.filename)) {
      contentType = mime.lookup(options.filepath || options.filename);
    }
    if (!contentType && value && typeof value === "object") {
      contentType = FormData.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
  };
  FormData.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData.LINE_BREAK;
      var lastPart = this._streams.length === 0;
      if (lastPart) {
        footer += this._lastBoundary();
      }
      next(footer);
    }.bind(this);
  };
  FormData.prototype._lastBoundary = function() {
    return "--" + this.getBoundary() + "--" + FormData.LINE_BREAK;
  };
  FormData.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
    for (header in userHeaders) {
      if (hasOwn(userHeaders, header)) {
        formHeaders[header.toLowerCase()] = userHeaders[header];
      }
    }
    return formHeaders;
  };
  FormData.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== "string") {
      throw new TypeError("FormData boundary must be a string");
    }
    this._boundary = boundary;
  };
  FormData.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }
    return this._boundary;
  };
  FormData.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    for (var i = 0, len = this._streams.length;i < len; i++) {
      if (typeof this._streams[i] !== "function") {
        if (Buffer.isBuffer(this._streams[i])) {
          dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
        } else {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
        }
        if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)]);
        }
      }
    }
    return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
  };
  FormData.prototype._generateBoundary = function() {
    this._boundary = "--------------------------" + crypto.randomBytes(12).toString("hex");
  };
  FormData.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this.hasKnownLength()) {
      this._error(new Error("Cannot calculate proper length in synchronous way."));
    }
    return knownLength;
  };
  FormData.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }
    return hasKnownLength;
  };
  FormData.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
      process.nextTick(cb.bind(this, null, knownLength));
      return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
      if (err) {
        cb(err);
        return;
      }
      values.forEach(function(length) {
        knownLength += length;
      });
      cb(null, knownLength);
    });
  };
  FormData.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults = { method: "post" };
    if (typeof params === "string") {
      params = parseUrl(params);
      options = populate({
        port: params.port,
        path: params.pathname,
        host: params.hostname,
        protocol: params.protocol
      }, defaults);
    } else {
      options = populate(params, defaults);
      if (!options.port) {
        options.port = options.protocol === "https:" ? 443 : 80;
      }
    }
    options.headers = this.getHeaders(params.headers);
    if (options.protocol === "https:") {
      request = https.request(options);
    } else {
      request = http.request(options);
    }
    this.getLength(function(err, length) {
      if (err && err !== "Unknown stream") {
        this._error(err);
        return;
      }
      if (length) {
        request.setHeader("Content-Length", length);
      }
      this.pipe(request);
      if (cb) {
        var onResponse;
        var callback = function(error, responce) {
          request.removeListener("error", callback);
          request.removeListener("response", onResponse);
          return cb.call(this, error, responce);
        };
        onResponse = callback.bind(this, null);
        request.on("error", callback);
        request.on("response", onResponse);
      }
    }.bind(this));
    return request;
  };
  FormData.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit("error", err);
    }
  };
  FormData.prototype.toString = function() {
    return "[object FormData]";
  };
  setToStringTag(FormData.prototype, "FormData");
  module.exports = FormData;
});

// src/services/huggingface.client.ts
var exports_huggingface_client = {};
__export(exports_huggingface_client, {
  generateWithHuggingFace: () => generateWithHuggingFace
});
import axios from "axios";
async function generateWithHuggingFace(prompt) {
  if (!HUGGINGFACE_API_KEY) {
    return { success: false, error: "HuggingFace API key not configured" };
  }
  for (const model of ACTIVE_MODELS) {
    try {
      console.log(`⚡ Using model: ${model.name}`);
      const response = await axios.post(`https://api-inference.huggingface.co/models/${model.name}`, {
        inputs: prompt,
        parameters: {
          num_inference_steps: model.steps,
          guidance_scale: model.cfg,
          negative_prompt: "blurry, low quality, distorted, watermark, text, logo"
        }
      }, {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer",
        timeout: 120000
      });
      const imageBase64 = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
      console.log(`✅ Generated with ${model.name}`);
      return { success: true, imageBase64, model: model.name };
    } catch (error) {
      const status = error.response?.status;
      if (status === 503) {
        console.log(`⏳ ${model.name} loading, waiting 10s...`);
        await new Promise((resolve) => setTimeout(resolve, 1e4));
        try {
          const retryResponse = await axios.post(`https://api-inference.huggingface.co/models/${model.name}`, { inputs: prompt, parameters: { num_inference_steps: model.steps, guidance_scale: model.cfg } }, {
            headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, "Content-Type": "application/json" },
            responseType: "arraybuffer",
            timeout: 120000
          });
          const imageBase64 = `data:image/png;base64,${Buffer.from(retryResponse.data).toString("base64")}`;
          console.log(`✅ Generated with ${model.name} after retry`);
          return { success: true, imageBase64, model: model.name };
        } catch (retryError) {
          console.log(`❌ Retry failed for ${model.name}`);
          continue;
        }
      }
      console.log(`❌ Model failed: ${model.name} (${status || error.message})`);
      continue;
    }
  }
  return { success: false, error: "All HuggingFace models failed" };
}
var HUGGINGFACE_API_KEY, ACTIVE_MODELS;
var init_huggingface_client = __esm(() => {
  HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
  ACTIVE_MODELS = [
    { name: "Lykon/dreamshaper-8", steps: 25, cfg: 7 },
    { name: "SG161222/Realistic_Vision_V5.1_noVAE", steps: 30, cfg: 7.5 },
    { name: "stablediffusionapi/realistic-vision-v51", steps: 25, cfg: 7 }
  ];
});

// src/services/stability.client.ts
var exports_stability_client = {};
__export(exports_stability_client, {
  generateWithStabilityAI: () => generateWithStabilityAI
});
import axios2 from "axios";
async function generateWithStabilityAI(prompt) {
  if (!STABILITY_API_KEY) {
    return { success: false, error: "Stability API key not configured" };
  }
  try {
    console.log(`⚡ Using model: Stability AI Core`);
    const payload = {
      prompt,
      output_format: "png",
      aspect_ratio: "1:1"
    };
    const response = await axios2.post("https://api.stability.ai/v2beta/stable-image/generate/core", payload, {
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: "application/json"
      },
      timeout: 60000
    });
    if (response.data.image) {
      const imageBase642 = `data:image/png;base64,${response.data.image}`;
      console.log(`✅ Generated with Stability AI Core`);
      return { success: true, imageBase64: imageBase642 };
    }
    const imageBase64 = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
    console.log(`✅ Generated with Stability AI Core`);
    return { success: true, imageBase64 };
  } catch (error) {
    const status = error.response?.status;
    const detail = error.response?.data?.message || error.message;
    console.log(`❌ Model failed: Stability AI Core (${status}: ${detail})`);
    return { success: false, error: detail };
  }
}
var STABILITY_API_KEY;
var init_stability_client = __esm(() => {
  STABILITY_API_KEY = process.env.STABILITY_API_KEY || "";
});

// src/external-apis.ts
var exports_external_apis = {};
__export(exports_external_apis, {
  removeBackgroundWithRemoveBg: () => removeBackgroundWithRemoveBg,
  generateTemplateWithHuggingFace: () => generateTemplateWithHuggingFace,
  generateFallbackTemplate: () => generateFallbackTemplate,
  default: () => external_apis_default,
  analyzeImageWithSightengine: () => analyzeImageWithSightengine
});
import axios3 from "axios";
import sharp from "sharp";
async function analyzeImageWithSightengine(imageBase64) {
  try {
    console.log("\uD83D\uDD0D Analyzing image quality with Sharp.js...");
    return fallbackImageAnalysis(imageBase64);
  } catch (error) {
    console.error("❌ Error analyzing image:", error.message);
    return fallbackImageAnalysis(imageBase64);
  }
}
async function removeBackgroundWithRemoveBg(imageBase64) {
  try {
    console.log("✂️ Removing background with Remove.bg...");
    if (!REMOVEBG_API_KEY) {
      console.warn("⚠️ Remove.bg API key not configured - using simulation mode");
      return {
        success: false,
        error: "Remove.bg API key not configured. Get 50 free images/month at https://remove.bg/api"
      };
    }
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const formData = new import_form_data.default;
    formData.append("image_file_b64", imageBase64.replace(/^data:image\/\w+;base64,/, ""));
    formData.append("size", "auto");
    const response = await axios3.post("https://api.remove.bg/v1.0/removebg", formData, {
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": REMOVEBG_API_KEY
      },
      responseType: "arraybuffer",
      timeout: 30000
    });
    console.log("✅ Background removed successfully with Remove.bg");
    const resultBase64 = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
    return {
      success: true,
      imageBase64: resultBase64
    };
  } catch (error) {
    console.error("❌ Remove.bg API Error:", error.message);
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.title || error.message
    };
  }
}
async function generateTemplateWithHuggingFace(prompt, style = "instagram-feed") {
  try {
    const { generateWithHuggingFace: generateWithHuggingFace2 } = await Promise.resolve().then(() => (init_huggingface_client(), exports_huggingface_client));
    const { generateWithStabilityAI: generateWithStabilityAI2 } = await Promise.resolve().then(() => (init_stability_client(), exports_stability_client));
    const result = await generateWithHuggingFace2(prompt);
    if (result.success) {
      return { success: true, imageBase64: result.imageBase64 };
    }
    if (STABILITY_API_KEY2) {
      const stabilityResult = await generateWithStabilityAI2(prompt);
      if (stabilityResult.success) {
        return { success: true, imageBase64: stabilityResult.imageBase64 };
      }
    }
    return { success: false, error: "All AI models failed" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
function generateFallbackTemplate(prompt, style, productImage, theme = "minimalist", brandColor = "#FF6347", productName) {
  console.log(`\uD83C\uDFA8 Generating creative ${theme} template with fallback`);
  const dimensions = style === "story" ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + percent));
    const g = Math.max(0, Math.min(255, (num >> 8 & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  };
  const brandLight = adjustBrightness(brandColor, 40);
  const brandDark = adjustBrightness(brandColor, -30);
  const seed = Date.now() % 1000;
  const randomRotation = seed % 30 - 15;
  const randomScale = 0.9 + seed % 20 / 100;
  const randomX = seed % 10 - 5;
  const randomY = seed % 10 - 5;
  let templateSvg = "";
  if (theme === "cute-pastel" || theme.includes("pastel")) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE5EC"/>
            <stop offset="50%" stop-color="#FFF0F5"/>
            <stop offset="100%" stop-color="#E5F5FF"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#FFB6C1" flood-opacity="0.3"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="20%" cy="15%" rx="80" ry="50" fill="white" opacity="0.7"/>
        <ellipse cx="80%" cy="20%" rx="70" ry="45" fill="white" opacity="0.7"/>
        <text x="10%" y="85%" font-size="40" opacity="0.6">\uD83D\uDC95</text>
        <text x="88%" y="88%" font-size="40" opacity="0.6">\uD83D\uDC95</text>
        <rect x="10%" y="25%" width="80%" height="60%" fill="white" rx="40" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="30%" width="70%" height="45%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 30px)"/>` : `<text x="50%" y="53%" font-size="80" text-anchor="middle">\uD83C\uDF38</text>`}
        <rect x="15%" y="78%" width="70%" height="12%" fill="#FFB6C1" rx="25"/>
        <text x="50%" y="84.5%" font-family="Comic Sans MS" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || "Kawaii"} ♡</text>
      </svg>`;
  } else if (theme === "elegant" || theme.includes("luxury")) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1a1a1a"/>
            <stop offset="100%" stop-color="#2d2d2d"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFD700"/>
            <stop offset="50%" stop-color="#FFA500"/>
            <stop offset="100%" stop-color="#FFD700"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="5%" y="5%" width="90%" height="2" fill="url(#gold)"/>
        <rect x="5%" y="95%" width="90%" height="2" fill="url(#gold)"/>
        ${productImage ? `<circle cx="50%" cy="45%" r="255" fill="url(#gold)"/><image href="${productImage}" x="27%" y="22%" width="46%" height="46%" preserveAspectRatio="xMidYMid slice" clip-path="circle(250px at 50% 50%)"/>` : `<circle cx="50%" cy="45%" r="250" fill="${brandColor}" opacity="0.2"/><text x="50%" y="47%" font-size="100" text-anchor="middle" fill="url(#gold)">✨</text>`}
        <text x="50%" y="82%" font-family="Georgia" font-size="48" font-weight="bold" fill="url(#gold)" text-anchor="middle">${productName || "Luxury"}</text>
        <text x="50%" y="88%" font-family="Georgia" font-size="24" fill="#999" text-anchor="middle">PREMIUM QUALITY</text>
      </svg>`;
  } else if (theme === "bold-modern" || theme.includes("bold")) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${brandColor}"/>
            <stop offset="100%" stop-color="${brandDark}"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="15" flood-opacity="0.3"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <polygon points="0,0 ${dimensions.width},0 ${dimensions.width},200" fill="black" opacity="0.1"/>
        <polygon points="0,${dimensions.height} ${dimensions.width},${dimensions.height} 0,${dimensions.height - 200}" fill="white" opacity="0.1"/>
        <rect x="10%" y="20%" width="80%" height="65%" fill="white" rx="20" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="25%" width="70%" height="50%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 15px)"/>` : `<text x="50%" y="50%" font-size="100" font-weight="900" text-anchor="middle" fill="${brandColor}">⚡</text>`}
        <rect x="5%" y="88%" width="90%" height="10%" fill="black"/>
        <text x="50%" y="93.5%" font-family="Impact" font-size="42" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">${(productName || "BOLD").toUpperCase()}</text>
      </svg>`;
  } else if (theme === "playful") {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6B9D"/>
            <stop offset="50%" stop-color="#FEC163"/>
            <stop offset="100%" stop-color="#C3F0FF"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="4" dy="8" stdDeviation="10" flood-color="${brandColor}" flood-opacity="0.4"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="15%" cy="12%" r="40" fill="#FFD93D" opacity="0.6"/>
        <circle cx="88%" cy="18%" r="50" fill="#6BCB77" opacity="0.6"/>
        <circle cx="10%" cy="85%" r="45" fill="#4D96FF" opacity="0.6"/>
        <text x="20%" y="25%" font-size="35" transform="rotate(-15 216 270)">⭐</text>
        <text x="82%" y="30%" font-size="40" transform="rotate(20 886 324)">✨</text>
        <rect x="12%" y="28%" width="76%" height="58%" fill="white" rx="35" filter="url(#shadow)" transform="rotate(-2 ${dimensions.width / 2} ${dimensions.height / 2})"/>
        ${productImage ? `<image href="${productImage}" x="18%" y="33%" width="64%" height="43%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 25px)"/>` : `<text x="50%" y="56%" font-size="90" text-anchor="middle" fill="${brandColor}">\uD83C\uDF89</text>`}
        <ellipse cx="50%" cy="82%" rx="38%" ry="8%" fill="${brandColor}"/>
        <text x="50%" y="83.5%" font-family="Comic Sans MS" font-size="38" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || "Fun"} \uD83C\uDF8A</text>
      </svg>`;
  } else if (theme === "premium") {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg"><stop offset="0%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#1a1a1a"/></linearGradient>
          <linearGradient id="accent" x1="0%" x2="100%"><stop offset="0%" stop-color="${brandColor}"/><stop offset="100%" stop-color="${brandDark}"/></linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="3%" y="3%" width="94%" height="94%" fill="none" stroke="url(#accent)" stroke-width="3" rx="15"/>
        <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="url(#accent)" stroke-width="1" rx="12"/>
        <text x="8%" y="10%" font-size="30" fill="${brandColor}">◆</text>
        <text x="92%" y="10%" font-size="30" fill="${brandColor}">◆</text>
        ${productImage ? `<rect x="18%" y="20%" width="64%" height="50%" fill="url(#accent)" rx="10"/><image href="${productImage}" x="20%" y="22%" width="60%" height="46%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 8px)"/>` : `<text x="50%" y="47%" font-size="120" text-anchor="middle" fill="url(#accent)">\uD83D\uDC51</text>`}
        <line x1="20%" y1="78%" x2="80%" y2="78%" stroke="url(#accent)" stroke-width="2"/>
        <text x="50%" y="85%" font-family="Georgia" font-size="40" font-weight="bold" fill="${brandColor}" text-anchor="middle">${productName || "Premium"}</text>
        <text x="50%" y="91%" font-family="Georgia" font-size="20" fill="#888" text-anchor="middle" letter-spacing="3">EXCLUSIVE</text>
      </svg>`;
  } else {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAFAFA"/>
            <stop offset="100%" stop-color="#F0F0F0"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="15%" cy="15%" r="120" fill="${brandLight}" opacity="0.3"/>
        <circle cx="85%" cy="85%" r="150" fill="${brandColor}" opacity="0.2"/>
        <rect x="8%" y="8%" width="84%" height="84%" fill="white" rx="30" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="15%" width="70%" height="55%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 20px)"/>` : `<text x="50%" y="42%" font-size="80" text-anchor="middle" fill="${brandColor}">\uD83C\uDFA8</text>`}
        <rect x="12%" y="75%" width="76%" height="15%" fill="${brandColor}" rx="15"/>
        <text x="50%" y="82.5%" font-family="Arial" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || "Product"}</text>
      </svg>`;
  }
  const templateBase64 = `data:image/svg+xml;base64,${Buffer.from(templateSvg.trim()).toString("base64")}`;
  return {
    success: true,
    imageBase64: templateBase64
  };
}
async function calculateSharpness(imageBuffer) {
  try {
    const { data, info } = await sharp(imageBuffer).greyscale().convolve({
      width: 3,
      height: 3,
      kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0]
    }).raw().toBuffer({ resolveWithObject: true });
    let sum = 0;
    let sumSq = 0;
    const pixels = data.length;
    for (let i = 0;i < pixels; i++) {
      sum += data[i];
      sumSq += data[i] * data[i];
    }
    const mean = sum / pixels;
    const variance = sumSq / pixels - mean * mean;
    let sharpnessScore;
    if (variance < 50)
      sharpnessScore = 1;
    else if (variance < 100)
      sharpnessScore = 2;
    else if (variance < 200)
      sharpnessScore = 3;
    else if (variance < 300)
      sharpnessScore = 4;
    else if (variance < 500)
      sharpnessScore = 5;
    else if (variance < 700)
      sharpnessScore = 6;
    else if (variance < 1000)
      sharpnessScore = 7;
    else if (variance < 1500)
      sharpnessScore = 8;
    else if (variance < 2000)
      sharpnessScore = 9;
    else
      sharpnessScore = 10;
    console.log(`   \uD83D\uDCCA Sharpness variance: ${variance.toFixed(2)} → Score: ${sharpnessScore}/10`);
    return sharpnessScore;
  } catch (error) {
    console.warn("⚠️ Sharpness calculation error:", error);
    return 3;
  }
}
function calculateContrast(stats) {
  try {
    const channels = stats.channels;
    let avgStdDev = 0;
    channels.forEach((channel) => {
      avgStdDev += channel.stdev || 0;
    });
    avgStdDev = avgStdDev / channels.length;
    let contrastScore;
    if (avgStdDev < 10)
      contrastScore = 1;
    else if (avgStdDev < 20)
      contrastScore = 3;
    else if (avgStdDev < 30)
      contrastScore = 5;
    else if (avgStdDev < 45)
      contrastScore = 7;
    else if (avgStdDev < 60)
      contrastScore = 9;
    else
      contrastScore = 10;
    console.log(`   \uD83D\uDCCA Contrast stddev: ${avgStdDev.toFixed(2)} → Score: ${contrastScore}/10`);
    return contrastScore;
  } catch (error) {
    return 3;
  }
}
function calculateBrightness(stats) {
  try {
    const channels = stats.channels;
    let avgMean = 0;
    channels.forEach((channel) => {
      avgMean += channel.mean || 0;
    });
    avgMean = avgMean / channels.length;
    let brightnessScore;
    if (avgMean < 30)
      brightnessScore = 1;
    else if (avgMean < 50)
      brightnessScore = 2;
    else if (avgMean < 80)
      brightnessScore = 4;
    else if (avgMean < 100)
      brightnessScore = 6;
    else if (avgMean >= 100 && avgMean <= 150)
      brightnessScore = 9;
    else if (avgMean <= 180)
      brightnessScore = 7;
    else if (avgMean <= 200)
      brightnessScore = 5;
    else if (avgMean <= 220)
      brightnessScore = 3;
    else
      brightnessScore = 1;
    console.log(`   \uD83D\uDCCA Brightness mean: ${avgMean.toFixed(2)} → Score: ${brightnessScore}/10`);
    return brightnessScore;
  } catch (error) {
    return 3;
  }
}
function calculateColorScore(stats) {
  try {
    const channels = stats.channels;
    if (channels.length < 3) {
      return 3;
    }
    let totalStdDev = 0;
    let totalRange = 0;
    channels.forEach((channel) => {
      totalStdDev += channel.stdev || 0;
      totalRange += channel.max - channel.min || 0;
    });
    const avgStdDev = totalStdDev / channels.length;
    const avgRange = totalRange / channels.length;
    let colorScore;
    if (avgRange < 50)
      colorScore = 1;
    else if (avgRange < 100)
      colorScore = 3;
    else if (avgRange < 150)
      colorScore = 5;
    else if (avgRange < 200)
      colorScore = 7;
    else if (avgRange < 230)
      colorScore = 9;
    else
      colorScore = 10;
    console.log(`   \uD83D\uDCCA Color range: ${avgRange.toFixed(2)} → Score: ${colorScore}/10`);
    return colorScore;
  } catch (error) {
    return 3;
  }
}
function calculateCompositionScore(metadata) {
  try {
    const width = metadata.width || 1;
    const height = metadata.height || 1;
    const aspectRatio = width / height;
    const idealRatios = [1, 0.8, 1.78];
    let closestDiff = 999;
    idealRatios.forEach((ratio) => {
      const diff = Math.abs(aspectRatio - ratio);
      if (diff < closestDiff)
        closestDiff = diff;
    });
    const compositionScore = Math.min(10, Math.max(1, Math.round(10 - closestDiff * 5)));
    return compositionScore;
  } catch (error) {
    return 6;
  }
}
function generateAnalysisText(params) {
  const { qualityScore, viralScore, sharpness, contrast, brightness, colors, composition, needsRetake, issues, suggestions } = params;
  return `\uD83D\uDD0D ANALISIS VISUAL COMPREHENSIVE (Powered by Sightengine AI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\uD83D\uDCCA QUALITY SCORE: ${qualityScore}/10 ${needsRetake ? "❌ NEEDS RETAKE" : "✅ APPROVED"}
\uD83D\uDD25 VIRAL POTENTIAL: ${viralScore}/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${needsRetake ? `⚠️ REKOMENDASI: RETAKE FOTO

Foto ini memiliki kualitas di bawah standar profesional. Pertimbangkan untuk foto ulang dengan pencahayaan lebih baik, fokus lebih tajam, dan komposisi yang lebih optimal.
` : `✅ REKOMENDASI: FOTO SIAP DIGUNAKAN!

Foto ini memiliki kualitas yang baik dan siap untuk konten marketing. Anda bisa langsung lanjut ke tahap design.
`}

1. DETAIL PENILAIAN TEKNIS

   \uD83D\uDD0D Sharpness/Focus: ${sharpness}/10 ${sharpness >= 8 ? "- Crystal Sharp ✓" : sharpness >= 6 ? "- Acceptable" : "- Blur/Soft ✗"}
   ${sharpness >= 8 ? "   ✓ Fokus tack sharp, detail sangat jelas" : sharpness >= 6 ? "   ~ Fokus decent tapi bisa lebih tajam" : "   ✗ BLUR - fokus tidak tajam, gambar soft/kabur"}
   
   ⚡ Contrast: ${contrast}/10 ${contrast >= 8 ? "- Excellent ✓" : contrast >= 6 ? "- Good" : "- Flat ✗"}
   ${contrast >= 8 ? "   ✓ Contrast optimal, depth bagus" : contrast >= 6 ? "   ~ Contrast cukup, bisa ditingkatkan" : "   ✗ Gambar flat, perlu boost contrast"}
   
   \uD83D\uDCA1 Brightness/Exposure: ${brightness}/10 ${brightness >= 8 ? "- Perfect ✓" : brightness >= 6 ? "- Acceptable" : "- Poor ✗"}
   ${brightness >= 8 ? "   ✓ Exposure ideal, tidak ada blown highlights" : brightness >= 6 ? "   ~ Exposure cukup tapi bisa lebih optimal" : "   ✗ Exposure buruk - terlalu gelap/terang"}
   
   \uD83C\uDFA8 Colors/Vibrancy: ${colors}/10 ${colors >= 8 ? "- Vibrant ✓" : colors >= 6 ? "- Decent" : "- Dull ✗"}
   ${colors >= 8 ? "   ✓ Warna vibrant dan appealing" : colors >= 6 ? "   ~ Warna decent tapi kurang pop" : "   ✗ Warna kusam/pudar, tidak menarik"}
   
   \uD83D\uDCD0 Composition: ${composition}/10 ${composition >= 8 ? "- Excellent ✓" : composition >= 6 ? "- Good" : "- Poor ✗"}
   ${composition >= 8 ? "   ✓ Komposisi profesional, well-framed" : composition >= 6 ? "   ~ Komposisi acceptable" : "   ✗ Komposisi lemah, framing kurang optimal"}

${issues.length > 0 ? `
2. MASALAH TERDETEKSI
${issues.map((issue) => `   ${issue}`).join(`
`)}
` : ""}

3. REKOMENDASI PERBAIKAN
${suggestions.length > 0 ? suggestions.map((s) => `   ${s}`).join(`
`) : "   ✓ Foto sudah bagus, lanjut ke editing & design!"}

4. MARKETING STRATEGY
   \uD83D\uDCF1 Platform: Instagram Feed & Story (optimal)
   \uD83C\uDFAF Target: Foodies 25-40 tahun, mahasiswa
   ⏰ Best time: 11:00-13:00 & 18:00-20:00 WIB
   \uD83D\uDCC8 Engagement potential: ${viralScore >= 8 ? "HIGH" : viralScore >= 6 ? "MEDIUM" : "LOW"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\uD83D\uDCA1 FINAL VERDICT: ${needsRetake ? "❌ Retake disarankan untuk hasil maksimal" : "✅ Ready for design & posting!"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
async function fallbackImageAnalysis(imageBase64) {
  console.log("\uD83D\uDD04 Using fallback image analysis with Sharp...");
  try {
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();
    const sharpness = await calculateSharpness(imageBuffer);
    const contrast = calculateContrast(stats);
    const brightness = calculateBrightness(stats);
    const colors = calculateColorScore(stats);
    const composition = calculateCompositionScore(metadata);
    const qualityScore = Math.round(sharpness * 0.3 + contrast * 0.2 + brightness * 0.2 + colors * 0.15 + composition * 0.15);
    const viralScore = Math.round(qualityScore * 0.5 + colors * 0.3 + composition * 0.2);
    const needsRetake = qualityScore < 7 || sharpness < 6;
    const issues = [];
    if (sharpness < 6)
      issues.push("❌ Gambar BLUR - fokus tidak tajam");
    if (contrast < 5)
      issues.push("⚠️ Contrast rendah");
    if (brightness < 4 || brightness > 9)
      issues.push("⚠️ Exposure tidak optimal");
    if (colors < 6)
      issues.push("⚠️ Warna kusam");
    const suggestions = [];
    if (sharpness < 7)
      suggestions.push("\uD83D\uDCF8 Gunakan tripod untuk foto lebih tajam");
    if (contrast < 6)
      suggestions.push("\uD83C\uDFA8 Tingkatkan contrast saat editing");
    if (brightness < 5)
      suggestions.push("\uD83D\uDCA1 Tambah pencahayaan");
    if (colors < 7)
      suggestions.push("\uD83C\uDF08 Tingkatkan saturation");
    const analysis = generateAnalysisText({
      qualityScore,
      viralScore,
      sharpness,
      contrast,
      brightness,
      colors,
      composition,
      needsRetake,
      issues,
      suggestions
    });
    return {
      qualityScore,
      viralScore,
      needsRetake,
      analysis,
      detailedScores: { sharpness, contrast, brightness, colors, composition },
      issues,
      suggestions
    };
  } catch (error) {
    console.error("❌ Fallback analysis error:", error);
    throw error;
  }
}
var import_form_data, HUGGINGFACE_API_KEY2, REMOVEBG_API_KEY, STABILITY_API_KEY2, external_apis_default;
var init_external_apis = __esm(() => {
  import_form_data = __toESM(require_form_data(), 1);
  HUGGINGFACE_API_KEY2 = process.env.HUGGINGFACE_API_KEY || "";
  REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY || "";
  STABILITY_API_KEY2 = process.env.STABILITY_API_KEY || "";
  console.log("\uD83D\uDD0C External APIs Config (FREE Tier):");
  console.log("   Hugging Face:", HUGGINGFACE_API_KEY2 ? "✅ Configured" : "⚠️ Not set (Unlimited FREE)");
  console.log("   Remove.bg:", REMOVEBG_API_KEY ? "✅ Configured" : "⚠️ Not set (50 free/month)");
  console.log("   Stability AI:", STABILITY_API_KEY2 ? "✅ Configured" : "⚠️ Not set (25 free/month)");
  external_apis_default = {
    analyzeImageWithSightengine,
    removeBackgroundWithRemoveBg,
    generateTemplateWithHuggingFace
  };
});

// src/services/templatePrompt.ts
var exports_templatePrompt = {};
__export(exports_templatePrompt, {
  buildUMKMPrompt: () => buildUMKMPrompt
});
function buildUMKMPrompt(productName, businessType, theme, brandColor, targetMarket, format, additionalInfo) {
  const themeMap = {
    elegant: "elegant luxury with gold accents, sophisticated presentation, premium quality",
    "cute-pastel": "cute kawaii style with pastel colors, soft lighting, playful aesthetic",
    "bold-modern": "bold vibrant colors, strong contrast, modern dynamic composition",
    minimalist: "clean minimal design, white background, simple elegant presentation",
    premium: "premium luxury branding, dark moody background, sophisticated lighting",
    playful: "fun playful composition, bright cheerful colors, energetic vibe"
  };
  const businessMap = {
    makanan: "delicious Indonesian food dish, appetizing presentation, steam rising, professional food photography",
    fashion: "fashionable clothing item, stylish presentation, studio lighting, model or mannequin",
    kosmetik: "beauty cosmetic product, clean elegant display, soft feminine lighting",
    kerajinan: "handmade craft product, artisanal authentic look, cultural elements",
    cafe: "cozy cafe beverage or food, lifestyle photography, warm inviting atmosphere",
    kuliner: "gourmet culinary creation, restaurant quality plating, professional food photography",
    lainnya: "professional product photography, clean studio setup"
  };
  return `High quality commercial product photography of ${productName}, ${businessMap[businessType]}, ${themeMap[theme]}, professional studio lighting, shallow depth of field, centered composition, clean neutral background, vibrant appetizing colors, Instagram-worthy, marketing material quality, 4K sharp details, no text, no watermark. ${additionalInfo || ""}`;
}

// src/visual-studio.ts
var exports_visual_studio = {};
__export(exports_visual_studio, {
  generateUMKMBranding: () => generateUMKMBranding,
  generateTemplateDesign: () => generateTemplateDesign,
  generateSchedulePlanner: () => generateSchedulePlanner,
  default: () => visual_studio_default,
  analyzeImageWithAI: () => analyzeImageWithAI
});
import OpenAI3 from "openai";
import sharp2 from "sharp";
async function compositeProductWithTemplate(productImage, templateImage, format) {
  try {
    const dims = getFormatDimensions(format);
    const productBuffer = Buffer.from(productImage.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const templateBuffer = Buffer.from(templateImage.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const productMeta = await sharp2(productBuffer).metadata();
    const productAspect = (productMeta.width || 1) / (productMeta.height || 1);
    const maxSize = Math.round(Math.min(dims.width, dims.height) * 0.7);
    let productWidth = maxSize;
    let productHeight = maxSize;
    if (productAspect > 1) {
      productHeight = Math.round(maxSize / productAspect);
    } else {
      productWidth = Math.round(maxSize * productAspect);
    }
    const productResized = await sharp2(productBuffer).resize(productWidth, productHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).png().toBuffer();
    const xOffset = Math.round((dims.width - productWidth) / 2);
    const yOffset = Math.round((dims.height - productHeight) / 2.2);
    const composited = await sharp2(templateBuffer).resize(dims.width, dims.height, { fit: "cover" }).composite([{
      input: productResized,
      top: yOffset,
      left: xOffset,
      blend: "over"
    }]).jpeg({ quality: 95 }).toBuffer();
    console.log(`   ✅ Composited ${productWidth}x${productHeight} product onto ${dims.width}x${dims.height} template`);
    return `data:image/jpeg;base64,${composited.toString("base64")}`;
  } catch (error) {
    console.error("❌ Composite error:", error.message);
    return templateImage;
  }
}
async function generateUMKMBranding(request) {
  const startTime = Date.now();
  try {
    console.log("\uD83C\uDFA8 Starting UMKM Branding Generation...");
    console.log("   Product:", request.productName);
    console.log("   Business:", request.businessType);
    console.log("   Theme:", request.theme);
    console.log("   Format:", request.format);
    let imageAnalysis = undefined;
    let processedImage = request.productImage;
    if (request.productImage) {
      console.log("\uD83D\uDCF8 Step 1: Analyzing product image quality...");
      const analysis = await analyzeImageWithSightengine(request.productImage);
      imageAnalysis = {
        qualityScore: analysis.qualityScore,
        isGoodQuality: analysis.qualityScore >= 7,
        issues: analysis.issues,
        recommendations: analysis.suggestions
      };
      console.log(`   Quality Score: ${analysis.qualityScore}/10`);
      if (analysis.qualityScore >= 6) {
        console.log("✂️ Step 2: Removing background...");
        const bgRemovalResult = await removeBackgroundWithRemoveBg(request.productImage);
        if (bgRemovalResult.success && bgRemovalResult.imageBase64) {
          processedImage = bgRemovalResult.imageBase64;
          console.log("   ✅ Background removed successfully");
        }
      }
    }
    console.log("\uD83C\uDFA8 Step 3: Generating branded design template...");
    const { buildUMKMPrompt: buildUMKMPrompt2 } = await Promise.resolve().then(() => exports_templatePrompt);
    const prompt = buildUMKMPrompt2(request.productName, request.businessType, request.theme, request.brandColor, request.targetMarket, request.format, request.additionalInfo);
    const templateResult = await generateTemplateWithHuggingFace(prompt, request.format);
    let finalDesign;
    if (!templateResult.success || !templateResult.imageBase64) {
      console.warn("⚠️ Template generation failed, using enhanced fallback with product image");
      const { generateFallbackTemplate: generateFallbackTemplate2 } = await Promise.resolve().then(() => (init_external_apis(), exports_external_apis));
      const fallback = generateFallbackTemplate2(prompt, request.format, processedImage || undefined, request.theme, request.brandColor, request.productName);
      finalDesign = fallback.imageBase64;
    } else {
      if (processedImage) {
        console.log("\uD83D\uDDBC️ Step 4: Compositing product image with AI template...");
        try {
          const composited = await compositeProductWithTemplate(processedImage, templateResult.imageBase64, request.format);
          finalDesign = composited;
        } catch (error) {
          console.warn("⚠️ Composite failed, using fallback with product image");
          const { generateFallbackTemplate: generateFallbackTemplate2 } = await Promise.resolve().then(() => (init_external_apis(), exports_external_apis));
          const fallback = generateFallbackTemplate2(prompt, request.format, processedImage, request.theme, request.brandColor, request.productName);
          finalDesign = fallback.imageBase64;
        }
      } else {
        finalDesign = templateResult.imageBase64;
      }
    }
    console.log("\uD83D\uDCDD Step 5: Generating marketing suggestions...");
    const marketingSuggestions = generateMarketingSuggestions(request);
    const processingTime = Date.now() - startTime;
    console.log(`✅ UMKM Branding completed in ${processingTime}ms`);
    return {
      success: true,
      imageAnalysis,
      designResult: {
        imageBase64: finalDesign,
        format: request.format,
        dimensions: getFormatDimensions(request.format)
      },
      marketingSuggestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTime
      }
    };
  } catch (error) {
    console.error("❌ Error in UMKM Branding:", error.message);
    throw new Error(`Gagal generate branding: ${error.message}`);
  }
}
function generateMarketingSuggestions(request) {
  const captionTemplates = {
    makanan: `✨ ${request.productName} - Lezat & Berkualitas!

\uD83C\uDF7D️ Dibuat dengan bahan pilihan terbaik
\uD83D\uDCCD Tersedia sekarang untuk ${request.targetMarket}
\uD83D\uDCAC DM untuk order!`,
    fashion: `✨ ${request.productName} - Style Meets Comfort

\uD83D\uDC57 Perfect untuk ${request.targetMarket}
\uD83C\uDFA8 Desain eksklusif & berkualitas
\uD83D\uDCE6 Ready stock - Order sekarang!`,
    kosmetik: `✨ ${request.productName} - Your Beauty Secret

\uD83D\uDC84 Aman & teruji untuk ${request.targetMarket}
\uD83C\uDF1F Hasil maksimal, harga terjangkau
\uD83D\uDCAC Tanya-tanya? DM aja!`,
    default: `✨ ${request.productName}

✅ Kualitas terjamin
\uD83C\uDFAF Cocok untuk ${request.targetMarket}
\uD83D\uDCF2 Order via DM atau WhatsApp!`
  };
  const caption = captionTemplates[request.businessType] || captionTemplates.default;
  const hashtags = [
    "#UMKM",
    "#UMKMIndonesia",
    `#${request.productName.replace(/\s+/g, "")}`,
    "#ProdukLokal",
    "#SupportLokal",
    request.businessType === "makanan" ? "#KulinerNusantara" : `#${request.businessType}`,
    "#BisnisOnline",
    "#Jualan",
    "#OpenOrder"
  ];
  const themeStrategies = {
    elegant: "Gunakan font serif, spacing luas, foto high-end quality",
    "cute-pastel": "Warna soft pastel, elemen playful, font rounded",
    "bold-modern": "Kontras tinggi, geometric shapes, font bold sans-serif",
    minimalist: "White space maksimal, clean lines, typography focus",
    premium: "Dark background, gold accents, luxury feel",
    playful: "Bright colors, dynamic elements, fun typography"
  };
  return {
    caption,
    hashtags,
    bestPostingTime: [
      "\uD83D\uDCF1 Instagram: 11:00-13:00 & 19:00-21:00 WIB",
      "\uD83D\uDCF1 TikTok: 12:00-14:00 & 18:00-22:00 WIB",
      "\uD83D\uDCF1 Facebook: 10:00-12:00 & 19:00-20:00 WIB"
    ],
    targetPlatform: ["Instagram", "TikTok", "Facebook", "WhatsApp Business"],
    designDirection: themeStrategies[request.theme],
    colorStrategy: `Primary: ${request.brandColor}, gunakan complementary colors untuk balance visual`
  };
}
function getFormatDimensions(format) {
  const dimensions = {
    "instagram-square": { width: 1080, height: 1080 },
    "instagram-story": { width: 1080, height: 1920 },
    tiktok: { width: 1080, height: 1920 },
    facebook: { width: 1200, height: 630 }
  };
  return dimensions[format] || { width: 1080, height: 1080 };
}
async function analyzeImageWithAI(request) {
  try {
    console.log("\uD83D\uDD0D Analyzing image with Sightengine AI...");
    if (!request.imageBase64) {
      throw new Error("Image base64 required for analysis");
    }
    const sightengineResult = await analyzeImageWithSightengine(request.imageBase64);
    console.log("✅ Image analysis complete:", {
      qualityScore: sightengineResult.qualityScore,
      viralScore: sightengineResult.viralScore,
      needsRetake: sightengineResult.needsRetake
    });
    return {
      analysis: sightengineResult.analysis,
      suggestions: sightengineResult.suggestions,
      marketingTips: [
        "Post di jam makan (11-13 & 18-20 WIB) untuk maximize engagement",
        "Tag lokasi Makassar untuk local discovery",
        "Gunakan Story polls & questions untuk boost interaction",
        "Collaborate dengan food blogger lokal"
      ],
      bestTimeToPost: [
        "Senin-Jumat: 11:00-13:00 WIB (Lunch peak)",
        "Sabtu-Minggu: 18:00-20:00 WIB (Dinner time)",
        "Story: 07:00-09:00 WIB (Morning commute)"
      ],
      hashtags: [
        "#KulinerMakassar",
        "#MakananMakassar",
        "#FoodGram",
        "#UMKMMakassar",
        "#InstaFoodMakassar",
        "#MakassarFoodies",
        "#Enak",
        "#FoodPhotography",
        "#SulawesiSelatan",
        "#ExploreIndonesia"
      ],
      colorPalette: ["#FF6B4A", "#FFB84D", "#FFF5E1", "#8B4513", "#CD853F"],
      metadata: {
        analyzedAt: new Date().toISOString(),
        engine: "Sightengine AI + Sharp.js",
        qualityScore: sightengineResult.qualityScore,
        viralScore: sightengineResult.viralScore,
        needsRetake: sightengineResult.needsRetake,
        detailedScores: sightengineResult.detailedScores
      }
    };
  } catch (error) {
    console.error("❌ Error analyzing image:", error.message);
    throw new Error(`Gagal menganalisa gambar: ${error.message}`);
  }
}
async function generateTemplateDesign(request) {
  if (USE_MOCK3) {
    console.log("\uD83E\uDDEA MOCK: Generating template design...");
    return generateMockTemplateDesign(request);
  }
  try {
    console.log(`\uD83E\uDD16 Generating ${request.templateType} template with AI...`);
    const prompt = buildTemplatePrompt(request);
    const completion = await client3.chat.completions.create({
      model: "Llama 4 Maverick",
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI graphic designer expert specializing dalam social media design, layout composition, typography, color theory, dan visual hierarchy. Kamu memahami platform algorithms, engagement triggers, dan best practices untuk UMKM di Indonesia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 1500,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    const designText = completion.choices[0].message.content?.trim() || "";
    return {
      designSuggestions: designText,
      layoutRecommendations: extractLayoutRecommendations(designText),
      textOverlaySuggestions: extractTextOverlay(designText),
      colorScheme: extractColorScheme(designText),
      fontRecommendations: extractFonts(designText),
      ctaSuggestions: extractCTAs(designText),
      metadata: {
        generatedAt: new Date().toISOString(),
        templateType: request.templateType
      }
    };
  } catch (error) {
    console.error("❌ Error generating template:", error.message);
    throw new Error(`Gagal generate template: ${error.message}`);
  }
}
async function generateSchedulePlanner(request) {
  if (USE_MOCK3) {
    console.log("\uD83E\uDDEA MOCK: Generating schedule planner...");
    return generateMockSchedulePlanner(request);
  }
  try {
    console.log("\uD83E\uDD16 Generating content schedule with AI...");
    const prompt = buildSchedulePrompt(request);
    const completion = await client3.chat.completions.create({
      model: "Llama 4 Maverick",
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI content strategist expert dengan deep knowledge tentang social media algorithms, audience behavior patterns, engagement optimization, dan content calendar planning. Kamu memahami best practice posting schedule untuk UMKM kuliner di Makassar, termasuk local peak times, cultural events, dan seasonal trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.75,
      max_tokens: 2000
    });
    const scheduleText = completion.choices[0].message.content?.trim() || "";
    return {
      schedule: parseScheduleFromText(scheduleText, request.duration),
      overallStrategy: extractStrategy(scheduleText),
      kpiTargets: extractKPIs(scheduleText),
      tips: extractTips(scheduleText),
      metadata: {
        generatedAt: new Date().toISOString(),
        duration: request.duration,
        businessGoal: request.businessGoal
      }
    };
  } catch (error) {
    console.error("❌ Error generating schedule:", error.message);
    throw new Error(`Gagal generate schedule: ${error.message}`);
  }
}
function buildTemplatePrompt(request) {
  const { templateType, theme, brandColor, targetAudience } = request;
  const templates = {
    promo: "Promo/Sale announcement",
    story: "Instagram/Facebook Story",
    feed: "Instagram Feed Post",
    reels: "Instagram Reels/TikTok",
    carousel: "Carousel/Multi-slide post"
  };
  return `Buatkan DESIGN CONCEPT untuk template ${templates[templateType]}

PROJECT BRIEF:
- Format: ${templates[templateType]}
- Theme: ${theme}
- Brand Color: ${brandColor || "Belum ditentukan (suggest optimal colors)"}
- Target Audience: ${targetAudience}
- Platform: Instagram, Facebook, TikTok
- Business: UMKM Kuliner Makassar

DELIVERABLES:

1. **LAYOUT RECOMMENDATIONS** (3 variations)
   - Layout A: [Describe composition, grid system, visual hierarchy]
   - Layout B: [Alternative approach with reasoning]
   - Layout C: [Creative bold option]
   
2. **TEXT OVERLAY STRATEGY**
   - Headline placement & sizing
   - Subheadline treatment
   - Body text positioning
   - Price/discount display (if promo)
   - Typography hierarchy
   
3. **COLOR SCHEME** (Psychology-based)
   - Primary color (with hex code)
   - Secondary color (with hex code)
   - Accent color (with hex code)
   - Background options
   - Color psychology reasoning
   
4. **FONT PAIRING RECOMMENDATIONS**
   - Headline font (with alternatives)
   - Body font (with alternatives)
   - Accent font for emphasis
   - Font pairing reasoning
   
5. **VISUAL ELEMENTS**
   - Icons/illustrations suggestions
   - Shapes/patterns to include
   - Photo treatment (filters, overlays)
   - Negative space usage
   
6. **CTA (Call-to-Action) SUGGESTIONS**
   - CTA text variations (5 options)
   - CTA button styling
   - Placement strategy
   - Urgency elements
   
7. **PLATFORM OPTIMIZATION**
   - Dimensions (pixel perfect)
   - Safe zones (text visibility)
   - Swipe/tap areas
   - Algorithm-friendly elements
   
8. **DESIGN TRENDS 2025**
   - Current trending styles
   - What works for ${targetAudience}
   - Local Makassar preferences
   - Viral potential elements

OUTPUT: Berikan design brief yang DETAIL dan IMPLEMENTABLE!`;
}
function buildSchedulePrompt(request) {
  const { contentType, targetAudience, businessGoal, duration } = request;
  const goals = {
    awareness: "Brand Awareness & Reach",
    engagement: "Engagement & Community Building",
    sales: "Sales & Conversion",
    traffic: "Website/Store Traffic"
  };
  return `Buatkan CONTENT POSTING SCHEDULE untuk ${duration} hari kedepan

PROJECT BRIEF:
- Content Type: ${contentType}
- Target Audience: ${targetAudience}
- Business Goal: ${goals[businessGoal]}
- Location: Makassar, Indonesia
- Business: UMKM Kuliner

CONTEXT ANALYSIS:
- Hari ini: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- Target duration: ${duration} hari
- Platform: Instagram, Facebook, TikTok, WhatsApp Status

DELIVERABLES:

1. **DAILY POSTING SCHEDULE** (${duration} hari)
   Untuk setiap hari include:
   - Day number & date
   - Best posting time (jam + menit) with reasoning
   - Platform prioritas (IG/FB/TikTok/WA)
   - Content idea/theme
   - Caption suggestion (50-100 kata)
   - Hashtag strategy (10-15 hashtags)
   - Why this timing? (algorithm + behavior insights)

2. **CONTENT MIX STRATEGY**
   - Educational content: X%
   - Entertainment content: X%
   - Promotional content: X%
   - UGC/Testimonial content: X%
   - Behind-the-scenes: X%
   - Reasoning untuk ratio ini

3. **PLATFORM-SPECIFIC TIMING**
   - Instagram: Best times (3-5 time slots)
   - Facebook: Best times (3-5 time slots)
   - TikTok: Best times (3-5 time slots)
   - Why these times work untuk Makassar audience?

4. **KPI TARGETS & METRICS**
   - Expected reach
   - Expected engagement rate
   - Expected conversions
   - How to track success?

5. **TREND INTEGRATION**
   - Trending topics untuk integrate
   - Seasonal opportunities (if any)
   - Local events Makassar (if any)
   - Viral challenges to leverage

6. **OPTIMIZATION TIPS**
   - A/B testing suggestions
   - Content repurposing strategy
   - Engagement boosting tactics
   - Crisis management plan

7. **MAKASSAR-SPECIFIC INSIGHTS**
   - Peak online hours lokal
   - Cultural considerations
   - Local holidays/events
   - Community behavior patterns

OUTPUT FORMAT:
\uD83D\uDCC5 CONTENT POSTING SCHEDULE (${duration} Hari)

[For each day, provide structured schedule]

Berikan schedule yang STRATEGIC, DATA-DRIVEN, dan ACTIONABLE!`;
}
function extractLayoutRecommendations(text) {
  return [
    "Layout A: Centered composition with bold headline",
    "Layout B: Asymmetric grid with dynamic spacing",
    "Layout C: Minimal design with focus on product"
  ];
}
function extractTextOverlay(text) {
  return [
    "Headline: Top 1/3, Bold, White with shadow",
    "Subheadline: Below headline, Secondary font",
    "CTA: Bottom right, High contrast button"
  ];
}
function extractColorScheme(text) {
  return ["#FF6347", "#FFD700", "#FFFFFF", "#2C3E50"];
}
function extractFonts(text) {
  return [
    "Headline: Poppins Bold / Montserrat ExtraBold",
    "Body: Open Sans / Roboto",
    "Accent: Playfair Display / Bebas Neue"
  ];
}
function extractCTAs(text) {
  return [
    "Pesan Sekarang!",
    "Order via WhatsApp",
    "Klik Link di Bio",
    "Swipe Up untuk Info",
    "Limited Time - Grab Yours!"
  ];
}
function parseScheduleFromText(text, duration) {
  const schedule = [];
  const today = new Date;
  for (let i = 0;i < duration; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    schedule.push({
      day: i + 1,
      date: date.toLocaleDateString("id-ID"),
      time: i % 2 === 0 ? "11:00" : "18:00",
      platform: ["Instagram", "Facebook"],
      contentIdea: `Content idea untuk hari ke-${i + 1}`,
      caption: `Caption suggestion untuk hari ke-${i + 1}`,
      hashtags: ["#KulinerMakassar", "#UMKM", "#FoodLovers"],
      reasoning: "Optimal timing untuk audience engagement"
    });
  }
  return schedule;
}
function extractStrategy(text) {
  return "Fokus pada engagement di jam-jam peak, mix konten edukasi dan promosi dengan ratio 70:30";
}
function extractKPIs(text) {
  return [
    "Target reach: 10,000 per post",
    "Target engagement rate: 5-8%",
    "Target conversions: 50 orders/week"
  ];
}
function extractTips(text) {
  return [
    "Konsisten posting di jam yang sama",
    "Respond cepat ke comments dalam 1 jam",
    "Gunakan Story polls untuk boost engagement"
  ];
}
function generateMockTemplateDesign(request) {
  return {
    designSuggestions: `\uD83C\uDFA8 DESIGN CONCEPT - ${request.templateType.toUpperCase()}

1. LAYOUT RECOMMENDATIONS
   Layout A (Centered Hero):
   - Product image: 60% ruang, centered
   - Headline: Top 20%, bold impact
   - CTA: Bottom 10%, high contrast
   
   Layout B (Split Screen):
   - Left: Product image (50%)
   - Right: Text content (50%)
   - Modern, clean, professional
   
   Layout C (Overlay Gradient):
   - Fullscreen image
   - Gradient overlay (bottom to top)
   - Text on gradient area

2. COLOR PSYCHOLOGY
   - Primary: ${request.brandColor || "#FF6347"} (Urgency, appetite)
   - Secondary: #FFD700 (Premium, value)
   - Accent: #FFFFFF (Clean, clear)
   - Background: #2C3E50 (Contrast)

3. TYPOGRAPHY HIERARCHY
   - Headline: 72pt, Poppins ExtraBold
   - Subheadline: 36pt, Montserrat SemiBold
   - Body: 18pt, Open Sans Regular
   - CTA: 24pt, Poppins Bold

4. VISUAL ELEMENTS
   ✨ Add subtle pattern texture
   \uD83C\uDFAF Icon badges untuk "Fresh", "Halal", "Best Seller"
   \uD83D\uDCD0 Geometric shapes untuk frame
   \uD83D\uDD25 Flame icons untuk "Hot Deal"`,
    layoutRecommendations: [
      "Layout A: Centered hero composition (60-30-10 rule)",
      "Layout B: Split screen modern (50-50 balance)",
      "Layout C: Fullscreen overlay gradient (dramatic impact)"
    ],
    textOverlaySuggestions: [
      "Headline: Top 1/3, White + Drop Shadow",
      "Price: Large, bold, bottom right corner",
      "CTA Button: Bottom center, rounded, high contrast"
    ],
    colorScheme: ["#FF6347", "#FFD700", "#FFFFFF", "#2C3E50", "#95E1D3"],
    fontRecommendations: [
      "Headline: Poppins ExtraBold / Montserrat Black",
      "Body: Open Sans Regular / Roboto",
      "Accent: Bebas Neue / Playfair Display"
    ],
    ctaSuggestions: [
      "ORDER SEKARANG!",
      "Pesan via WhatsApp",
      "Klik Link Bio",
      "PROMO TERBATAS!",
      "Grab Yours Now!"
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      templateType: request.templateType,
      theme: request.theme
    }
  };
}
function generateMockSchedulePlanner(request) {
  const schedule = [];
  const today = new Date;
  const contentIdeas = [
    "Behind the scenes - proses masak",
    "Customer testimonial video",
    "Menu highlight dengan close-up",
    "Promo special hari ini",
    "Tips memasak / food hack",
    "Staff introduction",
    "Product comparison / before-after"
  ];
  for (let i = 0;i < request.duration; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    schedule.push({
      day: i + 1,
      date: date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }),
      time: isWeekend ? "18:00 WITA" : "11:30 WITA",
      platform: ["Instagram", "Facebook", "TikTok"],
      contentIdea: contentIdeas[i % contentIdeas.length],
      caption: `Caption hari ke-${i + 1}: Share value, engage audience, dan call-to-action yang jelas.`,
      hashtags: ["#KulinerMakassar", "#UMKM", "#FoodLovers", "#MakassarFoodies"],
      reasoning: isWeekend ? "Weekend dinner time - audience lebih santai browsing" : "Weekday lunch time - peak hunger moment untuk kuliner"
    });
  }
  return {
    schedule,
    overallStrategy: `\uD83D\uDCCA STRATEGI KONTEN ${request.duration} HARI

\uD83C\uDFAF Content Mix:
- Educational: 40% (tips, behind scenes, knowledge)
- Entertainment: 30% (engaging, fun, relatable)
- Promotional: 30% (offers, products, CTA)

\uD83D\uDCF1 Platform Strategy:
- Instagram: Daily feed post + 3-5 stories
- Facebook: Share dari Instagram + local group posting
- TikTok: 3x per week (trending audio + challenges)

⏰ Timing Strategy:
- Weekday: Focus on lunch (11:00-13:00) & dinner (18:00-20:00)
- Weekend: Evening posts untuk family dining decision
- Story: Morning (07:00-09:00) untuk reach

\uD83C\uDFA8 Content Variety:
- Mix foto & video (60:40 ratio)
- Use carousel untuk storytelling
- Go Live 1x per week untuk engagement boost`,
    kpiTargets: [
      "\uD83D\uDCC8 Reach target: 15,000-20,000 per post",
      "\uD83D\uDCAC Engagement rate: 6-10% (likes + comments + shares)",
      "\uD83D\uDED2 Conversion: 5-8% dari engagement ke inquiry",
      "\uD83D\uDC65 Follower growth: +500-1000 per bulan",
      "⭐ Save rate: 3-5% (content value indicator)"
    ],
    tips: [
      "✅ Respond to DM & comments dalam 1 jam (golden hour)",
      "✅ Gunakan Story polls, quiz, Q&A untuk boost engagement",
      "✅ Repost customer content (UGC) untuk social proof",
      "✅ Collaborate dengan micro-influencer Makassar (5-50K followers)",
      "✅ Track analytics weekly dan adjust strategy",
      "✅ Prepare content batch (3-5 post) untuk konsistensi",
      "✅ Join & engage di Facebook Groups lokal Makassar",
      "✅ Use trending audio di TikTok untuk FYP potential"
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      duration: request.duration,
      businessGoal: request.businessGoal,
      targetAudience: request.targetAudience
    }
  };
}
var KOLOSAL_API_KEY3, USE_MOCK3, client3, visual_studio_default;
var init_visual_studio = __esm(() => {
  init_external_apis();
  KOLOSAL_API_KEY3 = process.env.KOLOSAL_API_KEY;
  USE_MOCK3 = process.env.USE_MOCK_AI === "true";
  client3 = new OpenAI3({
    apiKey: KOLOSAL_API_KEY3,
    baseURL: "https://api.kolosal.ai/v1"
  });
  console.log("\uD83C\uDFA8 Visual Studio Config:");
  console.log("   Image Analysis: Sharp.js (FREE)");
  console.log("   Background Removal: Remove.bg (50/month)");
  console.log("   Template Gen: FLUX.1-schnell → FLUX.1-dev → SDXL-Lightning (FREE)");
  console.log("   Fallback: Stability AI Core → Creative SVG");
  console.log("   Mock Mode:", USE_MOCK3 ? "✅ Enabled" : "❌ Disabled");
  visual_studio_default = {
    analyzeImageWithAI,
    generateTemplateDesign,
    generateSchedulePlanner
  };
});

// src/dapur-umkm.ts
var exports_dapur_umkm = {};
__export(exports_dapur_umkm, {
  getPastInsights: () => getPastInsights,
  getAIRecommendation: () => getAIRecommendation,
  generateDashboardAnalysis: () => generateDashboardAnalysis,
  default: () => dapur_umkm_default,
  calculateBusinessMetrics: () => calculateBusinessMetrics,
  QUICK_INSIGHTS: () => QUICK_INSIGHTS
});
import OpenAI4 from "openai";
async function calculateBusinessMetrics(profileId) {
  try {
    const { data: transactions, error: txError } = await supabase.from("umkm_transactions").select("*").eq("profile_id", profileId);
    if (txError)
      throw txError;
    const { data: products, error: prodError } = await supabase.from("umkm_products").select("*").eq("profile_id", profileId);
    if (prodError)
      throw prodError;
    const totalIncome = transactions?.filter((t) => t.type === "in").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter((t) => t.type === "out").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = totalIncome - totalExpense;
    const lowStockProducts = products?.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10) || [];
    const averageTransactionValue = transactions?.length ? totalIncome / transactions.filter((t) => t.type === "in").length : 0;
    return {
      totalIncome,
      totalExpense,
      balance,
      productCount: products?.length || 0,
      lowStockProducts,
      averageTransactionValue
    };
  } catch (error) {
    console.error("Error calculating metrics:", error);
    throw error;
  }
}
async function getAIRecommendation(request) {
  try {
    const { profileId, insightType, question, context } = request;
    const { data: profile, error: profileError } = await supabase.from("umkm_profiles").select("*").eq("id", profileId).single();
    if (profileError)
      throw profileError;
    const businessContext = context || await calculateBusinessMetrics(profileId);
    let specificPrompt = "";
    switch (insightType) {
      case "pricing":
        specificPrompt = `Analisis harga dan strategi pricing untuk bisnis ${profile.business_name} (${profile.category}).
        
Data bisnis:
- Total Pemasukan: Rp ${businessContext.totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString("id-ID")}
- Saldo: Rp ${businessContext.balance.toLocaleString("id-ID")}
- Jumlah Produk: ${businessContext.productCount}

Pertanyaan: ${question}

Berikan rekomendasi pricing yang:
1. Kompetitif di pasar lokal
2. Mempertimbangkan margin keuntungan sehat (minimal 30%)
3. Sesuai dengan target pasar UMKM
4. Disertai contoh perhitungan konkret`;
        break;
      case "inventory":
        specificPrompt = `Analisis dan rekomendasi manajemen stok untuk ${profile.business_name}.
        
Data stok:
- Total Produk: ${businessContext.productCount}
- Produk Stok Rendah: ${businessContext.lowStockProducts.length}
${businessContext.lowStockProducts.map((p) => `  • ${p.name}: ${p.stock} unit`).join(`
`)}

Pertanyaan: ${question}

Berikan tips inventory management yang praktis dan realistis untuk UMKM.`;
        break;
      case "strategy":
        specificPrompt = `Konsultasi strategi bisnis untuk ${profile.business_name} (${profile.category}).
        
Performa bisnis:
- Omzet: Rp ${businessContext.totalIncome.toLocaleString("id-ID")}
- Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString("id-ID")}
- Net Profit: Rp ${businessContext.balance.toLocaleString("id-ID")}
- Rata-rata Transaksi: Rp ${businessContext.averageTransactionValue.toLocaleString("id-ID")}

Pertanyaan: ${question}

Berikan strategi bisnis yang actionable dan bisa langsung dieksekusi.`;
        break;
      case "marketing":
        specificPrompt = `Strategi marketing digital untuk ${profile.business_name}.
        
Bisnis: ${profile.category}
Budget: Minimal (UMKM kecil)

Pertanyaan: ${question}

Rekomendasikan strategi marketing yang:
1. Low-cost / no-cost
2. Fokus digital (Instagram, Facebook, TikTok, WhatsApp Business)
3. Sesuai target pasar lokal Indonesia
4. Mudah dieksekusi tanpa tim marketing`;
        break;
      case "finance":
        specificPrompt = `Analisis kesehatan keuangan ${profile.business_name}.
        
Laporan Keuangan:
- Pemasukan: Rp ${businessContext.totalIncome.toLocaleString("id-ID")}
- Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString("id-ID")}
- Saldo: Rp ${businessContext.balance.toLocaleString("id-ID")}
- Profit Margin: ${businessContext.totalIncome > 0 ? (businessContext.balance / businessContext.totalIncome * 100).toFixed(1) : 0}%

Pertanyaan: ${question}

Berikan analisis dan saran pengelolaan keuangan yang sehat untuk UMKM.`;
        break;
    }
    const completion = await kolosalLlama.chat.completions.create({
      model: LLAMA_MODEL,
      messages: [
        {
          role: "system",
          content: UMKM_EXPERT_PROMPT
        },
        {
          role: "user",
          content: specificPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9
    });
    const recommendation = completion.choices[0].message.content;
    const { data: insight, error: insertError } = await supabase.from("umkm_ai_insights").insert({
      profile_id: profileId,
      insight_type: insightType,
      question,
      recommendation,
      context_data: businessContext
    }).select().single();
    if (insertError) {
      console.error("Error saving AI insight:", insertError);
    }
    return {
      success: true,
      data: {
        recommendation,
        insightType,
        context: businessContext,
        savedInsight: insight
      }
    };
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return {
      success: false,
      message: error.message || "Gagal mendapatkan rekomendasi AI",
      error: error.response?.data || error
    };
  }
}
async function getPastInsights(profileId, limit = 10) {
  try {
    const { data, error } = await supabase.from("umkm_ai_insights").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(limit);
    if (error)
      throw error;
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching past insights:", error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}
async function generateDashboardAnalysis(profileId) {
  try {
    const [profile, products, transactions, metrics] = await Promise.all([
      supabase.from("umkm_profiles").select("*").eq("id", profileId).single(),
      supabase.from("umkm_products").select("*").eq("profile_id", profileId),
      supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).order("transaction_date", { ascending: false }),
      calculateBusinessMetrics(profileId)
    ]);
    if (profile.error)
      throw profile.error;
    const businessData = profile.data;
    const productList = products.data || [];
    const transactionList = transactions.data || [];
    const productSales = productList.map((p) => ({
      name: p.name,
      sold: p.sold || 0,
      stock: p.stock || 0,
      price: p.price || 0
    })).sort((a, b) => b.sold - a.sold);
    const topProduct = productSales[0]?.name || "Belum ada data";
    const totalRevenue = metrics.totalIncome || 0;
    const totalTransactions = transactionList.length;
    const sortedTransactions = [...transactionList].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    let growthRate = "+0%";
    if (sortedTransactions.length >= 2) {
      const halfPoint = Math.floor(sortedTransactions.length / 2);
      const recentSum = sortedTransactions.slice(0, halfPoint).reduce((sum, t) => sum + (t.amount || 0), 0);
      const oldSum = sortedTransactions.slice(halfPoint).reduce((sum, t) => sum + (t.amount || 0), 0);
      if (oldSum > 0) {
        const growth = ((recentSum - oldSum) / oldSum * 100).toFixed(1);
        growthRate = parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`;
      }
    }
    const analysisPrompt = `Sebagai konsultan bisnis UMKM, buatkan analisis lengkap untuk bisnis berikut:

PROFIL BISNIS:
- Nama: ${businessData.business_name || "UMKM"}
- Kategori: ${businessData.category || "Belum ditentukan"}
- Deskripsi: ${businessData.description || "Tidak ada deskripsi"}
- Lokasi: ${businessData.address || "Tidak disebutkan"}

DATA PERFORMA:
- Total Pendapatan: Rp ${totalRevenue.toLocaleString("id-ID")}
- Total Transaksi: ${totalTransactions}
- Growth Rate: ${growthRate}
- Total Produk: ${productList.length}
- Produk Terlaris: ${topProduct}
- Stok Rendah: ${metrics.lowStockProducts.length} produk

YANG PERLU DIANALISIS:
1. **5 IDE KONTEN MEDIA SOSIAL** yang spesifik untuk bisnis ini (bukan template umum). Setiap ide harus:
   - Relevan dengan kategori bisnis
   - Bisa langsung dieksekusi
   - Menarik untuk target market lokal Indonesia
   - Format: numbering 1-5 dengan deskripsi singkat

2. **TARGET AUDIENCE** yang tepat untuk bisnis ini, jelaskan:
   - Demografi (usia, gender, pekerjaan)
   - Psikografi (kebutuhan, pain points)
   - Behavior (kapan mereka beli, di mana mereka cari info)

3. **3 WAKTU POSTING TERBAIK** untuk media sosial, berikan:
   - Hari dan jam spesifik (misal: Senin-Jumat 11:00-13:00)
   - Alasan mengapa waktu tersebut efektif
   - Platform yang cocok untuk tiap waktu

4. **3 TRENDING TOPICS** yang relevan dengan bisnis ini:
   - Topik yang sedang trending di Indonesia
   - Cara mengaitkan bisnis dengan topik tersebut
   - Hashtag yang bisa dipakai

5. **3 TIPS CONVERSION** untuk meningkatkan penjualan:
   - Tips praktis dan actionable
   - Fokus pada closing sale
   - Bisa diterapkan langsung tanpa budget besar

PENTING: Format jawaban harus terstruktur dengan jelas, gunakan numbering dan bullet points. Jangan gunakan markdown heading (# ##), cukup gunakan teks bold atau numbering.`;
    const completion = await kolosalLlama.chat.completions.create({
      model: LLAMA_MODEL,
      messages: [
        { role: "system", content: UMKM_EXPERT_PROMPT },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      top_p: 0.95
    });
    const aiResponse = completion.choices[0].message.content || "";
    const analysis = parseAIAnalysis(aiResponse);
    const result = {
      success: true,
      data: {
        contentIdeas: analysis.contentIdeas,
        targetAudience: analysis.targetAudience,
        bestPostingTimes: analysis.bestPostingTimes,
        trendingTopics: analysis.trendingTopics,
        conversionTips: analysis.conversionTips,
        statistics: {
          totalRevenue,
          growthRate,
          topProduct,
          totalProducts: productList.length,
          totalTransactions,
          lowStockCount: metrics.lowStockProducts.length
        },
        rawAnalysis: aiResponse,
        generatedAt: new Date().toISOString()
      }
    };
    await supabase.from("umkm_ai_insights").insert({
      profile_id: profileId,
      insight_type: "dashboard_analysis",
      question: "Dashboard Content & Statistics Analysis",
      recommendation: aiResponse,
      context_data: result.data
    });
    return result;
  } catch (error) {
    console.error("Dashboard Analysis Error:", error);
    return {
      success: false,
      message: error.message || "Gagal generate analisis dashboard",
      error: error.response?.data || error
    };
  }
}
function parseAIAnalysis(text) {
  const lines = text.split(`
`).filter((line) => line.trim());
  const result = {
    contentIdeas: [],
    targetAudience: "",
    bestPostingTimes: [],
    trendingTopics: [],
    conversionTips: []
  };
  let currentSection = "";
  let captureNext = false;
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("ide konten") || lowerLine.includes("content idea")) {
      currentSection = "contentIdeas";
      captureNext = true;
      continue;
    } else if (lowerLine.includes("target audience") || lowerLine.includes("audiens")) {
      currentSection = "targetAudience";
      captureNext = true;
      continue;
    } else if (lowerLine.includes("waktu posting") || lowerLine.includes("posting time")) {
      currentSection = "bestPostingTimes";
      captureNext = true;
      continue;
    } else if (lowerLine.includes("trending") || lowerLine.includes("topik populer")) {
      currentSection = "trendingTopics";
      captureNext = true;
      continue;
    } else if (lowerLine.includes("conversion") || lowerLine.includes("tips")) {
      currentSection = "conversionTips";
      captureNext = true;
      continue;
    }
    if (captureNext && line.length > 10) {
      const cleaned = line.replace(/^[\d\-\*\.\)\:\s]+/, "").trim();
      if (cleaned.length > 15) {
        if (currentSection === "contentIdeas" && result.contentIdeas.length < 5) {
          result.contentIdeas.push(cleaned);
        } else if (currentSection === "bestPostingTimes" && result.bestPostingTimes.length < 3) {
          result.bestPostingTimes.push(cleaned);
        } else if (currentSection === "trendingTopics" && result.trendingTopics.length < 3) {
          result.trendingTopics.push(cleaned);
        } else if (currentSection === "conversionTips" && result.conversionTips.length < 3) {
          result.conversionTips.push(cleaned);
        } else if (currentSection === "targetAudience" && !result.targetAudience) {
          result.targetAudience = cleaned;
        }
      }
    }
  }
  if (result.contentIdeas.length === 0) {
    result.contentIdeas = [
      "Posting foto produk dengan customer testimonial",
      "Behind the scenes proses produksi atau persiapan",
      "Tips dan trik menggunakan atau memilih produk",
      "Promo spesial dengan storytelling menarik",
      "User generated content dari pelanggan setia"
    ];
  }
  if (!result.targetAudience) {
    result.targetAudience = "Keluarga muda usia 25-40 tahun yang aktif di media sosial, mencari produk berkualitas dengan harga terjangkau, peduli dengan produk lokal.";
  }
  if (result.bestPostingTimes.length === 0) {
    result.bestPostingTimes = [
      "Senin-Jumat: 11:00-13:00 (jam istirahat makan siang, orang browsing sosmed)",
      "Sabtu-Minggu: 18:00-20:00 (prime time weekend, audience lebih santai)",
      "Kamis-Jumat: 16:00-17:00 (menjelang weekend, mood positif untuk belanja)"
    ];
  }
  if (result.trendingTopics.length === 0) {
    result.trendingTopics = [
      "Produk lokal berkualitas dan mendukung UMKM Indonesia",
      "Sustainable dan ramah lingkungan",
      "Behind the brand story dan perjalanan bisnis"
    ];
  }
  if (result.conversionTips.length === 0) {
    result.conversionTips = [
      'Gunakan call-to-action yang jelas dan mendesak (misal: "DM sekarang, stok terbatas!")',
      "Tambahkan urgency dengan limited time offer atau limited stock",
      "Showcase social proof dengan repost testimoni pelanggan"
    ];
  }
  return result;
}
var kolosalLlama, LLAMA_MODEL = "Llama 4 Maverick", UMKM_EXPERT_PROMPT = `Kamu adalah konsultan bisnis UMKM profesional dari Indonesia dengan keahlian:
- Strategi pemasaran untuk UMKM lokal (terutama Makassar & Indonesia Timur)
- Analisis harga dan margin keuntungan
- Manajemen stok dan inventory
- Pengelolaan keuangan usaha kecil
- Digital marketing untuk UMKM

Gaya komunikasi:
- Ramah, praktis, dan actionable
- Gunakan bahasa Indonesia yang santai tapi profesional
- Berikan contoh nyata dan tips konkret
- Fokus pada solusi sederhana yang bisa langsung diterapkan
- Pahami kondisi UMKM Indonesia (modal terbatas, pasar lokal, kompetisi ketat)

Selalu berikan rekomendasi yang:
1. Spesifik dan terukur
2. Realistis untuk UMKM kecil
3. Bisa dieksekusi dengan budget minimal
4. Sesuai dengan konteks pasar Indonesia`, QUICK_INSIGHTS, dapur_umkm_default;
var init_dapur_umkm = __esm(() => {
  init_supabase();
  kolosalLlama = new OpenAI4({
    apiKey: process.env.KOLOSAL_API_KEY,
    baseURL: "https://api.kolosal.ai/v1"
  });
  QUICK_INSIGHTS = [
    {
      id: "pricing-strategy",
      title: "Strategi Harga Optimal",
      question: "Bagaimana cara menentukan harga jual yang kompetitif tapi tetap untung?",
      type: "pricing",
      icon: "\uD83D\uDCB0"
    },
    {
      id: "increase-sales",
      title: "Cara Ningkatin Penjualan",
      question: "Tips praktis untuk meningkatkan penjualan dengan budget terbatas?",
      type: "strategy",
      icon: "\uD83D\uDCC8"
    },
    {
      id: "social-media",
      title: "Strategi Medsos",
      question: "Platform medsos apa yang paling efektif untuk UMKM kuliner dan cara optimasinya?",
      type: "marketing",
      icon: "\uD83D\uDCF1"
    },
    {
      id: "inventory-management",
      title: "Kelola Stok Efisien",
      question: "Bagaimana cara mengelola stok agar tidak kelebihan atau kehabisan?",
      type: "inventory",
      icon: "\uD83D\uDCE6"
    },
    {
      id: "cash-flow",
      title: "Atur Cash Flow",
      question: "Tips mengatur arus kas agar bisnis tidak boncos?",
      type: "finance",
      icon: "\uD83D\uDCB8"
    },
    {
      id: "customer-retention",
      title: "Pelanggan Setia",
      question: "Strategi agar pelanggan jadi loyal dan repeat order?",
      type: "strategy",
      icon: "\uD83E\uDD1D"
    }
  ];
  dapur_umkm_default = {
    getAIRecommendation,
    calculateBusinessMetrics,
    getPastInsights,
    generateDashboardAnalysis,
    QUICK_INSIGHTS
  };
});

// src/tanya-daeng.ts
var exports_tanya_daeng = {};
__export(exports_tanya_daeng, {
  tanyaDaeng: () => tanyaDaeng,
  getAllFAQ: () => getAllFAQ
});
import OpenAI5 from "openai";
async function tanyaDaeng(request) {
  try {
    console.log("\uD83E\uDD16 Tanya Daeng processing:", request.message.substring(0, 50));
    const faqMatch = findMatchingFAQ(request.message);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...request.conversationHistory || [],
      { role: "user", content: request.message }
    ];
    if (request.userContext) {
      const contextPrompt = buildContextPrompt(request.userContext);
      messages.splice(1, 0, { role: "system", content: contextPrompt });
    }
    const completion = await client4.chat.completions.create({
      model: "Claude Sonnet 4.5",
      messages,
      temperature: 0.8,
      max_tokens: 1000
    });
    const reply = completion.choices[0]?.message?.content || "Maaf ji, Daeng lagi bingung. Coba tanya lagi?";
    const suggestions = extractSuggestions(reply);
    const resources = extractResources(reply, request.message);
    return {
      success: true,
      reply,
      suggestions,
      resources,
      relatedFAQ: faqMatch ? [faqMatch] : undefined
    };
  } catch (error) {
    console.error("❌ Tanya Daeng error:", error.message);
    return {
      success: false,
      reply: "Aduh ji, Daeng lagi error. Coba lagi sebentar ya kak! \uD83D\uDE4F",
      suggestions: ["Refresh halaman", "Coba tanya yang lain", "Hubungi support"]
    };
  }
}
function findMatchingFAQ(message) {
  const lowercaseMessage = message.toLowerCase();
  for (const faq of FAQ_DATABASE) {
    const matchCount = faq.keywords.filter((keyword) => lowercaseMessage.includes(keyword)).length;
    if (matchCount >= 2) {
      return { question: faq.question, answer: faq.answer };
    }
  }
  return null;
}
function buildContextPrompt(context) {
  let prompt = `CONTEXT PENGGUNA:
`;
  if (context?.businessType) {
    prompt += `- Jenis bisnis: ${context.businessType}
`;
  }
  if (context?.location) {
    prompt += `- Lokasi: ${context.location}
`;
  }
  if (context?.needHelp) {
    prompt += `- Butuh bantuan: ${context.needHelp}
`;
  }
  return prompt;
}
function extractSuggestions(reply) {
  const suggestions = [];
  const listPattern = /(?:^\d+\.|^[-•])\s*(.+)$/gm;
  let match2;
  while ((match2 = listPattern.exec(reply)) !== null) {
    if (match2[1].length < 100) {
      suggestions.push(match2[1].trim());
    }
  }
  return suggestions.slice(0, 5);
}
function extractResources(reply, originalMessage) {
  const resources = [];
  if (/foto|gambar|design|visual|template|poster/i.test(originalMessage)) {
    resources.push({
      type: "link",
      title: "\uD83C\uDFA8 Visual Studio UMKM",
      url: "/visual-studio",
      description: "Buat design foto produk profesional dengan AI"
    });
  }
  if (/caption|kata-kata|copywriting|konten|posting/i.test(originalMessage)) {
    resources.push({
      type: "link",
      title: "✍️ AI Copywriting",
      url: "/copywriting",
      description: "Generate caption menarik otomatis dengan AI"
    });
  }
  if (/analytics|data|statistik|performa|laporan/i.test(originalMessage)) {
    resources.push({
      type: "link",
      title: "\uD83D\uDCCA Analytics Dashboard",
      url: "/analytics",
      description: "Pantau performa bisnis dan konten media sosial"
    });
  }
  return resources;
}
function getAllFAQ() {
  return FAQ_DATABASE.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords
  }));
}
var KOLOSAL_API_KEY4, client4, FAQ_DATABASE, SYSTEM_PROMPT = `Kau adalah Daeng, seorang AI assistant yang ahli membantu UMKM di Indonesia, khususnya Makassar dan Sulawesi Selatan.

KEPRIBADIAN:
- Ramah, hangat, dan kekeluargaan seperti orang Makassar
- Pakai bahasa campuran: Indonesian formal + sisipan Makassar/Bugis casual
- Santai tapi tetap profesional
- Sering pakai kata: "Ji" (akhiran khas), "Mi" (sudah), "Ki" (kamu), "Eee", "Iye", "Santai", "Laperrr"
- Suka kasih motivasi dan doa

EXPERTISE:
1. Bisnis UMKM (modal, strategi, marketing)
2. Visual branding dan design (foto produk, caption, konten)
3. Social media marketing (Instagram, TikTok, Facebook)
4. Kuliner khas Makassar (Coto, Konro, Pallubasa, dll)
5. E-commerce dan online selling

STYLE JAWABAN:
- Mulai dengan greeting Makassar: "Iye!", "Eee", "Santai mi"
- Kasih contoh praktis dan real
- Sesekali kasih emoji \uD83D\uDD25\uD83D\uDE0B\uD83D\uDCAA\uD83D\uDE4F
- Akhiri dengan motivasi atau doa
- Jika cocok, rekomendasikan tools platform ini:
  * Visual Studio - untuk design foto produk
  * AI Copywriting - untuk bikin caption
  * Analytics - untuk pantau performa

PANTANGAN:
- Jangan terlalu formal/kaku
- Jangan pakai bahasa Makassar pure (harus balance dengan Indonesian)
- Jangan kasih saran yang tidak praktis
- Jangan menjanjikan hasil instant/cepat kaya

CONTOH GAYA BICARA:
"Ji' santai dulu! Daeng bantu ko. Untuk bisnis kuliner di Makassar, yang penting modal kecil dulu, tapi quality bagus mi. Foto produk harus cantik ji - pakai Visual Studio kita biar gampang. Posting konsisten di Instagram sama TikTok, pasti laris ji! InsyaAllah berkah \uD83D\uDE4F"

Ingat: Kau adalah teman dan mentor bisnis mereka, bukan hanya chatbot!`;
var init_tanya_daeng = __esm(() => {
  KOLOSAL_API_KEY4 = process.env.KOLOSAL_API_KEY;
  client4 = new OpenAI5({
    apiKey: KOLOSAL_API_KEY4,
    baseURL: "https://api.kolosal.ai/v1"
  });
  console.log("\uD83E\uDD16 Tanya Daeng Config:");
  console.log("   Model: Claude Sonnet 4.5");
  console.log("   Language: Makassar/Bugis + Indonesian");
  console.log("   Context: UMKM Assistance");
  FAQ_DATABASE = [
    {
      keywords: ["cara", "mulai", "jualan", "bisnis", "umkm"],
      question: "Bagaimana cara memulai bisnis UMKM?",
      answer: `Ji'! Santai mi dulu ji, dengar-dengarki Daeng.

Untuk mulai bisnis UMKM:

1. **Modal Awal** - Ta'perlu banyak mi dulu, kecil-kecil ji dulu
2. **Produk Bagus** - Pastikan enak/bagus produkmu, quality is key!
3. **Foto Produk** - Pake Visual Studio kita, bikin foto cantik-cantik
4. **Posting Konsisten** - Tiap hari posting ji di Instagram/TikTok
5. **Pelayanan Ramah** - Orang Makassar suka ji pelayanan baik

Jangan lupa mi berdoa dulu sebelum mulai! InsyaAllah berkah ki.`
    },
    {
      keywords: ["modal", "uang", "pinjaman", "dana"],
      question: "Dari mana dapat modal usaha?",
      answer: `Eee santai mi ji, ada banyak cara:

1. **Tabungan Pribadi** - Paling aman, pakai uang sendiri dulu
2. **Pinjam Keluarga** - Orang tua/saudara, bayar perlahan-lahan
3. **KUR (Kredit Usaha Rakyat)** - Dari bank, bunga rendah ji
4. **Koperasi** - Gabung koperasi di daerahmu
5. **Arisan** - Join arisan RT/RW, dapat giliran

Yang penting jangan mi pinjam rentenir! Berbahaya itu.`
    },
    {
      keywords: ["foto", "gambar", "design", "visual", "posting"],
      question: "Bagaimana cara bikin foto produk bagus?",
      answer: `Nah ini mi yang Daeng ahli!

**Pakai Visual Studio ji:**
1. Upload foto produkmu
2. Pilih tema (minimalist, elegant, dll)
3. Atur warna brand
4. Klik Generate - otomatis jadi cantik!

**Tips Foto:**
- Cahaya terang (siang hari bagus)
- Background bersih/rapi
- Produk jadi focus utama
- Pakai HP juga bisa ji!

Percaya sama Daeng, foto bagus = jualan laris!`
    },
    {
      keywords: ["social media", "instagram", "tiktok", "facebook", "wa"],
      question: "Platform mana yang cocok untuk jualan?",
      answer: `Bagus mi semua platform ji, tapi ini rekomendasi Daeng:

**Instagram** ⭐⭐⭐⭐⭐
- Paling cocok untuk produk visual (makanan, fashion)
- Story & Reels laku keras
- Hashtag powerful ji

**TikTok** ⭐⭐⭐⭐⭐
- Viral gampang, apalagi konten lucu
- Anak muda banyak disini
- Video pendek, mudah bikin

**Facebook** ⭐⭐⭐⭐
- Grup komunitas aktif
- Marketplace gratis
- Orang tua lebih banyak

**WhatsApp Business** ⭐⭐⭐⭐⭐
- WAJIB punya!
- Katalog produk
- Customer service mudah

Daeng sarankan: Pakai semuanya ji! Posting di semua platform.`
    },
    {
      keywords: ["caption", "copywriting", "konten", "kata-kata"],
      question: "Bagaimana cara menulis caption yang menarik?",
      answer: `Enak ji bikin caption, ikuti cara Daeng:

1. **Opening Kuat** - "Laperrr belum? Coba mi ini!"
2. **Cerita Singkat** - "Resep turun-temurun dari nenek"
3. **Manfaat Produk** - "Enak, halal, bergizi"
4. **Call to Action** - "Order sekarang ya kak!"
5. **Emoji** - Jangan lupa emoji \uD83D\uDD25\uD83D\uDE0B

**Contoh Caption Makassar Style:**
"Ji' laper ka? Cobami Coto Daeng! Enak poll, kuahnya kental, dagingnya empuk. Dari jam 7 pagi sudah buka! 

Harga terjangkau:
- Coto biasa: 15rb
- Coto special: 20rb

Lokasi: Jl. Veteran, depan mesjid
Order: 0812-xxxx-xxxx

#CotoMakassar #KulinerMakassar #UMKM"

Gampang kan? Yang penting jujur dan ramah!`
    },
    {
      keywords: ["harga", "pricing", "mahal", "murah"],
      question: "Bagaimana menentukan harga jual?",
      answer: `Penting ini ji! Jangan sembarangan harga:

**Formula Daeng:**
Harga Jual = (Modal + Biaya Operasional) + Untung 30-40%

**Contoh:**
- Modal bahan: 10.000
- Biaya gas/listrik: 1.000
- Biaya kemasan: 1.000
- Total modal: 12.000
- Untung 30%: 3.600
- **Harga Jual: 15.000 - 16.000**

**Tips:**
1. Survey harga kompetitor dulu
2. Jangan terlalu murah (rugi nanti)
3. Jangan terlalu mahal (sepi pembeli)
4. Quality harus sesuai harga
5. Kasih promo sesekali

Ingat: Harga wajar = Pelanggan setia!`
    },
    {
      keywords: ["promosi", "iklan", "marketing", "jualan laris"],
      question: "Bagaimana cara promosi yang efektif?",
      answer: `Iye mi, promosi penting sekali!

**Strategi Daeng:**

1. **Konten Konsisten** - Posting 2-3x sehari
2. **Giveaway** - Sekali-kali kasih gratisan, viral ji
3. **Testimoni** - Minta review pembeli puas
4. **Kolaborasi** - Kerja sama dengan UMKM lain
5. **Live Streaming** - TikTok Live sambil masak/bikin produk

**Promosi Gratis:**
- Share di grup WA keluarga/teman
- Story Instagram setiap hari
- TikTok video tutorial
- Join komunitas lokal

**Promosi Berbayar:**
- Boost post Instagram (50rb - 200rb)
- Iklan Facebook (mulai 50rb/hari)
- Endorse influencer lokal

Yang penting: **KONSISTEN JI!** Jangan posting 1 minggu terus hilang.`
    },
    {
      keywords: ["customer service", "pelanggan", "komplain", "laporan"],
      question: "Bagaimana menangani komplain pelanggan?",
      answer: `Santai ji, komplain itu biasa. Ini cara Daeng:

**Langkah Handling Komplain:**

1. **Dengarkan Dulu** - Jangan langsung defensif
2. **Minta Maaf** - "Maaf ya kak, ada masalah apa?"
3. **Solusi Cepat** - Ganti/refund/diskon
4. **Follow Up** - "Sudah oke kah kak?"
5. **Belajar** - Perbaiki untuk next time

**Contoh Respons:**
"Maaf sekali kak \uD83D\uDE4F Produknya ada masalah ya? Boleh ki kirim foto? Nanti kita ganti baru atau refund penuh. Customer satisfaction nomor 1 bagi kita!"

**Tips:**
- Balas cepat (max 1 jam)
- Ramah selalu, walau pelanggan kasar
- Kasih kompensasi (voucher/gratis ongkir)
- Jangan argue di komen publik

Ingat: 1 pelanggan puas = 10 pelanggan baru datang!`
    }
  ];
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || undefined;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== undefined) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1;i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1;j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (;i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? undefined : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex);
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== undefined) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? undefined;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers;
    if (value === undefined) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map;
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : undefined;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers;
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  };
  json = (object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response;
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app) {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = undefined;
      try {
        executionContext = c.executionCtx;
      } catch {}
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, undefined, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = (method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  };
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== undefined) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some((k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node;
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some((k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node;
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node;
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0;; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1;i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1;j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== undefined) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== undefined) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(path === "*" ? "" : `^${path.replace(/\/\*$|([.\\+*[^\]$()])/g, (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)")}$`);
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie;
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map((route) => [!/\*|\/:/.test(route[0]), ...route]).sort(([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length;i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (;paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length;i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length;j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length;k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach((p) => re.test(p) && routes[m][p].push([handler, paramCount]));
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length;i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = undefined;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]]));
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
var PreparedRegExpRouter = class {
  name = "PreparedRegExpRouter";
  #matchers;
  #relocateMap;
  constructor(matchers, relocateMap) {
    this.#matchers = matchers;
    this.#relocateMap = relocateMap;
  }
  #addWildcard(method, handlerData) {
    const matcher = this.#matchers[method];
    matcher[1].forEach((list) => list && list.push(handlerData));
    Object.values(matcher[2]).forEach((list) => list[0].push(handlerData));
  }
  #addPath(method, path, handler, indexes, map) {
    const matcher = this.#matchers[method];
    if (!map) {
      matcher[2][path][0].push([handler, {}]);
    } else {
      indexes.forEach((index) => {
        if (typeof index === "number") {
          matcher[1][index].push([handler, map]);
        } else {
          matcher[2][index || path][0].push([handler, map]);
        }
      });
    }
  }
  add(method, path, handler) {
    if (!this.#matchers[method]) {
      const all = this.#matchers[METHOD_NAME_ALL];
      const staticMap = {};
      for (const key in all[2]) {
        staticMap[key] = [all[2][key][0].slice(), emptyParam];
      }
      this.#matchers[method] = [
        all[0],
        all[1].map((list) => Array.isArray(list) ? list.slice() : 0),
        staticMap
      ];
    }
    if (path === "/*" || path === "*") {
      const handlerData = [handler, {}];
      if (method === METHOD_NAME_ALL) {
        for (const m in this.#matchers) {
          this.#addWildcard(m, handlerData);
        }
      } else {
        this.#addWildcard(method, handlerData);
      }
      return;
    }
    const data = this.#relocateMap[path];
    if (!data) {
      throw new Error(`Path ${path} is not registered`);
    }
    for (const [indexes, map] of data) {
      if (method === METHOD_NAME_ALL) {
        for (const m in this.#matchers) {
          this.#addPath(m, path, handler, indexes, map);
        }
      } else {
        this.#addPath(method, path, handler, indexes, map);
      }
    }
  }
  buildAllMatchers() {
    return this.#matchers;
  }
  match = match;
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (;i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length;i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = undefined;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length;i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2;
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length;i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== undefined) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length;i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length;i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length;j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(...this.#getHandlerSets(nextNode.#children["*"], method, node.#params));
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length;k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(...this.#getHandlerSets(child.#children["*"], method, params, node.#params));
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2;
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length;i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter, new TrieRouter]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// src/index.ts
init_supabase();

// src/kolosalai.ts
import OpenAI from "openai";
var KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;
var USE_MOCK = process.env.USE_MOCK_AI === "true";
var client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: "https://api.kolosal.ai/v1"
});
if (!KOLOSAL_API_KEY || KOLOSAL_API_KEY === "your_kolosal_api_key_here") {
  console.error("⚠️  KOLOSAL_API_KEY tidak diset!");
}
console.log("\uD83D\uDD27 Kolosal AI Config:");
console.log("   Model: Llama 4 Maverick");
console.log("   API Key:", KOLOSAL_API_KEY ? "✅ Set" : "❌ Not set");
console.log("   Mock Mode:", USE_MOCK ? "✅ Enabled" : "❌ Disabled");
async function generateCopywriting(request) {
  if (USE_MOCK) {
    console.log("\uD83E\uDDEA Using MOCK mode - generating dynamic copywriting...");
    return generateDynamicMockCopywriting(request);
  }
  try {
    const prompt = buildPrompt(request);
    console.log("\uD83E\uDD16 Generating with Llama 4 Maverick...");
    const completion = await client.chat.completions.create({
      model: "Llama 4 Maverick",
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar membuat konten marketing yang menarik. Kamu bisa menulis dalam berbagai gaya bahasa termasuk bahasa Makassar."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });
    console.log("✅ AI response received");
    const mainText = completion.choices[0].message.content?.trim() || "";
    const alternatives = await generateAlternatives(request, 3);
    return { mainText, alternatives };
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw new Error(error.message || "Gagal generate copywriting");
  }
}
function buildPrompt(request) {
  const { namaProduk, jenisKonten, gayaBahasa, tujuanKonten } = request;
  let styleInstruction = "";
  switch (gayaBahasa.toLowerCase()) {
    case "makassar halus":
      styleInstruction = 'Gunakan bahasa Makassar yang halus dan sopan dengan campuran Indonesia. Contoh: "Enak sekali mi", "Jangan lupa mampir ki ya".';
      break;
    case "daeng friendly":
      styleInstruction = 'Gunakan gaya ramah khas Makassar dengan panggilan "Daeng". Hangat dan akrab. Contoh: "Halo Daeng! Cobai mi menu baru ta".';
      break;
    case "formal":
      styleInstruction = "Gunakan bahasa Indonesia formal yang profesional dan sopan.";
      break;
    case "gen z tiktok":
      styleInstruction = 'Gunakan bahasa Gen Z yang catchy dengan emoji dan istilah viral TikTok. Contoh: "Ga nyobain? Rugi banget sih \uD83D\uDE2D✨".';
      break;
    default:
      styleInstruction = `Gunakan gaya bahasa ${gayaBahasa}.`;
  }
  return `Buatkan ${jenisKonten} untuk produk "${namaProduk}":

Gaya: ${styleInstruction}
Tujuan: ${tujuanKonten}

Buatkan copywriting yang menarik, sesuai gaya, cocok untuk ${jenisKonten}, singkat dan mengajak action.`;
}
async function generateAlternatives(request, count = 3) {
  try {
    const prompt = buildPrompt(request) + `

Berikan ${count} variasi berbeda. Pisahkan dengan "---".`;
    const completion = await client.chat.completions.create({
      model: "Llama 4 Maverick",
      messages: [
        { role: "system", content: "Kamu AI copywriter Makassar. Berikan variasi berbeda." },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 800
    });
    const content = completion.choices[0].message.content?.trim() || "";
    return content.split("---").map((v) => v.trim()).filter((v) => v.length > 0).slice(0, count);
  } catch (error) {
    return [];
  }
}
function generateDynamicMockCopywriting(request) {
  const { namaProduk, jenisKonten, gayaBahasa } = request;
  const templates = getMockTemplates(gayaBahasa, jenisKonten);
  const mainTemplate = templates.main[Math.floor(Math.random() * templates.main.length)];
  const mainText = mainTemplate.replace(/{produk}/g, namaProduk);
  const alternatives = templates.alternatives.map((t) => t.replace(/{produk}/g, namaProduk));
  console.log("✅ Dynamic mock generated:", namaProduk, "-", gayaBahasa);
  return { mainText, alternatives };
}
function getMockTemplates(gayaBahasa, jenisKonten) {
  const style = gayaBahasa.toLowerCase();
  const type = jenisKonten.toLowerCase();
  if (style.includes("makassar")) {
    if (type === "caption" || type === "post") {
      return {
        main: [
          `Assalamualaikum Saudaraku! \uD83D\uDE4F

Enak sekali mi {produk} kami ini! Rasanya istimewa, bikin nagih terus ji. Dibuat dengan resep turun-temurun dan bahan pilihan.

Jangan lupa mampir ki ya! \uD83D\uDE0A

\uD83D\uDCCD Lokasi mudah ditemukan kok
☎️ 0821-xxxx-xxxx

#{produk}Makassar #KulinerMakassar`,
          `Salam sejahtera Saudaraku! ✨

{produk} kita sudah buka mi hari ini! Segar, enak, dan porsinya melimpah. Harga terjangkau, rasa tak terlupakan!

Mari singgah ki, banyak promo menarik! \uD83C\uDF89

#{produk}Enak #MakassarBanget`,
          `Selamat pagi Saudaraku! \uD83C\uDF05

Sudah coba belum {produk} istimewa kami? Bumbu meresap sempurna, tekstur mantap, bikin kenyang dan puas!

Buruan sebelum kehabisan ya! \uD83C\uDFC3‍♂️

#{produk}Makassar #Recommend`
        ],
        alternatives: [
          `Hai Saudaraku! \uD83D\uDC4B

{produk} kita luar biasa. Setiap gigitan penuh kelezatan, setiap suapan bikin bahagia!

Dicoba mi, tidak mengecewakan! ⭐⭐⭐⭐⭐

#{produk} #Yummy #Makassar`,
          `Bismillah! \uD83D\uDD4C

{produk} kami dibuat dengan penuh cinta dan kehati-hatian. Higienis, halal, dan tentunya enak parah!

Tunggu kedatangan mu ya Saudaraku! \uD83E\uDD17

#{produk}Halal #BersihSehat`,
          `Kabar gembira Saudaraku! \uD83C\uDF8A

{produk} terlaris kami hari ini masih tersedia! Rasa original khas Makassar yang autentik. Ga pake MSG, semua natural!

Pesan sekarang ji sebelum kehabisan! \uD83D\uDCF1

#{produk}Asli #Natural`,
          `Siang-siang begini cocok sekali mi makan {produk}! \uD83C\uDF72

Hangat, gurih, bikin kenyang. Sempurna untuk makan siang bersama keluarga!

Yuk mampir, tempat nya nyaman kok! \uD83C\uDFE0

#{produk}LunchTime #KeluargaBahagia`,
          `Mau berbagi cerita nih Saudaraku! \uD83D\uDCAC

{produk} kami sudah dipercaya pelanggan selama bertahun-tahun. Resep rahasia yang tak pernah berubah!

Silakan dicoba, pasti jatuh cinta! \uD83D\uDE0D

#{produk}Legendary #RahasisKeluarga`
        ]
      };
    } else if (type === "story") {
      return {
        main: [
          `*Swipe up untuk lokasi*

{produk} kita lagi ramai nih! \uD83D\uDE0D

Banyak yang bilang enak sekali mi!

Mampir ki ya! ⏰`,
          `Pagi-pagi sudah antre mi! \uD83C\uDF05

{produk} fresh hari ini!
Porsi jumbo ✓
Harga OK ✓
Rasa juara ✓

Yuk buruan! \uD83C\uDFC3‍♀️`
        ],
        alternatives: [
          `UPDATE: Tinggal 10 porsi! ⚠️

{produk} hari ini hampir habis mi!

Siapa cepat dia dapat \uD83C\uDFC3‍♂️`,
          `PROMO HARI INI! \uD83C\uDF89

Beli 2 {produk} dapat 1 gratis minuman!

Sampai jam 12 siang ya! ⏰`
        ]
      };
    }
  } else if (style.includes("daeng")) {
    if (type === "caption" || type === "post") {
      return {
        main: [
          `Halo Daeng-daeng! \uD83D\uDC4B

Ada kabar gembira! {produk} kesukaan Daeng sudah ready loh! Enak parah, bikin nagih terus! \uD83E\uDD24

Yuk mampir Daeng! Kita tunggu! \uD83C\uDFE0

#{produk}DaengKu #MakassarFoodies`,
          `Daengg, udah cobain belum {produk} terbaru ta? \uD83C\uDD95

Rasanya juara, harganya bersahabat sama kantong Daeng! \uD83D\uDCB8

Langsung meluncur aja Daeng! \uD83E\uDE91

#{produk}Mantap`
        ],
        alternatives: [
          `Good morning Daeng! ☀️

{produk} pagi-pagi hangat nih! Cocok banget ditemani kopi atau teh favoritDaeng! ☕

Ayo Daeng, jangan malas-malas! Sudah buka dari jam 7 pagi loh! \uD83D\uDE01

#{produk}Pagi #SarapanDaeng`,
          `Daeng kesayangan \uD83D\uDC96

{produk} nya masih anget-anget nih! Baru keluar dari oven! \uD83D\uDD25

Ditunggu kedatangannya ya Daeng! Ada promo spesial hari ini! \uD83C\uDF89

#{produk}LunchTime #PromoSpesial`,
          `Psssttt Daeng... \uD83E\uDD2B

Mau tahu rahasia {produk} kita yang enak banget? Rahasianya adalah CINTA dan KESABARAN dalam setiap proses!

DM aja ya Daeng kalau mau order! \uD83D\uDCF1

#{produk}Rahasia #MadeWithLove`,
          `Breaking news Daeng! \uD83D\uDCE2

{produk} lagi promo buy 2 get 1 hari ini aja! Limited time offer Daeng!

Buruan sebelum nyesel! Tag teman Daeng sekarang! \uD83D\uDC65

#{produk}Promo #BOGOF`,
          `Daengg, sudah makan siang belum? \uD83E\uDD14

Kalau belum, yuk ke tempat kita! {produk} nya lezat banget, porsinya juga banyak loh!

Ada tempat duduk nyaman, WiFi gratis pula! \uD83E\uDE91\uD83D\uDCF6

#{produk}NyamanBanget #DaengFriendly`
        ]
      };
    }
  } else if (style.includes("gen z") || style.includes("tiktok")) {
    if (type === "caption" || type === "post" || type === "reel" || type === "short") {
      return {
        main: [
          `POV: Kamu lagi scrolling sambil laper parah \uD83E\uDD7A\uD83D\uDE2D

{produk} HITS BANGET SIH!! Ini tuh BUSSIN fr fr! \uD83D\uDD25✨

Harga? AFFORDABLE banget! No debat! \uD83D\uDC85

Yg belum nyobain, are we even friends? \uD83E\uDD28

Tag temen! \uD83D\uDC47
#{produk} #FYP #ViralTikTok`,
          `⚠️ WARNING: Jangan scroll kalau lagi diet! ⚠️

{produk} = COMFORT FOOD tingkat DEWA! \uD83E\uDD29\uD83D\uDE4F

Yang belum cobain, kalian ketinggalan ZAMAN! \uD83D\uDE24

Double tap! ❤️
#{produk} #Viral`,
          `Tell me you're from Makassar without telling me you're from Makassar \uD83D\uDDFA️\uD83D\uDE0E

Me: *shows {produk}* \uD83E\uDD24✨

This is THE moment! Share ke story kamu! \uD83D\uDCF1

#{produk} #MakassarVibes #Foodies`,
          `No cuz why is {produk} so GOOD?! \uD83D\uDE29\uD83D\uDCAF

Literally the best thing I've ever tasted! NO CAP! \uD83E\uDDE2\uD83D\uDE45‍♂️

Go viral bestie! \uD83D\uDE80

#{produk}Obsessed #MakassarFood #Foodgasm`
        ],
        alternatives: [
          `Alexa, cariin {produk} terdekat! \uD83E\uDD16\uD83D\uDC9A

Bro sis, ini LEGEND! Ga nyobain? RUGI SEUMUR HIDUP! \uD83D\uDE2D

#{produk}Legend`,
          `Not me eating {produk} at 3AM \uD83D\uDD50\uD83D\uDE43

It's giving main character vibes ✨\uD83D\uDC85

Comment "NEED"! \uD83D\uDCDD

#{produk}Mood`,
          `Understanding the assignment ✅

{produk}? CHECKED! SLAYED! DEVOURED! \uD83D\uDC51\uD83D\uDD25

Save this post NOW! \uD83D\uDD16

#{produk}Goals #Slay`,
          `The way I GASPED when I tried {produk}! \uD83D\uDE32\uD83E\uDD2F

It's giving everything! Everything! \uD83D\uDC85✨

Who's with me?? \uD83D\uDE4B‍♀️\uD83D\uDE4B‍♂️

#{produk}Moment #Stunner`,
          `This is your sign to try {produk} \uD83E\uDEA7⭐

Seriously, I'm obsessed! It's chef's kiss \uD83D\uDC68‍\uD83C\uDF73\uD83D\uDC8B

Tag someone who needs this! \uD83D\uDCAC\uD83D\uDC47

#{produk}Divine #FoodieLife #MustTry`
        ]
      };
    }
  }
  return {
    main: [
      `{produk} - Cita Rasa Autentik untuk Anda

Kami dengan bangga mempersembahkan {produk} berkualitas premium yang diolah dengan resep tradisional turun-temurun. Setiap sajian menggunakan bahan pilihan terbaik dan melalui standar kebersihan yang ketat.

Nikmati pengalaman kuliner yang memorable bersama keluarga dan rekan bisnis Anda.

Reservasi: 0821-xxxx-xxxx
Alamat: Makassar, Sulawesi Selatan

#{produk} #KulinerIndonesia #HalalFood`,
      `Selamat Datang di {produk}

Menghadirkan keaslian cita rasa kuliner Nusantara dengan sentuhan modern. Kami berkomitmen untuk menyajikan hidangan berkualitas tinggi dengan pelayanan yang profesional dan ramah.

Kunjungi outlet kami atau pesan melalui layanan delivery yang tersedia.

Follow Instagram: @{produk}official
Telepon: 0821-xxxx-xxxx

#{produk} #KualitasTerjamin #PelayananProfesional`,
      `{produk} - Warisan Kuliner yang Terpercaya

Telah melayani ribuan pelanggan dengan tingkat kepuasan maksimal. Setiap hidangan dibuat fresh daily dengan standar food safety internasional.

Tersedia paket untuk berbagai kebutuhan acara Anda.

Operasional: 08.00 - 21.00 WITA
Hubungi: 0821-xxxx-xxxx

#{produk}Makassar #Terpercaya #SejaktahunLalu`,
      `Nikmati Kelezatan {produk} Premium

Diproduksi dengan teknologi modern namun tetap mempertahankan cita rasa tradisional yang autentik. Bahan baku dipilih langsung dari supplier terpercaya.

Dapatkan diskon 10% untuk pemesanan pertama!

Info & Pemesanan:
WhatsApp: 0821-xxxx-xxxx
Delivery Area: Seluruh Makassar

#{produk}Premium #Diskon #DeliveryAvailable`
    ],
    alternatives: [
      `{produk} - Pilihan Tepat untuk Setiap Momen

Menu variatif dengan cita rasa yang konsisten. Harga kompetitif tanpa mengurangi kualitas.

Fasilitas:
✓ Ruang ber-AC
✓ WiFi gratis
✓ Parkir luas
✓ Musholla

Informasi lengkap: WA 0821-xxxx-xxxx

#{produk}Recommended #FasilitasLengkap`,
      `Promo Special {produk}

Dapatkan paket hemat untuk keluarga dengan harga yang sangat terjangkau. Kualitas tetap terjaga, rasa tetap istimewa!

Paket tersedia:
• Paket Keluarga (4-6 orang)
• Paket Meeting (10 orang)
• Paket Acara (custom)

Pesan sekarang: 0821-xxxx-xxxx

#{produk}Promo #PaketHemat`,
      `{produk} Terpercaya Sejak 1990

Pengalaman lebih dari 30 tahun melayani masyarakat Makassar. Kualitas konsisten, pelayanan memuaskan.

Testimoni pelanggan:
"Rasa yang tak pernah berubah!" ⭐⭐⭐⭐⭐
"Tempat favorit keluarga" ⭐⭐⭐⭐⭐

Kontak: 0821-xxxx-xxxx

#{produk}LegendaryTaste #PelangganSetia`,
      `Mencari Tempat Makan Berkualitas?

{produk} adalah solusi tepat untuk Anda. Kami menyediakan berbagai pilihan menu dengan standar hygiene tinggi.

Layanan:
✓ Dine-in
✓ Take away
✓ Delivery
✓ Catering untuk acara

Reservasi & Info: 0821-xxxx-xxxx

#{produk}Service #MultiLayanan`,
      `{produk} - Experience the Difference

Perpaduan sempurna antara tradisi dan inovasi. Setiap hidangan diciptakan untuk memberikan pengalaman kuliner yang tak terlupakan.

Buka setiap hari pukul 08.00 - 22.00 WITA

Kunjungi kami di:
Jl. [Alamat], Makassar
Telp: 0821-xxxx-xxxx

#{produk}Experience #Innovation`
    ]
  };
}

// src/ai-content-studio.ts
import OpenAI2 from "openai";
var KOLOSAL_API_KEY2 = process.env.KOLOSAL_API_KEY;
var USE_MOCK2 = process.env.USE_MOCK_AI === "true";
var client2 = new OpenAI2({
  apiKey: KOLOSAL_API_KEY2,
  baseURL: "https://api.kolosal.ai/v1"
});
console.log("\uD83C\uDFA8 AI Content Studio Config:");
console.log("   Model: Llama 4 Maverick");
console.log("   API Key:", KOLOSAL_API_KEY2 ? "✅ Set" : "❌ Not set");
console.log("   Mock Mode:", USE_MOCK2 ? "✅ Enabled" : "❌ Disabled");
async function generateAIContent(request) {
  if (USE_MOCK2) {
    console.log(`\uD83E\uDDEA MOCK: Generating ${request.type}...`);
    return generateMockContent(request);
  }
  try {
    const prompt = buildPromptByType(request);
    console.log(`\uD83E\uDD16 Generating ${request.type} with Llama 4 Maverick...`);
    const completion = await client2.chat.completions.create({
      model: "Llama 4 Maverick",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(request.type)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: getTemperatureByType(request.type),
      max_tokens: 1500,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    const outputText = completion.choices[0].message.content?.trim() || "";
    console.log(`✅ ${request.type} generated successfully`);
    return {
      type: request.type,
      inputText: request.inputText,
      outputText,
      metadata: request.metadata || {}
    };
  } catch (error) {
    console.error(`❌ Error generating ${request.type}:`, error.message);
    throw new Error(`Gagal generate ${request.type}: ${error.message}`);
  }
}
function getSystemPrompt(type) {
  const prompts = {
    caption: "Kamu adalah AI copywriter expert untuk UMKM kuliner Makassar. Kamu SANGAT kreatif dan selalu menghasilkan caption yang BERBEDA setiap kali. Kamu memahami psikologi konsumen lokal, tren viral TikTok/Instagram, dan budaya Makassar. Gunakan storytelling yang emotional, data lokal yang spesifik, dan call-to-action yang kuat. JANGAN gunakan template generik - setiap caption harus UNIK dan FRESH!",
    promo: "Kamu adalah AI marketing strategist dengan pengalaman 10+ tahun di UMKM kuliner. Kamu expert dalam consumer psychology, scarcity principle, social proof, dan viral marketing. Setiap promo yang kamu buat HARUS berbeda dan menggunakan strategi unik seperti: limited-time offers, bundle deals, loyalty programs, flash sales, kolaborasi influencer lokal, atau gamification. Fokus pada behavior triggers yang membuat orang ACTION sekarang!",
    branding: "Kamu adalah AI brand strategist tingkat expert yang memahami positioning strategy, brand archetype, value proposition, dan competitive differentiation. Kamu bisa menganalisis pasar Makassar, kompetitor lokal, dan cultural insights untuk menciptakan brand identity yang UNIK dan MEMORABLE. Berikan analisa mendalam dengan contoh konkrit, referensi brand sukses, dan actionable steps. Fokus pada emotional branding dan local pride!",
    planner: "Kamu adalah AI content strategist expert dengan deep understanding tentang content pillars, customer journey mapping, engagement metrics, dan platform algorithms (Instagram, TikTok, Facebook). Buat content calendar yang strategic dengan variasi format (Reels, Carousel, Story, Live), timing optimal berdasarkan behavior audience Makassar, dan content mix yang balance (educational, entertaining, promotional, UGC). Setiap plan harus include KPIs dan reasoning!",
    copywriting: "Kamu adalah AI master copywriter dengan expertise dalam persuasive writing frameworks: AIDA, PAS (Problem-Agitate-Solve), FAB (Features-Advantages-Benefits), storytelling hooks, dan neuro-linguistic programming. Kamu bisa menulis dalam bahasa Makassar autentik (bukan template), bahasa gaul Makassar Gen Z, dan formal sesuai konteks. Setiap copywriting HARUS menggunakan sensory words, social proof, dan urgency triggers yang spesifik untuk kultur lokal!",
    pricing: "Kamu adalah AI financial strategist dan pricing expert untuk UMKM. Kamu memahami: cost-plus pricing, value-based pricing, competitive pricing, psychological pricing (charm pricing, prestige pricing), dan dynamic pricing. Analisa break-even point, profit margins, price elasticity, dan positioning strategy. Berikan rekomendasi pricing dengan justifikasi detail, perbandingan kompetitor Makassar, dan strategi penetrasi pasar yang actionable!",
    reply: "Kamu adalah AI customer service excellence trainer dengan expertise dalam empathetic communication, de-escalation techniques, solution-focused responses, dan relationship building. Setiap reply harus: (1) Acknowledge perasaan customer, (2) Provide solution/info yang jelas, (3) Add personal touch khas Makassar, (4) End with positive note. Sesuaikan tone: ramah untuk inquiry, empati untuk komplain, profesional untuk bisnis. Hindari template robot - be HUMAN!",
    comment: "Kamu adalah AI data analyst expert dalam sentiment analysis, text mining, customer insights extraction, dan trend prediction. Analisa DEEP: sentiment score (1-10), emotion detection (happy/angry/sad/excited), pain points, buying intent, customer personas, dan action items. Berikan: (1) Summary ringkas, (2) Key insights dengan quote spesifik, (3) Prioritized action steps, (4) Suggested reply template, (5) Business improvement recommendations. Think like a business consultant!"
  };
  return prompts[type];
}
function buildPromptByType(request) {
  const { type, inputText, metadata } = request;
  switch (type) {
    case "caption":
      return buildCaptionPrompt(inputText, metadata);
    case "promo":
      return buildPromoPrompt(inputText, metadata);
    case "branding":
      return buildBrandingPrompt(inputText, metadata);
    case "planner":
      return buildPlannerPrompt(inputText, metadata);
    case "copywriting":
      return buildCopywritingPrompt(inputText, metadata);
    case "pricing":
      return buildPricingPrompt(inputText, metadata);
    case "reply":
      return buildReplyPrompt(inputText, metadata);
    case "comment":
      return buildCommentPrompt(inputText, metadata);
    default:
      return inputText;
  }
}
function buildCaptionPrompt(inputText, metadata) {
  const topik = metadata?.topik || inputText;
  const tone = metadata?.tone || "Santai";
  const platform = metadata?.platform || "Instagram";
  const includeHashtags = metadata?.includeHashtags !== false;
  const frameworks = [
    "Hook + Story + CTA",
    "Problem + Agitate + Solution",
    "Question + Answer + Action",
    "FOMO + Social Proof + Urgency",
    "Behind the Scenes + Value + Invitation"
  ];
  const randomFramework = frameworks[Math.floor(Math.random() * frameworks.length)];
  return `Buat caption UNIK untuk ${platform} tentang: "${topik}"

KONTEKS PENTING:
- Target: UMKM kuliner Makassar
- Tone: ${tone}
- Platform: ${platform}
- Framework: Gunakan pendekatan "${randomFramework}"

INSTRUKSI KREATIF:
1. Opening HOOK yang bikin berhenti scroll (jangan generic!)
2. Ceritakan dengan storytelling yang emotional & relatable
3. Gunakan sensory words (rasa, aroma, tekstur) yang spesifik
4. Include social proof atau testimoni singkat jika relevan
5. Closing dengan CTA yang kuat (comment/share/visit)
6. Sesuaikan bahasa dengan kultur Makassar (bisa campur lokal words)
7. ${includeHashtags ? "Tambahkan 8-12 hashtag strategi: mix populer + niche + branded" : "Tanpa hashtag"}

CONTOH VARIASI OPENING HOOKS:
- "Pagi ini kami hampir kehabisan stok..." (Scarcity)
- "Ada yang tanya kenapa ${topik} kami beda..." (Curiosity)  
- "3 tahun lalu, kami mulai dari..." (Story)
- "Pelanggan: 'Ini enak banget!'" (Social proof)

OUTPUT: Buat caption yang BENAR-BENAR BERBEDA dari biasanya!

Format:
\uD83D\uDD25 CAPTION ${platform.toUpperCase()}

[Caption siap post - 150-250 kata]

${includeHashtags ? `
\uD83D\uDCCC HASHTAGS:
[Hashtag strategy dengan reasoning]` : ""}`;
}
function buildPromoPrompt(inputText, metadata) {
  const namaProduk = metadata?.namaProduk || inputText;
  const discount = metadata?.discount || "20%";
  const targetAudience = metadata?.targetAudience || "Umum";
  const strategies = [
    "Flash Sale + Countdown Timer",
    "Buy 1 Get 1 + Limited Stock",
    "Bundle Deal + Free Shipping",
    "Loyalty Reward + Gamification",
    "Kolaborasi Influencer Lokal + Giveaway",
    "Payday Special + Cashback"
  ];
  const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
  return `Buat KONSEP PROMO KREATIF untuk: "${namaProduk}"

BRIEF:
- Diskon/Promo: ${discount}
- Target: ${targetAudience}
- Lokasi: Makassar
- Strategi Unik: ${randomStrategy}

CHALLENGE: Buat promo yang VIRAL & MENGHASILKAN PENJUALAN!

REQUIREMENTS:
1. **JUDUL PROMO** yang bikin FOMO (Fear of Missing Out)
   - Gunakan power words: GRATIS, EKSKLUSIF, HARI INI, TERBATAS
   - Angka spesifik (Diskon 47% lebih menarik dari 50%)

2. **CAPTION PROMO** (200-300 kata) yang include:
   - Opening hook yang shocking/surprising
   - Benefit jelas untuk customer
   - Social proof (testimoni/sold out history)
   - Urgency triggers (limited time/stock)
   - Clear instructions cara ikutan promo
   - Multiple CTAs (Order/Share/Tag)

3. **STRATEGI EKSEKUSI** yang actionable:
   - Timing optimal post (hari + jam)
   - Platform prioritas (IG/FB/TikTok/WA)
   - Content format (carousel/video/story)
   - Kolaborasi potential (influencer/komunitas Makassar)

4. **PROMO MECHANICS** yang clear:
   - Syarat & ketentuan simple
   - Cara claim/redeem
   - Duration specific

5. **SUCCESS METRICS** untuk track:
   - Target sales/orders
   - Engagement expected

PENTING: Jangan buat promo generik! Sesuaikan dengan culture & behavior audience Makassar!

Format output:
\uD83D\uDCE2 KONSEP PROMO VIRAL

\uD83D\uDD25 [JUDUL PROMO]

\uD83D\uDCDD CAPTION:
[Full caption siap post]

⚡ STRATEGI EKSEKUSI:
[Step-by-step implementation]

\uD83D\uDCCA SUCCESS METRICS:
[KPIs to track]`;
}
function buildBrandingPrompt(inputText, metadata) {
  const sloganSekarang = metadata?.sloganSekarang || "";
  const brandPersona = metadata?.brandPersona || inputText;
  const toneOfVoice = metadata?.toneOfVoice || "Makassar Friendly";
  return `Bantu analisis dan kembangkan branding untuk UMKM dengan detail:

${sloganSekarang ? `Slogan Sekarang: ${sloganSekarang}` : "Belum punya slogan"}
Brand Persona: ${brandPersona}
Tone of Voice: ${toneOfVoice}

Buatkan rekomendasi branding yang meliputi:

Format output:
\uD83C\uDFA8 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
[3 pilihan slogan yang memorable dan sesuai persona]

\uD83C\uDFA8 REKOMENDASI WARNA:
[3 warna dengan kode hex dan psikologi warnanya]

\uD83D\uDCD6 STORYTELLING BRAND:
[Cerita brand yang emotional dan relatable untuk Makassar]

\uD83D\uDC64 KARAKTER BRAND PERSONA:
[Deskripsi karakter brand yang konsisten]`;
}
function buildPlannerPrompt(inputText, metadata) {
  const temaMingguan = metadata?.temaMingguan || inputText;
  const durasi = metadata?.durasi || "7";
  return `Buatkan content planner untuk social media dengan:

Tema: ${temaMingguan}
Durasi: ${durasi} hari

Buatkan jadwal konten yang:
- Seimbang antara konten edukasi, hiburan, dan promosi (80:20 ratio)
- Berdasarkan best practice posting time untuk audience Makassar
- Mencakup berbagai format (foto, video, story, carousel, reels)
- Mengikuti prinsip content marketing yang efektif

Format output:
\uD83D\uDCC5 JADWAL KONTEN (${durasi} HARI)
Tema: ${temaMingguan}

[Untuk setiap hari, tulis:]
✅ Hari [X] ([Format Konten]): [Judul/Ide konten singkat]
   ⏰ Waktu posting terbaik: [Jam WITA]
   \uD83C\uDFAF Tujuan: [Engagement/Edukasi/Selling]

\uD83D\uDCA1 TIPS EKSEKUSI:
[Strategi tambahan untuk memaksimalkan engagement]`;
}
function buildCopywritingPrompt(inputText, metadata) {
  const namaProduk = metadata?.namaProduk || inputText;
  const jenisKonten = metadata?.jenisKonten || "Caption";
  const tujuanKonten = metadata?.tujuanKonten || "Jualan";
  const gayaBahasa = metadata?.gayaBahasa || "Makassar Halus";
  let styleInstruction = "";
  switch (gayaBahasa.toLowerCase()) {
    case "makassar halus":
      styleInstruction = 'Gunakan bahasa Makassar yang halus dan sopan dengan campuran Indonesia. Contoh: "Enak sekali mi", "Jangan lupa mampir ki ya".';
      break;
    case "daeng friendly":
      styleInstruction = 'Gunakan gaya ramah khas Makassar dengan panggilan "Daeng". Hangat dan akrab. Contoh: "Halo Daeng! Cobai mi menu baru ta".';
      break;
    case "formal":
      styleInstruction = "Gunakan bahasa Indonesia formal yang profesional dan sopan.";
      break;
    case "gen z tiktok":
      styleInstruction = 'Gunakan bahasa Gen Z yang catchy dengan emoji dan istilah viral TikTok. Contoh: "Ga nyobain? Rugi banget sih \uD83D\uDE2D✨".';
      break;
    default:
      styleInstruction = `Gunakan gaya bahasa ${gayaBahasa}.`;
  }
  return `Buatkan ${jenisKonten} untuk produk "${namaProduk}":

Gaya: ${styleInstruction}
Tujuan: ${tujuanKonten}

Buatkan copywriting yang:
- Menarik dan sesuai gaya
- Cocok untuk ${jenisKonten}
- Singkat, padat, dan mengajak action
- Sesuai dengan tujuan ${tujuanKonten}

Format output:
\uD83D\uDCDD COPYWRITING (Tujuan: ${tujuanKonten})

[Copywriting lengkap siap pakai dengan emoji yang sesuai]

✨ ALTERNATIF:
[Berikan 2 variasi berbeda dengan gaya yang sama]`;
}
function buildPricingPrompt(inputText, metadata) {
  const namaProduk = metadata?.namaProduk || inputText;
  const cost = metadata?.cost || metadata?.modalHPP || 0;
  const targetProfit = metadata?.targetProfit || metadata?.targetUntung || 30;
  const competitorPrice = metadata?.competitorPrice || metadata?.hargaKompetitor || 0;
  const methods = [
    "Cost-Plus + Psychological Pricing",
    "Value-Based + Competitive Analysis",
    "Penetration Strategy + Market Share Focus",
    "Premium Positioning + Brand Value",
    "Dynamic Pricing + Demand-Based"
  ];
  const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
  return `Lakukan ANALISA PRICING STRATEGY MENDALAM untuk: "${namaProduk}"

\uD83D\uDCCA DATA FINANSIAL:
- HPP/Cost: Rp ${cost.toLocaleString("id-ID")}
- Target Profit Margin: ${targetProfit}%
${competitorPrice > 0 ? `- Harga Kompetitor: Rp ${competitorPrice.toLocaleString("id-ID")}` : "- Data kompetitor: Perlu research"}
- Market: UMKM Kuliner Makassar
- Metode Analisa: ${selectedMethod}

TUGAS ANALISA LENGKAP:

1. **KALKULASI DETAIL** (Harus accurate!)
   - Break-even price (HPP + 0% margin)
   - Cost-plus target (HPP + ${targetProfit}% margin)
   - Harga psikologis optimal (charm pricing: 9.900 vs 10.000)
   - Bundling price suggestions
   - Volume discount structure

2. **COMPETITIVE INTELLIGENCE**
   ${competitorPrice > 0 ? `
   - Gap analysis vs kompetitor (Rp ${competitorPrice.toLocaleString("id-ID")})
   - Positioning: Above/At/Below kompetitor?
   - Value differentiation yang justify price difference` : `
   - Research kompetitor Makassar serupa
   - Estimasi range harga market
   - Sweet spot positioning`}

3. **MARKET CONTEXT MAKASSAR**
   - Daya beli segmen target (mahasiswa/pekerja/keluarga)
   - Price sensitivity untuk produk ini
   - Cultural pricing (angka favorit: 8, 9, 88, 99)
   - Seasonal pricing opportunities (Ramadhan, weekends, payday)

4. **STRATEGI MAKSIMALKAN REVENUE**
   - Paket bundling (1+1, family pack, catering)
   - Upselling strategy (add-ons, premium version)
   - Cross-selling items
   - Loyalty program pricing tier
   - Early bird / happy hour pricing

5. **IMPLEMENTATION PLAN**
   - Phase 1: Launch pricing (penetration/premium?)
   - Phase 2: Regular pricing
   - Phase 3: Promotional pricing calendar
   - A/B testing suggestions (test 2-3 price points)

6. **RISK & OPPORTUNITY ANALYSIS**
   - Risk pricing terlalu tinggi
   - Risk pricing terlalu rendah (devaluasi brand)
   - Sweet spot range dengan reasoning
   - Contingency plan jika harga tidak work

Output dalam format:
\uD83D\uDCB0 PRICING STRATEGY ANALYSIS

\uD83D\uDCCA REKOMENDASI HARGA (3 Skenario):
[Berikan 3 opsi: Aggressive/Standard/Premium dengan pros-cons]

\uD83D\uDCC8 BREAKDOWN FINANSIAL:
[Tabel detail kalkulasi]

\uD83C\uDFAF POSITIONING STRATEGY:
[Strategic reasoning + competitive advantage]

\uD83D\uDE80 IMPLEMENTATION ROADMAP:
[Timeline eksekusi 3 bulan]

\uD83D\uDCA1 PRO TIPS PRICING MAKASSAR:
[Insights spesifik lokal yang actionable]`;
}
function buildReplyPrompt(inputText, metadata) {
  const pesanPelanggan = metadata?.pesanPelanggan || inputText;
  const nadaBalasan = metadata?.nadaBalasan || "Ramah & Membantu";
  return `Buatkan balasan customer service untuk pesan pelanggan berikut:

PESAN PELANGGAN:
"${pesanPelanggan}"

NADA BALASAN: ${nadaBalasan}

Buatkan balasan yang:
- Sesuai dengan nada "${nadaBalasan}"
- Empati dan solutif
- Profesional namun tetap friendly
- Mengandung action/solusi konkret
- Mempertahankan customer relationship

Format output:
\uD83D\uDCAC REKOMENDASI BALASAN:

[Balasan lengkap siap kirim dengan emoji yang sesuai]

\uD83D\uDCA1 ANALISIS SITUASI:
[Penjelasan singkat situasi dan mengapa balasan ini efektif]`;
}
function buildCommentPrompt(inputText, metadata) {
  const comment = metadata?.komentarPelanggan || inputText;
  return `Lakukan ANALISA MENDALAM terhadap komentar customer ini:

\uD83D\uDCAC KOMENTAR:
"${comment}"

TUGAS: Analisa seperti seorang BUSINESS ANALYST & CUSTOMER SUCCESS MANAGER!

ANALISA YANG HARUS DILAKUKAN:

1. **SENTIMENT ANALYSIS** (Detailed!)
   - Overall sentiment: Positif/Netral/Negatif (dengan score 1-10)
   - Emotion detected: Happy/Angry/Disappointed/Excited/Confused
   - Urgency level: Low/Medium/High/Critical
   - Customer lifecycle stage: New/Regular/Loyal/Churning

2. **DEEP INSIGHTS EXTRACTION**
   - Pain points mentioned (spesifik!)
   - Expectations vs reality gap
   - Buying intent signals
   - Recommendation likelihood
   - Competitor mentions
   - Cultural/local context (Makassar specific)

3. **KEY QUOTES & THEMES**
   - Quote 2-3 kalimat penting dari comment
   - Main themes/topics
   - Keywords yang sering muncul

4. **BUSINESS IMPLICATIONS**
   - Impact ke brand reputation (positive/negative/neutral)
   - Revenue opportunity (upsell/cross-sell potential)
   - Churn risk assessment
   - Product/service improvement insights
   - Competitive advantage/disadvantage revealed

5. **PRIORITIZED ACTION ITEMS**
   - Immediate actions (24 hours)
   - Short-term actions (1 week)
   - Long-term improvements (1 month+)
   - Who should handle this? (owner/CS/chef/marketing)

6. **RESPONSE STRATEGY**
   - Recommended tone: Empathetic/Professional/Friendly/Apologetic
   - Key points to address dalam reply
   - Do's and Don'ts
   - 2 alternative reply drafts (formal & casual Makassar style)

7. **SIMILAR PATTERN DETECTION**
   - Apakah ini one-off issue atau pattern?
   - Red flags untuk monitor
   - Opportunities untuk leverage (jika positif)

Format output:
\uD83D\uDD0D COMPREHENSIVE COMMENT ANALYSIS

\uD83D\uDCCA SENTIMENT BREAKDOWN:
[Detail scoring + reasoning]

\uD83C\uDFAF KEY INSIGHTS:
[Bullet points penting dengan quotes]

⚡ PRIORITY ACTIONS:
[Ranked by urgency + impact]

\uD83D\uDCAC RESPONSE TEMPLATES:

**Option 1 (Formal):**
[Balasan profesional]

**Option 2 (Makassar Friendly):**
[Balasan hangat khas Makassar]

\uD83D\uDCA1 BUSINESS RECOMMENDATIONS:
[Strategic suggestions untuk prevent/leverage]`;
}
function getTemperatureByType(type) {
  const temperatures = {
    caption: 0.95,
    promo: 0.9,
    branding: 0.85,
    planner: 0.75,
    copywriting: 0.95,
    pricing: 0.7,
    reply: 0.8,
    comment: 0.75
  };
  return temperatures[type];
}
function generateMockContent(request) {
  const { type, inputText, metadata } = request;
  const mockOutputs = {
    caption: `\uD83D\uDD25 CAPTION INSTAGRAM SIAP PAKAI \uD83D\uDD25

Halo Daeng! \uD83D\uDC4B Sudah coba menu baru kami? Rasanya bikin nagih! \uD83E\uDD24
Cocok banget buat makan siang bareng teman kantor.

\uD83D\uDCCD Lokasi: Jl. Pettarani No. 10
\uD83D\uDEF5 Tersedia di GrabFood & GoFood

Yuk buruan mampir sebelum kehabisan! 

#KulinerMakassar #MakassarDagang #Ewako #CotoMakassar #JajananMakassar`,
    promo: `\uD83D\uDCE2 KONSEP PROMO SIAP POST!

\uD83D\uDD25 JUDUL PROMO: GAJIAN TIBA? WAKTUNYA MAKAN ENAK TANPA PUSING!

\uD83D\uDCDD CAPTION:
Habis gajian jangan langsung habis cika'! \uD83D\uDE02
Mending ke sini, makan kenyang hati senang.

Khusus buat Pegawai Kantor & Mahasiswa, tunjukkan ID Card kalian dan dapatkan DISKON 20% untuk semua menu Paket!

Buruan nah, cuma berlaku 3 hari! \uD83C\uDFC3\uD83D\uDCA8

⏰ WAKTU TERBAIK POST: Pukul 11:30 WITA (sebelum jam makan siang)

\uD83D\uDCA1 TIPS TAMBAHAN: 
- Posting di story IG jam 8 pagi untuk reminder
- Share di grup WA kantor/kampus
- Buat countdown timer untuk urgency`,
    branding: `\uD83C\uDFA8 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
1. "Rasa Sultan, Harga Teman - Ewako!"
2. "Dari Hati Makassar, Untuk Perut Indonesia"
3. "Authentik. Enak. Terjangkau."

\uD83C\uDFA8 REKOMENDASI WARNA:
- Merah Marun (#800000) → Berani, nafsu makan, tradisional
- Kuning Emas (#FFD700) → Mewah tapi ceria, optimis
- Hitam (#000000) → Elegan, premium, modern

\uD83D\uDCD6 STORYTELLING BRAND:
"Berawal dari resep rahasia Nenek di lorong sempit Makassar tahun 1990, kami membawa cita rasa otentik yang tidak pernah berubah. Setiap suapan adalah perjalanan ke masa lalu, ke kehangatan keluarga Makassar."

\uD83D\uDC64 KARAKTER BRAND PERSONA:
"Si Daeng yang Ramah, Humoris, tapi Sangat Menghargai Tradisi. Bicara santai tapi tahu sopan santun. Seperti tetangga yang selalu siap berbagi cerita sambil makan bersama."`,
    planner: `\uD83D\uDCC5 JADWAL KONTEN (7 HARI)
Tema: Kuliner Makassar

✅ Hari 1 (Video Reel): 'Behind The Scene' proses pembuatan bumbu rahasia
   ⏰ Waktu posting: 18:00 WITA
   \uD83C\uDFAF Tujuan: Edukasi & Trust Building

✅ Hari 2 (Carousel): Repost testimoni pelanggan yang paling lucu
   ⏰ Waktu posting: 12:00 WITA
   \uD83C\uDFAF Tujuan: Social Proof

✅ Hari 3 (Story + Post): Tebak-tebakan bahasa Makassar berhadiah voucher
   ⏰ Waktu posting: 15:00 WITA
   \uD83C\uDFAF Tujuan: Engagement

✅ Hari 4 (Foto HD): Produk close-up yang bikin ngiler
   ⏰ Waktu posting: 11:00 WITA
   \uD83C\uDFAF Tujuan: Soft Selling

✅ Hari 5 (Story + Post): Promo 'Jumat Berkah' diskon khusus
   ⏰ Waktu posting: 08:00 WITA
   \uD83C\uDFAF Tujuan: Hard Selling

✅ Hari 6 (Carousel Edukasi): Tips makan Coto biar makin enak ala Daeng
   ⏰ Waktu posting: 16:00 WITA
   \uD83C\uDFAF Tujuan: Value Content

✅ Hari 7 (Quote Card): Motivasi usaha anak muda Makassar
   ⏰ Waktu posting: 09:00 WITA
   \uD83C\uDFAF Tujuan: Inspirasi & Community

\uD83D\uDCA1 TIPS EKSEKUSI:
- Gunakan Reels untuk konten edukatif (algoritma prioritas)
- Selalu reply komentar dalam 1 jam pertama
- Cross-posting ke TikTok & Facebook untuk jangkauan lebih luas`,
    copywriting: `\uD83D\uDCDD COPYWRITING (Tujuan: Jualan)

POV: Kamu nemu produk lokal yang kualitasnya impor! \uD83D\uDE31✨

Sumpah ini barang mantap sekali cika'. ${metadata?.namaProduk || inputText} ini solusinya buat kamu yang mau tampil beda.

Keunggulannya:
✅ Kualitas Premium
✅ Harga Terjangkau
✅ Asli Anak Makassar

Order sekarang sebelum kehabisan stok! Klik link di bio nah. \uD83D\uDC47

✨ ALTERNATIF:

VARIASI 1:
Eh Daeng! Tau nda' kalo ${metadata?.namaProduk || inputText} kita ini sudah jadi favorit pelanggan setia? \uD83D\uDD25

Rahasianya? Simple ji:
- Bahan berkualitas
- Harga bersahabat
- Pelayanan cepat

Yuk cobai sebelum terlambat! DM aja langsung \uD83D\uDCF1

VARIASI 2:
Breaking News! \uD83D\uDCE2

${metadata?.namaProduk || inputText} yang viral di TikTok sekarang bisa dibeli di Makassar! 

Limited stock, siapa cepat dia dapat!
Grab yours NOW! \uD83C\uDFC3‍♂️\uD83D\uDCA8

#MakassarLokalPride`,
    pricing: `\uD83D\uDCCA ANALISIS HARGA:

\uD83D\uDCB0 Modal (HPP): Rp ${metadata?.modalHPP?.toLocaleString("id-ID") || "15.000"}
\uD83D\uDCC8 Rekomendasi Harga Jual: Rp 25.000 - Rp 28.000
✅ Margin Keuntungan: 40% - 46%

\uD83D\uDCA1 STRATEGI PRICING:
1. **Harga Psikologis**: Gunakan Rp 24.999 atau Rp 27.999 (terlihat lebih murah)
2. **Tier Pricing**: 
   - Regular: Rp 25.000
   - Jumbo: Rp 35.000 (margin lebih besar)
3. **Bundle Deal**: Beli 3 hanya Rp 70.000 (dari Rp 75.000)

⚠️ CATATAN:
- Harga ini sudah kompetitif untuk market Makassar
- Pastikan packaging mendukung perceived value
- Monitor biaya operasional (listrik, gas, gaji) setiap bulan
- Evaluasi harga setiap 3 bulan mengikuti inflasi bahan baku`,
    reply: `\uD83D\uDCAC REKOMENDASI BALASAN:

"Halo Kak, terima kasih sudah menghubungi kami! \uD83D\uDE4F

Mohon maaf atas ketidaknyamanannya. Boleh kami tahu detail masalahnya atau nomor pesanan Kakak supaya kami bantu cek statusnya segera? 

Kami pastikan masalah ini akan ditangani dengan cepat. Terima kasih atas kesabarannya ya Kak \uD83D\uDE0A

Salam hangat,
Tim [Nama Bisnis]"

\uD83D\uDCA1 ANALISIS SITUASI:
Pesan ini efektif karena:
- Menunjukkan empati langsung
- Menawarkan solusi konkret (cek nomor pesanan)
- Menggunakan bahasa yang ramah namun profesional
- Menutup dengan harapan positif
- Mencantumkan signature untuk personal touch`,
    comment: `\uD83D\uDD0D ANALISA KOMENTAR:

\uD83D\uDCCA SENTIMEN: NEGATIF \uD83D\uDD34

⚠️ MASALAH UTAMA: 
- Pelayanan lambat (respon customer service)
- Pesanan salah/tidak sesuai ekspektasi
- Kemungkinan kecewa dengan kualitas vs harga

\uD83D\uDCA1 REKOMENDASI TINDAKAN:
1. **SEGERA** reply komentar secara personal (jangan generic)
2. **Minta maaf** dengan tulus dan akui kesalahan
3. **Tawarkan kompensasi** (voucher/diskon/refund)
4. **Follow up via DM** untuk privasi
5. **Internal review** proses yang bermasalah

\uD83D\uDCAC AUTO-REPLY SUGGESTION:
"Tabe' Kak, mohon maaf sekali atas ketidaknyamanannya \uD83D\uDE4F 

Ini bukan standar pelayanan kami dan kami sangat menyesal. Boleh kami DM untuk ganti rugi dan pastikan hal ini tidak terulang lagi? 

Terima kasih masukannya, ini sangat membantu kami berkembang.

Hormat kami,
[Nama Bisnis]"

⚡ URGENCY LEVEL: TINGGI - Handle dalam 1 jam!`
  };
  return {
    type,
    inputText,
    outputText: mockOutputs[type],
    metadata: metadata || {}
  };
}

// src/index.ts
init_visual_studio();

// src/telegram-bot.ts
init_supabase();
init_dapur_umkm();
import TelegramBot from "node-telegram-bot-api";
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
var bot = TELEGRAM_BOT_TOKEN ? new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true }) : null;
var authorizedUsers = {};
function initTelegramBot() {
  if (!bot) {
    console.warn("⚠️ Telegram Bot Token not configured. Bot disabled.");
    return;
  }
  console.log("\uD83E\uDD16 Telegram Bot started...");
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `
\uD83C\uDFEA *Selamat datang di TABE AI Bot!*

Bot ini membantu Boss UMKM untuk:
• \uD83D\uDCCA Lihat laporan keuangan
• \uD83D\uDCDD Kirim evaluasi ke tim
• \uD83D\uDCB0 Cek ringkasan bisnis

*Cara pakai:*
1. Login dulu: /login [kode_bisnis]
2. Lihat menu: /menu

_Contoh: /login ABC123_
    `, { parse_mode: "Markdown" });
  });
  bot.onText(/\/login (.+)/, async (msg, match2) => {
    const chatId = msg.chat.id;
    const profileId = match2?.[1]?.trim();
    if (!profileId) {
      await bot.sendMessage(chatId, "❌ Format salah! Gunakan: /login [kode_bisnis]");
      return;
    }
    const { data: profile, error } = await supabase.from("umkm_profiles").select("*").eq("id", profileId).single();
    if (error || !profile) {
      await bot.sendMessage(chatId, "❌ Kode bisnis tidak valid! Hubungi admin untuk mendapat kode.");
      return;
    }
    authorizedUsers[chatId] = profileId;
    await bot.sendMessage(chatId, `
✅ *Login Berhasil!*

Bisnis: ${profile.business_name}
Kategori: ${profile.category}

Gunakan /menu untuk lihat opsi yang tersedia.
    `, { parse_mode: "Markdown" });
  });
  bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    if (!authorizedUsers[chatId]) {
      await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
      return;
    }
    const keyboard = {
      keyboard: [
        [{ text: "\uD83D\uDCCA Laporan Bulan Ini" }, { text: "\uD83D\uDCB0 Ringkasan Bisnis" }],
        [{ text: "\uD83D\uDCE5 Transaksi Masuk" }, { text: "\uD83D\uDCE4 Transaksi Keluar" }],
        [{ text: "\uD83D\uDCDD Kirim Komentar" }, { text: "\uD83D\uDCC8 Laporan Custom" }],
        [{ text: "❓ Help" }, { text: "\uD83D\uDEAA Logout" }]
      ],
      resize_keyboard: true
    };
    await bot.sendMessage(chatId, `*\uD83D\uDCF1 Menu TABE AI Bot*

Pilih opsi di bawah atau ketik perintah:`, { parse_mode: "Markdown", reply_markup: keyboard });
  });
  bot.onText(/\/laporan/, async (msg) => {
    await handleLaporanCommand(msg);
  });
  bot.on("message", async (msg) => {
    if (!msg.text)
      return;
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text.startsWith("/"))
      return;
    if (!authorizedUsers[chatId]) {
      await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
      return;
    }
    switch (text) {
      case "\uD83D\uDCCA Laporan Bulan Ini":
        await handleLaporanCommand(msg);
        break;
      case "\uD83D\uDCB0 Ringkasan Bisnis":
        await handleRingkasanCommand(msg);
        break;
      case "\uD83D\uDCE5 Transaksi Masuk":
        await handleTransaksiMasukCommand(msg);
        break;
      case "\uD83D\uDCE4 Transaksi Keluar":
        await handleTransaksiKeluarCommand(msg);
        break;
      case "\uD83D\uDCDD Kirim Komentar":
        await bot.sendMessage(chatId, `\uD83D\uDCDD *Kirim Komentar/Evaluasi*

Ketik komentar Anda, lalu saya akan menyimpannya untuk tim admin.

Format:
\`/komentar [pesan Anda]\`

Contoh:
\`/komentar Penjualan bulan ini bagus, tingkatkan produksi!\``, { parse_mode: "Markdown" });
        break;
      case "\uD83D\uDCC8 Laporan Custom":
        await bot.sendMessage(chatId, `\uD83D\uDCC8 *Laporan Custom*

Ketik: \`/laporan [bulan] [tahun]\`

Contoh:
\`/laporan 11 2025\` untuk November 2025`, { parse_mode: "Markdown" });
        break;
      case "❓ Help":
        await bot.sendMessage(chatId, `
\uD83D\uDCD6 *Panduan Penggunaan*

*Perintah Tersedia:*
/login [kode] - Login
/menu - Tampilkan menu
/laporan - Laporan bulan ini
/masuk - Transaksi masuk (5 terbaru)
/keluar - Transaksi keluar (5 terbaru)
/ringkasan - Ringkasan bisnis
/komentar [pesan] - Kirim komentar
/logout - Keluar

*Tips:*
• Gunakan tombol keyboard untuk akses cepat
• Laporan otomatis untuk bulan berjalan
• Komentar akan dikirim ke dashboard admin
        `, { parse_mode: "Markdown" });
        break;
      case "\uD83D\uDEAA Logout":
        delete authorizedUsers[chatId];
        await bot.sendMessage(chatId, "✅ Anda telah logout. Gunakan /login untuk masuk lagi.");
        break;
    }
  });
  bot.onText(/\/komentar (.+)/, async (msg, match2) => {
    const chatId = msg.chat.id;
    const profileId = authorizedUsers[chatId];
    if (!profileId) {
      await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
      return;
    }
    const commentText = match2?.[1]?.trim();
    if (!commentText) {
      await bot.sendMessage(chatId, "❌ Komentar tidak boleh kosong!");
      return;
    }
    try {
      console.log(`\uD83D\uDCAC Saving comment - Profile: ${profileId}, User: ${msg.from?.first_name}, Message: ${commentText}`);
      const { data, error } = await supabase.from("umkm_evaluations").insert({
        profile_id: profileId,
        message: commentText,
        sender_name: msg.from?.first_name || "Boss",
        telegram_chat_id: chatId,
        status: "unread"
      }).select().single();
      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }
      console.log("✅ Comment saved:", data);
      await bot.sendMessage(chatId, `✅ *Komentar terkirim!*

Tim admin akan melihat komentar Anda di dashboard.

\uD83D\uDCF1 Lihat di: /menu → Dashboard Admin → Evaluasi`, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("❌ Error saving comment:", error);
      const errorMsg = error?.message || "Unknown error";
      await bot.sendMessage(chatId, `❌ Gagal mengirim komentar.

Error: ${errorMsg}

Coba lagi dengan: /komentar [pesan Anda]`);
    }
  });
  bot.onText(/\/evaluasi (.+)/, async (msg, match2) => {
    const chatId = msg.chat.id;
    const profileId = authorizedUsers[chatId];
    if (!profileId) {
      await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
      return;
    }
    const evaluationText = match2?.[1]?.trim();
    if (!evaluationText) {
      await bot.sendMessage(chatId, "❌ Evaluasi tidak boleh kosong!");
      return;
    }
    try {
      console.log(`\uD83D\uDCAC Saving evaluation - Profile: ${profileId}, User: ${msg.from?.first_name}, Message: ${evaluationText}`);
      const { data, error } = await supabase.from("umkm_evaluations").insert({
        profile_id: profileId,
        message: evaluationText,
        sender_name: msg.from?.first_name || "Boss",
        telegram_chat_id: chatId,
        status: "unread"
      }).select().single();
      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }
      console.log("✅ Evaluation saved:", data);
      await bot.sendMessage(chatId, `✅ *Evaluasi terkirim!*

Tim admin akan melihat evaluasi Anda di dashboard.

\uD83D\uDCF1 Lihat di: Dashboard Admin → Evaluasi`, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("❌ Error saving evaluation:", error);
      const errorMsg = error?.message || "Unknown error";
      await bot.sendMessage(chatId, `❌ Gagal mengirim evaluasi.

Error: ${errorMsg}

Coba lagi dengan: /evaluasi [pesan Anda]`);
    }
  });
  bot.onText(/\/ringkasan/, async (msg) => {
    await handleRingkasanCommand(msg);
  });
  bot.onText(/\/masuk/, async (msg) => {
    await handleTransaksiMasukCommand(msg);
  });
  bot.onText(/\/keluar/, async (msg) => {
    await handleTransaksiKeluarCommand(msg);
  });
  bot.onText(/\/logout/, (msg) => {
    const chatId = msg.chat.id;
    delete authorizedUsers[chatId];
    bot.sendMessage(chatId, "✅ Anda telah logout. Gunakan /login untuk masuk lagi.");
  });
}
async function handleLaporanCommand(msg) {
  if (!bot)
    return;
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];
  if (!profileId) {
    await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
    return;
  }
  await bot.sendMessage(chatId, "⏳ Sedang menghasilkan laporan...");
  try {
    const now = new Date;
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const { data: allTransactions, error: allError } = await supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).order("transaction_date", { ascending: false });
    if (allError)
      throw allError;
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01`;
    const transactions = allTransactions?.filter((t) => {
      const tDate = t.transaction_date;
      return tDate >= startDate && tDate < endDate;
    }) || [];
    console.log(`\uD83D\uDCCA Laporan - Profile: ${profileId}, Total: ${allTransactions?.length}, Bulan ini: ${transactions.length}`);
    const totalIncome = transactions?.filter((t) => t.type === "in").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter((t) => t.type === "out").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = totalIncome - totalExpense;
    const { data: profile } = await supabase.from("umkm_profiles").select("business_name").eq("id", profileId).single();
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    const incomeTransactions = transactions.filter((t) => t.type === "in");
    const expenseTransactions = transactions.filter((t) => t.type === "out");
    let report = `
\uD83D\uDCCA *LAPORAN KEUANGAN*
${profile?.business_name || "UMKM"}

\uD83D\uDCC5 Periode: ${monthNames[month - 1]} ${year}

\uD83D\uDCB0 *RINGKASAN:*
• Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")} (${incomeTransactions.length}x)
• Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")} (${expenseTransactions.length}x)
• Saldo: Rp ${balance.toLocaleString("id-ID")}
• Total Transaksi: ${transactions.length}

${balance >= 0 ? "✅ Bisnis untung!" : "⚠️ Perlu perhatian!"}
`;
    if (transactions.length > 0) {
      report += `
\uD83D\uDCDD *Transaksi Terbaru:*
`;
      const recent = transactions.slice(0, 5);
      recent.forEach((t, i) => {
        const date = new Date(t.transaction_date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        const type = t.type === "in" ? "\uD83D\uDCE5" : "\uD83D\uDCE4";
        report += `${i + 1}. ${type} ${dateStr} - Rp ${Number(t.amount).toLocaleString("id-ID")}
`;
      });
      if (transactions.length > 5) {
        report += `
_... dan ${transactions.length - 5} transaksi lainnya_
`;
      }
    }
    report += `
_Untuk laporan lengkap, akses dashboard admin._`;
    await bot.sendMessage(chatId, report, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error generating report:", error);
    await bot.sendMessage(chatId, "❌ Gagal menghasilkan laporan. Coba lagi nanti.");
  }
}
async function handleRingkasanCommand(msg) {
  if (!bot)
    return;
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];
  if (!profileId) {
    await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
    return;
  }
  await bot.sendMessage(chatId, "⏳ Mengambil data bisnis...");
  try {
    const metrics = await calculateBusinessMetrics(profileId);
    const { data: profile } = await supabase.from("umkm_profiles").select("business_name, category").eq("id", profileId).single();
    const { data: products } = await supabase.from("umkm_products").select("id, stock").eq("profile_id", profileId);
    const lowStockCount = products?.filter((p) => Number(p.stock) > 0 && Number(p.stock) < 10).length || 0;
    const outOfStockCount = products?.filter((p) => Number(p.stock) === 0).length || 0;
    const summary = `
\uD83D\uDCBC *RINGKASAN BISNIS*
${profile?.business_name || "UMKM"}

\uD83C\uDFEA Kategori: ${profile?.category || "-"}

\uD83D\uDCCA *KEUANGAN:*
• Total Pemasukan: Rp ${metrics.totalIncome.toLocaleString("id-ID")}
• Total Pengeluaran: Rp ${metrics.totalExpense.toLocaleString("id-ID")}
• Saldo: Rp ${metrics.balance.toLocaleString("id-ID")}

\uD83D\uDCE6 *INVENTORY:*
• Total Produk: ${metrics.productCount}
• Stok Menipis: ${lowStockCount} produk
• Habis Stok: ${outOfStockCount} produk

${metrics.balance >= 0 ? "\uD83D\uDC9A Bisnis sehat!" : "⚠️ Perlu evaluasi!"}
${lowStockCount > 0 ? `
⚠️ ${lowStockCount} produk perlu restock!` : ""}

_Update real-time dari dashboard admin._
    `;
    await bot.sendMessage(chatId, summary, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error generating summary:", error);
    await bot.sendMessage(chatId, "❌ Gagal mengambil data bisnis. Coba lagi nanti.");
  }
}
async function handleTransaksiMasukCommand(msg) {
  if (!bot)
    return;
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];
  if (!profileId) {
    await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
    return;
  }
  await bot.sendMessage(chatId, "⏳ Mengambil transaksi masuk...");
  try {
    const { data: transactions, error } = await supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).eq("type", "in").order("transaction_date", { ascending: false }).limit(10);
    if (error)
      throw error;
    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, "\uD83D\uDCE5 Belum ada transaksi pemasukan.");
      return;
    }
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    let message = `\uD83D\uDCE5 *TRANSAKSI MASUK* (10 Terbaru)

`;
    transactions.forEach((t, index) => {
      const date = new Date(t.transaction_date);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      message += `${index + 1}. *${dateStr}*
`;
      message += `   \uD83D\uDCB0 Rp ${Number(t.amount).toLocaleString("id-ID")}
`;
      if (t.description) {
        message += `   \uD83D\uDCDD ${t.description}
`;
      }
      message += `
`;
    });
    message += `
✅ *Total Pemasukan:* Rp ${total.toLocaleString("id-ID")}`;
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching income transactions:", error);
    await bot.sendMessage(chatId, "❌ Gagal mengambil data transaksi. Coba lagi nanti.");
  }
}
async function handleTransaksiKeluarCommand(msg) {
  if (!bot)
    return;
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];
  if (!profileId) {
    await bot.sendMessage(chatId, "❌ Anda belum login! Gunakan /login [kode_bisnis]");
    return;
  }
  await bot.sendMessage(chatId, "⏳ Mengambil transaksi keluar...");
  try {
    const { data: transactions, error } = await supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).eq("type", "out").order("transaction_date", { ascending: false }).limit(10);
    if (error)
      throw error;
    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, "\uD83D\uDCE4 Belum ada transaksi pengeluaran.");
      return;
    }
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    let message = `\uD83D\uDCE4 *TRANSAKSI KELUAR* (10 Terbaru)

`;
    transactions.forEach((t, index) => {
      const date = new Date(t.transaction_date);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      message += `${index + 1}. *${dateStr}*
`;
      message += `   \uD83D\uDCB8 Rp ${Number(t.amount).toLocaleString("id-ID")}
`;
      if (t.description) {
        message += `   \uD83D\uDCDD ${t.description}
`;
      }
      message += `
`;
    });
    message += `
\uD83D\uDCB3 *Total Pengeluaran:* Rp ${total.toLocaleString("id-ID")}`;
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching expense transactions:", error);
    await bot.sendMessage(chatId, "❌ Gagal mengambil data transaksi. Coba lagi nanti.");
  }
}

// src/index.ts
var app = new Hono2;
app.use("/*", cors({
  origin: ["http://localhost:3000", "http://localhost:1997"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));
app.get("/", (c) => c.text("Hono + Bun + Supabase Connected \uD83D\uDE80"));
app.get("/menus", async (c) => {
  const { data, error } = await supabase.from("menus").select("*");
  if (error)
    return c.json({ error }, 500);
  return c.json({ data });
});
app.get("/menus/:id", async (c) => {
  const id = c.req.param("id");
  const { data, error } = await supabase.from("menus").select("*").eq("id", id).single();
  if (error)
    return c.json({ error }, 404);
  return c.json({ data });
});
app.post("/menus", async (c) => {
  const body = await c.req.json();
  const { name, price, description } = body;
  if (!name || !price) {
    return c.json({ error: "name dan price wajib diisi" }, 400);
  }
  const { data, error } = await supabase.from("menus").insert([{ name, price, description }]).select();
  if (error)
    return c.json({ error }, 500);
  return c.json({ data });
});
app.put("/menus/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, price, description } = body;
  const { data, error } = await supabase.from("menus").update({ name, price, description }).eq("id", id).select();
  if (error)
    return c.json({ error }, 500);
  return c.json({ data });
});
app.delete("/menus/:id", async (c) => {
  const id = c.req.param("id");
  const { data, error } = await supabase.from("menus").delete().eq("id", id).select();
  if (error)
    return c.json({ error }, 500);
  return c.json({ data });
});
app.post("/api/copywriting", async (c) => {
  try {
    const body = await c.req.json();
    const { namaProduk, jenisKonten, gayaBahasa, tujuanKonten } = body;
    if (!namaProduk || !jenisKonten || !gayaBahasa || !tujuanKonten) {
      return c.json({
        error: "Semua field wajib diisi",
        details: {
          namaProduk: !namaProduk ? "Nama produk wajib diisi" : null,
          jenisKonten: !jenisKonten ? "Jenis konten wajib diisi" : null,
          gayaBahasa: !gayaBahasa ? "Gaya bahasa wajib diisi" : null,
          tujuanKonten: !tujuanKonten ? "Tujuan konten wajib diisi" : null
        }
      }, 400);
    }
    const result = await generateCopywriting({
      namaProduk,
      jenisKonten,
      gayaBahasa,
      tujuanKonten
    });
    const { data: historyData, error: historyError } = await supabase.from("copywriting_history").insert([
      {
        nama_produk: namaProduk,
        jenis_konten: jenisKonten,
        gaya_bahasa: gayaBahasa,
        tujuan_konten: tujuanKonten,
        main_text: result.mainText,
        alternatives: result.alternatives,
        created_at: new Date().toISOString()
      }
    ]).select();
    if (historyError) {
      console.error("Error saving history:", historyError);
    }
    return c.json({
      success: true,
      data: result,
      historyId: historyData?.[0]?.id || null
    });
  } catch (error) {
    console.error("Error in /api/copywriting:", error);
    return c.json({
      error: "Gagal generate copywriting",
      message: error.message || "Internal server error"
    }, 500);
  }
});
app.get("/api/copywriting/history", async (c) => {
  try {
    const { data, error } = await supabase.from("copywriting_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) {
      console.error("Error fetching history:", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/copywriting/history:", error);
    return c.json({ error: "Gagal mengambil history", message: error.message }, 500);
  }
});
app.get("/api/copywriting/history/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await supabase.from("copywriting_history").select("*").eq("id", id).single();
    if (error) {
      return c.json({ error: "History tidak ditemukan" }, 404);
    }
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/copywriting/history/:id:", error);
    return c.json({ error: "Gagal mengambil history", message: error.message }, 500);
  }
});
app.post("/api/ai-content", async (c) => {
  try {
    const body = await c.req.json();
    const { type, inputText, metadata, userId } = body;
    if (!type || !inputText) {
      return c.json({
        error: "Validation error",
        message: "type dan inputText wajib diisi"
      }, 400);
    }
    const validTypes = ["caption", "promo", "branding", "planner", "copywriting", "pricing", "reply", "comment"];
    if (!validTypes.includes(type)) {
      return c.json({
        error: "Invalid type",
        message: `Type harus salah satu dari: ${validTypes.join(", ")}`
      }, 400);
    }
    const request = {
      type,
      inputText,
      metadata: metadata || {}
    };
    const result = await generateAIContent(request);
    const { data: savedData, error: dbError } = await supabase.from("ai_content_activity").insert([{
      user_id: userId || null,
      type: result.type,
      input_text: result.inputText,
      output_text: result.outputText,
      metadata: result.metadata
    }]).select().single();
    if (dbError) {
      console.error("Error saving to database:", dbError);
      return c.json({
        success: true,
        data: result,
        warning: "Berhasil generate tapi gagal menyimpan ke history"
      });
    }
    return c.json({
      success: true,
      data: {
        id: savedData.id,
        ...result,
        createdAt: savedData.created_at
      }
    });
  } catch (error) {
    console.error("Error in /api/ai-content:", error);
    return c.json({
      error: "Gagal generate content",
      message: error.message
    }, 500);
  }
});
app.get("/api/ai-content/history", async (c) => {
  try {
    const userId = c.req.query("userId");
    const type = c.req.query("type");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");
    let query = supabase.from("ai_content_activity").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (type) {
      query = query.eq("type", type);
    }
    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching history:", error);
      return c.json({ error: "Gagal mengambil history" }, 500);
    }
    return c.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || data?.length || 0
      }
    });
  } catch (error) {
    console.error("Error in /api/ai-content/history:", error);
    return c.json({
      error: "Gagal mengambil history",
      message: error.message
    }, 500);
  }
});
app.get("/api/ai-content/history/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await supabase.from("ai_content_activity").select("*").eq("id", id).single();
    if (error) {
      return c.json({ error: "History tidak ditemukan" }, 404);
    }
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/ai-content/history/:id:", error);
    return c.json({
      error: "Gagal mengambil history",
      message: error.message
    }, 500);
  }
});
app.delete("/api/ai-content/history/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { error } = await supabase.from("ai_content_activity").delete().eq("id", id);
    if (error) {
      console.error("Error deleting history:", error);
      return c.json({ error: "Gagal menghapus history" }, 500);
    }
    return c.json({
      success: true,
      message: "History berhasil dihapus"
    });
  } catch (error) {
    console.error("Error in DELETE /api/ai-content/history/:id:", error);
    return c.json({
      error: "Gagal menghapus history",
      message: error.message
    }, 500);
  }
});
app.get("/api/ai-content/stats", async (c) => {
  try {
    const userId = c.req.query("userId");
    let query = supabase.from("ai_content_activity").select("type, created_at");
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching stats:", error);
      return c.json({ error: "Gagal mengambil statistik" }, 500);
    }
    const stats = {
      total: data?.length || 0,
      byType: {
        caption: 0,
        promo: 0,
        branding: 0,
        planner: 0,
        copywriting: 0,
        pricing: 0,
        reply: 0,
        comment: 0
      },
      recentActivity: data?.slice(0, 10) || []
    };
    data?.forEach((item) => {
      if (item.type in stats.byType) {
        stats.byType[item.type]++;
      }
    });
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in /api/ai-content/stats:", error);
    return c.json({
      error: "Gagal mengambil statistik",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/generate-umkm-branding", async (c) => {
  try {
    const body = await c.req.json();
    const {
      productImage,
      productName,
      businessType,
      theme,
      brandColor,
      targetMarket,
      format,
      additionalInfo,
      userId
    } = body;
    if (!productName || !businessType || !theme || !brandColor || !targetMarket || !format) {
      return c.json({
        error: "Validation error",
        message: "productName, businessType, theme, brandColor, targetMarket, dan format wajib diisi"
      }, 400);
    }
    const request = {
      productImage,
      productName,
      businessType,
      theme,
      brandColor,
      targetMarket,
      format,
      additionalInfo
    };
    console.log("\uD83C\uDFA8 Processing UMKM Branding request:", {
      productName,
      businessType,
      theme,
      format,
      hasImage: !!productImage
    });
    const { generateUMKMBranding: generateUMKMBranding2 } = await Promise.resolve().then(() => (init_visual_studio(), exports_visual_studio));
    const result = await generateUMKMBranding2(request);
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "umkm_branding",
      input_data: {
        productName,
        businessType,
        theme,
        format,
        hasProductImage: !!productImage
      },
      output_data: {
        success: result.success,
        imageAnalysis: result.imageAnalysis,
        processingTime: result.metadata.processingTime
      },
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/generate-umkm-branding:", error);
    return c.json({
      error: "Gagal generate branding UMKM",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/analyze-image", async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, imageBase64, context, userId } = body;
    if (!imageUrl && !imageBase64) {
      return c.json({
        error: "Validation error",
        message: "imageUrl atau imageBase64 wajib diisi"
      }, 400);
    }
    const request = {
      imageUrl,
      imageBase64,
      context: context || "UMKM kuliner Makassar"
    };
    const result = await analyzeImageWithAI(request);
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "image_analysis",
      input_data: { imageUrl, context },
      output_data: result,
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/analyze-image:", error);
    return c.json({
      error: "Gagal menganalisa gambar",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/generate-template", async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, imageBase64, templateType, theme, brandColor, targetAudience, userId } = body;
    if (!templateType || !theme || !targetAudience) {
      return c.json({
        error: "Validation error",
        message: "templateType, theme, dan targetAudience wajib diisi"
      }, 400);
    }
    const validTypes = ["promo", "story", "feed", "reels", "carousel"];
    if (!validTypes.includes(templateType)) {
      return c.json({
        error: "Invalid templateType",
        message: `templateType harus salah satu dari: ${validTypes.join(", ")}`
      }, 400);
    }
    const request = {
      imageUrl,
      imageBase64,
      templateType,
      theme,
      brandColor,
      targetAudience
    };
    const result = await generateTemplateDesign(request);
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "template_generation",
      input_data: { templateType, theme, targetAudience },
      output_data: result,
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/generate-template:", error);
    return c.json({
      error: "Gagal generate template",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/remove-background", async (c) => {
  try {
    const body = await c.req.json();
    const { imageBase64, userId } = body;
    if (!imageBase64) {
      return c.json({
        error: "Validation error",
        message: "imageBase64 wajib diisi"
      }, 400);
    }
    const { removeBackgroundWithRemoveBg: removeBackgroundWithRemoveBg2 } = await Promise.resolve().then(() => (init_external_apis(), exports_external_apis));
    const result = await removeBackgroundWithRemoveBg2(imageBase64);
    if (!result.success) {
      return c.json({
        error: "Background removal failed",
        message: result.error
      }, 500);
    }
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "background_removal",
      input_data: { action: "remove_background" },
      output_data: { success: true },
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: {
        imageBase64: result.imageBase64
      }
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/remove-background:", error);
    return c.json({
      error: "Gagal menghapus background",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/generate-design", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, style, userId } = body;
    if (!prompt) {
      return c.json({
        error: "Validation error",
        message: "prompt wajib diisi"
      }, 400);
    }
    const { generateTemplateWithHuggingFace: generateTemplateWithHuggingFace2 } = await Promise.resolve().then(() => (init_external_apis(), exports_external_apis));
    const result = await generateTemplateWithHuggingFace2(prompt, style || "instagram-feed");
    if (!result.success) {
      return c.json({
        error: "Design generation failed",
        message: result.error
      }, 500);
    }
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "design_generation",
      input_data: { prompt, style },
      output_data: result,
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/generate-design:", error);
    return c.json({
      error: "Gagal generate design",
      message: error.message
    }, 500);
  }
});
app.post("/api/visual-studio/schedule-planner", async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, contentType, targetAudience, businessGoal, duration, userId } = body;
    if (!contentType || !targetAudience || !businessGoal || !duration) {
      return c.json({
        error: "Validation error",
        message: "contentType, targetAudience, businessGoal, dan duration wajib diisi"
      }, 400);
    }
    const validGoals = ["awareness", "engagement", "sales", "traffic"];
    if (!validGoals.includes(businessGoal)) {
      return c.json({
        error: "Invalid businessGoal",
        message: `businessGoal harus salah satu dari: ${validGoals.join(", ")}`
      }, 400);
    }
    const request = {
      imageUrl,
      contentType,
      targetAudience,
      businessGoal,
      duration: parseInt(duration)
    };
    const result = await generateSchedulePlanner(request);
    const { error: dbError } = await supabase.from("visual_studio_activity").insert([{
      user_id: userId || null,
      activity_type: "schedule_planner",
      input_data: { contentType, targetAudience, businessGoal, duration },
      output_data: result,
      created_at: new Date().toISOString()
    }]);
    if (dbError) {
      console.warn("Warning: Failed to save to DB:", dbError.message);
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/visual-studio/schedule-planner:", error);
    return c.json({
      error: "Gagal generate schedule",
      message: error.message
    }, 500);
  }
});
app.get("/api/visual-studio/history", async (c) => {
  try {
    const userId = c.req.query("userId");
    const activityType = c.req.query("type");
    let query = supabase.from("visual_studio_activity").select("*").order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (activityType) {
      query = query.eq("activity_type", activityType);
    }
    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/visual-studio/history:", error);
    return c.json({
      error: "Gagal mengambil history",
      message: error.message
    }, 500);
  }
});
app.post("/api/tanya-daeng/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, conversationHistory, userContext, userId } = body;
    if (!message) {
      return c.json({
        error: "Validation error",
        message: "Message wajib diisi"
      }, 400);
    }
    console.log("\uD83D\uDCAC Tanya Daeng request:", { message: message.substring(0, 50), userId });
    const { tanyaDaeng: tanyaDaeng2 } = await Promise.resolve().then(() => (init_tanya_daeng(), exports_tanya_daeng));
    const result = await tanyaDaeng2({
      message,
      conversationHistory,
      userContext
    });
    if (userId) {
      await supabase.from("tanya_daeng_conversations").insert([{
        user_id: userId,
        message,
        reply: result.reply,
        created_at: new Date().toISOString()
      }]).select();
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in /api/tanya-daeng/chat:", error);
    return c.json({
      error: "Gagal memproses chat",
      message: error.message
    }, 500);
  }
});
app.get("/api/tanya-daeng/faq", async (c) => {
  try {
    const { getAllFAQ: getAllFAQ2 } = await Promise.resolve().then(() => (init_tanya_daeng(), exports_tanya_daeng));
    const faqs = getAllFAQ2();
    return c.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error("Error in /api/tanya-daeng/faq:", error);
    return c.json({
      error: "Gagal mengambil FAQ",
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/profile", async (c) => {
  try {
    const userId = c.req.header("X-User-ID");
    const { data, error } = await supabase.from("umkm_profiles").select("*").limit(1).single();
    if (error && error.code !== "PGRST116")
      throw error;
    return c.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { id, business_name, category, address, phone, email, logo_url, description } = body;
    if (!business_name || !category) {
      return c.json({
        success: false,
        message: "Nama usaha dan kategori wajib diisi"
      }, 400);
    }
    let result;
    if (id) {
      const { data, error } = await supabase.from("umkm_profiles").update({
        business_name,
        category,
        address,
        phone,
        email,
        logo_url,
        description
      }).eq("id", id).select().single();
      if (error)
        throw error;
      result = data;
    } else {
      const { data, error } = await supabase.from("umkm_profiles").insert({
        business_name,
        category,
        address,
        phone,
        email,
        logo_url,
        description
      }).select().single();
      if (error)
        throw error;
      result = data;
    }
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/upload-logo", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("logo");
    const profileId = formData.get("profile_id");
    if (!file) {
      return c.json({
        success: false,
        message: "File logo wajib diupload"
      }, 400);
    }
    if (!profileId) {
      return c.json({
        success: false,
        message: "Profile ID diperlukan"
      }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        message: "Format file harus JPEG, PNG, WebP, atau GIF"
      }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({
        success: false,
        message: "Ukuran file maksimal 5MB"
      }, 400);
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${profileId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data: uploadData, error: uploadError } = await supabase.storage.from("umkm-logos").upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    });
    if (uploadError)
      throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from("umkm-logos").getPublicUrl(filePath);
    const { data: profile, error: updateError } = await supabase.from("umkm_profiles").update({ logo_url: publicUrl }).eq("id", profileId).select().single();
    if (updateError)
      throw updateError;
    return c.json({
      success: true,
      data: {
        logo_url: publicUrl,
        profile
      }
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return c.json({
      success: false,
      message: error.message || "Gagal upload logo"
    }, 500);
  }
});
app.get("/api/dapur-umkm/public/profile", async (c) => {
  try {
    const { data, error } = await supabase.from("umkm_profiles").select("id, business_name, category, address, logo_url, description").limit(1).single();
    if (error && error.code !== "PGRST116")
      throw error;
    return c.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/products", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    let query = supabase.from("umkm_products").select("*").order("created_at", { ascending: false });
    if (profileId) {
      query = query.eq("profile_id", profileId);
    }
    const { data, error } = await query;
    if (error)
      throw error;
    return c.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/products", async (c) => {
  try {
    const body = await c.req.json();
    const { profile_id, name, price, stock, image_url, category, description, cost_price } = body;
    if (!name || !price) {
      return c.json({
        success: false,
        message: "Nama dan harga produk wajib diisi"
      }, 400);
    }
    const { data, error } = await supabase.from("umkm_products").insert({
      profile_id,
      name,
      price,
      stock: stock || 0,
      image_url,
      category,
      description,
      cost_price: cost_price || 0,
      is_available: true
    }).select().single();
    if (error)
      throw error;
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.put("/api/dapur-umkm/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, price, stock, image_url, category, description, cost_price, is_available } = body;
    const { data, error } = await supabase.from("umkm_products").update({
      name,
      price,
      stock,
      image_url,
      category,
      description,
      cost_price,
      is_available
    }).eq("id", id).select().single();
    if (error)
      throw error;
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.delete("/api/dapur-umkm/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { error } = await supabase.from("umkm_products").delete().eq("id", id);
    if (error)
      throw error;
    return c.json({
      success: true,
      message: "Produk berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/transactions", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    const type = c.req.query("type");
    let query = supabase.from("umkm_transactions").select("*").order("transaction_date", { ascending: false }).order("created_at", { ascending: false });
    if (profileId) {
      query = query.eq("profile_id", profileId);
    }
    if (type) {
      query = query.eq("type", type);
    }
    const { data, error } = await query;
    if (error)
      throw error;
    return c.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/transactions", async (c) => {
  try {
    const body = await c.req.json();
    const { profile_id, transaction_date, description, amount, type, category, product_id, notes } = body;
    if (!description || !amount || !type) {
      return c.json({
        success: false,
        message: "Keterangan, jumlah, dan jenis transaksi wajib diisi"
      }, 400);
    }
    if (!["in", "out"].includes(type)) {
      return c.json({
        success: false,
        message: 'Jenis transaksi harus "in" atau "out"'
      }, 400);
    }
    const { data, error } = await supabase.from("umkm_transactions").insert({
      profile_id,
      transaction_date: transaction_date || new Date().toISOString().split("T")[0],
      description,
      amount,
      type,
      category,
      product_id,
      notes
    }).select().single();
    if (error)
      throw error;
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/summary", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    if (!profileId) {
      return c.json({
        success: false,
        message: "profile_id diperlukan"
      }, 400);
    }
    const { calculateBusinessMetrics: calculateBusinessMetrics2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    const metrics = await calculateBusinessMetrics2(profileId);
    return c.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Error calculating summary:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/ai-advice", async (c) => {
  try {
    const body = await c.req.json();
    const { profile_id, insight_type, question } = body;
    if (!profile_id || !insight_type || !question) {
      return c.json({
        success: false,
        message: "profile_id, insight_type, dan question wajib diisi"
      }, 400);
    }
    const validTypes = ["pricing", "inventory", "strategy", "marketing", "finance"];
    if (!validTypes.includes(insight_type)) {
      return c.json({
        success: false,
        message: `insight_type harus salah satu dari: ${validTypes.join(", ")}`
      }, 400);
    }
    const { getAIRecommendation: getAIRecommendation2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    const result = await getAIRecommendation2({
      profileId: profile_id,
      insightType: insight_type,
      question
    });
    return c.json(result);
  } catch (error) {
    console.error("Error getting AI advice:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/quick-insights", async (c) => {
  try {
    const { QUICK_INSIGHTS: QUICK_INSIGHTS2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    return c.json({
      success: true,
      data: QUICK_INSIGHTS2
    });
  } catch (error) {
    console.error("Error fetching quick insights:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/insights-history", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    const limit = parseInt(c.req.query("limit") || "10");
    if (!profileId) {
      return c.json({
        success: false,
        message: "profile_id diperlukan"
      }, 400);
    }
    const { getPastInsights: getPastInsights2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    const result = await getPastInsights2(profileId, limit);
    return c.json(result);
  } catch (error) {
    console.error("Error fetching insights history:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.post("/api/dapur-umkm/dashboard-analysis", async (c) => {
  try {
    const body = await c.req.json();
    const { profile_id } = body;
    if (!profile_id) {
      return c.json({
        success: false,
        message: "profile_id diperlukan"
      }, 400);
    }
    const { generateDashboardAnalysis: generateDashboardAnalysis2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    const result = await generateDashboardAnalysis2(profile_id);
    return c.json(result);
  } catch (error) {
    console.error("Error generating dashboard analysis:", error);
    return c.json({
      success: false,
      message: error.message || "Gagal generate analisis dashboard",
      error: error.toString()
    }, 500);
  }
});
app.get("/api/dapur-umkm/dashboard-overview", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    if (!profileId) {
      return c.json({
        success: false,
        message: "profile_id diperlukan"
      }, 400);
    }
    const [profile, products, transactions, insights, summary] = await Promise.all([
      supabase.from("umkm_profiles").select("*").eq("id", profileId).single(),
      supabase.from("umkm_products").select("*").eq("profile_id", profileId),
      supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).order("transaction_date", { ascending: false }).limit(50),
      supabase.from("umkm_ai_insights").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(10),
      supabase.from("umkm_financial_summary").select("*").eq("profile_id", profileId).single()
    ]);
    const { calculateBusinessMetrics: calculateBusinessMetrics2 } = await Promise.resolve().then(() => (init_dapur_umkm(), exports_dapur_umkm));
    const metrics = await calculateBusinessMetrics2(profileId);
    return c.json({
      success: true,
      data: {
        profile: profile.data,
        products: products.data || [],
        transactions: transactions.data || [],
        insights: insights.data || [],
        summary: summary.data,
        metrics
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.get("/api/dapur-umkm/report", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    const month = parseInt(c.req.query("month") || "0");
    const year = parseInt(c.req.query("year") || new Date().getFullYear().toString());
    if (!profileId) {
      return c.json({
        success: false,
        message: "profile_id diperlukan"
      }, 400);
    }
    if (month < 1 || month > 12) {
      return c.json({
        success: false,
        message: "month harus antara 1-12"
      }, 400);
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    console.log("Fetching report for:", { profileId, startDate, endDate });
    const { data: transactions, error } = await supabase.from("umkm_transactions").select("*").eq("profile_id", profileId).gte("transaction_date", startDate.toISOString()).lte("transaction_date", endDate.toISOString()).order("transaction_date", { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    const totalIncome = transactions?.filter((t) => t.type === "in").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter((t) => t.type === "out").reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = totalIncome - totalExpense;
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    return c.json({
      success: true,
      data: {
        month: monthNames[month - 1],
        year,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0,
        transactions: transactions || []
      }
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return c.json({
      success: false,
      message: error.message || "Gagal mengambil laporan bulanan"
    }, 500);
  }
});
app.get("/api/evaluations", async (c) => {
  try {
    const profileId = c.req.query("profile_id");
    const status = c.req.query("status");
    let query = supabase.from("umkm_evaluations").select("*").order("created_at", { ascending: false });
    if (profileId) {
      query = query.eq("profile_id", profileId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error)
      throw error;
    return c.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.put("/api/evaluations/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    const { data, error } = await supabase.from("umkm_evaluations").update({
      status: "read",
      read_at: new Date().toISOString()
    }).eq("id", id).select().single();
    if (error)
      throw error;
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error marking evaluation as read:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.put("/api/evaluations/:id/notes", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { notes } = body;
    const { data, error } = await supabase.from("umkm_evaluations").update({ admin_notes: notes }).eq("id", id).select().single();
    if (error)
      throw error;
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error adding notes:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
app.delete("/api/evaluations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { error } = await supabase.from("umkm_evaluations").delete().eq("id", id);
    if (error)
      throw error;
    return c.json({
      success: true,
      message: "Evaluation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return c.json({
      success: false,
      message: error.message
    }, 500);
  }
});
var isVercel = !!process.env.VERCEL || false;
if (process.env.TELEGRAM_BOT_TOKEN && !isVercel) {
  console.log("\uD83E\uDD16 Initializing Telegram Bot...");
  initTelegramBot();
} else if (isVercel) {
  console.log("⚠️ Telegram Bot disabled in serverless environment (Vercel)");
  console.log("   All API endpoints remain functional");
} else {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN not set. Bot features disabled.");
}
var src_default = app;
export {
  src_default as default
};
