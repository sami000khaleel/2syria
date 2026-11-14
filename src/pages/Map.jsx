import React, { useRef, useState, useEffect } from "react";
import {
  Circle,
  MapContainer,
  TileLayer,
  useMapEvents,
  useMap,
  Marker,
  Popup,
  Pane,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/api";
import Loading from "../components/Loading/Loading";
import Nearby from "../components/svgs/Nearby";
import { AlertCircle, X } from "lucide-react";
import ImageSearch from "../components/ImageSearch/ImageSearch";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Slide from "../components/Slide/Slide";
import SearchForm from "../components/SearchForm/SearchForm";
import Cookies from "js-cookies";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import YourAtButton from "../components/svgs/YourAtButton";
const Map = () => {
  const [loadingFlag, settLoadingFlag] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [error, setError] = useState({
    flage: false,
    status: null,
    message: "",
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [zoom, setZoom] = useState(17);
  const navigate = useNavigate();
  const [slideFlage, setSlideFlage] = useState(false);
  const [center, setCenter] = useState([33.511534, 36.30116]);
  let [placeIndex, setPlaceIndex] = useState(0);
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState([]);
  const [user, setUser] = useState({ userName: "", email: "" });
  const dialogRef = useRef("");
  // handling review Model
  useEffect(
    () => (Cookies.getItem("token") ? () => null : navigate("/signup")),
    []
  );
  // hanling error
  function showErrorDialog(error) {
    if (!error.errorFlage) return;
    setError(error);
    dialogRef.current.open = true;
    setTimeoutId(
      setTimeout(() => {
        dialogRef.current.open = false;
        setError((pre) => {
          return { ...pre, errorFlage: false };
        });
      }, 3000)
    );
  }
  function toggleDialog() {
    if (dialogRef.current) {
      dialogRef.current.open = !dialogRef.current.open; // Toggle the open attribute
    }
  }
  function toggleModal() {
    if (dialogRef.current) {
      if (dialogRef.current.open) {
        dialogRef.current.close(); // Close the dialog
      } else {
        dialogRef.current.showModal(); // Open the dialog
      }
    }
  }
  async function getUserLocation() {
    if (userLocation.length) return userLocation;
    async function getCoordinates() {
      try {
        Cookies.setItem("userConfirmation", true);
        console.log("started calling");
        let location = await api.getUserLocation();
        setUserLocation(location);
        console.log(location);
        return location;
      } catch (err) {
        showErrorDialog({
          errorFlage: true,
          message: "failed to fetch your location",
          status: 404,
        });
        return [];
      }
    }
    if (!Cookies.getItem("userConfirmation")) {
      const result = window.confirm(
        "give us permission to access your location"
      );
      if (result) {
        let res = await getCoordinates();
        return res;
      } else {
        // User clicked Cancel
        console.log("User clicked Cancel");
        return [];
      }
    }
    let res = await getCoordinates();
    return res;
  }
  useEffect(() => {
    getUserLocation();
  }, []);
  function selectPlace(index, place) {
    console.log(place);
    setZoom(17);
    setPlaceIndex(index);
    setSlideFlage(true);
    setCenter(places[placeIndex].location);
  }
  useEffect(() => {
    if (!places.length) return;
    setCenter([
      places[placeIndex].location.lat,
      places[placeIndex].location.lng,
    ]);
  }, [placeIndex]);
  function scrollPlaceLeft(e) {
    e.preventDefault();
    if (placeIndex === 0) {
      setPlaceIndex(places.length - 1);
      return;
    }
    setPlaceIndex((pre) => --pre);
    return;
  }
  function scrollPlaceRight(e) {
    e.preventDefault();

    if (placeIndex === places.length - 1) {
      setPlaceIndex(0);
      return;
    }
    setPlaceIndex((pre) => ++pre);
  }
  function SetCenter() {
    const map = useMap();
    if (center.length) {
      console.log(map.getZoom())
      let xOffset=center[1]
      if(map.getZoom()>=16)xOffset=center[1]-0.003
      if(map.getZoom()==15)xOffset=center[1]-0.005
      if(map.getZoom()==14)xOffset=center[1]-0.01
      if(map.getZoom()==13)xOffset=center[1]-0.03
      if(map.getZoom()==12)xOffset=center[1]-0.05
      if(map.getZoom()==11)xOffset=center[1]-0.08
      if(map.getZoom()==10)xOffset=center[1]-0.19
      if(map.getZoom()<=9)xOffset=center[1]-0.3
      map.setView([center[0], xOffset ]);
    }
    return null;
  }
  function UserLocationMarker() {
    if (userLocation.length)
      return (
        <>
          <Circle
            pathOptions={{
              color: "#2496E6",
              fillColor: "#59B8F7",
              fillOpacity: 0.18,
              weight: 2,
            }}
            center={userLocation}
            radius={100}
          />
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        </>
      );
    return null;
  }

  function MyComponent() {
    const map = useMapEvents({
      click: () => {
        map.locate();
      },
      locationfound: (location) => {},
    });
    return null;
  }
  function PlacesLocationMarker() {
    if (!places.length) {
      return null;
    }

    return (
      <div>
        {places.map((place, i) => (
          <Marker
            key={i}
            eventHandlers={{
              click: () => selectPlace(i, place),
            }}
            position={[place.location.lat, place.location.lng]}
          >
            <Circle
              pathOptions={{ color: "#CE1126", fillOpacity: 0.15, weight: 2 }}
              center={center}
              radius={50}
            />
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
      </div>
    );
  }
  useEffect(() => {
    async function fetchUser() {
      try {
        if (!Cookies.getItem("token")) return navigate("/signup");
        const data = await api.getUser(Cookies.getItem("token"));
        setUser(data.user);
      } catch (error) {
        Cookies.removeItem("token");
        navigate("/signup");
      }
    }
    fetchUser();
  }, []);
  function Bounder() {
    const map = useMap();
    if (!places.length) return null;
    return null;
  }
  async function handleImageUpload(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!Cookies.getItem("token"))
        return setError({
          flage: true,
          message: "you have to have an accout first",
          status: 403,
        });
      settLoadingFlag(true);
      const response = await api.searchByImage(e.target.files[0]);
      const { places } = response.data;
      console.log(places);
      settLoadingFlag(false);
      setPlaces(response.data.places);
      setSlideFlage(true);
    } catch (err) {
      console.log(err);
      settLoadingFlag(false);
    }
  }
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-sand-100 dark:bg-ink-950">
      {
        <dialog
          ref={dialogRef}
          className={`fixed inset-x-0 top-24 z-[60] mx-auto block w-[min(92vw,420px)] border-0 bg-transparent p-0
  ${error.errorFlage ? "dialog-open animate-dialog" : "dialog-closed pointer-events-none"}`}
        >
          {error.errorFlage ? (
            <div
              className={`glass relative flex items-start gap-3 rounded-2xl border-l-4 !border-l-star-500 p-4 pr-11`}
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 animate-shake place-content-center rounded-full bg-star-500/10 text-star-500 dark:bg-star-500/20 dark:text-star-400">
                <AlertCircle size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-ink-900 dark:text-white">Error</h2>
                <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-300">{error.message}</p>
              </div>
              <button
                aria-label="close"
                className="absolute right-2 top-2 grid h-8 w-8 place-content-center rounded-full text-ink-400 transition hover:bg-ink-900/5 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={() => {
                  setError((pre) => ({ ...pre, errorFlage: false }));
                  clearTimeout(timeoutId);
                }}
              >
                <X size={18} />
              </button>
            </div>
          ) : null}
        </dialog>
      }
      {loadingFlag ? <Loading /> : null}
      {slideFlage && (
        <Slide
          showErrorDialog={showErrorDialog}
          placesNum={places.length}
          placeIndex={placeIndex + 1}
          setSlideFlage={setSlideFlage}
          scrollPlaceLeft={scrollPlaceLeft}
          scrollPlaceRight={scrollPlaceRight}
          place={places[placeIndex]}
        />
      )}
      <div className={`absolute bottom-8 right-4 z-50 fab-in flex-col items-end gap-3 sm:bottom-10 sm:right-8 ${slideFlage ? "hidden sm:flex" : "flex"}`}>
        <ThemeToggle />
        <YourAtButton
          userLocation={userLocation}
          getUserLocation={getUserLocation}
          setCenter={setCenter}
          setUserLocation={setUserLocation}
        />
        <ImageSearch handleImageUpload={handleImageUpload} />
      </div>
      <SearchForm
        showErrorDialog={showErrorDialog}
        setSlideFlage={setSlideFlage}
        setPlaces={setPlaces}
        getUserLocation={getUserLocation}
        userLocation={userLocation}
        setCenter={setCenter}
      />
      <span className="map-shell absolute left-0 top-0 z-0">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100vh", width: "100vw" }}
        >
          <Bounder />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />{" "}
          {userLocation.length && <UserLocationMarker />}
          <SetCenter />
          <PlacesLocationMarker />
        </MapContainer>
      </span>
    </main>
  );
};

export default Map;
