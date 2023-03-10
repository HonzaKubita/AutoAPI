const fs = require('fs');

let endpoints = [];
let express = null;
let config = {};

function mapDir(path) {
  const contents = fs.readdirSync(path);
  const endpointFiles = contents.filter(file => file.endsWith('.js'));
  const dirs = contents.filter(file => fs.statSync(`${path}/${file}`).isDirectory());

  endpointFiles.forEach(file => { // Map all endpoint files
    const script = require(`${path}/${file}`);
    const fileName = file.replace(".js", "");

    let endpointObject = {
      script: script,           // Object from the file
      url: (`${path.replace(".", "")}/${fileName}`), // Url in the api
      path: (`${path}/${file}`),    // Path to the source file
      methods: [],                  // Supported http methods
    }

    const httpMethods = ['get', 'head', 'post', 'put', 'delete', 'options', 'trace', 'patch'];

    httpMethods.forEach(method => { // Map all supported http methods
      if (method in endpointObject.script) {
        if (typeof endpointObject.script[method] === 'function') {
          endpointObject.methods.push(method);
        }
      }
    });

    endpoints.push(endpointObject); // Add endpoint to main endpoints array

  });

  dirs.forEach(dir => {
    mapDir(`${path}/${dir}`);
  })

}

function registerEndpoints() {
  endpoints.forEach(endpoint => {
    endpoint.methods.forEach(method => {
      express[method](endpoint.url, endpoint.script[method]);
    });
  });
}

module.exports = AutoAPI = (expressApp, conf = {}) => {

  express = expressApp;
  config.src = conf.src?? "./api";

  mapDir(config.src);
  registerEndpoints();

}