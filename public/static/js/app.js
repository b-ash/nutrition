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
  var Application, BeastMacros, BeastUser, Stats;

  BeastUser = require('models/beast_user');

  BeastMacros = require('models/beast_macro_counts');

  Stats = require('models/stats');

  Application = {
    initialize: function(onSuccess) {
      var Router;
      Router = require('lib/router');
      this.views = {};
      this.router = new Router();
      this.user = new BeastUser();
      if (!this.user.get('configured') && window.location.pathname !== '/configure') {
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
      this.afterConfiguration();
      this.macros.destroy();
      return this.macros = new BeastMacros(this.stats, this.user);
    },
    afterConfiguration: function() {
      this.stats = new Stats(this.user);
      return this.macros = new BeastMacros(this.stats, this.user);
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
  var NavView, Router, app, utils, views,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  utils = require('lib/utils');

  NavView = require('views/nav');

  views = {
    index: require('views/index'),
    stats: require('views/stats'),
    help: require('views/help'),
    configure: require('views/configure'),
    foodAll: require('views/food_all_macros'),
    foodMacro: require('views/food_macro'),
    food: require('views/food')
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

    Router.prototype.configure = function() {
      return this.setupView('settings', 'configure', {
        model: app.user
      });
    };

    Router.prototype.foodAllMacros = function() {
      return this.setupView('food', 'foodAll');
    };

    Router.prototype.foodMacro = function(macro) {
      return this.setupView('food', 'foodMacro', {
        macro: macro
      });
    };

    Router.prototype.food = function(macro, food) {
      return this.setupView('food', 'food', {
        macro: macro,
        food: food
      });
    };

    Router.prototype.setupView = function(navItem, claxx, params) {
      var view;
      if (params == null) {
        params = {};
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
      return $('#main_page').append(view.render().$el);
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"lib/utils": function(exports, require, module) {
  
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  module.exports = {
    roundFloat: function(percentage) {
      return Math.round(percentage * 100) / 100;
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
  var utils;

  utils = require('./utils');

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

window.require.define({"models/base_macros_model": function(exports, require, module) {
  var BaseMacrosModel, LocalStorageModel, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = require('lib/utils');

  LocalStorageModel = require('./local_storage_model');

  BaseMacrosModel = (function(_super) {

    __extends(BaseMacrosModel, _super);

    function BaseMacrosModel() {
      this.clear = __bind(this.clear, this);

      this.isExceedingGoal = __bind(this.isExceedingGoal, this);

      this.getGoalForMacro = __bind(this.getGoalForMacro, this);

      this.getMacroPercentage = __bind(this.getMacroPercentage, this);

      this.changeByAmount = __bind(this.changeByAmount, this);

      this.decrement = __bind(this.decrement, this);

      this.increment = __bind(this.increment, this);

      this.initialize = __bind(this.initialize, this);
      return BaseMacrosModel.__super__.constructor.apply(this, arguments);
    }

    BaseMacrosModel.prototype.initialize = function() {
      return this.fetch();
    };

    BaseMacrosModel.prototype.increment = function(macro, amt) {
      if (amt == null) {
        amt = 1;
      }
      return this.changeByAmount(macro, amt);
    };

    BaseMacrosModel.prototype.decrement = function(macro, amt) {
      if (amt == null) {
        amt = -1;
      }
      return this.changeByAmount(macro, amt);
    };

    BaseMacrosModel.prototype.changeByAmount = function(macro, amt) {
      var macros, newCount;
      macros = this.get('macros');
      newCount = Math.max(macros[macro].count + parseFloat(amt), 0);
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
      return this.trigger('cleared');
    };

    return BaseMacrosModel;

  })(LocalStorageModel);

  module.exports = BaseMacrosModel;
  
}});

window.require.define({"models/beast_macro_counts": function(exports, require, module) {
  var BaseMacrosModel, BeastMacros,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseMacrosModel = require('./base_macros_model');

  BeastMacros = (function(_super) {

    __extends(BeastMacros, _super);

    function BeastMacros() {
      this.initialize = __bind(this.initialize, this);
      return BeastMacros.__super__.constructor.apply(this, arguments);
    }

    BeastMacros.prototype.initialize = function(stats) {
      this.id = "bodybeast-" + (stats.getCalories()) + "c";
      this.goals = stats.getGoals();
      return BeastMacros.__super__.initialize.apply(this, arguments);
    };

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
          },
          shake: {
            display: 'Shake',
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

window.require.define({"models/beast_user": function(exports, require, module) {
  var BeastUserConfig, LocalStorageModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalStorageModel = require('./local_storage_model');

  BeastUserConfig = (function(_super) {

    __extends(BeastUserConfig, _super);

    function BeastUserConfig() {
      this.initialize = __bind(this.initialize, this);
      return BeastUserConfig.__super__.constructor.apply(this, arguments);
    }

    BeastUserConfig.prototype.id = 'user';

    BeastUserConfig.prototype.initialize = function() {
      return this.fetch();
    };

    BeastUserConfig.prototype.defaults = function() {
      return {
        name: null,
        weight: null,
        bfp: null,
        phase: 'build',
        configured: false
      };
    };

    return BeastUserConfig;

  })(LocalStorageModel);

  module.exports = BeastUserConfig;
  
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

window.require.define({"models/calorie_brackets/beast_brackets": function(exports, require, module) {
  var BeastCalorieBrackets;

  BeastCalorieBrackets = (function() {

    function BeastCalorieBrackets() {}

    BeastCalorieBrackets.getBracket = function(calories, phase) {
      return require("./beast/" + phase + "/" + calories + "c");
    };

    return BeastCalorieBrackets;

  })();

  module.exports = BeastCalorieBrackets;
  
}});

window.require.define({"models/foods/beast/all_macros": function(exports, require, module) {
  
  module.exports = {
    starches: 'Starches',
    legumes: 'Legumes',
    veggies: 'Veggies',
    fruits: 'Fruits',
    proteins: 'Proteins',
    fats: 'Fats',
    liquid_protein: 'Protein Liquids',
    liquid_balanced: 'Balanced Liquids',
    liquid_carb: 'Carb Liquids'
  };
  
}});

window.require.define({"models/foods/beast/fats": function(exports, require, module) {
  
  module.exports = {
    macro: 'fats',
    display: 'Fats',
    cal: 45,
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

window.require.define({"models/foods/beast_foods": function(exports, require, module) {
  var ALL_MACROS, BeastFoods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ALL_MACROS = require('./beast/all_macros');

  BeastFoods = (function() {

    BeastFoods.prototype.macros = {};

    function BeastFoods(macro, food) {
      var display;
      this.macro = macro;
      this.food = food;
      this.toJSON = __bind(this.toJSON, this);

      for (macro in ALL_MACROS) {
        display = ALL_MACROS[macro];
        this.macros[macro] = require("./beast/" + macro);
      }
    }

    BeastFoods.prototype.toJSON = function() {
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
        return ALL_MACROS;
      }
    };

    return BeastFoods;

  })();

  module.exports = BeastFoods;
  
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

window.require.define({"models/stats": function(exports, require, module) {
  var BeastBrackets, Stats,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BeastBrackets = require('./calorie_brackets/beast_brackets');

  Stats = (function() {

    function Stats(user) {
      this.getMacroBreakdown = __bind(this.getMacroBreakdown, this);

      this.getGoals = __bind(this.getGoals, this);

      this.getCalories = __bind(this.getCalories, this);

      this.getCalorieBracket = __bind(this.getCalorieBracket, this);
      this.weight = user.get('weight');
      this.bfp = user.get('bfp');
      this.phase = user.get('phase');
      this.calorieBracket = this.getCalorieBracket();
    }

    Stats.prototype.getCalorieBracket = function() {
      var cals, cim, cmr, lbm, rawCals, rmr, rmr2;
      lbm = this.lbm(this.weight, this.bfp);
      rmr = this.rmr(lbm);
      cmr = this.cmr(rmr);
      rmr2 = this.rmr2(rmr, cmr);
      cim = this.cim(rmr2);
      if (this.phase === 'build') {
        rawCals = this.build(this.bfp, cim);
      } else {
        rawCals = this.beast(this.bfp, cim);
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

    Stats.prototype.getCalories = function() {
      return this.calorieBracket.cals;
    };

    Stats.prototype.getGoals = function() {
      var goals;
      goals = BeastBrackets.getBracket(this.getCalories(), this.phase);
      return goals.goals;
    };

    Stats.prototype.getMacroBreakdown = function() {
      if (this.phase === 'build') {
        return '25/50/25';
      } else {
        return '40/30/30';
      }
    };

    Stats.prototype.toJSON = function() {
      return {
        stats: [
          {
            display: 'Phase',
            val: this.phase.capitalize()
          }, {
            display: 'Macro Breakdown',
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
        ]
      };
    };

    Stats.prototype.lbm = function(weight, bfp) {
      return (100 - bfp) / 100 * weight;
    };

    Stats.prototype.rmr = function(lbm) {
      return lbm * 10;
    };

    Stats.prototype.cmr = function(rmr) {
      return rmr * 0.3;
    };

    Stats.prototype.rmr2 = function(rmr, cmr) {
      return rmr + cmr;
    };

    Stats.prototype.cim = function(rmr2) {
      return rmr2 + 600;
    };

    Stats.prototype.build = function(bfp, cim) {
      if (bfp > 20) {
        return cim + (cim * 0.1);
      } else if (bfp > 10) {
        return cim + (cim * 0.15);
      } else {
        return cim + (cim * 0.2);
      }
    };

    Stats.prototype.beast = function(bfp, cim) {
      if (bfp > 20) {
        return cim - (cim * 0.2);
      } else if (bfp > 10) {
        return cim - (cim * 0.15);
      } else {
        return cim - (cim * 0.1);
      }
    };

    Stats.prototype.roundCalsToBracket = function(rawCals, phase) {
      var cals;
      if (phase === 'build') {
        cals = Math.ceil(rawCals / 200) * 200;
        return this.getCalsBetweenValues(cals, 2000, 5000);
      } else {
        cals = Math.floor(rawCals / 200) * 200;
        return this.getCalsBetweenValues(cals, 1800, 4800);
      }
    };

    Stats.prototype.getCalsBetweenValues = function(cals, lowerBound, upperBound) {
      if (cals < lowerBound) {
        return lowerBound;
      } else if (cals > upperBound) {
        return upperBound;
      } else {
        return cals;
      }
    };

    return Stats;

  })();

  module.exports = Stats;
  
}});

window.require.define({"views/configure": function(exports, require, module) {
  var ConfigureView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  ConfigureView = (function(_super) {

    __extends(ConfigureView, _super);

    function ConfigureView() {
      this.configure = __bind(this.configure, this);

      this.afterRender = __bind(this.afterRender, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return ConfigureView.__super__.constructor.apply(this, arguments);
    }

    ConfigureView.prototype.tagName = 'div';

    ConfigureView.prototype.className = 'content';

    ConfigureView.prototype.template = require('./templates/configure');

    ConfigureView.prototype.events = {
      'click #configure': 'configure'
    };

    ConfigureView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    ConfigureView.prototype.afterRender = function() {
      return this.$("#phase option[value=" + (this.model.get('phase')) + "]").attr('selected', 'selected');
    };

    ConfigureView.prototype.configure = function() {
      var bfp, name, phase, weight;
      name = this.$('#name').val() || null;
      weight = this.$('#weight').val() || 0;
      bfp = this.$('#bfp').val() || 0;
      phase = this.$('#phase').val();
      this.model.save({
        name: name,
        weight: parseInt(weight),
        bfp: parseInt(bfp),
        phase: phase,
        configured: true
      });
      app.onConfigure();
      app.afterConfiguration();
      return app.router.navigate('', true);
    };

    return ConfigureView;

  })(View);

  module.exports = ConfigureView;
  
}});

window.require.define({"views/food": function(exports, require, module) {
  var BeastFoods, FoodMacroView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  BeastFoods = require('models/foods/beast_foods');

  FoodMacroView = (function(_super) {

    __extends(FoodMacroView, _super);

    function FoodMacroView() {
      this.submitAndGoHome = __bind(this.submitAndGoHome, this);

      this.submitAndRoute = __bind(this.submitAndRoute, this);

      this.increment = __bind(this.increment, this);

      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return FoodMacroView.__super__.constructor.apply(this, arguments);
    }

    FoodMacroView.prototype.tagName = 'div';

    FoodMacroView.prototype.className = 'content';

    FoodMacroView.prototype.template = require('./templates/food');

    FoodMacroView.prototype.events = {
      'click a': 'routeEvent',
      'click #submit_and_route': 'submitAndRoute',
      'click #submit_and_go_home': 'submitAndGoHome'
    };

    FoodMacroView.prototype.initialize = function() {
      return this.model = new BeastFoods(this.options.macro, this.options.food);
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

window.require.define({"views/food_all_macros": function(exports, require, module) {
  var BeastFoods, FoodAllMacrosView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  BeastFoods = require('models/foods/beast_foods');

  FoodAllMacrosView = (function(_super) {

    __extends(FoodAllMacrosView, _super);

    function FoodAllMacrosView() {
      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return FoodAllMacrosView.__super__.constructor.apply(this, arguments);
    }

    FoodAllMacrosView.prototype.tagName = 'div';

    FoodAllMacrosView.prototype.className = 'content';

    FoodAllMacrosView.prototype.template = require('./templates/food_all_macros');

    FoodAllMacrosView.prototype.events = {
      'click a': 'routeEvent'
    };

    FoodAllMacrosView.prototype.initialize = function() {
      return this.model = new BeastFoods();
    };

    FoodAllMacrosView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    return FoodAllMacrosView;

  })(View);

  module.exports = FoodAllMacrosView;
  
}});

window.require.define({"views/food_macro": function(exports, require, module) {
  var BeastFoods, FoodMacroView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  BeastFoods = require('models/foods/beast_foods');

  FoodMacroView = (function(_super) {

    __extends(FoodMacroView, _super);

    function FoodMacroView() {
      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return FoodMacroView.__super__.constructor.apply(this, arguments);
    }

    FoodMacroView.prototype.tagName = 'div';

    FoodMacroView.prototype.className = 'content';

    FoodMacroView.prototype.template = require('./templates/food_macro');

    FoodMacroView.prototype.events = {
      'click a': 'routeEvent'
    };

    FoodMacroView.prototype.initialize = function() {
      return this.model = new BeastFoods(this.options.macro);
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
  var IndexView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.onClose = __bind(this.onClose, this);

      this.changePercentBar = __bind(this.changePercentBar, this);

      this.resetMacro = __bind(this.resetMacro, this);

      this.increment = __bind(this.increment, this);

      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.tagName = 'div';

    IndexView.prototype.className = 'content';

    IndexView.prototype.template = require('./templates/index');

    IndexView.prototype.events = {
      'click .percentage-bar': 'increment',
      'click .btn-reset': 'resetMacro'
    };

    IndexView.prototype.initialize = function() {
      return this.model.on('cleared', this.render);
    };

    IndexView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    IndexView.prototype.increment = function(event) {
      var $macro, macro;
      event.stopPropagation();
      $macro = $(event.currentTarget).parents('.macro');
      macro = $macro.attr('data-key');
      this.model.increment(macro);
      return this.changePercentBar($macro, macro);
    };

    IndexView.prototype.resetMacro = function(event) {
      var $macro, macro;
      event.stopPropagation();
      $macro = $(event.currentTarget).parents('.macro');
      macro = $macro.attr('data-key');
      this.model.decrement(macro);
      return this.changePercentBar($macro, macro);
    };

    IndexView.prototype.changePercentBar = function($macro, macro) {
      var $completionBar, $currentCount, $percentageText, $totalBar, macroPercentage, pixelPercentage;
      $totalBar = $macro.find('.percentage-bar');
      $currentCount = $macro.find('.text_count');
      $percentageText = $macro.find('.percentage-text');
      $completionBar = $macro.find('.percentage-complete');
      macroPercentage = this.model.getMacroPercentage(macro);
      pixelPercentage = macroPercentage / 100 * $totalBar.width();
      $currentCount.text(this.model.get('macros')[macro].count);
      $completionBar.css({
        width: "" + pixelPercentage + "px"
      });
      if (this.model.isExceedingGoal(macro)) {
        return $percentageText.addClass('exceeding');
      } else {
        return $percentageText.removeClass('exceeding');
      }
    };

    IndexView.prototype.onClose = function() {
      return this.model.off('cleared', this.render);
    };

    return IndexView;

  })(View);

  module.exports = IndexView;
  
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
  var Stats, StatsView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  Stats = require('models/stats');

  StatsView = (function(_super) {

    __extends(StatsView, _super);

    function StatsView() {
      this.getRenderData = __bind(this.getRenderData, this);
      return StatsView.__super__.constructor.apply(this, arguments);
    }

    StatsView.prototype.tagName = 'div';

    StatsView.prototype.className = 'content';

    StatsView.prototype.template = require('./templates/stats');

    StatsView.prototype.events = {};

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

  function program9(depth0,data) {
    
    var buffer = "", stack1;
    buffer += " value=\"";
    foundHelper = helpers.bfp;
    stack1 = foundHelper || depth0.bfp;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "bfp", { hash: {} }); }
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
    buffer += "\n</header>\n\n<div>\n    <input id=\"name\" type=\"text\" placeholder=\"My name is...\" ";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    stack2 = helpers['if'];
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n</div>\n\n<div>\n    <input id=\"weight\" type=\"number\" placeholder=\"Weight\" ";
    foundHelper = helpers.weight;
    stack1 = foundHelper || depth0.weight;
    stack2 = helpers['if'];
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n    <input id=\"bfp\" type=\"number\" placeholder=\"Body Fat Percentage\" ";
    foundHelper = helpers.bfp;
    stack1 = foundHelper || depth0.bfp;
    stack2 = helpers['if'];
    tmp1 = self.program(9, program9, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += " />\n</div>\n\n<div>\n    <select id=\"phase\">\n        <option value=\"build\">Build / Bulk (phases 1 &amp; 2)</option>\n        <option value=\"beast\">Beast (phase 3)</option>\n    </select>\n</div>\n\n<div class=\"configure-actions\">\n    <a id=\"configure\" class=\"btn btn-primary dont-route\">Configure</a>\n</div>\n";
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


    return "<header>\n    <h4>Help</h4>\n</header>\n\n<div class=\"help\">\n    <h5>Purpose</h5>\n    <p>The point of this is to create a quick way to track the basic macronutrients outlined in the Body Beast nutrition guide.</p>\n</div>\n\n<div class=\"help\">\n    <h5>How</h5>\n    <p>Click on the bars on the main page to track your daily intake. If you're unsure of the nutrient value for a given food, use the \"Food\" tab to find the appropriate value.</p>\n</div>\n\n<div class=\"help\">\n    <p>If it's not in the \"Food\" section, it's not on the diet guide ;)</p>\n</div>\n\n<div class=\"help\">\n    <h5>Shakes</h5>\n    <p>In the diet guide, there is a section for mass-gain shakes that are made by combining different macros. However, the shake in this app is mainly a placeholder for \"take your supplements\".</p>\n    <p>The daily shake described is 2 scoops of the Beachbody fuel shot (5g whey protein, 200 cals) and 1 scoop of the Beachbody base shake (18g whey protein, 130 cals). Figure out your shake requirements and get those calories in.</p>\n    <p>Don't forget your post-workout shake.</p>\n</div>\n\n<div class=\"help\">\n    <h5>Free condiments</h5>\n    <ul>\n        <li>Lemon and lime juice</li>\n        <li>Black pepper</li>\n        <li>Vinegar (any variety)</li>\n        <li>Mustard (any variety)</li>\n        <li>Herbs</li>\n        <li>Spices</li>\n        <li>Garlic and ginger</li>\n        <li>Hot sauce</li>\n        <li>Flavored extracts: vanilla, peppermint, almond, etc.</li>\n    </ul>\n</div>";});
}});

window.require.define({"views/templates/index": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n        <div class=\"list-item macro\" data-key=\"";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n            <div class=\"percentage-bar relative\">\n                <div class=\"btn-reset absolute\">\n                    <span class=\"ui-icon ui-icon-minusthick\"></span>\n                </div>\n                <div class=\"percentage-complete absolute ";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" style=\"width: ";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    foundHelper = helpers.getPercentageWidth;
    stack2 = foundHelper || depth0.getPercentageWidth;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "getPercentageWidth", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "%;\">\n                    <div class=\"percentage-text absolute ";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    foundHelper = helpers.ifIsExceedingGoal;
    stack2 = foundHelper || depth0.ifIsExceedingGoal;
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\">\n                        <span class=\"text_display with-default-cursor\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.display", { hash: {} }); }
    buffer += escapeExpression(stack1) + ": </span>\n                        <span class=\"text_count with-default-cursor\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.count);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.count", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n                        <span class=\"text_total with-default-curser\"> / ";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    foundHelper = helpers.getGoalForMacro;
    stack2 = foundHelper || depth0.getGoalForMacro;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "getGoalForMacro", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</span>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ";
    return buffer;}
  function program2(depth0,data) {
    
    
    return "exceeding";}

    buffer += "<header>\n    <h4>Current Macros</h4>\n</header>\n\n<div class=\"list macros\">\n    ";
    stack1 = depth0;
    foundHelper = helpers.macros;
    stack2 = foundHelper || depth0.macros;
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

