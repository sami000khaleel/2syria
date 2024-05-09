import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../api/api";
import "./Slide.css"; // Import CSS file for styling
import imgs from "../../assets/google-icon.png";
import SyrianFlage from './../../assets/syrianFlage.jpg'
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
    const fetchImages = async () => {
      const imagePromises = place?.photos.map(async (photo) => {
        return await api.getImage(place.place_id, photo.photo_reference);
      });
      const blobs = await Promise.all(imagePromises);
      // const blobs=images.map(image=>new Blob([image],{type:'image/jepg'}))
      let imagesUrl = blobs.map((blob) => URL.createObjectURL(blob));
      imagesUrl = imagesUrl.filter((el) => el);
      setImages([])
      setImages(imagesUrl);
    };
    fetchImages();
  }, [place?._id]);
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
          className="overflow-hidden  w-[280px] sm:w-[400px] top-0 left-0 absolute h-[100vh] bg-black opacity-85 z-20"
        >
          {reviewingFlage ? (
            <dialog
              ref={modalRef}
              className="backdrop:blur-2xl backdrop:bg-slate-400 p-3 z-50 rounded-lg border-4 text-white flex flex-col items-start bg-black border-[#9C6FE4] fixed inset-0 transform"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setReviewingFlage(false);
                }}
                className="text-[#9C6FE4] top-0 right-2 text-lg cursor-pointer absolute"
              >
                &times;
              </button>
              <h1 className="text-[#9C6FE4] text-lg p-1"> review the place</h1>
              <input
                onChange={updateReview}
                value={review.review}
                type="text"
                name="review"
                className="p-1 bg-inherit focus:outline-none border-b-[#9c6fe4] border-b-2"
                id="review"
              />
              <span>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="1"
                  className={`rating-star-button p-1 text-xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="2"
                  className={`rating-star-button p-1 text-xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="3"
                  className={`rating-star-button p-1 text-xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="4"
                  className={`rating-star-button p-1 text-xl  star empty-star`}
                >
                  &#9733;
                </button>
                <button
                  name="rating"
                  onClick={handleChooseStar}
                  id="5"
                  className={`rating-star-button p-1 text-xl  star empty-star`}
                >
                  &#9733;
                </button>
              </span>
              <button
                onClick={handleSubmitReview}
                className="text-[#9C6FE4] p-1 rounded-2xl hover:bg-[#9C6FE4] text-xl hover:text-white"
              >
                submit
              </button>
            </dialog>
          ) : null}
          <button
            className="flex justify-center items-center z-20 absolute top-[0px] right-[10px] rounded-full w-[60px] h-[60px] hover:bg-[#9C6FE4] text-white text-[50px]"
            onClick={() => setSlideFlage(false)}
          >
            &#10005;
          </button>
          <div className=" h-[250px] w-full  relative ">
            {/* <img
              style={{ userSelect: "none" }}
              className="user-select-none object-cover h-[200px] w-full"
              src={place && images.length ? images[imageIndex] : SyrianFlage}
              alt={place ? place.name : "place"}
            />{" "}
            {images.length?<Arrows scrollLeft={scrollImgLeft} scrollRight={scrollImgRight} />:null} */}
            <ImagesSlider key={place._id} imagesUrls={images.length?images:[SyrianFlage]} />
          </div>
          <div className="relative p-2">
            <span className="absolute top-[30px] right-[30px] scale-50">
              <Arrows
                scrollLeft={scrollPlaceLeft}
                scrollRight={scrollPlaceRight}
              />
              <h4 className=" text-white text-[50px] absolute -top-4 left-[50%] -translate-x-[50%] opacity-30 ">{`${placeIndex}/${placesNum}`}</h4>
            </span>

            <h1
              className={` text-[#9C6FE4] ${
                place.name.length > 28 ? "text-[30px]" : "text-4xl"
              } text font-bold`}
            >
              {place.name}
            </h1>
            <div className="text-[30px]" id="rating">
              {renderStars(place.avgRating)}
            </div>

            <button
              className="fixed  bg-[#9C6FE4] text-white rounded-full p-2 text-lg left-0 top-0 "
              onClick={(e) => {
                e.preventDefault();
                setReviewingFlage((pre) => !pre);
              }}
            >
              add review
            </button>
            {reviews.length ? (
              <span className="flex flex-col fixed bottom-0 h-[50%] w-[270px] sm:w-[400px]">
                <h1
                  className={`text-white text-[30px] mt-7 sm:text-[50px]  pt-5 border-b-2 border-b-[#9C6FE4] mx-2 text-center`}
                >
                  Reviews{" "}
                </h1>

                <section
                  ref={commentsRef}
                  id="comments"
                  className={`  h-[full] overflow-y-scroll  sm:w-[390px]  bg-black text-white`}
                >
                 {reviews.map((review, i) => (
  <article id="comment" key={i} className="text-start w-[80%] mx-auto">
    <h2 className="text-[#9C6FE4] text-xl">
      {review.userId && review.userId.userName ? review.userId.userName : "Anonymous"}
    </h2>
    <p>{review.review}</p>
    <span>{renderStars(review.rating)}</span>
    <hr className="h-px mt-4 bg-[#9C6FE4] border-0" />
  </article>
))}
                </section>
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
};

export default Slide;
