var expect = require("chai").expect;
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var tagRoutes = require('../routes/tags').routes;
var helpers = require('../routes/tags').helpers;
var dbHelpers  = require('./helpers/dbHelpers');

describe('Tags Router', function(){
    before(function(done){
        dbHelpers.resetRedisDB(done);
    });
    describe('unpopulated db', function(){
        it("should get dmtsui@gmail.com with no tags", function(done){
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/tags/by/email/dmtsui@gamil.com',
                params: {
                    email: "dmtsui@gmail.com"
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.email).to.equal("dmtsui@gmail.com");
                expect(data.tags.length).to.equal(0);
                done(null);
            })
            tagRoutes.tagsByEmail(req, res);

        });
    });
    describe('populated db', function(){
        before(function(done){
            dbHelpers.populateDB(done);
        });
        it("should return 1 tag for dmtsui3@gmail.com", function(done){
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/tags/by/email/dmtsui3@gamil.com',
                params: {
                    email: "dmtsui3@gmail.com"
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.email).to.equal("dmtsui3@gmail.com");
                expect(data.tags.length).to.equal(1);
                done(null);
            })
            tagRoutes.tagsByEmail(req, res);

        });
        it("should return 2 tag for dmtsui2@gmail.com", function(done){
            var req  = httpMocks.createRequest({
                method: 'GET',
                url: '/tags/by/email/dmtsui2@gamil.com',
                params: {
                    email: "dmtsui2@gmail.com"
                }
            });

            var res = httpMocks.createResponse();
            var returnJSON = sinon.stub(res, 'json', function(data){
                expect(data.email).to.equal("dmtsui2@gmail.com");
                expect(data.tags.length).to.equal(2);
                done(null);
            })
            tagRoutes.tagsByEmail(req, res);

        });
    });
});




