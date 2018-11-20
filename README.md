#Note

## Getting Started

* `npm install`
* `gulp serve` for development
* `gulp build` for production
* development code is in `app` folder
* production code will be in `build` folder
* to set up ES Lint [go here](https://hackernoon.com/what-is-eslint-how-do-i-set-it-up-on-atom-70f270f57296)

=> if there is error installing npm packages on MAC, try `sudo npm i --unsafe-perm=true`

## Setting Up Server

It's the way how Udacity setup up the project for us. You'll have to download server repository [from here](https://github.com/devNimi/mws-restaurant-stage-3) or you can use one in the project itself go to `server/` 

then run

* `npm i`
* `npm i sails -g`
* `node server`

**Note:**  There will be 2 servers running one for the app and one for server (this one). 


## personal notes
specifically use browser-sync v2.12.8 otherwise on style changes browser won't reload
issue is still open on Github https://github.com/BrowserSync/browser-sync/issues/150



## instructor's notes

# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality.

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
