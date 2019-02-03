import { LitElement, html } from '@polymer/lit-element';
import { state } from './main.js'

class Network extends LitElement {
    constructor() {
        super();
        this.entityMap = {};
    }

    firstUpdated(prop) {
        var map = this.entityMap;
        // Attach node network
        var nodes = new vis.DataSet();
        var edges = new vis.DataSet();

        var snodes = [];
        var sedges = [];

        for (let e of state.entities) {
            map[e.id] = e;
            nodes.add([e.createNode()]);
            edges.add(e.createEdges());
        }
        // Add listener
        state.onEntitiesAdded(function(entities) {
            var ns = [];
            var es = [];
            for (let e of entities) {
                map[e.id] = e;
                ns.push(e.createNode());
                es.push(...e.createEdges());
            }
            nodes.add(ns);
            edges.add(es);
        });
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            interaction: {
                dragNodes:true,
                dragView: true,
                hideEdgesOnDrag: false,
                hideNodesOnDrag: false,
                hover: true,
                hoverConnectedEdges: true,
                keyboard: {
                  enabled: true,
                  speed: {x: 15, y: 15, zoom: 0.02},
                  bindToWindow: true
                },
                multiselect: true,
                navigationButtons: false,
                selectable: true,
                selectConnectedEdges: false,
                tooltipDelay: 300,
                zoomView: true
            },
            autoResize: true
        };

        // initialize your network!
        var container = this.shadowRoot.getElementById('network');
        var network = new vis.Network(container, data, options);
        network.on('select', function(params) {
            var selected = [];
            nodes.remove(snodes);
            edges.remove(sedges);
            snodes = [];
            sedges = [];
            for (let id of network.getSelectedNodes()) {
                var entity = map[id];
                selected.push(entity);
                if (entity.history.length > 0) {
                    var prevID = entity.id;
                    for (let id of entity.history) {
                        let nid = 100000 + Math.floor(Math.random() * 10000);
                        snodes.push({id: nid, shape: 'dot', size: 16, color:'#888888', label: ''});
                        sedges.push({from: prevID, to: nid});
                        sedges.push({from: nid, to: id});
                        prevID = nid;
                    }
                }
            }
            nodes.add(snodes);
            edges.add(sedges);
            state.select(selected);
            // Show history
        });
    }

    render () {
        return html`
            <style>
                #network {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <div id="network"></div>
        `;
    }
}

customElements.define('bubble-network', Network);

