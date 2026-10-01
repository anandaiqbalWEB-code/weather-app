


import { useEffect, useState } from "react";
import "./App.css"

const weatherCode = {
  0: "☀️ Cerah",
  1: "🌤️ Sebagian cerah",
  2: "⛅ Berawan sebagian",
  3: "☁️ Mendung",
  45: "🌫️ Berkabut",
  48: "🌫️ Kabut tebal",
  51: "🌦️ Gerimis ringan",
  53: "🌦️ Gerimis",
  55: "🌧️ Gerimis lebat",
  61: "🌧️ Hujan ringan",
  63: "🌧️ Hujan",
  65: "🌧️ Hujan lebat",
  80: "🌦️ Hujan singkat",
  81: "🌧️ Hujan",
  82: "⛈️ Hujan sangat lebat",
  95: "⛈️ Badai petir",
  96: "⛈️ Badai petir + hujan es",
  99: "⛈️ Badai petir + hujan es",
};

function App() {

  const [inputKota, setInputKota] = useState("")
  const [cuaca, setCuaca] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function cariCuaca(namaKota) {

    if (!namaKota.trim()) return;

    try {

      setLoading(true)
      setError("")

      const lokasiResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        namaKota
      )}&count=1&language=id&format=json`
      );

      if (!lokasiResponse.ok) {
        throw new Error("gagal mencari lokasi")
      }

      const lokasiData = await lokasiResponse.json();

      if (!lokasiData.results || lokasiData.results.length === 0) {
        throw new Error("kota tidak ditemukan")
      }

      const lokasi = lokasiData.results[0];

      const cuacaResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!cuacaResponse.ok) {
        throw new Error("data cuaca tidak ditemukan")
      }

      const cuacaData = await cuacaResponse.json();

      setCuaca({
        nama: lokasi.name,
        negara: lokasi.country,
        suhu: cuacaData.current.temperature_2m,
        kelembapan: cuacaData.current.relative_humidity_2m,
        angin: cuacaData.current.wind_speed_10m,
        kode: cuacaData.current.weather_code,
        waktu: cuacaData.current.time,
      });
    } catch (error) {
      setError(error.message)
      setCuaca(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cariCuaca("Jakarta")
  }, [])

  function handleSubmit(e) {

    e.preventDefault();

    cariCuaca(inputKota)

  }

  return (
    <main className="app">

      <section className="weather-container">

        <h1>Aplikasi Cuaca</h1>

        <form onSubmit={handleSubmit}>

          <input type="text"
            value={inputKota}
            onChange={(e) => setInputKota(e.target.value)} />

          <button type="submit">cari</button>
        </form>

        {loading && <h2>loading...</h2>}

        {error && <h2>{error}</h2>}

        {cuaca && !loading && (

          <div className="weather-card">

            <div className="lokasi-cuaca">

              <h2>{cuaca.nama}</h2>

              <p>{cuaca.negara}</p>

            </div>

            <div className="weather-icon">
              {weatherCode[cuaca.kode]?.split(" ")[0] || "🌤️"}
            </div>

            <div className="temperature">
              {Math.round(cuaca.suhu)}°C
            </div>

            <p className="condition">
              {weatherCode[cuaca.kode] || "Kondisi tidak diketahui"}
            </p>

            <hr />

            <div className="weather-info">

              <div>

                <span>💧</span>

                <p>Kelembapan</p>

                <strong>{cuaca.kelembapan}%</strong>

              </div>

              <div>

                <span>💨</span>

                <p>Angin</p>

                <strong>{cuaca.angin} km/j</strong>
              </div>

            </div>

            <p>Date: {cuaca.waktu.replace("T", " ")}</p>

          </div>

        )}

      </section>
    </main>
  )
}



export default App;