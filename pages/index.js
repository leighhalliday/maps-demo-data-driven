import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMapProvider,
  useAutocomplete,
  useGoogleMap,
} from "@ubilabs/google-maps-react-hooks";
import zones from "../data/zones";
import colors from "../data/colors";

const mapOptions = {
  zoom: 10,
  center: {
    lat: 40,
    lng: -88,
  },
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
};

export default function Index() {
  const [mapContainer, setMapContainer] = useState();
  const onLoad = useCallback((map) => addZoneLayer(map));

  return (
    <GoogleMapProvider
      options={mapOptions}
      googleMapsAPIKey={process.env.NEXT_PUBLIC_MAP_API_KEY}
      mapContainer={mapContainer}
      version="beta"
      onLoad={onLoad}
      libraries={["places"]}
    >
      <div ref={(node) => setMapContainer(node)} style={{ height: "100vh" }} />
      <AutoComplete />
    </GoogleMapProvider>
  );
}

function AutoComplete() {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [position, setPosition] = useState();
  const { map } = useGoogleMap();

  useEffect(() => {
    if (!position || !map) return;
    map.setCenter(position);
    map.setZoom(12);
  }, [position, map]);

  useAutocomplete({
    inputField: inputRef && inputRef.current,
    onPlaceChanged: (place) => {
      if (!place) return;
      setInputValue(place.formatted_address || place.name);
      setPosition({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    },
  });

  return (
    <input
      ref={inputRef}
      value={inputValue}
      onChange={(event) => setInputValue(event.target.value)}
    />
  );
}

function addZoneLayer(map) {
  if (!map.getMapCapabilities().isDataDrivenStylingAvailable) return;

  const featureLayer = map.getFeatureLayer("POSTAL_CODE");

  featureLayer.style = ({ feature }) => {
    const zip = feature.displayName;
    const zone = zones[zip];
    if (!zone) return;

    return {
      fillColor: colors[zone],
      fillOpacity: 0.5,
    };
  };

  const infoWindow = new google.maps.InfoWindow();

  featureLayer.addListener("click", (event) => {
    const feature = event.features[0];
    if (!feature.placeId) return;
    const zip = feature.displayName;
    const zone = zones[zip];
    if (!zone) return;

    infoWindow.setPosition(event.latLng);
    infoWindow.setContent(`
      <div class="info-window">
        <h2>Zone ${zone}</h2>
        <p>ZIP ${zip} is USDA Zone ${zone}.</p>
      </div>
    `);
    infoWindow.open({ map });
  });
}
