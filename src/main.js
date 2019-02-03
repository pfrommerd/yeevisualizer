import { LitElement, html } from '@polymer/lit-element';
import {State, Entity, Data, Job, Experiences, Education} from './model.js'
import './info-panel.js'
import './network.js'

var properties = {
    title: 'Yeet Visualizer'
};

var entities = [
    new Entity(0, 'Shady Inc.', 'Stamford, CT', [new Job('foo', 'bar')], [], {size: 20, color: 'red'}),
    new Entity(1, 'Foo Bar', 'NYC', [new Job('Shmuck','Guardbot'),
                                     new Education('UPenn'),
                                     new Experiences([
                                         {id: 0, company: 'Shady Inc.', duration: 'forever' },
                                         {id: 2, company: 'Super-Shady Inc.', duration: 'forever' }
                                     ])], [0], {size: 10, color: 'black'})
];

export var state = new State();

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getJSON('/data.json', function(err, resp) {
    if (err !== null) {
    } else {
        state.parseJSON(resp);
    }
});

class App extends LitElement {
  constructor() {
    super();
  }
  firstUpdate(prop) {
    var body = document.body;
    body.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        body.classList.remove('dropping');

        var f = e.dataTransfer.files[0];
        if (!f.type.match('application/json')) {
            alert('must be JSON file');
        }
        var reader = new FileReader();
        reader.onloadend = function(e) {
            var result = JSON.parse(this.result);
            state.parseJSON(result);
        };
    }, false);
  }

  render () {
    return html`
        <style>
            bubble-network {
                position: absolute;
                left: 0px;
                top: 0px;
                width: 100vw;
                height: 100vh;
                z-index: 10;
            }
            info-panel {
                position: absolute;
                right: 0px;
                top: 0px;
                text-align: right;
                float: right;
                z-index: 20;
                height: 100vh;
                overflow: scroll;
            }
        </style>
        <info-panel></info-panel>
        <bubble-network></bubble-network>
      `;
  }
}

// Register the element with the browser.
customElements.define('yeet-app', App);
