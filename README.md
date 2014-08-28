# unique-kue
you want your delayed jobs to run only once even if they are triggered several time during a fixed delay? Then you need unique-kue.

unique-kue is a kue plugin that adds a new method to kue: `jobs.create_unique_delayed(type, key, delay, options)`

## install

    npm install unique-kue

## setup

```javascript
kue = require('kue');
unique_kue = require('unique-kue');
unique_kue.setup(kue);
```

## use
### create a unique job

```javascript
jobs = kue.createQueue();
jobs.create_unique_delayed('email_summary', 'email-summary-project-123456', 60000, {
    title: 'project dashboard'
  , to: 'martin@saintmac.me'
  , template: 'this week progress...'
});
//the job will be saved automatically

setTimeout(function() {
    jobs.create_unique_delayed('email_summary', 'email-summary-project-123456', 60000, {
        title: 'project dashboard'
      , to: 'martin@saintmac.me'
      , template: 'this week progress...'
    });
}, 40000); //creating the same job, 40s later (with a 60s) delay
//only the second job will be run
```

### delete a unique job
If you don't want a delayed job to run, you can delete it using the same key you used to create it:

```javascript
jobs.delete_unique('email-summary-project-123456');

```
