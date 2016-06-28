define([
        "dojo/_base/declare"
    ],
    function(declare) {
        "use strict";

        return declare(null, {
            doTest1: function() {
                console.log("called test1.js from test.js");
				//mainfromtest();
            }
        });
    }
);