# unique-kue
you want your delayed jobs to run only once even if they are triggered several time? Then you need unique-kue.

unique-kue is a kue plugin that adds a new method: `jobs.create_unique_delayed(type, key, delay, options)`

## setup

```javascript
kue = require('kue');
unique_kue = require('unique-kue');
unique_kue.setup(kue);
```

## usage

```javascript
jobs = kue.createQueue();
jobs.create_unique_delayed('email_summary', 'email-summary-project-123456', 60000, {
    title: 'project dashboard'
  , to: 'martin@saintmac.me'
  , template: 'this week progress...'
});
//the job will be saved automatically
```
