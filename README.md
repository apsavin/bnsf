# bnsf - bem node single page application framework

[![Build Status](https://travis-ci.org/apsavin/bnsf.svg?branch=master)](https://travis-ci.org/apsavin/bnsf) [![Bower version](https://badge.fury.io/bo/bnsf.svg)](http://badge.fury.io/bo/bnsf)

For FAQs and HOWTOs see [wiki](https://github.com/apsavin/bnsf/wiki).

There is an yeoman [generator](https://github.com/apsavin/generator-bnsf) for bnsf.

For usage example see [bnsf-project-stub](https://github.com/apsavin/bnsf-project-stub).

For more interesting usage example see [try-bem-online.net](http://try-bem-online.net), source code [here](https://github.com/apsavin/try-bem-online__front).

# Why bnsf?

- Shared routing and templates between browser and server
- Single page application easily
- SEO-friendly
- Connect middleware compatible
- JavaScript all the way
- BEM stuff
  - Methodology to rule the development process
  - Well-structured file system
  - CSS, JS, templates dependency management
  - Asynchronous JS module system (no global variables)
  - Semantic blocks for application building
  - Build process out of the box (including CSS and JS minification)
  - Unit tests easily (including tools for CSS/templates testing)


## Shared routing and templates between browser and server

bnsf uses [router-base](https://github.com/apsavin/router-base/) internally. It's a router, [inspired](http://symfony.com/doc/current/cookbook/routing/scheme.html) by Symfony 2 routing system, written in JavaScript, so it can work both on client and on server (node.js). 
If you want to add a page to your application, you will need to specify a route for the page in YAML format:

```yaml
- id: main-page
  path: /
```

So, when user will open http://your-domain.com/, he will see the content of the main page. You need to create a template for the page into the folder of main-page block. bnsf uses `BEMTREE` and `BEMHTML` technologies for templates, so the simplest template looks like this:

```javascript
block('main-page').content()('Hello world');
```

Router and templates work both on the client and on the server, so if user somewhere into your application will click on the link to main page, he will see the content of it without page reloading.
In order to avoid copy-paste and hard code, router supports urls generation, both in templates:

```javascript
path('main-page') // returns "/"
```

and in client or server JavaScript code:

```javascript
router.generate('main-page'); // returns "/"
```

## Single page application easily

Write your code once, use everywhere. Templates, routing and your JavaScript code are shared between the client side and server side, but it's smart sharing: you always can specify, which code should be only on client, which code should be only on server and which should run on both sides of your application. The same with routes.
Applications, written on top of bnsf, are views only. You will need to write some part with http API separately, using any language: it can be another node.js server, PHP application or even Go server. Such architecture gives you all pros of separation View from Data. You can read more in awesome article from Nickolas Zackas [here](http://www.nczonline.net/blog/2013/10/07/node-js-and-the-new-web-front-end/), but I want to specify a pair of advantages in the document:

- Reuse of API server: one server for your web site, Android and iOS applications
- Most changes of View are easy, because you don't need to change back-and logic

## SEO-friendly

When user directly types the url of some page of your site and press `Return`, the whole page is generated on the server. So, when search bot opens pages, bnsf behaves the same way, even if the bot can't understand JavaScript. Links on your site are just usual links, without any anchors, so bots can parse it without any difficulties. All content is available, always.

## Connect middleware compatible

bnsf uses connect www.senchalabs.org/connect/ under the hood, so you can use any of high-quality and well-tested connect middleware.

## JavaScript all the way

bnsf written in JavaScript. Your code should be written in JavaScript or any other language, that can be compiled to JavaScript. Your templates and router configuration files becomes JavaScript. And it's cool, because bnsf application can run everywhere, where JavaScript can run.

## BEM stuff

bnsf is a thin layer on top of [bem-core](https://github.com/bem/bem-core), main [BEM](http://bem.info) library, which provides JavaScript framework (i-bem), [ym](https://github.com/ymaps/modules) async modules system, [BEMHTML](http://bem.info/technology/bemhtml/2.3.0/rationale/) declarative template engine and other cool base stuff.
