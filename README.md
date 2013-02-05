# Nutrition

A quick, no-frills way to track your macros. It can be used as an app on the iPhone if a user navigates to the site and downloads it to the home screen. I didn't feel like dealing with the app store / marketplace.

## How do I run this bad boy locally?

### Abridged Version:

Git clone, npm install, run. Profit.


### Unabridged Version:

This UI runs on node, and I recommend brunch.io as your framework of choice. That being said, you can always run this straight-up in Node. In server.coffee, the difference in environments is handled.

* First, you'll need node.js (0.8.x): `brew install node`
* Then, you'll need brunch: `npm install -g brunch`
* cd into nutrition, and pull down the dependencies: `npm install`
* Run it! `brunch watch --server`
* Profit

The default settings bind it to localhost:3333


## TODO

* Searching for an item
* User-defined supplements
* User-defined "meals" (collection of macros to add at once)
    - List approximate caloric value of a meal or shake
