import React from "react";
import Searchcon from "../svgs/SearchIcon";
import api from "../../api/api";
import RangeSlide from "../RangeSlide/RangeSlide";
import { useState } from "react";
const SearchForm = ({ showErrorDialog,getUserLocation,setPlaces, setCenter ,setSelectedPlace,setSlideFlage,userLocation}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleFilter, setVisibleFilter] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [unit,setUnit]=useState('mi')
  
  const [radius,setRadius]=useState(20)
  const [radiusFlage,setRadiusFlage]=useState(false)

  const cities = [
    "Damascus",
    "Aleppo",
    "Homs",
    "Hamah",
    "Latakia",
    "Daraa",
    "Deir Al-Zur",
    "Al Raqqah",
    "Idleb",,
    "Tartous",
    "Suwayda",
    "Palmyra",
    "Hasaka",
  ];
  const types = [
    "historical",
    "restaurant",
    "great view",
    "religios",
    "old ruins",
    "hotel",
  ];
  function handleInput(e) {
    e.preventDefault();
    setSearchQuery(e.target.value);
  }
  async function handleSearch(e) {
    try {
      e.preventDefault();
      setVisibleFilter(false)
      let places=[]
      if(!radiusFlage&&userLocation.length)
        places = await api.searchPlaces(searchQuery,selectedCities,selectedTypes);
      else 
      places = await api.searchPlaces(searchQuery,selectedCities,selectedTypes, unit,
        radius,
        userLocation[0],
        userLocation[1]);  
      setPlaces(places);
      setSlideFlage(true)
      const lat = places[0].location.lat;
      const lng = places[0].location.lng;
      setCenter([lat, lng]);
    } catch (error) {
      console.log(error)
      const err={errorFlage:true,message:error.response.data.message,status:error.response.status}
      showErrorDialog(err)
    }finally{
      setSearchQuery('')
      setSelectedCities([])
      setSelectedTypes([])
      const selectedElements = document.querySelectorAll('[data-selected="true"]');
    selectedElements.forEach(element => {
      element.removeAttribute('data-selected');
    });
    }
  }
  function handleFilterClick(e) {
    e.preventDefault();
    setVisibleFilter((pre) => !pre);
  }
  function handleSelectCity(e, city) {
    e.preventDefault();
    const isSelected = e.target.getAttribute("data-selected") === "true";

    if (!isSelected) {
      // City not selected yet
      e.target.setAttribute("data-selected", "true");
      setSelectedCities((prevCities) => [...prevCities, city]);

    } else {
      // City already selected
      e.target.removeAttribute("data-selected");
      setSelectedCities((prevCities) => prevCities.filter((c) => c !== city));
    }
  }

  function handleSelectType(e, type) {
    e.preventDefault();
    const isSelected = e.target.getAttribute("data-selected") === "true";

    if (!isSelected) {
      // Type not selected yet
      e.target.setAttribute("data-selected", "true");
      setSelectedTypes((prevTypes) => [...prevTypes, type]);
    } else {
      // Type already selected
      e.target.removeAttribute("data-selected");
      setSelectedTypes((prevTypes) => prevTypes.filter((t) => t !== type));
    }
  }

  return (
    <>
      <form className=" text-black  max-w-[600px]  absolute z-10 rounded-xl  flex justify-center items-center bg-white   top-4 left-1/2  transform -translate-x-1/2 scale-75   ">
        <div className="flex justify-between items-center w-full mx-4 ">
          <input
            onChange={handleInput}
            placeholder="search 2syria"
            className="  outline-none rounded-lg  text-left h-100"
            type="text"
            name="search"
            id="search"
            value={searchQuery}
          />
          <button
            id="filter"
            onClick={handleFilterClick}
            className="relative bg-slate-100 rounded-md p-1 cursor-pointer"
          >
            filter
          </button>
          <section
            id="list"
            className={`${
              visibleFilter ? "" : "hidden"
            } min-w-[400px] p-3 flex absolute z-10 bg-white shadow-2xl  justify-between  top-10  right-[50%] translate-x-[50%] `}
          >
            <article className="flex flex-col justify-between items-center">
              <h1 className="bold text-xl">CITIES</h1>
              <ul className=" flex items-center   gap-1 justify-start  flex-col flex-wrap h-[400px] ">
                {cities.map((city, i) => (
                  
                    <li
                      onClick={(e) => handleSelectCity(e, city)}
                      className="text-lg cursor-pointer my-4 p-1 rounded-lg bg-slate-200 data-[selected]:bg-green-400  "
                      key={i}
                    >
                      {city}
                    </li>
                ))}
              </ul>
            </article>
            <div className=" rounded-xl mx-3 my-3 bg-slate-700 w-1  z-30"></div>
            <article className="" id="place type">
              <h1 className="bold text-xl">TYPES</h1>
              <ul className="flex flex-col " >
                {types.map((type,i) => (
                  
                    <li
                      onClick={(e) => handleSelectType(e, type)}
                      className="cursor-pointer text-lg text-center flex   data-[selected]:bg-green-400  bg-slate-200 p-1 my-2 rounded-lg"
                      key={i}
                    >
                      {type}
                    </li>
                  
                ))}
              </ul>
            <RangeSlide  getUserLocation={getUserLocation} userLocation={userLocation} radiusFlage={radiusFlage} setRadiusFlage={setRadiusFlage} radius={radius} setRadius={setRadius} unit={unit} setUnit={setUnit}/>
            </article>
          </section>
          <button onClick={handleSearch}>
            <Searchcon />
          </button>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
