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
                // Build and set JSON model from meteor collection
                // Get people from meteor collection.  Autopublish won't work
                // here as the data isn't loaded yet (it takes some time in the background)
                // so we need to get the data via a subscription
                Meteor.subscribe("people", {
                    onReady: () => {
                        var oPeople = people.find().fetch();
                        var oPeopleJSONModel = new JSONModel(oPeople);
                        this.getView().setModel(oPeopleJSONModel, "peopleJSONModel");
                    },
                    onError: () => {
                        console.log("Subscription error", arguments);
                    }
                });

                // Build and set Meteor model from meteor subscription and cursor
                var sSubscription = "people";
                var oCursor = people.find();
                var oPeopleMeteorModel = new MeteorModel(sSubscription,oCursor);
                this.getView().setModel(oPeopleMeteorModel, "peopleMeteorModel");
            }
        });
    }
);
