//Jar.js - v0.0.1
//Author - Gautham R.

(function () {
    var global = this;
    global.jar = {};

    jar.util = {
        isObjectNullOrUndefined: function (o) {
            if (!o) return false;
            if (typeof o != 'object') return false;
            return true;
        },
        replaceAll: function (find, replace, str) {
            return str.replace(new RegExp(find, 'g'), replace);
        },
        injectScript: function (src) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded') {
                    document.appendChild(script);
                    console.log(classData.classname + " is loaded");
                }
            }
            script.src = src;
            var scriptTags = document.getElementsByTagName('script');
            if (scriptTags.length > 0) {
                var last = scriptTags[scriptTags.length - 1];
                last.parentNode.insertBefore(script, last);
            }
            //var first = document.getElementsByTagName('script')[0];
            //first.parentNode.insertBefore(script, first);
            //document.getElementsByTagName('head')[0].appendChild(script);
        }
    };
    jar._import = {
        file: function (classnamespace) {
            if (!classnamespace) throw "Invalid class name";
            var splitName = classnamespace.split('.'),
                            i = 0,
                            classPath = jar._app.appPath;
            if (splitName && splitName.length > 2) {
                var appName = splitName[0];
                var className = splitName[splitName.length - 1];
                if (jar._app.name != appName) throw "Invalid Namespace";
                var splitNameLength = splitName.length;
                //Generate class path.
                for (; i < splitNameLength; i++) {
                    if (i > 0 && i < splitNameLength - 1) {
                        if (classPath == "/") {
                            classPath += splitName[i];
                        }
                        else {
                            classPath += ("/" + splitName[i]);
                        }
                    }
                    if (i == splitNameLength - 1) {
                        classPath += ("/" + splitName[i] + ".js");
                    }
                }

                jar._app._setAppClassPathList({ classname: className, path: classPath });
                return { classname: className, path: classPath };
            }
            else {
                throw "Invalid class name - " + classnamespace;
            }
        }
    };
    jar._module = {
        collection: [],
        _add: function (name, obj) {
            this.collection.push({ name: name, obj: obj });
        },
        _fetch: function (name) {
            for (var i = 0; i < this.collection.length; i++) {
                var module = this.collection[i];
                if (module.name == name) {
                    return module;
                }
            }
            return null;
        }
    };
    jar._app = {
        name: null, //Acts as namespace
        isInitialized: false,
        appPath: "",
        classPathList: [],
        _isValidClass: function (name) {
            var classes = this.classPathList;
            for (var j = 0; j < classes.length; j++) {
                var classObj = classes[j];
                if (name == classObj.classname) {
                    return true;
                }
            }
            return false;
        },
        modules: [],
        _setModules: function (modules) {
            this.modules = modules;
            this._loadModules();
        },
        _loadModules: function () {
            var me = this;
            var modules = me.modules;
            for (var i = 0; i < modules.length; i++) {
                jar._import.file(modules[i]);
            }
            this._attachModules();
        },
        _attachModules: function () {
            var classPaths = this.classPathList;
            for (var i = 0; i < classPaths.length; i++) {
                var classData = classPaths[i];
                var path = classData.path;

                //attaching script tag.
                jar.util.injectScript(path);
            }
        },
        _setAppClassPathList: function (classPath) {
            this.classPathList.push(classPath);
        },
        _setName: function (name) {
            if (name) this.name = name;
        },
        _setAppPath: function (path) {
            if (path) this.appPath = path; //else this.appPath = "";
        }
    };

    //App Initialization.
    jar.app = function (config) {
        if (!jar.util.isObjectNullOrUndefined(config)) throw "invalid config object";
        if (config.name) jar._app._setName(config.name);
        if (config.appPath) {
            jar._app._setAppPath(config.appPath); jar._app.isInitialized = true;
        }
        else jar._app.isInitialized = false;
        if (config.modules) { jar._app._setModules(config.modules); jar._app.isInitialized = true; } else jar._app.isInitialized = false;

        window.onload = function () {
            config.launch(jar._app);
        }
    };

    //Managing defined classes
    jar.store = function (classname, config) {
        if (!classname && !jar._isValidClass(classname)) throw "Invalid class name";
        if (!jar.util.isObjectNullOrUndefined(config)) throw "Invalid class object for " + classname;
        jar._module._add(classname, config);
    };

    //grabbing the initalized class.
    jar.grab = function (classname) {
        if (!classname) throw "Invalid class name";
        var jarcookie = jar._module._fetch(classname);
        if (jarcookie) {
            var newCookie = {};
            newCookie = jarcookie.obj;
            newCookie._name = classname;
            newCookie.init();
            return newCookie;
        }
        return null;
    }
})();