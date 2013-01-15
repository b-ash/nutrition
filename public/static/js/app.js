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
  var Application, BeastMacros;

  BeastMacros = require('models/beast');

  Application = {
    initialize: function(onSuccess) {
      var Router;
      Router = require('lib/router');
      this.views = {};
      this.router = new Router();
      this.model = new BeastMacros();
      Backbone.history.start({
        pushState: true
      });
      return onSuccess();
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
    food: require('views/food_all_macros'),
    foodMacro: require('views/food_macro')
  };

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      this.setCurrentView = __bind(this.setCurrentView, this);

      this.closeCurrentView = __bind(this.closeCurrentView, this);

      this.navSetup = __bind(this.navSetup, this);

      this.setupView = __bind(this.setupView, this);

      this.foodMacro = __bind(this.foodMacro, this);

      this.foodAllMacros = __bind(this.foodAllMacros, this);

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
      'stats': 'stats',
      '*query': 'redirectDefault'
    };

    Router.prototype.redirectDefault = function(actions) {
      return this.navigate('', {
        trigger: true
      });
    };

    Router.prototype.index = function() {
      return this.setupView('index', 'index', {
        model: app.model
      });
    };

    Router.prototype.stats = function() {
      return this.setupView('stats', 'stats', {
        model: app.model
      });
    };

    Router.prototype.foodAllMacros = function() {
      return this.setupView('food', 'food', {
        model: app.model
      });
    };

    Router.prototype.foodMacro = function(macro) {
      return this.setupView('food', 'foodMacro', {
        macro: macro
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
  
  module.exports = {};
  
}});

window.require.define({"lib/view_helper": function(exports, require, module) {
  
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

  Handlebars.registerHelper("keys", function(list, fn) {
    var buffer, key, val;
    buffer = '';
    for (key in list) {
      val = list[key];
      buffer += fn({
        key: key,
        val: val
      });
    }
    return buffer;
  });

  Handlebars.registerHelper("getPercentageWidth", function(macro) {
    return window.app.model.getMacroPercentage(macro);
  });

  Handlebars.registerHelper("getGoalForMacro", function(macro) {
    return window.app.model.getGoalForMacro(macro);
  });

  Handlebars.registerHelper("ifIsExceedingGoal", function(macro, block) {
    if (window.app.model.isExceedingGoal(macro)) {
      return block(this);
    } else {
      return block.inverse(this);
    }
  });
  
}});

