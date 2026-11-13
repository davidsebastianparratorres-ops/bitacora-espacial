import { useState, useEffect } from "react";
import NoticiaCard from "./components/NoticiaCard/NoticiaCard";

function App() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [termino, setTermino] = useState("");

  useEffect(() => {
    const controlador = new AbortController();
    const urlBase = import.meta.env.VITE_API_URL;
    const params = new URLSearchParams({ limit: "12" });

    if (termino) {
      params.set("search", termino);
    }

    setCargando(true);
    setError(null);

    fetch(`${urlBase}/articles/?${params.toString()}`, {
      signal: controlador.signal,
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las noticias");
        }
        return respuesta.json();
      })
      .then((datos) => {
        setNoticias(datos.results);
        setCargando(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [termino]);

  function buscar(evento) {
    evento.preventDefault();
    const valor = evento.target.elements.q.value.trim();
    setTermino(valor);
  }

  return (
    <>
      <header className="contenedor cabecera">
        <span>Bitácora Espacial</span>
        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="#blogs">Blogs</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor">
        <h1>Bitácora Espacial: Exploración y Ciencia</h1>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input
            id="busqueda"
            name="q"
            type="search"
            placeholder="Ej.: Mars, Artemis, SpaceX"
          />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="titulo-noticias">
          <h2 id="titulo-noticias">Últimas noticias</h2>

          {cargando && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">{error}</p>}
          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}

          {!cargando && !error && noticias.length > 0 && (
            <div className="grid-noticias">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.title}
                  resumen={noticia.summary}
                  imagen={noticia.image_url}
                  fuente={noticia.news_site}
                  fecha={noticia.published_at}
                  enlace={noticia.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="contenedor cabecera">
        <p>Datos proporcionados por Spaceflight News API</p>
      </footer>
    </>
  );
}

export default App;
