var expect = require("chai").expect;
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var emailRoutes = require('../routes/emails').routes;
var helpers = require('../routes/tags').helpers;
var dbHelpers  = require('./helpers/dbHelpers');

describe('Email Router', function(){
    before(function(done){
        dbHelpers.resetRedisDB(done);
    });
    describe('unpopulated db', function(){
        it("should create dmtsui@gmail.com with tags", function(done){
            var email = "dmtsui@gmail.com";
            var req  = httpMocks.createRequest({
                method: 'POST',
                url: '/emails/new',
                body: {
                    email: email,
                    tags: ["foo", "bar"]
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.dataValues.email).to.equal(email);
                data.getTags().then(function(tags){
                    expect(tags.length).to.equal(2);
                    done(null);
                });
            });
            emailRoutes.emailNew(req, res);
        });
        it("should not create dmtsui@gmail.com twice", function(done){
            var email = "dmtsui@gmail.com";
            var req  = httpMocks.createRequest({
                method: 'POST',
                url: '/emails/new',
                body: {
                    email: email,
                    tags: ["foo", "bar"]
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.error).to.exist;
                done();
            });
            emailRoutes.emailNew(req, res);
        });
    });
    describe('populated db', function(){
        before(function(done){
            dbHelpers.resetRedisDB(function(){
                dbHelpers.populateDB(done);
            });

        });
        it("should return emails by multiple tag", function(done){
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/emails/by/tags',
                query: {
                    tags: ["foo", "bar"]
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.emails.length).to.equal(3);
                done(null);
            });
            emailRoutes.emailsByTags(req, res);

        });
        it("should return emails by a tag", function(done){
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/emails/by/tags',
                query: {
                    tags: ["foo"]
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.emails.length).to.equal(2);
                done(null);
            });
            emailRoutes.emailsByTags(req, res);

        });
    });
    describe('populated db', function(){
        before(function(done){
            dbHelpers.populateDB(done);
        });
        it("should update email with new tags", function(done){
            var email = "dmtsui3@gmail.com";
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/emails/lookup/'+email,
                params: {
                    email: email
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.dataValues.id).to.exist();
                var req2 = httpMocks.createRequest({
                    method: 'PUT',
                    url: '/emails/'+ data.dataValues.id,
                    params: {id: data.dataValues.id},
                    body: {
                        tags: ['boo', 'blah', 'gasp', 'eep']
                    }
                });
                var res2 = httpMocks.createResponse();
                sinon.stub(res2, 'json', function(data){
                   expect(data.Tags.length).to.equal(4);
                    done(null);
                });
                emailRoutes.emailUpdate(req2, res2);
            });
            emailRoutes.emailLookup(req, res);

        });

    });
});