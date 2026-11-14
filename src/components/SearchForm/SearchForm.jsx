import React from "react";
import Searchcon from "../svgs/SearchIcon";
import api from "../../api/api";
import RangeSlide from "../RangeSlide/RangeSlide";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
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
      <form className="absolute left-1/2 top-4 z-10 w-[calc(100vw-2rem)] -translate-x-1/2 text-ink-900 dark:text-ink-50 sm:left-[max(50%,calc(416px+15rem))] sm:top-5 sm:z-30 sm:w-[30rem]">
        <div className="glass flex w-full animate-drop-in items-center gap-1 rounded-2xl p-1.5 pl-4 transition-shadow duration-300 focus-within:shadow-2xl focus-within:shadow-brand-500/20">
          <input
            onChange={handleInput}
            placeholder="search 2syria"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-left outline-none placeholder:text-ink-400"
            type="text"
            name="search"
            id="search"
            value={searchQuery}
          />
          <button
            id="filter"
            onClick={handleFilterClick}
            className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              visibleFilter
                ? "bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300"
                : "text-ink-500 hover:bg-ink-900/5 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} aria-hidden />
            filter
          </button>
          <section
            id="list"
            className={`${
              visibleFilter ? "" : "hidden"
            } glass !bg-white/95 dark:!bg-ink-900/95 nice-scroll absolute left-1/2 top-[calc(100%+10px)] z-10 grid max-h-[72vh] w-[min(calc(100vw-2rem),600px)] -translate-x-1/2 origin-top animate-scale-in gap-6 overflow-y-auto rounded-2xl p-5 sm:grid-cols-[1.4fr_1fr]`}
          >
            <article className="flex flex-col gap-3 sm:border-r sm:border-sand-200 sm:pr-6 sm:dark:border-ink-700">
              <h1 className="section-label">CITIES</h1>
              <ul className="stagger-fast flex flex-wrap gap-2">
                {cities.map((city, i) => (
                  
                    <li
                      onClick={(e) => handleSelectCity(e, city)}
                      className="chip"
                      key={i}
                    >
                      {city}
                    </li>
                ))}
              </ul>
            </article>
            {/* <div className=" rounded-xl mx-3 my-3 bg-slate-700 w-1  z-30"></div> */}
            <article className="flex flex-col gap-3" id="place type">
              <h1 className="section-label">TYPES</h1>
              <ul className="stagger-fast flex flex-wrap gap-2" >
                {types.map((type,i) => (
                  
                    <li
                      onClick={(e) => handleSelectType(e, type)}
                      className="chip"
                      key={i}
                    >
                      {type}
                    </li>
                  
                ))}
              </ul>
            <RangeSlide  getUserLocation={getUserLocation} userLocation={userLocation} radiusFlage={radiusFlage} setRadiusFlage={setRadiusFlage} radius={radius} setRadius={setRadius} unit={unit} setUnit={setUnit}/>
            </article>
          </section>
          <button
            onClick={handleSearch}
            aria-label="search"
            className="grid h-11 w-11 shrink-0 place-content-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95 dark:bg-brand-400 dark:text-ink-950 dark:hover:bg-brand-300"
          >
            <Searchcon />
          </button>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
