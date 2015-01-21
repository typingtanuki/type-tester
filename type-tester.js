window.TypeTester = {
    trimArray: function (array) {
        var out = [];
        var val;
        for (var i = 0; i < array.length; i++) {
            val = array[i].trim();
            if (typeof val != "string" || val.length > 0) {
                out.push(val);
            }
        }
        return out;
    },
    isOptional: function (argument) {
        return argument.indexOf("[optional]") == 0;
    },
    extractParameter: function (parameter) {
        var name, isOptional = false, type = "any", subtype = "any";

        if (parameter && parameter.indexOf("/*") == 0) {
            name = parameter.split("*/")[1].trim();
            type = parameter.split("/*")[1].split("*/")[0].trim();
            isOptional = this.isOptional(type);
            if (isOptional) {
                type = type.replace("[optional]", "").trim();
            }

            if (type.indexOf("array<") == 0) {
                subtype = type.split("<")[1].split(">")[0].trim();
                type = type.split("<")[0].trim();
            }
        } else {
            name = parameter;
        }

        return {
            name: name,
            optional: isOptional,
            type: type,
            subtype: subtype
        };
    },

    _consoleOut_: function (message) {
        console.warn(message);
    },
    _errorOut_: function (message) {
        throw new TypeError(message);
    },

    checkArgument: function (parameter, passed) {
        var actual = typeof(passed);

        var isCorrect = true;
        switch (parameter.type) {
            case "any":
                //Nothing to check
                break;
            case "int":
                isCorrect = actual == "number" && passed.toString().match(/^[0-9]+$/) !== null;
                break;
            case "float":
                isCorrect = actual == "number" && passed.toString().match(/^[0-9]+(\.[0-9])?$/) !== null;
                break;
            case "dom":
                isCorrect = actual == "object" && passed instanceof Node;
                break;
            case "array":
                isCorrect = passed instanceof Array || (/*required for node collections*/ passed && passed.length !== undefined);
                if (isCorrect) {
                    //Test type of elements in the array
                    for (var i = 0; i < passed.length; i++) {
                        this.checkArgument(
                            {
                                name: parameter.name,
                                optional: parameter.optional,
                                type: parameter.subtype,
                                subtype: "any"
                            },
                            passed[i]
                        );
                    }
                }
                break;
            default:
                isCorrect = parameter.type == actual;
        }
        if (!isCorrect) {
            this.fail("Wrong type given to parameter '" + parameter.name + "' in function '" + functionName + "'.\nExpected a '" + parameter.type + "' but got type " + actual + ":" + JSON.stringify(parentArguments[i], null, 4));
        }
    },
    _check_: function () {
        var fullFunction = arguments.callee.caller.toString();
        var functionName = fullFunction.replace(/\r*\n*/, "").split("(")[0].split("function")[1].trim();
        if (functionName == "") {
            //Anonymous function
            functionName = fullFunction.replace(/\r*\n*/, "").substring(0, 40);
        }

        var parameterPart = fullFunction.replace(/\r*\n*/, "").split("(")[1].split(")")[0];
        var parameters = parameterPart.split(",");
        parameters = this.trimArray(parameters);

        var parentArguments = arguments.callee.caller.arguments;

        if (parentArguments.length > parameters.length) {
            this.fail("Too many arguments passed to the function '" + functionName + "'.\nExpected " + parameters.length + " but got " + parentArguments.length)
        }

        var i, parameter;
        for (i = 0; i < parentArguments.length; i++) {
            parameter = this.extractParameter(parameters[i]);

            if (parentArguments[i] == undefined || parentArguments[i] == null) {
                if (!parameter.optional) {
                    this.fail("Missing required parameter '" + parameter.name + "' in function '" + functionName + "' at index " + i + " but got " + parentArguments[i]);
                }
            } else {
                this.checkArgument(parameter, parentArguments[i]);
            }
        }

        for (i = parentArguments.length; i < parameters.length; i++) {
            parameter = this.extractParameter(parameters[i]);
            if (!parameter.optional) {
                this.fail("Missing required parameter '" + parameter.name + "' in function '" + functionName + "' at index " + i);
            }
        }
    },

    //Enable type check
    on: function () {
        this.check = this._check_;
    },
    //Disable type check
    off: function () {
        this.check = function () {
        };
    },

    //Use console.warn() to output type errors
    warn: function () {
        this.fail = this._consoleOut_;
    },
    //Throw exception on type error
    except: function () {
        this.fail = this._errorOut_;
    }
};
window.TypeTester.on();
window.TypeTester.warn();
