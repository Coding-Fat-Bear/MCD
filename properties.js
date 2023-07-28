/*!

* sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
* --
* @version v1.3.5
* @link https://github.com/stefanwalther/sense-export
* @author Stefan Walther
* @license MIT
*/

/* global define */
define([], function () {
    "use strict";
    return {
      type: "items",
      component: "accordion",
      items: {
        appearance: {
            uses: "settings",
            items: {
              View_Setting:  {
                type: "items",
                label: "Show/hide",
                items: {
                    isPubOutput: {
                            label: "Hide Published sheet",
                            type: "boolean",
                            component: "switch",
                            ref: "props.isPubOutput",
                            options: [
                              { value: !0, label: "Enable" },
                              { value: !1, label: "Disable" },
                            ],
                            defaultValue: !1,
                          },
                        isTabOutput: {
                        label: "Show table only",
                        type: "boolean",
                        component: "switch",
                        ref: "props.isTabOutput",
                        options: [
                            { value: !0, label: "Enable" },
                            { value: !1, label: "Disable" },
                        ],
                        defaultValue: !1,
                        }
                },
              },
            },
          },
      },
    };
  });
  