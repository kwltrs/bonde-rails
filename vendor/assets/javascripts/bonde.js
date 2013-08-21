/*! bonde - v0.0.5 - 2013-08-21
* https://github.com/kwltrs/bonde
* Copyright (c) 2013 Kristofer Walters; Licensed MIT */
/** @namespace */
var Bonde = this.Bonde || {};

(function(B, $) {
  'use strict';

  /** Helper */
  function mixin(dest, src) {
      for (var k in src) {
          if (src.hasOwnProperty(k)) {
              dest[k] = src[k];
          }
      }
  }

  B.AttributeHolder = (function () {

      /**
       * Notify all listeners of a given AttributeHolder instance.
       * @private
       */
      function notifyChange(attrHolder, key, newValue, oldValue) {
          var listeners = attrHolder.changeListeners;
          for (var i=0, len=listeners.length; i<len; i++) {
              listeners[i].call(attrHolder, key, newValue, oldValue);
          }
      }

      /**
       * @event Bonde.AttributeHolder~onChangeEvent
       */
      /**
       * @callback Bonde.AttributeHolder~OnChangeCallback
       * @param {string} key        Name of the changed property
       * @param {string} newValue   Current value of the property
       * @param {string} oldValue   Former value of the property
       */

      /**
       * Event-firing key-value store.
       * @class Bonde.AttributeHolder
       */
      function AttributeHolder () {
          this.values = {};
          this.changeListeners = [];
      }

      /**
       * @method Bonde.AttributeHolder#get
       * @param {string} key
       */
      AttributeHolder.prototype.get = function (key) {
          return this.values[key];
      };

      /**
       * @method Bonde.AttributeHolder#set
       * @param {string} key
       * @param {string} value
       * @fires Bonde.AttributeHolder~onChangeEvent
       */
      AttributeHolder.prototype.set = function (key, value) {
          var oldValue = this.values[key];
          this.values[key] = value;
          notifyChange(this, key, value, oldValue);
      };

      /**
       * @method Bonde.AttributeHolder#on
       * @param {string} eventName
       * @param {Bonde.AttributeHolder~OnChangeCallback} listener
       */
      AttributeHolder.prototype.on = function (eventName, listener) {
          if (eventName == 'change') {
              this.changeListeners.push( listener );
          }
      };

      return AttributeHolder;
  }());

  B.ModuleContext = (function () {

      /**
       * @function Bonde.ModuleContext~attachNodes
       */
      function attachNodes (obj) {
          obj.$('[data-attach-to]').each(function () {
              var $this = $(this);
              var attachName = $this.data('attach-to');
              attachJqueryNode(obj, attachName, $this);
          });
      }

      /**
       * @function Bonde.ModuleContext~atachJqueryNodes
       */
      function attachJqueryNode (obj, attachName, $el) {
          obj['$'+attachName] = $el;
          obj[attachName]     = $el.get(0);

          obj.attr.set(attachName, $el.text());
          obj.attr.on('change', function (key, value) {
              if (key == attachName) {
                  $el.text(value);
              }
          });
      }


      /**
       * @class Bonde.ModuleContext
       * @param {DOMElement} element
       */
      function ModuleContext (element) {
          /**
           * @member {jQuery} Bonde.ModuleContext#$el
           */
          this.$el = $(element);
          /**
           * @member {DOMElement} Bonde.ModuleContext#el
           */
          this.el  = this.$el.get(0);
          /**
           * @member {object} Bonde.ModuleContext#options
           */
          this.options = this.$el.data();
          /**
           * @member {Bonde.AttributeHolder} Bonde.ModuleContext#attr
           */
          this.attr = new B.AttributeHolder();

          attachNodes(this);
      }

      /**
       * @method Bonde.ModuleContext#$
       * @param {string} selector
       */
      ModuleContext.prototype.$ = function (selector) {
          return this.$el.find(selector);
      };

      /**
       * @method Bonde.ModuleContext#attach
       * @param {string} attachName
       * @param {string} selector
       */
      ModuleContext.prototype.attach = function (attachName, selector) {
          var $el = this.$(selector);
          if ($el.length > 0) {
              attachJqueryNode(this, attachName, $el);
          }
      };

      /**
       * Mixin properties from given object into self.
       * @method Bonde.ModuleContext#mixin
       * @param {object} obj
       */
      ModuleContext.prototype.mixin = function (obj) {
          mixin(this, obj);
      };

      return ModuleContext;
  }());


  /**
   * Registry for module callbacks.
   */
  var modules = {};

  /**
   * A Module Callback.
   *
   * @callback Bonde~ModuleCallback
   * @this Bonde.ModuleContext
   */

  /**
   * @method Bonde.registerModule
   * @param {string} moduleName
   * @param {Bonde~ModuleCallback} moduleCallback
   */
  B.registerModule = function (moduleName, moduleCallback) {
      modules[moduleName] = moduleCallback;
  };

  /**
   * @method Bonde.registerModules
   * @param {hash} moduleMap
   */
  B.registerModules = function (moduleMap) {
      mixin(modules, moduleMap);
  };

  /**
   * Unregister all module callbacks.
   *
   * @method Bonde.reset
   */
  B.reset = function () {
      modules = [];
  };

  /**
   * Manually apply a registered module callback to a given element.
   *
   * @method Bonde.applyModule
   * @param {string} moduleName
   * @param {DOMElement} element
   * @returns {Bonde.ModuleContext} context in which the callback was executed.
   */
  B.applyModule = function (moduleName, element) {
      if (!modules[moduleName]) {
          return;
      }

      var ctx = new B.ModuleContext(element);
      modules[moduleName].call(ctx);
      return ctx;
  };

  /**
   * Applies registered module callbacks.
   *
   * Module callbacks are applied to Elements with `data-module`-attributes.
   *
   * @method Bonde.scanForModules
   * @param {DOMElement} node
   */
  B.scanForModules = function (node) {
      var nodes = $(node).find('[data-module]');

      if ( node.hasAttribute && node.hasAttribute('data-module') ) {
          nodes.push(node);
      }

      nodes.each(function () {
          var moduleName = $(this).data('module');
          B.applyModule(moduleName, this);
      });
  };

}(Bonde, jQuery));
