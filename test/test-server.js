const chai = require('chai');
const chaiHttp =require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


describe('Blog Posts', function() {
	before(function() {
		return runServer();
	})

	after(function() {
		return closeServer();
	});

	it('should list blog posts on GET', function() {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);

			const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
			res.body.forEach(function(post) {
				post.should.be.a('object');
				post.should.include.keys(expectedKeys);
			});
		});
	});

	it('should add a blog post on POST', function() {
		const newPost = {title: 'my new post', content: 'my deep thoughts', author: 'jack handey'};
		return chai.request(app)
		.post('/blog-posts')
		.send(newPost)
		.then(function(res) {
			res.should.have.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
			res.body.id.should.not.be.null;
			res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}, {publishDate: res.body.publishDate}));
		});
	});

	it ('should update posts on PUT', function() {
		const updateData = {
			title: 'my new title',
			content: 'deeper thoughts',
			author: 'jackie handey',
			publishDate: '5-20-2017'
		};

		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				updateData.id = res.body[0].id;
				return chai.request(app)
					.put(`/blog-posts/${updateData.id}`)
					.send(updateData);
			})	
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.deep.equal(updateData);
			});
	});

	it('should delete items on DELETE', function() {
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				return chai.request(app)
					.delete(`/blog-posts/${res.body[0].id}`);
			})
			.then(function(res) {
				res.should.have.status(204);
			});
	});
});