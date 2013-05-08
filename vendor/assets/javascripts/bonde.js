/*! bonde - v0.0.3 - 2013-03-26
* https://github.com/kwltrs/bonde
* Copyright (c) 2013 Kristofer Walters; Licensed MIT */
var Bonde = this.Bonde || {};

(function(B, $) {

  'use strict';

  function mixin(dest, src) {
      for (var k in src) {
          if (src.hasOwnProperty(k)) {
              dest[k] = src[k];
          }
      }
  }

  B.AttributeHolder = (function () {
      function notifyChange(attrHolder, key, newValue, oldValue) {
          var listeners = attrHolder.changeListeners;
          for (var i=0, len=listeners.length; i<len; i++) {
              listeners[i].call(attrHolder, key, newValue, oldValue);
          }
      }


      function AttributeHolder () {
          this.values = {};
          this.changeListeners = [];
      }

      AttributeHolder.prototype.get = function (key) {
          return this.values[key];
      };

      AttributeHolder.prototype.set = function (key, value) {
          var oldValue = this.values[key];
          this.values[key] = value;
          notifyChange(this, key, value, oldValue);
      };

      AttributeHolder.prototype.on = function (eventName, listener) {
          if (eventName == 'change') {
              this.changeListeners.push( listener );
          }
      };

      return AttributeHolder;
  }());

  B.ModuleContext = (function () {

      function attachNodes (obj) {
          obj.$('[data-attach-to]').each(function () {
              var $this = $(this);
              var attachName = $this.data('attach-to');
              attachJqueryNode(obj, attachName, $this);
          });
      }

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


      function ModuleContext (element) {
          this.$el = $(element);
          this.el  = this.$el.get(0);
          this.options = this.$el.data();
          this.attr = new B.AttributeHolder();

          attachNodes(this);
      }

      ModuleContext.prototype.$ = function (selector) {
          return this.$el.find(selector);
      };

      ModuleContext.prototype.attach = function (attachName, selector) {
          var $el = this.$(selector);
          if ($el.length > 0) {
              attachJqueryNode(this, attachName, $el);
          }
      };

      ModuleContext.prototype.mixin = function (obj) {
          mixin(this, obj);
      };

      return ModuleContext;
  }());


  var modules = [];

  B.registerModule = function (moduleName, moduleCallback) {
      modules[moduleName] = moduleCallback;
  };

  B.registerModules = function (moduleMap) {
      mixin(modules, moduleMap);
  };

  B.reset = function () {
      modules = [];
  };

  B.applyModule = function (moduleName, element) {
      if (!modules[moduleName]) {
          return;
      }

      var ctx = new B.ModuleContext(element);
      modules[moduleName].call(ctx);
      return ctx;
  };

  B.scanForModules = function (node) {
      $(node).find('[data-module]').each(function () {
          var moduleName = $(this).data('module');
          B.applyModule(moduleName, this);
      });
  };

}(Bonde, jQuery));
