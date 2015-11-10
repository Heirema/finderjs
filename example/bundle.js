(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var xhr = require('xhr');
var extend = require('xtend');
var finder = require('../index');
var _ = require('../util');

var emitter;
var xhrCnt = 0;

module.exports = createExample;


function createExample(container) {
  emitter = finder(container, remoteSource, {
    createItemContent: createItemContent
  });

  // scroll to the right if necessary
  emitter.on('column-created', function columnCreated() {
    container.scrollLeft = container.scrollWidth - container.clientWidth;
  });
}

function remoteSource(parent, cfg, callback) {
  var loadingIndicator = createLoadingColumn();
  var xhrUid = ++xhrCnt;
  var type = 'region';

  // determine which column we're on based on previous selection
  if (parent) {
    if (parent.type === 'region') {
      type = 'subregion';
    } else if (parent.type === 'subregion') {
      type = 'name'; // country
    } else { // must be a country
      return cfg.emitter.emit('create-column', createSimpleColumn(parent));
    }
  }

  // loading spinner
  cfg.emitter.emit('create-column', loadingIndicator);

  // xhr request
  xhr({
    uri: 'https://restcountries.eu/rest/v1/all'
  }, function done(err, resp, body) {
    var rawData = JSON.parse(body);
    var data = uniqueCountryData(rawData, type, parent);

    // clear loading spinner
    _.remove(loadingIndicator);

    // stale request
    if (xhrUid !== xhrCnt) {
      return;
    }

    // execute callback
    callback(data);
  });
}

// transform rest country data for example
function uniqueCountryData(data, type, parent) {
  var hash = data.reduce(function each(prev, curr) {
    if (!(curr[type] in prev)) {
      if (parent) {
        if (parent.label === curr[parent.type]) {
          prev[curr[type]] = curr;
        }
      } else if (curr[type]) {
        prev[curr[type]] = curr;
      }
    }

    return prev;
  }, {});

  return Object.keys(hash).map(function each(item) {
    return extend(hash[item], {
      label: item,
      type: type === 'name' ? 'country' : type
    });
  });
}

// item render
function createItemContent(cfg, item) {
  var data = item.children || cfg.data;
  var frag = document.createDocumentFragment();
  var label = _.el('span');
  var iconPrepend = _.el('i');
  var iconAppend = _.el('i');
  var prependClasses = ['fa'];
  var appendClasses = ['fa'];

  // prepended icon
  if (item.type === 'region') {
    prependClasses.push('fa-globe');
  } else if (item.type === 'subregion') {
    prependClasses.push('fa-compass');
  } else {
    prependClasses.push('fa-map-marker');
  }
  _.addClass(iconPrepend, prependClasses);

  // text label
  label.appendChild(iconPrepend);
  label.appendChild(_.text(item.label));
  frag.appendChild(label);

  // appended icon
  if (data) {
    appendClasses.push('fa-caret-right');
  } else if ('url' in item) {
    appendClasses.push('fa-external-link');
  }
  _.addClass(iconAppend, appendClasses);
  frag.appendChild(iconAppend);

  return frag;
}

function createLoadingColumn() {
  var div = _.el('div.fjs-col.leaf-col');
  var row = _.el('div.leaf-row');
  var text = _.text('Loading...');
  var i = _.el('span');

  _.addClass(i, ['fa', 'fa-refresh', 'fa-spin']);
  _.append(row, [i, text]);

  return _.append(div, row);
}

function createSimpleColumn(item) {
  var div = _.el('div.fjs-col.leaf-col');
  var row = _.el('div.leaf-row');
  var filename = _.text(item.label);
  var i = _.el('i');
  var capital = _.el('div.meta');
  var capitalLabel = _.el('strong');
  var population = _.el('div.meta');
  var populationLabel  = _.el('strong');

  _.addClass(i, ['fa', 'fa-info-circle']);
  _.append(capitalLabel, _.text('Capital: '));
  _.append(capital, [capitalLabel, _.text(item.capital)]);
  _.append(populationLabel , _.text('Population: '));
  _.append(population, [
    populationLabel,
    _.text(Number(item.population).toLocaleString())
  ]);
  _.append(row, [i, filename, capital, population]);

  return _.append(div, row);
}

},{"../index":4,"../util":17,"xhr":10,"xtend":16}],2:[function(require,module,exports){
'use strict';

var finder = require('../index');
var _ = require('../util');

// sample data
var data = [{
  size: '10 KB',
  modified: '02/21/2015 at 10:04am',
  label: 'build',
  children: [{
    size: '44 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'build',
    children: [{
      size: '2 KB',
      modified: '02/21/2015 at 10:04am',
      label: 'finder.js'
    }]
  }, {
    size: '11 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'finder.js'
  }]
}, {
  size: '9 KB',
  modified: '02/21/2015 at 10:04am',
  label: 'example',
  children: [{
    size: '10 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'example',
    children: [{
      size: '33 KB',
      modified: '02/21/2015 at 10:04am',
      label: 'bundle.js'
    }, {
      size: '103 KB',
      modified: '02/21/2015 at 10:04am',
      label: 'finderjs.css'
    }, {
      size: '56 KB',
      modified: '02/21/2015 at 10:04am',
      label: 'index.html'
    }, {
      size: '122 KB',
      modified: '02/21/2015 at 10:04am',
      label: 'index.js'
    }]
  }, {
    size: '8 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'bundle.js'
  }, {
    size: '6 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'finderjs.css'
  }, {
    size: '4 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'index.html'
  }, {
    size: '2 KB',
    modified: '02/21/2015 at 10:04am',
    label: 'index.js'
  }]
}, {
  size: '10 KB',
  modified: '02/21/2015 at 10:04am',
  label: 'test',
  children: [{
    size: '10 KB',
    modified: '03/09/2014 at 11:45am',
    label: 'index.js'
  }, {
    size: '10 KB',
    modified: '03/09/2014 at 11:45am',
    label: 'test.js'
  }, {
    size: '10 KB',
    modified: '03/09/2014 at 11:45am',
    label: 'util.js'
  }]
}, {
  size: '56 KB',
  modified: '02/21/2015 at 10:04am',
  label: '.codeclimate.yml'
}, {
  size: '33 KB',
  modified: '02/21/2015 at 10:04am',
  label: '.eslintrc'
}, {
  size: '101 KB',
  modified: '02/21/2015 at 10:04am',
  label: '.gitignore'
}, {
  size: '96 KB',
  modified: '02/21/2015 at 10:04am',
  label: '.travis.yml'
}, {
  size: '69 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'index.js'
}, {
  size: '666 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'LICENSE'
}, {
  size: '187 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'Makefile'
}, {
  size: '45 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'package.json'
}, {
  size: '10 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'README.md'
}, {
  size: '7 KB',
  modified: '02/15/2012 at 1:02pm',
  label: 'util.js'
}, {
  size: '10 KB',
  modified: '02/21/2015 at 10:04am',
  label: 'Project page',
  type: 'github-url',
  url: 'https://github.com/mynameistechno/finderjs'
}];
var emitter;

module.exports = createExample;


function createExample(container) {
  emitter = finder(container, data, {
    createItemContent: createItemContent
  });

  // when a leaf node selected, display the details in a new column
  emitter.on('leaf-selected', function selected(item) {
    emitter.emit('create-column', createSimpleColumn(item));
  });

  // scroll to the right if necessary when a new column is created
  emitter.on('column-created', function columnCreated() {
    container.scrollLeft = container.scrollWidth - container.clientWidth;
  });
}

// how each item in a column should be rendered
function createItemContent(cfg, item) {
  var data = item.children || cfg.data;
  var frag = document.createDocumentFragment();
  var label = _.el('span');
  var iconPrepend = _.el('i');
  var iconAppend = _.el('i');
  var prependClasses = ['fa'];
  var appendClasses = ['fa'];

  // prepended icon
  if (data) {
    prependClasses.push('fa-folder');
  } else if (item.type === 'github-url') {
    prependClasses.push('fa-github');
  } else {
    prependClasses.push('fa-file-o');
  }
  _.addClass(iconPrepend, prependClasses);

  // text label
  _.append(label, [iconPrepend, _.text(item.label)]);
  frag.appendChild(label);

  // appended icon
  if (data) {
    appendClasses.push('fa-caret-right');
  } else if ('url' in item) {
    appendClasses.push('fa-external-link');
  }
  _.addClass(iconAppend, appendClasses);
  frag.appendChild(iconAppend);

  return frag;
}

function createSimpleColumn(item) {
  var div = _.el('div.fjs-col.leaf-col');
  var row = _.el('div.leaf-row');
  var filename = _.text(item.label);
  var i = _.el('i');
  var size = _.el('div.meta');
  var sizeLabel = _.el('strong');
  var mod = _.el('div.meta');
  var modLabel = _.el('strong');

  _.addClass(i, ['fa', 'fa-file-o']);
  _.append(sizeLabel, _.text('Size: '));
  _.append(size, [sizeLabel, _.text(item.size)]);
  _.append(modLabel, _.text('Modified: '));
  _.append(mod, [modLabel, _.text(item.modified)]);
  _.append(row, [i, filename, size, mod]);

  return _.append(div, row);
}

},{"../index":4,"../util":17}],3:[function(require,module,exports){
'use strict';

var exampleStatic = require('./example-static');
var exampleAsync = require('./example-async');


exampleStatic(document.getElementById('container1'));
exampleAsync(document.getElementById('container2'));

},{"./example-async":1,"./example-static":2}],4:[function(require,module,exports){
/**
 * finder.js module.
 * @module finderjs
 */
'use strict';

var extend = require('xtend');
var document = require('global/document');
var EventEmitter = require('eventemitter3');
var isArray = require('x-is-array');

var _ = require('./util');
var defaults = {
  className: {
    container: 'fjs-container',
    col: 'fjs-col',
    list: 'fjs-list',
    item: 'fjs-item',
    active: 'fjs-active',
    children: 'fjs-has-children',
    url: 'fjs-url',
    itemPrepend: 'fjs-item-prepend',
    itemContent: 'fjs-item-content',
    itemAppend: 'fjs-item-append'
  }
};

module.exports = finder;

/**
 * @param  {element} container
 * @param  {Array|Function} data
 * @param  {object} options
 * @return {object} event emitter
 */
function finder(container, data, options) {
  var emitter = new EventEmitter();
  var cfg = extend(defaults, {
    container: container,
    emitter: emitter
  }, options);

  // xtend doesn't deep merge
  cfg.className = extend(defaults.className, options ? options.className : {});

  // store the fn so we can call it on subsequent selections
  if (typeof data === 'function') {
    cfg.data = data;
  }

  // dom events
  container.addEventListener(
    'click', finder.clickEvent.bind(null, cfg, emitter));
  container.addEventListener(
    'keydown', finder.keydownEvent.bind(null, container, cfg, emitter));

  // internal events
  emitter.on('item-selected', finder.itemSelected.bind(null, cfg, emitter));
  emitter.on(
    'create-column', finder.addColumn.bind(null, container, cfg, emitter));
  emitter.on(
    'navigate', finder.navigate.bind(null, cfg, emitter));

  _.addClass(container, cfg.className.container);
  finder.createColumn(data, cfg, emitter);
  container.setAttribute('tabindex', 0);

  return emitter;
}

/**
 * @param {element} container
 * @param {element} column to append to container
 */
finder.addColumn = function addColumn(container, cfg, emitter, col) {
  container.appendChild(col);

  emitter.emit('column-created', col);
};

/**
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event value
 */
finder.itemSelected = function itemSelected(cfg, emitter, value) {
  var itemEl = value.item;
  var item = itemEl._item;
  var col = value.col;
  var data = item.children || cfg.data;
  var activeEls = col.getElementsByClassName(cfg.className.active);

  if (activeEls.length) {
    _.removeClass(activeEls[0], cfg.className.active);
  }
  _.addClass(itemEl, cfg.className.active);
  _.nextSiblings(col).map(_.remove);

  if (data) {
    finder.createColumn(data, cfg, emitter, item);
  } else if (item.url) {
    document.location.href = item.url;
  } else {
    emitter.emit('leaf-selected', item);
  }
};

/**
 * Click event handler for whole container
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event
 */
finder.clickEvent = function clickEvent(cfg, emitter, event) {
  var el = event.target;
  var col = _.closest(el, function test(el) {
    return _.hasClass(el, cfg.className.col);
  });
  var item = _.closest(el, function test(el) {
    return _.hasClass(el, cfg.className.item);
  });

  _.stop(event);

  // list item clicked
  if (item) {
    emitter.emit('item-selected', {
      col: col,
      item: item
    });
  }
};

/**
 * Keydown event handler for container
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event
 */
finder.keydownEvent = function keydownEvent(container, cfg, emitter, event) {
  var arrowCodes = {
    38: 'up',
    39: 'right',
    40: 'down',
    37: 'left'
  };

  if (event.keyCode in arrowCodes) {
    _.stop(event);

    emitter.emit('navigate', {
      direction: arrowCodes[event.keyCode],
      container: container
    });
  }
};

/**
 * Navigate the finder up, down, right, or left
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {object} event value - `container` prop contains a reference to the
 * container, and `direction` can be 'up', 'down', 'right', 'left'
 */
finder.navigate = function navigate(cfg, emitter, value) {
  var active = finder.findLastActive(value.container, cfg);
  var target = null;
  var dir = value.direction;
  var item;
  var col;

  if (active) {
    item = active.item;
    col = active.col;

    if (dir === 'up' && item.previousSibling) {
      target = item.previousSibling;
    } else if (dir === 'down' && item.nextSibling) {
      target = item.nextSibling;
    } else if (dir === 'right' && col.nextSibling) {
      col = col.nextSibling;
      target = _.first(col, '.' + cfg.className.item);
    } else if (dir === 'left' && col.previousSibling) {
      col = col.previousSibling;
      target = _.first(col, '.' + cfg.className.active) ||
        _.first(col, '.' + cfg.className.item);
    }
  } else {
    col = _.first(value.container, '.' + cfg.className.col);
    target = _.first(col, '.' + cfg.className.item);
  }

  if (target) {
    emitter.emit('item-selected', {
      col: col,
      item: target
    });
  }
};

/**
 * Find last (right-most) active item and column
 * @param  {Element} container
 * @param  {Object} config
 * @return {Object}
 */
finder.findLastActive = function findLastActive(container, cfg) {
  var activeItems = container.getElementsByClassName(cfg.className.active);
  var item;
  var col;

  if (!activeItems.length) {
    return null;
  }

  item = activeItems[activeItems.length - 1];
  col = _.closest(item, function test(el) {
    return _.hasClass(el, cfg.className.col);
  });

  return {
    col: col,
    item: item
  };
};

/**
 * @param  {object} data
 * @param  {object} config
 * @param  {object} event emitter
 * @param  {parent} [parent] - parent item that clicked/triggered createColumn
 * @return {element} column
 */
finder.createColumn = function createColumn(data, cfg, emitter, parent) {
  var div;
  var list;
  function callback(data) {
    finder.createColumn(data, cfg, emitter, parent);
  };

  if (typeof data === 'function') {
    data.call(null, parent, cfg, callback);
  } else if (isArray(data)) {
    list = finder.createList(data, cfg);
    div = _.el('div');
    div.appendChild(list);
    _.addClass(div, cfg.className.col);

    emitter.emit('create-column', div);
  } else {
    throw new Error('Unknown data type');
  }
};

/**
 * @param  {array} data
 * @param  {object} config
 * @return {element} list
 */
finder.createList = function createList(data, cfg) {
  var ul = _.el('ul');
  var items = data.map(finder.createItem.bind(null, cfg));
  var docFrag;

  docFrag = items.reduce(function each(docFrag, curr) {
    docFrag.appendChild(curr);
    return docFrag;
  }, document.createDocumentFragment());

  ul.appendChild(docFrag);
  _.addClass(ul, cfg.className.list);

  return ul;
};

/**
 * Default item render fn
 * @param  {object} cfg config object
 * @param  {object} item data
 * @return {DocumentFragment}
 */
finder.createItemContent = function createItemContent(cfg, item) {
  var frag = document.createDocumentFragment();
  var prepend = _.el('div.' + cfg.className.itemPrepend);
  var content = _.el('div.' + cfg.className.itemContent);
  var append = _.el('div.' + cfg.className.itemAppend);

  frag.appendChild(prepend);
  content.appendChild(document.createTextNode(item.label));
  frag.appendChild(content);
  frag.appendChild(append);

  return frag;
};

/**
 * @param  {object} cfg config object
 * @param  {object} item data
 * @return {element} list item
 */
finder.createItem = function createItem(cfg, item) {
  var frag = document.createDocumentFragment();
  var liClassNames = [cfg.className.item];
  var li = _.el('li');
  var a = _.el('a');
  var createItemContent = cfg.createItemContent || finder.createItemContent;

  frag = createItemContent.call(null, cfg, item);
  a.appendChild(frag);

  a.href = '';
  a.setAttribute('tabindex', -1);
  if (item.url) {
    a.href = item.url;
    liClassNames.push(cfg.className.url);
  }
  if (item.className) {
    liClassNames.push(item.className);
  }
  if (item.children) {
    liClassNames.push(cfg.className.children);
  }
  _.addClass(li, liClassNames);
  li.appendChild(a);
  li._item = item;

  return li;
};

},{"./util":17,"eventemitter3":6,"global/document":7,"x-is-array":9,"xtend":16}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],7:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":5}],8:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],10:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var parseHeaders = require("parse-headers")



