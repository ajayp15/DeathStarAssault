/*
  cleanup.js
*/

function dispose3(obj) {
    /**
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  @date Mar 12, 2016
     */

    "use strict";

    var children = obj.children;
    var child;

    if (children) {
        for (var i=0; i<children.length; i+=1) {
            child = children[i];

            dispose3(child);
        }
    }

    var geometry = obj.geometry;
    var material = obj.material;

    if (geometry) {
        geometry.dispose();
    }

    if (material) {
        var texture = material.map;

        if (texture) {
            texture.dispose();
        }

        material.dispose();
    }
}
