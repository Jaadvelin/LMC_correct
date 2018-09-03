(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
"use strict";

var state = {
  halted: false,
  play: false,
  in: "015",
  out: "",
  i_cnt: 0,
  intrrpt: 4,
  intrp_dest: 6,
  buff_cnt: 0,
  acc: 0,
  buff_acc: 0,
  mem: new Array(100)
};

var empty_state = function empty_state() {
  return {
    halted: false,
    play: false,
    in: "",
    out: "",
    i_cnt: 0,
    intrrpt: -1,
    intrp_dest: 0,
    buff_cnt: 0,
    acc: 0,
    buff_acc: 0,
    mem: new Array(100)
  };
};

var set_cell = function set_cell(indx, val) {
  console.log("setting addr: ", indx, " to: ", val);
  state.mem[indx] = val;
};

var reset_counter = function reset_counter() {
  state.i_cnt = 0;
};

var step = function step() {
  exc(state.i_cnt);
  m.redraw();
};

document.addEventListener('DOMContentLoaded', function () {
  state.mem.fill("000", 0, 100);
  m.mount(document.body, Layout);
});
var Layout = {
  oninit: function oninit() {
    ["505", "105", "305", "901", "205", "010", "901", "105", "305", "902"].map(function (value, index) {
      return state.mem[index] = value;
    });
  },
  view: function view() {
    console.log(state);
    setInterval(function () {
      if (state.play) {
        step();
      }
    }, 3000);
    return m("", {
      class: "flex flex-row justify-around"
    }, [m("", {
      class: "flex flex-col items-end"
    }, [labeled_val("COUNTER", state.i_cnt), labeled_val("ACC", state.acc), labeled_input("INPUT", state.in, function (value) {
      state.in = value;
    }), labeled_input("OUTPUT", state.out, function (value) {
      state.out = value;
    }), labeled_input("INTR ADR", state.intrrpt, function (value) {
      state.intrrpt = isNaN(value) ? 0 : parseInt(value);
    }), labeled_input("INTR DES", state.intrp_dest, function (value) {
      state.intrp_dest = isNaN(value) ? 0 : parseInt(value);
    }), m("", [m("", {
      class: "mt-2 mb-4"
    }, [m("button", {
      class: "bg-grey-light hover:bg-grey mr-2 px-2 py-4",
      onclick: function onclick() {
        state = empty_state();
        state.mem.fill("000", 0, 100);
      }
    }, "CLEAR ALL"), m("button", {
      class: "bg-grey-light hover:bg-grey mr-2 px-2 py-4",
      onclick: function onclick() {
        reset_counter();
      }
    }, "RESET CTR")]), m("button", {
      class: "bg-grey-light hover:bg-grey mr-2 px-2 py-4" + " ".concat(state.play ? "border-solid border-red-light border-2" : ""),
      onclick: function onclick() {
        state.play = true;
      }
    }, "RUN"), m("button", {
      class: "bg-grey-light hover:bg-grey px-2 py-4" + " ".concat(!state.play ? "border-solid border-red-light border-2" : ""),
      onclick: function onclick() {
        state.play = false;
      }
    }, "STEP"), !state.play ? m("button", {
      class: "bg-grey-light hover:bg-grey px-2 py-4",
      onclick: function onclick() {
        step();
      }
    }, "EXEC") : ""])]), m("", {
      class: "flex max-w-xl flex-row flex-wrap border-grey-dark border-l-2 pl-4"
    }, state.mem.map(mem_cell))]);
  }
};

var labeled_val = function labeled_val(label, value) {
  return m("", {
    class: "flex flex-row w-48 content-center py-2 px-2 border-grey-dark border-2 mb-2"
  }, [m("label", {
    class: "w-24"
  }, label), m("label", {
    class: "ml-2 text-blue border-grey border-l-2 px-2"
  }, value)]);
};

var labeled_input = function labeled_input(label, value, callback) {
  return m("", {
    class: "flex flex-row w-48 content-center py-2 px-2 border-grey-dark border-2 mb-2"
  }, [m("label", {
    class: "w-24"
  }, label), m("input", {
    class: "ml-2 w-16 text-blue border-grey border-l-2 px-2",
    value: value,
    oninput: m.withAttr("value", callback)
  })]);
};

var mem_cell = function mem_cell(val, indx) {
  return m("", {
    class: "px-1 py-2" + "".concat(indx === state.i_cnt ? " bg-blue-lightest" : "")
  }, [m("label", {}, " ".concat(indx > 9 ? indx : "0" + indx, " - ")), m("input", {
    class: "border-solid border-grey-dark border-2 w-12 p-2",
    oninput: m.withAttr("value", function (input_val) {
      set_cell(indx, input_val);
    }),
    placeholder: "-",
    value: val
  })]);
};

var exc = function exc(int) {
  var cmd = state.mem[int];
  var ins = cmd.charAt(0);
  var val = parseInt(cmd.substring(1, 3));
  console.log("CNT", state.i_cnt, "ACC", state.acc, "BFFCNT", state.buff_cnt, "BFFACC", state.buff_acc, "CMD", cmd, "INSTRUCTION: ", ins, "VALUE:", val);

  if (state.halted) {
    return;
  }

  if (state.i_cnt === state.intrrpt) {
    return rpt();
  }

  if (cmd === "901") {
    inp();
  }

  if (cmd === "902") {
    out();
  }

  if (cmd === "903") {
    console.log("UNINTERRUPT");
    urp();
  }

  switch (ins) {
    case "0":
      hlt();
      break;

    case "1":
      add(val);
      break;

    case "2":
      sub(val);
      break;

    case "3":
      sto(val);
      break;

    case "4":
      ;
      break;

    case "5":
      lod(val);
      break;

    case "6":
      bra(val);
      break;

    case "7":
      brz(val);
      break;

    case "8":
      brp(val);
      break;
  }
};

var inc = function inc() {
  state.i_cnt = state.i_cnt + 1;
};

var add = function add(mem_dir) {
  state.acc = parseInt(state.acc) + parseInt(state.mem[mem_dir]);
  inc();
};

var sub = function sub(mem_dir) {
  state.acc = parseInt(state.acc) - parseInt(state.mem[mem_dir]);
  inc();
};

var sta = function sta(mem_dir) {
  state.mem[mem_dir] = state.acc < 100 ? "0" + state.acc : state.acc;
  inc();
};

var sto = function sto(mem_dir) {
  state.mem[mem_dir] = state.acc < 100 ? "0" + state.acc : state.acc;
  inc();
};

var lod = function lod(mem_dir) {
  state.acc = parseInt(state.mem[mem_dir]);
  inc();
};

var brz = function brz(mem_dir) {
  if (state.acc === 0) {
    state.i_cnt = mem_dir;
  }
};

var brp = function brp(mem_dir) {
  if (state.acc >= 0) {
    state.i_cnt = mem_dir;
  }
};

var bra = function bra(mem_dir) {
  state.i_cnt = mem_dir;
};

var inp = function inp() {
  state.acc = state.in;
  inc();
};

var out = function out() {
  state.out = state.acc;
  inc();
};

var hlt = function hlt() {
  state.halted = true;
};

var rpt = function rpt() {
  state.buff_acc = state.acc;
  state.buff_cnt = state.i_cnt;
  state.i_cnt = state.intrp_dest;
  state.intrrpt = -1;
};

var urp = function urp() {
  state.acc = state.buff_acc;
  state.i_cnt = state.buff_cnt;
};
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map