var expect  = require('chai').expect;
var app     = require('../app');
var request = require('supertest')(app);

describe('GET /suggestions', function() {
  describe('with a non-existent city', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=SomeRandomCityInTheMiddleOfNowhere')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 404', function () {
      expect(response.statusCode).to.equal(404);
    });

    it('returns an empty array of suggestions', function () {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(0);
    });
  });

  describe('with a valid city', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=Montreal')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array of suggestions', function () {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length.above(0);
    });

    it('contains a match', function () {
      expect(response.json.suggestions).to.satisfy(function (suggestions) {
        return suggestions.some(function (suggestion) {
          return (/montreal/i).test(suggestion.name);
        });
      })
    });

    it('contains latitudes and longitudes', function () {
      expect(response.json.suggestions).to.satisfy(function (suggestions) {
        return suggestions.every(function (suggestion) {
          return suggestion.latitude && suggestion.longitude;
        });
      })
    });

    it('contains scores', function () {
      expect(response.json.suggestions).to.satisfy(function (suggestions) {
        return suggestions.every(function (suggestion) {
          return suggestion.score;
        });
      })
    });
  });

  describe('with a valid city and geo coordinate', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=Mont&latitude=45.50884&longitude=-73.58781')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array of suggestions', function () {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length.above(0);
    });

    it('contains a match', function () {
      expect(response.json.suggestions).to.satisfy(function (suggestions) {
        return suggestions.some(function (suggestion) {
          return suggestion.name.match(/mont-royal/i);
        });
      })
    });
  });

  describe('valid city with non-ASCII characters (Québec)', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=Québec')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array with 1 suggestion', function () {
      expect(response.json.suggestions).to.be instanceof(Array);
      expect(response.json.suggestions).to.have.length(1);
    });
  });

  describe('without a query parameter', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 400', function () {
      expect(response.statusCode).to.equal(400);
    });

    it('returns an error message', function () {
      expect(response.json.errors).to.not.be.undefined;
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(0);
    });
  });

  describe('with an invalid geo parameter', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=Mont&latitude=toto&longitude=-73.58781')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 400', function () {
      expect(response.statusCode).to.equal(400);
    });

    it('returns an error message', function () {
      expect(response.json.errors).to.not.be.undefined;
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(0);
    });
  });

  describe('with a limit parameter', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=va&limit=5')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array of size 5', function () {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(5);
    });
  });

  describe('with an invalid limit parameter', function () {
    var response;

    before(function (done) {
      request
        .get('/suggestions?q=mon&limit=toto')
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it('returns a 400', function () {
      expect(response.statusCode).to.equal(400);
    });

    it('returns an error message', function () {
      expect(response.json.errors).to.not.be.undefined;
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(0);
    });
  });


});
