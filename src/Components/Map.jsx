import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Map.module.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useCities } from "../Contexts/CitiesContext";
import { useEffect, useState } from "react";
import { useGeolocation } from "../Hooks/UseGeolocation";
import Button from "./Button";
import { useGetUrlPostion } from "../Hooks/UseGetUrlPostion";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Map() {
  const { cities } = useCities();
  const [mapPostion, setMapPostion] = useState([51.505, -0.09]);
  const [searchParams] = useSearchParams();

  const {
    isLoading,
    position: geoLocation,
    error,
    getPosition: getGeoPostion,
  } = useGeolocation();

  const [maplat, maplng] = useGetUrlPostion();

  useEffect(
    function () {
      if (geoLocation) setMapPostion([geoLocation.lat, geoLocation.lng]);
    },
    [geoLocation]
  );

  useEffect(
    function () {
      if (maplat && maplng) setMapPostion([maplat, maplng]);
    },
    [maplat, maplng]
  );

  return (
    <div className={styles.mapContainer}>
      {!geoLocation && (
        <Button type="position" onClick={getGeoPostion}>
          {isLoading ? "loading..." : "use your postion"}
        </Button>
      )}
      <MapContainer
        center={mapPostion}
        // center={[maplat, maplng]}
        zoom={6}
        scrollWheelZoom={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {cities.map((city) => {
          return (
            <Marker
              position={[Number(city.position.lat), Number(city.position.lng)]}
              key={city.id}
            >
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          );
        })}
        <ChangeCenter position={mapPostion} />
        <MapEvents />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

const MapEvents = () => {
  const navigate = useNavigate();

  useMapEvent({
    click(e) {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
  return null;
};

export default Map;