module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest


function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function createXHR(options, callback) {
    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":8,"once":11,"parse-headers":15}],11:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],12:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":13}],13:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],14:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],15:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":12,"trim":14}],16:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],17:[function(require,module,exports){
/**
 * util.js module.
 * @module util
 */
'use strict';

var document = require('global/document');
var isArray = require('x-is-array');

/**
 * check if variable is an element
 * @param  {*} potential element
 * @return {Boolean} return true if is an element
 */
function isElement(element) {
  try {
    return element instanceof Element;
  } catch (error) {
    return !!(element && element.nodeType === 1);
  }
}

/**
 * createElement shortcut
 * @param  {String} tag
 * @return {Element} element
 */
function el(element) {
  var classes = [];
  var tag = element;
  var el;

  if (isElement(element)) {
    return element;
  }

  classes = element.split('.');
  if (classes.length > 1) {
    tag = classes[0];
  }
  el = document.createElement(tag);
  addClass(el, classes.slice(1));

  return el;
}

/**
 * createDocumentFragment shortcut
 * @return {DocumentFragment}
 */
function frag() {
  return document.createDocumentFragment();
}

/**
 * createTextNode shortcut
 * @return {TextNode}
 */
function text(text) {
  return document.createTextNode(text);
}

/**
 * remove element
 * @param  {Element} element to remove
 * @return {Element} removed element
 */
function remove(element) {
  if ('remove' in element) {
    element.remove();
  } else {
    element.parentNode.removeChild(element);
  }

  return element;
}

/**
 * Find first element that tests true, starting with the element itself
 * and traversing up through its ancestors
 * @param  {Element} element
 * @param  {Function} test fn - return true when element located
 * @return {Element}
 */
function closest(element, test) {
  var el = element;

  while (el) {
    if (test(el)) {
      return el;
    }
    el = el.parentNode;
  }

  return null;
}

/**
 * Add one or more classnames to an element
 * @param {Element} element
 * @param {Array.<string>|String} array of classnames or string with
 * classnames separated by whitespace
 * @return {Element}
 */
function addClass(element, className) {
  var classNames = className;

  function _addClass(el, cn) {
    if (!el.className) {
      el.className = cn;
    } else if (!hasClass(el, cn)) {
      el.className += ' ' + cn;
    }
  }

  if (!isArray(className)) {
    classNames = className.trim().split(/\s+/);
  }
  classNames.forEach(_addClass.bind(null, element));

  return element;
}

/**
 * Remove a class from an element
 * @param  {Element} element
 * @param  {Array.<string>|String} array of classnames or string with
 * @return {Element}
 */
function removeClass(element, className) {
  var classNames = className;

  function _removeClass(el, cn) {
    var classRegex = new RegExp('(?:^|\\s)' + cn + '(?!\\S)', 'g');
    el.className = el.className.replace(classRegex, '').trim();
  }

  if (!isArray(className)) {
    classNames = className.trim().split(/\s+/);
  }
  classNames.forEach(_removeClass.bind(null, element));

  return element;
}

/**
 * Check if element has a class
 * @param  {Element}  element
 * @param  {String}  className
 * @return {boolean}
 */
function hasClass(element, className) {
  if (!element || !('className' in element)) {
    return false;
  }

  return element.className.split(/\s+/).indexOf(className) !== -1;
}

/**
 * Return all next siblings
 * @param  {Element} element
 * @return {Array.<element>}
 */
function nextSiblings(element) {
  var next = element.nextSibling;
  var siblings = [];

  while (next) {
    siblings.push(next);
    next = next.nextSibling;
  }

  return siblings;
}

/**
 * Return all prev siblings
 * @param  {Element} element
 * @return {Array.<element>}
 */
function previousSiblings(element) {
  var prev = element.previousSibling;
  var siblings = [];

  while (prev) {
    siblings.push(prev);
    prev = prev.previousSibling;
  }

  return siblings;
}

/**
 * Stop event propagation
 * @param  {Event} event
 * @return {Event}
 */
function stop(event) {
  event.stopPropagation();
  event.preventDefault();

  return event;
}

/**
 * Returns first element in parent that matches selector
 * @param  {Element} parent
 * @param  {String} selector
 * @return {Element}
 */
function first(parent, selector) {
  return parent.querySelector(selector);
}

function append(parent, children) {
  var _frag = frag();
  var children = isArray(children) ? children : [children];

  children.forEach(_frag.appendChild.bind(_frag));
  parent.appendChild(_frag);

  return parent;
}

