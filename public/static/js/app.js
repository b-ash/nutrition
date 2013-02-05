(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
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
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  var Application, MacroCountsFactory, StatsFactory, User;

  User = require('models/users/user');

  MacroCountsFactory = require('models/macro_counts/macro_counts_factory');

  StatsFactory = require('models/stats/stats_factory');

  Application = {
    initialize: function(onSuccess) {
      var Router;
      Router = require('lib/router');
      this.views = {};
      this.router = new Router();
      this.user = new User();
      if (!this.user.isConfigured() && window.location.pathname !== '/configure') {
        return window.location.href = '/configure';
      } else {
        this.afterConfiguration();
        Backbone.history.start({
          pushState: true
        });
        return onSuccess();
      }
    },
    onConfigure: function() {
      this.macros.destroy();
      this.stats = StatsFactory.getStats(this.user);
      return this.macros = MacroCountsFactory.getMacroCounts(this.user, this.stats);
    },
    afterConfiguration: function() {
      if (this.user.isConfigured()) {
        this.stats = StatsFactory.getStats(this.user);
        return this.macros = MacroCountsFactory.getMacroCounts(this.user, this.stats);
      }
    }
  };

  module.exports = Application;
  
}});

window.require.define({"initialize": function(exports, require, module) {
  
  window.app = require('application');

  $(function() {
    console.log('----starting up----');
    return app.initialize(function() {
      return console.log('----success----');
    });
  });
  
}});

