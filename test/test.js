/**
 *
 * Created by saintmac on 10/16/13.
 */

var unique_kue = require('../'),
    kue = require('kue'),
    redis = require('redis'),
    should = require('chai').should();

var Job = kue.Job;

describe('unique-kue', function () {
    before(function (done) {
        this.jobs = kue.createQueue();
        unique_kue.setup(kue);
        done();
    });

    describe('with several jobs that have the same id', function () {
        before(function (done) {
            this.unique_key = 'email-summary-123457';

            this.jobs.create_unique_delayed('email_summary', this.unique_key, 7000, {title: 'dashboard1'});
            this.jobs.create_unique_delayed('email_summary', this.unique_key, 7000, {title: 'dashboard2'});
            this.jobs.create_unique_delayed('email_summary', this.unique_key, 7000, {title: 'dashboard3'});

            var self = this;
            setTimeout(function () {
                self.jobs.create_unique_delayed('email_summary', self.unique_key, 6000, {title: 'dashboard4'});
                self.jobs.create_unique_delayed('email_summary', self.unique_key, 6000, {title: 'dashboard5'});
                done()
            }, 2000);
        });

        it('should execute only the last job', function (done) {
            this.jobs.process('email_summary', function (job, processing_done) {
                should.exist(job);
                should.exist(job.data);
                should.exist(job.data.title);
                job.data.title.should.eql('dashboard5');
                processing_done();
                done()
            });
        });

        it('should delete the unique_key from redis', function (done) {
            var client = redis.createClient();
            client.get('uq:'+this.unique_key, function (err, key) {
                if (err) done(err);
                else {
                    should.not.exist(key);
                    done();
                }
            });
        });

    });

    describe('with 2 jobs that have distinct ids', function () {
        before(function (done) {
            this.jobs.create_unique_delayed('notification', 'notification-123457', 3000, {title: 'dashboard6'});
            this.jobs.create_unique_delayed('notification', 'notification-849309', 3000, {title: 'dashboard7'});
            done()
        });

        it('should execute both jobs', function (done) {
            var count_jobs = (function () {
                var counter = 0;

                return function () {
                    counter++;
                    if (counter === 2) {
                        done();
                    }
                }
            })();

            this.jobs.process('notification', function (job, processing_done) {
                should.exist(job);
                count_jobs();
                processing_done();
            });
        });

    });

    describe('deleting a job by unique_key', function () {
        before(function (done) {
            self = this;
            key = 'notification-666';
            self.unique_key = 'uq:'+key;
            self.jobs.create_unique_delayed('notification', key, 5000, {title: 'I want to be deleted'});
            setTimeout(function() {
                self.jobs.client.get(self.unique_key, function (err, job_id) {
                    if(err) return done(err);
                    self.job_id = job_id;
                    self.jobs.delete_unique(key);
                    setTimeout(done, 2000);
                });
            }, 2000);
        });

        it('should delete the job', function(done) {
            Job.get(self.job_id, function(err, job) {
                should.exist(err);
                should.not.exist(job);
                done();
            });
        });

        it('should delete the unique_key from redis', function(done) {
            self.jobs.client.get(self.unique_key, function (err, value) {
                if(err) return done(err);
                should.not.exist(value);
                done();
            });
        });
    });
});



