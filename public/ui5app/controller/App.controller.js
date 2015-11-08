sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast"
    ],
    function(Controller, MessageToast, JSONModel) {
        "use strict";
        return Controller.extend("x.controller.App", {
            onInit: function() {
                // Build and set Meteor model from meteor subscription and cursor
                var sSubscription = "people";
                var oCursor = people.find();
                var oPeopleMeteorModel = new MeteorModel(sSubscription,oCursor);
                this.getView().setModel(oPeopleMeteorModel, "people");
            }
        });
    }
);