window.require.define({"models/beast": function(exports, require, module) {
  var BeastMacros, LocalStorageModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalStorageModel = require('./model');

  BeastMacros = (function(_super) {

    __extends(BeastMacros, _super);

    function BeastMacros() {
      this.clear = __bind(this.clear, this);

      this.isExceedingGoal = __bind(this.isExceedingGoal, this);

      this.getGoalForMacro = __bind(this.getGoalForMacro, this);

      this.getMacroPercentage = __bind(this.getMacroPercentage, this);

      this.increment = __bind(this.increment, this);

      this.initialize = __bind(this.initialize, this);
      return BeastMacros.__super__.constructor.apply(this, arguments);
    }

    BeastMacros.prototype.id = 'bodybeast-3000c';

    BeastMacros.prototype.goals = function() {
      return {
        starches: 8,
        legumes: 4,
        veggies: 7,
        fruits: 7,
        proteins: 14,
        fats: 7,
        shake: 1
      };
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

    BeastMacros.prototype.initialize = function() {
      return this.fetch();
    };

    BeastMacros.prototype.increment = function(key) {
      var macros;
      macros = this.get('macros');
      macros[key].count++;
      this.save('macros', macros);
      return this.trigger('incrememt', key);
    };

    BeastMacros.prototype.getMacroPercentage = function(macro) {
      var goal, percentage;
      goal = this.goals()[macro];
      macro = this.get('macros')[macro].count;
      percentage = (macro / goal) * 100;
      return Math.min(Math.round(percentage * 10) / 10, 100);
    };

    BeastMacros.prototype.getGoalForMacro = function(macro) {
      return this.goals()[macro];
    };

    BeastMacros.prototype.isExceedingGoal = function(macro) {
      var goal;
      goal = this.getGoalForMacro(macro);
      macro = this.get('macros')[macro].count;
      return macro > goal;
    };

    BeastMacros.prototype.clear = function() {
      this.save(this.defaults());
      return this.trigger('cleared');
    };

    return BeastMacros;

  })(LocalStorageModel);

  module.exports = BeastMacros;
  
}});

window.require.define({"models/foods": function(exports, require, module) {
  var Foods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Foods = (function() {

    Foods.prototype.legumes = {
      display: 'Legumes',
      cals: 125,
      foods: [
        {
          display: 'Beans',
          portion: 0.5,
          measurement: 'cup'
        }, {
          display: 'Refried Beans',
          portion: 0.5,
          measurement: 'cup'
        }, {
          display: 'Fava (cooked)',
          portion: 0.66,
          measurement: 'cup'
        }, {
          display: 'Lentils',
          portion: 0.5,
          measurement: 'cup'
        }, {
          display: 'Peas',
          portion: 0.5,
          measurement: 'cup'
        }
      ]
    };

    function Foods(macro) {
      this.macro = macro;
      this.toJSON = __bind(this.toJSON, this);

    }

    Foods.prototype.toJSON = function() {
      return this[this.macro] || {};
    };

    return Foods;

  })();

  module.exports = Foods;
  
}});

window.require.define({"models/model": function(exports, require, module) {
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
  var Stats;

  Stats = (function() {

    function Stats() {}

    Stats.prototype.toJSON = function() {
      var bfp, build, cim, cmr, lbm, rmr, rmr2, weight;
      weight = 150;
      bfp = 10;
      lbm = this.lbm(weight, bfp);
      rmr = this.rmr(lbm);
      cmr = this.cmr(rmr);
      rmr2 = this.rmr2(rmr, cmr);
      cim = this.cim(rmr2);
      build = this.build(bfp, cim);
      return {
        stats: [
          {
            display: 'Lean Body Mass',
            val: lbm
          }, {
            display: 'Resting Metabolic Rate',
            val: rmr
          }, {
            display: 'Caloric Modification for Recovery',
            val: cmr
          }, {
            display: 'RMR Modified for Recovery',
            val: rmr2
          }, {
            display: 'Calorie Intake to Maintain Weight',
            val: cim
          }, {
            display: 'Calories needed to build / bulk',
            val: build
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

    return Stats;

  })();

  module.exports = Stats;
  
}});

window.require.define({"views/food_all_macros": function(exports, require, module) {
  var FoodAllMacrosView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  FoodAllMacrosView = (function(_super) {

    __extends(FoodAllMacrosView, _super);

    function FoodAllMacrosView() {
      this.getRenderData = __bind(this.getRenderData, this);
      return FoodAllMacrosView.__super__.constructor.apply(this, arguments);
    }

    FoodAllMacrosView.prototype.tagName = 'div';

    FoodAllMacrosView.prototype.className = '.content';

    FoodAllMacrosView.prototype.template = require('./templates/food_all_macros');

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

window.require.define({"views/food_macro": function(exports, require, module) {
  var FoodMacroView, Foods, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  Foods = require('models/foods');

  FoodMacroView = (function(_super) {

    __extends(FoodMacroView, _super);

    function FoodMacroView() {
      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return FoodMacroView.__super__.constructor.apply(this, arguments);
    }

    FoodMacroView.prototype.tagName = 'div';

    FoodMacroView.prototype.className = '.content';

    FoodMacroView.prototype.template = require('./templates/food_macro');

    FoodMacroView.prototype.events = {
      'click a': 'routeEvent'
    };

    FoodMacroView.prototype.initialize = function() {
      return this.model = new Foods(this.options.macro);
    };

    FoodMacroView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    return FoodMacroView;

  })(View);

  module.exports = FoodMacroView;
  
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
      this.increment = __bind(this.increment, this);

      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.tagName = 'div';

    IndexView.prototype.className = '.content';

    IndexView.prototype.template = require('./templates/index');

    IndexView.prototype.events = {
      'click .percentage-bar': 'increment'
    };

    IndexView.prototype.initialize = function() {
      return this.model.on('cleared', this.render);
    };

    IndexView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    IndexView.prototype.increment = function(event) {
      var $completionBar, $currentCount, $percentageText, $totalBar, macro, macroPercentage, pixelPercentage;
      $totalBar = $(event.currentTarget);
      macro = $totalBar.parents('.macro').attr('data-key');
      this.model.increment(macro);
      macroPercentage = this.model.getMacroPercentage(macro);
      pixelPercentage = macroPercentage / 100 * 300;
      $currentCount = $totalBar.find('#text_count');
      $percentageText = $totalBar.find('.percentage-text');
      $completionBar = $totalBar.find('.percentage-complete');
      $currentCount.text(this.model.get('macros')[macro].count);
      $completionBar.css({
        width: "" + pixelPercentage + "px"
      });
      if (this.model.isExceedingGoal(macro)) {
        return $percentageText.addClass('exceeding');
      }
    };

    return IndexView;

  })(View);

  module.exports = IndexView;
  
}});

window.require.define({"views/nav": function(exports, require, module) {
  var BeastMacros, NavView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  BeastMacros = require('models/beast');

  NavView = (function(_super) {

    __extends(NavView, _super);

    function NavView() {
      this.clear = __bind(this.clear, this);

      this.updateActiveTab = __bind(this.updateActiveTab, this);

      this.initialize = __bind(this.initialize, this);
      return NavView.__super__.constructor.apply(this, arguments);
    }

    NavView.prototype.el = '#nav';

    NavView.prototype.activeView = null;

    NavView.prototype.events = {
      'click a': 'routeEvent',
      'click #clear_list': 'clear'
    };

    NavView.prototype.initialize = function() {
      return this.on('routed', this.updateActiveTab);
    };

    NavView.prototype.updateActiveTab = function() {
      this.$('.nav li').removeClass('active');
      return this.$("#" + this.activeView + "_nav").addClass('active');
    };

    NavView.prototype.clear = function() {
      return app.model.clear();
    };

    return NavView;

  })(View);

  module.exports = NavView;
  
}});

window.require.define({"views/stats": function(exports, require, module) {
  var Stats, StatsView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  Stats = require('models/stats');

  StatsView = (function(_super) {

    __extends(StatsView, _super);

    function StatsView() {
      this.getRenderData = __bind(this.getRenderData, this);

      this.initialize = __bind(this.initialize, this);
      return StatsView.__super__.constructor.apply(this, arguments);
    }

    StatsView.prototype.tagName = 'div';

    StatsView.prototype.className = '.content';

    StatsView.prototype.template = require('./templates/stats');

    StatsView.prototype.events = {};

    StatsView.prototype.initialize = function() {
      return this.model = new Stats();
    };

    StatsView.prototype.getRenderData = function() {
      return this.model.toJSON();
    };

    return StatsView;

  })(View);

  module.exports = StatsView;
  
}});

window.require.define({"views/templates/food_all_macros": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

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
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n        </div>\n    ";
    return buffer;}

    buffer += "<header>\n    <h4>Select a macro category</h4>\n</header>\n\n<div class=\"list macros\">\n    ";
    foundHelper = helpers.macros;
    stack1 = foundHelper || depth0.macros;
    foundHelper = helpers.keys;
    stack2 = foundHelper || depth0.keys;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/food_macro": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <div class=\"list-item food\">\n            <a class=\"btn btn-secondary btn-large btn-food dont-route\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n        </div>\n    ";
    return buffer;}

  function program3(depth0,data) {
    
    
    return "\n<div>No foods found</div>\n";}

    buffer += "<header>\n    <div class=\"clearfix\">\n        <h4 class=\"left without-top-margin\">";
    foundHelper = helpers.display;
    stack1 = foundHelper || depth0.display;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "display", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n        <a href=\"/food\" class=\"right\">Go back</a>\n    </div>\n</header>\n\n<div class=\"list foods\">\n    ";
    foundHelper = helpers.foods;
    stack1 = foundHelper || depth0.foods;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n\n";
    foundHelper = helpers.foods;
    stack1 = foundHelper || depth0.foods;
    stack2 = helpers.unless;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/index": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n        <div class=\"list-item macro\" data-key=\"";
    foundHelper = helpers.key;
    stack1 = foundHelper || depth0.key;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "key", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n            <div class=\"percentage-bar relative\">\n                <div class=\"percentage-complete absolute ";
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
    buffer += "\">\n                        <span id=\"text_display\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.display", { hash: {} }); }
    buffer += escapeExpression(stack1) + ": </span>\n                        <span id=\"text_count\">";
    foundHelper = helpers.val;
    stack1 = foundHelper || depth0.val;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.count);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "val.count", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n                        <span id=\"text_total\"> / ";
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
    foundHelper = helpers.macros;
    stack1 = foundHelper || depth0.macros;
    foundHelper = helpers.keys;
    stack2 = foundHelper || depth0.keys;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
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
    buffer += "\n    <div class=\"list-item stat\">\n        <span class=\"name\">";
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

    buffer += "<header>\n    <h4>Stats</h4>\n</header>\n\n<div class=\"list stats\">\n    ";
    foundHelper = helpers.stats;
    stack1 = foundHelper || depth0.stats;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
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

