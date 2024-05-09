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
import { ImageDown } from "lucide-react";
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
            pathOptions={{ color: "red" }}
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
              pathOptions={{ color: "red" }}
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
    <main className="relative ">
      {
        <dialog
          ref={dialogRef}
          className={`z-50 backdrop-opacity-60 backdrop-filter backdrop-blur-lg fixed top-0 left-0  flex justify-center items-center
  ${error.errorFlage ? "dialog-open" : "dialog-closed"}`}
        >
          {error.errorFlage ? (
            <div
              className={`bg-black rounded-lg border border-red-600 shadow-lg p-6 relative`}
            >
              <h2 className="text-lg font-semibold text-white">Error</h2>
              <p className="text-bold text-red-600">{error.message}</p>
              <button
                className="absolute top-2 right-2 text-white hover:text-gray-300"
                onClick={() => {
                  setError((pre) => ({ ...pre, errorFlage: false }));
                  clearTimeout(timeoutId);
                }}
              >
                &times;
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
      <div className="absolute flex flex-col items-center  justify-center top-[500px] sm:right-10 right-0 z-50  ">
        <YourAtButton
          userLocation={userLocation}
          getUserLocation={getUserLocation}
          setCenter={setCenter}
          setUserLocation={setUserLocation}
        />
        <div
          id="image search"
          className=" cursor-pointer bg-[rgba(0,0,0,0.2)] top-[60px] shadow-md text-center left-0 flex justify-center items-center   w-[50px] z-[9999999] aspect-square rounded-full  "
        >
          <ImageDown className="absolute" cursor={"pointer"} size={30} />
          <input
            onChange={handleImageUpload}
            type="file"
            className="   w-full h-full opacity-0 cursor-pointer"
            name="image"
            id="image"
            accept="image/*"
          />
        </div>
      </div>
      <SearchForm
        showErrorDialog={showErrorDialog}
        setSlideFlage={setSlideFlage}
        setPlaces={setPlaces}
        getUserLocation={getUserLocation}
        userLocation={userLocation}
        setCenter={setCenter}
      />
      <span className="z-0 absolute top-0 left-0">
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
