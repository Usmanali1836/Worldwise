// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "./BackButton";
import { useGetUrlPostion } from "../Hooks/UseGetUrlPostion";
import Spinner from "./Spinner";
import Message from "./Message";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../Contexts/CitiesContext";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const { createCity, isLoading } = useCities();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [isCityNotFound, setIsCityNotFound] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [emoji, setEmoji] = useState("");
  const navigate = useNavigate();

  const [lat, lng] = useGetUrlPostion();

  const BASE_URL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`;

  useEffect(
    function () {
      if ((!lat, !lng)) return;
      async function getCityInfo() {
        try {
          setIsUrlLoading(true);
          setIsCityNotFound(false);
          setIsOffline(false);

          const res = await fetch(BASE_URL);
          const data = await res.json();
          if (!data.countryCode)
            throw new Error("Could  not find the city. Click somewhere else");
          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          // setCountryCode(data.countryCode);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          if (
            err.message === "Could  not find the city. Click somewhere else"
          ) {
            setIsCityNotFound(err.message);
          } else if (err.message === "Failed to fetch") {
            setIsOffline(err.message);
          }
          //   setIsCityNotFound(true);
          // } else if (err.message === "Failed to fetch") {
          //   setIsOffline(true);
          // }
          console.log("error", err.message);
          console.log(typeof err.message);
        } finally {
          setIsUrlLoading(false);
        }
      }
      getCityInfo();
    },
    [BASE_URL, lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate("/app/cities");
  }
  if (isUrlLoading) return <Spinner />;
  if ((!lat, !lng))
    return <Message message="Start by clicking somewhere on the map" />;
  if (isCityNotFound) return <Message message={isCityNotFound} />;
  if (isOffline) return <Message message={isOffline} />;

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ""}`}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary" onClick={handleSubmit}>
          Add
        </Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
