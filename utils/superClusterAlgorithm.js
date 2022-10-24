import { SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

// Temporary fix for https://github.com/googlemaps/js-markerclusterer/pull/419
export default class BoundingSuperClusterAlgorithm extends SuperClusterAlgorithm {
  cluster({ map }) {
    const bounds = map.getBounds().toJSON();
    const boundingBox = [bounds.west, bounds.south, bounds.east, bounds.north];

    return this.superCluster
      .getClusters(boundingBox, Math.round(map.getZoom()))
      .map(this.transformCluster.bind(this));
  }
}