module.exports = {
  el: el,
  frag: frag,
  text: text,
  closest: closest,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  nextSiblings: nextSiblings,
  previousSiblings: previousSiblings,
  remove: remove,
  stop: stop,
  first: first,
  append: append
};

},{"global/document":7,"x-is-array":9}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2V4YW1wbGUtYXN5bmMuanMiLCJleGFtcGxlL2V4YW1wbGUtc3RhdGljLmpzIiwiZXhhbXBsZS9pbmRleC5qcyIsImluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL3gtaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMveGhyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvb25jZS9vbmNlLmpzIiwibm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy9mb3ItZWFjaC9ub2RlX21vZHVsZXMvaXMtZnVuY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9wYXJzZS1oZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL3h0ZW5kL2ltbXV0YWJsZS5qcyIsInV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFVBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHhociA9IHJlcXVpcmUoJ3hocicpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJyk7XG52YXIgZmluZGVyID0gcmVxdWlyZSgnLi4vaW5kZXgnKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgZW1pdHRlcjtcbnZhciB4aHJDbnQgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUV4YW1wbGU7XG5cblxuZnVuY3Rpb24gY3JlYXRlRXhhbXBsZShjb250YWluZXIpIHtcbiAgZW1pdHRlciA9IGZpbmRlcihjb250YWluZXIsIHJlbW90ZVNvdXJjZSwge1xuICAgIGNyZWF0ZUl0ZW1Db250ZW50OiBjcmVhdGVJdGVtQ29udGVudFxuICB9KTtcblxuICAvLyBzY3JvbGwgdG8gdGhlIHJpZ2h0IGlmIG5lY2Vzc2FyeVxuICBlbWl0dGVyLm9uKCdjb2x1bW4tY3JlYXRlZCcsIGZ1bmN0aW9uIGNvbHVtbkNyZWF0ZWQoKSB7XG4gICAgY29udGFpbmVyLnNjcm9sbExlZnQgPSBjb250YWluZXIuc2Nyb2xsV2lkdGggLSBjb250YWluZXIuY2xpZW50V2lkdGg7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW1vdGVTb3VyY2UocGFyZW50LCBjZmcsIGNhbGxiYWNrKSB7XG4gIHZhciBsb2FkaW5nSW5kaWNhdG9yID0gY3JlYXRlTG9hZGluZ0NvbHVtbigpO1xuICB2YXIgeGhyVWlkID0gKyt4aHJDbnQ7XG4gIHZhciB0eXBlID0gJ3JlZ2lvbic7XG5cbiAgLy8gZGV0ZXJtaW5lIHdoaWNoIGNvbHVtbiB3ZSdyZSBvbiBiYXNlZCBvbiBwcmV2aW91cyBzZWxlY3Rpb25cbiAgaWYgKHBhcmVudCkge1xuICAgIGlmIChwYXJlbnQudHlwZSA9PT0gJ3JlZ2lvbicpIHtcbiAgICAgIHR5cGUgPSAnc3VicmVnaW9uJztcbiAgICB9IGVsc2UgaWYgKHBhcmVudC50eXBlID09PSAnc3VicmVnaW9uJykge1xuICAgICAgdHlwZSA9ICduYW1lJzsgLy8gY291bnRyeVxuICAgIH0gZWxzZSB7IC8vIG11c3QgYmUgYSBjb3VudHJ5XG4gICAgICByZXR1cm4gY2ZnLmVtaXR0ZXIuZW1pdCgnY3JlYXRlLWNvbHVtbicsIGNyZWF0ZVNpbXBsZUNvbHVtbihwYXJlbnQpKTtcbiAgICB9XG4gIH1cblxuICAvLyBsb2FkaW5nIHNwaW5uZXJcbiAgY2ZnLmVtaXR0ZXIuZW1pdCgnY3JlYXRlLWNvbHVtbicsIGxvYWRpbmdJbmRpY2F0b3IpO1xuXG4gIC8vIHhociByZXF1ZXN0XG4gIHhocih7XG4gICAgdXJpOiAnaHR0cHM6Ly9yZXN0Y291bnRyaWVzLmV1L3Jlc3QvdjEvYWxsJ1xuICB9LCBmdW5jdGlvbiBkb25lKGVyciwgcmVzcCwgYm9keSkge1xuICAgIHZhciByYXdEYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICB2YXIgZGF0YSA9IHVuaXF1ZUNvdW50cnlEYXRhKHJhd0RhdGEsIHR5cGUsIHBhcmVudCk7XG5cbiAgICAvLyBjbGVhciBsb2FkaW5nIHNwaW5uZXJcbiAgICBfLnJlbW92ZShsb2FkaW5nSW5kaWNhdG9yKTtcblxuICAgIC8vIHN0YWxlIHJlcXVlc3RcbiAgICBpZiAoeGhyVWlkICE9PSB4aHJDbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBleGVjdXRlIGNhbGxiYWNrXG4gICAgY2FsbGJhY2soZGF0YSk7XG4gIH0pO1xufVxuXG4vLyB0cmFuc2Zvcm0gcmVzdCBjb3VudHJ5IGRhdGEgZm9yIGV4YW1wbGVcbmZ1bmN0aW9uIHVuaXF1ZUNvdW50cnlEYXRhKGRhdGEsIHR5cGUsIHBhcmVudCkge1xuICB2YXIgaGFzaCA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uIGVhY2gocHJldiwgY3Vycikge1xuICAgIGlmICghKGN1cnJbdHlwZV0gaW4gcHJldikpIHtcbiAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgaWYgKHBhcmVudC5sYWJlbCA9PT0gY3VycltwYXJlbnQudHlwZV0pIHtcbiAgICAgICAgICBwcmV2W2N1cnJbdHlwZV1dID0gY3VycjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjdXJyW3R5cGVdKSB7XG4gICAgICAgIHByZXZbY3Vyclt0eXBlXV0gPSBjdXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKGhhc2gpLm1hcChmdW5jdGlvbiBlYWNoKGl0ZW0pIHtcbiAgICByZXR1cm4gZXh0ZW5kKGhhc2hbaXRlbV0sIHtcbiAgICAgIGxhYmVsOiBpdGVtLFxuICAgICAgdHlwZTogdHlwZSA9PT0gJ25hbWUnID8gJ2NvdW50cnknIDogdHlwZVxuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gaXRlbSByZW5kZXJcbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1Db250ZW50KGNmZywgaXRlbSkge1xuICB2YXIgZGF0YSA9IGl0ZW0uY2hpbGRyZW4gfHwgY2ZnLmRhdGE7XG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB2YXIgbGFiZWwgPSBfLmVsKCdzcGFuJyk7XG4gIHZhciBpY29uUHJlcGVuZCA9IF8uZWwoJ2knKTtcbiAgdmFyIGljb25BcHBlbmQgPSBfLmVsKCdpJyk7XG4gIHZhciBwcmVwZW5kQ2xhc3NlcyA9IFsnZmEnXTtcbiAgdmFyIGFwcGVuZENsYXNzZXMgPSBbJ2ZhJ107XG5cbiAgLy8gcHJlcGVuZGVkIGljb25cbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3JlZ2lvbicpIHtcbiAgICBwcmVwZW5kQ2xhc3Nlcy5wdXNoKCdmYS1nbG9iZScpO1xuICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ3N1YnJlZ2lvbicpIHtcbiAgICBwcmVwZW5kQ2xhc3Nlcy5wdXNoKCdmYS1jb21wYXNzJyk7XG4gIH0gZWxzZSB7XG4gICAgcHJlcGVuZENsYXNzZXMucHVzaCgnZmEtbWFwLW1hcmtlcicpO1xuICB9XG4gIF8uYWRkQ2xhc3MoaWNvblByZXBlbmQsIHByZXBlbmRDbGFzc2VzKTtcblxuICAvLyB0ZXh0IGxhYmVsXG4gIGxhYmVsLmFwcGVuZENoaWxkKGljb25QcmVwZW5kKTtcbiAgbGFiZWwuYXBwZW5kQ2hpbGQoXy50ZXh0KGl0ZW0ubGFiZWwpKTtcbiAgZnJhZy5hcHBlbmRDaGlsZChsYWJlbCk7XG5cbiAgLy8gYXBwZW5kZWQgaWNvblxuICBpZiAoZGF0YSkge1xuICAgIGFwcGVuZENsYXNzZXMucHVzaCgnZmEtY2FyZXQtcmlnaHQnKTtcbiAgfSBlbHNlIGlmICgndXJsJyBpbiBpdGVtKSB7XG4gICAgYXBwZW5kQ2xhc3Nlcy5wdXNoKCdmYS1leHRlcm5hbC1saW5rJyk7XG4gIH1cbiAgXy5hZGRDbGFzcyhpY29uQXBwZW5kLCBhcHBlbmRDbGFzc2VzKTtcbiAgZnJhZy5hcHBlbmRDaGlsZChpY29uQXBwZW5kKTtcblxuICByZXR1cm4gZnJhZztcbn1cblxuZnVuY3Rpb24gY3JlYXRlTG9hZGluZ0NvbHVtbigpIHtcbiAgdmFyIGRpdiA9IF8uZWwoJ2Rpdi5manMtY29sLmxlYWYtY29sJyk7XG4gIHZhciByb3cgPSBfLmVsKCdkaXYubGVhZi1yb3cnKTtcbiAgdmFyIHRleHQgPSBfLnRleHQoJ0xvYWRpbmcuLi4nKTtcbiAgdmFyIGkgPSBfLmVsKCdzcGFuJyk7XG5cbiAgXy5hZGRDbGFzcyhpLCBbJ2ZhJywgJ2ZhLXJlZnJlc2gnLCAnZmEtc3BpbiddKTtcbiAgXy5hcHBlbmQocm93LCBbaSwgdGV4dF0pO1xuXG4gIHJldHVybiBfLmFwcGVuZChkaXYsIHJvdyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNpbXBsZUNvbHVtbihpdGVtKSB7XG4gIHZhciBkaXYgPSBfLmVsKCdkaXYuZmpzLWNvbC5sZWFmLWNvbCcpO1xuICB2YXIgcm93ID0gXy5lbCgnZGl2LmxlYWYtcm93Jyk7XG4gIHZhciBmaWxlbmFtZSA9IF8udGV4dChpdGVtLmxhYmVsKTtcbiAgdmFyIGkgPSBfLmVsKCdpJyk7XG4gIHZhciBjYXBpdGFsID0gXy5lbCgnZGl2Lm1ldGEnKTtcbiAgdmFyIGNhcGl0YWxMYWJlbCA9IF8uZWwoJ3N0cm9uZycpO1xuICB2YXIgcG9wdWxhdGlvbiA9IF8uZWwoJ2Rpdi5tZXRhJyk7XG4gIHZhciBwb3B1bGF0aW9uTGFiZWwgID0gXy5lbCgnc3Ryb25nJyk7XG5cbiAgXy5hZGRDbGFzcyhpLCBbJ2ZhJywgJ2ZhLWluZm8tY2lyY2xlJ10pO1xuICBfLmFwcGVuZChjYXBpdGFsTGFiZWwsIF8udGV4dCgnQ2FwaXRhbDogJykpO1xuICBfLmFwcGVuZChjYXBpdGFsLCBbY2FwaXRhbExhYmVsLCBfLnRleHQoaXRlbS5jYXBpdGFsKV0pO1xuICBfLmFwcGVuZChwb3B1bGF0aW9uTGFiZWwgLCBfLnRleHQoJ1BvcHVsYXRpb246ICcpKTtcbiAgXy5hcHBlbmQocG9wdWxhdGlvbiwgW1xuICAgIHBvcHVsYXRpb25MYWJlbCxcbiAgICBfLnRleHQoTnVtYmVyKGl0ZW0ucG9wdWxhdGlvbikudG9Mb2NhbGVTdHJpbmcoKSlcbiAgXSk7XG4gIF8uYXBwZW5kKHJvdywgW2ksIGZpbGVuYW1lLCBjYXBpdGFsLCBwb3B1bGF0aW9uXSk7XG5cbiAgcmV0dXJuIF8uYXBwZW5kKGRpdiwgcm93KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZpbmRlciA9IHJlcXVpcmUoJy4uL2luZGV4Jyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxuLy8gc2FtcGxlIGRhdGFcbnZhciBkYXRhID0gW3tcbiAgc2l6ZTogJzEwIEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICBsYWJlbDogJ2J1aWxkJyxcbiAgY2hpbGRyZW46IFt7XG4gICAgc2l6ZTogJzQ0IEtCJyxcbiAgICBtb2RpZmllZDogJzAyLzIxLzIwMTUgYXQgMTA6MDRhbScsXG4gICAgbGFiZWw6ICdidWlsZCcsXG4gICAgY2hpbGRyZW46IFt7XG4gICAgICBzaXplOiAnMiBLQicsXG4gICAgICBtb2RpZmllZDogJzAyLzIxLzIwMTUgYXQgMTA6MDRhbScsXG4gICAgICBsYWJlbDogJ2ZpbmRlci5qcydcbiAgICB9XVxuICB9LCB7XG4gICAgc2l6ZTogJzExIEtCJyxcbiAgICBtb2RpZmllZDogJzAyLzIxLzIwMTUgYXQgMTA6MDRhbScsXG4gICAgbGFiZWw6ICdmaW5kZXIuanMnXG4gIH1dXG59LCB7XG4gIHNpemU6ICc5IEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICBsYWJlbDogJ2V4YW1wbGUnLFxuICBjaGlsZHJlbjogW3tcbiAgICBzaXplOiAnMTAgS0InLFxuICAgIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgICBsYWJlbDogJ2V4YW1wbGUnLFxuICAgIGNoaWxkcmVuOiBbe1xuICAgICAgc2l6ZTogJzMzIEtCJyxcbiAgICAgIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgICAgIGxhYmVsOiAnYnVuZGxlLmpzJ1xuICAgIH0sIHtcbiAgICAgIHNpemU6ICcxMDMgS0InLFxuICAgICAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICAgICAgbGFiZWw6ICdmaW5kZXJqcy5jc3MnXG4gICAgfSwge1xuICAgICAgc2l6ZTogJzU2IEtCJyxcbiAgICAgIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgICAgIGxhYmVsOiAnaW5kZXguaHRtbCdcbiAgICB9LCB7XG4gICAgICBzaXplOiAnMTIyIEtCJyxcbiAgICAgIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgICAgIGxhYmVsOiAnaW5kZXguanMnXG4gICAgfV1cbiAgfSwge1xuICAgIHNpemU6ICc4IEtCJyxcbiAgICBtb2RpZmllZDogJzAyLzIxLzIwMTUgYXQgMTA6MDRhbScsXG4gICAgbGFiZWw6ICdidW5kbGUuanMnXG4gIH0sIHtcbiAgICBzaXplOiAnNiBLQicsXG4gICAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICAgIGxhYmVsOiAnZmluZGVyanMuY3NzJ1xuICB9LCB7XG4gICAgc2l6ZTogJzQgS0InLFxuICAgIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgICBsYWJlbDogJ2luZGV4Lmh0bWwnXG4gIH0sIHtcbiAgICBzaXplOiAnMiBLQicsXG4gICAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICAgIGxhYmVsOiAnaW5kZXguanMnXG4gIH1dXG59LCB7XG4gIHNpemU6ICcxMCBLQicsXG4gIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgbGFiZWw6ICd0ZXN0JyxcbiAgY2hpbGRyZW46IFt7XG4gICAgc2l6ZTogJzEwIEtCJyxcbiAgICBtb2RpZmllZDogJzAzLzA5LzIwMTQgYXQgMTE6NDVhbScsXG4gICAgbGFiZWw6ICdpbmRleC5qcydcbiAgfSwge1xuICAgIHNpemU6ICcxMCBLQicsXG4gICAgbW9kaWZpZWQ6ICcwMy8wOS8yMDE0IGF0IDExOjQ1YW0nLFxuICAgIGxhYmVsOiAndGVzdC5qcydcbiAgfSwge1xuICAgIHNpemU6ICcxMCBLQicsXG4gICAgbW9kaWZpZWQ6ICcwMy8wOS8yMDE0IGF0IDExOjQ1YW0nLFxuICAgIGxhYmVsOiAndXRpbC5qcydcbiAgfV1cbn0sIHtcbiAgc2l6ZTogJzU2IEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICBsYWJlbDogJy5jb2RlY2xpbWF0ZS55bWwnXG59LCB7XG4gIHNpemU6ICczMyBLQicsXG4gIG1vZGlmaWVkOiAnMDIvMjEvMjAxNSBhdCAxMDowNGFtJyxcbiAgbGFiZWw6ICcuZXNsaW50cmMnXG59LCB7XG4gIHNpemU6ICcxMDEgS0InLFxuICBtb2RpZmllZDogJzAyLzIxLzIwMTUgYXQgMTA6MDRhbScsXG4gIGxhYmVsOiAnLmdpdGlnbm9yZSdcbn0sIHtcbiAgc2l6ZTogJzk2IEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICBsYWJlbDogJy50cmF2aXMueW1sJ1xufSwge1xuICBzaXplOiAnNjkgS0InLFxuICBtb2RpZmllZDogJzAyLzE1LzIwMTIgYXQgMTowMnBtJyxcbiAgbGFiZWw6ICdpbmRleC5qcydcbn0sIHtcbiAgc2l6ZTogJzY2NiBLQicsXG4gIG1vZGlmaWVkOiAnMDIvMTUvMjAxMiBhdCAxOjAycG0nLFxuICBsYWJlbDogJ0xJQ0VOU0UnXG59LCB7XG4gIHNpemU6ICcxODcgS0InLFxuICBtb2RpZmllZDogJzAyLzE1LzIwMTIgYXQgMTowMnBtJyxcbiAgbGFiZWw6ICdNYWtlZmlsZSdcbn0sIHtcbiAgc2l6ZTogJzQ1IEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8xNS8yMDEyIGF0IDE6MDJwbScsXG4gIGxhYmVsOiAncGFja2FnZS5qc29uJ1xufSwge1xuICBzaXplOiAnMTAgS0InLFxuICBtb2RpZmllZDogJzAyLzE1LzIwMTIgYXQgMTowMnBtJyxcbiAgbGFiZWw6ICdSRUFETUUubWQnXG59LCB7XG4gIHNpemU6ICc3IEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8xNS8yMDEyIGF0IDE6MDJwbScsXG4gIGxhYmVsOiAndXRpbC5qcydcbn0sIHtcbiAgc2l6ZTogJzEwIEtCJyxcbiAgbW9kaWZpZWQ6ICcwMi8yMS8yMDE1IGF0IDEwOjA0YW0nLFxuICBsYWJlbDogJ1Byb2plY3QgcGFnZScsXG4gIHR5cGU6ICdnaXRodWItdXJsJyxcbiAgdXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL215bmFtZWlzdGVjaG5vL2ZpbmRlcmpzJ1xufV07XG52YXIgZW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFeGFtcGxlO1xuXG5cbmZ1bmN0aW9uIGNyZWF0ZUV4YW1wbGUoY29udGFpbmVyKSB7XG4gIGVtaXR0ZXIgPSBmaW5kZXIoY29udGFpbmVyLCBkYXRhLCB7XG4gICAgY3JlYXRlSXRlbUNvbnRlbnQ6IGNyZWF0ZUl0ZW1Db250ZW50XG4gIH0pO1xuXG4gIC8vIHdoZW4gYSBsZWFmIG5vZGUgc2VsZWN0ZWQsIGRpc3BsYXkgdGhlIGRldGFpbHMgaW4gYSBuZXcgY29sdW1uXG4gIGVtaXR0ZXIub24oJ2xlYWYtc2VsZWN0ZWQnLCBmdW5jdGlvbiBzZWxlY3RlZChpdGVtKSB7XG4gICAgZW1pdHRlci5lbWl0KCdjcmVhdGUtY29sdW1uJywgY3JlYXRlU2ltcGxlQ29sdW1uKGl0ZW0pKTtcbiAgfSk7XG5cbiAgLy8gc2Nyb2xsIHRvIHRoZSByaWdodCBpZiBuZWNlc3Nhcnkgd2hlbiBhIG5ldyBjb2x1bW4gaXMgY3JlYXRlZFxuICBlbWl0dGVyLm9uKCdjb2x1bW4tY3JlYXRlZCcsIGZ1bmN0aW9uIGNvbHVtbkNyZWF0ZWQoKSB7XG4gICAgY29udGFpbmVyLnNjcm9sbExlZnQgPSBjb250YWluZXIuc2Nyb2xsV2lkdGggLSBjb250YWluZXIuY2xpZW50V2lkdGg7XG4gIH0pO1xufVxuXG4vLyBob3cgZWFjaCBpdGVtIGluIGEgY29sdW1uIHNob3VsZCBiZSByZW5kZXJlZFxuZnVuY3Rpb24gY3JlYXRlSXRlbUNvbnRlbnQoY2ZnLCBpdGVtKSB7XG4gIHZhciBkYXRhID0gaXRlbS5jaGlsZHJlbiB8fCBjZmcuZGF0YTtcbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBsYWJlbCA9IF8uZWwoJ3NwYW4nKTtcbiAgdmFyIGljb25QcmVwZW5kID0gXy5lbCgnaScpO1xuICB2YXIgaWNvbkFwcGVuZCA9IF8uZWwoJ2knKTtcbiAgdmFyIHByZXBlbmRDbGFzc2VzID0gWydmYSddO1xuICB2YXIgYXBwZW5kQ2xhc3NlcyA9IFsnZmEnXTtcblxuICAvLyBwcmVwZW5kZWQgaWNvblxuICBpZiAoZGF0YSkge1xuICAgIHByZXBlbmRDbGFzc2VzLnB1c2goJ2ZhLWZvbGRlcicpO1xuICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2dpdGh1Yi11cmwnKSB7XG4gICAgcHJlcGVuZENsYXNzZXMucHVzaCgnZmEtZ2l0aHViJyk7XG4gIH0gZWxzZSB7XG4gICAgcHJlcGVuZENsYXNzZXMucHVzaCgnZmEtZmlsZS1vJyk7XG4gIH1cbiAgXy5hZGRDbGFzcyhpY29uUHJlcGVuZCwgcHJlcGVuZENsYXNzZXMpO1xuXG4gIC8vIHRleHQgbGFiZWxcbiAgXy5hcHBlbmQobGFiZWwsIFtpY29uUHJlcGVuZCwgXy50ZXh0KGl0ZW0ubGFiZWwpXSk7XG4gIGZyYWcuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gIC8vIGFwcGVuZGVkIGljb25cbiAgaWYgKGRhdGEpIHtcbiAgICBhcHBlbmRDbGFzc2VzLnB1c2goJ2ZhLWNhcmV0LXJpZ2h0Jyk7XG4gIH0gZWxzZSBpZiAoJ3VybCcgaW4gaXRlbSkge1xuICAgIGFwcGVuZENsYXNzZXMucHVzaCgnZmEtZXh0ZXJuYWwtbGluaycpO1xuICB9XG4gIF8uYWRkQ2xhc3MoaWNvbkFwcGVuZCwgYXBwZW5kQ2xhc3Nlcyk7XG4gIGZyYWcuYXBwZW5kQ2hpbGQoaWNvbkFwcGVuZCk7XG5cbiAgcmV0dXJuIGZyYWc7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNpbXBsZUNvbHVtbihpdGVtKSB7XG4gIHZhciBkaXYgPSBfLmVsKCdkaXYuZmpzLWNvbC5sZWFmLWNvbCcpO1xuICB2YXIgcm93ID0gXy5lbCgnZGl2LmxlYWYtcm93Jyk7XG4gIHZhciBmaWxlbmFtZSA9IF8udGV4dChpdGVtLmxhYmVsKTtcbiAgdmFyIGkgPSBfLmVsKCdpJyk7XG4gIHZhciBzaXplID0gXy5lbCgnZGl2Lm1ldGEnKTtcbiAgdmFyIHNpemVMYWJlbCA9IF8uZWwoJ3N0cm9uZycpO1xuICB2YXIgbW9kID0gXy5lbCgnZGl2Lm1ldGEnKTtcbiAgdmFyIG1vZExhYmVsID0gXy5lbCgnc3Ryb25nJyk7XG5cbiAgXy5hZGRDbGFzcyhpLCBbJ2ZhJywgJ2ZhLWZpbGUtbyddKTtcbiAgXy5hcHBlbmQoc2l6ZUxhYmVsLCBfLnRleHQoJ1NpemU6ICcpKTtcbiAgXy5hcHBlbmQoc2l6ZSwgW3NpemVMYWJlbCwgXy50ZXh0KGl0ZW0uc2l6ZSldKTtcbiAgXy5hcHBlbmQobW9kTGFiZWwsIF8udGV4dCgnTW9kaWZpZWQ6ICcpKTtcbiAgXy5hcHBlbmQobW9kLCBbbW9kTGFiZWwsIF8udGV4dChpdGVtLm1vZGlmaWVkKV0pO1xuICBfLmFwcGVuZChyb3csIFtpLCBmaWxlbmFtZSwgc2l6ZSwgbW9kXSk7XG5cbiAgcmV0dXJuIF8uYXBwZW5kKGRpdiwgcm93KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV4YW1wbGVTdGF0aWMgPSByZXF1aXJlKCcuL2V4YW1wbGUtc3RhdGljJyk7XG52YXIgZXhhbXBsZUFzeW5jID0gcmVxdWlyZSgnLi9leGFtcGxlLWFzeW5jJyk7XG5cblxuZXhhbXBsZVN0YXRpYyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyMScpKTtcbmV4YW1wbGVBc3luYyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyMicpKTtcbiIsIi8qKlxuICogZmluZGVyLmpzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZmluZGVyanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgneC1pcy1hcnJheScpO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIGRlZmF1bHRzID0ge1xuICBjbGFzc05hbWU6IHtcbiAgICBjb250YWluZXI6ICdmanMtY29udGFpbmVyJyxcbiAgICBjb2w6ICdmanMtY29sJyxcbiAgICBsaXN0OiAnZmpzLWxpc3QnLFxuICAgIGl0ZW06ICdmanMtaXRlbScsXG4gICAgYWN0aXZlOiAnZmpzLWFjdGl2ZScsXG4gICAgY2hpbGRyZW46ICdmanMtaGFzLWNoaWxkcmVuJyxcbiAgICB1cmw6ICdmanMtdXJsJyxcbiAgICBpdGVtUHJlcGVuZDogJ2Zqcy1pdGVtLXByZXBlbmQnLFxuICAgIGl0ZW1Db250ZW50OiAnZmpzLWl0ZW0tY29udGVudCcsXG4gICAgaXRlbUFwcGVuZDogJ2Zqcy1pdGVtLWFwcGVuZCdcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kZXI7XG5cbi8qKlxuICogQHBhcmFtICB7ZWxlbWVudH0gY29udGFpbmVyXG4gKiBAcGFyYW0gIHtBcnJheXxGdW5jdGlvbn0gZGF0YVxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtvYmplY3R9IGV2ZW50IGVtaXR0ZXJcbiAqL1xuZnVuY3Rpb24gZmluZGVyKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucykge1xuICB2YXIgZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgdmFyIGNmZyA9IGV4dGVuZChkZWZhdWx0cywge1xuICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgIGVtaXR0ZXI6IGVtaXR0ZXJcbiAgfSwgb3B0aW9ucyk7XG5cbiAgLy8geHRlbmQgZG9lc24ndCBkZWVwIG1lcmdlXG4gIGNmZy5jbGFzc05hbWUgPSBleHRlbmQoZGVmYXVsdHMuY2xhc3NOYW1lLCBvcHRpb25zID8gb3B0aW9ucy5jbGFzc05hbWUgOiB7fSk7XG5cbiAgLy8gc3RvcmUgdGhlIGZuIHNvIHdlIGNhbiBjYWxsIGl0IG9uIHN1YnNlcXVlbnQgc2VsZWN0aW9uc1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjZmcuZGF0YSA9IGRhdGE7XG4gIH1cblxuICAvLyBkb20gZXZlbnRzXG4gIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFxuICAgICdjbGljaycsIGZpbmRlci5jbGlja0V2ZW50LmJpbmQobnVsbCwgY2ZnLCBlbWl0dGVyKSk7XG4gIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFxuICAgICdrZXlkb3duJywgZmluZGVyLmtleWRvd25FdmVudC5iaW5kKG51bGwsIGNvbnRhaW5lciwgY2ZnLCBlbWl0dGVyKSk7XG5cbiAgLy8gaW50ZXJuYWwgZXZlbnRzXG4gIGVtaXR0ZXIub24oJ2l0ZW0tc2VsZWN0ZWQnLCBmaW5kZXIuaXRlbVNlbGVjdGVkLmJpbmQobnVsbCwgY2ZnLCBlbWl0dGVyKSk7XG4gIGVtaXR0ZXIub24oXG4gICAgJ2NyZWF0ZS1jb2x1bW4nLCBmaW5kZXIuYWRkQ29sdW1uLmJpbmQobnVsbCwgY29udGFpbmVyLCBjZmcsIGVtaXR0ZXIpKTtcbiAgZW1pdHRlci5vbihcbiAgICAnbmF2aWdhdGUnLCBmaW5kZXIubmF2aWdhdGUuYmluZChudWxsLCBjZmcsIGVtaXR0ZXIpKTtcblxuICBfLmFkZENsYXNzKGNvbnRhaW5lciwgY2ZnLmNsYXNzTmFtZS5jb250YWluZXIpO1xuICBmaW5kZXIuY3JlYXRlQ29sdW1uKGRhdGEsIGNmZywgZW1pdHRlcik7XG4gIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgMCk7XG5cbiAgcmV0dXJuIGVtaXR0ZXI7XG59XG5cbi8qKlxuICogQHBhcmFtIHtlbGVtZW50fSBjb250YWluZXJcbiAqIEBwYXJhbSB7ZWxlbWVudH0gY29sdW1uIHRvIGFwcGVuZCB0byBjb250YWluZXJcbiAqL1xuZmluZGVyLmFkZENvbHVtbiA9IGZ1bmN0aW9uIGFkZENvbHVtbihjb250YWluZXIsIGNmZywgZW1pdHRlciwgY29sKSB7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb2wpO1xuXG4gIGVtaXR0ZXIuZW1pdCgnY29sdW1uLWNyZWF0ZWQnLCBjb2wpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCBlbWl0dGVyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IHZhbHVlXG4gKi9cbmZpbmRlci5pdGVtU2VsZWN0ZWQgPSBmdW5jdGlvbiBpdGVtU2VsZWN0ZWQoY2ZnLCBlbWl0dGVyLCB2YWx1ZSkge1xuICB2YXIgaXRlbUVsID0gdmFsdWUuaXRlbTtcbiAgdmFyIGl0ZW0gPSBpdGVtRWwuX2l0ZW07XG4gIHZhciBjb2wgPSB2YWx1ZS5jb2w7XG4gIHZhciBkYXRhID0gaXRlbS5jaGlsZHJlbiB8fCBjZmcuZGF0YTtcbiAgdmFyIGFjdGl2ZUVscyA9IGNvbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNmZy5jbGFzc05hbWUuYWN0aXZlKTtcblxuICBpZiAoYWN0aXZlRWxzLmxlbmd0aCkge1xuICAgIF8ucmVtb3ZlQ2xhc3MoYWN0aXZlRWxzWzBdLCBjZmcuY2xhc3NOYW1lLmFjdGl2ZSk7XG4gIH1cbiAgXy5hZGRDbGFzcyhpdGVtRWwsIGNmZy5jbGFzc05hbWUuYWN0aXZlKTtcbiAgXy5uZXh0U2libGluZ3MoY29sKS5tYXAoXy5yZW1vdmUpO1xuXG4gIGlmIChkYXRhKSB7XG4gICAgZmluZGVyLmNyZWF0ZUNvbHVtbihkYXRhLCBjZmcsIGVtaXR0ZXIsIGl0ZW0pO1xuICB9IGVsc2UgaWYgKGl0ZW0udXJsKSB7XG4gICAgZG9jdW1lbnQubG9jYXRpb24uaHJlZiA9IGl0ZW0udXJsO1xuICB9IGVsc2Uge1xuICAgIGVtaXR0ZXIuZW1pdCgnbGVhZi1zZWxlY3RlZCcsIGl0ZW0pO1xuICB9XG59O1xuXG4vKipcbiAqIENsaWNrIGV2ZW50IGhhbmRsZXIgZm9yIHdob2xlIGNvbnRhaW5lclxuICogQHBhcmFtICB7b2JqZWN0fSBjb25maWdcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgZW1pdHRlclxuICogQHBhcmFtICB7b2JqZWN0fSBldmVudFxuICovXG5maW5kZXIuY2xpY2tFdmVudCA9IGZ1bmN0aW9uIGNsaWNrRXZlbnQoY2ZnLCBlbWl0dGVyLCBldmVudCkge1xuICB2YXIgZWwgPSBldmVudC50YXJnZXQ7XG4gIHZhciBjb2wgPSBfLmNsb3Nlc3QoZWwsIGZ1bmN0aW9uIHRlc3QoZWwpIHtcbiAgICByZXR1cm4gXy5oYXNDbGFzcyhlbCwgY2ZnLmNsYXNzTmFtZS5jb2wpO1xuICB9KTtcbiAgdmFyIGl0ZW0gPSBfLmNsb3Nlc3QoZWwsIGZ1bmN0aW9uIHRlc3QoZWwpIHtcbiAgICByZXR1cm4gXy5oYXNDbGFzcyhlbCwgY2ZnLmNsYXNzTmFtZS5pdGVtKTtcbiAgfSk7XG5cbiAgXy5zdG9wKGV2ZW50KTtcblxuICAvLyBsaXN0IGl0ZW0gY2xpY2tlZFxuICBpZiAoaXRlbSkge1xuICAgIGVtaXR0ZXIuZW1pdCgnaXRlbS1zZWxlY3RlZCcsIHtcbiAgICAgIGNvbDogY29sLFxuICAgICAgaXRlbTogaXRlbVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEtleWRvd24gZXZlbnQgaGFuZGxlciBmb3IgY29udGFpbmVyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCBlbWl0dGVyXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50XG4gKi9cbmZpbmRlci5rZXlkb3duRXZlbnQgPSBmdW5jdGlvbiBrZXlkb3duRXZlbnQoY29udGFpbmVyLCBjZmcsIGVtaXR0ZXIsIGV2ZW50KSB7XG4gIHZhciBhcnJvd0NvZGVzID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0J1xuICB9O1xuXG4gIGlmIChldmVudC5rZXlDb2RlIGluIGFycm93Q29kZXMpIHtcbiAgICBfLnN0b3AoZXZlbnQpO1xuXG4gICAgZW1pdHRlci5lbWl0KCduYXZpZ2F0ZScsIHtcbiAgICAgIGRpcmVjdGlvbjogYXJyb3dDb2Rlc1tldmVudC5rZXlDb2RlXSxcbiAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyXG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogTmF2aWdhdGUgdGhlIGZpbmRlciB1cCwgZG93biwgcmlnaHQsIG9yIGxlZnRcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcGFyYW0gIHtvYmplY3R9IGV2ZW50IGVtaXR0ZXJcbiAqIEBwYXJhbSAge29iamVjdH0gZXZlbnQgdmFsdWUgLSBgY29udGFpbmVyYCBwcm9wIGNvbnRhaW5zIGEgcmVmZXJlbmNlIHRvIHRoZVxuICogY29udGFpbmVyLCBhbmQgYGRpcmVjdGlvbmAgY2FuIGJlICd1cCcsICdkb3duJywgJ3JpZ2h0JywgJ2xlZnQnXG4gKi9cbmZpbmRlci5uYXZpZ2F0ZSA9IGZ1bmN0aW9uIG5hdmlnYXRlKGNmZywgZW1pdHRlciwgdmFsdWUpIHtcbiAgdmFyIGFjdGl2ZSA9IGZpbmRlci5maW5kTGFzdEFjdGl2ZSh2YWx1ZS5jb250YWluZXIsIGNmZyk7XG4gIHZhciB0YXJnZXQgPSBudWxsO1xuICB2YXIgZGlyID0gdmFsdWUuZGlyZWN0aW9uO1xuICB2YXIgaXRlbTtcbiAgdmFyIGNvbDtcblxuICBpZiAoYWN0aXZlKSB7XG4gICAgaXRlbSA9IGFjdGl2ZS5pdGVtO1xuICAgIGNvbCA9IGFjdGl2ZS5jb2w7XG5cbiAgICBpZiAoZGlyID09PSAndXAnICYmIGl0ZW0ucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICB0YXJnZXQgPSBpdGVtLnByZXZpb3VzU2libGluZztcbiAgICB9IGVsc2UgaWYgKGRpciA9PT0gJ2Rvd24nICYmIGl0ZW0ubmV4dFNpYmxpbmcpIHtcbiAgICAgIHRhcmdldCA9IGl0ZW0ubmV4dFNpYmxpbmc7XG4gICAgfSBlbHNlIGlmIChkaXIgPT09ICdyaWdodCcgJiYgY29sLm5leHRTaWJsaW5nKSB7XG4gICAgICBjb2wgPSBjb2wubmV4dFNpYmxpbmc7XG4gICAgICB0YXJnZXQgPSBfLmZpcnN0KGNvbCwgJy4nICsgY2ZnLmNsYXNzTmFtZS5pdGVtKTtcbiAgICB9IGVsc2UgaWYgKGRpciA9PT0gJ2xlZnQnICYmIGNvbC5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgIGNvbCA9IGNvbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgICB0YXJnZXQgPSBfLmZpcnN0KGNvbCwgJy4nICsgY2ZnLmNsYXNzTmFtZS5hY3RpdmUpIHx8XG4gICAgICAgIF8uZmlyc3QoY29sLCAnLicgKyBjZmcuY2xhc3NOYW1lLml0ZW0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb2wgPSBfLmZpcnN0KHZhbHVlLmNvbnRhaW5lciwgJy4nICsgY2ZnLmNsYXNzTmFtZS5jb2wpO1xuICAgIHRhcmdldCA9IF8uZmlyc3QoY29sLCAnLicgKyBjZmcuY2xhc3NOYW1lLml0ZW0pO1xuICB9XG5cbiAgaWYgKHRhcmdldCkge1xuICAgIGVtaXR0ZXIuZW1pdCgnaXRlbS1zZWxlY3RlZCcsIHtcbiAgICAgIGNvbDogY29sLFxuICAgICAgaXRlbTogdGFyZ2V0XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogRmluZCBsYXN0IChyaWdodC1tb3N0KSBhY3RpdmUgaXRlbSBhbmQgY29sdW1uXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBjb250YWluZXJcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZpbmRlci5maW5kTGFzdEFjdGl2ZSA9IGZ1bmN0aW9uIGZpbmRMYXN0QWN0aXZlKGNvbnRhaW5lciwgY2ZnKSB7XG4gIHZhciBhY3RpdmVJdGVtcyA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNmZy5jbGFzc05hbWUuYWN0aXZlKTtcbiAgdmFyIGl0ZW07XG4gIHZhciBjb2w7XG5cbiAgaWYgKCFhY3RpdmVJdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGl0ZW0gPSBhY3RpdmVJdGVtc1thY3RpdmVJdGVtcy5sZW5ndGggLSAxXTtcbiAgY29sID0gXy5jbG9zZXN0KGl0ZW0sIGZ1bmN0aW9uIHRlc3QoZWwpIHtcbiAgICByZXR1cm4gXy5oYXNDbGFzcyhlbCwgY2ZnLmNsYXNzTmFtZS5jb2wpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGNvbDogY29sLFxuICAgIGl0ZW06IGl0ZW1cbiAgfTtcbn07XG5cbi8qKlxuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtICB7b2JqZWN0fSBldmVudCBlbWl0dGVyXG4gKiBAcGFyYW0gIHtwYXJlbnR9IFtwYXJlbnRdIC0gcGFyZW50IGl0ZW0gdGhhdCBjbGlja2VkL3RyaWdnZXJlZCBjcmVhdGVDb2x1bW5cbiAqIEByZXR1cm4ge2VsZW1lbnR9IGNvbHVtblxuICovXG5maW5kZXIuY3JlYXRlQ29sdW1uID0gZnVuY3Rpb24gY3JlYXRlQ29sdW1uKGRhdGEsIGNmZywgZW1pdHRlciwgcGFyZW50KSB7XG4gIHZhciBkaXY7XG4gIHZhciBsaXN0O1xuICBmdW5jdGlvbiBjYWxsYmFjayhkYXRhKSB7XG4gICAgZmluZGVyLmNyZWF0ZUNvbHVtbihkYXRhLCBjZmcsIGVtaXR0ZXIsIHBhcmVudCk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGF0YS5jYWxsKG51bGwsIHBhcmVudCwgY2ZnLCBjYWxsYmFjayk7XG4gIH0gZWxzZSBpZiAoaXNBcnJheShkYXRhKSkge1xuICAgIGxpc3QgPSBmaW5kZXIuY3JlYXRlTGlzdChkYXRhLCBjZmcpO1xuICAgIGRpdiA9IF8uZWwoJ2RpdicpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICBfLmFkZENsYXNzKGRpdiwgY2ZnLmNsYXNzTmFtZS5jb2wpO1xuXG4gICAgZW1pdHRlci5lbWl0KCdjcmVhdGUtY29sdW1uJywgZGl2KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZGF0YSB0eXBlJyk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtICB7YXJyYXl9IGRhdGFcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtlbGVtZW50fSBsaXN0XG4gKi9cbmZpbmRlci5jcmVhdGVMaXN0ID0gZnVuY3Rpb24gY3JlYXRlTGlzdChkYXRhLCBjZmcpIHtcbiAgdmFyIHVsID0gXy5lbCgndWwnKTtcbiAgdmFyIGl0ZW1zID0gZGF0YS5tYXAoZmluZGVyLmNyZWF0ZUl0ZW0uYmluZChudWxsLCBjZmcpKTtcbiAgdmFyIGRvY0ZyYWc7XG5cbiAgZG9jRnJhZyA9IGl0ZW1zLnJlZHVjZShmdW5jdGlvbiBlYWNoKGRvY0ZyYWcsIGN1cnIpIHtcbiAgICBkb2NGcmFnLmFwcGVuZENoaWxkKGN1cnIpO1xuICAgIHJldHVybiBkb2NGcmFnO1xuICB9LCBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCkpO1xuXG4gIHVsLmFwcGVuZENoaWxkKGRvY0ZyYWcpO1xuICBfLmFkZENsYXNzKHVsLCBjZmcuY2xhc3NOYW1lLmxpc3QpO1xuXG4gIHJldHVybiB1bDtcbn07XG5cbi8qKlxuICogRGVmYXVsdCBpdGVtIHJlbmRlciBmblxuICogQHBhcmFtICB7b2JqZWN0fSBjZmcgY29uZmlnIG9iamVjdFxuICogQHBhcmFtICB7b2JqZWN0fSBpdGVtIGRhdGFcbiAqIEByZXR1cm4ge0RvY3VtZW50RnJhZ21lbnR9XG4gKi9cbmZpbmRlci5jcmVhdGVJdGVtQ29udGVudCA9IGZ1bmN0aW9uIGNyZWF0ZUl0ZW1Db250ZW50KGNmZywgaXRlbSkge1xuICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIHByZXBlbmQgPSBfLmVsKCdkaXYuJyArIGNmZy5jbGFzc05hbWUuaXRlbVByZXBlbmQpO1xuICB2YXIgY29udGVudCA9IF8uZWwoJ2Rpdi4nICsgY2ZnLmNsYXNzTmFtZS5pdGVtQ29udGVudCk7XG4gIHZhciBhcHBlbmQgPSBfLmVsKCdkaXYuJyArIGNmZy5jbGFzc05hbWUuaXRlbUFwcGVuZCk7XG5cbiAgZnJhZy5hcHBlbmRDaGlsZChwcmVwZW5kKTtcbiAgY29udGVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpdGVtLmxhYmVsKSk7XG4gIGZyYWcuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gIGZyYWcuYXBwZW5kQ2hpbGQoYXBwZW5kKTtcblxuICByZXR1cm4gZnJhZztcbn07XG5cbi8qKlxuICogQHBhcmFtICB7b2JqZWN0fSBjZmcgY29uZmlnIG9iamVjdFxuICogQHBhcmFtICB7b2JqZWN0fSBpdGVtIGRhdGFcbiAqIEByZXR1cm4ge2VsZW1lbnR9IGxpc3QgaXRlbVxuICovXG5maW5kZXIuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIGNyZWF0ZUl0ZW0oY2ZnLCBpdGVtKSB7XG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB2YXIgbGlDbGFzc05hbWVzID0gW2NmZy5jbGFzc05hbWUuaXRlbV07XG4gIHZhciBsaSA9IF8uZWwoJ2xpJyk7XG4gIHZhciBhID0gXy5lbCgnYScpO1xuICB2YXIgY3JlYXRlSXRlbUNvbnRlbnQgPSBjZmcuY3JlYXRlSXRlbUNvbnRlbnQgfHwgZmluZGVyLmNyZWF0ZUl0ZW1Db250ZW50O1xuXG4gIGZyYWcgPSBjcmVhdGVJdGVtQ29udGVudC5jYWxsKG51bGwsIGNmZywgaXRlbSk7XG4gIGEuYXBwZW5kQ2hpbGQoZnJhZyk7XG5cbiAgYS5ocmVmID0gJyc7XG4gIGEuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcbiAgaWYgKGl0ZW0udXJsKSB7XG4gICAgYS5ocmVmID0gaXRlbS51cmw7XG4gICAgbGlDbGFzc05hbWVzLnB1c2goY2ZnLmNsYXNzTmFtZS51cmwpO1xuICB9XG4gIGlmIChpdGVtLmNsYXNzTmFtZSkge1xuICAgIGxpQ2xhc3NOYW1lcy5wdXNoKGl0ZW0uY2xhc3NOYW1lKTtcbiAgfVxuICBpZiAoaXRlbS5jaGlsZHJlbikge1xuICAgIGxpQ2xhc3NOYW1lcy5wdXNoKGNmZy5jbGFzc05hbWUuY2hpbGRyZW4pO1xuICB9XG4gIF8uYWRkQ2xhc3MobGksIGxpQ2xhc3NOYW1lcyk7XG4gIGxpLmFwcGVuZENoaWxkKGEpO1xuICBsaS5faXRlbSA9IGl0ZW07XG5cbiAgcmV0dXJuIGxpO1xufTtcbiIsbnVsbCwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgdmFyIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG59XG4iLCJpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNlbGY7XG59IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge307XG59XG4iLCJ2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVJc0FycmF5IHx8IGlzQXJyYXlcblxuZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCJcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIHdpbmRvdyA9IHJlcXVpcmUoXCJnbG9iYWwvd2luZG93XCIpXG52YXIgb25jZSA9IHJlcXVpcmUoXCJvbmNlXCIpXG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZShcInBhcnNlLWhlYWRlcnNcIilcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlWEhSXG5jcmVhdGVYSFIuWE1MSHR0cFJlcXVlc3QgPSB3aW5kb3cuWE1MSHR0cFJlcXVlc3QgfHwgbm9vcFxuY3JlYXRlWEhSLlhEb21haW5SZXF1ZXN0ID0gXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiAobmV3IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCgpKSA/IGNyZWF0ZVhIUi5YTUxIdHRwUmVxdWVzdCA6IHdpbmRvdy5YRG9tYWluUmVxdWVzdFxuXG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqKXtcbiAgICBmb3IodmFyIGkgaW4gb2JqKXtcbiAgICAgICAgaWYob2JqLmhhc093blByb3BlcnR5KGkpKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gY3JlYXRlWEhSKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgZnVuY3Rpb24gcmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBsb2FkRnVuYygpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb2R5KCkge1xuICAgICAgICAvLyBDaHJvbWUgd2l0aCByZXF1ZXN0VHlwZT1ibG9iIHRocm93cyBlcnJvcnMgYXJyb3VuZCB3aGVuIGV2ZW4gdGVzdGluZyBhY2Nlc3MgdG8gcmVzcG9uc2VUZXh0XG4gICAgICAgIHZhciBib2R5ID0gdW5kZWZpbmVkXG5cbiAgICAgICAgaWYgKHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgYm9keSA9IHhoci5yZXNwb25zZVxuICAgICAgICB9IGVsc2UgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09IFwidGV4dFwiIHx8ICF4aHIucmVzcG9uc2VUeXBlKSB7XG4gICAgICAgICAgICBib2R5ID0geGhyLnJlc3BvbnNlVGV4dCB8fCB4aHIucmVzcG9uc2VYTUxcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0pzb24pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm9keVxuICAgIH1cblxuICAgIHZhciBmYWlsdXJlUmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgYm9keTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDAsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgdXJsOiB1cmksXG4gICAgICAgICAgICAgICAgcmF3UmVxdWVzdDogeGhyXG4gICAgICAgICAgICB9XG5cbiAgICBmdW5jdGlvbiBlcnJvckZ1bmMoZXZ0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpXG4gICAgICAgIGlmKCEoZXZ0IGluc3RhbmNlb2YgRXJyb3IpKXtcbiAgICAgICAgICAgIGV2dCA9IG5ldyBFcnJvcihcIlwiICsgKGV2dCB8fCBcIlVua25vd24gWE1MSHR0cFJlcXVlc3QgRXJyb3JcIikgKVxuICAgICAgICB9XG4gICAgICAgIGV2dC5zdGF0dXNDb2RlID0gMFxuICAgICAgICBjYWxsYmFjayhldnQsIGZhaWx1cmVSZXNwb25zZSlcbiAgICB9XG5cbiAgICAvLyB3aWxsIGxvYWQgdGhlIGRhdGEgJiBwcm9jZXNzIHRoZSByZXNwb25zZSBpbiBhIHNwZWNpYWwgcmVzcG9uc2Ugb2JqZWN0XG4gICAgZnVuY3Rpb24gbG9hZEZ1bmMoKSB7XG4gICAgICAgIGlmIChhYm9ydGVkKSByZXR1cm5cbiAgICAgICAgdmFyIHN0YXR1c1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dFRpbWVyKVxuICAgICAgICBpZihvcHRpb25zLnVzZVhEUiAmJiB4aHIuc3RhdHVzPT09dW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvL0lFOCBDT1JTIEdFVCBzdWNjZXNzZnVsIHJlc3BvbnNlIGRvZXNuJ3QgaGF2ZSBhIHN0YXR1cyBmaWVsZCwgYnV0IGJvZHkgaXMgZmluZVxuICAgICAgICAgICAgc3RhdHVzID0gMjAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXMpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3BvbnNlID0gZmFpbHVyZVJlc3BvbnNlXG4gICAgICAgIHZhciBlcnIgPSBudWxsXG5cbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMCl7XG4gICAgICAgICAgICByZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICBib2R5OiBnZXRCb2R5KCksXG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogc3RhdHVzLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICAgICAgICAgIHVybDogdXJpLFxuICAgICAgICAgICAgICAgIHJhd1JlcXVlc3Q6IHhoclxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyl7IC8vcmVtZW1iZXIgeGhyIGNhbiBpbiBmYWN0IGJlIFhEUiBmb3IgQ09SUyBpbiBJRVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKFwiSW50ZXJuYWwgWE1MSHR0cFJlcXVlc3QgRXJyb3JcIilcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3BvbnNlLCByZXNwb25zZS5ib2R5KVxuXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IHVyaTogb3B0aW9ucyB9XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICBpZih0eXBlb2YgY2FsbGJhY2sgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWxsYmFjayBhcmd1bWVudCBtaXNzaW5nXCIpXG4gICAgfVxuICAgIGNhbGxiYWNrID0gb25jZShjYWxsYmFjaylcblxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociB8fCBudWxsXG5cbiAgICBpZiAoIXhocikge1xuICAgICAgICBpZiAob3B0aW9ucy5jb3JzIHx8IG9wdGlvbnMudXNlWERSKSB7XG4gICAgICAgICAgICB4aHIgPSBuZXcgY3JlYXRlWEhSLlhEb21haW5SZXF1ZXN0KClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB4aHIgPSBuZXcgY3JlYXRlWEhSLlhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBrZXlcbiAgICB2YXIgYWJvcnRlZFxuICAgIHZhciB1cmkgPSB4aHIudXJsID0gb3B0aW9ucy51cmkgfHwgb3B0aW9ucy51cmxcbiAgICB2YXIgbWV0aG9kID0geGhyLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCJcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keSB8fCBvcHRpb25zLmRhdGFcbiAgICB2YXIgaGVhZGVycyA9IHhoci5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9XG4gICAgdmFyIHN5bmMgPSAhIW9wdGlvbnMuc3luY1xuICAgIHZhciBpc0pzb24gPSBmYWxzZVxuICAgIHZhciB0aW1lb3V0VGltZXJcblxuICAgIGlmIChcImpzb25cIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlzSnNvbiA9IHRydWVcbiAgICAgICAgaGVhZGVyc1tcImFjY2VwdFwiXSB8fCBoZWFkZXJzW1wiQWNjZXB0XCJdIHx8IChoZWFkZXJzW1wiQWNjZXB0XCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgIGlmIChtZXRob2QgIT09IFwiR0VUXCIgJiYgbWV0aG9kICE9PSBcIkhFQURcIikge1xuICAgICAgICAgICAgaGVhZGVyc1tcImNvbnRlbnQtdHlwZVwiXSB8fCBoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdIHx8IChoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdID0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIC8vRG9uJ3Qgb3ZlcnJpZGUgZXhpc3RpbmcgYWNjZXB0IGhlYWRlciBkZWNsYXJlZCBieSB1c2VyXG4gICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5qc29uKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHJlYWR5c3RhdGVjaGFuZ2VcbiAgICB4aHIub25sb2FkID0gbG9hZEZ1bmNcbiAgICB4aHIub25lcnJvciA9IGVycm9yRnVuY1xuICAgIC8vIElFOSBtdXN0IGhhdmUgb25wcm9ncmVzcyBiZSBzZXQgdG8gYSB1bmlxdWUgZnVuY3Rpb24uXG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIElFIG11c3QgZGllXG4gICAgfVxuICAgIHhoci5vbnRpbWVvdXQgPSBlcnJvckZ1bmNcbiAgICB4aHIub3BlbihtZXRob2QsIHVyaSwgIXN5bmMsIG9wdGlvbnMudXNlcm5hbWUsIG9wdGlvbnMucGFzc3dvcmQpXG4gICAgLy9oYXMgdG8gYmUgYWZ0ZXIgb3BlblxuICAgIGlmKCFzeW5jKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSAhIW9wdGlvbnMud2l0aENyZWRlbnRpYWxzXG4gICAgfVxuICAgIC8vIENhbm5vdCBzZXQgdGltZW91dCB3aXRoIHN5bmMgcmVxdWVzdFxuICAgIC8vIG5vdCBzZXR0aW5nIHRpbWVvdXQgb24gdGhlIHhociBvYmplY3QsIGJlY2F1c2Ugb2Ygb2xkIHdlYmtpdHMgZXRjLiBub3QgaGFuZGxpbmcgdGhhdCBjb3JyZWN0bHlcbiAgICAvLyBib3RoIG5wbSdzIHJlcXVlc3QgYW5kIGpxdWVyeSAxLnggdXNlIHRoaXMga2luZCBvZiB0aW1lb3V0LCBzbyB0aGlzIGlzIGJlaW5nIGNvbnNpc3RlbnRcbiAgICBpZiAoIXN5bmMgJiYgb3B0aW9ucy50aW1lb3V0ID4gMCApIHtcbiAgICAgICAgdGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgYWJvcnRlZD10cnVlLy9JRTkgbWF5IHN0aWxsIGNhbGwgcmVhZHlzdGF0ZWNoYW5nZVxuICAgICAgICAgICAgeGhyLmFib3J0KFwidGltZW91dFwiKVxuICAgICAgICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJYTUxIdHRwUmVxdWVzdCB0aW1lb3V0XCIpXG4gICAgICAgICAgICBlLmNvZGUgPSBcIkVUSU1FRE9VVFwiXG4gICAgICAgICAgICBlcnJvckZ1bmMoZSlcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0IClcbiAgICB9XG5cbiAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgZm9yKGtleSBpbiBoZWFkZXJzKXtcbiAgICAgICAgICAgIGlmKGhlYWRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzW2tleV0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaGVhZGVycyAmJiAhaXNFbXB0eShvcHRpb25zLmhlYWRlcnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhlYWRlcnMgY2Fubm90IGJlIHNldCBvbiBhbiBYRG9tYWluUmVxdWVzdCBvYmplY3RcIilcbiAgICB9XG5cbiAgICBpZiAoXCJyZXNwb25zZVR5cGVcIiBpbiBvcHRpb25zKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZVxuICAgIH1cblxuICAgIGlmIChcImJlZm9yZVNlbmRcIiBpbiBvcHRpb25zICYmXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmJlZm9yZVNlbmQgPT09IFwiZnVuY3Rpb25cIlxuICAgICkge1xuICAgICAgICBvcHRpb25zLmJlZm9yZVNlbmQoeGhyKVxuICAgIH1cblxuICAgIHhoci5zZW5kKGJvZHkpXG5cbiAgICByZXR1cm4geGhyXG5cblxufVxuXG5mdW5jdGlvbiBub29wKCkge31cbiIsIm1vZHVsZS5leHBvcnRzID0gb25jZVxuXG5vbmNlLnByb3RvID0gb25jZShmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGdW5jdGlvbi5wcm90b3R5cGUsICdvbmNlJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb25jZSh0aGlzKVxuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG59KVxuXG5mdW5jdGlvbiBvbmNlIChmbikge1xuICB2YXIgY2FsbGVkID0gZmFsc2VcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY2FsbGVkKSByZXR1cm5cbiAgICBjYWxsZWQgPSB0cnVlXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxufVxuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdpcy1mdW5jdGlvbicpXG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaFxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5cbmZ1bmN0aW9uIGZvckVhY2gobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oaXRlcmF0b3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2l0ZXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIGNvbnRleHQgPSB0aGlzXG4gICAgfVxuICAgIFxuICAgIGlmICh0b1N0cmluZy5jYWxsKGxpc3QpID09PSAnW29iamVjdCBBcnJheV0nKVxuICAgICAgICBmb3JFYWNoQXJyYXkobGlzdCwgaXRlcmF0b3IsIGNvbnRleHQpXG4gICAgZWxzZSBpZiAodHlwZW9mIGxpc3QgPT09ICdzdHJpbmcnKVxuICAgICAgICBmb3JFYWNoU3RyaW5nKGxpc3QsIGl0ZXJhdG9yLCBjb250ZXh0KVxuICAgIGVsc2VcbiAgICAgICAgZm9yRWFjaE9iamVjdChsaXN0LCBpdGVyYXRvciwgY29udGV4dClcbn1cblxuZnVuY3Rpb24gZm9yRWFjaEFycmF5KGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChhcnJheSwgaSkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JFYWNoU3RyaW5nKHN0cmluZywgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3RyaW5nLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIC8vIG5vIHN1Y2ggdGhpbmcgYXMgYSBzcGFyc2Ugc3RyaW5nLlxuICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHN0cmluZy5jaGFyQXQoaSksIGksIHN0cmluZylcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2hPYmplY3Qob2JqZWN0LCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgaykpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqZWN0W2tdLCBrLCBvYmplY3QpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb25cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uIChmbikge1xuICB2YXIgc3RyaW5nID0gdG9TdHJpbmcuY2FsbChmbilcbiAgcmV0dXJuIHN0cmluZyA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgc3RyaW5nICE9PSAnW29iamVjdCBSZWdFeHBdJykgfHxcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgLy8gSUU4IGFuZCBiZWxvd1xuICAgICAoZm4gPT09IHdpbmRvdy5zZXRUaW1lb3V0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmFsZXJ0IHx8XG4gICAgICBmbiA9PT0gd2luZG93LmNvbmZpcm0gfHxcbiAgICAgIGZuID09PSB3aW5kb3cucHJvbXB0KSlcbn07XG4iLCJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRyaW07XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59XG5cbmV4cG9ydHMubGVmdCA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJyk7XG59O1xuXG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn07XG4iLCJ2YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKVxuICAsIGZvckVhY2ggPSByZXF1aXJlKCdmb3ItZWFjaCcpXG4gICwgaXNBcnJheSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaGVhZGVycykge1xuICBpZiAoIWhlYWRlcnMpXG4gICAgcmV0dXJuIHt9XG5cbiAgdmFyIHJlc3VsdCA9IHt9XG5cbiAgZm9yRWFjaChcbiAgICAgIHRyaW0oaGVhZGVycykuc3BsaXQoJ1xcbicpXG4gICAgLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHJvdy5pbmRleE9mKCc6JylcbiAgICAgICAgICAsIGtleSA9IHRyaW0ocm93LnNsaWNlKDAsIGluZGV4KSkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICwgdmFsdWUgPSB0cmltKHJvdy5zbGljZShpbmRleCArIDEpKVxuXG4gICAgICAgIGlmICh0eXBlb2YocmVzdWx0W2tleV0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHJlc3VsdFtrZXldKSkge1xuICAgICAgICAgIHJlc3VsdFtrZXldLnB1c2godmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBbIHJlc3VsdFtrZXldLCB2YWx1ZSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgKVxuXG4gIHJldHVybiByZXN1bHRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwiLyoqXG4gKiB1dGlsLmpzIG1vZHVsZS5cbiAqIEBtb2R1bGUgdXRpbFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCd4LWlzLWFycmF5Jyk7XG5cbi8qKlxuICogY2hlY2sgaWYgdmFyaWFibGUgaXMgYW4gZWxlbWVudFxuICogQHBhcmFtICB7Kn0gcG90ZW50aWFsIGVsZW1lbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHJldHVybiB0cnVlIGlmIGlzIGFuIGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gaXNFbGVtZW50KGVsZW1lbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuICEhKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSA9PT0gMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBjcmVhdGVFbGVtZW50IHNob3J0Y3V0XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRhZ1xuICogQHJldHVybiB7RWxlbWVudH0gZWxlbWVudFxuICovXG5mdW5jdGlvbiBlbChlbGVtZW50KSB7XG4gIHZhciBjbGFzc2VzID0gW107XG4gIHZhciB0YWcgPSBlbGVtZW50O1xuICB2YXIgZWw7XG5cbiAgaWYgKGlzRWxlbWVudChlbGVtZW50KSkge1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgY2xhc3NlcyA9IGVsZW1lbnQuc3BsaXQoJy4nKTtcbiAgaWYgKGNsYXNzZXMubGVuZ3RoID4gMSkge1xuICAgIHRhZyA9IGNsYXNzZXNbMF07XG4gIH1cbiAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGFkZENsYXNzKGVsLCBjbGFzc2VzLnNsaWNlKDEpKTtcblxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogY3JlYXRlRG9jdW1lbnRGcmFnbWVudCBzaG9ydGN1dFxuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuZnVuY3Rpb24gZnJhZygpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbn1cblxuLyoqXG4gKiBjcmVhdGVUZXh0Tm9kZSBzaG9ydGN1dFxuICogQHJldHVybiB7VGV4dE5vZGV9XG4gKi9cbmZ1bmN0aW9uIHRleHQodGV4dCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5cbi8qKlxuICogcmVtb3ZlIGVsZW1lbnRcbiAqIEBwYXJhbSAge0VsZW1lbnR9IGVsZW1lbnQgdG8gcmVtb3ZlXG4gKiBAcmV0dXJuIHtFbGVtZW50fSByZW1vdmVkIGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlKGVsZW1lbnQpIHtcbiAgaWYgKCdyZW1vdmUnIGluIGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZSgpO1xuICB9IGVsc2Uge1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIEZpbmQgZmlyc3QgZWxlbWVudCB0aGF0IHRlc3RzIHRydWUsIHN0YXJ0aW5nIHdpdGggdGhlIGVsZW1lbnQgaXRzZWxmXG4gKiBhbmQgdHJhdmVyc2luZyB1cCB0aHJvdWdoIGl0cyBhbmNlc3RvcnNcbiAqIEBwYXJhbSAge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSB0ZXN0IGZuIC0gcmV0dXJuIHRydWUgd2hlbiBlbGVtZW50IGxvY2F0ZWRcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGNsb3Nlc3QoZWxlbWVudCwgdGVzdCkge1xuICB2YXIgZWwgPSBlbGVtZW50O1xuXG4gIHdoaWxlIChlbCkge1xuICAgIGlmICh0ZXN0KGVsKSkge1xuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cbiAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBBZGQgb25lIG9yIG1vcmUgY2xhc3NuYW1lcyB0byBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz58U3RyaW5nfSBhcnJheSBvZiBjbGFzc25hbWVzIG9yIHN0cmluZyB3aXRoXG4gKiBjbGFzc25hbWVzIHNlcGFyYXRlZCBieSB3aGl0ZXNwYWNlXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5mdW5jdGlvbiBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgdmFyIGNsYXNzTmFtZXMgPSBjbGFzc05hbWU7XG5cbiAgZnVuY3Rpb24gX2FkZENsYXNzKGVsLCBjbikge1xuICAgIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBjbjtcbiAgICB9IGVsc2UgaWYgKCFoYXNDbGFzcyhlbCwgY24pKSB7XG4gICAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY247XG4gICAgfVxuICB9XG5cbiAgaWYgKCFpc0FycmF5KGNsYXNzTmFtZSkpIHtcbiAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICB9XG4gIGNsYXNzTmFtZXMuZm9yRWFjaChfYWRkQ2xhc3MuYmluZChudWxsLCBlbGVtZW50KSk7XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgY2xhc3MgZnJvbSBhbiBlbGVtZW50XG4gKiBAcGFyYW0gIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0gIHtBcnJheS48c3RyaW5nPnxTdHJpbmd9IGFycmF5IG9mIGNsYXNzbmFtZXMgb3Igc3RyaW5nIHdpdGhcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICB2YXIgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZTtcblxuICBmdW5jdGlvbiBfcmVtb3ZlQ2xhc3MoZWwsIGNuKSB7XG4gICAgdmFyIGNsYXNzUmVnZXggPSBuZXcgUmVnRXhwKCcoPzpefFxcXFxzKScgKyBjbiArICcoPyFcXFxcUyknLCAnZycpO1xuICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKGNsYXNzUmVnZXgsICcnKS50cmltKCk7XG4gIH1cblxuICBpZiAoIWlzQXJyYXkoY2xhc3NOYW1lKSkge1xuICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWUudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gIH1cbiAgY2xhc3NOYW1lcy5mb3JFYWNoKF9yZW1vdmVDbGFzcy5iaW5kKG51bGwsIGVsZW1lbnQpKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBlbGVtZW50IGhhcyBhIGNsYXNzXG4gKiBAcGFyYW0gIHtFbGVtZW50fSAgZWxlbWVudFxuICogQHBhcmFtICB7U3RyaW5nfSAgY2xhc3NOYW1lXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBoYXNDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgaWYgKCFlbGVtZW50IHx8ICEoJ2NsYXNzTmFtZScgaW4gZWxlbWVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5jbGFzc05hbWUuc3BsaXQoL1xccysvKS5pbmRleE9mKGNsYXNzTmFtZSkgIT09IC0xO1xufVxuXG4vKipcbiAqIFJldHVybiBhbGwgbmV4dCBzaWJsaW5nc1xuICogQHBhcmFtICB7RWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7QXJyYXkuPGVsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBuZXh0U2libGluZ3MoZWxlbWVudCkge1xuICB2YXIgbmV4dCA9IGVsZW1lbnQubmV4dFNpYmxpbmc7XG4gIHZhciBzaWJsaW5ncyA9IFtdO1xuXG4gIHdoaWxlIChuZXh0KSB7XG4gICAgc2libGluZ3MucHVzaChuZXh0KTtcbiAgICBuZXh0ID0gbmV4dC5uZXh0U2libGluZztcbiAgfVxuXG4gIHJldHVybiBzaWJsaW5ncztcbn1cblxuLyoqXG4gKiBSZXR1cm4gYWxsIHByZXYgc2libGluZ3NcbiAqIEBwYXJhbSAge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge0FycmF5LjxlbGVtZW50Pn1cbiAqL1xuZnVuY3Rpb24gcHJldmlvdXNTaWJsaW5ncyhlbGVtZW50KSB7XG4gIHZhciBwcmV2ID0gZWxlbWVudC5wcmV2aW91c1NpYmxpbmc7XG4gIHZhciBzaWJsaW5ncyA9IFtdO1xuXG4gIHdoaWxlIChwcmV2KSB7XG4gICAgc2libGluZ3MucHVzaChwcmV2KTtcbiAgICBwcmV2ID0gcHJldi5wcmV2aW91c1NpYmxpbmc7XG4gIH1cblxuICByZXR1cm4gc2libGluZ3M7XG59XG5cbi8qKlxuICogU3RvcCBldmVudCBwcm9wYWdhdGlvblxuICogQHBhcmFtICB7RXZlbnR9IGV2ZW50XG4gKiBAcmV0dXJuIHtFdmVudH1cbiAqL1xuZnVuY3Rpb24gc3RvcChldmVudCkge1xuICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICByZXR1cm4gZXZlbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBmaXJzdCBlbGVtZW50IGluIHBhcmVudCB0aGF0IG1hdGNoZXMgc2VsZWN0b3JcbiAqIEBwYXJhbSAge0VsZW1lbnR9IHBhcmVudFxuICogQHBhcmFtICB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gZmlyc3QocGFyZW50LCBzZWxlY3Rvcikge1xuICByZXR1cm4gcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmQocGFyZW50LCBjaGlsZHJlbikge1xuICB2YXIgX2ZyYWcgPSBmcmFnKCk7XG4gIHZhciBjaGlsZHJlbiA9IGlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW4gOiBbY2hpbGRyZW5dO1xuXG4gIGNoaWxkcmVuLmZvckVhY2goX2ZyYWcuYXBwZW5kQ2hpbGQuYmluZChfZnJhZykpO1xuICBwYXJlbnQuYXBwZW5kQ2hpbGQoX2ZyYWcpO1xuXG4gIHJldHVybiBwYXJlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbDogZWwsXG4gIGZyYWc6IGZyYWcsXG4gIHRleHQ6IHRleHQsXG4gIGNsb3Nlc3Q6IGNsb3Nlc3QsXG4gIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgcmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuICBoYXNDbGFzczogaGFzQ2xhc3MsXG4gIG5leHRTaWJsaW5nczogbmV4dFNpYmxpbmdzLFxuICBwcmV2aW91c1NpYmxpbmdzOiBwcmV2aW91c1NpYmxpbmdzLFxuICByZW1vdmU6IHJlbW92ZSxcbiAgc3RvcDogc3RvcCxcbiAgZmlyc3Q6IGZpcnN0LFxuICBhcHBlbmQ6IGFwcGVuZFxufTtcbiJdfQ==
