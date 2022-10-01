const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

//initializeDbAndServer

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieObjectToresponseobject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertMoviename = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDirectorObjectToresponseobject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select movie_name from movie;`;
  const moviesList = await database.all(getMoviesQuery);
  response.send(moviesList.map((eachMovie) => convertMoviename(eachMovie)));
});

//API3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id=${movieId};`;
  const movieDetails = await database.get(getMovieQuery);
  response.send(convertMovieObjectToresponseobject(movieDetails));
});

//API2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieEntity = `insert into movie
  (director_id,movie_name,lead_actor) 
    values(${directorId},'${movieName}','${leadActor}');`;
  const movie = await database.run(createMovieEntity);
  response.send("Movie Successfully Added");
});

//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetails = `update movie set 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  where movie_id=${movieId};`;
  const movie = await database.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `delete from movie where movie_id=${movieId};`;
  await database.run(deleteMovieDetails);
  response.send("Movie Removed");
});

//API6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const directorsList = await database.all(getDirectorsQuery);
  response.send(
    directorsList.map((eachDirector) =>
      convertDirectorObjectToresponseobject(eachDirector)
    )
  );
});

//API7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `select movie_name from movie where director_id=${directorId};`;
  const directorMoviesList = await database.all(query);
  response.send(
    directorMoviesList.map((eachMovie) => convertMoviename(eachMovie))
  );
});

module.exports = app;
