define([
        "dojo/_base/declare", "./test1"
    ],
    function(declare, test1) {
        "use strict";

        return declare(null, {
            doTest: function(t) {
                console.log(t.map);
				t.wx = 'after';
				//this.test1 = new test1();
				//this.test1.doTest1();
            }
        });
    }
);