window.require.define({"lib/router": function(exports, require, module) {
  var Foods, NavView, Router, app, utils, views,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  utils = require('lib/utils');

  Foods = require('models/foods/foods');

  NavView = require('views/nav');

  views = {
    index: require('views/index'),
    stats: require('views/stats'),
    help: require('views/help'),
    about: require('views/about'),
    configure: require('views/configuration/configure'),
    foodAll: require('views/food_list/food_all_macros'),
    foodMacro: require('views/food_list/food_macro'),
    food: require('views/food_list/food')
  };

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      this.setCurrentView = __bind(this.setCurrentView, this);

      this.closeCurrentView = __bind(this.closeCurrentView, this);

      this.navSetup = __bind(this.navSetup, this);

      this.setupView = __bind(this.setupView, this);

      this.food = __bind(this.food, this);

      this.foodMacro = __bind(this.foodMacro, this);

      this.foodAllMacros = __bind(this.foodAllMacros, this);

      this.configure = __bind(this.configure, this);

      this.about = __bind(this.about, this);

      this.help = __bind(this.help, this);

      this.stats = __bind(this.stats, this);

      this.index = __bind(this.index, this);

      this.redirectDefault = __bind(this.redirectDefault, this);
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.currentView = null;

    Router.prototype.routes = {
      '': 'index',
      'food': 'foodAllMacros',
      'food/:macro': 'foodMacro',
      'food/:macro/:food': 'food',
      'stats': 'stats',
      'help': 'help',
      'about': 'about',
      'configure': 'configure',
      '*query': 'redirectDefault'
    };

    Router.prototype.redirectDefault = function(actions) {
      return this.navigate('', {
        trigger: true
      });
    };

    Router.prototype.index = function() {
      return this.setupView('index', 'index', {
        model: app.macros
      });
    };

    Router.prototype.stats = function() {
      return this.setupView('stats', 'stats', {
        model: app.stats
      });
    };

    Router.prototype.help = function() {
      return this.setupView('settings', 'help');
    };

    Router.prototype.about = function() {
      return this.setupView('settings', 'about');
    };

    Router.prototype.configure = function() {
      return this.setupView('settings', 'configure', {
        model: app.user
      });
    };

    Router.prototype.foodAllMacros = function() {
      return this.setupView('food', 'foodAll', {
        model: new Foods(app.user)
      });
    };

    Router.prototype.foodMacro = function(macro) {
      return this.setupView('food', 'foodMacro', {
        model: new Foods(app.user, macro)
      });
    };

    Router.prototype.food = function(macro, food) {
      return this.setupView('food', 'food', {
        model: new Foods(app.user, macro, food)
      });
    };

    Router.prototype.setupView = function(navItem, claxx, params) {
      var view;
      if (params == null) {
        params = {};
      }
      if (!app.user.isConfigured() && claxx !== 'configure') {
        return;
      }
      this.navSetup(navItem);
      view = app.views[claxx];
      if (view !== this.currentView) {
        this.closeCurrentView();
        view = app.views[claxx] = new views[claxx](params);
        return this.setCurrentView(view);
      }
    };

    Router.prototype.navSetup = function(activeView) {
      if (!(app.views.nav != null)) {
        app.views.nav = new NavView();
      }
      app.views.nav.activeView = activeView;
      return app.views.nav.render();
    };

    Router.prototype.closeCurrentView = function() {
      var _ref;
      return (_ref = this.currentView) != null ? _ref.close() : void 0;
    };

    Router.prototype.setCurrentView = function(view) {
      this.currentView = view;
      return $('#main_page').html(view.render().$el);
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"lib/utils": function(exports, require, module) {
  
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  String.prototype.toDisplay = function() {
    return this.replace('_', ' ').capitalize();
  };

  module.exports = {
    roundFloat: function(percentage, precision) {
      if (precision == null) {
        precision = 100;
      }
      return Math.round(percentage * precision) / precision;
    },
    pluralize: function(word, quantity) {
      if (quantity > 1) {
        return "" + word + "s";
      } else {
        return word;
      }
    }
  };
  
}});

window.require.define({"lib/view_helper": function(exports, require, module) {
  var Foods, utils;

  utils = require('lib/utils');

  Foods = require('models/foods/foods');

  Handlebars.registerHelper("debug", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
    if (optionalValue && optionalValue.hash === void 0) {
      console.log("Value");
      console.log("====================");
      return console.log(optionalValue);
    }
  });

  Handlebars.registerHelper("keys", function(list, ctx, fn) {
    var buffer, key, val;
    buffer = '';
    for (key in list) {
      val = list[key];
      buffer += fn({
        key: key,
        val: val,
        ctx: ctx
      });
    }
    return buffer;
  });

  Handlebars.registerHelper("getPercentageWidth", function(macro) {
    return window.app.macros.getMacroPercentage(macro);
  });

  Handlebars.registerHelper("getGoalForMacro", function(macro) {
    return window.app.macros.getGoalForMacro(macro);
  });

  Handlebars.registerHelper("getCalsDisplayForMacro", function(macro, amt) {
    var cals;
    cals = new Foods(window.app.user).getCalories(macro);
    if (cals != null) {
      return " - " + (amt * cals) + " cals";
    } else {
      return '';
    }
  });

  Handlebars.registerHelper("getTotalCals", function(macros) {
    return window.app.macros.getTotalCals();
  });

  Handlebars.registerHelper("ifIsExceedingGoal", function(macro, block) {
    if (window.app.macros.isExceedingGoal(macro)) {
      return block(this);
    } else {
      return block.inverse(this);
    }
  });

  Handlebars.registerHelper("getExactPortion", function(ctx, serving) {
    var measurement, portion, totalServingSize;
    serving = parseFloat(serving);
    portion = ctx.portion;
    totalServingSize = utils.roundFloat(portion * serving);
    measurement = utils.pluralize(ctx.measurement, totalServingSize);
    return "" + totalServingSize + " " + measurement;
  });

  Handlebars.registerHelper("pluralize", function(word, quantity) {
    return utils.pluralize(word, quantity);
  });
  
}});

window.require.define({"models/calorie_brackets/beast/beast/1800c": function(exports, require, module) {
  
  module.exports = {
    cals: 1800,
    goals: {
      starches: 1,
      legumes: 2,
      veggies: 4,
      fruits: 1,
      proteins: 19,
      fats: 2,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/2000c": function(exports, require, module) {
  
  module.exports = {
    cals: 2000,
    goals: {
      starches: 1,
      legumes: 3,
      veggies: 4,
      fruits: 1,
      proteins: 21,
      fats: 2,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/2200c": function(exports, require, module) {
  
  module.exports = {
    cals: 2200,
    goals: {
      starches: 1,
      legumes: 3,
      veggies: 4,
      fruits: 2,
      proteins: 23,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/2400c": function(exports, require, module) {
  
  module.exports = {
    cals: 2400,
    goals: {
      starches: 1,
      legumes: 3,
      veggies: 4,
      fruits: 2,
      proteins: 26,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/2600c": function(exports, require, module) {
  
  module.exports = {
    cals: 2600,
    goals: {
      starches: 2,
      legumes: 3,
      veggies: 4,
      fruits: 3,
      proteins: 29,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/2800c": function(exports, require, module) {
  
  module.exports = {
    cals: 2800,
    goals: {
      starches: 2,
      legumes: 3,
      veggies: 5,
      fruits: 4,
      proteins: 31,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/3000c": function(exports, require, module) {
  
  module.exports = {
    cals: 3000,
    goals: {
      starches: 2,
      legumes: 3,
      veggies: 5,
      fruits: 5,
      proteins: 34,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/3200c": function(exports, require, module) {
  
  module.exports = {
    cals: 3200,
    goals: {
      starches: 2,
      legumes: 4,
      veggies: 5,
      fruits: 5,
      proteins: 36,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/3400c": function(exports, require, module) {
  
  module.exports = {
    cals: 3400,
    goals: {
      starches: 3,
      legumes: 4,
      veggies: 5,
      fruits: 5,
      proteins: 39,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/3600c": function(exports, require, module) {
  
  module.exports = {
    cals: 3600,
    goals: {
      starches: 3,
      legumes: 5,
      veggies: 5,
      fruits: 5,
      proteins: 40,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/3800c": function(exports, require, module) {
  
  module.exports = {
    cals: 3800,
    goals: {
      starches: 3,
      legumes: 5,
      veggies: 5,
      fruits: 6,
      proteins: 43,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/4000c": function(exports, require, module) {
  
  module.exports = {
    cals: 4000,
    goals: {
      starches: 3,
      legumes: 5,
      veggies: 5,
      fruits: 7,
      proteins: 46,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/4200c": function(exports, require, module) {
  
  module.exports = {
    cals: 4200,
    goals: {
      starches: 3,
      legumes: 6,
      veggies: 5,
      fruits: 7,
      proteins: 48,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/4400c": function(exports, require, module) {
  
  module.exports = {
    cals: 4400,
    goals: {
      starches: 3,
      legumes: 7,
      veggies: 5,
      fruits: 7,
      proteins: 50,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/4600c": function(exports, require, module) {
  
  module.exports = {
    cals: 4600,
    goals: {
      starches: 3,
      legumes: 8,
      veggies: 5,
      fruits: 7,
      proteins: 52,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/beast/4800c": function(exports, require, module) {
  
  module.exports = {
    cals: 4800,
    goals: {
      starches: 3,
      legumes: 9,
      veggies: 5,
      fruits: 7,
      proteins: 54,
      fats: 3,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/2000c": function(exports, require, module) {
  
  module.exports = {
    cals: 2000,
    goals: {
      starches: 5,
      legumes: 2,
      veggies: 4,
      fruits: 5,
      proteins: 9,
      fats: 4,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/2200c": function(exports, require, module) {
  
  module.exports = {
    cals: 2200,
    goals: {
      starches: 5,
      legumes: 3,
      veggies: 5,
      fruits: 5,
      proteins: 10,
      fats: 5,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/2400c": function(exports, require, module) {
  
  module.exports = {
    cals: 2400,
    goals: {
      starches: 6,
      legumes: 3,
      veggies: 5,
      fruits: 6,
      proteins: 12,
      fats: 5,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/2600c": function(exports, require, module) {
  
  module.exports = {
    cals: 2600,
    goals: {
      starches: 7,
      legumes: 3,
      veggies: 6,
      fruits: 6,
      proteins: 12,
      fats: 6,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/2800c": function(exports, require, module) {
  
  module.exports = {
    cals: 2800,
    goals: {
      starches: 7,
      legumes: 4,
      veggies: 6,
      fruits: 7,
      proteins: 13,
      fats: 6,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/3000c": function(exports, require, module) {
  
  module.exports = {
    cals: 3000,
    goals: {
      starches: 8,
      legumes: 4,
      veggies: 7,
      fruits: 7,
      proteins: 14,
      fats: 7,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/3200c": function(exports, require, module) {
  
  module.exports = {
    cals: 3200,
    goals: {
      starches: 8,
      legumes: 4,
      veggies: 7,
      fruits: 9,
      proteins: 16,
      fats: 7,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/3400c": function(exports, require, module) {
  
  module.exports = {
    cals: 3400,
    goals: {
      starches: 8,
      legumes: 4,
      veggies: 8,
      fruits: 10,
      proteins: 17,
      fats: 8,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/3600c": function(exports, require, module) {
  
  module.exports = {
    cals: 3600,
    goals: {
      starches: 8,
      legumes: 5,
      veggies: 8,
      fruits: 11,
      proteins: 18,
      fats: 8,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/3800c": function(exports, require, module) {
  
  module.exports = {
    cals: 3800,
    goals: {
      starches: 8,
      legumes: 6,
      veggies: 9,
      fruits: 11,
      proteins: 19,
      fats: 8,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/4000c": function(exports, require, module) {
  
  module.exports = {
    cals: 4000,
    goals: {
      starches: 9,
      legumes: 6,
      veggies: 9,
      fruits: 12,
      proteins: 20,
      fats: 9,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/4200c": function(exports, require, module) {
  
  module.exports = {
    cals: 4200,
    goals: {
      starches: 10,
      legumes: 6,
      veggies: 10,
      fruits: 12,
      proteins: 21,
      fats: 9,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/4400c": function(exports, require, module) {
  
  module.exports = {
    cals: 4400,
    goals: {
      starches: 10,
      legumes: 6,
      veggies: 10,
      fruits: 14,
      proteins: 23,
      fats: 9,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/4600c": function(exports, require, module) {
  
  module.exports = {
    cals: 4600,
    goals: {
      starches: 11,
      legumes: 6,
      veggies: 11,
      fruits: 14,
      proteins: 24,
      fats: 10,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/4800c": function(exports, require, module) {
  
  module.exports = {
    cals: 4800,
    goals: {
      starches: 11,
      legumes: 6,
      veggies: 11,
      fruits: 15,
      proteins: 26,
      fats: 11,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/beast/build/5000c": function(exports, require, module) {
  
  module.exports = {
    cals: 5000,
    goals: {
      starches: 12,
      legumes: 6,
      veggies: 11,
      fruits: 16,
      proteins: 27,
      fats: 11,
      shake: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/calorie_brackets": function(exports, require, module) {
  var CalorieBracketsFactory;

  CalorieBracketsFactory = (function() {

    function CalorieBracketsFactory() {}

    CalorieBracketsFactory.getBracket = function(stats) {
      return require("./" + stats.program + "/" + stats.calories + "c");
    };

    return CalorieBracketsFactory;

  })();

  module.exports = CalorieBracketsFactory;
  
}});

window.require.define({"models/calorie_brackets/x2/endurance_maximizer/1800c": function(exports, require, module) {
  
  module.exports = {
    cals: 1800,
    goals: {
      proteins: 2,
      dairy: 1,
      fruits: 2,
      veggies: 2,
      fats: 1,
      grains: 1,
      legumes: 1,
      condiments: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/endurance_maximizer/2400c": function(exports, require, module) {
  
  module.exports = {
    cals: 2400,
    goals: {
      proteins: 3,
      dairy: 1,
      fruits: 3,
      veggies: 3,
      fats: 1,
      grains: 2,
      legumes: 2,
      condiments: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/endurance_maximizer/3000c": function(exports, require, module) {
  
  module.exports = {
    cals: 3000,
    goals: {
      proteins: 4,
      dairy: 1,
      fruits: 3,
      veggies: 5,
      fats: 1,
      grains: 2.5,
      legumes: 2.5,
      condiments: 3
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/energy_booster/1800c": function(exports, require, module) {
  
  module.exports = {
    cals: 1800,
    goals: {
      proteins: 4,
      dairy: 2,
      fruits: 1,
      veggies: 4,
      fats: 1,
      grains: 0.5,
      legumes: 0.5,
      condiments: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/energy_booster/2400c": function(exports, require, module) {
  
  module.exports = {
    cals: 2400,
    goals: {
      proteins: 6,
      dairy: 2,
      fruits: 1,
      veggies: 3,
      fats: 1,
      grains: 1.5,
      legumes: 1.5,
      condiments: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/energy_booster/3000c": function(exports, require, module) {
  
  module.exports = {
    cals: 3000,
    goals: {
      proteins: 8,
      dairy: 2,
      fruits: 2,
      veggies: 3,
      fats: 1,
      grains: 1.5,
      legumes: 1.5,
      condiments: 3
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/fat_shredder/1800c": function(exports, require, module) {
  
  module.exports = {
    cals: 1800,
    goals: {
      proteins: 5,
      dairy: 2,
      fruits: 1,
      veggies: 2,
      fats: 1,
      grains: 0.5,
      legumes: 0.5,
      condiments: 1
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/fat_shredder/2400c": function(exports, require, module) {
  
  module.exports = {
    cals: 2400,
    goals: {
      proteins: 7,
      dairy: 3,
      fruits: 1,
      veggies: 4,
      fats: 1,
      grains: 0.5,
      legumes: 0.5,
      condiments: 2
    }
  };
  
}});

window.require.define({"models/calorie_brackets/x2/fat_shredder/3000c": function(exports, require, module) {
  
  module.exports = {
    cals: 3000,
    goals: {
      proteins: 9,
      dairy: 4,
      fruits: 2,
      veggies: 4,
      fats: 1,
      grains: 1,
      legumes: 1,
      condiments: 2
    }
  };
  
}});

window.require.define({"models/foods/beast/all_macros": function(exports, require, module) {
  
  module.exports = {
    starches: 'Starches',
    legumes: 'Legumes',
    veggies: 'Veggies',
    fruits: 'Fruits',
    proteins: 'Proteins',
    fats: 'Fats',
    liquid_protein: 'Protein Liquids (Legume)',
    liquid_balanced: 'Balanced Liquids (Veggie)',
    liquid_carb: 'Carb Liquids (Fruit)'
  };
  
}});

window.require.define({"models/foods/beast/fats": function(exports, require, module) {
  
  module.exports = {
    macro: 'fats',
    display: 'Fats',
    cals: 45,
    foods: {
      avocado: {
        display: 'Avocado',
        portion: 1,
        measurement: 'oz',
        description: ''
      },
      butter: {
        display: 'Butter',
        portion: 1,
        measurement: 'Tbsp',
        description: ''
      },
      chia: {
        display: 'Chia Seeds',
        portion: 2,
        measurement: 'Tbsp',
        description: ''
      },
      milk: {
        display: 'Coconut Milk',
        portion: 1.5,
        measurement: 'Tbsp',
        description: 'Canned'
      },
      coconut_oil: {
        display: 'Coconut Oil',
        portion: 1,
        measurement: 'tsp',
        description: ''
      },
      coconut: {
        display: 'Coconut',
        portion: 2,
        measurement: 'Tbsp',
        description: 'Shredded, unsweetened'
      },
      cream: {
        display: 'Cream',
        portion: 1,
        measurement: 'Tbsp',
        description: 'Liquid heavy whipping cream, crema fresca'
      },
      yolk: {
        display: 'Egg Yolk',
        portion: 1,
        measurement: 'yolk',
        description: ''
      },
      nut_butters: {
        display: 'Nut Butters',
        portion: 1.5,
        measurement: 'tsp',
        description: 'Almond, cashew, peanut (3.5g protein)'
      },
      nuts: {
        display: 'Nuts',
        portion: 5,
        measurement: 'nut',
        description: 'Almonds, cashews, walnuts, pecans, hazelnuts'
      },
      oils: {
        display: 'Oils',
        portion: 1,
        measurement: 'tsp',
        description: 'Olive, peanut, safflower, sunflower, flaxseed'
      },
      olives: {
        display: 'Olives',
        portion: 1,
        measurement: 'Tbsp',
        description: ''
      },
      seeds: {
        display: 'Seeds',
        portion: 1,
        measurement: 'Tbsp',
        description: 'Flax, pumpkin, sunflower, sesame'
      },
      sour_cream: {
        display: 'Sour Cream',
        portion: 2,
        measurement: 'Tbsp',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/fruits": function(exports, require, module) {
  
  module.exports = {
    macro: 'fruits',
    display: 'Fruits',
    cals: 60,
    foods: {
      applesauce: {
        display: 'Applesauce',
        portion: 0.5,
        measurement: 'cup',
        description: 'Unsweetened'
      },
      apple: {
        display: 'Apple',
        portion: 1,
        measurement: 'apple',
        description: 'Small, with peel'
      },
      apples: {
        display: 'Apples (dried)',
        portion: 4,
        measurement: 'ring',
        description: 'Unsulfered'
      },
      apricot: {
        display: 'Apricot (dried)',
        portion: 8,
        measurement: 'half',
        description: 'Unsulfured'
      },
      apricots: {
        display: 'Apricots (fresh)',
        portion: 4,
        measurement: 'apricots',
        description: ''
      },
      banana: {
        display: 'Banana',
        portion: 0.5,
        measurement: 'banana',
        description: 'Large'
      },
      blackberries: {
        display: 'Blackberries',
        portion: 0.75,
        measurement: 'cup',
        description: ''
      },
      blueberries: {
        display: 'Blueberries',
        portion: 0.75,
        measurement: 'cup',
        description: ''
      },
      cantaloupe: {
        display: 'Cantaloupe',
        portion: 1,
        measurement: 'cup',
        description: 'Cubed'
      },
      cherries: {
        display: 'Cherries (fresh)',
        portion: 12,
        measurement: 'cherry',
        description: ''
      },
      dates: {
        display: 'Dates',
        portion: 3,
        measurement: 'date',
        description: ''
      },
      dried_fruits: {
        display: 'Dried Fruits',
        portion: 2,
        measurement: 'Tbsp',
        description: 'Unsulfured'
      },
      figs: {
        display: 'Figs',
        portion: 2,
        measurement: 'fig',
        description: 'Medium'
      },
      fruit_cocktail: {
        display: 'Fruit Cocktail',
        portion: 0.5,
        measurement: 'cup',
        description: 'No sugar added'
      },
      grapefruit: {
        display: 'Grapefruit',
        portion: 0.5,
        measurement: 'grapefruit',
        description: 'Fresh'
      },
      grapes: {
        display: 'Grapes',
        portion: 17,
        measurement: 'grape',
        description: 'Small'
      },
      honeydew: {
        display: 'Honeydew Melon',
        portion: 1,
        measurement: 'cup',
        description: 'Cubed'
      },
      kiwi: {
        display: 'Kiwi',
        portion: 1,
        measurement: 'kiwi',
        description: ''
      },
      mandarin_orange: {
        display: 'Mandarin Orange',
        portion: 0.75,
        measurement: 'cup',
        description: ''
      },
      mango: {
        display: 'Mango',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      nectarine: {
        display: 'Nectarine',
        portion: 1,
        measurement: 'nectarine',
        description: 'Small'
      },
      orange: {
        display: 'Orange',
        portion: 1,
        measurement: 'orange',
        description: 'Small'
      },
      papaya: {
        display: 'Papaya',
        portion: 1,
        measurement: 'cup',
        description: 'Cubed'
      },
      peach: {
        display: 'Peach',
        portion: 1,
        measurement: 'peach',
        description: 'Fresh, medium'
      },
      pear: {
        display: 'Pear',
        portion: 0.5,
        measurement: 'pear',
        description: 'Fresh, large'
      },
      pineapple: {
        display: 'Pineapple',
        portion: 0.75,
        measurement: 'cup',
        description: 'Fresh'
      },
      plums: {
        display: 'Plums',
        portion: 2,
        measurement: 'plum',
        description: 'Fresh'
      },
      prunes: {
        display: 'Prunes',
        portion: 3,
        measurement: 'prune',
        description: ''
      },
      raisins: {
        display: 'Raisins',
        portion: 2,
        measurement: 'Tbsp',
        description: ''
      },
      raspberries: {
        display: 'Raspberries',
        portion: 1,
        measurement: 'cup',
        description: ''
      },
      strawberries: {
        display: 'Strawberries',
        portion: 1.25,
        measurement: 'cup',
        description: 'Whole'
      },
      tangerines: {
        display: 'Tangerines',
        portion: 2,
        measurement: 'tangerine',
        description: 'Small'
      },
      watermelon: {
        display: 'Watermelon',
        portion: 1.25,
        measurement: 'cup',
        description: 'Cubed'
      },
      carb_powder: {
        display: 'Carbohydrate Powder',
        portion: 0.5,
        measurement: 'scoop',
        description: 'Beachbody Fuel Shot or equivalent'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/legumes": function(exports, require, module) {
  
  module.exports = {
    macro: 'legumes',
    display: 'Legumes',
    cals: 125,
    foods: {
      beans: {
        display: 'Beans - black, kidney, etc. (cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: 'Black, garbanzo, pinto, kidney, white, lima'
      },
      refried_beans: {
        display: 'Refried Beans',
        portion: 0.5,
        measurement: 'cup',
        description: 'Canned, fat-free'
      },
      fava: {
        display: 'Fava (cooked)',
        portion: 0.66,
        measurement: 'cup',
        description: ''
      },
      lentils: {
        display: 'Lentils (cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: 'Brown, green, yellow'
      },
      peas: {
        display: 'Peas',
        portion: 0.5,
        measurement: 'cup',
        description: 'Black-eyed / split (cooked), green'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/liquid_balanced": function(exports, require, module) {
  
  module.exports = {
    macro: 'liquid_balanced',
    display: 'Balanced Liquid',
    macroOverride: 'veggies',
    macroOverrideDisplay: 'veggie',
    cals: 30,
    foods: {
      almond_milk: {
        display: 'Almond Milk',
        portion: 0.5,
        measurement: 'cup',
        description: 'Original flavor'
      },
      coconut_water: {
        display: 'Coconut Water',
        portion: 0.66,
        measurement: 'cup',
        description: ''
      },
      coconut_milk: {
        display: 'Coconut Milk',
        portion: 0.5,
        measurement: 'cup',
        description: 'Sweetened, in carton'
      },
      hemp_milk: {
        display: 'Hemp Milk',
        portion: 0.25,
        measurement: 'cup',
        description: ''
      },
      rice_milk: {
        display: 'Rice Milk',
        portion: 0.25,
        measurement: 'cup',
        description: 'Plain'
      },
      shakeology: {
        display: 'Shakeology',
        portion: 0.25,
        measurement: 'scoop',
        description: 'With water'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/liquid_carb": function(exports, require, module) {
  
  module.exports = {
    macro: 'liquid_carb',
    display: 'Carb Liquids',
    macroOverride: 'fruits',
    macroOverrideDisplay: 'fruit',
    cals: 60,
    foods: {
      apple: {
        display: 'Apple Juice',
        portion: 0.5,
        measurement: 'cup',
        description: '100% juice'
      },
      fruit: {
        display: 'Fruit Blend',
        portion: 0.66,
        measurement: 'cup',
        description: '100% juice'
      },
      grapefruit: {
        display: 'Grapefruit Juice',
        portion: 0.5,
        measurement: 'cup',
        description: '100% juice'
      },
      orange: {
        display: 'Orange Juice',
        portion: 0.5,
        measurement: 'cup',
        description: '100% juice'
      },
      pineapple: {
        display: 'Pineapple Juice',
        portion: 0.5,
        measurement: 'cup',
        description: '100% juice'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/liquid_protein": function(exports, require, module) {
  
  module.exports = {
    macro: 'liquid_protein',
    display: 'Protein Liquids',
    macroOverride: 'legumes',
    macroOverrideDisplay: 'legume',
    cals: 125,
    foods: {
      milk: {
        display: 'Cow\'s Milk',
        portion: 1,
        measurement: 'cup',
        description: 'Reduced fat'
      },
      chocolate_milk: {
        display: 'Chocolate Milk',
        portion: 0.66,
        measurement: 'cup',
        description: 'Low-fat'
      },
      shakeology: {
        display: 'Shakeology',
        portion: 0.66,
        measurement: 'scoop',
        description: 'With water'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/proteins": function(exports, require, module) {
  
  module.exports = {
    macro: 'proteins',
    display: 'Proteins',
    cals: 45,
    foods: {
      beef: {
        display: 'Beef',
        portion: 1,
        measurement: 'oz',
        description: 'Cooked, 85% lean if ground'
      },
      cheese: {
        display: 'Cheeses',
        portion: 1,
        measurement: 'oz',
        description: 'Less than 3g fat per ounce'
      },
      cottage_cheese: {
        display: 'Cottage Cheese',
        portion: 0.25,
        measurement: 'cup',
        description: '1% fat'
      },
      egg_whites: {
        display: 'Egg whites',
        portion: 2,
        measurement: 'egg white',
        description: ''
      },
      fish: {
        display: 'Fish',
        portion: 1,
        measurement: 'oz',
        description: 'Catfish, cod, flounder, haddock, salmon, tilapia, tuna'
      },
      game: {
        display: 'Buffalo, Ostrich, Venison',
        portion: 1,
        measurement: 'oz',
        description: 'Cooked'
      },
      lamb: {
        display: 'Lamb',
        portion: 1,
        measurement: 'oz',
        description: 'Chop, leg, roast (cooked)'
      },
      pork: {
        display: 'Pork',
        portion: 1,
        measurement: 'oz',
        description: 'Ham, tenderloin, canadian bacon, rib or loin chop (cooked)'
      },
      poultry: {
        display: 'Poultry',
        portion: 1,
        measurement: 'oz',
        description: 'Skinless, fat trimmed, chicken, turkey, duck (cooked)'
      },
      ricotta: {
        display: 'Ricotta Cheese',
        portion: 0.25,
        measurement: 'cup',
        description: 'Part skim'
      },
      sandwich: {
        display: 'Sandwich Meats',
        portion: 1,
        measurement: 'oz',
        description: '0 to 3g fat per oz, turkey, ham, roast beef'
      },
      sardines: {
        display: 'Sardines',
        portion: 2,
        measurement: 'sardine',
        description: 'Medium'
      },
      shellfish: {
        display: 'Shellfish',
        portion: 1.5,
        measurement: 'oz',
        description: 'Shrimp, clams, crab, lobster, scallops (cooked)'
      },
      tuna: {
        display: 'Tuna',
        portion: 1,
        measurement: 'oz',
        description: 'Canned in water, drained'
      },
      yogurt: {
        display: 'Yogurt',
        portion: 0.25,
        measurement: 'cup',
        description: 'Greek, plain'
      },
      powder: {
        display: 'Protein Powder',
        portion: 0.33,
        measurement: 'scoop',
        description: 'Beachbody Hardcore Base Shake or equivalent'
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/starches": function(exports, require, module) {
  
  module.exports = {
    macro: 'starches',
    display: 'Starches',
    cals: 80,
    foods: {
      amaranth: {
        display: 'Amaranth seeds (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      bagel: {
        display: 'Bagel',
        portion: 0.25,
        measurement: 'cup',
        description: 'whole wheat'
      },
      barley: {
        display: 'Barley (cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      bran_concentrated: {
        display: 'Bran Cereal (concentrated)',
        portion: 0.33,
        measurement: 'cup',
        description: 'All-Bran or All-Bran Bran Buds Cereal'
      },
      bran_flaked: {
        display: 'Bran Cereal (flaked)',
        portion: 0.5,
        measurement: 'cup',
        description: 'Low-sugar'
      },
      bread: {
        display: 'Bread',
        portion: 1,
        measurement: 'slice',
        description: 'Whole wheat, pumpernickel, rye'
      },
      buckwheat: {
        display: 'Buckwheat groats (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: 'Kasha'
      },
      bulgar: {
        display: 'Bulgar (cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      cassava: {
        display: 'Cassava/Yucca (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      cooked_cereal: {
        display: 'Cooked Cereals (Oatmeal)',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      corn_cob: {
        display: 'Corn on the cob',
        portion: 0.5,
        measurement: 'cob',
        description: 'Large'
      },
      corn: {
        display: 'Corn',
        portion: 0.5,
        measurement: 'cup',
        description: 'Plain, fresh, frozen, or canned (drained)'
      },
      couscous: {
        display: 'Couscous (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: 'Whole wheat'
      },
      english_muffin: {
        display: 'English Muffin',
        portion: 0.5,
        measurement: 'muffin',
        description: 'Whole wheat'
      },
      granola: {
        display: 'Granola',
        portion: 0.25,
        measurement: 'cup',
        description: 'Low-fat'
      },
      hominy: {
        display: 'Hominy',
        portion: 0.75,
        measurement: 'cup',
        description: 'Canned, drained'
      },
      millet: {
        display: 'Millet (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      muesli: {
        display: 'Muesli',
        portion: 0.25,
        measurement: 'cup',
        description: ''
      },
      pancakes: {
        display: 'Pancakes',
        portion: 1,
        measurement: 'pancake',
        description: 'Whole wheat, 1/4in thick, 6in diameter'
      },
      parsnip: {
        display: 'Parsnip',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      pasta: {
        display: 'Pasta (cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: 'Whole wheat'
      },
      pita: {
        display: 'Pita',
        portion: 0.5,
        measurement: 'pita',
        description: 'Whole wheat, 6in diameter'
      },
      plantain: {
        display: 'Plantain',
        portion: 0.33,
        measurement: 'cup',
        description: 'Ripe'
      },
      potato_baked: {
        display: 'Potato (baked)',
        portion: 0.25,
        measurement: 'potato',
        description: 'With skin'
      },
      potato_boiled: {
        display: 'Potato (boiled)',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      potato_fries: {
        display: 'Potato (french fries)',
        portion: 1,
        measurement: 'cup',
        description: 'Oven-baked'
      },
      potato_mashed: {
        display: 'Potato (mashed)',
        portion: 0.5,
        measurement: 'cup',
        description: 'With milk'
      },
      pumpkin: {
        display: 'Pumpkin',
        portion: 1,
        measurement: 'cup',
        description: 'Canned, no sugar added'
      },
      quinoa: {
        display: 'Quinoa (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      rice_brown: {
        display: 'Rice (brown, cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      rice_wild: {
        display: 'Rice (wild, cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      shredded_wheat: {
        display: 'Shredded Wheat',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      spelt: {
        display: 'Spelt (cooked)',
        portion: 0.33,
        measurement: 'cup',
        description: ''
      },
      squash: {
        display: 'Squash (winter)',
        portion: 1,
        measurement: 'cup',
        description: 'Acorn, butternut'
      },
      tortilla: {
        display: 'Tortilla',
        portion: 1,
        measurement: 'tortilla',
        description: 'Corn or whole wheat, 6in diameter'
      },
      waffle: {
        display: 'Waffle',
        portion: 1,
        measurement: 'waffle',
        description: 'Whole wheat, 4in diameter'
      },
      wheat_germ: {
        display: 'Wheat germ',
        portion: 3,
        measurement: 'Tbsp',
        description: ''
      },
      yam: {
        display: 'Yam or Sweet Potato',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/beast/veggies": function(exports, require, module) {
  
  module.exports = {
    macro: 'veggies',
    display: 'Veggies',
    cals: 25,
    foods: {
      artichoke: {
        display: 'Artichoke / Hearts',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked'
      },
      asparagus: {
        display: 'Asparagus',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      baby_corn: {
        display: 'Baby Corn',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      bamboo: {
        display: 'Bamboo Shots',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      beans: {
        display: 'Beans - green, wax, italian (Cooked)',
        portion: 0.5,
        measurement: 'cup',
        description: 'Green, wax, italian. Cooked, or 1 cup raw'
      },
      bean_sprouts: {
        display: 'Bean Sprouts',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      beets: {
        display: 'Beets',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      bok_choy: {
        display: 'Bok Choy',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      broccoli: {
        display: 'Broccoli',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      brussels_sprouts: {
        display: 'Brussels Sprouts',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked'
      },
      cabbage: {
        display: 'Cabbage',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      carrots: {
        display: 'Carrots',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      cauliflower: {
        display: 'Cauliflower',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      cucumber: {
        display: 'Cucumber',
        portion: 1,
        measurement: 'cup',
        description: 'Raw. Probably includes pickles.'
      },
      eggplant: {
        display: 'Eggplant',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked'
      },
      heart_of_palm: {
        display: 'Heart of palm',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      jicama: {
        display: 'Jicama',
        portion: 1,
        measurement: 'cup',
        description: 'Raw'
      },
      lettuce: {
        display: 'Lettuce',
        portion: 3,
        measurement: 'cup',
        description: 'Chopped'
      },
      mixed: {
        display: 'Mixed Veggies',
        portion: 0.5,
        measurement: 'cup',
        description: 'Without corn and peas. Cooked, or 1 cup raw'
      },
      mushrooms: {
        display: 'Mushrooms',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      Okra: {
        display: 'Okra',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      onions: {
        display: 'Onions',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      peppers: {
        display: 'Peppers',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      snow_peas: {
        display: 'Snow Peas',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      spinach: {
        display: 'Spinach',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 2 cups raw'
      },
      summer_squash: {
        display: 'Summer Squash',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      swiss_chard: {
        display: 'Swiss Chard',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      tomato: {
        display: 'Tomato',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      },
      tomato_sauce: {
        display: 'Tomato Sauce',
        portion: 0.5,
        measurement: 'cup',
        description: ''
      },
      water_chestnut: {
        display: 'Water Chestnut',
        portion: 0.5,
        measurement: 'can',
        description: ''
      },
      zucchini: {
        display: 'Zucchini',
        portion: 0.5,
        measurement: 'cup',
        description: 'Cooked, or 1 cup raw'
      }
    }
  };
  
}});

window.require.define({"models/foods/foods": function(exports, require, module) {
  var Foods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Foods = (function() {

    Foods.prototype.macros = {};

    function Foods(user, macro, food) {
      var display, _ref;
      this.user = user;
      this.macro = macro;
      this.food = food;
      this.getCalories = __bind(this.getCalories, this);

      this.toJSON = __bind(this.toJSON, this);

      if (this.user.isConfigured()) {
        this.ALL_MACROS = require("./" + (this.user.getProgram()) + "/all_macros");
        _ref = this.ALL_MACROS;
        for (macro in _ref) {
          display = _ref[macro];
          this.macros[macro] = require("./" + (this.user.getProgram()) + "/" + macro);
        }
      }
    }

    Foods.prototype.toJSON = function() {
      var food, macro;
      if (this.macro != null) {
        macro = this.macros[this.macro] || {
          food: {}
        };
        if (this.food != null) {
          food = macro.foods[this.food];
          food.macro = macro.macro;
          food.macroOverride = macro.macroOverride;
          food.cals = macro.cals;
          return food;
        } else {
          return macro;
        }
      } else {
        return this.ALL_MACROS;
      }
    };

    Foods.prototype.getCalories = function(macro) {
      if (macro == null) {
        macro = this.macro;
      }
      return this.macros[macro]['cals'];
    };

    return Foods;

  })();

  module.exports = Foods;
  
}});

window.require.define({"models/foods/x2/all_macros": function(exports, require, module) {
  
  module.exports = {
    proteins: 'Proteins',
    dairy: 'Dairy',
    fruits: 'Fruits',
    veggies: 'Veggies',
    fats: 'Fats',
    grains: 'Grains',
    legumes: 'Legumes',
    condiments: 'Condiments'
  };
  
}});

window.require.define({"models/foods/x2/condiments": function(exports, require, module) {
  
  module.exports = {
    macro: 'condiments',
    display: 'Condiments',
    cals: 50,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/dairy": function(exports, require, module) {
  
  module.exports = {
    macro: 'dairy',
    display: 'Dairy',
    cals: 120,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/fats": function(exports, require, module) {
  
  module.exports = {
    macro: 'fats',
    display: 'Fats',
    cals: 120,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/fruits": function(exports, require, module) {
  
  module.exports = {
    macro: 'fruits',
    display: 'Fruits',
    cals: 100,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/grains": function(exports, require, module) {
  
  module.exports = {
    macro: 'grains',
    display: 'Grains',
    cals: 200,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/legumes": function(exports, require, module) {
  
  module.exports = {
    macro: 'legumes',
    display: 'Legumes',
    cals: 200,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/proteins": function(exports, require, module) {
  
  module.exports = {
    macro: 'proteins',
    display: 'Proteins',
    cals: 100,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/foods/x2/veggies": function(exports, require, module) {
  
  module.exports = {
    macro: 'veggies',
    display: 'Veggies',
    cals: 50,
    foods: {
      NAME: {
        display: '???',
        portion: 1,
        measurement: 'oz',
        description: ''
      }
    }
  };
  
}});

window.require.define({"models/local_storage_model": function(exports, require, module) {
  var LocalStorageModel,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalStorageModel = (function(_super) {

    __extends(LocalStorageModel, _super);

    function LocalStorageModel() {
      return LocalStorageModel.__super__.constructor.apply(this, arguments);
    }

    LocalStorageModel.prototype.localStorage = new Backbone.LocalStorage('Nutrition');

    return LocalStorageModel;

  })(Backbone.Model);

  module.exports = LocalStorageModel;
  
}});

window.require.define({"models/macro_counts/base_macros_model": function(exports, require, module) {
  var BaseMacrosModel, Foods, LocalStorageModel, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = require('lib/utils');

  LocalStorageModel = require('models/local_storage_model');

  Foods = require('models/foods/foods');

  BaseMacrosModel = (function(_super) {

    __extends(BaseMacrosModel, _super);

    function BaseMacrosModel() {
      this.clear = __bind(this.clear, this);

      this.isExceedingGoal = __bind(this.isExceedingGoal, this);

      this.getGoalForMacro = __bind(this.getGoalForMacro, this);

      this.calculateTotalCals = __bind(this.calculateTotalCals, this);

      this.getTotalCals = __bind(this.getTotalCals, this);

      this.getMacroPercentage = __bind(this.getMacroPercentage, this);

      this.changeByAmount = __bind(this.changeByAmount, this);

      this.decrement = __bind(this.decrement, this);

      this.increment = __bind(this.increment, this);

      this.initialize = __bind(this.initialize, this);
      return BaseMacrosModel.__super__.constructor.apply(this, arguments);
    }

    BaseMacrosModel.prototype.id = 'macro-counts';

    BaseMacrosModel.prototype.totalCals = 0;

    BaseMacrosModel.prototype.initialize = function(stats) {
      this.fetch();
      this.goals = stats.getGoals();
      this.foods = new Foods(app.user);
      return this.calculateTotalCals();
    };

    BaseMacrosModel.prototype.increment = function(macro, amt) {
      if (amt == null) {
        amt = 0.5;
      }
      return this.changeByAmount(macro, amt);
    };

    BaseMacrosModel.prototype.decrement = function(macro, amt) {
      if (amt == null) {
        amt = -0.5;
      }
      return this.changeByAmount(macro, amt);
    };

    BaseMacrosModel.prototype.changeByAmount = function(macro, amt) {
      var cals, macros, newCount;
      macros = this.get('macros');
      newCount = Math.max(macros[macro].count + parseFloat(amt), 0);
      cals = this.foods.getCalories(macro);
      this.totalCals += amt * cals;
      macros[macro].count = newCount;
      return this.save('macros', macros);
    };

    BaseMacrosModel.prototype.getMacroPercentage = function(macro) {
      var goal, percentage;
      goal = this.getGoalForMacro(macro);
      macro = this.get('macros')[macro].count;
      percentage = (macro / goal) * 100;
      return Math.min(utils.roundFloat(percentage), 100);
    };

    BaseMacrosModel.prototype.getTotalCals = function() {
      return this.totalCals;
    };

    BaseMacrosModel.prototype.calculateTotalCals = function() {
      var cals, macro, name, _ref;
      _ref = this.get('macros');
      for (name in _ref) {
        macro = _ref[name];
        cals = this.foods.getCalories(name);
        if (cals != null) {
          this.totalCals += macro.count * cals;
        }
      }
      return this;
    };

    BaseMacrosModel.prototype.getGoalForMacro = function(macro) {
      return this.goals[macro];
    };

    BaseMacrosModel.prototype.isExceedingGoal = function(macro) {
      var goal;
      goal = this.getGoalForMacro(macro);
      macro = this.get('macros')[macro].count;
      return macro > goal;
    };

    BaseMacrosModel.prototype.clear = function() {
      this.save(this.defaults());
      this.totalCals = 0;
      return this.trigger('cleared');
    };

    return BaseMacrosModel;

  })(LocalStorageModel);

  module.exports = BaseMacrosModel;
  
}});

window.require.define({"models/macro_counts/beast_macro_counts": function(exports, require, module) {
  var BaseMacrosModel, BeastMacros,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseMacrosModel = require('./base_macros_model');

  BeastMacros = (function(_super) {

    __extends(BeastMacros, _super);

    function BeastMacros() {
      return BeastMacros.__super__.constructor.apply(this, arguments);
    }

    BeastMacros.prototype.defaults = function() {
      return {
        macros: {
          starches: {
            display: 'Starches',
            count: 0
          },
          legumes: {
            display: 'Legumes',
            count: 0
          },
          veggies: {
            display: 'Veggies',
            count: 0
          },
          fruits: {
            display: 'Fruits',
            count: 0
          },
          proteins: {
            display: 'Proteins',
            count: 0
          },
          fats: {
            display: 'Fats',
            count: 0
          }
        },
        timestamp: new moment().format('MM-DD-YY')
      };
    };

    return BeastMacros;

  })(BaseMacrosModel);

  module.exports = BeastMacros;
  
}});

window.require.define({"models/macro_counts/macro_counts_factory": function(exports, require, module) {
  var MACRO_COUNTS, MacroCountsFactory;

  MACRO_COUNTS = {
    beast: require('./beast_macro_counts'),
    x2: require('./x2_macro_counts')
  };

  MacroCountsFactory = (function() {

    function MacroCountsFactory() {}

    MacroCountsFactory.getMacroCounts = function(user, stats) {
      return new MACRO_COUNTS[user.getProgram()](stats);
    };

    return MacroCountsFactory;

  })();

  module.exports = MacroCountsFactory;
  
}});

window.require.define({"models/macro_counts/x2_macro_counts": function(exports, require, module) {
  var BaseMacrosModel, X2Macros,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseMacrosModel = require('./base_macros_model');

  X2Macros = (function(_super) {

    __extends(X2Macros, _super);

    function X2Macros() {
      return X2Macros.__super__.constructor.apply(this, arguments);
    }

    X2Macros.prototype.defaults = function() {
      return {
        macros: {
          proteins: {
            display: 'Proteins',
            count: 0
          },
          dairy: {
            display: 'Dairy',
            count: 0
          },
          fruits: {
            display: 'Fruits',
            count: 0
          },
          veggies: {
            display: 'Veggies',
            count: 0
          },
          fats: {
            display: 'Fats',
            count: 0
          },
          grains: {
            display: 'Grains',
            count: 0
          },
          legumes: {
            display: 'Legumes',
            count: 0
          },
          condiments: {
            display: 'Condiments',
            count: 0
          }
        },
        timestamp: new moment().format('MM-DD-YY')
      };
    };

    return X2Macros;

  })(BaseMacrosModel);

  module.exports = X2Macros;
  
}});

window.require.define({"models/stats/base_stats": function(exports, require, module) {
  var BaseStats, CalorieBrackets,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CalorieBrackets = require('models/calorie_brackets/calorie_brackets');

  BaseStats = (function() {

    function BaseStats() {
      this.getCalories = __bind(this.getCalories, this);

      this.getGoals = __bind(this.getGoals, this);

    }

    BaseStats.prototype.getGoals = function() {
      var goals;
      goals = CalorieBrackets.getBracket(this);
      return goals.goals;
    };

    BaseStats.prototype.getCalories = function() {
      return this.calorieBracket.cals;
    };

    BaseStats.prototype.toJSON = function() {
      return {
        stats: this.getDisplayStats()
      };
    };

    return BaseStats;

  })();

  module.exports = BaseStats;
  
}});

window.require.define({"models/stats/beast_stats": function(exports, require, module) {
  var BaseStats, BeastStats, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseStats = require('./base_stats');

  utils = require('lib/utils');

  BeastStats = (function(_super) {

    __extends(BeastStats, _super);

    function BeastStats(user) {
      this.getDisplayStats = __bind(this.getDisplayStats, this);

      this.getMacroBreakdown = __bind(this.getMacroBreakdown, this);

      this.getCalorieBracket = __bind(this.getCalorieBracket, this);
      this.weight = user.get('weight');
      this.bfp = user.get('bfp');
      this.phase = user.getPhase();
      this.program = user.get('program');
      this.calorieBracket = this.getCalorieBracket();
      this.calories = this.getCalories();
    }

    BeastStats.prototype.getCalorieBracket = function() {
      var cals, cim, cmr, lbm, rawCals, rmr, rmr2;
      lbm = utils.roundFloat(this.lbm(this.weight, this.bfp), 1);
      rmr = utils.roundFloat(this.rmr(lbm), 1);
      cmr = utils.roundFloat(this.cmr(rmr), 1);
      rmr2 = utils.roundFloat(this.rmr2(rmr, cmr), 1);
      cim = utils.roundFloat(this.cim(rmr2), 1);
      if (this.phase === 'build') {
        rawCals = utils.roundFloat(this.build(this.bfp, cim), 1);
      } else {
        rawCals = utils.roundFloat(this.beast(this.bfp, cim), 1);
      }
      cals = this.roundCalsToBracket(rawCals, this.phase);
      return {
        lbm: lbm,
        rmr: rmr,
        cmr: cmr,
        rmr2: rmr2,
        cim: cim,
        rawCals: rawCals,
        cals: cals
      };
    };

    BeastStats.prototype.getMacroBreakdown = function() {
      if (this.phase === 'build') {
        return '25/50/25';
      } else {
        return '40/30/30';
      }
    };

    BeastStats.prototype.getDisplayStats = function() {
      return [
        {
          display: 'Phase',
          val: this.phase.capitalize()
        }, {
          display: 'Macro Breakdown (P/C/F)',
          val: this.getMacroBreakdown()
        }, {
          display: 'Lean Body Mass',
          val: this.calorieBracket.lbm
        }, {
          display: 'Resting Metabolic Rate',
          val: this.calorieBracket.rmr
        }, {
          display: 'Caloric Modification for Recovery',
          val: this.calorieBracket.cmr
        }, {
          display: 'RMR Modified for Recovery',
          val: this.calorieBracket.rmr2
        }, {
          display: 'Calorie Intake to Maintain Weight',
          val: this.calorieBracket.cim
        }, {
          display: "Calories needed to " + this.phase,
          val: this.calorieBracket.rawCals
        }, {
          display: 'Calorie Bracket',
          val: this.calorieBracket.cals
        }
      ];
    };

    BeastStats.prototype.lbm = function(weight, bfp) {
      return (100 - bfp) / 100 * weight;
    };

    BeastStats.prototype.rmr = function(lbm) {
      return lbm * 10;
    };

    BeastStats.prototype.cmr = function(rmr) {
      return rmr * 0.3;
    };

    BeastStats.prototype.rmr2 = function(rmr, cmr) {
      return rmr + cmr;
    };

    BeastStats.prototype.cim = function(rmr2) {
      return rmr2 + 600;
    };

    BeastStats.prototype.build = function(bfp, cim) {
      if (bfp > 20) {
        return cim + (cim * 0.1);
      } else if (bfp > 10) {
        return cim + (cim * 0.15);
      } else {
        return cim + (cim * 0.2);
      }
    };

    BeastStats.prototype.beast = function(bfp, cim) {
      if (bfp > 20) {
        return cim - (cim * 0.2);
      } else if (bfp > 10) {
        return cim - (cim * 0.15);
      } else {
        return cim - (cim * 0.1);
      }
    };

    BeastStats.prototype.roundCalsToBracket = function(rawCals, phase) {
      var cals;
      if (phase === 'build') {
        cals = Math.ceil(rawCals / 200) * 200;
        return this.getCalsBetweenValues(cals, 2000, 5000);
      } else {
        cals = Math.floor(rawCals / 200) * 200;
        return this.getCalsBetweenValues(cals, 1800, 4800);
      }
    };

    BeastStats.prototype.getCalsBetweenValues = function(cals, lowerBound, upperBound) {
      if (cals < lowerBound) {
        return lowerBound;
      } else if (cals > upperBound) {
        return upperBound;
      } else {
        return cals;
      }
    };

    return BeastStats;

  })(BaseStats);

  module.exports = BeastStats;
  
}});

window.require.define({"models/stats/stats_factory": function(exports, require, module) {
  var STATS, StatsFactory;

  STATS = {
    beast: require('./beast_stats'),
    x2: require('./x2_stats')
  };

  StatsFactory = (function() {

    function StatsFactory() {}

    StatsFactory.getStats = function(user) {
      if (user.isConfigured()) {
        return new STATS[user.getProgram()](user);
      }
    };

    return StatsFactory;

  })();

  module.exports = StatsFactory;
  
}});

window.require.define({"models/stats/x2_stats": function(exports, require, module) {
  var BaseStats, X2Stats, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseStats = require('./base_stats');

  utils = require('lib/utils');

  X2Stats = (function(_super) {

    __extends(X2Stats, _super);

    function X2Stats(user) {
      this.getDisplayStats = __bind(this.getDisplayStats, this);

      this.getMacroBreakdown = __bind(this.getMacroBreakdown, this);

      this.getCalorieBracket = __bind(this.getCalorieBracket, this);
      this.weight = user.get('weight');
      this.phase = user.getPhase();
      this.program = user.get('program');
      this.dab = user.get('dab');
      this.de = user.get('de');
      this.sway = user.get('sway');
      this.calorieBracket = this.getCalorieBracket();
      this.calories = this.getCalories();
    }

    X2Stats.prototype.getCalorieBracket = function() {
      var cals, dab, rawCals, rmr;
      rmr = utils.roundFloat(this.calcRMR(this.weight), 1);
      dab = utils.roundFloat(this.calcDAB(rmr, this.dab), 1);
      rawCals = utils.roundFloat(this.calcRawCals(rmr, dab, this.de, this.sway), 1);
      cals = this.roundCalsToBracket(rawCals);
      return {
        rmr: rmr,
        dab: dab,
        de: this.de,
        sway: this.sway,
        rawCals: rawCals,
        cals: cals
      };
    };

    X2Stats.prototype.getMacroBreakdown = function() {
      if (this.phase === 'energy_booster') {
        return '30/40/30';
      } else if (this.phase === 'endurance_maximizer') {
        return '25/50/25';
      } else {
        return '50/25/25';
      }
    };

    X2Stats.prototype.getDisplayStats = function() {
      return [
        {
          display: 'Phase',
          val: this.phase.toDisplay()
        }, {
          display: 'Macro Breakdown (P/C/F)',
          val: this.getMacroBreakdown()
        }, {
          display: 'Resting Metabolic Rate',
          val: this.calorieBracket.rmr
        }, {
          display: 'Daily Activity Burn',
          val: this.calorieBracket.dab
        }, {
          display: 'Daily Exercise',
          val: this.calorieBracket.de
        }, {
          display: 'Caloric Surplus / Deficit',
          val: this.calorieBracket.sway
        }, {
          display: 'Calories needed',
          val: this.calorieBracket.rawCals
        }, {
          display: 'Calorie Bracket',
          val: this.calorieBracket.cals
        }
      ];
    };

    X2Stats.prototype.calcRMR = function(lbm) {
      return lbm * 10;
    };

    X2Stats.prototype.calcDAB = function(rmr, dab) {
      return rmr * dab;
    };

    X2Stats.prototype.calcRawCals = function(rmr, dab, de, sway) {
      return rmr + dab + de + sway;
    };

    X2Stats.prototype.roundCalsToBracket = function(rawCals) {
      if (rawCals < 2400) {
        return 1800;
      } else if (rawCals < 3000) {
        return 2400;
      } else {
        return 3000;
      }
    };

    return X2Stats;

  })(BaseStats);

  module.exports = X2Stats;
  
}});

window.require.define({"models/users/user": function(exports, require, module) {
  var LocalStorageModel, User,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalStorageModel = require('models/local_storage_model');

  User = (function(_super) {

    __extends(User, _super);

    function User() {
      this.initialize = __bind(this.initialize, this);
      return User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.id = 'user';

    User.prototype.initialize = function() {
      return this.fetch();
    };

    User.prototype.defaults = function() {
      return {
        name: null,
        weight: null,
        bfp: null,
        program: null,
        configured: false
      };
    };

    User.prototype.getPhase = function() {
      var program, slash;
      program = this.get('program');
      if (!(program != null)) {
        return null;
      }
      slash = program.indexOf('/');
      if (slash === -1) {
        return null;
      }
      return program.substring(slash + 1, program.length);
    };

    User.prototype.getProgram = function() {
      var program;
      program = this.get('program');
      return User.parseProgram(program);
    };

    User.prototype.isConfigured = function() {
      return this.get('configured') && (this.get('program') != null) && this.get('program').length;
    };

    User.parseProgram = function(program) {
      if (!(program != null) || program.length === 0) {
        return null;
      } else if (program.indexOf('beast') === 0) {
        return 'beast';
      } else if (program.indexOf('x2') === 0) {
        return 'x2';
      } else {
        return program;
      }
    };

    return User;

  })(LocalStorageModel);

  module.exports = User;
  
}});

window.require.define({"views/about": function(exports, require, module) {
  var AboutView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  AboutView = (function(_super) {

    __extends(AboutView, _super);

    function AboutView() {
      return AboutView.__super__.constructor.apply(this, arguments);
    }

    AboutView.prototype.tagName = 'div';

    AboutView.prototype.className = 'content';

    AboutView.prototype.template = require('./templates/about');

    return AboutView;

  })(View);

  module.exports = AboutView;
  
}});

window.require.define({"views/configuration/beast_config": function(exports, require, module) {
  var BeastConfigureView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('views/view');

  BeastConfigureView = (function(_super) {

    __extends(BeastConfigureView, _super);

    function BeastConfigureView() {
      this.isValid = __bind(this.isValid, this);

      this.getInputData = __bind(this.getInputData, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return BeastConfigureView.__super__.constructor.apply(this, arguments);
    }

    BeastConfigureView.prototype.tagName = 'div';

    BeastConfigureView.prototype.className = 'extra-config';

    BeastConfigureView.prototype.template = require('views/templates/configure_beast');

    BeastConfigureView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    BeastConfigureView.prototype.getInputData = function() {
      return {
        bfp: parseInt(this.$('#bfp').val() || 0)
      };
    };

    BeastConfigureView.prototype.isValid = function() {
      var bfp;
      bfp = this.$('#bfp').val();
      return bfp.length !== 0 && parseInt(bfp) !== NaN;
    };

    return BeastConfigureView;

  })(View);

  module.exports = BeastConfigureView;
  
}});

window.require.define({"views/configuration/configure": function(exports, require, module) {
  var ConfigureView, PROGRAM_CONFIG, User, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('views/view');

  User = require('models/users/user');

  PROGRAM_CONFIG = {
    beast: require('./beast_config'),
    x2: require('./x2_config')
  };

  ConfigureView = (function(_super) {

    __extends(ConfigureView, _super);

    function ConfigureView() {
      this.onClose = __bind(this.onClose, this);

      this.onError = __bind(this.onError, this);

      this.configure = __bind(this.configure, this);

      this.isValid = __bind(this.isValid, this);

      this.renderProgramConfig = __bind(this.renderProgramConfig, this);

      this.afterRender = __bind(this.afterRender, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return ConfigureView.__super__.constructor.apply(this, arguments);
    }

    ConfigureView.prototype.tagName = 'div';

    ConfigureView.prototype.className = 'content';

    ConfigureView.prototype.template = require('views/templates/configure');

    ConfigureView.prototype.events = {
      'click #configure': 'configure',
      'change #program': 'renderProgramConfig'
    };

    ConfigureView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    ConfigureView.prototype.afterRender = function() {
      var program;
      program = this.model.get('program');
      if (program != null) {
        this.$("#program option[value='" + program + "']").attr('selected', 'selected');
        return this.renderProgramConfig();
      }
    };

    ConfigureView.prototype.renderProgramConfig = function() {
      var program, _ref;
      program = User.parseProgram(this.$('#program').val());
      if (!(program != null)) {
        if ((_ref = this.views.program) != null) {
          _ref.remove();
        }
        return;
      }
      this.views.program = new PROGRAM_CONFIG[program]({
        model: this.model
      });
      return this.$('#program_config').html(this.views.program.render().el);
    };

    ConfigureView.prototype.isValid = function() {
      return this.$('#program').val().length !== 0;
    };

    ConfigureView.prototype.configure = function() {
      var config, programConfig, _ref;
      if (!(this.isValid() && ((_ref = this.views.program) != null ? _ref.isValid() : void 0))) {
        return this.onError();
      }
      config = {
        name: this.$('#name').val() || null,
        weight: parseInt(this.$('#weight').val() || 0),
        program: this.$('#program').val()
      };
      programConfig = this.views.program.getInputData();
      this.model.save($.extend({
        configured: true
      }, config, programConfig));
      app.onConfigure();
      return app.router.navigate('', true);
    };

    ConfigureView.prototype.onError = function() {
      return this.$('#error_msg').show();
    };

    ConfigureView.prototype.onClose = function() {
      this.views.program.remove();
      return delete this.views.program;
    };

    return ConfigureView;

  })(View);

  module.exports = ConfigureView;
  
}});

window.require.define({"views/configuration/x2_config": function(exports, require, module) {
  var View, X2ConfigureView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('views/view');

  X2ConfigureView = (function(_super) {

    __extends(X2ConfigureView, _super);

    function X2ConfigureView() {
      this.isValid = __bind(this.isValid, this);

      this.getInputData = __bind(this.getInputData, this);

      this.afterRender = __bind(this.afterRender, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return X2ConfigureView.__super__.constructor.apply(this, arguments);
    }

    X2ConfigureView.prototype.tagName = 'div';

    X2ConfigureView.prototype.className = 'extra-config';

    X2ConfigureView.prototype.template = require('views/templates/configure_x2');

    X2ConfigureView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    X2ConfigureView.prototype.afterRender = function() {
      var dab;
      dab = this.model.get('dab');
      if (dab != null) {
        return this.$("#dab option[value='" + dab + "']").attr('selected', 'selected');
      }
    };

    X2ConfigureView.prototype.getInputData = function() {
      return {
        dab: parseFloat(this.$('#dab').val()),
        de: parseFloat(this.$('#de').val()),
        sway: parseFloat(this.$('#sway').val())
      };
    };

    X2ConfigureView.prototype.isValid = function() {
      var dab, de, sway;
      dab = this.$('#dab').val();
      de = this.$('#de').val();
      sway = this.$('#sway').val();
      return dab.length && parseFloat(dab) !== NaN && de.length && parseFloat(de) !== NaN && sway.length && parseFloat(sway) !== NaN;
    };

    return X2ConfigureView;

  })(View);

  module.exports = X2ConfigureView;
  
}});

window.require.define({"views/food_list/food": function(exports, require, module) {
  var FoodMacroView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('views/view');

  FoodMacroView = (function(_super) {

    __extends(FoodMacroView, _super);

    function FoodMacroView() {
      this.submitAndGoHome = __bind(this.submitAndGoHome, this);

      this.submitAndRoute = __bind(this.submitAndRoute, this);

      this.increment = __bind(this.increment, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return FoodMacroView.__super__.constructor.apply(this, arguments);
    }

    FoodMacroView.prototype.tagName = 'div';

    FoodMacroView.prototype.className = 'content';

    FoodMacroView.prototype.template = require('views/templates/food');

    FoodMacroView.prototype.events = {
      'click a': 'routeEvent',
      'click #submit_and_route': 'submitAndRoute',
      'click #submit_and_go_home': 'submitAndGoHome'
    };

    FoodMacroView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    FoodMacroView.prototype.increment = function() {
      var macro, modelData, servingSize;
      servingSize = this.$('#portion_select').val();
      modelData = this.model.toJSON();
      macro = modelData.macroOverride || modelData.macro;
      return app.macros.increment(macro, servingSize);
    };

    FoodMacroView.prototype.submitAndRoute = function() {
      this.increment();
      return app.router.navigate("/food", true);
    };

    FoodMacroView.prototype.submitAndGoHome = function() {
      this.increment();
      return app.router.navigate('', true);
    };

    return FoodMacroView;

  })(View);

  module.exports = FoodMacroView;
  
}});

window.require.define({"views/food_list/food_all_macros": function(exports, require, module) {
  var FoodAllMacrosView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('views/view');

  FoodAllMacrosView = (function(_super) {

    __extends(FoodAllMacrosView, _super);

    function FoodAllMacrosView() {
      this.getRenderData = __bind(this.getRenderData, this);
      return FoodAllMacrosView.__super__.constructor.apply(this, arguments);
    }

    FoodAllMacrosView.prototype.tagName = 'div';

    FoodAllMacrosView.prototype.className = 'content';

    FoodAllMacrosView.prototype.template = require('views/templates/food_all_macros');

    FoodAllMacrosView.prototype.events = {
      'click a': 'routeEvent'
    };

    FoodAllMacrosView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    return FoodAllMacrosView;

  })(View);

  module.exports = FoodAllMacrosView;
  
}});

window.require.define({"views/food_list/food_macro": function(exports, require, module) {
  var FoodMacroView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('views/view');

  FoodMacroView = (function(_super) {

    __extends(FoodMacroView, _super);

    function FoodMacroView() {
      this.getRenderData = __bind(this.getRenderData, this);
      return FoodMacroView.__super__.constructor.apply(this, arguments);
    }

    FoodMacroView.prototype.tagName = 'div';

    FoodMacroView.prototype.className = 'content';

    FoodMacroView.prototype.template = require('views/templates/food_macro');

    FoodMacroView.prototype.events = {
      'click a': 'routeEvent'
    };

    FoodMacroView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    return FoodMacroView;

  })(View);

  module.exports = FoodMacroView;
  
}});

window.require.define({"views/help": function(exports, require, module) {
  var HelpView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  HelpView = (function(_super) {

    __extends(HelpView, _super);

    function HelpView() {
      return HelpView.__super__.constructor.apply(this, arguments);
    }

    HelpView.prototype.tagName = 'div';

    HelpView.prototype.className = 'content';

    HelpView.prototype.template = require('./templates/help');

    return HelpView;

  })(View);

  module.exports = HelpView;
  
}});

window.require.define({"views/index": function(exports, require, module) {
  var IndexView, MacroBarFactory, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  MacroBarFactory = require('views/macro_bars/macro_bar_factory');

  IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.updateTotalCalories = __bind(this.updateTotalCalories, this);

      this.afterRender = __bind(this.afterRender, this);

      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.tagName = 'div';

    IndexView.prototype.className = 'content';

    IndexView.prototype.template = require('./templates/index');

    IndexView.prototype.initialize = function() {
      var claxx, macro, view, _results;
      this.views = {};
      _results = [];
      for (macro in this.model.get('macros')) {
        claxx = new MacroBarFactory.get(macro);
        view = new claxx({
          model: this.model,
          macro: macro
        });
        view.on('update', this.updateTotalCalories);
        _results.push(this.views[macro] = view);
      }
      return _results;
    };

    IndexView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    IndexView.prototype.afterRender = function() {
      var macro, view, _ref, _results;
      _ref = this.views;
      _results = [];
      for (macro in _ref) {
        view = _ref[macro];
        _results.push(this.$('.list.macros').append(view.render().el));
      }
      return _results;
    };

    IndexView.prototype.updateTotalCalories = function() {
      return this.$('#text_total_cals').text(this.model.getTotalCals());
    };

    return IndexView;

  })(View);

  module.exports = IndexView;
  
}});

window.require.define({"views/macro_bars/base_macro_bar": function(exports, require, module) {
  var BaseMacroView, Foods, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('views/view');

  Foods = require('models/foods/foods');

  BaseMacroView = (function(_super) {

    __extends(BaseMacroView, _super);

    function BaseMacroView() {
      this.clear = __bind(this.clear, this);

      this.changeCurrentCals = __bind(this.changeCurrentCals, this);

      this.changePercentText = __bind(this.changePercentText, this);

      this.changePercentBar = __bind(this.changePercentBar, this);

      this.animateRender = __bind(this.animateRender, this);

      this.decrement = __bind(this.decrement, this);

      this.increment = __bind(this.increment, this);

      this.getRenderData = __bind(this.getRenderData, this);

      this.onClose = __bind(this.onClose, this);

      this.initialize = __bind(this.initialize, this);
      return BaseMacroView.__super__.constructor.apply(this, arguments);
    }

    BaseMacroView.prototype.tagName = 'div';

    BaseMacroView.prototype.className = 'list-item macro';

    BaseMacroView.prototype.template = require('views/templates/macro_bar');

    BaseMacroView.prototype.events = {
      'click .percentage-bar': 'increment',
      'click .btn-decrement': 'decrement'
    };

    BaseMacroView.prototype.initialize = function() {
      this.model.on('cleared', this.clear);
      return this.foods = new Foods(app.user, this.options.macro);
    };

    BaseMacroView.prototype.onClose = function() {
      return this.model.off('cleared', this.clear);
    };

    BaseMacroView.prototype.getRenderData = function() {
      var data;
      data = this.model.get('macros')[this.options.macro];
      return {
        macro: this.options.macro,
        count: data.count,
        display: data.display
      };
    };

    BaseMacroView.prototype.increment = function(event) {
      event.stopPropagation();
      this.model.increment(this.options.macro);
      this.animateRender();
      return this.trigger('update');
    };

    BaseMacroView.prototype.decrement = function(event) {
      event.stopPropagation();
      this.model.decrement(this.options.macro);
      this.animateRender();
      return this.trigger('update');
    };

    BaseMacroView.prototype.animateRender = function() {
      this.changePercentBar();
      this.changePercentText();
      return this.changeCurrentCals();
    };

    BaseMacroView.prototype.changePercentBar = function() {
      var macroPercentage, pixelPercentage;
      macroPercentage = this.model.getMacroPercentage(this.options.macro);
      pixelPercentage = macroPercentage / 100 * this.$('.percentage-bar').width();
      return this.$('.percentage-complete').css({
        width: "" + pixelPercentage + "px"
      });
    };

    BaseMacroView.prototype.changePercentText = function() {
      var count;
      count = this.model.get('macros')[this.options.macro].count;
      this.$('.text_count').text(count);
      if (this.model.isExceedingGoal(this.options.macro)) {
        return this.$('.percentage-text').addClass('exceeding');
      } else {
        return this.$('.percentage-text').removeClass('exceeding');
      }
    };

    BaseMacroView.prototype.changeCurrentCals = function() {
      var cals, count;
      count = this.model.get('macros')[this.options.macro].count;
      cals = this.foods.getCalories(this.options.macro);
      return this.$('.text_cals').text(" - " + (count * cals) + " cals");
    };

    BaseMacroView.prototype.clear = function() {
      this.render();
      return this.trigger('update');
    };

    return BaseMacroView;

  })(View);

  module.exports = BaseMacroView;
  
}});

window.require.define({"views/macro_bars/macro_bar_factory": function(exports, require, module) {
  var BaseBar, MacroBarFactory, OVERRIDES;

  BaseBar = require('./base_macro_bar');

  OVERRIDES = {
    shake: BaseBar
  };

  MacroBarFactory = (function() {

    function MacroBarFactory() {}

    MacroBarFactory.get = function(macro) {
      return OVERRIDES[macro] || BaseBar;
    };

    return MacroBarFactory;

  })();

  module.exports = MacroBarFactory;
  
}});

window.require.define({"views/nav": function(exports, require, module) {
  var NavView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  NavView = (function(_super) {

    __extends(NavView, _super);

    function NavView() {
      this.routeEventWrap = __bind(this.routeEventWrap, this);

      this.clearMacros = __bind(this.clearMacros, this);

      this.afterRender = __bind(this.afterRender, this);
      return NavView.__super__.constructor.apply(this, arguments);
    }

    NavView.prototype.el = '#nav';

    NavView.prototype.activeView = null;

    NavView.prototype.events = {
      'click a': 'routeEventWrap',
      'click #clear_list': 'clearMacros'
    };

    NavView.prototype.afterRender = function() {
      this.$('.nav li').removeClass('active');
      return this.$("#" + this.activeView + "_nav").addClass('active');
    };

    NavView.prototype.clearMacros = function() {
      return app.macros.clear();
    };

    NavView.prototype.routeEventWrap = function(event) {
      if (!app.user.get('configured')) {
        return event.preventDefault();
      }
      return this.routeEvent(event);
    };

    return NavView;

  })(View);

  module.exports = NavView;
  
}});

window.require.define({"views/stats": function(exports, require, module) {
  var StatsView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  StatsView = (function(_super) {

    __extends(StatsView, _super);

    function StatsView() {
      this.getRenderData = __bind(this.getRenderData, this);
      return StatsView.__super__.constructor.apply(this, arguments);
    }

    StatsView.prototype.tagName = 'div';

    StatsView.prototype.className = 'content';

    StatsView.prototype.template = require('./templates/stats');

    StatsView.prototype.getRenderData = function() {
      return {
        user: app.user.toJSON(),
        stats: this.model.toJSON()
      };
    };

    return StatsView;

  })(View);

  module.exports = StatsView;
  
}});

window.require.define({"views/templates/about": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n    <h4>About</h4>\n</header>\n\n<div class=\"about\">\n    <h5>Who is Bash?</h5>\n    <p>Bash is a developer who is obsessed with health and fitness. He lives in Boston and writes software for a startup called <a href=\"http://www.hubspot.com/\" target=\"_blank\">HubSpot</a>.</p>\n    <p>When he's not lifting or getting his nutrition needs, he's tinkering with gadgets and hopefully developing the next big thing.</p>\n</div>\n\n<div class=\"about\">\n    <h5>Credits</h5>\n    <p><b>All</b> credit regarding the macronutrient levels and nutrition data found in this app belongs to <a href=\"http://www.beachbody.com/\" target=\"_blank\">Beachbody</a> from their at-home workout programs <a href=\"http://www.beachbody.com/product/fitness_programs/body-beast-workout.do\" target=\"_blank\">Body Beast</a> and <a href=\"http://www.beachbody.com/product/fitness_programs/p90x2-workout-the-next-p90x.do\" target=\"_blank\">P90X2</a>. If you dig the information in here, go support them and buy the programs - they're a great company with a great mission.</p>\n</div>\n\n<div class=\"about\">\n    <h5>Contributing</h5>\n    <p>If you'd like to contribute, feel free to head over to <a href=\"https://github.com/b-ash/nutrition\" target=\"_blank\">github</a> and take a look. Pull requests are appreciated.</p>\n</div>\n";});
}});

window.require.define({"views/templates/configure": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n        <h4>Reconfigure your profile</h4>\n    ";}

  function program3(depth0,data) {
    
    
    return "\n        <h4>Configure your profile</h4>\n    ";}

  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    return buffer;}

  function program7(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.weight;
    stack1 = foundHelper || depth0.weight;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "weight", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    return buffer;}

    buffer += "<header>\n    ";
    foundHelper = helpers.configured;
    stack1 = foundHelper || depth0.configured;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    ";
    foundHelper = helpers.configured;
    stack1 = foundHelper || depth0.configured;
    tmp1 = self.noop;
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</header>\n\n<div id=\"error_msg\" class=\"alert error\" style=\"display: none;\">All fields are required</div>\n\n<div>\n    <input id=\"name\" type=\"text\" placeholder=\"My name is...\" ";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    stack2 = helpers['if'];
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n    <input id=\"weight\" type=\"number\" placeholder=\"Weight\" ";
    foundHelper = helpers.weight;
    stack1 = foundHelper || depth0.weight;
    stack2 = helpers['if'];
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n</div>\n\n<div>\n    <select id=\"program\" placeholder=\"No program selected\">\n        <option value=\"\">No program selected</option>\n        <optgroup label=\"Body Beast\">\n            <option value=\"beast/build\">Build / Bulk (phases 1 &amp; 2)</option>\n            <option value=\"beast/beast\">Beast (phase 3)</option>\n        </optgroup>\n        <optgroup label=\"P90X2\">\n            <option value=\"x2/energy_booster\">Energy Booster (standard)</option>\n            <option value=\"x2/fat_shredder\">Fat Shredder</option>\n            <option value=\"x2/endurance_maximizer\">Endurance Maximizer</option>\n        </optgroup>\n    </select>\n</div>\n\n<div id=\"program_config\"></div>\n\n<div class=\"configure-actions\">\n    <a id=\"configure\" class=\"btn btn-primary dont-route\">Configure</a>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/configure_beast": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.bfp;
    stack1 = foundHelper || depth0.bfp;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "bfp", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    return buffer;}

    buffer += "<input id=\"bfp\" type=\"number\" placeholder=\"Body Fat Percentage\" ";
    foundHelper = helpers.bfp;
    stack1 = foundHelper || depth0.bfp;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n";
    return buffer;});
}});

window.require.define({"views/templates/configure_x2": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.de;
    stack1 = foundHelper || depth0.de;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "de", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.sway;
    stack1 = foundHelper || depth0.sway;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "sway", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    return buffer;}

    buffer += "<select id=\"dab\">\n    <option value=\"\">Daily Activity Burn</option>\n    <option value=\"0.1\">Sedetary</option>\n    <option value=\"0.2\">Moderate</option>\n    <option value=\"0.3\">High</option>\n</select>\n<input id=\"de\" type=\"number\" placeholder=\"Daily Exercise\" ";
    foundHelper = helpers.de;
    stack1 = foundHelper || depth0.de;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n<input id=\"sway\" type=\"number\" placeholder=\"Caloric Surplus/Deficit\" ";
    foundHelper = helpers.sway;
    stack1 = foundHelper || depth0.sway;
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />";
    return buffer;});
}});

window.require.define({"views/templates/food": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<header>\n    <div class=\"clearfix\">\n        <h4 class=\"left without-top-margin\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n        <a href=\"/food/";
    foundHelper = helpers.macro;
    stack1 = foundHelper || depth0.macro;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "macro", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" class=\"right\">Go back</a>\n    </div>\n</header>\n\n<div class=\"description\">\n    <span>";
    foundHelper = helpers.description;
    stack1 = foundHelper || depth0.description;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n</div>\n\n<div class=\"portions\">\n    <span>One serving: ";
    foundHelper = helpers.portion;
    stack1 = foundHelper || depth0.portion;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "portion", { hash: {} }); }
    buffer += escapeExpression(stack1) + " ";
    foundHelper = helpers.quantity;
    stack1 = foundHelper || depth0.quantity;
    foundHelper = helpers.measurement;
    stack2 = foundHelper || depth0.measurement;
    foundHelper = helpers.pluralize;
    stack3 = foundHelper || depth0.pluralize;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "pluralize", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ", ";
    foundHelper = helpers.cals;
    stack1 = foundHelper || depth0.cals;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "cals", { hash: {} }); }
    buffer += escapeExpression(stack1) + " calories</span>\n</div>\n\n<div class=\"portion-controls\">\n    <label for=\"portion_select\">How many portions?</label>\n    <select id=\"portion_select\">\n        <option value=\"0.5\">1/2 serving (";
    stack1 = "0.5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"1\" selected=\"selected\">1 serving (";
    stack1 = "1";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"1.5\">1.5 servings (";
    stack1 = "1.5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"2\">2 servings (";
    stack1 = "2";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"2.5\">2.5 servings (";
    stack1 = "2.5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"3\">3 servings (";
    stack1 = "3";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"3.5\">3.5 servings (";
    stack1 = "3.5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"4\">4 servings (";
    stack1 = "4";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"4.5\">4.5 servings (";
    stack1 = "4.5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n        <option value=\"5\">5 servings (";
    stack1 = "5";
    stack2 = depth0;
    foundHelper = helpers.getExactPortion;
    stack3 = foundHelper || depth0.getExactPortion;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getExactPortion", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + ")</option>\n    </select>\n\n    <div class=\"controls\">\n        <a id=\"submit_and_route\" class=\"dont-route btn btn-primary\">Add</a>\n        <a id=\"submit_and_go_home\" class=\"dont-route btn btn-primary\">Add and return home</a>\n    </div>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/food_all_macros": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <div class=\"list-item macro center-text\" data-key=\"";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n            <a href=\"/food/";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" class=\"btn btn-large btn-secondary btn-macro\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n        </div>\n    ";
    return buffer;}

    buffer += "<header>\n    <h4>Select a macro category</h4>\n</header>\n\n<div class=\"list macros\">\n    ";
    stack1 = depth0;
    stack2 = depth0;
    foundHelper = helpers.keys;
    stack3 = foundHelper || depth0.keys;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack3, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/food_macro": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n<div class=\"macro-replacement\">\n    <span>Equals 1 ";
    foundHelper = helpers.macroOverrideDisplay;
    stack1 = foundHelper || depth0.macroOverrideDisplay;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "macroOverrideDisplay", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n</div>\n";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <div class=\"list-item food\">\n            <a href=\"/food/";
    foundHelper = helpers.ctx;
    stack1 = foundHelper || depth0.ctx;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.macro);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "ctx.macro", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" class=\"btn btn-secondary btn-large btn-food\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n        </div>\n    ";
    return buffer;}

  function program5(depth0,data) {
    
    
    return "\n<div>No foods found</div>\n";}

    buffer += "<header>\n    <div class=\"clearfix\">\n        <h4 class=\"left without-top-margin\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n        <a href=\"/food\" class=\"right\">Go back</a>\n    </div>\n</header>\n\n";
    foundHelper = helpers.macroOverrideDisplay;
    stack1 = foundHelper || depth0.macroOverrideDisplay;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n\n<div class=\"list foods\">\n    ";
    stack1 = depth0;
    foundHelper = helpers.foods;
    stack2 = foundHelper || depth0.foods;
    foundHelper = helpers.keys;
    stack3 = foundHelper || depth0.keys;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack3, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n\n";
    foundHelper = helpers.foods;
    stack1 = foundHelper || depth0.foods;
    stack2 = helpers.unless;
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/help": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n    <h4>Help</h4>\n</header>\n\n<div class=\"help\">\n    <h5>Purpose</h5>\n    <p>The point of this is to create a quick way to track the basic macronutrients outlined in the nutrition guides for Beachbody's programs Body Beast and P90X2.</p>\n    <p>Forget about hassling with printout sheets or guesstimation. Your phone is with you all day; now your accountability is, too.</p>\n</div>\n\n<div class=\"help\">\n    <h5>How</h5>\n    <p>Click on the bars on the main page to increase your daily macro intake. If you're unsure of the nutrient value for a given food, use the \"Food\" tab to find the appropriate value.</p>\n    <p>If you make a mistake, there's a minus button at the end of the bars that allows you to decrease your counts for that macro.</p>\n    <p>If it's not in the \"Food\" section, it's not on the diet guide ;)</p>\n</div>\n\n<div class=\"help\">\n    <h5>Caloric Values</h5>\n    <p>There is a listing of the caloric value for each macro on the main page and on each food listing. However, this won't be consistent across all foods within a given macro type; it's simply an estimated average caloric value.</p>\n    <p>While the total calories listed probably won't add up to your total calorie bracket, it can help to understand where the majority of your calories come from, which can differ from the number of servings consumed.</p>\n</div>\n\n<div class=\"help\">\n    <h5>Thoughts</h5>\n    <p>There is a ton of data in this diet guide. That being said, use your judgement. This is far from a \"one size fits all\" situation. Use the guide as just that:  a guide. Are you eating too much / little? Now you can figure that out. Plan out your goals and pick the plan that works best for you.</p>\n</div>\n\n<div class=\"help\">\n    <h5>Shakes</h5>\n    <p>In the diet guide, there is a section for mass-gain shakes that are made by combining different macros. However, the shake in this app is mainly a placeholder for \"take your supplements\".</p>\n    <p>The daily shake described is 2 scoops of the Beachbody fuel shot (5g whey protein, 200 cals) and 1 scoop of the Beachbody base shake (18g whey protein, 130 cals). Figure out your own personal shake requirements and get those calories in.</p>\n    <p>Don't forget your post-workout shake.</p>\n</div>\n\n<div class=\"help\">\n    <h5>Free condiments</h5>\n    <ul>\n        <li>Lemon and lime juice</li>\n        <li>Black pepper</li>\n        <li>Vinegar (any variety)</li>\n        <li>Mustard (any variety)</li>\n        <li>Herbs</li>\n        <li>Spices</li>\n        <li>Garlic and ginger</li>\n        <li>Hot sauce</li>\n        <li>Flavored extracts: vanilla, peppermint, almond, etc.</li>\n    </ul>\n</div>\n";});
}});

window.require.define({"views/templates/index": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<header>\n    <h4>Current Macros</h4>\n</header>\n\n<div class=\"list macros\"></div>\n<div class=\"total\">\n    <span>Approx. total calories: </span>\n    <span id=\"text_total_cals\">";
    foundHelper = helpers.macros;
    stack1 = foundHelper || depth0.macros;
    foundHelper = helpers.getTotalCals;
    stack2 = foundHelper || depth0.getTotalCals;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "getTotalCals", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</span>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/macro_bar": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "exceeding";}

    buffer += "<div class=\"percentage-bar relative\">\n    <div class=\"btn-decrement absolute\">\n        <span class=\"ui-icon ui-icon-minusthick\"></span>\n    </div>\n    <div class=\"percentage-complete absolute ";
    foundHelper = helpers.macro;
    stack1 = foundHelper || depth0.macro;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "macro", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" style=\"width: ";
    foundHelper = helpers.macro;
    stack1 = foundHelper || depth0.macro;
    foundHelper = helpers.getPercentageWidth;
    stack2 = foundHelper || depth0.getPercentageWidth;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "getPercentageWidth", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "%;\">\n        <div class=\"percentage-text absolute ";
    foundHelper = helpers.macro;
    stack1 = foundHelper || depth0.macro;
    foundHelper = helpers.ifIsExceedingGoal;
    stack2 = foundHelper || depth0.ifIsExceedingGoal;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\">\n            <span class=\"text_display with-default-cursor\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + ": </span>\n            <span class=\"text_count with-default-cursor\">";
    foundHelper = helpers.count;
    stack1 = foundHelper || depth0.count;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "count", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n            <span class=\"text_total with-default-cursor\"> / ";
    foundHelper = helpers.macro;
    stack1 = foundHelper || depth0.macro;
    foundHelper = helpers.getGoalForMacro;
    stack2 = foundHelper || depth0.getGoalForMacro;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "getGoalForMacro", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</span>\n            <span class=\"text_cals with-default-cursor\">";
    foundHelper = helpers.count;
    stack1 = foundHelper || depth0.count;
    foundHelper = helpers.macro;
    stack2 = foundHelper || depth0.macro;
    foundHelper = helpers.getCalsDisplayForMacro;
    stack3 = foundHelper || depth0.getCalsDisplayForMacro;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "getCalsDisplayForMacro", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "</span>\n        </div>\n    </div>\n</div>";
    return buffer;});
}});

window.require.define({"views/templates/stats": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " for ";
    foundHelper = helpers.user;
    stack1 = foundHelper || depth0.user;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.name);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "user.name", { hash: {} }); }
    buffer += escapeExpression(stack1);
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <div class=\"list-item stat\">\n        <span class=\"name italic\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + ":</span>\n        <span class=\"val right\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n    </div>\n    ";
    return buffer;}

    buffer += "<header>\n    <h4>Stats";
    foundHelper = helpers.user;
    stack1 = foundHelper || depth0.user;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.name);
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "</h4>\n</header>\n\n<div class=\"list stats\">\n    ";
    foundHelper = helpers.stats;
    stack1 = foundHelper || depth0.stats;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.stats);
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/view": function(exports, require, module) {
  var View, app, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = require('lib/utils');

  app = require('application');

  require('lib/view_helper');

  module.exports = View = (function(_super) {

    __extends(View, _super);

    function View() {
      this.routeLink = __bind(this.routeLink, this);

      this.routeEvent = __bind(this.routeEvent, this);

      this.close = __bind(this.close, this);

      this.render = __bind(this.render, this);
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.views = {};

    View.prototype.template = function() {};

    View.prototype.getRenderData = function() {};

    View.prototype.getPartialsRenderData = function() {
      return {};
    };

    View.prototype.render = function() {
      this.$el.html(this.template(this.getRenderData(), {
        partials: this.getPartialsRenderData()
      }));
      this.afterRender();
      return this;
    };

    View.prototype.afterRender = function() {};

    View.prototype.close = function() {
      this.remove();
      this.unbind();
      return typeof this.onClose === "function" ? this.onClose() : void 0;
    };

    View.prototype.routeEvent = function(event) {
      var $link, url;
      $link = $(event.target);
      url = $link.attr('href');
      if ($link.attr('target') === '_blank' || typeof url === 'undefined' || url.substr(0, 4) === 'http' || url === '' || url === 'javascript:void(0)') {
        return true;
      }
      event.preventDefault();
      if ($link.hasClass('dont-route')) {
        return true;
      } else {
        return this.routeLink(url);
      }
    };

    View.prototype.routeLink = function(url) {
      app.router.navigate(url, {
        trigger: true
      });
      return this.trigger('routed');
    };

    return View;

  })(Backbone.View);
  
}});

