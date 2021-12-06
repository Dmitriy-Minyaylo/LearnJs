const personalMovieDB = {
    count: 5,
    movies: {
        a: 22,
        c: 11
    },
    actors: {},
    genres: [],
    privat: false
}

const clone = Object.assign({}, personalMovieDB)

console.log(clone);
