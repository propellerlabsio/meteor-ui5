sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel"
    ],
    function(Controller, MessageToast, JSONModel) {
        "use strict";
        return Controller.extend("x.controller.App", {
            onInit: function() {
                // Get people from meteor collection.  Autopublish won't work
                // here as the data isn't loaded yet (it takes some time in the background)
                // so we need to get the data via a subscription
                Meteor.subscribe("people", {
                    onReady: () => {
                        var oPeople = people.find().fetch();
                        var oPeopleModel = new JSONModel(oPeople);
                        this.getView().setModel(oPeopleModel, "peopleModel");
                    },
                    onError: () => {
                        console.log("Subscription error", arguments);
                    }
                });
            }
        });
    }
);
