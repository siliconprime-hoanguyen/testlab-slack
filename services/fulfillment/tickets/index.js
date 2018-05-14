const request = require('request');
module.exports = {
  list(options) {
    const newOptions = {
      method: 'get',
      baseUrl: `https://app.asana.com/api/1.0`,
      uri: `/projects/${options.projectId}/tasks`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer 0/8db1c3fc0a5b0c03431b394436f41faf`,
      },
      json: true
    };
    return new Promise((resolve, reject) => {
      request(newOptions, (err, res, body) => {
        if (err || res.statusCode >= 400) {
          return reject({ message: 'error getting project list'});
        }
        const projects = body.data.map(d => `${d.id} - ${d.name}`);
        return resolve(projects);
      })
    });
  }
}