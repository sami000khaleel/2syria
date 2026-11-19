import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../api/api";
import "./Slide.css"; // Import CSS file for styling
import imgs from "../../assets/google-icon.png";
import SyrianFlage from './../../assets/syrianFlagNew.svg'
import { X, MessageSquarePlus, UserRound } from "lucide-react";
import Arrows from "../Arrows/Arrows";
import ImagesSlider from "../ImagesSlider/ImagesSlider";
const Slide = ({
  showErrorDialog,
  placeIndex,
  placesNum,
  place,
  scrollPlaceLeft,
  scrollPlaceRight,
  setSlideFlage,
}) => {
  // const [place,setPlace]=useState(place)
  const commentsRef = useRef(null);
  const [review, setReview] = useState({ rating: null, review: "" });
  const [reviewingFlage, setReviewingFlage] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const modalRef = useRef("");
  const [commentsHeight, setCommentsHeight] = useState(0);
  // get reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await api.getReveiws(place._id);
        setReviews(data.reviews);
      } catch (err) {
        showErrorDialog({
          errorFlage: true,
          message: err.response.data.message,
          status: err.response.status,
        });
      }
    }
    fetchReviews(placeIndex);
    setImageIndex(0)
  }, [placeIndex]);
  useEffect(() => {
    function updateCommentsHeight() {
      if (commentsRef.current) {
        const newHeight =
          window.innerHeight - commentsRef.current.getBoundingClientRect().top;
        setCommentsHeight(newHeight);
      }
    }

    // Call the function to update comments height when the component mounts
    updateCommentsHeight();

    // Add event listener for window resize to update comments height dynamically
    window.addEventListener("resize", updateCommentsHeight);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateCommentsHeight);
    };
  }, [placeIndex]);
  async function handleSubmitReview(e) {
    try {
      e.preventDefault();
      if (!review.rating) {
        showErrorDialog({
          errorFlage: true,
          status: 403,
          message: "you must rate the place",
        });
        return;
      }
      console.log(place.name)
      const data = await api.postReview(review, place._id);
      setReviews((pre) => [data.review,... pre]);
      let ratings = reviews.map((review) => review.rating);
      let sum = 0;
      ratings.forEach((rating) => {
        sum = sum + rating;
      });
      place.avgRating = sum / ratings.length;
    } catch (err) {
      console.log(err);
      showErrorDialog({
        errorFlage: true,
        status: err.response.status,
        message: err.response.data.message,
      });
    } finally {
      setReviewingFlage(false);
      setReview({ rating: null, review: "" });
    }
  }
  function updateReview(e) {
    setReview((pre) => {
      return { ...pre, [e.target.name]: e.target.value };
    });
  }
  function handleChooseStar(e) {
    const starId = Number(e.target.id);
    setReview((pre) => {
      return { ...pre, rating: starId };
    });
    const stars = document.querySelectorAll(".rating-star-button");
    if (e.target.classList.contains("empty-star")) {
      for (let i = 0; i < starId; i++) {
        stars[i].classList.add("full-star");
        stars[i].classList.remove("empty-star");
      }
      return;
    }
    if (e.target.classList.contains("full-star")) {
      for (let i = Number(starId); i < stars.length; i++) {
        stars[i].classList.add("empty-star");
        stars[i].classList.remove("full-star");
      }
    }
  }
  function toggleModal() {
    if (modalRef.current.open) {
      modalRef.current.close();
      return;
    }
    modalRef.current.showModal();
  }
  function scrollImgRight(e) {
    e.preventDefault();
    if (imageIndex == images.length - 1) {
      setImageIndex(0);
      return;
    }
    setImageIndex((pre) => pre + 1);
    return;
  }
  function scrollImgLeft(e) {
    e.preventDefault();
    if (imageIndex === 0) {
      setImageIndex(images.length - 1);
      return;
    }
    setImageIndex((pre) => pre - 1);
    return;
  }
  useEffect(() => {
    // photos load straight into <img> tags (served from R2 in production)
    const imagesUrl = (place?.photos || [])
      .filter((photo) => photo?.photo_reference)
      .map((photo) => api.imageUrl(place.place_id, photo.photo_reference));
    setImages(imagesUrl);
  }, [place?._id ?? place?.place_id]);
  // Function to render star icons based on the rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star full-star">
          &#9733;
        </span>
      );
    }

    // Render half star if applicable
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half-star">
          &#9733;
        </span>
      );
    }

    // Render remaining empty stars
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty-star transform ">
          &#9733;
        </span>
      );
    }

    return stars;
  };
  return (
    <>
      {place ? (
        <section
          id="slide"
          className="absolute left-0 top-0 z-20 flex h-[100dvh] w-[86vw] animate-slide-in flex-col overflow-hidden border-r border-white/60 bg-white/95 text-ink-900 shadow-2xl shadow-ink-900/20 backdrop-blur-xl dark:border-white/5 dark:bg-ink-900/95 dark:text-ink-50 sm:w-[400px]"
        >
          {reviewingFlage ? (
            <>
            <div aria-hidden className="pointer-events-none fixed inset-0 z-40 animate-[fade-in_250ms_ease-out] bg-ink-950/40 backdrop-blur-[2px]" />
            <dialog
              ref={modalRef}
              className="fixed inset-0 z-50 m-auto flex h-fit w-[calc(100%-2rem)] max-w-[360px] flex-col items-stretch gap-4 rounded-2xl border border-sand-200 bg-white p-6 text-ink-900 shadow-2xl animate-scale-in dark:border-ink-700 dark:bg-ink-850 dark:text-ink-50"
            >
              <button
                aria-label="close"
                onClick={(e) => {
                  e.preventDefault();
                  setReviewingFlage(false);
                }}
                className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-content-center rounded-full text-ink-400 transition hover:bg-ink-900/5 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={18} />
              </button>
              <h1 className="pr-8 text-xl font-bold"> review the place</h1>
              <span className="-mt-1 flex justify-center">
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="1"
                  className={`rating-star-button p-0.5 text-4xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="2"
                  className={`rating-star-button p-0.5 text-4xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="3"
                  className={`rating-star-button p-0.5 text-4xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="4"
                  className={`rating-star-button p-0.5 text-4xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="5"
                  className={`rating-star-button p-0.5 text-4xl  star empty-star`}
                >
                  &#9733;
                </button>
              </span>
              <input
                onChange={updateReview}
                value={review.review}
                type="text"
                name="review"
                placeholder="share your experience"
                className="field"
                id="review"
              />
              <button
                onClick={handleSubmitReview}
                className="btn-primary"
              >
                submit
              </button>
            </dialog>
            </>
          ) : null}
          <button
            aria-label="close"
            className="absolute right-3 top-3 z-30 grid h-10 w-10 place-content-center rounded-full bg-black/[.35] text-white backdrop-blur-md transition hover:rotate-90 hover:bg-star-500"
            onClick={() => setSlideFlage(false)}
          >
            <X size={22} strokeWidth={2.5} />
          </button>
          <div className="relative h-[240px] w-full shrink-0 bg-ink-100 dark:bg-ink-800">
            {/* <img
              style={{ userSelect: "none" }}
              className="user-select-none object-cover h-[200px] w-full"
              src={place && images.length ? images[imageIndex] : SyrianFlage}
              alt={place ? place.name : "place"}
            />{" "}
            {images.length?<Arrows scrollLeft={scrollImgLeft} scrollRight={scrollImgRight} />:null} */}
            <ImagesSlider key={place._id ?? place.place_id} imagesUrls={images.length?images:[SyrianFlage]} />
          </div>
          <div key={place._id ?? place.place_id} className="stagger relative flex min-h-0 flex-1 flex-col px-5 pt-5">
            <h1
              className={`text-ink-900 dark:text-white ${
                place.name.length > 28 ? "text-2xl" : "text-3xl"
              } font-extrabold leading-tight tracking-tight`}
            >
              {place.name}
            </h1>
            <div className="mt-2 text-[26px] tracking-wide" id="rating">
              {renderStars(place.avgRating)}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-y border-sand-200 py-3 dark:border-ink-700">
              <span className="flex items-center gap-3">
                <Arrows
                  scrollLeft={scrollPlaceLeft}
                  scrollRight={scrollPlaceRight}
                />
                <h4 className="text-sm font-semibold tabular-nums text-ink-500 dark:text-ink-300">{`${placeIndex}/${placesNum}`}</h4>
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-600 active:scale-95 dark:bg-brand-400 dark:text-ink-950 dark:hover:bg-brand-300"
                onClick={(e) => {
                  e.preventDefault();
                  setReviewingFlage((pre) => !pre);
                }}
              >
                <MessageSquarePlus size={16} aria-hidden />
                add review
              </button>
            </div>
            {reviews.length ? (
              <span className="flex min-h-0 flex-1 flex-col">
                <h1
                  className={`flex items-center gap-2 pb-2 pt-4 text-lg font-bold text-ink-900 dark:text-white`}
                >
                  Reviews{" "}
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-400/[.15] dark:text-brand-300">{reviews.length}</span>
                </h1>

                <section
                  ref={commentsRef}
                  id="comments"
                  className={`stagger -mr-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-6 pr-3`}
                >
                 {reviews.map((review, i) => (
  <article id="comment" key={i} className="lift text-start rounded-xl border border-sand-200 bg-sand-50 p-4 hover:border-brand-300 dark:border-ink-700 dark:bg-ink-850 dark:hover:border-brand-700">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900 dark:text-white">
        <span className="grid h-7 w-7 place-content-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-400/[.15] dark:text-brand-300"><UserRound size={15} aria-hidden /></span>
        {review.userId && review.userId.userName ? review.userId.userName : "Anonymous"}
      </h2>
      <span className="text-sm">{renderStars(review.rating)}</span>
    </div>
    <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-200">{review.review}</p>
  </article>
))}
                </section>
              </span>
            ) : (
              <p className="py-8 text-center text-sm text-ink-400">no reviews yet — be the first.</p>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
};

export default Slide;
