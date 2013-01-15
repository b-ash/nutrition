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

  BeastMacros = require('models/beast_macro_counts');

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
    help: require('views/help'),
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

    Router.prototype.help = function() {
      return this.setupView('help', 'help');
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

window.require.define({"models/beast_macro_counts": function(exports, require, module) {
  var BeastMacros, LocalStorageModel,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LocalStorageModel = require('./local_storage_model');

  BeastMacros = (function(_super) {

    __extends(BeastMacros, _super);

    function BeastMacros() {
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

    return BeastMacros;

  })(LocalStorageModel);

  module.exports = BeastMacros;
  
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
      chia: {
        display: 'Chia Seeds',
        portion: 2,
        measurement: 'Tbsp',
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
      seeds: {
        display: 'Seeds',
        portion: 1,
        measurement: 'Tbsp',
        description: 'Flax, pumpkin, sunflower, sesame'
      },
      butter: {
        display: 'Butter',
        portion: 1,
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
        measurement: 'cup',
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
        display: 'Beans (cooked)',
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
        display: 'Asparagus',
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
        description: 'Raw'
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
        display: 'onions',
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
        display: 'Asparagus',
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
  var LocalStorageModel, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('./model');

  LocalStorageModel = (function(_super) {

    __extends(LocalStorageModel, _super);

    function LocalStorageModel() {
      return LocalStorageModel.__super__.constructor.apply(this, arguments);
    }

    LocalStorageModel.prototype.localStorage = new Backbone.LocalStorage('Nutrition');

    return LocalStorageModel;

  })(Model);

  module.exports = LocalStorageModel;
  
}});

window.require.define({"models/model": function(exports, require, module) {
  var Model, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = require('lib/utils');

  Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      this.clear = __bind(this.clear, this);

      this.isExceedingGoal = __bind(this.isExceedingGoal, this);

      this.getGoalForMacro = __bind(this.getGoalForMacro, this);

      this.getMacroPercentage = __bind(this.getMacroPercentage, this);

      this.increment = __bind(this.increment, this);

      this.initialize = __bind(this.initialize, this);
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.id = 'bodybeast-3000c';

    Model.prototype.goals = function() {
      return {};
    };

    Model.prototype.defaults = function() {
      return {
        macros: {},
        timestamp: new moment().format('MM-DD-YY')
      };
    };

    Model.prototype.initialize = function() {
      return this.fetch();
    };

    Model.prototype.increment = function(key, amt) {
      var macros;
      if (amt == null) {
        amt = 1;
      }
      macros = this.get('macros');
      macros[key].count += parseFloat(amt);
      this.save('macros', macros);
      return this.trigger('incrememt', key);
    };

    Model.prototype.getMacroPercentage = function(macro) {
      var goal, percentage;
      goal = this.goals()[macro];
      macro = this.get('macros')[macro].count;
      percentage = (macro / goal) * 100;
      return Math.min(utils.roundFloat(percentage), 100);
    };

    Model.prototype.getGoalForMacro = function(macro) {
      return this.goals()[macro];
    };

    Model.prototype.isExceedingGoal = function(macro) {
      var goal;
      goal = this.getGoalForMacro(macro);
      macro = this.get('macros')[macro].count;
      return macro > goal;
    };

    Model.prototype.clear = function() {
      this.save(this.defaults());
      return this.trigger('cleared');
    };

    return Model;

  })(Backbone.Model);

  module.exports = Model;
  
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

    FoodMacroView.prototype.className = '.content';

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
      return app.model.increment(macro, servingSize);
    };

    FoodMacroView.prototype.submitAndRoute = function() {
      this.increment();
      return app.router.navigate("/food/" + this.options.macro, true);
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

    FoodAllMacrosView.prototype.className = '.content';

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

    FoodMacroView.prototype.className = '.content';

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
  var HelpView, View, app,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  HelpView = (function(_super) {

    __extends(HelpView, _super);

    function HelpView() {
      return HelpView.__super__.constructor.apply(this, arguments);
    }

    HelpView.prototype.tagName = 'div';

    HelpView.prototype.className = '.content';

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
  var NavView, View, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  View = require('./view');

  NavView = (function(_super) {

    __extends(NavView, _super);

    function NavView() {
      this.clear = __bind(this.clear, this);

      this.afterRender = __bind(this.afterRender, this);
      return NavView.__super__.constructor.apply(this, arguments);
    }

    NavView.prototype.el = '#nav';

    NavView.prototype.activeView = null;

    NavView.prototype.events = {
      'click a': 'routeEvent',
      'click #clear_list': 'clear'
    };

    NavView.prototype.afterRender = function() {
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


    return "<header>\n    <h4>Help</h4>\n</header>\n\n<div class=\"help\">\n    <span>Free condiments</span>\n    <ul>\n        <li>Lemon and lime juice</li>\n        <li>Black pepper</li>\n        <li>Vinegar (any variety)</li>\n        <li>Mustard (any variety)</li>\n        <li>Herbs</li>\n        <li>Spices</li>\n        <li>Garlic and ginger</li>\n        <li>Hot sauce</li>\n        <li>Flavored extracts: vanilla, peppermint, almond, etc.</li>\n    </ul>\n</div>\n";});
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

