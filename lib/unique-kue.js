/**
 *
 * Created by saintmac on 10/15/13.
 */

exports.setup = function (kue) {
    var Job = kue.Job
      , jobs = kue.singleton;



    // Setting up the new create_unique_delayed method
    kue.prototype.create_unique_delayed = function (type, key, delay, options) {
        var unique_key = 'uq:'+key
        var job = jobs.create(type, options);
        job.delay(delay).save(function (err) {
            if (err) throw err;
            jobs.client.getset(unique_key, job.id, function (err, old_job_id) {
                if (err) throw err;
                if (old_job_id) {
                    // we already had a job for this unique_key, let's delete the old one
                    Job.get(old_job_id, function (err, job) {
                        if (err) throw err;
                        if (job) {
                            job.remove();
                        }
                    });
                }
            });
        });
    };

    // Making sure that the job are checked for promotion every second
    jobs.promote(1000);
};
